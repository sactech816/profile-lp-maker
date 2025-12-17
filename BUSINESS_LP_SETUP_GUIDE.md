# ビジネスLP・チラシ作成ツール セットアップガイド

## 概要

このプロジェクトは、プロフィールLPメーカーをベースに、ビジネスLP・チラシ作成ツールを別サービスとして実装したものです。

## 主な機能

### 1. ビジネスLP作成
- ドラッグ&ドロップでブロックを配置
- 12種類のブロックタイプ（Hero, Problem, Solution, FAQ, Pricing, Testimonialなど）
- PC+スマホ対応のレスポンシブデザイン
- AI自動生成機能

### 2. チラシ印刷機能
- A4サイズの印刷最適化レイアウト
- QRコード自動生成
- ブラウザの印刷機能でPDF保存可能
- アクセス: `/b/[slug]/flyer`

### 3. アナリティクス
- ページビュー数
- クリック数・クリック率
- 精読率（50%以上スクロール）
- 平均滞在時間

### 4. Pro機能（寄付・購入）
- HTMLダウンロード
- 埋め込みコード発行
- 価格: 500円〜100,000円（ユーザー設定）

## セットアップ手順

### 1. データベースセットアップ

Supabaseダッシュボードの **SQL Editor** で以下のSQLファイルを順番に実行してください：

#### 1.1 ビジネスプロジェクトテーブル
```bash
supabase_business_projects_setup.sql
```

#### 1.2 購入履歴テーブル
```bash
supabase_business_purchases_setup.sql
```

#### 1.3 アナリティクステーブル拡張
```bash
migrate_analytics_add_business_type.sql
```

### 2. 環境変数の確認

`.env.local` ファイルに以下の環境変数が設定されていることを確認：

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe（決済機能）
STRIPE_SECRET_KEY=sk_test_... または sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... または pk_live_...

# サイトURL
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# OpenAI（AI生成機能・オプション）
OPENAI_API_KEY=sk-...
```

### 3. 依存関係のインストール

```bash
npm install
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開く

## ルーティング構成

### プロフィールLP（既存）
- ダッシュボード: `/dashboard`
- エディタ: `/dashboard/editor/[slug]`
- 公開ページ: `/p/[slug]`

### ビジネスLP（新規）
- ダッシュボード: `/business/dashboard`
- エディタ: `/business/dashboard/editor/[slug]`
- 公開ページ: `/b/[slug]`
- チラシ印刷: `/b/[slug]/flyer`

## データベーステーブル

### business_projects
ビジネスLPのデータを保存

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | BIGSERIAL | 主キー |
| slug | TEXT | URLスラッグ（ユニーク） |
| nickname | TEXT | ニックネーム（オプション） |
| content | JSONB | ブロックデータ |
| settings | JSONB | 設定データ |
| user_id | UUID | ユーザーID |
| featured_on_top | BOOLEAN | トップページ掲載 |
| created_at | TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | 更新日時 |

### business_project_purchases
Pro機能の購入履歴

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | BIGSERIAL | 主キー |
| user_id | UUID | ユーザーID |
| project_id | BIGINT | プロジェクトID |
| stripe_session_id | TEXT | Stripe決済ID（ユニーク） |
| amount | INTEGER | 決済金額（円） |
| created_at | TIMESTAMP | 購入日時 |

### analytics（拡張）
アナリティクスデータ

- `content_type` フィールドに `'business'` を追加
- 既存: `'quiz'`, `'profile'`
- 新規: `'business'`

## API エンドポイント

### ビジネスLP用API

#### `/api/business-generate`
- AI自動生成
- POST: `{ occupation, target, strengths }`

#### `/api/business-delete`
- ビジネスLP削除
- POST: `{ id, anonymousId }`

#### `/api/business-checkout`
- Stripe決済開始
- POST: `{ projectId, projectName, userId, email, price }`

#### `/api/business-verify`
- 決済検証
- POST: `{ sessionId, projectId, userId }`

## チラシ印刷機能の使い方

### 1. チラシページにアクセス
```
/b/[slug]/flyer
```

### 2. 印刷またはPDF保存
- ブラウザの印刷機能を使用（Ctrl+P または Cmd+P）
- 「送信先」で「PDFに保存」を選択
- A4サイズで最適化されています

### 3. チラシの内容
- ヘッダー（ビジネス名、キャッチコピー）
- テキストセクション（最大3つ）
- 料金プラン（最大3つ）
- QRコード（LP URLへのリンク）
- 連絡先情報

## トラブルシューティング

### データベースエラー
**症状**: `relation "business_projects" does not exist`
**解決**: `supabase_business_projects_setup.sql` を実行

### 決済エラー
**症状**: Stripe決済が完了しない
**解決**: 
1. Stripe APIキーが正しく設定されているか確認
2. `NEXT_PUBLIC_SITE_URL` が正しく設定されているか確認

### アナリティクスエラー
**症状**: `violates check constraint "analytics_content_type_check"`
**解決**: `migrate_analytics_add_business_type.sql` を実行

## プロフィールLPとの違い

| 項目 | プロフィールLP | ビジネスLP |
|-----|-------------|-----------|
| 対象 | 個人向け | ビジネス向け |
| デザイン | スマホ特化 | PC+スマホ対応 |
| 用途 | SNSリンクまとめ | ビジネスLP・チラシ |
| レイアウト | 1カラム | 1〜2カラム |
| チラシ機能 | なし | あり |
| テーブル | `profiles` | `business_projects` |
| URL | `/p/[slug]` | `/b/[slug]` |

## 今後の拡張予定

- [ ] サーバーサイドPDF生成（Puppeteer）
- [ ] テンプレートの追加
- [ ] A/Bテスト機能
- [ ] 独自ドメイン設定
- [ ] チーム機能

## サポート

問題が発生した場合は、以下を確認してください：

1. 環境変数が正しく設定されているか
2. データベーステーブルが作成されているか
3. Supabase RLSポリシーが有効になっているか
4. ブラウザのコンソールにエラーが表示されていないか

---

最終更新日: 2024年12月16日

