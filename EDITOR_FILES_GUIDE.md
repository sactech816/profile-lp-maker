# エディタ関連ファイル一覧と説明

## 📁 エディタに関するファイル

プロフィールLPメーカーのエディタ機能は、以下のファイルで構成されています。

---

## 1. コアファイル

### 🎨 `components/ProfileEditor.tsx`
**役割**: エディタのメインコンポーネント（2372行）

**主な機能**:
- ブロックの追加・編集・削除・並び替え
- リアルタイムプレビュー
- 画像アップロード
- テーマ・背景設定
- AI自動生成
- テンプレート適用
- 保存・公開処理
- アナリティクス表示
- QRコード生成
- 計測タグ設定

**主要なState**:
```typescript
- blocks: Block[]                    // ブロックデータ
- theme: { gradient, backgroundImage } // テーマ設定
- settings: { gtmId, fbPixelId, lineTagId } // 計測タグ
- featuredOnTop: boolean             // トップページ掲載フラグ
- analytics: { views, clicks, ... }  // アナリティクスデータ
```

**主要な関数**:
```typescript
- handleSave()              // プロフィール保存
- addBlock(type)            // ブロック追加
- updateBlock(id, data)     // ブロック更新
- deleteBlock(id)           // ブロック削除
- moveBlock(from, to)       // ブロック移動
- uploadImageViaApi()       // 画像アップロード
- generateWithAI()          // AI自動生成
- applyTemplate()           // テンプレート適用
```

**依存関係**:
- `@/lib/types` - 型定義
- `@/lib/supabase` - Supabaseクライアント
- `@/app/actions/profiles` - プロフィール保存
- `@/app/actions/analytics` - アナリティクス取得
- `@/constants/templates` - テンプレート定義
- `@/components/BlockRenderer` - ブロックレンダリング

---

### 📄 `app/dashboard/editor/[slug]/page.tsx`
**役割**: 既存プロフィールの編集ページ

**機能**:
- URLパラメータ `[slug]` から編集対象を特定
- ユーザー認証チェック
- ProfileEditorコンポーネントをマウント
- 保存後の処理

**ルーティング**:
```
/dashboard/editor/my-profile  → 'my-profile'を編集
```

**コード概要**:
```typescript
export default function ProfileEditorPage() {
  const params = useParams();
  const slug = params?.slug as string;
  
  // ユーザー認証
  const [user, setUser] = useState<any>(null);
  
  // ProfileEditorに渡す
  return (
    <ProfileEditor
      user={user}
      initialSlug={slug}
      onBack={() => router.push('/dashboard')}
      onSave={(data) => console.log('保存完了', data)}
    />
  );
}
```

---

### 📄 `app/dashboard/editor/new/page.tsx`
**役割**: 新規プロフィール作成ページ

**機能**:
- 新規作成モードでProfileEditorをマウント
- ユーザー認証チェック
- 保存後、ダッシュボードにリダイレクト

**ルーティング**:
```
/dashboard/editor/new  → 新規作成
```

**コード概要**:
```typescript
export default function NewProfilePage() {
  const [user, setUser] = useState<any>(null);
  
  return (
    <ProfileEditor
      user={user}
      initialSlug={null}  // 新規作成
      onBack={() => router.push('/dashboard')}
      onSave={() => router.push('/dashboard')}
    />
  );
}
```

---

## 2. データ・型定義ファイル

### 📦 `lib/types.ts`
**役割**: TypeScriptの型定義

**定義されている型**:
```typescript
// ブロックの基本型
export type Block = 
  | { id: string; type: 'header'; data: HeaderBlockData }
  | { id: string; type: 'text_card'; data: TextCardBlockData }
  | { id: string; type: 'image'; data: ImageBlockData }
  | { id: string; type: 'youtube'; data: YouTubeBlockData }
  | { id: string; type: 'links'; data: LinksBlockData }
  | { id: string; type: 'kindle'; data: KindleBlockData }
  | { id: string; type: 'lead_form'; data: LeadFormBlockData }
  | { id: string; type: 'line_card'; data: LineCardBlockData }
  | { id: string; type: 'faq'; data: FAQBlockData }
  | { id: string; type: 'pricing'; data: PricingBlockData }
  | { id: string; type: 'testimonial'; data: TestimonialBlockData }
  | { id: string; type: 'quiz'; data: QuizBlockData };

// プロフィール設定
export type ProfileSettings = {
  gtmId?: string;
  fbPixelId?: string;
  lineTagId?: string;
  theme?: {
    gradient?: string;
    backgroundImage?: string;
  };
};

// プロフィールデータ
export interface Profile {
  id: string;
  slug: string;
  content: Block[];
  user_id?: string | null;
  created_at?: string;
  updated_at?: string;
  settings?: ProfileSettings;
  featured_on_top?: boolean;
}
```

