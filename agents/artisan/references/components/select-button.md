# Select Button

## Overview

| 項目 | 値 |
|------|-----|
| Name | Select Button |
| Description | カード型の選択肢ボタン。タップで選択/解除を切り替える排他・複数選択対応の選択UI |
| Layer | Atom |
| Category | Form |
| Status | Stable |

---

## Anatomy

```
┌─────────────────────────┐
│                          │
│      [1]Label            │
│                          │
└─────────────────────────┘
```

| # | Part | Required | Description |
|----|------|----------|-------------|
| 1 | Label | Required | 選択肢のテキスト。中央揃え。flex: 1 で幅いっぱいに配置 |

---

## Props / API

```typescript
interface SelectButtonProps {
  /** 表示ラベル */
  label: string;
  /** サイズ */
  size?: 'S' | 'M';
  /** 選択状態 */
  isSelected?: boolean;
  /** 無効状態 */
  isDisabled?: boolean;
  /** 最小幅 */
  minWidth?: number;
  /** クリックハンドラ */
  onClick?: (event: MouseEvent) => void;
}
```

**デフォルト値:** `size="S"`, `isSelected=false`, `isDisabled=false`, `minWidth=112`

---

## Variants

### Size

| Size | Height | Padding | Font Size | Min Width | Use Case |
|------|--------|---------|-----------|-----------|----------|
| S | 45px | 12px 均等 / `var(--space-md)` | 14px / `var(--font-size-md)` | 112px | 標準選択肢、コンパクトレイアウト |
| M | 53px | 16px 12px（Y: `var(--space-lg)` / X: `var(--space-md)`） | 14px / `var(--font-size-md)` | 112px | 強調選択肢、モバイルタッチターゲット |

### Status

| Status | Background | Text Color | Font Weight | Border | Description |
|--------|-----------|------------|-------------|--------|-------------|
| Off（未選択） | `bg-default` `#FFFFFF` | `text-default` `#27272A` | 400 (Regular) | `border-default` `#DADADD` 1px | 未選択の通常状態 |
| On（選択済） | `bg-default` `#FFFFFF` | `text-emphasis` `#5538EE` | 700 (Bold) | `border-emphasis` `#5538EE` 2px | 選択中の強調状態 |
| Disabled（無効） | `bg-tertiary` `#F7F7F8` | `text-disabled` `#94939D` | 400 (Regular) | none | 選択不可の状態 |

---

## States

| State | Visual Change | CSS | ARIA |
|-------|--------------|-----|------|
| default (off) | 白背景、グレーボーダー 1px、通常テキスト | `background: var(--color-bg-default); border: 1px solid var(--color-border-default); color: var(--color-text-default); font-weight: 400` | `aria-pressed="false"` |
| selected (on) | 白背景、Brand ボーダー 2px、Brand テキスト、Bold | `background: var(--color-bg-default); border: 2px solid var(--color-border-emphasis); color: var(--color-text-emphasis); font-weight: 700` | `aria-pressed="true"` |
| hover | 背景色を微調整 | `background: var(--color-bg-interactive)` | — |
| active | scale(0.98) | `transform: scale(0.98)` | — |
| focus | focus-ring 表示 | `outline: 2px solid var(--color-focus-ring); outline-offset: 2px` | — |
| disabled | グレー背景、薄テキスト、ボーダーなし | `background: var(--color-bg-tertiary); color: var(--color-text-disabled); border: none` | `aria-disabled="true"` |

**focus-ring**: `:focus-visible` のみ。マウスクリックでは非表示。

---

## Design Tokens

> See: [`design-tokens.md`](../design-tokens.md) for full token definitions

