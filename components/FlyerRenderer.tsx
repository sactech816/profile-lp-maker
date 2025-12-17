"use client";

import React from 'react';
import { Block } from '@/lib/types';
import { QRCodeSVG } from 'qrcode.react';

interface FlyerRendererProps {
  blocks: Block[];
  slug: string;
  settings?: {
    theme?: {
      gradient?: string;
      backgroundImage?: string;
    };
  };
}

export const FlyerRenderer: React.FC<FlyerRendererProps> = ({ blocks, slug, settings }) => {
  const lpUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/b/${slug}`;

  // ヘッダーブロックを取得
  const headerBlock = blocks.find(b => b.type === 'header');
  const headerData = headerBlock?.data as any;

  // テキストカードブロックを取得
  const textBlocks = blocks.filter(b => b.type === 'text_card');

  // リンクブロックを取得
  const linksBlock = blocks.find(b => b.type === 'links');
  const linksData = linksBlock?.data as any;

  // 料金表ブロックを取得
  const pricingBlock = blocks.find(b => b.type === 'pricing');
  const pricingData = pricingBlock?.data as any;

  return (
    <div className="flyer-container">
      {/* 印刷用スタイル */}
      <style jsx global>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .flyer-container {
            width: 210mm;
            height: 297mm;
            margin: 0;
            padding: 20mm;
            page-break-after: always;
          }
          .no-print {
            display: none !important;
          }
        }

        @media screen {
          .flyer-container {
            width: 210mm;
            min-height: 297mm;
            margin: 20px auto;
            padding: 20mm;
            background: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
        }

        .flyer-header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 3px solid #4F46E5;
        }

        .flyer-title {
          font-size: 32px;
          font-weight: bold;
          color: #1F2937;
          margin-bottom: 10px;
        }

        .flyer-subtitle {
          font-size: 18px;
          color: #6B7280;
          margin-bottom: 15px;
        }

        .flyer-section {
          margin-bottom: 25px;
        }

        .flyer-section-title {
          font-size: 20px;
          font-weight: bold;
          color: #4F46E5;
          margin-bottom: 10px;
          padding-bottom: 5px;
          border-bottom: 2px solid #E5E7EB;
        }

        .flyer-content {
          font-size: 14px;
          line-height: 1.8;
          color: #374151;
          white-space: pre-wrap;
        }

        .flyer-footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #E5E7EB;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .flyer-qr {
          text-align: center;
        }

        .flyer-qr-label {
          font-size: 12px;
          color: #6B7280;
          margin-top: 8px;
        }

        .flyer-contact {
          flex: 1;
          padding-right: 20px;
        }

        .flyer-links {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 10px;
        }

        .flyer-link-item {
          font-size: 12px;
          color: #4F46E5;
          padding: 8px;
          background: #EEF2FF;
          border-radius: 6px;
          text-align: center;
        }

        .flyer-pricing {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
          margin-top: 15px;
        }

        .flyer-price-card {
          border: 2px solid #E5E7EB;
          border-radius: 8px;
          padding: 15px;
          text-align: center;
        }

        .flyer-price-title {
          font-size: 16px;
          font-weight: bold;
          color: #1F2937;
          margin-bottom: 8px;
        }

        .flyer-price-amount {
          font-size: 24px;
          font-weight: bold;
          color: #4F46E5;
          margin-bottom: 10px;
        }

        .flyer-price-features {
          font-size: 11px;
          color: #6B7280;
          text-align: left;
        }
      `}</style>

      {/* ヘッダー */}
      <div className="flyer-header">
        {headerData?.avatar && (
          <div style={{ marginBottom: '15px' }}>
            <img 
              src={headerData.avatar} 
              alt={headerData.name || ''} 
              style={{ 
                width: '80px', 
                height: '80px', 
                borderRadius: '50%', 
                objectFit: 'cover',
                margin: '0 auto'
              }} 
            />
          </div>
        )}
        <h1 className="flyer-title">{headerData?.name || 'ビジネスLP'}</h1>
        {headerData?.title && (
          <p className="flyer-subtitle">{headerData.title}</p>
        )}
      </div>

      {/* テキストセクション */}
      {textBlocks.slice(0, 3).map((block, index) => {
        const data = block.data as any;
        return (
          <div key={block.id || index} className="flyer-section">
            {data.title && (
              <h2 className="flyer-section-title">{data.title}</h2>
            )}
            {data.text && (
              <div className="flyer-content">{data.text}</div>
            )}
          </div>
        );
      })}

      {/* 料金表 */}
      {pricingData?.plans && pricingData.plans.length > 0 && (
        <div className="flyer-section">
          <h2 className="flyer-section-title">料金プラン</h2>
          <div className="flyer-pricing">
            {pricingData.plans.slice(0, 3).map((plan: any) => (
              <div key={plan.id} className="flyer-price-card">
                <div className="flyer-price-title">{plan.title}</div>
                <div className="flyer-price-amount">{plan.price}</div>
                {plan.features && plan.features.length > 0 && (
                  <ul className="flyer-price-features" style={{ listStyle: 'none', padding: 0 }}>
                    {plan.features.slice(0, 3).map((feature: string, idx: number) => (
                      <li key={idx} style={{ marginBottom: '4px' }}>✓ {feature}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* フッター（QRコード + 連絡先） */}
      <div className="flyer-footer">
        <div className="flyer-contact">
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>お問い合わせ</h3>
          {linksData?.links && linksData.links.length > 0 && (
            <div className="flyer-links">
              {linksData.links.slice(0, 4).map((link: any, idx: number) => (
                <div key={idx} className="flyer-link-item">
                  {link.label}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flyer-qr">
          <QRCodeSVG 
            value={lpUrl} 
            size={100}
            level="M"
            includeMargin={true}
          />
          <div className="flyer-qr-label">
            詳細はこちら<br />
            <span style={{ fontSize: '10px' }}>{lpUrl}</span>
          </div>
        </div>
      </div>

      {/* 印刷ボタン（画面表示時のみ） */}
      <div className="no-print" style={{ textAlign: 'center', marginTop: '30px' }}>
        <button
          onClick={() => window.print()}
          style={{
            backgroundColor: '#4F46E5',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          印刷 / PDFで保存
        </button>
        <p style={{ marginTop: '10px', fontSize: '14px', color: '#6B7280' }}>
          ブラウザの印刷機能で「PDFに保存」を選択してください
        </p>
      </div>
    </div>
  );
};

export default FlyerRenderer;


