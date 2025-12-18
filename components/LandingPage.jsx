"use client";

import React, { useState, useEffect } from 'react';
import { Sparkles, Smartphone, Code, Share2, ArrowRight, CheckCircle, Eye, Wand2, BookOpen, Store, Briefcase, ExternalLink, Heart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Header from './Header';
import AnnouncementBanner from './AnnouncementBanner';

const LandingPage = ({ user, setShowAuth, onNavigateToDashboard, onCreate }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [createClickCount, setCreateClickCount] = useState(0);
  const [publicProfiles, setPublicProfiles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProfiles, setTotalProfiles] = useState(0);
  const profilesPerPage = 9;

  useEffect(() => {
    setIsLoading(false);
    // 公開されているプロフィールを取得
    fetchPublicProfiles();
  }, [currentPage]);

  const fetchPublicProfiles = async () => {
    if (!supabase) return;
    try {
      const from = (currentPage - 1) * profilesPerPage;
      const to = from + profilesPerPage - 1;
      
      // featured_on_topがtrueのプロフィールを取得
      let { data, error, count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .eq('featured_on_top', true)
        .order('updated_at', { ascending: false })
        .range(from, to);
      
      // featured_on_topカラムがない場合は、すべてのプロフィールを取得
      if (error && error.message?.includes('column')) {
        console.log('featured_on_topカラムがないため、すべてのプロフィールを取得します');
        const result = await supabase
          .from('profiles')
          .select('*', { count: 'exact' })
          .order('updated_at', { ascending: false })
          .range(from, to);
        data = result.data;
        error = result.error;
        count = result.count;
      }
      
      if (!error && data) {
        console.log('プロフィールを取得しました:', data.length, '件');
        setPublicProfiles(data);
        setTotalProfiles(count || 0);
      } else if (error) {
        console.error('プロフィール取得エラー:', error);
      }
    } catch (e) {
      console.error('プロフィール取得エラー:', e);
    }
  };

  // プロフィール名を取得
  const getProfileName = (profile) => {
    if (!profile.content || !Array.isArray(profile.content)) return '無題のプロフィール';
    const headerBlock = profile.content.find(b => b.type === 'header');
    return headerBlock?.data?.name || '無題のプロフィール';
  };

  // プロフィールの説明を取得
  const getProfileDescription = (profile) => {
    if (!profile.content || !Array.isArray(profile.content)) return '';
    const textBlock = profile.content.find(b => b.type === 'text' || b.type === 'text_card');
    const description = textBlock?.data?.text || '';
    // 最初の100文字まで表示
    return description.length > 100 ? description.substring(0, 100) + '...' : description;
  };

  // プロフィールのカテゴリーを取得
  const getProfileCategory = (profile) => {
    if (!profile.content || !Array.isArray(profile.content)) return null;
    const headerBlock = profile.content.find(b => b.type === 'header');
    return headerBlock?.data?.category || null;
  };

  // プロフィールのアバター画像を取得
  const getProfileAvatar = (profile) => {
    if (!profile.content || !Array.isArray(profile.content)) return null;
    const headerBlock = profile.content.find(b => b.type === 'header');
    return headerBlock?.data?.avatar || null;
  };

  // プロフィールのテーマ（背景画像またはグラデーション）を取得
  const getProfileTheme = (profile) => {
    const theme = profile.settings?.theme;
    if (theme?.backgroundImage) {
      return { type: 'image', value: theme.backgroundImage };
    }
    if (theme?.gradient) {
      return { type: 'gradient', value: theme.gradient };
    }
    return null;
  };

  // カテゴリーの表示名とスタイルを取得
  const getCategoryInfo = (category) => {
    const categories = {
      fortune: { label: '占い', color: 'bg-purple-100 text-purple-700' },
      business: { label: 'ビジネス', color: 'bg-blue-100 text-blue-700' },
      study: { label: '学習', color: 'bg-green-100 text-green-700' },
      other: { label: 'その他', color: 'bg-gray-100 text-gray-700' }
    };
    return categories[category] || categories.other;
  };

  const handleGetStarted = (templateId = null) => {
    if (user) {
      // ログイン済みならダッシュボードへ（テンプレートIDを渡す）
      if (onNavigateToDashboard) {
        onNavigateToDashboard();
      }
      // ダッシュボードに遷移後、テンプレートIDがあればエディタで使用
      if (onCreate && templateId) {
        onCreate(templateId);
      }
    } else {
      // 未ログインの場合
      setCreateClickCount(prev => prev + 1);
      
      // 3回以上クリックしたらログイン画面を表示
      if (createClickCount >= 2) {
        if (setShowAuth) {
          setShowAuth(true);
        }
        setCreateClickCount(0); // リセット
      } else {
        // それ以外はエディタページに直接遷移
        if (onCreate) {
          onCreate(templateId);
        }
      }
    }
  };

  const handleLogout = async () => {
    if (!supabase) return;
    try {
      await supabase.auth.signOut();
      alert('ログアウトしました');
      window.location.reload();
    } catch (e) {
      console.error('ログアウトエラー:', e);
      alert('ログアウトに失敗しました');
    }
  };

  const handleSetPage = (page) => {
    window.location.href = `?page=${page}`;
  };

  return (
    <div className="profile-page-wrapper min-h-screen">
      {/* SEO用の隠しテキスト（検索エンジン向け） */}
      <div className="sr-only">
        <h1>プロフィールLPメーカー - ずっと無料のSNSプロフィールリンクまとめ</h1>
        <p>まとめよう、活動のすべてを。プロフィールLPメーカーはSNSや作品投稿サイトの情報を集約して、公開プロフィールがサッとかんたんに作れるサービス。litlink、profu.link、POTOFUの代わりに使える無料プロフィールリンクまとめツール。インフルエンサー、クリエイター、アーティスト、ビジネスパーソンに最適。</p>
      </div>
      
      {/* お知らせバナー */}
      <AnnouncementBanner 
        serviceType="profile"
        onNavigateToAnnouncements={() => handleSetPage('announcements')}
      />
      
      {/* ヘッダーを追加 */}
      <Header 
        setPage={handleSetPage}
        user={user}
        onLogout={handleLogout}
        setShowAuth={setShowAuth}
      />
      
      <div className="container mx-auto max-w-6xl px-4 py-12 md:py-20">
        {/* ヒーローセクション */}
        <section className="text-center mb-20 md:mb-32 animate-fade-in">
          <div className="mb-8">
            <h2 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg mb-6 leading-tight">
              名刺・SNS・紹介に使える<br/>
              プロフィールLPを<br/>
              <span className="text-yellow-300">簡単に最短ルートで作成</span>
            </h2>
            <p className="text-lg md:text-xl text-white font-semibold px-4 drop-shadow-md mb-4 leading-relaxed">
              文章の型は用意済み。<br/>
              あなたは、自分に合わせて内容を書き換えるだけ。
            </p>
            <p className="text-base md:text-lg text-white/90 px-4 drop-shadow-md mb-8">
              「何を書けばいいかわからない」を解消し<br/>
              自分専用のLPをスムーズに公開できます。
            </p>
          </div>
          
          <div className="flex justify-center">
            <button
              onClick={handleGetStarted}
              className="glass-card bg-white/95 hover:bg-white text-indigo-600 px-8 py-4 rounded-full font-bold text-lg shadow-xl transition-all transform hover:scale-105 flex items-center gap-2"
            >
              <Sparkles size={20}/>
              新規作成
              <ArrowRight size={20}/>
            </button>
          </div>
        </section>

        {/* テンプレート選択セクション */}
        <section className="mb-20 md:mb-32 animate-fade-in delay-1">
          <h3 className="text-2xl md:text-3xl font-bold text-white text-center mb-4 drop-shadow-lg">
            テンプレートを選択してください
          </h3>
          <p className="text-center text-white/90 mb-12 text-sm md:text-base">
            用途に合わせて最適なテンプレートをお選びください
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {/* ビジネス用テンプレート */}
            <div className="glass-card rounded-2xl p-6 md:p-8 text-center shadow-lg hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer group" onClick={() => handleGetStarted('business-consultant')}>
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                <Briefcase className="text-blue-600" size={32}/>
              </div>
              <h4 className="text-xl font-bold mb-3 accent-color">
                ビジネス用
              </h4>
              <p className="text-gray-700 leading-relaxed text-sm md:text-base mb-6">
                営業・商談・名刺交換で使える<br/>
                プロフェッショナル向けテンプレート
              </p>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition-colors">
                このテンプレートで作成
              </button>
            </div>

            {/* 自己紹介用テンプレート */}
            <div className="glass-card rounded-2xl p-6 md:p-8 text-center shadow-lg hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer group" onClick={() => handleGetStarted('creator-portfolio')}>
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                <Heart className="text-green-600" size={32}/>
              </div>
              <h4 className="text-xl font-bold mb-3 accent-color">
                自己紹介用
              </h4>
              <p className="text-gray-700 leading-relaxed text-sm md:text-base mb-6">
                SNS・ブログ・コミュニティで使える<br/>
                カジュアルな自己紹介テンプレート
              </p>
              <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold transition-colors">
                このテンプレートで作成
              </button>
            </div>

            {/* 項目フルセットテンプレート */}
            <div className="glass-card rounded-2xl p-6 md:p-8 text-center shadow-lg hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer group" onClick={() => handleGetStarted('marketer-fullpackage')}>
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                <Sparkles className="text-purple-600" size={32}/>
              </div>
              <h4 className="text-xl font-bold mb-3 accent-color">
                項目フルセット
              </h4>
              <p className="text-gray-700 leading-relaxed text-sm md:text-base mb-6">
                全ての項目が含まれた<br/>
                充実したプロフィールテンプレート
              </p>
              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-bold transition-colors">
                このテンプレートで作成
              </button>
            </div>
          </div>
        </section>

        {/* 特徴セクション */}
        <section className="mb-20 md:mb-32 animate-fade-in delay-2">
          <h3 className="text-2xl md:text-3xl font-bold text-white text-center mb-4 drop-shadow-lg">
            ずっと無料で使える、プロフィールリンクまとめツール
          </h3>
          <p className="text-center text-white/90 mb-12 text-sm md:text-base">
            インフルエンサー、クリエイター、アーティスト、ビジネスパーソンに最適
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {/* 特徴1: ノーコード編集 */}
            <div className="glass-card rounded-2xl p-6 md:p-8 text-center shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Code className="text-indigo-600" size={32}/>
              </div>
              <h4 className="text-xl font-bold mb-3 accent-color">
                ノーコードで簡単作成
              </h4>
              <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                プログラミング知識は不要。直感的なエディタで、誰でもプロフィールページを作成できます。SNSリンクをまとめて、あなただけのページを3分で。
              </p>
            </div>

            {/* 特徴2: AIアシスタント */}
            <div className="glass-card rounded-2xl p-6 md:p-8 text-center shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wand2 className="text-purple-600" size={32}/>
              </div>
              <h4 className="text-xl font-bold mb-3 accent-color">
                AIアシスタント搭載
              </h4>
              <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                AIがあなたの職業や強みから、魅力的なキャッチコピーや自己紹介文を自動生成。プロフィールリンクの作成がさらに簡単に。
              </p>
            </div>

            {/* 特徴3: スマホ完全対応 */}
            <div className="glass-card rounded-2xl p-6 md:p-8 text-center shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="text-green-600" size={32}/>
              </div>
              <h4 className="text-xl font-bold mb-3 accent-color">
                スマホ完全対応
              </h4>
              <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                レスポンシブデザインで、スマートフォンでもPCでも、キレイに表示。SNSプロフィールリンクをどこからでも確認できます。
              </p>
            </div>
          </div>
        </section>

        {/* 利用シーンセクション */}
        <section className="mb-20 md:mb-32 animate-fade-in delay-4">
          <h3 className="text-2xl md:text-3xl font-bold text-white text-center mb-4 drop-shadow-lg">
            こんな方におすすめのプロフィールリンクまとめ
          </h3>
          <p className="text-center text-white/90 mb-12 text-sm md:text-base">
            クリエイター、インフルエンサー、ビジネスパーソンの活動をサポート
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {/* 利用シーン1: Kindle作家の集客に */}
            <div className="glass-card rounded-2xl p-6 md:p-8 text-center shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="text-orange-600" size={32}/>
              </div>
              <h4 className="text-xl font-bold mb-3 accent-color">
                クリエイター・作家
              </h4>
              <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                作品紹介や著者プロフィールをまとめて、読者やファンへ誘導。SNSリンクをまとめて、作品の拡散にも最適です。
              </p>
            </div>

            {/* 利用シーン2: 店舗のリンク集に */}
            <div className="glass-card rounded-2xl p-6 md:p-8 text-center shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Store className="text-blue-600" size={32}/>
              </div>
              <h4 className="text-xl font-bold mb-3 accent-color">
                店舗・ビジネス
              </h4>
              <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                店舗情報やSNS、予約サイトへのリンクを1つのページに集約。QRコードで簡単にシェア。プロフィールリンクで集客アップ。
              </p>
            </div>

            {/* 利用シーン3: フリーランスの名刺代わりに */}
            <div className="glass-card rounded-2xl p-6 md:p-8 text-center shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
              <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="text-pink-600" size={32}/>
              </div>
              <h4 className="text-xl font-bold mb-3 accent-color">
                フリーランス・個人事業主
              </h4>
              <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                ポートフォリオや実績、連絡先をまとめたプロフィールページ。デジタル名刺として、SNSプロフィールリンクを活用できます。
              </p>
            </div>
          </div>
        </section>

        {/* プロフィールLP一覧セクション */}
        <section className="mb-20 md:mb-32 animate-fade-in delay-5">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-4 drop-shadow-lg flex items-center justify-center gap-2">
            <Sparkles className="text-yellow-400" size={32}/>
            作成されたプロフィールLP一覧
          </h2>
          <p className="text-white text-center mb-12 drop-shadow-md">
            気になるプロフィールを確認してみましょう
          </p>
          
          {publicProfiles.length > 0 ? (
            <>
              <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                {publicProfiles.map((profile) => {
                const category = getProfileCategory(profile);
                const categoryInfo = getCategoryInfo(category);
                const profileName = getProfileName(profile);
                const description = getProfileDescription(profile);
                const theme = getProfileTheme(profile);
                
                // 背景スタイルを決定（テーマ > カテゴリー別グラデーション）
                const getBackgroundStyle = () => {
                  if (theme?.type === 'image') {
                    return {
                      backgroundImage: `url(${theme.value})`,
                      backgroundPosition: 'center',
                      backgroundSize: 'cover',
                      backgroundRepeat: 'no-repeat'
                    };
                  }
                  if (theme?.type === 'gradient') {
                    return {
                      background: theme.value,
                      backgroundSize: '400% 400%'
                    };
                  }
                  // フォールバック: カテゴリー別グラデーション
                  const gradientClasses = 
                    category === 'fortune' ? 'bg-gradient-to-br from-purple-400 to-pink-500' :
                    category === 'business' ? 'bg-gradient-to-br from-blue-400 to-indigo-500' :
                    category === 'study' ? 'bg-gradient-to-br from-green-400 to-teal-500' :
                    'bg-gradient-to-br from-gray-400 to-gray-500';
                  return { className: gradientClasses };
                };
                
                const backgroundStyle = getBackgroundStyle();
                
                return (
                  <a
                    key={profile.id}
                    href={`/p/${profile.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-card rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 cursor-pointer group"
                  >
                    {/* カードヘッダー（背景画像 or グラデーション背景） */}
                    <div 
                      className={`relative h-32 flex items-center justify-center ${backgroundStyle.className || ''}`}
                      style={backgroundStyle.className ? undefined : backgroundStyle}
                    >
                      <div className="absolute top-4 right-4 z-10">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${categoryInfo.color}`}>
                          {categoryInfo.label}
                        </span>
                      </div>
                      {!theme && (
                        <Sparkles className="text-white opacity-50" size={48}/>
                      )}
                    </div>
                    
                    {/* カードコンテンツ */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-bold text-gray-900 line-clamp-2 flex-1">
                          {profileName}
                        </h3>
                        <ExternalLink className="text-indigo-600 flex-shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" size={20}/>
                      </div>
                      
                      {description && (
                        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 mb-4">
                          {description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                          <Eye size={16}/>
                          プロフィールを見る
                        </div>
                        <ArrowRight className="text-indigo-600 group-hover:translate-x-1 transition-transform" size={20}/>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
            
            {/* ページネーション */}
            {totalProfiles > profilesPerPage && (
              <div className="mt-12 flex justify-center items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg font-bold transition-all ${
                    currentPage === 1
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'glass-card bg-white/90 hover:bg-white text-indigo-600 shadow-md hover:shadow-lg'
                  }`}
                >
                  前へ
                </button>
                
                <div className="flex gap-2">
                  {Array.from({ length: Math.ceil(totalProfiles / profilesPerPage) }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg font-bold transition-all ${
                        currentPage === page
                          ? 'bg-indigo-600 text-white shadow-lg'
                          : 'glass-card bg-white/90 hover:bg-white text-indigo-600 shadow-md hover:shadow-lg'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(Math.ceil(totalProfiles / profilesPerPage), prev + 1))}
                  disabled={currentPage === Math.ceil(totalProfiles / profilesPerPage)}
                  className={`px-4 py-2 rounded-lg font-bold transition-all ${
                    currentPage === Math.ceil(totalProfiles / profilesPerPage)
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'glass-card bg-white/90 hover:bg-white text-indigo-600 shadow-md hover:shadow-lg'
                  }`}
                >
                  次へ
                </button>
              </div>
            )}
          </>
          ) : (
            <div className="glass-card rounded-2xl p-12 text-center">
              <Sparkles className="mx-auto mb-4 text-indigo-300" size={48}/>
              <p className="text-gray-700 text-lg">
                まだ公開されているプロフィールがありません。<br/>
                あなたが最初のプロフィールを作成してみませんか？
              </p>
            </div>
          )}
        </section>

        {/* FAQセクション */}
        <section className="mb-20 md:mb-32 animate-fade-in delay-6">
          <h3 className="text-2xl md:text-3xl font-bold text-white text-center mb-12 drop-shadow-lg">
            よくある質問
          </h3>
          
          <div className="max-w-3xl mx-auto space-y-4">
            <details className="glass-card rounded-xl p-6 shadow-lg group">
              <summary className="font-bold text-lg text-gray-900 cursor-pointer list-none flex items-center justify-between">
                <span>プロフィールLPメーカーは無料で使えますか？</span>
                <span className="text-indigo-600 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-700 leading-relaxed">
                はい、ずっと無料でご利用いただけます。プロフィールリンクまとめツールとして、litlink、profu.link、POTOFUなどの代替サービスをお探しの方に最適です。
              </p>
            </details>
            
            <details className="glass-card rounded-xl p-6 shadow-lg group">
              <summary className="font-bold text-lg text-gray-900 cursor-pointer list-none flex items-center justify-between">
                <span>ログインしなくても使えますか？</span>
                <span className="text-indigo-600 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-700 leading-relaxed">
                はい、ログインなしでもプロフィールページを作成できます。ただし、ログインすると複数のプロフィールを管理したり、後から編集したりできるようになります。
              </p>
            </details>
            
            <details className="glass-card rounded-xl p-6 shadow-lg group">
              <summary className="font-bold text-lg text-gray-900 cursor-pointer list-none flex items-center justify-between">
                <span>どんな人におすすめですか？</span>
                <span className="text-indigo-600 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-700 leading-relaxed">
                インフルエンサー、クリエイター、アーティスト、ビジネスパーソン、フリーランス、店舗経営者など、SNSや作品投稿サイトのリンクをまとめたい方におすすめです。プロフィールリンクまとめツールとして、あなたの活動をサポートします。
              </p>
            </details>
            
            <details className="glass-card rounded-xl p-6 shadow-lg group">
              <summary className="font-bold text-lg text-gray-900 cursor-pointer list-none flex items-center justify-between">
                <span>他のリンクまとめツールとの違いは？</span>
                <span className="text-indigo-600 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-700 leading-relaxed">
                プロフィールLPメーカーは、ノーコードで簡単にプロフィールページを作成できる点は同じですが、AIアシスタント機能により、キャッチコピーや自己紹介文を自動生成できます。また、カスタマイズ性が高く、より自由なデザインが可能です。
              </p>
            </details>
            
            <details className="glass-card rounded-xl p-6 shadow-lg group">
              <summary className="font-bold text-lg text-gray-900 cursor-pointer list-none flex items-center justify-between">
                <span>スマホでも作成できますか？</span>
                <span className="text-indigo-600 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-700 leading-relaxed">
                はい、スマートフォンでも簡単にプロフィールページを作成・編集できます。レスポンシブデザインで、どのデバイスからでも快適にご利用いただけます。
              </p>
            </details>
          </div>
        </section>

        {/* CTAセクション */}
        <section className="mt-20 md:mt-32 text-center animate-fade-in delay-7">
          <div className="glass-card rounded-2xl p-8 md:p-12 shadow-xl max-w-3xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900 drop-shadow-lg">
              {user ? 'プロフィールを作成しましょう' : '今すぐ無料で始める'}
            </h3>
            <p className="text-gray-800 mb-8 text-lg drop-shadow-md">
              {user 
                ? 'ダッシュボードから、新しいプロフィールページを作成できます。'
                : 'ログイン不要で、すぐにプロフィールページを作成できます。SNSプロフィールリンクをまとめて、あなたの活動をアピールしましょう。'
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
                <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                  <Sparkles className="text-pink-500"/> プロフィールLPメーカー
                </h4>
                <p className="text-sm text-gray-300 leading-relaxed mb-4">
                  まとめよう、活動のすべてを。<br/>
                  SNSプロフィールリンクまとめツール。<br/>
                  ずっと無料で使える、litlink・profu.link・POTOFUの代替サービス。
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

