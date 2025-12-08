import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profileId, eventType, eventData } = body;

    if (!profileId || !eventType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // UUIDの形式チェック
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(profileId)) {
      console.error('[Analytics API] Invalid UUID format:', profileId);
      return NextResponse.json(
        { error: 'Invalid profile ID format' },
        { status: 400 }
      );
    }

    if (!supabase) {
      console.warn('[Analytics API] Supabase not available for analytics');
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      );
    }

    console.log('[Analytics API] Saving:', { profileId, eventType, eventData });

    const { data, error } = await supabase
      .from('analytics')
      .insert([
        {
          profile_id: profileId,
          event_type: eventType,
          event_data: eventData || {},
          content_type: 'profile',
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      console.error('[Analytics API] Save error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    console.log('[Analytics API] Saved successfully:', data);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('[Analytics API] Exception:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
