# よくある質問（FAQ）

## セッション管理

### Q: コンテキストが切れて、エージェントが前の作業を忘れた

A: コンテキスト圧縮が発生しています。Claude Code は自動で復帰を試みますが、以下を確認してください:

1. `.agents/PROJECT.md` の Activity Log に前の作業が記録されているか
2. `git log` で直近のコミットを確認
3. 必要なら手動で状況を伝え直す

### Q: エージェントが勝手にコミットした

A: Permissions 設定（`.claude/settings.json`）で `git commit` を deny リストに入れることで防止できます。
または、CLAUDE.md に「コミットはユーザーの明示的な指示があるまで行わない」と記載してください。

## セキュリティ

### Q: シークレットキーが漏洩しないか

A: 複数のレイヤーで保護されています:

1. **Tool Risk Hooks**: `install.sh --with-hooks` で導入される PreToolUse Hook が、ツール実行前にリスクを3段階（HIGH/MEDIUM/LOW）で分類。HIGH リスク操作には確認ダイアログが表示されます
2. **Secret Detection**: `.claude/settings.json` の deny リストで `.env` ファイルの `git add` をブロック
3. **Permissions 設定**: `settings.json` で許可するコマンドをホワイトリスト管理。想定外のコマンド実行を防止
4. エージェントは認証情報をコード内にハードコードしないよう訓練されています

### Q: エージェントが本番環境に影響を与えないか心配

A: 以下のガードレールが設定されています:
- `.claude/settings.json` の deny リストで危険なコマンドをブロック（`rm -rf`、`sudo`、`git push --force` 等）
- PROJECT_CONTEXT.md で本番 DB は READ ONLY のみと明記可能
- ガードレール L4（critical_security）で即時停止
- Tool Risk Hooks で破壊的操作を事前検出

### Q: API キーやパスワードが漏れないか

A: `.claude/settings.json` で `.env` ファイルの `git add` を deny しています。
加えて、`--with-hooks` オプションで導入される PostToolUse Hook がツール実行後のログを記録し、意図しない情報流出を検出できます。

### Q: Hooks（フック）とは何か

A: Goto Orchestrator が提供する3つのフック:

| Hook | タイミング | 役割 |
|------|-----------|------|
| PreToolUse (tool-risk.js) | ツール実行前 | リスク分類（HIGH/MEDIUM/LOW）と確認 |
| PostToolUse (post-tool-use.js) | ツール実行後 | 実行ログの記録 |
| Stop (stop-hook.js) | セッション終了時 | セッションサマリの出力 |

`install.sh --with-hooks` で有効化されます。セキュリティ重視のプロジェクトでは導入を強く推奨します。

## エージェント選択

### Q: どのエージェントを使えばいいかわからない

A: [エージェント選択ガイド](./AGENT_SELECTION.md) を参照してください。
迷ったら `/nexus` に任せると、タスクに応じて最適なチェーンを自動選択します。

### Q: エージェントの出力が期待と違う

A: 以下を試してください:
1. タスクの説明をより具体的にする
2. 期待する出力形式を明示する
3. CLAUDE.md にプロジェクト固有のルールを追記する

## コスト・パフォーマンス

### Q: どれくらいのコストがかかる？

A: Claude Code の利用料金は Anthropic のプラン（Max $100/200）に含まれます。
追加コストが発生するのは:
- GitHub Codespaces を使用する場合（$0.18〜0.72/時間）
- 外部 API を利用するエージェント

### Q: エージェントの処理が遅い

A: 以下を確認してください:
1. 不要に大きなモデルを使っていないか（Haiku で十分なタスクに Opus を使っていないか）
2. 並列実行（Rally）で分散できないか
3. Cloud 実行（Codespaces）でオフロードできないか
