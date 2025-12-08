"use client";

import React, { useState, useEffect } from 'react';
import { 
    Edit3, Loader2, Save, Share2, ArrowLeft, Plus, Trash2, 
    X, Link, UploadCloud, Eye, User, FileText, GripVertical,
    ChevronUp, ChevronDown, Image as ImageIcon, Youtube, MoveUp, MoveDown, Sparkles,
    ChevronRight, Palette, Image as ImageIcon2, BookOpen, Mail, Settings, QrCode, BarChart2,
    HelpCircle, DollarSign, MessageSquare, ChevronDown as ChevronDownIcon, Star, Twitter
} from 'lucide-react';
import { generateSlug } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { Block, generateBlockId, migrateOldContent } from '../lib/types';
import { BlockRenderer } from './BlockRenderer';
import { getAnalytics } from '../app/actions/analytics';
import { saveProfile } from '../app/actions/profiles';
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
  const [showPreview, setShowPreview] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.innerWidth >= 1024;
  });
  const [isMobile, setIsMobile] = useState(false);
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
  const [analytics, setAnalytics] = useState<{ 
    views: number; 
    clicks: number; 
    avgScrollDepth: number; 
    avgTimeSpent: number; 
    readRate: number; 
    clickRate: number;
  }>({ 
    views: 0, 
    clicks: 0, 
    avgScrollDepth: 0, 
    avgTimeSpent: 0, 
    readRate: 0, 
    clickRate: 0 
  });
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [featuredOnTop, setFeaturedOnTop] = useState(true);
  const uploadOwnerId = user?.id || 'public';

  // 共通アップロード関数（RLS回避のためサーバールート経由）
  const uploadImageViaApi = async (file: File, prefix: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', uploadOwnerId);
    formData.append('fileName', fileName);

    const res = await fetch('/api/upload-image', { method: 'POST', body: formData });
    if (!res.ok) {
      let msg = 'アップロードに失敗しました';
      try {
        const data = await res.json();
        msg = data.error || msg;
      } catch (_) {}
      throw new Error(msg);
    }
    const data = await res.json();
    return data.publicUrl as string;
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // デフォルトのプロフィールコンテンツ
  const getDefaultContent = (): Block[] => [
    {
      id: generateBlockId(),
      type: 'header',
      data: {
        avatar: '',
        name: 'あなたの名前',
        title: 'キャッチコピーを入力してください',
        category: 'other'
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
          // マイグレーション関数が null/undefined/非配列を処理するため、直接呼び出し
          const migratedContent = migrateOldContent(data.content);
          if (Array.isArray(migratedContent) && migratedContent.length > 0) {
            setBlocks(migratedContent);
          } else {
            // 空の場合はデフォルトコンテンツを使用
            setBlocks(getDefaultContent());
          }
        } else {
          // content が存在しない場合はデフォルトコンテンツを使用
          setBlocks(getDefaultContent());
        }
          setSavedSlug(data.slug || initialSlug);
          
          // 設定を読み込む（themeもsettingsに含まれる）
          if (data.settings && typeof data.settings === 'object') {
            const loadedSettings = data.settings;
            // themeをsettingsから分離
            if (loadedSettings.theme && typeof loadedSettings.theme === 'object') {
              setTheme(loadedSettings.theme);
              // theme以外の設定を保存
              const { theme: _, ...otherSettings } = loadedSettings;
              setSettings(otherSettings);
            } else {
              setSettings(loadedSettings);
            }
          }
          
          // 後方互換性: 古いデータでthemeが直接カラムにある場合
          if (data.theme && typeof data.theme === 'object' && (!data.settings || !data.settings.theme)) {
            setTheme(data.theme);
          }
          
          // featured_on_topを読み込む（デフォルトはtrue）
          if (typeof data.featured_on_top === 'boolean') {
            setFeaturedOnTop(data.featured_on_top);
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
            data: { avatar: '', name: '', title: '', category: 'other' }
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
            data: { links: [{ label: '新しいリンク', url: 'https://', style: '' }] }
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
          data: { title: 'LINE公式アカウント', description: '最新情報をお届けします', url: 'https://lin.ee/xxxxx', buttonText: '友だち追加', qrImageUrl: '' }
          };
        case 'faq':
          return {
            id: generateBlockId(),
            type: 'faq',
            data: { items: [{ id: generateBlockId(), question: '', answer: '' }] }
          };
        case 'pricing':
          return {
            id: generateBlockId(),
            type: 'pricing',
            data: { plans: [{ id: generateBlockId(), title: '', price: '', features: [], isRecommended: false }] }
          };
        case 'testimonial':
          return {
            id: generateBlockId(),
            type: 'testimonial',
            data: { items: [{ id: generateBlockId(), name: '', role: '', comment: '', imageUrl: '' }] }
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

  // ブロックの並び替え（不変性を保った実装）
  const moveBlock = (blockId: string, direction: 'up' | 'down') => {
    setBlocks(prev => {
      const index = prev.findIndex(b => b.id === blockId);
      if (index === -1) return prev;
      
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      
      // toSpliced を使用して不変性を保つ（ES2023+）
      // フォールバック: スプレッド演算子で新しい配列を作成
      if (Array.prototype.toSpliced) {
        return prev.toSpliced(index, 1).toSpliced(newIndex, 0, prev[index]);
      } else {
        // フォールバック実装
        const newBlocks = [...prev];
        const [movedBlock] = newBlocks.splice(index, 1);
        newBlocks.splice(newIndex, 0, movedBlock);
        return newBlocks;
      }
    });
  };

  // ブロックの更新（型安全な実装）
  const updateBlock = (blockId: string, updates: Partial<Block['data']>) => {
    setBlocks(prev => prev.map(block => {
      if (block.id === blockId) {
        return {
          ...block,
          data: { ...block.data, ...updates }
        } as Block;
      }
      return block;
    }));
  };

  // リンクの追加（linksブロック内）
  const addLinkToBlock = (blockId: string) => {
    setBlocks(prev => prev.map(block => {
      if (block.id === blockId && block.type === 'links') {
        return {
          ...block,
          data: {
            ...block.data,
            links: [...block.data.links, { label: '新しいリンク', url: 'https://', style: '' }]
          }
        };
      }
      return block;
    }));
  };

  // リンクの削除（linksブロック内）
  const removeLinkFromBlock = (blockId: string, linkIndex: number) => {
    setBlocks(prev => prev.map(block => {
      if (block.id === blockId && block.type === 'links') {
        return {
          ...block,
          data: {
            ...block.data,
            links: block.data.links.filter((_, i) => i !== linkIndex)
          }
        };
      }
      return block;
    }));
  };

  // リンクの更新（linksブロック内）
  const updateLinkInBlock = (blockId: string, linkIndex: number, field: 'label' | 'url' | 'style', value: string) => {
    setBlocks(prev => prev.map(block => {
      if (block.id === blockId && block.type === 'links') {
        return {
          ...block,
          data: {
            ...block.data,
            links: block.data.links.map((link, i) => 
              i === linkIndex ? { ...link, [field]: value } : link
            )
          }
        };
      }
      return block;
    }));
  };

  // 画像アップロード（ブロック用）
  const handleImageUpload = async (blockId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const publicUrl = await uploadImageViaApi(file, 'img');
      
      // ブロックタイプに応じて更新
      const block = blocks.find(b => b.id === blockId);
      if (block?.type === 'header') {
        updateBlock(blockId, { avatar: publicUrl });
      } else if (block?.type === 'image') {
        updateBlock(blockId, { url: publicUrl });
      }
    } catch (error: any) {
      console.error('Image upload error:', error);
      const errorMessage = error.message || '画像のアップロードに失敗しました';
      if (errorMessage.includes('Bucket not found') || errorMessage.includes('bucket')) {
        alert('背景画像のアップロードエラー: Supabase Storageのバケット「profile-uploads」が存在しないか、アクセス権限がありません。管理者にお問い合わせください。');
      } else {
        alert('アップロードエラー: ' + errorMessage);
      }
    } finally {
      setIsUploading(false);
    }
  };

  // 背景画像アップロード
  const handleBackgroundImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingBackground(true);
    try {
      const publicUrl = await uploadImageViaApi(file, 'bg');
      setTheme(prev => ({ ...prev, backgroundImage: publicUrl }));
    } catch (error: any) {
      console.error('Background image upload error:', error);
      const errorMessage = error.message || '背景画像のアップロードに失敗しました';
      if (errorMessage.includes('Bucket not found') || errorMessage.includes('bucket')) {
        alert('背景画像のアップロードエラー: Supabase Storageのバケット「profile-uploads」が存在しないか、アクセス権限がありません。管理者にお問い合わせください。');
      } else {
        alert('背景画像のアップロードエラー: ' + errorMessage);
      }
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

      if (!res.ok) {
        let errorMessage = 'AI生成に失敗しました';
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // JSON解析に失敗した場合はデフォルトメッセージを使用
          errorMessage = `AI生成に失敗しました (ステータス: ${res.status})`;
        }
        throw new Error(errorMessage);
      }

      const data = await res.json();
      console.log('AI生成結果:', data);
      
      // データの検証
      if (!data || (!data.catchphrase && !data.introduction)) {
        throw new Error('AIからの応答が不完全でした。もう一度お試しください。');
      }

      // 更新されたブロックのリストを保持
      const updatedBlockIds: string[] = [];

      // ヘッダーブロックを更新または作成
      let headerBlock = blocks.find(b => b.type === 'header');
      if (!headerBlock) {
        headerBlock = {
          id: generateBlockId(),
          type: 'header',
          data: { avatar: '', name: user?.email?.split('@')[0] || 'あなた', title: data.catchphrase || '' }
        };
        setBlocks(prev => [headerBlock!, ...prev]);
        updatedBlockIds.push(headerBlock.id);
      } else {
        updateBlock(headerBlock.id, {
          title: data.catchphrase,
          name: headerBlock.data.name || user?.email?.split('@')[0] || 'あなた'
        });
        updatedBlockIds.push(headerBlock.id);
      }

      // テキストカードブロックを追加または更新
      let textCardBlock = blocks.find(b => b.type === 'text_card');
      if (!textCardBlock) {
        textCardBlock = {
          id: generateBlockId(),
          type: 'text_card',
          data: { title: '自己紹介', text: data.introduction || '', align: 'center' }
        };
        setBlocks(prev => [...prev, textCardBlock!]);
        updatedBlockIds.push(textCardBlock.id);
      } else {
        updateBlock(textCardBlock.id, {
          text: data.introduction,
          title: textCardBlock.data.title || '自己紹介'
        });
        updatedBlockIds.push(textCardBlock.id);
      }

      // リンクブロックを追加または更新
      if (data.recommendedLinks && data.recommendedLinks.length > 0) {
        let linksBlock = blocks.find(b => b.type === 'links');
        if (!linksBlock) {
          linksBlock = {
            id: generateBlockId(),
            type: 'links',
            data: { links: data.recommendedLinks }
          };
          setBlocks(prev => [...prev, linksBlock!]);
          updatedBlockIds.push(linksBlock.id);
        } else {
          updateBlock(linksBlock.id, {
            links: data.recommendedLinks
          });
          updatedBlockIds.push(linksBlock.id);
        }
      }

      // 更新されたブロックを展開
      setExpandedBlocks(prev => new Set([...prev, ...updatedBlockIds]));
      
      setShowAIModal(false);
      
      // 詳細な完了メッセージ
      const updatedItems = [];
      if (data.catchphrase) updatedItems.push('キャッチコピー');
      if (data.introduction) updatedItems.push('自己紹介文');
      if (data.recommendedLinks && data.recommendedLinks.length > 0) updatedItems.push(`推奨リンク(${data.recommendedLinks.length}件)`);
      
      alert(`AI生成が完了しました！\n\n生成された内容:\n${updatedItems.map(item => `• ${item}`).join('\n')}\n\nブロックを確認してください。`);
    } catch (error: any) {
      console.error('AI生成エラー:', error);
      alert('AI生成エラー: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // 保存処理
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const slug = savedSlug || generateSlug();
      const headerBlock = blocks.find(b => b.type === 'header');
      const name = headerBlock?.type === 'header' ? headerBlock.data.name : 'プロフィール';

      // themeをsettingsに含める
      const settingsWithTheme = {
        ...settings,
        theme: theme
      };

      // ログインユーザーの場合のみuser_idを設定、未ログインの場合はnullにする
      const userId = user?.id || null;

      // Server Action経由で保存
      const result = await saveProfile({
        slug,
        content: blocks,
        settings: settingsWithTheme,
        userId,
        featuredOnTop
      });

      if (result.error) {
        throw new Error(result.error);
      }
      
      setSavedSlug(slug);
      
      // アナリティクスを再取得
      if (result.data?.id) {
        const analyticsData = await getAnalytics(result.data.id);
        setAnalytics(analyticsData);
      }
      
      // 成功モーダルを表示
      setShowSuccessModal(true);
      
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
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Input
                    label=""
                    val={block.data.avatar}
                    onChange={v => updateBlock(block.id, { avatar: v })}
                    ph="画像URL (https://...)"
                  />
                </div>
                <label className="bg-indigo-50 text-indigo-700 px-4 py-3 rounded-lg font-bold hover:bg-indigo-100 flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap h-[50px]">
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
            <div className="mb-4">
              <label className="text-sm font-bold text-gray-900 block mb-2">カテゴリ</label>
              <select 
                className="w-full border border-gray-300 p-3 rounded-lg text-black font-bold focus:ring-2 focus:ring-indigo-500 outline-none bg-white transition-shadow"
                value={block.data.category || 'other'}
                onChange={(e) => updateBlock(block.id, { category: e.target.value })}
              >
                <option value="fortune">占い</option>
                <option value="business">ビジネス</option>
                <option value="study">学習</option>
                <option value="other">その他</option>
              </select>
            </div>
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
              <Input 
                label="" 
                val={block.data.url} 
                onChange={v => updateBlock(block.id, { url: v })} 
                ph="画像URL (https://...)" 
                type="url"
              />
              <div className="mt-2">
                <label className="bg-indigo-50 text-indigo-700 px-4 py-3 rounded-lg font-bold hover:bg-indigo-100 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap border-2 border-dashed border-indigo-300 w-full">
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
              {block.data.links.map((link, index) => {
                // リンクに一意のIDがない場合は生成（後方互換性）
                const linkId = `link_${block.id}_${index}`;
                return (
                <div key={linkId} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
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
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: '', name: 'デフォルト', bgColor: 'bg-gray-100', textColor: 'text-gray-700', borderColor: 'border-gray-300' },
                        { id: 'orange', name: 'オレンジ', bgColor: 'bg-orange-500', textColor: 'text-white', borderColor: 'border-orange-600' },
                        { id: 'blue', name: 'ブルー', bgColor: 'bg-blue-500', textColor: 'text-white', borderColor: 'border-blue-600' },
                        { id: 'green', name: 'グリーン', bgColor: 'bg-green-500', textColor: 'text-white', borderColor: 'border-green-600' },
                        { id: 'purple', name: 'パープル', bgColor: 'bg-purple-500', textColor: 'text-white', borderColor: 'border-purple-600' },
                      ].map(styleOption => (
                        <button
                          key={styleOption.id}
                          onClick={() => updateLinkInBlock(block.id, index, 'style', styleOption.id)}
                          className={`px-4 py-2 rounded-lg font-bold text-sm transition-all border-2 ${
                            link.style === styleOption.id
                              ? `${styleOption.bgColor} ${styleOption.textColor} ${styleOption.borderColor} ring-2 ring-indigo-300 shadow-md`
                              : `${styleOption.bgColor} ${styleOption.textColor} ${styleOption.borderColor} opacity-70 hover:opacity-100`
                          }`}
                        >
                          {styleOption.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                );
              })}
              {block.data.links.length === 0 && (
                <p className="text-center py-4 text-gray-400 text-sm">リンクがありません</p>
              )}
            </div>
          </div>
        );

      case 'kindle':
        const kindleImagePresets = [
          'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&h=300&fit=crop',
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=300&fit=crop',
          'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&h=300&fit=crop',
          'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200&h=300&fit=crop',
          'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=200&h=300&fit=crop',
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
                      if (!file) return;
                      setIsUploading(true);
                      uploadImageViaApi(file, 'kindle')
                        .then((publicUrl) => {
                          updateBlock(block.id, { imageUrl: publicUrl });
                        })
                        .catch((error: any) => {
                          console.error('Kindle image upload error:', error);
                          const errorMessage = error.message || '画像のアップロードに失敗しました';
                          if (errorMessage.includes('Bucket not found') || errorMessage.includes('bucket')) {
                            alert('アップロードエラー: Supabase Storageのバケット「profile-uploads」が存在しないか、アクセス権限がありません。管理者にお問い合わせください。');
                          } else {
                            alert('アップロードエラー: ' + errorMessage);
                          }
                        })
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
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">QRコード画像（任意）</label>
              <div className="flex gap-2 mb-2">
                <Input 
                  label="" 
                  val={block.data.qrImageUrl || ''} 
                  onChange={v => updateBlock(block.id, { qrImageUrl: v })} 
                  ph="QRコード画像URL (https://...)" 
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
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setIsUploading(true);
                      try {
                        const publicUrl = await uploadImageViaApi(file, 'line_qr');
                        updateBlock(block.id, { qrImageUrl: publicUrl });
                      } catch (error: any) {
                        console.error('LINE QR image upload error:', error);
                        const errorMessage = error.message || '画像のアップロードに失敗しました';
                        if (errorMessage.includes('Bucket not found') || errorMessage.includes('bucket')) {
                          alert('アップロードエラー: Supabase Storageのバケット「profile-uploads」が存在しないか、アクセス権限がありません。管理者にお問い合わせください。');
                        } else {
                          alert('アップロードエラー: ' + errorMessage);
                        }
                      } finally {
                        setIsUploading(false);
                      }
                    }} 
                    disabled={isUploading}
                  />
                </label>
              </div>
              {block.data.qrImageUrl && (
                <div className="mt-2">
                  <img src={block.data.qrImageUrl} alt="QRコード" className="w-32 h-32 object-cover rounded-lg border" />
                </div>
              )}
            </div>
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
                            if (!file) return;
                            setIsUploading(true);
                            uploadImageViaApi(file, 'testimonial')
                              .then((publicUrl) => {
                                setBlocks(prev => prev.map(b => 
                                  b.id === block.id && b.type === 'testimonial'
                                    ? { ...b, data: { items: b.data.items.map((it, i) => i === index ? { ...it, imageUrl: publicUrl } : it) } }
                                    : b
                                ));
                              })
                              .catch((error: any) => {
                                console.error('Testimonial image upload error:', error);
                                const errorMessage = error.message || '画像のアップロードに失敗しました';
                                if (errorMessage.includes('Bucket not found') || errorMessage.includes('bucket')) {
                                  alert('アップロードエラー: Supabase Storageのバケット「profile-uploads」が存在しないか、アクセス権限がありません。管理者にお問い合わせください。');
                                } else {
                                  alert('アップロードエラー: ' + errorMessage);
                                }
                              })
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
                          // 男性ビジネス風イラスト3枚
                          'https://api.dicebear.com/7.x/notionists-neutral/png?seed=businessman1&size=200&backgroundColor=f2f2f2',
                          'https://api.dicebear.com/7.x/notionists-neutral/png?seed=businessman2&size=200&backgroundColor=e0f2fe',
                          'https://api.dicebear.com/7.x/notionists-neutral/png?seed=businessman3&size=200&backgroundColor=ede9fe',
                          // 女性ビジネス風イラスト3枚
                          'https://api.dicebear.com/7.x/notionists-neutral/png?seed=businesswoman1&size=200&backgroundColor=fef9c3',
                          'https://api.dicebear.com/7.x/notionists-neutral/png?seed=businesswoman2&size=200&backgroundColor=ffe4e6',
                          'https://api.dicebear.com/7.x/notionists-neutral/png?seed=businesswoman3&size=200&backgroundColor=dbeafe',
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
    <div className={`bg-gray-100 flex font-sans text-gray-900 ${isMobile && showPreview ? 'flex-col h-screen' : 'min-h-screen flex-col lg:flex-row'}`}>
      {/* 左側: 編集エリア */}
      <div className={`flex-1 overflow-y-auto transition-all ${showPreview && !isMobile ? 'lg:w-1/2' : 'w-full'} ${isMobile && showPreview ? 'flex-shrink-0' : ''}`}>
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
        <div className="bg-white border-b px-4 md:px-6 py-3 md:py-4 sticky top-0 z-50 shadow-sm" style={{ top: !user && !hideLoginBanner ? '120px' : '0' }}>
          <div className="flex flex-col md:flex-row md:justify-between gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-700">
                <ArrowLeft size={20}/>
              </button>
              <h2 className="font-bold text-base md:text-lg text-gray-900">
                {initialSlug ? 'プロフィール編集' : '新規作成'}
              </h2>
              {savedSlug && analytics.views > 0 && (
                <div className="hidden md:flex items-center gap-4 ml-4 text-sm text-gray-600 flex-wrap">
                  <div className="flex items-center gap-1" title="総アクセス数">
                    <Eye size={14}/>
                    <span className="font-bold">{analytics.views}</span>
                  </div>
                  <div className="flex items-center gap-1" title="総クリック数">
                    <BarChart2 size={14}/>
                    <span className="font-bold">{analytics.clicks}</span>
                  </div>
                  {analytics.clickRate > 0 && (
                    <div className="flex items-center gap-1 text-green-600" title="クリック率">
                      <span className="font-bold">{analytics.clickRate}%</span>
                    </div>
                  )}
                  {analytics.readRate > 0 && (
                    <div className="flex items-center gap-1 text-blue-600" title="精読率">
                      <span className="font-bold">{analytics.readRate}%</span>
                    </div>
                  )}
                  {analytics.avgTimeSpent > 0 && (
                    <div className="flex items-center gap-1 text-purple-600" title="平均滞在時間">
                      <span className="font-bold">{analytics.avgTimeSpent}秒</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              {savedSlug && (
                <>
                  <button 
                    onClick={() => setShowQRModal(true)} 
                    className="bg-blue-50 border border-blue-200 text-blue-700 px-3 md:px-4 py-2 rounded-lg font-bold flex items-center gap-1 md:gap-2 hover:bg-blue-100 text-xs md:text-sm"
                  >
                    <QrCode size={16}/> <span className="hidden sm:inline">QRコード</span>
                  </button>
                  <button 
                    onClick={() => setShowSettingsModal(true)} 
                    className="bg-gray-50 border border-gray-200 text-gray-700 px-3 md:px-4 py-2 rounded-lg font-bold flex items-center gap-1 md:gap-2 hover:bg-gray-100 text-xs md:text-sm"
                  >
                    <Settings size={16}/> <span className="hidden sm:inline">設定</span>
                  </button>
                </>
              )}
              <button 
                onClick={() => setShowPreview(!showPreview)} 
                className="bg-purple-50 border border-purple-200 text-purple-700 px-3 md:px-4 py-2 rounded-lg font-bold flex items-center gap-1 md:gap-2 hover:bg-purple-100 transition-all text-xs md:text-sm"
              >
                <Eye size={16}/> <span className="hidden sm:inline">{showPreview ? 'プレビュー非表示' : 'プレビュー表示'}</span>
              </button>
              {savedSlug && (
                <button 
                  onClick={handlePublish} 
                  className="bg-green-50 border border-green-200 text-green-700 px-3 md:px-4 py-2 rounded-lg font-bold flex items-center gap-1 md:gap-2 hover:bg-green-100 text-xs md:text-sm"
                >
                  <Share2 size={16}/> <span className="hidden sm:inline">公開URL</span>
                </button>
              )}
              <button 
                onClick={handleSave} 
                disabled={isSaving} 
                className="bg-indigo-600 text-white px-4 md:px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-md transition-all text-xs md:text-sm whitespace-nowrap"
              >
                {isSaving ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>} 保存
              </button>
            </div>
          </div>
          {savedSlug && analytics.views > 0 && (
            <div className="flex md:hidden items-center gap-3 mt-2 text-xs text-gray-600 flex-wrap">
              <div className="flex items-center gap-1" title="総アクセス数">
                <Eye size={12}/>
                <span className="font-bold">{analytics.views}</span>
              </div>
              <div className="flex items-center gap-1" title="総クリック数">
                <BarChart2 size={12}/>
                <span className="font-bold">{analytics.clicks}</span>
              </div>
              {analytics.clickRate > 0 && (
                <div className="flex items-center gap-1 text-green-600" title="クリック率">
                  <span className="font-bold">{analytics.clickRate}%</span>
                </div>
              )}
              {analytics.readRate > 0 && (
                <div className="flex items-center gap-1 text-blue-600" title="精読率">
                  <span className="font-bold">{analytics.readRate}%</span>
                </div>
              )}
              {analytics.avgTimeSpent > 0 && (
                <div className="flex items-center gap-1 text-purple-600" title="平均滞在時間">
                  <span className="font-bold">{analytics.avgTimeSpent}秒</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* テーマ設定セクション */}
        <div className="p-4 md:p-6 border-b bg-white">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="text-indigo-600" size={20}/>
            <h3 className="font-bold text-base md:text-lg text-gray-900">テーマ設定</h3>
          </div>
          
          {/* 背景パターンと背景画像を1行に */}
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div className="flex-1 w-full">
              <label className="text-sm font-bold text-gray-900 block mb-2">背景パターン</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
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
                    className={`p-2 rounded-lg border-2 transition-all overflow-hidden ${
                      theme.gradient === preset.gradient && !theme.backgroundImage
                        ? 'border-indigo-500 ring-2 ring-indigo-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    title={preset.name}
                  >
                    <div 
                      className="w-full h-10 rounded relative"
                      style={{ 
                        background: preset.gradient,
                        backgroundSize: '400% 400%',
                        animation: 'gradient 15s ease infinite'
                      }}
                    />
                    <p className="text-xs font-bold text-gray-600 mt-1 text-center">{preset.name}</p>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex-shrink-0 w-full md:w-auto">
              <label className="text-sm font-bold text-gray-900 block mb-2">背景画像</label>
              <div className="flex gap-2 flex-wrap">
                <label className="bg-indigo-50 text-indigo-700 px-3 md:px-4 py-2 md:py-3 rounded-lg font-bold hover:bg-indigo-100 flex items-center justify-center gap-2 cursor-pointer border-2 border-dashed border-indigo-300 text-sm md:text-base">
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
                    className="px-3 md:px-4 py-2 md:py-3 bg-red-50 text-red-700 rounded-lg font-bold hover:bg-red-100 text-sm md:text-base"
                  >
                    削除
                  </button>
                )}
              </div>
            </div>
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

        {/* ブロック追加ボタン */}
        <div className="p-4 md:p-6 border-b bg-gray-50">
          <div className="flex flex-wrap gap-2 mb-3">
            <button 
              onClick={() => setShowTemplateModal(true)} 
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 px-3 md:px-4 py-2 rounded-lg font-bold text-xs md:text-sm hover:from-blue-600 hover:to-cyan-600 flex items-center gap-1 md:gap-2 shadow-md"
            >
              <FileText size={14} className="md:w-4 md:h-4"/> <span>テンプレートから始める</span>
            </button>
            <button 
              onClick={() => setShowAIModal(true)} 
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 px-3 md:px-4 py-2 rounded-lg font-bold text-xs md:text-sm hover:from-purple-600 hover:to-pink-600 flex items-center gap-1 md:gap-2 shadow-md"
            >
              <Sparkles size={14} className="md:w-4 md:h-4"/> <span>AIで自動生成</span>
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => addBlock('header')} className="bg-white border border-gray-200 px-3 md:px-4 py-2 rounded-lg font-bold text-xs md:text-sm hover:bg-gray-50 flex items-center gap-1 md:gap-2">
              <User size={14} className="md:w-4 md:h-4"/> <span>ヘッダー</span>
            </button>
            <button onClick={() => addBlock('text_card')} className="bg-white border border-gray-200 px-3 md:px-4 py-2 rounded-lg font-bold text-xs md:text-sm hover:bg-gray-50 flex items-center gap-1 md:gap-2">
              <FileText size={14} className="md:w-4 md:h-4"/> <span>テキストカード</span>
            </button>
            <button onClick={() => addBlock('image')} className="bg-white border border-gray-200 px-3 md:px-4 py-2 rounded-lg font-bold text-xs md:text-sm hover:bg-gray-50 flex items-center gap-1 md:gap-2">
              <ImageIcon size={14} className="md:w-4 md:h-4"/> <span>画像</span>
            </button>
            <button onClick={() => addBlock('youtube')} className="bg-white border border-gray-200 px-3 md:px-4 py-2 rounded-lg font-bold text-xs md:text-sm hover:bg-gray-50 flex items-center gap-1 md:gap-2">
              <Youtube size={14} className="md:w-4 md:h-4"/> <span>YouTube</span>
            </button>
            <button onClick={() => addBlock('links')} className="bg-white border border-gray-200 px-3 md:px-4 py-2 rounded-lg font-bold text-xs md:text-sm hover:bg-gray-50 flex items-center gap-1 md:gap-2">
              <Link size={14} className="md:w-4 md:h-4"/> <span>リンク集</span>
            </button>
            <button onClick={() => addBlock('kindle')} className="bg-white border border-gray-200 px-3 md:px-4 py-2 rounded-lg font-bold text-xs md:text-sm hover:bg-gray-50 flex items-center gap-1 md:gap-2">
              <BookOpen size={14} className="md:w-4 md:h-4"/> <span>Kindle書籍</span>
            </button>
            <button onClick={() => addBlock('lead_form')} className="bg-white border border-gray-200 px-3 md:px-4 py-2 rounded-lg font-bold text-xs md:text-sm hover:bg-gray-50 flex items-center gap-1 md:gap-2">
              <Mail size={14} className="md:w-4 md:h-4"/> <span>リード獲得</span>
            </button>
            <button onClick={() => addBlock('faq')} className="bg-white border border-gray-200 px-3 md:px-4 py-2 rounded-lg font-bold text-xs md:text-sm hover:bg-gray-50 flex items-center gap-1 md:gap-2">
              <HelpCircle size={14} className="md:w-4 md:h-4"/> <span>FAQ</span>
            </button>
            <button onClick={() => addBlock('pricing')} className="bg-white border border-gray-200 px-3 md:px-4 py-2 rounded-lg font-bold text-xs md:text-sm hover:bg-gray-50 flex items-center gap-1 md:gap-2">
              <DollarSign size={14} className="md:w-4 md:h-4"/> <span>料金表</span>
            </button>
            <button onClick={() => addBlock('testimonial')} className="bg-white border border-gray-200 px-3 md:px-4 py-2 rounded-lg font-bold text-xs md:text-sm hover:bg-gray-50 flex items-center gap-1 md:gap-2">
              <MessageSquare size={14} className="md:w-4 md:h-4"/> <span>お客様の声</span>
            </button>
            <button onClick={() => addBlock('line_card')} className="bg-white border border-gray-200 px-3 md:px-4 py-2 rounded-lg font-bold text-xs md:text-sm hover:bg-gray-50 flex items-center gap-1 md:gap-2">
              <MessageSquare size={14} className="md:w-4 md:h-4"/> <span>LINE登録</span>
            </button>
          </div>
        </div>

        {/* ブロック一覧 */}
        <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-4">
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
        <div className={`w-full lg:w-1/2 border-t lg:border-t-0 lg:border-l bg-gray-50 overflow-y-auto ${isMobile ? 'flex-1 min-h-0' : ''}`}>
          <div className="sticky top-0 bg-white border-b px-4 py-2 z-10">
            <h3 className="font-bold text-sm text-gray-700 flex items-center gap-2">
              <Eye size={16} className="text-purple-600"/> プレビュー
            </h3>
          </div>
          <div 
            className="profile-page-wrapper min-h-screen"
            style={
              theme.backgroundImage 
                ? {
                    backgroundImage: `url(${theme.backgroundImage})`,
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat'
                  }
                : {
                    backgroundImage: theme.gradient || 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)',
                    backgroundSize: '400% 400%',
                    animation: 'gradient 15s ease infinite'
                  }
            }
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
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-bold text-sm text-blue-900 mb-2 flex items-center gap-1">
                <Sparkles size={14}/> AIが自動生成する内容
              </h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• <strong>キャッチコピー</strong>: あなたの魅力を伝える一言</li>
                <li>• <strong>自己紹介文</strong>: ターゲットに響く自己PR</li>
                <li>• <strong>推奨リンク</strong>: おすすめのSNSリンク</li>
              </ul>
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
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:text-gray-900">
                  <input 
                    type="checkbox" 
                    checked={featuredOnTop}
                    onChange={e => setFeaturedOnTop(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                  />
                  <span>トップページに掲載する</span>
                </label>
              </div>
              
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

      {/* 保存成功モーダル */}
      {showSuccessModal && savedSlug && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl md:rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] md:max-h-[85vh] flex flex-col overflow-hidden">
            {/* ヘッダー */}
            <div className="bg-white px-4 md:px-6 py-4 md:py-6 border-b border-gray-200 relative flex-shrink-0">
              <button 
                onClick={() => setShowSuccessModal(false)}
                className="absolute top-2 md:top-4 right-2 md:right-4 p-2 hover:bg-gray-100 rounded-full transition-all text-gray-700"
              >
                <X size={20} className="md:w-6 md:h-6"/>
              </button>
              <div className="flex items-center gap-2 md:gap-3 pr-10">
                <div className="bg-green-500 rounded-full p-2 md:p-3 flex-shrink-0">
                  <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg md:text-2xl font-bold text-gray-900">プロフィールLPを作成しました！</h2>
                  <p className="text-xs md:text-sm text-gray-600 mt-1">公開URLをコピーしてシェアできます</p>
                </div>
              </div>
            </div>

            {/* 本文 - スクロール可能 */}
            <div className="p-4 md:p-6 bg-white overflow-y-auto flex-1">
              {/* 公開URL */}
              <div className="mb-4 md:mb-6">
                <label className="block text-xs md:text-sm font-bold text-gray-700 mb-2">公開URL</label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-indigo-50 border-2 border-indigo-200 rounded-xl p-3 md:p-4">
                  <input 
                    type="text" 
                    readOnly 
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/p/${savedSlug}`}
                    className="flex-1 bg-transparent text-gray-800 font-mono text-xs md:text-sm outline-none break-all"
                  />
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/p/${savedSlug}`;
                      navigator.clipboard.writeText(url);
                      alert('URLをコピーしました！');
                    }}
                    className="bg-indigo-600 text-white px-4 md:px-5 py-2 md:py-2.5 rounded-lg font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 whitespace-nowrap shadow-md text-xs md:text-sm"
                  >
                    <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    コピー
                  </button>
                </div>
              </div>

              {/* SNSシェア */}
              <div className="mb-4 md:mb-6">
                <label className="block text-xs md:text-sm font-bold text-gray-700 mb-2 md:mb-3">SNSでシェア</label>
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  {(() => {
                    const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/p/${savedSlug}`;
                    const headerBlock = blocks.find(b => b.type === 'header');
                    const profileName = headerBlock?.type === 'header' ? headerBlock.data.name : 'プロフィールLP';
                    const shareText = `${profileName}のプロフィールページを作成しました！ #プロフィールLPメーカー`;
                    
                    return (
                      <>
                        <button
                          onClick={() => {
                            const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
                            window.open(twitterUrl, '_blank', 'width=550,height=420');
                          }}
                          className="bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white px-2 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl font-bold transition-all flex items-center justify-center gap-1 md:gap-2 shadow-md text-xs md:text-sm"
                        >
                          <Twitter size={16} className="md:w-5 md:h-5" fill="currentColor" />
                          <span className="hidden sm:inline">X (Twitter)</span>
                          <span className="sm:hidden">X</span>
                        </button>
                        <button
                          onClick={() => {
                            const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}`;
                            window.open(lineUrl, '_blank', 'width=550,height=420');
                          }}
                          className="bg-[#06C755] hover:bg-[#05b34c] text-white px-2 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl font-bold transition-all flex items-center justify-center gap-1 md:gap-2 shadow-md text-xs md:text-sm"
                        >
                          <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.63.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766-.028 1.08l-.164.38c-.213.5-.577.694-1.111.477-.636-.255-1.726-.581-2.448-1.005-.193-.127-.232-.127-.538-.08-2.09.35-4.11.63-4.475.63-.63 0-1.095-.389-1.095-1.057 0-.66.465-1.045 1.095-1.045.365 0 2.385-.28 4.475-.63.306-.05.345-.047.538.08.722.424 1.812.75 2.448 1.005.534.217.898.023 1.111-.477l.164-.38c.107-.314.148-.779.028-1.08-.135-.332-.667-.508-1.058-.59C4.27 19.156 0 15.125 0 10.314z"/>
                          </svg>
                          <span className="hidden sm:inline">LINE</span>
                        </button>
                        <button
                          onClick={() => {
                            const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
                            window.open(facebookUrl, '_blank', 'width=550,height=420');
                          }}
                          className="bg-[#1877F2] hover:bg-[#166fe5] text-white px-2 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl font-bold transition-all flex items-center justify-center gap-1 md:gap-2 shadow-md text-xs md:text-sm"
                        >
                          <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                          <span className="hidden sm:inline">Facebook</span>
                        </button>
                        <button
                          onClick={() => {
                            const url = `${window.location.origin}/p/${savedSlug}`;
                            if (navigator.share) {
                              navigator.share({
                                title: profileName,
                                text: shareText,
                                url: url,
                              }).catch(() => {});
                            } else {
                              navigator.clipboard.writeText(`${shareText} ${url}`);
                              alert('シェア内容をクリップボードにコピーしました！');
                            }
                          }}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-2 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl font-bold transition-all flex items-center justify-center gap-1 md:gap-2 shadow-md text-xs md:text-sm"
                        >
                          <Share2 size={16} className="md:w-5 md:h-5" />
                          <span className="hidden sm:inline">その他</span>
                        </button>
                      </>
                    );
                  })()}
                </div>
                <p className="text-[10px] md:text-xs text-gray-500 mt-2 text-center">
                  作成したプロフィールLPをSNSでシェアして、多くの人に見てもらいましょう！
                </p>
              </div>

              {/* Pro機能の案内 */}
              <div className="mb-4 md:mb-6 bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-xl md:rounded-2xl p-3 md:p-5">
                <div className="flex items-start gap-2 md:gap-3 mb-3 md:mb-4">
                  <div className="bg-orange-500 text-white rounded-full p-1.5 md:p-2 flex-shrink-0">
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm md:text-lg text-gray-900 mb-1 md:mb-2 flex items-center gap-2 flex-wrap">
                      <span>応援・寄付でPro機能を開放</span>
                      <span className="bg-orange-500 text-white text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded-full">オプション</span>
                    </h3>
                    <p className="text-xs md:text-sm text-gray-700 mb-2 md:mb-3">
                      500円〜50,000円で、以下の追加機能が使えるようになります
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-2 gap-2 md:gap-3 mb-3 md:mb-4">
                      <div className="bg-white rounded-lg p-2 md:p-3 border border-orange-200">
                        <div className="flex items-center gap-1 md:gap-2 mb-1">
                          <svg className="w-3 h-3 md:w-4 md:h-4 text-indigo-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                          </svg>
                          <h4 className="font-bold text-[10px] md:text-sm text-gray-900">HTMLダウンロード</h4>
                        </div>
                        <p className="text-[9px] md:text-xs text-gray-600">自分のサーバーにアップロード可能</p>
                      </div>
                      <div className="bg-white rounded-lg p-2 md:p-3 border border-orange-200">
                        <div className="flex items-center gap-1 md:gap-2 mb-1">
                          <svg className="w-3 h-3 md:w-4 md:h-4 text-indigo-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                          </svg>
                          <h4 className="font-bold text-[10px] md:text-sm text-gray-900">埋め込みコード</h4>
                        </div>
                        <p className="text-[9px] md:text-xs text-gray-600">WordPressなどに埋め込み可能</p>
                      </div>
                      <div className="bg-white rounded-lg p-2 md:p-3 border border-orange-200">
                        <div className="flex items-center gap-1 md:gap-2 mb-1">
                          <svg className="w-3 h-3 md:w-4 md:h-4 text-indigo-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                          <h4 className="font-bold text-[10px] md:text-sm text-gray-900">優先サポート</h4>
                        </div>
                        <p className="text-[9px] md:text-xs text-gray-600">機能改善の優先対応</p>
                      </div>
                      <div className="bg-white rounded-lg p-2 md:p-3 border border-orange-200">
                        <div className="flex items-center gap-1 md:gap-2 mb-1">
                          <svg className="w-3 h-3 md:w-4 md:h-4 text-indigo-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          <h4 className="font-bold text-[10px] md:text-sm text-gray-900">その他の機能</h4>
                        </div>
                        <p className="text-[9px] md:text-xs text-gray-600">今後追加される機能も利用可能</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (user) {
                          // ログイン済みの場合はダッシュボードへ
                          window.location.href = '/dashboard';
                        } else {
                          // 未ログインの場合はログイン画面を表示
                          setShowSuccessModal(false);
                          setShowAuth?.(true);
                        }
                      }}
                      className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-lg md:rounded-xl font-bold hover:from-orange-600 hover:to-yellow-600 transition-all flex items-center justify-center gap-1 md:gap-2 shadow-lg text-xs md:text-sm"
                    >
                      <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 3h18v2H3V3m0 4h18v2H3V7m0 4h18v2H3v-2m0 4h12v2H3v-2z" />
                      </svg>
                      <span className="hidden sm:inline">マイページで寄付・機能開放する</span>
                      <span className="sm:hidden">寄付・機能開放</span>
                    </button>
                    <p className="text-[9px] md:text-xs text-gray-500 text-center mt-1 md:mt-2">
                      ※寄付は任意です。無料でもLPの公開・シェアは可能です
                    </p>
                  </div>
                </div>
              </div>

              {/* アクションボタン */}
              <div className="flex flex-col sm:flex-row gap-2 md:gap-3 pt-2 border-t border-gray-200">
                <button
                  onClick={() => {
                    window.open(`/p/${savedSlug}`, '_blank');
                  }}
                  className="flex-1 bg-indigo-600 text-white px-4 md:px-6 py-3 md:py-4 rounded-lg md:rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg text-sm md:text-base"
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className="hidden sm:inline">プロフィールLPにアクセス</span>
                  <span className="sm:hidden">アクセス</span>
                </button>
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 md:px-6 py-3 md:py-4 rounded-lg md:rounded-xl font-bold hover:bg-gray-200 transition-all text-sm md:text-base"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileEditor;
