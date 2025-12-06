"use client";

import React, { useState, useEffect } from 'react';
import { Sparkles, Smartphone, Code, Share2, ArrowRight, CheckCircle, Eye, Wand2, BookOpen, Store, Briefcase } from 'lucide-react';
import { supabase } from '../lib/supabase';

const LandingPage = ({ user, setShowAuth, onNavigateToDashboard, onCreate }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const handleGetStarted = () => {
    if (user) {
      // ログイン済みならダッシュボードへ
      if (onNavigateToDashboard) {
        onNavigateToDashboard();
      }
    } else {
      // 未ログインでもエディタページに直接遷移
      if (onCreate) {
        onCreate();
      }
    }
  };

  return (
    <div className="profile-page-wrapper min-h-screen">
      <div className="container mx-auto max-w-6xl px-4 py-12 md:py-20">
        {/* ヒーローセクション */}
        <section className="text-center mb-20 md:mb-32 animate-fade-in">
          <div className="mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg mb-6 leading-tight">
              世界一美しいプロフィールを、<br className="md:hidden"/>3分で。
            </h1>
            <p className="text-lg md:text-xl text-white font-semibold px-4 drop-shadow-md mb-8 leading-relaxed">
              エンジニアでなくても、スマホだけで。<br className="md:hidden"/>
              あなたの魅力を伝える「集客導線」を作りましょう。
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleGetStarted}
              className="glass-card bg-white/95 hover:bg-white text-indigo-600 px-8 py-4 rounded-full font-bold text-lg shadow-xl transition-all transform hover:scale-105 flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              {user ? (
                <>
                  <Sparkles size={20}/>
                  ダッシュボードへ
                </>
              ) : (
                <>
                  <Sparkles size={20}/>
                  無料で始める
                </>
              )}
              <ArrowRight size={20}/>
            </button>
            
            <a
              href="/p/demo-user"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card bg-white/80 hover:bg-white/95 text-gray-700 px-8 py-4 rounded-full font-bold text-lg shadow-xl transition-all transform hover:scale-105 flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <Eye size={20}/>
              デモページを見る
            </a>
          </div>
        </section>

        {/* 特徴セクション */}
        <section className="mb-20 md:mb-32 animate-fade-in delay-2">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-12 drop-shadow-lg">
            こんなに簡単、こんなに美しい
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {/* 特徴1: ノーコード編集 */}
            <div className="glass-card rounded-2xl p-6 md:p-8 text-center shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Code className="text-indigo-600" size={32}/>
              </div>
              <h3 className="text-xl font-bold mb-3 accent-color">
                ノーコード編集
              </h3>
              <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                プログラミング知識は不要。直感的なエディタで、誰でも美しいプロフィールページを作成できます。
              </p>
            </div>

            {/* 特徴2: AIアシスタント */}
            <div className="glass-card rounded-2xl p-6 md:p-8 text-center shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wand2 className="text-purple-600" size={32}/>
              </div>
              <h3 className="text-xl font-bold mb-3 accent-color">
                AIアシスタント
              </h3>
              <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                AIがあなたの職業や強みから、魅力的なキャッチコピーや自己紹介文を自動生成します。
              </p>
            </div>

            {/* 特徴3: スマホ完全対応 */}
            <div className="glass-card rounded-2xl p-6 md:p-8 text-center shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="text-green-600" size={32}/>
              </div>
              <h3 className="text-xl font-bold mb-3 accent-color">
                スマホ完全対応
              </h3>
              <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                レスポンシブデザインで、スマートフォンでもPCでも、美しく表示されます。
              </p>
            </div>
          </div>
        </section>

        {/* 利用シーンセクション */}
        <section className="mb-20 md:mb-32 animate-fade-in delay-4">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-12 drop-shadow-lg">
            こんなシーンで活躍します
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {/* 利用シーン1: Kindle作家の集客に */}
            <div className="glass-card rounded-2xl p-6 md:p-8 text-center shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="text-orange-600" size={32}/>
              </div>
              <h3 className="text-xl font-bold mb-3 accent-color">
                Kindle作家の集客に
              </h3>
              <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                作品紹介や著者プロフィールをまとめて、読者をKindleストアへ誘導。SNSでの拡散にも最適です。
              </p>
            </div>

            {/* 利用シーン2: 店舗のリンク集に */}
            <div className="glass-card rounded-2xl p-6 md:p-8 text-center shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Store className="text-blue-600" size={32}/>
              </div>
              <h3 className="text-xl font-bold mb-3 accent-color">
                店舗のリンク集に
              </h3>
              <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                店舗情報やSNS、予約サイトへのリンクを1つのページに集約。QRコードで簡単にシェアできます。
              </p>
            </div>

            {/* 利用シーン3: フリーランスの名刺代わりに */}
            <div className="glass-card rounded-2xl p-6 md:p-8 text-center shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
              <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="text-pink-600" size={32}/>
              </div>
              <h3 className="text-xl font-bold mb-3 accent-color">
                フリーランスの名刺代わりに
              </h3>
              <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                ポートフォリオや実績、連絡先をまとめたプロフィールページ。デジタル名刺として活用できます。
              </p>
            </div>
          </div>
        </section>

        {/* CTAセクション */}
        <section className="mt-20 md:mt-32 text-center animate-fade-in delay-6">
          <div className="glass-card rounded-2xl p-8 md:p-12 shadow-xl max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900 drop-shadow-lg">
              {user ? 'プロフィールを作成しましょう' : '今すぐ無料で始める'}
            </h2>
            <p className="text-gray-800 mb-8 text-lg drop-shadow-md">
              {user 
                ? 'ダッシュボードから、新しいプロフィールページを作成できます。'
                : 'ログイン不要で、すぐにプロフィールページを作成できます。'
              }
            </p>
            <button
              onClick={handleGetStarted}
              className="bg-white hover:bg-gray-50 text-indigo-600 px-10 py-5 rounded-full font-bold text-xl shadow-xl transition-all transform hover:scale-105 flex items-center gap-3 mx-auto"
            >
              <Sparkles size={24}/>
              {user ? 'ダッシュボードへ' : '無料で作成する'}
              <ArrowRight size={24}/>
            </button>
          </div>
        </section>

        {/* フッター */}
        <footer className="mt-20 bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 animate-fade-in delay-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div className="col-span-1 md:col-span-2">
                <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                  <Sparkles className="text-pink-500"/> Profile LP Maker
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed mb-4">
                  世界一美しいプロフィールページを、<br/>
                  ノーコードで誰でも簡単に作成・公開できるプラットフォーム。
                </p>
              </div>
              <div>
                <h4 className="text-white font-bold mb-4 border-b border-gray-700 pb-2 inline-block">メニュー</h4>
                <ul className="space-y-2 text-sm">
                  <li><button onClick={() => onCreate && onCreate()} className="text-gray-300 hover:text-white transition-colors">無料で作成</button></li>
                  <li><button onClick={() => setShowAuth && setShowAuth(true)} className="text-gray-300 hover:text-white transition-colors">ログイン</button></li>
                  <li><button onClick={() => window.location.href = '?page=profile-howto'} className="text-gray-300 hover:text-white transition-colors">使い方</button></li>
                  <li><button onClick={() => window.location.href = '?page=profile-effective'} className="text-gray-300 hover:text-white transition-colors">効果的な利用方法</button></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-bold mb-4 border-b border-gray-700 pb-2 inline-block">サポート・規約</h4>
                <ul className="space-y-2 text-sm">
                  <li><button onClick={() => window.location.href = '?page=contact'} className="text-gray-300 hover:text-white transition-colors">お問い合わせ</button></li>
                  <li><button onClick={() => window.location.href = '?page=legal'} className="text-gray-300 hover:text-white transition-colors">特定商取引法に基づく表記</button></li>
                  <li><button onClick={() => window.location.href = '?page=privacy'} className="text-gray-300 hover:text-white transition-colors">プライバシーポリシー</button></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-700 pt-6 text-center">
              <p className="text-xs text-gray-400">
                &copy; {new Date().getFullYear()} プロフィールLPメーカー. All Rights Reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;

