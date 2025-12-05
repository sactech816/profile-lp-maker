import React, { useState, useEffect } from 'react';
import { User, LayoutDashboard, LogOut, Loader2, Play, ExternalLink, Edit3, Trash2, Trophy, MessageCircle, Layout, Table, BarChart2, Download, ShoppingCart, CheckCircle } from 'lucide-react';
// ↓ パス修正
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Header from './Header';
import { supabase } from '../lib/supabase';
import { generateQuizHTML } from '../lib/htmlGenerator';

const Dashboard = ({ user, onEdit, onDelete, setPage, onLogout }) => {
    useEffect(() => { document.title = "マイページ | 診断クイズメーカー"; }, []);
    const [myQuizzes, setMyQuizzes] = useState([]);
    const [purchases, setPurchases] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('graph');
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        const init = async () => {
            if(!user) return;
            
            const { data: quizzes } = await supabase.from('quizzes').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
            setMyQuizzes(quizzes || []);

            const { data: bought } = await supabase.from('purchases').select('quiz_id').eq('user_id', user.id);
            setPurchases(bought?.map(p => p.quiz_id) || []);

            const params = new URLSearchParams(window.location.search);
            if (params.get('payment') === 'success' && params.get('session_id')) {
                const quizId = params.get('quiz_id');
                await verifyPayment(params.get('session_id'), quizId);
                window.history.replaceState(null, '', window.location.pathname);
            }

            setLoading(false);
        };
        init();
    }, [user]);

    const verifyPayment = async (sessionId, quizId) => {
        try {
            const res = await fetch('/api/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId, quizId, userId: user.id }),
            });
            if (res.ok) {
                alert('寄付ありがとうございます！HTMLのダウンロードが可能になりました。');
                setPurchases(prev => [...prev, parseInt(quizId)]);
            }
        } catch (e) {
            console.error(e);
        }
    };

// 購入ボタン (Stripeへ移動)
const handlePurchase = async (quiz) => {
    // ★修正: 初期値を "1000" に設定
    const inputPrice = window.prompt(`「${quiz.title}」のHTMLデータを購入します。\n\n応援・寄付金額を入力してください（500円〜50,000円）。`, "1000");
    
    // キャンセルされた場合
    if (inputPrice === null) return;

    // ★修正: 金額のバリデーション（500円以上、50,000円以下）
    const price = parseInt(inputPrice, 10);
    if (isNaN(price) || price < 500 || price > 50000) {
        alert("金額は 500円以上、50,000円以下 の半角数字で入力してください。");
        return;
    }

    setProcessingId(quiz.id);
    try {
        const res = await fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                quizId: quiz.id,
                quizTitle: quiz.title,
                userId: user.id,
                email: user.email,
                price: price // ここで金額を送る
            }),
        });
        const data = await res.json();
        if (data.url) {
            window.location.href = data.url;
        } else {
            throw new Error('決済URLの取得に失敗しました');
        }
    } catch (e) {
        alert('エラー: ' + e.message);
        setProcessingId(null);
    }
};

    const handleDownload = (quiz) => {
        const htmlContent = generateQuizHTML(quiz);
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${quiz.title || 'quiz'}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const graphData = myQuizzes.map(q => ({
        name: q.title.length > 10 ? q.title.substring(0, 10)+'...' : q.title,
        views: q.views_count || 0,
        completions: q.completions_count || 0,
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
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 min-h-[350px]">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-gray-700 flex items-center gap-2"><Trophy size={18}/> アクセス解析</h3>
                                <div className="flex bg-gray-100 rounded-lg p-1">
                                    <button onClick={()=>setViewMode('graph')} className={`p-1.5 rounded ${viewMode==='graph'?'bg-white shadow text-indigo-600':'text-gray-400'}`}><BarChart2 size={16}/></button>
                                    <button onClick={()=>setViewMode('table')} className={`p-1.5 rounded ${viewMode==='table'?'bg-white shadow text-indigo-600':'text-gray-400'}`}><Table size={16}/></button>
                                </div>
                            </div>
                            
                            {myQuizzes.length === 0 ? (
                                <div className="h-64 flex items-center justify-center text-gray-400 text-sm">データがありません</div>
                            ) : viewMode === 'graph' ? (
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={graphData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="name" tick={{fontSize: 10}} height={50} interval={0} angle={-30} textAnchor="end"/>
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="views" name="閲覧数" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="completions" name="完了数" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="clicks" name="クリック" fill="#10b981" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left text-gray-500">
                                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3">タイトル</th>
                                                <th className="px-4 py-3 text-right">閲覧数</th>
                                                <th className="px-4 py-3 text-right">完了数</th>
                                                <th className="px-4 py-3 text-right">完了率</th>
                                                <th className="px-4 py-3 text-right">クリック</th>
                                                <th className="px-4 py-3 text-right">CTR</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {myQuizzes.map(q => {
                                                const rate = q.views_count > 0 ? Math.round((q.completions_count||0)/q.views_count*100) : 0;
                                                const ctr = q.completions_count > 0 ? Math.round((q.clicks_count||0)/q.completions_count*100) : 0;
                                                return (
                                                    <tr key={q.id} className="border-b hover:bg-gray-50">
                                                        <td className="px-4 py-3 font-medium text-gray-900 truncate max-w-[150px]">{q.title}</td>
                                                        <td className="px-4 py-3 text-right">{q.views_count||0}</td>
                                                        <td className="px-4 py-3 text-right">{q.completions_count||0}</td>
                                                        <td className="px-4 py-3 text-right text-orange-600 font-bold">{rate}%</td>
                                                        <td className="px-4 py-3 text-right">{q.clicks_count||0}</td>
                                                        <td className="px-4 py-3 text-right text-green-600 font-bold">{ctr}%</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
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
                                            <div className="flex gap-2 mb-3">
                                                <button onClick={()=>onEdit(quiz)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1"><Edit3 size={14}/> 編集</button>
                                                <button onClick={()=>onDelete(quiz.id)} className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1"><Trash2 size={14}/> 削除</button>
                                            </div>
                                            
                                            {purchases.includes(quiz.id) ? (
                                                <button onClick={()=>handleDownload(quiz)} className="w-full bg-green-500 text-white py-2 rounded-lg font-bold text-xs hover:bg-green-600 flex items-center justify-center gap-1 animate-pulse">
                                                    <CheckCircle size={14}/> HTMLダウンロード
                                                </button>
                                            ) : (
                                                <button onClick={()=>handlePurchase(quiz)} disabled={processingId === quiz.id} className="w-full bg-orange-500 text-white py-2 rounded-lg font-bold text-xs hover:bg-orange-600 flex items-center justify-center gap-1">
                                                    {processingId === quiz.id ? <Loader2 className="animate-spin" size={14}/> : <ShoppingCart size={14}/>}
                                                    HTML購入 (寄付)
                                                </button>
                                            )}
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

export default Dashboard;