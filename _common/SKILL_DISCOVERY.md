# Skill Discovery Protocol

エージェントの繰り返しパターンを自動検出し、スラッシュコマンド化を提案するボトムアップ発見。

---

## Detection Rules

| Condition | Action |
|-----------|--------|
| 同一パターンが3回以上出現 | SkillCandidate として提案 |
| 同一手順を2セッションで実行 | コマンド化を提案（WORKFLOW_AUTOMATION と連携） |
| 5ステップ以上の手動プロンプト | 即座にコマンド化を提案 |

---

## Skill Candidate Lifecycle

```
検出 → proposed → レビュー → approved / rejected
                                |
                          commands/ に配置
```

### States

| State | Description |
|-------|-------------|
| proposed | パターン検出済み、未レビュー |
| approved | 承認済み、コマンド化対象 |
| rejected | 却下、今後提案しない |

---

## Pattern Detection

### Action Log Format

```yaml
action_log:
  - timestamp: "2026-02-23T10:00:00"
    action: "git status && git diff && git log"
    context: "PR準備"
  - timestamp: "2026-02-23T10:01:00"
    action: "pytest tests/ -q --tb=short"
    context: "テスト実行"
```

### Similarity Matching

- コマンド文字列の類似度（Levenshtein / Jaccard）
- コンテキスト（目的）の一致
- 実行順序のパターン

---

## Skill Candidate Format

```yaml
SKILL_CANDIDATE:
  name: "pre-pr-check"
  description: "PR作成前の標準チェック（テスト + lint + diff確認）"
  pattern: "pytest → eslint → git diff"
  occurrences: 5
  first_seen: "2026-02-20"
  status: "proposed"
```

---

## Registry

### Storage

`data/skill_candidates/registry.json` に永続化:

```json
{
  "candidates": [
    {
      "name": "pre-pr-check",
      "description": "PR作成前の標準チェック",
      "pattern": "pytest → eslint → git diff",
      "occurrences": 5,
      "first_seen": "2026-02-20",
      "status": "proposed"
    }
  ]
}
```

### Management

スキル候補の管理はプロジェクト固有のCLIまたはエージェント経由で行う:

```yaml
# 操作
list:     全候補一覧（status フィルタ可能）
approve:  承認 → commands/ にコマンドファイルを自動生成
reject:   却下 → 今後の提案から除外
```

レジストリは `data/skill_candidates/registry.json` にプロジェクトローカルで永続化。

---

## Integration with WORKFLOW_AUTOMATION

SKILL_DISCOVERY と WORKFLOW_AUTOMATION は補完関係:

| Protocol | Trigger | Scope |
|----------|---------|-------|
| WORKFLOW_AUTOMATION | 同じ手順を2回実行 | セッション内 |
| SKILL_DISCOVERY | 3回以上のパターン検出 | セッション横断 |

WORKFLOW_AUTOMATION で検出 → SKILL_DISCOVERY に登録 → 承認後コマンド化。

閾値の違いの理由:
- **WORKFLOW_AUTOMATION (2回)**: セッション内の即時フィードバック。低コストで提案可能
- **SKILL_DISCOVERY (3回)**: セッション横断の永続化。誤検出を減らすため閾値を高く設定
