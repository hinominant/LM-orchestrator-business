# Quickstart Guide

> 5分で Agent Orchestrator をプロジェクトに導入する。

## 前提条件

- [Claude Code](https://claude.ai/claude-code) がインストール済み
- GitHub CLI (`gh`) が認証済み
- Node.js 18+ がインストール済み

---

## 1. インストール

```bash
# プロジェクトルートで実行（全68エージェント）
curl -sL https://raw.githubusercontent.com/hinominant/agent-orchestrator/main/install.sh | bash

# よく使うエージェントのみ
curl -sL https://raw.githubusercontent.com/hinominant/agent-orchestrator/main/install.sh | bash -s -- nexus builder radar scout
```

### オプション: Hooks付き（3-Hook体制）

```bash
# ローカルクローンから（Hooks対応）
git clone https://github.com/hinominant/agent-orchestrator.git /tmp/ao
cd your-project && /tmp/ao/install.sh --with-hooks
```

Hooks は3つ:
- **tool-risk.js** (PreToolUse) — 高リスク操作をブロック + ARIS NO Gate
- **post-tool-use.js** (PostToolUse) — ツール実行ログ記録
- **stop-hook.js** (Stop) — セッションサマリ永続化

### オプション: MCP連携付き

```bash
./install.sh --with-mcp
```

### オプション: Permissions設定付き

```bash
./install.sh --with-permissions
```

### 全オプション同時

```bash
./install.sh --with-hooks --with-mcp --with-permissions
```

---

## 2. インストールされるもの

```
.claude/
├── agents/          # エージェント定義（68個）
│   └── _framework.md  # フレームワークプロトコル
├── commands/        # カスタムスラッシュコマンド（7個）
├── skills/          # 再利用可能スキル（6個）
├── settings.json    # Permissions + Hook設定（--with-permissions/--with-hooks時）
└── scripts/         # MCP・Cloud実行スクリプト
.agents/
├── PROJECT.md       # 共有ナレッジ（チーム全体で蓄積）
├── LUNA_CONTEXT.md  # ビジネスコンテキスト
└── memory/          # エージェントスコープメモリ
```

---

## 3. 基本的な使い方

### エージェント呼び出し

```bash
# Claude Code を起動
claude

# エージェントを使う（例）
> /nexus ログイン機能を実装したい
> /ceo この機能の優先度を判断して
> /analyst ユーザー離脱率を分析して
> /rally フロントエンドとバックエンドを並列実装して
> /scout このエラーの原因を調査して
> /builder ログイン機能を実装して
> /radar テストを追加して
```

### コマンド呼び出し

```
/superpowers 認証システムをリファクタリングして
/pr-review #123
/retro
```

### よく使うエージェント

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

---

## 4. プロジェクト設定

### ビジネス文脈（CEO使用時）

`.agents/LUNA_CONTEXT.md` をプロジェクトに合わせて編集:

```markdown
# Business Context

## Product
- サービス名:
- ターゲット:
- ビジネスモデル:

## Principles
- [プロダクト原則]

## Current Focus
- [現在の注力領域]
```

### 共有知識

`.agents/PROJECT.md` にチーム共有の知識を蓄積:
- アーキテクチャ決定
- 技術スタック
- Activity Log（エージェント実行履歴）

---

## 5. ALICE統合（Lunaプロジェクトのみ）

### 前提条件
- ARIS pattern dictionaries が `docs/` に配置済み
- LROS リポジトリへのアクセス

### セットアップ
1. 標準インストール実施
2. `.agents/LUNA_CONTEXT.md` にALICEコンポーネント参照を追記
3. CEO → ARIS 4-mind 判断が自動的に有効化
4. Analyst → LROS SSoT 参照が自動的に有効化

### ALICE Chain の使い方

```
/ceo [ビジネス判断]     → ARIS 4-mind で評価
/analyst [分析依頼]     → LROS SSoT + 誤読防止チェック
/retro                  → ARIS feedback pipeline
```

---

## 6. カスタマイズ

### エージェント選択

全68エージェントは不要。プリセットから選択:

```bash
# Minimal（5エージェント）
install.sh nexus builder radar scout guardian

# Standard（10エージェント）
install.sh nexus rally sherpa builder artisan radar sentinel judge zen guardian
```

詳細は `docs/AGENT_SELECTION.md` 参照。

### Frontmatter カスタマイズ

エージェントの `model`, `maxTurns`, `memory` は frontmatter で変更可能。仕様は `_templates/FRONTMATTER_SPEC.md` 参照。

---

## 7. 検証

```bash
# ドリフトチェック（テンプレート準拠確認）
scripts/check-drift.sh

# 特定エージェントのみ
scripts/check-drift.sh ceo nexus builder radar
```

---

## トラブルシューティング

### エージェントが見つからない

```bash
ls .claude/agents/  # エージェントファイルが存在するか確認
```

ファイルがなければ再インストール:
```bash
curl -sL https://raw.githubusercontent.com/hinominant/agent-orchestrator/main/install.sh | bash
```

### コンテキストが切れた

Claude Code のセッションが長くなるとコンテキストが圧縮されます。
圧縮後は [Context Recovery Protocol](./_common/CONTEXT_RECOVERY.md) に従って復帰してください。

### エージェントが暴走した

1. `Ctrl+C` で即時停止
2. `git status` で変更を確認
3. 意図しない変更は `git checkout -- <file>` で戻す
4. ガードレール L4 が発動した場合は、原因を特定してから再実行

---

## Next Steps

- `docs/AGENT_SELECTION.md` — エージェント選択ガイド
- `docs/FAQ.md` — よくある質問
- `docs/CLOUD_ARCHITECTURE.md` — Cloud-first実行基盤
- `_common/MODEL_ROUTING.md` — モデル選択ガイドライン
- `_common/ALICE_INTEGRATION.md` — ALICE統合詳細
- `_templates/FRONTMATTER_SPEC.md` — Frontmatter仕様
