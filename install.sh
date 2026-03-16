#!/bin/bash
set -euo pipefail

# Agent Orchestrator Installer
# Usage:
#   curl -sL https://raw.githubusercontent.com/hinominant/agent-orchestrator/main/install.sh | bash
#   curl -sL https://raw.githubusercontent.com/hinominant/agent-orchestrator/main/install.sh | bash -s -- nexus rally builder radar
#   ./install.sh                    # Install all agents
#   ./install.sh nexus rally builder # Install specific agents
#   ./install.sh --with-mcp         # Install agents + setup MCP servers
#   ./install.sh --with-permissions  # Install agents + safe permission defaults
#   ./install.sh --with-hooks        # Install agents + tool risk hooks (3-Hook体制)

REPO="hinominant/agent-orchestrator"
BRANCH="main"

# All 68 agents (65 simota + 3 Luna originals: ceo, analyst, auditor)
ALL_AGENTS="analyst anvil architect arena artisan atlas auditor bard bolt bridge builder canon canvas ceo cipher compete director echo experiment flow forge gateway gear grove growth guardian harvest hone horizon judge launch lens magi morph muse navigator nexus palette polyglot probe pulse quill radar rally reel researcher retain rewind ripple scaffold schema scout scribe sentinel sherpa showcase spark specter stream sweep trace triage tuner vision voice voyager warden zen"

# Parse flags
WITH_MCP=false
WITH_PERMISSIONS=false
WITH_HOOKS=false
AGENT_ARGS=()
for arg in "$@"; do
  case "$arg" in
    --with-mcp) WITH_MCP=true ;;
    --with-permissions) WITH_PERMISSIONS=true ;;
    --with-hooks) WITH_HOOKS=true ;;
    *) AGENT_ARGS+=("$arg") ;;
  esac
done

# Default: install all if no agent args
AGENTS="${AGENT_ARGS[*]:-$ALL_AGENTS}"

echo "=== Agent Orchestrator Installer ==="
echo "Source: github.com/${REPO}"
echo ""

# Create directories
mkdir -p .claude/agents
mkdir -p .claude/commands
mkdir -p .claude/skills
mkdir -p .agents
mkdir -p .agents/memory

# Clone to temp directory for reliable file access
TMPDIR=$(mktemp -d)
trap "rm -rf $TMPDIR" EXIT

echo "Downloading agent definitions..."
git clone --depth 1 --branch "$BRANCH" "https://github.com/${REPO}.git" "$TMPDIR" 2>/dev/null

INSTALLED=0
SKIPPED=0

echo "[1/12] Installing agent definitions..."
for agent in $AGENTS; do
  if [ -d "$TMPDIR/agents/$agent" ]; then
    # Copy SKILL.md as flat file for Claude Code agent discovery
    cp "$TMPDIR/agents/$agent/SKILL.md" ".claude/agents/${agent}.md"
    # Copy references/ if they exist (for agents that need supplementary docs)
    if [ -d "$TMPDIR/agents/$agent/references" ]; then
      rm -rf ".claude/agents/${agent}/references"
      mkdir -p ".claude/agents/${agent}"
      cp -r "$TMPDIR/agents/$agent/references" ".claude/agents/${agent}/"
    fi
    INSTALLED=$((INSTALLED + 1))
    echo "  -> ${agent}"
  else
    echo "  [WARN] Agent '${agent}' not found, skipping"
    SKIPPED=$((SKIPPED + 1))
  fi
done

