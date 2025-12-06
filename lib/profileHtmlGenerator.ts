import { Block } from './types';

// YouTube URLから動画IDを抽出
function extractYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

// ブロックをHTMLに変換
function renderBlock(block: Block): string {
  switch (block.type) {
    case 'header':
      return `
        <header class="text-center space-y-4 pt-8 animate-fade-in">
          <div class="relative inline-block">
            <img 
              src="${block.data.avatar || '/placeholder-avatar.png'}" 
              alt="${block.data.name} プロフィール写真"
              class="w-32 h-32 md:w-36 md:h-36 rounded-full mx-auto shadow-xl border-4 border-white object-cover"
            />
          </div>
          <h1 class="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
            ${escapeHtml(block.data.name)}
          </h1>
          <p class="text-base md:text-lg text-white font-semibold px-4 drop-shadow-md">
            ${escapeHtml(block.data.title || '').replace(/\n/g, '<br>')}
          </p>
        </header>
      `;

    case 'text_card':
      const alignmentClass = block.data.align === 'center' ? 'text-center' : 'text-left';
      return `
        <section class="glass-card rounded-2xl p-6 shadow-lg animate-fade-in ${alignmentClass}">
          ${block.data.title ? `<h2 class="text-xl font-bold mb-4 accent-color">${escapeHtml(block.data.title)}</h2>` : ''}
          <div class="text-gray-700 leading-relaxed">
            ${escapeHtml(block.data.text || '').replace(/\n/g, '<br>')}
          </div>
        </section>
      `;

    case 'image':
      return `
        <section class="animate-fade-in">
          <div class="glass-card rounded-2xl p-4 shadow-lg">
            <img 
              src="${block.data.url}" 
              alt="${escapeHtml(block.data.caption || '画像')}" 
              class="w-full rounded-xl object-cover"
            />
            ${block.data.caption ? `<p class="text-sm text-gray-600 mt-2 text-center">${escapeHtml(block.data.caption)}</p>` : ''}
          </div>
        </section>
      `;

    case 'youtube':
      const videoId = extractYouTubeId(block.data.url);
      if (!videoId) {
        return `
          <section class="animate-fade-in">
            <div class="glass-card rounded-2xl p-6 shadow-lg text-center text-gray-600">
              <p>無効なYouTube URLです</p>
            </div>
          </section>
        `;
      }
      return `
        <section class="animate-fade-in">
          <div class="glass-card rounded-2xl p-4 shadow-lg">
            <div class="relative w-full" style="padding-bottom: 56.25%;">
              <iframe
                class="absolute top-0 left-0 w-full h-full rounded-xl"
                src="https://www.youtube.com/embed/${videoId}"
                title="YouTube video player"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              ></iframe>
            </div>
          </div>
        </section>
      `;

    case 'links':
      const linksHtml = block.data.links.map(link => {
        const isOrange = link.style?.includes('orange') || link.label?.includes('Kindle') || link.label?.includes('Amazon');
        const isLine = link.url?.includes('lin.ee') || link.label?.includes('LINE');
        const buttonClass = `link-button ${isOrange ? 'bg-orange-50 border-orange-200' : ''} ${isLine ? 'bg-[#06C755] hover:bg-[#05b34c] text-white' : ''}`;
        
        let iconHtml = '';
        if (link.label?.includes('note')) iconHtml = '<span class="mr-3 text-2xl">📓</span>';
        else if (link.label?.includes('X') || link.label?.includes('Twitter')) {
          iconHtml = '<svg class="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>';
        } else if (link.label?.includes('Facebook')) {
          iconHtml = '<svg class="w-6 h-6 mr-3 text-blue-600" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clip-rule="evenodd" /></svg>';
        } else if (link.label?.includes('ホームページ') || link.label?.includes('公式HP')) {
          iconHtml = '<span class="mr-3 text-2xl">🏢</span>';
        } else if (link.label?.includes('Kindle') || link.label?.includes('Amazon')) {
          iconHtml = '<span class="mr-3 text-2xl">📕</span>';
        }
        
        return `
          <a
            href="${escapeHtml(link.url)}"
            target="_blank"
            rel="noopener noreferrer"
            class="${buttonClass}"
          >
            ${iconHtml}
            <span class="flex-1 text-left ${isOrange ? 'font-bold text-orange-800' : ''}">
              ${escapeHtml(link.label)}
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ${isOrange ? 'text-orange-400' : 'text-gray-400'}" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
          </a>
        `;
      }).join('');
      
      return `
        <section class="space-y-4 animate-fade-in">
          <h3 class="text-center font-bold text-white drop-shadow-md mb-4">Follow Me & More Info</h3>
          ${linksHtml}
        </section>
      `;

    default:
      return '';
  }
}

function escapeHtml(text: string): string {
  const div = { innerHTML: '' } as any;
  div.textContent = text;
  return div.innerHTML || text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

export function generateProfileHTML(profile: { slug: string; content: Block[] }): string {
  const headerBlock = profile.content.find(b => b.type === 'header');
  const name = headerBlock?.type === 'header' ? headerBlock.data.name : 'プロフィール';
  const title = headerBlock?.type === 'header' ? headerBlock.data.title : 'プロフィールページ';
  
  const blocksHtml = profile.content.map((block, index) => {
    const delayClass = index > 0 ? `delay-${Math.min(index, 10)}` : '';
    return `
      <div class="${delayClass}">
        ${renderBlock(block)}
      </div>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(name)} - プロフィール</title>
    <meta name="description" content="${escapeHtml(title)}">
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Noto+Sans+JP:wght@400;700&display=swap" rel="stylesheet">
    
    <style>
        * { box-sizing: border-box; }
        body { margin: 0; font-family: 'Noto Sans JP', 'Inter', sans-serif; }
        
        .profile-page-wrapper {
            font-family: 'Noto Sans JP', 'Inter', sans-serif;
            background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
            background-size: 400% 400%;
            animation: gradient 15s ease infinite;
            min-height: 100vh;
        }
        
        @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        
        .glass-card {
            background-color: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.5);
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
        }
        
        .link-button {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem 1.5rem;
            border-radius: 9999px;
            font-weight: 600;
            text-align: center;
            background-color: rgba(255, 255, 255, 0.95);
            border: 1px solid rgba(255, 255, 255, 0.6);
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
            color: #333;
            text-decoration: none;
        }
        
        .link-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
            background-color: #ffffff;
        }
        
        .accent-color {
            color: #e73c7e;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
            animation: fadeIn 0.6s ease-out forwards;
        }
        
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
        .delay-3 { animation-delay: 0.3s; }
        .delay-4 { animation-delay: 0.4s; }
        .delay-5 { animation-delay: 0.5s; }
        .delay-6 { animation-delay: 0.6s; }
        .delay-7 { animation-delay: 0.7s; }
        .delay-8 { animation-delay: 0.8s; }
        .delay-9 { animation-delay: 0.9s; }
        .delay-10 { animation-delay: 1.0s; }
    </style>
</head>
<body>
    <div class="profile-page-wrapper min-h-screen">
        <div class="container mx-auto max-w-lg p-4 md:p-8">
            <div class="w-full space-y-6 md:space-y-8">
                ${blocksHtml}
                
                <footer class="text-center py-6 animate-fade-in delay-10">
                    <p class="text-sm text-white/90 drop-shadow-md">
                        &copy; ${new Date().getFullYear()} All Rights Reserved.
                    </p>
                </footer>
            </div>
        </div>
    </div>
</body>
</html>`;
}

