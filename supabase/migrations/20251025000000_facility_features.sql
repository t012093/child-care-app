/*
  # 施設向け機能の追加

  このマイグレーションは既存のテーブルを拡張し、施設管理に必要な新機能を追加します。

  ## 変更内容

  ### 1. 既存テーブルの拡張
  - `facilities`: 施設オーナー、ステータス、拡張フィールド追加
  - `children`: 緊急連絡先、保険情報追加
  - `reservations`: 確認情報、チェックイン/アウト、キャンセル情報追加

  ### 2. 新規テーブル
  - `facility_staff`: 施設スタッフ管理
  - `facility_availability`: 空き枠管理
  - `messages`: 保護者-施設間メッセージング
  - `facility_reviews`: 施設レビュー
  - `notifications`: 通知管理

  ### 3. セキュリティ
  - 施設側のRLSポリシー追加
  - 権限ベースのアクセス制御

  ### 4. パフォーマンス
  - 追加インデックス
  - 自動更新トリガー
*/

-- ============================================================================
-- 1. 既存テーブルの拡張
-- ============================================================================

-- facilities テーブルの拡張
ALTER TABLE facilities
  ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending_approval')),
  ADD COLUMN IF NOT EXISTS postal_code TEXT,
  ADD COLUMN IF NOT EXISTS district TEXT CHECK (district IN ('central', 'north', 'east', 'white-stone', 'atsubetsu', 'toyohira', 'kiyota', 'south', 'west', 'teine')),
  ADD COLUMN IF NOT EXISTS opening_hours JSONB,
  ADD COLUMN IF NOT EXISTS capacity INTEGER CHECK (capacity >= 0),
  ADD COLUMN IF NOT EXISTS age_range TEXT,
  ADD COLUMN IF NOT EXISTS has_lunch BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS provider TEXT,
  ADD COLUMN IF NOT EXISTS pdf_template_url TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- type列のCHECK制約を更新（新しいタイプを追加）
ALTER TABLE facilities DROP CONSTRAINT IF EXISTS facilities_type_check;
ALTER TABLE facilities ADD CONSTRAINT facilities_type_check
  CHECK (type IN ('nursery', 'sick-child', 'clinic', 'temporary-care', 'licensed'));

-- インデックス追加
CREATE INDEX IF NOT EXISTS idx_facilities_owner ON facilities(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_facilities_status ON facilities(status);
CREATE INDEX IF NOT EXISTS idx_facilities_district ON facilities(district);

-- children テーブルの拡張
ALTER TABLE children
  ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  ADD COLUMN IF NOT EXISTS photo_url TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact JSONB,
  ADD COLUMN IF NOT EXISTS insurance_info JSONB,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_children_birthday ON children(birthday);

-- reservations テーブルの拡張
ALTER TABLE reservations
  ADD COLUMN IF NOT EXISTS reservation_type TEXT CHECK (reservation_type IN ('一時預かり', '見学', '相談')),
  ADD COLUMN IF NOT EXISTS confirmed_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancelled_by UUID,
  ADD COLUMN IF NOT EXISTS cancelled_by_type TEXT CHECK (cancelled_by_type IN ('parent', 'facility')),
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
  ADD COLUMN IF NOT EXISTS check_in_time TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS check_in_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS check_out_time TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS check_out_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- status列のCHECK制約を更新
ALTER TABLE reservations DROP CONSTRAINT IF EXISTS reservations_status_check;
ALTER TABLE reservations ADD CONSTRAINT reservations_status_check
  CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed'));

-- 制約追加
ALTER TABLE reservations ADD CONSTRAINT IF NOT EXISTS valid_time_range
  CHECK (end_time > start_time);
ALTER TABLE reservations ADD CONSTRAINT IF NOT EXISTS valid_check_times
  CHECK (check_out_time IS NULL OR check_out_time >= check_in_time);

CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_start_time ON reservations(start_time);

-- ============================================================================
-- 2. 新規テーブルの作成
-- ============================================================================

-- facility_staff テーブル（施設スタッフ管理）
CREATE TABLE IF NOT EXISTS facility_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'staff')),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  photo_url TEXT,

  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'invited')),
  invited_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(facility_id, user_id)
);

CREATE INDEX idx_facility_staff_facility ON facility_staff(facility_id);
CREATE INDEX idx_facility_staff_user ON facility_staff(user_id);
CREATE INDEX idx_facility_staff_role ON facility_staff(role);

