import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// APIキーの確認ログ
const apiKey = process.env.STRIPE_SECRET_KEY;
if (!apiKey) {
  console.error("❌ Stripe API Key is missing!");
}

const stripe = new Stripe(apiKey || '');

export async function POST(req) {
  try {
    const { quizId, quizTitle, userId, email } = await req.json();
    
    let origin = req.headers.get('origin');
    if (!origin) {
        origin = req.headers.get('referer');
        if (origin) {
            origin = new URL(origin).origin;
        }
    }

    // Originが取得できない場合の安全策（本番環境URLを直接指定）
    // ※Vercelの環境変数で NEXT_PUBLIC_BASE_URL を設定するのがベストですが、今回は固定で対応
    if (!origin || origin === 'null') {
        // ★ここをご自身の本番URLに書き換えてください（末尾の / は無し）
        origin = 'https://diagnosis-xxxxxx.vercel.app'; 
    }

    console.log(`🚀 Starting Checkout for: ${quizTitle} (User: ${userId}) at ${origin}`);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'jpy',
            product_data: {
              name: `HTMLデータ提供: ${quizTitle}`,
              description: 'この診断クイズのHTMLデータをダウンロードします（寄付・応援）',
            },
            unit_amount: 1000, 
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      // ★修正: /dashboard を削除しました
      success_url: `${origin}/?payment=success&session_id={CHECKOUT_SESSION_ID}&quiz_id=${quizId}`,
      cancel_url: `${origin}/?payment=cancel`,
      metadata: {
        userId: userId,
        quizId: quizId,
      },
      customer_email: email,
    });

    console.log("✅ Session Created:", session.url);
    return NextResponse.json({ url: session.url });

  } catch (err) {
    console.error("🔥 Stripe Checkout Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}