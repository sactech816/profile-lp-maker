# プロフィールLPメーカー - 総合仕様書

## 📋 目次
1. [プロジェクト概要](#プロジェクト概要)
2. [技術スタック](#技術スタック)
3. [システム構成](#システム構成)
4. [機能一覧](#機能一覧)
5. [データベース設計](#データベース設計)
6. [ブロックシステム](#ブロックシステム)
7. [決済システム](#決済システム)
8. [アナリティクス機能](#アナリティクス機能)
9. [セキュリティ](#セキュリティ)
10. [環境変数](#環境変数)

---

## プロジェクト概要

### サービス名
**プロフィールLPメーカー**

### コンセプト
ノーコードで美しいプロフィールLP（ランディングページ）を作成できるWebアプリケーション。
個人事業主、フリーランス、コンテンツクリエイター向けに、SNSのリンクまとめ以上の価値を提供する。

### ターゲットユーザー
- 個人事業主・フリーランス
- コーチ・コンサルタント
- Kindle作家・コンテンツクリエイター
- インフルエンサー・情報発信者
- 副業・起業家

### 主な価値提供
1. **簡単操作**: ドラッグ&ドロップで直感的にLP作成
2. **豊富なブロック**: 12種類のコンテンツブロックで多様な表現
3. **テンプレート**: 業種別のプロフェッショナルなテンプレート
4. **アナリティクス**: 詳細なアクセス解析とユーザー行動分析
5. **リード獲得**: メールアドレス収集機能
6. **決済連携**: Stripe決済でPro機能開放

---

## 技術スタック

### フロントエンド
- **フレームワーク**: Next.js 16.0.7 (App Router)
- **言語**: TypeScript 5.x
- **UIライブラリ**: React 19.2.1
- **スタイリング**: Tailwind CSS 4.x
- **アイコン**: Lucide React 0.555.0
- **グラフ**: Recharts 3.5.1
- **QRコード**: qrcode.react 4.2.0
- **エフェクト**: canvas-confetti 1.9.4

### バックエンド
- **ランタイム**: Node.js (Next.js API Routes)
- **データベース**: Supabase (PostgreSQL)
- **認証**: Supabase Auth
- **ストレージ**: Supabase Storage
- **決済**: Stripe 20.0.0
- **AI**: OpenAI API 6.10.0

### インフラ・デプロイ
- **ホスティング**: Vercel（推奨）
- **データベース**: Supabase Cloud
- **ストレージ**: Supabase Storage
- **CDN**: Vercel Edge Network

---

## システム構成

### ディレクトリ構造

```
profile-lp-maker/
├── app/                          # Next.js App Router
│   ├── actions/                  # Server Actions
│   │   ├── analytics.ts         # アナリティクス処理
│   │   ├── leads.ts             # リード管理
│   │   ├── profiles.ts          # プロフィール管理
│   │   └── users.ts             # ユーザー管理
│   ├── api/                      # API Routes
│   │   ├── analytics/           # アナリティクスAPI
│   │   ├── checkout-profile/    # プロフィール決済
│   │   ├── verify-profile/      # 決済検証
│   │   ├── upload-image/        # 画像アップロード
│   │   ├── generate-profile/    # AI生成
│   │   ├── export-users-csv/    # CSV出力
│   │   └── export-users-sheets/ # Googleスプレッドシート連携
│   ├── dashboard/                # ダッシュボード
│   │   ├── editor/
│   │   │   ├── [slug]/          # 編集ページ
│   │   │   └── new/             # 新規作成
│   │   └── page.tsx             # ダッシュボードトップ
│   ├── p/                        # 公開プロフィールページ
│   │   └── [slug]/
│   │       └── page.tsx
│   ├── layout.tsx                # ルートレイアウト
│   ├── page.jsx                  # トップページ
│   └── globals.css               # グローバルスタイル
├── components/                   # Reactコンポーネント
│   ├── ProfileEditor.tsx        # エディタ本体（2372行）
│   ├── ProfileDashboard.jsx     # ダッシュボード
│   ├── BlockRenderer.tsx        # ブロックレンダラー
│   ├── LandingPage.jsx          # トップページ
│   ├── AuthModal.jsx            # 認証モーダル
│   ├── Header.jsx               # ヘッダー
│   ├── Footer.jsx               # フッター
│   ├── ProfileViewTracker.tsx   # ビュートラッキング
│   ├── LinkClickTracker.tsx     # クリックトラッキング
│   └── TrackingScripts.tsx      # 計測タグ
├── lib/                          # ユーティリティ
│   ├── types.ts                 # TypeScript型定義
│   ├── supabase.js              # Supabaseクライアント
│   ├── utils.js                 # ユーティリティ関数
│   ├── profileHtmlGenerator.ts  # HTML生成
│   └── constants.js             # 定数
├── constants/
│   └── templates.ts             # テンプレート定義
├── public/                       # 静的ファイル
└── [設定ファイル群]
```

### データフロー

```
[ユーザー] 
    ↓
[Next.js Frontend (React)]
    ↓
[Server Actions / API Routes]
    ↓
[Supabase (PostgreSQL + Storage)]
    ↓
[外部サービス]
    - Stripe (決済)
    - OpenAI (AI生成)
    - Google Sheets (データ連携)
```

---

## 機能一覧

### 1. 認証機能
- **メール認証**: Supabase Authによるメール/パスワード認証
- **セッション管理**: 自動ログイン維持
- **パスワードリセット**: メール経由でのパスワード再設定
- **ログイン状態の監視**: リアルタイムでの認証状態変更検知

### 2. プロフィール作成・編集機能

#### エディタ機能
- **ドラッグ&ドロップ**: ブロックの並び替え
- **リアルタイムプレビュー**: 編集内容を即座に確認
- **レスポンシブ対応**: PC/タブレット/スマホで最適表示
- **自動保存**: 編集内容の自動保存（実装可能）
- **URL設定**: カスタムスラッグ（URL）の設定

#### ブロックシステム（12種類）
1. **ヘッダーブロック**: プロフィール画像、名前、キャッチコピー
2. **テキストカードブロック**: タイトル付きテキスト
3. **画像ブロック**: 画像とキャプション
4. **YouTubeブロック**: YouTube動画埋め込み
5. **リンクブロック**: SNSリンクボタン群
6. **Kindleブロック**: Kindle本の紹介カード
7. **リードフォームブロック**: メールアドレス収集
8. **LINE登録ブロック**: LINE公式アカウント誘導
9. **FAQブロック**: よくある質問
10. **料金表ブロック**: プラン・価格表示
11. **お客様の声ブロック**: 推薦文・レビュー
12. **クイズブロック**: 診断クイズ埋め込み（将来拡張）

#### テーマ・デザイン
- **グラデーション背景**: 複数のプリセットから選択
- **カスタム背景画像**: 独自画像のアップロード
- **カテゴリ別アイコン**: ビジネス、クリエイター、コーチなど

#### テンプレート機能
- **業種別テンプレート**: 
  - ビジネス・コンサルタント
  - Kindle作家・コンテンツ販売
  - メンタルコーチ・サロン
- **ワンクリック適用**: テンプレートを選んで即座に反映
- **カスタマイズ可能**: テンプレート適用後も自由に編集

#### AI自動生成機能
- **プロンプト入力**: 職業、ターゲット、強みを入力
- **自動ブロック生成**: OpenAI APIでコンテンツ生成
- **編集可能**: 生成後も自由に修正

### 3. 公開・共有機能
- **一意のURL**: `yoursite.com/p/[slug]`
- **QRコード生成**: プロフィールページへのQRコード
- **SNS共有**: Twitter、Facebook、LINE等への共有
- **埋め込みコード**: 外部サイトへの埋め込み（Pro機能）
- **HTMLダウンロード**: 静的HTMLファイルの出力（Pro機能）

### 4. ダッシュボード機能
- **プロフィール一覧**: 作成したプロフィールの管理
- **アナリティクス表示**: 
  - アクセス数（ページビュー）
  - クリック数
  - クリック率
  - 精読率（50%以上スクロール）
  - 平均滞在時間
- **リード管理**: 収集したメールアドレスの一覧
- **編集・削除**: プロフィールの編集・削除
- **複製機能**: 既存プロフィールの複製
- **トップページ掲載設定**: トップページへの掲載ON/OFF

### 5. アナリティクス機能

#### トラッキングイベント
- **view**: ページビュー
- **click**: リンククリック
- **scroll**: スクロール深度（25%, 50%, 75%, 100%）
- **time**: 滞在時間（30秒ごと）
- **read**: 精読判定（50%以上スクロール）

#### 計測指標
- **アクセス数**: ユニークビュー数
- **クリック数**: リンククリック総数
- **クリック率**: クリック数 ÷ アクセス数 × 100
- **精読率**: 50%以上スクロールした割合
- **平均滞在時間**: ページ滞在時間の平均（秒）

#### 外部計測タグ連携
- **Google Tag Manager**: GTM IDの設定
- **Facebook Pixel**: FB Pixel IDの設定
- **LINE Tag**: LINE Tag IDの設定

### 6. 決済機能（Stripe連携）

#### 決済フロー
1. ユーザーが「機能開放 / 寄付」ボタンをクリック
2. 金額入力（500円〜50,000円）
3. Stripe Checkout Sessionを作成
4. Stripeの決済ページにリダイレクト
5. カード情報入力・決済
6. 成功後、ダッシュボードに戻る
7. 決済検証・購入履歴記録
8. Pro機能（HTML・埋め込み）が開放

#### Pro機能
- **HTMLダウンロード**: 静的HTMLファイルの出力
- **埋め込みコード**: iframeコードの発行
- **広告非表示**: ブランディング削除（将来実装）

#### 価格設定
- **最低金額**: 500円
- **最高金額**: 50,000円
- **ユーザー設定**: 任意の金額を入力可能

### 7. リード獲得機能
- **メールアドレス収集**: リードフォームブロック
- **Supabaseに保存**: leadsテーブルに記録
- **CSV出力**: 管理者がCSVダウンロード可能
- **プライバシー対応**: 同意チェックボックス

### 8. 管理者機能
- **ユーザー一覧**: 全ユーザーの情報表示
- **CSV出力**: ユーザー情報のCSVダウンロード
- **Googleスプレッドシート連携**: 自動でスプレッドシートに送信
- **統計情報**: 
  - 総ユーザー数
  - プロフィール作成数
  - 購入数

---

## データベース設計

### テーブル一覧

#### 1. profiles テーブル
プロフィールLPのデータを保存

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | BIGSERIAL | 主キー |
| slug | TEXT | URLスラッグ（ユニーク） |
| content | JSONB | ブロックデータ（JSON配列） |
| settings | JSONB | 設定データ（計測タグなど） |
| user_id | UUID | ユーザーID（auth.users参照） |
| featured_on_top | BOOLEAN | トップページ掲載フラグ（デフォルト: true） |
| created_at | TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | 更新日時 |

**インデックス:**
- `slug` (UNIQUE)
- `user_id`

**RLSポリシー:**
- 誰でも閲覧可能
- 作成者のみ編集・削除可能

#### 2. analytics テーブル
アクセス解析データを保存

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | UUID | 主キー |
| profile_id | UUID | プロフィールID |
| event_type | TEXT | イベントタイプ（view/click/scroll/time/read） |
| event_data | JSONB | イベント詳細データ |
| content_type | TEXT | コンテンツタイプ（profile固定） |
| created_at | TIMESTAMP | 作成日時 |

**インデックス:**
- `profile_id`
- `event_type`
- `created_at DESC`

**RLSポリシー:**
- 誰でも閲覧・挿入可能

#### 3. leads テーブル
リード（メールアドレス）を保存

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | BIGSERIAL | 主キー |
| profile_id | BIGINT | プロフィールID |
| email | TEXT | メールアドレス |
| created_at | TIMESTAMP | 登録日時 |

**インデックス:**
- `profile_id`
- `email`

**RLSポリシー:**
- 誰でも挿入可能
- プロフィール作成者のみ閲覧可能

#### 4. profile_purchases テーブル
プロフィールのPro機能購入履歴

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | BIGSERIAL | 主キー |
| user_id | UUID | ユーザーID（auth.users参照） |
| profile_id | BIGINT | プロフィールID |
| stripe_session_id | TEXT | Stripe決済セッションID（ユニーク） |
| amount | INTEGER | 決済金額（円） |
| created_at | TIMESTAMP | 購入日時 |

**インデックス:**
- `user_id`
- `profile_id`
- `stripe_session_id` (UNIQUE)

**RLSポリシー:**
- ユーザーは自分の購入履歴のみ閲覧可能
- サービスロール（API）は挿入可能

---

## ブロックシステム

### ブロックの型定義（TypeScript）

```typescript
// 基本ブロック構造
type Block = {
  id: string;                    // 一意のID
  type: string;                  // ブロックタイプ
  data: Record<string, any>;     // ブロック固有のデータ
}

// 例: ヘッダーブロック
type HeaderBlock = {
  id: string;
  type: 'header';
  data: {
    avatar: string;              // プロフィール画像URL
    name: string;                // 名前
    title: string;               // キャッチコピー
    category?: string;           // カテゴリ
  }
}
```

### ブロックタイプ一覧

1. **header**: ヘッダー（プロフィール）
2. **text_card**: テキストカード
3. **image**: 画像
4. **youtube**: YouTube動画
5. **links**: リンクボタン群
6. **kindle**: Kindle本紹介
7. **lead_form**: リードフォーム
8. **line_card**: LINE登録カード
9. **faq**: FAQ（よくある質問）
10. **pricing**: 料金表
11. **testimonial**: お客様の声
12. **quiz**: クイズ埋め込み

### ブロックの追加・編集・削除

#### 追加
```javascript
const newBlock = {
  id: generateBlockId(),
  type: 'text_card',
  data: { title: '', text: '', align: 'center' }
};
setBlocks([...blocks, newBlock]);
```

#### 編集
```javascript
const updateBlock = (blockId, newData) => {
  setBlocks(blocks.map(b => 
    b.id === blockId ? { ...b, data: { ...b.data, ...newData } } : b
  ));
};
```

#### 削除
```javascript
const deleteBlock = (blockId) => {
  setBlocks(blocks.filter(b => b.id !== blockId));
};
```

#### 並び替え
```javascript
const moveBlock = (fromIndex, toIndex) => {
  const newBlocks = [...blocks];
  const [removed] = newBlocks.splice(fromIndex, 1);
  newBlocks.splice(toIndex, 0, removed);
  setBlocks(newBlocks);
};
```

---

## 決済システム

### Stripe連携フロー

#### 1. Checkout Session作成
**エンドポイント**: `/api/checkout-profile`

```javascript
// リクエスト
POST /api/checkout-profile
{
  "profileId": "123",
  "amount": 1000  // 円単位
}

// レスポンス
{
  "sessionId": "cs_test_xxxxx"
}
```

#### 2. 決済ページへリダイレクト
```javascript
const stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY);
await stripe.redirectToCheckout({ sessionId });
```

#### 3. 決済完了後のリダイレクト
```
成功時: /?payment=success&session_id={SESSION_ID}&profile_id={PROFILE_ID}&page=dashboard
キャンセル時: /?payment=cancel&page=dashboard
```

#### 4. 決済検証
**エンドポイント**: `/api/verify-profile`

```javascript
// リクエスト
POST /api/verify-profile
{
  "sessionId": "cs_test_xxxxx",
  "profileId": "123"
}

// レスポンス
{
  "success": true,
  "purchase": {
    "id": 1,
    "profile_id": 123,
    "amount": 1000,
    "created_at": "2024-12-09T..."
  }
}
```

#### 5. 購入履歴の記録
```sql
INSERT INTO profile_purchases (user_id, profile_id, stripe_session_id, amount)
VALUES ($1, $2, $3, $4)
ON CONFLICT (stripe_session_id) DO NOTHING;
```

### 重複決済の防止
- `stripe_session_id`にUNIQUE制約
- `ON CONFLICT DO NOTHING`で重複挿入を防止
- クライアント側でも検証済みフラグを管理

---

## アナリティクス機能

### イベントトラッキング

#### 1. ページビュー（view）
```javascript
await supabase.from('analytics').insert({
  profile_id: profileId,
  event_type: 'view',
  event_data: {},
  content_type: 'profile'
});
```

#### 2. リンククリック（click）
```javascript
await supabase.from('analytics').insert({
  profile_id: profileId,
  event_type: 'click',
  event_data: { url: 'https://example.com' },
  content_type: 'profile'
});
```

#### 3. スクロール深度（scroll）
```javascript
// 25%, 50%, 75%, 100%のマイルストーンで記録
await supabase.from('analytics').insert({
  profile_id: profileId,
  event_type: 'scroll',
  event_data: { scrollDepth: 50 },
  content_type: 'profile'
});
```

#### 4. 滞在時間（time）
```javascript
// 30秒ごとに記録
await supabase.from('analytics').insert({
  profile_id: profileId,
  event_type: 'time',
  event_data: { timeSpent: 30 },
  content_type: 'profile'
});
```

#### 5. 精読判定（read）
```javascript
// 50%以上スクロールで記録
await supabase.from('analytics').insert({
  profile_id: profileId,
  event_type: 'read',
  event_data: { readPercentage: 75 },
  content_type: 'profile'
});
```

### 集計ロジック

#### Server Action: `getAnalytics`
```typescript
export async function getAnalytics(profileId: string) {
  // ページビュー数
  const views = await supabase
    .from('analytics')
    .select('id', { count: 'exact' })
    .eq('profile_id', profileId)
    .eq('event_type', 'view');

  // クリック数
  const clicks = await supabase
    .from('analytics')
    .select('id', { count: 'exact' })
    .eq('profile_id', profileId)
    .eq('event_type', 'click');

  // クリック率
  const clickRate = views.count > 0 
    ? (clicks.count / views.count * 100).toFixed(1) 
    : '0.0';

  // 精読率
  const reads = await supabase
    .from('analytics')
    .select('id', { count: 'exact' })
    .eq('profile_id', profileId)
    .eq('event_type', 'read');

  const readRate = views.count > 0 
    ? (reads.count / views.count * 100).toFixed(1) 
    : '0.0';

  // 平均滞在時間
  const times = await supabase
    .from('analytics')
    .select('event_data')
    .eq('profile_id', profileId)
    .eq('event_type', 'time');

  const avgTimeSpent = times.data.length > 0
    ? Math.round(
        times.data.reduce((sum, t) => sum + (t.event_data?.timeSpent || 0), 0) 
        / times.data.length
      )
    : 0;

  return {
    views: views.count || 0,
    clicks: clicks.count || 0,
    clickRate,
    readRate,
    avgTimeSpent
  };
}
```

---

## セキュリティ

### Row Level Security (RLS)

#### profiles テーブル
```sql
-- 誰でも閲覧可能
CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT USING (true);

-- 認証済みユーザーは作成可能
CREATE POLICY "Authenticated users can create profiles"
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- 作成者のみ更新可能
CREATE POLICY "Users can update their own profiles"
  ON profiles FOR UPDATE 
  USING (auth.uid() = user_id);

-- 作成者のみ削除可能
CREATE POLICY "Users can delete their own profiles"
  ON profiles FOR DELETE 
  USING (auth.uid() = user_id);
```

#### analytics テーブル
```sql
-- 誰でも閲覧・挿入可能（匿名トラッキングのため）
CREATE POLICY "Anyone can read analytics"
  ON analytics FOR SELECT USING (true);

CREATE POLICY "Anyone can insert analytics"
  ON analytics FOR INSERT WITH CHECK (true);
```

#### leads テーブル
```sql
-- 誰でも挿入可能（リード登録のため）
CREATE POLICY "Anyone can insert leads"
  ON leads FOR INSERT WITH CHECK (true);

-- プロフィール作成者のみ閲覧可能
CREATE POLICY "Profile owners can view their leads"
  ON leads FOR SELECT 
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );
```

#### profile_purchases テーブル
```sql
-- ユーザーは自分の購入履歴のみ閲覧可能
CREATE POLICY "Users can view their own purchases"
  ON profile_purchases FOR SELECT 
  USING (auth.uid() = user_id);

-- サービスロール（API）のみ挿入可能
CREATE POLICY "Service role can insert purchases"
  ON profile_purchases FOR INSERT 
  WITH CHECK (true);
```

### 画像アップロードセキュリティ
- **サーバーサイド処理**: `/api/upload-image`経由でアップロード
- **ファイルサイズ制限**: 最大10MB（設定可能）
- **ファイル形式制限**: JPEG, PNG, GIF, WebP
- **ファイル名のサニタイズ**: ランダム生成で衝突回避
- **フォルダ分離**: ユーザーIDごとにフォルダ作成

---

## 環境変数

### 必須環境変数

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Stripe（決済機能を使用する場合）
STRIPE_SECRET_KEY=sk_test_... または sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... または pk_live_...

# サイトURL（決済のリダイレクト先）
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### オプション環境変数

```env
# Googleスプレッドシート連携（管理者機能）
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec

# OpenAI API（AI生成機能）
OPENAI_API_KEY=sk-...
```

### 環境変数の取得方法

#### Supabase
1. Supabaseダッシュボード（https://app.supabase.com）にログイン
2. プロジェクトを選択
3. **Settings** → **API** に移動
4. **Project URL** と **anon public** キーをコピー
5. **service_role** キーもコピー（管理者権限が必要な処理用）

#### Stripe
1. Stripeダッシュボード（https://dashboard.stripe.com）にログイン
2. **Developers** → **API keys** に移動
3. **Publishable key** と **Secret key** をコピー
4. テスト環境では `pk_test_...` と `sk_test_...` を使用
5. 本番環境では `pk_live_...` と `sk_live_...` を使用

---

## セットアップ手順

### 1. リポジトリのクローン
```bash
git clone <repository-url>
cd profile-lp-maker
```

### 2. 依存関係のインストール
```bash
npm install
```

### 3. 環境変数の設定
`.env.local` ファイルを作成し、上記の環境変数を設定

### 4. Supabaseデータベースのセットアップ
以下のSQLファイルをSupabaseダッシュボードの **SQL Editor** で実行:

1. `supabase_analytics_setup.sql` - アナリティクステーブル
2. `add_featured_on_top_column.sql` - featured_on_topカラム追加
3. `supabase_profile_purchases_setup.sql` - 購入履歴テーブル

### 5. 開発サーバーの起動
```bash
npm run dev
```

ブラウザで http://localhost:3000 を開く

### 6. ビルド（本番環境）
```bash
npm run build
npm start
```

---

## デプロイ

### Vercelへのデプロイ（推奨）

1. **Vercelアカウント作成**: https://vercel.com/signup
2. **GitHubリポジトリと連携**
3. **環境変数の設定**: Vercelダッシュボードで環境変数を設定
4. **デプロイ**: `git push`で自動デプロイ

### 環境変数の設定（Vercel）
1. Vercelダッシュボードでプロジェクトを選択
2. **Settings** → **Environment Variables** に移動
3. 上記の環境変数を追加
4. **Production**, **Preview**, **Development** の各環境に設定

---

## トラブルシューティング

### よくある問題と解決方法

#### 1. アナリティクスが記録されない
- **原因**: `analytics`テーブルが存在しない
- **解決**: `supabase_analytics_setup.sql`を実行

#### 2. 画像アップロードが失敗する
- **原因**: Supabase Storageのバケットが存在しない
- **解決**: Supabaseダッシュボードで`profile-images`バケットを作成

#### 3. 決済が完了しない
- **原因**: Stripe APIキーが正しく設定されていない
- **解決**: `.env.local`のStripe環境変数を確認

#### 4. ログインできない
- **原因**: Supabase Authが有効化されていない
- **解決**: Supabaseダッシュボードで **Authentication** を確認

---

## 今後の拡張機能

### Phase 1（短期）
- [ ] プロフィールの複製機能
- [ ] ブロックのコピー&ペースト
- [ ] テンプレートの追加（10種類以上）
- [ ] ダークモード対応

### Phase 2（中期）
- [ ] 有料プラン（月額サブスクリプション）
- [ ] 独自ドメイン設定
- [ ] A/Bテスト機能
- [ ] 高度なアクセス解析（Google Analytics連携）

### Phase 3（長期）
- [ ] API提供
- [ ] Webhook連携
- [ ] チーム機能（複数人での管理）
- [ ] ホワイトラベル（ブランディング削除）

---

## ライセンス
プライベートプロジェクト（ライセンス未定）

## 作成者
AI Assistant

## 最終更新日
2024年12月9日