**ユーティリティ関数**:
```typescript
// 一意のブロックIDを生成
export function generateBlockId(): string

// 旧形式のデータを新形式に変換
export function migrateOldContent(oldContent: any): Block[]
```

---

### 📦 `constants/templates.ts`
**役割**: テンプレートの定義

**構造**:
```typescript
export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  theme: {
    gradient: string;
    backgroundImage?: string;
  };
  blocks: Block[];
}

export const templates: Template[] = [
  // ビジネス・コンサルタント
  {
    id: 'business-consultant',
    name: 'ビジネス・コンサルタント',
    description: '信頼と権威性を重視したビジネス向けテンプレート',
    category: 'ビジネス',
    theme: { gradient: '...' },
    blocks: [...]
  },
  
  // Kindle作家・コンテンツ販売
  {
    id: 'kindle-author',
    name: 'Kindle作家・コンテンツ販売',
    description: '販売と集客を重視したコンテンツ販売向けテンプレート',
    category: 'コンテンツ',
    theme: { gradient: '...' },
    blocks: [...]
  },
  
  // メンタルコーチ・サロン
  {
    id: 'mental-coach',
    name: 'メンタルコーチ・サロン',
    description: '安心感と世界観を重視したコーチング向けテンプレート',
    category: 'コーチング',
    theme: { gradient: '...' },
    blocks: [...]
  }
];
```

**使用方法**:
```typescript
import { templates } from '@/constants/templates';

// テンプレート一覧を表示
templates.map(t => (
  <div key={t.id}>{t.name}</div>
));

// テンプレートを適用
const applyTemplate = (templateId: string) => {
  const template = templates.find(t => t.id === templateId);
  if (template) {
    setBlocks(template.blocks);
    setTheme(template.theme);
  }
};
```

---

## 3. Server Actions（バックエンド処理）

### ⚙️ `app/actions/profiles.ts`
**役割**: プロフィールの保存処理（Server Action）

**関数**:
```typescript
export async function saveProfile(data: {
  slug: string;
  content: Block[];
  settings: any;
  userId: string | null;
  featuredOnTop?: boolean;
}) {
  // Supabaseにupsert（挿入または更新）
  const { data: result, error } = await supabase
    .from('profiles')
    .upsert({
      slug: data.slug,
      content: data.content,
      settings: data.settings,
      user_id: data.userId,
      featured_on_top: data.featuredOnTop ?? true,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'slug'  // slugが重複した場合は更新
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  return { success: true, data: result };
}
```

**使用方法**:
```typescript
import { saveProfile } from '@/app/actions/profiles';

const handleSave = async () => {
  const result = await saveProfile({
    slug: 'my-profile',
    content: blocks,
    settings: settings,
    userId: user.id,
    featuredOnTop: true
  });

  if (result.error) {
    alert('保存に失敗しました: ' + result.error);
  } else {
    alert('保存しました！');
  }
};
```

---

### ⚙️ `app/actions/analytics.ts`
**役割**: アナリティクスデータの取得（Server Action）

**関数**:
```typescript
export async function getAnalytics(profileId: string) {
  // ページビュー数
  const views = await supabase
    .from('analytics')
    .select('id', { count: 'exact' })
    .eq('profile_id', profileId)
    .eq('event_type', 'view');

  // クリック数
  const clicks = await supabase
    .from('analytics')
    .select('id', { count: 'exact' })
    .eq('profile_id', profileId)
    .eq('event_type', 'click');

  // クリック率
  const clickRate = views.count > 0 
    ? (clicks.count / views.count * 100).toFixed(1) 
    : '0.0';

  // 精読率
  const reads = await supabase
    .from('analytics')
    .select('id', { count: 'exact' })
    .eq('profile_id', profileId)
    .eq('event_type', 'read');

  const readRate = views.count > 0 
    ? (reads.count / views.count * 100).toFixed(1) 
    : '0.0';

  // 平均滞在時間
  const times = await supabase
    .from('analytics')
    .select('event_data')
    .eq('profile_id', profileId)
    .eq('event_type', 'time');

  const avgTimeSpent = times.data.length > 0
    ? Math.round(
        times.data.reduce((sum, t) => sum + (t.event_data?.timeSpent || 0), 0) 
        / times.data.length
      )
    : 0;

  return {
    views: views.count || 0,
    clicks: clicks.count || 0,
    clickRate,
    readRate,
    avgTimeSpent
  };
}
```

