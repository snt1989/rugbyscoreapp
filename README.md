# ラグビー試合記録アプリ

東北地区大学ラグビーリーグの「試合記録」用紙(A3)を、スマホ・PCで入力できるアプリです。

- 単一ファイル(`index.html`)で動作します。ビルド不要です。
- 入力内容は、ブラウザの localStorage に保存されます。
- メンバー表の取り込み: 表の貼り付け、CSV・テキスト、画像(Claudeのアーティファクト上でのみ画像読み取りが使えます)
- 提出用シートのプレビューと、PDF・HTMLの書き出し

## 使い方
`index.html` をブラウザで開きます。Vercelにデプロイすると、URLだけでスマホから使えます。

## Vercelでの設定(画像読み取りを使う場合)
1. このリポジトリをVercelにImportしてDeployします(ビルド設定は不要です)。
2. Project → Settings → Environment Variables に `ANTHROPIC_API_KEY` と `ROSTER_PASSCODE` を追加します(任意で `ANTHROPIC_MODEL`)。
3. Redeployします。

`api/roster.js` が、メンバー表の画像をClaudeで読み取ります。APIキーがない場合でも、表の貼り付けとCSV取り込みは使えます。
**利用制限(パスコード)**: 環境変数 `ROSTER_PASSCODE` に、好きな文字列を入れると、メンバー表の読み取りボタンを押すと、パスワードの入力が必要になります。
初回に入力すると、その端末に保存されます。未設定のままだと、URLを知っている人は誰でも使えて、利用料はAPIキーの持ち主にかかります。
パスコードなしで使える部分(入力・プレビュー・PDF保存・表の貼り付け)は、制限されません。

## PDF保存
「記録用紙をPDFで保存」は、ブラウザの機能だけでA3の1ページPDFを作って保存します(Chrome・Edge・Firefoxで確認済み)。
Safari(iPhone)でPDFが作れない場合は、「HTMLで保存」→ 印刷 → PDF を使ってください。
