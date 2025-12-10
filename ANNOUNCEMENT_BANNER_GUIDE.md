# お知らせバナー機能ガイド

## 📋 概要

ページ最上部に最新のお知らせを1行で表示するバナー機能を追加しました。

---

## 🎨 機能の特徴

### ✅ 自動表示
- 最新の表示中のお知らせを自動取得
- ページ読み込み時に自動表示

### ✅ サービス区分対応
- `service_type = 'profile'` のお知らせ
- `service_type = 'all'` のお知らせ（全サービス共通）

### ✅ 視覚的な区別
- **通常のお知らせ**: 青色のグラデーション
- **全サービス共通**: 紫色のグラデーション + 「重要」バッジ

### ✅ ユーザー体験
- ✅ クリックで詳細ページへ遷移（リンクがある場合は外部サイトへ）
- ✅ 閉じるボタンで非表示
- ✅ 閉じたお知らせは再表示されない（ローカルストレージで記録）
- ✅ レスポンシブデザイン対応

---

## 📱 表示場所

### プロフィールLPメーカー

1. **ランディングページ** (`LandingPage.jsx`)
   - ヘッダーの上部に表示
   - 未ログインユーザーにも表示

2. **ダッシュボード** (`ProfileDashboard.jsx`)
   - ヘッダーの上部に表示
   - ログイン済みユーザーに表示

---

## 🎯 表示ロジック

### 表示条件
1. `is_active = true`（表示中）
2. `service_type IN ('profile', 'all')`
3. 最新の1件のみ
4. ユーザーが閉じていない

### 非表示条件
1. お知らせが存在しない
2. ユーザーが閉じるボタンをクリックした
3. データベースエラー

---

## 🎨 デザイン仕様

### 通常のお知らせ
```
┌────────────────────────────────────────────────┐
│ 🔔 プロフィールLP機能を追加しました！        ✕ │
└────────────────────────────────────────────────┘
背景: 青色グラデーション (indigo-600 → blue-600)
```

### 全サービス共通のお知らせ
```
┌────────────────────────────────────────────────┐
│ 🔔 [重要] メンテナンスのお知らせ            ✕ │
└────────────────────────────────────────────────┘
背景: 紫色グラデーション (purple-600 → indigo-600)
バッジ: 「重要」ラベル付き
```

---

## 🔧 コンポーネント仕様

### AnnouncementBanner.jsx

#### Props

| プロパティ | 型 | 必須 | デフォルト | 説明 |
|-----------|-----|------|-----------|------|
| `serviceType` | string | ❌ | 'profile' | サービス区分（'quiz' or 'profile'） |
| `onNavigateToAnnouncements` | function | ❌ | - | お知らせページへの遷移関数 |

#### 使用例

```jsx
import AnnouncementBanner from './AnnouncementBanner';

// プロフィールLPメーカー用
<AnnouncementBanner 
    serviceType="profile"
    onNavigateToAnnouncements={() => setPage('announcements')}
/>

// 診断クイズメーカー用
<AnnouncementBanner 
    serviceType="quiz"
    onNavigateToAnnouncements={() => setPage('announcements')}
/>
```

---

## 💾 ローカルストレージ

### 保存データ

```javascript
localStorage.setItem('dismissed_announcement_id', 'お知らせのID');
```

### データの扱い
- ユーザーが閉じるボタンをクリックすると、そのお知らせのIDを記録
- 同じお知らせは再表示されない
- 新しいお知らせが投稿されると、再び表示される

### リセット方法

ブラウザの開発者ツールで以下を実行:
```javascript
localStorage.removeItem('dismissed_announcement_id');
```

---

## 🎬 動作フロー

