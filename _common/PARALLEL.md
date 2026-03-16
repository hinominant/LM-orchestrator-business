# Parallel Execution Protocol

Rally によるマルチセッション並列実行のプロトコル。

---

## Fan-out / Fan-in Pattern

```
              PREPARE (snapshot)
                    |
         +----------+----------+
         |          |          |
      Branch A   Branch B   Branch C
      (Agent)    (Agent)    (Agent)
         |          |          |
         +----------+----------+
                    |
              AGGREGATE (merge)
                    |
               VERIFY (test)
```

---

## Parallelization Criteria

### OK
- タスク間にデータ依存なし
- ファイル変更が重複しない
- 実行順序の制約なし

### NG
- Task B が Task A の出力を必要とする
- 同じファイルを両方が変更
- 一方が他方の出力を検証する必要あり

---

## File Ownership

```yaml
ownership_map:
  teammate_a:
    exclusive_write:
      - src/features/auth/**
      - tests/auth/**
    shared_read:
      - src/types/**
      - src/config/**
  teammate_b:
    exclusive_write:
      - src/features/profile/**
      - tests/profile/**
    shared_read:
      - src/types/**
```

### Rules
- `exclusive_write`: そのチームメイトのみ書き込み可
- `shared_read`: 誰でも読み取り可（書き込み不可）
- 型定義・設定ファイルは常に `shared_read`
- オーナーシップの重複は禁止

---

## Branch States

| State | Description |
|-------|-------------|
| PENDING | 定義済み、未開始 |
| RUNNING | 実行中 |
| DONE | 正常完了 |
| FAILED | 失敗（リトライ可能） |
| MERGED | メインコンテキストに統合済み |

---

## Merge Strategies

| Strategy | Description |
|----------|-------------|
| CONCAT | 全変更を結合（重複なし前提） |
| RESOLVE | 自動コンフリクト解決 |
| MANUAL | ユーザーに提示して判断 |

---

## Limits

| Metric | Limit |
|--------|-------|
| Max branches | 4 |
| Max steps/branch | 5 |
| Max total parallel steps | 15 |

---

## Token Budget

ブランチ間通信のトークン予算は `SLIM_CONTEXT.md` で定義:

| Communication | Budget |
|---------------|--------|
| Status update | 200 tokens |
| File list | 300 tokens |
| Merge info | 500 tokens |
| Total/branch | 1000 tokens |
