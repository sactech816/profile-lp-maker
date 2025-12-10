# 診断クイズメーカー お知らせ機能実装ガイド

## 📋 概要

プロフィールLPメーカーと共通のお知らせ機能を診断クイズメーカーに追加します。
同じSupabaseデータベースを使用し、`service_type` カラムで区別します。

---

## 🎯 実装内容

### 特徴
- ✅ プロフィールLPメーカーと同じデータベースを使用
- ✅ `service_type = 'quiz'` で診断クイズ専用のお知らせを表示
- ✅ `service_type = 'all'` で全サービス共通のお知らせも表示
- ✅ 管理者は1つの画面で両サービスのお知らせを管理可能

---

## 🚀 実装手順

### ステップ1: データベースのセットアップ

**重要:** プロフィールLPメーカー側で既にデータベースがセットアップされている場合は、このステップはスキップしてください。

もしまだの場合は、以下のSQLを実行:
```sql
-- Supabase SQL Editor で実行
-- プロフィールLPメーカーのプロジェクトから
-- supabase_announcements_setup_clean.sql をコピーして実行
```

---

### ステップ2: コンポーネントファイルのコピー

プロフィールLPメーカーから以下のファイルをコピー:

```
コピー元: profile-lp-maker/components/AnnouncementsPage.jsx
コピー先: quiz-maker/components/AnnouncementsPage.jsx
```

**変更不要:** このコンポーネントは `serviceType` プロパティで動作を変更できます。

---

### ステップ3: メインアプリにインポート

診断クイズメーカーの `app/page.jsx` (またはメインファイル) に以下を追加:

#### 3-1. インポート追加

```jsx
// ファイル上部に追加
import AnnouncementsPage from '../components/AnnouncementsPage';
```

#### 3-2. ルーティング追加

既存のページ分岐（view === 'portal' など）に以下を追加:

```jsx
{view === 'announcements' && (
    <AnnouncementsPage 
        onBack={() => navigateTo('portal')}  // 診断クイズのホームページに戻る
        isAdmin={isAdmin} 
        setPage={(p) => navigateTo(p)} 
        user={user} 
        onLogout={async () => { 
            if (!supabase) return;
            try {
                await supabase.auth.signOut(); 
                setUser(null);
                alert('ログアウトしました');
                navigateTo('portal');
            } catch(e) {
                console.error('ログアウトエラー:', e);
                alert('ログアウトに失敗しました');
            }
        }} 
        setShowAuth={setShowAuth}
        serviceType="quiz"  // ★重要: 'quiz' を指定
    />
)}
```

**重要ポイント:**
- `serviceType="quiz"` を必ず指定してください
- これにより診断クイズ用のお知らせのみが表示されます

---

### ステップ4: ヘッダーにリンク追加

診断クイズメーカーの `Header.jsx` (またはナビゲーションコンポーネント) に追加:

#### 4-1. アイコンのインポート

```jsx
import { Bell } from 'lucide-react';
```

#### 4-2. ナビゲーションリンク追加

**デスクトップ版:**
```jsx
<button 
    onClick={() => handleNav('announcements')} 
    className="text-gray-600 hover:text-indigo-600 flex items-center gap-1"
>
    <Bell size={16}/> お知らせ
</button>
```

**モバイル版:**
```jsx
<button 
    onClick={() => handleNav('announcements')} 
    className="flex items-center gap-3 py-3 border-b border-gray-100 text-indigo-600 font-bold"
>
    <Bell size={20}/> お知らせ
</button>
```

---

## 📊 データの表示ロジック

### 診断クイズメーカーで表示されるお知らせ

```javascript
// serviceType="quiz" の場合
// 以下の2種類のお知らせが表示される:
// 1. service_type = 'quiz' (診断クイズ専用)
// 2. service_type = 'all' (全サービス共通)

// service_type = 'profile' は表示されない
```

### プロフィールLPメーカーで表示されるお知らせ

```javascript
// serviceType="profile" の場合
// 以下の2種類のお知らせが表示される:
// 1. service_type = 'profile' (プロフィールLP専用)
// 2. service_type = 'all' (全サービス共通)

// service_type = 'quiz' は表示されない
```

---

## 🎨 管理者機能

### お知らせの作成

管理者（`info@kei-sho.co.jp`）でログインすると:

1. 「新規作成」ボタンが表示される
2. フォームでサービス区分を選択:
   - **診断クイズメーカー**: 診断クイズのみに表示
   - **プロフィールLPメーカー**: プロフィールLPのみに表示
   - **全サービス共通**: 両方に表示

### 使い分けの例

| お知らせ内容 | 選択するサービス区分 |
|------------|------------------|
| 診断クイズの新機能追加 | 診断クイズメーカー |
| プロフィールLPの新機能追加 | プロフィールLPメーカー |
| システム全体のメンテナンス | 全サービス共通 |
| 料金改定のお知らせ | 全サービス共通 |

