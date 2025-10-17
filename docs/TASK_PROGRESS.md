# 子育て支援アプリ - タスク進捗メモ

**最終更新**: 2025-10-10

---

## 📊 プロジェクト全体の進捗状況

### 実装済み機能: 30%
- PDF基本機能（Web版）
- 申請書管理画面
- 施設検索機能（基本）

### 未実装機能: 70%
- 認可保育園入園申請DX化
- 施設側機能
- Supabaseデータベース統合

---

## ✅ 実装済み機能

### 1. PDF自動入力機能（基本実装完了）

#### 実装ファイル
- `app/application/index.tsx` - 申請書一覧画面
- `app/application/new.tsx` - 新規申請書作成（3ステップフォーム）
- `app/application/preview/[id].tsx` - プレビュー画面
- `app/application/mapping/[templateId].tsx` - PDFマッピングエディタ（Web版のみ）
- `utils/pdfAutoFill.ts` - PDF自動入力ロジック
- `utils/pdfMappingStorage.ts` - マッピング設定の保存・読み込み
- `components/PdfPreview.web.tsx` - Web版PDFプレビュー
- `components/PdfPreview.tsx` - モバイル版PDFプレビュー
- `components/PdfMappingEditor.web.tsx` - マッピングエディタUI
- `components/FieldPalette.tsx` - フィールドパレット
- `components/PdfCanvas.web.tsx` - PDFキャンバス

#### 機能詳細
✅ PDFテンプレートの読み込み（Metro asset system使用）
✅ PDFプレビュー表示（Platform-specific files使用）
✅ PDFダウンロード機能（Web版のみ）
✅ PDFマッピングエディタ
  - ドラッグ&ドロップでフィールド配置
  - 座標指定でPDFに自動入力
  - マッピング設定の保存・読み込み（ローカルストレージ）
✅ 自動入力機能
  - pdf-libを使用して座標指定で描画
  - Web版のみ対応

#### 対応PDFテンプレート
- `assets/templates/temporary_care_application.pdf` - 一時預かり申請書（サンプル）

---

### 2. 申請書管理機能

#### 実装ファイル
- `app/application/index.tsx` - 申請書一覧
- `app/application/new.tsx` - 新規作成フロー
- `components/ApplicationCard.tsx` - 申請書カード

#### 機能詳細
✅ 申請書一覧表示（サンプルデータ）
✅ 新規申請書作成フロー（3ステップ）
  - Step 1: 基本情報（施設名、申請種別、希望開始日）
  - Step 2: 詳細情報（保護者・子供情報）
  - Step 3: 確認
✅ ステータス管理（draft, submitted）

---

### 3. 施設検索・予約機能

#### 実装ファイル
- `app/(tabs)/reserve.tsx` - 施設検索画面
- `constants/facilities.ts` - 施設データ定義
- `components/FacilityListItem.tsx` - 施設リストアイテム
- `components/FacilityCard.tsx` - 施設カード

#### 機能詳細
✅ 施設一覧表示（サンプルデータ: 6件）
✅ 検索バー（UI実装済み、検索ロジックは未実装）
✅ 地図表示エリア（プレースホルダー）
✅ 施設タイプ: nursery, sick-child, clinic

---

### 4. ホーム画面・プロフィール

#### 実装ファイル
- `app/(tabs)/index.tsx` - ホーム画面
- `app/(tabs)/profile.tsx` - プロフィール画面
- `app/(tabs)/board.tsx` - 掲示板（プレースホルダー）

#### 機能詳細
✅ タブナビゲーション
✅ 基本レイアウト
⚠️ 認証機能未統合

---

## ❌ 未実装機能（優先順位付き）

---

## 🚀 Phase 1: MVP拡張（優先度: 最高）

### タスク1.1: Supabaseセットアップ ⭐⭐⭐⭐⭐

