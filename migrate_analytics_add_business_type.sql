-- アナリティクステーブルにビジネスLPのcontent_typeを追加
-- 既存: 'quiz', 'profile' → 追加: 'business'
-- Supabaseのダッシュボード > SQL Editor で実行してください

-- 1. 既存のCHECK制約を削除
ALTER TABLE analytics 
DROP CONSTRAINT IF EXISTS analytics_content_type_check;

-- 2. 新しいCHECK制約を追加（businessを含む）
ALTER TABLE analytics 
ADD CONSTRAINT analytics_content_type_check 
CHECK (content_type IN ('quiz', 'profile', 'business'));

-- 3. コメントを更新
COMMENT ON COLUMN analytics.content_type IS 'コンテンツタイプ: quiz(診断クイズ), profile(プロフィールLP), business(ビジネスLP)';

-- 4. 確認: テーブル構造を表示
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'analytics'
ORDER BY ordinal_position;

-- 5. 確認: content_typeの制約を表示
SELECT
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'analytics'::regclass
  AND conname LIKE '%content_type%';

-- 6. 確認: データのサンプルを表示
SELECT 
    content_type,
    event_type,
    COUNT(*) as count
FROM analytics
GROUP BY content_type, event_type
ORDER BY content_type, event_type;




