# 診断クイズメーカーへのお知らせ機能統合ガイド

## 📋 概要

このガイドでは、診断クイズメーカーのプロジェクトにお知らせ機能を追加する方法を説明します。
プロフィールLPメーカーと同じデータベースを使用し、`service_type` で区別します。

---

## 🎯 前提条件

- プロフィールLPメーカーと診断クイズメーカーが**同じSupabaseプロジェクト**を使用している
- `supabase_announcements_setup.sql` が既に実行されている

---

## 🚀 統合手順

### ステップ1: コンポーネントのコピー

プロフィールLPメーカーから以下のファイルをコピー:

```bash
# コピー元
profile-lp-maker/components/AnnouncementsPage.jsx

# コピー先
quiz-maker/components/AnnouncementsPage.jsx
```

**変更不要**: コンポーネントは `serviceType` プロパティで動作を変更できます。

---

### ステップ2: メインアプリにインポート

診断クイズメーカーの `app/page.jsx` (または該当ファイル) を編集:

```jsx
// インポート追加
import AnnouncementsPage from '../components/AnnouncementsPage';

// ルーティング追加（既存のページ分岐に追加）
{view === 'announcements' && (
    <AnnouncementsPage 
        onBack={() => navigateTo('portal')} // 診断クイズメーカーのホームページ
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
        serviceType="quiz"  // ★ここが重要: 'quiz' を指定
    />
)}
```

---

### ステップ3: ヘッダーにリンク追加

診断クイズメーカーの `Header.jsx` (または該当コンポーネント) を編集:

```jsx
// インポート追加
import { Bell } from 'lucide-react';

// ナビゲーションに追加
<button 
    onClick={() => handleNav('announcements')} 
    className="text-gray-600 hover:text-indigo-600 flex items-center gap-1"
>
    <Bell size={16}/> お知らせ
</button>
```

---

## 🔍 動作の違い

### プロフィールLPメーカー

```jsx
<AnnouncementsPage serviceType="profile" />
```

**表示されるお知らせ:**
- `service_type = 'profile'` のお知らせ
- `service_type = 'all'` のお知らせ（全サービス共通）

### 診断クイズメーカー

```jsx
<AnnouncementsPage serviceType="quiz" />
```

**表示されるお知らせ:**
- `service_type = 'quiz'` のお知らせ
- `service_type = 'all'` のお知らせ（全サービス共通）

---

## 📊 データの流れ

```
┌─────────────────────────────────────────┐
│     Supabase (announcements テーブル)     │
├─────────────────────────────────────────┤
│ id | service_type | title | content ... │
├─────────────────────────────────────────┤
│ 1  | profile      | ...   | ...         │ → プロフィールLPのみ
│ 2  | quiz         | ...   | ...         │ → 診断クイズのみ
│ 3  | all          | ...   | ...         │ → 両方に表示
│ 4  | profile      | ...   | ...         │ → プロフィールLPのみ
└─────────────────────────────────────────┘
```

---

## 🎨 管理画面での使い分け

管理者がお知らせを作成する際、サービス区分を選択できます:

```
┌──────────────────────────────────────┐
│  サービス区分                          │
│  ┌────────────────────────────────┐  │
│  │ ○ プロフィールLPメーカー        │  │
│  │ ● 診断クイズメーカー            │  │
│  │ ○ 全サービス共通                │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

---

## 📝 実装例: 完全なコード

### 診断クイズメーカーの app/page.jsx

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
    // ルーティングロジック
    setView(newView);
  };

  // ... その他の既存コード ...

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
          // ... その他のプロパティ
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
      
      {/* ... その他の既存ビュー ... */}
    </div>
  );
};

export default App;
```

---

## ✅ 動作確認チェックリスト

### 診断クイズメーカー側

- [ ] お知らせページにアクセスできる
- [ ] ヘッダーに「お知らせ」リンクが表示される
- [ ] `service_type = 'quiz'` のお知らせが表示される
- [ ] `service_type = 'all'` のお知らせが表示される
- [ ] `service_type = 'profile'` のお知らせは表示されない
- [ ] 管理者でサービス区分を選択できる

### プロフィールLPメーカー側

- [ ] `service_type = 'profile'` のお知らせが表示される
- [ ] `service_type = 'all'` のお知らせが表示される
- [ ] `service_type = 'quiz'` のお知らせは表示されない

### 管理者機能

- [ ] 両方のサービスで管理画面にアクセスできる
- [ ] サービス区分を変更して保存できる
- [ ] 全サービス共通のお知らせを作成できる

---

## 🔧 カスタマイズ例

### ページタイトルの変更

診断クイズメーカー用にページタイトルをカスタマイズする場合:

```jsx
// AnnouncementsPage.jsx の useEffect 内
useEffect(() => {
    const serviceName = serviceType === 'quiz' 
        ? '診断クイズメーカー' 
        : 'プロフィールLPメーカー';
    document.title = `お知らせ | ${serviceName}`;
    // ...
}, [serviceType]);
```

### ヘッダー/フッターの差し替え

診断クイズメーカー用のヘッダー/フッターを使用する場合:

```jsx
// 診断クイズメーカーのコンポーネントをインポート
import QuizHeader from './QuizHeader';
import QuizFooter from './QuizFooter';

// AnnouncementsPage.jsx 内で使用
<QuizHeader setPage={setPage} user={user} ... />
<QuizFooter setPage={setPage} ... />
```

---

## 🐛 トラブルシューティング

### 診断クイズのお知らせが表示されない

**原因**: `serviceType` プロパティが正しく渡されていない  
**解決策**: 
```jsx
<AnnouncementsPage serviceType="quiz" />  // 'quiz' を明示的に指定
```

### プロフィールLPのお知らせが表示される

**原因**: `serviceType` が 'profile' になっている  
**解決策**: 診断クイズメーカーでは必ず `serviceType="quiz"` を指定

### 両方のサービスで同じお知らせが表示されない

**原因**: `service_type` が 'all' になっていない  
**解決策**: 管理画面で「全サービス共通」を選択

---

## 📈 運用のベストプラクティス

### 1. サービス区分の使い分け

| 状況 | 推奨する service_type |
|-----|---------------------|
| プロフィールLP専用の新機能 | `profile` |
| 診断クイズ専用の新機能 | `quiz` |
| システム全体のメンテナンス | `all` |
| 料金改定のお知らせ | `all` |
| 特定サービスのバグ修正 | 該当サービス |

### 2. お知らせの優先順位

重要度が高いお知らせは「全サービス共通」で投稿し、
各サービス固有の情報は個別に投稿することで、
ユーザーに適切な情報を届けることができます。

### 3. 下書き機能の活用

`is_active = false` で下書き保存し、
公開前に内容を確認してから `is_active = true` に変更。

---

## 🎯 まとめ

- ✅ 同じデータベースを使用し、`service_type` で区別
- ✅ コンポーネントは共通、プロパティで動作を変更
- ✅ 管理者は1つの画面で全サービスのお知らせを管理
- ✅ 全サービス共通のお知らせも投稿可能

---

**作成日**: 2025年12月10日  
**最終更新**: 2025年12月10日  
**バージョン**: 1.0.0

