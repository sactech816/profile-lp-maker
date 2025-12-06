import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Stripeインスタンスを遅延初期化（ビルド時エラーを防ぐ）
function getStripe() {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) {
    throw new Error("❌ Stripe API Key is missing!");
  }
  return new Stripe(apiKey);
}

// Supabase Adminインスタンスを遅延初期化（ビルド時エラーを防ぐ）
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("❌ Supabase credentials are missing!");
  }
  
  return createClient(supabaseUrl, serviceRoleKey);
}

export async function POST(req) {
  try {
    const { sessionId, profileId, userId } = await req.json();

    // 1. Stripeに問い合わせて、本当に支払い済みか確認
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Not paid' }, { status: 400 });
    }

    // 2. Supabaseに購入履歴を記録（管理者権限で実行）
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin.from('profile_purchases').insert([
      {
        user_id: userId,
        profile_id: profileId,
        stripe_session_id: sessionId,
        amount: session.amount_total
      }
    ]);

    if (error) {
        console.error("Supabase Insert Error:", error);
        throw error;
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Verify API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

