import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { query } = await request.json();
    
    if (!query) {
      return NextResponse.json({ error: 'クエリが必要です' }, { status: 400 });
    }

    // Unsplash APIキーの確認
    const unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY;
    
    if (!unsplashAccessKey) {
      // APIキーがない場合は、キュレーション済みの画像を返す
      console.log('Unsplash APIキーが設定されていません。デフォルト画像を返します。');
      const curatedImages = [
        "https://images.unsplash.com/photo-1664575602276-acd073f104c1?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1606857521015-7f9fcf423740?auto=format&fit=crop&w=800&q=80"
      ];
      
      return NextResponse.json({
        images: curatedImages.map((url, index) => ({
          id: `curated-${index}`,
          urls: { regular: url },
          alt_description: 'キュレーション済み画像',
          user: { name: 'Unsplash', links: { html: 'https://unsplash.com' } }
        }))
      });
    }

    // Unsplash APIで画像を検索
    const searchUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=6&orientation=landscape`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'Authorization': `Client-ID ${unsplashAccessKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      images: data.results.map(img => ({
        id: img.id,
        urls: { 
          regular: img.urls.regular + '&auto=format&fit=crop&w=800&q=80',
          small: img.urls.small
        },
        alt_description: img.alt_description || img.description || 'Image',
        user: {
          name: img.user.name,
          links: { html: img.user.links.html }
        }
      }))
    });

  } catch (error) {
    console.error('画像検索エラー:', error);
    return NextResponse.json({ error: '画像の検索に失敗しました' }, { status: 500 });
  }
}