```
1. ページ読み込み
   ↓
2. 最新のお知らせを取得
   ↓
3. ローカルストレージをチェック
   ↓
4. 閉じていない場合は表示
   ↓
5. ユーザーがクリック
   ├─ リンクあり → 外部サイトへ遷移
   └─ リンクなし → お知らせページへ遷移
   ↓
6. ユーザーが閉じるボタンをクリック
   ↓
7. IDをローカルストレージに保存
   ↓
8. バナーを非表示
```

---

## 🔍 管理者向け情報

### お知らせを目立たせる方法

1. **サービス区分を「全サービス共通」にする**
   - 紫色のグラデーションで表示
   - 「重要」バッジが付く

2. **タイトルを短く簡潔にする**
   - バナーは1行表示のため、短いタイトルが効果的
   - 例: 「新機能追加」「メンテナンスのお知らせ」

3. **リンクを設定する**
   - クリックで詳細ページへ誘導
   - 外部リンクアイコンが表示される

### 表示されるお知らせの優先順位

```sql
-- 最新のお知らせが優先される
ORDER BY announcement_date DESC
LIMIT 1
```

最新の1件のみが表示されるため、重要なお知らせは最新の日付で投稿してください。

---

## 🐛 トラブルシューティング

### バナーが表示されない

**原因1:** お知らせが存在しない  
**解決策:** 管理者でお知らせを作成

**原因2:** `is_active = false` になっている  
**解決策:** お知らせを「表示中」に変更

**原因3:** ユーザーが既に閉じている  
**解決策:** ローカルストレージをクリア、または新しいお知らせを作成

**原因4:** データベースエラー  
**解決策:** ブラウザのコンソールでエラーを確認

### バナーが重複して表示される

**原因:** 複数のコンポーネントで使用している  
**解決策:** 各ページで1回のみ使用するように調整

### 閉じたお知らせが再表示される

**原因:** ローカルストレージが正しく保存されていない  
**解決策:** ブラウザの設定でローカルストレージが有効か確認

---

## 📊 カスタマイズ例

### バナーの色を変更

```jsx
// AnnouncementBanner.jsx の該当箇所
const bgColor = isGlobalAnnouncement 
    ? 'bg-gradient-to-r from-red-600 to-pink-600'  // 赤色に変更
    : 'bg-gradient-to-r from-green-600 to-teal-600'; // 緑色に変更
```

### バナーの高さを変更

```jsx
<div className={`${bgColor} text-white py-3 px-4 ...`}>
//                                        ↑ py-2 → py-3 に変更
```

### アニメーション効果を追加

```jsx
<div className={`${bgColor} text-white py-2 px-4 animate-slide-down ...`}>
//                                                  ↑ アニメーションクラスを追加
```

---

## ✅ 実装チェックリスト

### ファイル
- [x] `components/AnnouncementBanner.jsx` を作成
- [x] `components/LandingPage.jsx` にバナーを追加
- [x] `components/ProfileDashboard.jsx` にバナーを追加

### 動作確認
- [ ] ランディングページでバナーが表示される
- [ ] ダッシュボードでバナーが表示される
- [ ] クリックで遷移できる
- [ ] 閉じるボタンで非表示になる
- [ ] 閉じたお知らせは再表示されない
- [ ] 全サービス共通のお知らせは紫色で表示される
- [ ] レスポンシブデザインが機能する

---

## 🎯 今後の拡張案

### 1. 複数のお知らせをスライド表示

```jsx
// 3件のお知らせを順番に表示
const [currentIndex, setCurrentIndex] = useState(0);
useEffect(() => {
    const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 5000);
    return () => clearInterval(interval);
}, [announcements]);
```

### 2. 既読/未読の管理

```jsx
// 既読のお知らせを記録
const readAnnouncements = JSON.parse(
    localStorage.getItem('read_announcements') || '[]'
);
```

### 3. バナーの位置を変更可能に

```jsx
<AnnouncementBanner 
    position="top"  // 'top' or 'bottom'
/>
```

---

**作成日:** 2025年12月10日  
**最終更新:** 2025年12月10日  
**バージョン:** 1.0.0

