"use client";

import React, { useState, useEffect } from 'react';
import { 
    Edit3, Loader2, Save, Share2, ArrowLeft, Plus, Trash2, 
    X, Link, UploadCloud, Eye, User, FileText, GripVertical,
    ChevronUp, ChevronDown
} from 'lucide-react';
import { generateSlug } from '../lib/utils';
import { supabase } from '../lib/supabase';

// データ構造の型定義
type ProfileBlock = 
  | { type: 'header'; data: { avatarUrl: string; name: string; tagline: string } }
  | { type: 'glass_card_text'; data: { title: string; text: string; alignment: 'left' | 'center' } }
  | { type: 'link_list'; data: { links: { label: string; url: string; style: string }[] } };

// プレビュー用のBlockRendererコンポーネント（ProfilePageから移植）
function BlockRenderer({ block }: { block: ProfileBlock }) {
  switch (block.type) {
    case 'header':
      return (
        <header className="text-center space-y-4 pt-8 animate-fade-in">
          <div className="relative inline-block">
            <img 
              src={block.data.avatarUrl || '/placeholder-avatar.png'} 
              alt={`${block.data.name} プロフィール写真`}
              className="w-32 h-32 md:w-36 md:h-36 rounded-full mx-auto shadow-xl border-4 border-white object-cover"
            />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
            {block.data.name}
          </h1>
          <p 
            className="text-base md:text-lg text-white font-semibold px-4 drop-shadow-md"
            dangerouslySetInnerHTML={{ __html: block.data.tagline.replace(/\n/g, '<br>') }}
          />
        </header>
      );

    case 'glass_card_text':
      const alignmentClass = block.data.alignment === 'center' ? 'text-center' : 'text-left';
      return (
        <section className={`glass-card rounded-2xl p-6 shadow-lg animate-fade-in ${alignmentClass}`}>
          {block.data.title && (
            <h2 className="text-xl font-bold mb-4 accent-color">
              {block.data.title}
            </h2>
          )}
          <div 
            className="text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: block.data.text.replace(/\n/g, '<br>') }}
          />
        </section>
      );

    case 'link_list':
      return (
        <section className="space-y-4 animate-fade-in">
          <h3 className="text-center font-bold text-white drop-shadow-md mb-4">Follow Me & More Info</h3>
          {block.data.links.map((link, index) => {
            const isOrange = link.style?.includes('orange') || link.label?.includes('Kindle') || link.label?.includes('Amazon');
            const isLine = link.url?.includes('lin.ee') || link.label?.includes('LINE');
            
            return (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`link-button ${isOrange ? 'bg-orange-50 border-orange-200' : ''} ${isLine ? 'bg-[#06C755] hover:bg-[#05b34c] text-white' : ''}`}
              >
                {link.label?.includes('note') && <span className="mr-3 text-2xl">📓</span>}
                {link.label?.includes('X') || link.label?.includes('Twitter') ? (
                  <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                  </svg>
                ) : null}
                {link.label?.includes('Facebook') ? (
                  <svg className="w-6 h-6 mr-3 text-blue-600" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                ) : null}
                {link.label?.includes('ホームページ') || link.label?.includes('公式HP') ? (
                  <span className="mr-3 text-2xl">🏢</span>
                ) : null}
                {link.label?.includes('Kindle') || link.label?.includes('Amazon') ? (
                  <span className="mr-3 text-2xl">📕</span>
                ) : null}
                <span className={`flex-1 text-left ${isOrange ? 'font-bold text-orange-800' : ''}`}>
                  {link.label}
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isOrange ? 'text-orange-400' : 'text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </a>
            );
          })}
        </section>
      );

    default:
      return null;
  }
}

