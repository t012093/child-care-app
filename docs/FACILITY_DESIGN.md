# 施設向け機能 - 包括設計書

**プロジェクト**: 子育て支援アプリ
**対象**: 保育施設管理者・スタッフ向け機能
**作成日**: 2025年10月25日
**バージョン**: 1.0

---

## 目次

1. [現状分析](#1-現状分析)
2. [業界ベストプラクティス](#2-業界ベストプラクティス)
3. [施設側UI設計](#3-施設側ui設計)
4. [バックエンド設計](#4-バックエンド設計)
5. [認証・権限管理](#5-認証権限管理)
6. [実装ロードマップ](#6-実装ロードマップ)
7. [技術仕様](#7-技術仕様)

---

## 1. 現状分析

### 1.1 既存のユーザー側機能

#### 実装済み機能
- ✅ **施設検索・一覧表示**: 札幌市内50施設以上のデータ
- ✅ **施設詳細表示**: 地図、評価、営業時間、定員、対象年齢
- ✅ **予約機能**: 基本的な予約フロー実装
- ✅ **子供プロフィール管理**: 名前、生年月日、アレルギー、医療メモ
- ✅ **申請書PDF自動生成**: 札幌市の保育申請書フォーム対応
- ✅ **認証システム**: Supabase Auth使用

#### データモデル（既存）
```typescript
// lib/supabase.ts
export type Facility = {
  id: string;
  name: string;
  type: 'nursery' | 'sick-child' | 'clinic';
  address: string;
  lat: number;
  lng: number;
  phone?: string;
  email?: string;
  description?: string;
  rating: number;
  images: string[];
  category: string;
  stock: number;
  featured: boolean;
};

export type Child = {
  id: string;
  user_id: string;
  name: string;
  birthday: string;
  allergies?: string[];
  medical_notes?: string;
};

export type Reservation = {
  id: string;
  facility_id: string;
  child_id: string;
  user_id: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes?: string;
};
```

### 1.2 既存の施設側機能（基礎実装）

#### 実装済み画面
1. **施設ログイン画面** (`app/facility-login.tsx`)
   - メール・パスワード認証
   - ゲストログイン（開発用）
   - パスワードリセット
   - 新規施設登録へのリンク

2. **施設ダッシュボード** (`app/(facility-tabs)/dashboard.tsx`)
   - 統計カード表示（本日の予約、今週の予約、空き状況）
   - 本日の予約リスト
   - 通知センター
   - クイックアクションボタン
   - ⚠️ **データはハードコード（サンプル）のみ**

3. **予約管理画面** (`app/(facility-tabs)/reservations.tsx`)
   - フィルタータブ（本日/今週/今月/すべて）
   - 予約リスト表示
   - ⚠️ **データはハードコード（サンプル）のみ**

4. **施設情報設定** (`app/(facility-tabs)/facility-info.tsx`)
   - 基本情報編集フォーム（未実装）

#### コンポーネント
- `components/FacilityStatCard.tsx` - 統計カード
- `components/ReservationListItem.tsx` - 予約リストアイテム
- `components/FacilityFeatureCard.tsx` - 機能カード
- `constants/colors.ts` - 施設側カラーテーマ

### 1.3 課題と改善点

#### データ層の課題
- ❌ Supabaseとの連携がない（全てサンプルデータ）
- ❌ リアルタイム更新がない
- ❌ 施設とユーザーの関連付けがない
- ❌ 権限管理がない

#### 機能の課題
- ❌ 予約の承認・拒否ができない
- ❌ 保護者とのコミュニケーション機能がない
- ❌ 空き枠管理ができない
- ❌ スタッフ管理機能がない
- ❌ レポート・分析機能がない

---

## 2. 業界ベストプラクティス

### 2.1 日本の保育ICTトレンド（2025年版）

#### 政府の動向
- **目標**: 令和8年度（2026年）までにICT導入率100%
- **補助金制度**: ICT補助金で導入費用の一部を国・自治体が負担
- **デジタル庁の施策**:
  - 施設管理プラットフォーム（PF）の構築（R7年度）
  - 補助金申請・監査のデジタル化
  - 保活（保育園探し）のDX化

#### 主要な機能要件（国内標準）
1. **登降園管理**: 園児の登降園管理（打刻・延長保育集計）
2. **保護者連絡**: お便り、連絡帳、写真配信
3. **データ管理**: 園児情報、健康管理（検温・排便記録）
4. **請求管理**: 保育料の自動計算・請求書発行

#### 主要システム（参考）
- コドモン
- ルクミー
- はいチーズ!システム
- キッズダイアリー

### 2.2 海外の先進事例（2025年版）

#### Brightwheel（米国トップシェア）
**主要機能**:
- **統合ダッシュボード**: 全施設の運営状況をリアルタイム可視化
- **自動化された予約管理**: 定期予約と単発予約の柔軟対応
- **保護者コミュニケーション**: 即時通知、デイリーレポート、写真共有
- **スタッフ管理**: シフト作成、勤怠管理、適切な人員配置

#### MyKidReports
**特徴**:
- クラウドベースで複数施設の一元管理
- モバイルファーストUI
- オフライン対応

#### Kangarootime
**強み**:
- マルチロケーション対応（チェーン展開施設向け）
- 高度な分析・レポート機能
- API連携による拡張性

### 2.3 ベストプラクティスまとめ

#### 必須機能
1. **リアルタイムダッシュボード**: 予約状況・空き状況の即時把握
2. **予約管理**: 承認・拒否・変更の柔軟な対応
3. **保護者コミュニケーション**: アプリ内メッセージ、通知
4. **データ管理**: 子供・保護者情報の一元管理
5. **レポート機能**: 利用統計、売上分析

#### 推奨機能
6. スタッフ管理（シフト、勤怠）
7. 空き枠の自動計算
8. レビュー・評価の管理
9. 請求・決済機能
10. 写真共有

---

## 3. 施設側UI設計

### 3.1 ダッシュボード画面（拡張版）

**画面名**: `app/(facility-tabs)/dashboard.tsx`
**役割**: 施設の運営状況を一目で把握

#### 3.1.1 統計カードセクション

```typescript
interface StatCard {
  icon: LucideIcon;
  label: string;
  value: number | string;
  subtext: string;
  color: string;
  trend?: {
    value: number; // 前週比/前月比
    direction: 'up' | 'down';
  };
}
```

**表示内容**:
- **本日の予約**: 件数（確定・保留・キャンセル別）
- **今週の予約**: 件数と前週比
- **空き状況**: ◯/△/× + 残り枠数
- **売上（月次）**: 金額と前月比

**レイアウト**:
```
┌─────────────────────────────────────┐
│  [📅 本日の予約]  [📈 今週の予約]    │
│     12件              18件           │
│   前日比 +2        前週比 +5↑       │
│                                     │
│  [✅ 空き状況]    [💰 月次売上]      │
│      ◯               ¥250,000       │
│   空きあり          前月比 +8%↑     │
└─────────────────────────────────────┘
```

#### 3.1.2 今日のスケジュール

**表示形式**: タイムライン形式の予約一覧

```typescript
interface TodayScheduleItem {
  id: string;
  time: string; // "09:00 - 17:00"
  childName: string;
  childAge: number;
  parentName: string;
  parentPhone: string;
  allergies?: string[];
  status: 'confirmed' | 'pending' | 'checked_in' | 'checked_out';
  notes?: string;
  urgent?: boolean; // アレルギー等の重要情報あり
}
```

**UI要素**:
- 時間帯別のグループ表示
- ステータスバッジ（色分け）
- チェックイン/チェックアウトボタン
- 詳細表示モーダル

#### 3.1.3 通知センター

```typescript
interface Notification {
  id: string;
  type: 'new_reservation' | 'cancellation' | 'message' | 'system';
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}
```

**表示内容**:
- 新規予約通知
- キャンセル通知
- 保護者からのメッセージ
- システムアラート

#### 3.1.4 クイックアクション

**ボタン**:
- 新規予約確認
- 保護者への一斉連絡
- 本日の出席記録
- 緊急連絡送信

---

### 3.2 予約管理画面（拡張版）

**画面名**: `app/(facility-tabs)/reservations.tsx`
**役割**: 予約の閲覧・編集・承認

#### 3.2.1 カレンダービュー（新規）

**表示モード**:
- 月表示（全体の予約状況把握）
- 週表示（詳細な予約管理）
- 日表示（時間帯別の予約）

```typescript
interface CalendarEvent {
  id: string;
  start: Date;
  end: Date;
  title: string; // 子供名
  status: 'pending' | 'confirmed' | 'cancelled';
  color: string;
}
```

**機能**:
- ドラッグ&ドロップで予約時間変更
- セルクリックで新規予約作成
- イベントクリックで詳細モーダル

#### 3.2.2 予約詳細モーダル

```typescript
interface ReservationDetail {
  // 予約情報
  id: string;
  startTime: Date;
  endTime: Date;
  status: 'pending' | 'confirmed' | 'cancelled';
  type: '一時預かり' | '見学' | '相談';

  // 子供情報
  child: {
    id: string;
    name: string;
    age: number;
    birthday: Date;
    allergies: string[];
    medicalNotes?: string;
    photoUrl?: string;
  };

  // 保護者情報
  parent: {
    id: string;
    name: string;
    phone: string;
    email: string;
    emergencyContact?: string;
  };

  // メタ情報
  notes?: string;
  createdAt: Date;
  confirmedBy?: string;
  confirmedAt?: Date;
}
```

**アクション**:
- ステータス変更（保留→確定、キャンセル）
- メモ・特記事項の編集
- 保護者へメッセージ送信
- 予約時間の変更
- チェックイン/チェックアウト

#### 3.2.3 フィルター・検索

**フィルター項目**:
- 日付範囲（本日/今週/今月/カスタム）
- ステータス（全て/確定/保留/キャンセル）
- 予約タイプ（一時預かり/見学/相談）
- 検索（子供名・保護者名）

#### 3.2.4 一括操作

**機能**:
- 複数予約の一括確定
- 予約データのCSVエクスポート
- 期間別の予約統計レポート生成

---

### 3.3 子供・保護者管理画面（新規）

**画面名**: `app/(facility-tabs)/children.tsx`
**役割**: 利用者データベース管理

#### 3.3.1 子供一覧

**表示内容**:
```typescript
interface ChildListItem {
  id: string;
  name: string;
  age: number;
  photoUrl?: string;
  lastVisit?: Date;
  totalVisits: number;
  allergies?: string[];
  hasUrgentNotes: boolean; // 重要な医療情報あり
}
```

**機能**:
- 検索（名前、年齢）
- フィルター（年齢範囲、アレルギーあり/なし）
- ソート（名前順、最終利用日順、利用回数順）

#### 3.3.2 子供詳細

**表示内容**:
- 基本情報（名前、生年月日、性別、写真）
- アレルギー情報（重要度順表示）
- 医療メモ
- 保育履歴（過去の利用記録）
- 保護者情報
- 緊急連絡先

**アクション**:
- 情報編集
- 新規予約作成
- 保護者へメッセージ

---

### 3.4 コミュニケーション画面（新規）

**画面名**: `app/(facility-tabs)/messages.tsx`
**役割**: 保護者とのメッセージング

#### 3.4.1 メッセージ一覧

```typescript
interface MessageThread {
  id: string;
  parentName: string;
  childName: string;
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: number;
  parentPhotoUrl?: string;
}
```

#### 3.4.2 メッセージ詳細・送信

**機能**:
- 個別メッセージ送信
- 一斉送信（全保護者/フィルター別）
- テンプレート機能
  - 欠席確認
  - 予約リマインダー
  - お知らせ
- ファイル添付
- 既読確認

#### 3.4.3 お知らせ掲示板

**機能**:
- 施設からのお知らせ投稿
- 写真・PDFファイル添付
- 公開範囲設定（全員/特定の保護者）
- 予約投稿（指定日時に自動公開）

---

### 3.5 施設情報管理画面（拡張）

**画面名**: `app/(facility-tabs)/facility-info.tsx`
**役割**: 施設プロフィール編集

#### 3.5.1 基本情報編集

**編集項目**:
- 施設名
- 住所（郵便番号、都道府県、市区町村、番地）
- 電話番号
- メールアドレス
- 営業時間（平日・土曜日）
- 定員数
- 対象年齢
- 施設紹介文

#### 3.5.2 サービス設定

```typescript
interface ServiceConfig {
  type: '一時預かり' | '見学' | '相談';
  enabled: boolean;
  pricing?: {
    hourlyRate?: number;
    dailyRate?: number;
    custom?: string;
  };
  maxCapacity?: number; // 時間帯別の受け入れ可能人数
}
```

#### 3.5.3 写真・画像管理

**機能**:
- 施設外観・内観写真のアップロード
- 活動写真の管理
- 画像の並び替え
- サムネイル自動生成

---

### 3.6 スタッフ管理画面（新規）

**画面名**: `app/(facility-tabs)/staff.tsx`
**役割**: スタッフ・シフト管理

#### 3.6.1 スタッフ一覧

```typescript
interface StaffMember {
  id: string;
  name: string;
  role: 'owner' | 'admin' | 'staff';
  email: string;
  phone?: string;
  photoUrl?: string;
  hiredDate: Date;
  status: 'active' | 'inactive';
}
```

**機能**:
- スタッフの招待（メール送信）
- 権限設定
- スタッフの無効化

#### 3.6.2 シフト管理

**表示形式**: カレンダー形式

**機能**:
- 週間/月間シフト表
- スタッフの勤務予定入力
- 希望休暇の管理
- 必要人員の自動計算
- シフトテンプレート（週次パターン）

---

### 3.7 レポート・分析画面（新規）

**画面名**: `app/(facility-tabs)/reports.tsx`
**役割**: 統計データの可視化

#### 3.7.1 利用統計

**グラフ種類**:
- 月次/年次予約数推移（折れ線グラフ）
- 施設タイプ別利用率（円グラフ）
- 曜日別利用率（棒グラフ）
- 時間帯別利用率（ヒートマップ）

#### 3.7.2 売上レポート

```typescript
interface RevenueReport {
  period: 'week' | 'month' | 'year';
  totalRevenue: number;
  breakdown: {
    serviceType: string;
    revenue: number;
    percentage: number;
  }[];
  comparisonToPrevious: number; // %
}
```

#### 3.7.3 保護者満足度

**表示内容**:
- 平均評価（星5段階）
- 評価の推移
- レビューコメント一覧
- フィードバック分析

#### 3.7.4 エクスポート機能

**対応形式**:
- CSV（予約データ、売上データ）
- PDF（レポート印刷）

---

### 3.8 設定画面（拡張）

**画面名**: `app/(facility-tabs)/settings.tsx`
**役割**: アカウント・システム設定

#### 3.8.1 アカウント設定

**項目**:
- プロフィール編集（名前、写真）
- パスワード変更
- メールアドレス変更
- 通知設定（プッシュ通知ON/OFF、メール通知）

#### 3.8.2 予約設定

```typescript
interface ReservationSettings {
  acceptanceWindow: {
    minDaysInAdvance: number; // 何日前から予約受付
    maxDaysInAdvance: number; // 何日先まで予約受付
  };
  cancellationPolicy: {
    allowCancellation: boolean;
    minHoursBeforeStart: number; // キャンセル可能な時間（開始何時間前まで）
  };
  autoConfirm: boolean; // 予約を自動確定するか
  requireApproval: boolean; // 承認制にするか
}
```

#### 3.8.3 自動応答メッセージ

**テンプレート**:
- 予約受付時の自動返信
- 予約確定時のメッセージ
- キャンセル受付時のメッセージ

---

## 4. バックエンド設計

### 4.1 データベーススキーマ（Supabase）

#### 4.1.1 facilities テーブル（拡張）

```sql
CREATE TABLE facilities (
  -- 基本情報
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('nursery', 'sick-child', 'clinic', 'temporary-care', 'licensed')),

  -- 所在地
  address TEXT NOT NULL,
  postal_code TEXT,
  lat FLOAT NOT NULL,
  lng FLOAT NOT NULL,

  -- 連絡先
  phone TEXT,
  email TEXT,

  -- 詳細情報
  description TEXT,
  rating FLOAT DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  images TEXT[], -- 画像URL配列

  -- 運営情報
  district TEXT CHECK (district IN ('central', 'north', 'east', 'white-stone', 'atsubetsu', 'toyohira', 'kiyota', 'south', 'west', 'teine')),
  opening_hours JSONB, -- {"weekday": "08:00-18:00", "saturday": "08:00-18:00"}
  capacity INTEGER CHECK (capacity >= 0),
  age_range TEXT,
  has_lunch BOOLEAN DEFAULT false,
  provider TEXT, -- 設置者名

  -- テンプレート
  pdf_template_url TEXT,

  -- 管理情報（新規）
  owner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending_approval')),

  -- タイムスタンプ
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_facilities_owner ON facilities(owner_user_id);
CREATE INDEX idx_facilities_status ON facilities(status);
CREATE INDEX idx_facilities_type ON facilities(type);
CREATE INDEX idx_facilities_district ON facilities(district);

-- 自動更新トリガー
CREATE TRIGGER update_facilities_updated_at
  BEFORE UPDATE ON facilities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

#### 4.1.2 facility_staff テーブル（新規）

```sql
CREATE TABLE facility_staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'staff')),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  photo_url TEXT,

  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'invited')),
  invited_at TIMESTAMP WITH TIME ZONE,
  joined_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(facility_id, user_id)
);

-- インデックス
CREATE INDEX idx_facility_staff_facility ON facility_staff(facility_id);
CREATE INDEX idx_facility_staff_user ON facility_staff(user_id);
CREATE INDEX idx_facility_staff_role ON facility_staff(role);
```

#### 4.1.3 reservations テーブル（拡張）

```sql
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- 関連エンティティ
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 予約情報
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  reservation_type TEXT CHECK (reservation_type IN ('一時預かり', '見学', '相談')),
  notes TEXT,

  -- 確認情報（新規）
  confirmed_by UUID REFERENCES facility_staff(id),
  confirmed_at TIMESTAMP WITH TIME ZONE,

  -- キャンセル情報（新規）
  cancelled_by UUID, -- user_id or facility_staff_id
  cancelled_by_type TEXT CHECK (cancelled_by_type IN ('parent', 'facility')),
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,

  -- チェックイン/アウト（新規）
  check_in_time TIMESTAMP WITH TIME ZONE,
  check_in_by UUID REFERENCES facility_staff(id),
  check_out_time TIMESTAMP WITH TIME ZONE,
  check_out_by UUID REFERENCES facility_staff(id),

  -- タイムスタンプ
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 制約
  CONSTRAINT valid_time_range CHECK (end_time > start_time),
  CONSTRAINT valid_check_times CHECK (check_out_time IS NULL OR check_out_time >= check_in_time)
);

-- インデックス
CREATE INDEX idx_reservations_facility ON reservations(facility_id);
CREATE INDEX idx_reservations_user ON reservations(user_id);
CREATE INDEX idx_reservations_child ON reservations(child_id);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_start_time ON reservations(start_time);
CREATE INDEX idx_reservations_created_at ON reservations(created_at);
```

#### 4.1.4 children テーブル（拡張）

```sql
CREATE TABLE children (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 基本情報
  name TEXT NOT NULL,
  birthday DATE NOT NULL,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  photo_url TEXT,

  -- 健康情報
  allergies TEXT[],
  medical_notes TEXT,

  -- 緊急連絡先（新規）
  emergency_contact JSONB, -- {"name": "...", "relationship": "...", "phone": "..."}

  -- 保険情報（新規）
  insurance_info JSONB,

  -- タイムスタンプ
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_children_user ON children(user_id);
CREATE INDEX idx_children_birthday ON children(birthday);
```

#### 4.1.5 facility_availability テーブル（新規）

```sql
CREATE TABLE facility_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,

  -- 日時情報
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,

  -- 定員管理
  max_capacity INTEGER NOT NULL CHECK (max_capacity >= 0),
  current_reservations INTEGER DEFAULT 0 CHECK (current_reservations >= 0),

  -- 特別設定
  is_available BOOLEAN DEFAULT true,
  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(facility_id, date, start_time),
  CONSTRAINT valid_capacity CHECK (current_reservations <= max_capacity)
);

-- インデックス
CREATE INDEX idx_availability_facility ON facility_availability(facility_id);
CREATE INDEX idx_availability_date ON facility_availability(date);
```

#### 4.1.6 messages テーブル（新規）

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- 送信者
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('parent', 'facility')),

  -- 受信者
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 施設関連（施設側が送信する場合）
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,

  -- メッセージ内容
  subject TEXT,
  body TEXT NOT NULL,
  attachments TEXT[], -- URL配列

  -- 既読管理
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,

  -- 返信スレッド（オプション）
  thread_id UUID REFERENCES messages(id),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_id);
CREATE INDEX idx_messages_facility ON messages(facility_id);
CREATE INDEX idx_messages_thread ON messages(thread_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
```

#### 4.1.7 facility_reviews テーブル（新規）

```sql
CREATE TABLE facility_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reservation_id UUID REFERENCES reservations(id) ON DELETE SET NULL,

  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,

  -- 施設側の返信（オプション）
  facility_response TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(facility_id, user_id, reservation_id)
);

-- インデックス
CREATE INDEX idx_reviews_facility ON facility_reviews(facility_id);
CREATE INDEX idx_reviews_user ON facility_reviews(user_id);
CREATE INDEX idx_reviews_rating ON facility_reviews(rating);

-- 自動的に施設の平均評価を更新する関数
CREATE OR REPLACE FUNCTION update_facility_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE facilities
  SET rating = (
    SELECT COALESCE(AVG(rating), 0)
    FROM facility_reviews
    WHERE facility_id = NEW.facility_id
  )
  WHERE id = NEW.facility_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_facility_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON facility_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_facility_rating();
```

#### 4.1.8 notifications テーブル（新規）

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

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
  data JSONB, -- 追加データ（reservation_id, message_id等）

  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
```

#### 4.1.9 ヘルパー関数

```sql
-- updated_at自動更新関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 予約時の空き枠更新関数
CREATE OR REPLACE FUNCTION update_availability_on_reservation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' THEN
    UPDATE facility_availability
    SET current_reservations = current_reservations + 1
    WHERE facility_id = NEW.facility_id
      AND date = DATE(NEW.start_time)
      AND start_time <= TIME(NEW.start_time)
      AND end_time >= TIME(NEW.end_time);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_availability_trigger
  AFTER INSERT OR UPDATE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_availability_on_reservation();
```

---

### 4.2 Row Level Security (RLS) ポリシー

#### 4.2.1 facilities テーブル

```sql
-- RLS有効化
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;

-- 全員が公開中の施設を閲覧可能
CREATE POLICY "Anyone can view active facilities"
  ON facilities FOR SELECT
  USING (status = 'active');

-- 施設オーナーは自施設を更新可能
CREATE POLICY "Facility owners can update their facilities"
  ON facilities FOR UPDATE
  USING (auth.uid() = owner_user_id);

-- 施設オーナーは自施設を削除可能
CREATE POLICY "Facility owners can delete their facilities"
  ON facilities FOR DELETE
  USING (auth.uid() = owner_user_id);

-- 認証ユーザーは新規施設を作成可能
CREATE POLICY "Authenticated users can create facilities"
  ON facilities FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
```

#### 4.2.2 facility_staff テーブル

```sql
ALTER TABLE facility_staff ENABLE ROW LEVEL SECURITY;

-- スタッフは自分の情報を閲覧可能
CREATE POLICY "Staff can view their own record"
  ON facility_staff FOR SELECT
  USING (auth.uid() = user_id);

-- 施設オーナー・管理者は自施設のスタッフを閲覧可能
CREATE POLICY "Facility admins can view facility staff"
  ON facility_staff FOR SELECT
  USING (
    facility_id IN (
      SELECT facility_id
      FROM facility_staff
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );

-- 施設オーナーのみスタッフを追加可能
CREATE POLICY "Facility owners can insert staff"
  ON facility_staff FOR INSERT
  WITH CHECK (
    facility_id IN (
      SELECT facility_id
      FROM facility_staff
      WHERE user_id = auth.uid()
        AND role = 'owner'
    )
  );

-- 施設オーナーのみスタッフを更新・削除可能
CREATE POLICY "Facility owners can update staff"
  ON facility_staff FOR UPDATE
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
  USING (
    facility_id IN (
      SELECT facility_id
      FROM facility_staff
      WHERE user_id = auth.uid()
        AND role = 'owner'
    )
  );
```

#### 4.2.3 reservations テーブル

```sql
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- 保護者は自分の予約を閲覧可能
CREATE POLICY "Parents can view their own reservations"
  ON reservations FOR SELECT
  USING (auth.uid() = user_id);

-- 施設スタッフは自施設の予約を閲覧可能
CREATE POLICY "Facility staff can view facility reservations"
  ON reservations FOR SELECT
  USING (
    facility_id IN (
      SELECT facility_id
      FROM facility_staff
      WHERE user_id = auth.uid()
    )
  );

-- 保護者は予約を作成可能
CREATE POLICY "Parents can create reservations"
  ON reservations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 保護者は自分の予約をキャンセル可能
CREATE POLICY "Parents can cancel their reservations"
  ON reservations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    status IN ('pending', 'cancelled') OR
    (OLD.status = 'confirmed' AND status = 'cancelled')
  );

-- 施設スタッフは自施設の予約を更新可能
CREATE POLICY "Facility staff can update facility reservations"
  ON reservations FOR UPDATE
  USING (
    facility_id IN (
      SELECT facility_id
      FROM facility_staff
      WHERE user_id = auth.uid()
    )
  );
```

#### 4.2.4 children テーブル

```sql
ALTER TABLE children ENABLE ROW LEVEL SECURITY;

-- 保護者は自分の子供情報を閲覧・編集可能
CREATE POLICY "Parents can manage their children"
  ON children FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 施設スタッフは予約がある子供の情報を閲覧可能
CREATE POLICY "Facility staff can view children with reservations"
  ON children FOR SELECT
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
```

#### 4.2.5 messages テーブル

```sql
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 送信者・受信者のみメッセージを閲覧可能
CREATE POLICY "Users can view their messages"
  ON messages FOR SELECT
  USING (
    auth.uid() = sender_id OR
    auth.uid() = recipient_id
  );

-- 認証ユーザーはメッセージを送信可能
CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- 受信者のみ既読ステータスを更新可能
CREATE POLICY "Recipients can update read status"
  ON messages FOR UPDATE
  USING (auth.uid() = recipient_id)
  WITH CHECK (auth.uid() = recipient_id);
```

#### 4.2.6 notifications テーブル

```sql
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分の通知を閲覧・更新可能
CREATE POLICY "Users can manage their notifications"
  ON notifications FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

---

### 4.3 Supabase Edge Functions（API設計）

#### 4.3.1 予約確認API

**エンドポイント**: `POST /functions/v1/confirm-reservation`

```typescript
// functions/confirm-reservation/index.ts
import { createClient } from '@supabase/supabase-js';

interface ConfirmReservationRequest {
  reservationId: string;
  staffId: string;
}

export default async function handler(req: Request) {
  const { reservationId, staffId } = await req.json();

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // 1. 予約を確定
  const { data: reservation, error: updateError } = await supabase
    .from('reservations')
    .update({
      status: 'confirmed',
      confirmed_by: staffId,
      confirmed_at: new Date().toISOString(),
    })
    .eq('id', reservationId)
    .select('*, children(*), auth.users(*)')
    .single();

  if (updateError) {
    return new Response(JSON.stringify({ error: updateError.message }), {
      status: 400,
    });
  }

  // 2. 保護者に通知送信
  await supabase.from('notifications').insert({
    user_id: reservation.user_id,
    type: 'reservation_confirmed',
    title: '予約が確定しました',
    body: `${reservation.children.name}様の予約が確定しました。`,
    data: { reservation_id: reservationId },
  });

  // 3. 空き枠を更新（トリガーで自動実行）

  return new Response(JSON.stringify({ success: true, reservation }), {
    status: 200,
  });
}
```

#### 4.3.2 空き状況取得API

**エンドポイント**: `GET /functions/v1/get-availability`

```typescript
// functions/get-availability/index.ts
interface GetAvailabilityRequest {
  facilityId: string;
  date: string; // YYYY-MM-DD
}

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const facilityId = url.searchParams.get('facilityId');
  const date = url.searchParams.get('date');

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // 施設の定員を取得
  const { data: facility } = await supabase
    .from('facilities')
    .select('capacity')
    .eq('id', facilityId)
    .single();

  // 指定日の予約を取得
  const { data: reservations } = await supabase
    .from('reservations')
    .select('start_time, end_time')
    .eq('facility_id', facilityId)
    .eq('status', 'confirmed')
    .gte('start_time', `${date}T00:00:00`)
    .lt('start_time', `${date}T23:59:59`);

  // 時間帯別の空き状況を計算
  const availability = calculateAvailability(
    facility.capacity,
    reservations
  );

  return new Response(JSON.stringify({ availability }), {
    status: 200,
  });
}

function calculateAvailability(capacity: number, reservations: any[]) {
  // 1時間単位で空き状況を計算
  const timeSlots = Array.from({ length: 24 }, (_, i) => ({
    time: `${i.toString().padStart(2, '0')}:00`,
    available: capacity,
  }));

  reservations.forEach((reservation) => {
    const startHour = new Date(reservation.start_time).getHours();
    const endHour = new Date(reservation.end_time).getHours();

    for (let hour = startHour; hour < endHour; hour++) {
      timeSlots[hour].available -= 1;
    }
  });

  return timeSlots;
}
```

#### 4.3.3 統計レポートAPI

**エンドポイント**: `GET /functions/v1/facility-stats`

```typescript
// functions/facility-stats/index.ts
interface FacilityStatsRequest {
  facilityId: string;
  period: 'week' | 'month' | 'year';
}

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const facilityId = url.searchParams.get('facilityId');
  const period = url.searchParams.get('period') as 'week' | 'month' | 'year';

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const dateFrom = getDateFrom(period);

  // 予約統計
  const { data: reservations } = await supabase
    .from('reservations')
    .select('status, created_at, reservation_type')
    .eq('facility_id', facilityId)
    .gte('created_at', dateFrom);

  // レビュー統計
  const { data: reviews } = await supabase
    .from('facility_reviews')
    .select('rating')
    .eq('facility_id', facilityId)
    .gte('created_at', dateFrom);

  const stats = {
    totalReservations: reservations.length,
    confirmedReservations: reservations.filter((r) => r.status === 'confirmed').length,
    cancelledReservations: reservations.filter((r) => r.status === 'cancelled').length,
    averageRating: reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0,
    reservationsByType: groupBy(reservations, 'reservation_type'),
    reservationsByDay: groupByDay(reservations),
  };

  return new Response(JSON.stringify(stats), {
    status: 200,
  });
}

function getDateFrom(period: string): string {
  const now = new Date();
  switch (period) {
    case 'week':
      return new Date(now.setDate(now.getDate() - 7)).toISOString();
    case 'month':
      return new Date(now.setMonth(now.getMonth() - 1)).toISOString();
    case 'year':
      return new Date(now.setFullYear(now.getFullYear() - 1)).toISOString();
    default:
      return now.toISOString();
  }
}

function groupBy(arr: any[], key: string) {
  return arr.reduce((acc, obj) => {
    const value = obj[key];
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function groupByDay(arr: any[]) {
  return arr.reduce((acc, obj) => {
    const day = new Date(obj.created_at).toISOString().split('T')[0];
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {});
}
```

#### 4.3.4 一斉通知API

**エンドポイント**: `POST /functions/v1/send-bulk-notification`

```typescript
// functions/send-bulk-notification/index.ts
interface BulkNotificationRequest {
  facilityId: string;
  title: string;
  body: string;
  recipientFilter?: {
    childAgeMin?: number;
    childAgeMax?: number;
    hasReservationInLast?: number; // days
  };
}

export default async function handler(req: Request) {
  const { facilityId, title, body, recipientFilter } = await req.json();

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // 施設の過去の利用者を取得
  let query = supabase
    .from('reservations')
    .select('user_id, children(*)')
    .eq('facility_id', facilityId);

  if (recipientFilter?.hasReservationInLast) {
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - recipientFilter.hasReservationInLast);
    query = query.gte('created_at', dateFrom.toISOString());
  }

  const { data: reservations } = await query;

  // 重複除去
  const uniqueUsers = [...new Set(reservations.map((r) => r.user_id))];

  // 通知を一斉送信
  const notifications = uniqueUsers.map((userId) => ({
    user_id: userId,
    type: 'message_received',
    title,
    body,
    data: { facility_id: facilityId },
  }));

  await supabase.from('notifications').insert(notifications);

  // プッシュ通知送信（Expo Notifications）
  // TODO: Expo Push Notification APIを使用

  return new Response(
    JSON.stringify({ success: true, recipientCount: uniqueUsers.length }),
    { status: 200 }
  );
}
```

---

## 5. 認証・権限管理

### 5.1 ユーザータイプ

#### Parent（保護者）
- 通常のユーザー登録
- 子供情報の登録・管理
- 施設の検索・予約
- メッセージ送信

#### Facility Owner（施設オーナー）
- 施設登録時に自動付与
- 全機能へのアクセス権限
- スタッフの招待・管理
- 施設情報の編集

#### Facility Staff（施設スタッフ）
- オーナーが招待
- 役割に応じた権限
  - **Admin**: 予約管理、保護者対応、レポート閲覧
  - **Staff**: 予約閲覧、チェックイン/アウト

### 5.2 権限チェック関数

```typescript
// lib/auth.ts
import { supabase } from './supabase';

export type FacilityRole = 'owner' | 'admin' | 'staff' | null;

/**
 * 施設に対するユーザーの権限を確認
 */
export async function checkFacilityPermission(
  userId: string,
  facilityId: string
): Promise<FacilityRole> {
  const { data, error } = await supabase
    .from('facility_staff')
    .select('role')
    .eq('user_id', userId)
    .eq('facility_id', facilityId)
    .eq('status', 'active')
    .single();

  if (error || !data) {
    return null;
  }

  return data.role as FacilityRole;
}

/**
 * ユーザーが管理する施設一覧を取得
 */
export async function getUserFacilities(userId: string) {
  const { data, error } = await supabase
    .from('facility_staff')
    .select('facility_id, role, facilities(*)')
    .eq('user_id', userId)
    .eq('status', 'active');

  if (error) {
    throw error;
  }

  return data;
}

/**
 * 特定の操作が許可されているか確認
 */
export async function canPerformAction(
  userId: string,
  facilityId: string,
  action: 'view' | 'edit' | 'delete' | 'manage_staff'
): Promise<boolean> {
  const role = await checkFacilityPermission(userId, facilityId);

  if (!role) return false;

  switch (action) {
    case 'view':
      return ['owner', 'admin', 'staff'].includes(role);
    case 'edit':
      return ['owner', 'admin'].includes(role);
    case 'delete':
    case 'manage_staff':
      return role === 'owner';
    default:
      return false;
  }
}
```

### 5.3 React Hooksでの権限管理

```typescript
// hooks/useFacilityPermission.ts
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { checkFacilityPermission, FacilityRole } from '../lib/auth';

export function useFacilityPermission(facilityId: string) {
  const { user } = useAuth();
  const [role, setRole] = useState<FacilityRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }

    checkFacilityPermission(user.id, facilityId).then((role) => {
      setRole(role);
      setLoading(false);
    });
  }, [user, facilityId]);

  return {
    role,
    loading,
    isOwner: role === 'owner',
    isAdmin: role === 'admin' || role === 'owner',
    isStaff: role !== null,
  };
}
```

### 5.4 使用例

```typescript
// app/(facility-tabs)/reservations.tsx
import { useFacilityPermission } from '../../hooks/useFacilityPermission';

export default function ReservationsScreen() {
  const { role, isAdmin, loading } = useFacilityPermission(facilityId);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!role) {
    return <UnauthorizedScreen />;
  }

  return (
    <View>
      <ReservationList />

      {/* 管理者のみ表示 */}
      {isAdmin && (
        <TouchableOpacity onPress={handleBulkConfirm}>
          <Text>一括確定</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
```

---

## 6. 実装ロードマップ

### Phase 1: コア機能強化（2-3週間）

**優先度: 最高 🔴**

#### Week 1: データベース構築
- [ ] Supabaseマイグレーションファイル作成
  - 全テーブルのCREATE文
  - RLSポリシー設定
  - インデックス作成
  - トリガー関数
- [ ] 型定義の更新（`lib/supabase.ts`）
- [ ] サンプルデータ投入スクリプト

#### Week 2: 施設認証フロー
- [ ] 施設登録画面の実装（`app/facility-register.tsx`）
  - 施設情報入力フォーム
  - 画像アップロード
  - 利用規約同意
- [ ] 施設ログイン後のセッション管理
  - AuthContextの拡張
  - 施設情報の取得・保持
- [ ] 権限チェック機能
  - `useFacilityPermission` Hook
  - 画面アクセス制御

#### Week 2-3: 予約管理のリアルタイム化
- [ ] 予約一覧をSupabaseから取得
  - フィルター機能実装
  - ページネーション
- [ ] 予約詳細モーダル
  - 子供・保護者情報表示
  - ステータス変更機能
- [ ] リアルタイム更新（Supabase Realtime）
  - 新規予約の自動表示
  - ステータス変更の即時反映

#### Week 3: ダッシュボード強化
- [ ] 統計データの集計
  - 本日/今週/今月の予約数
  - 空き状況の計算
- [ ] グラフコンポーネント実装
  - react-native-chart-kit使用
  - 予約推移グラフ
- [ ] 今日のスケジュール表示
  - タイムライン形式
  - チェックイン/アウト機能

**成果物**:
- ✅ 完全なデータベース構造
- ✅ 施設認証フロー
- ✅ 動作する予約管理システム
- ✅ リアルタイムダッシュボード

---

### Phase 2: コミュニケーション機能（2週間）

**優先度: 高 🟡**

#### Week 4: 通知システム
- [ ] 通知テーブル活用
  - 新規予約時の施設側通知
  - 予約確定時の保護者側通知
- [ ] プッシュ通知実装
  - Expo Notificationsセットアップ
  - FCM/APNs設定
  - バックグラウンド通知

#### Week 5: メッセージ機能
- [ ] メッセージ一覧画面（`app/(facility-tabs)/messages.tsx`）
  - スレッド一覧
  - 未読バッジ
- [ ] メッセージ詳細・送信
  - リアルタイムチャット
  - 既読管理
  - ファイル添付
- [ ] テンプレート機能
  - よく使うメッセージの保存
  - 変数置換（{childName}等）

**成果物**:
- ✅ プッシュ通知システム
- ✅ 保護者とのメッセージング機能

---

### Phase 3: 高度な管理機能（2-3週間）

**優先度: 中 🟢**

#### Week 6: スタッフ管理
- [ ] スタッフ一覧画面（`app/(facility-tabs)/staff.tsx`）
  - スタッフ招待機能（メール送信）
  - 権限設定UI
- [ ] シフト管理
  - カレンダーコンポーネント
  - シフト入力・編集
  - スタッフの希望休暇管理

#### Week 7: レポート・分析
- [ ] レポート画面（`app/(facility-tabs)/reports.tsx`）
  - 予約統計の可視化
  - グラフ・チャート
- [ ] CSVエクスポート
  - 予約データのダウンロード
  - 売上レポート
- [ ] 保護者満足度
  - レビュー集計
  - 評価推移グラフ

#### Week 8: 空き枠管理
- [ ] カレンダーベースの空き枠設定
  - 日付・時間帯別の定員設定
  - 特別営業日の設定
- [ ] 自動計算ロジック
  - 予約数から空き状況を算出
  - リアルタイム更新
- [ ] 保護者側への空き状況表示
  - 施設詳細画面に反映
  - 予約可能時間帯の表示

**成果物**:
- ✅ スタッフ管理システム
- ✅ 分析・レポート機能
- ✅ 空き枠管理機能

---

### Phase 4: UX改善・最適化（1-2週間）

**優先度: 中 🟢**

#### Week 9: UI/UXブラッシュアップ
- [ ] ローディング状態の改善
  - Skeletonローダー
  - プログレスインジケーター
- [ ] エラーハンドリング
  - ユーザーフレンドリーなエラーメッセージ
  - リトライ機能
- [ ] レスポンシブ対応の強化
  - タブレット最適化
  - Web版のレイアウト調整

#### Week 9-10: パフォーマンス最適化
- [ ] クエリの最適化
  - N+1問題の解消
  - インデックスの見直し
- [ ] キャッシング戦略
  - React Queryの導入
  - ローカルストレージ活用
- [ ] 画像最適化
  - 画像圧縮
  - レスポンシブ画像
  - Lazy Loading

**成果物**:
- ✅ 洗練されたUI/UX
- ✅ 高速で安定した動作

---

### 実装優先順位サマリー

#### 最優先（MVP）
1. ✅ データベース構築（全テーブル作成）
2. ✅ 施設認証フロー（登録・ログイン）
3. ✅ 予約管理のリアルタイム化
4. ✅ ダッシュボード統計表示

#### 高優先
5. 通知システム（予約確認・キャンセル）
6. メッセージ機能（保護者とのコミュニケーション）
7. 空き枠管理

#### 中優先
8. スタッフ管理
9. レポート・分析
10. レビュー機能

---

## 7. 技術仕様

### 7.1 使用技術スタック

#### フロントエンド
- **React Native**: 0.81.4
- **Expo SDK**: 54
- **Expo Router**: 6.0.8（ファイルベースルーティング）
- **TypeScript**: 5.9.2

#### バックエンド
- **Supabase**: PostgreSQL + Auth + Realtime
- **Edge Functions**: Deno環境

#### UI/UXライブラリ
- **lucide-react-native**: アイコン
- **expo-linear-gradient**: グラデーション
- **react-native-chart-kit**: グラフ・チャート（追加予定）
- **expo-notifications**: プッシュ通知（追加予定）

#### 開発ツール
- **ESLint**: コード品質管理
- **Prettier**: コードフォーマット
- **Git**: バージョン管理

### 7.2 ディレクトリ構造

```
child-app/
├── app/
│   ├── (auth)/              # 保護者認証画面
│   ├── (tabs)/              # 保護者側メイン画面
│   ├── (facility-tabs)/     # 施設側メイン画面
│   │   ├── dashboard.tsx    # ダッシュボード
│   │   ├── reservations.tsx # 予約管理
│   │   ├── messages.tsx     # メッセージ（新規）
│   │   ├── children.tsx     # 子供管理（新規）
│   │   ├── staff.tsx        # スタッフ管理（新規）
│   │   ├── reports.tsx      # レポート（新規）
│   │   ├── facility-info.tsx # 施設情報
│   │   └── settings.tsx     # 設定
│   ├── facility-login.tsx   # 施設ログイン
│   └── facility-register.tsx # 施設登録
├── components/
│   ├── facility/            # 施設側専用コンポーネント（新規）
│   │   ├── StatCard.tsx
│   │   ├── ReservationCalendar.tsx
│   │   ├── MessageThread.tsx
│   │   └── ...
│   └── shared/              # 共通コンポーネント
├── lib/
│   ├── supabase.ts          # Supabaseクライアント・型定義
│   └── auth.ts              # 認証・権限管理（新規）
├── hooks/
│   ├── useFacilityPermission.ts # 権限管理Hook（新規）
│   └── useReservations.ts       # 予約データ管理（新規）
├── contexts/
│   └── AuthContext.tsx      # 認証コンテキスト
├── constants/
│   ├── colors.ts            # カラーテーマ
│   └── facilities.ts        # 施設データ
├── docs/
│   ├── FACILITY_DESIGN.md   # 施設側設計書（本ドキュメント）
│   └── ...
└── supabase/
    ├── migrations/          # DBマイグレーション（新規）
    └── functions/           # Edge Functions（新規）
```

### 7.3 コーディング規約

#### TypeScript
- **厳格な型定義**: `any`の使用を避ける
- **インターフェース優先**: `type`より`interface`を使用
- **命名規則**:
  - コンポーネント: PascalCase（`ReservationCard.tsx`）
  - 関数・変数: camelCase（`getUserFacilities`）
  - 定数: UPPER_SNAKE_CASE（`MAX_CAPACITY`）

#### React Native
- **関数コンポーネント**: クラスコンポーネントは使用しない
- **Hooks**: カスタムHooksで状態管理をカプセル化
- **StyleSheet**: インラインスタイルを避け、`StyleSheet.create()`を使用

#### Git
- **コミットメッセージ**:
  - `feat: 新機能追加`
  - `fix: バグ修正`
  - `refactor: リファクタリング`
  - `docs: ドキュメント更新`

---

## 8. セキュリティ対策

### 8.1 認証セキュリティ
- ✅ Supabase Authによるセキュアな認証
- ✅ パスワードのハッシュ化
- ✅ セッショントークンの暗号化
- ✅ CSRF保護

### 8.2 データセキュリティ
- ✅ Row Level Security（RLS）による行レベル権限制御
- ✅ 個人情報の暗号化
- ✅ SQLインジェクション対策（Supabaseクライアント使用）
- ✅ XSS対策（React Nativeのエスケープ機能）

### 8.3 通信セキュリティ
- ✅ HTTPS通信のみ
- ✅ API KeyのSecure Storage保存
- ✅ Expo SecureStoreの活用

---

## 9. テスト戦略

### 9.1 ユニットテスト
- Jestを使用
- 認証・権限管理関数のテスト
- データ変換関数のテスト

### 9.2 統合テスト
- Supabaseクライアントとの連携テスト
- Edge Functionsのテスト

### 9.3 E2Eテスト
- Detoxを使用（将来実装）
- 主要フローのテスト
  - 施設登録
  - 予約確認
  - メッセージ送信

---

## 10. 今後の拡張可能性

### 10.1 決済機能
- Stripe連携
- 予約時の事前決済
- 月次請求書の自動発行

### 10.2 多言語対応
- i18n導入
- 英語・中国語・韓国語対応

### 10.3 AIアシスタント
- 予約の自動提案
- メッセージの自動返信
- 異常検知（急なキャンセル増加等）

### 10.4 他システム連携
- Googleカレンダー同期
- Slack通知
- 自治体システムとのAPI連携

---

## 11. まとめ

本設計書は、子育て支援アプリの施設向け機能の包括的な設計を示しています。

### 主要な設計ポイント
1. **データ駆動**: Supabaseを活用したリアルタイムデータ管理
2. **権限ベース**: 役割に応じた柔軟な権限制御
3. **スケーラブル**: 将来の機能拡張を考慮した設計
4. **セキュア**: RLSによる堅牢なデータ保護

### 次のステップ
Phase 1のデータベース構築から開始し、MVPを2-3週間で完成させることを推奨します。

---

**ドキュメント管理**:
- 作成日: 2025年10月25日
- 最終更新: 2025年10月25日
- バージョン: 1.0
- 作成者: Claude Code
