# Tool Risk Management Protocol

> 3-Hook体制 + Sandbox + Permissions による多層防御。Claude Code 初心者の安全なオンボーディングを最優先に設計。

---

## Security Architecture（多層防御）

```
Layer 1: Sandbox（OS レベル隔離）
  ├── macOS: Seatbelt / Linux: Bubble Wrap
  ├── ファイルシステム制限（~/.aws, ~/.ssh 等を遮断）
  └── ネットワーク制限（ホワイトリスト方式）

Layer 2: Permissions（deny/allow ルール）
  ├── deny が最優先（allow より先に評価）
  ├── 危険コマンドの明示的ブロック
  └── 機密ファイルの読み取り禁止

Layer 3: Hooks（3-Hook体制）
  ├── PreToolUse: リスク評価・Safety Gate
  ├── PostToolUse: 実行ログ記録
  └── Stop: セッションサマリ永続化

Layer 4: Guardrails（L1-L4）
  └── エージェントレベルの品質・安全ガードレール
```

---

## Layer 1: Sandbox

### 推奨設定（settings.json）

```json
{
  "sandbox": {
    "enabled": true,
    "allowUnsandboxedCommands": false,
    "filesystem": {
      "denyRead": [
        "~/.aws/credentials",
        "~/.ssh/id_*",
        "~/.gnupg/**",
        "~/.config/gh/hosts.yml",
        "~/.netrc"
      ]
    }
  }
}
```

### ネットワーク制限（上級者向け）

外部への意図しないデータ送信を防止:

```json
{
  "sandbox": {
    "network": {
      "allowedDomains": [
        "github.com",
        "*.githubusercontent.com",
        "*.npmjs.org",
        "registry.yarnpkg.com",
        "pypi.org"
      ]
    }
  }
}
```

---

## Layer 2: Permissions

### deny ルール（最優先で評価）

| カテゴリ | ルール |
|---------|--------|
| 破壊的操作 | `rm -rf /`, `rm -rf ~`, `sudo *`, `mkfs *`, `dd if=*` |
| Git 破壊 | `git push --force *`, `git push -f *`, `git reset --hard *`, `git clean -fd *` |
| セキュリティ | `chmod 777 *` |
| シークレット送信 | `curl * --data *password*`, `curl * -d *secret*`, `curl * -d *token*` |
| 機密ファイル | `.env`, `.env.*`, `secrets/**`, `*.pem`, `*.key`, `credentials.json` |

### allow ルール（安全な操作を自動承認）

テスト実行、lint、git read操作、ls/pwd 等の読み取り専用コマンド。

---

## Layer 3: 3-Hook体制

| Hook | Phase | Purpose |
|------|-------|---------|
| `tool-risk.js` (PreToolUse) | 実行前 | リスク評価・Safety Gate・ブロック判定 |
| `post-tool-use.js` (PostToolUse) | 実行後 | 結果キャプチャ・ログ記録 |
| `stop-hook.js` (Stop) | 終了時 | セッションサマリ・メモリ永続化 |

### Risk Levels

| Level | Indicator | Description | Action |
|-------|-----------|-------------|--------|
| BLOCK | - | Safety Gate パターン検知 | 自動ブロック（実行不可） |
| HIGH | 🔴 | 破壊的・不可逆な操作 | 確認ダイアログ + 影響説明 |
| MEDIUM | 🟡 | 外部影響・副作用のある操作 | 説明表示 |
| LOW | 🟢 | 読み取り専用・ローカル変更 | サイレント通過 |

### Safety Gate パターン（自動ブロック）

| Pattern | Trigger | Reason |
|---------|---------|--------|
| 認証情報送信 | curl/wget でシークレットを含むデータ送信 | 外部への認証情報漏洩 |
| システム破壊 | `rm -rf /`, `DROP DATABASE`, force push to main | 不可逆な破壊操作 |
| コスト暴走 | `while true`, 大量ループ | リソース制御不能 |
| シークレット露出 | echo/printf でシークレット変数を stdout に出力 | ログへの漏洩 |
| .env コミット | `git add .env` | シークレットのバージョン管理混入 |

### Bash コマンドリスク分類

