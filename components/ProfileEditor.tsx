"use client";

import React, { useState, useEffect } from 'react';
import { 
    Edit3, Loader2, Save, Share2, ArrowLeft, Plus, Trash2, 
    X, Link, UploadCloud, Eye, User, FileText, GripVertical,
    ChevronUp, ChevronDown, Image as ImageIcon, Youtube, MoveUp, MoveDown
} from 'lucide-react';
import { generateSlug } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { Block, generateBlockId, migrateOldContent } from '../lib/types';
import { BlockRenderer } from './BlockRenderer';

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
  onSave?: (data: { slug: string; content: Block[] }) => void;
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
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  // デフォルトのプロフィールコンテンツ
  const getDefaultContent = (): Block[] => [
    {
      id: generateBlockId(),
      type: 'header',
      data: {
        avatar: '',
        name: 'あなたの名前',
        title: 'キャッチコピーを入力してください'
      }
    },
    {
      id: generateBlockId(),
      type: 'text_card',
      data: {
        title: 'メインメッセージのタイトル',
        text: 'ここにメインメッセージの本文を入力してください。\n改行も可能です。',
        align: 'center'
      }
    },
    {
      id: generateBlockId(),
      type: 'links',
      data: {
        links: [
          { label: 'note', url: 'https://note.com/example', style: '' },
          { label: 'X (旧Twitter)', url: 'https://x.com/example', style: '' }
        ]
      }
    }
  ];

  const [blocks, setBlocks] = useState<Block[]>(getDefaultContent());

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
          // 後方互換性のため、旧形式のデータをマイグレーション
          const migratedContent = migrateOldContent(data.content);
          setBlocks(migratedContent);
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

  // ブロックの追加
  const addBlock = (type: Block['type']) => {
    const newBlock: Block = (() => {
      switch (type) {
        case 'header':
          return {
            id: generateBlockId(),
            type: 'header',
            data: { avatar: '', name: '', title: '' }
          };
        case 'text_card':
          return {
            id: generateBlockId(),
            type: 'text_card',
            data: { title: '', text: '', align: 'center' }
          };
        case 'image':
          return {
            id: generateBlockId(),
            type: 'image',
            data: { url: '', caption: '' }
          };
        case 'youtube':
          return {
            id: generateBlockId(),
            type: 'youtube',
            data: { url: '' }
          };
        case 'links':
          return {
            id: generateBlockId(),
            type: 'links',
            data: { links: [] }
          };
      }
    })();
    
    setBlocks(prev => [...prev, newBlock]);
    setSelectedBlockId(newBlock.id);
  };

  // ブロックの削除
  const removeBlock = (blockId: string) => {
    if (!confirm('このブロックを削除しますか？')) return;
    setBlocks(prev => prev.filter(b => b.id !== blockId));
    setSelectedBlockId(null);
  };

  // ブロックの並び替え
  const moveBlock = (blockId: string, direction: 'up' | 'down') => {
    setBlocks(prev => {
      const index = prev.findIndex(b => b.id === blockId);
      if (index === -1) return prev;
      
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      
      const newBlocks = [...prev];
      [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
      return newBlocks;
    });
  };

  // ブロックの更新
  const updateBlock = (blockId: string, updates: Partial<Block['data']>) => {
    setBlocks(prev => prev.map(block => 
      block.id === blockId 
        ? { ...block, data: { ...block.data, ...updates } }
        : block
    ));
  };

  // リンクの追加（linksブロック内）
  const addLinkToBlock = (blockId: string) => {
    setBlocks(prev => prev.map(block => 
      block.id === blockId && block.type === 'links'
        ? { ...block, data: { links: [...block.data.links, { label: '新しいリンク', url: 'https://', style: '' }] } }
        : block
    ));
  };

  // リンクの削除（linksブロック内）
  const removeLinkFromBlock = (blockId: string, linkIndex: number) => {
    setBlocks(prev => prev.map(block => 
      block.id === blockId && block.type === 'links'
        ? { ...block, data: { links: block.data.links.filter((_, i) => i !== linkIndex) } }
        : block
    ));
  };

  // リンクの更新（linksブロック内）
  const updateLinkInBlock = (blockId: string, linkIndex: number, field: 'label' | 'url' | 'style', value: string) => {
    setBlocks(prev => prev.map(block => 
      block.id === blockId && block.type === 'links'
        ? {
            ...block,
            data: {
              links: block.data.links.map((link, i) => 
                i === linkIndex ? { ...link, [field]: value } : link
              )
            }
          }
        : block
    ));
  };

  // 画像アップロード
  const handleImageUpload = async (blockId: string, e: React.ChangeEvent<HTMLInputElement>) => {
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
      updateBlock(blockId, { avatar: data.publicUrl });
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
      const headerBlock = blocks.find(b => b.type === 'header');
      const name = headerBlock?.type === 'header' ? headerBlock.data.name : 'プロフィール';

      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          slug,
          content: blocks,
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
        onSave({ slug, content: blocks });
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

  // ブロック編集フォーム
  const renderBlockEditor = (block: Block) => {
    switch (block.type) {
      case 'header':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">プロフィール画像</label>
              <div className="flex gap-2">
                <Input 
                  label="" 
                  val={block.data.avatar} 
                  onChange={v => updateBlock(block.id, { avatar: v })} 
                  ph="画像URL (https://...)" 
                />
                <label className="bg-indigo-50 text-indigo-700 px-4 py-3 rounded-lg font-bold hover:bg-indigo-100 flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap self-end">
                  {isUploading ? <Loader2 className="animate-spin" size={16}/> : <UploadCloud size={16}/>}
                  <span>アップロード</span>
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(block.id, e)} disabled={isUploading}/>
                </label>
              </div>
              {block.data.avatar && (
                <img src={block.data.avatar} alt="Preview" className="h-32 w-32 rounded-full object-cover mt-2 border-4 border-white shadow-lg"/>
              )}
            </div>
            <Input label="名前" val={block.data.name} onChange={v => updateBlock(block.id, { name: v })} ph="あなたの名前" />
            <Textarea label="キャッチコピー（肩書き）" val={block.data.title} onChange={v => updateBlock(block.id, { title: v })} rows={2} />
          </div>
        );

      case 'text_card':
        return (
          <div className="space-y-4">
            <Input label="タイトル" val={block.data.title} onChange={v => updateBlock(block.id, { title: v })} ph="メインメッセージのタイトル" />
            <Textarea label="本文" val={block.data.text} onChange={v => updateBlock(block.id, { text: v })} rows={6} />
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">配置</label>
              <div className="flex gap-2">
                <button 
                  onClick={() => updateBlock(block.id, { align: 'left' })}
                  className={`flex-1 py-3 rounded-lg font-bold text-sm border transition-all ${
                    block.data.align === 'left' 
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700' 
                      : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  左寄せ
                </button>
                <button 
                  onClick={() => updateBlock(block.id, { align: 'center' })}
                  className={`flex-1 py-3 rounded-lg font-bold text-sm border transition-all ${
                    block.data.align === 'center' 
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700' 
                      : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  中央揃え
                </button>
              </div>
            </div>
          </div>
        );

      case 'image':
        return (
          <div className="space-y-4">
            <Input label="画像URL" val={block.data.url} onChange={v => updateBlock(block.id, { url: v })} ph="https://..." type="url" />
            <Input label="キャプション（オプション）" val={block.data.caption || ''} onChange={v => updateBlock(block.id, { caption: v })} ph="画像の説明" />
            {block.data.url && (
              <img src={block.data.url} alt="Preview" className="w-full rounded-xl object-cover border border-gray-200"/>
            )}
          </div>
        );

      case 'youtube':
        return (
          <div className="space-y-4">
            <Input label="YouTube URL" val={block.data.url} onChange={v => updateBlock(block.id, { url: v })} ph="https://www.youtube.com/watch?v=..." type="url" />
            <p className="text-xs text-gray-500">YouTubeの動画URLを貼り付けてください</p>
          </div>
        );

      case 'links':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-gray-900">リンク ({block.data.links.length}件)</span>
              <button 
                onClick={() => addLinkToBlock(block.id)}
                className="text-sm bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg font-bold hover:bg-indigo-100 flex items-center gap-1"
              >
                <Plus size={14}/> 追加
              </button>
            </div>
            <div className="space-y-3">
              {block.data.links.map((link, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <GripVertical className="text-gray-400" size={14}/>
                    <span className="text-xs font-bold text-gray-500">リンク {index + 1}</span>
                    <button 
                      onClick={() => removeLinkFromBlock(block.id, index)}
                      className="ml-auto p-1 text-red-400 hover:text-red-600"
                      title="削除"
                    >
                      <Trash2 size={14}/>
                    </button>
                  </div>
                  <Input label="ラベル" val={link.label} onChange={v => updateLinkInBlock(block.id, index, 'label', v)} ph="例: note" />
                  <Input label="URL" val={link.url} onChange={v => updateLinkInBlock(block.id, index, 'url', v)} ph="https://..." type="url" />
                  <Input label="スタイル（オプション）" val={link.style} onChange={v => updateLinkInBlock(block.id, index, 'style', v)} ph="例: orange" />
                </div>
              ))}
              {block.data.links.length === 0 && (
                <p className="text-center py-4 text-gray-400 text-sm">リンクがありません</p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

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

        {/* ブロック追加ボタン */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex flex-wrap gap-2">
            <button onClick={() => addBlock('header')} className="bg-white border border-gray-200 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-50 flex items-center gap-2">
              <User size={16}/> ヘッダー
            </button>
            <button onClick={() => addBlock('text_card')} className="bg-white border border-gray-200 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-50 flex items-center gap-2">
              <FileText size={16}/> テキストカード
            </button>
            <button onClick={() => addBlock('image')} className="bg-white border border-gray-200 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-50 flex items-center gap-2">
              <ImageIcon size={16}/> 画像
            </button>
            <button onClick={() => addBlock('youtube')} className="bg-white border border-gray-200 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-50 flex items-center gap-2">
              <Youtube size={16}/> YouTube
            </button>
            <button onClick={() => addBlock('links')} className="bg-white border border-gray-200 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-50 flex items-center gap-2">
              <Link size={16}/> リンク集
            </button>
          </div>
        </div>

        {/* ブロック一覧 */}
        <div className="p-6 max-w-3xl mx-auto space-y-4">
          {blocks.map((block, index) => (
            <div key={block.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* ブロックヘッダー */}
              <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-b">
                <div className="flex items-center gap-3">
                  <GripVertical className="text-gray-400" size={18}/>
                  <span className="font-bold text-sm text-gray-700">
                    {block.type === 'header' && 'ヘッダー'}
                    {block.type === 'text_card' && 'テキストカード'}
                    {block.type === 'image' && '画像'}
                    {block.type === 'youtube' && 'YouTube'}
                    {block.type === 'links' && 'リンク集'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => moveBlock(block.id, 'up')}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    title="上に移動"
                  >
                    <MoveUp size={16}/>
                  </button>
                  <button 
                    onClick={() => moveBlock(block.id, 'down')}
                    disabled={index === blocks.length - 1}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    title="下に移動"
                  >
                    <MoveDown size={16}/>
                  </button>
                  <button 
                    onClick={() => setSelectedBlockId(selectedBlockId === block.id ? null : block.id)}
                    className="p-1 text-indigo-400 hover:text-indigo-600"
                    title={selectedBlockId === block.id ? '編集を閉じる' : '編集'}
                  >
                    <Edit3 size={16}/>
                  </button>
                  <button 
                    onClick={() => removeBlock(block.id)}
                    className="p-1 text-red-400 hover:text-red-600"
                    title="削除"
                  >
                    <Trash2 size={16}/>
                  </button>
                </div>
              </div>

              {/* ブロック編集フォーム */}
              {selectedBlockId === block.id && (
                <div className="p-6">
                  {renderBlockEditor(block)}
                </div>
              )}
            </div>
          ))}

          {blocks.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500 mb-4">ブロックがありません</p>
              <p className="text-sm text-gray-400">上記のボタンからブロックを追加してください</p>
            </div>
          )}
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
                {blocks.map((block, index) => (
                  <div key={block.id} className={index > 0 ? `delay-${Math.min(index, 10)}` : ''}>
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
