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

## 安全性

### Q: エージェントが本番環境に影響を与えないか心配

A: 以下のガードレールが設定されています:
- `.claude/settings.json` の deny リストで危険なコマンドをブロック
- LUNA_CONTEXT.md で本番 DB は READ ONLY のみと明記
- ガードレール L4（critical_security）で即時停止

### Q: Luna-company のリポジトリを間違えて編集しないか

A: 以下の多層防御で保護されています:
1. GitHub 側で read-only 権限
2. git pushurl の無効化
3. pre-push hook
4. Claude Code の deny rules
5. LUNA_CONTEXT.md のポリシー

### Q: API キーやパスワードが漏れないか

A: `.claude/settings.json` で `.env` ファイルの `git add` を deny しています。
また、エージェントは認証情報をコード内にハードコードしないよう訓練されています。

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
- 外部 API を利用するエージェント（Analyst の Redash 等）

### Q: エージェントの処理が遅い

A: 以下を確認してください:
1. 不要に大きなモデルを使っていないか（Haiku で十分なタスクに Opus を使っていないか）
2. 並列実行（Rally）で分散できないか
3. Cloud 実行（Codespaces）でオフロードできないか
