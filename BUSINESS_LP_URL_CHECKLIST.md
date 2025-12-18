# ビジネスLPメーカー URL検証チェックリスト

## 📋 概要

このチェックリストは、プロフィールLPメーカーからビジネスLPメーカーへコードを移行する際に、URLリンクの間違いを防ぐためのものです。

---

## ✅ 実装前チェックリスト

### 1. 公開ページのURL

- [ ] 公開ページのパスは `/b/[slug]` になっているか？
- [ ] プロフィールページへのリンクが `/p/` のままになっていないか？
- [ ] 動的ルーティングは正しく設定されているか？

**確認コマンド**:
```bash
grep -rn "/p/" --include="*.tsx" --include="*.jsx" app/b/ app/business/
```

**正しい例**:
```typescript
// ✅ 正しい
const url = `/b/${slug}`;
<Link href={`/b/${slug}`}>ビジネスLPを見る</Link>

// ❌ 間違い
const url = `/p/${slug}`;
<Link href={`/p/${slug}`}>プロフィールを見る</Link>
```

---

### 2. ダッシュボードのURL

- [ ] ダッシュボードのパスは `/business/dashboard` になっているか？
- [ ] リダイレクト先が `/dashboard` のままになっていないか？
- [ ] ナビゲーション関数は正しいパスを使っているか？

**確認コマンド**:
```bash
grep -rn "'/dashboard'" --include="*.tsx" --include="*.jsx" app/business/
grep -rn '"/dashboard"' --include="*.tsx" --include="*.jsx" app/business/
```

**正しい例**:
```typescript
// ✅ 正しい
window.location.href = '/business/dashboard';
router.push('/business/dashboard');
<Link href="/business/dashboard">ダッシュボード</Link>

// ❌ 間違い
window.location.href = '/dashboard';
router.push('/dashboard');
<Link href="/dashboard">ダッシュボード</Link>
```

---

### 3. エディタのURL

- [ ] 新規作成ページは `/business/dashboard/editor/new` になっているか？
- [ ] 編集ページは `/business/dashboard/editor/[slug]` になっているか？
- [ ] エディタへのリンクは正しいか？

**確認コマンド**:
```bash
grep -rn "editor" --include="*.tsx" --include="*.jsx" app/business/
```

**正しい例**:
```typescript
// ✅ 正しい
<Link href="/business/dashboard/editor/new">新規作成</Link>
<Link href={`/business/dashboard/editor/${slug}`}>編集</Link>

// ❌ 間違い
<Link href="/dashboard/editor/new">新規作成</Link>
<Link href={`/dashboard/editor/${slug}`}>編集</Link>
```

---

### 4. チラシ印刷のURL

- [ ] チラシ印刷ページは `/b/[slug]/flyer` になっているか？
- [ ] チラシへのリンクは正しいか？

**正しい例**:
```typescript
// ✅ 正しい
<Link href={`/b/${slug}/flyer`}>チラシを印刷</Link>
window.open(`/b/${slug}/flyer`, '_blank');

// ❌ 間違い
<Link href={`/p/${slug}/flyer`}>チラシを印刷</Link>
```

---

### 5. API エンドポイントのURL

- [ ] 決済APIは `/api/business-checkout` になっているか？
- [ ] 検証APIは `/api/business-verify` になっているか？
- [ ] 削除APIは `/api/business-delete` になっているか？
- [ ] AI生成APIは `/api/business-generate` になっているか？

**確認コマンド**:
```bash
grep -rn "/api/checkout-profile" --include="*.tsx" --include="*.jsx" --include="*.ts" app/business/
grep -rn "/api/verify-profile" --include="*.tsx" --include="*.jsx" --include="*.ts" app/business/
grep -rn "/api/delete-profile" --include="*.tsx" --include="*.jsx" --include="*.ts" app/business/
grep -rn "/api/generate-profile" --include="*.tsx" --include="*.jsx" --include="*.ts" app/business/
```

**正しい例**:
```typescript
// ✅ 正しい
const response = await fetch('/api/business-checkout', {
  method: 'POST',
  body: JSON.stringify({ projectId, amount })
});

// ❌ 間違い
const response = await fetch('/api/checkout-profile', {
  method: 'POST',
  body: JSON.stringify({ profileId, amount })
});
```

---

### 6. 決済後のリダイレクトURL

- [ ] `success_url` のクエリパラメータは正しいか？
  - `profile_id` → `project_id`
  - `page=dashboard` → `page=business-dashboard`
- [ ] `cancel_url` のクエリパラメータは正しいか？

**確認コマンド**:
```bash
grep -rn "success_url" --include="*.js" app/api/business-checkout/
grep -rn "cancel_url" --include="*.js" app/api/business-checkout/
```

