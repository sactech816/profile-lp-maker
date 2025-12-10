import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ADMIN_EMAIL } from '@/lib/constants';

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 });
    }

    // サービスロールクライアントを作成（管理者権限）
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // リクエストヘッダーからトークンを取得
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // トークンを検証してユーザー情報を取得
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // 管理者チェック
    if (user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // 全ユーザー情報を取得
    const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (usersError) {
      console.error('Users fetch error:', usersError);
      return NextResponse.json({ error: usersError.message }, { status: 500 });
    }

    // LPプロフィール数を集計
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('user_id, id');
    
    const profileCounts: Record<string, number> = {};
    if (profiles) {
      profiles.forEach(profile => {
        profileCounts[profile.user_id] = (profileCounts[profile.user_id] || 0) + 1;
      });
    }

    // 診断クイズ数を集計
    const { data: quizzes, error: quizzesError } = await supabaseAdmin
      .from('quizzes')
      .select('user_id, id');
    
    const quizCounts: Record<string, number> = {};
    if (quizzes) {
      quizzes.forEach(quiz => {
        quizCounts[quiz.user_id] = (quizCounts[quiz.user_id] || 0) + 1;
      });
    }

    // LPプロフィール購入履歴を集計
    const { data: profilePurchases, error: profilePurchasesError } = await supabaseAdmin
      .from('profile_purchases')
      .select('user_id, id');
    
    const profilePurchaseCounts: Record<string, number> = {};
    if (profilePurchases) {
      profilePurchases.forEach(purchase => {
        profilePurchaseCounts[purchase.user_id] = (profilePurchaseCounts[purchase.user_id] || 0) + 1;
      });
    }

    // 診断クイズ購入履歴を集計
    const { data: quizPurchases, error: quizPurchasesError } = await supabaseAdmin
      .from('purchases')
      .select('user_id, id');
    
    const quizPurchaseCounts: Record<string, number> = {};
    if (quizPurchases) {
      quizPurchases.forEach(purchase => {
        quizPurchaseCounts[purchase.user_id] = (quizPurchaseCounts[purchase.user_id] || 0) + 1;
      });
    }

    // CSVヘッダー
    const csvHeaders = [
      'ユーザーID',
      'メールアドレス',
      '登録日時',
      '最終ログイン日時',
      'メール確認日時',
      '診断クイズ作成数',
      '診断クイズ購入数',
      'LPプロフィール作成数',
      'LPプロフィール購入数'
    ];

    // CSVデータを生成
    const csvRows = users.map(user => {
      return [
        user.id,
        user.email || '',
        user.created_at ? new Date(user.created_at).toLocaleString('ja-JP') : '',
        user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('ja-JP') : '',
        user.confirmed_at ? new Date(user.confirmed_at).toLocaleString('ja-JP') : '',
        quizCounts[user.id] || 0,
        quizPurchaseCounts[user.id] || 0,
        profileCounts[user.id] || 0,
        profilePurchaseCounts[user.id] || 0
      ];
    });

    // CSV文字列を生成
    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // BOM付きUTF-8でエンコード（Excelで正しく開くため）
    const bom = '\uFEFF';
    const csvWithBom = bom + csvContent;

    // CSVファイルとして返す
    return new NextResponse(csvWithBom, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="users_${new Date().toISOString().split('T')[0]}.csv"`
      }
    });

  } catch (error: any) {
    console.error('Export CSV error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}



