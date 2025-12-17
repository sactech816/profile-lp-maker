import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(request) {
  try {
    const { sessionId, projectId, userId } = await request.json();

    if (!sessionId || !projectId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Stripeセッションを取得
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    // Supabaseクライアントを作成（サービスロールキー使用）
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // 購入履歴をチェック（重複防止）
    const { data: existingPurchase } = await supabase
      .from('business_project_purchases')
      .select('id')
      .eq('stripe_session_id', sessionId)
      .single();

    if (existingPurchase) {
      console.log('Purchase already recorded:', sessionId);
      return NextResponse.json({ 
        success: true, 
        message: 'Purchase already recorded',
        purchase: existingPurchase 
      });
    }

    // 購入履歴を記録
    const { data: purchase, error: insertError } = await supabase
      .from('business_project_purchases')
      .insert([
        {
          user_id: userId,
          project_id: projectId,
          stripe_session_id: sessionId,
          amount: session.amount_total,
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to record purchase' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, purchase });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
