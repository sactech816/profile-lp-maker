-- profiles テーブルに featured_on_top カラムを追加
-- Supabaseのダッシュボード > SQL Editor で実行してください

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS featured_on_top BOOLEAN DEFAULT true;

-- コメント追加
COMMENT ON COLUMN profiles.featured_on_top IS 'トップページに掲載するかどうか（デフォルト: true）';

-- 既存のレコードにデフォルト値を設定
UPDATE profiles 
SET featured_on_top = true 
WHERE featured_on_top IS NULL;

