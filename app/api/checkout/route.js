import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Stripeインスタンスを遅延初期化（ビルド時エラーを防ぐ）
function getStripe() {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) {
    throw new Error("❌ Stripe API Key is missing!");
  }
  return new Stripe(apiKey);
}

export async function POST(req) {
  try {
    const { quizId, quizTitle, userId, email, price } = await req.json();
    
    // ★サーバー側でも安全のため価格チェック（無効なら1000円にする）
    let finalPrice = parseInt(price);
    if (isNaN(finalPrice) || finalPrice < 500 || finalPrice > 50000) {
        finalPrice = 1000;
    }

    let origin = req.headers.get('origin');
    if (!origin) {
        origin = req.headers.get('referer');
        if (origin) {
            origin = new URL(origin).origin;
        }
    }
    if (!origin || origin === 'null') {
        origin = 'https://diagnosis-xxxxxx.vercel.app'; // ★ご自身のURLに書き換えてください
    }

    console.log(`🚀 Starting Checkout: ${quizTitle} / ${finalPrice}JPY / User:${userId}`);

    const stripe = getStripe();
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
            // ★修正: チェック済みの金額を使用
            unit_amount: finalPrice, 
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/?payment=success&session_id={CHECKOUT_SESSION_ID}&quiz_id=${quizId}`,
      cancel_url: `${origin}/?payment=cancel`,
      metadata: {
        userId: userId,
        quizId: quizId,
      },
      customer_email: email,
    });

    return NextResponse.json({ url: session.url });

  } catch (err) {
    console.error("🔥 Stripe Checkout Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}