#### 必要な作業
1. **環境変数設定**
   - `.env` ファイル作成
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`

2. **Supabase初期化ファイル作成**
   - `lib/supabase.ts` - Supabaseクライアント初期化
   - `lib/AuthContext.tsx` - 認証コンテキスト（既存ファイル更新）

3. **データベーススキーマ設計**
   ```sql
   -- users テーブル
   CREATE TABLE users (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     email TEXT UNIQUE NOT NULL,
     name TEXT,
     phone TEXT,
     address TEXT,
     created_at TIMESTAMP DEFAULT NOW()
   );

   -- children テーブル
   CREATE TABLE children (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     user_id UUID REFERENCES users(id),
     name TEXT NOT NULL,
     birth_date DATE,
     gender TEXT,
     created_at TIMESTAMP DEFAULT NOW()
   );

   -- applications テーブル
   CREATE TABLE applications (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     user_id UUID REFERENCES users(id),
     child_id UUID REFERENCES children(id),
     facility_id TEXT,
     application_type TEXT NOT NULL,
     status TEXT DEFAULT 'draft',
     data JSONB,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );

   -- facilities テーブル
   CREATE TABLE facilities (
     id TEXT PRIMARY KEY,
     name TEXT NOT NULL,
     type TEXT NOT NULL,
     address TEXT,
     phone TEXT,
     email TEXT,
     description TEXT,
     pdf_template_url TEXT,
     application_form_type TEXT,
     created_at TIMESTAMP DEFAULT NOW()
   );

   -- pdf_mappings テーブル
   CREATE TABLE pdf_mappings (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     template_name TEXT UNIQUE NOT NULL,
     fields JSONB NOT NULL,
     is_official BOOLEAN DEFAULT FALSE,
     created_by UUID REFERENCES users(id),
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

4. **認証機能統合**
   - ログイン・新規登録画面の実装
   - `app/(auth)/login.tsx` 更新
   - `app/(auth)/register.tsx` 更新

#### 完了条件
- [ ] Supabaseプロジェクト作成
- [ ] 環境変数設定完了
- [ ] データベーススキーマ適用
- [ ] 認証機能動作確認
- [ ] ユーザー登録・ログインテスト成功

---

### タスク1.2: 複数PDFテンプレート対応 ⭐⭐⭐⭐⭐

#### 追加が必要なPDFテンプレート
1. **給付認定等申請書（2号・3号認定用）**
   - ファイル名: `assets/templates/childcare_recognition_application.pdf`
   - 必要フィールド: 保護者氏名、住所、子供情報、認定区分など

2. **就労証明書（札幌市指定様式）**
   - ファイル名: `assets/templates/employment_certificate.pdf`
   - 必要フィールド: 勤務先情報、就労時間、雇用形態など

3. **復職予定申立書**
   - ファイル名: `assets/templates/return_to_work_statement.pdf`
   - 必要フィールド: 復職予定日、勤務先情報など

4. **マイナンバー記入・貼付用紙**
   - ファイル名: `assets/templates/mynumber_form.pdf`
   - 必要フィールド: マイナンバー（マスキング対応）

5. **介護・看護申立書**
   - ファイル名: `assets/templates/care_statement.pdf`

6. **求職活動申告書兼同意書**
   - ファイル名: `assets/templates/job_seeking_statement.pdf`

7. **転入に関する誓約書**
   - ファイル名: `assets/templates/relocation_pledge.pdf`

#### 実装ファイル
- `constants/pdfTemplates.ts` - テンプレート定義
  ```typescript
  export interface PdfTemplate {
    id: string;
    name: string;
    fileName: string;
    category: 'childcare' | 'temporary_care' | 'temporary_everyone';
    requiredFields: string[];
  }
  ```

- `app/application/new.tsx` 更新
  - テンプレート選択UI追加
  - カテゴリー別フォーム分岐

#### 完了条件
- [ ] 7つのPDFテンプレートファイル配置
- [ ] テンプレート定義作成
- [ ] 各テンプレートのマッピング設定作成
- [ ] テンプレート選択UI実装
- [ ] 各PDFの自動入力テスト成功

---

### タスク1.3: 施設データ拡張 ⭐⭐⭐⭐

#### 必要な作業
1. **Facilityインターフェース更新**
   ```typescript
   export interface Facility {
     id: string;
     name: string;
     type: 'nursery' | 'temporary_care' | 'temporary_everyone' | 'corporate' | 'sick-child' | 'clinic';
     address: string;
     lat: number;
     lng: number;
     phone?: string;
     email?: string;
     description?: string;
     rating: number;
     imageUrl: string;
     distance?: number;

     // 新規追加フィールド
     pdfTemplateUrl?: string; // 施設独自の申込書PDF URL
     applicationFormType?: 'unified' | 'custom'; // 統一様式 or 施設独自
     acceptsOnlineApplication?: boolean; // オンライン申請対応
     capacity?: number; // 定員
     ageRange?: { min: number; max: number }; // 対象年齢
     openingHours?: string; // 開園時間
     closedDays?: string[]; // 休園日
   }
   ```

2. **実際の札幌市施設データ取込**
   - [こども誰でも通園制度対応園PDF](https://kosodate.city.sapporo.jp/material/files/group/1/20250821_sisetuitirann.pdf)
   - [一時預かり施設PDF](https://kosodate.city.sapporo.jp/material/files/group/1/jissisisetsu_20250812.pdf)
   - PDFからデータ抽出 → `constants/facilities.ts` に追加

3. **施設詳細画面作成**
   - `app/facility/[id].tsx` - 施設詳細画面
   - 施設独自PDFダウンロードボタン
   - 申請種別の表示

#### 完了条件
- [ ] Facilityインターフェース更新
- [ ] 札幌市の実際の施設データ取込（最低20件）
- [ ] 施設詳細画面実装
- [ ] 独自PDFダウンロード機能テスト成功

---

### タスク1.4: 提出書類チェックリスト（ルールベース） ⭐⭐⭐

#### 実装ファイル
- `app/application/checklist.tsx` - チェックリスト画面
- `utils/documentChecker.ts` - 書類判定ロジック

#### 機能詳細
1. **質問フローUI**
   ```typescript
   const questions = [
     { id: 'employment_status', text: 'あなたは現在就労中ですか？', type: 'radio' },
     { id: 'has_sibling', text: '兄弟姉妹が既に保育園に通っていますか？', type: 'radio' },
     { id: 'is_relocating', text: '転入予定ですか？', type: 'radio' },
     // ...
   ];
   ```

2. **ルールベース判定**
   ```typescript
   function getRequiredDocuments(answers: Answers): Document[] {
     const documents: Document[] = [
       { name: '給付認定等申請書', required: true },
     ];

     if (answers.employment_status === 'employed') {
       documents.push({ name: '就労証明書', required: true });
     }

     if (answers.is_relocating === 'yes') {
       documents.push({ name: '転入に関する誓約書', required: true });
     }

     // ... その他のルール

     return documents;
   }
   ```

3. **チェックリスト表示**
   - 必要書類の一覧表示
   - チェックボックスで進捗管理
   - 未提出書類のアラート

#### 完了条件
- [ ] 質問フローUI実装
- [ ] ルールベース判定ロジック実装
- [ ] チェックリスト画面実装
- [ ] 10パターンのテストケース成功

---

## 🎨 Phase 2: 利便性向上（優先度: 高）

### タスク2.1: 複数園同時申込サポート ⭐⭐⭐

#### 実装ファイル
- `app/application/new.tsx` 更新
- `components/FacilitySelector.tsx` - 施設選択UI

#### 機能詳細
- 第1希望～第5希望の施設選択
- 希望順位の並び替え
- 各希望に対する理由記入欄

#### 完了条件
- [ ] 施設選択UI実装
- [ ] 希望順位管理機能
- [ ] PDF出力時に複数希望反映

---

### タスク2.2: 申請履歴・進捗管理 ⭐⭐⭐

#### 実装ファイル
- `app/application/history.tsx` - 申請履歴画面
- `components/ApplicationStatusTracker.tsx` - ステータストラッカー

#### 機能詳細
- 申請ステータスの可視化
  - 「書類作成中」「提出済」「審査中」「承認」「不備あり」
- タイムライン表示
- 提出締切のリマインダー通知

#### 完了条件
- [ ] 申請履歴画面実装
- [ ] ステータストラッカーUI実装
- [ ] 通知機能実装（expo-notifications）

---

### タスク2.3: マイナンバーのマスキング表示 ⭐⭐

#### 実装ファイル
- `components/SecureInput.tsx` - セキュア入力コンポーネント

#### 機能詳細
- 入力時は「●●●●●●●●」表示
- PDF出力時のみ実際の値を反映
- ローカルストレージには暗号化して保存

#### 完了条件
- [ ] セキュア入力コンポーネント実装
- [ ] 暗号化ロジック実装
- [ ] PDFへの正しい出力テスト

---

## 🏢 Phase 3: 施設側機能（優先度: 中）

### タスク3.1: 施設向けダッシュボード ⭐⭐⭐

#### 実装ファイル
- `app/(facility-tabs)/` - 施設側タブナビゲーション
- `app/(facility-tabs)/dashboard.tsx` - ダッシュボード
- `app/(facility-tabs)/applications.tsx` - 申請受付管理
- `app/(facility-tabs)/pdf-upload.tsx` - PDFアップロード

#### 機能詳細
- 受付中の申請一覧
- 申請ステータス管理
- 施設独自PDFのアップロード
- 申請者への通知機能

#### 完了条件
- [ ] 施設ユーザー認証
- [ ] ダッシュボード実装
- [ ] 申請管理機能実装
- [ ] PDFアップロード機能実装

---

### タスク3.2: サブスクリプション管理 ⭐⭐

#### 実装ファイル
- `app/settings/subscription.tsx` - サブスク管理画面
- `lib/stripe.ts` - Stripe連携（検討中）

#### 機能詳細
- 無料プラン: セルフサービスのみ
- 有料プラン: 運営側の代理マッピング + サポート
- プラン比較表示
- 支払い管理

#### 完了条件
- [ ] プラン設計
- [ ] 支払い機能実装（Stripe or 代替）
- [ ] プラン制限の実装

---

## 🔮 Phase 4: 高度な機能（優先度: 低、長期的）

### タスク4.1: OCR機能 ⚠️

#### 実装方法
- Google Cloud Vision API / AWS Textract
- 診断書・在学証明書の自動読取
- 画像アップロード → テキスト抽出 → フォーム自動入力

#### 課題
- API利用料金
- 精度保証
- プライバシー保護

---

### タスク4.2: 就労証明書リクエスト機能 ⚠️

#### 実装方法
- 企業向けWebフォーム
- 電子署名機能（DocuSign / Adobe Sign）
- メール通知システム

#### 課題
- 企業側の受け入れ体制
- 電子署名基盤のコスト
- 法的有効性の確認

---

### タスク4.3: 区役所連携（申請状況トラッカー） ⚠️

#### 実装方法
- 札幌市のAPIとの連携（存在する場合）
- 申請後のステータス自動更新
- 審査結果の通知

#### 課題
- 行政システムとのAPI連携
- 札幌市との契約・交渉
- セキュリティ要件

---

## 🚨 技術的課題・ブロッカー

### 1. Supabase未セットアップ
- **影響度**: 高
- **現状**: パッケージインストール済みだが初期化コードなし
- **対応**: Phase 1.1で対応必須

### 2. PDFマッピング設定の永続化
- **影響度**: 中
- **現状**: ローカルストレージのみ
- **対応**: Supabase統合後にデータベース保存へ移行

### 3. 札幌市PDFのAcroForm対応状況不明
- **影響度**: 中
- **現状**: 座標指定のみで対応中
- **対応**: 実際のPDFで検証が必要

### 4. 施設データの手動入力負荷
- **影響度**: 中
- **現状**: サンプルデータ6件のみ
- **対応**: PDFスクレイピング or 手動入力

---

## 📅 推奨スケジュール

### Week 1-2: Phase 1.1（Supabaseセットアップ）
- Supabaseプロジェクト作成
- データベーススキーマ設計・適用
- 認証機能統合

### Week 3-4: Phase 1.2（複数PDFテンプレート対応）
- PDFテンプレート収集・配置
- テンプレート定義作成
- マッピング設定作成

### Week 5-6: Phase 1.3（施設データ拡張）
- Facilityインターフェース更新
- 札幌市施設データ取込
- 施設詳細画面実装

### Week 7-8: Phase 1.4（提出書類チェックリスト）
- 質問フローUI実装
- ルールベース判定ロジック
- チェックリスト画面実装

### Week 9-12: Phase 2（利便性向上）
- 複数園同時申込
- 申請履歴・進捗管理
- マイナンバーマスキング

### Month 4-6: Phase 3（施設側機能）
- 施設向けダッシュボード
- サブスクリプション管理

---

## 📝 次回のアクションアイテム

### 即座に着手可能
1. ✅ Supabaseプロジェクト作成
2. ✅ 環境変数設定
3. ✅ データベーススキーマ設計

### 調査が必要
1. 🔍 札幌市公式PDFの入手・確認
2. 🔍 PDFのAcroForm対応状況確認
3. 🔍 札幌市施設データの取得方法

### 保留・検討中
1. ⏸️ OCR機能の実装方法
2. ⏸️ 電子署名機能の実装方法
3. ⏸️ 区役所連携の可能性

---

## 🎯 成功指標（KPI）

### Phase 1完了時
- [ ] ユーザー登録・ログイン機能が動作
- [ ] 7種類のPDFテンプレート対応完了
- [ ] 札幌市の実際の施設データ20件以上登録
- [ ] 提出書類チェックリスト機能が動作

### Phase 2完了時
- [ ] 複数園への同時申込が可能
- [ ] 申請履歴の閲覧・管理が可能
- [ ] マイナンバーのセキュアな入力・出力が可能

### Phase 3完了時
- [ ] 施設側ダッシュボードが動作
- [ ] サブスクリプションプランが選択可能
- [ ] 施設独自PDFのアップロードが可能

---

## 📚 参考資料

### 札幌市公式リンク
- [こども誰でも通園制度対応園PDF](https://kosodate.city.sapporo.jp/material/files/group/1/20250821_sisetuitirann.pdf)
- [一時預かり施設PDF](https://kosodate.city.sapporo.jp/material/files/group/1/jissisisetsu_20250812.pdf)

### 技術ドキュメント
- [Expo SDK 54 Documentation](https://docs.expo.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [pdf-lib Documentation](https://pdf-lib.js.org/)
- [React Native Documentation](https://reactnative.dev/)

### プロジェクト内ドキュメント
- `CLAUDE.md` - 開発ガイド
- `README.md` - プロジェクト概要

---

**作成日**: 2025-10-10
**次回レビュー予定**: Phase 1完了時
