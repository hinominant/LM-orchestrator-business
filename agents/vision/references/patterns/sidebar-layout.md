# Sidebar Layout Pattern

## Overview

| 項目 | 値 |
|------|-----|
| Pattern | Sidebar Layout |
| Category | Layout |
| Complexity | Medium |
| Reference | SaaS/ダッシュボード最頻出レイアウト |

**解決する課題:** ナビゲーションとメインコンテンツを効率的に配置し、多機能なアプリケーションの情報構造を整理する。

**使用場面:**
- SaaS管理画面・ダッシュボード
- 設定画面（カテゴリナビ + 設定項目）
- ドキュメントサイト（目次 + 本文）
- メール・メッセージアプリ（リスト + 詳細）

---

## Structure

```
┌──────────────────────────────────────────────────────────┐
│ [A] Top Bar                                               │
│  [≡] Logo          Search          [🔔] [👤] Profile     │
├──────────┬───────────────────────────────────────────────┤
│ [B]      │ [C] Main Content                               │
│ Sidebar  │                                                │
│          │ [D] Page Header                                │
│ [Logo]   │  Title                [Action Buttons]         │
│          │                                                │
│ 📊 Dashboard│ [E] Content Area                            │
│ 👥 Users   │                                              │
│ 📋 Orders  │  ┌─────────────────────────────────────┐    │
│ ⚙️ Settings│  │                                     │    │
│          │  │         Main Content                  │    │
│ ─────── │  │                                     │    │
│ Group    │  │                                     │    │
│ 📈 Reports│  └─────────────────────────────────────┘    │
│ 📁 Files  │                                              │
│          │                                                │
│ ─────── │                                                │
│ [F]      │                                                │
│ Footer   │                                                │
│ [?] Help │                                                │
│ v2.1.0   │                                                │
└──────────┴───────────────────────────────────────────────┘
```

| Block | 構成 | Required |
|-------|------|----------|
| A | Top Bar: ロゴ・検索・通知・プロフィール | Optional（サイドバーにロゴがある場合） |
| B | Sidebar: ナビゲーション | Required |
| C | Main Content: メインコンテンツ領域 | Required |
| D | Page Header: ページタイトル・アクション | Required |
| E | Content Area: ページ固有のコンテンツ | Required |
| F | Sidebar Footer: ヘルプ・バージョン情報 | Optional |

---

## Interaction Flow

```
1. ナビゲーション
   └→ サイドバー項目クリック → Main Content 切替
   └→ アクティブ項目はハイライト表示
   └→ URLと連動（ブックマーク可能）

2. サイドバー折りたたみ
   └→ トグルボタン（≡）クリック → サイドバー幅変更
   └→ 展開（240px）: アイコン + ラベル
   └→ 折りたたみ（64px）: アイコンのみ + tooltip
   └→ 状態は localStorage に保存

3. モバイル表示
   └→ サイドバーは非表示（オフスクリーン）
   └→ ハンバーガーメニュー（≡）で Drawer として表示
   └→ Backdrop クリック or ナビ項目クリックで閉じる

4. ネストナビゲーション
   └→ グループヘッダークリック → サブ項目の展開/折りたたみ
   └→ 展開状態は保持

5. 通知バッジ
   └→ ナビ項目に未読数バッジ表示
   └→ リアルタイム更新
```

---

## Component Composition

| Component | 参照 | 役割 |
|-----------|------|------|
| Button (ghost) | → `artisan/references/components/button.md` | ナビ項目・トグル |
| Input (search) | → `artisan/references/components/input.md` | Top Bar検索 |
| Card | → `artisan/references/components/card.md` | Content Area内 |
| Dialog | → `artisan/references/components/dialog.md` | 操作確認 |
| Badge | — | 通知カウント |
| Tooltip | — | 折りたたみ時のラベル |
| Drawer | — | モバイルサイドバー |

---

## Responsive Behavior

| Breakpoint | Sidebar | Main Content |
|------------|---------|-------------|
| Desktop (≥1280px) | 展開固定（240px） | `calc(100vw - 240px)` |
| Laptop (1024-1279px) | 折りたたみ可能（64px/240px） | 残り幅 |
| Tablet (768-1023px) | 折りたたみデフォルト（64px） | 残り幅 |
| Mobile (<768px) | 非表示 → Drawer | 全幅 |

### サイドバーの幅仕様

