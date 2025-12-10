# 診断クイズメーカー お知らせ機能 クイックセットアップ

## 🎯 AIへの指示

以下をそのまま診断クイズメーカーのAIに伝えてください。

---

## 📝 実装依頼

診断クイズメーカーにお知らせ機能を追加してください。

### 前提条件
- プロフィールLPメーカーと同じSupabaseプロジェクトを使用
- データベースには既に `announcements` テーブルが存在（プロフィールLP側で作成済み）

---

## 📂 必要なファイル

### 1. コンポーネントのコピー

プロフィールLPメーカーから以下のファイルをコピー:

```
コピー元: profile-lp-maker/components/AnnouncementsPage.jsx
コピー先: quiz-maker/components/AnnouncementsPage.jsx
```

**変更不要:** このファイルはそのまま使用可能です。

---

### 2. メインアプリの修正

`app/page.jsx` (またはメインファイル) に以下を追加:

#### インポート追加
```jsx
import AnnouncementsPage from '../components/AnnouncementsPage';
```

#### ルーティング追加
```jsx
{view === 'announcements' && (
    <AnnouncementsPage 
        onBack={() => navigateTo('portal')}
        isAdmin={isAdmin}
        setPage={(p) => navigateTo(p)}
        user={user}
        onLogout={async () => {
            await supabase.auth.signOut();
            setUser(null);
            navigateTo('portal');
        }}
        setShowAuth={setShowAuth}
        serviceType="quiz"  // ★重要: 必ず 'quiz' を指定
    />
)}
```

---

### 3. ヘッダーの修正

`Header.jsx` (またはナビゲーションコンポーネント) に追加:

#### インポート追加
```jsx
import { Bell } from 'lucide-react';
```

#### リンク追加（デスクトップ）
```jsx
<button onClick={() => handleNav('announcements')} className="text-gray-600 hover:text-indigo-600 flex items-center gap-1">
    <Bell size={16}/> お知らせ
</button>
```

#### リンク追加（モバイル）
```jsx
<button onClick={() => handleNav('announcements')} className="flex items-center gap-3 py-3 border-b border-gray-100 text-indigo-600 font-bold">
    <Bell size={20}/> お知らせ
</button>
```

---

## 🎨 オプション: トップバナーの追加

ページ最上部にお知らせバナーを表示する場合:

### 1. バナーコンポーネントのコピー

```
コピー元: profile-lp-maker/components/AnnouncementBanner.jsx
コピー先: quiz-maker/components/AnnouncementBanner.jsx
```

### 2. ランディングページに追加

```jsx
import AnnouncementBanner from './AnnouncementBanner';

// return 文の最初に追加
<AnnouncementBanner 
    serviceType="quiz"
    onNavigateToAnnouncements={() => setPage('announcements')}
/>
```

### 3. ダッシュボードに追加

```jsx
import AnnouncementBanner from './AnnouncementBanner';

// return 文の最初に追加
<AnnouncementBanner 
    serviceType="quiz"
    onNavigateToAnnouncements={() => setPage('announcements')}
/>
```

---

## ✅ 動作確認

実装後、以下を確認してください:

1. [ ] お知らせページにアクセスできる
2. [ ] ヘッダーに「お知らせ」リンクが表示される
3. [ ] 診断クイズ用のお知らせが表示される
4. [ ] 全サービス共通のお知らせも表示される
5. [ ] プロフィールLP用のお知らせは表示されない
6. [ ] 管理者でサービス区分を選択できる

---

## 🔍 重要なポイント

### serviceType プロパティ

```jsx
<AnnouncementsPage serviceType="quiz" />  // ★必ず 'quiz' を指定
<AnnouncementBanner serviceType="quiz" /> // ★必ず 'quiz' を指定
```

このプロパティにより、診断クイズ用のお知らせのみが表示されます。

### 表示されるお知らせ

- `service_type = 'quiz'` のお知らせ
- `service_type = 'all'` のお知らせ（全サービス共通）
- `service_type = 'profile'` のお知らせは表示されない

---

## 📖 詳細ドキュメント

詳しい実装方法は以下のファイルを参照:

```
QUIZ_MAKER_ANNOUNCEMENTS_INSTRUCTIONS.md
```

---

## 🆘 トラブルシューティング

### エラー: 「service_type カラムが見つからない」

**原因:** データベースにテーブルが作成されていない  
**解決策:** プロフィールLPメーカーのプロジェクトで `supabase_announcements_setup_clean.sql` を実行

### 診断クイズのお知らせが表示されない

**原因:** `serviceType` プロパティが正しく設定されていない  
**解決策:** `serviceType="quiz"` を明示的に指定

---

**以上で実装完了です！**

何か問題が発生した場合は、詳細ドキュメントを参照してください。

