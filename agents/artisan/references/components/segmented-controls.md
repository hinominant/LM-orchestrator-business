# Segmented Controls

## Overview

| 項目 | 値 |
|------|-----|
| Name | Segmented Controls |
| Description | 相互排他的なビューやモードを切り替えるタブ型コントロール |
| Layer | Molecule |
| Category | Navigation |
| Status | Stable |

---

## Anatomy

```
┌─────────────────────────────────────────────────────┐
│ [1]Container                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│  │[2]Segment │ │[2]Segment│ │[2]Segment│  ...        │
│  │ [3]Label  │ │ [3]Label │ │[3]Label [4]Badge│      │
│  └──────────┘ └──────────┘ └──────────┘             │
└─────────────────────────────────────────────────────┘
```

| # | Part | Required | Description |
|----|------|----------|-------------|
| 1 | Container | Required | 全セグメントを囲む外枠。border 1px + padding 2px で内部セグメントを包含 |
| 2 | Segment | Required | 個別の選択可能領域。最低2個、最大5個 |
| 3 | Label | Required | セグメントのテキストラベル |
| 4 | Badge | Optional | 通知件数を示すバッジ。アクティブ/非アクティブ問わず表示可能 |

---

## Props / API

```typescript
interface SegmentedControlsProps {
  /** セグメント定義の配列 */
  segments: SegmentItem[];
  /** 選択中セグメントの値 */
  value: string;
  /** セグメント数（2〜5） */
  segmentCount?: 2 | 3 | 4 | 5;
  /** 無効状態 */
  isDisabled?: boolean;
  /** 全幅表示 */
  isFullWidth?: boolean;
  /** 変更ハンドラ */
  onChange?: (value: string) => void;
}

interface SegmentItem {
  /** セグメントの値（一意） */
  value: string;
  /** 表示ラベル */
  label: string;
  /** バッジカウント（0以上で表示） */
  badgeCount?: number;
  /** 個別無効 */
  isDisabled?: boolean;
}
```

**デフォルト値:** `segmentCount=2`, `isFullWidth=false`

---

## Variants

### Segment Count

| Count | Description | Use Case |
|-------|------------|----------|
| 2 | 2分割 | ON/OFF、2カテゴリ切り替え |
| 3 | 3分割 | 3カテゴリ（すべて/男性/女性 等） |
| 4 | 4分割 | 詳細フィルタ |
| 5 | 5分割（最大） | 多段フィルタ（タブが狭くなるため非推奨） |

### Size

| Property | Value | Token | Description |
|----------|-------|-------|-------------|
| Container Height | 40px | — | 外枠の高さ |
| Container Width | 320px（デフォルト） | — | コンテンツに応じて可変。`isFullWidth` で親幅に追従 |
| Segment Height | 36px | — | 内部セグメントの高さ（container padding 2px 分差し引き） |
| Font Size | 12px | `var(--font-size-sm)` | ラベルテキスト |
| Line Height | 1.5 | — | テキスト行高 |
| Padding X | 12px | `var(--space-md)` | セグメント左右パディング |
| Container Padding | 2px | `var(--space-3xs)` | 外枠内側パディング |
| Container Radius | 10px | — | 外枠角丸 |
| Segment Radius | 8px | `var(--radius-sm)` | 個別セグメント角丸 |

### Badge

| Property | Value | Token |
|----------|-------|-------|
| Size | 16px x 16px（円形） | — |
| Font Size | 10px | `var(--font-size-2xs)` |
| Font Weight | 700 (Bold) | `var(--font-weight-bold)` |
| Background | Brand/600 `#5538EE` | `var(--color-bg-emphasis)` |
| Text | `#FFFFFF` | `var(--color-text-inverse)` |
| Radius | 9999px | `var(--radius-full)` |
| Padding X | 4px | `var(--space-2xs)` |
| Padding Bottom | 2px | `var(--space-3xs)` |
| Gap（ラベルとの間） | 4px | `var(--space-2xs)` |

---

## States

| State | Visual Change | CSS | ARIA |
|-------|--------------|-----|------|
| default (inactive) | ボーダーなし、Regular ウェイト、Brand テキスト | `font-weight: 400; color: var(--color-text-emphasis)` | `aria-selected="false"` |
| active | Brand ボーダー 2px、Bold ウェイト、Brand テキスト | `border: 2px solid var(--color-border-emphasis); font-weight: 700; color: var(--color-text-emphasis)` | `aria-selected="true"` |
| hover | 背景色を微調整 | `background: var(--color-bg-interactive)` | — |
| focus | focus-ring 表示 | `outline: 2px solid var(--color-focus-ring); outline-offset: 2px` | — |
| disabled | opacity: 0.4, cursor: not-allowed | `opacity: 0.4; pointer-events: none` | `aria-disabled="true"` |

**注意:** アクティブ・非アクティブともにテキスト色は Brand/600 `#5538EE` で共通。区別はボーダーの有無とフォントウェイトの Bold/Regular。

**focus-ring**: `:focus-visible` のみ。マウスクリックでは非表示。

---

## Design Tokens

> See: [`design-tokens.md`](../design-tokens.md) for full token definitions

