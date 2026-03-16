# Component Specification Template

> コンポーネント仕様書の標準テンプレート。全エージェントが新規コンポーネント仕様を作成する際にこのフォーマットに従う。

## テンプレート構成

コンポーネント仕様は以下の9セクションで構成する。省略不可。

---

### 1. Overview

```markdown
## Overview

| 項目 | 値 |
|------|-----|
| Name | ComponentName |
| Description | 1行の説明 |
| Layer | Atom / Molecule / Organism |
| Category | Form / Navigation / Feedback / Data Display / Layout / Overlay |
| Status | Draft / Review / Stable / Deprecated |
```

**Layer の判断基準:**
- **Atom**: 単一の機能を持つ最小単位（Button, Input, Badge, Icon）
- **Molecule**: 2-3個のAtomの組み合わせ（SearchField = Input + Button）
- **Organism**: 複数のMoleculeで構成される独立したUI領域（Header, DataTable, Form）

---

### 2. Anatomy

構成要素をASCII図で示す。各パーツに番号を振り、役割を説明する。

```markdown
## Anatomy

┌─────────────────────────────────┐
│ [1]Icon  [2]Label    [3]Badge  │
└─────────────────────────────────┘

| # | Part | Required | Description |
|----|------|----------|-------------|
| 1 | Icon | Optional | 視覚的手がかり。labelと併用 |
| 2 | Label | Required | 操作内容を示すテキスト |
| 3 | Badge | Optional | 通知数などの補助情報 |
```

---

### 3. Props / API

TypeScript interfaceで定義する。

```markdown
## Props / API

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| variant | `'primary' \| 'secondary' \| 'ghost' \| 'danger'` | `'primary'` | No | 視覚スタイル |
| size | `'sm' \| 'md' \| 'lg'` | `'md'` | No | サイズ |
| disabled | `boolean` | `false` | No | 無効状態 |
| children | `ReactNode` | — | Yes | コンテンツ |
```

**命名規則:**
- Boolean: `is-` / `has-` プレフィックス（`isDisabled`, `hasIcon`）
- Handler: `on-` プレフィックス（`onClick`, `onChange`）
- Render: `render-` プレフィックス（`renderIcon`, `renderFooter`）

---

### 4. Variants

サイズ・視覚スタイルのバリエーションと使い分け基準。

```markdown
## Variants

### Size

| Size | Height | Font Size | Padding | Use Case |
|------|--------|-----------|---------|----------|
| sm | 32px | 14px | 8px 12px | インラインアクション、テーブル内 |
| md | 40px | 16px | 10px 16px | 標準的な操作 |
| lg | 48px | 18px | 12px 24px | CTA、モバイルタッチターゲット |

### Visual

| Variant | Use Case | Example |
|---------|----------|---------|
| primary | 主要アクション（画面に1つ） | 保存する、送信する |
| secondary | 補助アクション | キャンセル、戻る |
| ghost | 低優先度アクション | 詳細を見る |
| danger | 破壊的操作 | 削除する |
```

---

### 5. States

全状態とそのビジュアル変化・ARIA属性を定義する。

```markdown
## States

| State | Visual Change | ARIA | Trigger |
|-------|--------------|------|---------|
| default | — | — | 初期状態 |
| hover | 背景色変化 | — | マウスオーバー |
| active | 背景色+押下感 | — | クリック中 |
| focus | focus-ring表示 | — | Tab/クリック |
| disabled | opacity: 0.4 | `aria-disabled="true"` | disabled prop |
| loading | スピナー表示 | `aria-busy="true"` | 非同期処理中 |
| error | border-color: error | `aria-invalid="true"` | バリデーション失敗 |
```

**focus-ring仕様:**
- `outline: 2px solid var(--color-focus-ring)`
- `outline-offset: 2px`
- `:focus-visible` のみ（マウスクリックでは非表示）

---

### 6. Design Tokens

使用するデザイントークンを一覧化する。`muse/references/token-system.md` を参照。

