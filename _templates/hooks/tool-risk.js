#!/usr/bin/env node
'use strict';

/**
 * Claude Code PreToolUse Hook - Tool Risk Classification + ARIS NO Gate
 *
 * 3-Hook体制の PreToolUse フック。
 * - ARIS NO Gate パターン検知 → 自動ブロック
 * - HIGH/MEDIUM リスク → 確認ダイアログ表示
 * - LOW リスク → サイレント通過
 * - additionalContext でファイルオーナーシップ情報を注入
 *
 * Install: ~/.claude/hooks/tool-risk.js
 * Settings: ~/.claude/settings.json の hooks.PreToolUse に登録
 */

// === ARIS NO Gate Patterns (auto-block) ===

const NO_GATE_PATTERNS = [
  {
    // ユーザー安全性: 認証情報の外部送信
    test: (cmd) =>
      /curl.*(-d|--data)/.test(cmd) &&
      /(password|secret|token|api_key|credential)/i.test(cmd),
    reason: 'NO Gate: 認証情報の外部送信リスク',
  },
  {
    // 破壊的操作: ルートや home の rm -rf, DROP DATABASE, force push to main
    test: (cmd) =>
      /(rm\s+-rf\s+[\/~]|DROP\s+(TABLE|DATABASE)|git\s+push\s+.*--force\s+.*main)/i.test(cmd),
    reason: 'NO Gate: 破壊的操作の検出',
  },
  {
    // コスト制御不能: 無制限ループ
    test: (cmd) =>
      /(while\s+true|for\s+.*in\s+\$\(seq\s+\d{4,})/i.test(cmd),
    reason: 'NO Gate: 無制限ループによるコスト制御不能リスク',
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

    // 1. ARIS NO Gate check (auto-block)
    for (const pattern of NO_GATE_PATTERNS) {
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
      // ARIS NO Gate: auto-block
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
