"use client";

import React, { useState, useEffect } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { generateSlug } from '../lib/utils';
import { ADMIN_EMAIL } from '../lib/constants';

import AuthModal from '../components/AuthModal';
import Portal from '../components/Portal';
import Dashboard from '../components/Dashboard';
import ProfileDashboard from '../components/ProfileDashboard';
import QuizPlayer from '../components/QuizPlayer';
import Editor from '../components/Editor';
import ProfileEditor from '../components/ProfileEditor';
import LandingPage from '../components/LandingPage';
import AnnouncementsPage from '../components/AnnouncementsPage';
import { 
    FaqPage, PricePage, HowToPage, 
    EffectiveUsePage, QuizLogicPage, 
    ContactPage, LegalPage, PrivacyPage,
    ProfileEffectiveUsePage, ProfileHowToPage, ProfileFaqPage
} from '../components/StaticPages';
import { Loader2 } from 'lucide-react';

const App = () => {
  const router = useRouter();
  const [view, setView] = useState('loading'); 
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [editingProfileSlug, setEditingProfileSlug] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  // 管理者かどうかを判定
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
          // パスワードリセット用のURLハッシュをチェック
          // Supabaseは #access_token=...&type=recovery の形式（旧）または ?token_hash=...&type=recovery（新PKCE）でリダイレクトする
          const hash = window.location.hash;
          const searchParams = new URLSearchParams(window.location.search);
          
          // ハッシュまたはクエリパラメータでtype=recoveryをチェック
          if ((hash && hash.includes('type=recovery')) || searchParams.get('type') === 'recovery') {
              console.log('🔑 パスワードリセットリンクを検出しました');
              
              // まずPKCEフロー（新しい方式）のtoken_hashをチェック
              const tokenHash = searchParams.get('token_hash');
              const type = searchParams.get('type');
              
              console.log('トークン情報:', { 
                  hasTokenHash: !!tokenHash,
                  type: type,
                  hash: hash,
                  search: window.location.search
              });
              
              if (tokenHash && type === 'recovery' && supabase) {
                  try {
                      console.log('🔧 パスワードリセットモード: セッション確立を開始（PKCE）');
                      const { data, error } = await supabase.auth.verifyOtp({
                          token_hash: tokenHash,
                          type: 'recovery'
                      });
                      
                      if (error) {
                          console.error('❌ セッション確立エラー:', error);
                      } else {
                          console.log('✅ セッション確立成功:', data.session ? 'あり' : 'なし');
                          if (data.user) {
                              setUser(data.user);
                          }
                      }
                  } catch (e) {
                      console.error('❌ セッション確立例外:', e);
                  }
              } else {
                  // 旧方式（access_token）もチェック（後方互換性のため）
                  const hashParams = new URLSearchParams(hash.substring(1));
                  let accessToken = hashParams.get('access_token');
                  let refreshToken = hashParams.get('refresh_token');
                  
                  // ハッシュにない場合はクエリパラメータをチェック
                  if (!accessToken) {
                      accessToken = searchParams.get('access_token');
                      refreshToken = searchParams.get('refresh_token');
                  }
                  
                  console.log('トークン情報（旧方式）:', { 
                      hasAccessToken: !!accessToken, 
                      hasRefreshToken: !!refreshToken
                  });
                  
                  // トークンがある場合はセッションを確立
                  if (accessToken && supabase) {
                      try {
                          console.log('🔧 パスワードリセットモード: セッション確立を開始（旧方式）');
                          const { data, error } = await supabase.auth.setSession({
                              access_token: accessToken,
                              refresh_token: refreshToken || ''
                          });
                          
                          if (error) {
                              console.error('❌ セッション確立エラー:', error);
                          } else {
                              console.log('✅ セッション確立成功:', data.session ? 'あり' : 'なし');
                              if (data.user) {
                                  setUser(data.user);
                              }
                          }
                      } catch (e) {
                          console.error('❌ セッション確立例外:', e);
                      }
                  }
              }
              
              setShowPasswordReset(true);
              setShowAuth(true);
              // ハッシュはクリアしない（AuthModalでセッション確立に必要）
              // パスワード変更後にAuthModal側でクリアする
          }

          // ユーザーセッションの確認
          if(supabase) {
              const {data:{session}} = await supabase.auth.getSession();
              setUser(session?.user||null);
              supabase.auth.onAuthStateChange(async (event, session) => {
                console.log('🔔 認証状態変更:', event, session?.user?.email);
                setUser(session?.user || null);
                
                // PASSWORD_RECOVERYイベントを検出
                if (event === 'PASSWORD_RECOVERY') {
                    console.log('🔑 パスワードリカバリーイベントを検出');
                    console.log('セッション情報:', session);
                    
                    // セッションがある場合はユーザーを設定
                    if (session?.user) {
                        setUser(session.user);
                    }
                    
                    setShowPasswordReset(true);
                    setShowAuth(true);
                }
                
                // ログイン成功時のリダイレクト制御
                if (event === 'SIGNED_IN' && session?.user) {
                    const currentSearch = new URLSearchParams(window.location.search);
                    
                    // 決済処理中はリダイレクトしない
                    const paymentStatus = currentSearch.get('payment');
                    if (paymentStatus === 'success' || paymentStatus === 'cancel') {
                        console.log('⏸️ 決済処理中のため、リダイレクトをスキップ');
                        return;
                    }
                    
                    // パスワードリセット中はリダイレクトしない
                    const hash = window.location.hash;
                    if (hash && hash.includes('type=recovery')) {
                        console.log('⏸️ パスワードリセット中のため、リダイレクトをスキップ');
                        return;
                    }
                    
                    // 通常のリダイレクト処理
                    const page = currentSearch.get('page');
                    if (!page || page === 'landing') {
                        console.log('🏠 ダッシュボードにリダイレクト');
                        navigateTo('dashboard');
                    }
                }
              });
          }

          // URLパラメータのチェック
          const params = new URLSearchParams(window.location.search);
          const id = params.get('id');
          const page = params.get('page');
          const paymentStatus = params.get('payment'); // Stripeからの戻り判定
          
          // ページ指定がある場合（使い方ページなど）
          if (page) {
              setView(page);
          }
          // 決済完了・キャンセル戻りならダッシュボードへ強制移動
          else if (paymentStatus === 'success' || paymentStatus === 'cancel') {
              setView('dashboard');
          } 
          // クイズIDがある場合（シェアURLからのアクセス）
          else if(id && supabase) {
              // slug(文字列)で検索
              let { data } = await supabase.from('quizzes').select('*').eq('slug', id).single();
              // なければID(数値)で検索（互換性のため）
              if (!data && !isNaN(id)) {
                 const res = await supabase.from('quizzes').select('*').eq('id', id).single();
                 data = res.data;
              }

              if(data) { 
                  setSelectedQuiz(data); 
                  setView('quiz'); 
              } else {
                  // ID指定があるが見つからない場合はポータルへ
                  setView('portal');
              }
          } else {
              // 何も指定がなければランディングページへ
              setView('landing');
          }
          await fetchQuizzes();
      };
      init();
  }, []);

  // ブラウザの「戻る」ボタン対応
  useEffect(() => {
      const handlePopState = (event) => {
          // URLパラメータからページを読み取る
          const params = new URLSearchParams(window.location.search);
          const page = params.get('page');
          const id = params.get('id');
          
          if (page) {
              setView(page);
          } else if (id) {
              // クイズIDがある場合はquizビュー
              setView('quiz');
          } else if (window.location.pathname === '/dashboard') {
              setView('dashboard');
          } else {
              setView('landing');
          }
      };
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // 画面遷移ハンドラ
  const navigateTo = (newView, params = {}) => {
      let url = '/';
      const urlParams = new URLSearchParams();
      
      // すべてのページをURLパラメータで管理（dashboardやprofile-editorも含む）
      if (newView === 'quiz' && params.id) {
          urlParams.set('id', params.id);
      } else if (newView === 'landing') {
          // ランディングページはクエリパラメータなし
          url = '/';
      } else if (newView === 'portal') {
          // ポータルページもクエリパラメータなし（レガシー互換）
          url = '/';
      } else {
          // その他のページは?page=パラメータを使用
          urlParams.set('page', newView);
      }
      
      const queryString = urlParams.toString();
      if (queryString) {
          url += `?${queryString}`;
      }
      
      window.history.pushState({ view: newView, ...params }, '', url);
      setView(newView);
  };

  // 保存処理
  const handleSave = async (form, id) => {
      if(!supabase) return;
      try {
          const payload = {
              title: form.title, 
              description: form.description, 
              category: form.category, 
              color: form.color,
              questions: form.questions, 
              results: form.results, 
              user_id: user?.id || null,
              layout: form.layout || 'card',
              image_url: form.image_url || null,
              mode: form.mode || 'diagnosis',
              collect_email: form.collect_email || false
          };
          
          // 新規作成時、または編集時にURL再発行フラグがtrueの場合はSlugを生成
          if (!id && !form.slug) { 
              payload.slug = generateSlug(); 
          } else if (id && form.regenerateSlug) {
              payload.slug = generateSlug();
          }

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
          
          return result.data[0].slug || result.data[0].id;
          
      } catch(e) { 
          alert('保存エラー: ' + e.message); 
      }
  };

  // 削除処理
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

  // プロフィール削除処理（サービスロールAPI経由）
  const handleProfileDelete = async (id, refetch) => {
      if(!confirm('本当に削除しますか？')) return;
      if(!supabase) return;
      
      try {
          console.log('[CLIENT] 削除処理開始:', { id });
          
          const { data: { session } } = await supabase.auth.getSession();
          const token = session?.access_token;
          console.log('[CLIENT] セッション取得:', { hasToken: !!token });
          
          // 未ログインユーザーの場合は匿名IDを使用
          const anonymousId = localStorage.getItem('anonymous_user_id');
          console.log('[CLIENT] 匿名ID:', anonymousId);
          
          const headers = {
              'Content-Type': 'application/json'
          };
          
          if (token) {
              headers['Authorization'] = `Bearer ${token}`;
          }

          console.log('[CLIENT] APIリクエスト送信中...');
          const res = await fetch('/api/delete-profile', {
              method: 'POST',
              headers,
              body: JSON.stringify({ id, anonymousId })
          });
          
          console.log('[CLIENT] APIレスポンス:', { status: res.status, ok: res.ok });
          
          let result = {};
          try {
              const text = await res.text();
              if (text) {
                  result = JSON.parse(text);
              }
          } catch (parseError) {
              console.error('[CLIENT] JSON解析エラー:', parseError);
          }
          
          console.log('[CLIENT] レスポンスデータ:', result);
          
          if (!res.ok) {
              throw new Error(result?.error || '削除に失敗しました');
          }

          alert('削除しました');
          
          console.log('[CLIENT] refetch実行:', { hasRefetch: !!refetch, refetchType: typeof refetch });
          if (refetch && typeof refetch === 'function') {
              await refetch();
              console.log('[CLIENT] refetch完了');
          } else {
              console.log('[CLIENT] ページリロード');
              window.location.reload();
          }
      } catch(e) {
          console.error('[CLIENT] 削除エラー:', e);
          alert('削除エラー: ' + e.message);
      }
  };

  // ローディング画面
  if (view === 'loading') {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-indigo-600">
              <Loader2 className="animate-spin mb-4" size={48} />
              <p className="font-bold">読み込み中...</p>
          </div>
      );
  }

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
        
        <AuthModal 
            isOpen={showAuth} 
            onClose={()=>{setShowAuth(false); setShowPasswordReset(false);}} 
            setUser={setUser}
            isPasswordReset={showPasswordReset}
            setShowPasswordReset={setShowPasswordReset}
            onNavigate={navigateTo}
        />
        
        {view === 'landing' && (
            <LandingPage 
                user={user}
                setShowAuth={setShowAuth}
                onNavigateToDashboard={() => navigateTo('dashboard')}
                onCreate={() => {
                    setEditingProfileSlug(null);
                    navigateTo('profile-editor');
                }}
            />
        )}
        
        {view === 'portal' && (
            <Portal 
                quizzes={quizzes} 
                isLoading={isLoading} 
                user={user} 
                setShowAuth={setShowAuth} 
                onLogout={async ()=>{ 
                    if(!supabase) return;
                    try {
                        await supabase.auth.signOut(); 
                        setUser(null);
                        alert('ログアウトしました');
                    } catch(e) {
                        console.error('ログアウトエラー:', e);
                        alert('ログアウトに失敗しました');
                    }
                }} 
                onPlay={(q)=>{ setSelectedQuiz(q); navigateTo('quiz', { id: q.slug || q.id }); }} 
                onCreate={()=>{ setEditingQuiz(null); navigateTo('editor'); }} 
                setPage={(p) => navigateTo(p)} 
                onEdit={(q)=>{ setEditingQuiz(q); navigateTo('editor'); }} 
                onDelete={handleDelete} 
                isAdmin={isAdmin}
            />
        )}
        
        {view === 'dashboard' && (
            <ProfileDashboard 
                user={user} 
                isAdmin={isAdmin}
                setPage={(p) => navigateTo(p)} 
                onLogout={async ()=>{ 
                    if(!supabase) return;
                    try {
                        await supabase.auth.signOut(); 
                        setUser(null);
                        alert('ログアウトしました');
                        navigateTo('landing');
                    } catch(e) {
                        console.error('ログアウトエラー:', e);
                        alert('ログアウトに失敗しました');
                    }
                }} 
                onEdit={(profile)=>{setEditingProfileSlug(profile.slug); navigateTo('profile-editor');}} 
                onDelete={(id, refetch) => handleProfileDelete(id, refetch)}
                onCreate={()=>{setEditingProfileSlug(null); navigateTo('profile-editor');}}
            />
        )}
        
        {/* 静的ページ群 */}
        {view === 'effective' && <EffectiveUsePage onBack={()=>navigateTo('portal')} isAdmin={isAdmin} setPage={(p) => navigateTo(p)} user={user} onLogout={async ()=>{ 
            if(!supabase) return;
            try {
                await supabase.auth.signOut(); 
                setUser(null);
                alert('ログアウトしました');
            } catch(e) {
                console.error('ログアウトエラー:', e);
                alert('ログアウトに失敗しました');
            }
        }} setShowAuth={setShowAuth} />}
        {view === 'logic' && <QuizLogicPage onBack={()=>navigateTo('portal')} isAdmin={isAdmin} setPage={(p) => navigateTo(p)} user={user} onLogout={async ()=>{ 
            if(!supabase) return;
            try {
                await supabase.auth.signOut(); 
                setUser(null);
                alert('ログアウトしました');
            } catch(e) {
                console.error('ログアウトエラー:', e);
                alert('ログアウトに失敗しました');
            }
        }} setShowAuth={setShowAuth} />}
        {view === 'howto' && <HowToPage onBack={()=>navigateTo('portal')} isAdmin={isAdmin} setPage={(p) => navigateTo(p)} user={user} onLogout={async ()=>{ 
            if(!supabase) return;
            try {
                await supabase.auth.signOut(); 
                setUser(null);
                alert('ログアウトしました');
            } catch(e) {
                console.error('ログアウトエラー:', e);
                alert('ログアウトに失敗しました');
            }
        }} setShowAuth={setShowAuth} />}
        
        {/* プロフィールLP用の静的ページ群 */}
        {view === 'profile-effective' && <ProfileEffectiveUsePage onBack={()=>navigateTo('landing')} isAdmin={isAdmin} setPage={(p) => navigateTo(p)} user={user} onLogout={async ()=>{ 
            if(!supabase) return;
            try {
                await supabase.auth.signOut(); 
                setUser(null);
                alert('ログアウトしました');
                navigateTo('landing');
            } catch(e) {
                console.error('ログアウトエラー:', e);
                alert('ログアウトに失敗しました');
            }
        }} setShowAuth={setShowAuth} />}
        {view === 'profile-howto' && <ProfileHowToPage onBack={()=>navigateTo('landing')} isAdmin={isAdmin} setPage={(p) => navigateTo(p)} user={user} onLogout={async ()=>{ 
            if(!supabase) return;
            try {
                await supabase.auth.signOut(); 
                setUser(null);
                alert('ログアウトしました');
                navigateTo('landing');
            } catch(e) {
                console.error('ログアウトエラー:', e);
                alert('ログアウトに失敗しました');
            }
        }} setShowAuth={setShowAuth} />}
        {view === 'profile-faq' && <ProfileFaqPage onBack={()=>navigateTo('landing')} isAdmin={isAdmin} setPage={(p) => navigateTo(p)} user={user} onLogout={async ()=>{ 
            if(!supabase) return;
            try {
                await supabase.auth.signOut(); 
                setUser(null);
                alert('ログアウトしました');
                navigateTo('landing');
            } catch(e) {
                console.error('ログアウトエラー:', e);
                alert('ログアウトに失敗しました');
            }
        }} setShowAuth={setShowAuth} />}
        
        {/* お知らせページ */}
        {view === 'announcements' && <AnnouncementsPage 
            onBack={()=>navigateTo('landing')} 
            isAdmin={isAdmin} 
            setPage={(p) => navigateTo(p)} 
            user={user} 
            onLogout={async ()=>{ 
                if(!supabase) return;
                try {
                    await supabase.auth.signOut(); 
                    setUser(null);
                    alert('ログアウトしました');
                    navigateTo('landing');
                } catch(e) {
                    console.error('ログアウトエラー:', e);
                    alert('ログアウトに失敗しました');
                }
            }} 
            setShowAuth={setShowAuth}
            serviceType="profile"
        />}
        
        {/* お問い合わせ・規約関連 */}
        {view === 'contact' && <ContactPage onBack={()=>navigateTo('landing')} isAdmin={isAdmin} setPage={(p) => navigateTo(p)} user={user} onLogout={async ()=>{ 
            if(!supabase) return;
            try {
                await supabase.auth.signOut(); 
                setUser(null);
                alert('ログアウトしました');
                navigateTo('landing');
            } catch(e) {
                console.error('ログアウトエラー:', e);
                alert('ログアウトに失敗しました');
            }
        }} setShowAuth={setShowAuth} />}
        {view === 'legal' && <LegalPage onBack={()=>navigateTo('landing')} isAdmin={isAdmin} setPage={(p) => navigateTo(p)} user={user} onLogout={async ()=>{ 
            if(!supabase) return;
            try {
                await supabase.auth.signOut(); 
                setUser(null);
                alert('ログアウトしました');
                navigateTo('landing');
            } catch(e) {
                console.error('ログアウトエラー:', e);
                alert('ログアウトに失敗しました');
            }
        }} setShowAuth={setShowAuth} />}
        {view === 'privacy' && <PrivacyPage onBack={()=>navigateTo('landing')} isAdmin={isAdmin} setPage={(p) => navigateTo(p)} user={user} onLogout={async ()=>{ 
            if(!supabase) return;
            try {
                await supabase.auth.signOut(); 
                setUser(null);
                alert('ログアウトしました');
                navigateTo('landing');
            } catch(e) {
                console.error('ログアウトエラー:', e);
                alert('ログアウトに失敗しました');
            }
        }} setShowAuth={setShowAuth} />}
        
        {/* レガシー互換 */}
        {view === 'faq' && <FaqPage onBack={()=>navigateTo('portal')} isAdmin={isAdmin} setPage={(p) => navigateTo(p)} user={user} onLogout={async ()=>{ 
            if(!supabase) return;
            try {
                await supabase.auth.signOut(); 
                setUser(null);
                alert('ログアウトしました');
            } catch(e) {
                console.error('ログアウトエラー:', e);
                alert('ログアウトに失敗しました');
            }
        }} setShowAuth={setShowAuth} />}
        {view === 'price' && <PricePage onBack={()=>navigateTo('portal')} isAdmin={isAdmin} setPage={(p) => navigateTo(p)} user={user} onLogout={async ()=>{ 
            if(!supabase) return;
            try {
                await supabase.auth.signOut(); 
                setUser(null);
                alert('ログアウトしました');
            } catch(e) {
                console.error('ログアウトエラー:', e);
                alert('ログアウトに失敗しました');
            }
        }} setShowAuth={setShowAuth} />}
        
        {view === 'quiz' && (
            <QuizPlayer 
                quiz={selectedQuiz} 
                onBack={async ()=>{ 
                    await fetchQuizzes(); 
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
                setShowAuth={setShowAuth}
            />
        )}
        
        {view === 'profile-editor' && (
            <ProfileEditor 
                user={user}
                initialSlug={editingProfileSlug}
                setShowAuth={setShowAuth}
                onBack={()=>{ 
                    if (user) {
                        navigateTo('dashboard');
                    } else {
                        navigateTo('landing');
                    }
                    setEditingProfileSlug(null);
                }}
                onSave={(data) => {
                    console.log('プロフィール保存完了:', data);
                }}
            />
        )}
    </div>
  );
};

export default App;