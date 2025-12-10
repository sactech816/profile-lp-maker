# お知らせ機能 実装ガイド

## 📋 概要

プロフィールLPメーカーと診断クイズメーカーで共通のお知らせ機能を実装しました。
`service_type` カラムでサービスを区別し、1つのテーブルで全サービスのお知らせを管理します。

---

## 🎯 主な特徴

✅ **サービス別管理**: プロフィールLP、診断クイズ、全サービス共通の3種類  
✅ **スケーラブル**: 将来的に新サービスを追加しても対応可能  
✅ **管理画面統合**: 1つの管理画面で全サービスのお知らせを管理  
✅ **RLSセキュリティ**: 管理者のみが編集可能、一般ユーザーは閲覧のみ  
✅ **表示/非表示切替**: 下書き保存や一時的な非表示が可能

---

## 📊 データベース構造

### テーブル: `announcements`

| カラム名 | 型 | 説明 |
|---------|-----|------|
| `id` | UUID | 主キー（自動生成） |
| `service_type` | TEXT | サービス区分: `'quiz'`, `'profile'`, `'all'` |
| `title` | TEXT | お知らせのタイトル（必須） |
| `content` | TEXT | お知らせの本文（必須） |
| `link_url` | TEXT | 詳細リンクURL（任意） |
| `link_text` | TEXT | リンクのテキスト（任意） |
| `is_active` | BOOLEAN | 表示状態（true: 表示中, false: 非表示） |
| `announcement_date` | DATE | お知らせの日付 |
| `created_at` | TIMESTAMPTZ | 作成日時 |
| `updated_at` | TIMESTAMPTZ | 最終更新日時 |

### サービスタイプの種類

```typescript
type ServiceType = 'quiz' | 'profile' | 'all';
```

- **`quiz`**: 診断クイズメーカーのみに表示
- **`profile`**: プロフィールLPメーカーのみに表示
- **`all`**: 全サービスに表示（メンテナンス告知など）

---

## 🚀 セットアップ手順

### ステップ1: データベースのセットアップ

1. Supabaseのダッシュボードにアクセス
2. SQL Editorを開く
3. `supabase_announcements_setup.sql` の内容を実行

```sql
-- ファイルの内容をコピー＆ペーストして実行
```

### ステップ2: 環境変数の確認

`.env.local` に以下が設定されているか確認:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### ステップ3: 管理者メールの設定

`lib/constants.js` で管理者メールアドレスを確認:

```javascript
export const ADMIN_EMAIL = "info@kei-sho.co.jp";
```

このメールアドレスでログインしたユーザーのみが、お知らせの作成・編集・削除が可能です。

### ステップ4: アプリケーションの起動

```bash
npm run dev
```

---

## 📱 使い方

### 一般ユーザー

1. ヘッダーの「お知らせ」ボタンをクリック
2. 表示中のお知らせ一覧が表示されます
3. リンク付きのお知らせは「詳細を見る」から外部ページへ遷移可能

### 管理者

#### お知らせの作成

1. 管理者アカウントでログイン（`info@kei-sho.co.jp`）
2. お知らせページにアクセス
3. 「新規作成」ボタンをクリック
4. フォームに入力:
   - **サービス区分**: どのサービスで表示するか選択
   - **タイトル**: お知らせのタイトル
   - **本文**: お知らせの内容
   - **リンクURL**: 詳細ページのURL（任意）
   - **リンクテキスト**: リンクの表示テキスト（任意）
   - **お知らせ日付**: 表示する日付
   - **表示状態**: 表示中 or 非表示
5. 「作成する」ボタンをクリック

#### お知らせの編集

1. お知らせカードの右上の「編集」アイコンをクリック
2. フォームが表示されるので内容を修正
3. 「更新する」ボタンをクリック

#### お知らせの削除

1. お知らせカードの右上の「削除」アイコンをクリック
2. 確認ダイアログで「OK」をクリック

---

## 🎨 UI/UX の特徴

### サービスタイプのバッジ表示

お知らせカードには、サービスタイプに応じたバッジが表示されます（管理者のみ）:

- 🟣 **全サービス共通**: 紫色のバッジ
- 🔵 **診断クイズ**: 青色のバッジ
- 🟢 **プロフィールLP**: 緑色のバッジ

### 表示状態の管理

- ✅ **表示中**: 一般ユーザーに公開
- 👁️ **非表示**: 管理者のみ閲覧可能（下書き状態）

---

## 🔒 セキュリティ

### Row Level Security (RLS)

Supabaseの行レベルセキュリティで保護されています:

| 操作 | 一般ユーザー | 管理者 |
|-----|------------|--------|
| 表示中のお知らせを閲覧 | ✅ | ✅ |
| 非表示のお知らせを閲覧 | ❌ | ✅ |
| お知らせの作成 | ❌ | ✅ |
| お知らせの編集 | ❌ | ✅ |
| お知らせの削除 | ❌ | ✅ |

### 管理者判定

```javascript
const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
```

---

## 🔧 カスタマイズ

