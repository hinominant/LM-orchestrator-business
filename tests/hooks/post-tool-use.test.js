'use strict';
/**
 * post-tool-use.js — PostToolUse Hook 包括テスト
 *
 * カバレッジ目標:
 *   - 正常系: ログエントリ書き込み + { continue: true } 出力
 *   - J-SOX フィールド確認: operator, project, timestamp, session_id, tool, success
 *   - MED-7 回帰テスト: ログ書き込み失敗でも { continue: true } を返す
 *   - 各ツール種別の input_summary 要約確認
 *   - JSON パースエラー → { continue: true }（可用性保証）
 */

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const HOOK = path.join(__dirname, '../../_templates/hooks/post-tool-use.js');

let tmpDir;

before(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'goto-test-post-'));
});

after(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function runHook(input, cwd = tmpDir) {
  const result = spawnSync('node', [HOOK], {
    input: JSON.stringify(input),
    encoding: 'utf8',
    timeout: 5000,
    cwd,
  });
  assert.equal(result.status, 0, `hook exited ${result.status}: ${result.stderr}`);
  assert.ok(result.stdout, 'hook produced no stdout');
  return JSON.parse(result.stdout);
}

function readLogEntries(dir = tmpDir) {
  const logFile = path.join(dir, '.context', 'tool-log.jsonl');
  if (!fs.existsSync(logFile)) return [];
  return fs.readFileSync(logFile, 'utf8')
    .trim()
    .split('\n')
    .filter(Boolean)
    .map(line => JSON.parse(line));
}

// ============================================================
// 正常系: stdout + ログエントリ
// ============================================================

describe('normal operation', () => {

  it('outputs { continue: true }', () => {
    const out = runHook({
      tool_name: 'Read',
      tool_input: { file_path: 'src/index.ts' },
      tool_output: { content: 'hello' },
      session_id: 'test-session-001',
    });
    assert.deepEqual(out, { continue: true });
  });

  it('writes log entry to .context/tool-log.jsonl', () => {
    const sessionId = `session-${Date.now()}`;
    runHook({
      tool_name: 'Edit',
      tool_input: { file_path: 'src/billing/invoice.ts' },
      tool_output: {},
      session_id: sessionId,
    });
    const entries = readLogEntries();
    const entry = entries.find(e => e.session_id === sessionId);
    assert.ok(entry, 'log entry should be written');
    assert.equal(entry.tool, 'Edit');
  });

  it('creates .context/ directory if missing', () => {
    const freshDir = fs.mkdtempSync(path.join(os.tmpdir(), 'goto-test-fresh-'));
    try {
      runHook({ tool_name: 'Bash', tool_input: { command: 'git status' }, session_id: 'test' }, freshDir);
      assert.ok(fs.existsSync(path.join(freshDir, '.context', 'tool-log.jsonl')));
    } finally {
      fs.rmSync(freshDir, { recursive: true, force: true });
    }
  });

});

// ============================================================
// J-SOX 監査フィールド確認
// ============================================================

describe('J-SOX audit trail fields', () => {

  it('log entry has timestamp in ISO 8601 format', () => {
    const sessionId = `jsox-${Date.now()}`;
    runHook({ tool_name: 'Read', tool_input: { file_path: 'src/index.ts' }, session_id: sessionId });
    const entries = readLogEntries();
    const entry = entries.find(e => e.session_id === sessionId);
    assert.ok(entry?.timestamp, 'timestamp is required for J-SOX');
    assert.ok(!isNaN(Date.parse(entry.timestamp)), 'timestamp must be valid ISO 8601');
  });

  it('log entry has session_id', () => {
    const sessionId = `jsox-session-${Date.now()}`;
    runHook({ tool_name: 'Bash', tool_input: { command: 'git status' }, session_id: sessionId });
    const entries = readLogEntries();
    const entry = entries.find(e => e.session_id === sessionId);
    assert.equal(entry?.session_id, sessionId);
  });

  it('log entry has operator field (J-SOX: who acted)', () => {
    const sessionId = `jsox-op-${Date.now()}`;
    runHook({ tool_name: 'Write', tool_input: { file_path: 'src/new.ts' }, session_id: sessionId });
    const entries = readLogEntries();
    const entry = entries.find(e => e.session_id === sessionId);
    assert.ok(entry?.operator, 'operator is required for J-SOX audit (who acted)');
    assert.notEqual(entry.operator, '', 'operator must not be empty string');
  });

  it('log entry has project field (J-SOX: which project)', () => {
    const sessionId = `jsox-proj-${Date.now()}`;
    runHook({ tool_name: 'Edit', tool_input: { file_path: 'src/edit.ts' }, session_id: sessionId });
    const entries = readLogEntries();
    const entry = entries.find(e => e.session_id === sessionId);
    assert.ok(entry?.project !== undefined, 'project is required for J-SOX audit');
  });

  it('log entry has tool name', () => {
    const sessionId = `jsox-tool-${Date.now()}`;
    runHook({ tool_name: 'Grep', tool_input: { pattern: 'TODO' }, session_id: sessionId });
    const entries = readLogEntries();
    const entry = entries.find(e => e.session_id === sessionId);
    assert.equal(entry?.tool, 'Grep');
  });

  it('log entry has success: true on successful tool output', () => {
    const sessionId = `jsox-ok-${Date.now()}`;
    runHook({ tool_name: 'Read', tool_input: {}, tool_output: { content: 'data' }, session_id: sessionId });
    const entries = readLogEntries();
    const entry = entries.find(e => e.session_id === sessionId);
    assert.equal(entry?.success, true);
  });

  it('log entry has success: false on error output', () => {
    const sessionId = `jsox-err-${Date.now()}`;
    runHook({ tool_name: 'Read', tool_input: {}, tool_output: { error: 'File not found' }, session_id: sessionId });
    const entries = readLogEntries();
    const entry = entries.find(e => e.session_id === sessionId);
    assert.equal(entry?.success, false);
  });

});

// ============================================================
// input_summary の要約確認
// ============================================================

describe('input_summary truncation', () => {

  it('summarizes Read tool as file_path', () => {
    const sessionId = `summary-read-${Date.now()}`;
    runHook({ tool_name: 'Read', tool_input: { file_path: 'src/billing/invoice.ts' }, session_id: sessionId });
    const entries = readLogEntries();
    const entry = entries.find(e => e.session_id === sessionId);
    assert.equal(entry?.input_summary, 'src/billing/invoice.ts');
  });

  it('summarizes Bash tool as command (max 100 chars)', () => {
    const sessionId = `summary-bash-${Date.now()}`;
    const longCmd = 'git log --oneline --graph --decorate --all ' + 'x'.repeat(200);
    runHook({ tool_name: 'Bash', tool_input: { command: longCmd }, session_id: sessionId });
    const entries = readLogEntries();
    const entry = entries.find(e => e.session_id === sessionId);
    assert.ok(entry?.input_summary.length <= 100, 'Bash summary must be truncated to 100 chars');
  });

  it('summarizes Grep tool as pattern', () => {
    const sessionId = `summary-grep-${Date.now()}`;
    runHook({ tool_name: 'Grep', tool_input: { pattern: 'TODO.*fixme' }, session_id: sessionId });
    const entries = readLogEntries();
    const entry = entries.find(e => e.session_id === sessionId);
    assert.equal(entry?.input_summary, 'TODO.*fixme');
  });

  it('handles unknown tool with JSON summary', () => {
    const sessionId = `summary-unknown-${Date.now()}`;
    runHook({ tool_name: 'CustomTool', tool_input: { param: 'value' }, session_id: sessionId });
    const entries = readLogEntries();
    const entry = entries.find(e => e.session_id === sessionId);
    assert.ok(typeof entry?.input_summary === 'string');
  });

});

// ============================================================
// MED-7 回帰テスト: ログ書き込み失敗でも { continue: true }
// ============================================================

describe('crash resilience — MED-7 regression', () => {

  it('returns { continue: true } even when .context is read-only', () => {
    const readonlyDir = fs.mkdtempSync(path.join(os.tmpdir(), 'goto-test-ro-'));
    try {
      // .context ディレクトリを作成してから読み取り専用に設定
      const contextDir = path.join(readonlyDir, '.context');
      fs.mkdirSync(contextDir);
      fs.chmodSync(contextDir, 0o444); // read-only

      const result = spawnSync('node', [HOOK], {
        input: JSON.stringify({ tool_name: 'Read', tool_input: {}, session_id: 'readonly-test' }),
        encoding: 'utf8',
        timeout: 5000,
        cwd: readonlyDir,
      });
      const out = JSON.parse(result.stdout);
      assert.deepEqual(out, { continue: true }, 'must return continue:true even on log write failure');
    } finally {
      // クリーンアップ: chmod を戻してから削除
      try { fs.chmodSync(path.join(readonlyDir, '.context'), 0o755); } catch (_) {}
      fs.rmSync(readonlyDir, { recursive: true, force: true });
    }
  });

  it('returns { continue: true } on null tool_input', () => {
    const out = runHook({ tool_name: 'Read', tool_input: null, session_id: 'null-input-test' });
    assert.deepEqual(out, { continue: true });
  });

});

// ============================================================
// エラー耐性 — JSON パースエラー → { continue: true }
// ============================================================

describe('resilience — parse error falls back to continue', () => {

  it('returns { continue: true } on malformed JSON', () => {
    const result = spawnSync('node', [HOOK], {
      input: '{ bad json :::',
      encoding: 'utf8',
      timeout: 5000,
      cwd: tmpDir,
    });
    const out = JSON.parse(result.stdout);
    assert.deepEqual(out, { continue: true });
  });

  it('returns { continue: true } on empty input', () => {
    const result = spawnSync('node', [HOOK], {
      input: '',
      encoding: 'utf8',
      timeout: 5000,
      cwd: tmpDir,
    });
    const out = JSON.parse(result.stdout);
    assert.deepEqual(out, { continue: true });
  });

  it('returns { continue: true } on missing session_id', () => {
    const out = runHook({ tool_name: 'Bash', tool_input: { command: 'pwd' } });
    assert.deepEqual(out, { continue: true });
    const entries = readLogEntries();
    const entry = entries.find(e => e.session_id === 'unknown');
    assert.ok(entry, 'missing session_id should fallback to "unknown"');
  });

});
