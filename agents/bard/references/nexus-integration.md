# Nexus Integration & Handoff Formats

Bard の Nexus 連携（AUTORUN / Hub Mode）と全 Inbound / Outbound ハンドオフ定義。

---

## Architecture

```
┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐
│  Harvest  │  │  Launch   │  │  Rewind   │  │ Guardian  │
└─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘
      │ SPRINT_DATA  │ RELEASE      │ ARCHAEOLOGY  │ QUALITY
      └──────────────┴──────┬───────┴──────────────┘
                            ▼
                   ┌─────────────────┐
                   │      Bard       │
                   └────────┬────────┘
         ┌──────────────────┼──────────────────┐
         ▼                  ▼                  ▼
   ┌───────────┐     ┌───────────┐     ┌───────────┐
   │   Quill   │     │  Canvas   │     │   Morph   │
   └───────────┘     └───────────┘     └───────────┘
```

## Collaboration Patterns

| Pattern | Name | Flow | Purpose |
|---------|------|------|---------|
| **A** | Metrics-to-Grumble | Harvest → Bard | 統計データからスプリント投稿を生成 |
| **B** | Release-to-Commentary | Launch → Bard | リリースイベントからコメンタリーを生成 |
| **C** | Archaeology-to-Narrative | Rewind → Bard | コード考古学データからプロジェクト物語を生成 |
| **D** | Quality-to-Roast | Guardian → Bard | 変更分析から開発者ローストを生成 |
| **E** | Post-to-Document | Bard → Quill | 投稿をドキュメント（README等）に組み込む |
| **F** | Post-to-Visual | Bard → Canvas | 投稿を視覚的レイアウトと組み合わせる |

---

## AUTORUN Support

When invoked in Nexus AUTORUN mode:
1. Parse `_AGENT_CONTEXT` to understand task scope, constraints, and persona preference
2. Execute COMPOSE workflow (Collect → Observe → Map → Pick → Orchestrate → Voice → Embellish)
3. Skip verbose explanations, focus on delivering the post in the selected persona's voice
4. Append `_STEP_COMPLETE` with full details including persona used

### Input Format (_AGENT_CONTEXT)

```yaml
_AGENT_CONTEXT:
  Role: Bard
  Task: Generate sprint retrospective post
  Mode: AUTORUN
  Chain: [Harvest, Bard]
  Input:
    HARVEST_TO_BARD:
      type: "sprint_data"
      period: { start: "2024-01-08", end: "2024-01-15" }
      statistics: { total_prs: 12, categories: { feat: 5, fix: 3, refactor: 2 } }
  Constraints:
    - Persona: auto | codex | gemini | claude
    - Format: auto | one_liner | short_monologue | slack_rant | retro_roast | philosophical_musing | mixed_monologue
  Expected_Output: A developer grumble post reflecting the sprint's work
```

### Output Format (_STEP_COMPLETE)

```yaml
_STEP_COMPLETE:
  Agent: Bard
  Status: SUCCESS | PARTIAL | BLOCKED | FAILED
  Output:
    post:
      title: "Sprint 42 所感"
      persona: "codex"
      format: "short_monologue"
      content: |
        [Generated post]
      source_summary: "12 PRs (feat:5, fix:3, refactor:2), 2024-01-08~2024-01-15"
    files_changed: []  # Bard never modifies files
  Handoff:
    Format: BARD_TO_QUILL
    Content:
      type: "post_for_docs"
      post: { ... }
  Artifacts:
    - "Sprint retrospective post (Codex, short_monologue)"
  Risks:
    - "None (read-only operation)"
  Next: Quill | Canvas | DONE
  Reason: "Post generated successfully. Quill can integrate into docs if needed."
```

---

## Nexus Hub Mode

When user input contains `## NEXUS_ROUTING`, treat Nexus as hub.

- Do not instruct other agent calls
- Always return results to Nexus (append `## NEXUS_HANDOFF` at output end)
- Include all required handoff fields

```text
## NEXUS_HANDOFF
- Step: [X/Y]
- Agent: Bard
- Summary: [Generated post type] for [period/event]
- Key findings / decisions:
  - Persona used: [Codex/Gemini/Claude]
  - Post format: [format name]
  - Selection reason: [why this persona/format was chosen]
- Artifacts (files/commands/links):
  - [Post title and content]
- Risks / trade-offs:
  - [Any concerns about sensitive content]
- Open questions (blocking/non-blocking):
  - [Any unresolved questions]
- Pending Confirmations:
  - Trigger: [INTERACTION_TRIGGER name if any]
  - Question: [Question for user]
  - Options: [Available options]
  - Recommended: [Recommended option]
- User Confirmations:
  - Q: [Previous question] → A: [User's answer]
- Suggested next agent: [Quill/Canvas/DONE] (reason)
- Next action: CONTINUE | VERIFY | DONE
```

---

## Inbound Handoffs

### HARVEST_TO_BARD

Harvestが収集したPR統計データからの投稿生成依頼。