-- facility_availability テーブル（空き枠管理）
CREATE TABLE IF NOT EXISTS facility_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,

  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,

  max_capacity INTEGER NOT NULL CHECK (max_capacity >= 0),
  current_reservations INTEGER DEFAULT 0 CHECK (current_reservations >= 0),

  is_available BOOLEAN DEFAULT true,
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(facility_id, date, start_time),
  CONSTRAINT valid_capacity CHECK (current_reservations <= max_capacity)
);

CREATE INDEX idx_availability_facility ON facility_availability(facility_id);
CREATE INDEX idx_availability_date ON facility_availability(date);

-- messages テーブル（メッセージング）
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('parent', 'facility')),
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,

  subject TEXT,
  body TEXT NOT NULL,
  attachments TEXT[],

  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,

  thread_id UUID REFERENCES messages(id),

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_id);
CREATE INDEX idx_messages_facility ON messages(facility_id);
CREATE INDEX idx_messages_thread ON messages(thread_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- facility_reviews テーブル（レビュー）
CREATE TABLE IF NOT EXISTS facility_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reservation_id UUID REFERENCES reservations(id) ON DELETE SET NULL,

  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,

  facility_response TEXT,
  responded_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(facility_id, user_id, reservation_id)
);

CREATE INDEX idx_reviews_facility ON facility_reviews(facility_id);
CREATE INDEX idx_reviews_user ON facility_reviews(user_id);
CREATE INDEX idx_reviews_rating ON facility_reviews(rating);

-- notifications テーブル（通知）
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  type TEXT NOT NULL CHECK (type IN (
    'reservation_created',
    'reservation_confirmed',
    'reservation_cancelled',
    'message_received',
    'review_posted',
    'system_alert'
  )),

  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB,

  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- ============================================================================
-- 3. トリガー関数の作成
-- ============================================================================

-- updated_at自動更新関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 各テーブルにupdated_atトリガーを追加
DROP TRIGGER IF EXISTS update_facilities_updated_at ON facilities;
CREATE TRIGGER update_facilities_updated_at
  BEFORE UPDATE ON facilities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_children_updated_at ON children;
CREATE TRIGGER update_children_updated_at
  BEFORE UPDATE ON children
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reservations_updated_at ON reservations;
CREATE TRIGGER update_reservations_updated_at
  BEFORE UPDATE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_facility_staff_updated_at ON facility_staff;
CREATE TRIGGER update_facility_staff_updated_at
  BEFORE UPDATE ON facility_staff
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_facility_availability_updated_at ON facility_availability;
CREATE TRIGGER update_facility_availability_updated_at
  BEFORE UPDATE ON facility_availability
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_facility_reviews_updated_at ON facility_reviews;
CREATE TRIGGER update_facility_reviews_updated_at
  BEFORE UPDATE ON facility_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 施設の平均評価を自動更新する関数
CREATE OR REPLACE FUNCTION update_facility_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE facilities
  SET rating = (
    SELECT COALESCE(AVG(rating)::NUMERIC(2,1), 0)
    FROM facility_reviews
    WHERE facility_id = COALESCE(NEW.facility_id, OLD.facility_id)
  )
  WHERE id = COALESCE(NEW.facility_id, OLD.facility_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_facility_rating_trigger ON facility_reviews;
CREATE TRIGGER update_facility_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON facility_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_facility_rating();

-- ============================================================================
-- 4. RLSポリシーの追加
-- ============================================================================

-- 新規テーブルのRLS有効化
ALTER TABLE facility_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE facility_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE facility_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- facilities テーブルの施設側ポリシー追加
CREATE POLICY "Facility owners can update their facilities"
  ON facilities FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_user_id)
  WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Facility owners can delete their facilities"
  ON facilities FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_user_id);

CREATE POLICY "Authenticated users can create facilities"
  ON facilities FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- facility_staff テーブルのポリシー
