# 決済システム移植ガイド
## プロフィールLP向け Stripe決済システム実装手順

このガイドは、診断クイズメーカーで実装した決済システムを、プロフィールLPに移植するための手順書です。

---

## 📋 前提条件

- 同じSupabaseプロジェクトを使用
- Next.js (App Router) を使用
- Stripe アカウントを持っている
- 購入対象が「プロフィールLP」または「コンテンツ」である

---

## 🗂️ 必要なファイル一覧

### 1. APIルート（必須）

#### `app/api/checkout/route.js`
```javascript
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const { itemId, itemTitle, userId, email, price } = await req.json();
    
    // 価格チェック（10円〜100,000円）
    let finalPrice = parseInt(price);
    if (isNaN(finalPrice) || finalPrice < 10 || finalPrice > 100000) {
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
        origin = 'https://your-domain.com'; // ★ご自身のURLに変更
    }

    console.log(`🚀 Starting Checkout: ${itemTitle} / ${finalPrice}JPY / User:${userId}`);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'jpy',
            product_data: {
              name: itemTitle, // ★商品名をカスタマイズ
              description: '購入説明文', // ★説明をカスタマイズ
            },
            unit_amount: finalPrice, 
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/?payment=success&session_id={CHECKOUT_SESSION_ID}&item_id=${itemId}&redirect=dashboard`,
      cancel_url: `${origin}/?payment=cancel&redirect=dashboard`,
      metadata: {
        userId: userId,
        itemId: itemId, // ★プロフィールLPのIDなど
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

#### `app/api/verify/route.js`
```javascript
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// 管理者権限でSupabaseを操作
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { sessionId, itemId, userId } = await req.json();
    console.log('🔍 決済検証リクエスト:', { sessionId, itemId, userId });

    // 1. Stripeに問い合わせて、本当に支払い済みか確認
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log('💳 Stripe決済ステータス:', session.payment_status);
    
    if (session.payment_status !== 'paid') {
      console.error('❌ 決済未完了:', session.payment_status);
      return NextResponse.json({ error: 'Payment not completed', status: session.payment_status }, { status: 400 });
    }

    // 2. 既に記録済みかチェック（重複防止）
    const { data: existing } = await supabaseAdmin
      .from('purchases')
      .select('id')
      .eq('stripe_session_id', sessionId)
      .single();

    if (existing) {
      console.log('ℹ️ 既に記録済みの決済:', sessionId);
      return NextResponse.json({ success: true, message: 'Already recorded' });
    }

    // 3. Supabaseに購入履歴を記録
    const purchaseData = {
        user_id: userId,
        item_id: parseInt(itemId), // ★プロフィールLPのIDなど
        stripe_session_id: sessionId,
        amount: session.amount_total
    };
    
    console.log('📝 購入履歴を挿入:', purchaseData);
    
    const { data, error } = await supabaseAdmin.from('purchases').insert([purchaseData]).select();

    if (error) {
        console.error("❌ Supabase挿入エラー:", error);
        throw error;
    }

    console.log('✅ 購入履歴を記録完了:', data);
    
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("❌ Verify API エラー:", err);
    return NextResponse.json({ error: err.message, details: err }, { status: 500 });
  }
}
```

---

### 2. Supabaseクライアント設定

#### `lib/supabase.js`
```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      }
    }) 
  : null;
```

---

### 3. フロントエンド実装例

#### 決済開始関数
```javascript
const handlePurchase = async (item) => {
    const inputPrice = window.prompt(
        `「${item.title}」を購入します。\n\n金額を入力してください（10円〜100,000円）。`, 
        "1000"
    );
    if (inputPrice === null) return;
    
    const price = parseInt(inputPrice, 10);
    if (isNaN(price) || price < 10 || price > 100000) {
        alert("金額は 10円以上、100,000円以下 の半角数字で入力してください。");
        return;
    }

    try {
        const res = await fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                itemId: item.id,
                itemTitle: item.title,
                userId: user.id,
                email: user.email,
                price: price 
            }),
        });
        const data = await res.json();
        if (data.url) {
            window.location.href = data.url;
        } else {
            throw new Error('決済URLの取得に失敗しました');
        }
    } catch (e) {
        alert('エラー: ' + e.message);
    }
};
```

#### 決済検証関数
```javascript
const verifyPayment = async (sessionId, itemId) => {
    try {
        console.log('🔍 決済検証開始:', { sessionId, itemId, userId: user.id });
        
        // 決済検証APIを呼び出し
        const res = await fetch('/api/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, itemId, userId: user.id }),
        });
        
        const data = await res.json();
        console.log('✅ 決済検証レスポンス:', data);
        
        if (res.ok) {
            console.log('✅ 決済検証成功！購入履歴を更新します...');
            
            // URLパラメータをクリア
            window.history.replaceState(null, '', window.location.pathname);
            console.log('🧹 URLパラメータをクリアしました');
            
            // 少し待ってから購入履歴を再取得
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 購入履歴を再取得
            const { data: bought, error } = await supabase
                .from('purchases')
                .select('item_id, id, created_at, stripe_session_id')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });
                
            if (error) {
                console.error('❌ 購入履歴の取得エラー:', error);
                alert('決済は完了しましたが、購入履歴の取得に失敗しました。ページを再読み込みしてください。');
            } else {
                console.log('📋 購入履歴を更新:', bought);
                const purchasedIds = bought?.map(p => p.item_id) || [];
                setPurchases(purchasedIds);
                
                alert('購入ありがとうございます！機能が開放されました。');
                window.location.href = '/dashboard';
            }
        } else {
            console.error('❌ 決済検証失敗:', data);
            alert('決済の確認に失敗しました: ' + (data.error || '不明なエラー'));
        }
    } catch (e) {
        console.error('❌ 決済検証エラー:', e);
        alert('エラーが発生しました: ' + e.message);
    }
};
```

#### 初期化処理（useEffect内）
```javascript
useEffect(() => {
    const init = async () => {
        // URLパラメータをチェック
        const params = new URLSearchParams(window.location.search);
        const paymentStatus = params.get('payment');
        const sessionId = params.get('session_id');
        const itemId = params.get('item_id');
        
        console.log('📋 URLパラメータ:', { paymentStatus, sessionId, itemId, hasUser: !!user });
        
        const isPaymentSuccess = paymentStatus === 'success' && sessionId;
        
        if (isPaymentSuccess) {
            if (!user) {
                console.log('⚠️ 決済成功を検出しましたが、ユーザー情報がありません。少し待ちます...');
                await new Promise(resolve => setTimeout(resolve, 1000));
                return;
            }
            console.log('✅ 決済成功を検出！検証を開始します...');
            await verifyPayment(sessionId, itemId);
            return;
        }
        
        if(!user) {
            console.log('⚠️ ユーザー情報がありません');
            return;
        }

        // 購入履歴を取得
        console.log('🔍 購入履歴を取得中... user.id:', user.id);
        
        const { data: bought, error } = await supabase
            .from('purchases')
            .select('item_id, id, created_at, stripe_session_id')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('❌ 購入履歴の取得エラー:', error);
        } else {
            console.log('📋 購入履歴を取得:', bought);
            const purchasedIds = bought?.map(p => p.item_id) || [];
            setPurchases(purchasedIds);
        }
    };
    init();
}, [user]);
```

#### 認証状態変更ハンドラ（page.jsx内）
```javascript
supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('🔔 認証状態変更:', event, session?.user?.email);
    setUser(session?.user || null);
    
    // ログイン成功時のリダイレクト制御
    if (event === 'SIGNED_IN' && session?.user) {
        const currentSearch = new URLSearchParams(window.location.search);
        
        // 決済処理中はリダイレクトしない
        const paymentStatus = currentSearch.get('payment');
        if (paymentStatus === 'success' || paymentStatus === 'cancel') {
            console.log('⏸️ 決済処理中のため、リダイレクトをスキップ');
            return;
        }
        
        // 通常のリダイレクト処理
        console.log('🏠 ダッシュボードにリダイレクト');
        navigateTo('dashboard');
    }
});
```

---

## 🗄️ データベース設定

### Supabaseで実行するSQL

```sql
-- purchasesテーブルを作成（プロフィールLP用にカスタマイズ）
CREATE TABLE IF NOT EXISTS public.purchases (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    item_id BIGINT NOT NULL, -- ★プロフィールLPのID、または商品ID
    stripe_session_id TEXT NOT NULL UNIQUE,
    amount INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスを作成
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON public.purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_item_id ON public.purchases(item_id);
CREATE INDEX IF NOT EXISTS idx_purchases_stripe_session_id ON public.purchases(stripe_session_id);

-- RLSを有効化
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- ポリシーを作成
CREATE POLICY "Users can view their own purchases"
ON public.purchases
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert purchases"
ON public.purchases
FOR INSERT
WITH CHECK (true);
```

**注意:** 既に `purchases` テーブルが存在する場合、`quiz_id` カラムを `item_id` に変更するか、そのまま `quiz_id` を使用してください。

---

## 🔧 環境変数設定

### `.env.local` または Vercel環境変数

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
STRIPE_SECRET_KEY=sk_live_... または sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... または pk_test_...

# サイトURL
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

---

## 📝 カスタマイズポイント

### 1. 商品名・説明文
- `app/api/checkout/route.js` の `product_data` を変更
- 例: `name: 'プロフィールLP購入'`

### 2. 購入対象
- `quiz_id` → `item_id` または `profile_id` に変更
- データベースのカラム名も合わせて変更

### 3. リダイレクト先
- `success_url` と `cancel_url` をプロフィールLPのURLに変更

### 4. 価格設定
- 固定価格にする場合: `handlePurchase` 関数で `prompt` を削除し、固定値を設定
- 例: `const price = 5000; // 5000円固定`

---

## 🧪 テスト手順

1. **Stripe テストモードで決済テスト**
   - テストカード番号: `4242 4242 4242 4242`
   - 有効期限: 未来の日付
   - CVC: 任意の3桁

2. **コンソールログを確認**
   - `🚀 Starting Checkout:` が表示される
   - `🔍 決済検証開始:` が表示される
   - `✅ 購入履歴を記録完了:` が表示される

3. **データベースを確認**
   - Supabaseダッシュボードで `purchases` テーブルを確認
   - 新しいレコードが追加されているか確認

4. **本番環境テスト**
   - Stripe本番モードに切り替え
   - 実際の決済をテスト

---

## 🚨 トラブルシューティング

### 決済後に購入履歴が記録されない
- `SUPABASE_SERVICE_ROLE_KEY` が正しく設定されているか確認
- `/api/verify` のログを確認
- RLSポリシーが正しく設定されているか確認

### URLパラメータが失われる
- 認証状態変更ハンドラで決済処理中のリダイレクトをスキップしているか確認
- `verifyPayment` 関数でURLパラメータをクリアするタイミングを確認

### Stripeエラー
- `STRIPE_SECRET_KEY` が正しく設定されているか確認
- Stripeダッシュボードでログを確認

---

## 📚 参考資料

- [Stripe Checkout ドキュメント](https://stripe.com/docs/payments/checkout)
- [Supabase RLS ドキュメント](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

## ✅ チェックリスト

- [ ] 必要なファイルをコピー
- [ ] データベーステーブルを作成
- [ ] 環境変数を設定
- [ ] カスタマイズポイントを修正
- [ ] テストモードで決済テスト
- [ ] 本番環境で決済テスト
- [ ] エラーハンドリングを確認
- [ ] ユーザー体験を確認

---

## 🎯 AI への指示例

プロフィールLPの開発者に以下のように指示してください:

```
診断クイズメーカーで実装したStripe決済システムを、
プロフィールLPに移植してください。

【移植内容】
- Stripe決済機能（Checkout Session）
- 決済検証API（/api/verify）
- 購入履歴管理（Supabase purchases テーブル）
- 決済成功時のリダイレクト制御

【参考ファイル】
- PAYMENT_SYSTEM_MIGRATION_GUIDE.md（このファイル）
- app/api/checkout/route.js
- app/api/verify/route.js
- components/Dashboard.jsx（決済ロジック部分）

【カスタマイズ】
- 購入対象: プロフィールLP（quiz_id → profile_id に変更）
- 商品名: 「プロフィールLP購入」
- 価格: 5000円固定（または可変）

【注意事項】
- 同じSupabaseプロジェクトを使用
- 既存の purchases テーブルを使用（カラム名を調整）
- 決済成功時のURLパラメータを保持する処理を必ず実装
- 認証状態変更時のリダイレクト制御を実装

【テスト】
- Stripeテストモードで決済テスト
- コンソールログで決済フローを確認
- 購入履歴がデータベースに記録されることを確認
```

---

以上で、プロフィールLPへの決済システム移植が完了します。

