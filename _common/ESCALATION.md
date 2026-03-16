# Escalation Protocol

エージェント無応答・停滞を時間ベースで自動検出し、段階的に対処する。

> **スコープ**: このプロトコルは**時間ベース**のエスカレーション。
> 品質ベース（テスト失敗等）は `GUARDRAIL.md`、不明点ベース（判断困難等）は `INTERACTION.md` を参照。

---

## Escalation Phases

| Phase | Name | Trigger | Action |
|-------|------|---------|--------|
| 0 | NORMAL | - | 正常稼働 |
| 1 | NUDGE | 2分無応答 | リマインドメッセージ送信 |
| 2 | RETRY | 4分無応答 | タスク内容を再送 + 前回状態からの継続指示 |
| 3 | RESET | 6分無応答 or リトライ上限 | タスク未割当に戻す + 再割当 or 人間エスカレート |

---

## Escalation Flow

```
正常応答中
  ↓ 2分無応答
Phase 1: NUDGE
  → 「タスク進捗を確認してください」
  ↓ さらに2分無応答
Phase 2: RETRY（最大2回）
  → タスク内容再送 + 「前回の状態から継続してください」
  ↓ さらに2分無応答 or リトライ上限
Phase 3: RESET
  → タスクを未割当に戻す
  → 別エージェントに再割当 or 人間にエスカレート
```

---

## Default Policy

```yaml
ESCALATION_POLICY:
  nudge_after_seconds: 120    # 2分
  retry_after_seconds: 240    # 4分
  reset_after_seconds: 360    # 6分
  max_retries: 2              # リトライ最大回数
```

### Customization

```yaml
# 長時間タスク（ビルド、大規模テスト等）
ESCALATION_POLICY:
  nudge_after_seconds: 300    # 5分
  retry_after_seconds: 600    # 10分
  reset_after_seconds: 900    # 15分
  max_retries: 1
```

---

## Message Templates

### NUDGE

```
タスク「{task_description}」の進捗を確認してください。
最終応答から {elapsed_seconds}秒 経過しています。
```

### RETRY

```
タスク「{task_description}」を再送します。
前回の状態から継続してください。
リトライ: {retry_count}/{max_retries}
```

### RESET

```
タスク「{task_description}」を再割当します。
理由: {max_retries}回のリトライ後も応答なし
```

---

## Integration with Guardrails

| Escalation Phase | Guardrail Level |
|-----------------|-----------------|
| NUDGE | L1 (ログのみ) |
| RETRY | L2 (自動回復) |
| RESET | L3 (再分解) |
| 人間エスカレート | L4 (停止) |

---

## Rally Integration

Rally の並列実行中、各ブランチ（チームメイト）に対して個別にエスカレーション監視を行う。
1つのブランチが RESET に達しても、他のブランチは影響を受けない。

```yaml
rally_escalation:
  per_branch: true
  on_reset: reassign_to_idle_branch
  on_all_reset: escalate_to_human
```

---

## Related Protocols

| Protocol | Scope | Trigger |
|----------|-------|---------|
| ESCALATION (本プロトコル) | 時間ベース | エージェント無応答・停滞 |
| GUARDRAIL | 品質ベース | テスト失敗・セキュリティ・ビルドエラー |
| INTERACTION | 不明点ベース | 判断困難・複数選択肢・ブロッキング |

3つのエスカレーション体系は独立して動作し、同時にトリガーされることがある。
