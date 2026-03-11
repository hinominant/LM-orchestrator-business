# Data Table Pattern

## Overview

| 項目 | 値 |
|------|-----|
| Pattern | Data Table |
| Category | Data Display |
| Complexity | High |
| Reference | SmartHR「よくあるテーブル」「テーブル内一括操作」相当 |

**解決する課題:** 大量の構造化データを効率的に閲覧・検索・操作するための統合パターン。

**使用場面:**
- 管理画面のデータ一覧（ユーザー、注文、商品等）
- レポート・分析データの表示
- 設定項目の一覧管理

---

## Structure

```
┌─────────────────────────────────────────────────────────┐
│ [A] Toolbar                                              │
│  ┌─────────────┐  ┌──────────┐  ┌──────┐  ┌──────────┐ │
│  │ Search Input │  │ Filter ▼ │  │ Sort │  │ Actions ▼│ │
│  └─────────────┘  └──────────┘  └──────┘  └──────────┘ │
├─────────────────────────────────────────────────────────┤
│ [B] Active Filters                                       │
│  [Tag: ステータス=有効 ×] [Tag: カテゴリ=A ×] [全解除]   │
├─────────────────────────────────────────────────────────┤
│ [C] Bulk Action Bar (選択時のみ表示)                      │
│  3件選択中 │ [削除] [エクスポート] [ステータス変更]       │
├─────────────────────────────────────────────────────────┤
│ [D] Table                                                │
│  ☐  Name ↑        Status     Category   Created  Actions│
│  ─────────────────────────────────────────────────────── │
│  ☐  Tanaka        有効       A          2024/01  ⋯      │
│  ☐  Suzuki        無効       B          2024/02  ⋯      │
│  ☑  Yamada        有効       A          2024/03  ⋯      │
├─────────────────────────────────────────────────────────┤
│ [E] Pagination                                           │
│  10件/ページ ▼  │  1-10 / 248件  │  < 1 2 3 ... 25 >   │
└─────────────────────────────────────────────────────────┘
```

| Block | 構成 | Required |
|-------|------|----------|
| A | Toolbar: Search + Filter + Sort + Actions | Partial（Search + Filter は必須） |
| B | Active Filters: 適用中フィルタのTag表示 | Required（フィルタ有時） |
| C | Bulk Action Bar: 選択行への一括操作 | Optional |
| D | Table: データ本体 | Required |
| E | Pagination: ページナビゲーション | Required（20行超） |

---

## Interaction Flow

```
1. 初期表示
   └→ デフォルトソート（作成日降順等）でデータ表示

2. 検索
   └→ Search Input に入力 → debounce 300ms → テーブル更新
   └→ ページは1に戻る

3. フィルタ適用
   └→ Filter ドロップダウンで条件選択 → Active Filters に Tag 追加
   └→ テーブル更新 + ページは1に戻る
   └→ Tag の × でフィルタ解除

4. ソート
   └→ カラムヘッダークリック → asc → desc → none のサイクル
   └→ URL パラメータに反映（ブックマーク可能）

5. 行選択 + 一括操作
   └→ チェックボックスで行選択 → Bulk Action Bar 表示
   └→ ヘッダーチェックボックスで全選択/全解除
   └→ 一括操作実行 → 確認ダイアログ → 完了Toast

6. 行アクション
   └→ 行末の ⋯ メニュー → 編集/削除/詳細
   └→ 削除は delete-confirmation パターンに従う

7. ページネーション
   └→ ページ番号クリック or 前後矢印 → テーブル更新
   └→ 件数/ページ変更 → ページ1に戻る
```

---

## Component Composition

| Component | 参照 | 役割 |
|-----------|------|------|
| Input (search) | → `artisan/references/components/input.md` | 検索入力 |
| Select (filter) | → `artisan/references/components/select.md` | フィルタ条件選択 |
| Table | → `artisan/references/components/table.md` | データ表示 |
| Button | → `artisan/references/components/button.md` | アクション |
| Checkbox | → `artisan/references/components/checkbox-radio.md` | 行選択 |
| Dialog | → `artisan/references/components/dialog.md` | 削除確認 |
| Tag | — | Active Filter表示 |
| Pagination | — | ページナビゲーション |
| Toast | — | 操作完了通知 |
| DropdownMenu | — | 行アクション |

