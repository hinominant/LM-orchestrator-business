# Toggle

## Overview

| 項目 | 値 |
|------|-----|
| Name | Toggle |
| Description | ON/OFF の2値を即座に切り替えるスイッチ要素 |
| Layer | Atom |
| Category | Form |
| Status | Stable |

---

## Anatomy

```
┌──────────────────────┐
│  [1]Track  [2]Thumb  │
└──────────────────────┘
[3]Label (外部)
```

| # | Part | Required | Description |
|----|------|----------|-------------|
| 1 | Track | Required | スイッチの背景トラック（32px x 20px） |
| 2 | Thumb | Required | スライドする円形ノブ（16px、白色） |
| 3 | Label | Required* | トグルの用途を説明するテキスト。*非表示の場合は `aria-label` 必須 |

---

## Props / API

```typescript
interface ToggleProps {
  /** ON/OFF 状態 */
  isChecked?: boolean;
  /** 無効状態 */
  isDisabled?: boolean;
  /** ラベルテキスト */
  label?: string;
  /** ラベル位置 */
  labelPlacement?: 'left' | 'right';
  /** 変更ハンドラ */
  onChange?: (isChecked: boolean) => void;
  /** aria-label（ラベル非表示時） */
  'aria-label'?: string;
}
```

**デフォルト値:** `isChecked=false`, `labelPlacement="right"`

---

## Variants

### Status

| Status | Track Color | Thumb Position | Use Case |
|--------|------------|----------------|----------|
| on | `bg-emphasis` Brand/600 `#5538EE` | 右端（`align-items: flex-end`） | 機能が有効 |
| off | `bg-disabled` Black/200 `#DADADD` | 左端（`align-items: flex-start`） | 機能が無効 |

### Dimensions

Figma定義は1サイズのみ:

| Part | Property | Value |
|------|----------|-------|
| Track | 幅 | 32px |
| Track | 高さ | 20px |
| Track | 角丸 | `var(--radius-full)` = 9999px |
| Track | padding | 2px (`var(--space-3xs)`) |
| Thumb | サイズ | 16px x 16px |
| Thumb | 角丸 | `var(--radius-full)` = 9999px |
| Thumb | 背景色 | `var(--color-bg-default)` = `#FFFFFF` |

---

## States

| State | Visual Change | CSS | ARIA |
|-------|--------------|-----|------|
| off | Track: Black/200、Thumb: 左端 | `background: var(--color-bg-disabled)` | `aria-checked="false"` |
| on | Track: Brand/600、Thumb: 右端 | `background: var(--color-bg-emphasis)` | `aria-checked="true"` |
| hover | Track の明度変化 | `filter: brightness(0.9)` | — |
| focus | focus-ring 表示 | `outline: 2px solid var(--color-focus-ring); outline-offset: 2px` | — |
| disabled + off | opacity: 0.4, cursor: not-allowed | `opacity: 0.4; pointer-events: none` | `aria-disabled="true"`, `aria-checked="false"` |
| disabled + on | opacity: 0.4, cursor: not-allowed | `opacity: 0.4; pointer-events: none` | `aria-disabled="true"`, `aria-checked="true"` |

**Thumb アニメーション**: `transition: transform 150ms ease` でスライド移動。

**focus-ring**: `:focus-visible` のみ。マウスクリックでは非表示。

---

## Design Tokens

> See: [`design-tokens.md`](../design-tokens.md) for full token definitions

| Token | DS v3 Reference | Resolved Value | Usage |
|-------|----------------|----------------|-------|
| `--toggle-track-width` | — | `32px` | トラック幅 |
| `--toggle-track-height` | — | `20px` | トラック高さ |
| `--toggle-track-on` | `var(--color-bg-emphasis)` | Brand/600 `#5538EE` | ON時トラック背景 |
| `--toggle-track-off` | `var(--color-bg-disabled)` | Black/200 `#DADADD` | OFF時トラック背景 |
| `--toggle-thumb-bg` | `var(--color-bg-default)` | Black/0 `#FFFFFF` | Thumb背景 |
| `--toggle-thumb-size` | — | `16px` | Thumbサイズ |
| `--toggle-track-radius` | `var(--radius-full)` | `9999px` | トラック角丸 |
| `--toggle-thumb-radius` | `var(--radius-full)` | `9999px` | Thumb角丸 |
| `--toggle-track-padding` | `var(--space-3xs)` | `2px` | トラック内パディング |
| `--toggle-transition` | `150ms ease` | — | トランジション |
| `--toggle-disabled-opacity` | — | `0.4` | 無効時透明度 |

---

## Accessibility

### ARIA

| Attribute | Value | Condition |
|-----------|-------|-----------|
| `role` | `switch` | 常時 |
| `aria-checked` | `true/false` | ON/OFF |
| `aria-disabled` | `true` | isDisabled 時 |
| `aria-label` | 操作説明 | ラベル非表示時 |
| `aria-labelledby` | label の id | ラベル表示時 |

### Keyboard

| Key | Action |
|-----|--------|
| `Space` | ON/OFF 切り替え |
| `Enter` | ON/OFF 切り替え |
| `Tab` | 次の要素へフォーカス移動 |

### Color Contrast
- ON Track (Brand/600 `#5538EE`) + 白 Thumb → 十分なコントラスト
- OFF Track (Black/200 `#DADADD`) + 白 Thumb → 形状で区別（色のみに依存しない）

---

## Do / Don't

### Do
- ✅ 即座に効果を反映する設定に使う → ページ保存不要の設定トグル
- ✅ ラベルは現在の状態ではなく、機能の説明を記載 → 「通知を受け取る」（「通知ON」ではない）
- ✅ ON/OFF の結果が明白な場合にのみ使用 → ユーザーが効果を予測できる
- ✅ disabled時はtooltipで理由を表示 → ユーザーが解決策を理解できる

### Don't
- ❌ フォーム送信が必要な設定にトグルを使わない → Checkbox + 送信ボタンを使う
- ❌ ラベルなしで配置しない → スクリーンリーダーで操作内容が不明になる
- ❌ 3つ以上の状態切り替えに使わない → SegmentedControl / Select を使う
- ❌ トグルの初期状態をONにしない（ダークパターン） → ユーザーが意図的にONにすべき

---

## Related

### Similar Components

| Component | Use When | Don't Use When |
|-----------|----------|---------------|
| Toggle | 即時反映の ON/OFF 切り替え | フォーム送信が必要 |
| Checkbox | フォーム内の true/false 選択 | 即時反映が期待される |
| RadioGroup | 3つ以上の排他選択 | 2値の切り替え |
| Select Button | 選択肢の選択/解除 | 2値の切り替え |

### Composition Patterns
- → `vision/references/patterns/settings-form.md` — 設定画面での通知トグル配置
- → `vision/references/patterns/list-item-toggle.md` — リスト項目内の右端トグル