**正しい例**:
```javascript
// ✅ 正しい
success_url: `${origin}/?payment=success&session_id={CHECKOUT_SESSION_ID}&project_id=${projectId}&page=business-dashboard`
cancel_url: `${origin}/?payment=cancel&page=business-dashboard`

// ❌ 間違い
success_url: `${origin}/?payment=success&session_id={CHECKOUT_SESSION_ID}&profile_id=${profileId}&page=dashboard`
cancel_url: `${origin}/?payment=cancel&page=dashboard`
```

---

### 7. クエリパラメータの処理

- [ ] URLパラメータの取得は正しいか？
- [ ] `page=business-dashboard` の処理は実装されているか？
- [ ] `project_id` パラメータの処理は実装されているか？

**確認コマンド**:
```bash
grep -rn "page=dashboard" --include="*.tsx" --include="*.jsx" app/
```

**正しい例**:
```typescript
// ✅ 正しい
const searchParams = new URLSearchParams(window.location.search);
const page = searchParams.get('page');
const projectId = searchParams.get('project_id');

if (page === 'business-dashboard') {
  setPage('business-dashboard');
}

// ❌ 間違い
if (page === 'dashboard') {
  setPage('dashboard');
}
```

---

## 🔍 実装後検証チェックリスト

### 手動テスト

#### 1. 公開ページの表示

- [ ] `/b/test-slug` にアクセスして正しく表示されるか？
- [ ] 404エラーが発生しないか？
- [ ] スタイルは正しく適用されているか？

#### 2. ダッシュボードの動作

- [ ] ログイン後、ダッシュボードに正しくリダイレクトされるか？
- [ ] ダッシュボードのURLは `/business/dashboard` になっているか？
- [ ] プロジェクト一覧が表示されるか？

#### 3. エディタの動作

- [ ] 「新規作成」ボタンをクリックして `/business/dashboard/editor/new` に遷移するか？
- [ ] 「編集」ボタンをクリックして `/business/dashboard/editor/[slug]` に遷移するか？
- [ ] エディタで保存後、正しいURLにリダイレクトされるか？

#### 4. チラシ印刷の動作

- [ ] チラシ印刷ボタンをクリックして `/b/[slug]/flyer` に遷移するか？
- [ ] チラシが正しく表示されるか？
- [ ] 印刷プレビューは正しいか？

#### 5. 決済フローの動作

- [ ] 決済ボタンをクリックしてStripe決済ページに遷移するか？
- [ ] 決済完了後、正しいURLにリダイレクトされるか？
  - `/?payment=success&session_id=xxx&project_id=xxx&page=business-dashboard`
- [ ] ダッシュボードに戻るか？
- [ ] Pro機能が開放されるか？

#### 6. キャンセル時の動作

- [ ] 決済をキャンセルした場合、正しいURLにリダイレクトされるか？
  - `/?payment=cancel&page=business-dashboard`
- [ ] ダッシュボードに戻るか？

---

## 🛠️ デバッグ方法

### URLの確認

```javascript
// コンソールでURLを確認
console.log('Current URL:', window.location.href);
console.log('Pathname:', window.location.pathname);
console.log('Search:', window.location.search);

// クエリパラメータを確認
const params = new URLSearchParams(window.location.search);
console.log('Page:', params.get('page'));
console.log('Project ID:', params.get('project_id'));
console.log('Session ID:', params.get('session_id'));
```

### リダイレクト先の確認

```javascript
// 決済前にリダイレクト先を確認
console.log('Success URL:', session.success_url);
console.log('Cancel URL:', session.cancel_url);
```

### ルーティングの確認

```bash
# Next.jsのルーティングを確認
npm run build
# ビルド結果でルートが正しく生成されているか確認
```

---

## 📝 よくある間違いと修正方法

### 間違い1: ハードコードされたパス

**症状**: ダッシュボードに戻れない

**原因**:
```typescript
// ❌ 間違い
window.location.href = '/dashboard';
```

**修正**:
```typescript
// ✅ 正しい
window.location.href = '/business/dashboard';
```

---

### 間違い2: クエリパラメータの処理漏れ

**症状**: 決済後にダッシュボードに戻らない

**原因**:
```typescript
// ❌ 間違い
if (page === 'dashboard') {
  setPage('dashboard');
}
```

**修正**:
```typescript
// ✅ 正しい
if (page === 'business-dashboard') {
  setPage('business-dashboard');
}
```

---

### 間違い3: API エンドポイントの間違い

**症状**: 決済が開始されない

**原因**:
```typescript
// ❌ 間違い
fetch('/api/checkout-profile', { ... });
```

**修正**:
```typescript
// ✅ 正しい
fetch('/api/business-checkout', { ... });
```

---

### 間違い4: リダイレクトURLの設定ミス

**症状**: 決済完了後に404エラー

**原因**:
```javascript
// ❌ 間違い
success_url: `${origin}/?payment=success&profile_id=${profileId}&page=dashboard`
```

