import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ADMIN_EMAIL } from '@/lib/constants';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSupabaseAdmin() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabaseの認証情報が不足しています');
  }
  return createClient(supabaseUrl, serviceRoleKey);
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
    return NextResponse.json(
      { error: err.message || '削除に失敗しました' },
      { status: 500 }
    );
  }
}
