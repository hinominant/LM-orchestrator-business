# Tool Risk Management Protocol

> 3-Hook体制によるツール実行の安全管理。初心者向け安全ネット + ARIS NO Gate パターン。

---

## 3-Hook Architecture

| Hook | Phase | Purpose |
|------|-------|---------|
| `tool-risk.js` (PreToolUse) | 実行前 | リスク評価・ブロック判定 |
| `post-tool-use.js` (PostToolUse) | 実行後 | 結果キャプチャ・ログ記録 |
| `stop-hook.js` (Stop) | 終了時 | セッションサマリ・メモリ永続化 |

---

## Risk Levels

| Level | Indicator | Description | Action |
|-------|-----------|-------------|--------|
| BLOCK | - | ARIS NO Gate パターン検知 | 自動ブロック |
| HIGH | RED | 破壊的・不可逆な操作 | 確認ダイアログ + 説明表示 |
| MEDIUM | YELLOW | 外部影響・副作用のある操作 | 説明表示 |
| LOW | GREEN | 読み取り専用・ローカル変更 | サイレント通過 |

---

## PreToolUse: tool-risk.js

### ARIS NO Gate パターン
以下のパターンを検知した場合、自動ブロック:

| Pattern | Trigger | Action |
|---------|---------|--------|
| ユーザー安全性リスク | 個人情報の外部送信、認証情報の露出 | BLOCK |
| 信頼低下リスク | 本番データの直接操作、未テストのデプロイ | BLOCK |
| コスト制御不能 | 大量API呼び出し、無制限ループ | BLOCK |
| 破壊的操作 | `rm -rf`, `DROP TABLE`, force push | WARN + 確認 |

### Risk Classification

#### Bash Commands

| Risk | Commands |
|------|----------|
| HIGH | `rm -rf`, `git push --force`, `git reset --hard`, `DROP TABLE`, `DELETE FROM`, `docker rm -f`, `kill -9`, `chmod 777`, `mkfs`, `dd`, `shutdown` |
| MEDIUM | `git push`, `git commit`, `npm publish`, `docker build`, `pip install`, `curl -X POST/PUT/DELETE`, `ssh`, `scp` |
| LOW | `ls`, `cat`, `grep`, `git status`, `git log`, `git diff`, `npm test`, `echo`, `pwd`, `which` |

#### Tools

| Risk | Tools |
|------|-------|
| HIGH | - |
| MEDIUM | Write, Edit, NotebookEdit, Bash (see above) |
| LOW | Read, Glob, Grep, WebFetch, WebSearch |

### additionalContext
`output.additionalContext` フィールドでツール実行にコンテキストを注入:
```json
{
  "decision": "allow",
  "additionalContext": "This file is owned by teammate-backend. Respect file ownership."
}
```

---

## PostToolUse: post-tool-use.js

- ツール実行結果を `.context/tool-log.jsonl` に記録
- エラーパターンの検出と蓄積

---

## Stop: stop-hook.js

- セッション終了時にツール使用サマリを生成
- `.context/sessions/YYYY-MM-DD.jsonl` に永続化
- `.agents/PROJECT.md` Activity Log 更新

---

## Hooks Implementation

### settings.json 設定

Claude Code の `settings.json` に以下を追加:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node ~/.claude/hooks/tool-risk.js"
          }
        ]
      }
    ]
  }
}
```

### Hook Script

`~/.claude/hooks/tool-risk.js` に配置。stdin から JSON を受け取り、リスク判定結果を stdout に返す。

```
stdin: { tool_name, tool_input }
  |
Risk Classification + ARIS NO Gate Check
  |
stdout: { decision, reason }
  - BLOCK: { decision: "block", reason: "NO Gate: ..." }
  - LOW: { decision: "approve" }（サイレント通過）
  - MEDIUM/HIGH: { decision: "ask_user", reason: "HIGH RISK: ..." }
```

---

## インストール

```bash
install.sh --with-hooks
```

3つのhookファイルが `~/.claude/hooks/` にコピーされる。

---

## Use Cases

### 初心者オンボーディング

新しいチームメンバーが Claude Code を使い始める際に、危険な操作を事前に警告する。

```yaml
Scenario: 初めてのClaude Code利用
  1. install.sh --with-hooks でフック設定を自動インストール
  2. LOW risk → サイレント通過（ストレスなし）
  3. MEDIUM risk → 「このコマンドは外部に影響があります」と表示
  4. HIGH risk → 「破壊的操作です。本当に実行しますか？」と表示
```

### 経験者向け

熟練ユーザーは Hook を無効化するか、HIGH のみ表示に変更可能。

```json
{
  "hooks": {
    "PreToolUse": []
  }
}
```

---

## Integration with Guardrails

| Tool Risk | Guardrail Level |
|-----------|-----------------|
| BLOCK | 即時停止（ARIS NO Gate） |
| HIGH | L3-L4（破壊的操作は即時確認） |
| MEDIUM | L1-L2（ログ + 軽い警告） |
| LOW | なし |

---

## Template: tool-risk.js

`_templates/hooks/tool-risk.js` にテンプレートを配置。
install.sh --with-hooks で `~/.claude/hooks/` にコピーされる。
