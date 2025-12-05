import React, { useState, useEffect } from 'react';
import { 
    Edit3, MessageSquare, Trophy, Loader2, Save, Share2, 
    Sparkles, Wand2, BookOpen, Image as ImageIcon, 
    Layout, MessageCircle, ArrowLeft, Briefcase, GraduationCap, 
    CheckCircle, Shuffle, Plus, Trash2, X, Link, QrCode, UploadCloud
} from 'lucide-react';
import { generateSlug } from '../lib/utils';
import { supabase } from '../lib/supabase';

const Input = ({label, val, onChange, ph}) => (
    <div className="mb-4">
        <label className="text-sm font-bold text-gray-900 block mb-2">{label}</label>
        <input 
            className="w-full border border-gray-300 p-3 rounded-lg text-black font-bold focus:ring-2 focus:ring-indigo-500 outline-none bg-white placeholder-gray-400 transition-shadow" 
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
            className="w-full border border-gray-300 p-3 rounded-lg text-black focus:ring-2 focus:ring-indigo-500 outline-none bg-white placeholder-gray-400 transition-shadow" 
            rows={3} 
            value={val} 
            onChange={e=>onChange(e.target.value)}
        />
    </div>
);

const Editor = ({ onBack, onSave, initialData, setPage, user }) => {
  useEffect(() => { document.title = "クイズ作成・編集 | 診断クイズメーカー"; }, []);
  const [activeTab, setActiveTab] = useState('基本設定');
  const [isSaving, setIsSaving] = useState(false);
  const [savedId, setSavedId] = useState(null);
  const [aiTheme, setAiTheme] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const TABS = [
      { id: '基本設定', icon: Edit3, label: '基本設定' },
      { id: '質問作成', icon: MessageSquare, label: '質問作成' },
      { id: '結果ページ', icon: Trophy, label: '結果ページ' }
  ];

  const defaultForm = {
      title: "新規クイズ", description: "説明文を入力...", category: "Business", color: "bg-indigo-600", layout: "card", image_url: "", mode: "diagnosis",
      questions: Array(5).fill(null).map((_,i)=>({text:`質問${i+1}を入力してください`, options: Array(4).fill(null).map((_,j)=>({label:`選択肢${j+1}`, score:{A:j===0?3:0, B:j===1?3:0, C:j===2?3:0}}))})),
      results: [ {type:"A", title:"結果A", description:"説明...", link_url:"", link_text:"", line_url:"", line_text:"", qr_url:"", qr_text:""}, {type:"B", title:"結果B", description:"...", link_url:"", link_text:"", line_url:"", line_text:"", qr_url:"", qr_text:""}, {type:"C", title:"結果C", description:"...", link_url:"", link_text:"", line_url:"", line_text:"", qr_url:"", qr_text:""} ]
  };

  const [form, setForm] = useState(initialData || defaultForm);

  const switchMode = (newMode) => {
      let newResults = form.results;
      let newCategory = "Business";

      if (newMode === 'test') {
          newCategory = "Education";
          newResults = [
              { type: "A", title: "満点！天才！", description: "全問正解です。素晴らしい！", link_url:"", link_text:"", line_url:"", line_text:"", qr_url:"", qr_text:"" },
              { type: "B", title: "あと少し！", description: "惜しい、もう少しで満点です。", link_url:"", link_text:"", line_url:"", line_text:"", qr_url:"", qr_text:"" },
              { type: "C", title: "頑張ろう", description: "復習して再挑戦しましょう。", link_url:"", link_text:"", line_url:"", line_text:"", qr_url:"", qr_text:"" }
          ];
      } else if (newMode === 'fortune') {
          newCategory = "Fortune";
          newResults = [
              { type: "A", title: "大吉", description: "最高の運勢です！", link_url:"", link_text:"", line_url:"", line_text:"", qr_url:"", qr_text:"" },
              { type: "B", title: "中吉", description: "良いことがあるかも。", link_url:"", link_text:"", line_url:"", line_text:"", qr_url:"", qr_text:"" },
              { type: "C", title: "吉", description: "平凡こそ幸せ。", link_url:"", link_text:"", line_url:"", line_text:"", qr_url:"", qr_text:"" }
          ];
      } else {
          // ★修正: ビジネス診断に戻す場合の処理を追加
          newCategory = "Business";
          newResults = [
              { type: "A", title: "結果A", description: "説明...", link_url:"", link_text:"", line_url:"", line_text:"", qr_url:"", qr_text:"" },
              { type: "B", title: "結果B", description: "...", link_url:"", link_text:"", line_url:"", line_text:"", qr_url:"", qr_text:"" },
              { type: "C", title: "結果C", description: "...", link_url:"", link_text:"", line_url:"", line_text:"", qr_url:"", qr_text:"" }
          ];
      }
      setForm({ ...form, mode: newMode, category: newCategory, results: newResults });
  };

  const handlePublish = () => { 
      const urlId = savedId || initialData?.slug || initialData?.id;
      const url = `${window.location.origin}?id=${urlId}`;
      navigator.clipboard.writeText(url); 
      alert(`公開URLをコピーしました！\n${url}`); 
  };

  const addQuestion = () => {
      if(form.questions.length >= 10) return alert('質問は最大10個までです');
      setForm({
          ...form,
          questions: [...form.questions, {text:`質問${form.questions.length+1}`, options: Array(4).fill(null).map((_,j)=>({label:`選択肢${j+1}`, score:{A:0, B:0, C:0}}))}]
      });
  };

  const removeQuestion = (index) => {
      if(form.questions.length <= 1) return alert('質問は最低1つ必要です');
      const newQuestions = form.questions.filter((_, i) => i !== index);
      setForm({...form, questions: newQuestions});
  };

  const addOption = (qIndex) => {
      const newQuestions = [...form.questions];
      if(newQuestions[qIndex].options.length >= 6) return alert('選択肢は最大6つまでです');
      newQuestions[qIndex].options.push({label:`選択肢${newQuestions[qIndex].options.length+1}`, score:{A:0, B:0, C:0}});
      setForm({...form, questions: newQuestions});
  };

  const removeOption = (qIndex, optIndex) => {
      const newQuestions = [...form.questions];
      if(newQuestions[qIndex].options.length <= 2) return alert('選択肢は最低2つ必要です');
      newQuestions[qIndex].options = newQuestions[qIndex].options.filter((_, i) => i !== optIndex);
      setForm({...form, questions: newQuestions});
  };

  const addResult = () => {
      if(form.results.length >= 10) return alert('結果パターンは最大10個までです');
      const nextType = String.fromCharCode(65 + form.results.length);
      setForm({
          ...form,
          results: [...form.results, {type: nextType, title:`結果${nextType}`, description:"...", link_url:"", link_text:"", line_url:"", line_text:"", qr_url:"", qr_text:""}]
      });
  };

  const removeResult = (index) => {
      if(form.results.length <= 2) return alert('結果パターンは最低2つ必要です');
      const newResults = form.results.filter((_, i) => i !== index);
      setForm({...form, results: newResults});
  };

  const handleImageUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (!supabase) return alert("データベースに接続されていません");

      setIsUploading(true);
      try {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `${user?.id || 'anonymous'}/${fileName}`;

          const { error: uploadError } = await supabase.storage
              .from('quiz-thumbnails')
              .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data } = supabase.storage
              .from('quiz-thumbnails')
              .getPublicUrl(filePath);

          setForm({ ...form, image_url: data.publicUrl });
      } catch (error) {
          alert('アップロードエラー: ' + error.message);
      } finally {
          setIsUploading(false);
      }
  };

  const handleRandomImage = () => {
      const curatedImages = [
          "https://images.unsplash.com/photo-1664575602276-acd073f104c1?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1606857521015-7f9fcf423740?auto=format&fit=crop&w=800&q=80"
      ];
      const selected = curatedImages[Math.floor(Math.random() * curatedImages.length)];
      setForm({...form, image_url: selected});
  };

  const handleAiGenerate = async () => {
      const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
      if(!apiKey) return alert('エラー: OpenAI APIキーが設定されていません。Vercelの環境変数を確認してください。');
      if(!aiTheme) return alert('どんな診断を作りたいかテーマを入力してください');
      setIsGenerating(true);
      try {
          let prompt = "";
          if (form.mode === 'test') {
              prompt = `テーマ「${aiTheme}」の4択学習クイズを作成して。質問5つ。各質問で正解は1つだけ（scoreのAを1、他を0にする）。結果は高得点・中得点・低得点の3段階。`;
          } else if (form.mode === 'fortune') {
              prompt = `テーマ「${aiTheme}」の占いを作成して。質問5つ（運勢には影響しない演出用）。結果は大吉・中吉・吉などの3パターン。`;
          } else {
              prompt = `テーマ「${aiTheme}」の性格/タイプ診断を作成して。質問5つ。結果は3タイプ。`;
          }

          const res = await fetch("https://api.openai.com/v1/chat/completions", {
              method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
              body: JSON.stringify({ model: "gpt-3.5-turbo", messages: [{ role: "user", content: prompt + `出力はJSON形式のみ: {title, description, questions:[{text, options:[{label, score:{A,B,C}}]...], results:[{type, title, description, link_url, link_text, line_url, line_text, qr_url, qr_text}]}` }] })
          });
          
          if (!res.ok) throw new Error('API request failed');
          const data = await res.json();
          const content = data.choices[0].message.content;
          const jsonStr = content.substring(content.indexOf('{'), content.lastIndexOf('}') + 1);
          const json = JSON.parse(jsonStr);
          setForm(prev => ({ 
              ...prev, ...json,
              results: json.results.map(r => ({...r, link_url:"", link_text:"", line_url:"", line_text:"", qr_url:"", qr_text:""}))
          })); 
          alert('AI生成が完了しました！');
      } catch(e) { alert('AI生成エラー: ' + e.message); } finally { setIsGenerating(false); }
  };

  const setCorrectOption = (qIndex, optIndex) => {
      const newQuestions = [...form.questions];
      newQuestions[qIndex].options = newQuestions[qIndex].options.map((opt, idx) => ({
          ...opt,
          score: { A: idx === optIndex ? 1 : 0, B: 0, C: 0 } 
      }));
      setForm({...form, questions: newQuestions});
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans text-gray-900">
        <div className="bg-white border-b px-6 py-4 flex justify-between sticky top-0 z-50 shadow-sm">
            <div className="flex items-center gap-3">
                <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-700"><ArrowLeft/></button>
                <h2 className="font-bold text-lg text-gray-900 line-clamp-1">
                    {initialData ? '編集' : '新規作成'}
                </h2>
                <span className={`hidden md:inline text-xs px-2 py-1 rounded font-bold ml-2 ${
                    form.mode === 'test' ? 'bg-orange-100 text-orange-700' : 
                    form.mode === 'fortune' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'
                }`}>
                    {form.mode === 'test' ? 'テスト' : form.mode === 'fortune' ? '占い' : '診断'}
                </span>
            </div>
            <div className="flex gap-2">
                {savedId && (
                    <button onClick={handlePublish} className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2 animate-pulse whitespace-nowrap">
                        <Share2 size={18}/> <span className="hidden md:inline">公開URL</span>
                    </button>
                )}
                <button onClick={async ()=>{
                        setIsSaving(true); 
                        const payload = {
                            title: form.title, description: form.description, category: form.category, color: form.color,
                            questions: form.questions, results: form.results, 
                            user_id: user?.id || null, layout: form.layout || 'card', image_url: form.image_url || null, mode: form.mode || 'diagnosis'
                        };
                        const returnedId = await onSave(payload, savedId || initialData?.id);
                        if(returnedId) setSavedId(returnedId); 
                        setIsSaving(false);
                    }} disabled={isSaving} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-md transition-all whitespace-nowrap">
                    {isSaving ? <Loader2 className="animate-spin"/> : <Save/>} 保存
                </button>
            </div>
        </div>
        
        <div className="flex flex-col md:flex-row flex-grow overflow-hidden">
            <div className="bg-white border-b md:border-b-0 md:border-r flex flex-col w-full md:w-64 shrink-0">
                <div className="p-4 bg-gradient-to-b from-purple-50 to-white border-b">
                    <div className="flex items-center gap-2 mb-2 text-purple-700 font-bold text-sm">
                        <Sparkles size={16}/> AI自動生成
                    </div>
                    <textarea 
                        className="w-full border border-purple-200 p-2 rounded-lg text-xs mb-2 focus:ring-2 focus:ring-purple-500 outline-none resize-none bg-white text-gray-900 placeholder-gray-400" 
                        rows={2} placeholder="テーマを入力..." 
                        value={aiTheme} onChange={e=>setAiTheme(e.target.value)} 
                    />
                    <button onClick={handleAiGenerate} disabled={isGenerating} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-bold text-xs transition-all shadow flex items-center justify-center gap-1">
                        {isGenerating ? <Loader2 className="animate-spin" size={12}/> : <Wand2 size={12}/>} 生成する
                    </button>
                    <p className="text-[10px] text-gray-500 mt-2 text-center">※生成には10〜30秒ほどかかります</p>
                </div>

                <div className="flex md:flex-col overflow-x-auto md:overflow-visible p-2 md:p-4 gap-2 border-b md:border-b-0">
                    {TABS.map(tab=>(
                        <button key={tab.id} onClick={()=>setActiveTab(tab.id)} className={`flex-shrink-0 px-4 py-3 text-left font-bold rounded-lg transition-colors flex items-center gap-2 ${activeTab===tab.id?'bg-indigo-50 text-indigo-700':'text-gray-600 hover:bg-gray-50'}`}>
                            <tab.icon size={16}/>
                            <span className="capitalize">{tab.label}</span>
                        </button>
                    ))}
                </div>
                
                <div className="hidden md:block p-4 border-t mt-auto">
                    <button onClick={()=>setPage('howto')} className="w-full text-xs text-gray-500 hover:text-indigo-600 flex items-center justify-center gap-1">
                        <BookOpen size={14}/> 使い方・規約を見る
                    </button>
                </div>
            </div>

            <div className="flex-grow p-4 md:p-8 overflow-y-auto bg-gray-50">
                <div className="max-w-3xl mx-auto bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-gray-100 min-h-[500px]">
                    {activeTab === '基本設定' && (
                        <div className="animate-fade-in">
                            <h3 className="font-bold text-xl mb-6 border-b pb-2 flex items-center gap-2 text-gray-900"><Edit3 className="text-gray-400"/> 基本設定</h3>
                            
                            {!initialData && (
                                <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                    <label className="text-sm font-bold text-gray-900 block mb-3">作成する種類を選択</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        <button onClick={()=>switchMode('diagnosis')} className={`py-4 rounded-xl border-2 font-bold flex flex-col items-center gap-2 text-xs md:text-sm ${form.mode==='diagnosis' ? 'border-indigo-600 bg-white text-indigo-700' : 'border-transparent bg-white shadow-sm text-gray-400'}`}>
                                            <Briefcase size={20}/> ビジネス
                                        </button>
                                        <button onClick={()=>switchMode('test')} className={`py-4 rounded-xl border-2 font-bold flex flex-col items-center gap-2 text-xs md:text-sm ${form.mode==='test' ? 'border-orange-500 bg-white text-orange-600' : 'border-transparent bg-white shadow-sm text-gray-400'}`}>
                                            <GraduationCap size={20}/> 学習
                                        </button>
                                        <button onClick={()=>switchMode('fortune')} className={`py-4 rounded-xl border-2 font-bold flex flex-col items-center gap-2 text-xs md:text-sm ${form.mode==='fortune' ? 'border-purple-500 bg-white text-purple-600' : 'border-transparent bg-white shadow-sm text-gray-400'}`}>
                                            <Sparkles size={20}/> 占い
                                        </button>
                                    </div>
                                </div>
                            )}

                            <Input label="タイトル" val={form.title} onChange={v=>setForm({...form, title:v})} ph="タイトルを入力" />
                            <Textarea label="説明文" val={form.description} onChange={v=>setForm({...form, description:v})} />
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                <div className="mb-4 md:mb-0">
                                    <label className="text-sm font-bold text-gray-900 block mb-2">表示レイアウト</label>
                                    <div className="flex gap-2">
                                        <button onClick={()=>setForm({...form, layout:'card'})} className={`flex-1 py-3 rounded-lg font-bold text-sm border flex items-center justify-center gap-2 ${form.layout==='card' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-gray-200 text-gray-500'}`}><Layout size={16}/> カード</button>
                                        <button onClick={()=>setForm({...form, layout:'chat'})} className={`flex-1 py-3 rounded-lg font-bold text-sm border flex items-center justify-center gap-2 ${form.layout==='chat' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-gray-200 text-gray-500'}`}><MessageCircle size={16}/> チャット</button>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-gray-900 block mb-2">テーマカラー</label>
                                    <div className="flex gap-3 flex-wrap">
                                        {['bg-indigo-600', 'bg-pink-500', 'bg-blue-500', 'bg-green-500', 'bg-orange-500', 'bg-gray-800'].map(c => (
                                            <button key={c} onClick={()=>setForm({...form, color:c})} className={`w-8 h-8 rounded-full ${c} ${form.color===c ? 'ring-4 ring-offset-2 ring-gray-300':''}`}></button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 mb-6">
                                <label className="text-sm font-bold text-gray-900 block mb-2">メイン画像</label>
                                <div className="flex flex-col md:flex-row gap-2">
                                    <input 
                                        className="flex-grow border border-gray-300 p-3 rounded-lg text-black font-bold focus:ring-2 focus:ring-indigo-500 outline-none bg-white placeholder-gray-400" 
                                        value={form.image_url||''} 
                                        onChange={e=>setForm({...form, image_url:e.target.value})} 
                                        placeholder="画像URL (https://...) またはアップロード"
                                    />
                                    <label className="bg-indigo-50 text-indigo-700 px-4 py-3 rounded-lg font-bold hover:bg-indigo-100 flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap">
                                        {isUploading ? <Loader2 className="animate-spin" size={16}/> : <UploadCloud size={16}/>}
                                        <span>アップロード</span>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading}/>
                                    </label>
                                    <button onClick={handleRandomImage} className="bg-gray-100 px-4 py-3 rounded-lg text-sm font-bold hover:bg-gray-200 flex items-center justify-center gap-1 whitespace-nowrap"><ImageIcon size={16}/> 自動</button>
                                </div>
                                {form.image_url && <img src={form.image_url} alt="Preview" className="h-32 w-full object-cover rounded-lg mt-2 border"/>}
                            </div>
                        </div>
                    )}
                    
                    {activeTab === '質問作成' && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="flex justify-between items-center border-b pb-2 mb-6">
                                <h3 className="font-bold text-xl flex items-center gap-2 text-gray-900"><MessageSquare className="text-gray-400"/> 質問 ({form.questions.length}問)</h3>
                                <button onClick={addQuestion} className="text-sm bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-bold hover:bg-indigo-100 flex items-center gap-1"><Plus size={14}/> 追加</button>
                            </div>
                            
                            {form.questions.map((q, i)=>(
                                <div key={i} className="bg-gray-50 p-6 rounded-xl border border-gray-200 relative group">
                                    <button onClick={()=>removeQuestion(i)} className="absolute top-2 right-2 text-gray-300 hover:text-red-500 p-1"><Trash2 size={16}/></button>
                                    <div className="font-bold text-indigo-600 mb-2">Q{i+1}</div>
                                    <Input label="質問文" val={q.text} onChange={v=>{const n=[...form.questions];n[i].text=v;setForm({...form, questions:n})}} />
                                    
                                    <div className="space-y-3 mt-4">
                                        <div className="flex text-xs text-gray-400 px-2 justify-between items-center">
                                            <span>選択肢</span>
                                            <button onClick={()=>addOption(i)} className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 flex items-center gap-1"><Plus size={12}/> 追加</button>
                                        </div>
                                        
                                        <div className="flex text-xs text-gray-400 px-2 mt-2">
                                            <span className="flex-grow"></span>
                                            {form.mode === 'test' ? <span className="w-16 text-center text-orange-500 font-bold">正解</span> 
                                            : form.mode === 'fortune' ? <span className="w-16 text-center text-purple-500 font-bold">ランダム</span>
                                            : <div className="flex gap-2 w-32 justify-end"><span>A</span><span>B</span><span>C</span></div>}
                                        </div>

                                        {q.options.map((o, j)=>(
                                            <div key={j} className="flex items-center gap-2 bg-white p-2 rounded border border-gray-200">
                                                <button onClick={()=>removeOption(i, j)} className="text-gray-300 hover:text-red-500"><Trash2 size={14}/></button>
                                                <input className="flex-grow p-1 outline-none text-sm font-bold text-gray-900 placeholder-gray-400 min-w-0" value={o.label} onChange={e=>{const n=[...form.questions];n[i].options[j].label=e.target.value;setForm({...form, questions:n})}} placeholder={`選択肢${j+1}`} />
                                                
                                                {form.mode === 'test' ? (
                                                    <div className="w-16 flex justify-center border-l pl-2">
                                                        <button onClick={()=>setCorrectOption(i, j)} className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${o.score.A === 1 ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-300 hover:bg-gray-200'}`}><CheckCircle size={16}/></button>
                                                    </div>
                                                ) : form.mode === 'fortune' ? (
                                                    <div className="w-16 flex justify-center border-l pl-2 text-gray-300"><Shuffle size={16}/></div>
                                                ) : (
                                                    <div className="flex gap-2 border-l pl-2 justify-end">
                                                        {['A','B','C'].map(t=>(
                                                            <div key={t} className="flex flex-col items-center">
                                                                <input type="number" className="w-8 bg-gray-50 border border-gray-300 text-center text-xs rounded text-gray-900" value={o.score[t]} onChange={e=>{const n=[...form.questions];n[i].options[j].score[t]=e.target.value;setForm({...form, questions:n})}} />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            <button onClick={addQuestion} className="w-full py-3 bg-gray-50 border-2 border-dashed border-gray-300 text-gray-500 rounded-xl font-bold hover:bg-gray-100 hover:border-gray-400 flex items-center justify-center gap-2"><Plus size={16}/> 質問を追加する</button>
                        </div>
                    )}

                    {activeTab === '結果ページ' && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="flex justify-between items-center border-b pb-2 mb-6">
                                <h3 className="font-bold text-xl flex items-center gap-2 text-gray-900"><Trophy className="text-gray-400"/> 結果パターン ({form.results.length})</h3>
                                <button onClick={addResult} className="text-sm bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-bold hover:bg-indigo-100 flex items-center gap-1"><Plus size={14}/> 追加</button>
                            </div>
                            
                            <div className={`p-4 rounded-lg mb-6 text-sm ${form.mode==='test'?'bg-orange-50 text-orange-800':form.mode==='fortune'?'bg-purple-50 text-purple-800':'bg-blue-50 text-blue-800'}`}>
                                {form.mode === 'test' ? "正解数に応じて結果が変わります（上から順に高得点→低得点）" : form.mode === 'fortune' ? "結果はランダムに表示されます" : "獲得ポイントが多いタイプの結果が表示されます"}
                            </div>
                            
                            {form.results.map((r, i)=>(
                                <div key={i} className="bg-gray-50 p-6 rounded-xl border border-gray-200 relative overflow-hidden group">
                                    <button onClick={()=>removeResult(i)} className="absolute top-2 right-2 text-gray-300 hover:text-red-500 p-1 z-10"><Trash2 size={16}/></button>
                                    <div className="absolute top-0 right-0 bg-gray-200 text-gray-600 px-3 py-1 rounded-bl-lg font-bold text-xs pointer-events-none">
                                        {form.mode === 'test' ? `ランク ${i+1}` : `パターン ${r.type}`}
                                    </div>
                                    <Input label="タイトル" val={r.title} onChange={v=>{const n=[...form.results];n[i].title=v;setForm({...form, results:n})}} />
                                    <Textarea label="結果の説明文" val={r.description} onChange={v=>{const n=[...form.results];n[i].description=v;setForm({...form, results:n})}}/>
                                    
                                    <div className="bg-white p-4 rounded-xl border border-gray-200 mt-4">
                                        <p className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2"><Link size={14}/> 誘導ボタン設定 (任意)</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <Input label="リンク先URL" val={r.link_url} onChange={v=>{const n=[...form.results];n[i].link_url=v;setForm({...form, results:n})}} ph="https://..." />
                                            <Input label="ボタン文言" val={r.link_text} onChange={v=>{const n=[...form.results];n[i].link_text=v;setForm({...form, results:n})}} ph="詳細を見る" />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pt-4 border-t border-gray-100">
                                            <Input label="LINE登録URL" val={r.line_url} onChange={v=>{const n=[...form.results];n[i].line_url=v;setForm({...form, results:n})}} ph="https://line.me/..." />
                                            <Input label="ボタン文言" val={r.line_text} onChange={v=>{const n=[...form.results];n[i].line_text=v;setForm({...form, results:n})}} ph="LINEで相談する" />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                                            <Input label="QRコード画像URL" val={r.qr_url} onChange={v=>{const n=[...form.results];n[i].qr_url=v;setForm({...form, results:n})}} ph="https://..." />
                                            <Input label="ボタン文言" val={r.qr_text} onChange={v=>{const n=[...form.results];n[i].qr_text=v;setForm({...form, results:n})}} ph="QRコードを表示" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button onClick={addResult} className="w-full py-3 bg-gray-50 border-2 border-dashed border-gray-300 text-gray-500 rounded-xl font-bold hover:bg-gray-100 hover:border-gray-400 flex items-center justify-center gap-2"><Plus size={16}/> 結果パターンを追加する</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default Editor;