---

## 4. APIルート

### 🔌 `app/api/upload-image/route.js`
**役割**: 画像アップロード処理

**機能**:
- FormDataから画像ファイルを受け取る
- Supabase Storageにアップロード
- 公開URLを返す

**エンドポイント**:
```
POST /api/upload-image
```

**リクエスト**:
```javascript
const formData = new FormData();
formData.append('file', file);
formData.append('folder', userId);
formData.append('fileName', 'avatar_123.jpg');

const response = await fetch('/api/upload-image', {
  method: 'POST',
  body: formData
});

const { publicUrl } = await response.json();
```

---

### 🔌 `app/api/generate-profile/route.js`
**役割**: AI自動生成処理

**機能**:
- OpenAI APIを使用してプロフィールを自動生成
- 職業、ターゲット、強みからコンテンツを生成

**エンドポイント**:
```
POST /api/generate-profile
```

**リクエスト**:
```javascript
const response = await fetch('/api/generate-profile', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    occupation: 'Webデザイナー',
    target: 'スタートアップ企業',
    strengths: 'UI/UXデザイン、ブランディング'
  })
});

const { blocks } = await response.json();
```

---

## 5. レンダリング・表示ファイル

### 🎨 `components/BlockRenderer.tsx`
**役割**: ブロックの表示コンポーネント

**機能**:
- ブロックタイプに応じて適切なコンポーネントをレンダリング
- プレビューモードと公開モードの切り替え

**使用方法**:
```typescript
import { BlockRenderer } from '@/components/BlockRenderer';

<BlockRenderer 
  block={block} 
  isPreview={true}
  profileId={profileId}
/>
```

**対応ブロック**:
- HeaderBlock
- TextCardBlock
- ImageBlock
- YouTubeBlock
- LinksBlock
- KindleBlock
- LeadFormBlock
- LineCardBlock
- FAQBlock
- PricingBlock
- TestimonialBlock
- QuizBlock

---

### 🎨 `lib/profileHtmlGenerator.ts`
**役割**: 静的HTMLの生成（HTMLダウンロード機能）

**機能**:
- プロフィールデータから完全な静的HTMLを生成
- CSS、JavaScript込みの単一HTMLファイル
- 外部依存なしで動作

**使用方法**:
```typescript
import { generateProfileHtml } from '@/lib/profileHtmlGenerator';

const html = generateProfileHtml({
  slug: 'my-profile',
  content: blocks,
  settings: settings
});

// HTMLファイルとしてダウンロード
const blob = new Blob([html], { type: 'text/html' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'my-profile.html';
a.click();
```

---

## 6. ユーティリティファイル

### 🔧 `lib/utils.js`
**役割**: 汎用ユーティリティ関数

**主な関数**:
```javascript
// スラッグ生成（URL用）
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// 日付フォーマット
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('ja-JP');
}

// ファイルサイズのフォーマット
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
```

---

## 7. データベース接続

### 🗄️ `lib/supabase.js`
**役割**: Supabaseクライアントの初期化

**コード**:
```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
```

**使用方法**:
```typescript
import { supabase } from '@/lib/supabase';

// データ取得
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('slug', 'my-profile')
  .single();

// データ挿入
const { data, error } = await supabase
  .from('profiles')
  .insert({ slug: 'my-profile', content: [...] });

// データ更新
const { data, error } = await supabase
  .from('profiles')
  .update({ content: [...] })
  .eq('slug', 'my-profile');

// データ削除
const { data, error } = await supabase
  .from('profiles')
  .delete()
  .eq('slug', 'my-profile');
```

---

## エディタの動作フロー

