"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Play, Edit3, MessageSquare, CheckCircle, Trash2, ArrowLeft, Save, 
  RefreshCw, Loader2, Trophy, Home, ThumbsUp, ExternalLink, X, 
  Crown, Lock, Share2, Sparkles, Wand2, QrCode, MessageCircle, Mail, 
  HelpCircle, ChevronDown, ChevronUp, Twitter, BookOpen, User, LogOut, LayoutDashboard, Image as ImageIcon, Layout, Smartphone
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Script from 'next/script';

// --- 設定エリア ---
const ADMIN_EMAIL = "info@kei-sho.co.jp"; 
// ----------------

// --- Supabase Config ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null;

// --- Utility ---
const generateSlug = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({length: 5}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

// --- SEO Component ---
const SEO = ({ title, description, image }) => (
    <>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={image || ""} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={image || ""} />
    </>
);

// --- Logic ---
const calculateResult = (answers, results) => {
  const scores = { A: 0, B: 0, C: 0 };
  Object.values(answers).forEach(option => {
    if (option.score) {
      Object.entries(option.score).forEach(([type, point]) => {
        scores[type] = (scores[type] || 0) + (parseInt(point, 10) || 0);
      });
    }
  });
  let maxType = 'A';
  let maxScore = -1;
  Object.entries(scores).forEach(([type, score]) => {
    if (score > maxScore) {
      maxScore = score;
      maxType = type;
    }
  });
  return results.find(r => r.type === maxType) || results[0];
};

// --- Components ---

const Input = ({label, val, onChange, ph}) => (
    <div className="mb-4">
        <label className="text-sm font-bold text-gray-900 block mb-2">{label}</label>
        <input className="w-full border border-gray-300 p-3 rounded-lg text-black font-bold focus:ring-2 focus:ring-indigo-500 outline-none bg-white placeholder-gray-400 transition-shadow" value={val||''} onChange={e=>onChange(e.target.value)} placeholder={ph}/>
    </div>
);

const Textarea = ({label, val, onChange}) => (
    <div className="mb-4">
        <label className="text-sm font-bold text-gray-900 block mb-2">{label}</label>
        <textarea className="w-full border border-gray-300 p-3 rounded-lg text-black focus:ring-2 focus:ring-indigo-500 outline-none bg-white placeholder-gray-400 transition-shadow" rows={3} value={val} onChange={e=>onChange(e.target.value)}/>
    </div>
);

const Header = ({ setPage, isAdmin, user, onLogout, setShowAuth }) => (
    <div className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="font-bold text-xl flex items-center gap-2 text-indigo-700 cursor-pointer" onClick={()=>setPage('portal')}>
                <Sparkles className="text-pink-500"/> 診断クイズメーカー
            </div>
            <div className="flex items-center gap-4 text-sm font-bold text-gray-600">
                <button onClick={()=>setPage('faq')} className="hidden md:block hover:text-indigo-600">よくある質問</button>
                {user ? (
                    <div className="flex items-center gap-2">
                        <button onClick={()=>setPage('dashboard')} className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full flex items-center gap-2 hover:bg-indigo-100 transition-colors">
                            <LayoutDashboard size={16}/> <span className="hidden md:inline">マイページ</span>
                        </button>
                    </div>
                ) : (
                    <button onClick={()=>setShowAuth(true)} className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors flex items-center gap-2">
                        <User size={16}/> <span className="hidden md:inline">ログイン</span>
                    </button>
                )}
            </div>
        </div>
    </div>
);

const AuthModal = ({ isOpen, onClose, setUser }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    
    if (!isOpen) return null;
    
    const handleAuth = async (e) => {
        e.preventDefault(); setLoading(true);
        try {
            const { data, error } = isLogin 
                ? await supabase.auth.signInWithPassword({ email, password })
                : await supabase.auth.signUp({ 
                    email, 
                    password,
                    options: { emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined }
                  });
            
            if (error) throw error;

            if (isLogin && data.user) { 
                setUser(data.user); onClose(); 
            } else if (!isLogin && data.user) {
                if (!data.session) alert('確認メールを送信しました。メール内のリンクをクリックして認証を完了させてください。');
                else { setUser(data.user); onClose(); }
            }
        } catch (e) { alert(e.message); } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl relative animate-fade-in">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X/></button>
                <h2 className="text-xl font-bold mb-6 text-center text-gray-900">{isLogin ? 'ログイン' : '新規登録'}</h2>
                <form onSubmit={handleAuth} className="space-y-4">
                    <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50 text-gray-900" placeholder="Email" />
                    <input type="password" required value={password} onChange={e=>setPassword(e.target.value)} className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50 text-gray-900" placeholder="Password" />
                    <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors">
                        {loading ? '処理中...' : (isLogin ? 'ログイン' : '登録する')}
                    </button>
                </form>
                <button onClick={()=>setIsLogin(!isLogin)} className="w-full text-center mt-4 text-sm text-indigo-600 font-bold underline">
                    {isLogin ? 'アカウントをお持ちでない方はこちら' : 'すでにアカウントをお持ちの方はこちら'}
                </button>
            </div>
        </div>
    );
};

// --- Pages ---

const Dashboard = ({ user, onEdit, onDelete, setPage, onLogout }) => {
    useEffect(() => { document.title = "マイページ | 診断クイズメーカー"; }, []);
    const [myQuizzes, setMyQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyQuizzes = async () => {
            if(!user) return;
            const { data } = await supabase.from('quizzes').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
            setMyQuizzes(data || []);
            setLoading(false);
        };
        fetchMyQuizzes();
    }, [user]);

    const graphData = myQuizzes.map(q => ({
        name: q.title.length > 10 ? q.title.substring(0, 10)+'...' : q.title,
        views: q.views_count || 0,
        clicks: q.clicks_count || 0
    }));

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Header setPage={setPage} user={user} onLogout={onLogout} />
            <div className="max-w-6xl mx-auto py-12 px-4">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2"><LayoutDashboard/> マイページ</h1>
                    <button onClick={onLogout} className="text-gray-500 hover:text-red-500 font-bold flex items-center gap-1 text-sm"><LogOut size={16}/> ログアウト</button>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="bg-indigo-100 p-3 rounded-full text-indigo-600"><User size={24}/></div>
                                <div>
                                    <p className="text-xs text-gray-500 font-bold">ログイン中</p>
                                    <p className="text-sm font-bold text-gray-900 break-all">{user?.email}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <div className="text-2xl font-extrabold text-indigo-600">{myQuizzes.length}</div>
                                    <div className="text-xs text-gray-500 font-bold">作成数</div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <div className="text-2xl font-extrabold text-green-600">
                                        {myQuizzes.reduce((acc, q) => acc + (q.views_count||0), 0)}
                                    </div>
                                    <div className="text-xs text-gray-500 font-bold">総PV数</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-[300px]">
                            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><Trophy size={18}/> アクセス解析</h3>
                            {graphData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={graphData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" tick={{fontSize: 10}} height={50} interval={0} angle={-30} textAnchor="end"/>
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="views" name="閲覧数" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="clicks" name="ボタンクリック" fill="#10b981" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-400 text-sm">データがありません</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-12">
                    <h2 className="text-xl font-bold text-black mb-4 border-l-4 border-indigo-600 pl-4">作成した診断リスト</h2>
                    {loading ? <div className="text-center py-10"><Loader2 className="animate-spin mx-auto text-indigo-600"/></div> : (
                        myQuizzes.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                                <p className="text-gray-500 mb-4">まだ診断を作成していません。</p>
                                <button onClick={()=>setPage('editor')} className="bg-indigo-600 text-white px-6 py-2 rounded-full font-bold hover:bg-indigo-700">新規作成する</button>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {myQuizzes.map(quiz => (
                                    <div key={quiz.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow relative group">
                                        <div className={`h-32 w-full overflow-hidden relative ${quiz.color || 'bg-indigo-600'}`}>
                                            {quiz.image_url && <img src={quiz.image_url} alt={quiz.title} className="w-full h-full object-cover"/>}
                                            <span className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1">
                                                {quiz.layout === 'chat' ? <><MessageCircle size={10}/> Chat</> : <><Layout size={10}/> Card</>}
                                            </span>
                                        </div>
                                        <div className="p-5">
                                            <h3 className="font-bold text-lg mb-2 line-clamp-1 text-black">{quiz.title}</h3>
                                            <div className="flex gap-4 text-xs text-gray-500 font-bold mb-4">
                                                <span className="flex items-center gap-1"><Play size={12}/> {quiz.views_count||0} views</span>
                                                <span className="flex items-center gap-1"><ExternalLink size={12}/> {quiz.clicks_count||0} clicks</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={()=>onEdit(quiz)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-1"><Edit3 size={14}/> 編集</button>
                                                <button onClick={()=>onDelete(quiz.id)} className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-1"><Trash2 size={14}/> 削除</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

const Portal = ({ quizzes, isLoading, onPlay, onCreate, user, setShowAuth, onLogout, setPage, onEdit, onDelete }) => {
  useEffect(() => { document.title = "無料AI診断メーカー | 集客・販促に効くクイズ作成ツール"; }, []);
  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  const [sortType, setSortType] = useState('new');

  const handleLike = async (e, quiz) => {
      e.stopPropagation();
      if(!supabase) return;
      const btn = e.currentTarget;
      const countSpan = btn.querySelector('span');
      if(btn.classList.contains('liked')) return;
      try {
        await supabase.rpc('increment_likes', { row_id: quiz.id });
        const current = parseInt(countSpan.textContent || '0');
        countSpan.textContent = current + 1;
        btn.classList.add('liked', 'text-pink-500');
      } catch(err) { console.error(err); }
  };

  const sortedQuizzes = [...quizzes].sort((a, b) => {
      if (sortType === 'popular') return (b.likes_count || 0) - (a.likes_count || 0);
      return new Date(b.created_at) - new Date(a.created_at);
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20">
      <SEO title="無料AI診断メーカー | 集客・販促に効くクイズ作成ツール" description="集客やエンタメに使える診断テストをAIが自動生成。登録不要、無料で今すぐ作成できます。" />
      <Header setPage={setPage} user={user} onLogout={onLogout} setShowAuth={setShowAuth} isAdmin={isAdmin} />
      <div className="bg-gradient-to-br from-indigo-900 to-blue-800 text-white py-16 px-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <h1 className="text-3xl md:text-5xl font-extrabold mb-6 relative z-10 leading-tight">
            あなたのビジネスを加速させる<br/><span className="text-yellow-300">診断コンテンツ</span>を作成
        </h1>
        <p className="text-blue-100 mb-8 max-w-xl mx-auto relative z-10">
            集客・販促・顧客分析。AIがあなたの代わりにクイズ構成を自動生成。
            <br/>登録不要で、今すぐ無料で作成できます。
        </p>
        <button onClick={onCreate} className="bg-white text-indigo-900 px-8 py-4 rounded-full font-bold shadow-xl hover:bg-gray-100 hover:scale-105 transition-all flex items-center gap-2 mx-auto relative z-10">
            <Edit3 size={20} /> 無料で作成する
        </button>
      </div>
      <div id="quiz-list" className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <div className="w-1.5 h-8 bg-indigo-600 rounded-full"></div>新着の診断クイズ
            </h2>
            <div className="flex gap-2 text-sm font-bold">
                <button onClick={()=>setSortType('new')} className={`px-4 py-2 rounded-full border ${sortType==='new' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-500 border-gray-200'}`}>新着順</button>
                <button onClick={()=>setSortType('popular')} className={`px-4 py-2 rounded-full border ${sortType==='popular' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-500 border-gray-200'}`}>人気順</button>
            </div>
        </div>
        {isLoading ? (
            <div className="text-center py-20"><Loader2 className="animate-spin mx-auto text-indigo-600" size={40}/></div>
        ) : (
         <div className="grid md:grid-cols-3 gap-8">
            {sortedQuizzes.map((quiz) => (
              <div key={quiz.id} onClick={()=>onPlay(quiz)} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col h-full group overflow-hidden border border-gray-100 relative">
                {isAdmin && (
                    <div className="absolute top-2 right-2 z-20 flex gap-1">
                        <button onClick={(e)=>{e.stopPropagation(); onEdit(quiz);}} className="bg-white/90 p-2 rounded-full shadow hover:text-blue-600"><Edit3 size={16}/></button>
                        <button onClick={(e)=>{e.stopPropagation(); onDelete(quiz.id);}} className="bg-white/90 p-2 rounded-full shadow hover:text-red-600"><Trash2 size={16}/></button>
                    </div>
                )}
                {/* Image or Color */}
                <div className={`h-40 w-full overflow-hidden relative ${quiz.color || 'bg-indigo-600'}`}>
                    {quiz.image_url && <img src={quiz.image_url} alt={quiz.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"/>}
                    <span className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-full text-xs font-bold shadow-sm">{quiz.category || 'その他'}</span>
                </div>
                <div className="p-6 flex-grow flex flex-col">
                  <h3 className="text-lg font-bold mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2 text-gray-900">{quiz.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-3 flex-grow mb-4">{quiz.description}</p>
                  <div className="flex items-center justify-between border-t pt-4 mt-auto">
                      <span className="text-xs font-bold bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg flex items-center gap-1">
                          <Play size={12}/> 診断する
                      </span>
                      <div className="flex gap-3 text-gray-400 text-xs font-bold items-center">
                          <span className="flex items-center gap-1" title="閲覧数"><Play size={12}/> {quiz.views_count||0}</span>
                          <button onClick={(e)=>handleLike(e, quiz)} className="flex items-center gap-1 hover:text-pink-500 transition-colors group/like">
                              <ThumbsUp size={14} className="group-hover/like:scale-125 transition-transform"/>
                              <span>{quiz.likes_count || 0}</span>
                          </button>
                      </div>
                  </div>
                </div>
              </div>
            ))}
         </div>
        )}
      </div>
      <footer className="bg-white border-t py-12 text-center text-sm text-gray-400">
          <div className="mb-6 flex justify-center gap-6">
              <button onClick={()=>setPage('faq')} className="hover:text-indigo-600 font-bold">よくある質問</button>
              <a href="https://docs.google.com/forms/d/e/1FAIpQLSd8euNVubqlITrCF2_W7VVBjLd2mVxzOIcJ67pNnk3GPLnT_A/viewform" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 font-bold flex items-center gap-1"><Mail size={14}/> お問い合わせ</a>
          </div>
          <p className="mb-4">&copy; 2025 Shindan Quiz Maker. All rights reserved.</p>
      </footer>
    </div>
  );
};

// ... Static Pages ...
const FaqPage = ({ onBack, setPage, user, onLogout, setShowAuth }) => {
    useEffect(() => { document.title = "よくある質問 | 診断クイズメーカー"; }, []);
    const [openIndex, setOpenIndex] = useState(null);
    const faqs = [
        { category: "一般・全般", q: "無料で使えますか？", a: "はい、現在はβ版としてすべての機能を無料で公開しています。" },
        { category: "一般・全般", q: "商用利用は可能ですか？", a: "可能です。作成した診断クイズをご自身のビジネスに自由にご活用ください。" },
        { category: "操作・作成", q: "作った診断を修正したいのですが", a: "マイページからご自身の診断を編集・削除することが可能です。" },
    ];
    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Header setPage={setPage} user={user} onLogout={onLogout} setShowAuth={setShowAuth} />
            <div className="max-w-3xl mx-auto py-12 px-4">
                <button onClick={onBack} className="mb-6 flex items-center gap-1 text-gray-500 font-bold hover:text-indigo-600"><ArrowLeft size={16}/> 戻る</button>
                <h1 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">よくある質問</h1>
                <div className="space-y-4">
                    {faqs.map((faq, i) => (
                        <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <button onClick={() => setOpenIndex(openIndex === i ? null : i)} className="w-full px-6 py-4 text-left font-bold text-gray-800 flex justify-between items-center hover:bg-gray-50">
                                <span className="flex items-center gap-3"><span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded">{faq.category}</span>{faq.q}</span>
                                {openIndex === i ? <ChevronUp size={20} className="text-gray-400"/> : <ChevronDown size={20} className="text-gray-400"/>}
                            </button>
                            {openIndex === i && <div className="px-6 py-4 bg-gray-50 text-gray-600 text-sm leading-relaxed border-t border-gray-100">{faq.a}</div>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const PricePage = ({ onBack, setPage, user, onLogout, setShowAuth }) => {
    useEffect(() => { document.title = "料金プラン | 診断クイズメーカー"; }, []);
    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Header setPage={setPage} user={user} onLogout={onLogout} setShowAuth={setShowAuth} />
            <div className="py-12 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <button onClick={onBack} className="mb-6 flex items-center gap-1 text-gray-500 font-bold hover:text-indigo-600 mx-auto"><ArrowLeft size={16}/> トップへ戻る</button>
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-4">料金プラン</h1>
                    <p className="text-gray-600 mb-12">現在はベータ版のため、基本機能はすべて無料でご利用いただけます。</p>
                    <div className="grid md:grid-cols-3 gap-8 text-left">
                        <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-indigo-500 relative transform scale-105 z-10">
                            <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-500 text-white px-3 py-1 rounded-full text-xs font-bold">BETA FREE</span>
                            <h3 className="text-2xl font-bold mb-2 text-gray-900">Standard</h3>
                            <div className="text-4xl font-extrabold mb-4 text-gray-900">¥0<span className="text-sm font-medium text-gray-500">/月</span></div>
                            <ul className="space-y-3 mb-8 text-sm text-gray-600">
                                <li className="flex gap-2"><CheckCircle size={16} className="text-green-500"/>診断作成数 無制限</li>
                                <li className="flex gap-2"><CheckCircle size={16} className="text-green-500"/>AI自動生成機能</li>
                                <li className="flex gap-2"><CheckCircle size={16} className="text-green-500"/>簡易アクセス解析</li>
                            </ul>
                            <button className="w-full py-3 rounded-lg font-bold bg-indigo-600 text-white">現在のプラン</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const HowToPage = ({ onBack, setPage, user, onLogout, setShowAuth }) => {
    useEffect(() => { document.title = "使い方・規約 | 診断クイズメーカー"; }, []);
    return (
        <div className="min-h-screen bg-white font-sans">
            <Header setPage={setPage} user={user} onLogout={onLogout} setShowAuth={setShowAuth} />
            <div className="py-12 px-4 max-w-3xl mx-auto">
                <button onClick={onBack} className="mb-6 flex items-center gap-1 text-gray-500 font-bold hover:text-indigo-600"><ArrowLeft size={16}/> 戻る</button>
                <h1 className="text-3xl font-extrabold text-gray-900 mb-8 border-b pb-4">診断クイズの作り方・規約</h1>
                <div className="space-y-8 text-gray-800 leading-relaxed">
                    <p>このツールは、ビジネス向けの診断コンテンツを手軽に作成するためのツールです。</p>
                    <ul className="list-disc pl-5 space-y-1 bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <li><strong>質問：</strong> 5問</li>
                        <li><strong>選択肢：</strong> 各質問に4つ</li>
                        <li><strong>結果パターン：</strong> 3種類</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

// 3. Player Logic (Chat & Card)
const QuizPlayer = ({ quiz, onBack }) => {
  useEffect(() => { document.title = `${quiz.title} | 診断中`; }, [quiz.title]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [playableQuestions, setPlayableQuestions] = useState(null);
  // Chat用state
  const [chatHistory, setChatHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  
  useEffect(() => {
    if(supabase) supabase.rpc('increment_views', { row_id: quiz.id }).then(({error})=> error && console.error(error));

    const rawQuestions = typeof quiz.questions === 'string' ? JSON.parse(quiz.questions) : quiz.questions;
    // Shuffle options
    const shuffleArray = (array) => {
        const newArr = [...array];
        for (let i = newArr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
        }
        return newArr;
    };
    setPlayableQuestions(rawQuestions.map(q => ({ ...q, options: shuffleArray(q.options) })));
  }, []);

  // Chat: スクロール
  useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isTyping, currentStep]);

  // Chat: 初期メッセージ (Q1)
  useEffect(() => {
      if (playableQuestions && currentStep === 0 && chatHistory.length === 0 && quiz.layout === 'chat') {
          setIsTyping(true);
          setTimeout(() => {
              setIsTyping(false);
              setChatHistory([{ type: 'bot', text: playableQuestions[0].text, qNum: 1 }]);
          }, 1500);
      }
  }, [playableQuestions, quiz.layout]);

  const results = typeof quiz.results === 'string' ? JSON.parse(quiz.results) : quiz.results;

  const handleAnswer = (option) => {
    const newAnswers = { ...answers, [currentStep]: option };
    setAnswers(newAnswers);

    if (quiz.layout === 'chat') {
        // User Answer
        setChatHistory(prev => [...prev, { type: 'user', text: option.label }]);
        
        if (currentStep + 1 < playableQuestions.length) {
            // Next Question
            setIsTyping(true);
            setTimeout(() => {
                setIsTyping(false);
                setChatHistory(prev => [...prev, { type: 'bot', text: playableQuestions[currentStep + 1].text, qNum: currentStep + 2 }]);
                setCurrentStep(currentStep + 1);
            }, 1000);
        } else {
            // Finish -> Typing -> Result
            setIsTyping(true);
            setTimeout(() => {
                setIsTyping(false);
                setChatHistory(prev => [...prev, { type: 'bot', text: "診断ありがとうございます！\n結果を作成しています..." }]);
                setTimeout(() => {
                    setResult(calculateResult(newAnswers, results));
                }, 2000);
            }, 1500);
        }
    } else {
        // Card Mode Flow
        if (currentStep + 1 < playableQuestions.length) { 
            setCurrentStep(currentStep + 1); 
        } else { 
            setResult(calculateResult(newAnswers, results)); 
        }
    }
  };

  if (!playableQuestions || !results) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={40}/></div>;

  if (result) { 
      return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <SEO title={`${result.title} | 診断結果`} description={result.description.substring(0, 100)} image={quiz.image_url} />
            <ResultView quiz={quiz} result={result} onRetry={() => {setResult(null); setCurrentStep(0); setAnswers({}); setChatHistory([]);}} onBack={onBack} />
        </div>
      ); 
  }
  
  const question = playableQuestions[currentStep];
  const progress = Math.round(((currentStep)/playableQuestions.length)*100);

  // --- Render: Chat Mode (Updated to match HTML sample) ---
  if (quiz.layout === 'chat') {
      return (
        <div className="min-h-screen bg-[#f8f9fa] flex flex-col font-sans">
            {/* LINE-like Header */}
            <div className="bg-gradient-to-br from-[#00B900] to-[#00C851] p-4 text-white text-center relative shadow-sm z-10">
                <div className="text-xs opacity-90 absolute left-4 top-1/2 -translate-y-1/2 cursor-pointer" onClick={onBack}><ArrowLeft size={20}/></div>
                <h1 className="font-bold text-sm">{quiz.title}</h1>
                <div className="text-[10px] opacity-80">オンライン</div>
                <div className="bg-white/30 h-1 mt-2 rounded-full overflow-hidden w-1/2 mx-auto">
                    <div className="h-full bg-white transition-all duration-500" style={{width: `${progress}%`}}></div>
                </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-grow p-4 overflow-y-auto pb-48 bg-[#f0f0f0]">
                {chatHistory.map((msg, i) => (
                    <div key={i} className={`flex mb-4 animate-fade-in-up ${msg.type === 'user' ? 'justify-end' : 'items-start gap-2'}`}>
                        {msg.type === 'bot' && (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00B900] to-[#00C851] flex items-center justify-center text-white flex-shrink-0 text-xl shadow-sm">🤖</div>
                        )}
                        <div className={`relative max-w-[85%] p-4 rounded-2xl shadow-sm text-sm font-medium leading-relaxed whitespace-pre-wrap
                            ${msg.type === 'user' 
                                ? 'bg-[#00B900] text-white rounded-tr-sm' 
                                : 'bg-white text-gray-800 rounded-tl-sm'
                            }`}>
                            {msg.qNum && <div className="text-[10px] text-gray-400 mb-1">質問 {msg.qNum} / {playableQuestions.length}</div>}
                            {msg.text}
                        </div>
                    </div>
                ))}
                
                {/* Typing Indicator */}
                {isTyping && (
                    <div className="flex items-start gap-2 mb-4 animate-fade-in">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00B900] to-[#00C851] flex items-center justify-center text-white flex-shrink-0 text-xl shadow-sm">🤖</div>
                        <div className="bg-white p-4 rounded-2xl rounded-tl-sm shadow-sm flex gap-1 items-center h-[52px]">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area (Options) */}
            <div className="fixed bottom-0 left-0 w-full bg-white border-t p-4 z-20 pb-8 safe-area-bottom shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
                <div className="max-w-md mx-auto space-y-2">
                    {/* Only show options if last message is from bot AND not typing */}
                    {(!isTyping && (chatHistory.length === 0 || chatHistory[chatHistory.length-1].type === 'bot')) && (
                        question.options.map((opt, idx) => (
                            <button key={idx} onClick={() => handleAnswer(opt)} 
                                className="w-full bg-white border-2 border-[#00B900] text-[#00B900] hover:bg-[#00B900] hover:text-white font-bold py-3 rounded-full transition-all active:scale-95 shadow-sm text-sm">
                                {opt.label}
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
      );
  }

  // --- Render: Card Mode (Existing) ---
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center py-6 font-sans">
      <SEO title={`${quiz.title} | 診断中`} description={quiz.description} image={quiz.image_url} />
      <div className="w-full max-w-md mb-4 px-4">
          <button onClick={onBack} className="text-gray-500 font-bold flex items-center gap-1 hover:text-gray-800"><ArrowLeft size={16}/> 戻る</button>
      </div>
      <div className="max-w-md mx-auto w-full px-4">
        {/* Colorful Header with Image */}
        <div className={`${quiz.color || 'bg-indigo-600'} text-white rounded-t-3xl text-center shadow-lg transition-colors duration-500 relative overflow-hidden`}>
             <div className="absolute top-0 left-0 w-full h-full bg-white opacity-10" style={{backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '15px 15px'}}></div>
             {quiz.image_url ? (
                 <div className="w-full h-48 relative">
                     <img src={quiz.image_url} alt="" className="w-full h-full object-cover opacity-90"/>
                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-center p-6">
                        <div>
                            <h2 className="text-xl font-bold mb-1 relative z-10">{quiz.title}</h2>
                            <p className="text-xs opacity-90 relative z-10 line-clamp-2">{quiz.description}</p>
                        </div>
                     </div>
                 </div>
             ) : (
                 <div className="p-6">
                    <h2 className="text-xl font-bold mb-2 relative z-10">{quiz.title}</h2>
                    <p className="text-xs opacity-90 relative z-10 whitespace-pre-wrap">{quiz.description}</p>
                 </div>
             )}
        </div>

        <div className="bg-white rounded-b-3xl shadow-xl p-8 border border-gray-100 border-t-0 mb-8 animate-slide-up">
            <div className="mb-4 flex justify-between text-xs font-bold text-gray-400">
                <span>Q{currentStep+1} / {playableQuestions.length}</span>
                <span>{progress}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full mb-8 overflow-hidden">
                <div className={`${quiz.color || 'bg-indigo-600'} h-full transition-all duration-300 ease-out`} style={{width:`${((currentStep+1)/playableQuestions.length)*100}%`}}></div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-8 text-center leading-relaxed">{question.text}</h3>
            <div className="space-y-4">
                {question.options.map((opt, idx) => (
                    <button key={idx} onClick={() => handleAnswer(opt)} className="w-full p-4 text-left border-2 border-gray-100 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 text-gray-800 font-bold transition-all flex justify-between items-center group active:scale-95">
                        <span className="flex-grow">{opt.label}</span>
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300 group-hover:border-indigo-500 flex-shrink-0 ml-4"></div>
                    </button>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

const ResultView = ({ quiz, result, onRetry, onBack }) => {
  useEffect(() => { document.title = `${result.title} | 診断結果`; }, [result.title]);
  const handleLinkClick = async () => {
    if(supabase) await supabase.rpc('increment_clicks', { row_id: quiz.id });
  };

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}?id=${quiz.slug || quiz.id}` : '';
  const shareText = `${quiz.title} | 診断結果は「${result.title}」でした！ #診断クイズメーカー`;
  
  const handleShareX = () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  const handleShareLine = () => window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}`, '_blank');

  return (
    <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden my-8 animate-fade-in border border-gray-100 flex flex-col min-h-[80vh]">
        <div className={`${quiz.color || 'bg-indigo-600'} text-white p-10 text-center relative overflow-hidden transition-colors duration-500`}>
            {quiz.image_url && <img src={quiz.image_url} className="absolute inset-0 w-full h-full object-cover opacity-20"/>}
            <div className="absolute top-0 left-0 w-full h-full bg-white opacity-10" style={{backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
            <Trophy className="mx-auto mb-4 text-yellow-300 relative z-10" size={56} />
            <h2 className="text-3xl font-extrabold mt-2 relative z-10">{result.title}</h2>
        </div>
        <div className="p-8 md:p-10 flex-grow">
            <div className="prose text-gray-800 leading-relaxed whitespace-pre-wrap mb-10 text-sm md:text-base">
                {result.description}
            </div>
            
            <div className="bg-gray-50 p-4 rounded-xl mb-8 text-center border border-gray-100">
                <p className="text-xs font-bold text-gray-500 mb-3">結果をシェアする</p>
                <div className="flex justify-center gap-3">
                    <button onClick={handleShareX} className="bg-black text-white p-3 rounded-full shadow hover:scale-110 transition-transform"><Twitter size={20}/></button>
                    <button onClick={handleShareLine} className="bg-[#06C755] text-white p-3 rounded-full shadow hover:scale-110 transition-transform"><MessageCircle size={20}/></button>
                    <button onClick={()=>{navigator.clipboard.writeText(shareUrl); alert('URLをコピーしました');}} className="bg-gray-200 text-gray-600 p-3 rounded-full shadow hover:scale-110 transition-transform"><Share2 size={20}/></button>
                </div>
            </div>

            <div className="space-y-4 mb-8">
                {result.link_url && (
                    <a href={result.link_url} onClick={handleLinkClick} target="_blank" rel="noopener noreferrer" className="block w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-center font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transform transition hover:scale-[1.02] active:scale-95">
                        <ExternalLink size={20}/> {result.link_text || "詳しく見る"}
                    </a>
                )}
                {result.line_url && (
                    <a href={result.line_url} onClick={handleLinkClick} target="_blank" rel="noopener noreferrer" className="block w-full bg-[#06C755] hover:bg-[#05b34c] text-white text-center font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transform transition hover:scale-[1.02] active:scale-95">
                        <MessageCircle size={20}/> {result.line_text || "LINE公式アカウント"}
                    </a>
                )}
                {result.qr_url && (
                    <a href={result.qr_url} onClick={handleLinkClick} target="_blank" rel="noopener noreferrer" className="block w-full bg-gray-800 hover:bg-gray-900 text-white text-center font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transform transition hover:scale-[1.02] active:scale-95">
                        <QrCode size={20}/> {result.qr_text || "QRコードを表示"}
                    </a>
                )}
            </div>

            <div className="flex gap-4 border-t pt-6">
                <button onClick={onRetry} className="flex-1 py-3 rounded-lg border border-gray-300 font-bold text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors">
                    <RefreshCw size={18}/> 再診断
                </button>
                <button onClick={onBack} className="flex-1 py-3 rounded-lg bg-gray-800 font-bold text-white hover:bg-gray-900 flex items-center justify-center gap-2 transition-colors">
                    <Home size={18}/> TOP
                </button>
            </div>
        </div>
        <div className="bg-gray-50 p-6 text-center border-t">
            <a href="https://shindan-quiz.makers.tokyo/" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-indigo-600 font-bold">
                &copy; 2025 Shindan Quiz Maker.
            </a>
        </div>
    </div>
  );
};

const Editor = ({ onBack, onSave, initialData, setPage, user }) => {
  useEffect(() => { document.title = "クイズ作成・編集 | 診断クイズメーカー"; }, []);
  const [activeTab, setActiveTab] = useState('基本設定');
  const [isSaving, setIsSaving] = useState(false);
  const [savedId, setSavedId] = useState(null);
  const [aiTheme, setAiTheme] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const TABS = [
      { id: '基本設定', icon: Edit3, label: '基本設定' },
      { id: '質問作成', icon: MessageSquare, label: '質問作成' },
      { id: '結果ページ', icon: Trophy, label: '結果ページ' }
  ];

  const defaultForm = {
      title: "新規診断", description: "診断の説明文を入力...", category: "Business", color: "bg-indigo-600", layout: "card", image_url: "",
      questions: Array(5).fill(null).map((_,i)=>({text:`質問${i+1}を入力してください`, options: Array(4).fill(null).map((_,j)=>({label:`選択肢${j+1}`, score:{A:j===0?3:0, B:j===1?3:0, C:j===2?3:0}}))})),
      results: [ {type:"A", title:"タイプA", description:"結果説明...", link_url:"", link_text:"", line_url:"", line_text:"", qr_url:"", qr_text:""}, {type:"B", title:"タイプB", description:"...", link_url:"", link_text:"", line_url:"", line_text:"", qr_url:"", qr_text:""}, {type:"C", title:"タイプC", description:"...", link_url:"", link_text:"", line_url:"", line_text:"", qr_url:"", qr_text:""} ]
  };

  const [form, setForm] = useState(initialData || defaultForm);

  const handlePublish = () => { 
      const urlId = initialData?.slug || savedId || initialData?.id;
      const url = `${window.location.origin}?id=${urlId}`;
      navigator.clipboard.writeText(url); 
      alert(`公開URLをコピーしました！\n${url}`); 
  };

  const handleRandomImage = () => {
      const curatedImages = [
          "https://images.unsplash.com/photo-1664575602276-acd073f104c1?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1606857521015-7f9fcf423740?auto=format&fit=crop&w=800&q=80"
      ];
      const selected = curatedImages[Math.floor(Math.random() * curatedImages.length)];
      setForm({...form, image_url: selected});
  };

  const handleAiGenerate = async () => {
      const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
      if(!apiKey) return alert('エラー: OpenAI APIキーが設定されていません。Vercelの環境変数を確認してください。');
      if(!aiTheme) return alert('どんな診断を作りたいかテーマを入力してください');
      setIsGenerating(true);
      try {
          const prompt = `
            テーマ「${aiTheme}」の診断テストを作成してください。
            出力は以下のJSON形式のみ。
            
            {
              "title": "キャッチーなタイトル",
              "description": "興味を惹く説明文",
              "questions": [
                { "text": "質問文", "options": [{"label": "回答", "score": {"A": 3, "B": 0, "C": 0}}, ...] }
              ],
              "results": [
                {"type": "A", "title": "○○タイプ", "description": "詳細な説明（200文字以上）"}
              ]
            }
            ※質問は5問、各4択。結果は3タイプ(A,B,C)。
          `;
          
          const res = await fetch("https://api.openai.com/v1/chat/completions", {
              method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
              body: JSON.stringify({ model: "gpt-3.5-turbo", messages: [{ role: "user", content: prompt }] })
          });
          
          if (!res.ok) throw new Error('API request failed');
          const data = await res.json();
          const content = data.choices[0].message.content;
          const jsonStr = content.substring(content.indexOf('{'), content.lastIndexOf('}') + 1);
          const json = JSON.parse(jsonStr);
          setForm(prev => ({ 
              ...prev, ...json, 
              results: json.results.map(r=>({
                  ...r, 
                  link_url:"", link_text:"",
                  line_url:"", line_text:"",
                  qr_url:"", qr_text:""
              })) 
          })); 
          alert('AI生成が完了しました！');
      } catch(e) { alert('AI生成エラー: ' + e.message); } finally { setIsGenerating(false); }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans text-gray-900">
        <div className="bg-white border-b px-6 py-4 flex justify-between sticky top-0 z-50 shadow-sm">
            <div className="flex items-center gap-3">
                <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-700"><ArrowLeft/></button>
                <h2 className="font-bold text-lg text-gray-900">
                    {initialData ? 'クイズ編集' : '新規クイズ作成'}
                </h2>
            </div>
            <div className="flex gap-2">
                {savedId && (
                    <button onClick={handlePublish} className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2 animate-pulse">
                        <Share2 size={18}/> 公開URL
                    </button>
                )}
                <button onClick={async ()=>{
                        setIsSaving(true); 
                        const id = await onSave(form, savedId || initialData?.id); 
                        if(id) setSavedId(id); 
                        setIsSaving(false);
                    }} disabled={isSaving} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-md transition-all">
                    {isSaving ? <Loader2 className="animate-spin"/> : <Save/>} 保存
                </button>
            </div>
        </div>
        
        <div className="flex flex-grow overflow-hidden">
            <div className="w-64 bg-white border-r flex flex-col hidden md:flex shrink-0">
                <div className="p-4 bg-gradient-to-b from-purple-50 to-white border-b">
                    <div className="flex items-center gap-2 mb-2 text-purple-700 font-bold text-sm">
                        <Sparkles size={16}/> 診断クイズ自動生成(AI)
                    </div>
                    <textarea 
                        className="w-full border border-purple-200 p-2 rounded-lg text-xs mb-2 focus:ring-2 focus:ring-purple-500 outline-none resize-none bg-white text-gray-900 placeholder-gray-400" 
                        rows={2} placeholder="テーマを入力 (例: 起業家タイプ診断)" 
                        value={aiTheme} onChange={e=>setAiTheme(e.target.value)} 
                    />
                    <button onClick={handleAiGenerate} disabled={isGenerating} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-bold text-xs transition-all shadow flex items-center justify-center gap-1">
                        {isGenerating ? <Loader2 className="animate-spin" size={12}/> : <Wand2 size={12}/>} 生成する
                    </button>
                    <p className="text-[10px] text-gray-500 mt-2 text-center">※生成には10〜30秒ほどかかります</p>
                </div>

                <div className="p-4 space-y-1 overflow-y-auto flex-grow">
                    {TABS.map(tab=>(
                        <button key={tab.id} onClick={()=>setActiveTab(tab.id)} className={`w-full px-4 py-3 text-left font-bold rounded-lg transition-colors flex items-center gap-2 ${activeTab===tab.id?'bg-indigo-50 text-indigo-700':'text-gray-600 hover:bg-gray-50'}`}>
                            <tab.icon size={16}/>
                            <span className="capitalize">{tab.label}</span>
                        </button>
                    ))}
                </div>
                <div className="p-4 border-t">
                    <button onClick={()=>setPage('howto')} className="w-full text-xs text-gray-500 hover:text-indigo-600 flex items-center justify-center gap-1">
                        <BookOpen size={14}/> 使い方・規約を見る
                    </button>
                </div>
            </div>

            <div className="flex-grow p-4 md:p-8 overflow-y-auto bg-gray-50">
                <div className="md:hidden flex flex-col gap-4 mb-4">
                     <div className="p-4 bg-white rounded-xl shadow-sm border border-purple-100">
                        <div className="flex gap-2 mb-2">
                            <input className="flex-grow border border-gray-300 p-2 rounded text-sm text-black" placeholder="AI作成テーマ..." value={aiTheme} onChange={e=>setAiTheme(e.target.value)}/>
                            <button onClick={handleAiGenerate} disabled={isGenerating} className="bg-purple-600 text-white px-4 rounded font-bold text-sm whitespace-nowrap">{isGenerating ? '...' : '生成'}</button>
                        </div>
                     </div>
                     <div className="flex gap-2 overflow-x-auto pb-2">
                        {TABS.map(tab=>(<button key={tab.id} onClick={()=>setActiveTab(tab.id)} className={`px-4 py-2 rounded-full font-bold whitespace-nowrap ${activeTab===tab.id?'bg-indigo-600 text-white':'bg-white border text-gray-700'}`}>{tab.label}</button>))}
                    </div>
                </div>

                <div className="max-w-3xl mx-auto bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-gray-100 min-h-[500px]">
                    {activeTab === '基本設定' && (
                        <div className="animate-fade-in">
                            <h3 className="font-bold text-xl mb-6 border-b pb-2 flex items-center gap-2 text-gray-900"><Edit3 className="text-gray-400"/> 基本設定</h3>
                            <Input label="タイトル" val={form.title} onChange={v=>setForm({...form, title:v})} ph="例：あなたのリーダータイプ診断" />
                            <Textarea label="説明文" val={form.description} onChange={v=>setForm({...form, description:v})} />
                            <Input label="カテゴリ" val={form.category} onChange={v=>setForm({...form, category:v})} ph="Business, Health, Love..." />
                            
                            <div className="mt-6 mb-6">
                                <label className="text-sm font-bold text-gray-900 block mb-2">メイン画像</label>
                                <div className="flex gap-2">
                                    <input 
                                        className="flex-grow border border-gray-300 p-3 rounded-lg text-black font-bold focus:ring-2 focus:ring-indigo-500 outline-none bg-white placeholder-gray-400 transition-shadow" 
                                        value={form.image_url||''} 
                                        onChange={e=>setForm({...form, image_url:e.target.value})} 
                                        placeholder="画像URL (https://...)"
                                    />
                                    <button onClick={handleRandomImage} className="bg-gray-100 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-200 flex items-center gap-1">
                                        <ImageIcon size={16}/> 自動入力
                                    </button>
                                </div>
                                {form.image_url && <img src={form.image_url} alt="Preview" className="h-32 w-full object-cover rounded-lg mt-2 border"/>}
                            </div>

                            <div className="grid grid-cols-2 gap-6 mt-6">
                                <div>
                                    <label className="text-sm font-bold text-gray-900 block mb-2">テーマカラー</label>
                                    <div className="flex gap-3 flex-wrap">
                                        {['bg-indigo-600', 'bg-pink-500', 'bg-blue-500', 'bg-green-500', 'bg-orange-500', 'bg-gray-800'].map(c => (
                                            <button key={c} onClick={()=>setForm({...form, color:c})} className={`w-10 h-10 rounded-full ${c} ${form.color===c ? 'ring-4 ring-offset-2 ring-gray-300':''}`}></button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-gray-900 block mb-2">表示レイアウト</label>
                                    <div className="flex gap-2">
                                        <button onClick={()=>setForm({...form, layout:'card'})} className={`flex-1 py-3 rounded-lg font-bold text-sm border flex items-center justify-center gap-2 ${form.layout==='card' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-gray-200 text-gray-500'}`}>
                                            <Layout size={16}/> カード型
                                        </button>
                                        <button onClick={()=>setForm({...form, layout:'chat'})} className={`flex-1 py-3 rounded-lg font-bold text-sm border flex items-center justify-center gap-2 ${form.layout==='chat' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-gray-200 text-gray-500'}`}>
                                            <MessageCircle size={16}/> チャット型
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* ... (Questions and Results tabs remain exactly same as previous version) ... */}
                    {activeTab === '質問作成' && (
                        <div className="space-y-8 animate-fade-in">
                            <h3 className="font-bold text-xl mb-6 border-b pb-2 flex items-center gap-2 text-gray-900"><MessageSquare className="text-gray-400"/> 質問作成 (5問)</h3>
                            {form.questions.map((q, i)=>(
                                <div key={i} className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                    <div className="font-bold text-indigo-600 mb-2">Q{i+1}</div>
                                    <Input label="質問文" val={q.text} onChange={v=>{const n=[...form.questions];n[i].text=v;setForm({...form, questions:n})}} />
                                    <div className="space-y-3 mt-4">
                                        {q.options.map((o, j)=>(
                                            <div key={j} className="flex flex-col md:flex-row md:items-center gap-2 bg-white p-2 rounded border border-gray-200">
                                                <div className="flex items-center gap-2 w-full md:w-auto flex-grow">
                                                    <div className="bg-gray-200 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">{j+1}</div>
                                                    <input className="flex-grow p-1 outline-none text-sm font-bold text-gray-900 placeholder-gray-400 min-w-0" value={o.label} onChange={e=>{const n=[...form.questions];n[i].options[j].label=e.target.value;setForm({...form, questions:n})}} placeholder={`選択肢${j+1}`} />
                                                </div>
                                                <div className="flex gap-2 border-t md:border-t-0 md:border-l pt-2 md:pt-0 md:pl-2 justify-end">
                                                    {['A','B','C'].map(t=>(
                                                        <div key={t} className="flex flex-col items-center">
                                                            <span className="text-[9px] text-gray-500">{t}</span>
                                                            <input type="number" className="w-8 bg-gray-50 border border-gray-300 text-center text-xs rounded text-gray-900" value={o.score[t]} onChange={e=>{const n=[...form.questions];n[i].options[j].score[t]=e.target.value;setForm({...form, questions:n})}} />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === '結果ページ' && (
                        <div className="space-y-8 animate-fade-in">
                            <h3 className="font-bold text-xl mb-6 border-b pb-2 flex items-center gap-2 text-gray-900"><Trophy className="text-gray-400"/> 結果ページ設定</h3>
                            {form.results.map((r, i)=>(
                                <div key={i} className="bg-gray-50 p-6 rounded-xl border border-gray-200 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 bg-gray-200 text-gray-600 px-3 py-1 rounded-bl-lg font-bold text-xs">Type {r.type}</div>
                                    <Input label="診断結果タイトル" val={r.title} onChange={v=>{const n=[...form.results];n[i].title=v;setForm({...form, results:n})}} />
                                    <Textarea label="結果の説明文" val={r.description} onChange={v=>{const n=[...form.results];n[i].description=v;setForm({...form, results:n})}}/>
                                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mt-4">
                                        <p className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2"><ExternalLink size={16}/> 誘導ボタン設置 (任意)</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <Input label="リンク先URL (https://...)" val={r.link_url} onChange={v=>{const n=[...form.results];n[i].link_url=v;setForm({...form, results:n})}} ph="LPや商品ページのURL" />
                                            <Input label="ボタン文言" val={r.link_text} onChange={v=>{const n=[...form.results];n[i].link_text=v;setForm({...form, results:n})}} ph="詳細を見る" />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pt-4 border-t border-blue-200">
                                            <Input label="LINE登録URL (https://...)" val={r.line_url} onChange={v=>{const n=[...form.results];n[i].line_url=v;setForm({...form, results:n})}} ph="LINE公式アカウントのURL" />
                                            <Input label="ボタン文言" val={r.line_text} onChange={v=>{const n=[...form.results];n[i].line_text=v;setForm({...form, results:n})}} ph="LINEで相談する" />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-blue-200">
                                            <Input label="QRコード画像URL (https://...)" val={r.qr_url} onChange={v=>{const n=[...form.results];n[i].qr_url=v;setForm({...form, results:n})}} ph="画像URL" />
                                            <Input label="ボタン文言" val={r.qr_text} onChange={v=>{const n=[...form.results];n[i].qr_text=v;setForm({...form, results:n})}} ph="QRコードを表示" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

const App = () => {
  const [view, setView] = useState('portal'); 
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);

  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const fetchQuizzes = async () => {
    if(!supabase) return;
    setIsLoading(true);
    const {data} = await supabase.from('quizzes').select('*').order('created_at',{ascending:false});
    setQuizzes(data||[]);
    setIsLoading(false);
  };

  useEffect(() => {
      const init = async () => {
          const params = new URLSearchParams(window.location.search);
          const id = params.get('id');
          if(id && supabase) {
              let { data, error } = await supabase.from('quizzes').select('*').eq('slug', id).single();
              if (!data && !isNaN(id)) {
                 const res = await supabase.from('quizzes').select('*').eq('id', id).single();
                 data = res.data;
              }
              if(data) { setSelectedQuiz(data); setView('quiz'); }
          }
          if(supabase) {
              supabase.auth.getSession().then(({data:{session}})=>setUser(session?.user||null));
              const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
                setUser(session?.user || null);
              });
              await fetchQuizzes();
              return () => subscription.unsubscribe();
          }
      };
      init();
  }, []);

  useEffect(() => {
      const handlePopState = (event) => {
          if (event.state && event.state.view) {
              setView(event.state.view);
              if (event.state.view === 'quiz' && event.state.id) {
                  setView('portal');
                  setSelectedQuiz(null);
              }
          } else {
              setView('portal');
              setSelectedQuiz(null);
          }
      };
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (newView, params = {}) => {
      let url = window.location.pathname;
      if (newView === 'quiz' && params.id) {
          url += `?id=${params.id}`;
      }
      window.history.pushState({ view: newView, ...params }, '', url);
      setView(newView);
  };

  const handleSave = async (form, id) => {
      if(!supabase) return;
      try {
          const payload = {
              title: form.title, description: form.description, category: form.category, color: form.color,
              questions: form.questions, results: form.results, 
              user_id: user?.id || null,
              layout: form.layout || 'card',
              image_url: form.image_url || null
          };
          if (!id && !form.slug) { payload.slug = generateSlug(); }

          let result;
          if (id) {
             result = await supabase.from('quizzes').update(payload).eq('id',id).select(); 
          } else {
             result = await supabase.from('quizzes').insert([payload]).select();
          }
          if(result.error) throw result.error;
          if(!result.data || result.data.length === 0) throw new Error("更新できませんでした。");
          alert('保存しました！');
          await fetchQuizzes();
          return result.data[0].id;
      } catch(e) { 
          alert('保存エラー: ' + e.message); 
      }
  };

  const handleDelete = async (id) => {
      if(!confirm('本当に削除しますか？')) return;
      try {
          const { error } = await supabase.from('quizzes').delete().eq('id', id);
          if(error) throw error;
          alert('削除しました');
          await fetchQuizzes();
      } catch(e) {
          alert('削除エラー: ' + e.message);
      }
  };

  return (
    <div>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-P0E5HB1CFE"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-P0E5HB1CFE');
          `}
        </Script>
        <AuthModal isOpen={showAuth} onClose={()=>setShowAuth(false)} setUser={setUser} />
        {view === 'portal' && (
            <Portal 
                quizzes={quizzes} 
                isLoading={isLoading} 
                user={user} 
                setShowAuth={setShowAuth} 
                onLogout={async ()=>{ await supabase.auth.signOut(); alert('ログアウトしました'); }} 
                onPlay={(q)=>{ setSelectedQuiz(q); navigateTo('quiz', { id: q.slug || q.id }); }} 
                onCreate={()=>{ setEditingQuiz(null); navigateTo('editor'); }} 
                setPage={(p) => navigateTo(p)}
                onEdit={(q)=>{ setEditingQuiz(q); navigateTo('editor'); }}
                onDelete={handleDelete}
            />
        )}
        {view === 'dashboard' && <Dashboard user={user} setPage={(p) => navigateTo(p)} onLogout={async ()=>{ await supabase.auth.signOut(); navigateTo('portal');}} onEdit={(q)=>{setEditingQuiz(q); navigateTo('editor');}} onDelete={handleDelete} />}
        {view === 'faq' && <FaqPage onBack={()=>navigateTo('portal')} isAdmin={isAdmin} setPage={(p) => navigateTo(p)} user={user} onLogout={async ()=>{ await supabase.auth.signOut(); alert('ログアウトしました'); }} setShowAuth={setShowAuth} />}
        {view === 'price' && <PricePage onBack={()=>navigateTo('portal')} isAdmin={isAdmin} setPage={(p) => navigateTo(p)} user={user} onLogout={async ()=>{ await supabase.auth.signOut(); alert('ログアウトしました'); }} setShowAuth={setShowAuth} />}
        {view === 'howto' && <HowToPage onBack={()=>navigateTo('portal')} isAdmin={isAdmin} setPage={(p) => navigateTo(p)} user={user} onLogout={async ()=>{ await supabase.auth.signOut(); alert('ログアウトしました'); }} setShowAuth={setShowAuth} />}
        {view === 'quiz' && (
            <QuizPlayer 
                quiz={selectedQuiz} 
                onBack={async ()=>{ 
                    await fetchQuizzes(); // 戻る時にデータを再取得してビュー数を更新
                    navigateTo('portal'); 
                }} 
            />
        )}
        {view === 'editor' && (
            <Editor 
                user={user} 
                initialData={editingQuiz}
                setPage={(p) => navigateTo(p)}
                onBack={()=>{ navigateTo('portal'); setEditingQuiz(null);}} 
                onSave={handleSave} 
            />
        )}
    </div>
  );
};

export default App;