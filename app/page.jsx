"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Play, Edit3, MessageSquare, CheckCircle, Trash2, ArrowLeft, Save, 
  RefreshCw, Loader2, Trophy, Home, ThumbsUp, ExternalLink, X, 
  Crown, Lock, Share2, Sparkles, Wand2
} from 'lucide-react';

// --- 設定エリア (ここだけ書き換えてください) ---
// 管理者として扱うメールアドレスを設定します
const ADMIN_EMAIL = "admin@example.com"; 
// -------------------------------------------

// --- Supabase Config ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null;

// --- Logic ---
const calculateResult = (answers, results) => {
  const scores = { A: 0, B: 0, C: 0 };
  Object.values(answers).forEach(option => {
    if (option.score) {
      Object.entries(option.score).forEach(([type, point]) => {
        scores[type] = (scores[type] || 0) + (parseInt(point, 10) || 0);
      });
    }
  });
  let maxType = 'A';
  let maxScore = -1;
  Object.entries(scores).forEach(([type, score]) => {
    if (score > maxScore) {
      maxScore = score;
      maxType = type;
    }
  });
  return results.find(r => r.type === maxType) || results[0];
};

// --- Components ---

// 1. Auth Modal (管理者用ログイン)
const AuthModal = ({ isOpen, onClose, setUser }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    
    if (!isOpen) return null;
    
    const handleLogin = async (e) => {
        e.preventDefault(); setLoading(true);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            if (data.user) { setUser(data.user); onClose(); }
        } catch (e) { alert('ログインエラー: ' + e.message); } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl relative animate-fade-in">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X/></button>
                <h2 className="text-xl font-bold mb-6 text-center text-gray-900">管理者ログイン</h2>
                <form onSubmit={handleLogin} className="space-y-4">
                    <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50 text-gray-900" placeholder="admin@example.com" />
                    <input type="password" required value={password} onChange={e=>setPassword(e.target.value)} className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50 text-gray-900" placeholder="Password" />
                    <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors">
                        {loading ? '認証中...' : 'ログイン'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// 2. Pages
const PricePage = ({ onBack }) => (
    <div className="min-h-screen bg-gray-50 py-12 px-4 font-sans">
        <button onClick={onBack} className="mb-8 flex items-center gap-2 text-gray-600 font-bold hover:text-indigo-600 transition-colors"><ArrowLeft/> トップへ戻る</button>
        <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">料金プラン</h1>
            <p className="text-gray-600 mb-12">現在はベータ版のため、基本機能はすべて無料でご利用いただけます。</p>
            <div className="grid md:grid-cols-3 gap-8 text-left">
                <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-indigo-500 relative transform scale-105 z-10">
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-500 text-white px-3 py-1 rounded-full text-xs font-bold">BETA FREE</span>
                    <h3 className="text-2xl font-bold mb-2 text-gray-900">Standard</h3>
                    <div className="text-4xl font-extrabold mb-4 text-gray-900">¥0<span className="text-sm font-medium text-gray-500">/月</span></div>
                    <ul className="space-y-3 mb-8 text-sm text-gray-600">
                        <li className="flex gap-2"><CheckCircle size={16} className="text-green-500"/>診断作成数 無制限</li>
                        <li className="flex gap-2"><CheckCircle size={16} className="text-green-500"/>AI自動生成機能</li>
                    </ul>
                    <button className="w-full py-3 rounded-lg font-bold bg-indigo-600 text-white">現在のプラン</button>
                </div>
            </div>
        </div>
    </div>
);

const HowToPage = ({ onBack }) => (
    <div className="min-h-screen bg-white py-12 px-4 font-sans">
        <button onClick={onBack} className="mb-8 flex items-center gap-2 text-gray-600 font-bold hover:text-indigo-600 max-w-4xl mx-auto"><ArrowLeft/> トップへ戻る</button>
        <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-8 border-b pb-4">売れる診断クイズの作り方</h1>
            <div className="space-y-10">
                <section><h2 className="text-lg font-bold text-indigo-700 mb-2">1. ゴールを決める</h2><p className="text-gray-600 leading-relaxed">「誰に」「どうなって欲しいか」を明確にします。</p></section>
                <section><h2 className="text-lg font-bold text-indigo-700 mb-2">2. 結果パターンを作る</h2><p className="text-gray-600 leading-relaxed">まずは診断結果（A, B, Cタイプ）を考えます。</p></section>
                <section><h2 className="text-lg font-bold text-indigo-700 mb-2">3. 質問で振り分ける</h2><p className="text-gray-600 leading-relaxed">AI機能を使えば、テーマを入れるだけで質問まで自動で作れます。</p></section>
            </div>
        </div>
    </div>
);

// 3. Portal
const Portal = ({ quizzes, isLoading, onPlay, onCreate, user, setShowAuth, onLogout, setPage, onEdit, onDelete }) => {
  const isAdmin = user?.email === ADMIN_EMAIL;

  const handleLike = async (e, quiz) => {
      e.stopPropagation();
      if(!supabase) return;
      const btn = e.currentTarget;
      const countSpan = btn.querySelector('span');
      if(btn.classList.contains('liked')) return;
      
      try {
        await supabase.rpc('increment_likes', { row_id: quiz.id });
        const current = parseInt(countSpan.textContent || '0');
        countSpan.textContent = current + 1;
        btn.classList.add('liked', 'text-pink-500');
      } catch(err) {
        console.error(err);
      }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-50 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
              <div className="font-bold text-xl flex items-center gap-2 text-indigo-700 cursor-pointer" onClick={()=>setPage('portal')}>
                  <Sparkles className="text-pink-500"/> 診断メーカー
              </div>
              <div className="flex items-center gap-4 text-sm font-bold text-gray-600">
                  <button onClick={()=>setPage('price')} className="hidden md:block hover:text-indigo-600">料金プラン</button>
                  <button onClick={()=>setPage('howto')} className="hidden md:block hover:text-indigo-600">作り方</button>
                  {isAdmin && (
                      <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1 rounded-full text-indigo-700 border border-indigo-200">
                          <Crown size={14}/> <span className="text-xs">管理者モード</span>
                      </div>
                  )}
              </div>
          </div>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-900 to-blue-800 text-white py-16 px-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <h1 className="text-3xl md:text-5xl font-extrabold mb-6 relative z-10 leading-tight">
            あなたのビジネスを加速させる<br/><span className="text-yellow-300">診断コンテンツ</span>を作成
        </h1>
        <p className="text-blue-100 mb-8 max-w-xl mx-auto relative z-10">
            集客・販促・顧客分析。AIがあなたの代わりにクイズ構成を自動生成。
            <br/>登録不要で、今すぐ無料で作成できます。
        </p>
        <button onClick={onCreate} className="bg-white text-indigo-900 px-8 py-4 rounded-full font-bold shadow-xl hover:bg-gray-100 hover:scale-105 transition-all flex items-center gap-2 mx-auto relative z-10">
            <Edit3 size={20} /> 無料で作成する
        </button>
      </div>

      {/* List */}
      <div id="quiz-list" className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold mb-8 text-gray-800 flex items-center gap-2">
            <div className="w-1.5 h-8 bg-indigo-600 rounded-full"></div>人気の診断
        </h2>
        
        {isLoading ? (
            <div className="text-center py-20"><Loader2 className="animate-spin mx-auto text-indigo-600" size={40}/></div>
        ) : (
         <div className="grid md:grid-cols-3 gap-8">
            {quizzes.map((quiz) => (
              <div key={quiz.id} onClick={()=>onPlay(quiz)} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col h-full group overflow-hidden border border-gray-100 relative">
                
                {/* 管理者用メニュー */}
                {isAdmin && (
                    <div className="absolute top-2 right-2 z-20 flex gap-1">
                        <button onClick={(e)=>{e.stopPropagation(); onEdit(quiz);}} className="bg-white/90 p-2 rounded-full shadow hover:text-blue-600"><Edit3 size={16}/></button>
                        <button onClick={(e)=>{e.stopPropagation(); onDelete(quiz.id);}} className="bg-white/90 p-2 rounded-full shadow hover:text-red-600"><Trash2 size={16}/></button>
                    </div>
                )}

                <div className={`h-40 ${quiz.color || 'bg-gray-500'} relative`}>
                    <span className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-full text-xs font-bold shadow-sm">{quiz.category || 'その他'}</span>
                </div>
                
                <div className="p-6 flex-grow flex flex-col">
                  <h3 className="text-lg font-bold mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2 text-gray-900">{quiz.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-3 flex-grow mb-4">{quiz.description}</p>
                  
                  <div className="flex items-center justify-between border-t pt-4 mt-auto">
                      <span className="text-xs font-bold bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg flex items-center gap-1">
                          <Play size={12}/> 診断する
                      </span>
                      <button onClick={(e)=>handleLike(e, quiz)} className="flex items-center gap-1 text-gray-400 hover:text-pink-500 transition-colors group/like">
                          <ThumbsUp size={18} className="group-hover/like:scale-125 transition-transform"/>
                          <span className="text-sm font-bold">{quiz.likes_count || 0}</span>
                      </button>
                  </div>
                </div>
              </div>
            ))}
         </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t py-12 text-center text-sm text-gray-400">
          <p className="mb-4">&copy; 2025 Diagnosis Maker. All rights reserved.</p>
          {user ? (
              <button onClick={onLogout} className="text-xs underline hover:text-gray-600">管理者ログアウト</button>
          ) : (
              <button onClick={()=>setShowAuth(true)} className="text-xs text-gray-300 hover:text-gray-500 flex items-center justify-center gap-1 mx-auto">
                  <Lock size={10}/> Admin
              </button>
          )}
      </footer>
    </div>
  );
};

// 4. Result View
const ResultView = ({ quiz, result, onRetry, onBack }) => {
  return (
    <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden my-8 animate-fade-in border border-gray-100">
        <div className="bg-indigo-700 text-white p-10 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-white opacity-10" style={{backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
            <Trophy className="mx-auto mb-4 text-yellow-300 relative z-10" size={56} />
            <h2 className="text-3xl font-extrabold mt-2 relative z-10">{result.title}</h2>
        </div>
        <div className="p-8 md:p-10">
            <div className="prose text-gray-800 leading-relaxed whitespace-pre-wrap mb-10 text-sm md:text-base">
                {result.description}
            </div>
            
            {result.link_url && (
                <div className="mb-8">
                    <a href={result.link_url} target="_blank" rel="noopener noreferrer" className="block w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-center font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transform transition hover:scale-[1.02] active:scale-95">
                        <ExternalLink size={20}/> {result.link_text || "詳しく見る"}
                    </a>
                    <p className="text-xs text-center text-gray-400 mt-2">外部サイトへ移動します</p>
                </div>
            )}

            <div className="flex gap-4 border-t pt-6">
                <button onClick={onRetry} className="flex-1 py-3 rounded-lg border border-gray-300 font-bold text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors">
                    <RefreshCw size={18}/> 再診断
                </button>
                <button onClick={onBack} className="flex-1 py-3 rounded-lg bg-gray-800 font-bold text-white hover:bg-gray-900 flex items-center justify-center gap-2 transition-colors">
                    <Home size={18}/> TOP
                </button>
            </div>
        </div>
    </div>
  );
};

// 5. Quiz Player
const QuizPlayer = ({ quiz, onBack }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  
  const parseJson = (data) => typeof data === 'string' ? JSON.parse(data) : data;
  const questions = parseJson(quiz.questions);
  const results = parseJson(quiz.results);

  const handleAnswer = (option) => {
    const newAnswers = { ...answers, [currentStep]: option };
    setAnswers(newAnswers);
    if (currentStep + 1 < questions.length) { 
        setCurrentStep(currentStep + 1); 
    } else { 
        setResult(calculateResult(newAnswers, results)); 
    }
  };

  if (result) { 
      return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <ResultView quiz={quiz} result={result} onRetry={() => {setResult(null); setCurrentStep(0); setAnswers({});}} onBack={onBack} />
        </div>
      ); 
  }
  
  const question = questions[currentStep];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center py-6 font-sans">
      <div className="w-full max-w-md mb-4 px-4">
          <button onClick={onBack} className="text-gray-500 font-bold flex items-center gap-1 hover:text-gray-800"><ArrowLeft size={16}/> 戻る</button>
      </div>
      <div className="max-w-md mx-auto w-full px-4">
        <div className="mb-2 flex justify-between text-xs font-bold text-gray-500">
            <span>Question {currentStep+1}</span><span>{questions.length}問中</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full mb-8 overflow-hidden">
            <div className="h-full bg-indigo-600 transition-all duration-300 ease-out" style={{width:`${((currentStep+1)/questions.length)*100}%`}}></div>
        </div>
        
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 animate-slide-up">
            <h3 className="text-xl font-bold text-gray-900 mb-8 text-center leading-relaxed">{question.text}</h3>
            <div className="space-y-4">
                {question.options.map((opt, idx) => (
                    <button key={idx} onClick={() => handleAnswer(opt)} className="w-full p-4 text-left border-2 border-gray-100 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 text-gray-800 font-bold transition-all flex justify-between items-center group active:scale-95">
                        <span className="flex-grow">{opt.label}</span>
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300 group-hover:border-indigo-500 flex-shrink-0 ml-4"></div>
                    </button>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

// 6. Editor (Guest & Admin)
const Editor = ({ onBack, onSave, initialData }) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [isSaving, setIsSaving] = useState(false);
  const [savedId, setSavedId] = useState(null);
  const [aiTheme, setAiTheme] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const defaultForm = {
      title: "新規診断", description: "診断の説明文を入力...", category: "Business", color: "bg-indigo-600",
      questions: Array(5).fill(null).map((_,i)=>({text:`質問${i+1}を入力してください`, options: Array(4).fill(null).map((_,j)=>({label:`選択肢${j+1}`, score:{A:j===0?3:0, B:j===1?3:0, C:j===2?3:0}}))})),
      results: [ {type:"A", title:"タイプA", description:"結果説明...", link_url:"", link_text:""}, {type:"B", title:"タイプB", description:"...", link_url:"", link_text:""}, {type:"C", title:"タイプC", description:"...", link_url:"", link_text:""} ]
  };

  const [form, setForm] = useState(initialData || defaultForm);

  const handlePublish = () => { 
      navigator.clipboard.writeText(`${window.location.origin}?id=${savedId}`); 
      alert(`公開URLをコピーしました！\n${window.location.origin}?id=${savedId}`); 
  };

  const handleAiGenerate = async () => {
      const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
      if(!apiKey) return alert('エラー: OpenAI APIキーが設定されていません。Vercelの環境変数を確認してください。');
      if(!aiTheme) return alert('どんな診断を作りたいかテーマを入力してください');
      setIsGenerating(true);
      try {
          const prompt = `
            テーマ「${aiTheme}」の診断テストを作成してください。
            出力は以下のJSON形式のみで、余計な会話は一切含めないでください。
            
            {
              "title": "キャッチーなタイトル",
              "description": "興味を惹く説明文",
              "questions": [
                {
                  "text": "質問文",
                  "options": [
                    {"label": "回答", "score": {"A": 3, "B": 0, "C": 0}},
                    {"label": "回答", "score": {"A": 0, "B": 3, "C": 0}},
                    {"label": "回答", "score": {"A": 0, "B": 0, "C": 3}},
                    {"label": "回答", "score": {"A": 1, "B": 1, "C": 1}}
                  ]
                }
              ],
              "results": [
                {"type": "A", "title": "○○タイプ", "description": "詳細な説明"},
                {"type": "B", "title": "△△タイプ", "description": "詳細な説明"},
                {"type": "C", "title": "□□タイプ", "description": "詳細な説明"}
              ]
            }
            ※質問は5問、各4択。結果は3タイプ(A,B,C)必須。
          `;
          
          const res = await fetch("https://api.openai.com/v1/chat/completions", {
              method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
              body: JSON.stringify({ model: "gpt-3.5-turbo", messages: [{ role: "user", content: prompt }] })
          });
          
          if (!res.ok) throw new Error('API request failed');

          const data = await res.json();
          const content = data.choices[0].message.content;
          const jsonStr = content.substring(content.indexOf('{'), content.lastIndexOf('}') + 1);
          const json = JSON.parse(jsonStr);
          
          setForm(prev => ({ ...prev, ...json, results: json.results.map(r=>({...r, link_url:"", link_text:""})) })); 
          alert('AI生成が完了しました！内容を確認・調整してください。');
      } catch(e) { alert('AI生成エラー: ' + e.message); } finally { setIsGenerating(false); }
  };

  const Input = ({label, val, onChange, ph}) => (
    <div className="mb-4">
        <label className="text-sm font-bold text-gray-900 block mb-2">{label}</label>
        <input 
            className="w-full border border-gray-300 p-3 rounded-lg text-black font-bold focus:ring-2 focus:ring-indigo-500 outline-none bg-white placeholder-gray-400" 
            value={val||''} 
            onChange={e=>onChange(e.target.value)} 
            placeholder={ph}
        />
    </div>
  );
  
  const Textarea = ({label, val, onChange}) => (
    <div className="mb-4">
        <label className="text-sm font-bold text-gray-900 block mb-2">{label}</label>
        <textarea 
            className="w-full border border-gray-300 p-3 rounded-lg text-black focus:ring-2 focus:ring-indigo-500 outline-none bg-white placeholder-gray-400" 
            rows={3} 
            value={val} 
            onChange={e=>onChange(e.target.value)}
        />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans text-gray-900">
        {/* Editor Header */}
        <div className="bg-white border-b px-6 py-4 flex justify-between sticky top-0 z-50 shadow-sm">
            <div className="flex items-center gap-3">
                <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-700"><ArrowLeft/></button>
                <h2 className="font-bold text-lg text-gray-900">
                    {initialData ? 'クイズ編集(管理者)' : '新規クイズ作成'}
                </h2>
            </div>
            <div className="flex gap-2">
                {savedId && (
                    <button onClick={handlePublish} className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2 animate-pulse">
                        <Share2 size={18}/> 公開URL
                    </button>
                )}
                <button 
                    onClick={async ()=>{
                        setIsSaving(true); 
                        const id = await onSave(form, savedId || initialData?.id); 
                        if(id) setSavedId(id); 
                        setIsSaving(false);
                    }} 
                    disabled={isSaving} 
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-md transition-all"
                >
                    {isSaving ? <Loader2 className="animate-spin"/> : <Save/>} 保存
                </button>
            </div>
        </div>
        
        <div className="flex flex-grow overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r flex flex-col hidden md:flex shrink-0">
                
                {/* AI Section (Top Left) */}
                <div className="p-4 bg-gradient-to-b from-purple-50 to-white border-b">
                    <div className="flex items-center gap-2 mb-2 text-purple-700 font-bold">
                        <Sparkles size={16}/> AI自動生成
                    </div>
                    <textarea 
                        className="w-full border border-purple-200 p-2 rounded-lg text-xs mb-2 focus:ring-2 focus:ring-purple-500 outline-none resize-none bg-white text-gray-900 placeholder-gray-400" 
                        rows={2} 
                        placeholder="テーマを入力 (例: 起業家タイプ診断)" 
                        value={aiTheme} 
                        onChange={e=>setAiTheme(e.target.value)} 
                    />
                    <button onClick={handleAiGenerate} disabled={isGenerating} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-bold text-xs transition-all shadow flex items-center justify-center gap-1">
                        {isGenerating ? <Loader2 className="animate-spin" size={12}/> : <Wand2 size={12}/>} 生成する
                    </button>
                </div>

                <div className="p-4 space-y-1 overflow-y-auto">
                    {['basic','questions','results'].map(id=>(
                        <button key={id} onClick={()=>setActiveTab(id)} className={`w-full px-4 py-3 text-left font-bold rounded-lg transition-colors flex items-center gap-2 ${activeTab===id?'bg-indigo-50 text-indigo-700':'text-gray-600 hover:bg-gray-50'}`}>
                            {id==='basic' && <Edit3 size={16}/>}
                            {id==='questions' && <MessageSquare size={16}/>}
                            {id==='results' && <Trophy size={16}/>}
                            <span className="capitalize">{id}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Area */}
            <div className="flex-grow p-4 md:p-8 overflow-y-auto bg-gray-50">
                {/* Mobile Tab */}
                <div className="md:hidden flex flex-col gap-4 mb-4">
                     <div className="p-4 bg-white rounded-xl shadow-sm border border-purple-100">
                        <div className="flex gap-2 mb-2">
                            <input 
                                className="flex-grow border border-gray-300 p-2 rounded text-sm text-black" 
                                placeholder="AI作成テーマ..." 
                                value={aiTheme} 
                                onChange={e=>setAiTheme(e.target.value)}
                            />
                            <button onClick={handleAiGenerate} disabled={isGenerating} className="bg-purple-600 text-white px-4 rounded font-bold text-sm whitespace-nowrap">
                                {isGenerating ? '...' : '生成'}
                            </button>
                        </div>
                     </div>
                     <div className="flex gap-2 overflow-x-auto pb-2">
                        {['basic','questions','results'].map(id=>(
                            <button key={id} onClick={()=>setActiveTab(id)} className={`px-4 py-2 rounded-full font-bold whitespace-nowrap ${activeTab===id?'bg-indigo-600 text-white':'bg-white border text-gray-700'}`}>{id}</button>
                        ))}
                    </div>
                </div>

                <div className="max-w-3xl mx-auto bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-gray-100 min-h-[500px]">
                    {activeTab === 'basic' && (
                        <div className="animate-fade-in">
                            <h3 className="font-bold text-xl mb-6 border-b pb-2 flex items-center gap-2 text-gray-900"><Edit3 className="text-gray-400"/> 基本情報</h3>
                            <Input label="タイトル" val={form.title} onChange={v=>setForm({...form, title:v})} ph="例：あなたのリーダータイプ診断" />
                            <Textarea label="説明文" val={form.description} onChange={v=>setForm({...form, description:v})} />
                            <Input label="カテゴリ" val={form.category} onChange={v=>setForm({...form, category:v})} ph="Business, Health, Love..." />
                            
                            <div className="mt-6">
                                <label className="text-sm font-bold text-gray-900 block mb-2">テーマカラー</label>
                                <div className="flex gap-3">
                                    {['bg-indigo-600', 'bg-pink-500', 'bg-blue-500', 'bg-green-500', 'bg-orange-500', 'bg-gray-800'].map(c => (
                                        <button key={c} onClick={()=>setForm({...form, color:c})} className={`w-10 h-10 rounded-full ${c} ${form.color===c ? 'ring-4 ring-offset-2 ring-gray-300':''}`}></button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {activeTab === 'questions' && (
                        <div className="space-y-8 animate-fade-in">
                            <h3 className="font-bold text-xl mb-6 border-b pb-2 flex items-center gap-2 text-gray-900"><MessageSquare className="text-gray-400"/> 質問設定 (5問)</h3>
                            {form.questions.map((q, i)=>(
                                <div key={i} className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                    <div className="font-bold text-indigo-600 mb-2">Q{i+1}</div>
                                    <Input label="質問文" val={q.text} onChange={v=>{const n=[...form.questions];n[i].text=v;setForm({...form, questions:n})}} />
                                    <div className="space-y-3 mt-4">
                                        {q.options.map((o, j)=>(
                                            <div key={j} className="flex gap-2 items-center bg-white p-2 rounded border border-gray-200">
                                                <div className="bg-gray-200 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">{j+1}</div>
                                                <input className="flex-grow p-1 outline-none text-sm font-bold text-gray-900 placeholder-gray-400" value={o.label} onChange={e=>{const n=[...form.questions];n[i].options[j].label=e.target.value;setForm({...form, questions:n})}} placeholder={`選択肢${j+1}`} />
                                                <div className="flex gap-2 border-l pl-2">
                                                    {['A','B','C'].map(t=>(
                                                        <div key={t} className="flex flex-col items-center">
                                                            <span className="text-[9px] text-gray-500">{t}</span>
                                                            <input type="number" className="w-8 bg-gray-50 border border-gray-300 text-center text-xs rounded text-gray-900" value={o.score[t]} onChange={e=>{const n=[...form.questions];n[i].options[j].score[t]=e.target.value;setForm({...form, questions:n})}} />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'results' && (
                        <div className="space-y-8 animate-fade-in">
                            <h3 className="font-bold text-xl mb-6 border-b pb-2 flex items-center gap-2 text-gray-900"><Trophy className="text-gray-400"/> 結果ページ設定</h3>
                            {form.results.map((r, i)=>(
                                <div key={i} className="bg-gray-50 p-6 rounded-xl border border-gray-200 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 bg-gray-200 text-gray-600 px-3 py-1 rounded-bl-lg font-bold text-xs">Type {r.type}</div>
                                    <Input label="診断結果タイトル" val={r.title} onChange={v=>{const n=[...form.results];n[i].title=v;setForm({...form, results:n})}} />
                                    <Textarea label="結果の説明文" val={r.description} onChange={v=>{const n=[...form.results];n[i].description=v;setForm({...form, results:n})}}/>
                                    
                                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mt-4">
                                        <p className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2"><ExternalLink size={16}/> 誘導ボタン設置 (任意)</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Input label="リンク先URL (https://...)" val={r.link_url} onChange={v=>{const n=[...form.results];n[i].link_url=v;setForm({...form, results:n})}} ph="LINE登録や商品LPのURL" />
                                            <Input label="ボタンの文言" val={r.link_text} onChange={v=>{const n=[...form.results];n[i].link_text=v;setForm({...form, results:n})}} ph="詳細を見る" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

// 7. App Root
const App = () => {
  const [view, setView] = useState('portal'); 
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);

  const fetchQuizzes = async () => {
    if(!supabase) return;
    setIsLoading(true);
    const {data} = await supabase.from('quizzes').select('*').order('created_at',{ascending:false});
    setQuizzes(data||[]);
    setIsLoading(false);
  };

  useEffect(() => {
      const init = async () => {
          const params = new URLSearchParams(window.location.search);
          const id = params.get('id');
          if(id && supabase) {
              const {data} = await supabase.from('quizzes').select('*').eq('id',id).single();
              if(data) { setSelectedQuiz(data); setView('quiz'); }
          }
          if(supabase) {
              supabase.auth.getSession().then(({data:{session}})=>setUser(session?.user||null));
              const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
                setUser(session?.user || null);
              });
              await fetchQuizzes();
              return () => subscription.unsubscribe();
          }
      };
      init();
  }, []);

  const handleSave = async (form, id) => {
      if(!supabase) return;
      try {
          const payload = {
              title: form.title, description: form.description, category: form.category, color: form.color,
              questions: form.questions, results: form.results, 
              user_id: user?.id || null 
          };
          let result;
          if (id) {
             result = await supabase.from('quizzes').update(payload).eq('id',id).select(); 
          } else {
             result = await supabase.from('quizzes').insert([payload]).select();
          }
          if(result.error) throw result.error;
          alert('保存しました！');
          await fetchQuizzes();
          return result.data[0].id;
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

  return (
    <div>
        <AuthModal isOpen={showAuth} onClose={()=>setShowAuth(false)} setUser={setUser} />
        {view === 'portal' && (
            <Portal 
                quizzes={quizzes} 
                isLoading={isLoading} 
                user={user} 
                setShowAuth={setShowAuth} 
                onLogout={async ()=>{ await supabase.auth.signOut(); alert('ログアウトしました'); }} 
                onPlay={(q)=>{setSelectedQuiz(q); setView('quiz');}} 
                onCreate={()=>{setEditingQuiz(null); setView('editor');}} 
                setPage={setView}
                onEdit={(q)=>{setEditingQuiz(q); setView('editor');}}
                onDelete={handleDelete}
            />
        )}
        {view === 'price' && <PricePage onBack={()=>setView('portal')} />}
        {view === 'howto' && <HowToPage onBack={()=>setView('portal')} />}
        {view === 'quiz' && (
            <QuizPlayer 
                quiz={selectedQuiz} 
                onBack={()=>{setView('portal'); setSelectedQuiz(null); window.history.replaceState(null, '', window.location.pathname);}} 
            />
        )}
        {view === 'editor' && (
            <Editor 
                user={user} 
                initialData={editingQuiz}
                onBack={()=>{setView('portal'); setEditingQuiz(null);}} 
                onSave={handleSave} 
            />
        )}
    </div>
  );
};

export default App;