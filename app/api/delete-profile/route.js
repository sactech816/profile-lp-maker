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
    console.log('[DELETE-PROFILE] リクエスト開始');
    
    const { id, anonymousId } = await req.json();
    console.log('[DELETE-PROFILE] リクエストデータ:', { id, anonymousId });
    
    if (!id) {
      console.log('[DELETE-PROFILE] エラー: IDがありません');
      return NextResponse.json({ error: 'プロフィールIDがありません' }, { status: 400 });
    }

    console.log('[DELETE-PROFILE] Supabaseクライアント取得中...');
    const supabaseAdmin = getSupabaseAdmin();
    console.log('[DELETE-PROFILE] Supabaseクライアント取得成功');
    
    // プロフィール情報を取得
    console.log('[DELETE-PROFILE] プロフィール情報取得中... ID:', id);
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, user_id')
      .eq('id', id)
      .single();

    console.log('[DELETE-PROFILE] プロフィール情報:', profile, 'エラー:', profileError);

    if (profileError || !profile) {
      console.log('[DELETE-PROFILE] エラー: プロフィールが見つかりません');
      return NextResponse.json({ error: 'プロフィールが見つかりませんでした' }, { status: 404 });
    }

    // 認証トークンをチェック
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    console.log('[DELETE-PROFILE] 認証トークン:', token ? 'あり' : 'なし');
    
    let user = null;
    let isAdmin = false;

    if (token) {
      // ログインユーザーの場合
      console.log('[DELETE-PROFILE] ユーザー情報取得中...');
      const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
      console.log('[DELETE-PROFILE] ユーザー情報:', userData?.user?.id, 'エラー:', userError);
      
      if (!userError && userData?.user) {
        user = userData.user;
        isAdmin = user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
      }
    }

    // 権限チェック
    const isOwner = user && profile.user_id === user.id;
    const isAnonymousOwner = !profile.user_id || (anonymousId && profile.user_id === anonymousId);

    console.log('[DELETE-PROFILE] 権限チェック:', {
      isOwner,
      isAnonymousOwner,
      isAdmin,
      profileUserId: profile.user_id,
      userId: user?.id,
      anonymousId
    });

    if (!isOwner && !isAdmin && !isAnonymousOwner) {
      console.log('[DELETE-PROFILE] エラー: 権限なし');
      return NextResponse.json({ error: '削除権限がありません' }, { status: 403 });
    }

    // 削除実行（外部キー制約のため、関連データを先に削除）
    console.log('[DELETE-PROFILE] 関連データ削除中...');
    
    // 1. analyticsテーブルから関連データを削除
    try {
      const { error: analyticsDeleteError } = await supabaseAdmin
        .from('analytics')
        .delete()
        .eq('profile_id', id);
      
      if (analyticsDeleteError) {
        console.log('[DELETE-PROFILE] アナリティクス削除エラー:', analyticsDeleteError.message);
        // analyticsテーブルが存在しない場合は無視
        if (!analyticsDeleteError.message.includes('does not exist') && 
            !analyticsDeleteError.message.includes('schema cache')) {
          throw analyticsDeleteError;
        }
      } else {
        console.log('[DELETE-PROFILE] アナリティクス削除成功');
      }
    } catch (e) {
      console.log('[DELETE-PROFILE] アナリティクス削除スキップ:', e.message);
    }
    
    // 2. profile_purchasesテーブルから関連データを削除（存在する場合）
    try {
      const { error: purchasesDeleteError } = await supabaseAdmin
        .from('profile_purchases')
        .delete()
        .eq('profile_id', id);
      
      if (purchasesDeleteError) {
        console.log('[DELETE-PROFILE] 購入履歴削除エラー:', purchasesDeleteError.message);
        // テーブルが存在しない場合は無視
        if (!purchasesDeleteError.message.includes('does not exist') && 
            !purchasesDeleteError.message.includes('schema cache')) {
          throw purchasesDeleteError;
        }
      } else {
        console.log('[DELETE-PROFILE] 購入履歴削除成功');
      }
    } catch (e) {
      console.log('[DELETE-PROFILE] 購入履歴削除スキップ:', e.message);
    }
    
    // 3. leadsテーブルから関連データを削除（存在する場合）
    try {
      const { error: leadsDeleteError } = await supabaseAdmin
        .from('leads')
        .delete()
        .eq('profile_id', id);
      
      if (leadsDeleteError) {
        console.log('[DELETE-PROFILE] リード削除エラー:', leadsDeleteError.message);
        // テーブルが存在しない場合は無視
        if (!leadsDeleteError.message.includes('does not exist') && 
            !leadsDeleteError.message.includes('schema cache')) {
          throw leadsDeleteError;
        }
      } else {
        console.log('[DELETE-PROFILE] リード削除成功');
      }
    } catch (e) {
      console.log('[DELETE-PROFILE] リード削除スキップ:', e.message);
    }
    
    // 4. プロフィール本体を削除
    console.log('[DELETE-PROFILE] プロフィール削除中...');
    const { error: deleteError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', id);
    
    if (deleteError) {
      console.log('[DELETE-PROFILE] プロフィール削除エラー:', deleteError);
      throw deleteError;
    }

    console.log('[DELETE-PROFILE] 削除成功（すべて完了）');
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE-PROFILE] キャッチされたエラー:', err);
    
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