---

## Responsive Behavior

| Breakpoint | Layout変更 |
|------------|-----------|
| Desktop (≥1024px) | 全カラム表示。Toolbar横並び |
| Tablet (768-1023px) | 非必須カラム非表示。Toolbar折り返し。横スクロール可 |
| Mobile (<768px) | テーブル→カードリストに切替 or 横スクロール。フィルタはSheet/Drawer |

**モバイルでのカードリスト切替:**
```
┌─────────────────────────┐
│ ☐ Tanaka                │
│ ステータス: 有効         │
│ カテゴリ: A              │
│ 作成日: 2024/01/15      │
│ [編集] [削除]            │
└─────────────────────────┘
```

---

## Accessibility

- **テーブル**: ネイティブ `<table>` 要素を使用（`role="table"` は不要）
- **ソート通知**: カラムソート変更時に `aria-live="polite"` で状態を通知
- **一括操作バー**: `role="toolbar"`, `aria-label="選択した項目の操作"`
- **フィルタTag**: 各Tagに `aria-label="フィルタ解除: {条件}"` を付与
- **ページネーション**: `nav` 要素 + `aria-label="ページナビゲーション"`
- **ローディング**: テーブルに `aria-busy="true"` を設定
- **空状態**: 検索結果が0件の場合、`aria-live="polite"` で「結果が見つかりません」を通知

---

## Do / Don't

### Do
- ✅ URLパラメータにソート・フィルタ・ページを反映 → ブックマーク・共有可能
- ✅ デフォルトソートを設定 → 初回表示時にデータの意味がある順序
- ✅ 一括操作は確認ダイアログを挟む → 誤操作防止
- ✅ 空状態で「フィルタを変更」「新規作成」等のアクションを提示 → 行き詰まり防止
- ✅ ローディング中はSkeleton行で高さを維持 → CLS防止

### Don't
- ❌ フィルタ適用時にページ位置を維持しない → 必ずページ1に戻す
- ❌ 一括削除を確認なしで実行しない → `delete-confirmation.md` パターンに従う
- ❌ 全データを一度にフロントに読み込まない → サーバーサイドページネーション
- ❌ 検索のdebounceを省略しない → API過多リクエスト防止

---

## Code Skeleton

```tsx
function DataTable<T>() {
  // State
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<FilterState>({})
  const [sort, setSort] = useState<SortState>({ column: 'createdAt', direction: 'desc' })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedRows, setSelectedRows] = useState<T[]>([])

  // Data fetching (server-side)
  const { data, total, isLoading } = useQuery({
    queryKey: ['items', search, filters, sort, page, pageSize],
    queryFn: () => fetchItems({ search, filters, sort, page, pageSize }),
  })

  // URL sync
  useSyncWithURL({ search, filters, sort, page, pageSize })

  return (
    <div>
      {/* [A] Toolbar */}
      <Toolbar>
        <SearchInput value={search} onChange={setSearch} debounce={300} />
        <FilterDropdown filters={filters} onChange={handleFilterChange} />
        <ActionsMenu />
      </Toolbar>

      {/* [B] Active Filters */}
      {hasActiveFilters && (
        <ActiveFilters filters={filters} onRemove={handleFilterRemove} onClearAll={handleClearAll} />
      )}

      {/* [C] Bulk Action Bar */}
      {selectedRows.length > 0 && (
        <BulkActionBar count={selectedRows.length} onDelete={handleBulkDelete} onExport={handleExport} />
      )}

      {/* [D] Table */}
      <Table
        columns={columns}
        data={data}
        isLoading={isLoading}
        isSortable
        isSelectable
        sortState={sort}
        selectedRows={selectedRows}
        onSortChange={setSort}
        onSelectionChange={setSelectedRows}
        emptyMessage="条件に一致するデータがありません"
      />

      {/* [E] Pagination */}
      <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} onPageSizeChange={setPageSize} />
    </div>
  )
}
```
