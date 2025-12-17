import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const { projectId, projectName, userId, email, price } = await request.json();

    if (!projectId || !projectName || !userId || !email || !price) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 金額のバリデーション
    if (price < 500 || price > 100000) {
      return NextResponse.json(
        { error: 'Price must be between 500 and 100,000 yen' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    // Stripe Checkout Sessionを作成
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'jpy',
            product_data: {
              name: `ビジネスLP Pro機能開放: ${projectName}`,
              description: 'HTMLダウンロード・埋め込みコード機能が利用可能になります',
            },
            unit_amount: price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/business/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}&project_id=${projectId}`,
      cancel_url: `${baseUrl}/business/dashboard?payment=cancel`,
      customer_email: email,
      metadata: {
        projectId,
        userId,
        projectName,
      },
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
