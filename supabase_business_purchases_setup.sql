-- ビジネスプロジェクト購入履歴テーブルの作成
-- Supabaseのダッシュボード > SQL Editor で実行してください

-- business_project_purchasesテーブルの作成
CREATE TABLE IF NOT EXISTS business_project_purchases (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id BIGINT NOT NULL REFERENCES business_projects(id) ON DELETE CASCADE,
  stripe_session_id TEXT UNIQUE NOT NULL,
  amount INTEGER NOT NULL CHECK (amount >= 500 AND amount <= 100000),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスの作成（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_business_purchases_user_id ON business_project_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_business_purchases_project_id ON business_project_purchases(project_id);
CREATE INDEX IF NOT EXISTS idx_business_purchases_stripe_session ON business_project_purchases(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_business_purchases_created_at ON business_project_purchases(created_at DESC);

-- RLS（Row Level Security）ポリシーの設定
ALTER TABLE business_project_purchases ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分の購入履歴のみ閲覧可能
CREATE POLICY "Users can view their own purchases"
  ON business_project_purchases
  FOR SELECT
  USING (auth.uid() = user_id);

-- サービスロール（API）のみ挿入可能
-- ※アプリケーション側でサービスロールキーを使用して挿入
CREATE POLICY "Service role can insert purchases"
  ON business_project_purchases
  FOR INSERT
  WITH CHECK (true);

-- コメント追加
COMMENT ON TABLE business_project_purchases IS 'ビジネスプロジェクトのPro機能購入履歴';
COMMENT ON COLUMN business_project_purchases.user_id IS '購入者のユーザーID';
COMMENT ON COLUMN business_project_purchases.project_id IS '対象プロジェクトのID';
COMMENT ON COLUMN business_project_purchases.stripe_session_id IS 'Stripe決済セッションID（重複防止用）';
COMMENT ON COLUMN business_project_purchases.amount IS '決済金額（円）';
COMMENT ON COLUMN business_project_purchases.created_at IS '購入日時';

-- 確認: テーブル構造を表示
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'business_project_purchases'
ORDER BY ordinal_position;




