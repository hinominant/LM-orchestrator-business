# Select Oneline

## Overview

| 項目 | 値 |
|------|-----|
| Name | Select Oneline |
| Description | ブラウザネイティブの `<select>` を使用した1行セレクト。ドロップダウンの選択肢表示はOS/ブラウザデフォルトに委譲する |
| Layer | Atom |
| Category | Form |
| Status | Stable |

---

## Anatomy

```
┌────────────────────────────────────┐
│ [1]Selected Value / Placeholder    │ [2]▼ Dropdown Icon
└────────────────────────────────────┘
```

| # | Part | Required | Description |
|----|------|----------|-------------|
| 1 | Value / Placeholder | Required | 現在の選択値またはプレースホルダーテキスト。flex: 1 で幅いっぱいに配置 |
| 2 | Dropdown Icon | Required | ドロップダウンを示す下向き矢印アイコン（20px x 20px） |

**仕様注記:** 選択肢のドロップダウン表示はブラウザデフォルトを使用する。カスタムドロップダウンは実装しない。

---

## Props / API

```typescript
interface SelectOnelineProps {
  /** 選択肢 */
  options: SelectOnelineOption[];
  /** 選択値 */
  value?: string;
  /** プレースホルダー */
  placeholder?: string;
  /** ラベル（視覚非表示でもaria-label必須） */
  label: string;
  /** 無効状態 */
  isDisabled?: boolean;
  /** 必須 */
  isRequired?: boolean;
  /** エラー状態 */
  isInvalid?: boolean;
  /** エラーメッセージ */
  errorMessage?: string;
  /** 変更ハンドラ */
  onChange?: (value: string) => void;
}

interface SelectOnelineOption {
  value: string;
  label: string;
  isDisabled?: boolean;
}
```

**デフォルト値:** `placeholder="選択肢"`, `isDisabled=false`

---

## Variants

### Size

単一サイズのみ。Figma上に S/M/L の区分はない。

| Property | Value | Token | Description |
|----------|-------|-------|-------------|
| Height | 40px | — | コンポーネント固定高さ |
| Width | 120px（デフォルト） | — | コンテンツに応じて可変可能 |
| Font Size | 14px | `var(--font-size-md)` | 選択値テキスト |
| Font Weight | 400 (Regular) | `var(--font-weight-regular)` | テキストウェイト |
| Line Height | 1.5 | — | テキスト行高 |
| Padding Left | 12px | `var(--space-md)` | 左パディング |
| Padding Right | 8px | `var(--space-sm)` | 右パディング（アイコン分コンパクト） |
| Padding Y | 4px | `var(--space-2xs)` | 上下パディング |
| Icon Size | 20px | — | ドロップダウン矢印アイコン |
| Gap | 8px | `var(--space-sm)` | テキストとアイコンの間隔 |
| Radius | 12px | `var(--radius-md)` | 角丸 |
| Border Width | 1px | `var(--border-width-sm)` | ボーダー幅 |

---

## States

| State | Visual Change | CSS | ARIA |
|-------|--------------|-----|------|
| default | 白背景、グレーボーダー 1px | `background: var(--color-bg-default); border: 1px solid var(--color-border-default)` | — |
| hover | ボーダー色を濃く | `border-color: var(--color-border-hover)` | — |
| focus | Brand ボーダー + focus-ring | `border-color: var(--color-border-emphasis); outline: 2px solid var(--color-focus-ring); outline-offset: 2px` | — |
| filled | 選択値テキスト表示 | `color: var(--color-text-default)` | — |
| placeholder | テキスト色が薄い | `color: var(--color-text-disabled)` | — |
| disabled | opacity: 0.4, 操作不可 | `opacity: 0.4; pointer-events: none` | `aria-disabled="true"` |
| error | Red ボーダー | `border-color: var(--color-border-critical)` | `aria-invalid="true"` |

**focus-ring**: `:focus-visible` のみ。マウスクリックでは非表示。

---

## Design Tokens

> See: [`design-tokens.md`](../design-tokens.md) for full token definitions

