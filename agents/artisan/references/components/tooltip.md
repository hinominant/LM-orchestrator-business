# Tooltip

## Overview

| 項目 | 値 |
|------|-----|
| Name | Tooltip |
| Description | ホバー・フォーカス時に補足情報を表示する非インタラクティブなポップオーバー |
| Layer | Atom |
| Category | Overlay |
| Status | Stable |

---

## Anatomy

```
         ┌──────────────┐
         │  テキスト     │  ← [1] Content
         └──────┬───────┘
                ▼ ← [2] Arrow
           [Trigger]     ← [3] Trigger（任意の要素）
```

| # | Part | Required | Description |
|----|------|----------|-------------|
| 1 | Content | Required | 補足テキスト（12px Regular、最大200px幅、改行あり） |
| 2 | Arrow | Optional | トリガーへの方向矢印（8px × 4px） |
| 3 | Trigger | Required | ホバー/フォーカスを受け取る任意の要素 |

---

## Props / API

```typescript
interface TooltipProps {
  /** ツールチップに表示するテキスト */
  content: string;
  /** 表示位置 */
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end';
  /** 表示遅延（ms） */
  delayShow?: number;
  /** 非表示遅延（ms） */
  delayHide?: number;
  /** 矢印の表示 */
  hasArrow?: boolean;
  /** 強制表示/非表示（制御用） */
  isOpen?: boolean;
  /** トリガー要素 */
  children: React.ReactElement;
}
```

**デフォルト値:** `placement='top'`, `delayShow=300`, `delayHide=100`, `hasArrow=true`

---

## Variants

### Placement

| Placement | 使用場面 |
|-----------|---------|
| top（デフォルト） | 一般的な補足説明 |
| bottom | 画面上部のアイコンボタン |
| left / right | サイドバーアイコン |
| top-start / top-end | リスト項目のアクションアイコン |

### Layout

| Property | Value |
|----------|-------|
| 背景色 | Black/950 `#27272A` |
| テキスト色 | Black/0 `#FFFFFF` |
| フォントサイズ | 12px |
| フォントウェイト | 400（Regular） |
| 最大幅 | 200px |
| パディング | 6px 8px |
| Border Radius | 4px（`var(--radius-sm)`） |
| z-index | 1500 |

---

## States

| State | Trigger | Visual Change |
|-------|---------|--------------|
| hidden | — | `opacity: 0`, `pointer-events: none` |
| visible | hover / focus | `opacity: 1`、300ms遅延後表示 |
| exiting | hover離脱 / blur | `opacity: 0`、100ms遅延後非表示 |

**アニメーション:** `opacity 150ms ease-out` + placement方向への `translateY(±4px)` 解除

---

## Design Tokens

> See: [`design-tokens.md`](../design-tokens.md) for full token definitions

| Token | DS v3 Reference | Resolved Value | Usage |
|-------|----------------|----------------|-------|
| `--tooltip-bg` | Black/950 | `#27272A` | 背景色 |
| `--tooltip-text` | Black/0 | `#FFFFFF` | テキスト色 |
| `--tooltip-font-size` | — | `12px` | フォントサイズ |
| `--tooltip-max-width` | — | `200px` | 最大幅 |
| `--tooltip-padding` | — | `6px 8px` | パディング |
| `--tooltip-radius` | `var(--radius-sm)` | `4px` | 角丸 |
| `--tooltip-arrow-size` | — | `8px × 4px` | 矢印サイズ |
| `--tooltip-z-index` | — | `1500` | 重なり順 |
| `--tooltip-delay-show` | — | `300ms` | 表示遅延 |
| `--tooltip-delay-hide` | — | `100ms` | 非表示遅延 |

---

## Accessibility

### ARIA

| Attribute | Value | 付与先 |
|-----------|-------|--------|
| `role` | `tooltip` | Tooltipコンテンツ要素 |
| `aria-describedby` | tooltip要素のID | Trigger要素 |
| `id` | ユニークID | Tooltipコンテンツ要素 |

### Keyboard

| Key | Action |
|-----|--------|
| Tab / Shift+Tab | Trigger要素にフォーカス → Tooltip表示 |
| Escape | 表示中のTooltipを閉じる |

### Screen Reader
- `aria-describedby` でTooltipテキストをトリガー要素の説明として紐付ける
- Tooltipは補足情報のみ。必須情報はTooltipに入れない（スクリーンリーダーで見逃す可能性）

---

## Do / Don't

### Do
- ✅ アイコンボタンのラベル補足に使う → `aria-label` の視覚的補足
- ✅ 短い補足説明に限定する → 1〜2文、最大40文字程度
- ✅ キーボードフォーカスでも表示する → ホバーのみ非対応

### Don't
- ❌ Tooltip内にリンク・ボタンを入れない → インタラクティブ要素はPopoverを使う
- ❌ 必須情報・エラーメッセージをTooltipに入れない → 常時表示の要素を使う
- ❌ タッチデバイスのみで使用するUIにTooltipを主要UIとして使わない → ホバーなし

---

## Related

### Similar Components

| Component | Use When | Don't Use When |
|-----------|----------|---------------|
| Tooltip | 補足説明（読み取り専用） | インタラクティブなコンテンツ |
| Menu | クリック展開のアクションリスト | 情報表示のみ |
| Dialog | 重要な確認・入力が必要 | 軽い補足説明 |
