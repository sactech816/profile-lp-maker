# Googleスプレッドシート連携セットアップガイド

このガイドでは、ユーザー情報を自動的にGoogleスプレッドシートに送信する機能の設定方法を説明します。

## 概要

管理者ダッシュボードから「スプレッドシートに送信」ボタンをクリックすると、全ユーザーの情報がGoogleスプレッドシートに自動的に追加されます。

## セットアップ手順

### 1. Googleスプレッドシートの作成

1. [Google スプレッドシート](https://sheets.google.com/)にアクセス
2. 新しいスプレッドシートを作成
3. シート名を「ユーザー情報」などに変更（任意）

### 2. Google Apps Scriptの設定

1. スプレッドシートで「拡張機能」→「Apps Script」を開く
2. 以下のコードを貼り付けます：

```javascript
function doPost(e) {
  try {
    // リクエストボディをパース
    const data = JSON.parse(e.postData.contents);
    const users = data.users;
    const exportedAt = data.exported_at;
    
    // アクティブなスプレッドシートを取得
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // ヘッダー行が存在しない場合は追加
    if (sheet.getLastRow() === 0) {
      const headers = [
        'ユーザーID',
        'メールアドレス',
        '登録日時',
        '最終ログイン日時',
        'メール確認日時',
        '診断クイズ作成数',
        '診断クイズ購入数',
        'LPプロフィール作成数',
        'LPプロフィール購入数',
        'エクスポート日時'
      ];
      sheet.appendRow(headers);
      
      // ヘッダー行のスタイル設定
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#4285f4');
      headerRange.setFontColor('#ffffff');
    }
    
    // 既存のデータをクリア（ヘッダー以外）
    if (sheet.getLastRow() > 1) {
      sheet.deleteRows(2, sheet.getLastRow() - 1);
    }
    
    // 新しいデータを追加
    users.forEach(user => {
      sheet.appendRow([
        user.user_id,
        user.email,
        user.created_at,
        user.last_sign_in_at,
        user.confirmed_at,
        user.quiz_count || 0,
        user.quiz_purchase_count || 0,
        user.profile_count || 0,
        user.profile_purchase_count || 0,
        new Date(exportedAt).toLocaleString('ja-JP')
      ]);
    });
    
    // 列幅を自動調整
    sheet.autoResizeColumns(1, 10);
    
    // 成功レスポンスを返す
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: `${users.length}件のユーザー情報を追加しました`,
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // エラーレスポンスを返す
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

3. 「プロジェクト設定」（歯車アイコン）をクリック
4. 「タイムゾーン」を「(GMT+09:00) 日本標準時 - 東京」に設定

### 3. Apps Scriptのデプロイ

1. 右上の「デプロイ」→「新しいデプロイ」をクリック
2. 「種類の選択」で「ウェブアプリ」を選択
3. 以下の設定を行います：
   - **説明**: 「ユーザー情報インポート」（任意）
   - **次のユーザーとして実行**: 「自分」
   - **アクセスできるユーザー**: 「全員」
4. 「デプロイ」をクリック
5. 権限の承認画面が表示されたら：
   - 「アクセスを承認」をクリック
   - Googleアカウントを選択
   - 「詳細」→「（プロジェクト名）に移動」をクリック
   - 「許可」をクリック
6. **ウェブアプリのURL**をコピー（例: `https://script.google.com/macros/s/AKfycby.../exec`）

### 4. 環境変数の設定

#### Vercelの場合

1. Vercelダッシュボードでプロジェクトを開く
2. 「Settings」→「Environment Variables」を開く
3. 以下の環境変数を追加：
   - **Name**: `GOOGLE_SHEETS_WEBHOOK_URL`
   - **Value**: コピーしたウェブアプリのURL
   - **Environment**: Production, Preview, Development（すべて選択）
4. 「Save」をクリック
5. プロジェクトを再デプロイ

#### ローカル開発環境の場合

`.env.local`ファイルに以下を追加：

```bash
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/AKfycby.../exec
```

### 5. 動作確認

1. アプリケーションにログイン（管理者アカウント）
2. ダッシュボードを開く
3. 左側のサイドバーに「ユーザー情報エクスポート」セクションが表示されることを確認
4. 「スプレッドシートに送信」ボタンをクリック
5. Googleスプレッドシートを開いて、データが追加されていることを確認

## トラブルシューティング

### エラー: "Google Sheets Webhook URL not configured"

環境変数 `GOOGLE_SHEETS_WEBHOOK_URL` が設定されていません。上記の「4. 環境変数の設定」を確認してください。

### データが送信されない

1. Apps ScriptのウェブアプリURLが正しいか確認
2. Apps Scriptのデプロイ設定で「アクセスできるユーザー」が「全員」になっているか確認
3. ブラウザの開発者ツールでネットワークエラーを確認

### 権限エラー

Apps Scriptの実行権限を再度承認してください：
1. Apps Scriptエディタで「実行」→「doPost」を選択
2. 権限の承認を行う

## データ形式

スプレッドシートに追加されるデータ：

| 列名 | 説明 |
|------|------|
| ユーザーID | Supabase AuthのユーザーID |
| メールアドレス | ユーザーのメールアドレス |
| 登録日時 | アカウント作成日時 |
| 最終ログイン日時 | 最後にログインした日時 |
| メール確認日時 | メールアドレスを確認した日時 |
| 診断クイズ作成数 | 作成した診断クイズの数 |
| 診断クイズ購入数 | 診断クイズPro機能の購入回数 |
| LPプロフィール作成数 | 作成したLPプロフィールの数 |
| LPプロフィール購入数 | LPプロフィールPro機能の購入回数 |
| エクスポート日時 | データをエクスポートした日時 |

## セキュリティに関する注意

- Googleスプレッドシートの共有設定に注意してください
- 個人情報が含まれるため、適切なアクセス制限を設定することを推奨します
- ウェブアプリのURLは秘密情報として扱ってください

## 定期的な自動エクスポート（オプション）

定期的に自動でエクスポートしたい場合は、以下のような方法があります：

### Vercel Cronを使用する場合

1. `vercel.json`に以下を追加：

```json
{
  "crons": [{
    "path": "/api/cron/export-users",
    "schedule": "0 0 * * *"
  }]
}
```

2. `/api/cron/export-users/route.ts`を作成して、自動エクスポート処理を実装

詳細は[Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)を参照してください。

## サポート

問題が解決しない場合は、開発者にお問い合わせください。

