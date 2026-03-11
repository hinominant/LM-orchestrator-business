# Search & Filter Pattern

## Overview

| 項目 | 値 |
|------|-----|
| Pattern | Search & Filter |
| Category | Data Display / Interaction |
| Complexity | Medium |
| Reference | SmartHR「値がない項目の表示」+ 汎用パターン |

**解決する課題:** 大量のデータから目的の情報を効率的に見つけるための検索・絞り込み・結果表示の統合パターン。

**使用場面:**
- 商品・記事・ユーザーの検索
- 管理画面のデータフィルタリング
- カタログ・ディレクトリの閲覧

---

## Structure

```
┌─────────────────────────────────────────────────────────┐
│ [A] Search Bar                                            │
│  ┌───────────────────────────────────────────┐ [Search]  │
│  │ 🔍 キーワードを入力...                     │           │
│  └───────────────────────────────────────────┘           │
├─────────────────────────────────────────────────────────┤
│ [B] Filter Bar                                            │
│  [カテゴリ ▼] [ステータス ▼] [期間 ▼] [+ フィルタ追加]   │
├─────────────────────────────────────────────────────────┤
│ [C] Result Header                                         │
│  248件の結果  │  表示: [Grid] [List]  │  並び替え: 関連度▼│
├─────────────────────────────────────────────────────────┤
│ [D] Active Filters                                        │
│  [Tag: カテゴリ=技術 ×] [Tag: 期間=過去30日 ×] [全解除]  │
├─────────────────────────────────────────────────────────┤
│ [E] Results                                               │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                    │
│  │ Card 1  │ │ Card 2  │ │ Card 3  │  ← Grid表示       │
│  └─────────┘ └─────────┘ └─────────┘                    │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                    │
│  │ Card 4  │ │ Card 5  │ │ Card 6  │                    │
│  └─────────┘ └─────────┘ └─────────┘                    │
├─────────────────────────────────────────────────────────┤
│ [F] Load More / Pagination                                │
│           [さらに表示する] or < 1 2 3 >                   │
└─────────────────────────────────────────────────────────┘

[G] Empty State (結果0件時)
┌─────────────────────────────────────────────────────────┐
│                                                           │
│              🔍                                           │
│      検索結果がありません                                  │
│      別のキーワードで検索するか、                          │
│      フィルタ条件を変更してください                        │
│                                                           │
│      [フィルタをクリア]                                    │
└─────────────────────────────────────────────────────────┘
```

| Block | 構成 | Required |
|-------|------|----------|
| A | Search Bar: キーワード検索 | Required |
| B | Filter Bar: フィルタ条件 | Optional（3種類以上のフィルタがある場合は推奨） |
| C | Result Header: 件数・表示切替・ソート | Required |
| D | Active Filters: 適用中条件のTag | Required（フィルタ適用時） |
| E | Results: 検索結果（Card/List/Table） | Required |
| F | Load More / Pagination | Required（20件超） |
| G | Empty State: 結果なし時の表示 | Required |

---

## Interaction Flow

```
1. 初期表示
   └→ 検索バー空 + フィルタ未適用 → 全件（or 推奨順）表示

2. キーワード検索
   └→ 入力 → debounce 300ms → API呼び出し
   └→ 結果表示 + 件数更新
   └→ 入力中はローディングインジケータ

3. フィルタ適用
   └→ フィルタドロップダウン選択 → Active Filters に Tag追加
   └→ 検索再実行 → 結果更新
   └→ 複数フィルタは AND 条件

4. フィルタ解除
   └→ Tag の × クリック → そのフィルタ解除 → 検索再実行
   └→ 「全解除」→ 全フィルタクリア → 検索再実行

5. 表示切替
   └→ Grid / List 切替 → レイアウト変更（データ再取得なし）
   └→ ユーザー設定として localStorage に保存

6. ソート変更
   └→ ソートドロップダウン選択 → 検索再実行

7. 空状態
   └→ 結果0件 → Empty State 表示
   └→ 「フィルタをクリア」ボタン提示
```

---

## Component Composition

| Component | 参照 | 役割 |
|-----------|------|------|
| Input (search) | → `artisan/references/components/input.md` | 検索入力 |
| Select | → `artisan/references/components/select.md` | フィルタ条件 |
| Card | → `artisan/references/components/card.md` | 結果カード |
| Table | → `artisan/references/components/table.md` | 結果テーブル |
| Button | → `artisan/references/components/button.md` | アクション |
| Tag | — | Active Filter 表示 |
| SegmentedControl | — | Grid/List 切替 |

