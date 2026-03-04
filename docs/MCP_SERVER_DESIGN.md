# MCP Server Design For child-care-app

## 目的

`child-care-app` の業務データと運用フローを、`Codex` や `Claude Code` などの LLM クライアントから安全に扱えるようにする。

このリポジトリでは、まず `MCP` を「何でもできる管理口」ではなく、既存の業務APIやサービス層を薄く公開する共通インターフェースとして扱う。

## なぜ MCP か

- `Codex` は MCP サーバーに接続でき、CLI / IDE から同じツール群を使える
- `Claude Code` も MCP の `tools` `resources` `prompts` を扱える
- LLM ごとの専用実装を増やすより、MCP を 1 つ作って共通化した方が保守しやすい
- 人間の確認、権限分離、監査ログをサーバー側で統一しやすい

参考:
- OpenAI Codex MCP: <https://developers.openai.com/resources/docs-mcp>
- Claude Code MCP: <https://docs.anthropic.com/en/docs/claude-code/mcp>
- MCP specification: <https://modelcontextprotocol.io/specification>

## 方針

### 1. API を先に固める

先に業務APIを固め、その上に薄い MCP サーバーを載せる。

避けるもの:

- 生の SQL を叩くだけのツール
- 1 個で何でもできる巨大ツール
- LLM ごとに別の API 仕様

採るもの:

- 予約、施設、登録状況、通知確認のような業務単位の API
- 既存の Supabase Edge Functions やサービス層を再利用する薄いアダプタ

### 2. 最初は read-only 中心

最初のリリースは `read-only` を基本にする。

最初に出す価値が高いもの:

- 施設検索
- 予約一覧取得
- 登録状態の確認
- 運用ドキュメント参照
- システムヘルス確認

書き込み系は第2段階に回す。

### 3. 書き込みは明示的に絞る

書き込み系ツールを出す場合は、最低でも以下を入れる。

- 入力バリデーション
- 冪等性キー
- 監査ログ
- 実行者情報
- 人の承認

`予約を作る` `予約ステータスを変える` `認証コードを送る` のような業務操作は候補になるが、`任意 SQL 実行` は出さない。

## このアプリに合う構成

### 推奨構成

1. `Supabase` をデータソースにする
2. 既存の `Edge Functions` と `lib/*` の業務ロジックを整理する
3. `Node.js + TypeScript` で MCP サーバーを作る
4. 最初は `stdio` でローカル接続する
5. チーム共有が必要になったら `Streamable HTTP + OAuth` を検討する

### 技術選定

- Runtime: `Node.js 20+`
- Language: `TypeScript`
- SDK: `@modelcontextprotocol/sdk`
- Local transport: `stdio`
- Shared transport: `Streamable HTTP`

参考:
- MCP TypeScript SDK: <https://github.com/modelcontextprotocol/typescript-sdk>
- MCP transports / authorization: <https://modelcontextprotocol.io/specification/2025-03-26/basic/authorization>

## child-care-app 向けの最初のツール設計

### Phase 1: read-only

#### `system.health`

目的:
- Supabase 接続可否
- Edge Function 配備状況
- Resend 設定状態
- Google Maps の設定有無

返すもの:
- `status`
- `checks[]`
- `warnings[]`

#### `facilities.search`

用途:
- 都道府県、地区、種別、キーワードで施設検索

入力:
- `prefecture?`
- `district?`
- `type?`
- `keyword?`
- `limit?`

返すもの:
- 施設一覧
- 件数
- 地図中心候補

#### `facilities.get`

用途:
- 施設詳細を 1 件取得

入力:
- `facilityId`

返すもの:
- 基本情報
- 受入条件
- 予約に必要な補足情報

#### `reservations.list`

用途:
- 保護者または施設単位で予約一覧を取得

入力:
- `scope`: `parent` | `facility`
- `userId?`
- `facilityId?`
- `dateFrom?`
- `dateTo?`
- `status?`

返すもの:
- 予約一覧
- 件数
- ステータス集計

#### `reservations.get`

用途:
- 単一予約の詳細確認

入力:
- `reservationId`

返すもの:
- 予約詳細
- 保護者・児童情報
- ステータス遷移可能候補

#### `registration.status`

用途:
- メール認証、親登録、施設登録の進行状況確認

入力:
- `email?`
- `userId?`

返すもの:
- 認証コード送信済みか
- 認証済みか
- parent / facility レコード有無

#### `runbooks.list`

用途:
- 運用ドキュメントを列挙

返すもの:
- 利用可能な runbook 名と URI

### Phase 2: limited write

#### `reservations.create`

前提:
- 既存の予約作成ロジックを API 化できてから

用途:
- 指定した施設、児童、時間帯で予約作成

必須条件:
- 入力検証
- 重複予約チェック
- 明示確認

#### `reservations.update_status`

用途:
- `pending -> confirmed`
- `confirmed -> checked_in`
- `checked_in -> checked_out`

必須条件:
- 許可された遷移だけに限定
- 実行者ロール確認
- 監査ログ

