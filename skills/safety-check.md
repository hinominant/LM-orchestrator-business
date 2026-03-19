---
name: safety-check
description: 破壊的操作の事前検知・警告・安全な代替案の提示を行うスキル
model: haiku
---

# Safety Check Skill

## Purpose
破壊的なコマンドや操作を実行前に検知し、エンジニアに明確な警告と安全な代替案を提示する。Claude Code 初心者の安全なオンボーディングを支援。

## Risk Classification

### BLOCK（即座にブロック）
実行を阻止し、ユーザーに確認を求める。

| パターン | 理由 |
|---------|------|
| `rm -rf /` or `rm -rf ~` | システム/ホーム破壊 |
| `DROP DATABASE` / `DROP TABLE` (本番) | データ不可逆消失 |
| シークレットを含む curl/wget | 認証情報の外部送信 |
| `chmod 777` | セキュリティ脆弱性 |
| `git push --force` to main/master | 共有履歴の破壊 |

### HIGH（警告 + 確認要求）
実行前に影響範囲を説明し、明示的な承認を要求。

| パターン | 警告内容 |
|---------|---------|
| `rm -rf <dir>` | 「このディレクトリ配下の全ファイルが削除されます」 |
| `git reset --hard` | 「未コミットの変更が全て失われます」 |
| `git push --force` | 「リモートの履歴が上書きされます」 |
| `npm publish` | 「パッケージが公開されます」 |
| `DROP TABLE` | 「テーブルとデータが不可逆に削除されます」 |
| `TRUNCATE` | 「テーブルの全データが削除されます」 |
| `DELETE FROM ... WHERE 1=1` | 「全行が削除されます」 |

### MEDIUM（説明表示）
操作の影響を簡潔に説明。

| パターン | 説明 |
|---------|------|
| `git push` | 「リモートにコードが送信されます」 |
| ファイル編集 | 「このファイルを変更します」 |
| パッケージインストール | 「依存関係が追加されます」 |

### LOW（サイレント通過）
| パターン |
|---------|
| `git status`, `git log`, `git diff` |
| `Read`, `Grep`, `Glob` |
| `ls`, `cat`, `echo` |

## Alert Format

警告時は以下のフォーマットで表示:

```
⚠️ [HIGH] 破壊的操作の検出
━━━━━━━━━━━━━━━━━━━━━━━━━━
操作: git push --force origin main
影響: リモートの main ブランチの履歴が上書きされます。
      チームメンバーの作業が失われる可能性があります。
━━━━━━━━━━━━━━━━━━━━━━━━━━
安全な代替案:
  → git push --force-with-lease origin main
    (他者のコミットがある場合は自動で失敗)
━━━━━━━━━━━━━━━━━━━━━━━━━━
続行しますか？ [y/N]
```

## Safe Alternatives

| 危険な操作 | 安全な代替 |
|-----------|-----------|
| `git push --force` | `git push --force-with-lease` |
| `rm -rf dir` | `mv dir dir.bak` → 確認後削除 |
| `git reset --hard` | `git stash` → reset → 必要なら `git stash pop` |
| `DROP TABLE` | `RENAME TABLE old TO old_backup` → 確認後削除 |
| `git checkout -- .` | `git stash` で退避してから検討 |
| `npm publish` | `npm pack` でローカル確認 → `npm publish --dry-run` |

## Integration

このスキルは `_common/TOOL_RISK.md` プロトコルおよび `hooks/tool-risk.js` フックと連携して動作する。

### フック連携フロー
```
ユーザー操作
    ↓
tool-risk.js (PreToolUse hook)
    ↓ リスク判定
safety-check skill
    ↓ 警告生成 + 代替案提示
    ↓
ユーザー確認
    ↓
実行 or キャンセル
```
