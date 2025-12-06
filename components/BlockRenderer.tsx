"use client";

import React from 'react';
import { Block } from '@/lib/types';

// YouTube URLから動画IDを抽出
function extractYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export function BlockRenderer({ block }: { block: Block }) {
  switch (block.type) {
    case 'header':
      return (
        <header className="text-center space-y-4 pt-8 animate-fade-in">
          <div className="relative inline-block">
            <img 
              src={block.data.avatar || '/placeholder-avatar.png'} 
              alt={`${block.data.name} プロフィール写真`}
              className="w-32 h-32 md:w-36 md:h-36 rounded-full mx-auto shadow-xl border-4 border-white object-cover"
            />
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

