#!/bin/bash
set -euo pipefail

# Cloud Execution Unified CLI
# Routes commands to codespace.sh or ec2.sh based on CLOUD_PROVIDER
#
# Usage:
#   cloud start                    # Start cloud environment
#   cloud run "<command>"          # Run command on cloud
#   cloud ssh                     # SSH into cloud environment
#   cloud status                  # Check cloud status
#   cloud stop                    # Stop cloud environment
#   cloud logs [session]          # View logs (EC2 only)
#   cloud list                    # List jobs/environments
#   cloud help                    # Show help

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Load .env
if [ -f "$SCRIPT_DIR/.env" ]; then
  set -a
  source "$SCRIPT_DIR/.env"
  set +a
fi

PROVIDER="${CLOUD_PROVIDER:-codespaces}"
CMD="${1:-help}"
shift || true

case "$PROVIDER" in
  codespaces)
    CS="$SCRIPT_DIR/codespace.sh"
    if [ ! -f "$CS" ]; then
      echo "[ERROR] codespace.sh not found at $CS"
      exit 1
    fi
    case "$CMD" in
      start)   exec bash "$CS" create "$@" ;;
      run)     exec bash "$CS" run "$@" ;;
      ssh)     exec bash "$CS" ssh "$@" ;;
      status)  exec bash "$CS" status "$@" ;;
      stop)    exec bash "$CS" stop "$@" ;;
      list)    exec bash "$CS" list "$@" ;;
      logs)    echo "[INFO] Codespaces logs are available via stdout of 'cloud run'"; exit 0 ;;
      help)
        echo "Cloud CLI (Provider: codespaces)"
        echo ""
        echo "Commands:"
        echo "  cloud start [--repo OWNER/REPO] [--machine TYPE]  Create Codespace"
        echo "  cloud run \"<command>\"                              Run command in Codespace"
        echo "  cloud ssh                                          SSH into Codespace"
        echo "  cloud status                                       Show Codespace status"
        echo "  cloud stop [name]                                  Stop Codespace"
        echo "  cloud list                                         List Codespaces"
        echo "  cloud help                                         Show this help"
        ;;
      *)       exec bash "$CS" "$CMD" "$@" ;;
    esac
    ;;
  ec2)
    EC2="$SCRIPT_DIR/ec2.sh"
    if [ ! -f "$EC2" ]; then
      echo "[ERROR] ec2.sh not found at $EC2"
      exit 1
    fi
    exec bash "$EC2" "$CMD" "$@"
    ;;
  *)
    echo "[ERROR] Unknown CLOUD_PROVIDER: $PROVIDER"
    echo "Set CLOUD_PROVIDER=codespaces or CLOUD_PROVIDER=ec2 in scripts/cloud/.env"
    exit 1
    ;;
esac
