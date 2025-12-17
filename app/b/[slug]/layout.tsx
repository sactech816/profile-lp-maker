import { Inter, Noto_Sans_JP } from 'next/font/google';
import '../../globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-inter',
});

const notoSansJP = Noto_Sans_JP({ 
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-noto-sans-jp',
});

export default async function BusinessLPLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { createServerSupabaseClient } = await import('@/lib/supabase-server');
  
  let theme: { gradient?: string; backgroundImage?: string } = {};
  
  const supabase = await createServerSupabaseClient();
  
  if (supabase) {
    // business_projectsテーブルから取得
    const { data } = await supabase
      .from('business_projects')
      .select('settings')
      .eq('slug', slug)
      .single();
    
    // settingsからthemeを取得
    if (data?.settings?.theme) {
      theme = data.settings.theme;
    }
    
    // 後方互換性: 古いデータでthemeが直接カラムにある場合（念のため）
    if (!theme && (data as any)?.theme) {
      theme = (data as any).theme;
    }
  }
  
  const backgroundStyle = theme.backgroundImage
    ? {
        background: `url(${theme.backgroundImage}) center/cover no-repeat`,
        backgroundSize: 'cover',
        animation: 'none' as const
      }
    : {
        background: theme.gradient || 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)',
        backgroundSize: '400% 400%',
        animation: 'gradient 15s ease infinite' as const
      };
  
  return (
    <div 
      className={`${inter.variable} ${notoSansJP.variable} text-gray-800 antialiased business-lp-wrapper`}
      style={backgroundStyle}
    >
      {children}
    </div>
  );
}