echo "[2/12] Installing custom commands..."
COMMANDS_INSTALLED=0
for cmd_file in "$TMPDIR"/commands/*.md; do
  if [ -f "$cmd_file" ]; then
    cp "$cmd_file" ".claude/commands/"
    cmd_name=$(basename "$cmd_file" .md)
    COMMANDS_INSTALLED=$((COMMANDS_INSTALLED + 1))
    echo "  -> ${cmd_name}"
  fi
done

echo "[3/12] Downloading framework protocol..."
cp "$TMPDIR/_templates/CLAUDE_PROJECT.md" ".claude/agents/_framework.md"

echo "[4/12] Installing common protocols (_common/)..."
mkdir -p .claude/agents
PROTOCOLS_INSTALLED=0
for proto_file in "$TMPDIR"/_common/*.md; do
  if [ -f "$proto_file" ]; then
    proto_name=$(basename "$proto_file")
    cp "$proto_file" ".claude/agents/_protocol_${proto_name}"
    PROTOCOLS_INSTALLED=$((PROTOCOLS_INSTALLED + 1))
    echo "  -> _protocol_${proto_name}"
  fi
done
echo "  Installed: ${PROTOCOLS_INSTALLED} common protocols"

echo "[5/12] Installing skills..."
SKILLS_INSTALLED=0
for skill_file in "$TMPDIR"/skills/*.md; do
  if [ -f "$skill_file" ]; then
    cp "$skill_file" ".claude/skills/"
    skill_name=$(basename "$skill_file" .md)
    SKILLS_INSTALLED=$((SKILLS_INSTALLED + 1))
    echo "  -> ${skill_name}"
  fi
done

echo "[6/12] Setting up shared knowledge..."
if [ ! -f ".agents/PROJECT.md" ]; then
  cp "$TMPDIR/_templates/PROJECT.md" ".agents/PROJECT.md"
  echo "  -> Created .agents/PROJECT.md"
else
  echo "  -> .agents/PROJECT.md already exists, skipping"
fi

echo "[7/12] Setting up business context..."
if [ ! -f ".agents/LUNA_CONTEXT.md" ]; then
  cp "$TMPDIR/_templates/LUNA_CONTEXT.md" ".agents/LUNA_CONTEXT.md"
  echo "  -> Created .agents/LUNA_CONTEXT.md (customize for your project)"
else
  echo "  -> .agents/LUNA_CONTEXT.md already exists, skipping"
fi

echo "[8/12] Copying MCP scripts and templates..."
mkdir -p .claude/scripts
if [ -f "$TMPDIR/scripts/setup-mcp.sh" ]; then
  cp "$TMPDIR/scripts/setup-mcp.sh" ".claude/scripts/setup-mcp.sh"
  chmod +x ".claude/scripts/setup-mcp.sh"
  echo "  -> Copied scripts/setup-mcp.sh"
else
  echo "  [WARN] scripts/setup-mcp.sh not found in repo, skipping"
fi
if [ -f "$TMPDIR/_templates/mcp-settings.json" ]; then
  cp "$TMPDIR/_templates/mcp-settings.json" ".claude/mcp-settings.template.json"
  echo "  -> Copied mcp-settings.template.json"
else
  echo "  [WARN] _templates/mcp-settings.json not found in repo, skipping"
fi
# Cloud scripts
if [ -d "$TMPDIR/scripts/cloud" ]; then
  mkdir -p .claude/scripts/cloud
  for f in cloud.sh codespace.sh ec2.sh setup-billing-alert.sh .env.example; do
    if [ -f "$TMPDIR/scripts/cloud/$f" ]; then
      cp "$TMPDIR/scripts/cloud/$f" ".claude/scripts/cloud/$f"
      [[ "$f" == *.sh ]] && chmod +x ".claude/scripts/cloud/$f"
    fi
  done
  echo "  -> Copied cloud execution scripts"
fi
# devcontainer template
if [ -f "$TMPDIR/_templates/devcontainer.json" ]; then
  mkdir -p .devcontainer
  cp "$TMPDIR/_templates/devcontainer.json" ".devcontainer/devcontainer.json"
  [ -f "$TMPDIR/_templates/post-create.sh" ] && cp "$TMPDIR/_templates/post-create.sh" ".devcontainer/post-create.sh"
  echo "  -> Copied devcontainer template"
fi

echo "[9/12] Checking CLAUDE.md..."
if [ -f "CLAUDE.md" ]; then
  if grep -q "Agent Orchestrator" CLAUDE.md 2>/dev/null; then
    echo "  -> CLAUDE.md already has framework reference, skipping"
  else
    cat >> CLAUDE.md << 'FRAMEWORK_EOF'

## Agent Team Framework

This project uses [Agent Orchestrator](https://github.com/hinominant/agent-orchestrator).
Agent definitions are in `.claude/agents/`. Framework protocol is in `.claude/agents/_framework.md`.

### Key Rules
- Hub-spoke pattern: all communication through orchestrator (Nexus/Rally)
- CEO handles business decisions before technical execution
- File ownership is law in parallel execution
- Guardrails L1-L4 for safe autonomous execution
- All outputs in Japanese
- Conventional Commits, no agent names in commits/PRs

### Business Context
- `.agents/LUNA_CONTEXT.md` - Business context for CEO decisions
- `.agents/PROJECT.md` - Shared knowledge across agents
FRAMEWORK_EOF
    echo "  -> Appended framework reference to CLAUDE.md"
  fi
else
  cat > CLAUDE.md << 'FRAMEWORK_EOF'
# Project Instructions

## Agent Team Framework

This project uses [Agent Orchestrator](https://github.com/hinominant/agent-orchestrator).
Agent definitions are in `.claude/agents/`. Framework protocol is in `.claude/agents/_framework.md`.

### Key Rules
- Hub-spoke pattern: all communication through orchestrator (Nexus/Rally)
- CEO handles business decisions before technical execution
- File ownership is law in parallel execution
- Guardrails L1-L4 for safe autonomous execution
- All outputs in Japanese
- Conventional Commits, no agent names in commits/PRs

### Business Context
- `.agents/LUNA_CONTEXT.md` - Business context for CEO decisions
- `.agents/PROJECT.md` - Shared knowledge across agents
FRAMEWORK_EOF
  echo "  -> Created CLAUDE.md with framework reference"
fi

echo "[10/12] MCP setup..."
if [ "$WITH_MCP" = true ]; then
  if [ -f ".claude/scripts/setup-mcp.sh" ]; then
    echo "  -> Running MCP setup (--with-mcp flag detected)..."
    bash ".claude/scripts/setup-mcp.sh"
  else
    echo "  [WARN] .claude/scripts/setup-mcp.sh not found, skipping MCP setup"
  fi
else
  echo "  -> Skipped (use --with-mcp to auto-setup)"
fi

echo "[11/12] Permissions setup..."
if [ "$WITH_PERMISSIONS" = true ]; then
  if [ -f "$TMPDIR/_templates/settings.json" ]; then
    if [ ! -f ".claude/settings.json" ]; then
      cp "$TMPDIR/_templates/settings.json" ".claude/settings.json"
      echo "  -> Created .claude/settings.json (project permissions + hooks)"
    else
      echo "  -> .claude/settings.json already exists, skipping"
    fi
    if [ -f "$TMPDIR/_templates/settings.local.example.json" ]; then
      cp "$TMPDIR/_templates/settings.local.example.json" ".claude/settings.local.example.json"
      echo "  -> Copied settings.local.example.json"
    fi
  else
    echo "  [WARN] _templates/settings.json not found, skipping"
  fi
else
  echo "  -> Skipped (use --with-permissions to install safe defaults)"
fi

echo "[12/12] Hooks setup (3-Hook体制)..."
if [ "$WITH_HOOKS" = true ]; then
  # Install hooks to both project-local and global locations
  mkdir -p .claude/hooks
  HOOKS_DIR="$HOME/.claude/hooks"
  mkdir -p "$HOOKS_DIR"

  for hook_file in "$TMPDIR"/_templates/hooks/*.js; do
    if [ -f "$hook_file" ]; then
      hook_name=$(basename "$hook_file")
      # Copy to project-local
      cp "$hook_file" ".claude/hooks/"
      # Copy to global
      cp "$hook_file" "$HOOKS_DIR/"
      chmod +x "$HOOKS_DIR/$hook_name"
      echo "  -> ${hook_name}"
    fi
  done

  # Copy settings.json with hook configuration if not exists
  if [ -f "$TMPDIR/_templates/settings.json" ]; then
    if [ ! -f ".claude/settings.json" ]; then
      cp "$TMPDIR/_templates/settings.json" ".claude/settings.json"
      echo "  -> settings.json (permissions + hooks config)"
    else
      echo "  -> .claude/settings.json already exists"
    fi
  fi

  # Global settings hint
  SETTINGS_FILE="$HOME/.claude/settings.json"
  if [ -f "$SETTINGS_FILE" ]; then
    if ! grep -q "tool-risk" "$SETTINGS_FILE" 2>/dev/null; then
      echo "  [NOTE] Add hook config to your ~/.claude/settings.json hooks.PreToolUse:"
      echo '    { "hooks": [{ "type": "command", "command": "node ~/.claude/hooks/tool-risk.js" }] }'
    else
      echo "  -> Hook already configured in global settings.json"
    fi
  else
    echo "  [NOTE] ~/.claude/settings.json not found."
    echo "  Add this to your settings.json hooks.PreToolUse:"
    echo '    { "hooks": [{ "type": "command", "command": "node ~/.claude/hooks/tool-risk.js" }] }'
  fi

  echo "  Hooks installed (3-Hook体制: PreToolUse + PostToolUse + Stop)"
else
  echo "  -> Skipped (use --with-hooks to install 3-Hook risk classification)"
fi

echo ""
echo "=== Installation complete ==="
echo "  Installed: ${INSTALLED} agents"
echo "  Installed: ${COMMANDS_INSTALLED} custom commands"
echo "  Installed: ${SKILLS_INSTALLED} skills"
echo "  Installed: ${PROTOCOLS_INSTALLED} common protocols"
[ "$SKIPPED" -gt 0 ] && echo "  Skipped: ${SKIPPED} agents"
echo ""
echo "Installed agents:"
for f in .claude/agents/*.md; do
  name=$(basename "$f" .md)
  [ "$name" != "_framework" ] && [[ "$name" != _protocol_* ]] && echo "  - $name"
done
echo ""
echo "Installed commands:"
for f in .claude/commands/*.md; do
  if [ -f "$f" ]; then
    name=$(basename "$f" .md)
    echo "  - /$name"
  fi
done
echo ""
echo "Next steps:"
echo "  1. Customize .agents/LUNA_CONTEXT.md for your project"
echo "  2. Review .agents/PROJECT.md for shared knowledge"
echo "  3. Customize CLAUDE.md for your project"
echo "  4. Run './install.sh --with-permissions' for safe permission defaults"
echo ""
echo "Usage (agents):"
echo "  /ceo この機能の優先度を判断して"
echo "  /nexus ログイン機能を実装したい"
echo "  /analyst ユーザー離脱率を分析して"
echo "  /rally フロントエンドとバックエンドを並列実装して"
echo ""
echo "Usage (commands):"
echo "  /superpowers 認証システムをリファクタリングして"
echo "  /frontend-design ダッシュボードのUIを設計して"
echo "  /code-simplifier 直近の変更をクリーンアップして"
echo "  /playground マークダウンエディタを作って"
echo "  /chrome このページのデータを収集して"
echo "  /pr-review #123"
echo "  /retro"
echo ""
echo "MCP Integration:"
echo "  # Global MCP setup (recommended)"
echo "  bash scripts/setup-mcp.sh"
echo ""
echo "  # Project-specific PostgreSQL MCP"
echo "  claude mcp add postgres -- npx -y @modelcontextprotocol/server-postgres 'postgresql://user:pass@host:5432/db'"
echo ""
echo "Hooks:"
echo "  ./install.sh --with-hooks    # Install 3-Hook体制 (tool-risk + post-tool-use + stop-hook)"
echo ""
echo "Cloud Execution (Codespaces推奨):"
echo "  # Setup"
echo "  cp .claude/scripts/cloud/.env.example .claude/scripts/cloud/.env"
echo "  # デフォルトはCodespaces。EC2を使う場合のみ CLOUD_PROVIDER=ec2 に変更"
echo "  # Usage:"
echo "  bash .claude/scripts/cloud/cloud.sh start --repo OWNER/REPO"
echo "  bash .claude/scripts/cloud/cloud.sh run \"npm run build\""
echo "  bash .claude/scripts/cloud/cloud.sh status"
