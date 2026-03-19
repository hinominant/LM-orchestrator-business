---
name: secret-scan
description: コードベースからシークレット（API キー・トークン・パスワード等）の漏洩を検出・防止するスキル
model: haiku
---

# Secret Scan Skill

## Purpose
コードベース・コミット履歴・ログ出力にシークレット情報が含まれていないか検査し、漏洩を未然に防止する。

## Scan Targets

| 対象 | チェック内容 |
|------|------------|
| ソースコード | ハードコードされた API キー、トークン、パスワード |
| 設定ファイル | `.env` が `.gitignore` に含まれているか |
| Git 履歴 | コミットにシークレットが混入していないか |
| コンソール出力 | ログや stdout にシークレットが露出していないか |
| CI/CD 設定 | GitHub Actions secrets が適切に使われているか |

## Detection Patterns

```regex
# API Keys / Tokens
(?i)(api[_-]?key|api[_-]?secret|access[_-]?token|auth[_-]?token)\s*[=:]\s*['"]?[A-Za-z0-9_\-]{16,}

# AWS
AKIA[0-9A-Z]{16}

# Generic Secrets
(?i)(password|passwd|secret|private[_-]?key)\s*[=:]\s*['"]?[^\s'"]{8,}

# Database URLs
(?i)(postgres|mysql|mongodb)://[^\s'"]+:[^\s'"]+@

# Bearer Tokens
Bearer\s+[A-Za-z0-9_\-\.]{20,}
```

## Steps

### 1. ファイルスキャン
```bash
# .env ファイルの gitignore チェック
grep -q '\.env' .gitignore 2>/dev/null || echo "WARNING: .env not in .gitignore"

# ハードコードされたシークレットの検出
grep -rn --include='*.{js,ts,py,rb,go,java,yml,yaml,json}' \
  -E '(api_key|api_secret|access_token|password)\s*[=:]\s*['"'"'"][A-Za-z0-9]' .
```

### 2. Git 履歴チェック
```bash
# 直近のコミットにシークレットが含まれていないか
git diff HEAD~5..HEAD | grep -iE '(api_key|secret|token|password)\s*[=:]'
```

### 3. レポート出力
```markdown
## Secret Scan Report

| 重大度 | ファイル | 行 | 検出内容 | 対応 |
|--------|---------|-----|---------|------|
| CRITICAL | src/config.js | 12 | ハードコード API キー | 環境変数に移行 |
| HIGH | .env.example | 5 | 実際の値が含まれている | プレースホルダに置換 |
| MEDIUM | docker-compose.yml | 23 | パスワードが平文 | secrets/vault 使用 |
```

### 4. 自動修正
- ハードコードされたシークレット → `process.env.XXX` / `os.environ['XXX']` に置換提案
- `.env` が `.gitignore` に無い → 追加を提案
- `.env.example` に実際の値 → プレースホルダに置換

## Severity Levels

| Level | 条件 | アクション |
|-------|------|-----------|
| CRITICAL | 本番シークレットがコミット済み | 即座に rotate + git filter-branch |
| HIGH | シークレットがコード内にハードコード | 環境変数化を強制 |
| MEDIUM | .env が gitignore されていない | .gitignore 更新 |
| LOW | シークレット命名が不統一 | 命名規則の提案 |
