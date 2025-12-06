import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Metadata } from 'next';

// データ構造の型定義
type ProfileBlock = 
  | { type: 'header'; data: { avatarUrl: string; name: string; tagline: string } }
  | { type: 'glass_card_text'; data: { title: string; text: string; alignment: 'left' | 'center' } }
  | { type: 'link_list'; data: { links: { label: string; url: string; style: string }[] } };

interface Profile {
  id: string;
  slug: string;
  content: ProfileBlock[];
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
  
  const headerBlock = profile.content.find((b): b is Extract<ProfileBlock, { type: 'header' }> => b.type === 'header');
  const name = headerBlock?.data.name || 'プロフィール';
  const description = headerBlock?.data.tagline || 'プロフィールランディングページ';
  
  return {
    title: `プロフィールページ - ${name}`,
    description,
  };
}

// ブロックをレンダリングするコンポーネント
function BlockRenderer({ block }: { block: ProfileBlock }) {
  switch (block.type) {
    case 'header':
      return (
        <header className="text-center space-y-4 pt-8 animate-fade-in">
          <div className="relative inline-block">
            <img 
              src={block.data.avatarUrl || '/placeholder-avatar.png'} 
              alt={`${block.data.name} プロフィール写真`}
              className="w-32 h-32 md:w-36 md:h-36 rounded-full mx-auto shadow-xl border-4 border-white object-cover"
            />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
            {block.data.name}
          </h1>
          <p 
            className="text-base md:text-lg text-white font-semibold px-4 drop-shadow-md"
            dangerouslySetInnerHTML={{ __html: block.data.tagline.replace(/\n/g, '<br>') }}
          />
        </header>
      );

    case 'glass_card_text':
      const alignmentClass = block.data.alignment === 'center' ? 'text-center' : 'text-left';
      return (
        <section className={`glass-card rounded-2xl p-6 shadow-lg animate-fade-in ${alignmentClass}`}>
          {block.data.title && (
            <h2 className="text-xl font-bold mb-4 accent-color">
              {block.data.title}
            </h2>
          )}
          <div 
            className="text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: block.data.text.replace(/\n/g, '<br>') }}
          />
        </section>
      );

    case 'link_list':
      return (
        <section className="space-y-4 animate-fade-in">
          <h3 className="text-center font-bold text-white drop-shadow-md mb-4">Follow Me & More Info</h3>
          {block.data.links.map((link, index) => {
            const isOrange = link.style?.includes('orange') || link.label?.includes('Kindle') || link.label?.includes('Amazon');
            const isLine = link.url?.includes('lin.ee') || link.label?.includes('LINE');
            
            return (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`link-button ${isOrange ? 'bg-orange-50 border-orange-200' : ''} ${isLine ? 'bg-[#06C755] hover:bg-[#05b34c] text-white' : ''}`}
              >
                {link.label?.includes('note') && <span className="mr-3 text-2xl">📓</span>}
                {link.label?.includes('X') || link.label?.includes('Twitter') ? (
                  <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                  </svg>
                ) : null}
                {link.label?.includes('Facebook') ? (
                  <svg className="w-6 h-6 mr-3 text-blue-600" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                ) : null}
                {link.label?.includes('ホームページ') || link.label?.includes('公式HP') ? (
                  <span className="mr-3 text-2xl">🏢</span>
                ) : null}
                {link.label?.includes('Kindle') || link.label?.includes('Amazon') ? (
                  <span className="mr-3 text-2xl">📕</span>
                ) : null}
                <span className={`flex-1 text-left ${isOrange ? 'font-bold text-orange-800' : ''}`}>
                  {link.label}
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isOrange ? 'text-orange-400' : 'text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </a>
            );
          })}
        </section>
      );

    default:
      return null;
  }
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

  return (
    <div className="container mx-auto max-w-lg p-4 md:p-8">
      <div className="w-full space-y-6 md:space-y-8">
        {profile.content.map((block, index) => (
          <div key={index} className={index > 0 ? `delay-${Math.min(index, 10)}` : ''}>
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

