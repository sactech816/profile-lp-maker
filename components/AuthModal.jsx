import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const AuthModal = ({ isOpen, onClose, setUser, isPasswordReset = false, setShowPasswordReset, onNavigate }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [isResetMode, setIsResetMode] = useState(false);
    const [isChangePasswordMode, setIsChangePasswordMode] = useState(isPasswordReset);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [resetSent, setResetSent] = useState(false);
    const [resetEmailAddress, setResetEmailAddress] = useState('');
    const [canResend, setCanResend] = useState(false);
    const [resendCountdown, setResendCountdown] = useState(0);
    const [sessionReady, setSessionReady] = useState(false);
    
    // パスワード表示/非表示の状態
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    // isPasswordResetが変更されたときにisChangePasswordModeを更新
    useEffect(() => {
        setIsChangePasswordMode(isPasswordReset);
    }, [isPasswordReset]);
    
    // パスワードリセットモードの場合、セッションを確立
    useEffect(() => {
        const establishSession = async () => {
            if (!isPasswordReset || !supabase) return;
            
            console.log('🔧 パスワードリセットモード: セッション確立を開始');
            
            // まず現在のセッションを確認
            const { data: currentSession } = await supabase.auth.getSession();
            if (currentSession?.session) {
                console.log('✅ 既存のセッションが見つかりました');
                setSessionReady(true);
                return;
            }
            
            // URLからトークンを取得
            const hash = window.location.hash;
            const search = window.location.search;
            
            const hashParams = new URLSearchParams(hash.substring(1));
            let accessToken = hashParams.get('access_token');
            let refreshToken = hashParams.get('refresh_token');
            
            if (!accessToken) {
                const searchParams = new URLSearchParams(search);
                accessToken = searchParams.get('access_token');
                refreshToken = searchParams.get('refresh_token');
            }
            
            console.log('🔍 トークン検索結果:', { 
                hasAccessToken: !!accessToken, 
                hasRefreshToken: !!refreshToken 
            });
            
            if (accessToken) {
                try {
                    console.log('🔄 セッションを確立中...');
                    const { data, error } = await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken || ''
                    });
                    
                    if (error) {
                        console.error('❌ セッション確立エラー:', error);
                    } else {
                        console.log('✅ セッション確立成功');
                        if (data.user) {
                            setUser(data.user);
                        }
                        setSessionReady(true);
                    }
                } catch (e) {
                    console.error('❌ セッション確立例外:', e);
                }
            } else {
                console.warn('⚠️ トークンが見つかりません');
                // トークンがない場合でも画面は表示（エラーは後で表示）
                setSessionReady(true);
            }
        };
        
        establishSession();
    }, [isPasswordReset, setUser]);
    
    // 再送信タイマー
    useEffect(() => {
        if (resendCountdown > 0) {
            const timer = setTimeout(() => {
                setResendCountdown(resendCountdown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (resendCountdown === 0 && resetSent) {
            setCanResend(true);
        }
    }, [resendCountdown, resetSent]);
    
    if (!isOpen && !isPasswordReset) return null;
    
    const handleAuth = async (e) => {
        e.preventDefault(); setLoading(true);
        try {
            // 現在のドメインを取得してリダイレクトURLを動的に設定
            const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
            const redirectUrl = currentOrigin.includes('localhost') 
                ? 'https://lp.makers.tokyo/' 
                : `${currentOrigin}/`;
            
            const { data, error } = isLogin 
                ? await supabase.auth.signInWithPassword({ email, password })
                : await supabase.auth.signUp({ 
                    email, 
                    password,
                    options: { emailRedirectTo: redirectUrl }
                  });
            
            if (error) {
                console.log('認証エラー詳細:', error);
                // 重複メールアドレスのエラーハンドリング
                if (!isLogin && (
                    error.message.includes('already registered') || 
                    error.message.includes('User already registered') ||
                    error.message.includes('already been registered') ||
                    error.status === 422 || // Supabaseの重複エラーステータス
                    error.code === '23505' // PostgreSQLの重複エラーコード
                )) {
                    console.log('重複メールエラーを検出しました。ログインを試みます。');
                    // パスワードが合っているか試してみる
                    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ 
                        email, 
                        password 
                    });
                    
                    if (!loginError && loginData.user) {
                        // パスワードが合っていた場合、自動的にログイン
                        alert('このメールアドレスは既に登録されています。\n\n自動的にログインしました。');
                        setUser(loginData.user);
                        // パスワードリセットモードをリセット
                        if (setShowPasswordReset) {
                            setShowPasswordReset(false);
                        }
                        onClose();
                        // ログイン成功時にマイページにリダイレクト
                        if (onNavigate) {
                            onNavigate('dashboard');
                        } else if (typeof window !== 'undefined' && window.location.pathname !== '/dashboard') {
                            window.location.href = '/dashboard';
                        }
                        setLoading(false);
                        return;
                    } else {
                        // パスワードが間違っている場合、ログイン画面に切り替え
                        alert(
                            '【重要】このメールアドレスは既に登録されています。\n\n' +
                            '※メールは送信されていません。\n\n' +
                            'ログイン画面に切り替えます。\n' +
                            'パスワードを忘れた場合は「パスワードを忘れた方」をクリックしてください。'
                        );
                        // 自動的にログイン画面に切り替え
                        setIsLogin(true);
                        // パスワードのみクリア（メールアドレスは保持）
                        setPassword('');
                        setLoading(false);
                        return;
                    }
                }
                throw error;
            }
            
            // 新規登録の場合、エラーがなくてもユーザーが既に存在する可能性がある
            // （Supabaseの設定によっては重複登録を許可する場合がある）
            if (!isLogin && data.user) {
                // セッションがない場合は確認メールが送信された
                if (!data.session) {
                    // メールが本当に送信されたか確認するため、ユーザーが既に存在するかチェック
                    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ 
                        email, 
                        password 
                    });
                    
                    if (!loginError && loginData.user) {
                        // ユーザーが既に存在し、パスワードが合っている
                        alert('このメールアドレスは既に登録されています。\n\n自動的にログインしました。');
                        setUser(loginData.user);
                        // パスワードリセットモードをリセット
                        if (setShowPasswordReset) {
                            setShowPasswordReset(false);
                        }
                        onClose();
                        if (onNavigate) {
                            onNavigate('dashboard');
                        } else if (typeof window !== 'undefined' && window.location.pathname !== '/dashboard') {
                            window.location.href = '/dashboard';
                        }
                        setLoading(false);
                        return;
                    } else {
                        // 新規登録で確認メールが送信された
                        alert('確認メールを送信しました。メール内のリンクをクリックして認証を完了させてください。');
                        setLoading(false);
                        return;
                    }
                }
            }

            if (isLogin && data.user) { 
                setUser(data.user); 
                // パスワードリセットモードをリセット
                if (setShowPasswordReset) {
                    setShowPasswordReset(false);
                }
                onClose();
                // ログイン成功時にマイページにリダイレクト
                if (onNavigate) {
                    onNavigate('dashboard');
                } else if (typeof window !== 'undefined' && window.location.pathname !== '/dashboard') {
                    window.location.href = '/dashboard';
                }
            } else if (!isLogin && data.user) {
                if (!data.session) alert('確認メールを送信しました。メール内のリンクをクリックして認証を完了させてください。');
                else { 
                    setUser(data.user); 
                    // パスワードリセットモードをリセット
                    if (setShowPasswordReset) {
                        setShowPasswordReset(false);
                    }
                    onClose();
                    // 新規登録後もログイン成功時と同様にマイページにリダイレクト
                    if (onNavigate) {
                        onNavigate('dashboard');
                    } else if (typeof window !== 'undefined' && window.location.pathname !== '/dashboard') {
                        window.location.href = '/dashboard';
                    }
                }
            }
        } catch (e) { 
            console.error('認証エラー:', e);
            
            // エラーメッセージをユーザーフレンドリーに変換
            let errorMessage = 'エラー';
            
            if (e.message.includes('Invalid login credentials') || 
                e.message.includes('Invalid email or password')) {
                errorMessage = isLogin 
                    ? 'メールアドレスまたはパスワードが正しくありません。\n\nパスワードを忘れた場合は「パスワードを忘れた方」をクリックしてください。'
                    : 'メールアドレスまたはパスワードが正しくありません。';
            } else if (e.message.includes('Email not confirmed')) {
                errorMessage = 'メールアドレスが確認されていません。\n\n確認メールをご確認ください。';
            } else if (e.message.includes('User not found')) {
                errorMessage = 'このメールアドレスは登録されていません。';
            } else if (e.message.includes('Email rate limit exceeded')) {
                errorMessage = '送信回数が上限に達しました。\n\nしばらく時間をおいてから再度お試しください。';
            } else {
                errorMessage = 'エラー: ' + e.message;
            }
            
            alert(errorMessage);
        } finally { 
            setLoading(false); 
        }
    };

    const handlePasswordReset = async (e, isResend = false) => {
        e.preventDefault();
        if (!email) {
            alert('メールアドレスを入力してください。');
            return;
        }
        setLoading(true);
        try {
            // 現在のドメインを取得してリダイレクトURLを動的に設定
            // 本番環境では現在のオリジンを使用、開発環境では本番URLを使用
            const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
            const redirectUrl = currentOrigin.includes('localhost') 
                ? 'https://lp.makers.tokyo/' 
                : `${currentOrigin}/`;
            
            console.log('=== パスワードリセット デバッグ情報 ===');
            console.log('メールアドレス:', email);
            console.log('現在のオリジン:', currentOrigin);
            console.log('リダイレクトURL:', redirectUrl);
            console.log('Supabase URL:', supabase.supabaseUrl);
            
            const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: redirectUrl
            });
            
            // エラーハンドリングの強化
            if (error) {
                // セキュリティのため、詳細なエラーは表示せず一般的なメッセージを表示
                console.error('Password reset error:', error);
                console.error('Error details:', JSON.stringify(error, null, 2));
                // ただし、ユーザーには成功メッセージを表示（メールアドレスの存在を推測されないため）
            } else {
                console.log('パスワードリセットメール送信成功');
                console.log('Response data:', JSON.stringify(data, null, 2));
            }
            console.log('=====================================');
            
            // 成功時の処理
            setResetSent(true);
            setResetEmailAddress(email);
            setCanResend(false);
            setResendCountdown(60); // 60秒後に再送信可能
            
            if (isResend) {
                alert('パスワードリセットメールを再送信しました。');
            }
        } catch (e) {
            // エラーの場合でも、セキュリティのため成功メッセージを表示
            console.error('Password reset error:', e);
            setResetSent(true);
            setResetEmailAddress(email);
            setCanResend(false);
            setResendCountdown(60);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (!newPassword || !confirmPassword) {
            alert('新しいパスワードを入力してください。');
            return;
        }
        if (newPassword !== confirmPassword) {
            alert('パスワードが一致しません。');
            return;
        }
        if (newPassword.length < 6) {
            alert('パスワードは6文字以上で入力してください。');
            return;
        }
        setLoading(true);
        try {
            console.log('パスワード更新を開始します');
            
            // セッションの確認
            const { data: sessionData } = await supabase.auth.getSession();
            console.log('現在のセッション:', sessionData.session ? 'あり' : 'なし');
            
            if (!sessionData.session) {
                console.log('セッションがありません。URLからトークンを取得して再確立を試みます。');
                
                // URLのハッシュとクエリパラメータの両方をチェック
                const hash = window.location.hash;
                const search = window.location.search;
                
                console.log('現在のURL hash:', hash);
                console.log('現在のURL search:', search);
                
                // ハッシュからトークンを取得
                const hashParams = new URLSearchParams(hash.substring(1));
                let accessToken = hashParams.get('access_token');
                let refreshToken = hashParams.get('refresh_token');
                
                // ハッシュにない場合はクエリパラメータをチェック
                if (!accessToken) {
                    const searchParams = new URLSearchParams(search);
                    accessToken = searchParams.get('access_token');
                    refreshToken = searchParams.get('refresh_token');
                }
                
                console.log('取得したトークン:', { 
                    hasAccessToken: !!accessToken, 
                    hasRefreshToken: !!refreshToken 
                });
                
                if (accessToken) {
                    console.log('URLからアクセストークンを検出しました');
                    // トークンを使ってセッションを設定
                    const { data: sessionSetData, error: sessionError } = await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken || ''
                    });
                    
                    if (sessionError) {
                        console.error('セッション設定エラー:', sessionError);
                        alert('セッションの確立に失敗しました。\n\nパスワードリセットメールのリンクをもう一度クリックしてください。');
                        setLoading(false);
                        return;
                    }
                    
                    console.log('セッションを再確立しました:', sessionSetData.session ? 'あり' : 'なし');
                } else {
                    console.error('URLにアクセストークンが見つかりません');
                    console.log('完全なURL:', window.location.href);
                    alert('パスワードリセットのセッションが見つかりません。\n\nパスワードリセットメールのリンクをもう一度クリックしてください。');
                    setLoading(false);
                    return;
                }
            }
            
            // パスワードを更新
            const { data, error } = await supabase.auth.updateUser({
                password: newPassword
            });
            
            if (error) {
                console.error('パスワード更新エラー:', error);
                
                // エラーメッセージをユーザーフレンドリーに変換
                let errorMessage = 'パスワード変更エラー';
                
                if (error.message.includes('New password should be different')) {
                    errorMessage = '新しいパスワードは、現在のパスワードと異なるものを設定してください。';
                } else if (error.message.includes('Password should be')) {
                    errorMessage = 'パスワードは6文字以上で入力してください。';
                } else if (error.message.includes('same as the old password')) {
                    errorMessage = '新しいパスワードは、以前のパスワードと異なるものを設定してください。';
                } else if (error.message.includes('Auth session missing')) {
                    errorMessage = 'セッションが見つかりません。\n\nパスワードリセットメールのリンクをもう一度クリックしてください。';
                } else {
                    errorMessage = error.message;
                }
                
                alert(errorMessage);
                setLoading(false);
                return;
            }
            
            console.log('パスワード更新成功:', data);
            alert('パスワードを変更しました。\n\n新しいパスワードでログインできます。');
            
            // 状態をリセット
            setIsChangePasswordMode(false);
            setNewPassword('');
            setConfirmPassword('');
            
            // showPasswordResetをfalseに設定（重要）
            // これがないと、ログイン後もパスワード変更画面が残る
            if (setShowPasswordReset) {
                setShowPasswordReset(false);
            }
            
            // URLのハッシュをクリア
            if (typeof window !== 'undefined') {
                window.history.replaceState(null, '', window.location.pathname);
            }
            
            // モーダルを閉じる
            if (onClose) {
                onClose();
            }
            
            // マイページにリダイレクト
            if (onNavigate) {
                onNavigate('dashboard');
            } else if (typeof window !== 'undefined') {
                window.location.href = '/dashboard';
            }
        } catch (e) {
            console.error('パスワード変更エラー:', e);
            
            // エラーメッセージをユーザーフレンドリーに変換
            let errorMessage = 'パスワード変更エラー';
            
            if (e.message.includes('New password should be different')) {
                errorMessage = '新しいパスワードは、現在のパスワードと異なるものを設定してください。';
            } else if (e.message.includes('Password should be')) {
                errorMessage = 'パスワードは6文字以上で入力してください。';
            } else if (e.message.includes('same as the old password')) {
                errorMessage = '新しいパスワードは、以前のパスワードと異なるものを設定してください。';
            } else if (e.message.includes('Auth session missing')) {
                errorMessage = 'セッションが見つかりません。\n\nパスワードリセットメールのリンクをもう一度クリックしてください。';
            } else {
                errorMessage = e.message;
            }
            
            alert(errorMessage + '\n\nもう一度お試しください。');
        } finally {
            setLoading(false);
        }
    };

    // パスワード変更モード（メールリンクから来た場合）
    if (isChangePasswordMode) {
        // セッション確立中はローディング表示
        if (!sessionReady) {
            return (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl relative animate-fade-in">
                        <div className="flex flex-col items-center justify-center space-y-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                            <p className="text-sm text-gray-600 text-center">
                                セッションを確立中...
                            </p>
                        </div>
                    </div>
                </div>
            );
        }
        
        return (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
                <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl relative animate-fade-in">
                    <h2 className="text-xl font-bold mb-6 text-center text-gray-900">新しいパスワードを設定</h2>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <p className="text-sm text-gray-600 mb-4">
                            新しいパスワードを入力してください。
                        </p>
                        
                        {/* 新しいパスワード入力欄（表示/非表示ボタン付き） */}
                        <div className="relative">
                            <input 
                                type={showNewPassword ? "text" : "password"} 
                                required 
                                value={newPassword} 
                                onChange={e=>setNewPassword(e.target.value)} 
                                className="w-full border border-gray-300 p-3 pr-12 rounded-lg bg-gray-50 text-gray-900" 
                                placeholder="新しいパスワード" 
                                minLength={6}
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                tabIndex={-1}
                            >
                                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        
                        {/* パスワード確認入力欄（表示/非表示ボタン付き） */}
                        <div className="relative">
                            <input 
                                type={showConfirmPassword ? "text" : "password"} 
                                required 
                                value={confirmPassword} 
                                onChange={e=>setConfirmPassword(e.target.value)} 
                                className="w-full border border-gray-300 p-3 pr-12 rounded-lg bg-gray-50 text-gray-900" 
                                placeholder="パスワード（確認）" 
                                minLength={6}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                tabIndex={-1}
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        
                        <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors">
                            {loading ? '処理中...' : 'パスワードを変更'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // パスワードリセットメール送信モード
    if (isResetMode) {
        return (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
                <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl relative animate-fade-in">
                    <button onClick={() => { setIsResetMode(false); setResetSent(false); setEmail(''); setCanResend(false); setResendCountdown(0); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X/></button>
                    <h2 className="text-xl font-bold mb-6 text-center text-gray-900">パスワードリセット</h2>
                    {resetSent ? (
                        <div className="text-center space-y-4">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <p className="text-sm text-green-800 font-bold mb-2">
                                    パスワードリセット用のメールを送信しました。
                                </p>
                                <p className="text-xs text-green-700">
                                    送信先: <span className="font-mono">{resetEmailAddress}</span>
                                </p>
                            </div>
                            
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                                <p className="text-xs text-blue-900 font-bold mb-2">📧 メール内のリンクをクリック</p>
                                <p className="text-xs text-blue-800 mb-3">
                                    メール内のリンクをクリックして、新しいパスワードを設定してください。
                                </p>
                                <p className="text-xs text-blue-900 font-bold mb-2">⏰ メールが届かない場合</p>
                                <ul className="text-xs text-blue-800 space-y-1 ml-4 list-disc">
                                    <li>迷惑メールフォルダをご確認ください</li>
                                    <li>メールアドレスが正しいかご確認ください</li>
                                    <li>数分待ってから再送信をお試しください</li>
                                </ul>
                            </div>

                            {/* 再送信ボタン */}
                            <button 
                                onClick={(e) => handlePasswordReset(e, true)}
                                disabled={!canResend || loading}
                                className={`w-full font-bold py-3 rounded-lg transition-colors ${
                                    canResend && !loading
                                        ? 'bg-green-600 text-white hover:bg-green-700'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                            >
                                {loading ? '送信中...' : canResend ? 'メールを再送信' : `再送信可能まで ${resendCountdown}秒`}
                            </button>

                            {/* 管理者への連絡 */}
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                <p className="text-xs text-yellow-900 mb-2">
                                    <span className="font-bold">💡 それでも解決しない場合</span>
                                </p>
                                <p className="text-xs text-yellow-800 mb-2">
                                    お手数ですが、以下の連絡先までお問い合わせください。
                                </p>
                                <p className="text-xs text-yellow-900 font-mono bg-white px-2 py-1 rounded">
                                    サポート: support@makers.tokyo
                                </p>
                            </div>
                            
                            <button 
                                onClick={() => { setIsResetMode(false); setResetSent(false); setEmail(''); setCanResend(false); setResendCountdown(0); }}
                                className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                ログイン画面に戻る
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={(e) => handlePasswordReset(e, false)} className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-900 font-bold mb-2">
                                    パスワードをお忘れですか？
                                </p>
                                <p className="text-xs text-blue-800">
                                    登録済みのメールアドレスを入力してください。<br/>
                                    パスワードリセット用のリンクを送信します。
                                </p>
                            </div>
                            <input 
                                type="email" 
                                required 
                                value={email} 
                                onChange={e=>setEmail(e.target.value)} 
                                className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50 text-gray-900" 
                                placeholder="登録済みのメールアドレス" 
                            />
                            <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                                {loading ? '送信中...' : 'リセットメールを送信'}
                            </button>
                            <button 
                                type="button"
                                onClick={() => { setIsResetMode(false); setEmail(''); }} 
                                className="w-full text-center text-sm text-gray-600 font-bold underline hover:text-gray-800"
                            >
                                ログイン画面に戻る
                            </button>
                        </form>
                    )}
                </div>
            </div>
        );
    }
    
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl relative animate-fade-in">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X/></button>
                <h2 className="text-xl font-bold mb-6 text-center text-gray-900">{isLogin ? 'ログイン' : '新規登録'}</h2>
                <form onSubmit={handleAuth} className="space-y-4">
                    <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50 text-gray-900" placeholder="Email" />
                    
                    {/* パスワード入力欄（表示/非表示ボタン付き） */}
                    <div className="relative">
                        <input 
                            type={showPassword ? "text" : "password"} 
                            required 
                            value={password} 
                            onChange={e=>setPassword(e.target.value)} 
                            className="w-full border border-gray-300 p-3 pr-12 rounded-lg bg-gray-50 text-gray-900" 
                            placeholder="Password" 
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            tabIndex={-1}
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    
                    {isLogin && (
                        <button 
                            type="button"
                            onClick={() => setIsResetMode(true)} 
                            className="w-full text-right text-xs text-indigo-600 font-bold underline"
                        >
                            パスワードを忘れた方
                        </button>
                    )}
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