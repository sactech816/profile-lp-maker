'use server';

import { supabase } from '@/lib/supabase';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { Block, ProfileSettings } from '@/lib/types';
import { generateSlug } from '@/lib/utils';

// ビジネスプロジェクトのアナリティクスを保存
export async function saveBusinessAnalytics(
  projectId: string, 
  eventType: 'view' | 'click' | 'scroll' | 'time' | 'read', 
  eventData?: { 
    url?: string; 
    scrollDepth?: number; 
    timeSpent?: number; 
    readPercentage?: number;
  }
) {
  if (!supabase) {
    console.error('[Business Analytics] Supabase not available');
    return { error: 'Database not available' };
  }

  // UUIDの形式チェック
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(projectId)) {
    console.error('[Business Analytics] Invalid UUID format:', projectId);
    return { error: 'Invalid project ID format' };
  }

  try {
    console.log('[Business Analytics] Saving:', { projectId, eventType, eventData });
    
    const insertData = {
      profile_id: projectId, // カラム名はprofile_idだが、ビジネスプロジェクトIDを格納
      event_type: eventType,
      event_data: eventData || {},
      content_type: 'business', // ビジネスLPのアナリティクスとして記録
      created_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('analytics')
      .insert([insertData])
      .select();

    if (error) {
      console.error('[Business Analytics] Save error:', error);
      return { error: error.message };
    }

    console.log('[Business Analytics] Saved successfully:', data);
    return { success: true, data };
  } catch (error: any) {
    console.error('[Business Analytics] Exception:', error);
    return { error: error.message };
  }
}

// ビジネスプロジェクトのアナリティクスを取得
export async function getBusinessAnalytics(projectId: string) {
  if (!supabase) {
    console.error('[Business Analytics] Supabase not available');
    return { views: 0, clicks: 0, avgScrollDepth: 0, avgTimeSpent: 0, readRate: 0, clickRate: 0 };
  }

  try {
    console.log('[Business Analytics] Fetching for project:', projectId);
    
    // ビジネスLPのアナリティクスのみを取得
    const { data: allEvents, error } = await supabase
      .from('analytics')
      .select('*')
      .eq('profile_id', projectId) // カラム名はprofile_idだが、ビジネスプロジェクトIDで検索
      .eq('content_type', 'business'); // ビジネスLPのデータのみ取得

    if (error) {
      console.error('[Business Analytics] Fetch error:', error);
      return { views: 0, clicks: 0, avgScrollDepth: 0, avgTimeSpent: 0, readRate: 0, clickRate: 0 };
    }

    const views = allEvents?.filter(e => e.event_type === 'view') || [];
    const clicks = allEvents?.filter(e => e.event_type === 'click') || [];
    const scrolls = allEvents?.filter(e => e.event_type === 'scroll') || [];
    const times = allEvents?.filter(e => e.event_type === 'time') || [];
    const reads = allEvents?.filter(e => e.event_type === 'read') || [];

    // 平均スクロール深度を計算
    const scrollDepths = scrolls
      .map(e => e.event_data?.scrollDepth || 0)
      .filter(d => d > 0);
    const avgScrollDepth = scrollDepths.length > 0
      ? Math.round(scrollDepths.reduce((a, b) => a + b, 0) / scrollDepths.length)
      : 0;

    // 平均滞在時間を計算（秒）
    const timeSpents = times
      .map(e => e.event_data?.timeSpent || 0)
      .filter(t => t > 0);
    const avgTimeSpent = timeSpents.length > 0
      ? Math.round(timeSpents.reduce((a, b) => a + b, 0) / timeSpents.length)
      : 0;

    // 精読率を計算
    const readPercentages = reads
      .map(e => e.event_data?.readPercentage || 0)
      .filter(r => r > 0);
    const readCount = readPercentages.filter(r => r >= 50).length;
    const readRate = views.length > 0 ? Math.round((readCount / views.length) * 100) : 0;

    // クリック率を計算
    const clickRate = views.length > 0 ? Math.round((clicks.length / views.length) * 100) : 0;

    const result = {
      views: views.length,
      clicks: clicks.length,
      avgScrollDepth,
      avgTimeSpent,
      readRate,
      clickRate
    };

    console.log('[Business Analytics] Calculated result:', result);
    return result;
  } catch (error: any) {
    console.error('[Business Analytics] Fetch exception:', error);
    return { views: 0, clicks: 0, avgScrollDepth: 0, avgTimeSpent: 0, readRate: 0, clickRate: 0 };
  }
}

