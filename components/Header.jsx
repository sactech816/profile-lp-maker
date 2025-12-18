import React, { useState } from 'react';
import { Sparkles, User, LayoutDashboard, TrendingUp, Menu, X, LogOut, HelpCircle, FileText, Lightbulb, Mail, Shield, Scale, PlusCircle, Bell } from 'lucide-react';

const Header = ({ setPage, user, onLogout, setShowAuth = null }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleNav = (page) => {
        setPage(page);
        setIsMenuOpen(false);
    };


    return (
        <div className="bg-white border-b sticky top-0 z-50 shadow-sm">
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                <div className="font-bold text-xl flex items-center gap-2 text-indigo-700 cursor-pointer" onClick={()=>handleNav('landing')}>
                    <Sparkles className="text-pink-500"/> Profile LP Maker
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-4 text-sm font-bold text-gray-600">
                        <button onClick={()=>{setPage('profile-editor'); setIsMenuOpen(false);}} className="text-gray-600 hover:text-indigo-600 flex items-center gap-1">
                            <PlusCircle size={16}/> 新規作成
                        </button>
                        <button onClick={()=>handleNav('announcements')} className="text-gray-600 hover:text-indigo-600 flex items-center gap-1">
                            <Bell size={16}/> お知らせ
                        </button>
                        <button onClick={()=>handleNav('contact')} className="text-gray-600 hover:text-indigo-600 flex items-center gap-1">
                            <Mail size={16}/> お問い合わせ
                        </button>
                        <button onClick={()=>handleNav('profile-howto')} className="text-gray-600 hover:text-indigo-600 flex items-center gap-1">
                            <HelpCircle size={16}/> 使い方
                        </button>
                        <button onClick={()=>handleNav('profile-effective')} className="text-gray-600 hover:text-indigo-600 flex items-center gap-1">
                            <Lightbulb size={16}/> 効果的な利用方法
                        </button>
                        {user ? (
                            <>
                                <button onClick={()=>handleNav('dashboard')} className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full flex items-center gap-2 hover:bg-indigo-100 transition-colors">
                                    <LayoutDashboard size={16}/> ダッシュボード
                                </button>
                                <button onClick={()=>{onLogout(); setIsMenuOpen(false);}} className="text-gray-600 hover:text-red-600 flex items-center gap-1">
                                    <LogOut size={16}/> ログアウト
                                </button>
                            </>
                        ) : (
                            setShowAuth && (
                                <button onClick={()=>setShowAuth(true)} className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors flex items-center gap-2">
                                    <User size={16}/> ログイン
                                </button>
                            )
                        )}
                    </div>

                    <button className="md:hidden text-gray-600 p-2" onClick={()=>setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X size={28}/> : <Menu size={28}/>}
                    </button>
                </div>
            </div>

            {isMenuOpen && (
                <div className="md:hidden bg-white border-t absolute w-full left-0 top-16 shadow-xl py-4 px-6 flex flex-col gap-2 animate-fade-in z-50 h-[calc(100vh-64px)] overflow-y-auto pb-20">
                    <p className="text-xs font-bold text-gray-400 mt-4 mb-2">メニュー</p>
                    <button onClick={()=>{setPage('profile-editor'); setIsMenuOpen(false);}} className="flex items-center gap-3 py-3 border-b border-gray-100 text-indigo-600 font-bold"><PlusCircle size={20}/> 新規作成</button>
                    <button onClick={()=>handleNav('dashboard')} className="flex items-center gap-3 py-3 border-b border-gray-100 text-indigo-600 font-bold"><LayoutDashboard size={20}/> ダッシュボード</button>
                    
                    <p className="text-xs font-bold text-gray-400 mt-4 mb-2">コンテンツページ</p>
                    <button onClick={()=>handleNav('announcements')} className="flex items-center gap-3 py-3 border-b border-gray-100 text-indigo-600 font-bold"><Bell size={20}/> お知らせ</button>
                    <button onClick={()=>handleNav('profile-howto')} className="flex items-center gap-3 py-3 border-b border-gray-100 text-gray-700 font-bold"><HelpCircle size={20}/> 使い方</button>
                    <button onClick={()=>handleNav('profile-effective')} className="flex items-center gap-3 py-3 border-b border-gray-100 text-gray-700 font-bold"><Lightbulb size={20}/> 効果的な利用方法</button>
                    <button onClick={()=>handleNav('contact')} className="flex items-center gap-3 py-3 border-b border-gray-100 text-gray-700 font-bold"><Mail size={20}/> お問い合わせ</button>
                    
                    <p className="text-xs font-bold text-gray-400 mt-6 mb-2">サポート・規約</p>
                    <button onClick={()=>handleNav('legal')} className="flex items-center gap-3 py-3 border-b border-gray-100 text-gray-500 font-bold text-xs"><Scale size={16}/> 特定商取引法に基づく表記</button>
                    <button onClick={()=>handleNav('privacy')} className="flex items-center gap-3 py-3 border-b border-gray-100 text-gray-500 font-bold text-xs"><Shield size={16}/> プライバシーポリシー</button>
                    
                    <div className="mt-8">
                    {user ? (
                        <>
                            <button onClick={()=>handleNav('dashboard')} className="w-full bg-indigo-50 text-indigo-700 py-3 rounded-xl flex items-center justify-center gap-2 font-bold mb-2"><LayoutDashboard size={20}/> ダッシュボード</button>
                            <button onClick={()=>{onLogout(); setIsMenuOpen(false);}} className="w-full border border-red-100 text-red-600 py-3 rounded-xl flex items-center justify-center gap-2 font-bold"><LogOut size={20}/> ログアウト</button>
                        </>
                    ) : (
                        setShowAuth && (
                            <button onClick={()=>{setShowAuth(true); setIsMenuOpen(false);}} className="bg-black text-white w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                                <User size={20}/> ログイン / 新規登録
                            </button>
                        )
                    )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Header;
