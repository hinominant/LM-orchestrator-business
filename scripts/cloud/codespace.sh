#!/bin/bash
set -euo pipefail

# ============================================================================
# Codespace CLI Wrapper
# ============================================================================
# Usage:
#   cs create [--repo OWNER/REPO] [--machine basic|standard]
#   cs run <command>               # Codespace内でコマンド実行
#   cs ssh                         # CodespaceにSSH接続
#   cs list                        # Codespace一覧
#   cs stop [name]                 # Codespace停止（課金停止）
#   cs delete [name]               # Codespace削除
#   cs status                      # Codespace状態確認
#   cs help                        # ヘルプ
# ============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${SCRIPT_DIR}/.env"

# --- Colors ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# --- Load config ---
if [ -f "$ENV_FILE" ]; then
  # shellcheck disable=SC1090
  source "$ENV_FILE"
fi

CODESPACE_MACHINE="${CODESPACE_MACHINE:-basicLinux32gb}"
CODESPACE_IDLE_TIMEOUT="${CODESPACE_IDLE_TIMEOUT:-30}"
CODESPACE_RETENTION_DAYS="${CODESPACE_RETENTION_DAYS:-7}"

# --- gh CLI check ---
check_gh() {
  if ! command -v gh &>/dev/null; then
    echo -e "${RED}エラー: gh CLI がインストールされていません${NC}"
    echo "  brew install gh"
    exit 1
  fi

  if ! gh auth status &>/dev/null 2>&1; then
    echo -e "${RED}エラー: gh CLI が認証されていません${NC}"
    echo "  gh auth login"
    exit 1
  fi
}

# --- Machine type mapping ---
resolve_machine() {
  local input="${1:-$CODESPACE_MACHINE}"
  case "$input" in
    basic|2-core|2core|basicLinux32gb)
      echo "basicLinux32gb"
      ;;
    standard|4-core|4core|standardLinux32gb)
      echo "standardLinux32gb"
      ;;
    # largePremiumLinux はプランにより利用不可の場合あり
    large|8-core|8core|largePremiumLinux)
      echo "largePremiumLinux"
      ;;
    *)
      echo "$input"
      ;;
  esac
}

# --- Detect active codespace ---
get_active_codespace() {
  gh codespace list --json name,state -q '.[0].name' 2>/dev/null || true
}

# --- Commands ---

cmd_create() {
  check_gh

  local repo=""
  local machine="$CODESPACE_MACHINE"

  while [ $# -gt 0 ]; do
    case "$1" in
      --repo|-r)
        repo="$2"; shift 2
        ;;
      --machine|-m)
        machine="$(resolve_machine "$2")"; shift 2
        ;;
      *)
        # 引数がrepoの場合
        if [ -z "$repo" ]; then
          repo="$1"
        fi
        shift
        ;;
    esac
  done

  echo -e "${CYAN}Codespace を作成中...${NC}"
  echo -e "  Machine: ${BOLD}${machine}${NC}"
  [ -n "$repo" ] && echo -e "  Repo: ${BOLD}${repo}${NC}"
  echo -e "  Idle timeout: ${CODESPACE_IDLE_TIMEOUT}分"

  local -a cmd=(gh codespace create)
  [ -n "$repo" ] && cmd+=(--repo "$repo")
  cmd+=(--machine "$machine")
  cmd+=(--idle-timeout "${CODESPACE_IDLE_TIMEOUT}m")
  cmd+=(--retention-period "${CODESPACE_RETENTION_DAYS}d")

  local name
  if name=$("${cmd[@]}" 2>&1); then
    echo ""
    echo -e "${GREEN}Codespace 作成完了${NC}"
    echo -e "  Name: ${BOLD}${name}${NC}"
    echo -e "  ${CYAN}cs ssh${NC}       # SSH接続"
    echo -e "  ${CYAN}cs run <cmd>${NC}  # コマンド実行"
    echo -e "  ${CYAN}cs stop${NC}      # 停止（課金停止）"
  else
    echo -e "${RED}エラー: Codespace の作成に失敗しました${NC}"
    echo "$name"
    exit 1
  fi
}

