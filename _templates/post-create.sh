#!/bin/bash
set -euo pipefail

echo "=== Codespace Setup ==="

# Python venv + dependencies (universal image has Python 3.12 + Node.js)
if [ -f pyproject.toml ]; then
  python3 -m venv .venv
  source .venv/bin/activate
  pip install --upgrade pip
  pip install -e ".[dev]" 2>/dev/null || pip install -e "." 2>/dev/null || true

  # Fix sqlite3 for ChromaDB (universal image bundles old sqlite3 in Python)
  if pip show chromadb > /dev/null 2>&1; then
    pip install pysqlite3-binary -q
    SITE_PACKAGES=$(python -c "import site; print(site.getsitepackages()[0])")
    cat > "$SITE_PACKAGES/sitecustomize.py" << 'PYEOF'
try:
    __import__("pysqlite3")
    import sys
    sys.modules["sqlite3"] = sys.modules.pop("pysqlite3")
except ImportError:
    pass
PYEOF
  fi
fi

# Node.js dependencies
if [ -f package.json ]; then
  npm install
fi

# Claude Code CLI
sudo npm install -g @anthropic-ai/claude-code

# .env from secrets
if [ ! -f .env ] && [ -f .env.example ]; then
  cp .env.example .env
fi
[ -n "${ANTHROPIC_API_KEY:-}" ] && grep -q "ANTHROPIC_API_KEY" .env 2>/dev/null || echo "ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY:-}" >> .env

echo ""
echo "=== Setup Complete ==="
python3 --version 2>/dev/null || true
node --version 2>/dev/null || true
echo "Run 'claude' to start Claude Code"
