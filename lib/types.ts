// プロフィールブロックの型定義

// リンクアイテムの型定義
export type LinkItem = {
  label: string;
  url: string;
  style: string;
};

// 各ブロックタイプのデータ型定義
export type HeaderBlockData = {
  avatar: string; // 空文字列の可能性あり
  name: string;
  title: string;
  category?: string; // カテゴリ（オプショナル）
};

export type TextCardBlockData = {
  title: string;
  text: string;
  align: 'left' | 'center';
};

export type ImageBlockData = {
  url: string; // 空文字列の可能性あり
  caption?: string;
};

export type YouTubeBlockData = {
  url: string;
};

export type LinksBlockData = {
  links: LinkItem[];
};

export type KindleBlockData = {
  asin: string;
  imageUrl: string; // 空文字列の可能性あり
  title: string;
  description: string;
};

export type LeadFormBlockData = {
  title: string;
  buttonText: string;
};

export type LineCardBlockData = {
  title: string;
  description: string;
  url: string;
  buttonText: string;
  qrImageUrl?: string; // オプショナル
};

export type FAQItem = {
  id: string;
  question: string;
  answer: string;
};

export type FAQBlockData = {
  items: FAQItem[];
};

export type PricingPlan = {
  id: string;
  title: string;
  price: string;
  features: string[];
  isRecommended: boolean;
};

export type PricingBlockData = {
  plans: PricingPlan[];
};

export type TestimonialItem = {
  id: string;
  name: string;
  role: string;
  comment: string;
  imageUrl?: string; // オプショナル
};

export type TestimonialBlockData = {
  items: TestimonialItem[];
};

// ブロックの型定義（Union型）
export type Block = 
  | { id: string; type: 'header'; data: HeaderBlockData }
  | { id: string; type: 'text_card'; data: TextCardBlockData }
  | { id: string; type: 'image'; data: ImageBlockData }
  | { id: string; type: 'youtube'; data: YouTubeBlockData }
  | { id: string; type: 'links'; data: LinksBlockData }
  | { id: string; type: 'kindle'; data: KindleBlockData }
  | { id: string; type: 'lead_form'; data: LeadFormBlockData }
  | { id: string; type: 'line_card'; data: LineCardBlockData }
  | { id: string; type: 'faq'; data: FAQBlockData }
  | { id: string; type: 'pricing'; data: PricingBlockData }
  | { id: string; type: 'testimonial'; data: TestimonialBlockData };

// プロフィール設定の型定義
export type ProfileSettings = {
  gtmId?: string;
  fbPixelId?: string;
  lineTagId?: string;
  theme?: {
    gradient?: string;
    backgroundImage?: string;
  };
};

// プロフィールデータの型定義
export interface Profile {
  id: string;
  slug: string;
  content: Block[];
  user_id?: string | null;
  created_at?: string;
  updated_at?: string;
  settings?: ProfileSettings;
  featured_on_top?: boolean;
}

// ユーティリティ関数：一意のIDを生成
export function generateBlockId(): string {
  return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// 後方互換性のためのマイグレーション関数
export function migrateOldContent(oldContent: any): Block[] {
  // null や undefined の場合は空配列を返す
  if (!oldContent) return [];
  
  // 配列でない場合は空配列を返す
  if (!Array.isArray(oldContent)) {
    // オブジェクトの場合は配列に変換を試みる
    if (typeof oldContent === 'object') {
      console.warn('migrateOldContent: content is not an array, returning empty array');
      return [];
    }
    return [];
  }
  
  return oldContent
    .filter((oldBlock) => oldBlock && typeof oldBlock === 'object' && oldBlock.type)
    .map((oldBlock) => {
      // 既にidがある場合は検証して使用
      if (oldBlock.id && typeof oldBlock.id === 'string') {
        // 型が正しいか簡易チェック
        if (oldBlock.type && oldBlock.data) {
          return oldBlock as Block;
        }
      }
      
      const id = generateBlockId();
      
      // 旧形式のブロックを新形式に変換
      switch (oldBlock.type) {
        case 'header':
          return {
            id,
            type: 'header',
            data: {
              avatar: oldBlock.data?.avatarUrl || oldBlock.data?.avatar || '',
              name: oldBlock.data?.name || '',
              title: oldBlock.data?.tagline || oldBlock.data?.title || '',
              category: oldBlock.data?.category || 'other'
            }
          } as Block;
        
        case 'glass_card_text':
          return {
            id,
            type: 'text_card',
            data: {
              title: oldBlock.data?.title || '',
              text: oldBlock.data?.text || '',
              align: (oldBlock.data?.alignment || oldBlock.data?.align || 'center') as 'left' | 'center'
            }
          } as Block;
        
        case 'link_list':
          return {
            id,
            type: 'links',
            data: {
              links: Array.isArray(oldBlock.data?.links) ? oldBlock.data.links : []
            }
          } as Block;
        
        default:
          // 未知のタイプはidを追加してそのまま返す（型安全性のため）
          if (oldBlock.type && oldBlock.data) {
            return { ...oldBlock, id } as Block;
          }
          // 不正なブロックはスキップ（空配列にフィルタされる）
          return null;
      }
    })
    .filter((block): block is Block => block !== null);
}

