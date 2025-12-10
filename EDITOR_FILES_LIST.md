# エディタ関連ファイル一覧（簡易版）

## 🎯 エディタの中核ファイル

### 1. メインコンポーネント
```
components/ProfileEditor.tsx (2372行)
```
- **役割**: エディタ本体
- **機能**: ブロック追加・編集・削除・並び替え、画像アップロード、AI生成、テンプレート適用、保存処理

### 2. ページファイル
```
app/dashboard/editor/[slug]/page.tsx
app/dashboard/editor/new/page.tsx
```
- **役割**: 編集ページと新規作成ページ
- **機能**: ProfileEditorコンポーネントをマウント

### 3. 型定義
```
lib/types.ts
```
- **役割**: TypeScript型定義
- **内容**: Block型、Profile型、各ブロックのデータ型

### 4. テンプレート
```
constants/templates.ts
```
- **役割**: テンプレート定義
- **内容**: 3つの業種別テンプレート

### 5. Server Actions
```
app/actions/profiles.ts
app/actions/analytics.ts
```
- **役割**: バックエンド処理
- **機能**: プロフィール保存、アナリティクス取得

### 6. API Routes
```
app/api/upload-image/route.js
app/api/generate-profile/route.js
```
- **役割**: 画像アップロード、AI生成

### 7. レンダリング
```
components/BlockRenderer.tsx
lib/profileHtmlGenerator.ts
```
- **役割**: ブロック表示、HTML生成

### 8. データベース接続
```
lib/supabase.js
```
- **役割**: Supabaseクライアント初期化

---

## 📊 ファイル依存関係

```
ProfileEditor.tsx
├── lib/types.ts (型定義)
├── lib/supabase.js (DB接続)
├── app/actions/profiles.ts (保存処理)
├── app/actions/analytics.ts (アナリティクス)
├── constants/templates.ts (テンプレート)
├── components/BlockRenderer.tsx (ブロック表示)
└── lib/utils.js (ユーティリティ)

[slug]/page.tsx → ProfileEditor.tsx
new/page.tsx → ProfileEditor.tsx
```

---

## 🔧 カスタマイズ時に編集するファイル

### 新しいブロックタイプを追加する場合
1. `lib/types.ts` - 型定義を追加
2. `components/ProfileEditor.tsx` - 編集UIを追加
3. `components/BlockRenderer.tsx` - 表示処理を追加
4. `lib/profileHtmlGenerator.ts` - HTML生成処理を追加

### テンプレートを追加する場合
1. `constants/templates.ts` - テンプレート定義を追加

### 保存処理を変更する場合
1. `app/actions/profiles.ts` - Server Actionを編集

---

## 📝 詳細ドキュメント

詳しい説明は以下のドキュメントを参照してください:
- [EDITOR_FILES_GUIDE.md](EDITOR_FILES_GUIDE.md) - 詳細なファイル説明
- [PROJECT_SPECIFICATION.md](PROJECT_SPECIFICATION.md) - 総合仕様書
- [REQUIREMENTS.md](REQUIREMENTS.md) - 要件定義書

