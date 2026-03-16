# Empty State Pattern

## Overview

| 項目 | 値 |
|------|-----|
| Pattern | Empty State |
| Category | Feedback / Onboarding |
| Complexity | Low |
| Reference | SmartHR「空の状態」相当 |

**解決する課題:** データが0件の画面でユーザーに「なぜ空なのか」「何をすべきか」を明確に伝え、離脱・困惑を防ぐ。

**使用場面:**
- リスト・テーブルの検索結果が0件
- 初回ログイン時のコンテンツなし状態
- フィルタ絞り込みで0件になった状態
- エラーや権限なしでデータが取得できない状態

---

## Structure

### Type 1: First Use（初回利用）

```
┌─────────────────────────────────┐
│                                 │
│         [Illustration]          │
│                                 │
│       まだ〇〇がありません         │
│                                 │
│  〇〇を作成して始めましょう。       │
│                                 │
│        [+ 〇〇を作成する]          │
│                                 │
└─────────────────────────────────┘
```

### Type 2: No Results（検索・フィルタ結果0件）

```
┌─────────────────────────────────┐
│                                 │
│     🔍（検索アイコン）            │
│                                 │
│    「{検索キーワード}」の結果は     │
│         見つかりませんでした        │
│                                 │
│  検索条件を変更するか、          │
│  フィルタをリセットしてください。   │
│                                 │
│       [フィルタをリセット]          │
│                                 │
└─────────────────────────────────┘
```

### Type 3: Error / Permission（エラー・権限なし）

```
┌─────────────────────────────────┐
│                                 │
│     ⚠️（エラーアイコン）           │
│                                 │
│     データを読み込めませんでした     │
│                                 │
│    しばらくしてから再度お試し        │
│      いただくか、管理者に          │
│        お問い合わせください。       │
│                                 │
│    [再試行]   [サポートに連絡]      │
│                                 │
└─────────────────────────────────┘
```

---

## Interaction Flow

### Type判定基準

```
データ0件の原因評価
  ├→ 初めて使う / データ未作成       → Type 1（First Use）
  ├→ 検索・フィルタの結果            → Type 2（No Results）
  ├→ エラー / 権限なし / 通信失敗    → Type 3（Error）
  └→ 意図的な空（例: 完了タスクなし） → Type 1 変形（「〇〇は全て完了しました」）
```

### CTA（Call to Action）ルール

| Type | Primary CTA | Secondary CTA |
|------|-------------|---------------|
| First Use | 「+ {リソース名}を作成する」 | なし（または「ヘルプを見る」） |
| No Results | 「フィルタをリセット」 | 「{リソース名}を作成する」 |
| Error | 「再試行」 | 「サポートに連絡」 |

---

## Component Composition

| Component | 参照 | 役割 |
|-----------|------|------|
| Button (primary) | → `artisan/references/components/button.md` | Primary CTA |
| Button (secondary) | → `artisan/references/components/button.md` | Secondary CTA |
| Badge | → `artisan/references/components/badge.md` | 件数表示（「0件」） |

---

## Layout

### サイズ規定

| コンテキスト | 縦幅 | 横幅 |
|------------|------|------|
| テーブル内 | min 200px | テーブル幅に追従 |
| ページ全体 | min 320px | コンテナ幅に追従 |
| モーダル内 | min 160px | モーダル幅に追従 |

**配置:** 水平・垂直中央揃え（`display: flex; flex-direction: column; align-items: center; justify-content: center`）

---

## Accessibility

- イラストは `aria-hidden="true"` または適切な `alt` テキスト
- CTAボタンは具体的なラベル（「作成する」ではなく「〇〇を作成する」）
- エラー状態は `role="alert"` で即時読み上げ

---

## Do / Don't

### Do
- ✅ 原因と解決策を両方示す → 「なぜ空か」+「何をすべきか」
- ✅ CTAは1〜2個まで → 迷わせない
- ✅ キーワード検索の場合は入力したキーワードを引用する → 「"luna"の結果は...」

### Don't
- ❌ 「データがありません」だけで終わらない → ユーザーが次のアクションを取れない
- ❌ Loading状態とEmpty状態を混同しない → Skeleton → Empty の遷移を正しく実装
- ❌ Type 1でフィルタリセットボタンを出さない → 初回は「作成」をPromoteする

---

## Related

### Composition Patterns
- → `artisan/references/components/table.md` — テーブルのempty行
- → `vision/references/patterns/error-recovery.md` — エラー状態からの復帰
