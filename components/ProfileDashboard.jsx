"use client";

import React, { useState, useEffect } from 'react';
import { User, LayoutDashboard, LogOut, Loader2, ExternalLink, Edit3, Trash2, Table, BarChart2, Copy, Plus, FileText, CheckCircle, ShoppingCart, Code, Download, FileSpreadsheet, Upload } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Header from './Header';
import Footer from './Footer';
import AnnouncementBanner from './AnnouncementBanner';
import { supabase } from '../lib/supabase';
import { generateSlug } from '../lib/utils';
import { generateProfileHTML } from '../lib/profileHtmlGenerator';
import { migrateOldContent } from '../lib/types';
import { getAnalytics } from '../app/actions/analytics';

const ProfileDashboard = ({ user, onEdit, onDelete, setPage, onLogout, isAdmin, onCreate }) => {
    useEffect(() => { 
        document.title = "マイページ | プロフィールLPメーカー"; 
        window.scrollTo(0, 0);
    }, []);
    
    const [myProfiles, setMyProfiles] = useState([]);
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('table');
    const [processingId, setProcessingId] = useState(null);
    const [analyticsMap, setAnalyticsMap] = useState({});
    const [exportingCsv, setExportingCsv] = useState(false);
    const [exportingSheets, setExportingSheets] = useState(false);

    // プロフィール名を取得（content配列からheaderブロックを探す）
    const getProfileName = (profile) => {
        if (!profile.content || !Array.isArray(profile.content)) return '無題のプロフィール';
        const headerBlock = profile.content.find(b => b.type === 'header');
        return headerBlock?.data?.name || '無題のプロフィール';
    };

    const fetchMyProfiles = async () => {
        console.log('[DASHBOARD] プロフィール取得開始');
        if(!user || !supabase) {
            console.log('[DASHBOARD] ユーザーまたはSupabaseがありません');
            return;
        }
        
        // 管理者の場合はすべてのプロフィールを取得、それ以外は自分のプロフィールのみ
        const query = isAdmin 
            ? supabase.from('profiles').select('*').order('created_at', { ascending: false })
            : supabase.from('profiles').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        
        console.log('[DASHBOARD] クエリ実行中... isAdmin:', isAdmin);
        const { data, error } = await query;
        
        if (error) {
            console.error('[DASHBOARD] プロフィール取得エラー:', error);
            setMyProfiles([]);
        } else {
            console.log('[DASHBOARD] プロフィール取得成功:', data?.length, '件');
            setMyProfiles(data || []);
            
            // 各プロフィールのアナリティクスを取得
            console.log('[DASHBOARD] アナリティクス取得開始');
            const analyticsPromises = (data || []).map(async (profile) => {
                const analyticsData = await getAnalytics(profile.id);
                return { profileId: profile.id, analytics: analyticsData };
            });
            const analyticsResults = await Promise.all(analyticsPromises);
            const analyticsMapObj = {};
            analyticsResults.forEach(({ profileId, analytics }) => {
                analyticsMapObj[profileId] = analytics;
            });
            setAnalyticsMap(analyticsMapObj);
            console.log('[DASHBOARD] アナリティクス取得完了');
        }
    };

    useEffect(() => {
        const init = async () => {
            // URLパラメータをチェック
            const params = new URLSearchParams(window.location.search);
            const paymentStatus = params.get('payment');
            const sessionId = params.get('session_id');
            const profileId = params.get('profile_id');
            
            console.log('📋 URLパラメータ:', { paymentStatus, sessionId, profileId, hasUser: !!user });
            
            const isPaymentSuccess = paymentStatus === 'success' && sessionId;
            
            if (isPaymentSuccess) {
                if (!user) {
                    console.log('⚠️ 決済成功を検出しましたが、ユーザー情報がありません。少し待ちます...');
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    return;
                }
                console.log('✅ 決済成功を検出！検証を開始します...');
                await verifyPayment(sessionId, profileId);
                // 決済検証後もプロフィールリストと購入履歴を読み込む
                // return を削除して処理を継続
            }
            
            if(!user) {
                console.log('⚠️ ユーザー情報がありません');
                setLoading(false);
                return;
            }
            
            await fetchMyProfiles();
            
            // 購入履歴を取得（テーブルが存在しない場合はスキップ）
            console.log('🔍 購入履歴を取得中... user.id:', user.id);
            if (supabase) {
                try {
                    const { data: bought, error } = await supabase
                        .from('profile_purchases')
                        .select('profile_id, id, created_at, stripe_session_id')
                        .eq('user_id', user.id)
                        .order('created_at', { ascending: false });
                    
                    if (error) {
                        console.warn('❌ 購入履歴の取得エラー:', error.message);
                        setPurchases([]);
                    } else {
                        console.log('📋 購入履歴を取得:', bought);
                        setPurchases(bought?.map(p => p.profile_id) || []);
                    }
                } catch (e) {
                    console.warn('❌ 購入履歴の取得に失敗:', e);
                    setPurchases([]);
                }
            }

            setLoading(false);
        };
        init();
    }, [user]);

    const verifyPayment = async (sessionId, profileId) => {
        try {
            console.log('🔍 決済検証開始:', { sessionId, profileId, userId: user.id });
            
            // 決済検証APIを呼び出し
            const res = await fetch('/api/verify-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId, profileId, userId: user.id }),
            });
            
            const data = await res.json();
            console.log('✅ 決済検証レスポンス:', data);
            
            if (res.ok) {
                console.log('✅ 決済検証成功！');
                
                // URLパラメータをクリア
                window.history.replaceState(null, '', window.location.pathname + '?page=dashboard');
                console.log('🧹 URLパラメータをクリアしました');
                
                alert('寄付ありがとうございます！Pro機能（HTML・埋め込み）が開放されました。');
            } else {
                console.error('❌ 決済検証失敗:', data);
                alert('決済の確認に失敗しました: ' + (data.error || '不明なエラー'));
            }
        } catch (e) {
            console.error('❌ 決済検証エラー:', e);
            alert('エラーが発生しました: ' + e.message);
        }
    };

    const handlePurchase = async (profile) => {
        const profileName = getProfileName(profile);
        const inputPrice = window.prompt(`「${profileName}」のPro機能を開放します。\n\n応援・寄付金額を入力してください（50円〜100,000円）。`, "1000");
        if (inputPrice === null) return;
        const price = parseInt(inputPrice, 10);
        if (isNaN(price) || price < 50 || price > 100000) {
            alert("金額は 50円以上、100,000円以下 の半角数字で入力してください。");
            return;
        }

        setProcessingId(profile.id);
        try {
            const res = await fetch('/api/checkout-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    profileId: profile.id,
                    profileName: profileName,
                    userId: user.id,
                    email: user.email,
                    price: price 
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

    const handleDownload = (profile) => {
        try {
            // 旧形式のデータをマイグレーション
            const migratedContent = migrateOldContent(profile.content);
            const htmlContent = generateProfileHTML({
                slug: profile.slug,
                content: migratedContent
            });
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${getProfileName(profile) || 'profile'}.html`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (e) {
            alert('HTML生成エラー: ' + e.message);
        }
    };

    const handleEmbed = (profile, isUnlocked) => {
        if (!isUnlocked) return alert("この機能を利用するには、寄付（購入）によるロック解除が必要です。");
        const url = `${window.location.origin}/p/${profile.slug}`;
        const code = `<iframe src="${url}" width="100%" height="600" style="border:none; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.1);"></iframe>`;
        navigator.clipboard.writeText(code);
        alert('埋め込みコードをコピーしました！\n\nWordPressなどの「カスタムHTML」ブロックに貼り付けてください。');
    };

  // 新規プロフィール作成
  const handleCreate = () => {
    // エディタ画面へ遷移（新規作成はエディタ側で処理）
    if (onCreate) {
      onCreate({});
    } else if (setPage) {
      setPage('dashboard/editor/new');
    }
  };

    // 公開URLのコピー
    const handleCopyUrl = (profile) => {
        const url = `${window.location.origin}/p/${profile.slug}`;
        navigator.clipboard.writeText(url);
        alert(`公開URLをクリップボードにコピーしました！\n\n${url}`);
    };

    // 複製機能
    const handleDuplicate = async (profile) => {
        if(!confirm(`「${getProfileName(profile)}」を複製しますか？`)) return;
        if (!supabase || !user) return;
        
        try {
            const newSlug = generateSlug();
            const { error } = await supabase.from('profiles').insert([{
                user_id: user.id,
                content: profile.content,
                slug: newSlug
            }]);
            
            if(error) throw error;
            alert('複製しました！');
            await fetchMyProfiles();
        } catch(e) {
            alert('複製エラー: ' + e.message);
        }
    };

    // CSVエクスポート機能
    const handleExportCsv = async () => {
        if (!confirm('全ユーザー情報をCSVでダウンロードしますか？')) return;
        setExportingCsv(true);
        
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            
            if (!token) {
                throw new Error('認証トークンが取得できません');
            }
            
            const response = await fetch('/api/export-users-csv', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'CSVエクスポートに失敗しました');
            }
            
            // CSVファイルをダウンロード
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            alert('CSVファイルをダウンロードしました！');
        } catch (error) {
            console.error('CSV export error:', error);
            alert('CSVエクスポートエラー: ' + error.message);
        } finally {
            setExportingCsv(false);
        }
    };

    // Googleスプレッドシートエクスポート機能
    const handleExportSheets = async () => {
        if (!confirm('全ユーザー情報をGoogleスプレッドシートに送信しますか？')) return;
        setExportingSheets(true);
        
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            
            if (!token) {
                throw new Error('認証トークンが取得できません');
            }
            
            const response = await fetch('/api/export-users-sheets', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Googleスプレッドシートへの送信に失敗しました');
            }
            
            const result = await response.json();
            alert(`Googleスプレッドシートに${result.users_count}件のユーザー情報を送信しました！`);
        } catch (error) {
            console.error('Google Sheets export error:', error);
            alert('Googleスプレッドシートエクスポートエラー: ' + error.message);
        } finally {
            setExportingSheets(false);
        }
    };

    // グラフデータ生成（プロフィール用の統計は簡略化）
    const graphData = myProfiles.map(p => ({
        name: getProfileName(p).length > 10 ? getProfileName(p).substring(0, 10)+'...' : getProfileName(p),
        views: 0, // プロフィールにはviews_countがないため0
        created: 1
    }));

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <AnnouncementBanner 
                serviceType="profile"
                onNavigateToAnnouncements={() => setPage('announcements')}
            />
            <Header setPage={setPage} user={user} onLogout={onLogout} />
            <div className="max-w-6xl mx-auto py-6 md:py-12 px-4">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
                    <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 flex items-center gap-2">
                        <LayoutDashboard size={24} className="md:w-6 md:h-6"/> ダッシュボード
                    </h1>
                    <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                        <button 
                            onClick={handleCreate} 
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 md:px-4 py-2 rounded-full font-bold text-xs md:text-sm flex items-center gap-1 md:gap-2 transition-colors"
                        >
                            <Plus size={14} className="md:w-4 md:h-4"/> <span>LPの新規作成</span>
                        </button>
                        <button 
                            onClick={onLogout} 
                            className="text-gray-500 hover:text-red-500 font-bold flex items-center gap-1 text-xs md:text-sm"
                        >
                            <LogOut size={14} className="md:w-4 md:h-4"/> <span className="hidden sm:inline">ログアウト</span>
                        </button>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-4 md:gap-8">
                    <div className="lg:col-span-1 space-y-4 md:space-y-6">
                        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-200">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="bg-indigo-100 p-3 rounded-full text-indigo-600">
                                    <User size={24}/>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-bold">
                                        ログイン中 {isAdmin && <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-[10px] ml-1">ADMIN</span>}
                                    </p>
                                    <p className="text-sm font-bold text-gray-900 break-all">{user?.email}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <div className="text-2xl font-extrabold text-indigo-600">{myProfiles.length}</div>
                                    <div className="text-xs text-gray-500 font-bold">作成数</div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <div className="text-2xl font-extrabold text-green-600">
                                        {myProfiles.length}
                                    </div>
                                    <div className="text-xs text-gray-500 font-bold">プロフィール数</div>
                                </div>
                            </div>
                        </div>

                        {/* 管理者専用：ユーザーエクスポート機能 */}
                        {isAdmin && (
                            <div className="bg-gradient-to-br from-red-50 to-orange-50 p-4 md:p-6 rounded-2xl shadow-sm border-2 border-red-200">
                                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <FileSpreadsheet size={18} className="text-red-600"/>
                                    <span>ユーザー情報エクスポート</span>
                                    <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">ADMIN</span>
                                </h3>
                                <p className="text-xs text-gray-600 mb-4">
                                    全ユーザーの登録情報をエクスポートできます
                                </p>
                                <div className="space-y-2">
                                    <button
                                        onClick={handleExportCsv}
                                        disabled={exportingCsv}
                                        className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {exportingCsv ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin"/>
                                                <span>ダウンロード中...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Download size={16}/>
                                                <span>CSVダウンロード</span>
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={handleExportSheets}
                                        disabled={exportingSheets}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {exportingSheets ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin"/>
                                                <span>送信中...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Upload size={16}/>
                                                <span>スプレッドシートに送信</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                                <p className="text-[10px] text-gray-500 mt-3 leading-relaxed">
                                    ※スプレッドシート連携には環境変数<br/>
                                    <code className="bg-white px-1 py-0.5 rounded text-[9px]">GOOGLE_SHEETS_WEBHOOK_URL</code><br/>
                                    の設定が必要です
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-2">
                        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-200 min-h-[350px]">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                                    <FileText size={18}/> プロフィール一覧
                                </h3>
                                <div className="flex bg-gray-100 rounded-lg p-1">
                                    <button 
                                        onClick={()=>setViewMode('graph')} 
                                        className={`p-1.5 rounded ${viewMode==='graph'?'bg-white shadow text-indigo-600':'text-gray-400'}`}
                                    >
                                        <BarChart2 size={16}/>
                                    </button>
                                    <button 
                                        onClick={()=>setViewMode('table')} 
                                        className={`p-1.5 rounded ${viewMode==='table'?'bg-white shadow text-indigo-600':'text-gray-400'}`}
                                    >
                                        <Table size={16}/>
                                    </button>
                                </div>
                            </div>
                            {myProfiles.length === 0 ? (
                                <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
                                    データがありません
                                </div>
                            ) : viewMode === 'graph' ? (
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={graphData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="name" tick={{fontSize: 10}} height={50} interval={0} angle={-30} textAnchor="end"/>
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="created" name="作成数" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                                    <table className="w-full text-xs md:text-sm text-left text-gray-500">
                                        <thead className="text-[10px] md:text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                                            <tr>
                                                <th className="px-2 md:px-4 py-2 md:py-3 bg-gray-50">プロフィール名</th>
                                                <th className="px-2 md:px-4 py-2 md:py-3 bg-gray-50 hidden md:table-cell">Slug</th>
                                                <th className="px-2 md:px-4 py-2 md:py-3 text-right bg-gray-50">アクセス数</th>
                                                <th className="px-2 md:px-4 py-2 md:py-3 text-right bg-gray-50">クリック数</th>
                                                <th className="px-2 md:px-4 py-2 md:py-3 text-right bg-gray-50 hidden sm:table-cell">クリック率</th>
                                                <th className="px-2 md:px-4 py-2 md:py-3 text-right bg-gray-50 hidden lg:table-cell">精読率</th>
                                                <th className="px-2 md:px-4 py-2 md:py-3 text-right bg-gray-50 hidden lg:table-cell">滞在時間</th>
                                                <th className="px-2 md:px-4 py-2 md:py-3 text-right bg-gray-50 hidden md:table-cell">作成日</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {myProfiles.map(p => {
                                                const analytics = analyticsMap[p.id] || { views: 0, clicks: 0, clickRate: 0, readRate: 0, avgTimeSpent: 0 };
                                                return (
                                                    <tr key={p.id} className="border-b hover:bg-gray-50">
                                                        <td className="px-2 md:px-4 py-2 md:py-3 font-medium text-gray-900 truncate max-w-[150px] md:max-w-[200px]">
                                                            {getProfileName(p)}
                                                        </td>
                                                        <td className="px-2 md:px-4 py-2 md:py-3 text-gray-600 font-mono text-[10px] md:text-xs hidden md:table-cell">
                                                            {p.slug}
                                                        </td>
                                                        <td className="px-2 md:px-4 py-2 md:py-3 text-right font-bold text-indigo-600">
                                                            {analytics.views}
                                                        </td>
                                                        <td className="px-2 md:px-4 py-2 md:py-3 text-right font-bold text-indigo-600">
                                                            {analytics.clicks}
                                                        </td>
                                                        <td className="px-2 md:px-4 py-2 md:py-3 text-right font-bold text-green-600 hidden sm:table-cell">
                                                            {analytics.clickRate > 0 ? `${analytics.clickRate}%` : '-'}
                                                        </td>
                                                        <td className="px-2 md:px-4 py-2 md:py-3 text-right font-bold text-blue-600 hidden lg:table-cell">
                                                            {analytics.readRate > 0 ? `${analytics.readRate}%` : '-'}
                                                        </td>
                                                        <td className="px-2 md:px-4 py-2 md:py-3 text-right font-bold text-purple-600 hidden lg:table-cell">
                                                            {analytics.avgTimeSpent > 0 ? `${analytics.avgTimeSpent}秒` : '-'}
                                                        </td>
                                                        <td className="px-2 md:px-4 py-2 md:py-3 text-right text-gray-500 text-[10px] md:text-xs hidden md:table-cell">
                                                            {p.created_at ? new Date(p.created_at).toLocaleDateString('ja-JP') : '-'}
                                                        </td>
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
                    <h2 className="text-xl font-bold text-black mb-4 border-l-4 border-indigo-600 pl-4 flex items-center gap-2">
                        {isAdmin ? '全プロフィールリスト（管理者）' : '作成したプロフィールリスト'}
                        {isAdmin && <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">ADMIN</span>}
                    </h2>
                    {loading ? (
                        <div className="text-center py-10">
                            <Loader2 className="animate-spin mx-auto text-indigo-600"/>
                        </div>
                    ) : (
                        myProfiles.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                                <p className="text-gray-500 mb-4">まだプロフィールを作成していません。</p>
                                <button 
                                    onClick={handleCreate} 
                                    className="bg-indigo-600 text-white px-6 py-2 rounded-full font-bold hover:bg-indigo-700 flex items-center gap-2 mx-auto"
                                >
                                    <Plus size={18}/> 新規作成する
                                </button>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {myProfiles.map(profile => {
                                    const profileName = getProfileName(profile);
                                    const headerBlock = profile.content?.find(b => b.type === 'header');
                                    const avatarUrl = headerBlock?.data?.avatarUrl || '';
                                    
                                    // 背景色設定の取得
                                    const gradient = profile.settings?.theme?.gradient;
                                    const backgroundImage = profile.settings?.theme?.backgroundImage;
                                    
                                    // サムネイル用のスタイルを動的に生成
                                    const thumbnailStyle = {};
                                    if (backgroundImage) {
                                        thumbnailStyle.backgroundImage = `url(${backgroundImage})`;
                                        thumbnailStyle.backgroundSize = 'cover';
                                        thumbnailStyle.backgroundPosition = 'center';
                                    } else if (gradient) {
                                        thumbnailStyle.background = gradient;
                                    }
                                    
                                    // デフォルトのクラス（背景色が設定されていない場合）
                                    const defaultBgClass = !gradient && !backgroundImage ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : '';
                                    
                                    return (
                                        <div key={profile.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow relative group">
                                            {/* ヘッダー画像エリア */}
                                            <div 
                                                className={`h-32 w-full overflow-hidden relative ${defaultBgClass}`}
                                                style={Object.keys(thumbnailStyle).length > 0 ? thumbnailStyle : undefined}
                                            >
                                                {avatarUrl && (
                                                    <img 
                                                        src={avatarUrl} 
                                                        alt={profileName} 
                                                        className="w-full h-full object-cover"
                                                    />
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4">
                                                    <div className="text-white">
                                                        <h3 className="font-bold text-sm line-clamp-1">{profileName}</h3>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="p-5">
                                                <h3 className="font-bold text-lg mb-2 line-clamp-1 text-black">{profileName}</h3>
                                                
                                                {/* URL表示とコピー */}
                                                <div className="mb-4 p-2 bg-gray-50 rounded-lg border border-gray-200">
                                                    <div className="flex items-center gap-2">
                                                        <input 
                                                            type="text" 
                                                            value={`${window.location.origin}/p/${profile.slug}`}
                                                            readOnly
                                                            className="flex-1 text-xs bg-transparent border-none outline-none text-gray-600 truncate"
                                                        />
                                                        <button 
                                                            onClick={() => handleCopyUrl(profile)}
                                                            className="text-indigo-600 hover:text-indigo-700 p-1"
                                                            title="URLをコピー"
                                                        >
                                                            <Copy size={14}/>
                                                        </button>
                                                    </div>
                                                </div>
                                                
                                                {/* アナリティクス情報 */}
                                                {analyticsMap[profile.id] && analyticsMap[profile.id].views > 0 && (
                                                    <div className="mb-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                                            <div>
                                                                <div className="text-gray-600 font-bold mb-1">アクセス数</div>
                                                                <div className="text-indigo-600 font-extrabold text-lg">{analyticsMap[profile.id].views}</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-gray-600 font-bold mb-1">クリック数</div>
                                                                <div className="text-indigo-600 font-extrabold text-lg">{analyticsMap[profile.id].clicks}</div>
                                                            </div>
                                                            {analyticsMap[profile.id].clickRate > 0 && (
                                                                <div>
                                                                    <div className="text-gray-600 font-bold mb-1">クリック率</div>
                                                                    <div className="text-green-600 font-extrabold">{analyticsMap[profile.id].clickRate}%</div>
                                                                </div>
                                                            )}
                                                            {analyticsMap[profile.id].readRate > 0 && (
                                                                <div>
                                                                    <div className="text-gray-600 font-bold mb-1">精読率</div>
                                                                    <div className="text-blue-600 font-extrabold">{analyticsMap[profile.id].readRate}%</div>
                                                                </div>
                                                            )}
                                                            {analyticsMap[profile.id].avgTimeSpent > 0 && (
                                                                <div className="col-span-2">
                                                                    <div className="text-gray-600 font-bold mb-1">平均滞在時間</div>
                                                                    <div className="text-purple-600 font-extrabold">{analyticsMap[profile.id].avgTimeSpent}秒</div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                <div className="flex gap-2 mb-2">
                                                    <button 
                                                        onClick={() => onEdit({ slug: profile.slug })} 
                                                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1"
                                                    >
                                                        <Edit3 size={14}/> 編集
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDuplicate(profile)} 
                                                        className="flex-1 bg-purple-50 hover:bg-purple-100 text-purple-600 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1"
                                                    >
                                                        <Copy size={14}/> 複製
                                                    </button>
                                                </div>

                                                <button 
                                                    onClick={() => onDelete(profile.id, fetchMyProfiles)} 
                                                    className="w-full mb-2 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1"
                                                >
                                                    <Trash2 size={14}/> 削除
                                                </button>
                                                
                                                {/* Pro機能 */}
                                                {(() => {
                                                    const isUnlocked = purchases.includes(profile.id) || isAdmin;
                                                    return (
                                                        <>
                                                            <button 
                                                                onClick={() => handleEmbed(profile, isUnlocked)} 
                                                                className={`w-full mb-2 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 ${isUnlocked ? 'bg-blue-50 hover:bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}
                                                            >
                                                                <Code size={14}/> 埋め込み
                                                            </button>
                                                            
                                                            {isUnlocked ? (
                                                                <button 
                                                                    onClick={() => handleDownload(profile)} 
                                                                    className="w-full bg-green-500 text-white py-2 rounded-lg font-bold text-xs hover:bg-green-600 flex items-center justify-center gap-1 animate-pulse"
                                                                >
                                                                    <CheckCircle size={14}/> HTMLダウンロード
                                                                </button>
                                                            ) : (
                                                                <button 
                                                                    onClick={() => handlePurchase(profile)} 
                                                                    disabled={processingId === profile.id} 
                                                                    className="w-full bg-orange-500 text-white py-2 rounded-lg font-bold text-xs hover:bg-orange-600 flex items-center justify-center gap-1"
                                                                >
                                                                    {processingId === profile.id ? <Loader2 className="animate-spin" size={14}/> : <ShoppingCart size={14}/>}
                                                                    機能開放 / 寄付
                                                                </button>
                                                            )}
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )
                    )}
                </div>
            </div>
            <Footer 
                setPage={setPage} 
                onCreate={handleCreate} 
                user={user} 
                setShowAuth={()=>{}} 
                variant="light"
            />
        </div>
    );
};

export default ProfileDashboard;