| Token | DS v3 Reference | Resolved Value | Usage |
|-------|----------------|----------------|-------|
| `--seg-container-bg` | `var(--color-bg-default)` | Black/0 `#FFFFFF` | コンテナ背景 |
| `--seg-container-border` | `var(--color-border-default)` | Black/200 `#DADADD` | コンテナボーダー |
| `--seg-container-border-width` | `var(--border-width-sm)` | `1px` | コンテナボーダー幅 |
| `--seg-container-radius` | — | `10px` | コンテナ角丸 |
| `--seg-container-padding` | `var(--space-3xs)` | `2px` | コンテナ内側余白 |
| `--seg-segment-bg` | `var(--color-bg-default)` | Black/0 `#FFFFFF` | セグメント背景 |
| `--seg-segment-radius` | `var(--radius-sm)` | `8px` | セグメント角丸 |
| `--seg-segment-height` | — | `36px` | セグメント高さ |
| `--seg-active-border` | `var(--color-border-emphasis)` | Brand/600 `#5538EE` | アクティブ時ボーダー |
| `--seg-active-border-width` | `var(--border-width-md)` | `2px` | アクティブ時ボーダー幅 |
| `--seg-text` | `var(--color-text-emphasis)` | Brand/600 `#5538EE` | ラベルテキスト（全状態共通） |
| `--seg-text-size` | `var(--font-size-sm)` | `12px` | ラベルフォントサイズ |
| `--seg-text-weight-active` | `var(--font-weight-bold)` | `700` | アクティブ時フォントウェイト |
| `--seg-text-weight-inactive` | `var(--font-weight-regular)` | `400` | 非アクティブ時フォントウェイト |
| `--seg-badge-bg` | `var(--color-bg-emphasis)` | Brand/600 `#5538EE` | バッジ背景 |
| `--seg-badge-text` | `var(--color-text-inverse)` | Black/0 `#FFFFFF` | バッジテキスト |
| `--seg-badge-size` | — | `16px` | バッジサイズ |
| `--seg-badge-font-size` | `var(--font-size-2xs)` | `10px` | バッジフォントサイズ |
| `--seg-badge-radius` | `var(--radius-full)` | `9999px` | バッジ角丸 |
| `--seg-gap` | `var(--space-2xs)` | `4px` | ラベルとバッジの間隔 |
| `--seg-font-family` | `var(--font-family)` | `Noto Sans JP` | フォント |

---

## Accessibility

### ARIA

| Attribute | Value | Condition |
|-----------|-------|-----------|
| `role` | `tablist` | コンテナ要素 |
| `role` | `tab` | 各セグメント |
| `aria-selected` | `true/false` | アクティブ状態に応じて |
| `aria-disabled` | `true` | 個別またはコンポーネント全体が無効時 |
| `aria-controls` | パネル id | 制御先のコンテンツパネル |

### Keyboard

| Key | Action |
|-----|--------|
| `←` / `→` | 前後のセグメントにフォーカス移動 |
| `Home` / `End` | 最初/最後のセグメントにフォーカス移動 |
| `Enter` / `Space` | フォーカス中のセグメントを選択 |
| `Tab` | コンポーネント外へフォーカス移動（コンテナ単位でTab停止） |

### Focus Management
- Tab でコンテナにフォーカスが入ると、現在アクティブなセグメントにフォーカス
- 矢印キーでセグメント間を循環移動（最後→最初にループ）
- disabled なセグメントはスキップ

### Color Contrast
- ラベル（Brand/600 `#5538EE`）on 白背景 → 4.5:1 以上
- バッジ白テキスト on Brand/600 背景 → 4.5:1 以上

---

## Do / Don't

### Do
- ✅ セグメント数は2〜5に制限する → ラベルが読めなくなるのを防ぐ
- ✅ ラベルは短く簡潔に（2〜4文字推奨） → セグメント幅が均等配分（flex: 1）のため
- ✅ ページ/ビュー切り替えに使用する → コンテンツのフィルタリング
- ✅ 初期状態で必ず1つ選択済みにする → 未選択状態を許容しない
- ✅ バッジは未読数・件数など数値情報に限定する → 視覚的ノイズを抑える

### Don't
- ❌ フォーム入力のラジオ代替として使わない → フォーム選択には RadioGroup を使用
- ❌ 6個以上のセグメントを作らない → Tab コンポーネントを検討する
- ❌ アクション実行（保存、削除等）のトリガーに使わない → Button を使用
- ❌ セグメント幅を手動で不均等にしない → flex: 1 で均等配分が原則
- ❌ 未選択（全セグメント非アクティブ）状態を許容しない → 常に1つは選択

---

## Related

### Similar Components

| Component | Use When | Don't Use When |
|-----------|----------|---------------|
| Segmented Controls | 2〜5のビュー切り替え | 6個以上の切り替え |
| Tab | 6個以上のコンテンツ切り替え | 2〜3個の単純な切り替え |
| RadioGroup | フォーム内の排他選択 | ビュー/モード切り替え |
| Toggle | 2値の ON/OFF | 3つ以上の選択肢 |

### Composition Patterns
- → `vision/references/patterns/filter-bar.md` — フィルタバー内での配置
- → `vision/references/patterns/tab-navigation.md` — タブナビゲーションとの使い分け
