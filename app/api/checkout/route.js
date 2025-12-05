import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const { quizId, quizTitle, userId, email } = await req.json();
    
    // 決済セッションを作成
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'jpy',
            product_data: {
              name: `HTMLダウンロード: ${quizTitle}`,
              description: 'このクイズのソースコード一式をダウンロードします（買い切り・応援）',
            },
            // ★ここがポイント：顧客が価格を決められる設定
            custom_unit_amount: {
              enabled: true,
              minimum: 500, // 最低価格 500円
              maximum: 50000,
              preset: 1000, // デフォルト 1000円
            },
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      // 決済成功時の戻り先URL
      success_url: `${req.headers.get('origin')}/dashboard?payment=success&quiz_id=${quizId}`,
      cancel_url: `${req.headers.get('origin')}/dashboard?payment=cancel`,
      // 誰が何を買ったかメタデータに記録
      metadata: {
        userId: userId,
        quizId: quizId,
      },
      customer_email: email, // 領収書送付先
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}