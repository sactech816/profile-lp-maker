import { Block } from '@/lib/types';
import { generateBlockId } from '@/lib/types';

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  theme: {
    gradient: string;
    backgroundImage?: string;
  };
  blocks: Block[];
}

export const templates: Template[] = [
  // パターンA：【ビジネス・コンサルタント】（信頼・権威性重視）
  {
    id: 'business-consultant',
    name: 'Business / Trust',
    description: 'ビジネス・コンサルタント - 信頼・権威性重視',
    category: 'ビジネス',
    theme: {
      gradient: 'linear-gradient(-45deg, #334155, #475569, #64748b, #475569)'
    },
    blocks: [
      {
        id: generateBlockId(),
        type: 'header',
        data: {
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces',
          name: '田中 誠',
          title: '中小企業診断士 / 経営コンサルタント',
          category: 'business'
        }
      },
      {
        id: generateBlockId(),
        type: 'text_card',
        data: {
          title: '『経営の孤独』に寄り添い、確かな成長戦略を。',
          text: '大手ファームで10年の経験を経て独立。これまで100社以上の中小企業の経営改善に携わってきました。社長の『想い』を『戦略』へ落とし込みます。',
          align: 'center'
        }
      },
      {
        id: generateBlockId(),
        type: 'image',
        data: {
          url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop',
          caption: '年間50回以上のセミナー登壇実績'
        }
      },
      {
        id: generateBlockId(),
        type: 'testimonial',
        data: {
          items: [
            {
              id: generateBlockId(),
              name: '佐藤様',
              role: '株式会社A 代表',
              comment: '半年で黒字化を達成できました',
              imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces'
            },
            {
              id: generateBlockId(),
              name: '鈴木様',
              role: 'B整骨院 院長',
              comment: '離職率が劇的に下がりました',
              imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces'
            }
          ]
        }
      },
      {
        id: generateBlockId(),
        type: 'pricing',
        data: {
          plans: [
            {
              id: generateBlockId(),
              title: 'スポット経営相談',
              price: '¥33,000',
              features: [
                '90分の個別相談',
                '経営課題のヒアリング',
                '具体的な改善提案書',
                'メールフォローアップ'
              ],
              isRecommended: false
            },
            {
              id: generateBlockId(),
              title: '月次顧問契約',
              price: '¥110,000〜',
              features: [
                '月2回の定期面談',
                '戦略立案と実行支援',
                '24時間メールサポート',
                '経営会議への参加'
              ],
              isRecommended: true
            },
            {
              id: generateBlockId(),
              title: '事業計画書作成代行',
              price: '¥220,000〜',
              features: [
                '包括的な事業計画策定',
                '資金調達サポート',
                '金融機関との調整',
                '3ヶ月間のフォロー'
              ],
              isRecommended: false
            }
          ]
        }
      },
      {
        id: generateBlockId(),
        type: 'faq',
        data: {
          items: [
            {
              id: generateBlockId(),
              question: '地方でも対応可能ですか？',
              answer: 'はい、オンラインにて全国対応可能です。'
            },
            {
              id: generateBlockId(),
              question: '得意な業種は？',
              answer: '小売・サービス・IT関連の実績が豊富ですが、業種問わず対応可能です。'
            }
          ]
        }
      },
      {
        id: generateBlockId(),
        type: 'line_card',
        data: {
          title: '公式LINEでノウハウ配信中',
          description: '登録者限定で『資金繰りチェックシート』をプレゼント',
          url: 'https://lin.ee/example',
          buttonText: 'LINE登録する'
        }
      },
      {
        id: generateBlockId(),
        type: 'lead_form',
        data: {
          title: 'お問い合わせ・講演依頼',
          buttonText: 'お問い合わせする'
        }
      }
    ]
  },

  // パターンB：【クリエイター・自己紹介】（親しみやすさ・SNSハブ）
  {
    id: 'creator-portfolio',
    name: 'Creator / Portfolio',
    description: 'クリエイター・自己紹介 - 親しみやすさ・SNSハブ',
    category: 'クリエイター',
    theme: {
      gradient: 'linear-gradient(-45deg, #f472b6, #ec4899, #fbbf24, #f59e0b)'
    },
    blocks: [
      {
        id: generateBlockId(),
        type: 'header',
        data: {
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces',
          name: '鈴木 アイリ',
          title: 'Illustrator / Graphic Designer',
          category: 'other'
        }
      },
      {
        id: generateBlockId(),
        type: 'text_card',
        data: {
          title: '日常に、少しの彩りを。',
          text: '東京在住のフリーランスイラストレーターです。水彩画のような柔らかいタッチで、見る人の心がホッとする作品作りを心がけています。',
          align: 'center'
        }
      },
      {
        id: generateBlockId(),
        type: 'image',
        data: {
          url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop',
          caption: 'Recent Works'
        }
      },
      {
        id: generateBlockId(),
        type: 'image',
        data: {
          url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop',
          caption: 'Portfolio Gallery'
        }
      },
      {
        id: generateBlockId(),
        type: 'links',
        data: {
          links: [
            { label: 'Instagram - イラスト作品を毎日投稿中', url: 'https://instagram.com/example', style: '' },
            { label: 'X (Twitter) - お仕事の告知や日常のつぶやき', url: 'https://x.com/example', style: '' }
          ]
        }
      },
      {
        id: generateBlockId(),
        type: 'youtube',
        data: {
          url: 'https://www.youtube.com/watch?v=N2NIQztcYyw'
        }
      },
      {
        id: generateBlockId(),
        type: 'text_card',
        data: {
          title: 'アナログ水彩のメイキング動画を公開しています。',
          text: 'YouTubeチャンネルでは、水彩画の制作過程や画材の使い方、イラストのコツなどを紹介しています。',
          align: 'center'
        }
      },
      {
        id: generateBlockId(),
        type: 'kindle',
        data: {
          asin: 'B08XXXXXXX',
          imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
          title: '鈴木アイリ作品集 Vol.1',
          description: '2023年までに制作したお気に入りのイラストをまとめたZINEです。'
        }
      },
      {
        id: generateBlockId(),
        type: 'line_card',
        data: {
          title: 'お仕事のご依頼はこちら',
          description: 'イラスト制作のご依頼やお見積もりのご相談はLINEからお気軽にどうぞ',
          url: 'https://lin.ee/example',
          buttonText: 'LINEで問い合わせる'
        }
      }
    ]
  },

  // パターンC：【Webマーケター・フルセット】（高機能・CV重視）
  {
    id: 'marketer-fullpackage',
    name: 'Marketer / Full Package',
    description: 'Webマーケター・フルセット - 高機能・CV重視',
    category: 'マーケティング',
    theme: {
      gradient: 'linear-gradient(-45deg, #3b82f6, #1d4ed8, #06b6d4, #0891b2)'
    },
    blocks: [
      {
        id: generateBlockId(),
        type: 'header',
        data: {
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=faces',
          name: '山田 太郎',
          title: 'Web集客コンサルタント / 著者',
          category: 'business'
        }
      },
      {
        id: generateBlockId(),
        type: 'image',
        data: {
          url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop',
          caption: '年間300社の集客改善実績'
        }
      },
      {
        id: generateBlockId(),
        type: 'text_card',
        data: {
          title: '『良い商品なのに売れない』その悩みを仕組みで解決します',
          text: '根性論の営業ではなく、科学的なWebマーケティングでビジネスを自動化。集客に追われる日々を卒業しましょう。',
          align: 'center'
        }
      },
      {
        id: generateBlockId(),
        type: 'quiz',
        data: {
          title: 'Web集客力診断',
          quizSlug: 'web-marketing-diagnosis'
        }
      },
      {
        id: generateBlockId(),
        type: 'text_card',
        data: {
          title: 'たった3分！あなたのビジネスの課題と今やるべき施策が分かります。',
          text: '無料診断で現状を把握し、最適な集客戦略を見つけましょう。',
          align: 'center'
        }
      },
      {
        id: generateBlockId(),
        type: 'youtube',
        data: {
          url: 'https://www.youtube.com/watch?v=N2NIQztcYyw'
        }
      },
      {
        id: generateBlockId(),
        type: 'text_card',
        data: {
          title: '最新のセミナー動画',
          text: '【完全解説】広告費0円で月100リスト獲得する方法',
          align: 'center'
        }
      },
      {
        id: generateBlockId(),
        type: 'kindle',
        data: {
          asin: 'B09YYYYYYY',
          imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop',
          title: 'Web集客1年生の教科書',
          description: 'Amazonランキング1位獲得（マーケティング部門）'
        }
      },
      {
        id: generateBlockId(),
        type: 'testimonial',
        data: {
          items: [
            {
              id: generateBlockId(),
              name: 'M様',
              role: 'コーチング業',
              comment: '仕組み化してから、月商が3倍になりました！',
              imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces'
            },
            {
              id: generateBlockId(),
              name: 'K様',
              role: '整体院経営',
              comment: 'リピート率が50%から80%に改善しました。',
              imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces'
            }
          ]
        }
      },
      {
        id: generateBlockId(),
        type: 'pricing',
        data: {
          plans: [
            {
              id: generateBlockId(),
              title: 'オンラインサロン',
              price: '月額 3,300円',
              features: [
                '月2回のオンライン勉強会',
                '限定コンテンツ配信',
                'メンバー限定Q&A',
                '実践ワークシート提供'
              ],
              isRecommended: false
            },
            {
              id: generateBlockId(),
              title: 'Web集客集中講座',
              price: '59,800円',
              features: [
                '6週間の集中プログラム',
                '個別フィードバック',
                '実践課題とサポート',
                '修了証書発行'
              ],
              isRecommended: true
            },
            {
              id: generateBlockId(),
              title: '個別コンサルティング',
              price: '月額 165,000円',
              features: [
                '月4回の個別面談',
                'カスタム戦略立案',
                '24時間チャットサポート',
                '成果保証付き'
              ],
              isRecommended: false
            }
          ]
        }
      },
      {
        id: generateBlockId(),
        type: 'faq',
        data: {
          items: [
            {
              id: generateBlockId(),
              question: '初心者でも成果は出ますか？',
              answer: 'はい、基礎からステップバイステップで解説しています。'
            },
            {
              id: generateBlockId(),
              question: '返金保証は？',
              answer: '30日間の全額返金保証をつけております。'
            }
          ]
        }
      },
      {
        id: generateBlockId(),
        type: 'links',
        data: {
          links: [
            { label: 'Twitter', url: 'https://x.com/example', style: '' },
            { label: 'Facebook', url: 'https://facebook.com/example', style: '' },
            { label: 'Instagram', url: 'https://instagram.com/example', style: '' },
            { label: 'TikTok', url: 'https://tiktok.com/@example', style: '' }
          ]
        }
      },
      {
        id: generateBlockId(),
        type: 'line_card',
        data: {
          title: '公式LINEに登録する',
          description: '非公開動画をプレゼント',
          url: 'https://lin.ee/example',
          buttonText: 'LINE登録して特典を受け取る'
        }
      },
      {
        id: generateBlockId(),
        type: 'lead_form',
        data: {
          title: '無料個別相談会',
          buttonText: '相談会に申し込む'
        }
      },
      {
        id: generateBlockId(),
        type: 'text_card',
        data: {
          title: '毎月3名様限定で、あなたのビジネスの悩みを直接伺います。',
          text: 'Zoomにて60分間、完全無料でご相談いただけます。お気軽にお申し込みください。',
          align: 'center'
        }
      }
    ]
  }
];