| State | Width | Content |
|-------|-------|---------|
| 展開 | 240px | アイコン + ラベル + バッジ |
| 折りたたみ | 64px | アイコンのみ（hover でtooltip） |
| モバイルDrawer | 280px | 展開と同じ + Backdrop |

### サイドバー折りたたみアニメーション
- `width`: `240px ↔ 64px`, `duration: 200ms`, `ease-in-out`
- テキストラベル: 折りたたみ時に `opacity: 0` → `display: none`
- Main Content: `margin-left` が追随

---

## Accessibility

- **Sidebar**: `<nav>` 要素 + `aria-label="メインナビゲーション"`
- **アクティブ項目**: `aria-current="page"`
- **折りたたみトグル**: `aria-expanded="true/false"` + `aria-label="サイドバーを{展開/折りたたみ}"`
- **ネストグループ**: `aria-expanded` on グループヘッダー
- **モバイルDrawer**: `role="dialog"` + フォーカストラップ + Escape で閉じる
- **ランドマーク**: `<nav>`, `<main>`, `<header>` で構造化
- **スキップリンク**: 「メインコンテンツへスキップ」リンクをページ先頭に配置

### Keyboard

| Key | Action |
|-----|--------|
| `Tab` | ナビ項目間を移動 |
| `Enter` / `Space` | ナビ項目選択 / グループ展開・折りたたみ |
| `Escape` | モバイルDrawerを閉じる |

---

## Do / Don't

### Do
- ✅ ナビ項目は7±2個に抑える → 認知負荷軽減。多い場合はグループ化
- ✅ アクティブ項目を視覚的に明示 → 現在地の認識
- ✅ 折りたたみ時はtooltipでラベル表示 → アイコンのみでは理解困難
- ✅ サイドバーの折りたたみ状態を永続化 → ユーザー設定の尊重
- ✅ `<nav>` ランドマークを使用 → スクリーンリーダーのナビゲーション

### Don't
- ❌ サイドバーに3階層以上のネストを作らない → 1-2階層まで
- ❌ サイドバー内にフォーム要素を配置しない → ナビゲーション専用
- ❌ モバイルでサイドバーを常時表示しない → 画面幅を圧迫
- ❌ ナビ遷移時にページ全体をリロードしない → SPA遷移

---

## Code Skeleton

```tsx
function SidebarLayout({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useLocalStorage('sidebar-collapsed', false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const isMobile = useMediaQuery('(max-width: 767px)')

  const navItems: NavItem[] = [
    { icon: BarChart, label: 'ダッシュボード', href: '/dashboard' },
    { icon: Users, label: 'ユーザー', href: '/users', badge: 3 },
    { icon: ShoppingCart, label: '注文', href: '/orders' },
    {
      icon: Settings, label: '設定', href: '/settings',
      children: [
        { label: '一般', href: '/settings/general' },
        { label: '通知', href: '/settings/notifications' },
      ],
    },
  ]

  return (
    <div className="flex h-screen">
      {/* Skip Link */}
      <a href="#main-content" className="sr-only focus:not-sr-only">
        メインコンテンツへスキップ
      </a>

      {/* [B] Sidebar */}
      {isMobile ? (
        <Drawer isOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)}>
          <SidebarNav items={navItems} onItemClick={() => setIsMobileOpen(false)} />
        </Drawer>
      ) : (
        <aside
          className={cn('border-r transition-[width] duration-200', isCollapsed ? 'w-16' : 'w-60')}
        >
          <SidebarNav items={navItems} isCollapsed={isCollapsed} />
          <SidebarFooter isCollapsed={isCollapsed} />
        </aside>
      )}

      {/* [C] Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* [A] Top Bar */}
        <header className="h-14 border-b flex items-center px-4">
          <Button variant="ghost" isIconOnly aria-label="メニュー" onClick={() => isMobile ? setIsMobileOpen(true) : setIsCollapsed(!isCollapsed)}>
            <MenuIcon />
          </Button>
          <SearchInput className="mx-4 flex-1 max-w-md" />
          <NotificationBell />
          <UserMenu />
        </header>

        {/* [E] Content Area */}
        <main id="main-content" className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

function SidebarNav({ items, isCollapsed, onItemClick }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <nav aria-label="メインナビゲーション">
      <ul role="list">
        {items.map(item => (
          <NavItem
            key={item.href}
            item={item}
            isActive={pathname.startsWith(item.href)}
            isCollapsed={isCollapsed}
            onClick={onItemClick}
          />
        ))}
      </ul>
    </nav>
  )
}
```