// 入力コンポーネント
const Input = ({label, val, onChange, ph, type = "text"}: {label: string; val: string; onChange: (v: string) => void; ph?: string; type?: string}) => (
    <div className="mb-4">
        <label className="text-sm font-bold text-gray-900 block mb-2">{label}</label>
        <input 
            type={type}
            className="w-full border border-gray-300 p-3 rounded-lg text-black font-bold focus:ring-2 focus:ring-indigo-500 outline-none bg-white placeholder-gray-400 transition-shadow" 
            value={val||''} 
            onChange={e=>onChange(e.target.value)} 
            placeholder={ph}
        />
    </div>
);

const Textarea = ({label, val, onChange, rows = 3}: {label: string; val: string; onChange: (v: string) => void; rows?: number}) => (
    <div className="mb-4">
        <label className="text-sm font-bold text-gray-900 block mb-2">{label}</label>
        <textarea 
            className="w-full border border-gray-300 p-3 rounded-lg text-black focus:ring-2 focus:ring-indigo-500 outline-none bg-white placeholder-gray-400 transition-shadow" 
            rows={rows} 
            value={val||''} 
            onChange={e=>onChange(e.target.value)}
        />
    </div>
);

interface ProfileEditorProps {
  onBack: () => void;
  onSave?: (data: { slug: string; content: ProfileBlock[] }) => void;
  initialSlug?: string | null;
  user: any;
  setShowAuth: (show: boolean) => void;
}