---

## ✅ 動作確認チェックリスト

### データベース
- [ ] Supabaseで `announcements` テーブルが存在する
- [ ] `service_type` カラムが存在する
- [ ] サンプルデータが挿入されている

### 診断クイズメーカー側
- [ ] `AnnouncementsPage.jsx` がコピーされている
- [ ] `app/page.jsx` にインポートが追加されている
- [ ] ルーティングが追加されている（`serviceType="quiz"`）
- [ ] ヘッダーに「お知らせ」リンクが追加されている

### 表示確認
- [ ] お知らせページにアクセスできる
- [ ] `service_type = 'quiz'` のお知らせが表示される
- [ ] `service_type = 'all'` のお知らせが表示される
- [ ] `service_type = 'profile'` のお知らせは表示されない

### 管理者機能
- [ ] 管理者でログインできる
- [ ] 「新規作成」ボタンが表示される
- [ ] サービス区分を選択できる
- [ ] お知らせを作成できる
- [ ] お知らせを編集できる
- [ ] お知らせを削除できる

---

## 🔧 コード例（完全版）

### app/page.jsx の例

```jsx
"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ADMIN_EMAIL } from '../lib/constants';

// コンポーネントのインポート
import AuthModal from '../components/AuthModal';
import Portal from '../components/Portal';
import QuizPlayer from '../components/QuizPlayer';
import Editor from '../components/Editor';
import AnnouncementsPage from '../components/AnnouncementsPage'; // ★追加

const App = () => {
  const [view, setView] = useState('loading');
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  
  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const navigateTo = (newView) => {
    setView(newView);
  };

  return (
    <div>
      <AuthModal 
        isOpen={showAuth} 
        onClose={() => setShowAuth(false)} 
        setUser={setUser}
      />
      
      {view === 'portal' && (
        <Portal 
          user={user}
          setPage={navigateTo}
        />
      )}
      
      {/* ★お知らせページの追加 */}
      {view === 'announcements' && (
        <AnnouncementsPage 
          onBack={() => navigateTo('portal')}
          isAdmin={isAdmin}
          setPage={navigateTo}
          user={user}
          onLogout={async () => {
            await supabase.auth.signOut();
            setUser(null);
            navigateTo('portal');
          }}
          setShowAuth={setShowAuth}
          serviceType="quiz"
        />
      )}
      
      {/* その他の既存ビュー */}
    </div>
  );
};

export default App;
```

---

## 🐛 トラブルシューティング

### エラー: 「service_type カラムが見つからない」

**原因:** データベースにテーブルが作成されていない  
**解決策:** プロフィールLPメーカーのプロジェクトから `supabase_announcements_setup_clean.sql` を実行

### 診断クイズのお知らせが表示されない

**原因:** `serviceType` プロパティが正しく渡されていない  
**解決策:** 
```jsx
<AnnouncementsPage serviceType="quiz" />  // 'quiz' を明示的に指定
```

### プロフィールLPのお知らせも表示される

**原因:** `serviceType` が 'profile' になっている  
**解決策:** 診断クイズメーカーでは必ず `serviceType="quiz"` を指定

---

## 📝 補足情報

### 環境変数の確認

診断クイズメーカーの `.env.local` に以下が設定されているか確認:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

**重要:** プロフィールLPメーカーと同じSupabaseプロジェクトを使用してください。

### 管理者メールの確認

`lib/constants.js` で管理者メールアドレスを確認:

```javascript
export const ADMIN_EMAIL = "info@kei-sho.co.jp";
```

---

## 🎯 実装後の動作

実装が完了すると:

1. ✅ 診断クイズメーカーに「お知らせ」ページが追加される
2. ✅ 診断クイズ専用のお知らせが表示される
3. ✅ 全サービス共通のお知らせも表示される
4. ✅ 管理者は両サービスのお知らせを1箇所で管理できる

---

## 📂 必要なファイル

診断クイズメーカーのプロジェクトに以下のファイルが必要:

```
quiz-maker/
├── components/
│   └── AnnouncementsPage.jsx  ← プロフィールLPからコピー
├── app/
│   └── page.jsx               ← 修正（インポート＆ルーティング追加）
├── lib/
│   ├── supabase.js           ← 既存（確認のみ）
│   └── constants.js          ← 既存（ADMIN_EMAIL確認）
└── .env.local                ← 既存（環境変数確認）
```

---

## 🆘 サポート

実装中に問題が発生した場合:

1. このガイドのトラブルシューティングセクションを確認
2. Supabaseのログを確認
3. ブラウザのコンソールでエラーを確認
4. プロフィールLPメーカー側で正常に動作しているか確認

---

**作成日:** 2025年12月10日  
**対象:** 診断クイズメーカー開発チーム  
**前提:** プロフィールLPメーカーと同じSupabaseプロジェクトを使用