### 新しいサービスタイプを追加する場合

#### 1. SQLスキーマを更新

```sql
ALTER TABLE announcements 
DROP CONSTRAINT announcements_service_type_check;

ALTER TABLE announcements 
ADD CONSTRAINT announcements_service_type_check 
CHECK (service_type IN ('quiz', 'profile', 'service3', 'all'));
```

#### 2. コンポーネントを更新

`components/AnnouncementsPage.jsx`:

```jsx
<select value={formData.service_type} ...>
    <option value="profile">プロフィールLPメーカー</option>
    <option value="quiz">診断クイズメーカー</option>
    <option value="service3">新サービス名</option>
    <option value="all">全サービス共通</option>
</select>
```

#### 3. バッジ表示を追加

```jsx
{announcement.service_type === 'service3' && isAdmin && (
    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded font-bold">
        新サービス
    </span>
)}
```

---

## 📂 ファイル構成

```
profile-lp-maker/
├── supabase_announcements_setup.sql    # データベースセットアップSQL
├── components/
│   ├── AnnouncementsPage.jsx          # お知らせページコンポーネント
│   └── Header.jsx                     # ヘッダー（お知らせリンク追加済み）
├── app/
│   └── page.jsx                       # メインアプリ（ルーティング追加済み）
├── lib/
│   ├── supabase.js                    # Supabaseクライアント
│   └── constants.js                   # 管理者メール定義
└── ANNOUNCEMENTS_SETUP_GUIDE.md       # このファイル
```

---

## 🧪 動作確認チェックリスト

### データベース

- [ ] Supabaseで `announcements` テーブルが作成されている
- [ ] インデックスが正しく作成されている
- [ ] RLSポリシーが有効になっている
- [ ] サンプルデータが挿入されている

### 管理者機能

- [ ] 管理者アカウントでログインできる
- [ ] お知らせページにアクセスできる
- [ ] 「新規作成」ボタンが表示される
- [ ] サービス区分を選択できる
- [ ] 新規お知らせを作成できる
- [ ] お知らせを編集できる
- [ ] お知らせを削除できる
- [ ] 非表示のお知らせが表示される

### 一般ユーザー機能

- [ ] お知らせページにアクセスできる
- [ ] 表示中のお知らせのみ表示される
- [ ] 非表示のお知らせは表示されない
- [ ] 「新規作成」ボタンが表示されない
- [ ] 編集・削除ボタンが表示されない
- [ ] リンク付きお知らせが正しく機能する

### UI/UX

- [ ] サービスタイプのバッジが正しく表示される
- [ ] 日付が正しくフォーマットされている
- [ ] レスポンシブデザインが機能している
- [ ] ローディング状態が表示される
- [ ] エラーメッセージが適切に表示される
- [ ] 成功メッセージが表示される

---

## 🐛 トラブルシューティング

### お知らせが表示されない

**原因1**: データベースにデータがない  
**解決策**: サンプルデータを挿入するか、管理者で新規作成

**原因2**: `is_active` が `false` になっている  
**解決策**: 管理者で編集し、「表示中」に変更

**原因3**: `service_type` が一致していない  
**解決策**: お知らせの `service_type` を確認し、適切な値に変更

### 管理者なのに編集できない

**原因**: メールアドレスが一致していない  
**解決策**: `lib/constants.js` の `ADMIN_EMAIL` を確認

### RLSエラーが発生する

**原因**: ポリシーが正しく設定されていない  
**解決策**: `supabase_announcements_setup.sql` を再実行

---

## 📈 今後の拡張案

### オプション1: 未読バッジ機能

ヘッダーに未読のお知らせ件数を表示:

```jsx
const [newAnnouncementsCount, setNewAnnouncementsCount] = useState(0);

useEffect(() => {
    const lastVisit = localStorage.getItem('lastAnnouncementVisit_profile');
    // 最終訪問日時以降のお知らせ件数を取得
}, []);
```

### オプション2: 重要度レベル

お知らせに重要度を追加:

```sql
ALTER TABLE announcements 
ADD COLUMN priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium';
```

### オプション3: カテゴリ分類

お知らせをカテゴリ別に分類:

```sql
ALTER TABLE announcements 
ADD COLUMN category TEXT CHECK (category IN ('update', 'maintenance', 'feature', 'info'));
```

### オプション4: 画像添付

お知らせに画像を添付:

```sql
ALTER TABLE announcements 
ADD COLUMN image_url TEXT;
```

---

## 🤝 サポート

質問や問題が発生した場合:

1. このガイドのトラブルシューティングセクションを確認
2. Supabaseのログを確認
3. ブラウザのコンソールでエラーを確認
4. 開発チームに連絡

---

## 📝 変更履歴

### v1.0.0 (2025-12-10)
- 初回リリース
- `service_type` カラムによるサービス区分機能
- 管理者による作成・編集・削除機能
- RLSによるセキュリティ実装
- レスポンシブデザイン対応

---

**作成日**: 2025年12月10日  
**最終更新**: 2025年12月10日  
**バージョン**: 1.0.0

