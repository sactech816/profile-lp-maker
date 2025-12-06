import React, { useState, useEffect } from 'react';
import { 
    Search, Zap, TrendingUp, MessageCircle, 
    Sparkles, ArrowRight, Play, CheckCircle,
    ChevronLeft, ChevronRight, Heart
} from 'lucide-react';
import Header from './Header'; 
import { supabase } from '../lib/supabase';

const Portal = ({ quizzes, isLoading, user, setShowAuth, onLogout, onPlay, onCreate, setPage, isAdmin }) => {
    
    useEffect(() => { 
        document.title = "診断クイズメーカー | 無料で診断・性格テスト・心理テストを作成・公開"; 
        window.scrollTo(0, 0);
    }, []);
    
    // ★追加: ローカルで表示・更新するためのステート
    const [localQuizzes, setLocalQuizzes] = useState([]);
    
    const [filter, setFilter] = useState('All');
    const [sortOrder, setSortOrder] = useState('newest');
    const [rankingSort, setRankingSort] = useState('views'); // 'views' or 'trending'
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 9;

    // ★追加: 親(page.jsx)から新しいデータが来たら、ローカルデータを更新
    useEffect(() => {
        setLocalQuizzes(quizzes || []);
    }, [quizzes]);

    // ★修正: フィルタリング対象を quizzes ではなく localQuizzes に変更
    const filteredQuizzes = filter === 'All' ? localQuizzes : localQuizzes.filter(q => q.category === filter);

    const sortedQuizzes = [...filteredQuizzes].sort((a, b) => {
        if (sortOrder === 'popular') {
            return (b.views_count || 0) - (a.views_count || 0);
        }
        return new Date(b.created_at) - new Date(a.created_at);
    });

    const totalPages = Math.ceil(sortedQuizzes.length / ITEMS_PER_PAGE);
    const displayQuizzes = sortedQuizzes.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleFilterChange = (cat) => {
        setFilter(cat);
        setCurrentPage(1);
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        const el = document.getElementById('quiz-list-top');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    // ★修正: いいね処理（画面上の数字を即座に増やす）
    const handleLike = async (e, quizId) => {
        e.stopPropagation(); // カードクリック(onPlay)を阻止
        
        // 1. まず画面上の数字を+1する（ユーザーを待たせない）
        setLocalQuizzes(prev => prev.map(q => 
            q.id === quizId 
                ? { ...q, likes_count: (q.likes_count || 0) + 1 } 
                : q
        ));

        // 2. 裏でサーバーに書き込む
        if(supabase) {
            await supabase.rpc('increment_likes', { row_id: quizId });
        }
    };

    // ★修正: 未ログインユーザーも作成可能（エディタでログインを促す）
    const handleCreate = () => {
        onCreate(); // エディタへ遷移（ログイン状態に関わらず）
    };

    return (
        <div className="min-h-screen bg-white font-sans flex flex-col">
            <Header setPage={setPage} user={user} onLogout={onLogout} setShowAuth={setShowAuth} isAdmin={isAdmin} />

            <div className="flex-grow">
                {/* ヒーロー */}
                <div className="bg-gradient-to-br from-indigo-900 via-purple-800 to-indigo-900 text-white pt-20 pb-24 px-4 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
                    <div className="max-w-4xl mx-auto text-center relative z-10">
                        <div className="inline-block bg-indigo-500/30 border border-indigo-400/30 px-4 py-1 rounded-full text-xs font-bold mb-6 animate-fade-in-up">
                            ✨ AIがあなたの診断ビジネスを加速させる
                        </div>
                        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight tracking-tight drop-shadow-lg">
                            診断クイズで、<br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-yellow-200">集客をもっと楽しく。</span>
                        </h1>
                        <p className="text-lg md:text-xl text-indigo-100 mb-10 max-w-2xl mx-auto leading-relaxed">
                            専門知識は不要。AIがあなたの代わりに高品質な診断・検定・占いを作成。<br/>
                            SNSで拡散し、自然な流れでファンを増やしましょう。
                        </p>
                        <div className="flex flex-col md:flex-row justify-center gap-4">
                            <button onClick={handleCreate} className="bg-white text-indigo-700 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all shadow-lg flex items-center justify-center gap-2 transform hover:scale-105">
                                <Sparkles size={20} className="text-yellow-500"/> 今すぐ診断を作る
                            </button>
                            <button onClick={()=>setPage('effective')} className="bg-indigo-700/50 border border-indigo-400/50 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-indigo-700/80 transition-all flex items-center justify-center gap-2">
                                <TrendingUp size={20}/> 活用事例を見る
                            </button>
                        </div>
                    </div>
                </div>

                {/* 人気ランキング */}
                <div className="max-w-6xl mx-auto py-16 px-4">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-2 mb-2">
                            <TrendingUp className="text-red-500"/> 人気ランキング
                        </h2>
                        <div className="flex justify-center gap-2 mt-4">
                            <button 
                                onClick={() => setRankingSort('views')}
                                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${rankingSort === 'views' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                今週のプレイ回数
                            </button>
                            <button 
                                onClick={() => setRankingSort('trending')}
                                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${rankingSort === 'trending' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                急上昇ランキング
                            </button>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[...localQuizzes]
                            .sort((a, b) => {
                                if (rankingSort === 'views') {
                                    return (b.views_count || 0) - (a.views_count || 0);
                                } else {
                                    // 急上昇: いいね数と閲覧数の合計でソート
                                    const scoreA = (a.likes_count || 0) * 2 + (a.views_count || 0);
                                    const scoreB = (b.likes_count || 0) * 2 + (b.views_count || 0);
                                    return scoreB - scoreA;
                                }
                            })
                            .slice(0, 3)
                            .map((quiz, index) => (
                                <div 
                                    key={quiz.id} 
                                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden border-2 border-transparent hover:border-indigo-500 relative"
                                >
                                    <div className={`absolute top-3 left-3 w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-lg z-10 ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' : index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' : 'bg-gradient-to-br from-orange-400 to-orange-600'}`}>
                                        {index + 1}
                                    </div>
                                    <div onClick={() => onPlay(quiz)} className="cursor-pointer">
                                        {quiz.image_url ? (
                                            <img src={quiz.image_url} alt="" className="w-full h-40 object-cover"/>
                                        ) : (
                                            <div className={`w-full h-40 flex items-center justify-center ${quiz.color || 'bg-gradient-to-br from-indigo-100 to-purple-100'}`}>
                                                <Sparkles size={48} className="text-white opacity-50"/>
                                            </div>
                                        )}
                                        <div className="p-5">
                                            <h3 className="font-bold text-lg mb-2 line-clamp-2 text-gray-900">{quiz.title}</h3>
                                            <p className="text-sm text-gray-600 line-clamp-2 mb-3">{quiz.description}</p>
                                        </div>
                                    </div>
                                    <div className="px-5 pb-5 flex items-center justify-between text-xs text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Play size={14}/> {quiz.views_count || 0}回
                                        </span>
                                        <button 
                                            onClick={(e) => handleLike(e, quiz.id)}
                                            className="flex items-center gap-1 hover:text-red-500 transition-colors"
                                        >
                                            <Heart size={14} className="text-red-500"/> {quiz.likes_count || 0}
                                        </button>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>

                {/* クイズ一覧 */}
                <div id="quiz-list-top" className="max-w-6xl mx-auto py-16 px-4 border-t border-gray-100">
                    <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-8 gap-4 border-b border-gray-100 pb-4">
                        <div className="text-center md:text-left">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center justify-center md:justify-start gap-2">
                                <Zap className="text-yellow-500"/> 診断クイズ一覧
                            </h2>
                            <p className="text-gray-500 text-sm mt-1">気になる診断をプレイしてみましょう</p>
                        </div>
                        
                        <div className="flex gap-4 items-center">
                            {/* ソートタブ */}
                            <div className="flex bg-gray-100 p-1 rounded-lg">
                                <button onClick={()=>setSortOrder('newest')} className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${sortOrder==='newest' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}>新着順</button>
                                <button onClick={()=>setSortOrder('popular')} className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${sortOrder==='popular' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}>人気順</button>
                            </div>

                            {/* カテゴリタブ */}
                            <div className="flex bg-gray-100 p-1 rounded-lg overflow-x-auto max-w-[200px] md:max-w-none">
                                {['All', 'Business', 'Education', 'Fortune'].map(cat => (
                                    <button 
                                        key={cat}
                                        onClick={()=>handleFilterChange(cat)}
                                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap ${filter===cat ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        {cat === 'All' ? 'すべて' : cat === 'Business' ? 'ビジネス' : cat === 'Education' ? '学習' : '占い'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="grid md:grid-cols-3 gap-6 animate-pulse">
                            {[1,2,3].map(i => <div key={i} className="h-64 bg-gray-200 rounded-2xl"></div>)}
                        </div>
                    ) : (
                        <>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {displayQuizzes.length > 0 ? displayQuizzes.map(quiz => (
                                    <div key={quiz.id} onClick={()=>onPlay(quiz)} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group overflow-hidden flex flex-col h-full transform hover:-translate-y-1">
                                        <div className={`h-40 w-full relative overflow-hidden ${quiz.color || 'bg-indigo-600'}`}>
                                            {quiz.image_url ? (
                                                <img src={quiz.image_url} alt={quiz.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/>
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center opacity-30 text-white">
                                                    <Sparkles size={48}/>
                                                </div>
                                            )}
                                            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                                {quiz.layout === 'chat' ? <MessageCircle size={10}/> : <Zap size={10}/>}
                                                {quiz.layout === 'chat' ? 'CHAT' : 'CARD'}
                                            </div>
                                        </div>
                                        <div className="p-6 flex flex-col flex-grow">
                                            <div className="mb-2 flex items-center justify-between">
                                                <div className="flex gap-2">
                                                    <span className={`text-[10px] font-bold px-2 py-1 rounded ${
                                                        quiz.mode === 'test' ? 'bg-orange-100 text-orange-600' : 
                                                        quiz.mode === 'fortune' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                                                    }`}>
                                                        {quiz.mode === 'test' ? '検定' : quiz.mode === 'fortune' ? '占い' : '診断'}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                                        <Play size={10}/> {quiz.views_count||0}
                                                    </span>
                                                </div>
                                                {/* いいねボタン */}
                                                <button onClick={(e)=>handleLike(e, quiz.id)} className="text-gray-300 hover:text-pink-500 flex items-center gap-1 text-xs font-bold transition-colors group/heart">
                                                    <Heart size={14} className={`${quiz.likes_count > 0 ? "fill-pink-500 text-pink-500" : "group-hover/heart:text-pink-500"} transition-all`}/> 
                                                    <span className={quiz.likes_count > 0 ? "text-pink-500" : ""}>{quiz.likes_count||0}</span>
                                                </button>
                                            </div>
                                            <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">{quiz.title}</h3>
                                            <p className="text-gray-500 text-xs line-clamp-3 mb-4 leading-relaxed">{quiz.description}</p>
                                            <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center text-xs font-bold text-indigo-600">
                                                <span>診断する</span>
                                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform"/>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-full text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                        <p className="text-gray-400 font-bold mb-4">まだクイズがありません</p>
                                        <button onClick={handleCreate} className="bg-indigo-600 text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-indigo-700">一番乗りで作る</button>
                                    </div>
                                )}
                            </div>

                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-6 mt-12">
                                    <button 
                                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                        disabled={currentPage === 1}
                                        className="p-3 rounded-full border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronLeft size={24} />
                                    </button>
                                    
                                    <div className="text-sm font-bold text-gray-500">
                                        <span className="text-indigo-600 text-lg">{currentPage}</span> / {totalPages}
                                    </div>

                                    <button 
                                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                        disabled={currentPage === totalPages}
                                        className="p-3 rounded-full border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronRight size={24} />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <footer className="bg-gray-900 text-gray-400 py-12 mt-12 border-t border-gray-800">
                <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <h2 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
                            <Sparkles className="text-pink-500"/> 診断クイズメーカー
                        </h2>
                        <p className="text-sm leading-relaxed mb-6 opacity-80">
                            集客・教育・エンタメに使える診断コンテンツを、<br/>
                            AIの力で誰でも簡単に作成・公開できるプラットフォーム。<br/>
                            あなたのビジネスを「診断」で加速させます。
                        </p>
                        <button onClick={handleCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-full transition-colors">
                            無料で作成をはじめる
                        </button>
                    </div>

                    <div>
                        <h3 className="text-white font-bold mb-4 border-b border-gray-700 pb-2 inline-block">メニュー</h3>
                        <ul className="space-y-3 text-sm">
                            <li><button onClick={()=>setPage('effective')} className="hover:text-white transition-colors flex items-center gap-2">➤ 効果的な活用法</button></li>
                            <li><button onClick={()=>setPage('logic')} className="hover:text-white transition-colors flex items-center gap-2">➤ 売れる診断の作り方</button></li>
                            <li><button onClick={()=>setPage('howto')} className="hover:text-white transition-colors flex items-center gap-2">➤ 使い方・機能一覧</button></li>
                            <li><button onClick={()=>setPage('dashboard')} className="hover:text-white transition-colors flex items-center gap-2">➤ マイページ</button></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white font-bold mb-4 border-b border-gray-700 pb-2 inline-block">サポート・規約</h3>
                        <ul className="space-y-3 text-sm">
                            <li><button onClick={()=>setPage('faq')} className="hover:text-white transition-colors">よくある質問</button></li>
                            <li><button onClick={()=>setPage('contact')} className="hover:text-white transition-colors">お問い合わせ</button></li>
                            <li><button onClick={()=>setPage('legal')} className="hover:text-white transition-colors">特定商取引法に基づく表記</button></li>
                            <li><button onClick={()=>setPage('privacy')} className="hover:text-white transition-colors">プライバシーポリシー</button></li>
                        </ul>
                    </div>
                </div>
                
                <div className="max-w-6xl mx-auto px-4 mt-12 pt-8 border-t border-gray-800 text-center text-xs opacity-60">
                    &copy; 2025 Shindan Quiz Maker. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default Portal;
