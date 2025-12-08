# セットアップガイド

## データベースのセットアップ

### 1. featured_on_top カラムの追加

プロフィールをトップページに掲載するかどうかを制御するカラムを追加します。

**実行手順:**
1. Supabaseダッシュボードにログイン
2. **SQL Editor** に移動
3. `add_featured_on_top_column.sql` の内容をコピー&ペースト
4. **Run** をクリックして実行

**実行するSQL:**
```sql
-- profiles テーブルに featured_on_top カラムを追加
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS featured_on_top BOOLEAN DEFAULT true;

-- コメント追加
COMMENT ON COLUMN profiles.featured_on_top IS 'トップページに掲載するかどうか（デフォルト: true）';

-- 既存のレコードにデフォルト値を設定
UPDATE profiles 
SET featured_on_top = true 
WHERE featured_on_top IS NULL;
```

### 2. アナリティクステーブルの作成（既に実行済みの場合はスキップ）

**実行手順:**
1. Supabaseダッシュボードにログイン
2. **SQL Editor** に移動
3. `supabase_analytics_setup.sql` の内容をコピー&ペースト
4. **Run** をクリックして実行

## 機能の使い方

### トップページ掲載設定

1. プロフィールエディタで **設定** ボタンをクリック
2. **計測タグ設定** モーダルが開きます
3. 下部にある **□ トップページに掲載する** チェックボックスを確認
   - デフォルトでチェックが入っています
   - チェックを外すと、トップページに掲載されなくなります
4. **保存** ボタンをクリック

### 注意事項

- この設定は、新規作成時も編集時も変更可能です
- デフォルトでは「掲載する」にチェックが入っています
- チェックを外しても、プロフィールページ自体は公開され、URLでアクセス可能です

## トラブルシューティング

### エラー: "Could not find the 'featured_on_top' column of 'profiles' in the schema cache"

**原因:** データベースに `featured_on_top` カラムが存在しない

**解決方法:**
1. `add_featured_on_top_column.sql` を実行してください
2. 実行後、アプリケーションを再起動してください

### カラムを追加したのにエラーが出る

**解決方法:**
1. Supabaseダッシュボードで **Table Editor** を開く
2. `profiles` テーブルを確認
3. `featured_on_top` カラムが存在するか確認
4. 存在しない場合は、SQLを再度実行してください
5. 存在する場合は、ブラウザのキャッシュをクリアしてください

## 実装の詳細

### データベース構造

```sql
profiles テーブル
├── id (UUID, PRIMARY KEY)
├── slug (TEXT, UNIQUE)
├── content (JSONB)
├── settings (JSONB)
├── user_id (UUID, FOREIGN KEY)
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
└── featured_on_top (BOOLEAN, DEFAULT true) ← 新規追加
```

### コードの実装箇所

1. **型定義** (`lib/types.ts`)
   - `Profile` インターフェースに `featured_on_top?: boolean;` を追加

2. **Server Action** (`app/actions/profiles.ts`)
   - `saveProfile` 関数で `featured_on_top` を受け取り、データベースに保存

3. **UI** (`components/ProfileEditor.tsx`)
   - 設定モーダル内にチェックボックスを配置
   - デフォルト値は `true`
   - 保存時に `featuredOnTop` を `saveProfile` に渡す

### デフォルト動作

- 新規作成時: `featured_on_top = true` (掲載する)
- 既存データ: `featured_on_top = true` (掲載する)
- ユーザーが明示的にチェックを外した場合: `featured_on_top = false` (掲載しない)

