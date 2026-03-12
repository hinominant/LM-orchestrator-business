# Header

## Overview

| 項目 | 値 |
|------|-----|
| Name | Header |
| Description | 画面上部のナビゲーションバー |
| Layer | Organism |
| Category | Navigation |
| Status | Stable |

---

## Anatomy

```
┌─────────────────────────────────────────────┐
│  [1]Left     [2]Title          [3]Right     │
└─────────────────────────────────────────────┘
```

| # | Part | Required | Description |
|----|------|----------|-------------|
| 1 | Left | Optional | 閉じる（×）ボタン、戻るボタン、またはアバター |
| 2 | Title | Required | 画面タイトルテキスト（中央配置） |
| 3 | Right | Optional | テキストボタン（「ボタン」等）またはアイコンボタン（×等） |

---

## Props / API

```typescript
interface HeaderProps {
  /** タイトルテキスト */
  title: string;
  /** 左側要素の種類 */
  leftAction?: 'close' | 'back' | 'avatar';
  /** アバター画像URL（leftAction="avatar" 時） */
  avatarSrc?: string;
  /** 右側要素の種類 */
  rightAction?: 'text' | 'icon' | 'none';
  /** 右テキストボタンのラベル */
  rightLabel?: string;
  /** 右アイコン */
  rightIcon?: ReactNode;
  /** 左アクションハンドラ */
  onLeftAction?: () => void;
  /** 右アクションハンドラ */
  onRightAction?: () => void;
}
```

---

## Variants

| Variant | Left | Center | Right | Use Case |
|---------|------|--------|-------|----------|
| standard | 閉じる（×）ボタン | タイトルテキスト | テキストボタン | モーダル画面、設定画面 |
| icon-actions | 戻る（←）ボタン | タイトルテキスト | アイコンボタン（複数可） | 詳細画面、編集画面 |
| avatar | アバター画像 | タイトルテキスト | アイコンボタン（×） | チャット画面、プロフィール画面 |

---

## Design Tokens

> See: [`design-tokens.md`](../design-tokens.md) for full token definitions

| Token | DS v3 Reference | Resolved Value | Usage |
|-------|----------------|----------------|-------|
| `--header-bg` | `var(--color-bg-default)` | Black/0 `#FFFFFF` | ヘッダー背景 |
| `--header-title-text` | `var(--color-text-default)` | Black/950 `#27272A` | タイトルテキスト |
| `--header-action-text` | `var(--color-text-default)` | Black/950 `#27272A` | アクションテキスト |
| `--header-icon-color` | `var(--color-text-default)` | Black/950 `#27272A` | アイコン色 |

---

## Accessibility

### ARIA

| Attribute | Value | Condition |
|-----------|-------|-----------|
| `role` | `banner` | ヘッダーコンテナ |
| `aria-label` | ボタンの操作内容 | 閉じる / 戻るボタン |

### Keyboard

| Key | Action |
|-----|--------|
| `Tab` | 要素間のフォーカス移動 |
| `Enter` / `Space` | ボタンアクション実行 |
| `Escape` | 閉じる（leftAction="close" 時） |

---

## Related

### Similar Components

| Component | Use When | Don't Use When |
|-----------|----------|---------------|
| Header | 画面上部のナビゲーション表示 | 下部固定ナビゲーション |
| Global Navigation | アプリ全体の下部ナビゲーション | 画面上部のナビゲーション |
| Dialog | モーダルダイアログのヘッダー | 通常画面のヘッダー |
