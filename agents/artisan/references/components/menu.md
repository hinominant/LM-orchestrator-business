# Menu

## Overview

| 項目 | 値 |
|------|-----|
| Name | Menu |
| Description | コンテキストメニュー |
| Layer | Molecule |
| Category | Overlay |
| Status | Stable |

---

## Anatomy

```
┌─────────────────────────────┐
│  [1]Menu Item               │
│  ─────────────────────────  │
│  [2]Menu Item               │
│  ─────────────────────────  │
│  [3]Menu Item (destructive) │
└─────────────────────────────┘
```

| # | Part | Required | Description |
|----|------|----------|-------------|
| 1 | Menu Item | Required | 通常のメニュー項目 |
| 2 | Divider | Optional | メニュー項目間の区切り線 |
| 3 | Destructive Item | Optional | 破壊的操作のメニュー項目（赤テキスト） |

---

## Props / API

```typescript
interface MenuProps {
  /** メニュー項目 */
  items: MenuItemProps[];
  /** 表示状態 */
  isOpen: boolean;
  /** 閉じるハンドラ */
  onClose: () => void;
}

interface MenuItemProps {
  /** ラベル */
  label: string;
  /** 破壊的操作フラグ */
  isDestructive?: boolean;
  /** 無効状態 */
  isDisabled?: boolean;
  /** クリックハンドラ */
  onClick: () => void;
}
```

---

## Variants

| Variant | Text Color | Description |
|---------|-----------|-------------|
| default | `text-default` Black/950 | 通常のメニュー項目 |
| destructive | `text-critical` Red/600 | 削除・ブロック等の破壊的操作 |

---

## States

| State | Visual Change | CSS | ARIA |
|-------|--------------|-----|------|
| default | — | — | — |
| hover | 背景色変更 | `background: var(--color-bg-interactive)` | — |
| disabled | テキスト薄く | `color: var(--color-text-disabled); pointer-events: none` | `aria-disabled="true"` |

---

## Design Tokens

> See: [`design-tokens.md`](../design-tokens.md) for full token definitions

| Token | DS v3 Reference | Resolved Value | Usage |
|-------|----------------|----------------|-------|
| `--menu-bg` | `var(--color-bg-default)` | Black/0 `#FFFFFF` | メニュー背景 |
| `--menu-text` | `var(--color-text-default)` | Black/950 `#27272A` | 通常テキスト |
| `--menu-text-destructive` | `var(--color-text-critical)` | Red/600 `#FF001F` | 破壊的操作テキスト |
| `--menu-hover-bg` | `var(--color-bg-interactive)` | Black/100 `#EFEEF0` | ホバー背景 |
| `--menu-divider` | `var(--color-border-default)` | Black/200 `#DADADD` | 区切り線 |
| `--menu-disabled-text` | `var(--color-text-disabled)` | Black/400 `#94939D` | 無効テキスト |
| `--menu-radius` | `var(--radius-lg)` | `16px` | 角丸 |
| `--menu-shadow` | — | `0px 4px 16px rgba(0, 0, 0, 0.12)` | ドロップシャドウ |

---

## Accessibility

### ARIA

| Attribute | Value | Condition |
|-----------|-------|-----------|
| `role` | `menu` | メニューコンテナ |
| `role` | `menuitem` | 各メニュー項目 |
| `aria-disabled` | `true` | 無効な項目 |

### Keyboard

| Key | Action |
|-----|--------|
| `ArrowDown` | 次の項目にフォーカス |
| `ArrowUp` | 前の項目にフォーカス |
| `Enter` / `Space` | 項目の選択 |
| `Escape` | メニューを閉じる |

---

## Related

### Similar Components

| Component | Use When | Don't Use When |
|-----------|----------|---------------|
| Menu | コンテキストに応じた操作一覧の表示 | 常時表示のナビゲーション |
| Select | フォーム内での選択肢選択 | アクション実行 |
| Dialog | 確認ダイアログが必要な操作 | 単純なアクション選択 |
