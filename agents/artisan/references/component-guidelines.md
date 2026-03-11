# Component Design Guidelines

> コンポーネント設計の原則と実装規約。Artisan がコンポーネントを実装する際の必須ガイドライン。

## 設計原則

### 1. 合成可能性（Composition over Inheritance）

コンポーネントは小さく、組み合わせて使う設計にする。

```tsx
// ✅ 合成パターン
<Card>
  <Card.Header>
    <Card.Title>タイトル</Card.Title>
  </Card.Header>
  <Card.Body>コンテンツ</Card.Body>
  <Card.Footer>
    <Button variant="primary">保存する</Button>
  </Card.Footer>
</Card>

// ❌ モノリシックパターン
<Card
  title="タイトル"
  body="コンテンツ"
  footerAction="保存する"
  onFooterClick={handleSave}
/>
```

### 2. 単一責任

1つのコンポーネントは1つの責務のみ持つ。

- **Button**: クリックアクションの実行
- **Input**: テキスト入力の受付
- **Badge**: ステータスの表示

データ取得・ビジネスロジック・UIの3層を混在させない。

### 3. アクセシビリティファースト

a11yは後付けではなく、設計段階から組み込む。

- セマンティックHTML要素を優先（`<button>`, `<input>`, `<dialog>`）
- カスタム要素には適切なARIA属性を付与
- キーボード操作を必ず定義
- フォーカス管理を設計に含める

### 4. トークンドリブン

ハードコード値を使わず、デザイントークンを参照する。

```tsx
// ✅ トークン参照
className="bg-primary text-primary-foreground rounded-md px-4 py-2"

// ❌ ハードコード
style={{ backgroundColor: '#3B82F6', color: '#FFF', borderRadius: '6px' }}
```

→ `muse/references/token-system.md` 参照

---

## 命名規則

### コンポーネント名

- **PascalCase**: `Button`, `DataTable`, `SearchFilter`
- **意味のある名前**: 見た目ではなく役割で命名（`AlertDialog` not `RedBox`）
- **プレフィックス不要**: フレームワーク固有のプレフィックスは付けない

### Props命名パターン

| パターン | 例 | 用途 |
|---------|-----|------|
| `variant` | `primary`, `secondary` | 視覚スタイル |
| `size` | `sm`, `md`, `lg` | サイズ |
| `is{State}` | `isDisabled`, `isOpen` | Boolean状態 |
| `has{Feature}` | `hasIcon`, `hasBadge` | オプション機能の有無 |
| `on{Event}` | `onClick`, `onChange` | イベントハンドラ |
| `render{Part}` | `renderIcon`, `renderFooter` | カスタムレンダリング |
| `{part}Props` | `iconProps`, `labelProps` | サブ要素への透過Props |

### CSS クラス命名

- **ユーティリティファースト**: Tailwind CSS のユーティリティクラスを優先
- **カスタムクラス**: `{component}-{element}--{modifier}` (BEM-like)
- **CSS変数**: `--{component}-{property}` でコンポーネントスコープ

---

## ファイル構成パターン

```
components/
└── Button/
    ├── index.ts          # 公開API（re-export）
    ├── Button.tsx         # コンポーネント本体
    ├── Button.types.ts    # 型定義
    ├── Button.styles.ts   # スタイル定義（CSS-in-JS の場合）
    ├── Button.test.tsx    # ユニットテスト
    └── Button.stories.tsx # Storybook Story
```

**ルール:**
- `index.ts` は re-export のみ。ロジックを含めない
- 型定義は `.types.ts` に分離（コンポーネントファイルの肥大化防止）
- テストとStoryは必須。コンポーネントなしにテスト/Storyなし、テスト/Storyなしにコンポーネントなし

---

## 実装パターン

### Server Components vs Client Components

| 判断基準 | Server Component | Client Component |
|---------|-----------------|-----------------|
| インタラクション | なし | あり（onClick等） |
| 状態管理 | 不要 | useState/useReducer |
| ブラウザAPI | 不使用 | 使用（DOM, Storage等） |
| データ取得 | async/await直接 | useEffect/SWR/TanStack |

**原則**: Server Component をデフォルトとし、インタラクションが必要な場合のみ `'use client'` を付与。

### Hooks設計

- **1 Hook = 1 関心事**: `useFormValidation`, `useTableSort`
- **状態とロジックの分離**: UIコンポーネントから状態管理を切り出す
- **カスタムHookのテスト**: `renderHook` でテスト可能にする

### エラーバウンダリ

- ページ単位の `ErrorBoundary` でクラッシュを局所化
- フォーム送信エラーはインラインで表示（ページ遷移させない）
- 予期しないエラーにはフォールバックUIを提供

---

## コンポーネント設計時の必須チェック

新しいコンポーネントを設計する際:

1. `_common/COMPONENT_SPEC.md` のテンプレートに従って仕様を書く
2. 既存の `artisan/references/components/` に類似コンポーネントがないか確認
3. `vision/references/patterns/` のパターンで使用される場合、パターン仕様との整合性を確認
4. `muse/references/token-system.md` のトークンを使用
5. `palette/references/content-guidelines-ja.md` のラベル規約に従う

## 参照

- `_common/COMPONENT_SPEC.md` — コンポーネント仕様テンプレート
- `muse/references/token-system.md` — デザイントークン
- `muse/references/design-system-construction.md` — デザインシステム構築ガイド
- `vision/references/patterns/` — デザインパターン
- `palette/references/content-guidelines-ja.md` — 日本語UIコンテンツガイドライン
- `showcase/references/storybook-patterns.md` — Story作成パターン