| Token | DS v3 Reference | Resolved Value | Usage |
|-------|----------------|----------------|-------|
| `--selone-bg` | `var(--color-bg-default)` | Black/0 `#FFFFFF` | 背景色 |
| `--selone-border` | `var(--color-border-default)` | Black/200 `#DADADD` | ボーダー |
| `--selone-border-width` | `var(--border-width-sm)` | `1px` | ボーダー幅 |
| `--selone-border-focus` | `var(--color-border-emphasis)` | Brand/600 `#5538EE` | フォーカス時ボーダー |
| `--selone-border-error` | `var(--color-border-critical)` | Red/600 `#FF001F` | エラー時ボーダー |
| `--selone-text` | `var(--color-text-default)` | Black/950 `#27272A` | 選択値テキスト |
| `--selone-placeholder` | `var(--color-text-disabled)` | Black/400 `#94939D` | プレースホルダー |
| `--selone-text-size` | `var(--font-size-md)` | `14px` | フォントサイズ |
| `--selone-text-weight` | `var(--font-weight-regular)` | `400` | フォントウェイト |
| `--selone-line-height` | — | `1.5` | テキスト行高 |
| `--selone-icon-color` | `var(--color-icon-secondary)` | Black/500 `#777681` | ドロップダウンアイコン色 |
| `--selone-icon-size` | — | `20px` | アイコンサイズ |
| `--selone-radius` | `var(--radius-md)` | `12px` | 角丸 |
| `--selone-height` | — | `40px` | 高さ |
| `--selone-width` | — | `120px` | デフォルト幅 |
| `--selone-padding-left` | `var(--space-md)` | `12px` | 左パディング |
| `--selone-padding-right` | `var(--space-sm)` | `8px` | 右パディング |
| `--selone-padding-y` | `var(--space-2xs)` | `4px` | 上下パディング |
| `--selone-gap` | `var(--space-sm)` | `8px` | テキスト・アイコン間隔 |
| `--selone-font-family` | `var(--font-family)` | `Noto Sans JP` | フォント |

---

## Accessibility

### ARIA

| Attribute | Value | Condition |
|-----------|-------|-----------|
| `aria-label` | ラベルテキスト | ラベルが視覚的に非表示の場合 |
| `aria-required` | `true` | `isRequired` 時 |
| `aria-invalid` | `true` | `isInvalid` 時 |
| `aria-disabled` | `true` | `isDisabled` 時 |
| `aria-describedby` | errorMessage の id | エラーメッセージがある時 |

### Keyboard

| Key | Action |
|-----|--------|
| `Enter` / `Space` | ブラウザネイティブのドロップダウンを開く |
| `↑` / `↓` | 選択肢を変更（ブラウザネイティブ動作） |
| `Tab` | 次の要素へフォーカス移動 |
| `Escape` | ドロップダウンを閉じる（ブラウザネイティブ動作） |

### Label
- `<label>` 要素で `for`/`htmlFor` を使い `<select>` と紐付け
- ラベルを視覚的に非表示にする場合は `aria-label` を使用
- ブラウザネイティブ `<select>` のため、追加の ARIA ロール不要

### Color Contrast
- テキスト（Black/950 `#27272A`）on 白背景 → 4.5:1 以上
- プレースホルダー（Black/400 `#94939D`）on 白背景 → 3:1 以上
- アイコン（Black/500 `#777681`）on 白背景 → 3:1 以上（非テキスト要素）

---

## Do / Don't

### Do
- ✅ 選択肢が少なく（2〜10個程度）シンプルな場合に使用する → OS/ブラウザの最適化されたUIを活用
- ✅ ラベルは視覚的に非表示でも `aria-label` で必ず提供する → スクリーンリーダー対応
- ✅ インラインフィルタや並び替え等の軽量な選択に使用する → フォーム外の補助的な選択
- ✅ モバイルではネイティブピッカーが表示されることを前提に設計する → UX最適化
- ✅ プレースホルダーに操作指示（「選択肢」「選択してください」等）を入れる → ユーザーが操作方法を理解できる

### Don't
- ❌ 検索・フィルタ付きの選択には使わない → Select（カスタムドロップダウン）を使用
- ❌ 複数選択には使わない → multi 対応が必要なら Select を使用
- ❌ 選択肢にアイコンやリッチコンテンツを入れない → ブラウザネイティブは文字列のみ
- ❌ ドロップダウンの見た目をカスタマイズしようとしない → ブラウザデフォルトに委譲する設計方針
- ❌ 長いラベルの選択肢を入れない → トリガー幅を超えた場合 `text-overflow: ellipsis` で対応

---

## Related

### Similar Components

| Component | Use When | Don't Use When |
|-----------|----------|---------------|
| Select Oneline | シンプルな選択（ブラウザネイティブ） | 検索・フィルタが必要 |
| Select | カスタムドロップダウン、検索、複数選択 | 軽量な選択で十分 |
| Select Button | カード型の視覚的選択 | インライン配置 |
| RadioGroup | 2〜5個の排他選択をフォーム内で | インライン/コンパクト配置 |

### Composition Patterns
- → `vision/references/patterns/sort-control.md` — 並び替えコントロールとしての使用
- → `vision/references/patterns/filter-bar.md` — フィルタバー内でのインライン配置
- → `select.md` — カスタム Select との使い分け
