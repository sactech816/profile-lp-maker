// プロフィールブロックの型定義
export type LinkItem = {
  label: string;
  url: string;
  style: string;
};

export type Block = 
  | { id: string; type: 'header'; data: { avatar: string; name: string; title: string } }
  | { id: string; type: 'text_card'; data: { title: string; text: string; align: 'left' | 'center' } }
  | { id: string; type: 'image'; data: { url: string; caption?: string } }
  | { id: string; type: 'youtube'; data: { url: string } }
  | { id: string; type: 'links'; data: { links: LinkItem[] } }
  | { id: string; type: 'kindle'; data: { asin: string; imageUrl: string; title: string; description: string } }
  | { id: string; type: 'lead_form'; data: { title: string; buttonText: string } }
  | { id: string; type: 'line_card'; data: { title: string; description: string; url: string; buttonText: string } }
  | { id: string; type: 'faq'; data: { items: { id: string; question: string; answer: string }[] } }
  | { id: string; type: 'pricing'; data: { plans: { id: string; title: string; price: string; features: string[]; isRecommended: boolean }[] } }
  | { id: string; type: 'testimonial'; data: { items: { id: string; name: string; role: string; comment: string; imageUrl?: string }[] } };

export interface Profile {
  id: string;
  slug: string;
  content: Block[];
  user_id?: string;
  created_at?: string;
  updated_at?: string;
  settings?: {
    gtmId?: string;
    fbPixelId?: string;
    lineTagId?: string;
  };
}

// ユーティリティ関数：一意のIDを生成
export function generateBlockId(): string {
  return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// 後方互換性のためのマイグレーション関数
export function migrateOldContent(oldContent: any[]): Block[] {
  if (!Array.isArray(oldContent)) return [];
  
  return oldContent.map((oldBlock, index) => {
    const id = generateBlockId();
    
    // 既にidがある場合はそのまま使用
    if (oldBlock.id) {
      return oldBlock as Block;
    }
    
    // 旧形式のブロックを新形式に変換
    switch (oldBlock.type) {
      case 'header':
        return {
          id,
          type: 'header',
          data: {
            avatar: oldBlock.data?.avatarUrl || oldBlock.data?.avatar || '',
            name: oldBlock.data?.name || '',
            title: oldBlock.data?.tagline || oldBlock.data?.title || ''
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
            links: oldBlock.data?.links || []
          }
        } as Block;
      
      default:
        // 未知のタイプはそのまま返す（idを追加）
        return { ...oldBlock, id } as Block;
    }
  });
}

