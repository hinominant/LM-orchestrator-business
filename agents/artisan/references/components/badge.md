# Badge

## Overview

| 項目 | 値 |
|------|-----|
| Name | Badge |
| Description | ステータス・カテゴリ・数値を小さなラベルで表示するインジケーター |
| Layer | Atom |
| Category | Feedback / Label |
| Status | Stable |

---

## Anatomy

```
┌────────────┐
│ ● Label    │
└────────────┘
  [1] [2]
```

| # | Part | Required | Description |
|----|------|----------|-------------|
| 1 | Dot | Optional | ステータスカラーのインジケーター点（status バリアントのみ） |
| 2 | Label | Required | テキストラベル（12px Medium） |

---

## Props / API

```typescript
interface BadgeProps {
  /** バッジのバリアント */
  variant?: 'default' | 'emphasis' | 'success' | 'warning' | 'critical' | 'neutral';
  /** 表示テキスト */
  label: string;
  /** サイズ */
  size?: 'sm' | 'md';
  /** ドット表示（status用） */
  hasDot?: boolean;
  /** 数値バッジ（通知カウント用） */
  count?: number;
  /** 最大カウント（超過時「N+」表示） */
  maxCount?: number;
}
```

**デフォルト値:** `variant='default'`, `size='md'`, `maxCount=99`

---

## Variants

### Variant

| Variant | Background | Text | Use Case |
|---------|-----------|------|----------|
| default | `bg-secondary` Brand/50 `#EDEFFF` | `text-emphasis` Brand/600 `#5538EE` | 汎用ラベル |
| emphasis | `bg-emphasis` Brand/600 `#5538EE` | `text-inverse` `#FFFFFF` | 強調・プライマリ |
| success | Green/50 `#EFFEF7` | Green/700 `#0F8655` | 承認済み・完了・正常 |
| warning | Yellow/50 `#FFFCE7` | Yellow/700 `#A65D02` | 注意・保留 |
| critical | Red/50 `#FFF0F2` | `text-critical` Red/700 `#D7001A` | エラー・拒否・危険 |
| neutral | `bg-tertiary` Black/50 `#F7F7F8` | `text-secondary` Black/500 `#777681` | 非アクティブ・アーカイブ |

### Size

| Size | Height | Font Size | Padding (H) | Padding (V) |
|------|--------|-----------|-------------|-------------|
| sm | 20px | 10px | 6px | 2px |
| md | 24px | 12px | 8px | 4px |

### Layout

| Property | Value |
|----------|-------|
| Border Radius | 4px（`var(--radius-sm)`） |
| Font Weight | 500（Medium） |
| Display | inline-flex |
| Align Items | center |
| Gap（dot + label） | 4px |

---

## States

| State | Visual Change |
|-------|--------------|
| default | 通常表示 |
| — | バッジ自体にhover/focus/disabled状態なし（親要素の状態に従う） |

---

## Design Tokens

> See: [`design-tokens.md`](../design-tokens.md) for full token definitions

| Token | DS v3 Reference | Resolved Value | Usage |
|-------|----------------|----------------|-------|
| `--badge-radius` | `var(--radius-sm)` | `4px` | 角丸 |
| `--badge-font-size-md` | — | `12px` | mdフォントサイズ |
| `--badge-font-size-sm` | — | `10px` | smフォントサイズ |
| `--badge-font-weight` | — | `500` | フォントウェイト |
| `--badge-height-md` | — | `24px` | md高さ |
| `--badge-height-sm` | — | `20px` | sm高さ |
| `--badge-dot-size` | — | `6px` | ドットサイズ |

---

## Accessibility

### ARIA

| Attribute | Value | Condition |
|-----------|-------|-----------|
| `aria-label` | テキスト説明 | countバッジで「{N}件の通知」等 |

### Screen Reader
- ラベルテキストはそのまま読み上げ
- countバッジは `aria-label="12件の通知"` のように数値の文脈を付ける
- 装飾目的のバッジは `aria-hidden="true"`

---

## Do / Don't

### Do
- ✅ 短いテキスト（2〜6文字）で使う → 「承認済み」「新着」「保留中」
- ✅ ステータスの意味に対応したvariantを使う → 成功=success, エラー=critical
- ✅ テーブル行・リストアイテムとの組み合わせで状態表示

### Don't
- ❌ 長い文章をBadgeに入れない → Tagコンポーネントまたはテキストを使う
- ❌ クリッカブルにしない → インタラクティブ要素にはButtonを使う
- ❌ 意味のないカラーを装飾目的で使わない → variantの意味に従う

---

## Related

### Similar Components

| Component | Use When | Don't Use When |
|-----------|----------|---------------|
| Badge | ステータス・分類・カウント表示 | クリック可能なフィルタ操作 |
| Toggle | ON/OFFの切り替え操作 | 表示のみのステータス |
| Toast | 操作後の一時的フィードバック | 固定表示のステータス |

### Composition Patterns
- → `vision/references/patterns/empty-state.md` — 件数ゼロ状態でのBadge表示
- → `artisan/references/components/table.md` — テーブル行のステータス列
