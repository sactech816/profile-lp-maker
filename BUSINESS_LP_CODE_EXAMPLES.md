# ビジネスLPメーカー コード例集

## 📋 目次

1. [Server Actions](#server-actions)
2. [API Routes](#api-routes)
3. [トラッキングコンポーネント](#トラッキングコンポーネント)
4. [ページコンポーネント](#ページコンポーネント)
5. [データベースクエリ](#データベースクエリ)
6. [検索パターン集](#検索パターン集)

---

## Server Actions

### business.ts（新規作成）

**場所**: `app/actions/business.ts`

```typescript
'use server';

import { supabase } from '@/lib/supabase';
import { Block } from '@/lib/types';

/**
 * ビジネスプロジェクトを保存
 */
export async function saveBusinessProject(data: {
  slug: string;
  nickname?: string | null;
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
      .from('business_projects')  // ← テーブル名
      .upsert({
        slug: data.slug,
        nickname: data.nickname || null,
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
      console.error('Business project save error:', error);
      return { error: error.message };
    }

    return { success: true, data: result };
  } catch (error: any) {
    console.error('Business project save error:', error);
    return { error: error.message };
  }
}

/**
 * ビジネスプロジェクトを取得
 */
export async function getBusinessProject(slug: string) {
  if (!supabase) {
    return { error: 'データベースに接続されていません' };
  }

  try {
    const { data, error } = await supabase
      .from('business_projects')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Business project fetch error:', error);
      return { error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Business project fetch error:', error);
    return { error: error.message };
  }
}

/**
 * ユーザーのビジネスプロジェクト一覧を取得
 */
export async function getUserBusinessProjects(userId: string) {
  if (!supabase) {
    return { error: 'データベースに接続されていません' };
  }

  try {
    const { data, error } = await supabase
      .from('business_projects')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Business projects fetch error:', error);
      return { error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Business projects fetch error:', error);
    return { error: error.message };
  }
}

/**
 * ビジネスプロジェクトを削除
 */
export async function deleteBusinessProject(id: number, userId: string) {
  if (!supabase) {
    return { error: 'データベースに接続されていません' };
  }

  try {
    const { error } = await supabase
      .from('business_projects')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Business project delete error:', error);
      return { error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Business project delete error:', error);
    return { error: error.message };
  }
}
```

### analytics.ts（拡張）

**場所**: `app/actions/analytics.ts`（既存ファイルに追加）

```typescript
/**
 * ビジネスLPのアナリティクスを取得
 */
export async function getBusinessAnalytics(projectId: string) {
  if (!supabase) {
    console.error('[Analytics] Supabase not available for analytics');
    return { views: 0, clicks: 0, avgScrollDepth: 0, avgTimeSpent: 0, readRate: 0, clickRate: 0 };
  }

  try {
    console.log('[Analytics] Fetching for business project:', projectId);
    
    // ビジネスLPのアナリティクスのみを取得
    const { data: allEvents, error } = await supabase
      .from('analytics')
      .select('*')
      .eq('profile_id', projectId)
      .eq('content_type', 'business'); // ← ビジネスLPのデータのみ取得

    if (error) {
      console.error('[Analytics] Fetch error:', error);
      return { views: 0, clicks: 0, avgScrollDepth: 0, avgTimeSpent: 0, readRate: 0, clickRate: 0 };
    }

    console.log('[Analytics] Fetched events:', allEvents?.length || 0);

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

    console.log('[Analytics] Calculated result:', result);
    return result;
  } catch (error: any) {
    console.error('[Analytics] Fetch exception:', error);
    return { views: 0, clicks: 0, avgScrollDepth: 0, avgTimeSpent: 0, readRate: 0, clickRate: 0 };
  }
}
```

---

## API Routes

### business-checkout/route.js

**場所**: `app/api/business-checkout/route.js`

```javascript
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const apiKey = process.env.STRIPE_SECRET_KEY;
if (!apiKey) {
  console.error("❌ Stripe API Key is missing!");
}

const stripe = new Stripe(apiKey || '');

export async function POST(req) {
  try {
    const { projectId, projectName, userId, email, price } = await req.json();
    
    // 価格チェック
    let finalPrice = parseInt(price);
    if (isNaN(finalPrice) || finalPrice < 500 || finalPrice > 100000) {
      finalPrice = 1000;
    }

    // オリジンを取得
    let origin = req.headers.get('origin');
    if (!origin) {
      origin = req.headers.get('referer');
      if (origin) {
        origin = new URL(origin).origin;
      }
    }
    if (!origin || origin === 'null') {
      origin = process.env.NEXT_PUBLIC_SITE_URL || 'https://business-lp.makers.tokyo';
    }

    console.log(`🚀 Starting Business Checkout: ${projectName} / ${finalPrice}JPY / User:${userId}`);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'jpy',
            product_data: {
              name: `HTMLデータ提供: ${projectName}`,
              description: 'このビジネスLPのHTMLデータをダウンロードします（寄付・応援）',
            },
            unit_amount: finalPrice,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/?payment=success&session_id={CHECKOUT_SESSION_ID}&project_id=${projectId}&page=business-dashboard`,
      cancel_url: `${origin}/?payment=cancel&page=business-dashboard`,
      metadata: {
        userId: userId,
        projectId: projectId,
      },
      customer_email: email,
    });

    return NextResponse.json({ url: session.url });

  } catch (err) {
    console.error("🔥 Stripe Checkout Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```

### business-verify/route.js

**場所**: `app/api/business-verify/route.js`

```javascript
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(req) {
  try {
    const { sessionId, projectId, userId } = await req.json();

    console.log('🔍 Verifying payment:', { sessionId, projectId, userId });

    // Stripeセッションを取得
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: '決済が完了していません' }, { status: 400 });
    }

    console.log('✅ Payment verified:', session.payment_status);

    // 購入履歴を記録
    const { data, error } = await supabase
      .from('business_project_purchases')
      .insert([{
        user_id: userId,
        project_id: projectId,
        stripe_session_id: sessionId,
        amount: session.amount_total,
      }])
      .select()
      .single();

    if (error) {
      // 重複エラーの場合は既存データを返す
      if (error.code === '23505') {
        console.log('⚠️ Purchase already recorded');
        const { data: existing } = await supabase
          .from('business_project_purchases')
          .select('*')
          .eq('stripe_session_id', sessionId)
          .single();
        
        return NextResponse.json({ success: true, purchase: existing, alreadyProcessed: true });
      }
      throw error;
    }

    console.log('💾 Purchase recorded:', data);

    return NextResponse.json({ success: true, purchase: data });

  } catch (err) {
    console.error('🔥 Verify Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```

### business-delete/route.js

**場所**: `app/api/business-delete/route.js`

```javascript
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(req) {
  try {
    const { id, userId } = await req.json();

    console.log('🗑️ Deleting business project:', { id, userId });

    // ユーザーの所有権を確認
    const { data: project, error: fetchError } = await supabase
      .from('business_projects')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError || !project) {
      return NextResponse.json({ error: '削除権限がありません' }, { status: 403 });
    }

    // プロジェクトを削除
    const { error: deleteError } = await supabase
      .from('business_projects')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (deleteError) {
      throw deleteError;
    }

    console.log('✅ Business project deleted');

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error('🔥 Delete Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```

---

## トラッキングコンポーネント

### BusinessViewTracker.tsx

**場所**: `components/BusinessViewTracker.tsx`

```typescript
'use client';

import { useEffect, useRef } from 'react';
import { saveAnalytics } from '@/app/actions/analytics';

export function BusinessViewTracker({ 
  projectId, 
  contentType = 'business'
}: { 
  projectId: string;
  contentType?: 'business';
}) {
  const startTimeRef = useRef<number>(Date.now());
  const maxScrollRef = useRef<number>(0);
  const scrollTrackedRef = useRef<Set<number>>(new Set());
  const readTrackedRef = useRef<boolean>(false);
  const viewTrackedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!projectId) {
      console.warn('[BusinessViewTracker] No projectId provided');
      return;
    }

    // デモページの場合はトラッキングしない
    if (projectId === 'demo') {
      console.log('[BusinessViewTracker] Skipping demo project');
      return;
    }

    console.log('[BusinessViewTracker] Initializing for project:', projectId);

    // ページビューを記録（初回のみ）
    if (!viewTrackedRef.current) {
      viewTrackedRef.current = true;
      saveAnalytics(projectId, 'view', undefined, contentType).then((result) => {
        console.log('[BusinessViewTracker] View tracked:', result);
      });
    }

    // スクロール深度を追跡
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollDepth = scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0;
      
      maxScrollRef.current = Math.max(maxScrollRef.current, scrollDepth);

      // 25%, 50%, 75%, 100%のマイルストーンを記録
      [25, 50, 75, 100].forEach(milestone => {
        if (scrollDepth >= milestone && !scrollTrackedRef.current.has(milestone)) {
          scrollTrackedRef.current.add(milestone);
          saveAnalytics(projectId, 'scroll', { scrollDepth: milestone }, contentType);
        }
      });
    };

    // 精読率を計算
    const checkReadRate = () => {
      if (!readTrackedRef.current && maxScrollRef.current >= 50) {
        readTrackedRef.current = true;
        saveAnalytics(projectId, 'read', { readPercentage: maxScrollRef.current }, contentType);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    const scrollInterval = setInterval(() => {
      handleScroll();
      checkReadRate();
    }, 1000);

    // ページ離脱時に滞在時間を記録
    const handleBeforeUnload = () => {
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
      if (timeSpent > 0) {
        const blob = new Blob(
          [JSON.stringify({ profileId: projectId, eventType: 'time', eventData: { timeSpent } })],
          { type: 'application/json' }
        );
        navigator.sendBeacon('/api/analytics', blob);
      }
    };

    // 定期的に滞在時間を記録（30秒ごと）
    const timeInterval = setInterval(() => {
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
      if (timeSpent >= 30) {
        saveAnalytics(projectId, 'time', { timeSpent }, contentType);
      }
    }, 30000);

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
      clearInterval(scrollInterval);
      clearInterval(timeInterval);
      
      // クリーンアップ時に最終データを記録
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
      if (timeSpent > 3) {
        saveAnalytics(projectId, 'time', { timeSpent }, contentType);
      }
    };
  }, [projectId, contentType]);

  return null;
}
```

---

## ページコンポーネント

### 公開ページ

**場所**: `app/b/[slug]/page.tsx`

```typescript
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { BusinessViewTracker } from '@/components/BusinessViewTracker';
import { BlockRenderer } from '@/components/BlockRenderer';

export default async function BusinessPage({ params }: { params: { slug: string } }) {
  const { slug } = params;

  // ビジネスプロジェクトを取得
  const { data: project, error } = await supabase
    .from('business_projects')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !project) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* トラッキング */}
      <BusinessViewTracker projectId={project.id} contentType="business" />

      {/* コンテンツ */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {project.content.map((block: any) => (
          <BlockRenderer key={block.id} block={block} projectId={project.id} />
        ))}
      </div>
    </div>
  );
}
```

### ダッシュボードページ

**場所**: `app/business/dashboard/page.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getUserBusinessProjects } from '@/app/actions/business';
import { getBusinessAnalytics } from '@/app/actions/analytics';

export default function BusinessDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ユーザー情報を取得
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/');
        return;
      }
      setUser(user);

      // プロジェクト一覧を取得
      const result = await getUserBusinessProjects(user.id);
      if (result.success && result.data) {
        setProjects(result.data);
      }
      setLoading(false);
    };

    fetchUser();
  }, [router]);

  const handleCreate = () => {
    router.push('/business/dashboard/editor/new');
  };

  const handleEdit = (slug: string) => {
    router.push(`/business/dashboard/editor/${slug}`);
  };

  const handleView = (slug: string) => {
    window.open(`/b/${slug}`, '_blank');
  };

  if (loading) {
    return <div>読み込み中...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">ビジネスLP ダッシュボード</h1>
          <button
            onClick={handleCreate}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
          >
            新規作成
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div key={project.id} className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-2">{project.nickname || project.slug}</h2>
              <p className="text-gray-600 mb-4">更新日: {new Date(project.updated_at).toLocaleDateString()}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(project.slug)}
                  className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
                >
                  編集
                </button>
                <button
                  onClick={() => handleView(project.slug)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                >
                  表示
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## データベースクエリ

### ビジネスプロジェクトの取得

```typescript
// 単一プロジェクトを取得
const { data, error } = await supabase
  .from('business_projects')
  .select('*')
  .eq('slug', slug)
  .single();

// ユーザーのプロジェクト一覧を取得
const { data, error } = await supabase
  .from('business_projects')
  .select('*')
  .eq('user_id', userId)
  .order('updated_at', { ascending: false });

// トップページ掲載プロジェクトを取得
const { data, error } = await supabase
  .from('business_projects')
  .select('*')
  .eq('featured_on_top', true)
  .order('updated_at', { ascending: false })
  .limit(10);
```

### 購入履歴の取得

```typescript
// ユーザーの購入履歴を取得
const { data, error } = await supabase
  .from('business_project_purchases')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false });

// プロジェクトの購入状況を確認
const { data, error } = await supabase
  .from('business_project_purchases')
  .select('*')
  .eq('user_id', userId)
  .eq('project_id', projectId)
  .single();
```

### アナリティクスの取得

```typescript
// ビジネスLPのアナリティクスを取得
const { data, error } = await supabase
  .from('analytics')
  .select('*')
  .eq('profile_id', projectId)
  .eq('content_type', 'business')  // ← 重要
  .order('created_at', { ascending: false });

// 特定期間のアナリティクスを取得
const { data, error } = await supabase
  .from('analytics')
  .select('*')
  .eq('profile_id', projectId)
  .eq('content_type', 'business')
  .gte('created_at', startDate)
  .lte('created_at', endDate);
```

---

## 検索パターン集

### プロフィールLP特有の文字列を検索

```bash
# URL・パスの検索
grep -rn "/p/" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" app/ components/
grep -rn "/dashboard" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" app/ components/
grep -rn "page=dashboard" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" app/

# テーブル名の検索
grep -rn "\.from('profiles')" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" app/
grep -rn "profile_purchases" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" app/

# 変数名の検索
grep -rn "profileId" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" app/ components/
grep -rn "profile_id" --include="*.ts" --include="*.tsx" app/

# content_type の検索
grep -rn "saveAnalytics" --include="*.ts" --include="*.tsx" app/ components/
grep -rn "content_type.*profile" --include="*.ts" --include="*.tsx" app/

# API エンドポイントの検索
grep -rn "/api/checkout-profile" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" app/ components/
grep -rn "/api/verify-profile" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" app/ components/
grep -rn "/api/delete-profile" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" app/ components/
grep -rn "/api/generate-profile" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" app/ components/
```

### ビジネスLP特有の文字列を検索

```bash
# ビジネスLP用のパスを検索
grep -rn "/b/" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" app/b/ app/business/
grep -rn "/business/dashboard" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" app/business/
grep -rn "page=business-dashboard" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" app/

# ビジネスLP用のテーブルを検索
grep -rn "business_projects" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" app/
grep -rn "business_project_purchases" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" app/

# ビジネスLP用のcontent_typeを検索
grep -rn "content_type.*business" --include="*.ts" --include="*.tsx" app/

# ビジネスLP用のAPIを検索
grep -rn "/api/business-" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" app/
```

### 混在している可能性がある箇所を検索

```bash
# プロフィールLPとビジネスLPが混在している可能性
grep -rn "profiles\|business_projects" --include="*.ts" --include="*.tsx" app/business/
grep -rn "profile_purchases\|business_project_purchases" --include="*.ts" --include="*.tsx" app/business/

# content_typeの設定漏れを検索
grep -rn "saveAnalytics.*undefined.*undefined" --include="*.ts" --include="*.tsx" app/business/
```

---

## まとめ

このドキュメントには、ビジネスLPメーカーを実装する際に必要な主要なコード例が含まれています。

### 重要なポイント

1. **テーブル名**: `profiles` → `business_projects`
2. **content_type**: 必ず `'business'` を設定
3. **URL**: `/p/` → `/b/`, `/dashboard` → `/business/dashboard`
4. **API**: `/api/checkout-profile` → `/api/business-checkout`

### 次のステップ

1. [BUSINESS_LP_INTEGRATION_GUIDE.md](BUSINESS_LP_INTEGRATION_GUIDE.md) で全体像を理解
2. [BUSINESS_LP_URL_CHECKLIST.md](BUSINESS_LP_URL_CHECKLIST.md) でURLを検証
3. このドキュメントのコード例を参考に実装

---

**最終更新日**: 2024年12月18日

**バージョン**: 1.0.0

