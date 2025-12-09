import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const apiKey = process.env.STRIPE_SECRET_KEY;
if (!apiKey) {
  console.error("❌ Stripe API Key is missing!");
}

const stripe = new Stripe(apiKey || '');

export async function POST(req) {
  try {
    const { profileId, profileName, userId, email, price } = await req.json();
    
    // ★サーバー側でも安全のため価格チェック（無効なら1000円にする）
    let finalPrice = parseInt(price);
    if (isNaN(finalPrice) || finalPrice < 10 || finalPrice > 100000) {
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
        origin = process.env.NEXT_PUBLIC_SITE_URL || 'https://lp.makers.tokyo';
    }

    console.log(`🚀 Starting Checkout: ${profileName} / ${finalPrice}JPY / User:${userId}`);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'jpy',
            product_data: {
              name: `HTMLデータ提供: ${profileName}`,
              description: 'このプロフィールLPのHTMLデータをダウンロードします（寄付・応援）',
            },
            unit_amount: finalPrice, 
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}&profile_id=${profileId}&redirect=dashboard`,
      cancel_url: `${origin}/dashboard?payment=cancel&redirect=dashboard`,
      metadata: {
        userId: userId,
        profileId: profileId,
      },
      customer_email: email,
    });

    return NextResponse.json({ url: session.url });

  } catch (err) {
    console.error("🔥 Stripe Checkout Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

