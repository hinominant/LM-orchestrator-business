# Tab

## Overview

| 項目 | 値 |
|------|-----|
| Name | Tab |
| Description | コンテンツ領域を切り替えるナビゲーション要素 |
| Layer | Molecule |
| Category | Navigation |
| Status | Stable |

---

## Anatomy

```
┌─────────────────────────────────────────────────────┐
│ [1]TabButton  [1]TabButton  [1]TabButton  ...       │
│  ┌──────────────────────┐                           │
│  │ [2]Label  [3]Badge   │                           │
│  └──────────────────────┘                           │
│ [4]Active Indicator                                 │
├─────────────────────────────────────────────────────┤
│ [5]Bottom Border                                    │
└─────────────────────────────────────────────────────┘
```

| # | Part | Required | Description |
|----|------|----------|-------------|
| 1 | TabButton | Required | 個別のタブ項目。2〜6個まで |
| 2 | Label | Required | タブの内容を示すテキスト（12px Bold） |
| 3 | Badge | Optional | 通知数バッジ（16px 円形、Brand背景） |
| 4 | Active Indicator | Required | アクティブタブ下部の 3px ライン（Brand/600） |
| 5 | Bottom Border | Required | タブバー全体の下部ボーダー（1px Black/200） |

---

## Props / API

```typescript
interface TabProps {
  /** タブ項目の配列 */
  items: TabItem[];
  /** 現在のアクティブタブインデックス */
  activeIndex?: number;
  /** タブ変更ハンドラ */
  onChange?: (index: number) => void;
  /** 全幅均等配置 */
  isFullWidth?: boolean;
}

interface TabItem {
  /** 一意なID */
  id: string;
  /** ラベルテキスト */
  label: string;
  /** バッジカウント（1以上で表示） */
  badgeCount?: number;
  /** 無効状態 */
  isDisabled?: boolean;
}
```

**デフォルト値:** `activeIndex=0`, `isFullWidth=true`

---

## Variants

### タブ数

| Count | Layout | Use Case |
|-------|--------|----------|
| 2 | 均等2分割（`flex: 1 0 0`） | 2カテゴリの切り替え |
| 3 | 均等3分割 | 標準的なセクション分割 |
| 4 | 均等4分割 | 中規模ナビゲーション |
| 5 | 均等5分割 | 多セクション |
| 6 | 均等6分割 | 最大数（Figma定義） |

### Badge

- `badgeCount >= 1` 時にラベル右側に 16px 円形バッジを表示
- バッジ背景: Brand/600 `#5538EE`、テキスト: `#FFFFFF`（10px Bold）
- バッジ内パディング: 横 4px（`var(--space-2xs)`）、下 2px（`var(--space-3xs)`）
- バッジとラベルの間隔: `var(--space-2xs)` = 4px

### Layout

| Property | Value |
|----------|-------|
| コンテナ高さ | 42px |
| コンテナ幅 | 414px（画面幅に追従） |
| タブボタン間ギャップ | 6px（`var(--space-xs)`） |
| タブボタン内パディング | 12px（`var(--space-md)`） |
| 各タブ | `flex: 1 0 0`（均等配置） |

---

## States

| State | Visual Change | CSS | ARIA |
|-------|--------------|-----|------|
| active | テキスト Brand/600、下部 3px インジケータ | `color: var(--color-text-emphasis); border-bottom: 3px solid var(--color-border-emphasis)` | `aria-selected="true"` |
| inactive | テキスト Black/500、インジケータなし | `color: var(--color-text-secondary)` | `aria-selected="false"` |
| hover | テキスト色が若干濃く | `filter: brightness(0.9)` | — |
| focus | focus-ring 表示 | `outline: 2px solid var(--color-focus-ring); outline-offset: 2px` | — |
| disabled | opacity: 0.4, cursor: not-allowed | `opacity: 0.4; pointer-events: none` | `aria-disabled="true"` |

**focus-ring**: `:focus-visible` のみ。マウスクリックでは非表示。

---

## Design Tokens

> See: [`design-tokens.md`](../design-tokens.md) for full token definitions