CREATE POLICY "Staff can view their own record"
  ON facility_staff FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Facility admins can view facility staff"
  ON facility_staff FOR SELECT
  TO authenticated
  USING (
    facility_id IN (
      SELECT facility_id
      FROM facility_staff
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Facility owners can insert staff"
  ON facility_staff FOR INSERT
  TO authenticated
  WITH CHECK (
    facility_id IN (
      SELECT facility_id
      FROM facility_staff
      WHERE user_id = auth.uid()
        AND role = 'owner'
    )
  );

CREATE POLICY "Facility owners can update staff"
  ON facility_staff FOR UPDATE
  TO authenticated
  USING (
    facility_id IN (
      SELECT facility_id
      FROM facility_staff
      WHERE user_id = auth.uid()
        AND role = 'owner'
    )
  );

CREATE POLICY "Facility owners can delete staff"
  ON facility_staff FOR DELETE
  TO authenticated
  USING (
    facility_id IN (
      SELECT facility_id
      FROM facility_staff
      WHERE user_id = auth.uid()
        AND role = 'owner'
    )
  );

-- reservations テーブルの施設側ポリシー追加
CREATE POLICY "Facility staff can view facility reservations"
  ON reservations FOR SELECT
  TO authenticated
  USING (
    facility_id IN (
      SELECT facility_id
      FROM facility_staff
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Facility staff can update facility reservations"
  ON reservations FOR UPDATE
  TO authenticated
  USING (
    facility_id IN (
      SELECT facility_id
      FROM facility_staff
      WHERE user_id = auth.uid()
    )
  );

-- children テーブルの施設側ポリシー追加
CREATE POLICY "Facility staff can view children with reservations"
  ON children FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT child_id
      FROM reservations
      WHERE facility_id IN (
        SELECT facility_id
        FROM facility_staff
        WHERE user_id = auth.uid()
      )
    )
  );

-- messages テーブルのポリシー
CREATE POLICY "Users can view their messages"
  ON messages FOR SELECT
  TO authenticated
  USING (
    auth.uid() = sender_id OR
    auth.uid() = recipient_id
  );

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Recipients can update read status"
  ON messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = recipient_id)
  WITH CHECK (auth.uid() = recipient_id);

-- facility_reviews テーブルのポリシー
CREATE POLICY "Anyone can view reviews"
  ON facility_reviews FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can create reviews for their reservations"
  ON facility_reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON facility_reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Facility owners can respond to reviews"
  ON facility_reviews FOR UPDATE
  TO authenticated
  USING (
    facility_id IN (
      SELECT facility_id
      FROM facility_staff
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );

-- notifications テーブルのポリシー
CREATE POLICY "Users can manage their notifications"
  ON notifications FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- facility_availability テーブルのポリシー
CREATE POLICY "Anyone can view availability"
  ON facility_availability FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Facility staff can manage availability"
  ON facility_availability FOR ALL
  TO authenticated
  USING (
    facility_id IN (
      SELECT facility_id
      FROM facility_staff
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    facility_id IN (
      SELECT facility_id
      FROM facility_staff
      WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- 5. サンプルデータの更新（開発用）
-- ============================================================================

-- 既存の施設データにフィールドを更新
UPDATE facilities
SET
  district = 'central',
  opening_hours = '{"weekday": "08:00-18:00", "saturday": "08:00-18:00"}'::jsonb,
  capacity = 30,
  age_range = '生後5か月から就学前まで',
  has_lunch = true,
  provider = '札幌市'
WHERE name = '札幌こども保育園';

UPDATE facilities
SET
  district = 'north',
  opening_hours = '{"weekday": "08:00-18:00", "saturday": "未実施"}'::jsonb,
  capacity = 10,
  age_range = '生後6か月から就学前まで',
  has_lunch = true,
  provider = '株式会社キッズケア'
WHERE name = 'キッズケア札幌';

UPDATE facilities
SET
  district = 'central',
  opening_hours = '{"weekday": "09:00-17:00", "saturday": "09:00-12:00"}'::jsonb,
  age_range = '新生児から中学生まで',
  has_lunch = false,
  provider = '医療法人札幌こども'
WHERE name = '札幌こどもクリニック';

-- ============================================================================
-- 完了
-- ============================================================================

COMMENT ON TABLE facility_staff IS '施設スタッフ管理テーブル';
COMMENT ON TABLE facility_availability IS '施設の空き枠管理テーブル';
COMMENT ON TABLE messages IS '保護者と施設間のメッセージングテーブル';
COMMENT ON TABLE facility_reviews IS '施設レビューテーブル';
COMMENT ON TABLE notifications IS '通知管理テーブル';
