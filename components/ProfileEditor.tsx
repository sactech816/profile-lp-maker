"use client";

import React, { useState, useEffect } from 'react';
import { 
    Edit3, Loader2, Save, Share2, ArrowLeft, Plus, Trash2, 
    X, Link, UploadCloud, Eye, User, FileText, GripVertical,
    ChevronUp, ChevronDown, Image as ImageIcon, Youtube, MoveUp, MoveDown, Sparkles,
    ChevronRight, Palette, Image as ImageIcon2, BookOpen, Mail, Settings, QrCode, BarChart2,
    HelpCircle, DollarSign, MessageSquare, ChevronDown as ChevronDownIcon, Star
} from 'lucide-react';
import { generateSlug } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { Block, generateBlockId, migrateOldContent } from '../lib/types';
import { BlockRenderer } from './BlockRenderer';
import { getAnalytics } from '../app/actions/analytics';
import { QRCodeSVG } from 'qrcode.react';
import { templates, Template } from '../constants/templates';

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

const Textarea = ({label, val, onChange, rows = 3, ph}: {label: string; val: string; onChange: (v: string) => void; rows?: number; ph?: string}) => (
    <div className="mb-4">
        <label className="text-sm font-bold text-gray-900 block mb-2">{label}</label>
        <textarea 
            className="w-full border border-gray-300 p-3 rounded-lg text-black focus:ring-2 focus:ring-indigo-500 outline-none bg-white placeholder-gray-400 transition-shadow" 
            rows={rows} 
            value={val||''} 
            onChange={e=>onChange(e.target.value)}
            placeholder={ph}
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
  const [showAIModal, setShowAIModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiForm, setAiForm] = useState({ occupation: '', target: '', strengths: '' });
  const [theme, setTheme] = useState<{ gradient?: string; backgroundImage?: string }>({});
  const [isUploadingBackground, setIsUploadingBackground] = useState(false);
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set());
  const [hideLoginBanner, setHideLoginBanner] = useState(false);
  const [settings, setSettings] = useState<{ gtmId?: string; fbPixelId?: string; lineTagId?: string }>({});
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [analytics, setAnalytics] = useState<{ views: number; clicks: number }>({ views: 0, clicks: 0 });
  const [showTemplateModal, setShowTemplateModal] = useState(false);

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
  
  // 新規ブロック追加時は自動的に展開
  useEffect(() => {
    if (selectedBlockId) {
      setExpandedBlocks(prev => new Set([...prev, selectedBlockId]));
    }
  }, [selectedBlockId]);

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
        
        if (data) {
          // 後方互換性のため、旧形式のデータをマイグレーション
          if (data.content) {
            const migratedContent = migrateOldContent(data.content);
            setBlocks(migratedContent);
          }
          setSavedSlug(data.slug);
          
          // テーマ設定を読み込む
          if (data.theme) {
            setTheme(data.theme);
          }
          
          // 設定を読み込む
          if (data.settings) {
            setSettings(data.settings);
          }
          
          // アナリティクスを取得
          if (data.id) {
            const analyticsData = await getAnalytics(data.id);
            setAnalytics(analyticsData);
          }
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
        case 'kindle':
          return {
            id: generateBlockId(),
            type: 'kindle',
            data: { asin: '', imageUrl: '', title: '', description: '' }
          };
        case 'lead_form':
          return {
            id: generateBlockId(),
            type: 'lead_form',
            data: { title: 'メルマガ登録', buttonText: '登録する' }
          };
        case 'line_card':
          return {
            id: generateBlockId(),
            type: 'line_card',
            data: { title: 'LINE公式アカウント', description: '最新情報をお届けします', url: 'https://lin.ee/xxxxx', buttonText: '友だち追加' }
          };
        case 'faq':
          return {
            id: generateBlockId(),
            type: 'faq',
            data: { items: [] }
          };
        case 'pricing':
          return {
            id: generateBlockId(),
            type: 'pricing',
            data: { plans: [] }
          };
        case 'testimonial':
          return {
            id: generateBlockId(),
            type: 'testimonial',
            data: { items: [] }
          };
        default:
          return {
            id: generateBlockId(),
            type: 'text_card',
            data: { title: '', text: '', align: 'center' }
          };
      }
    })();
    
    setBlocks(prev => [...prev, newBlock]);
    setExpandedBlocks(prev => new Set([...prev, newBlock.id]));
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
  const updateBlock = (blockId: string, updates: any) => {
    setBlocks(prev => prev.map(block => {
      if (block.id === blockId) {
        return {
          ...block,
          data: { ...block.data, ...updates } as any
        };
      }
      return block;
    }));
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

  // 画像アップロード（ブロック用）
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
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('profile-images').upload(filePath, file, {
        upsert: true
      });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('profile-images').getPublicUrl(filePath);
      
      // ブロックタイプに応じて更新
      const block = blocks.find(b => b.id === blockId);
      if (block?.type === 'header') {
        updateBlock(blockId, { avatar: data.publicUrl });
      } else if (block?.type === 'image') {
        updateBlock(blockId, { url: data.publicUrl });
      }
    } catch (error: any) {
      alert('アップロードエラー: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  // 背景画像アップロード
  const handleBackgroundImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !supabase) return;
    if (!user) {
      alert('画像をアップロードするにはログインが必要です');
      return;
    }

    setIsUploadingBackground(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `bg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('images').upload(filePath, file, {
        upsert: true
      });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('images').getPublicUrl(filePath);
      setTheme(prev => ({ ...prev, backgroundImage: data.publicUrl }));
    } catch (error: any) {
      alert('背景画像のアップロードエラー: ' + error.message);
    } finally {
      setIsUploadingBackground(false);
    }
  };

  // ブロックの展開/折りたたみ
  const toggleBlock = (blockId: string) => {
    setExpandedBlocks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(blockId)) {
        newSet.delete(blockId);
      } else {
        newSet.add(blockId);
      }
      return newSet;
    });
  };

  // AI生成機能
  const handleAIGenerate = async () => {
    if (!aiForm.occupation || !aiForm.target || !aiForm.strengths) {
      alert('すべての項目を入力してください');
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aiForm),
      });

      if (!res.ok) throw new Error('AI生成に失敗しました');

      const data = await res.json();

      // ヘッダーブロックを更新または作成
      let headerBlock = blocks.find(b => b.type === 'header');
      if (!headerBlock) {
        headerBlock = {
          id: generateBlockId(),
          type: 'header',
          data: { avatar: '', name: '', title: '' }
        };
        setBlocks(prev => [headerBlock!, ...prev]);
      }
      updateBlock(headerBlock.id, {
        title: data.catchphrase,
        name: user?.email?.split('@')[0] || 'あなた'
      });

      // テキストカードブロックを追加または更新
      let textCardBlock = blocks.find(b => b.type === 'text_card');
      if (!textCardBlock) {
        textCardBlock = {
          id: generateBlockId(),
          type: 'text_card',
          data: { title: '自己紹介', text: '', align: 'center' }
        };
        setBlocks(prev => [...prev, textCardBlock!]);
      }
      updateBlock(textCardBlock.id, {
        text: data.introduction
      });

      // リンクブロックを追加または更新
      if (data.recommendedLinks && data.recommendedLinks.length > 0) {
        let linksBlock = blocks.find(b => b.type === 'links');
        if (!linksBlock) {
          linksBlock = {
            id: generateBlockId(),
            type: 'links',
            data: { links: [] }
          };
          setBlocks(prev => [...prev, linksBlock!]);
        }
        updateBlock(linksBlock.id, {
          links: data.recommendedLinks
        });
      }

      setShowAIModal(false);
      alert('AI生成が完了しました！');
    } catch (error: any) {
      alert('AI生成エラー: ' + error.message);
    } finally {
      setIsGenerating(false);
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
          theme: theme,
          settings: settings,
          user_id: user?.id || null,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'slug'
        })
        .select()
        .single();

      if (error) throw error;
      
      setSavedSlug(slug);
      
      // アナリティクスを再取得
      if (data?.id) {
        const analyticsData = await getAnalytics(data.id);
        setAnalytics(analyticsData);
      }
      
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
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">画像</label>
              <div className="flex gap-2">
                <Input 
                  label="" 
                  val={block.data.url} 
                  onChange={v => updateBlock(block.id, { url: v })} 
                  ph="画像URL (https://...)" 
                  type="url"
                />
                <label className="bg-indigo-50 text-indigo-700 px-4 py-3 rounded-lg font-bold hover:bg-indigo-100 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap self-end border-2 border-dashed border-indigo-300">
                  {isUploading ? (
                    <>
                      <Loader2 className="animate-spin" size={16}/> アップロード中...
                    </>
                  ) : (
                    <>
                      <UploadCloud size={16}/> 画像を選択
                    </>
                  )}
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={(e) => handleImageUpload(block.id, e)} 
                    disabled={isUploading}
                  />
                </label>
              </div>
            </div>
            <Input label="キャプション（オプション）" val={block.data.caption || ''} onChange={v => updateBlock(block.id, { caption: v })} ph="画像の説明" />
            {block.data.url && (
              <div className="mt-2">
                <img 
                  src={block.data.url} 
                  alt="Preview" 
                  className="w-full rounded-xl object-cover border border-gray-200"
                />
              </div>
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
                  <div>
                    <label className="text-sm font-bold text-gray-900 block mb-2">スタイル</label>
                    <div className="grid grid-cols-5 gap-2">
                      {[
                        { id: '', name: 'デフォルト', color: 'bg-gray-100 text-gray-700' },
                        { id: 'orange', name: 'オレンジ', color: 'bg-orange-500 text-white' },
                        { id: 'blue', name: 'ブルー', color: 'bg-blue-500 text-white' },
                        { id: 'green', name: 'グリーン', color: 'bg-green-500 text-white' },
                        { id: 'purple', name: 'パープル', color: 'bg-purple-500 text-white' },
                      ].map(styleOption => (
                        <button
                          key={styleOption.id}
                          onClick={() => updateLinkInBlock(block.id, index, 'style', styleOption.id)}
                          className={`px-3 py-2 rounded-lg font-bold text-xs transition-all ${
                            link.style === styleOption.id
                              ? `${styleOption.color} ring-2 ring-indigo-300`
                              : `${styleOption.color} opacity-70 hover:opacity-100`
                          }`}
                        >
                          {styleOption.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              {block.data.links.length === 0 && (
                <p className="text-center py-4 text-gray-400 text-sm">リンクがありません</p>
              )}
            </div>
          </div>
        );

      case 'kindle':
        const kindleImagePresets = [
          'https://images-na.ssl-images-amazon.com/images/I/51aHbX9Q9zL._SX331_BO1,204,203,200_.jpg',
          'https://images-na.ssl-images-amazon.com/images/I/81nzxODnaJL._AC_UL600_SR600,600_.jpg',
          'https://images-na.ssl-images-amazon.com/images/I/71KilybDOoL._AC_UL600_SR600,600_.jpg',
          'https://images-na.ssl-images-amazon.com/images/I/81YOuOGFCJL._AC_UL600_SR600,600_.jpg',
          'https://images-na.ssl-images-amazon.com/images/I/71jG+e7roXL._AC_UL600_SR600,600_.jpg',
        ];
        return (
          <div className="space-y-4">
            <Input label="ASINまたはAmazon URL" val={block.data.asin} onChange={v => updateBlock(block.id, { asin: v })} ph="例: B08XXXXXXX または https://amazon.co.jp/dp/B08XXXXXXX" />
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">画像URL</label>
              <div className="flex gap-2 mb-2">
                <Input 
                  label="" 
                  val={block.data.imageUrl} 
                  onChange={v => updateBlock(block.id, { imageUrl: v })} 
                  ph="https://..." 
                  type="url"
                />
                <label className="bg-indigo-50 text-indigo-700 px-4 py-3 rounded-lg font-bold hover:bg-indigo-100 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap self-end border-2 border-dashed border-indigo-300">
                  {isUploading ? (
                    <>
                      <Loader2 className="animate-spin" size={16}/> アップロード中...
                    </>
                  ) : (
                    <>
                      <UploadCloud size={16}/> 画像を選択
                    </>
                  )}
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file || !supabase) return;
                      if (!user) {
                        alert('画像をアップロードするにはログインが必要です');
                        return;
                      }
                      setIsUploading(true);
                      const fileExt = file.name.split('.').pop();
                      const fileName = `kindle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
                      const filePath = `${user.id}/${fileName}`;
                      supabase.storage.from('profile-images').upload(filePath, file, { upsert: true })
                        .then(({ error: uploadError }) => {
                          if (uploadError) throw uploadError;
                          const { data } = supabase.storage.from('profile-images').getPublicUrl(filePath);
                          updateBlock(block.id, { imageUrl: data.publicUrl });
                        })
                        .catch((error: any) => alert('アップロードエラー: ' + error.message))
                        .finally(() => setIsUploading(false));
                    }}
                    disabled={isUploading}
                  />
                </label>
              </div>
              <div className="mb-2">
                <label className="text-xs font-bold text-gray-700 block mb-1">プリセット画像から選択</label>
                <div className="flex flex-wrap gap-2">
                  {kindleImagePresets.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => updateBlock(block.id, { imageUrl: preset })}
                      className="border-2 border-gray-200 rounded p-1 hover:border-indigo-500 transition-all"
                    >
                      <img src={preset} alt={`Preset ${idx + 1}`} className="w-16 h-20 object-cover rounded" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <Input label="タイトル" val={block.data.title} onChange={v => updateBlock(block.id, { title: v })} ph="書籍のタイトル" />
            <Textarea label="説明" val={block.data.description} onChange={v => updateBlock(block.id, { description: v })} rows={4} ph="書籍の説明文" />
            {block.data.imageUrl && (
              <div className="mt-2">
                <img src={block.data.imageUrl} alt="Preview" className="w-32 h-auto rounded-lg border border-gray-200" />
              </div>
            )}
          </div>
        );

      case 'lead_form':
        return (
          <div className="space-y-4">
            <Input label="タイトル" val={block.data.title} onChange={v => updateBlock(block.id, { title: v })} ph="例: メルマガ登録" />
            <Input label="ボタンテキスト" val={block.data.buttonText} onChange={v => updateBlock(block.id, { buttonText: v })} ph="例: 登録する" />
          </div>
        );

      case 'line_card':
        return (
          <div className="space-y-4">
            <Input label="タイトル" val={block.data.title} onChange={v => updateBlock(block.id, { title: v })} ph="例: LINE公式アカウント" />
            <Textarea label="説明" val={block.data.description} onChange={v => updateBlock(block.id, { description: v })} rows={3} ph="例: 最新情報をお届けします" />
            <Input label="LINE URL" val={block.data.url} onChange={v => updateBlock(block.id, { url: v })} ph="例: https://lin.ee/xxxxx" type="url" />
            <Input label="ボタンテキスト" val={block.data.buttonText} onChange={v => updateBlock(block.id, { buttonText: v })} ph="例: 友だち追加" />
          </div>
        );

      case 'faq':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-gray-900">FAQ項目 ({block.data.items.length}件)</span>
              <button 
                onClick={() => {
                  setBlocks(prev => prev.map(b => 
                    b.id === block.id && b.type === 'faq'
                      ? { ...b, data: { items: [...b.data.items, { id: generateBlockId(), question: '', answer: '' }] } }
                      : b
                  ));
                }}
                className="text-sm bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg font-bold hover:bg-indigo-100 flex items-center gap-1"
              >
                <Plus size={14}/> 追加
              </button>
            </div>
            <div className="space-y-3">
              {block.data.items.map((item, index) => (
                <div key={item.id} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <GripVertical className="text-gray-400" size={14}/>
                    <span className="text-xs font-bold text-gray-500">FAQ {index + 1}</span>
                    <button 
                      onClick={() => {
                        setBlocks(prev => prev.map(b => 
                          b.id === block.id && b.type === 'faq'
                            ? { ...b, data: { items: b.data.items.filter((_, i) => i !== index) } }
                            : b
                        ));
                      }}
                      className="ml-auto p-1 text-red-400 hover:text-red-600"
                      title="削除"
                    >
                      <Trash2 size={14}/>
                    </button>
                  </div>
                  <Input label="質問" val={item.question} onChange={v => {
                    setBlocks(prev => prev.map(b => 
                      b.id === block.id && b.type === 'faq'
                        ? { ...b, data: { items: b.data.items.map((it, i) => i === index ? { ...it, question: v } : it) } }
                        : b
                    ));
                  }} ph="例: よくある質問は？" />
                  <Textarea label="回答" val={item.answer} onChange={v => {
                    setBlocks(prev => prev.map(b => 
                      b.id === block.id && b.type === 'faq'
                        ? { ...b, data: { items: b.data.items.map((it, i) => i === index ? { ...it, answer: v } : it) } }
                        : b
                    ));
                  }} rows={3} ph="回答を入力してください" />
                </div>
              ))}
              {block.data.items.length === 0 && (
                <p className="text-center py-4 text-gray-400 text-sm">FAQ項目がありません</p>
              )}
            </div>
          </div>
        );

      case 'pricing':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-gray-900">料金プラン ({block.data.plans.length}件)</span>
              <button 
                onClick={() => {
                  setBlocks(prev => prev.map(b => 
                    b.id === block.id && b.type === 'pricing'
                      ? { ...b, data: { plans: [...b.data.plans, { id: generateBlockId(), title: '', price: '', features: [], isRecommended: false }] } }
                      : b
                  ));
                }}
                className="text-sm bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg font-bold hover:bg-indigo-100 flex items-center gap-1"
              >
                <Plus size={14}/> 追加
              </button>
            </div>
            <div className="space-y-3">
              {block.data.plans.map((plan, index) => (
                <div key={plan.id} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <GripVertical className="text-gray-400" size={14}/>
                    <span className="text-xs font-bold text-gray-500">プラン {index + 1}</span>
                    <button 
                      onClick={() => {
                        setBlocks(prev => prev.map(b => 
                          b.id === block.id && b.type === 'pricing'
                            ? { ...b, data: { plans: b.data.plans.filter((_, i) => i !== index) } }
                            : b
                        ));
                      }}
                      className="ml-auto p-1 text-red-400 hover:text-red-600"
                      title="削除"
                    >
                      <Trash2 size={14}/>
                    </button>
                  </div>
                  <Input label="プラン名" val={plan.title} onChange={v => {
                    setBlocks(prev => prev.map(b => 
                      b.id === block.id && b.type === 'pricing'
                        ? { ...b, data: { plans: b.data.plans.map((p, i) => i === index ? { ...p, title: v } : p) } }
                        : b
                    ));
                  }} ph="例: ベーシックプラン" />
                  <Input label="価格" val={plan.price} onChange={v => {
                    setBlocks(prev => prev.map(b => 
                      b.id === block.id && b.type === 'pricing'
                        ? { ...b, data: { plans: b.data.plans.map((p, i) => i === index ? { ...p, price: v } : p) } }
                        : b
                    ));
                  }} ph="例: ¥10,000/月" />
                  <Textarea label="特徴（改行区切り）" val={plan.features.join('\n')} onChange={v => {
                    setBlocks(prev => prev.map(b => 
                      b.id === block.id && b.type === 'pricing'
                        ? { ...b, data: { plans: b.data.plans.map((p, i) => i === index ? { ...p, features: v.split('\n').filter(f => f.trim()) } : p) } }
                        : b
                    ));
                  }} rows={4} ph="特徴1&#10;特徴2&#10;特徴3" />
                  <div className="flex items-center gap-2 mt-2">
                    <input 
                      type="checkbox" 
                      checked={plan.isRecommended} 
                      onChange={e => {
                        setBlocks(prev => prev.map(b => 
                          b.id === block.id && b.type === 'pricing'
                            ? { ...b, data: { plans: b.data.plans.map((p, i) => i === index ? { ...p, isRecommended: e.target.checked } : p) } }
                            : b
                        ));
                      }}
                      className="w-4 h-4"
                    />
                    <label className="text-sm font-bold text-gray-900">おすすめプランにする</label>
                  </div>
                </div>
              ))}
              {block.data.plans.length === 0 && (
                <p className="text-center py-4 text-gray-400 text-sm">料金プランがありません</p>
              )}
            </div>
          </div>
        );

      case 'testimonial':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-gray-900">お客様の声 ({block.data.items.length}件)</span>
              <button 
                onClick={() => {
                  setBlocks(prev => prev.map(b => 
                    b.id === block.id && b.type === 'testimonial'
                      ? { ...b, data: { items: [...b.data.items, { id: generateBlockId(), name: '', role: '', comment: '', imageUrl: '' }] } }
                      : b
                  ));
                }}
                className="text-sm bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg font-bold hover:bg-indigo-100 flex items-center gap-1"
              >
                <Plus size={14}/> 追加
              </button>
            </div>
            <div className="space-y-3">
              {block.data.items.map((item, index) => (
                <div key={item.id} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <GripVertical className="text-gray-400" size={14}/>
                    <span className="text-xs font-bold text-gray-500">お客様の声 {index + 1}</span>
                    <button 
                      onClick={() => {
                        setBlocks(prev => prev.map(b => 
                          b.id === block.id && b.type === 'testimonial'
                            ? { ...b, data: { items: b.data.items.filter((_, i) => i !== index) } }
                            : b
                        ));
                      }}
                      className="ml-auto p-1 text-red-400 hover:text-red-600"
                      title="削除"
                    >
                      <Trash2 size={14}/>
                    </button>
                  </div>
                  <Input label="お名前" val={item.name} onChange={v => {
                    setBlocks(prev => prev.map(b => 
                      b.id === block.id && b.type === 'testimonial'
                        ? { ...b, data: { items: b.data.items.map((it, i) => i === index ? { ...it, name: v } : it) } }
                        : b
                    ));
                  }} ph="例: 山田 太郎" />
                  <Input label="肩書き" val={item.role} onChange={v => {
                    setBlocks(prev => prev.map(b => 
                      b.id === block.id && b.type === 'testimonial'
                        ? { ...b, data: { items: b.data.items.map((it, i) => i === index ? { ...it, role: v } : it) } }
                        : b
                    ));
                  }} ph="例: IT企業社長" />
                  <Textarea label="コメント" val={item.comment} onChange={v => {
                    setBlocks(prev => prev.map(b => 
                      b.id === block.id && b.type === 'testimonial'
                        ? { ...b, data: { items: b.data.items.map((it, i) => i === index ? { ...it, comment: v } : it) } }
                        : b
                    ));
                  }} rows={4} ph="お客様の声を入力してください" />
                  <div className="mt-2">
                    <label className="text-sm font-bold text-gray-900 block mb-2">画像URL（オプション）</label>
                    <div className="flex gap-2 mb-2">
                      <Input 
                        label="" 
                        val={item.imageUrl || ''} 
                        onChange={v => {
                          setBlocks(prev => prev.map(b => 
                            b.id === block.id && b.type === 'testimonial'
                              ? { ...b, data: { items: b.data.items.map((it, i) => i === index ? { ...it, imageUrl: v } : it) } }
                              : b
                          ));
                        }} 
                        ph="画像URL (https://...)" 
                        type="url"
                      />
                      <label className="bg-indigo-50 text-indigo-700 px-4 py-3 rounded-lg font-bold hover:bg-indigo-100 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap self-end border-2 border-dashed border-indigo-300">
                        {isUploading ? (
                          <>
                            <Loader2 className="animate-spin" size={16}/> アップロード中...
                          </>
                        ) : (
                          <>
                            <UploadCloud size={16}/> 画像を選択
                          </>
                        )}
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file || !supabase) return;
                            if (!user) {
                              alert('画像をアップロードするにはログインが必要です');
                              return;
                            }
                            setIsUploading(true);
                            const fileExt = file.name.split('.').pop();
                            const fileName = `testimonial_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
                            const filePath = `${user.id}/${fileName}`;
                            supabase.storage.from('profile-images').upload(filePath, file, { upsert: true })
                              .then(({ error: uploadError }) => {
                                if (uploadError) throw uploadError;
                                const { data } = supabase.storage.from('profile-images').getPublicUrl(filePath);
                                setBlocks(prev => prev.map(b => 
                                  b.id === block.id && b.type === 'testimonial'
                                    ? { ...b, data: { items: b.data.items.map((it, i) => i === index ? { ...it, imageUrl: data.publicUrl } : it) } }
                                    : b
                                ));
                              })
                              .catch((error: any) => alert('アップロードエラー: ' + error.message))
                              .finally(() => setIsUploading(false));
                          }}
                          disabled={isUploading}
                        />
                      </label>
                    </div>
                    <div className="mb-2">
                      <label className="text-xs font-bold text-gray-700 block mb-1">プリセット画像から選択</label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces',
                          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
                          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces',
                          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces',
                          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces',
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
                        ].map((preset, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setBlocks(prev => prev.map(b => 
                                b.id === block.id && b.type === 'testimonial'
                                  ? { ...b, data: { items: b.data.items.map((it, i) => i === index ? { ...it, imageUrl: preset } : it) } }
                                  : b
                              ));
                            }}
                            className="border-2 border-gray-200 rounded-full p-1 hover:border-indigo-500 transition-all"
                          >
                            <img src={preset} alt={`Preset ${idx + 1}`} className="w-12 h-12 object-cover rounded-full" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {block.data.items.length === 0 && (
                <p className="text-center py-4 text-gray-400 text-sm">お客様の声がありません</p>
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
        {/* 未ログインユーザー向けバナー */}
        {!user && !hideLoginBanner && (
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-4 border-b sticky top-0 z-50 shadow-md">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-start gap-3 mb-3">
                <Sparkles className="text-yellow-300 flex-shrink-0 mt-0.5" size={20}/>
                <div className="flex-1">
                  <p className="font-bold text-sm mb-2">ログインすると便利な機能が使えます！</p>
                  <ul className="space-y-1 text-xs text-indigo-100">
                    <li className="flex items-center gap-1">
                      <span className="text-green-300">✓</span>
                      <span>作成した診断の編集・削除が可能</span>
                    </li>
                    <li className="flex items-center gap-1">
                      <span className="text-green-300">✓</span>
                      <span>マイページでアクセス解析を確認</span>
                    </li>
                    <li className="flex items-center gap-1">
                      <span className="text-green-300">✓</span>
                      <span>HTMLダウンロード・埋め込みコードなどの追加オプションが利用可能</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowAuth?.(true)}
                  className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-50 transition-all flex items-center gap-2"
                >
                  <User size={16}/>
                  ログイン / 新規登録
                </button>
                <button 
                  onClick={() => setHideLoginBanner(true)}
                  className="text-white/80 hover:text-white px-4 py-2 text-sm font-bold"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ヘッダー */}
        <div className="bg-white border-b px-6 py-4 flex justify-between sticky top-0 z-50 shadow-sm" style={{ top: !user && !hideLoginBanner ? '120px' : '0' }}>
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-700">
              <ArrowLeft/>
            </button>
            <h2 className="font-bold text-lg text-gray-900">
              {initialSlug ? 'プロフィール編集' : '新規プロフィール作成'}
            </h2>
            {savedSlug && analytics.views > 0 && (
              <div className="flex items-center gap-4 ml-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Eye size={14}/>
                  <span className="font-bold">{analytics.views}</span>
                </div>
                <div className="flex items-center gap-1">
                  <BarChart2 size={14}/>
                  <span className="font-bold">{analytics.clicks}</span>
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {savedSlug && (
              <>
                <button 
                  onClick={() => setShowQRModal(true)} 
                  className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-100"
                >
                  <QrCode size={18}/> QRコード
                </button>
                <button 
                  onClick={() => setShowSettingsModal(true)} 
                  className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-100"
                >
                  <Settings size={18}/> 設定
                </button>
              </>
            )}
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

        {/* テーマ設定セクション */}
        <div className="p-6 border-b bg-white">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="text-indigo-600" size={20}/>
            <h3 className="font-bold text-lg text-gray-900">テーマ設定</h3>
          </div>
          
          {/* 背景パターン */}
          <div className="mb-4">
            <label className="text-sm font-bold text-gray-900 block mb-2">背景パターン</label>
            <div className="grid grid-cols-5 gap-2">
              {[
                { id: 'sunset', name: 'Sunset', gradient: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)' },
                { id: 'ocean', name: 'Ocean', gradient: 'linear-gradient(-45deg, #1e3c72, #2a5298, #7e8ba3, #a8c0d0)' },
                { id: 'berry', name: 'Berry', gradient: 'linear-gradient(-45deg, #f093fb, #f5576c, #c471ed, #f64f59)' },
                { id: 'forest', name: 'Forest', gradient: 'linear-gradient(-45deg, #134e5e, #71b280, #134e5e, #71b280)' },
                { id: 'purple', name: 'Purple', gradient: 'linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #4facfe)' }
              ].map(preset => (
                <button
                  key={preset.id}
                  onClick={() => setTheme(prev => ({ ...prev, gradient: preset.gradient, backgroundImage: undefined }))}
                  className={`p-3 rounded-lg border-2 transition-all overflow-hidden ${
                    theme.gradient === preset.gradient && !theme.backgroundImage
                      ? 'border-indigo-500 ring-2 ring-indigo-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  title={preset.name}
                >
                  <div 
                    className="w-full h-12 rounded relative"
                    style={{ 
                      background: preset.gradient,
                      backgroundSize: '400% 400%',
                      animation: 'gradient 15s ease infinite'
                    }}
                  />
                  <p className="text-xs font-bold text-gray-600 mt-1">{preset.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 背景画像 */}
          <div>
            <label className="text-sm font-bold text-gray-900 block mb-2">背景画像</label>
            <div className="flex gap-2">
              <label className="flex-1 bg-indigo-50 text-indigo-700 px-4 py-3 rounded-lg font-bold hover:bg-indigo-100 flex items-center justify-center gap-2 cursor-pointer border-2 border-dashed border-indigo-300">
                {isUploadingBackground ? (
                  <>
                    <Loader2 className="animate-spin" size={16}/> アップロード中...
                  </>
                ) : (
                  <>
                    <ImageIcon2 size={16}/> 画像を選択
                  </>
                )}
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleBackgroundImageUpload} 
                  disabled={isUploadingBackground}
                />
              </label>
              {theme.backgroundImage && (
                <button
                  onClick={() => setTheme(prev => ({ ...prev, backgroundImage: undefined }))}
                  className="px-4 py-3 bg-red-50 text-red-700 rounded-lg font-bold hover:bg-red-100"
                >
                  削除
                </button>
              )}
            </div>
            {theme.backgroundImage && (
              <div className="mt-2 relative">
                <img 
                  src={theme.backgroundImage} 
                  alt="Background preview" 
                  className="w-full h-32 object-cover rounded-lg border border-gray-200"
                />
              </div>
            )}
          </div>
        </div>

        {/* ブロック追加ボタン */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex flex-wrap gap-2 mb-3">
            <button 
              onClick={() => setShowTemplateModal(true)} 
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 px-4 py-2 rounded-lg font-bold text-sm hover:from-blue-600 hover:to-cyan-600 flex items-center gap-2 shadow-md"
            >
              <FileText size={16}/> テンプレートから始める
            </button>
            <button 
              onClick={() => setShowAIModal(true)} 
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 px-4 py-2 rounded-lg font-bold text-sm hover:from-purple-600 hover:to-pink-600 flex items-center gap-2 shadow-md"
            >
              <Sparkles size={16}/> AIで自動生成
            </button>
          </div>
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
            <button onClick={() => addBlock('kindle')} className="bg-white border border-gray-200 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-50 flex items-center gap-2">
              <BookOpen size={16}/> Kindle書籍
            </button>
            <button onClick={() => addBlock('lead_form')} className="bg-white border border-gray-200 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-50 flex items-center gap-2">
              <Mail size={16}/> リード獲得
            </button>
            <button onClick={() => addBlock('faq')} className="bg-white border border-gray-200 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-50 flex items-center gap-2">
              <HelpCircle size={16}/> FAQ
            </button>
            <button onClick={() => addBlock('pricing')} className="bg-white border border-gray-200 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-50 flex items-center gap-2">
              <DollarSign size={16}/> 料金表
            </button>
            <button onClick={() => addBlock('testimonial')} className="bg-white border border-gray-200 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-50 flex items-center gap-2">
              <MessageSquare size={16}/> お客様の声
            </button>
          </div>
        </div>

        {/* ブロック一覧 */}
        <div className="p-6 max-w-3xl mx-auto space-y-4">
          {blocks.map((block, index) => {
            const isExpanded = expandedBlocks.has(block.id);
            return (
              <div key={block.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* ブロックヘッダー（アコーディオン） */}
                <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div title="ドラッグして移動">
                      <GripVertical className="text-gray-400 cursor-move" size={18}/>
                    </div>
                    <button
                      onClick={() => toggleBlock(block.id)}
                      className="flex items-center gap-2 flex-1 text-left hover:bg-gray-100 -ml-2 px-2 py-1 rounded transition-colors"
                    >
                      <ChevronRight 
                        className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
                        size={16}
                      />
                      <span className="font-bold text-sm text-gray-700">
                        {block.type === 'header' && 'ヘッダー'}
                        {block.type === 'text_card' && 'テキストカード'}
                        {block.type === 'image' && '画像'}
                        {block.type === 'youtube' && 'YouTube'}
                        {block.type === 'links' && 'リンク集'}
                        {block.type === 'kindle' && 'Kindle書籍'}
                        {block.type === 'lead_form' && 'リード獲得フォーム'}
                        {block.type === 'line_card' && 'LINE登録'}
                        {block.type === 'faq' && 'FAQ'}
                        {block.type === 'pricing' && '料金表'}
                        {block.type === 'testimonial' && 'お客様の声'}
                      </span>
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'up'); }}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      title="上に移動"
                    >
                      <MoveUp size={16}/>
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'down'); }}
                      disabled={index === blocks.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      title="下に移動"
                    >
                      <MoveDown size={16}/>
                    </button>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        toggleBlock(block.id);
                      }}
                      className="p-1 text-indigo-400 hover:text-indigo-600"
                      title={isExpanded ? '折りたたむ' : '展開'}
                    >
                      <Edit3 size={16}/>
                    </button>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        removeBlock(block.id);
                      }}
                      className="p-1 text-red-400 hover:text-red-600"
                      title="削除"
                    >
                      <Trash2 size={16}/>
                    </button>
                  </div>
                </div>

                {/* ブロック編集フォーム（アコーディオン） */}
                {isExpanded && (
                  <div className="p-6 border-t border-gray-200">
                    {renderBlockEditor(block)}
                  </div>
                )}
              </div>
            );
          })}

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
          <div 
            className="profile-page-wrapper min-h-screen"
            style={{
              background: theme.backgroundImage 
                ? `url(${theme.backgroundImage}) center/cover no-repeat`
                : theme.gradient || 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)',
              backgroundSize: theme.backgroundImage ? 'cover' : '400% 400%',
              animation: theme.backgroundImage ? 'none' : 'gradient 15s ease infinite'
            }}
          >
            <div className="container mx-auto max-w-lg p-4 md:p-8">
              <div className="w-full space-y-6 md:space-y-8">
                {blocks.map((block, index) => (
                  <div key={block.id} className={index > 0 ? `delay-${Math.min(index, 10)}` : ''}>
                    <BlockRenderer block={block} profileId={savedSlug || undefined} />
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

      {/* AI生成モーダル */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                <Sparkles className="text-purple-600" size={20}/> AIで自動生成
              </h3>
              <button 
                onClick={() => setShowAIModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X size={20}/>
              </button>
            </div>
            
            <div className="space-y-4">
              <Input 
                label="職業" 
                val={aiForm.occupation} 
                onChange={v => setAiForm(prev => ({ ...prev, occupation: v }))} 
                ph="例: フリーランスデザイナー" 
              />
              <Input 
                label="ターゲット" 
                val={aiForm.target} 
                onChange={v => setAiForm(prev => ({ ...prev, target: v }))} 
                ph="例: 起業を考えている20代のビジネスパーソン" 
              />
              <Textarea 
                label="強み・特徴" 
                val={aiForm.strengths} 
                onChange={v => setAiForm(prev => ({ ...prev, strengths: v }))} 
                rows={4}
                ph="例: 10年のデザイン経験、ブランディングが得意"
              />
              
              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => setShowAIModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg font-bold hover:bg-gray-200"
                >
                  キャンセル
                </button>
                <button 
                  onClick={handleAIGenerate}
                  disabled={isGenerating}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-3 rounded-lg font-bold hover:from-purple-600 hover:to-pink-600 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="animate-spin" size={18}/> 生成中...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18}/> 生成する
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 設定モーダル */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                <Settings className="text-indigo-600" size={20}/> 計測タグ設定
              </h3>
              <button 
                onClick={() => setShowSettingsModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X size={20}/>
              </button>
            </div>
            
            <div className="space-y-4">
              <Input 
                label="Google Tag Manager ID" 
                val={settings.gtmId || ''} 
                onChange={v => setSettings(prev => ({ ...prev, gtmId: v }))} 
                ph="例: GTM-XXXXXXX" 
              />
              <Input 
                label="Facebook Pixel ID" 
                val={settings.fbPixelId || ''} 
                onChange={v => setSettings(prev => ({ ...prev, fbPixelId: v }))} 
                ph="例: 123456789012345" 
              />
              <Input 
                label="LINE Tag ID" 
                val={settings.lineTagId || ''} 
                onChange={v => setSettings(prev => ({ ...prev, lineTagId: v }))} 
                ph="例: @xxxxx" 
              />
              
              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => setShowSettingsModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg font-bold hover:bg-gray-200"
                >
                  キャンセル
                </button>
                <button 
                  onClick={async () => {
                    await handleSave();
                    setShowSettingsModal(false);
                  }}
                  className="flex-1 bg-indigo-600 text-white px-4 py-3 rounded-lg font-bold hover:bg-indigo-700"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QRコードモーダル */}
      {showQRModal && savedSlug && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                <QrCode className="text-indigo-600" size={20}/> QRコード
              </h3>
              <button 
                onClick={() => setShowQRModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X size={20}/>
              </button>
            </div>
            
            <div className="space-y-4 text-center">
              <div className="bg-white p-4 rounded-lg inline-block">
                <QRCodeSVG 
                  value={`https://lp.makers.tokyo/p/${savedSlug}`}
                  size={256}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <p className="text-sm text-gray-600 break-all">
                https://lp.makers.tokyo/p/{savedSlug}
              </p>
              <button
                onClick={() => {
                  const canvas = document.querySelector('canvas');
                  if (canvas) {
                    const url = canvas.toDataURL('image/png');
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `qr-${savedSlug}.png`;
                    a.click();
                  }
                }}
                className="w-full bg-indigo-600 text-white px-4 py-3 rounded-lg font-bold hover:bg-indigo-700"
              >
                QRコードをダウンロード
              </button>
            </div>
          </div>
        </div>
      )}

      {/* テンプレート選択モーダル */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full mx-4 my-8 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-2xl text-gray-900 flex items-center gap-2">
                <FileText className="text-indigo-600" size={24}/> テンプレートから始める
              </h3>
              <button 
                onClick={() => setShowTemplateModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X size={24}/>
              </button>
            </div>
            
            <p className="text-gray-600 mb-6">プロフィールの用途に合わせて、最適なテンプレートを選択してください。</p>
            
            <div className="grid md:grid-cols-3 gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-indigo-500 transition-all cursor-pointer group"
                  onClick={() => {
                    if (blocks.length > 0 && !confirm('現在の入力内容は消えますがよろしいですか？')) {
                      return;
                    }
                    
                    // テンプレートのブロックを読み込む（IDを再生成して新しいインスタンスにする）
                    const newBlocks = template.blocks.map(block => ({
                      ...block,
                      id: generateBlockId()
                    }));
                    
                    // ネストされたIDも再生成
                    const processedBlocks = newBlocks.map(block => {
                      if (block.type === 'faq') {
                        return {
                          ...block,
                          data: {
                            items: block.data.items.map(item => ({
                              ...item,
                              id: generateBlockId()
                            }))
                          }
                        };
                      } else if (block.type === 'pricing') {
                        return {
                          ...block,
                          data: {
                            plans: block.data.plans.map(plan => ({
                              ...plan,
                              id: generateBlockId()
                            }))
                          }
                        };
                      } else if (block.type === 'testimonial') {
                        return {
                          ...block,
                          data: {
                            items: block.data.items.map(item => ({
                              ...item,
                              id: generateBlockId()
                            }))
                          }
                        };
                      }
                      return block;
                    });
                    
                    setBlocks(processedBlocks);
                    setTheme(template.theme);
                    setExpandedBlocks(new Set(processedBlocks.map(b => b.id)));
                    setShowTemplateModal(false);
                    alert(`「${template.name}」テンプレートを読み込みました！`);
                  }}
                >
                  <div 
                    className="h-32 w-full"
                    style={{
                      background: template.theme.gradient,
                      backgroundSize: '400% 400%',
                      animation: 'gradient 15s ease infinite'
                    }}
                  />
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded font-bold">
                        {template.category}
                      </span>
                    </div>
                    <h4 className="font-bold text-lg text-gray-900 mb-2">{template.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                    <div className="text-xs text-gray-500">
                      {template.blocks.length}個のブロック
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileEditor;