---

## Responsive Behavior

| Breakpoint | Layout変更 |
|------------|-----------|
| Desktop (≥1024px) | Filter Bar: 横並び。Grid: 3-4カラム。サイドフィルタ可 |
| Tablet (768-1023px) | Filter Bar: 折り返し。Grid: 2カラム |
| Mobile (<768px) | Filter Bar: 非表示→ボタンでSheet展開。Grid: 1カラム。検索バー全幅 |

**モバイルのフィルタSheet:**
```
[フィルタ] ボタンタップ → 下からSheet スライドアップ
┌──────────────────────────────┐
│ フィルタ           [× 閉じる]│
├──────────────────────────────┤
│ カテゴリ                      │
│ ○ すべて ○ 技術 ○ デザイン   │
│                               │
│ ステータス                    │
│ ☐ 公開 ☑ 下書き ☐ アーカイブ │
│                               │
│ [リセット]    [適用する(12件)]│
└──────────────────────────────┘
```

---

## Accessibility

- **Search**: `role="search"`, `aria-label="検索"` on `<form>`
- **結果件数**: `aria-live="polite"` で件数変化を通知（「248件の結果」）
- **Active Filter Tags**: 各Tagに `aria-label="フィルタ解除: {条件}"`, `role="status"`
- **Empty State**: `role="status"`, `aria-live="polite"`
- **表示切替**: `role="radiogroup"` + `aria-label="表示形式"`
- **ローディング**: 検索中に `aria-busy="true"` on 結果エリア

---

## Do / Don't

### Do
- ✅ 検索結果件数を常に表示 → ユーザーがフィルタの効果を把握
- ✅ 空状態で次のアクションを明示 → 「フィルタをクリア」「新規作成」等
- ✅ URLにクエリパラメータ反映 → ブックマーク・共有可能
- ✅ 検索にdebounce（300ms）を適用 → API過多リクエスト防止
- ✅ フィルタの初期値は「すべて」 → ユーザーが段階的に絞り込める

### Don't
- ❌ 検索・フィルタ変更のたびにスクロール位置をリセットしない → 結果エリアのみ更新
- ❌ フィルタドロップダウンの選択肢を0件のものは無効化する → ただし非表示にはしない
- ❌ 複雑なフィルタUIをモバイルに詰め込まない → Sheet/Drawer に分離
- ❌ 空状態を白い画面にしない → イラスト+メッセージ+アクション

---

## Code Skeleton

```tsx
function SearchFilter<T>() {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<FilterState>({})
  const [sort, setSort] = useState('relevance')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Data fetching
  const { data, total, isLoading } = useQuery({
    queryKey: ['search', query, filters, sort],
    queryFn: () => searchItems({ query, filters, sort }),
  })

  // URL sync
  useSyncWithURL({ query, filters, sort })

  // Debounced search
  const debouncedSetQuery = useDebouncedCallback(setQuery, 300)

  return (
    <div>
      {/* [A] Search Bar */}
      <form role="search" onSubmit={e => e.preventDefault()}>
        <SearchInput placeholder="キーワードを入力..." onChange={debouncedSetQuery} />
      </form>

      {/* [B] Filter Bar */}
      <FilterBar filters={filterOptions} values={filters} onChange={setFilters} />

      {/* [C] Result Header */}
      <ResultHeader total={total} viewMode={viewMode} onViewModeChange={setViewMode} sort={sort} onSortChange={setSort} />

      {/* [D] Active Filters */}
      <ActiveFilters filters={filters} onRemove={removeFilter} onClearAll={clearAllFilters} />

      {/* [E] Results / [G] Empty State */}
      {isLoading ? (
        <SkeletonGrid count={6} />
      ) : data.length > 0 ? (
        viewMode === 'grid' ? <CardGrid items={data} /> : <ListView items={data} />
      ) : (
        <EmptyState message="検索結果がありません" action={<Button onClick={clearAllFilters}>フィルタをクリア</Button>} />
      )}

      {/* [F] Pagination */}
      <LoadMore hasMore={data.length < total} onLoadMore={loadMore} />
    </div>
  )
}
```
