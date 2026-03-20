#!/usr/bin/env node
'use strict';

/**
 * Claude Code PreToolUse Hook - Tool Risk Classification + Safety Gate
 *
 * 3-Hook体制の PreToolUse フック。
 * - Safety Gate パターン検知 → 自動ブロック
 * - HIGH/MEDIUM リスク → 確認ダイアログ表示
 * - LOW リスク → サイレント通過
 * - additionalContext でファイルオーナーシップ情報を注入
 *
 * Install: ~/.claude/hooks/tool-risk.js
 * Settings: ~/.claude/settings.json の hooks.PreToolUse に登録
 */

// === Safety Gate Patterns (auto-block) ===

const SAFETY_GATE_PATTERNS = [
  {
    // ユーザー安全性: 認証情報の外部送信
    test: (cmd) =>
      /curl.*(-d|--data)/.test(cmd) &&
      /(password|secret|token|api_key|credential)/i.test(cmd),
    reason: 'Safety Gate: 認証情報の外部送信リスク',
  },
  {
    // 破壊的操作: ルートや home の rm -rf, DROP DATABASE, force push to main
    test: (cmd) =>
      /(rm\s+-rf\s+[\/~]|DROP\s+(TABLE|DATABASE)|git\s+push\s+.*--force\s+.*main)/i.test(cmd),
    reason: 'Safety Gate: 破壊的操作の検出',
  },
  {
    // コスト制御不能: 無制限ループ
    test: (cmd) =>
      /(while\s+true|for\s+.*in\s+\$\(seq\s+\d{4,})/i.test(cmd),
    reason: 'Safety Gate: 無制限ループによるコスト制御不能リスク',
  },
  {
    // シークレット漏洩: echo/printでシークレットをstdoutに出力
    test: (cmd) =>
      /(echo|printf|cat)\s+.*\$\{?([\w]*(?:SECRET|TOKEN|KEY|PASSWORD|API_KEY|PRIVATE)[\w]*)\}?/i.test(cmd),
    reason: 'Safety Gate: シークレットのstdout出力リスク',
  },
  {
    // シークレット漏洩: .envファイルをgit addしようとする
    test: (cmd) =>
      /git\s+add\s+.*\.env(?:\s|$)/i.test(cmd),
    reason: 'Safety Gate: .envファイルのコミットリスク — シークレット漏洩の危険',
  },
  {
    // ANTHROPIC_BASE_URL 書き換えによる API キー外部送信（CVE-2026-21852）
    test: (cmd) =>
      /ANTHROPIC_BASE_URL\s*=/.test(cmd),
    reason: 'Safety Gate: ANTHROPIC_BASE_URL の変更はAPIキー窃取リスク（CVE-2026-21852）',
  },
  {
    // python3/node 経由のネットワーク通信バイパス
    test: (cmd) =>
      /python3\s+-c\s+['"].*(?:urllib|requests|http|socket)/.test(cmd) ||
      /node\s+-e\s+['"].*(?:https?|fetch|axios|net\.Socket)/.test(cmd),
    reason: 'Safety Gate: python3/node経由のネットワーク通信バイパス試行を検出',
  },
  {
    // osascript / security コマンドによるキーチェーンアクセス（macOS）
    test: (cmd) =>
      /^(osascript|security\s+(find|add|delete|import|export))/.test(cmd.trim()),
    reason: 'Safety Gate: macOSキーチェーン・GUI操作へのアクセス試行',
  },
  {
    // 生ソケット通信（nc/ncat/telnet）
    test: (cmd) =>
      /^(nc|ncat|netcat|telnet)\s/.test(cmd.trim()),
    reason: 'Safety Gate: 生ソケット通信による外部接続試行',
  },
  {
    // print/console.log/puts でシークレット変数を stdout に出力（強化版）
    test: (cmd) =>
      /(?:print|console\.log|console\.error|puts|echo|printf)\s*.*\$\{?(?:[A-Z_]*(?:SECRET|TOKEN|KEY|PASSWORD|API_KEY|PRIVATE|CREDENTIAL)[A-Z_]*)\}?/i.test(cmd) ||
      /dotenv.*values|load_dotenv|require\s*\(?\s*['"]dotenv['"]/.test(cmd) && /print|console\.log/.test(cmd),
    reason: 'Safety Gate: シークレット変数のstdout出力リスク（CI/CDログ漏洩の危険）',
  },
];

// === Risk Classification Patterns ===

const HIGH_RISK_PATTERNS = [
  /rm\s+.*(-[a-zA-Z]*f|-[a-zA-Z]*r|--force|--recursive)/,
  /git\s+push\s+.*--force/,
  /git\s+push\s+.*-f\b/,
  /git\s+reset\s+--hard/,
  /git\s+clean\s+-[a-zA-Z]*f/,
  /git\s+branch\s+-D/,
  /DROP\s+(TABLE|DATABASE|INDEX)/i,
  /DELETE\s+FROM/i,
  /TRUNCATE\s+TABLE/i,
  /docker\s+(rm|rmi)\s+-f/,
  /kill\s+-9/,
  /chmod\s+777/,
  /mkfs\b/,
  /dd\s+if=/,
  /shutdown/,
  /reboot/,
  />\s*\/dev\/sd/,
  // Secret exposure: hardcoded secrets in commands
  /(?:curl|wget|http).*(?:Bearer|Basic)\s+[A-Za-z0-9_\-\.]{20,}/i,
  /ANTHROPIC_BASE_URL/,
  /enableAllProjectMcpServers/,
  /curl\s+.*-[bBdD]/,  // curl with data flags
  /wget\s+.*--post/i,
];

const MEDIUM_RISK_PATTERNS = [
  /git\s+push/,
  /git\s+commit/,
  /git\s+merge/,
  /git\s+rebase/,
  /git\s+checkout\s+\./,
  /git\s+restore\s+\./,
  /npm\s+publish/,
  /npm\s+install\s+-g/,
  /pip\s+install/,
  /docker\s+(build|run|compose)/,
  /curl\s+.*-X\s*(POST|PUT|DELETE|PATCH)/i,
  /ssh\s/,
  /scp\s/,
  /rsync\s/,
  /brew\s+(install|uninstall)/,
  /apt(-get)?\s+(install|remove)/,
];

const LOW_TOOL_NAMES = new Set([
  'Read', 'Glob', 'Grep', 'WebFetch', 'WebSearch',
  'TaskList', 'TaskGet',
]);

/**
 * ツール名と入力からリスクレベルを判定する
 * @param {string} toolName - ツール名
 * @param {object} toolInput - ツール入力
 * @returns {{ level: string, reason: string, additionalContext?: string }}
 */
function classifyRisk(toolName, toolInput) {
  // Read-only tools are always LOW
  if (LOW_TOOL_NAMES.has(toolName)) {
    return { level: 'LOW', reason: '' };
  }

  // Bash command classification
  if (toolName === 'Bash' && toolInput.command) {
    const cmd = toolInput.command;

    // 1. Safety Gate check (auto-block)
    for (const pattern of SAFETY_GATE_PATTERNS) {
      try {
        if (pattern.test(cmd)) {
          return { level: 'BLOCK', reason: pattern.reason };
        }
      } catch (_e) {
        // Pattern evaluation error, skip
      }
    }

    // 2. HIGH risk check
    for (const pattern of HIGH_RISK_PATTERNS) {
      if (pattern.test(cmd)) {
        return {
          level: 'HIGH',
          reason: '破壊的・不可逆な操作: ' + cmd.substring(0, 80),
        };
      }
    }

    // 3. MEDIUM risk check
    for (const pattern of MEDIUM_RISK_PATTERNS) {
      if (pattern.test(cmd)) {
        return {
          level: 'MEDIUM',
          reason: '外部影響・副作用のある操作: ' + cmd.substring(0, 80),
        };
      }
    }

    return { level: 'LOW', reason: '' };
  }

  // Write/Edit tools - MEDIUM + file ownership context injection
  if (['Write', 'Edit', 'NotebookEdit'].includes(toolName)) {
    const filePath = toolInput.file_path || toolInput.notebook_path || '';
    return {
      level: 'MEDIUM',
      reason: 'ファイル変更: ' + filePath,
      additionalContext: filePath
        ? `Editing ${filePath}. Ensure file ownership rules are respected per _common/PARALLEL.md.`
        : undefined,
    };
  }

  // Default: LOW
  return { level: 'LOW', reason: '' };
}

// Main
let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const toolName = data.tool_name || '';
    const toolInput = data.tool_input || {};

    const { level, reason, additionalContext } = classifyRisk(toolName, toolInput);

    if (level === 'BLOCK') {
      // Safety Gate: auto-block
      process.stdout.write(JSON.stringify({
        decision: 'block',
        reason: reason,
      }));
    } else if (level === 'LOW') {
      // Silent pass-through
      const result = { decision: 'approve' };
      if (additionalContext) result.additionalContext = additionalContext;
      process.stdout.write(JSON.stringify(result));
    } else {
      // MEDIUM / HIGH: ask user
      const indicator = level === 'HIGH' ? '🔴' : '🟡';
      const result = {
        decision: 'ask_user',
        reason: indicator + ' ' + level + ' RISK: ' + reason,
      };
      if (additionalContext) result.additionalContext = additionalContext;
      process.stdout.write(JSON.stringify(result));
    }
  } catch (_e) {
    // Parse error -> approve to avoid blocking
    process.stdout.write(JSON.stringify({ decision: 'approve' }));
  }
});
