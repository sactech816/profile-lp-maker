-- お知らせ機能のデータベーステーブル作成
-- プロフィールLPメーカー用
-- Supabaseのダッシュボードで実行してください

-- 既存のテーブルを削除（必要な場合のみ）
-- DROP TABLE IF EXISTS announcements;

-- お知らせテーブルの作成
CREATE TABLE IF NOT EXISTS announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_type TEXT NOT NULL CHECK (service_type IN ('quiz', 'profile', 'all')) DEFAULT 'profile',
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  link_url TEXT,
  link_text TEXT,
  is_active BOOLEAN DEFAULT true,
  announcement_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスの作成（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_announcements_service_type ON announcements(service_type);
CREATE INDEX IF NOT EXISTS idx_announcements_is_active ON announcements(is_active);
CREATE INDEX IF NOT EXISTS idx_announcements_date ON announcements(announcement_date DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at DESC);

-- RLS（Row Level Security）ポリシーの設定
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- 全ユーザーが表示中のお知らせを閲覧可能
CREATE POLICY "Anyone can read active announcements"
  ON announcements
  FOR SELECT
  USING (is_active = true);

-- 管理者（info@kei-sho.co.jp）のみが全てのお知らせを閲覧可能
CREATE POLICY "Admin can read all announcements"
  ON announcements
  FOR SELECT
  USING (
    auth.jwt() ->> 'email' = 'info@kei-sho.co.jp'
  );

-- 管理者のみがお知らせを作成可能
CREATE POLICY "Admin can insert announcements"
  ON announcements
  FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'email' = 'info@kei-sho.co.jp'
  );

-- 管理者のみがお知らせを更新可能
CREATE POLICY "Admin can update announcements"
  ON announcements
  FOR UPDATE
  USING (
    auth.jwt() ->> 'email' = 'info@kei-sho.co.jp'
  );

-- 管理者のみがお知らせを削除可能
CREATE POLICY "Admin can delete announcements"
  ON announcements
  FOR DELETE
  USING (
    auth.jwt() ->> 'email' = 'info@kei-sho.co.jp'
  );

-- updated_at を自動更新するトリガー
CREATE OR REPLACE FUNCTION update_announcements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_announcements_updated_at
  BEFORE UPDATE ON announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_announcements_updated_at();

-- コメント追加
COMMENT ON TABLE announcements IS 'お知らせ管理テーブル（全サービス共通）';
COMMENT ON COLUMN announcements.id IS 'お知らせの一意識別子';
COMMENT ON COLUMN announcements.service_type IS 'サービス区分（quiz: 診断クイズ, profile: プロフィールLP, all: 全サービス共通）';
COMMENT ON COLUMN announcements.title IS 'お知らせのタイトル';
COMMENT ON COLUMN announcements.content IS 'お知らせの本文';
COMMENT ON COLUMN announcements.link_url IS '詳細リンクURL（任意）';
COMMENT ON COLUMN announcements.link_text IS 'リンクのテキスト（任意）';
COMMENT ON COLUMN announcements.is_active IS '表示状態（true: 表示中, false: 非表示）';
COMMENT ON COLUMN announcements.announcement_date IS 'お知らせの日付';
COMMENT ON COLUMN announcements.created_at IS '作成日時';
COMMENT ON COLUMN announcements.updated_at IS '最終更新日時';

-- サンプルデータの挿入（テスト用）
INSERT INTO announcements (service_type, title, content, link_url, link_text, is_active, announcement_date)
VALUES 
  (
    'profile',
    'プロフィールLPメーカーをリリースしました！',
    '誰でも簡単にプロフェッショナルなプロフィールページが作成できるようになりました。ぜひお試しください！',
    'https://example.com',
    '詳細はこちら',
    true,
    CURRENT_DATE
  ),
  (
    'profile',
    '新機能: アナリティクス機能を追加',
    'プロフィールページの閲覧数やクリック率を確認できるようになりました。',
    NULL,
    NULL,
    true,
    CURRENT_DATE - INTERVAL '1 day'
  ),
  (
    'quiz',
    '診断クイズメーカーをリリースしました！',
    'オリジナルの診断クイズを簡単に作成できるサービスです。',
    NULL,
    NULL,
    true,
    CURRENT_DATE
  ),
  (
    'all',
    '【重要】メンテナンスのお知らせ',
    '2025年12月15日 2:00-4:00にシステムメンテナンスを実施します。この間、全サービスがご利用いただけません。',
    NULL,
    NULL,
    true,
    CURRENT_DATE
  );



