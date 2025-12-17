import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import type { Metadata } from 'next';
import { Block, migrateOldContent } from '@/lib/types';
import { FlyerRenderer } from '@/components/FlyerRenderer';

interface BusinessProject {
  id: string;
  slug: string;
  content: Block[];
  settings?: {
    theme?: {
      gradient?: string;
      backgroundImage?: string;
    };
  };
}

// ビジネスプロジェクトデータを取得
async function getBusinessProject(slug: string): Promise<BusinessProject | null> {
  // Server用Supabaseクライアントを作成
  const supabase = await createServerSupabaseClient();
  
  if (!supabase) return null;
  
  const { data, error } = await supabase
    .from('business_projects')
    .select('id, slug, content, settings')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;
  return data as BusinessProject;
}

// メタデータを生成
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getBusinessProject(slug);
  
  if (!project) {
    return {
      title: 'チラシ印刷',
      description: 'ビジネスLPのチラシ印刷ページ',
    };
  }
  
  const migratedContent = migrateOldContent(project.content);
  const headerBlock = migratedContent.find((b): b is Extract<Block, { type: 'header' }> => b.type === 'header');
  const name = headerBlock?.data.name || 'ビジネスLP';
  
  return {
    title: `${name} - チラシ印刷 | ビジネスLPメーカー`,
    description: `${name}のチラシ印刷ページ。印刷またはPDFで保存できます。`,
    robots: {
      index: false, // チラシページは検索エンジンにインデックスしない
      follow: false,
    },
  };
}

export default async function FlyerPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  const project = await getBusinessProject(slug);

  if (!project) {
    notFound();
  }

  // 後方互換性のため、マイグレーション
  const migratedContent = migrateOldContent(project.content);
  
  // プロジェクト名を取得
  const headerBlock = migratedContent.find((b): b is Extract<Block, { type: 'header' }> => b.type === 'header');
  const projectName = headerBlock?.data.name || '無題のビジネスLP';

  return (
    <>
      <FlyerRenderer 
        blocks={migratedContent}
        slug={slug}
        settings={project.settings}
      />
    </>
  );
}


