import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Metadata } from 'next';
import { Block, migrateOldContent } from '@/lib/types';
import { BlockRenderer } from '@/components/BlockRenderer';
import { ProfileViewTracker } from '@/components/ProfileViewTracker';
import { TrackingScripts } from '@/components/TrackingScripts';

interface Profile {
  id: string;
  slug: string;
  content: Block[];
  settings?: {
    gtmId?: string;
    fbPixelId?: string;
    lineTagId?: string;
  };
}

// プロフィールデータを取得
async function getProfile(slug: string): Promise<Profile | null> {
  if (!supabase) return null;
  
  // デモページの場合は2つ目のテンプレート（Kindle作家）を返す
  if (slug === 'demo-user') {
    const { templates } = await import('@/constants/templates');
    const randomTemplate = templates[1]; // 2つ目のテンプレート（kindle-author）を使用
    
    // テンプレートのブロックをコピーしてIDを再生成
    const { generateBlockId } = await import('@/lib/types');
    const demoBlocks = randomTemplate.blocks.map(block => ({
      ...block,
      id: generateBlockId()
    })).map(block => {
      if (block.type === 'faq') {
        return {
          ...block,
          data: {
            items: block.data.items.map((item: any) => ({
              ...item,
              id: generateBlockId()
            }))
          }
        };
      } else if (block.type === 'pricing') {
        return {
          ...block,
          data: {
            plans: block.data.plans.map((plan: any) => ({
              ...plan,
              id: generateBlockId()
            }))
          }
        };
      } else if (block.type === 'testimonial') {
        return {
          ...block,
          data: {
            items: block.data.items.map((item: any) => ({
              ...item,
              id: generateBlockId()
            }))
          }
        };
      }
      return block;
    });
    
    return {
      id: 'demo',
      slug: 'demo-user',
      content: demoBlocks,
      settings: {}
    } as Profile;
  }
  
  const { data, error } = await supabase
    .from('profiles')
    .select('id, slug, content, settings')
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
    <>
      <ProfileViewTracker profileId={profile.id} />
      <TrackingScripts settings={profile.settings} />
      <div className="container mx-auto max-w-lg p-4 md:p-8">
        <div className="w-full space-y-6 md:space-y-8">
          {migratedContent.map((block, index) => (
            <div key={block.id || index} className={index > 0 ? `delay-${Math.min(index, 10)}` : ''}>
              <BlockRenderer block={block} profileId={profile.id} />
            </div>
          ))}
        </div>
      </div>
      
      {/* コピーライトとリンク */}
      <footer className="text-center py-6 animate-fade-in delay-10">
        <p className="text-sm text-white/90 drop-shadow-md mb-2">
          &copy; {new Date().getFullYear()} Profile LP Maker. All rights reserved.
        </p>
        <a 
          href="https://lp.makers.tokyo/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-white/80 hover:text-white/100 drop-shadow-md transition-colors underline"
        >
          https://lp.makers.tokyo/
        </a>
      </footer>
    </>
  );
}

