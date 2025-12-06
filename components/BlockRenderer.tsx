"use client";

import React from 'react';
import { Block } from '@/lib/types';
import { saveAnalytics } from '@/app/actions/analytics';
import { saveLead } from '@/app/actions/leads';
import { ChevronDown as ChevronDownIcon, Star } from 'lucide-react';

// YouTube URLから動画IDを抽出
function extractYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export function BlockRenderer({ block, profileId }: { block: Block; profileId?: string }) {
  switch (block.type) {
    case 'header':
      return (
        <header className="text-center space-y-4 pt-8 animate-fade-in">
          <div className="relative inline-block">
            {block.data.avatar ? (
              <img 
                src={block.data.avatar} 
                alt={`${block.data.name} プロフィール写真`}
                className="w-32 h-32 md:w-36 md:h-36 rounded-full mx-auto shadow-xl border-4 border-white object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-avatar.png';
                }}
              />
            ) : (
              <div className="w-32 h-32 md:w-36 md:h-36 rounded-full mx-auto shadow-xl border-4 border-white bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                <span className="text-white font-bold text-2xl">
                  {block.data.name ? block.data.name.charAt(0) : '?'}
                </span>
              </div>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
            {block.data.name}
          </h1>
          <p 
            className="text-base md:text-lg text-white font-semibold px-4 drop-shadow-md"
            dangerouslySetInnerHTML={{ __html: (block.data.title || '').replace(/\n/g, '<br>') }}
          />
        </header>
      );

    case 'text_card':
      const alignmentClass = block.data.align === 'center' ? 'text-center' : 'text-left';
      return (
        <section className={`glass-card rounded-2xl p-6 shadow-lg animate-fade-in ${alignmentClass}`}>
          {block.data.title && (
            <h2 className="text-xl font-bold mb-4 accent-color">
              {block.data.title}
            </h2>
          )}
          <div 
            className="text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: (block.data.text || '').replace(/\n/g, '<br>') }}
          />
        </section>
      );

    case 'image':
      return (
        <section className="animate-fade-in">
          <div className="glass-card rounded-2xl p-4 shadow-lg">
            <img 
              src={block.data.url} 
              alt={block.data.caption || '画像'} 
              className="w-full rounded-xl object-cover"
            />
            {block.data.caption && (
              <p className="text-sm text-gray-600 mt-2 text-center">
                {block.data.caption}
              </p>
            )}
          </div>
        </section>
      );

    case 'youtube':
      const videoId = extractYouTubeId(block.data.url);
      if (!videoId) {
        return (
          <section className="animate-fade-in">
            <div className="glass-card rounded-2xl p-6 shadow-lg text-center text-gray-600">
              <p>無効なYouTube URLです</p>
            </div>
          </section>
        );
      }
      return (
        <section className="animate-fade-in">
          <div className="glass-card rounded-2xl p-4 shadow-lg">
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                className="absolute top-0 left-0 w-full h-full rounded-xl"
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </section>
      );

    case 'links':
      return (
        <section className="space-y-4 animate-fade-in">
          <h3 className="text-center font-bold text-white drop-shadow-md mb-4">Follow Me & More Info</h3>
          {block.data.links.map((link, index) => {
            const isLine = link.url?.includes('lin.ee') || link.label?.includes('LINE');
            
            // スタイルに基づいてクラスを決定
            let styleClass = 'bg-white/90 border-gray-200 text-gray-900';
            if (link.style === 'orange') {
              styleClass = 'bg-orange-500 hover:bg-orange-600 text-white border-orange-500';
            } else if (link.style === 'blue') {
              styleClass = 'bg-blue-500 hover:bg-blue-600 text-white border-blue-500';
            } else if (link.style === 'green') {
              styleClass = 'bg-green-500 hover:bg-green-600 text-white border-green-500';
            } else if (link.style === 'purple') {
              styleClass = 'bg-purple-500 hover:bg-purple-600 text-white border-purple-500';
            }
            
            const handleClick = async () => {
              if (profileId) {
                await saveAnalytics(profileId, 'click', { url: link.url });
              }
            };
            
            return (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleClick}
                className={`link-button ${styleClass} ${isLine ? 'bg-[#06C755] hover:bg-[#05b34c] text-white border-[#06C755]' : ''}`}
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

    case 'kindle':
      const asinMatch = block.data.asin?.match(/\/dp\/([A-Z0-9]{10})/);
      const asin = asinMatch ? asinMatch[1] : (block.data.asin?.length === 10 ? block.data.asin : '');
      const amazonUrl = asin ? `https://www.amazon.co.jp/dp/${asin}` : (block.data.asin || '');
      return (
        <section className="animate-fade-in">
          <div className="glass-card rounded-2xl p-6 shadow-2xl transform hover:scale-[1.02] transition-transform">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                {block.data.imageUrl ? (
                  <img 
                    src={block.data.imageUrl} 
                    alt={block.data.title}
                    className="w-full md:w-48 h-auto rounded-lg shadow-lg object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x300?text=Book+Cover';
                    }}
                  />
                ) : (
                  <div className="w-full md:w-48 h-64 bg-gray-200 rounded-lg shadow-lg flex items-center justify-center">
                    <span className="text-gray-400 text-sm">画像なし</span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{block.data.title}</h3>
                <p className="text-gray-700 mb-4 leading-relaxed">{block.data.description}</p>
                <a
                  href={amazonUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={async () => {
                    if (profileId) {
                      await saveAnalytics(profileId, 'click', { url: amazonUrl });
                    }
                  }}
                  className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-lg shadow-lg transition-all transform hover:scale-105 flex items-center gap-2"
                >
                  <span>📕</span>
                  Amazonで見る
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </section>
      );

    case 'lead_form':
      return <LeadFormBlock block={block} profileId={profileId} />;

    case 'line_card':
      return <LineCardBlock block={block} profileId={profileId} />;

    case 'faq':
      return <FAQBlock block={block} />;

    case 'pricing':
      return <PricingBlock block={block} />;

    case 'testimonial':
      return <TestimonialBlock block={block} />;

    default:
      return null;
  }
}

// FAQブロックコンポーネント
function FAQBlock({ block }: { block: Extract<Block, { type: 'faq' }> }) {
  const [openItems, setOpenItems] = React.useState<Set<string>>(new Set());

  const toggleItem = (itemId: string) => {
    setOpenItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  if (!block.data.items || block.data.items.length === 0) {
    return null;
  }

  return (
    <section className="animate-fade-in">
      <div className="glass-card rounded-2xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">よくある質問</h3>
        <div className="space-y-3">
          {block.data.items.map((item) => {
            const isOpen = openItems.has(item.id);
            return (
              <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleItem(item.id)}
                  className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between text-left"
                >
                  <span className="font-bold text-gray-900 pr-4">{item.question || '質問を入力してください'}</span>
                  <ChevronDownIcon 
                    className={`text-gray-500 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                    size={20}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 py-3 bg-white border-t border-gray-200">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {item.answer || '回答を入力してください'}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// 料金表ブロックコンポーネント
function PricingBlock({ block }: { block: Extract<Block, { type: 'pricing' }> }) {
  if (!block.data.plans || block.data.plans.length === 0) {
    return null;
  }

  return (
    <section className="animate-fade-in">
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-white drop-shadow-md text-center mb-6">料金プラン</h3>
        <div className="space-y-4">
          {block.data.plans.map((plan) => (
            <div
              key={plan.id}
              className={`glass-card rounded-2xl p-6 shadow-lg transition-all ${
                plan.isRecommended
                  ? 'ring-2 ring-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50'
                  : ''
              }`}
            >
              {plan.isRecommended && (
                <div className="flex justify-center mb-3">
                  <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Star size={12} fill="currentColor" />
                    おすすめ
                  </span>
                </div>
              )}
              <h4 className="text-xl font-bold text-gray-900 mb-2 text-center">{plan.title || 'プラン名'}</h4>
              <div className="text-center mb-4">
                <span className="text-3xl font-extrabold text-indigo-600">{plan.price || '¥0'}</span>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <span className="text-green-500 mt-1">✓</span>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
                {plan.features.length === 0 && (
                  <li className="text-sm text-gray-400 text-center py-2">特徴を追加してください</li>
                )}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// お客様の声ブロックコンポーネント
function TestimonialBlock({ block }: { block: Extract<Block, { type: 'testimonial' }> }) {
  if (!block.data.items || block.data.items.length === 0) {
    return null;
  }

  return (
    <section className="animate-fade-in">
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-white drop-shadow-md text-center mb-6">お客様の声</h3>
        <div className="space-y-4">
          {block.data.items.map((item) => (
            <div key={item.id} className="glass-card rounded-2xl p-6 shadow-lg w-full">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-xl shadow-md">
                      {item.name ? item.name.charAt(0) : '?'}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-1">{item.name || 'お名前'}</h4>
                  <p className="text-sm text-gray-600">{item.role || '肩書き'}</p>
                </div>
              </div>
              <div className="relative bg-white rounded-lg p-4 border-l-4 border-indigo-500">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {item.comment || 'コメントを入力してください'}
                </p>
                <div className="absolute -bottom-2 left-6 w-4 h-4 bg-white transform rotate-45 border-r border-b border-gray-200"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// LINE登録カードブロックコンポーネント
function LineCardBlock({ block, profileId }: { block: Extract<Block, { type: 'line_card' }>; profileId?: string }) {
  const handleClick = async () => {
    if (profileId) {
      await saveAnalytics(profileId, 'click', { url: block.data.url });
    }
    window.open(block.data.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="animate-fade-in">
      <div className="glass-card rounded-2xl p-6 shadow-lg bg-gradient-to-br from-[#06C755] to-[#05b34c]">
        <div className="text-center text-white">
          <div className="mb-4">
            <svg className="w-16 h-16 mx-auto" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.63.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766-.028 1.08l-.164.38c-.213.5-.577.694-1.111.477-.636-.255-1.726-.581-2.448-1.005-.193-.127-.232-.127-.538-.08-2.09.35-4.11.63-4.475.63-.63 0-1.095-.389-1.095-1.057 0-.66.465-1.045 1.095-1.045.365 0 2.385-.28 4.475-.63.306-.05.345-.047.538.08.722.424 1.812.75 2.448 1.005.534.217.898.023 1.111-.477l.164-.38c.107-.314.148-.779.028-1.08-.135-.332-.667-.508-1.058-.59C4.27 19.156 0 15.125 0 10.314z"/>
            </svg>
          </div>
          <h3 className="text-2xl font-bold mb-2">{block.data.title || 'LINE公式アカウント'}</h3>
          <p className="text-white/90 mb-6">{block.data.description || '最新情報をお届けします'}</p>
          <button
            onClick={handleClick}
            className="bg-white text-[#06C755] font-bold px-8 py-4 rounded-full shadow-lg hover:bg-gray-100 transition-all transform hover:scale-105"
          >
            {block.data.buttonText || '友だち追加'}
          </button>
        </div>
      </div>
    </section>
  );
}

// リード獲得フォームコンポーネント
function LeadFormBlock({ block, profileId }: { block: Extract<Block, { type: 'lead_form' }>; profileId?: string }) {
  const [email, setEmail] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !profileId) return;

    setIsSubmitting(true);
    try {
      const result = await saveLead(profileId, email);
      if (result.success) {
        setSubmitted(true);
        setEmail('');
      } else {
        alert('登録に失敗しました。もう一度お試しください。');
      }
    } catch (error) {
      alert('登録に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <section className="animate-fade-in">
        <div className="glass-card rounded-2xl p-6 shadow-lg text-center">
          <div className="text-4xl mb-4">✅</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">登録ありがとうございます！</h3>
          <p className="text-gray-600">メールアドレスを登録いただき、ありがとうございます。</p>
        </div>
      </section>
    );
  }

  return (
    <section className="animate-fade-in">
      <div className="glass-card rounded-2xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">{block.data.title}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="メールアドレスを入力"
            required
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-900 placeholder-gray-400"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '送信中...' : block.data.buttonText || '登録する'}
          </button>
        </form>
      </div>
    </section>
  );
}

