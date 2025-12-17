-- ビジネスプロジェクト（ビジネスLP）テーブルの作成
-- Supabaseのダッシュボード > SQL Editor で実行してください

-- 既存のテーブルを削除（注意：データが消えます）
DROP TABLE IF EXISTS business_projects CASCADE;

-- business_projectsテーブルの作成
CREATE TABLE business_projects (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  nickname TEXT UNIQUE,
  content JSONB NOT NULL DEFAULT '[]'::JSONB,
  settings JSONB DEFAULT '{}'::JSONB,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  featured_on_top BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスの作成（パフォーマンス向上）
CREATE INDEX idx_business_projects_slug ON business_projects(slug);
CREATE INDEX idx_business_projects_user_id ON business_projects(user_id);
CREATE INDEX idx_business_projects_created_at ON business_projects(created_at DESC);
CREATE INDEX idx_business_projects_nickname ON business_projects(nickname) WHERE nickname IS NOT NULL;
CREATE INDEX idx_business_projects_featured ON business_projects(featured_on_top) WHERE featured_on_top = true;

-- RLS（Row Level Security）ポリシーの設定
ALTER TABLE business_projects ENABLE ROW LEVEL SECURITY;

-- 全ユーザーが閲覧可能（公開ページ用）
CREATE POLICY "Anyone can view business projects"
  ON business_projects
  FOR SELECT
  USING (true);

-- 認証済みユーザーは作成可能
CREATE POLICY "Authenticated users can create business projects"
  ON business_projects
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- 作成者のみ更新可能
CREATE POLICY "Users can update their own business projects"
  ON business_projects
  FOR UPDATE
  USING (auth.uid() = user_id);

-- 作成者のみ削除可能
CREATE POLICY "Users can delete their own business projects"
  ON business_projects
  FOR DELETE
  USING (auth.uid() = user_id);

-- コメント追加
COMMENT ON TABLE business_projects IS 'ビジネスLP・チラシ作成ツールのプロジェクトデータ';
COMMENT ON COLUMN business_projects.slug IS 'URL用のスラッグ（一意）';
COMMENT ON COLUMN business_projects.nickname IS '会社を象徴する文字列（任意・一意）';
COMMENT ON COLUMN business_projects.content IS 'ブロックデータ（JSON配列）';
COMMENT ON COLUMN business_projects.settings IS '設定データ（テーマ、計測タグなど）';
COMMENT ON COLUMN business_projects.user_id IS '作成者のユーザーID';
COMMENT ON COLUMN business_projects.featured_on_top IS 'トップページに掲載するかどうか';
COMMENT ON COLUMN business_projects.created_at IS '作成日時';
COMMENT ON COLUMN business_projects.updated_at IS '更新日時';

-- 確認: テーブル構造を表示
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'business_projects'
ORDER BY ordinal_position;
