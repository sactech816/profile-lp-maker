# お知らせ機能の実装ガイド - サービス区分対応

## ⚠️ 重要: 診断クイズとプロフィールLPの区分け

診断クイズメーカーとプロフィールLPメーカーで**お知らせを別々に管理する**必要があります。

---

## 解決方法の比較

### 方法1: サービス区分カラムを追加（推奨）✅

**概要:**
- 1つの `announcements` テーブルに `service_type` カラムを追加
- `'quiz'`、`'profile'`、`'both'` で区別

**テーブル構造:**
```sql
CREATE TABLE announcements (
  id UUID PRIMARY KEY,
  service_type TEXT NOT NULL CHECK (service_type IN ('quiz', 'profile', 'both')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  ...
);
```

**メリット:**
- ✅ 管理画面が1つで済む
- ✅ 両サービス共通のお知らせを投稿可能
- ✅ データベース構造がシンプル
- ✅ 移行が簡単

**デメリット:**
- ⚠️ クエリ時に必ずservice_typeでフィルタが必要

---

### 方法2: 完全に別テーブルで管理

**概要:**
- `announcements_quiz` と `announcements_profile` で完全分離

**テーブル構造:**
```sql
CREATE TABLE announcements_quiz (...);
CREATE TABLE announcements_profile (...);
```

**メリット:**
- ✅ 完全に独立（混在リスクゼロ）
- ✅ 将来的な仕様変更に強い

**デメリット:**
- ❌ 管理画面が2つ必要
- ❌ 共通お知らせは両方に投稿が必要
- ❌ データベース構造が複雑

---

## 推奨実装: 方法1（サービス区分カラム追加）

### 1. データベーススキーマ

```sql
-- お知らせテーブル（サービス区分対応版）
CREATE TABLE IF NOT EXISTS announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_type TEXT NOT NULL CHECK (service_type IN ('quiz', 'profile', 'both')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  link_url TEXT,
  link_text TEXT,
  is_active BOOLEAN DEFAULT true,
  announcement_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス追加
CREATE INDEX idx_announcements_service_type ON announcements(service_type);
```

### 2. コンポーネントの修正

**AnnouncementsPage.jsx の変更点:**

```javascript
// フェッチ時にservice_typeでフィルタ
const fetchAnnouncements = async () => {
    let query = supabase
        .from('announcements')
        .select('*')
        .in('service_type', ['profile', 'both']) // プロフィールLP用
        .order('announcement_date', { ascending: false });
    
    // 管理者以外は表示中のみ
    if (!isAdmin) {
        query = query.eq('is_active', true);
    }
    
    const { data, error } = await query;
    setAnnouncements(data || []);
};

// 保存時にservice_typeを含める
const handleSubmit = async (e) => {
    const payload = {
        service_type: formData.service_type, // 追加
        title: formData.title,
        content: formData.content,
        ...
    };
};
```

### 3. フォームにサービス選択を追加

```javascript
<div>
    <label className="block text-sm font-bold text-gray-700 mb-2">
        表示サービス
    </label>
    <select
        value={formData.service_type}
        onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
        className="w-full px-4 py-2 border rounded-lg"
    >
        <option value="profile">プロフィールLPのみ</option>
        <option value="quiz">診断クイズのみ</option>
        <option value="both">両方に表示</option>
    </select>
</div>
```

---

## 実装手順

### ステップ1: データベース更新
1. `supabase_announcements_setup_with_service_type.sql` を実行
2. 既存データがある場合は移行スクリプトを実行

### ステップ2: コンポーネント更新
1. `AnnouncementsPage.jsx` を更新
2. フェッチ処理に `service_type` フィルタを追加
3. フォームに `service_type` 選択を追加

### ステップ3: 診断クイズ側にも同じ実装
1. 診断クイズメーカーの `AnnouncementsPage.jsx` も同様に更新
2. フィルタを `['quiz', 'both']` に変更

---

## データ移行（既存データがある場合）

```sql
-- 既存のお知らせに service_type を追加
-- デフォルトで 'profile' を設定（プロフィールLP用）
ALTER TABLE announcements 
ADD COLUMN IF NOT EXISTS service_type TEXT DEFAULT 'profile';

-- 制約を追加
ALTER TABLE announcements 
ADD CONSTRAINT check_service_type 
CHECK (service_type IN ('quiz', 'profile', 'both'));

-- インデックスを追加
CREATE INDEX IF NOT EXISTS idx_announcements_service_type 
ON announcements(service_type);
```

---

## 使用例

### プロフィールLP専用のお知らせ
```javascript
{
  service_type: 'profile',
  title: 'プロフィールLP新機能リリース',
  content: 'アナリティクス機能を追加しました'
}
```

### 診断クイズ専用のお知らせ
```javascript
{
  service_type: 'quiz',
  title: '診断クイズ新テンプレート追加',
  content: '恋愛診断テンプレートを追加しました'
}
```

### 両サービス共通のお知らせ
```javascript
{
  service_type: 'both',
  title: 'メンテナンスのお知らせ',
  content: '12月15日にシステムメンテナンスを実施します'
}
```

---

## セキュリティ考慮事項

### RLSポリシー
- `service_type` による自動フィルタは**アプリケーション側で実装**
- データベースレベルでは管理者のみが全データにアクセス可能
- 一般ユーザーは `is_active = true` のみ閲覧可能

### 注意点
- クエリ時に必ず `service_type` でフィルタすること
- フィルタ漏れがあると他サービスのお知らせが表示される

---

## トラブルシューティング

### Q: 診断クイズのお知らせがプロフィールLPに表示される
**A:** フェッチ処理の `service_type` フィルタを確認してください

```javascript
// 正しい実装
.in('service_type', ['profile', 'both'])

// 間違った実装（フィルタなし）
.select('*')
```

### Q: 既存のお知らせが表示されない
**A:** 既存データに `service_type` が設定されているか確認してください

```sql
-- 確認クエリ
SELECT id, title, service_type FROM announcements;

-- service_type が NULL の場合は更新
UPDATE announcements 
SET service_type = 'profile' 
WHERE service_type IS NULL;
```

---

## まとめ

✅ **推奨実装: サービス区分カラム追加**
- 1つのテーブルで管理
- `service_type` で区別
- 共通お知らせも可能

この方法なら、診断クイズとプロフィールLPのお知らせを適切に区分けしながら、管理の手間も最小限に抑えられます。