**修正**:
```javascript
// ✅ 正しい
success_url: `${origin}/?payment=success&project_id=${projectId}&page=business-dashboard`
```

---

## 🔧 自動検証スクリプト

### PowerShellスクリプト

```powershell
# check-urls.ps1
# ビジネスLPプロジェクトのルートディレクトリで実行

Write-Host "=== ビジネスLP URL検証スクリプト ===" -ForegroundColor Cyan
Write-Host ""

# 1. /p/ の検索
Write-Host "1. /p/ パスの検索..." -ForegroundColor Yellow
$results1 = Select-String -Path "app\business\**\*.tsx","app\business\**\*.jsx","app\b\**\*.tsx","app\b\**\*.jsx" -Pattern "/p/" -SimpleMatch
if ($results1) {
    Write-Host "⚠️ 警告: /p/ パスが見つかりました" -ForegroundColor Red
    $results1 | ForEach-Object { Write-Host "  - $($_.Path):$($_.LineNumber)" -ForegroundColor Red }
} else {
    Write-Host "✅ /p/ パスは見つかりませんでした" -ForegroundColor Green
}
Write-Host ""

# 2. /dashboard の検索（/business/dashboard を除く）
Write-Host "2. /dashboard パスの検索..." -ForegroundColor Yellow
$results2 = Select-String -Path "app\business\**\*.tsx","app\business\**\*.jsx" -Pattern '"/dashboard"' -SimpleMatch | Where-Object { $_.Line -notmatch "/business/dashboard" }
if ($results2) {
    Write-Host "⚠️ 警告: /dashboard パスが見つかりました" -ForegroundColor Red
    $results2 | ForEach-Object { Write-Host "  - $($_.Path):$($_.LineNumber)" -ForegroundColor Red }
} else {
    Write-Host "✅ /dashboard パスは見つかりませんでした" -ForegroundColor Green
}
Write-Host ""

# 3. page=dashboard の検索
Write-Host "3. page=dashboard パラメータの検索..." -ForegroundColor Yellow
$results3 = Select-String -Path "app\api\business-**\*.js" -Pattern "page=dashboard" -SimpleMatch
if ($results3) {
    Write-Host "⚠️ 警告: page=dashboard パラメータが見つかりました" -ForegroundColor Red
    $results3 | ForEach-Object { Write-Host "  - $($_.Path):$($_.LineNumber)" -ForegroundColor Red }
} else {
    Write-Host "✅ page=dashboard パラメータは見つかりませんでした" -ForegroundColor Green
}
Write-Host ""

# 4. プロフィールLP用APIの検索
Write-Host "4. プロフィールLP用APIエンドポイントの検索..." -ForegroundColor Yellow
$apis = @("/api/checkout-profile", "/api/verify-profile", "/api/delete-profile", "/api/generate-profile")
$foundApis = $false
foreach ($api in $apis) {
    $results4 = Select-String -Path "app\business\**\*.tsx","app\business\**\*.jsx","app\business\**\*.ts" -Pattern $api -SimpleMatch
    if ($results4) {
        Write-Host "⚠️ 警告: $api が見つかりました" -ForegroundColor Red
        $results4 | ForEach-Object { Write-Host "  - $($_.Path):$($_.LineNumber)" -ForegroundColor Red }
        $foundApis = $true
    }
}
if (-not $foundApis) {
    Write-Host "✅ プロフィールLP用APIエンドポイントは見つかりませんでした" -ForegroundColor Green
}
Write-Host ""

# 5. profile_id パラメータの検索
Write-Host "5. profile_id パラメータの検索..." -ForegroundColor Yellow
$results5 = Select-String -Path "app\api\business-**\*.js" -Pattern "profile_id" -SimpleMatch
if ($results5) {
    Write-Host "⚠️ 警告: profile_id パラメータが見つかりました" -ForegroundColor Red
    $results5 | ForEach-Object { Write-Host "  - $($_.Path):$($_.LineNumber)" -ForegroundColor Red }
} else {
    Write-Host "✅ profile_id パラメータは見つかりませんでした" -ForegroundColor Green
}
Write-Host ""

Write-Host "=== 検証完了 ===" -ForegroundColor Cyan
```

### 実行方法

```powershell
# PowerShellスクリプトを実行
.\check-urls.ps1
```

---

## 📚 参考資料

- [BUSINESS_LP_INTEGRATION_GUIDE.md](BUSINESS_LP_INTEGRATION_GUIDE.md) - 統合ガイド
- [BUSINESS_LP_SETUP_GUIDE.md](BUSINESS_LP_SETUP_GUIDE.md) - セットアップガイド
- [PROJECT_SPECIFICATION.md](PROJECT_SPECIFICATION.md) - プロジェクト仕様書

---

**最終更新日**: 2024年12月18日

**バージョン**: 1.0.0