| Token | DS v3 Reference | Resolved Value | Usage |
|-------|----------------|----------------|-------|
| `--selbtn-bg` | `var(--color-bg-default)` | Black/0 `#FFFFFF` | 通常背景（Off / On 共通） |
| `--selbtn-bg-disabled` | `var(--color-bg-tertiary)` | Black/50 `#F7F7F8` | 無効時背景 |
| `--selbtn-border-off` | `var(--color-border-default)` | Black/200 `#DADADD` | 未選択ボーダー |
| `--selbtn-border-off-width` | `var(--border-width-sm)` | `1px` | 未選択ボーダー幅 |
| `--selbtn-border-on` | `var(--color-border-emphasis)` | Brand/600 `#5538EE` | 選択時ボーダー |
| `--selbtn-border-on-width` | `var(--border-width-md)` | `2px` | 選択時ボーダー幅 |
| `--selbtn-text-off` | `var(--color-text-default)` | Black/950 `#27272A` | 未選択テキスト |
| `--selbtn-text-on` | `var(--color-text-emphasis)` | Brand/600 `#5538EE` | 選択時テキスト |
| `--selbtn-text-disabled` | `var(--color-text-disabled)` | Black/400 `#94939D` | 無効テキスト |
| `--selbtn-text-size` | `var(--font-size-md)` | `14px` | フォントサイズ |
| `--selbtn-line-height` | — | `1.5` | テキスト行高 |
| `--selbtn-text-weight-off` | `var(--font-weight-regular)` | `400` | 未選択フォントウェイト |
| `--selbtn-text-weight-on` | `var(--font-weight-bold)` | `700` | 選択時フォントウェイト |
| `--selbtn-radius` | `var(--radius-sm)` | `8px` | 角丸 |
| `--selbtn-min-width` | — | `112px` | 最小幅 |
| `--selbtn-width` | — | `120px` | デフォルト幅 |
| `--selbtn-padding-s` | `var(--space-md)` | `12px` | Size S パディング（均等） |
| `--selbtn-padding-m-y` | `var(--space-lg)` | `16px` | Size M 上下パディング |
| `--selbtn-padding-m-x` | `var(--space-md)` | `12px` | Size M 左右パディング |
| `--selbtn-font-family` | `var(--font-family)` | `Noto Sans JP` | フォント |
| `--selbtn-transition` | `150ms ease` | — | トランジション |

---

## Accessibility

### ARIA

| Attribute | Value | Condition |
|-----------|-------|-----------|
| `role` | `option` | `role="listbox"` グループ内で使用時 |
| `aria-pressed` | `true/false` | トグルボタンとして使用時 |
| `aria-selected` | `true/false` | `role="option"` 使用時 |
| `aria-disabled` | `true` | `isDisabled` 時 |

### Keyboard

| Key | Action |
|-----|--------|
| `Enter` / `Space` | 選択/解除をトグル |
| `Tab` | 次の SelectButton へフォーカス移動 |
| `←` / `→` | グループ内で前後の SelectButton へ移動（オプション） |

### Color Contrast
- Off: Black/950 テキスト on 白背景 → 4.5:1 以上
- On: Brand/600 テキスト on 白背景 → 4.5:1 以上
- Disabled: Black/400 テキスト on Black/50 背景 → 3:1 以上（装飾的要素として許容）

---

## Do / Don't

### Do
- ✅ 短いラベル（1〜6文字）を使う → カード型レイアウトに収まるサイズ
- ✅ プロフィール設定やアンケートの選択肢に使用する → 視覚的に選択状態がわかりやすい
- ✅ グリッドレイアウトで複数並べる → 均等幅で整列
- ✅ 排他選択（single）と複数選択（multi）をコンテキストで使い分ける → 親コンポーネントで制御
- ✅ 選択状態変更時にフォントウェイト変更でレイアウトシフトが起きないよう幅を固定する → `min-width` 活用

### Don't
- ❌ 長文ラベルを入れない → テキストが溢れる。長い説明は別コンポーネントを検討
- ❌ ナビゲーション用途に使わない → Segmented Controls や Tab を使用
- ❌ フォーム送信トリガーに使わない → Button を使用
- ❌ disabled を選択状態（On）と組み合わせない → 選択済み+無効の視覚状態が未定義
- ❌ 1個だけで使わない → 最低2個以上の選択肢を提示

---

## Related

### Similar Components

| Component | Use When | Don't Use When |
|-----------|----------|---------------|
| Select Button | 視覚的に目立つカード型選択 | 選択肢が多い（7個以上） |
| RadioGroup | フォーム内の排他選択（ラベル+説明付き） | 視覚的強調が必要 |
| Checkbox | 複数選択（ラベル+チェックマーク） | カード型UIが求められる |
| Segmented Controls | ビュー/モード切り替え | フォーム入力の選択 |
| Chip | タグ型のコンパクト選択 | 大きなタッチターゲットが必要 |

### Composition Patterns
- → `vision/references/patterns/profile-setup.md` — プロフィール設定での選択肢グリッド
- → `vision/references/patterns/survey-form.md` — アンケートフォーム内での配置
