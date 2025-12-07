import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase Adminクライアント（サービスロールキーでRLSをバイパス）
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabaseのサービスロールキーが設定されていません。');
  }

  return createClient(supabaseUrl, serviceRoleKey);
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const folder = (formData.get('folder') || 'public').toString();
    const fileName = (formData.get('fileName') || `${Date.now()}.png`).toString();

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'ファイルがありません' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const filePath = `${folder}/${fileName}`;

    const { error } = await supabaseAdmin.storage
      .from('profile-uploads')
      .upload(filePath, file, { upsert: true, contentType: file.type });

    if (error) {
      throw error;
    }

    const { data } = supabaseAdmin.storage.from('profile-uploads').getPublicUrl(filePath);

    return NextResponse.json({ path: filePath, publicUrl: data.publicUrl });
  } catch (err) {
    console.error('Upload API Error:', err);
    const message = err?.message || 'アップロードに失敗しました';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

