import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Loader2, Trophy, ExternalLink, MessageCircle, QrCode, RefreshCw, Home, Twitter, Share2, CheckCircle, XCircle, Sparkles, Mail } from 'lucide-react';
import SEO from './SEO';
import { supabase } from '../lib/supabase';
import { calculateResult } from '../lib/utils';
import confetti from 'canvas-confetti';

const ResultView = ({ quiz, result, onRetry, onBack }) => {
  useEffect(() => { 
      document.title = `${result.title} | 結果発表`;
      if(supabase) supabase.rpc('increment_completions', { row_id: quiz.id });
      if (quiz.mode === 'test' && result.score / result.total >= 0.8) {
          fireConfetti();
      }
  }, []);

  const fireConfetti = () => {
      const duration = 3000;
      const end = Date.now() + duration;
      (function frame() {
        confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 } });
        confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 } });
        if (Date.now() < end) requestAnimationFrame(frame);
      }());
  };

  const handleLinkClick = async () => {
    if(supabase) await supabase.rpc('increment_clicks', { row_id: quiz.id });
  };

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}?id=${quiz.slug || quiz.id}` : '';
  const shareText = `${quiz.title} | 結果は「${result.title}」でした！ #診断クイズメーカー`;
  
  const handleShareX = () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  const handleShareLine = () => window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}`, '_blank');

  return (
    <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden my-8 animate-fade-in border border-gray-100 flex flex-col min-h-[80vh]">
        <div className={`${quiz.color || 'bg-indigo-600'} text-white p-10 text-center relative overflow-hidden transition-colors duration-500`}>
            {quiz.image_url && <img src={quiz.image_url} className="absolute inset-0 w-full h-full object-cover opacity-20"/>}
            <div className="absolute top-0 left-0 w-full h-full bg-white opacity-10" style={{backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
            <Trophy className="mx-auto mb-4 text-yellow-300 relative z-10 animate-bounce" size={56} />
            {quiz.mode === 'test' && (
                <div className="relative z-10 mb-2 text-2xl font-bold bg-white/20 inline-block px-4 py-1 rounded-full">
                    {result.score} / {result.total} 問正解
                </div>
            )}
            <h2 className="text-3xl font-extrabold mt-2 relative z-10">{result.title}</h2>
        </div>
        <div className="p-8 md:p-10 flex-grow">
            <div className="prose text-gray-800 leading-relaxed whitespace-pre-wrap mb-10 text-sm md:text-base">
                {result.description}
            </div>
            
            <div className="bg-gray-50 p-4 rounded-xl mb-8 text-center border border-gray-100">
                <p className="text-xs font-bold text-gray-500 mb-3">結果をシェアする</p>
                <div className="flex justify-center gap-3">
                    <button onClick={handleShareX} className="bg-black text-white p-3 rounded-full shadow hover:scale-110 transition-transform"><Twitter size={20}/></button>
                    <button onClick={handleShareLine} className="bg-[#06C755] text-white p-3 rounded-full shadow hover:scale-110 transition-transform"><MessageCircle size={20}/></button>
                    <button onClick={()=>{navigator.clipboard.writeText(shareUrl); alert('URLをコピーしました');}} className="bg-gray-200 text-gray-600 p-3 rounded-full shadow hover:scale-110 transition-transform"><Share2 size={20}/></button>
                </div>
            </div>

            <div className="space-y-4 mb-8">
                {result.link_url && (
                    <a href={result.link_url} onClick={handleLinkClick} target="_blank" rel="noopener noreferrer" className="block w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-center font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transform transition hover:scale-[1.02] active:scale-95">
                        <ExternalLink size={20}/> {result.link_text || "詳しく見る"}
                    </a>
                )}
                {result.line_url && (
                    <a href={result.line_url} onClick={handleLinkClick} target="_blank" rel="noopener noreferrer" className="block w-full bg-[#06C755] hover:bg-[#05b34c] text-white text-center font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transform transition hover:scale-[1.02] active:scale-95">
                        <MessageCircle size={20}/> {result.line_text || "LINE公式アカウント"}
                    </a>
                )}
                {result.qr_url && (
                    <a href={result.qr_url} onClick={handleLinkClick} target="_blank" rel="noopener noreferrer" className="block w-full bg-gray-800 hover:bg-gray-900 text-white text-center font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transform transition hover:scale-[1.02] active:scale-95">
                        <QrCode size={20}/> {result.qr_text || "QRコードを表示"}
                    </a>
                )}
            </div>

            <div className="flex gap-4 border-t pt-6">
                <button onClick={onRetry} className="flex-1 py-3 rounded-lg border border-gray-300 font-bold text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors">
                    <RefreshCw size={18}/> 再診断
                </button>
                <button onClick={onBack} className="flex-1 py-3 rounded-lg bg-gray-800 font-bold text-white hover:bg-gray-900 flex items-center justify-center gap-2 transition-colors">
                    <Home size={18}/> TOP
                </button>
            </div>
        </div>
        <div className="bg-gray-50 p-6 text-center border-t">
            <a href="https://shindan-quiz.makers.tokyo/" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-indigo-600 font-bold">
                &copy; 2025 Shindan Quiz Maker.
            </a>
        </div>
    </div>
  );
};

const QuizPlayer = ({ quiz, onBack }) => {
  useEffect(() => { document.title = `${quiz.title} | 診断中`; }, [quiz.title]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [playableQuestions, setPlayableQuestions] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  
  // ★修正: タイマーIDと「次の処理」を保存するRefを追加
  const messagesEndRef = useRef(null);
  const timerRef = useRef(null);
  const nextActionRef = useRef(null);
  
  useEffect(() => {
    if(supabase) supabase.rpc('increment_views', { row_id: quiz.id }).then(({error})=> error && console.error(error));

    const rawQuestions = typeof quiz.questions === 'string' ? JSON.parse(quiz.questions) : quiz.questions;
    const shuffleArray = (array) => {
        const newArr = [...array];
        for (let i = newArr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
        }
        return newArr;
    };
    setPlayableQuestions(rawQuestions.map(q => ({ ...q, options: shuffleArray(q.options) })));
  }, []);

  useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isTyping, currentStep, feedback, showEmailForm]);

  useEffect(() => {
      if (playableQuestions && currentStep === 0 && chatHistory.length === 0 && quiz.layout === 'chat') {
          setIsTyping(true);
          setTimeout(() => {
              setIsTyping(false);
              setChatHistory([{ type: 'bot', text: playableQuestions[0].text, qNum: 1 }]);
          }, 1500);
      }
  }, [playableQuestions, quiz.layout]);

  const results = typeof quiz.results === 'string' ? JSON.parse(quiz.results) : quiz.results;

  const showResultOrEmail = (finalAnswers) => {
      if (quiz.collect_email && !showEmailForm) {
          setShowEmailForm(true);
          if (quiz.layout === 'chat') {
              setTimeout(() => {
                  setChatHistory(prev => [...prev, { type: 'bot', text: "診断結果が出ました！\n結果を受け取るメールアドレスを入力してください。" }]);
              }, 500);
          }
      } else {
          setResult(calculateResult(finalAnswers, results, quiz.mode));
      }
  };

  const proceedToNext = (newAnswers) => {
      setFeedback(null);
      // タイマーリセット
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
      nextActionRef.current = null;

      if (currentStep + 1 < playableQuestions.length) {
          if (quiz.layout === 'chat') {
              setIsTyping(true);
              setTimeout(() => {
                  setIsTyping(false);
                  setChatHistory(prev => [...prev, { type: 'bot', text: playableQuestions[currentStep + 1].text, qNum: currentStep + 2 }]);
                  setCurrentStep(currentStep + 1);
              }, 1000);
          } else {
              setCurrentStep(currentStep + 1);
          }
      } else {
          if (quiz.layout === 'chat') {
              setIsTyping(true);
              setTimeout(() => {
                  setIsTyping(false);
                  setChatHistory(prev => [...prev, { type: 'bot', text: "お疲れ様でした！\n結果を集計しています..." }]);
                  setTimeout(() => {
                      showResultOrEmail(newAnswers);
                  }, 2000);
              }, 1500);
          } else {
              showResultOrEmail(newAnswers);
          }
      }
  };

  const handleAnswer = (option) => {
    if (feedback || showEmailForm) return;

    const newAnswers = { ...answers, [currentStep]: option };
    setAnswers(newAnswers);

    if (quiz.layout === 'chat') {
        setChatHistory(prev => [...prev, { type: 'user', text: option.label }]);
    }

    if (quiz.mode === 'test') {
        const isCorrect = option.score && option.score.A === 1;
        setFeedback(isCorrect ? 'correct' : 'incorrect');
        
        // ★修正: 「次に進む処理」をRefに保存し、タイマーで実行
        nextActionRef.current = () => proceedToNext(newAnswers);
        timerRef.current = setTimeout(() => {
            if (nextActionRef.current) nextActionRef.current();
        }, 1500);
    } else {
        proceedToNext(newAnswers);
    }
  };

  // ★追加: フィードバックをクリックしたらスキップする処理
  const handleSkipFeedback = () => {
      if (timerRef.current && nextActionRef.current) {
          clearTimeout(timerRef.current);
          nextActionRef.current(); // 即実行
      }
  };

  const handleEmailSubmit = async (e) => {
      e.preventDefault();
      if(!email || !email.includes('@')) return alert('正しいメールアドレスを入力してください');
      setEmailSubmitting(true);
      
      try {
          if(supabase) {
              await supabase.from('quiz_leads').insert([{ quiz_id: quiz.id, email: email }]);
          }
          setShowEmailForm(false);
          setResult(calculateResult(answers, results, quiz.mode));
      } catch(err) {
          console.error(err);
          alert('エラーが発生しました');
      } finally {
          setEmailSubmitting(false);
      }
  };

  if (!playableQuestions || !results) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={40}/></div>;

  if (result) { 
      return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <SEO title={`${result.title} | 結果`} description={result.description.substring(0, 100)} image={quiz.image_url} />
            <ResultView quiz={quiz} result={result} onRetry={() => {setResult(null); setCurrentStep(0); setAnswers({}); setChatHistory([]); setShowEmailForm(false); setEmail('');}} onBack={onBack} />
        </div>
      ); 
  }
  
  const question = playableQuestions[currentStep];
  const progress = Math.round(((currentStep)/playableQuestions.length)*100);

  // ★修正: オーバーレイ全体にクリックイベントを追加
  const FeedbackOverlay = () => {
      if (!feedback) return null;
      return (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in cursor-pointer" 
            onClick={handleSkipFeedback} // クリックでスキップ
          >
              <div className={`bg-white p-8 rounded-3xl shadow-2xl transform scale-110 flex flex-col items-center animate-bounce-quick ${feedback==='correct' ? 'border-4 border-green-500' : 'border-4 border-red-500'}`}>
                  {feedback === 'correct' ? (
                      <>
                          <CheckCircle size={80} className="text-green-500 mb-4"/>
                          <h2 className="text-3xl font-extrabold text-green-600">正解！</h2>
                      </>
                  ) : (
                      <>
                          <XCircle size={80} className="text-red-500 mb-4"/>
                          <h2 className="text-3xl font-extrabold text-red-600">残念...</h2>
                      </>
                  )}
                  {/* ガイド文を追加 */}
                  <p className="text-xs text-gray-400 mt-2 font-bold animate-pulse">Tap to skip ▶</p>
              </div>
          </div>
      );
  };

  if (showEmailForm) {
      return (
          <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
              <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-gray-100 animate-slide-up text-center">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Mail size={32}/>
                  </div>
                  <h2 className="text-2xl font-extrabold text-gray-900 mb-2">診断完了！</h2>
                  <p className="text-gray-500 mb-6 text-sm">結果を表示するために、<br/>メールアドレスを入力してください。</p>
                  
                  <form onSubmit={handleEmailSubmit} className="space-y-4">
                      <input 
                          type="email" 
                          required
                          placeholder="your@email.com" 
                          className="w-full border-2 border-gray-200 p-4 rounded-xl text-lg font-bold outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all text-center"
                          value={email}
                          onChange={e=>setEmail(e.target.value)}
                      />
                      <button type="submit" disabled={emailSubmitting} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2">
                          {emailSubmitting ? <Loader2 className="animate-spin"/> : "結果を見る"}
                      </button>
                  </form>
                  <p className="text-[10px] text-gray-400 mt-4">※入力いただいたアドレスにメルマガをお送りする場合があります。</p>
              </div>
          </div>
      );
  }

  if (quiz.layout === 'chat') {
      return (
        <div className="min-h-screen bg-gray-200 flex items-center justify-center font-sans">
            <FeedbackOverlay />
            <div className="w-full max-w-md bg-[#f0f0f0] h-[100dvh] flex flex-col relative shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-br from-[#00B900] to-[#00C851] p-4 text-white text-center relative shadow-sm z-10 shrink-0">
                    <div className="text-xs opacity-90 absolute left-4 top-1/2 -translate-y-1/2 cursor-pointer" onClick={onBack}><ArrowLeft size={20}/></div>
                    <h1 className="font-bold text-sm">{quiz.title}</h1>
                    <div className="text-[10px] opacity-80">{quiz.mode === 'test' ? '検定中' : 'オンライン'}</div>
                    <div className="bg-white/30 h-1 mt-2 rounded-full overflow-hidden w-1/2 mx-auto">
                        <div className="h-full bg-white transition-all duration-500" style={{width: `${progress}%`}}></div>
                    </div>
                </div>

                <div className="flex-grow p-4 overflow-y-auto pb-72 bg-[#f0f0f0]">
                    {chatHistory.map((msg, i) => (
                        <div key={i} className={`flex mb-4 animate-fade-in-up ${msg.type === 'user' ? 'justify-end' : 'items-start gap-2'}`}>
                            {msg.type === 'bot' && (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00B900] to-[#00C851] flex items-center justify-center text-white flex-shrink-0 text-xl shadow-sm">🤖</div>
                            )}
                            <div className={`relative max-w-[85%] p-4 rounded-2xl shadow-sm text-sm font-medium leading-relaxed whitespace-pre-wrap
                                ${msg.type === 'user' 
                                    ? 'bg-[#00B900] text-white rounded-tr-sm' 
                                    : 'bg-white text-gray-800 rounded-tl-sm'
                                }`}>
                                {msg.qNum && <div className="text-[10px] text-gray-400 mb-1">質問 {msg.qNum} / {playableQuestions.length}</div>}
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex items-start gap-2 mb-4 animate-fade-in">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00B900] to-[#00C851] flex items-center justify-center text-white flex-shrink-0 text-xl shadow-sm">🤖</div>
                            <div className="bg-white p-4 rounded-2xl rounded-tl-sm shadow-sm flex gap-1 items-center h-[52px]">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="absolute bottom-0 left-0 w-full bg-white border-t p-4 z-20 pb-8 safe-area-bottom shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
                    <div className="max-w-md mx-auto space-y-2">
                        {(!isTyping && !feedback && (chatHistory.length === 0 || chatHistory[chatHistory.length-1].type === 'bot')) && (
                            question.options.map((opt, idx) => (
                                <button key={idx} onClick={() => handleAnswer(opt)} 
                                    className="w-full bg-white border-2 border-[#00B900] text-[#00B900] hover:bg-[#00B900] hover:text-white font-bold py-3 rounded-full transition-all active:scale-95 shadow-sm text-sm">
                                    {opt.label}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
      );
  }

  // Card Mode
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center py-6 font-sans">
      <FeedbackOverlay />
      <SEO title={`${quiz.title} | 診断中`} description={quiz.description} image={quiz.image_url} />
      <div className="w-full max-w-md mb-4 px-4">
          <button onClick={onBack} className="text-gray-500 font-bold flex items-center gap-1 hover:text-gray-800"><ArrowLeft size={16}/> 戻る</button>
      </div>
      <div className="max-w-md mx-auto w-full px-4">
        <div className={`${quiz.color || 'bg-indigo-600'} text-white rounded-t-3xl text-center shadow-lg transition-colors duration-500 relative overflow-hidden`}>
             <div className="absolute top-0 left-0 w-full h-full bg-white opacity-10" style={{backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '15px 15px'}}></div>
             {quiz.image_url ? (
                 <div className="w-full h-48 relative">
                     <img src={quiz.image_url} alt="" className="w-full h-full object-cover opacity-90"/>
                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-center p-6">
                        <div>
                            <h2 className="text-xl font-bold mb-1 relative z-10">{quiz.title}</h2>
                            <p className="text-xs opacity-90 relative z-10 line-clamp-2">{quiz.description}</p>
                        </div>
                     </div>
                 </div>
             ) : (
                 <div className="p-6">
                    <h2 className="text-xl font-bold mb-2 relative z-10">{quiz.title}</h2>
                    <p className="text-xs opacity-90 relative z-10 whitespace-pre-wrap">{quiz.description}</p>
                 </div>
             )}
        </div>

        <div className="bg-white rounded-b-3xl shadow-xl p-8 border border-gray-100 border-t-0 mb-8 animate-slide-up">
            <div className="mb-4 flex justify-between text-xs font-bold text-gray-400">
                <span>Q{currentStep+1} / {playableQuestions.length}</span>
                <span>{progress}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full mb-8 overflow-hidden">
                <div className={`${quiz.color || 'bg-indigo-600'} h-full transition-all duration-300 ease-out`} style={{width:`${((currentStep+1)/playableQuestions.length)*100}%`}}></div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-8 text-center leading-relaxed">{question.text}</h3>
            <div className="space-y-4">
                {!feedback && question.options.map((opt, idx) => (
                    <button key={idx} onClick={() => handleAnswer(opt)} className="w-full p-4 text-left border-2 border-gray-100 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 text-gray-800 font-bold transition-all flex justify-between items-center group active:scale-95">
                        <span className="flex-grow">{opt.label}</span>
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300 group-hover:border-indigo-500 flex-shrink-0 ml-4"></div>
                    </button>
                ))}
                {feedback && <div className="text-center text-gray-400 text-sm py-4">判定中...</div>}
            </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPlayer;