import React, { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

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
                    options: { 
                        emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : undefined,
                        data: {
                            app_name: '診断クイズメーカー',
                            purpose: 'account_verification'
                        }
                    }
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

export default AuthModal;