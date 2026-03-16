# Slim Context Protocol

エージェント間通信やパイプライン処理でのトークン予算管理。

---

## Token Estimation

### Language-aware Estimation

| Language | Ratio | Example |
|----------|-------|---------|
| 日本語 | 1文字 ≈ 1.5 tokens | 「東京」 ≈ 3 tokens |
| 英語 | 1単語 ≈ 1.3 tokens | "Tokyo" ≈ 1.3 tokens |
| コード | 1文字 ≈ 0.5 tokens | `console.log` ≈ 5.5 tokens |

---

## Compression Strategies

### Priority Order

1. **空行・連続スペース除去** - 情報ロスなし
2. **URL短縮** - `https://example.com/very/long/path` → `[リンク]`
3. **重複行除去** - 同一行の2回目以降を削除（順序保持）
4. **末尾トランケート** - 先頭（=重要部分）を優先保持 + `...(省略)` マーカー

### Dict Compression

構造化データの圧縮:

```yaml
priority_keys:  # これらを優先保持
  - subject
  - description
  - status
  - highlights

drop_order:     # 予算超過時の削除順（優先度低い順）
  - metadata
  - raw_data
  - debug_info
  - timestamps
```

---

## Budget Allocation

### Agent Handoff

```yaml
HANDOFF_BUDGET:
  summary: 500 tokens        # 必須: 結果サマリー
  key_findings: 1000 tokens  # 重要: 発見事項
  artifacts: 500 tokens      # ファイルパス・コマンド
  context: remaining         # 残りトークンをコンテキストに配分
  total: 3000 tokens
```

### Rally Branch Communication

```yaml
BRANCH_BUDGET:
  status_update: 200 tokens
  file_list: 300 tokens
  merge_info: 500 tokens
  total: 1000 tokens
```

---

## Application Points

| Scenario | Budget | Strategy |
|----------|--------|----------|
| NEXUS_HANDOFF | 3000 tokens | summary優先 |
| Rally branch merge | 1000 tokens | file list優先 |
| Knowledge context injection | 4000 tokens | highlights抽出 |
| Error report | 500 tokens | stacktrace冒頭 |

---

## Overflow Handling

```
予算超過時:
  1. 圧縮戦略を順に適用
  2. まだ超過 → priority_keys以外を削除
  3. まだ超過 → 末尾からトランケート + "...(省略)" マーカー
```

トランケートされた情報が必要な場合、受信エージェントは元データを直接参照する。
