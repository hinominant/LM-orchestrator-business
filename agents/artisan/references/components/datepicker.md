# Datepicker

## Overview

| 項目 | 値 |
|------|-----|
| Name | Datepicker |
| Description | 日付入力フィールド |
| Layer | Atom |
| Category | Form |
| Status | Stable |

---

## Anatomy

```
┌─────────────────────────────────────┐
│  [1]Label                           │
│  ┌─────────────────────────────┐    │
│  │ [2]年月日 / YYYY/MM/DD      │    │
│  └─────────────────────────────┘    │
│  [3]Helper / Error text             │
└─────────────────────────────────────┘
```

| # | Part | Required | Description |
|----|------|----------|-------------|
| 1 | Label | Optional | 入力内容を説明するラベルテキスト |
| 2 | Placeholder / Value | Required | プレースホルダー「年月日」または入力値（YYYY/MM/DD 形式） |
| 3 | Helper / Error text | Optional | 補助テキストまたはエラーメッセージ |

---

## Props / API

```typescript
interface DatepickerProps {
  /** ラベルテキスト */
  label?: string;
  /** プレースホルダー */
  placeholder?: string;
  /** 値 (Date or string) */
  value?: Date | string;
  /** エラー状態 */
  isError?: boolean;
  /** エラーメッセージ */
  errorMessage?: string;
  /** ヘルパーテキスト */
  helperText?: string;
  /** 無効状態 */
  isDisabled?: boolean;
  /** 最小日付 */
  minDate?: Date;
  /** 最大日付 */
  maxDate?: Date;
  /** 変更ハンドラ */
  onChange?: (date: Date | null) => void;
}
```

**デフォルト値:** `placeholder="年月日"`

**表示フォーマット:** `YYYY/MM/DD`

---

## States

| State | Visual Change | CSS | ARIA |
|-------|--------------|-----|------|
| default | グレーボーダー、プレースホルダー「年月日」 | `border: 1px solid var(--color-border-default)` | — |
| focus | ブランドカラーボーダー | `border: 2px solid var(--color-border-emphasis)` | — |
| filled | 日付値表示（YYYY/MM/DD） | — | — |
| error-empty | ピンク背景 + 赤ボーダー + エラーメッセージ | `background: var(--color-bg-critical-subtle); border: 1px solid var(--color-border-critical)` | `aria-invalid="true"` |
| error-filled | ピンク背景 + 日付値表示 | `background: var(--color-bg-critical-subtle)` | `aria-invalid="true"` |
| disabled | 薄いグレー背景、操作不可 | `background: var(--color-bg-disabled); opacity: 0.4; pointer-events: none` | `aria-disabled="true"` |

---

## Design Tokens

> See: [`design-tokens.md`](../design-tokens.md) for full token definitions

| Token | DS v3 Reference | Resolved Value | Usage |
|-------|----------------|----------------|-------|
| `--datepicker-bg` | `var(--color-bg-default)` | Black/0 `#FFFFFF` | デフォルト背景 |
| `--datepicker-border` | `var(--color-border-default)` | Black/200 `#DADADD` | デフォルトボーダー |
| `--datepicker-border-focus` | `var(--color-border-emphasis)` | Brand/600 `#5538EE` | フォーカス時ボーダー |
| `--datepicker-border-error` | `var(--color-border-critical)` | Red/600 `#FF001F` | エラー時ボーダー |
| `--datepicker-bg-error` | `var(--color-bg-critical-subtle)` | Red/50 (pink tint) | エラー時背景 |
| `--datepicker-text` | `var(--color-text-default)` | Black/950 `#27272A` | 入力テキスト |
| `--datepicker-placeholder` | `var(--color-text-secondary)` | Black/500 `#777681` | プレースホルダー |
| `--datepicker-disabled-bg` | `var(--color-bg-disabled)` | Black/200 `#DADADD` | 無効時背景 |
| `--datepicker-disabled-text` | `var(--color-text-disabled)` | Black/400 `#94939D` | 無効時テキスト |
| `--datepicker-radius` | `var(--radius-md)` | `12px` | 角丸 |

---

## Accessibility

### ARIA

| Attribute | Value | Condition |
|-----------|-------|-----------|
| `aria-invalid` | `true` | `isError` 時 |
| `aria-disabled` | `true` | `isDisabled` 時 |
| `aria-describedby` | ヘルパー/エラーテキストID | ヘルパーまたはエラーテキスト表示時 |

### Keyboard

| Key | Action |
|-----|--------|
| `Tab` | フォーカス移動 |

---

## Related

### Similar Components

| Component | Use When | Don't Use When |
|-----------|----------|---------------|
| Datepicker | 日付の入力が必要 | 日時（時刻含む）の入力 |
| Input | 自由テキスト入力 | 日付入力 |
| Select | 選択肢からの選択 | 日付入力 |