// ビジネスプロジェクトを保存
export async function saveBusinessProject({
  slug,
  nickname,
  content,
  settings,
  userId,
  featuredOnTop
}: {
  slug: string;
  nickname: string | null;
  content: Block[];
  settings: ProfileSettings;
  userId: string | null;
  featuredOnTop: boolean;
}) {
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/0315c81c-6cd6-42a2-8f4a-ffa0f6597758',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'business.ts:130',message:'saveBusinessProject ENTRY',data:{slug,nickname,userId,hasSupabase:!!supabase},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  
  // Server Actions用のSupabaseクライアントを作成（クッキーから認証情報を読み取る）
  const serverSupabase = await createServerSupabaseClient();
  
  if (!serverSupabase) {
    return { error: 'Database not available' };
  }

  try {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/0315c81c-6cd6-42a2-8f4a-ffa0f6597758',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'business.ts:140',message:'Checking auth session with SERVER client',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    
    // 認証セッションを確認（Server用クライアントで）
    const { data: { session }, error: sessionError } = await serverSupabase.auth.getSession();
    
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/0315c81c-6cd6-42a2-8f4a-ffa0f6597758',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'business.ts:145',message:'Auth session result with SERVER client',data:{hasSession:!!session,sessionUserId:session?.user?.id,passedUserId:userId,sessionError:sessionError?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'C,D'})}).catch(()=>{});
    // #endregion
    
    console.log('[BusinessProject] Saving:', { slug, nickname, userId });

    // 既存プロジェクトを確認（Server用クライアントで）
    const { data: existingProject } = await serverSupabase
      .from('business_projects')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    const projectData = {
      slug,
      nickname: nickname || null,
      content,
      settings,
      user_id: userId,
      featured_on_top: featuredOnTop,
      updated_at: new Date().toISOString()
    };

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/0315c81c-6cd6-42a2-8f4a-ffa0f6597758',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'business.ts:165',message:'BEFORE save operation',data:{hasExisting:!!existingProject,projectData:{slug:projectData.slug,user_id:projectData.user_id,nickname:projectData.nickname}},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B,D'})}).catch(()=>{});
    // #endregion

    let result;

    if (existingProject) {
      // 更新（Server用クライアントで）
      result = await serverSupabase
        .from('business_projects')
        .update(projectData)
        .eq('id', existingProject.id)
        .select()
        .single();
    } else {
      // 新規作成（Server用クライアントで）
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/0315c81c-6cd6-42a2-8f4a-ffa0f6597758',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'business.ts:180',message:'Attempting INSERT with SERVER client',data:{insertData:{slug:projectData.slug,user_id:projectData.user_id}},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      
      result = await serverSupabase
        .from('business_projects')
        .insert([{ ...projectData, created_at: new Date().toISOString() }])
        .select()
        .single();
    }

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/0315c81c-6cd6-42a2-8f4a-ffa0f6597758',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'business.ts:190',message:'AFTER save operation with SERVER client',data:{hasError:!!result.error,errorMsg:result.error?.message,errorCode:result.error?.code,hasData:!!result.data},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'B,E'})}).catch(()=>{});
    // #endregion

    if (result.error) {
      console.error('[BusinessProject] Save error:', result.error);
      return { error: result.error.message };
    }

    console.log('[BusinessProject] Saved successfully:', result.data);
    return { data: result.data };
  } catch (error: any) {
    console.error('[BusinessProject] Exception:', error);
    return { error: error.message };
  }
}
