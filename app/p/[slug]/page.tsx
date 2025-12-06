import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Metadata } from 'next';
import { Block, migrateOldContent } from '@/lib/types';
import { BlockRenderer } from '@/components/BlockRenderer';

interface Profile {
  id: string;
  slug: string;
  content: Block[];
}

// プロフィールデータを取得
async function getProfile(slug: string): Promise<Profile | null> {
  if (!supabase) return null;
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;
  return data as Profile;
}

// メタデータを生成
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getProfile(slug);
  
  if (!profile) {
    return {
      title: 'プロフィールページ',
      description: 'プロフィールランディングページ',
    };
  }
  
  // 後方互換性のため、マイグレーション
  const migratedContent = migrateOldContent(profile.content);
  const headerBlock = migratedContent.find((b): b is Extract<Block, { type: 'header' }> => b.type === 'header');
  const name = headerBlock?.data.name || 'プロフィール';
  const description = headerBlock?.data.title || 'プロフィールランディングページ';
  
  return {
    title: `プロフィールページ - ${name}`,
    description,
  };
}


export default async function ProfilePage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  const profile = await getProfile(slug);

  if (!profile) {
    notFound();
  }

  // 後方互換性のため、マイグレーション
  const migratedContent = migrateOldContent(profile.content);

  return (
    <div className="container mx-auto max-w-lg p-4 md:p-8">
      <div className="w-full space-y-6 md:space-y-8">
        {migratedContent.map((block, index) => (
          <div key={block.id || index} className={index > 0 ? `delay-${Math.min(index, 10)}` : ''}>
            <BlockRenderer block={block} />
          </div>
        ))}
        
        {/* フッター */}
        <footer className="text-center py-6 animate-fade-in delay-10">
          <p className="text-sm text-white/90 drop-shadow-md">
            &copy; {new Date().getFullYear()} All Rights Reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}

