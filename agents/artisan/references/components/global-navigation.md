# Global Navigation

## Overview

| 項目 | 値 |
|------|-----|
| Name | Global Navigation |
| Description | アプリ下部のメインナビゲーションバー |
| Layer | Organism |
| Category | Navigation |
| Status | Stable |

---

## Anatomy

```
┌───────────────────────────────────────────────────────┐
│  [1]Tab   [2]Tab   [3]Tab   [4]Tab   [5]Tab          │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐           │
│  │Icon │ │Icon●│ │Icon●│ │Icon●│ │Icon │           │
│  │Label│ │Label│ │Label│ │Label│ │Label│           │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘           │
└───────────────────────────────────────────────────────┘
 ● = 通知バッジ（赤ドット）
```

| # | Part | Required | Description |
|----|------|----------|-------------|
| 1 | さがす (Search) | Required | 検索画面へのナビゲーション |
| 2 | イベント (Event) | Required | イベント画面。通知バッジ表示可能 |
| 3 | 相手から (From others) | Required | 相手からのアクション一覧。通知バッジ表示可能 |
| 4 | メッセージ (Message) | Required | メッセージ画面。通知バッジ表示可能 |
| 5 | マイページ (MyPage) | Required | マイページ画面 |

---

## Props / API

```typescript
interface GlobalNavigationProps {
  /** 現在アクティブなタブ */
  activeTab: 'search' | 'event' | 'from-others' | 'message' | 'mypage';
  /** 通知バッジの表示制御 */
  badges?: {
    event?: boolean;
    fromOthers?: boolean;
    message?: boolean;
  };
  /** タブ切り替えハンドラ */
  onTabChange?: (tab: string) => void;
}
```

---

## Variants

### タブ状態

| Variant | Icon | Label | Description |
|---------|------|-------|-------------|
| 通常（非選択） | アウトラインアイコン | 通常ウェイト、secondary text | デフォルト状態 |
| 選択時 | 塗りアイコン（filled） | 太字、emphasis text | アクティブタブ |

### 通知バッジ

- 赤ドット（直径 8px）をアイコン右上に表示
- イベント、相手から、メッセージタブに表示可能

---

## States

| State | Visual Change | CSS | ARIA |
|-------|--------------|-----|------|
| default | アウトラインアイコン + secondary テキスト | — | — |
| active | 塗りアイコン + 太字テキスト | `font-weight: 700; color: var(--color-text-default)` | `aria-current="page"` |
| badge | 赤ドットバッジ表示 | — | `aria-label` に通知数を含める |

---

## Design Tokens

> See: [`design-tokens.md`](../design-tokens.md) for full token definitions

| Token | DS v3 Reference | Resolved Value | Usage |
|-------|----------------|----------------|-------|
| `--gnav-bg` | `var(--color-bg-default)` | Black/0 `#FFFFFF` | ナビゲーション背景 |
| `--gnav-border-top` | `var(--color-border-default)` | Black/200 `#DADADD` | 上ボーダー |
| `--gnav-text-default` | `var(--color-text-secondary)` | Black/500 `#777681` | 非選択テキスト |
| `--gnav-text-active` | `var(--color-text-default)` | Black/950 `#27272A` | 選択テキスト |
| `--gnav-icon-default` | `var(--color-text-secondary)` | Black/500 `#777681` | 非選択アイコン |
| `--gnav-icon-active` | `var(--color-text-default)` | Black/950 `#27272A` | 選択アイコン |
| `--gnav-badge-bg` | `var(--color-bg-critical)` | Red/600 `#FF001F` | 通知バッジ背景 |

---

## Accessibility

### ARIA

| Attribute | Value | Condition |
|-----------|-------|-----------|
| `role` | `navigation` | コンテナ要素 |
| `aria-label` | `メインナビゲーション` | コンテナ要素 |
| `aria-current` | `page` | アクティブタブ |

### Keyboard

| Key | Action |
|-----|--------|
| `Tab` | タブ間のフォーカス移動 |
| `Enter` / `Space` | タブの選択 |

---

## Related

### Similar Components

| Component | Use When | Don't Use When |
|-----------|----------|---------------|
| Global Navigation | アプリ全体のメインナビゲーション | セクション内のサブナビゲーション |
| Tab | セクション内のコンテンツ切り替え | アプリ全体のナビゲーション |
| Header | 画面上部のナビゲーション | 下部固定ナビゲーション |
