import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ADMIN_EMAIL } from '@/lib/constants';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function getSupabaseAdmin() {
  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URLが設定されていません。.env.localファイルを確認してください。');
  }
  
  // サービスロールキーがある場合は管理者クライアントを使用
  if (serviceRoleKey) {
    return createClient(supabaseUrl, serviceRoleKey);
  }
  
  // ない場合は匿名キーを使用（RLS有効）
  if (!anonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEYが設定されていません。.env.localファイルを確認してください。');
  }
  
  return createClient(supabaseUrl, anonKey);
}

export async function POST(req) {
  try {
    const { id, anonymousId } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'プロフィールIDがありません' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    
    // プロフィール情報を取得
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'プロフィールが見つかりませんでした' }, { status: 404 });
    }

    // 認証トークンをチェック
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    let user = null;
    let isAdmin = false;

    if (token) {
      // ログインユーザーの場合
      const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
      if (!userError && userData?.user) {
        user = userData.user;
        isAdmin = user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
      }
    }

    // 権限チェック
    const isOwner = user && profile.user_id === user.id;
    const isAnonymousOwner = !profile.user_id || (anonymousId && profile.user_id === anonymousId);

    if (!isOwner && !isAdmin && !isAnonymousOwner) {
      return NextResponse.json({ error: '削除権限がありません' }, { status: 403 });
    }

    // 削除実行
    const { error: deleteError } = await supabaseAdmin.from('profiles').delete().eq('id', id);
    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('delete-profile error:', err);
    
    // エラーメッセージをより詳細に
    let errorMessage = err.message || '削除に失敗しました';
    if (errorMessage.includes('SUPABASE')) {
      errorMessage = '環境変数が正しく設定されていません。管理者にお問い合わせください。\n' + errorMessage;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
