# Delete Confirmation Pattern

## Overview

| 項目 | 値 |
|------|-----|
| Pattern | Delete Confirmation |
| Category | Interaction / Safety |
| Complexity | Medium |
| Reference | SmartHR「ワンクッション必要な操作」「削除ダイアログ」相当 |

**解決する課題:** 破壊的操作（削除・取消・無効化）の誤操作を防ぎ、ユーザーに影響範囲を理解させた上で実行させる。

**使用場面:**
- データの削除（ソフトデリート / ハードデリート）
- アカウントの無効化・解約
- 一括削除
- 取り消し不可能な操作全般

---

## Structure

### Level 1: シンプル確認（1件の削除）

```
┌─ Dialog ─────────────────────────────┐
│                                       │
│  ⚠️ 「{アイテム名}」を削除            │
│                                       │
│  この操作は取り消せません。             │
│  関連する{N}件のデータも削除されます。  │
│                                       │
│           [キャンセル] [削除する]       │
└───────────────────────────────────────┘
```

### Level 2: 二段階確認（重要データの削除）

```
┌─ Dialog ─────────────────────────────┐
│                                       │
│  ⚠️ プロジェクト「{名前}」を削除       │
│                                       │
│  以下のデータも完全に削除されます:     │
│  - メンバー: 12名                     │
│  - タスク: 48件                       │
│  - ファイル: 156件                    │
│                                       │
│  確認のため「{名前}」と入力:           │
│  ┌─────────────────────────────┐      │
│  │                             │      │
│  └─────────────────────────────┘      │
│                                       │
│           [キャンセル] [削除する]       │
└───────────────────────────────────────┘
```

### Level 3: Undo対応（ソフトデリート）

```
操作実行 → Toast表示:
┌──────────────────────────────────┐
│ 「{名前}」を削除しました [元に戻す] │
└──────────────────────────────────┘
（5秒後に自動消去 → ソフトデリート確定）
```

---

## Interaction Flow

### Level判定基準

```
削除対象の評価
  ├→ 復元可能（ゴミ箱あり）  → Level 3（Undo Toast）
  ├→ 復元不可 + 影響小       → Level 1（シンプル確認）
  └→ 復元不可 + 影響大       → Level 2（二段階確認）
      ※ 影響大 = 関連データ多数 / 課金影響 / 他ユーザーへの影響
```

### Level 1 フロー
```
1. 削除ボタンクリック
   └→ 確認ダイアログ表示
2. 影響範囲の表示
   └→ 削除対象名 + 関連データ件数
3. 「削除する」クリック
   └→ API実行 → 成功Toast → リスト更新
   └→ API失敗 → エラーToast（ダイアログは閉じない）
```

### Level 2 フロー
```
1-2. Level 1と同じ
3. 確認入力
   └→ 対象名の一致で「削除する」ボタン有効化
4. 「削除する」クリック
   └→ ボタンがloading状態に
   └→ API実行 → 成功 → ダイアログ閉じる + Toast
```

### Level 3 フロー
```
1. 削除ボタンクリック
   └→ 即座にソフトデリート実行（UI上は非表示に）
   └→ Undo Toast表示（5秒タイマー）
2. 「元に戻す」クリック
   └→ ソフトデリート取消 → アイテム復元
   └→ Toast消去
3. タイマー終了
   └→ ソフトデリート確定（バックグラウンド）
```

---

## Component Composition

| Component | 参照 | 役割 |
|-----------|------|------|
| Dialog (type=confirm) | → `artisan/references/components/dialog.md` | 確認ダイアログ |
| Button (danger) | → `artisan/references/components/button.md` | 削除実行ボタン |
| Button (secondary) | → `artisan/references/components/button.md` | キャンセルボタン |
| Input | → `artisan/references/components/input.md` | Level 2の確認入力 |
| Toast | — | 完了通知 + Undo |

---

## Responsive Behavior

| Breakpoint | Layout変更 |
|------------|-----------|
| Desktop (≥768px) | Dialog: 中央表示（max-width: 480px） |
| Mobile (<768px) | Dialog: 画面下部からスライドアップ（Sheet形式） |

