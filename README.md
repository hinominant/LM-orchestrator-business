# Agent Orchestrator

Claude Code でエージェントチームを構築するためのフレームワーク。

各プロジェクトにインストールして使用する。中央リポジトリからエージェント定義を取得し、プロジェクトごとに独立したエージェントチームを構成。

[simota/agent-skills](https://github.com/simota/agent-skills) の設計思想をベースに再設計。Luna 独自エージェント（CEO, Analyst, Auditor）を追加した68エージェント体制。27+共通プロトコル + 6スキル + ALICE（ARIS/LROS/NOVA/Secretary）統合。MCP連携・Cloud実行・Permissions・Hooks対応。

## Install

```bash
# 全68エージェントをインストール
curl -sL https://raw.githubusercontent.com/hinominant/agent-orchestrator/main/install.sh | bash

# 特定のエージェントのみ
curl -sL https://raw.githubusercontent.com/hinominant/agent-orchestrator/main/install.sh | bash -s -- nexus rally builder radar ceo

# Hooks付き（tool-risk, post-tool-use, stop-hook）
./install.sh --with-hooks

# ローカルクローンから
git clone https://github.com/hinominant/agent-orchestrator.git /tmp/agent-orchestrator
cd your-project && /tmp/agent-orchestrator/install.sh

# Permissions テンプレート付き
./install.sh --with-permissions

# MCP付きインストール
./install.sh --with-mcp

# 全オプション同時
./install.sh --with-mcp --with-permissions --with-hooks
```

> 初めて使う方は [docs/QUICKSTART.md](docs/QUICKSTART.md) を参照してください。

### インストール結果

```
your-project/
├── .claude/
│   ├── agents/
│   │   ├── _framework.md    # フレームワークプロトコル
│   │   ├── ceo.md            # 意思決定（最上流）
│   │   ├── nexus.md          # オーケストレーター
│   │   ├── analyst.md        # データ分析
│   │   ├── auditor.md         # 品質監査
│   │   ├── ...               # 他のエージェント（68個）
│   │   ├── bard/             # references/ を持つエージェント
│   │   │   └── references/
│   │   └── atlas/
│   │       └── references/
│   ├── commands/
│   │   ├── superpowers.md    # 大規模タスク向けTDD+検証モード
│   │   ├── frontend-design.md # 洗練されたUI設計
│   │   ├── code-simplifier.md # 動作不変のコードクリーンアップ
│   │   ├── playground.md     # 単一HTML生成
│   │   ├── chrome.md         # ブラウザ操作自動化
│   │   ├── pr-review.md     # 多面的PRレビュー
│   │   └── retro.md         # 振り返り→ARISフィードバック
│   ├── skills/
│   │   ├── data-retrieval.md # データ取得
│   │   ├── spec-compliance.md # SPEC準拠チェック
│   │   ├── test-coverage.md  # カバレッジ分析
│   │   ├── git-pr-prep.md    # PR準備
│   │   ├── diff-analysis.md  # Diff分析
│   │   └── aris-feedback.md  # ARIS記録
│   └── scripts/
│       └── cloud/
│           ├── codespace.sh      # Codespaces CLIラッパー
│           └── .env.example      # 設定テンプレート
├── ~/.claude/hooks/              # --with-hooks 指定時
│   ├── tool-risk.js             # ツールリスク分類フック
│   ├── post-tool-use.js         # ツール実行ログ記録
│   └── stop-hook.js             # セッションサマリ永続化
├── .agents/
│   ├── PROJECT.md            # 共有知識ファイル
│   ├── LUNA_CONTEXT.md       # ビジネス文脈（CEO参照）
│   └── memory/              # エージェントスコープメモリ
└── CLAUDE.md                 # フレームワーク参照を追記
```

## Architecture

```
User Request
     |
     v
  [Nexus] ---- Phase 0: EXECUTIVE_REVIEW
     |
     +---> CEO判断が必要？ → [CEO] → 方針・制約を付与
     |
     +---> Sequential: Agent1 → Agent2 → Agent3 (role simulation)
     |
     +---> Parallel: Rally → TeamCreate → Teammates (実セッション並列)
```

### Registry Pattern

```
                 ┌──────────────────────────┐
                 │  GitHub Repository        │
                 │  (hinominant/             │
                 │   agent-orchestrator)     │
                 │                          │
                 │  68 agents + references  │
                 └────────┬─────────────────┘
                          │
            curl / install.sh
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          v               v               v
     Project A       Project B       Project C
     .claude/agents/ .claude/agents/ .claude/agents/
     (必要なエージェントを選択)
```

## Agents (68)

### Luna Original（独自）

| Agent | Description |
|-------|-------------|
| **CEO** | 株式会社LunaのCEO。思想を守りながら市場を創造する意思決定。Go/No-Go判断。ARIS 4-mind統合 |
| **Analyst** | Redash API でデータ取得→指標定義→誤読防止→示唆出し。LROS SSoT参照 |
| **Auditor** | 品質監査。プロセス準拠・判断品質・リスク検知。ARIS Audit統合 / LROS ABSOLUTE SPEC準拠監査 |

### Orchestration（統括）

| Agent | Description |
|-------|-------------|
| **Nexus** | 統括オーケストレーター。タスク分類→CEO判定→チェーン設計→自動実行 |
| **Sherpa** | タスクを15分以内のAtomic Stepに分解 |
| **Rally** | TeamCreate/Task APIで複数Claudeインスタンスを並列管理 |
| **Architect** | 新エージェントのSKILL.md設計・メタデザイン |

### Investigation / Implementation（調査・実装）

| Agent | Description |
|-------|-------------|
| **Scout** | バグ調査・根本原因分析（5-Why） |
| **Builder** | 本番品質コード。型安全・TDD・DDD |
| **Forge** | プロトタイプ。動くものを最速で作り、発見をBuilderに引継ぎ |
| **Artisan** | フロントエンド実装。React/Vue/Svelte、Hooks、Server Components |
| **Anvil** | CLI/TUI構築。Node.js/Python/Go/Rust対応 |
| **Bolt** | パフォーマンス改善。再レンダリング削減、N+1修正、キャッシュ |
| **Schema** | DBスキーマ設計・マイグレーション・ER図 |
| **Gateway** | API設計・OpenAPI仕様・バージョニング戦略 |
| **Scaffold** | IaC（Terraform/CloudFormation）+ Docker環境構築 |
| **Stream** | ETL/ELTパイプライン設計、Kafka/Airflow/dbt |

### Quality / Testing（品質・テスト）

| Agent | Description |
|-------|-------------|
| **Radar** | テスト追加・カバレッジ向上・フレーキーテスト修正 |
| **Sentinel** | セキュリティ静的分析（SAST）。OWASP Top 10 |
| **Probe** | 動的セキュリティテスト（DAST）。ペネトレーションテスト |
| **Judge** | コードレビュー・バグ検出（コード修正はしない） |
| **Zen** | リファクタリング（動作不変で可読性・保守性向上） |
| **Voyager** | E2Eテスト専門。Playwright/Cypress、Page Object |
| **Canon** | 業界標準（OWASP/WCAG/OpenAPI）準拠度評価 |
| **Specter** | 並行性バグ検出。Race Condition、Memory Leak、Deadlock |
| **Warden** | UX品質ゲート。V.A.I.R.E.基準でリリース前評価 |
| **Hone** | PDCAサイクルで品質を反復改善するQuality Orchestrator |

### Git / Release（Git・リリース）

| Agent | Description |
|-------|-------------|
| **Guardian** | コミット粒度最適化・PR戦略・Signal/Noise分析 |
| **Launch** | リリース管理。バージョニング、CHANGELOG、ロールバック計画 |
| **Harvest** | GitHub PR情報収集・週報/月報/リリースノート自動生成 |
| **Rewind** | Git履歴調査・コード考古学。リグレッション根本原因分析 |

### Architecture / Decision（アーキテクチャ・意思決定）

| Agent | Description |
|-------|-------------|
| **Atlas** | 依存関係分析・循環参照検出・ADR/RFC作成・技術的負債評価 |
| **Magi** | 3視点（論理/共感/実利）意思決定。Go/No-Go判定 |
| **Ripple** | 変更前の影響分析。縦（依存）×横（パターン一貫性）評価 |
| **Horizon** | 非推奨検出・モダナイゼーション・新技術PoC |
| **Bridge** | ビジネス要件⇔技術実装の翻訳・スコープクリープ検出 |
| **Cipher** | 曖昧な要求を正確な仕様に変換。意図の解読 |
| **Arena** | Codex/Gemini CLIで競争/協力開発。複数アプローチ比較 |
| **Triage** | 障害初動対応・影響範囲特定・復旧手順・ポストモーテム |

### Frontend / UX（フロントエンド・UX）

| Agent | Description |
|-------|-------------|
| **Palette** | ユーザビリティ改善・インタラクション品質・認知負荷軽減 |
| **Flow** | CSS/JSアニメーション実装。ホバー、ローディング、遷移 |
| **Muse** | デザイントークン設計・Design System構築 |
| **Vision** | UI/UXクリエイティブディレクション・リデザイン |
| **Echo** | ペルソナになりきりUIフロー検証。混乱ポイント発見 |
| **Showcase** | Storybookストーリー作成・Visual Regression連携 |
| **Navigator** | Playwright+DevToolsでブラウザ操作自動化 |
| **Polyglot** | i18n/l10n。ハードコード文字列のt()化、RTL対応 |

### Growth / Product（グロース・プロダクト）

| Agent | Description |
|-------|-------------|
| **Growth** | SEO/SMO/CRO 3軸で成長支援 |
| **Retain** | リテンション施策・チャーン予防・ゲーミフィケーション |
| **Voice** | ユーザーフィードバック収集・NPS・感情分析 |
| **Pulse** | KPI定義・トラッキング設計・ダッシュボード仕様 |
| **Experiment** | A/Bテスト設計・サンプルサイズ計算・統計的有意性判定 |
| **Researcher** | ユーザーリサーチ設計・インタビュー・ペルソナ作成 |
| **Spark** | 既存データから新機能をMarkdown仕様書で提案 |
| **Compete** | 競合調査・差別化ポイント・SWOT分析 |
| **Trace** | セッションリプレイ分析・行動パターン抽出 |
| **Director** | Playwright E2Eテスト活用の機能デモ動画自動撮影 |

### Documentation / DevOps（ドキュメント・DevOps）

| Agent | Description |
|-------|-------------|
| **Quill** | JSDoc/TSDoc追加・README更新・型定義改善 |
| **Scribe** | 仕様書・設計書・チェックリスト・テスト仕様書作成 |
| **Morph** | ドキュメントフォーマット変換（MD↔Word/Excel/PDF） |
| **Canvas** | Mermaid図・ASCIIアート・draw.io生成。可視化 |
| **Gear** | 依存関係管理・CI/CD最適化・Docker・オブザーバビリティ |
| **Sweep** | 不要ファイル検出・デッドコード除去・クリーンアップ |
| **Grove** | リポジトリ構造設計・ディレクトリ最適化 |
| **Tuner** | DBパフォーマンス。EXPLAIN ANALYZE・インデックス推奨 |
| **Reel** | ターミナル録画・CLIデモGIF生成（VHS/asciinema） |
| **Bard** | 3ペルソナ（Codex/Gemini/Claude）でdevグランブル投稿 |
| **Lens** | コードベース理解・構造把握・機能探索（コード書かない） |

## Common Protocols (27+)

エージェントの動作を統一する共通プロトコル。`_common/` ディレクトリに格納され、フレームワーク (`_framework.md`) から参照される。

### Core

| Protocol | Description |
|----------|-------------|
| AUTORUN | 4段階実行モード（FULL/AUTO/GUIDED/INTERACTIVE） |
| INTERACTION | 対話制御・質問フォーマット・複雑度判定 |
| GUARDRAIL | L1-L4 品質ガードレール・自動回復 |
| PARALLEL | Rally並列実行・ファイルオーナーシップ・マージ戦略 |
| GIT_GUIDELINES | Conventional Commits・ブランチ命名 |

### Intelligence

| Protocol | Description |
|----------|-------------|
| MODEL_ROUTING | Bloom Taxonomy 6段階のタスク複雑度→最適モデル自動選択 |
| ESCALATION | 時間ベース3段階エスカレーション（NUDGE→RETRY→RESET） |
| SLIM_CONTEXT | トークン予算管理・段階的圧縮・予算配分 |
| CRITICAL_THINKING | 批判的思考・矛盾検出・根拠付き代替案 |
| SPEC_FIRST | 仕様→テスト→実装の順序制御 |

### Operations

| Protocol | Description |
|----------|-------------|
| MEMORY | メモリ管理・永続化・60行制限 |
| AGENT_MEMORY | エージェントスコープメモリ |
| MAINTENANCE | 10セッション毎のdedup/prune・ログ20件保持 |
| PROGRESS | 60秒沈黙禁止・フェーズマーカー・エラー即時表示 |
| CONTEXT_RECOVERY | セッション復帰手順（メモリ→CLAUDE.md→git状態） |
| TEST_POLICY | SKIP=FAIL ポリシー |
| CONTEXT_HYGIENE | コンテキスト衛生管理 |
| REVIEW_CHECKLIST | レビューチェックリスト |
| PTC | Programmatic Tool Calling |

### Automation

| Protocol | Description |
|----------|-------------|
| WORKFLOW_AUTOMATION | 繰り返し手順のスラッシュコマンド化（セッション内） |
| SKILL_DISCOVERY | ボトムアップ スキル発見・パターン検出（セッション横断） |
| TOOL_RISK | ツール実行前リスク分類・3-Hook体制・Hooks連携（初心者向け安全ネット） |

### Integration

| Protocol | Description |
|----------|-------------|
| ALICE_INTEGRATION | ALICE（ARIS/LROS/NOVA/Secretary）統合 |
| MCP | MCP サーバー連携（Context7/Sentry/Memory/PostgreSQL/Playwright） |
| CLOUD_ROUTING | 重い処理のGitHub Codespaces自動ルーティング |
| PROJECT_AFFINITY | エージェント×プロジェクトタイプの親和性マッピング |
| REVERSE_FEEDBACK | 下流→上流の品質フィードバック |

## Custom Commands (7)

エージェントとは別に、ワークフローモードとして使えるスラッシュコマンド。デフォルトで全てインストールされる。

| Command | Description | 類似エージェントとの違い |
|---------|-------------|----------------------|
| `/superpowers` | リサーチ→設計→TDD→段階実装→検証の5フェーズ。大規模タスク向け | Sherpa(分解のみ) に対し、フルワークフロー |
| `/frontend-design` | 数値基準付きデザインプロトコル。タイポグラフィ・余白・配色・レスポンシブ | Vision/Muse(戦略) に対し、即適用できるルール |
| `/code-simplifier` | git diffベースで直近変更のみクリーンアップ。各ステップでテスト確認 | Zen(全体リファクタ) に対し、軽量・局所的 |
| `/playground` | 外部依存ゼロの単一HTMLツール生成。open コマンドで即確認 | Forge(プロトタイプ全般) に対し、単一ファイル特化 |
| `/chrome` | Playwrightでブラウザ操作。既存セッション活用、スクショ確認 | Navigator(フルエージェント) の軽量インライン版 |
| `/pr-review` | テスト/エラー処理/型/品質/シンプル化の5観点で構造化レビュー | Judge(バグ検出特化) に対し、多面的・構造化 |
| `/retro` | 振り返り→ARISフィードバック。git log + Activity Log から成功/失敗パターン抽出 | Auditor(監査) に対し、定期振り返り特化 |

```bash
/superpowers 認証システムをリファクタリングして
/frontend-design ダッシュボードのUIを設計して
/code-simplifier 直近の変更をクリーンアップして
/playground マークダウンエディタを作って
/chrome このページのデータを収集して
/pr-review #123
```

## Execution Modes

| Mode | Trigger | Behavior |
|------|---------|----------|
| AUTORUN_FULL | Default | 全自動（ガードレール付き） |
| AUTORUN | `## NEXUS_AUTORUN` | SIMPLE自動、COMPLEX→Guided |
| GUIDED | `## NEXUS_GUIDED` | 判断ポイントで確認 |
| INTERACTIVE | `## NEXUS_INTERACTIVE` | 各ステップで確認 |

## Chain Templates

| Task | Chain |
|------|-------|
| バグ修正(簡単) | Scout → Builder → Radar |
| バグ修正(複雑) | Scout → Sherpa → Builder → Radar → Sentinel |
| 機能開発(小) | Builder → Radar |
| 機能開発(中) | Sherpa → Forge → Builder → Radar |
| 機能開発(大) | Sherpa → Rally(Builder + Artisan + Radar) |
| リファクタリング | Zen → Radar |
| セキュリティ監査 | Sentinel → Probe → Builder → Radar |
| PR準備 | Guardian → Judge |
| **ビジネス/戦略** | **CEO → Sherpa → Forge/Builder → Radar** |
| **データ分析** | **Analyst → CEO（意思決定要時）→ Nexus** |
| **アーキテクチャ** | **Atlas → Magi → Builder/Scaffold** |
| **データパイプライン修正** | **Scout → Analyst → Builder → Radar** |
| **スペック準拠監査** | **Auditor → Builder → Radar** |
| **大規模修正（監査付き）** | **Sherpa → Builder → Auditor → Radar** |

## Cloud Execution

ローカル環境のメモリ制約を回避するため、重い処理をGitHub Codespacesに自動ルーティングする。詳細は `docs/CLOUD_ARCHITECTURE.md` 参照。

### Routing Rule

| Condition | Execution |
|-----------|-----------|
| 実行見込み10分超 | Cloud |
| 大量ログ出力 | Cloud |
| LLM/embedding/スクレイピング/バックフィル | Cloud |
| 並列2本以上 | Cloud |
| メモリ推定8GB超 | Cloud |
| 短時間スクリプト（3分以内） | Local |
| UI操作中心 | Local |

### Quick Start

```bash
# 1. 設定（初回のみ）
cp scripts/cloud/.env.example scripts/cloud/.env

# 2. Codespace作成
bash scripts/cloud/codespace.sh create --repo hinominant/your-project --machine 4-core

# 3. コマンド実行
bash scripts/cloud/codespace.sh run "cd /workspaces/project && npm run build"
bash scripts/cloud/codespace.sh status
bash scripts/cloud/codespace.sh ssh
bash scripts/cloud/codespace.sh stop
```

### CLI Commands

| Command | Description |
|---------|-------------|
| `cs create [--repo OWNER/REPO]` | Codespace作成 |
| `cs run <command>` | Codespace内でコマンド実行 |
| `cs ssh` | CodespaceにSSH接続 |
| `cs list` | Codespace一覧 |
| `cs stop [name]` | Codespace停止（課金停止） |
| `cs delete [name]` | Codespace削除 |
| `cs status` | Codespace状態確認 |

## MCP Integration (5)

エージェントの能力を拡張するMCPサーバー連携。詳細は `_common/MCP.md` 参照。

| MCP Server | Purpose | Agent Affinity |
|------------|---------|---------------|
| **Context7** | ライブラリ最新ドキュメント注入 | Builder, Artisan, Forge, Anvil |
| **Sentry** | エラー監視・スタックトレース分析 | Scout, Triage, Sentinel |
| **Memory** | ナレッジグラフベースの永続メモリ | Nexus, 全コーディネーター |
| **PostgreSQL** | 自然言語→SQL変換、データ分析 | Analyst, Schema, Tuner |
| **Playwright** | ブラウザ操作・E2Eテスト・スクリーンショット | Navigator, Voyager, Director, Probe |

```bash
# Global MCP一括セットアップ
bash scripts/setup-mcp.sh

# MCP付きインストール
./install.sh --with-mcp

# Project-specific PostgreSQL
claude mcp add postgres -- npx -y @modelcontextprotocol/server-postgres 'postgresql://user:pass@host:5432/db'
```

## Tool Risk Hooks

Claude Code のツール実行前にリスクレベルを自動分類し、危険な操作を事前警告する。3-Hook体制（PreToolUse / PostToolUse / Stop）。初心者のオンボーディングに最適。

| Level | Action | Example |
|-------|--------|---------|
| HIGH / BLOCK | 確認ダイアログ / ブロック | `rm -rf`, `git push --force`, `DROP TABLE`, 認証情報の外部送信 |
| MEDIUM | 説明表示 | `git push`, `npm publish`, ファイル編集 |
| LOW | サイレント通過 | `git status`, `Read`, `Grep` |

```bash
# インストール
./install.sh --with-hooks

# 無効化（経験者向け）
# settings.json の hooks.PreToolUse を空配列に
```

## ALICE Integration

ALICE（ARIS/LROS/NOVA/Secretary）統合フレームワーク。詳細は `_common/ALICE_INTEGRATION.md` 参照。

| Component | Role | Integrated Agent |
|-----------|------|-----------------|
| **ARIS** | 判断エンジン（4-mind: Founder/Vision/Execution/Audit） | CEO, Auditor |
| **LROS** | データ基盤（metrics_monthly SSoT） | Analyst |
| **NOVA** | 分析エンジン | Analyst |
| **Secretary** | 実行エンジン | Nexus |

### Frontmatter

Tier 1 エージェントは YAML frontmatter で model/permissionMode/maxTurns/memory を指定。仕様は `_templates/FRONTMATTER_SPEC.md` 参照。

### QA Health Score

Radar が8次元加重ルーブリックで品質スコアリング（70+ PASS / 50-69 WARN / <50 FAIL）。

## Redash Integration

Analyst エージェントが Redash API を使用してデータを取得・分析する。

```bash
export REDASH_BASE_URL=https://your-redash.example.com
export REDASH_API_KEY=your_api_key_here

scripts/redash/query.sh 42                    # JSON取得
scripts/redash/query.sh 42 '{"p_start":"2025-01-01"}' # パラメータ付き
scripts/redash/query.sh 42 '' csv              # CSV出力
```

## Customization

### エージェント選択

プロジェクトに必要なエージェントだけをインストール:

```bash
# コアのみ（軽量）
install.sh nexus builder radar scout sentinel guardian

# フルスタック開発
install.sh nexus rally sherpa builder artisan forge radar sentinel judge zen guardian ceo

# データ分析重視
install.sh nexus analyst ceo pulse experiment researcher
```

### ビジネス文脈

`.agents/LUNA_CONTEXT.md` をプロジェクトに合わせてカスタマイズ。

### エージェント追加

1. `agents/[name]/SKILL.md` を作成（`_templates/SKILL_TEMPLATE.md` 参照）
2. `install.sh` の `ALL_AGENTS` に追加
3. `_common/PROJECT_AFFINITY.md` にアフィニティを追記

## Documentation

| ドキュメント | 内容 |
|-------------|------|
| [docs/QUICKSTART.md](docs/QUICKSTART.md) | 初回セットアップ・最初の実行 |
| [docs/AGENT_SELECTION.md](docs/AGENT_SELECTION.md) | タスク別エージェント選択ガイド |
| [docs/FAQ.md](docs/FAQ.md) | よくある質問 |
| [docs/CLOUD_ARCHITECTURE.md](docs/CLOUD_ARCHITECTURE.md) | Cloud-first実行基盤 |

## Origin

[simota/agent-skills](https://github.com/simota/agent-skills) (MIT License) の設計思想をベースに構築。

## License

MIT
