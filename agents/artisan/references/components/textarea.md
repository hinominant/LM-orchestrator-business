# Textarea

## Overview

| 項目 | 値 |
|------|-----|
| Name | Textarea |
| Description | 複数行テキスト入力フィールド |
| Layer | Atom |
| Category | Form |
| Status | Stable |

---

## Anatomy

```
┌─────────────────────────────────────┐
│  [1]Label                           │
│  ┌─────────────────────────────┐    │
│  │ [2]Placeholder / Value      │    │
│  │                             │    │
│  │                             │    │
│  │                    [3]0/400 │    │
│  └─────────────────────────────┘    │
│  [4]Helper / Error text             │
└─────────────────────────────────────┘
```

| # | Part | Required | Description |
|----|------|----------|-------------|
| 1 | Label | Optional | 入力内容を説明するラベルテキスト |
| 2 | Placeholder / Value | Required | プレースホルダーまたは入力済みテキスト |
| 3 | Counter | Optional | 文字数カウンター（右下に `現在値/最大値` 形式で表示） |
| 4 | Helper / Error text | Optional | 補助テキストまたはエラーメッセージ |

---

## Props / API

```typescript
interface TextareaProps {
  /** ラベルテキスト */
  label?: string;
  /** プレースホルダー */
  placeholder?: string;
  /** 値 */
  value?: string;
  /** 最大文字数 */
  maxLength?: number;
  /** 文字数カウンター表示 */
  showCounter?: boolean;
  /** エラー状態 */
  isError?: boolean;
  /** エラーメッセージ */
  errorMessage?: string;
  /** ヘルパーテキスト */
  helperText?: string;
  /** 無効状態 */
  isDisabled?: boolean;
  /** 変更ハンドラ */
  onChange?: (event: ChangeEvent<HTMLTextAreaElement>) => void;
}
```

**デフォルト値:** `maxLength=400`, `showCounter=true`

---

## States

| State | Visual Change | CSS | ARIA |
|-------|--------------|-----|------|
| default | グレーボーダー | `border: 1px solid var(--color-border-default)` | — |
| focus | ブランドカラーボーダー | `border: 2px solid var(--color-border-emphasis)` | — |
| filled | 入力テキスト表示、カウンター更新 | — | — |
| error-empty | ピンク背景 + 赤ボーダー + エラーメッセージ | `background: var(--color-bg-critical-subtle); border: 1px solid var(--color-border-critical)` | `aria-invalid="true"` |
| error-filled | ピンク背景 + 入力テキスト表示 | `background: var(--color-bg-critical-subtle)` | `aria-invalid="true"` |
| disabled | 薄いグレー背景、操作不可 | `background: var(--color-bg-disabled); opacity: 0.4; pointer-events: none` | `aria-disabled="true"` |

---

## Design Tokens

> See: [`design-tokens.md`](../design-tokens.md) for full token definitions

| Token | DS v3 Reference | Resolved Value | Usage |
|-------|----------------|----------------|-------|
| `--textarea-bg` | `var(--color-bg-default)` | Black/0 `#FFFFFF` | デフォルト背景 |
| `--textarea-border` | `var(--color-border-default)` | Black/200 `#DADADD` | デフォルトボーダー |
| `--textarea-border-focus` | `var(--color-border-emphasis)` | Brand/600 `#5538EE` | フォーカス時ボーダー |
| `--textarea-border-error` | `var(--color-border-critical)` | Red/600 `#FF001F` | エラー時ボーダー |
| `--textarea-bg-error` | `var(--color-bg-critical-subtle)` | Red/50 (pink tint) | エラー時背景 |
| `--textarea-text` | `var(--color-text-default)` | Black/950 `#27272A` | 入力テキスト |
| `--textarea-placeholder` | `var(--color-text-secondary)` | Black/500 `#777681` | プレースホルダー |
| `--textarea-disabled-bg` | `var(--color-bg-disabled)` | Black/200 `#DADADD` | 無効時背景 |
| `--textarea-disabled-text` | `var(--color-text-disabled)` | Black/400 `#94939D` | 無効時テキスト |
| `--textarea-radius` | `var(--radius-md)` | `12px` | 角丸 |
| `--textarea-min-height` | — | `120px` | 最小高さ |
| `--textarea-counter-text` | `var(--color-text-secondary)` | Black/500 `#777681` | カウンターテキスト色 |

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
| Textarea | 複数行のテキスト入力が必要 | 1行の短いテキスト入力 |
| Input | 1行のテキスト入力 | 長文入力が必要な場面 |