| Risk | Commands |
|------|----------|
| HIGH | `rm -rf`, `git push --force`, `git reset --hard`, `DROP TABLE`, `DELETE FROM`, `TRUNCATE`, `docker rm -f`, `kill -9`, `chmod 777`, `mkfs`, `dd`, `shutdown`, Bearer/Basic トークン付き curl |
| MEDIUM | `git push`, `git commit`, `npm publish`, `docker build`, `pip install`, `curl -X POST/PUT/DELETE`, `ssh`, `scp`, `brew install/uninstall` |
| LOW | `ls`, `cat`, `grep`, `git status`, `git log`, `git diff`, `npm test`, `echo`, `pwd`, `which` |

### ツールリスク分類

| Risk | Tools |
|------|-------|
| MEDIUM | Write, Edit, NotebookEdit |
| LOW | Read, Glob, Grep, WebFetch, WebSearch, TaskList, TaskGet |

### additionalContext
`output.additionalContext` でツール実行にコンテキストを注入:
```json
{
  "decision": "allow",
  "additionalContext": "This file is owned by teammate-backend. Respect file ownership."
}
```

---

## シークレット保護（重点）

### 保護対象

| 種類 | パターン例 |
|------|-----------|
| API キー | `AKIA*`, `sk-*`, `ghp_*`, `gho_*` |
| トークン | Bearer/Basic 認証トークン |
| パスワード | DB 接続文字列、.env 内パスワード |
| 秘密鍵 | `*.pem`, `*.key`, `id_rsa`, `id_ed25519` |
| 認証情報ファイル | `.env`, `credentials.json`, `.htpasswd`, `.netrc` |

### 防御層

1. **Sandbox**: ~/.aws, ~/.ssh を読み取り禁止
2. **Permissions deny**: .env, *.pem, *.key の Read をブロック
3. **Hook**: シークレット変数の stdout 出力を Safety Gate でブロック
4. **Hook**: `git add .env` を Safety Gate でブロック
5. **CLAUDE.md**: シークレットに関するルールを明記

### CLAUDE.md への推奨記述

```markdown
## Security Rules
- .env ファイルは絶対にコミットしない
- API キー・トークン・パスワードをコード内にハードコードしない
- 環境変数は process.env / os.environ 経由でアクセスする
- シークレットを echo/console.log で出力しない
- curl/wget でシークレットを含むデータを送信しない
```

---

## インストール

```bash
# 推奨: Hooks + Permissions 同時インストール
install.sh --with-hooks --with-permissions

# Hooks のみ
install.sh --with-hooks

# Permissions のみ
install.sh --with-permissions
```

---

## 初心者オンボーディング

```yaml
Scenario: Claude Code を初めて使うエンジニア
  1. install.sh --with-hooks --with-permissions でセットアップ
  2. Sandbox が OS レベルでファイル/ネットワークを制限
  3. Permissions が危険コマンドと機密ファイルをブロック
  4. Hook が実行前にリスクレベルを判定:
     - LOW → サイレント通過（ストレスなし）
     - MEDIUM → 「このコマンドは外部に影響があります」と表示
     - HIGH → 「⚠️ 破壊的操作です。影響: [説明]」と表示
     - BLOCK → 「🚫 この操作はブロックされました。理由: [理由]」
  5. 安全な代替案が提示される
```

### 経験者向け

Hook を無効化するか、HIGH のみ表示に変更可能:

```json
{
  "hooks": {
    "PreToolUse": []
  }
}
```

---

## 組織向け: Managed Settings

チーム全体に統一セキュリティポリシーを適用する場合:

### 配置先
- macOS: `/Library/Application Support/ClaudeCode/managed-settings.json`
- Linux: `/etc/claude-code/managed-settings.json`

### 統合設定例

```json
{
  "permissions": {
    "disableBypassPermissionsMode": "disable"
  },
  "allowManagedPermissionRulesOnly": true,
  "allowManagedHooksOnly": true,
  "sandbox": {
    "enabled": true,
    "allowUnsandboxedCommands": false
  }
}
```

---

## 確認コマンド

| コマンド | 用途 |
|---------|------|
| `/permissions` | 現在の権限設定を一覧表示 |
| `/status` | 読み込み設定ファイル確認・エラー検出 |

---

## Integration with Guardrails

| Tool Risk | Guardrail Level |
|-----------|-----------------|
| BLOCK | 即時停止（Safety Gate） |
| HIGH | L3-L4（破壊的操作は即時確認） |
| MEDIUM | L1-L2（ログ + 軽い警告） |
| LOW | なし |