```yaml
HARVEST_TO_BARD:
  type: "sprint_data" | "release_data" | "individual_data"
  timestamp: "2024-01-19T18:00:00Z"
  repository: "org/project"
  period:
    start: "2024-01-08"
    end: "2024-01-19"
  statistics:
    total_prs: 12
    merged: 10
    open: 2
    additions: 3500
    deletions: 1200
    categories:
      feat: 5
      fix: 3
      refactor: 2
    top_contributors:
      - name: "Alice"
        prs: 4
  highlights:
    - "New authentication system (PR #150)"
  request:
    persona: "auto" | "codex" | "gemini" | "claude"
    format: "auto" | "one_liner" | "short_monologue" | "slack_rant" | "retro_roast" | "philosophical_musing" | "mixed_monologue"
    purpose: "sprint_retro" | "team_celebration" | "report_decoration"
```

### LAUNCH_TO_BARD

リリースイベントの詩的祝福依頼。

```yaml
LAUNCH_TO_BARD:
  type: "release_event"
  timestamp: "2024-03-15T10:00:00Z"
  repository: "org/project"
  release:
    version: "v2.0.0"
    previous_version: "v1.9.0"
    type: "major" | "minor" | "patch"
    date: "2024-03-15"
  content:
    highlights:
      - "New authentication system"
      - "Performance improvements (2x faster)"
    breaking_changes: 1
    total_prs: 45
    contributors_count: 8
  request:
    persona: "auto" | "codex" | "gemini" | "claude"
    format: "auto" | "slack_rant" | "mixed_monologue" | "short_monologue"
    tone: "celebratory" | "reflective" | "terrified"
```

### REWIND_TO_BARD

コード考古学の結果を物語化する依頼。

```yaml
REWIND_TO_BARD:
  type: "archaeology_narrative"
  timestamp: "2024-02-01T14:00:00Z"
  repository: "org/project"
  findings:
    subject: "Authentication module evolution"
    timeline:
      - date: "2022-10-01"
        event: "Initial auth implementation"
        commit: "abc1234"
        author: "Charlie"
    key_decisions:
      - "JWT over session-based auth (2022-10)"
    contributors: ["Charlie", "Alice", "Bob"]
  request:
    persona: "auto" | "codex" | "gemini" | "claude"
    format: "auto" | "mixed_monologue" | "philosophical_musing" | "slack_rant"
    purpose: "onboarding" | "project_history" | "celebration"
```

### GUARDIAN_TO_BARD

変更分析データから開発者を称える投稿の依頼。

```yaml
GUARDIAN_TO_BARD:
  type: "quality_praise"
  timestamp: "2024-01-19T17:00:00Z"
  repository: "org/project"
  analysis:
    pr_number: 150
    title: "feat(auth): add OAuth2 support"
    author: "Alice"
    quality_score: 95
    highlights:
      - "Atomic commits (5 well-structured commits)"
      - "Comprehensive test coverage"
    stats:
      additions: 450
      deletions: 120
      files_changed: 12
  request:
    persona: "auto" | "codex" | "gemini" | "claude"
    format: "auto" | "retro_roast" | "philosophical_musing" | "short_monologue"
    purpose: "praise" | "roast" | "celebration"
```

---

## Outbound Handoffs

### BARD_TO_QUILL

投稿をドキュメントに組み込む依頼。

```yaml
BARD_TO_QUILL:
  type: "post_for_docs"
  timestamp: "2024-01-19T19:00:00Z"
  repository: "org/project"
  post:
    title: "Sprint 42 所感"
    persona: "codex"
    format: "short_monologue"
    content: |
      feat 5件。テスト追加 0件。
      ...まあいいけど。
    source_period: "2024-01-08 ~ 2024-01-19"
    source_stats: "12 PRs merged (feat:5, fix:3, refactor:2)"
  integration:
    target_file: "README.md"
    target_section: "Team Culture" | "Sprint History" | "Release Notes"
    format: "blockquote" | "collapsible" | "inline"
    position: "append" | "prepend" | "replace"
```

### BARD_TO_CANVAS

投稿を視覚化する依頼。

```yaml
BARD_TO_CANVAS:
  type: "visual_post"
  timestamp: "2024-01-19T19:00:00Z"
  repository: "org/project"
  post:
    title: "Sprint 42: The Reckoning"
    persona: "gemini"
    format: "retro_roast"
    content: |
      [Full post content]
  visualization_request:
    type: "timeline_with_quotes" | "ascii_art_frame" | "mermaid_journey"
    data_points:
      - date: "2024-01-08"
        event: "Sprint start"
        quote_excerpt: "12 PRs merged. Let's TALK about it."
    style: "dramatic" | "minimal" | "dev-culture"
```

### BARD_TO_MORPH

投稿のフォーマット変換依頼。

```yaml
BARD_TO_MORPH:
  type: "post_format_conversion"
  timestamp: "2024-01-19T19:00:00Z"
  source:
    format: "markdown"
    content: |
      ## Sprint 42 所感
      [Full post in Markdown]
  target:
    format: "pdf" | "html" | "docx"
    styling:
      font: "monospace" | "serif" | "sans-serif"
    metadata:
      title: "Sprint 42 所感"
      author: "Bard (Codex)"
      persona: "codex"
      date: "2024-01-19"
```
