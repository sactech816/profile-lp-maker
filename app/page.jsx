"use client";

import React, { useState, useEffect } from 'react';
import Script from 'next/script';
import { supabase } from '../lib/supabase';
import { generateSlug } from '../lib/utils';
import { ADMIN_EMAIL } from '../lib/constants';

import AuthModal from '../components/AuthModal';
import Portal from '../components/Portal';
import Dashboard from '../components/Dashboard';
import QuizPlayer from '../components/QuizPlayer';
import Editor from '../components/Editor';
import { FaqPage, PricePage, HowToPage, EffectiveUsePage } from '../components/StaticPages';
import { Loader2 } from 'lucide-react'; // 追加

const App = () => {
  // ★修正: 初期値を 'loading' に変更
  const [view, setView] = useState('loading'); 
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
          // ユーザーセッション確認
          if(supabase) {
              const {data:{session}} = await supabase.auth.getSession();
              setUser(session?.user||null);
              
              supabase.auth.onAuthStateChange((_event, session) => {
                setUser(session?.user || null);
              });
          }

          // URLチェック
          const params = new URLSearchParams(window.location.search);
          const id = params.get('id');
          
          if(id && supabase) {
              // slug(文字列)で検索
              let { data } = await supabase.from('quizzes').select('*').eq('slug', id).single();
              // なければID(数値)で検索
              if (!data && !isNaN(id)) {
                 const res = await supabase.from('quizzes').select('*').eq('id', id).single();
                 data = res.data;
              }

              if(data) { 
                  setSelectedQuiz(data); 
                  setView('quiz'); 
              } else {
                  // ID指定があるが見つからない場合もポータルへ
                  setView('portal');
              }
          } else {
              // ID指定がない場合はポータルへ
              setView('portal');
          }

          // データ取得
          await fetchQuizzes();
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
      // ポータルに戻るときはURLパラメータを消す
      if (newView === 'portal') {
          url = window.location.pathname;
      }
      window.history.pushState({ view: newView, ...params }, '', url);
      setView(newView);
  };

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
              mode: form.mode || 'diagnosis'
          };
          
          if (!id && !form.slug) { 
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

  // ★修正: ローディング中の表示
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
        
        {view === 'portal' && (
            <Portal 
                quizzes={quizzes} isLoading={isLoading} user={user} setShowAuth={setShowAuth} onLogout={async ()=>{ await supabase.auth.signOut(); alert('ログアウトしました'); }} onPlay={(q)=>{ setSelectedQuiz(q); navigateTo('quiz', { id: q.slug || q.id }); }} onCreate={()=>{ setEditingQuiz(null); navigateTo('editor'); }} setPage={(p) => navigateTo(p)} onEdit={(q)=>{ setEditingQuiz(q); navigateTo('editor'); }} onDelete={handleDelete} isAdmin={isAdmin}
            />
        )}
        {view === 'dashboard' && <Dashboard user={user} setPage={(p) => navigateTo(p)} onLogout={async ()=>{ await supabase.auth.signOut(); navigateTo('portal');}} onEdit={(q)=>{setEditingQuiz(q); navigateTo('editor');}} onDelete={handleDelete} />}
        
        {view === 'effective' && <EffectiveUsePage onBack={()=>navigateTo('portal')} isAdmin={isAdmin} setPage={(p) => navigateTo(p)} user={user} onLogout={async ()=>{ await supabase.auth.signOut(); alert('ログアウトしました'); }} setShowAuth={setShowAuth} />}
        
        {view === 'faq' && <FaqPage onBack={()=>navigateTo('portal')} isAdmin={isAdmin} setPage={(p) => navigateTo(p)} user={user} onLogout={async ()=>{ await supabase.auth.signOut(); alert('ログアウトしました'); }} setShowAuth={setShowAuth} />}
        {view === 'price' && <PricePage onBack={()=>navigateTo('portal')} isAdmin={isAdmin} setPage={(p) => navigateTo(p)} user={user} onLogout={async ()=>{ await supabase.auth.signOut(); alert('ログアウトしました'); }} setShowAuth={setShowAuth} />}
        {view === 'howto' && <HowToPage onBack={()=>navigateTo('portal')} isAdmin={isAdmin} setPage={(p) => navigateTo(p)} user={user} onLogout={async ()=>{ await supabase.auth.signOut(); alert('ログアウトしました'); }} setShowAuth={setShowAuth} />}
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
            />
        )}
    </div>
  );
};

export default App;