const ProfileEditor = ({ onBack, onSave, initialSlug, user, setShowAuth }: ProfileEditorProps) => {
  useEffect(() => { 
    document.title = "プロフィール作成・編集 | プロフィールLPメーカー"; 
    window.scrollTo(0, 0);
  }, []);

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [savedSlug, setSavedSlug] = useState<string | null>(initialSlug || null);
  const [isUploading, setIsUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  // デフォルトのプロフィールコンテンツ
  const defaultContent: ProfileBlock[] = [
    {
      type: 'header',
      data: {
        avatarUrl: '',
        name: 'あなたの名前',
        tagline: 'キャッチコピーを入力してください'
      }
    },
    {
      type: 'glass_card_text',
      data: {
        title: 'メインメッセージのタイトル',
        text: 'ここにメインメッセージの本文を入力してください。\n改行も可能です。',
        alignment: 'center'
      }
    },
    {
      type: 'link_list',
      data: {
        links: [
          { label: 'note', url: 'https://note.com/example', style: '' },
          { label: 'X (旧Twitter)', url: 'https://x.com/example', style: '' }
        ]
      }
    }
  ];

  const [profileContent, setProfileContent] = useState<ProfileBlock[]>(defaultContent);

  // Supabaseからデータを読み込む
  useEffect(() => {
    const loadProfile = async () => {
      if (!initialSlug || !supabase) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('slug', initialSlug)
          .single();

        if (error) throw error;
        
        if (data && data.content) {
          setProfileContent(data.content);
          setSavedSlug(data.slug);
        }
      } catch (error) {
        console.error('プロフィール読み込みエラー:', error);
        alert('プロフィールの読み込みに失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [initialSlug]);

  // Headerブロックの更新
  const updateHeader = (field: 'avatarUrl' | 'name' | 'tagline', value: string) => {
    setProfileContent(prev => {
      const newContent = [...prev];
      const headerIndex = newContent.findIndex(b => b.type === 'header');
      if (headerIndex >= 0 && newContent[headerIndex].type === 'header') {
        newContent[headerIndex] = {
          ...newContent[headerIndex],
          data: { ...newContent[headerIndex].data, [field]: value }
        };
      }
      return newContent;
    });
  };

  // GlassCardTextブロックの更新
  const updateGlassCardText = (field: 'title' | 'text' | 'alignment', value: string) => {
    setProfileContent(prev => {
      const newContent = [...prev];
      const textIndex = newContent.findIndex(b => b.type === 'glass_card_text');
      if (textIndex >= 0 && newContent[textIndex].type === 'glass_card_text') {
        newContent[textIndex] = {
          ...newContent[textIndex],
          data: { ...newContent[textIndex].data, [field]: value }
        };
      }
      return newContent;
    });
  };

  // リンクの追加
  const addLink = () => {
    setProfileContent(prev => {
      const newContent = [...prev];
      const linkIndex = newContent.findIndex(b => b.type === 'link_list');
      if (linkIndex >= 0 && newContent[linkIndex].type === 'link_list') {
        newContent[linkIndex] = {
          ...newContent[linkIndex],
          data: {
            ...newContent[linkIndex].data,
            links: [...newContent[linkIndex].data.links, { label: '新しいリンク', url: 'https://', style: '' }]
          }
        };
      }
      return newContent;
    });
  };

  // リンクの削除
  const removeLink = (index: number) => {
    setProfileContent(prev => {
      const newContent = [...prev];
      const linkIndex = newContent.findIndex(b => b.type === 'link_list');
      if (linkIndex >= 0 && newContent[linkIndex].type === 'link_list') {
        newContent[linkIndex] = {
          ...newContent[linkIndex],
          data: {
            ...newContent[linkIndex].data,
            links: newContent[linkIndex].data.links.filter((_, i) => i !== index)
          }
        };
      }
      return newContent;
    });
  };

  // リンクの更新
  const updateLink = (index: number, field: 'label' | 'url' | 'style', value: string) => {
    setProfileContent(prev => {
      const newContent = [...prev];
      const linkIndex = newContent.findIndex(b => b.type === 'link_list');
      if (linkIndex >= 0 && newContent[linkIndex].type === 'link_list') {
        const newLinks = [...newContent[linkIndex].data.links];
        newLinks[index] = { ...newLinks[index], [field]: value };
        newContent[linkIndex] = {
          ...newContent[linkIndex],
          data: { ...newContent[linkIndex].data, links: newLinks }
        };
      }
      return newContent;
    });
  };

  // リンクの並び替え
  const moveLink = (index: number, direction: 'up' | 'down') => {
    setProfileContent(prev => {
      const newContent = [...prev];
      const linkIndex = newContent.findIndex(b => b.type === 'link_list');
      if (linkIndex >= 0 && newContent[linkIndex].type === 'link_list') {
        const newLinks = [...newContent[linkIndex].data.links];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex >= 0 && newIndex < newLinks.length) {
          [newLinks[index], newLinks[newIndex]] = [newLinks[newIndex], newLinks[index]];
          newContent[linkIndex] = {
            ...newContent[linkIndex],
            data: { ...newContent[linkIndex].data, links: newLinks }
          };
        }
      }
      return newContent;
    });
  };

  // 画像アップロード
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !supabase) return;
    if (!user) {
      alert('画像をアップロードするにはログインが必要です');
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('profile-images').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('profile-images').getPublicUrl(filePath);
      updateHeader('avatarUrl', data.publicUrl);
    } catch (error: any) {
      alert('アップロードエラー: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  // 保存処理
  const handleSave = async () => {
    if (!supabase) {
      alert('データベースに接続されていません');
      return;
    }

    setIsSaving(true);
    try {
      const slug = savedSlug || generateSlug();
      const headerBlock = profileContent.find(b => b.type === 'header');
      const name = headerBlock?.type === 'header' ? headerBlock.data.name : 'プロフィール';

      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          slug,
          content: profileContent,
          user_id: user?.id || null,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'slug'
        })
        .select()
        .single();

      if (error) throw error;
      
      setSavedSlug(slug);
      alert('保存しました！');
      
      if (onSave) {
        onSave({ slug, content: profileContent });
      }
    } catch (error: any) {
      console.error('保存エラー:', error);
      alert('保存に失敗しました: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // 公開URLのコピー
  const handlePublish = () => {
    if (!savedSlug) {
      alert('先に保存してください');
      return;
    }
    const url = `${window.location.origin}/p/${savedSlug}`;
    navigator.clipboard.writeText(url);
    alert(`公開URLをクリップボードにコピーしました！\n\n${url}`);
  };

  // ブロックの取得（ヘルパー関数）
  const getHeaderBlock = () => {
    const block = profileContent.find(b => b.type === 'header');
    return block?.type === 'header' ? block.data : defaultContent[0].type === 'header' ? defaultContent[0].data : { avatarUrl: '', name: '', tagline: '' };
  };

  const getGlassCardTextBlock = () => {
    const block = profileContent.find(b => b.type === 'glass_card_text');
    return block?.type === 'glass_card_text' ? block.data : defaultContent[1].type === 'glass_card_text' ? defaultContent[1].data : { title: '', text: '', alignment: 'center' as const };
  };

  const getLinkListBlock = () => {
    const block = profileContent.find(b => b.type === 'link_list');
    return block?.type === 'link_list' ? block.data.links : [];
  };

  const headerData = getHeaderBlock();
  const glassCardData = getGlassCardTextBlock();
  const links = getLinkListBlock();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex font-sans text-gray-900">
      {/* 左側: 編集エリア */}
      <div className={`flex-1 overflow-y-auto transition-all ${showPreview ? 'w-1/2' : 'w-full'}`}>
        {/* ヘッダー */}
        <div className="bg-white border-b px-6 py-4 flex justify-between sticky top-0 z-50 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-700">
              <ArrowLeft/>
            </button>
            <h2 className="font-bold text-lg text-gray-900">
              {initialSlug ? 'プロフィール編集' : '新規プロフィール作成'}
            </h2>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowPreview(!showPreview)} 
              className="bg-purple-50 border border-purple-200 text-purple-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-purple-100 transition-all"
            >
              <Eye size={18}/> {showPreview ? 'プレビュー非表示' : 'プレビュー表示'}
            </button>
            {savedSlug && (
              <button 
                onClick={handlePublish} 
                className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-green-100"
              >
                <Share2 size={18}/> 公開URL
              </button>
            )}
            <button 
              onClick={handleSave} 
              disabled={isSaving} 
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-md transition-all"
            >
              {isSaving ? <Loader2 className="animate-spin"/> : <Save/>} 保存
            </button>
          </div>
        </div>

        {/* 編集フォーム */}
        <div className="p-6 max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10 space-y-8">
            
            {/* 基本情報（Headerブロック） */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <User className="text-indigo-600" size={20}/>
                <h3 className="font-bold text-xl text-gray-900">基本情報</h3>
              </div>
              
              <div className="mb-4">
                <label className="text-sm font-bold text-gray-900 block mb-2">プロフィール画像</label>
                <div className="flex gap-2">
                  <Input 
                    label="" 
                    val={headerData.avatarUrl} 
                    onChange={v => updateHeader('avatarUrl', v)} 
                    ph="画像URL (https://...)" 
                  />
                  <label className="bg-indigo-50 text-indigo-700 px-4 py-3 rounded-lg font-bold hover:bg-indigo-100 flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap self-end">
                    {isUploading ? <Loader2 className="animate-spin" size={16}/> : <UploadCloud size={16}/>}
                    <span>アップロード</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading}/>
                  </label>
                </div>
                {headerData.avatarUrl && (
                  <img src={headerData.avatarUrl} alt="Preview" className="h-32 w-32 rounded-full object-cover mt-2 border-4 border-white shadow-lg"/>
                )}
              </div>

              <Input 
                label="名前" 
                val={headerData.name} 
                onChange={v => updateHeader('name', v)} 
                ph="あなたの名前" 
              />
              <Textarea 
                label="キャッチコピー（肩書き）" 
                val={headerData.tagline} 
                onChange={v => updateHeader('tagline', v)} 
                rows={2}
              />
            </section>

            {/* メインメッセージ（GlassCardTextブロック） */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="text-indigo-600" size={20}/>
                <h3 className="font-bold text-xl text-gray-900">メインメッセージ</h3>
              </div>

              <Input 
                label="タイトル" 
                val={glassCardData.title} 
                onChange={v => updateGlassCardText('title', v)} 
                ph="メインメッセージのタイトル" 
              />
              <Textarea 
                label="本文" 
                val={glassCardData.text} 
                onChange={v => updateGlassCardText('text', v)} 
                rows={6}
              />
              <div className="mb-4">
                <label className="text-sm font-bold text-gray-900 block mb-2">配置</label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => updateGlassCardText('alignment', 'left')}
                    className={`flex-1 py-3 rounded-lg font-bold text-sm border transition-all ${
                      glassCardData.alignment === 'left' 
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700' 
                        : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    左寄せ
                  </button>
                  <button 
                    onClick={() => updateGlassCardText('alignment', 'center')}
                    className={`flex-1 py-3 rounded-lg font-bold text-sm border transition-all ${
                      glassCardData.alignment === 'center' 
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700' 
                        : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    中央揃え
                  </button>
                </div>
              </div>
            </section>

            {/* リンク集（LinkListブロック） */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Link className="text-indigo-600" size={20}/>
                  <h3 className="font-bold text-xl text-gray-900">リンク集 ({links.length}件)</h3>
                </div>
                <button 
                  onClick={addLink}
                  className="text-sm bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg font-bold hover:bg-indigo-100 flex items-center gap-1 transition-all"
                >
                  <Plus size={16}/> 追加
                </button>
              </div>

              <div className="space-y-4">
                {links.map((link, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                      <GripVertical className="text-gray-400" size={16}/>
                      <span className="text-xs font-bold text-gray-500">リンク {index + 1}</span>
                      <div className="flex gap-1 ml-auto">
                        <button 
                          onClick={() => moveLink(index, 'up')}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                          title="上に移動"
                        >
                          <ChevronUp size={14}/>
                        </button>
                        <button 
                          onClick={() => moveLink(index, 'down')}
                          disabled={index === links.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                          title="下に移動"
                        >
                          <ChevronDown size={14}/>
                        </button>
                        <button 
                          onClick={() => removeLink(index)}
                          className="p-1 text-red-400 hover:text-red-600"
                          title="削除"
                        >
                          <Trash2 size={14}/>
                        </button>
                      </div>
                    </div>
                    <Input 
                      label="ラベル" 
                      val={link.label} 
                      onChange={v => updateLink(index, 'label', v)} 
                      ph="例: note, X (旧Twitter)" 
                    />
                    <Input 
                      label="URL" 
                      val={link.url} 
                      onChange={v => updateLink(index, 'url', v)} 
                      ph="https://..." 
                      type="url"
                    />
                    <Input 
                      label="スタイル（オプション）" 
                      val={link.style} 
                      onChange={v => updateLink(index, 'style', v)} 
                      ph="例: orange (オレンジ色のボタン)" 
                    />
                  </div>
                ))}
                {links.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <p>リンクがありません。追加ボタンからリンクを追加してください。</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* 右側: プレビューエリア */}
      {showPreview && (
        <div className="w-1/2 border-l bg-gray-50 overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-4 py-2 z-10">
            <h3 className="font-bold text-sm text-gray-700 flex items-center gap-2">
              <Eye size={16} className="text-purple-600"/> プレビュー
            </h3>
          </div>
          <div className="profile-page-wrapper min-h-screen">
            <div className="container mx-auto max-w-lg p-4 md:p-8">
              <div className="w-full space-y-6 md:space-y-8">
                {profileContent.map((block, index) => (
                  <div key={index} className={index > 0 ? `delay-${Math.min(index, 10)}` : ''}>
                    <BlockRenderer block={block} />
                  </div>
                ))}
                <footer className="text-center py-6 animate-fade-in delay-10">
                  <p className="text-sm text-white/90 drop-shadow-md">
                    &copy; {new Date().getFullYear()} All Rights Reserved.
                  </p>
                </footer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileEditor;

