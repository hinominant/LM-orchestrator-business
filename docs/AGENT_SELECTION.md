# Agent Selection Guide

> プロジェクトに最適なエージェント構成を選択するためのガイド。

---

## 選択原則

1. **最小構成から始める** — 必要になったら追加。全68エージェントは不要
2. **コアは必ず入れる** — Nexus + Builder + Radar は基本セット
3. **CEO はビジネス判断がある場合のみ** — 純粋な技術プロジェクトでは不要
4. **ALICE統合はLunaプロジェクトのみ** — 外部プロジェクトではALICEコンポーネント不要

---

## チェーンテンプレート早見表

「何をしたいか」から最適なエージェントチェーンを選ぶ。

### 日常の開発作業

| やりたいこと | チェーン | 説明 |
|-------------|---------|------|
| 簡単なバグ修正 | Scout → Builder → Radar | 調査→修正→テスト |
| 複雑なバグ修正 | Scout → Sherpa → Builder → Radar | 調査→分解→修正→テスト |
| 小さな機能追加 | Builder → Radar | 実装→テスト |
| 中規模の機能開発 | Sherpa → Forge → Builder → Radar | 分解→プロト→実装→テスト |
| 大規模の機能開発 | Sherpa → Rally(並列) | 分解→複数エージェント並列実行 |

### コード品質

| やりたいこと | チェーン | 説明 |
|-------------|---------|------|
| リファクタリング | Zen → Radar | 品質改善→テスト確認 |
| コードレビュー | Judge | 単体でレビュー |
| PR準備 | Guardian → Judge | ブランチ整理→レビュー |
| セキュリティ確認 | Sentinel → Probe | 静的分析→動的分析 |

### ビジネス・戦略

| やりたいこと | チェーン | 説明 |
|-------------|---------|------|
| 施策の判断 | CEO → Sherpa | CEO判断→タスク分解 |
| データ分析 | Analyst → CEO | データ取得→意思決定 |
| 仕様書作成 | Scribe | 単体で作成 |

### 調査・理解

| やりたいこと | エージェント | 説明 |
|-------------|------------|------|
| コードの理解 | Lens | 構造・フロー把握 |
| 影響範囲の調査 | Ripple | 変更の波及分析 |
| Git履歴の調査 | Rewind | コミット考古学 |

---

## プリセット構成

### Minimal（5エージェント）
最小限の開発チーム。

```bash
install.sh nexus builder radar scout guardian
```

### Standard（10エージェント）
標準的なフルスタック開発。

```bash
install.sh nexus rally sherpa builder artisan radar sentinel judge zen guardian
```

### Full Stack + CEO（13エージェント）
ビジネス判断を含むフルスタック開発。

```bash
install.sh nexus rally sherpa builder artisan forge radar sentinel judge zen guardian ceo analyst
```

### Luna Project（16エージェント）
Luna プロジェクト向け。ALICE統合あり。

```bash
install.sh nexus rally sherpa builder artisan forge radar sentinel judge zen guardian ceo analyst auditor architect launch
```

### Data-Heavy（8エージェント）
データ分析・KPI重視のプロジェクト。

```bash
install.sh nexus analyst ceo pulse experiment researcher canvas sherpa
```

---

## タスク別推奨エージェント

| Task Type | Required | Optional |
|-----------|----------|----------|
| バグ修正 | Nexus, Scout, Builder, Radar | Sentinel, Sherpa |
| 新機能開発 | Nexus, Builder, Radar | Sherpa, Rally, Forge, Artisan |
| リファクタリング | Nexus, Zen, Radar | Atlas, Ripple |
| セキュリティ | Nexus, Sentinel, Probe, Radar | Builder |
| PR準備 | Guardian, Judge | Radar |
| データ分析 | Analyst, CEO | Nexus, Pulse |
| パフォーマンス | Bolt, Radar | Tuner, Builder |
| ドキュメント | Quill, Scribe | Canvas, Morph |

---

## ALICE Chain（Luna専用）

ALICE統合を使用するチェーン:

| Chain | Flow |
|-------|------|
| ビジネス判断 | CEO(ARIS 4-mind) → Nexus → Builder → Radar |
| データ分析 | Analyst(LROS SSoT) → CEO → Nexus |
| 品質監査 | Auditor(ARIS Audit) → CEO → Nexus |
| 振り返り | `/retro` → ARIS feedback pipeline |

---

## Model コスト考慮

| Model | Cost | Use |
|-------|------|-----|
| opus | $$$ | CEO のみ（意思決定） |
| sonnet | $$ | 大半のエージェント（デフォルト） |
| haiku | $ | Sherpa、Skills |

コスト最適化: Tier 1 以外のエージェントはデフォルト sonnet。明確な理由がある場合のみ変更。

---

## スラッシュコマンド

エージェント召喚とは別に、ワークフローモードを適用するコマンド:

| コマンド | 用途 |
|---------|------|
| `/superpowers` | 大規模タスクの全自動実行（リサーチ→TDD→検証） |
| `/frontend-design` | 数値基準付きUIデザイン |
| `/code-simplifier` | 直近の変更をクリーンアップ |
| `/playground` | 単一HTMLでインタラクティブツール生成 |
| `/chrome` | Playwright でブラウザ操作自動化 |
| `/pr-review` | 5観点の構造化PRレビュー |
| `/retro` | 振り返り→ARISフィードバック |

---

## 迷ったら

1. **単純な作業** → `/builder` で直接実行
2. **複雑で分解が必要** → `/sherpa` で計画を立てる
3. **ビジネス判断が絡む** → `/ceo` で方針を決めてから実装
4. **何から始めればいいかわからない** → `/nexus` に丸投げ（自動で最適チェーンを選択）
