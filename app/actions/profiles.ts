'use server';

import { supabase } from '@/lib/supabase';
import { Block } from '@/lib/types';

export async function saveProfile(data: {
  slug: string;
  content: Block[];
  settings: any;
  userId: string | null;
  featuredOnTop?: boolean;
}) {
  if (!supabase) {
    return { error: 'データベースに接続されていません' };
  }

  try {
    const { data: result, error } = await supabase
      .from('profiles')
      .upsert({
        slug: data.slug,
        content: data.content,
        settings: data.settings,
        user_id: data.userId,
        featured_on_top: data.featuredOnTop ?? true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'slug'
      })
      .select()
      .single();

    if (error) {
      console.error('Profile save error:', error);
      return { error: error.message };
    }

    return { success: true, data: result };
  } catch (error: any) {
    console.error('Profile save error:', error);
    return { error: error.message };
  }
}
