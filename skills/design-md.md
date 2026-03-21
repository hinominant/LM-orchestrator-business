---
name: design-md
description: Figma デザイントークンを DESIGN.md フォーマットに変換する。エージェント（Artisan/Builder）が参照するデザインルールの翻訳層。
model: haiku
---

# Design MD — Figma → DESIGN.md 変換スキル

Figma のデザイントークン（カラー・タイポグラフィ・スペーシング）を、エージェントが参照可能な `DESIGN.md` フォーマットに変換する。

## 前提

- Figma がデザインの SSoT（Single Source of Truth）
- DESIGN.md はその「翻訳層」 — エージェント向け自然言語デザインルール
- Figma MCP が設定済みの場合は自動抽出、未設定の場合は手動入力

## フロー

```
Figma (デザインの真実)
  → Figma MCP or 手動入力 (トークン抽出)
    → DESIGN.md (エージェント向けデザインルール)
      → Artisan/Builder が実装時に参照
```

## Step 1: トークン収集

### Figma MCP が利用可能な場合

```
Figma MCP の get_variable_defs を使用して以下を取得:
- カラーパレット（プライマリ/セカンダリ/ニュートラル/セマンティック）
- タイポグラフィスケール（フォント/サイズ/ウェイト/行間）
- スペーシングスケール（基本グリッド/コンポーネント内/セクション間）
- border-radius / shadow / transition
```

### Figma MCP が未設定の場合

ユーザーに以下を確認する:
- Figma ファイルのURL または スクリーンショット
- カラーコード（hex値）
- フォント指定
- 余白の基本単位

## Step 2: DESIGN.md 生成

以下のフォーマットで `DESIGN.md` を生成する:

```markdown
# DESIGN.md — デザイントークン定義

> Source: [Figma ファイル名 / URL]
> Last synced: YYYY-MM-DD

## カラー

### プライマリ
| Token | Value | 用途 |
|-------|-------|------|
| --color-primary | #XXXXXX | CTA・アクティブ要素 |
| --color-primary-hover | #XXXXXX | ホバー状態 |
| --color-primary-active | #XXXXXX | アクティブ状態 |

### セカンダリ
| Token | Value | 用途 |
|-------|-------|------|
| --color-secondary | #XXXXXX | 補助要素 |

### ニュートラル
| Token | Value | 用途 |
|-------|-------|------|
| --color-bg | #XXXXXX | 背景 |
| --color-surface | #XXXXXX | カード・パネル背景 |
| --color-border | #XXXXXX | ボーダー |
| --color-text | #XXXXXX | 本文テキスト |
| --color-text-secondary | #XXXXXX | 補助テキスト |

### セマンティック
| Token | Value | 用途 |
|-------|-------|------|
| --color-success | #XXXXXX | 成功 |
| --color-warning | #XXXXXX | 警告 |
| --color-error | #XXXXXX | エラー |
| --color-info | #XXXXXX | 情報 |

## タイポグラフィ

| Token | Font | Size | Weight | Line Height | 用途 |
|-------|------|------|--------|-------------|------|
| --text-h1 | ... | ...px | bold | 1.2 | ページ見出し |
| --text-h2 | ... | ...px | bold | 1.25 | セクション見出し |
| --text-h3 | ... | ...px | medium | 1.3 | サブセクション |
| --text-body | ... | ...px | regular | 1.6 | 本文 |
| --text-caption | ... | ...px | regular | 1.4 | キャプション・ラベル |

## スペーシング

| Token | Value | 用途 |
|-------|-------|------|
| --space-xs | 4px | 微調整 |
| --space-sm | 8px | アイコンとテキスト間 |
| --space-md | 16px | コンポーネント内余白 |
| --space-lg | 24px | コンポーネント間余白 |
| --space-xl | 48px | セクション間余白 |
| --space-2xl | 64px | 大きなセクション間 |

## border-radius

| Token | Value | 用途 |
|-------|-------|------|
| --radius-sm | 4px | ボタン・入力フィールド |
| --radius-md | 8px | カード |
| --radius-lg | 16px | モーダル・大きなパネル |
| --radius-full | 9999px | アバター・バッジ |

## shadow

| Token | Value | 用途 |
|-------|-------|------|
| --shadow-sm | 0 1px 2px rgba(0,0,0,0.05) | 控えめな浮遊感 |
| --shadow-md | 0 4px 6px rgba(0,0,0,0.1) | カード |
| --shadow-lg | 0 10px 15px rgba(0,0,0,0.1) | ドロップダウン・モーダル |

## transition

| Token | Value | 用途 |
|-------|-------|------|
| --transition-fast | 150ms ease-out | hover・フォーカス |
| --transition-normal | 250ms ease-out | パネル開閉 |
| --transition-slow | 350ms ease-out | ページ遷移 |
```

## Step 3: 配置と確認

1. 生成した `DESIGN.md` をプロジェクトルートに配置
2. Artisan/Builder が参照できることを確認
3. `Last synced` 日付を記録

## 更新サイクル

Figma でデザインが更新された場合:
1. このスキルを再実行
2. DESIGN.md の差分を確認
3. 変更をコミット
