# クイックスタートガイド

## 前提条件

- [Claude Code](https://claude.ai/claude-code) がインストール済み
- GitHub CLI (`gh`) が認証済み
- Node.js 18+ がインストール済み

## インストール

プロジェクトのルートディレクトリで:

```bash
# 全68エージェントをインストール
curl -sL https://raw.githubusercontent.com/Luna-company/agent-orchestrator/main/install.sh | bash

# よく使うエージェントのみ
curl -sL https://raw.githubusercontent.com/Luna-company/agent-orchestrator/main/install.sh | bash -s -- nexus builder radar scout

# MCP連携付き
./install.sh --with-mcp

# Permissions設定付き
./install.sh --with-permissions
```

## インストールされるもの

```
.claude/
├── agents/          # エージェント定義（68個）
│   └── _framework.md  # フレームワークプロトコル
├── commands/        # カスタムスラッシュコマンド（6個）
├── settings.json    # 安全なPermissions設定（--with-permissions時）
└── scripts/         # MCP・Cloud実行スクリプト
.agents/
├── PROJECT.md       # 共有ナレッジ（チーム全体で蓄積）
└── LUNA_CONTEXT.md  # ビジネスコンテキスト
```

## 最初の実行

```bash
# Claude Code を起動
claude

# エージェントを使う（例）
> /scout このエラーの原因を調査して
> /builder ログイン機能を実装して
> /radar テストを追加して
```

## よく使うエージェント

| やりたいこと | コマンド |
|-------------|---------|
| バグの原因調査 | `/scout` |
| 機能の実装 | `/builder` |
| テスト追加 | `/radar` |
| コードレビュー | `/judge` |
| リファクタリング | `/zen` |
| PR準備 | `/guardian` |
| 複雑なタスクの分解 | `/sherpa` |
| ビジネス判断 | `/ceo` |

## トラブルシューティング

### エージェントが見つからない

```bash
ls .claude/agents/  # エージェントファイルが存在するか確認
```

ファイルがなければ再インストール:
```bash
curl -sL https://raw.githubusercontent.com/Luna-company/agent-orchestrator/main/install.sh | bash
```

### コンテキストが切れた

Claude Code のセッションが長くなるとコンテキストが圧縮されます。
圧縮後は [Context Recovery Protocol](./_common/CONTEXT_RECOVERY.md) に従って復帰してください。

### エージェントが暴走した

1. `Ctrl+C` で即時停止
2. `git status` で変更を確認
3. 意図しない変更は `git checkout -- <file>` で戻す
4. ガードレール L4 が発動した場合は、原因を特定してから再実行