| Token | DS v3 Reference | Resolved Value | Usage |
|-------|----------------|----------------|-------|
| `--tab-height` | — | `42px` | タブバー高さ |
| `--tab-bg` | `var(--color-bg-default)` | Black/0 `#FFFFFF` | タブバー背景 |
| `--tab-active-text` | `var(--color-text-emphasis)` | Brand/600 `#5538EE` | アクティブタブテキスト |
| `--tab-inactive-text` | `var(--color-text-secondary)` | Black/500 `#777681` | 非アクティブタブテキスト |
| `--tab-indicator` | `var(--color-border-emphasis)` | Brand/600 `#5538EE` | アクティブインジケータ |
| `--tab-indicator-width` | `var(--border-width-lg)` | `3px` | インジケータ太さ |
| `--tab-border` | `var(--color-border-default)` | Black/200 `#DADADD` | 下部ボーダー |
| `--tab-border-width` | `var(--border-width-sm)` | `1px` | 下部ボーダー太さ |
| `--tab-padding` | `var(--space-md)` | `12px` | タブボタン内パディング |
| `--tab-gap` | `var(--space-xs)` | `6px` | タブボタン間ギャップ |
| `--tab-font-size` | `var(--font-size-sm)` | `12px` | ラベルフォントサイズ |
| `--tab-font-weight` | `var(--font-weight-bold)` | `700` | ラベルフォントウェイト |
| `--tab-line-height` | — | `1.5` | ラベル行高さ |
| `--tab-font-family` | `var(--font-family)` | `Noto Sans JP` | フォント |
| `--tab-badge-bg` | `var(--color-bg-emphasis)` | Brand/600 `#5538EE` | バッジ背景 |
| `--tab-badge-text` | `var(--color-text-inverse)` | Black/0 `#FFFFFF` | バッジテキスト |
| `--tab-badge-size` | — | `16px` | バッジサイズ（min-width, width, height） |
| `--tab-badge-font-size` | `var(--font-size-2xs)` | `10px` | バッジフォントサイズ |
| `--tab-badge-radius` | `var(--radius-full)` | `9999px` | バッジ角丸 |
| `--tab-disabled-opacity` | — | `0.4` | 無効時透明度 |

---

## Accessibility

### ARIA

| Attribute | Value | Condition |
|-----------|-------|-----------|
| `role` | `tablist` | タブバーコンテナ |
| `role` | `tab` | 各タブボタン |
| `role` | `tabpanel` | タブに紐付くコンテンツ領域 |
| `aria-selected` | `true/false` | アクティブ/非アクティブ |
| `aria-controls` | tabpanel の id | 各タブボタン |
| `aria-labelledby` | tab の id | 各タブパネル |
| `aria-disabled` | `true` | 無効タブ |

### Keyboard

| Key | Action |
|-----|--------|
| `←` / `→` | 前後のタブにフォーカス移動 |
| `Home` | 最初のタブにフォーカス |
| `End` | 最後のタブにフォーカス |
| `Enter` / `Space` | フォーカス中のタブをアクティブ化 |
| `Tab` | タブリストからタブパネルへフォーカス移動 |

### Focus Management
- 矢印キーでのフォーカス移動は `tablist` 内でループする（最後→最初）
- `Tab` キーは `tablist` を離れてパネルへ移動
- disabled なタブはフォーカス移動時にスキップする

### Color Contrast
- アクティブ: Brand/600 テキスト on 白背景 → 4.5:1 以上
- 非アクティブ: Black/500 テキスト on 白背景 → 4.5:1 以上
- バッジ: 白テキスト on Brand/600 背景 → 4.5:1 以上

---

## Do / Don't

### Do
- ✅ タブラベルは短く簡潔に（2〜4文字が理想） → 均等幅で収まる
- ✅ 2〜6個の範囲で使用する → それ以上はスクロール可能なタブを検討
- ✅ アクティブタブに対応するコンテンツを即座に表示 → 遅延ロード時はスケルトン表示
- ✅ バッジは未読/新着数など意味のある数値に限定 → 装飾目的で使わない

### Don't
- ❌ タブをページ遷移に使わない → ナビゲーションバーやリンクを使う
- ❌ タブの順序を動的に変更しない → ユーザーの空間記憶を壊す
- ❌ 1つのタブだけで使わない → タブは複数選択肢の切り替えUI
- ❌ ネストしたタブ（タブ内タブ）は避ける → 情報構造を見直す
- ❌ 7個以上のタブを横並びにしない → ラベルが潰れて判読不能になる

---

## Related

### Similar Components

| Component | Use When | Don't Use When |
|-----------|----------|---------------|
| Tab | 同一画面内のコンテンツ切り替え | ページ遷移 |
| Segmented Controls | 2〜3個の排他的な表示モード切り替え | 多数のセクション |
| Global Navigation | アプリ全体の下部ナビゲーション | セクション内の切り替え |
| Accordion | 複数セクションの展開/折りたたみ | 排他的な1つの表示 |

### Composition Patterns
- → `vision/references/patterns/profile-tabs.md` — プロフィール画面でのタブ切り替え
- → `vision/references/patterns/search-results.md` — 検索結果のカテゴリ切り替え
