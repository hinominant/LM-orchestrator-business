# Breadcrumb

## Overview

| 項目 | 値 |
|------|-----|
| Name | Breadcrumb |
| Description | 現在地と階層構造を示すナビゲーション補助コンポーネント |
| Layer | Molecule |
| Category | Navigation |
| Status | Stable |

---

## Anatomy

```
ホーム  >  カテゴリ  >  サブカテゴリ  >  現在のページ
 [1]  [2]    [3]   [2]     [3]      [2]      [4]
```

| # | Part | Required | Description |
|----|------|----------|-------------|
| 1 | Root Item | Required | トップレベルリンク（通常「ホーム」） |
| 2 | Separator | Required | 区切り記号（`/` または `>`、14px、`text-secondary`） |
| 3 | Link Item | Optional | クリック可能な中間階層リンク |
| 4 | Current Item | Required | 現在のページ（リンクなし、`text-default`） |

---

## Props / API

```typescript
interface BreadcrumbProps {
  /** パンくずアイテムの配列 */
  items: BreadcrumbItem[];
  /** 区切り文字 */
  separator?: '/' | '>' | React.ReactNode;
  /** 最大表示件数（超過時に省略） */
  maxItems?: number;
  /** 省略時の展開ボタンラベル */
  expandLabel?: string;
}

interface BreadcrumbItem {
  /** 表示ラベル */
  label: string;
  /** リンク先（末尾アイテムは省略） */
  href?: string;
  /** クリックハンドラ（href代替） */
  onClick?: () => void;
}
```

**デフォルト値:** `separator='/'`, `maxItems=undefined`（省略なし）, `expandLabel='...'`

---

## Variants

### 省略パターン（maxItems指定時）

```
ホーム  >  ...  >  サブカテゴリ  >  現在のページ
```

- 中間アイテムを `...` ボタンで省略
- `...` クリックで全階層を展開

### Layout

| Property | Value |
|----------|-------|
| フォントサイズ | 14px |
| リンク色 | `text-secondary` Black/500 `#777681` |
| ホバー時リンク色 | `text-default` Black/950 `#27272A` |
| 現在ページ色 | `text-default` Black/950 `#27272A` |
| セパレーター色 | `text-secondary` Black/500 `#777681` |
| Gap | 4px（アイテム間） |
| 行の高さ | 20px |

---

## States

| State | Visual Change | CSS |
|-------|--------------|-----|
| default | 通常表示 | — |
| link-hover | テキスト色変化 | `color: var(--color-text-default)` |
| link-focus | フォーカスリング | `outline: 2px solid var(--color-border-emphasis)` |
| current | 非リンク表示 | `cursor: default`, `pointer-events: none` |

---

## Design Tokens

> See: [`design-tokens.md`](../design-tokens.md) for full token definitions

| Token | DS v3 Reference | Resolved Value | Usage |
|-------|----------------|----------------|-------|
| `--breadcrumb-font-size` | — | `14px` | フォントサイズ |
| `--breadcrumb-color-link` | `var(--color-text-secondary)` | `#777681` | リンク色 |
| `--breadcrumb-color-link-hover` | `var(--color-text-default)` | `#27272A` | ホバー時リンク色 |
| `--breadcrumb-color-current` | `var(--color-text-default)` | `#27272A` | 現在ページ色 |
| `--breadcrumb-color-separator` | `var(--color-text-secondary)` | `#777681` | セパレーター色 |
| `--breadcrumb-gap` | — | `4px` | アイテム間隔 |

---

## Accessibility

### ARIA

| Attribute | Value | 付与先 |
|-----------|-------|--------|
| `aria-label` | `"パンくずリスト"` | `<nav>` 要素 |
| `aria-current` | `"page"` | 現在のページアイテム |

### HTML Structure

```html
<nav aria-label="パンくずリスト">
  <ol>
    <li><a href="/">ホーム</a></li>
    <li aria-hidden="true">/</li>
    <li><a href="/category">カテゴリ</a></li>
    <li aria-hidden="true">/</li>
    <li aria-current="page">現在のページ</li>
  </ol>
</nav>
```

### Keyboard

| Key | Action |
|-----|--------|
| Tab | リンクアイテムを順にフォーカス |
| Enter / Space | リンクを実行 |

---

## Do / Don't

### Do
- ✅ `<nav>` + `<ol>` のセマンティック構造を使う → スクリーンリーダーが「リスト N件」と案内
- ✅ 現在ページには `aria-current="page"` を付ける
- ✅ 4階層以上になったら省略（maxItems）を検討

### Don't
- ❌ 1〜2階層のページにパンくずを使わない → ノイズになる
- ❌ セパレーターに `aria-hidden="true"` を忘れない → 読み上げノイズになる
- ❌ モバイルで全階層を常に表示しない → 省略 or 最後の親1件のみ表示を検討

---

## Related

### Composition Patterns
- → `artisan/references/components/global-navigation.md` — グローバルナビとの組み合わせ
- → `artisan/references/components/header.md` — ヘッダー内パンくず配置