```markdown
## Design Tokens

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--component-bg` | `var(--color-white)` | `var(--color-gray-900)` | 背景色 |
| `--component-border` | `var(--color-gray-300)` | `var(--color-gray-600)` | ボーダー色 |
| `--component-text` | `var(--color-gray-900)` | `var(--color-gray-50)` | テキスト色 |
| `--component-radius` | `var(--radius-md)` | same | 角丸 |
| `--component-shadow` | `var(--shadow-sm)` | `none` | ボックスシャドウ |
```

**ルール:**
- ハードコード値（`#333`, `16px`）は禁止 → 必ずトークン参照
- ダークモードで変化するトークンには Dark 列を明記
- コンポーネント固有トークンは `--{component}-{property}` で命名

---

### 7. Accessibility

WCAG 2.1 AA準拠を基本とする。

```markdown
## Accessibility

### ARIA

| Attribute | Value | Condition |
|-----------|-------|-----------|
| `role` | `button` | 非`<button>`要素の場合 |
| `aria-label` | 操作説明 | アイコンのみの場合 |
| `aria-disabled` | `true` | disabled時 |

### Keyboard

| Key | Action |
|-----|--------|
| `Enter` / `Space` | アクション実行 |
| `Tab` | フォーカス移動 |
| `Escape` | キャンセル / 閉じる |

### Focus Management
- フォーカス順序はDOMの自然な順序に従う
- モーダル内ではフォーカストラップを実装する
- フォーカス移動後はスクリーンリーダーに通知する（`aria-live`）

### Color Contrast
- テキスト: コントラスト比 4.5:1 以上（WCAG AA）
- 大文字テキスト（18px bold / 24px regular以上）: 3:1 以上
- UI要素の境界: 3:1 以上
```

---

### 8. Do / Don't

正しい使い方と避けるべき使い方を理由付きで示す。

```markdown
## Do / Don't

### Do
- ✅ 1画面に primary ボタンは1つまで → ユーザーの意思決定を単純化
- ✅ ボタンラベルは動詞で始める → 操作内容を明確にする
- ✅ disabled 時は tooltip で理由を表示 → ユーザーが解決策を理解できる

### Don't
- ❌ リンクにボタンスタイルを適用しない → セマンティクスが混乱する
- ❌ アイコンのみのボタンに aria-label なし → スクリーンリーダーで操作不能
- ❌ disabled ボタンを完全に非表示にしない → UIが予測不能になる
```

---

### 9. Related

類似コンポーネントとの使い分けと、合成パターンへの参照。

```markdown
## Related

### Similar Components

| Component | Use When | Don't Use When |
|-----------|----------|---------------|
| Button | ユーザーアクションを実行 | ページ遷移のみ |
| Link | ページ遷移 | 状態変更を伴う操作 |
| IconButton | スペースが限られている | ラベルが必要な場面 |

### Composition Patterns
- → `vision/references/patterns/form-wizard.md` — フォーム内での配置パターン
- → `vision/references/patterns/delete-confirmation.md` — 削除確認ダイアログでの使用
```

---

## 仕様書作成チェックリスト

新しいコンポーネント仕様を作成する際は、以下を確認する:

- [ ] 9セクションすべてが記述されている
- [ ] Props/API の型定義が TypeScript で記述されている
- [ ] 全状態（default/hover/active/focus/disabled/loading/error）が定義されている
- [ ] デザイントークンにハードコード値がない
- [ ] ダークモード対応が明記されている
- [ ] WCAG 2.1 AA のコントラスト比が満たされている
- [ ] キーボード操作が定義されている
- [ ] Do/Don't に理由が付記されている
- [ ] Related に類似コンポーネントとの使い分けがある

## 参照

- `muse/references/token-system.md` — デザイントークン定義
- `muse/references/design-system-construction.md` — デザインシステム構築ガイド
- `artisan/references/component-guidelines.md` — コンポーネント設計原則
- `artisan/references/components/` — P1コンポーネント仕様
- `vision/references/patterns/` — デザインパターン仕様
- `palette/references/content-guidelines-ja.md` — UIラベル・メッセージの日本語規約