### 1. 新規作成フロー
```
1. ユーザーが「新規作成」ボタンをクリック
   ↓
2. /dashboard/editor/new に遷移
   ↓
3. ProfileEditorがマウント（initialSlug=null）
   ↓
4. デフォルトブロックを表示（ヘッダー、テキストカード、リンク）
   ↓
5. ユーザーがブロックを追加・編集
   ↓
6. 「保存」ボタンをクリック
   ↓
7. saveProfile() Server Actionを実行
   ↓
8. Supabaseにデータを保存
   ↓
9. ダッシュボードにリダイレクト
```

### 2. 編集フロー
```
1. ダッシュボードで「編集」ボタンをクリック
   ↓
2. /dashboard/editor/[slug] に遷移
   ↓
3. ProfileEditorがマウント（initialSlug='my-profile'）
   ↓
4. Supabaseから既存データを読み込み
   ↓
5. ブロックデータをセット
   ↓
6. ユーザーがブロックを編集
   ↓
7. 「保存」ボタンをクリック
   ↓
8. saveProfile() Server Actionを実行（upsert）
   ↓
9. Supabaseのデータを更新
   ↓
10. 「保存しました」メッセージを表示
```

### 3. テンプレート適用フロー
```
1. エディタで「テンプレート」ボタンをクリック
   ↓
2. テンプレート一覧モーダルを表示
   ↓
3. テンプレートを選択
   ↓
4. template.blocks をコピー
   ↓
5. setBlocks(template.blocks)
   ↓
6. setTheme(template.theme)
   ↓
7. プレビューに即座に反映
   ↓
8. ユーザーが必要に応じて編集
   ↓
9. 保存
```

### 4. AI自動生成フロー
```
1. エディタで「AI自動生成」ボタンをクリック
   ↓
2. AIモーダルを表示
   ↓
3. 職業、ターゲット、強みを入力
   ↓
4. 「生成」ボタンをクリック
   ↓
5. /api/generate-profile にPOST
   ↓
6. OpenAI APIでコンテンツ生成
   ↓
7. 生成されたブロックを返す
   ↓
8. setBlocks(generatedBlocks)
   ↓
9. プレビューに反映
   ↓
10. ユーザーが編集・保存
```

---

## エディタのカスタマイズ方法

### 新しいブロックタイプを追加する

#### 1. 型定義を追加（`lib/types.ts`）
```typescript
export type CustomBlockData = {
  title: string;
  content: string;
};

export type Block = 
  | { id: string; type: 'header'; data: HeaderBlockData }
  | { id: string; type: 'custom'; data: CustomBlockData }  // 追加
  | ...
```

#### 2. エディタに追加ボタンを追加（`ProfileEditor.tsx`）
```typescript
const blockTypes = [
  { type: 'header', icon: User, label: 'ヘッダー' },
  { type: 'custom', icon: Star, label: 'カスタム' },  // 追加
  ...
];
```

#### 3. 編集UIを追加（`ProfileEditor.tsx`）
```typescript
{block.type === 'custom' && (
  <div>
    <Input 
      label="タイトル" 
      val={block.data.title} 
      onChange={(v) => updateBlock(block.id, { title: v })}
    />
    <Textarea 
      label="内容" 
      val={block.data.content} 
      onChange={(v) => updateBlock(block.id, { content: v })}
    />
  </div>
)}
```

#### 4. レンダラーに表示処理を追加（`BlockRenderer.tsx`）
```typescript
if (block.type === 'custom') {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-xl font-bold">{block.data.title}</h3>
      <p>{block.data.content}</p>
    </div>
  );
}
```

---

## まとめ

### エディタの中核ファイル
1. **`components/ProfileEditor.tsx`** - エディタ本体（最重要）
2. **`lib/types.ts`** - 型定義
3. **`app/actions/profiles.ts`** - 保存処理
4. **`constants/templates.ts`** - テンプレート

### ページファイル
1. **`app/dashboard/editor/[slug]/page.tsx`** - 編集ページ
2. **`app/dashboard/editor/new/page.tsx`** - 新規作成ページ

### サポートファイル
1. **`components/BlockRenderer.tsx`** - ブロック表示
2. **`lib/profileHtmlGenerator.ts`** - HTML生成
3. **`app/api/upload-image/route.js`** - 画像アップロード
4. **`app/api/generate-profile/route.js`** - AI生成

これらのファイルを理解すれば、エディタ機能の全体像が把握できます！

