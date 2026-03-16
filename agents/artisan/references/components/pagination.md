# Pagination

## Overview

| 項目 | 値 |
|------|-----|
| Name | Pagination |
| Description | 大量データを複数ページに分割して表示・ナビゲートするコンポーネント |
| Layer | Molecule |
| Category | Navigation |
| Status | Stable |

---

## Anatomy

```
[<] [1] [2] [3] [...] [8] [9] [10] [>]
 1   2       3    4            5    6
```

| # | Part | Required | Description |
|----|------|----------|-------------|
| 1 | Prev Button | Required | 前ページへ（無効化: 1ページ目） |
| 2 | Page Button | Required | ページ番号ボタン |
| 3 | Current Page | Required | 現在のページ（強調表示） |
| 4 | Ellipsis | Optional | 省略表示（ページ数が多い場合） |
| 5 | Last Page Group | Optional | 最後のページグループ |
| 6 | Next Button | Required | 次ページへ（無効化: 最終ページ） |

---

## Props / API

```typescript
interface PaginationProps {
  /** 総ページ数 */
  totalPages: number;
  /** 現在のページ（1始まり） */
  currentPage: number;
  /** ページ変更コールバック */
  onPageChange: (page: number) => void;
  /** 省略なしで表示するページ数の境界 */
  siblingCount?: number;
  /** 両端に常に表示するページ数 */
  boundaryCount?: number;
  /** サイズ */
  size?: 'sm' | 'md';
  /** 前/次ボタンのラベル（アクセシビリティ用） */
  prevLabel?: string;
  nextLabel?: string;
}
```

**デフォルト値:** `siblingCount=1`, `boundaryCount=1`, `size='md'`, `prevLabel='前のページ'`, `nextLabel='次のページ'`

---

## Variants

### 表示パターン（総ページ数別）

**7ページ以下:** 全ページを表示
```
[<] [1] [2] [3] [4] [5] [6] [7] [>]
```

**8ページ以上（中間）:**
```
[<] [1] [2] [...] [5] [6] [7] [...] [14] [15] [>]
```

**8ページ以上（先頭付近）:**
```
[<] [1] [2] [3] [4] [5] [...] [15] [>]
```

**8ページ以上（末尾付近）:**
```
[<] [1] [...] [11] [12] [13] [14] [15] [>]
```

### Size

| Size | Button Size | Font Size | Gap |
|------|------------|-----------|-----|
| sm | 28px × 28px | 12px | 2px |
| md | 36px × 36px | 14px | 4px |

### ページボタンスタイル

| State | Background | Text | Border |
|-------|-----------|------|--------|
| default | transparent | `text-default` | `border-default` |
| hover | `bg-tertiary` | `text-default` | `border-default` |
| current | `bg-emphasis` Brand/600 | `text-inverse` | none |
| disabled（prev/next） | transparent | `text-disabled` | `border-default` |

---

## States

| State | Visual Change | CSS |
|-------|--------------|-----|
| page-hover | 背景色変化 | `background: var(--color-bg-tertiary)` |
| page-focus | フォーカスリング | `outline: 2px solid var(--color-border-emphasis)` |
| page-current | 強調表示 | `background: var(--color-bg-emphasis); color: #FFF` |
| prev/next-disabled | 淡色 | `opacity: 0.4; cursor: not-allowed` |

---

## Design Tokens

> See: [`design-tokens.md`](../design-tokens.md) for full token definitions

| Token | DS v3 Reference | Resolved Value | Usage |
|-------|----------------|----------------|-------|
| `--pagination-btn-size-md` | — | `36px` | mdボタンサイズ |
| `--pagination-btn-size-sm` | — | `28px` | smボタンサイズ |
| `--pagination-radius` | `var(--radius-sm)` | `4px` | 角丸 |
| `--pagination-current-bg` | `var(--color-bg-emphasis)` | `#5538EE` | 現在ページ背景 |
| `--pagination-current-text` | `var(--color-text-inverse)` | `#FFFFFF` | 現在ページテキスト |
| `--pagination-gap-md` | — | `4px` | ボタン間隔 |

---

## Accessibility

### ARIA

| Attribute | Value | 付与先 |
|-----------|-------|--------|
| `aria-label` | `"ページネーション"` | `<nav>` 要素 |
| `aria-current` | `"page"` | 現在のページボタン |
| `aria-label` | `"前のページ"` | Prevボタン |
| `aria-label` | `"次のページ"` | Nextボタン |
| `aria-label` | `"ページ {N}"` | 各ページボタン |
| `aria-disabled` | `"true"` | 無効化されたPrev/Nextボタン |
| `aria-hidden` | `"true"` | Ellipsis（`...`）要素 |

### Keyboard

| Key | Action |
|-----|--------|
| Tab | ページボタンを順にフォーカス |
| Enter / Space | ページへ移動 |

---

## Do / Don't

### Do
- ✅ 総件数・表示範囲も合わせて表示する → 「1〜20件 / 全234件」
- ✅ URL に `?page=N` を反映する → ブックマーク・共有可能に
- ✅ ページ変更時はリスト先頭にスクロールする

### Don't
- ❌ 20件以下のデータにPaginationを使わない → 全件表示かInfinite Scrollを検討
- ❌ ページ数が多い場合に全ページボタンを表示しない → 省略（Ellipsis）を使う
- ❌ 現在ページの `<button>` を `disabled` にしない → `aria-current="page"` でマーク

---

## Related

### Composition Patterns
- → `artisan/references/components/table.md` — テーブルとのセット使用
- → `vision/references/patterns/search-filter.md` — 検索結果のページネーション
