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
import { 
    FaqPage, PricePage, HowToPage, 
    EffectiveUsePage, QuizLogicPage, 
    ContactPage, LegalPage, PrivacyPage,
    ProfileEffectiveUsePage, ProfileHowToPage
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
          // ユーザーセッションの確認
          if(supabase) {
              const {data:{session}} = await supabase.auth.getSession();
              setUser(session?.user||null);
              supabase.auth.onAuthStateChange((_event, session) => {
                setUser(session?.user || null);
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
        
        <AuthModal isOpen={showAuth} onClose={()=>setShowAuth(false)} setUser={setUser} />
        
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
                onLogout={async ()=>{ await supabase.auth.signOut(); alert('ログアウトしました'); }} 
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
                onLogout={async ()=>{ await supabase.auth.signOut(); navigateTo('landing');}} 
                onEdit={(profile)=>{setEditingProfileSlug(profile.slug); navigateTo('profile-editor');}} 
                onDelete={async (id, refetch) => {
                    if(!confirm('本当に削除しますか？')) return;
                    try {
                        const { error } = await supabase.from('profiles').delete().eq('id', id);
                        if(error) throw error;
                        alert('削除しました');
                        // 削除後に再取得
                        if (refetch) {
                            await refetch();
                        }
                    } catch(e) {
                        alert('削除エラー: ' + e.message);
                    }
                }}
                onCreate={()=>{setEditingProfileSlug(null); navigateTo('profile-editor');}}
            />
        )}
        
        {/* 静的ページ群 */}
        {view === 'effective' && <EffectiveUsePage onBack={()=>navigateTo('portal')} isAdmin={isAdmin} setPage={(p) => navigateTo(p)} user={user} onLogout={async ()=>{ await supabase.auth.signOut(); alert('ログアウトしました'); }} setShowAuth={setShowAuth} />}
        {view === 'logic' && <QuizLogicPage onBack={()=>navigateTo('portal')} isAdmin={isAdmin} setPage={(p) => navigateTo(p)} user={user} onLogout={async ()=>{ await supabase.auth.signOut(); alert('ログアウトしました'); }} setShowAuth={setShowAuth} />}
        {view === 'howto' && <HowToPage onBack={()=>navigateTo('portal')} isAdmin={isAdmin} setPage={(p) => navigateTo(p)} user={user} onLogout={async ()=>{ await supabase.auth.signOut(); alert('ログアウトしました'); }} setShowAuth={setShowAuth} />}
        
        {/* プロフィールLP用の静的ページ群 */}
        {view === 'profile-effective' && <ProfileEffectiveUsePage onBack={()=>navigateTo('landing')} isAdmin={isAdmin} setPage={(p) => navigateTo(p)} user={user} onLogout={async ()=>{ await supabase.auth.signOut(); navigateTo('landing'); }} setShowAuth={setShowAuth} />}
        {view === 'profile-howto' && <ProfileHowToPage onBack={()=>navigateTo('landing')} isAdmin={isAdmin} setPage={(p) => navigateTo(p)} user={user} onLogout={async ()=>{ await supabase.auth.signOut(); navigateTo('landing'); }} setShowAuth={setShowAuth} />}
        
        {/* お問い合わせ・規約関連 */}
        {view === 'contact' && <ContactPage onBack={()=>navigateTo('landing')} isAdmin={isAdmin} setPage={(p) => navigateTo(p)} user={user} onLogout={async ()=>{ await supabase.auth.signOut(); navigateTo('landing'); }} setShowAuth={setShowAuth} />}
        {view === 'legal' && <LegalPage onBack={()=>navigateTo('landing')} isAdmin={isAdmin} setPage={(p) => navigateTo(p)} user={user} onLogout={async ()=>{ await supabase.auth.signOut(); navigateTo('landing'); }} setShowAuth={setShowAuth} />}
        {view === 'privacy' && <PrivacyPage onBack={()=>navigateTo('landing')} isAdmin={isAdmin} setPage={(p) => navigateTo(p)} user={user} onLogout={async ()=>{ await supabase.auth.signOut(); navigateTo('landing'); }} setShowAuth={setShowAuth} />}
        
        {/* レガシー互換 */}
        {view === 'faq' && <FaqPage onBack={()=>navigateTo('portal')} isAdmin={isAdmin} setPage={(p) => navigateTo(p)} user={user} onLogout={async ()=>{ await supabase.auth.signOut(); alert('ログアウトしました'); }} setShowAuth={setShowAuth} />}
        {view === 'price' && <PricePage onBack={()=>navigateTo('portal')} isAdmin={isAdmin} setPage={(p) => navigateTo(p)} user={user} onLogout={async ()=>{ await supabase.auth.signOut(); alert('ログアウトしました'); }} setShowAuth={setShowAuth} />}
        
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