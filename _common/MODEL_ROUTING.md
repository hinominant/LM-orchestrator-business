# Model Routing Protocol

Bloom Taxonomy に基づくタスク複雑度の自動判定と最適モデル・エンジン選択。

> **3エンジン体制:** Claude Code / Codex / Gemini の使い分けは `ENGINE_ROUTING.md` を参照。
> このファイルは「どのClaudeモデルを使うか」と「どのエンジンを使うか」の両方を定義する。

---

## Bloom Taxonomy Levels

| Level | Name | Description | Default Model | Primary Engine |
|-------|------|-------------|---------------|----------------|
| L1 | REMEMBER | 単純な情報取得・一覧表示 | claude-haiku-4-5-20251001 | Codex / Gemini |
| L2 | UNDERSTAND | 内容の理解・要約・翻訳 | claude-haiku-4-5-20251001 | Gemini |
| L3 | APPLY | 既知パターンの適用・修正 | claude-sonnet-4-6 | Codex |
| L4 | ANALYZE | 構造分析・根本原因特定 | claude-sonnet-4-6 | Codex / Claude Code |
| L5 | EVALUATE | 判断・トレードオフ比較 | claude-sonnet-4-6 | Claude Code |
| L6 | CREATE | 新規設計・アーキテクチャ | claude-opus-4-6 | Claude Code |

**Engine 選定の優先順位:** タスク種別 → Bloom Level → フォールバック（weekly limit）
詳細は `ENGINE_ROUTING.md` を参照。

---

## 3層ルーティング

### Agent層（エージェント選択）
frontmatter の `model` フィールドで指定。Tier 1 エージェントの割り当て:

| Agent | Model | Rationale |
|-------|-------|-----------|
| CEO | opus | 意思決定（Create/Evaluate） |
| Nexus | sonnet | オーケストレーション（Analyze/Apply） |
| Rally | sonnet | 並列管理（Apply） |
| Analyst | sonnet | データ分析（Analyze） |
| Auditor | sonnet | 監査（Evaluate — コスト効率考慮でsonnet） |
| Radar | sonnet | テスト（Apply） |
| Builder | sonnet | 実装（Apply） |
| Sherpa | haiku | 分解（Remember/Understand） |

### Skill層（スキル実行）
Skills は原則 `haiku` で実行（定型手順のため）:

| Skill | Model | Rationale |
|-------|-------|-----------|
| data-retrieval | haiku | 定型データ取得手順 |
| spec-compliance | haiku | チェックリスト照合 |
| test-coverage | haiku | カバレッジ分析 |
| git-pr-prep | haiku | PR準備手順 |
| diff-analysis | haiku | diff解析 |
| aris-feedback | haiku | パターン記録 |

### Command層（コマンド実行）
Commands は呼び出し元セッションのモデルを継承。

---

## Classification Rules

### Keyword Mapping

| Keywords | Level |
|----------|-------|
| 取得、一覧、確認、状態、参照、表示、リスト | L1 REMEMBER |
| 要約、説明、理解、翻訳、整理、まとめ、概要 | L2 UNDERSTAND |
| 実装、修正、追加、適用、変更、更新、デプロイ | L3 APPLY |
| 分析、原因、比較、調査、根本原因、構造分析、なぜ | L4 ANALYZE |
| 判断、評価、トレードオフ、優先、比較検討、意思決定、選定 | L5 EVALUATE |
| 設計、アーキテクチャ、戦略、創造、構築、新規設計、フレームワーク | L6 CREATE |

### Priority Rules

- 複数レベルが一致した場合、最も高いレベルを採用
- 同スコアなら上位レベルを優先（コスト < 品質リスク）
- コンテキストから暗黙の複雑度を推定する（例: 「修正」でもアーキテクチャ変更が必要なら L6）
- 不確実な場合は1段階上を選択
- キーワード一致なしの場合、デフォルトは L3 APPLY

---

## Usage in Agent Chain

```yaml
# Nexus / Rally がタスク投入時にモデルを自動決定
TASK_ROUTING:
  description: "LTV改善施策を設計する"
  bloom_level: L6 (CREATE)
  model: claude-opus-4-6-20250918
  agent: CEO → Sherpa → Builder
```

### Override

環境変数 `BLOOM_MODEL_OVERRIDE` でモデルを強制指定可能（デバッグ・コスト制御用）。

---

## Chain Template Integration

| Chain | Typical Bloom Level | Routing |
|-------|--------------------|---------|
| Scout → Builder → Radar | L3-L4 | Sonnet for Scout, Sonnet for Builder |
| Sherpa → Builder → Radar | L4-L5 | Sonnet for all |
| CEO → Sherpa → Builder | L5-L6 | Opus for CEO, Sonnet for Sherpa/Builder |
| Analyst → CEO | L4-L5 | Sonnet for Analyst, Opus for CEO |

---

## Cost Optimization

| Scenario | Strategy |
|----------|----------|
| 大量の情報取得タスク | Codex o4-mini / Gemini で実行 |
| アルゴリズム実装・テスト生成 | Codex o4-mini（仕様明確なら） |
| バグ修正ループ（テストあり・再現明確） | Codex o4-mini → 3ループ超 → o3 → 未解決 → Claude Code |
| 分析 + 実装の混合チェーン | 分析=Claude Code Sonnet、実装=Codex |
| ドキュメント生成・コードベース調査 | Gemini |
| アーキテクチャ判断・設計 | Claude Code Opus（ケチらない） |
| Claude Code weekly limit 到達時 | Codex → Gemini でフォールバック |

### コスト最適化ルール

1. **デフォルトはsonnet** — 明確な理由がない限りsonnet
2. **opusは意思決定のみ** — CEO、重大なアーキテクチャ判断
3. **haikuは定型作業** — 分解、検索、単純変換、スキル実行
4. **エスカレーション** — haiku/sonnetで対応不能な場合のみopusに昇格
