/*
  # Reservation snapshots for parent booking flow

  予約作成時点の保護者・子ども・施設の表示用情報を reservations に保持します。
  施設側一覧や保護者側確認画面で join を減らし、現行 UI と合わせるための追加です。
*/

ALTER TABLE reservations
  ADD COLUMN IF NOT EXISTS facility_name TEXT,
  ADD COLUMN IF NOT EXISTS parent_name TEXT,
  ADD COLUMN IF NOT EXISTS parent_phone TEXT,
  ADD COLUMN IF NOT EXISTS parent_email TEXT,
  ADD COLUMN IF NOT EXISTS child_name TEXT,
  ADD COLUMN IF NOT EXISTS child_birth_date DATE,
  ADD COLUMN IF NOT EXISTS allergies TEXT[],
  ADD COLUMN IF NOT EXISTS medical_notes TEXT,
  ADD COLUMN IF NOT EXISTS special_requests TEXT;

CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_facility_id ON reservations(facility_id);
