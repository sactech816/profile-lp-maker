"use client";

import React from 'react';
import { Sparkles } from 'lucide-react';

const Footer = ({ setPage, onCreate, user, setShowAuth, variant = 'dark' }) => {
    const isLight = variant === 'light';

    const handleCreate = () => {
        if (onCreate) {
            onCreate();
        } else if (setPage) {
            setPage('profile-editor');
        } else {
            window.location.href = 'https://lp.makers.tokyo/?page=profile-editor';
        }
    };

    const handleNav = (page) => {
        if (setPage) {
            setPage(page);
        } else {
            window.location.href = `?page=${page}`;
        }
    };

    return (
        <footer className={`${isLight ? 'bg-white text-gray-700 border border-gray-200 shadow-sm' : 'bg-gray-900/50 backdrop-blur-sm text-gray-400'} py-8 mt-12 rounded-2xl mx-4 mb-4`}>
            <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-4 gap-8">
                <div className="col-span-1 md:col-span-2">
                    <h2 className={`${isLight ? 'text-gray-900' : 'text-white'} font-bold text-xl mb-4 flex items-center gap-2`}>
                        <Sparkles className="text-pink-500"/> Profile LP Maker
                    </h2>
                    <p className={`text-sm leading-relaxed mb-6 ${isLight ? 'text-gray-600' : 'opacity-80'}`}>
                        世界一美しいプロフィールページを、<br/>
                        ノーコードで誰でも簡単に作成・公開できるプラットフォーム。<br/>
                        あなたの魅力を伝える「集客導線」を作りましょう。
                    </p>
                    <button onClick={handleCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-full transition-colors">
                        無料で作成をはじめる
                    </button>
                </div>

                <div>
                    <h3 className={`${isLight ? 'text-gray-900 border-gray-200' : 'text-white border-gray-700'} font-bold mb-4 border-b pb-2 inline-block`}>メニュー</h3>
                    <ul className="space-y-3 text-sm">
                        <li><button onClick={()=>handleNav('dashboard')} className={`${isLight ? 'text-gray-700 hover:text-indigo-600' : 'text-gray-300 hover:text-white'} transition-colors flex items-center gap-2`}>➤ ダッシュボード</button></li>
                        <li><button onClick={()=>handleNav('landing')} className={`${isLight ? 'text-gray-700 hover:text-indigo-600' : 'text-gray-300 hover:text-white'} transition-colors flex items-center gap-2`}>➤ トップページ</button></li>
                        <li><button onClick={()=>handleNav('profile-howto')} className={`${isLight ? 'text-gray-700 hover:text-indigo-600' : 'text-gray-300 hover:text-white'} transition-colors flex items-center gap-2`}>➤ 使い方</button></li>
                        <li><button onClick={()=>handleNav('profile-effective')} className={`${isLight ? 'text-gray-700 hover:text-indigo-600' : 'text-gray-300 hover:text-white'} transition-colors flex items-center gap-2`}>➤ 効果的な利用方法</button></li>
                    </ul>
                </div>

                <div>
                    <h3 className={`${isLight ? 'text-gray-900 border-gray-200' : 'text-white border-gray-700'} font-bold mb-4 border-b pb-2 inline-block`}>サポート・規約</h3>
                    <ul className="space-y-3 text-sm">
                        <li><button onClick={()=>handleNav('contact')} className={`${isLight ? 'text-gray-700 hover:text-indigo-600' : 'text-gray-300 hover:text-white'} transition-colors`}>お問い合わせ</button></li>
                        <li><button onClick={()=>handleNav('legal')} className={`${isLight ? 'text-gray-700 hover:text-indigo-600' : 'text-gray-300 hover:text-white'} transition-colors`}>特定商取引法に基づく表記</button></li>
                        <li><button onClick={()=>handleNav('privacy')} className={`${isLight ? 'text-gray-700 hover:text-indigo-600' : 'text-gray-300 hover:text-white'} transition-colors`}>プライバシーポリシー</button></li>
                    </ul>
                </div>
            </div>
            
            <div className={`max-w-6xl mx-auto px-4 mt-12 pt-8 text-center text-xs ${isLight ? 'text-gray-500 border-t border-gray-200' : 'opacity-60 border-t border-gray-800'}`}>
                &copy; {new Date().getFullYear()} Profile LP Maker. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;
