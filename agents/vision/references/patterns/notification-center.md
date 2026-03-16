# Notification Center Pattern

## Overview

| 項目 | 値 |
|------|-----|
| Pattern | Notification Center |
| Category | Communication / Navigation |
| Complexity | High |
| Reference | GitHub Notifications・Slack Activity Feed相当 |

**解決する課題:** アプリ内で発生したイベント（メッセージ・承認・システム通知等）をユーザーが見逃さず、効率的に確認・処理できるようにする。

**使用場面:**
- ユーザー宛てのメッセージ・返信の通知
- タスクの承認依頼・完了通知
- システムメンテナンス・重要アナウンス
- アクションが必要な通知（例: 支払い期限）

---

## Structure

### Entry Point（ベルアイコン）

```
ヘッダー右端:
┌────────────────────────────────┐
│ Logo    ナビ      🔔 [3]  👤   │
└────────────────────────────────┘
         ↑ 未読バッジ（最大99+）
```

### Notification Panel（パネル展開）

```
┌──────────────────────────────────┐
│ 通知                [全て既読にする] │
├──────────────────────────────────┤
│ ● [Avatar] タスク名が承認されました  │
│   田中 太郎                 2分前  │
├──────────────────────────────────┤
│   [Avatar] 新しいメッセージが届き   │
│   ました。                  1時間前 │
├──────────────────────────────────┤
│ ● [Avatar] 支払い期限が3日後です   │
│   システム                  昨日   │
├──────────────────────────────────┤
│          [全ての通知を見る]         │
└──────────────────────────────────┘
```

- `●` = 未読インジケーター（Brand/600 `#5538EE`）
- 未読: 背景 `bg-secondary` Brand/50
- 既読: 背景 `bg-default` White

---

## Notification Item Anatomy

```
┌──────────────────────────────────────┐
│ ● [Avatar] タイトル行（Bold）         │
│            サブテキスト（Regular）    │
│            [アクションボタン]   時刻  │
└──────────────────────────────────────┘
```

| Part | Description |
|------|-------------|
| Unread Dot | 未読状態（Brand/600、8px） |
| Avatar | 送信者アバター or システムアイコン |
| Title | 通知タイトル（14px Bold） |
| Body | 通知本文の要約（14px Regular、2行まで） |
| Action | インライン操作ボタン（optional） |
| Timestamp | 相対時刻（「2分前」「昨日」、12px、`text-secondary`） |

---

## Interaction Flow

### 基本フロー

```
新規イベント発生
  └→ ベルアイコンに未読バッジ表示（+1）
      └→ ユーザーがベルアイコンをクリック
           └→ パネル展開（最新10件表示）
               ├→ 通知アイテムをクリック
               │    └→ 該当ページへ遷移 + 既読マーク
               ├→ 「全て既読にする」クリック
               │    └→ バッジクリア + 全アイテム既読
               └→ 「全ての通知を見る」クリック
                    └→ 通知一覧ページへ遷移
```

### リアルタイム更新

```
WebSocket / SSE で新規通知受信
  └→ バッジカウント +1
  └→ パネル展開中の場合: リスト先頭にスライドイン
  └→ ブラウザ通知許可済みの場合: OS通知を送信
```

---

## Notification Types

| Type | アイコン | 用途 |
|------|---------|------|
| message | 💬 ユーザーアバター | メッセージ・返信 |
| task | ✅ | タスク完了・依頼 |
| alert | ⚠️ | 期限・重要警告 |
| system | 🔔 | システム通知・メンテナンス |
| success | ✅（Green） | 処理完了（非同期処理等） |

---

## Component Composition

| Component | 参照 | 役割 |
|-----------|------|------|
| Avatar | → `artisan/references/components/avatar.md` | 送信者アバター |
| Badge | → `artisan/references/components/badge.md` | 未読カウントバッジ |
| Button (ghost) | → `artisan/references/components/button.md` | インラインアクション |
| Menu (overlay) | → `artisan/references/components/menu.md` | パネルオーバーレイ |

---

## Accessibility

- ベルアイコンボタン: `aria-label="通知 {N}件の未読あり"`（未読0の場合「通知」）
- パネル: `role="dialog"` + `aria-label="通知センター"`
- 未読ドット: `aria-label` に「未読」を含める or `aria-live` で更新を通知
- フォーカス: パネル展開時に最初の通知アイテムにフォーカス移動
- Escape: パネルを閉じてベルアイコンにフォーカスを戻す

---

## Do / Don't

### Do
- ✅ 未読バッジは99件を上限とする（`99+` 表示）
- ✅ 通知は時系列降順（最新が上）で表示する
- ✅ アクションが必要な通知には期限・優先度を明示する
- ✅ パネルは最新10件に絞り「全て見る」で一覧ページへ誘導する

### Don't
- ❌ 通知を全て同等に扱わない → 重要度・typeで視覚的差異を付ける
- ❌ 既読にせずにページ遷移しない → 遷移時に自動既読化する
- ❌ 通知パネルの外クリックで閉じる処理を忘れない

---

## Related

### Composition Patterns
- → `artisan/references/components/header.md` — ヘッダー内のベルアイコン配置
- → `artisan/references/components/toast.md` — リアルタイム通知のポップアップ（Toastとの使い分け）
- → `vision/references/patterns/empty-state.md` — 通知0件状態
