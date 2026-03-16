#!/bin/bash
set -euo pipefail

# EC2 Cloud Execution CLI
# SSH + tmux based remote execution on EC2
#
# Usage:
#   ec2 run "<command>"     # Run command in tmux session on EC2
#   ec2 ssh                 # SSH into EC2 instance
#   ec2 status              # Check EC2 instance status
#   ec2 start               # Start EC2 instance
#   ec2 stop                # Stop EC2 instance
#   ec2 logs [session]      # View tmux session logs
#   ec2 list                # List tmux sessions
#   ec2 help                # Show help

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Load .env
if [ -f "$SCRIPT_DIR/.env" ]; then
  set -a
  source "$SCRIPT_DIR/.env"
  set +a
fi

# Required settings
EC2_HOST="${EC2_HOST:?EC2_HOST is required in .env}"
EC2_USER="${EC2_USER:-ec2-user}"
EC2_KEY="${EC2_KEY:-}"
EC2_WORK_DIR="${EC2_WORK_DIR:-/home/$EC2_USER/work}"
EC2_LOG_DIR="${EC2_LOG_DIR:-/home/$EC2_USER/logs}"
EC2_INSTANCE_ID="${EC2_INSTANCE_ID:-}"
EC2_REGION="${EC2_REGION:-ap-northeast-1}"
AWS_PROFILE="${AWS_PROFILE:-}"

# --- Helper functions ---

aws_cmd() {
  if [ -n "$AWS_PROFILE" ]; then
    aws --profile "$AWS_PROFILE" --region "$EC2_REGION" "$@"
  else
    aws --region "$EC2_REGION" "$@"
  fi
}

ssh_cmd() {
  local ssh_args=(-o StrictHostKeyChecking=accept-new -o ConnectTimeout=10)
  if [ -n "$EC2_KEY" ]; then
    ssh_args+=(-i "$EC2_KEY")
  fi
  ssh "${ssh_args[@]}" "${EC2_USER}@${EC2_HOST}" "$@"
}

generate_session_name() {
  echo "job-$(date +%Y%m%d-%H%M%S)"
}

# --- Commands ---

cmd_run() {
  local command="$1"
  local session
  session=$(generate_session_name)

  echo "[EC2] Starting job: $session"
  echo "[EC2] Command: $command"

  # Ensure log directory exists
  ssh_cmd "mkdir -p $EC2_LOG_DIR"

  # Run in tmux session with log capture
  ssh_cmd "tmux new-session -d -s '$session' 'cd $EC2_WORK_DIR && ($command) 2>&1 | tee $EC2_LOG_DIR/${session}.log; echo \"EXIT_CODE=\$?\" >> $EC2_LOG_DIR/${session}.log'"

  echo "[EC2] Job started in tmux session: $session"
  echo "[EC2] Log: $EC2_LOG_DIR/${session}.log"
  echo "[EC2] Monitor: cloud logs $session"
  echo "[EC2] SSH: cloud ssh"
}

cmd_ssh() {
  echo "[EC2] Connecting to ${EC2_USER}@${EC2_HOST}..."
  ssh_cmd
}

cmd_status() {
  if [ -z "$EC2_INSTANCE_ID" ]; then
    echo "[EC2] EC2_INSTANCE_ID not set. Checking SSH connectivity..."
    if ssh_cmd "echo 'OK'" 2>/dev/null; then
      echo "[EC2] Instance is reachable via SSH"
      echo "[EC2] Active tmux sessions:"
      ssh_cmd "tmux ls 2>/dev/null || echo '  (none)'"
    else
      echo "[EC2] Instance is not reachable"
    fi
  else
    echo "[EC2] Instance: $EC2_INSTANCE_ID"
    local state
    state=$(aws_cmd ec2 describe-instances \
      --instance-ids "$EC2_INSTANCE_ID" \
      --query 'Reservations[0].Instances[0].State.Name' \
      --output text 2>/dev/null || echo "unknown")
    echo "[EC2] State: $state"
    if [ "$state" = "running" ]; then
      echo "[EC2] Active tmux sessions:"
      ssh_cmd "tmux ls 2>/dev/null || echo '  (none)'"
    fi
  fi
}

cmd_start() {
  if [ -z "$EC2_INSTANCE_ID" ]; then
    echo "[ERROR] EC2_INSTANCE_ID is required for start command"
    exit 1
  fi
  echo "[EC2] Starting instance: $EC2_INSTANCE_ID"
  aws_cmd ec2 start-instances --instance-ids "$EC2_INSTANCE_ID"
  echo "[EC2] Waiting for instance to be running..."
  aws_cmd ec2 wait instance-running --instance-ids "$EC2_INSTANCE_ID"
  echo "[EC2] Instance is running"
}

cmd_stop() {
  if [ -z "$EC2_INSTANCE_ID" ]; then
    echo "[ERROR] EC2_INSTANCE_ID is required for stop command"
    exit 1
  fi
  echo "[EC2] Stopping instance: $EC2_INSTANCE_ID"
  aws_cmd ec2 stop-instances --instance-ids "$EC2_INSTANCE_ID"
  echo "[EC2] Instance stop requested"
}

cmd_logs() {
  local session="${1:-}"
  if [ -z "$session" ]; then
    echo "[EC2] Available logs:"
    ssh_cmd "ls -lt $EC2_LOG_DIR/*.log 2>/dev/null | head -20 || echo '  (no logs)'"
  else
    echo "[EC2] Log: $EC2_LOG_DIR/${session}.log"
    ssh_cmd "cat $EC2_LOG_DIR/${session}.log 2>/dev/null || echo '  Log not found: ${session}'"
  fi
}

cmd_list() {
  echo "[EC2] Active tmux sessions:"
  ssh_cmd "tmux ls 2>/dev/null || echo '  (none)'"
}

cmd_help() {
  echo "EC2 Cloud Execution CLI"
  echo ""
  echo "Commands:"
  echo "  cloud run \"<command>\"    Run command in tmux session on EC2"
  echo "  cloud ssh                SSH into EC2 instance"
  echo "  cloud status             Check instance status & active sessions"
  echo "  cloud start              Start EC2 instance (requires EC2_INSTANCE_ID)"
  echo "  cloud stop               Stop EC2 instance (requires EC2_INSTANCE_ID)"
  echo "  cloud logs [session]     View logs (latest or specific session)"
  echo "  cloud list               List active tmux sessions"
  echo "  cloud help               Show this help"
  echo ""
  echo "Configuration: scripts/cloud/.env"
  echo "  EC2_HOST, EC2_USER, EC2_KEY, EC2_WORK_DIR, EC2_LOG_DIR"
  echo "  EC2_INSTANCE_ID, EC2_REGION, AWS_PROFILE"
}

# --- Main ---

CMD="${1:-help}"
shift || true

case "$CMD" in
  run)    cmd_run "$*" ;;
  ssh)    cmd_ssh ;;
  status) cmd_status ;;
  start)  cmd_start ;;
  stop)   cmd_stop ;;
  logs)   cmd_logs "${1:-}" ;;
  list)   cmd_list ;;
  help)   cmd_help ;;
  *)
    echo "[ERROR] Unknown command: $CMD"
    cmd_help
    exit 1
    ;;
esac