#### `email_verification.send_test`

用途:
- 認証メール送信の疎通確認

必須条件:
- 本番一斉送信にならないよう対象を制限

## resources 設計

`tools` とは別に、変化頻度の低い参照情報は `resources` として出す。

最初の候補:

- `childcare://schema/summary`
- `childcare://facilities/catalog`
- `childcare://reservations/statuses`
- `childcare://docs/start-guide`
- `childcare://docs/google-maps-setup`
- `childcare://docs/resend-email-verification`
- `childcare://docs/implementation-status`

テンプレート化したいもの:

- `childcare://facilities/{facilityId}`
- `childcare://reservations/{reservationId}`
- `childcare://runbooks/{slug}`

`Claude Code` では resources を文脈として扱いやすく、`Codex` 側でも共通の静的参照面として役立つ。

参考:
- MCP resources: <https://modelcontextprotocol.io/specification/2025-03-26/server/resources>

## prompts 設計

`prompts` は、毎回同じ問い合わせを人が組み立てなくてよいようにする。

候補:

- `registration-triage`
  - 登録失敗時の切り分け
- `reservation-ops-summary`
  - 今日の予約運用サマリ
- `release-checklist`
  - デプロイ前確認
- `maps-debug`
  - Google Maps 設定不備の切り分け

参考:
- Claude Code prompts / slash commands: <https://docs.anthropic.com/en/docs/claude-code/mcp>

## 現行コードとの対応

既存の実装を土台にした方が早い。

まず再利用すべき箇所:

- 予約ロジック: `lib/reservationService.ts`
- メール認証呼び出し: `lib/emailVerification.ts`
- 親登録: `supabase/functions/register-parent`
- 認証コード送信: `supabase/functions/send-verification-code`
- 認証コード確認: `supabase/functions/verify-verification-code`
- 施設マスタ: `constants/facilities.ts`
- 地域マスタ: `constants/regions.ts`

つまり、MCP サーバーは最初から全部を書き直すのではなく、既存の業務単位を整理して公開する形がよい。

## 推奨ファイル構成

```text
mcp/
  childcare-server/
    package.json
    src/
      index.ts
      server.ts
      auth/
        context.ts
      tools/
        systemHealth.ts
        facilitiesSearch.ts
        facilitiesGet.ts
        reservationsList.ts
        reservationsGet.ts
        registrationStatus.ts
      resources/
        schemaSummary.ts
        docs.ts
        reservationStatuses.ts
      services/
        supabase.ts
        reservations.ts
        facilities.ts
        registration.ts
      prompts/
        registrationTriage.ts
        releaseChecklist.ts
```

## 認証と権限

### ローカル開発

- `stdio` 接続
- `.env` で内部トークンや service role を注入
- まずは開発者専用

### チーム共有

- `Streamable HTTP`
- `OAuth`
- 監査ログ
- read-only と write のサーバー分離

このリポジトリでも `supabase-childcare` と `supabase-childcare-write` を分けているように、MCP サーバーも読み取り系と更新系を分ける設計が安全。

参考:
- MCP authorization: <https://modelcontextprotocol.io/specification/2025-03-26/basic/authorization>
- MCP elicitation: <https://modelcontextprotocol.io/specification/2025-11-25/client/elicitation>

## セキュリティ方針

最低限これを守る。

- third-party MCP サーバーを安易に混ぜない
- 更新系ツールは read-only サーバーと分離する
- `service_role` を直接露出しない
- 個人情報は最小限だけ返す
- ツールごとに入力上限とタイムアウトを入れる
- `reservationId` など業務IDベースで扱い、生 SQL を禁止する

参考:
- Claude Code security notes for MCP: <https://docs.anthropic.com/en/docs/claude-code/mcp>

## 実装順

### Step 1

`read-only` サーバーを作る。

最低構成:

- `system.health`
- `facilities.search`
- `facilities.get`
- `reservations.list`
- `reservations.get`
- `registration.status`

### Step 2

`resources` を追加する。

最低構成:

- schema summary
- docs
- reservation statuses

### Step 3

書き込み系を 1 個だけ追加する。

最初の候補:

- `reservations.update_status`

`create` 系より事故が小さく、運用価値が高い。

### Step 4

必要なら `HTTP` 化してチーム共有する。

## このリポジトリで次にやるとよいこと

1. `lib/reservationService.ts` の read-only 部分を API として分離する
2. `system.health` 用に設定確認ロジックをまとめる
3. `mcp/childcare-server` を新規作成して `stdio` で立ち上げる
4. `Codex` からローカル接続して read-only ツールを試す
5. 問題なければ `Claude Code` 側にも同じサーバーをつなぐ

## 判断

このアプリでは、`API を色々作る` よりも、

`既存の業務ロジックを整理した小さな業務APIを作り、その上に read-only 中心の MCP サーバーを載せる`

のが一番筋が良い。

最初の勝ち筋は、`施設検索` `予約確認` `登録状況確認` `運用ドキュメント参照` の 4 系統である。
