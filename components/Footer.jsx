import React from 'react';
import { Sparkles } from 'lucide-react';

const Footer = ({ setPage, onCreate, user, setShowAuth }) => {
    const handleCreate = () => {
        if (onCreate) {
            onCreate();
        } else {
            setPage('dashboard');
        }
    };

    return (
        <footer className="bg-gray-900 text-gray-400 py-12 mt-12 border-t border-gray-800">
            <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-4 gap-8">
                <div className="col-span-1 md:col-span-2">
                    <h2 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
                        <Sparkles className="text-pink-500"/> Profile LP Maker
                    </h2>
                    <p className="text-sm leading-relaxed mb-6 opacity-80">
                        世界一美しいプロフィールページを、<br/>
                        ノーコードで誰でも簡単に作成・公開できるプラットフォーム。<br/>
                        あなたの魅力を伝える「集客導線」を作りましょう。
                    </p>
                    <button onClick={handleCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-full transition-colors">
                        無料で作成をはじめる
                    </button>
                </div>

                <div>
                    <h3 className="text-white font-bold mb-4 border-b border-gray-700 pb-2 inline-block">メニュー</h3>
                    <ul className="space-y-3 text-sm">
                        <li><button onClick={()=>setPage('dashboard')} className="hover:text-white transition-colors flex items-center gap-2">➤ ダッシュボード</button></li>
                        <li><button onClick={()=>setPage('landing')} className="hover:text-white transition-colors flex items-center gap-2">➤ トップページ</button></li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-white font-bold mb-4 border-b border-gray-700 pb-2 inline-block">サポート・規約</h3>
                    <ul className="space-y-3 text-sm">
                        <li><button onClick={()=>setPage('contact')} className="hover:text-white transition-colors">お問い合わせ</button></li>
                        <li><button onClick={()=>setPage('legal')} className="hover:text-white transition-colors">特定商取引法に基づく表記</button></li>
                        <li><button onClick={()=>setPage('privacy')} className="hover:text-white transition-colors">プライバシーポリシー</button></li>
                    </ul>
                </div>
            </div>
            
            <div className="max-w-6xl mx-auto px-4 mt-12 pt-8 border-t border-gray-800 text-center text-xs opacity-60">
                &copy; {new Date().getFullYear()} Profile LP Maker. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;