**モバイルでのシート形式:**
```
┌─────────────────────────┐
│                         │ ← 背景タップで閉じる
│                         │
├─────────────────────────┤
│ ⚠️ 削除の確認            │
│ この操作は取り消せません │
│                         │
│ [キャンセル]             │ ← 全幅ボタン
│ [削除する]               │ ← 全幅ボタン、danger
└─────────────────────────┘
```

---

## Accessibility

- **Dialog**: `role="alertdialog"` + `aria-modal="true"`（alert系なので `alertdialog`）
- **フォーカス**: ダイアログ開時にキャンセルボタンにフォーカス（安全側をデフォルト）
- **フォーカストラップ**: ダイアログ内でTab循環
- **Escape**: ダイアログを閉じる（= キャンセル扱い）
- **Level 2確認入力**: `aria-describedby` で「{名前}と入力してください」の説明を紐付け
- **スクリーンリーダー**: 影響範囲のリストを読み上げ可能にする

---

## Do / Don't

### Do
- ✅ ダイアログタイトルに対象名を含める → 何を削除するか明確
- ✅ 影響範囲（関連データ件数）を具体的に表示 → 判断材料の提供
- ✅ 「削除する」ボタンはdangerバリアント → 視覚的警告
- ✅ キャンセルにデフォルトフォーカス → 安全側にバイアス
- ✅ ソフトデリート可能ならLevel 3（Undo）を優先 → UX向上
- ✅ ボタンラベルは「削除する」（具体的動詞） → `palette/references/content-guidelines-ja.md` 参照

### Don't
- ❌ 「はい/いいえ」ボタンを使わない → 「キャンセル/削除する」のように具体的に
- ❌ 削除後にページ遷移だけしない → 成功Toastを表示
- ❌ Level 2の確認入力を全ての削除に求めない → 日常操作が煩雑になる
- ❌ ダイアログのBackdropクリックで削除実行しない → 閉じる = キャンセル

---

## Code Skeleton

```tsx
// Level 1: シンプル確認
function DeleteConfirmDialog({ item, isOpen, onClose, onConfirm }: DeleteConfirmProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteItem(item.id)
      onConfirm()
      toast.success(`「${item.name}」を削除しました`)
    } catch (error) {
      toast.error('削除に失敗しました。もう一度お試しください。')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog type="confirm" isOpen={isOpen} onClose={onClose} title={`「${item.name}」を削除`}>
      <p>この操作は取り消せません。</p>
      {item.relatedCount > 0 && <p>関連する{item.relatedCount}件のデータも削除されます。</p>}
      <DialogFooter>
        <Button variant="secondary" onClick={onClose}>キャンセル</Button>
        <Button variant="danger" onClick={handleDelete} isLoading={isDeleting}>削除する</Button>
      </DialogFooter>
    </Dialog>
  )
}

// Level 2: 二段階確認
function DeleteWithInputConfirm({ item, isOpen, onClose, onConfirm }: DeleteConfirmProps) {
  const [confirmText, setConfirmText] = useState('')
  const isConfirmed = confirmText === item.name

  return (
    <Dialog type="confirm" isOpen={isOpen} onClose={onClose} title={`「${item.name}」を削除`}>
      <p>以下のデータも完全に削除されます:</p>
      <ul>{item.impacts.map(i => <li key={i.type}>{i.type}: {i.count}件</li>)}</ul>
      <Input
        label={`確認のため「${item.name}」と入力`}
        value={confirmText}
        onChange={setConfirmText}
      />
      <DialogFooter>
        <Button variant="secondary" onClick={onClose}>キャンセル</Button>
        <Button variant="danger" onClick={handleDelete} isDisabled={!isConfirmed}>削除する</Button>
      </DialogFooter>
    </Dialog>
  )
}

// Level 3: Undo Toast
function useUndoDelete() {
  const deleteWithUndo = async (item: Item) => {
    await softDelete(item.id)
    removeFromList(item.id)

    toast.custom(
      <UndoToast
        message={`「${item.name}」を削除しました`}
        onUndo={async () => {
          await restoreItem(item.id)
          addToList(item)
        }}
      />,
      { duration: 5000 }
    )
  }
  return { deleteWithUndo }
}
```
