# Design Pattern Guidelines

> デザインパターン選択・拡張のガイドライン。Vision がUI設計時にパターンライブラリを活用する際の判断基準。

## パターンとは

**デザインパターン** = 複数のコンポーネントを特定の目的で組み合わせた、再利用可能なUI構成。

| 概念 | 定義 | 例 |
|------|------|-----|
| Component | 単一機能を持つUI部品 | Button, Input, Table |
| Pattern | 複数コンポーネントの定型的な組み合わせ | DataTable（Table + Sort + Filter + Pagination） |
| Template | パターンを配置した画面全体の構成 | ダッシュボード、設定画面 |

**パターンはコンポーネントの上位概念。** コンポーネント仕様（`artisan/references/components/`）はパーツの仕様、パターン仕様は組み合わせ方の仕様。

---

## パターン選択の判断基準

### 既存パターンを使うべき場合

- ✅ 要件が既存パターンの「Overview → 解決する課題」に一致する
- ✅ 操作フローが既存パターンの「Interaction Flow」と概ね同じ
- ✅ 使用コンポーネントの8割以上が既存パターンと共通

### パターンをカスタマイズすべき場合

- ⚙️ 既存パターンに1-2ステップの追加/省略が必要
- ⚙️ レスポンシブの挙動を変えたい
- ⚙️ 特定のコンポーネントを別のもので代替したい

### 新規パターンを作るべき場合

- 🆕 既存パターンのどれにも当てはまらない操作フロー
- 🆕 同じ組み合わせが3回以上プロジェクト内で出現する
- 🆕 複数のプロジェクトで再利用される見込みがある

---

## パターンの拡張方法

### カスタマイズ時の原則

1. **コア構造を維持** — パターンのInteraction Flowの骨格は変えない
2. **差分を明示** — カスタマイズ箇所は「[CUSTOM]」マークで記録
3. **a11yを損なわない** — パターンのAccessibilityセクションの要件は全て維持
4. **レスポンシブを壊さない** — Responsive Behaviorの基本方針は維持

### 新規パターン作成フロー

1. `vision/references/patterns/` 内に既存パターンと同じセクション構成で作成
2. 使用するコンポーネントが `artisan/references/components/` に存在するか確認
3. 存在しない場合は `_common/COMPONENT_SPEC.md` テンプレートで先に仕様を作成
4. パターンの Related セクションに関連パターンへの参照を追加

---

## パターン仕様のセクション構成

全パターン仕様は以下の8セクションで構成する:

| # | Section | 内容 |
|----|---------|------|
| 1 | Overview | 解決する課題、使用場面 |
| 2 | Structure | 含まれるコンポーネントの組み合わせ（ASCII図） |
| 3 | Interaction Flow | ユーザー操作フロー |
| 4 | Component Composition | 使用コンポーネント一覧（artisan/components/への参照） |
| 5 | Responsive Behavior | デスクトップ/タブレット/モバイル |
| 6 | Accessibility | パターン全体のa11y要件 |
| 7 | Do / Don't | 正しい使い方 / 避けるべき使い方 |
| 8 | Code Skeleton | React/TSXの構成例（骨格のみ） |

---

## コンポーネント仕様との参照関係

```
_common/COMPONENT_SPEC.md        ← テンプレート
    ↓
artisan/references/components/   ← 個別仕様（Atom/Molecule/Organism）
    ↓ 参照
vision/references/patterns/      ← パターン仕様（組み合わせ）
    ↓ 参照
vision/references/output-formats.md ← 画面設計書
```

- パターンからコンポーネントへの参照: `→ artisan/references/components/{name}.md`
- コンポーネントからパターンへの参照: Related > Composition Patterns

---

## P1パターン一覧

| Pattern | ファイル | 主な使用コンポーネント |
|---------|---------|---------------------|
| Data Table | `data-table.md` | Table, Button, Select, Input |
| Form Wizard | `form-wizard.md` | Input, Select, Checkbox, Button, Dialog |
| Delete Confirmation | `delete-confirmation.md` | Dialog, Button |
| Search & Filter | `search-filter.md` | Input, Select, Checkbox, Card/Table |
| Sidebar Layout | `sidebar-layout.md` | Card, Button |

## 参照

- `_common/COMPONENT_SPEC.md` — コンポーネント仕様テンプレート
- `artisan/references/components/` — P1コンポーネント仕様
- `artisan/references/component-guidelines.md` — コンポーネント設計ガイドライン
- `vision/references/design-methodology.md` — デザイン手法
- `palette/references/content-guidelines-ja.md` — UIラベル規約