cmd_run() {
  check_gh

  if [ $# -lt 1 ]; then
    echo -e "${RED}エラー: 実行するコマンドが必要です${NC}"
    echo "  cs run <command>"
    echo "  例: cs run \"cd /workspaces/project && npm run build\""
    exit 1
  fi

  local cmd="$*"
  local codespace_name

  # アクティブなCodespaceを検索
  codespace_name=$(gh codespace list --json name,state -q '.[] | select(.state == "Available") | .name' 2>/dev/null | head -1)

  if [ -z "$codespace_name" ]; then
    # 停止中のCodespaceを起動
    codespace_name=$(gh codespace list --json name,state -q '.[] | select(.state == "Shutdown") | .name' 2>/dev/null | head -1)
    if [ -n "$codespace_name" ]; then
      echo -e "${YELLOW}Codespace '${codespace_name}' を再起動中...${NC}"
    else
      echo -e "${RED}エラー: 利用可能なCodespaceがありません${NC}"
      echo "  cs create  # 新しいCodespaceを作成"
      exit 1
    fi
  fi

  echo -e "${CYAN}Codespace でコマンド実行: ${BOLD}${cmd}${NC}"
  echo -e "  Codespace: ${codespace_name}"
  echo ""

  gh codespace ssh -c "$codespace_name" -- bash -c "$cmd"
  local exit_code=$?

  echo ""
  if [ $exit_code -eq 0 ]; then
    echo -e "${GREEN}コマンド完了 (exit: 0)${NC}"
  else
    echo -e "${RED}コマンド失敗 (exit: ${exit_code})${NC}"
  fi

  return $exit_code
}

cmd_ssh() {
  check_gh

  local codespace_name
  codespace_name=$(gh codespace list --json name,state -q '.[] | select(.state == "Available" or .state == "Shutdown") | .name' 2>/dev/null | head -1)

  if [ -z "$codespace_name" ]; then
    echo -e "${RED}エラー: 利用可能なCodespaceがありません${NC}"
    echo "  cs create  # 新しいCodespaceを作成"
    exit 1
  fi

  echo -e "${CYAN}Codespace にSSH接続: ${BOLD}${codespace_name}${NC}"
  gh codespace ssh -c "$codespace_name"
}

cmd_list() {
  check_gh

  echo -e "${BOLD}=== Codespaces ===${NC}"
  echo ""
  gh codespace list 2>/dev/null || echo -e "${RED}一覧の取得に失敗しました${NC}"
}

cmd_stop() {
  check_gh

  local codespace_name="${1:-}"

  if [ -z "$codespace_name" ]; then
    # アクティブなCodespaceを自動検出
    codespace_name=$(gh codespace list --json name,state -q '.[] | select(.state == "Available") | .name' 2>/dev/null | head -1)
    if [ -z "$codespace_name" ]; then
      echo -e "${YELLOW}稼働中のCodespaceはありません${NC}"
      return
    fi
  fi

  echo -e "${CYAN}Codespace を停止中: ${BOLD}${codespace_name}${NC}"
  gh codespace stop -c "$codespace_name"
  echo -e "${GREEN}Codespace '${codespace_name}' を停止しました（課金停止）${NC}"
}

cmd_delete() {
  check_gh

  local codespace_name="${1:-}"

  if [ -z "$codespace_name" ]; then
    echo -e "${RED}エラー: Codespace名が必要です${NC}"
    echo "  cs delete <name>"
    echo "  cs list  # 一覧を確認"
    exit 1
  fi

  echo -e "${CYAN}Codespace を削除中: ${BOLD}${codespace_name}${NC}"
  gh codespace delete -c "$codespace_name" --force
  echo -e "${GREEN}Codespace '${codespace_name}' を削除しました${NC}"
}

cmd_status() {
  check_gh

  echo -e "${BOLD}=== Codespace Status ===${NC}"
  echo ""

  local codespaces
  codespaces=$(gh codespace list --json name,state,repository,machineName 2>/dev/null || true)

  if [ -z "$codespaces" ] || [ "$codespaces" = "[]" ]; then
    echo -e "${YELLOW}Codespace はありません${NC}"
    echo ""
    echo -e "  ${CYAN}cs create${NC}  # 新しいCodespaceを作成"
    return
  fi

  printf "${BOLD}%-35s %-12s %-30s %s${NC}\n" "NAME" "STATE" "REPOSITORY" "MACHINE"
  echo "────────────────────────────────────────────────────────────────────────────────────────"

  # Parse JSON and format output
  echo "$codespaces" | python3 -c "
import json, sys
data = json.load(sys.stdin)
for cs in data:
    name = cs.get('name', '')
    state = cs.get('state', '')
    repo = cs.get('repository', '')
    machine = cs.get('machineName', '')
    color = ''
    reset = '\033[0m'
    if state == 'Available':
        color = '\033[0;32m'  # green
    elif state == 'Shutdown':
        color = '\033[1;33m'  # yellow
    else:
        color = '\033[0;36m'  # cyan
    print(f'{color}{name:<35}{reset} {state:<12} {repo:<30} {machine}')
" 2>/dev/null || gh codespace list 2>/dev/null
}

cmd_help() {
  cat << 'HELP'
Codespace CLI Wrapper - GitHub Codespaces 管理CLI

Usage:
  cs <command> [arguments]

Commands:
  create [--repo OWNER/REPO] [--machine TYPE]  Codespace作成
  run <command>                                 Codespace内でコマンド実行
  ssh                                          CodespaceにSSH接続
  list                                         Codespace一覧
  stop [name]                                  Codespace停止（課金停止）
  delete <name>                                Codespace削除
  status                                       Codespace状態確認
  help                                         このヘルプを表示

Machine Types:
  basic    basicLinux32gb    (2 vCPU,  8GB RAM, $0.18/hr)
  standard standardLinux32gb (4 vCPU, 16GB RAM, $0.36/hr)
  large    largePremiumLinux (8 vCPU, 32GB RAM, $0.72/hr) *プランにより利用不可の場合あり

Examples:
  cs create --repo hinominant/lros --machine standard
  cs run "cd /workspaces/lros && npm run build"
  cs ssh
  cs status
  cs stop
  cs delete my-codespace

Configuration:
  Edit scripts/cloud/.env (copy from .env.example)

HELP
}

# --- Main ---
COMMAND="${1:-help}"
shift 2>/dev/null || true

case "$COMMAND" in
  create)  cmd_create "$@" ;;
  run)     cmd_run "$@" ;;
  ssh)     cmd_ssh ;;
  list)    cmd_list ;;
  stop)    cmd_stop "$@" ;;
  delete)  cmd_delete "$@" ;;
  status)  cmd_status ;;
  help|--help|-h) cmd_help ;;
  *)
    echo -e "${RED}不明なコマンド: ${COMMAND}${NC}"
    cmd_help
    exit 1
    ;;
esac
