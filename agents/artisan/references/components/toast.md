# Toast

## Overview

| 項目 | 値 |
|------|-----|
| Name | Toast |
| Description | 操作結果を一時的に通知するフィードバック要素 |
| Layer | Molecule |
| Category | Feedback |
| Status | Stable |

---

## Anatomy

```
┌───────────────────────────────────────┐
│            [1]Message                 │
└───────────────────────────────────────┘
  (全幅表示、画面上部に配置)
```

| # | Part | Required | Description |
|----|------|----------|-------------|
| 1 | Message | Required | 操作結果を示すテキスト（14px Bold、中央揃え、白色） |

**表示仕様（Figma注記）:**
- 表示位置: 画面上部（ステータスバー直下）
- 自動非表示: 2.5秒後にフェードアウト
- 全幅表示（画面幅に追従）

---

## Props / API

```typescript
interface ToastProps {
  /** トーストタイプ */
  type: 'success' | 'error';
  /** メッセージテキスト */
  message: string;
  /** 表示時間（ms） */
  duration?: number;
  /** 閉じた時のコールバック */
  onClose?: () => void;
}

/** 命令的API（推奨） */
interface ToastAPI {
  success: (message: string, options?: ToastOptions) => void;
  error: (message: string, options?: ToastOptions) => void;
  dismiss: (toastId?: string) => void;
}

interface ToastOptions {
  duration?: number;
  onClose?: () => void;
}
```

**デフォルト値:** `duration=2500`

---

## Variants

### Type

| Type | Background | Text | Use Case |
|------|-----------|------|----------|
| success | `bg-success` Green/500 `#18CF83` | `text-inverse` `#FFFFFF` | 操作成功（保存完了、登録完了等） |
| error | `bg-critical` Red/600 `#FF001F` | `text-inverse` `#FFFFFF` | 操作失敗（エラー、通信失敗等） |

### Layout

| Property | Value |
|----------|-------|
| 幅 | 100%（画面幅 = 393px 基準） |
| 高さ | 56px |
| パディング（左右） | 24px（`var(--space-xl)`） |
| テキスト配置 | 中央揃え（`text-align: center`） |
| テキストレイアウト | `flex: 1 0 0`（幅いっぱい） |

---

## States

| State | Visual Change | CSS | ARIA |
|-------|--------------|-----|------|
| entering | 上からスライドイン | `transform: translateY(-100%) → translateY(0); opacity: 0 → 1` | — |
| visible | 完全表示 | `transform: translateY(0); opacity: 1` | `role="status"` or `role="alert"` |
| exiting | フェードアウト | `opacity: 1 → 0` | — |
| hidden | DOM除去または非表示 | `display: none` | — |

**アニメーション:**
- 表示: `transform 200ms ease-out` + `opacity 200ms ease-out`
- 非表示: `opacity 300ms ease-in`（2.5秒待機後）

---

## Design Tokens

> See: [`design-tokens.md`](../design-tokens.md) for full token definitions

| Token | DS v3 Reference | Resolved Value | Usage |
|-------|----------------|----------------|-------|
| `--toast-height` | — | `56px` | トースト高さ |
| `--toast-success-bg` | `var(--color-bg-success)` | Green/500 `#18CF83` | 成功時背景 |
| `--toast-error-bg` | `var(--color-bg-critical)` | Red/600 `#FF001F` | エラー時背景 |
| `--toast-text` | `var(--color-text-inverse)` | Black/0 `#FFFFFF` | テキスト色 |
| `--toast-font-size` | `var(--font-size-md)` | `14px` | フォントサイズ |
| `--toast-font-weight` | `var(--font-weight-bold)` | `700` | フォントウェイト |
| `--toast-line-height` | — | `1.5` | 行高さ |
| `--toast-font-family` | `var(--font-family)` | `Noto Sans JP` | フォント |
| `--toast-padding-x` | `var(--space-xl)` | `24px` | 左右パディング |
| `--toast-duration` | — | `2500ms` | 表示時間 |
| `--toast-enter-duration` | — | `200ms` | 表示アニメーション |
| `--toast-exit-duration` | — | `300ms` | 非表示アニメーション |
| `--toast-z-index` | — | `1000` | 重なり順 |

---

## Accessibility

### ARIA

| Attribute | Value | Condition |
|-----------|-------|-----------|
| `role` | `status` | success トースト |
| `role` | `alert` | error トースト |
| `aria-live` | `polite` | success トースト |
| `aria-live` | `assertive` | error トースト |
| `aria-atomic` | `true` | 常時（内容全体を読み上げ） |

### Keyboard

| Key | Action |
|-----|--------|
| `Escape` | 表示中のトーストを即座に閉じる |

### Screen Reader
- 成功: `role="status"` + `aria-live="polite"` → 現在の読み上げ完了後に通知
- エラー: `role="alert"` + `aria-live="assertive"` → 即座に割り込み通知
- 2.5秒の自動非表示はスクリーンリーダーの読み上げに十分な時間を確保

### Color Contrast
- success: 白テキスト on Green/500 → 背景色の明度が高いため注意（必要に応じてダークテキスト検討）
- error: 白テキスト on Red/600 → 4.5:1 以上

---

## Do / Don't

### Do
- ✅ メッセージは短く完結に（1行に収まる長さ） → 「パスワードの再登録が完了しました」
- ✅ 成功/エラーの2種類で使い分ける → タイプによる色分けでフィードバックを明確化
- ✅ ユーザー操作の直後に表示する → 操作との因果関係を明確にする
- ✅ 複数トーストは最新のもので上書き → スタック表示は避ける

### Don't
- ❌ 重要な情報やアクション要求をトーストで表示しない → ダイアログを使う
- ❌ 長文のメッセージを入れない → 2.5秒で読めない
- ❌ リンクやボタンをトースト内に配置しない → 自動非表示で操作できなくなる
- ❌ ページ読み込み時に自動表示しない → ユーザー操作に対するフィードバックに限定

---

## Related

### Similar Components

| Component | Use When | Don't Use When |
|-----------|----------|---------------|
| Toast | 一時的な操作結果の通知 | ユーザーの確認/操作が必要 |
| Dialog | 確認・操作が必要なフィードバック | 単純な成功/失敗通知 |
| Banner | 持続的なシステム通知 | 一時的な操作結果 |
| InlineMessage | フォーム内のフィールドエラー | 画面全体の操作結果 |

### Composition Patterns
- → `vision/references/patterns/form-submission.md` — フォーム送信後の成功トースト
- → `vision/references/patterns/delete-confirmation.md` — 削除完了後のフィードバック
