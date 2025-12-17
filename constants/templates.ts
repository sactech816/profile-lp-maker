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
  },

  // パターンD：【書籍LP】（書籍プロモーション・Kindle販売）
  {
    id: 'book-promotion',
    name: 'Book Promotion',
    description: '書籍LP - Kindle・書籍プロモーション特化',
    category: '書籍・出版',
    theme: {
      gradient: 'linear-gradient(-45deg, #1e293b, #334155, #475569, #334155)'
    },
    blocks: [
      {
        id: generateBlockId(),
        type: 'header',
        data: {
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=faces',
          name: '著者名',
          title: '著者 / コンサルタント',
          category: 'business'
        }
      },
      {
        id: generateBlockId(),
        type: 'text_card',
        data: {
          title: '売り込みゼロで、理想のお客様が自然と集まる。',
          text: 'あなたのビジネスを自動化する「すごい仕掛け」、知りたくありませんか？\n\n心理学に基づいた「診断コンテンツ」を使えば、お客様が自らの課題に気づき、楽しみながらあなたのファンになる。そんな、ストレスフリーな事業の作り方を解説します。',
          align: 'center'
        }
      },
      {
        id: generateBlockId(),
        type: 'kindle',
        data: {
          asin: 'B0FL5SG9BX',
          imageUrl: 'https://m.media-amazon.com/images/I/81RxK39ovgL._SY522_.jpg',
          title: '診断コンテンツのすごい仕掛け',
          description: 'お客様が自らの課題に気づき、「ぜひ、あなたに相談したい」と自然に思ってくれる"すごい仕掛け"の作り方を科学的に解説。'
        }
      },
      {
        id: generateBlockId(),
        type: 'text_card',
        data: {
          title: 'もし、あなたのビジネスがこんな状態になったら…',
          text: '✓ 価格ではなく「あなただから」という理由で選ばれる。\n✓ 営業活動はゼロ。お客様を喜ばせることに100%集中できる。\n✓ お客様が自分の課題を深く理解した上で「ぜひ相談したい」とやってくる。\n\nこれは夢物語ではありません。「診断コンテンツ」なら、この未来を実現できます。',
          align: 'center'
        }
      },
      {
        id: generateBlockId(),
        type: 'text_card',
        data: {
          title: '本書で手に入る「すごい仕掛け」の一部',
          text: '• 見込み客が楽しみながら"集まる"最新手法\n• 売り込み感ゼロで「この人、分かってる！」と信頼される科学\n• 営業が苦手でも結果が出る、自動営業システムの作り方\n• 価格競争から完全に脱却し、適正価格で選ばれる思考法\n• お客様の回答データから、次のヒットサービスを生み出す方法',
          align: 'left'
        }
      },
      {
        id: generateBlockId(),
        type: 'quiz',
        data: {
          title: 'あなたの「理想の集客スタイル」無料診断',
          quizSlug: 'ideal-marketing-style'
        }
      },
      {
        id: generateBlockId(),
        type: 'text_card',
        data: {
          title: '5つの質問で、あなたのビジネスが飛躍するヒントを見つけよう！',
          text: '診断を体験することで、本書で解説している「診断コンテンツ」の威力を実感できます。',
          align: 'center'
        }
      },
      {
        id: generateBlockId(),
        type: 'text_card',
        data: {
          title: 'こんな方におすすめ',
          text: '1. フリーランス、コーチ、コンサルタント、クリエイターなど、個人でビジネスをされている方\n2. 自分の価値が伝わらず、価格競争に疲弊している方\n3. 売り込みなしで、お客様から「お願いしたい」と言われる仕組みを作りたい方',
          align: 'left'
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
              comment: '「この方法なら、私にもできる！」と確信しました。診断を作ってから、問い合わせの質が明らかに変わりました。',
              imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces'
            },
            {
              id: generateBlockId(),
              name: 'K様',
              role: 'Webデザイナー',
              comment: '営業が苦手でしたが、診断コンテンツのおかげで自然と相談が来るようになりました。',
              imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces'
            }
          ]
        }
      },
      {
        id: generateBlockId(),
        type: 'line_card',
        data: {
          title: '読者限定・豪華特典のご案内',
          description: '専用エディタ＆テンプレート、業種別「質問テンプレート集」など、すぐに使える特典をプレゼント！',
          url: 'https://lin.ee/kVeOUXF',
          buttonText: 'LINEで特典を受け取る'
        }
      },
      {
        id: generateBlockId(),
        type: 'text_card',
        data: {
          title: 'さあ、あなたも「営業しない営業」で理想の顧客と出会う。',
          text: 'お客様との関係が、ビジネスが、そしてあなた自身の働き方が、劇的に変わる。そのための科学的な設計図が、この一冊にすべて詰まっています。',
          align: 'center'
        }
      },
      {
        id: generateBlockId(),
        type: 'faq',
        data: {
          items: [
            {
              id: generateBlockId(),
              question: 'Kindle Unlimitedで読めますか？',
              answer: 'はい、Kindle Unlimited会員は無料で読めます。'
            },
            {
              id: generateBlockId(),
              question: '初心者でも実践できますか？',
              answer: 'はい、基礎から丁寧に解説しており、Googleフォームを使った簡単な方法から始められます。'
            }
          ]
        }
      }
    ]
  },

  // パターンE：【診断コンテンツLP】（診断を中心としたリード獲得）
  {
    id: 'quiz-content-lp',
    name: 'Quiz Content LP',
    description: '診断コンテンツLP - 診断を中心としたリード獲得',
    category: '診断・リード獲得',
    theme: {
      gradient: 'linear-gradient(-45deg, #7c3aed, #8b5cf6, #a78bfa, #8b5cf6)'
    },
    blocks: [
      {
        id: generateBlockId(),
        type: 'header',
        data: {
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=faces',
          name: 'あなたの名前',
          title: 'あなたの肩書き',
          category: 'business'
        }
      },
      {
        id: generateBlockId(),
        type: 'text_card',
        data: {
          title: 'たった3分で、あなたの課題が明確になる',
          text: '無料診断で、今のあなたに最適な解決策を見つけましょう。\n\n1,000人以上が診断を受け、自分の強みと改善点を発見しています。',
          align: 'center'
        }
      },
      {
        id: generateBlockId(),
        type: 'quiz',
        data: {
          title: '無料診断スタート',
          quizSlug: 'your-quiz-slug'
        }
      },
      {
        id: generateBlockId(),
        type: 'text_card',
        data: {
          title: '診断を受けると、こんなことが分かります',
          text: '✓ あなたの現在の状況と課題\n✓ 今すぐ取り組むべき優先事項\n✓ あなたに最適な解決策\n✓ 次のステップへの具体的なアクション',
          align: 'left'
        }
      },
      {
        id: generateBlockId(),
        type: 'testimonial',
        data: {
          items: [
            {
              id: generateBlockId(),
              name: 'A様',
              role: '30代・会社員',
              comment: '診断結果が驚くほど的確で、自分の課題が明確になりました。',
              imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces'
            },
            {
              id: generateBlockId(),
              name: 'B様',
              role: '40代・経営者',
              comment: '無料とは思えないクオリティ。すぐに行動に移せるアドバイスが嬉しかったです。',
              imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces'
            },
            {
              id: generateBlockId(),
              name: 'C様',
              role: '20代・フリーランス',
              comment: '診断後の個別相談で、さらに深い気づきが得られました。',
              imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces'
            }
          ]
        }
      },
      {
        id: generateBlockId(),
        type: 'text_card',
        data: {
          title: '診断後の3つのステップ',
          text: 'STEP 1：診断結果をその場で確認\nSTEP 2：詳細レポートをメールで受け取る\nSTEP 3：無料個別相談で具体的な解決策を提案',
          align: 'center'
        }
      },
      {
        id: generateBlockId(),
        type: 'image',
        data: {
          url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop',
          caption: '診断結果に基づいた個別サポートも提供'
        }
      },
      {
        id: generateBlockId(),
        type: 'pricing',
        data: {
          plans: [
            {
              id: generateBlockId(),
              title: '無料診断',
              price: '¥0',
              features: [
                '3分で完了する簡単診断',
                '即座に結果を確認',
                '詳細レポートをメール送付',
                '改善のヒントを提供'
              ],
              isRecommended: false
            },
            {
              id: generateBlockId(),
              title: '個別相談',
              price: '¥5,500',
              features: [
                '診断結果の詳細解説',
                '60分の個別セッション',
                'あなた専用の改善プラン',
                'フォローアップメール'
              ],
              isRecommended: true
            },
            {
              id: generateBlockId(),
              title: '継続サポート',
              price: '月額 ¥33,000',
              features: [
                '月2回の個別セッション',
                '24時間チャットサポート',
                '定期的な進捗確認',
                '目標達成まで伴走'
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
              question: '診断は本当に無料ですか？',
              answer: 'はい、診断は完全無料です。メールアドレスの登録も不要で、すぐに結果を確認できます。'
            },
            {
              id: generateBlockId(),
              question: '診断結果は信頼できますか？',
              answer: 'はい、心理学と統計学に基づいた科学的な診断ロジックを使用しています。'
            },
            {
              id: generateBlockId(),
              question: '個別相談は必須ですか？',
              answer: 'いいえ、診断のみの利用も可能です。個別相談は希望される方のみご利用いただけます。'
            }
          ]
        }
      },
      {
        id: generateBlockId(),
        type: 'line_card',
        data: {
          title: 'LINE登録で限定コンテンツ配信中',
          description: '診断結果の活用法や、最新のノウハウを定期的にお届けします',
          url: 'https://lin.ee/example',
          buttonText: 'LINE登録する'
        }
      },
      {
        id: generateBlockId(),
        type: 'lead_form',
        data: {
          title: '個別相談のお申し込み',
          buttonText: '相談を申し込む'
        }
      }
    ]
  }
];