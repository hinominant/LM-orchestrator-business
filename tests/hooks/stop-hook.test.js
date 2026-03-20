'use strict';
/**
 * stop-hook.js — Stop Hook 包括テスト
 *
 * カバレッジ目標:
 *   - 正常系: セッションサマリ書き込み + { continue: true } 出力
 *   - RESUME_CONTEXT.md 生成確認（コンテキスト圧縮対応）
 *   - RESUME_CONTEXT.md の内容: データ保護ルール4項目 + Context Recovery 手順
 *   - セッションログが存在しない場合も { continue: true }
 *   - JSON パースエラー → { continue: true }（可用性保証）
 */

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const HOOK = path.join(__dirname, '../../_templates/hooks/stop-hook.js');

let tmpDir;

before(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'goto-test-stop-'));
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

/** ツールログを事前に書き込む */
function seedToolLog(dir, sessionId, entries) {
  const contextDir = path.join(dir, '.context');
  if (!fs.existsSync(contextDir)) fs.mkdirSync(contextDir, { recursive: true });
  const logFile = path.join(contextDir, 'tool-log.jsonl');
  const lines = entries.map(e => JSON.stringify({ session_id: sessionId, ...e }));
  fs.writeFileSync(logFile, lines.join('\n') + '\n', 'utf8');
}

// ============================================================
// 正常系
// ============================================================

describe('normal operation', () => {

  it('outputs { continue: true }', () => {
    const out = runHook({ session_id: 'test-stop-001', stop_reason: 'end_turn' });
    assert.deepEqual(out, { continue: true });
  });

  it('works when no tool log exists', () => {
    const freshDir = fs.mkdtempSync(path.join(os.tmpdir(), 'goto-test-no-log-'));
    try {
      const out = runHook({ session_id: 'no-log-session', stop_reason: 'end_turn' }, freshDir);
      assert.deepEqual(out, { continue: true });
    } finally {
      fs.rmSync(freshDir, { recursive: true, force: true });
    }
  });

  it('writes session summary to .context/sessions/', () => {
    const sessionId = `stop-summary-${Date.now()}`;
    seedToolLog(tmpDir, sessionId, [
      { tool: 'Read', input_summary: 'src/index.ts', success: true },
      { tool: 'Edit', input_summary: 'src/index.ts', success: true },
      { tool: 'Bash', input_summary: 'npm test', success: true },
    ]);
    runHook({ session_id: sessionId, stop_reason: 'end_turn' });
    const today = new Date().toISOString().split('T')[0];
    const summaryFile = path.join(tmpDir, '.context', 'sessions', `${today}.jsonl`);
    assert.ok(fs.existsSync(summaryFile), 'session summary file should be written');
    const entries = fs.readFileSync(summaryFile, 'utf8').trim().split('\n').map(l => JSON.parse(l));
    const summary = entries.find(e => e.session_id === sessionId);
    assert.ok(summary, 'summary for session should exist');
    assert.equal(summary.tool_count, 3);
  });

  it('records tools_used as unique set', () => {
    const sessionId = `stop-tools-${Date.now()}`;
    seedToolLog(tmpDir, sessionId, [
      { tool: 'Read', input_summary: 'a.ts', success: true },
      { tool: 'Read', input_summary: 'b.ts', success: true },
      { tool: 'Edit', input_summary: 'a.ts', success: true },
    ]);
    runHook({ session_id: sessionId, stop_reason: 'end_turn' });
    const today = new Date().toISOString().split('T')[0];
    const summaryFile = path.join(tmpDir, '.context', 'sessions', `${today}.jsonl`);
    const entries = fs.readFileSync(summaryFile, 'utf8').trim().split('\n').map(l => JSON.parse(l));
    const summary = entries.find(e => e.session_id === sessionId);
    assert.deepEqual(summary.tools_used.sort(), ['Edit', 'Read']);
  });

  it('counts errors in session', () => {
    const sessionId = `stop-errors-${Date.now()}`;
    seedToolLog(tmpDir, sessionId, [
      { tool: 'Bash', input_summary: 'npm test', success: false },
      { tool: 'Bash', input_summary: 'npm test', success: true },
    ]);
    runHook({ session_id: sessionId, stop_reason: 'end_turn' });
    const today = new Date().toISOString().split('T')[0];
    const summaryFile = path.join(tmpDir, '.context', 'sessions', `${today}.jsonl`);
    const entries = fs.readFileSync(summaryFile, 'utf8').trim().split('\n').map(l => JSON.parse(l));
    const summary = entries.find(e => e.session_id === sessionId);
    assert.equal(summary.errors, 1);
  });

});

// ============================================================
// RESUME_CONTEXT.md — コンテキスト圧縮対応ファイル
// ============================================================

describe('RESUME_CONTEXT.md generation', () => {

  it('creates .claude/RESUME_CONTEXT.md', () => {
    const sessionId = `resume-${Date.now()}`;
    runHook({ session_id: sessionId, stop_reason: 'end_turn' });
    const resumeFile = path.join(tmpDir, '.claude', 'RESUME_CONTEXT.md');
    assert.ok(fs.existsSync(resumeFile), 'RESUME_CONTEXT.md must be created by stop hook');
  });

  it('RESUME_CONTEXT.md contains session end timestamp', () => {
    const sessionId = `resume-ts-${Date.now()}`;
    runHook({ session_id: sessionId, stop_reason: 'end_turn' });
    const content = fs.readFileSync(path.join(tmpDir, '.claude', 'RESUME_CONTEXT.md'), 'utf8');
    assert.match(content, /Session ended:/, 'must contain session end timestamp');
  });

  it('RESUME_CONTEXT.md contains data protection rule: 入力禁止', () => {
    const sessionId = `resume-rule1-${Date.now()}`;
    runHook({ session_id: sessionId, stop_reason: 'end_turn' });
    const content = fs.readFileSync(path.join(tmpDir, '.claude', 'RESUME_CONTEXT.md'), 'utf8');
    assert.match(content, /入力禁止/, 'must contain input prohibition rule');
  });

  it('RESUME_CONTEXT.md contains data protection rule: 本番DB禁止', () => {
    const sessionId = `resume-rule2-${Date.now()}`;
    runHook({ session_id: sessionId, stop_reason: 'end_turn' });
    const content = fs.readFileSync(path.join(tmpDir, '.claude', 'RESUME_CONTEXT.md'), 'utf8');
    assert.match(content, /本番DB禁止/, 'must contain production DB prohibition');
  });

  it('RESUME_CONTEXT.md contains data protection rule: シークレット禁止', () => {
    const sessionId = `resume-rule4-${Date.now()}`;
    runHook({ session_id: sessionId, stop_reason: 'end_turn' });
    const content = fs.readFileSync(path.join(tmpDir, '.claude', 'RESUME_CONTEXT.md'), 'utf8');
    assert.match(content, /シークレット禁止/, 'must contain secret prohibition');
  });

  it('RESUME_CONTEXT.md contains reference to DATA_PROTECTION.md', () => {
    const sessionId = `resume-ref-${Date.now()}`;
    runHook({ session_id: sessionId, stop_reason: 'end_turn' });
    const content = fs.readFileSync(path.join(tmpDir, '.claude', 'RESUME_CONTEXT.md'), 'utf8');
    assert.match(content, /DATA_PROTECTION\.md/, 'must reference DATA_PROTECTION.md');
  });

  it('RESUME_CONTEXT.md contains Context Recovery steps', () => {
    const sessionId = `resume-steps-${Date.now()}`;
    runHook({ session_id: sessionId, stop_reason: 'end_turn' });
    const content = fs.readFileSync(path.join(tmpDir, '.claude', 'RESUME_CONTEXT.md'), 'utf8');
    assert.match(content, /Context Recovery/, 'must contain context recovery instructions');
  });

  it('RESUME_CONTEXT.md is overwritten on each session end (not appended)', () => {
    const session1 = `resume-ow-1-${Date.now()}`;
    runHook({ session_id: session1, stop_reason: 'end_turn' });
    const content1 = fs.readFileSync(path.join(tmpDir, '.claude', 'RESUME_CONTEXT.md'), 'utf8');
    const session2 = `resume-ow-2-${Date.now()}`;
    runHook({ session_id: session2, stop_reason: 'end_turn' });
    const content2 = fs.readFileSync(path.join(tmpDir, '.claude', 'RESUME_CONTEXT.md'), 'utf8');
    // content2 should be a fresh write, not content1 + content2
    assert.ok(!content2.includes(session1), 'RESUME_CONTEXT.md should be overwritten, not appended');
  });

  it('creates .claude/ directory if missing', () => {
    const freshDir = fs.mkdtempSync(path.join(os.tmpdir(), 'goto-test-noclaudedir-'));
    try {
      assert.ok(!fs.existsSync(path.join(freshDir, '.claude')));
      runHook({ session_id: 'fresh', stop_reason: 'end_turn' }, freshDir);
      assert.ok(fs.existsSync(path.join(freshDir, '.claude', 'RESUME_CONTEXT.md')));
    } finally {
      fs.rmSync(freshDir, { recursive: true, force: true });
    }
  });

});

// ============================================================
// エラー耐性
// ============================================================

describe('resilience', () => {

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

  it('returns { continue: true } on corrupt log file', () => {
    const corruptDir = fs.mkdtempSync(path.join(os.tmpdir(), 'goto-test-corrupt-'));
    try {
      const contextDir = path.join(corruptDir, '.context');
      fs.mkdirSync(contextDir);
      fs.writeFileSync(path.join(contextDir, 'tool-log.jsonl'), '{ corrupt }\nnot json\n');
      const out = runHook({ session_id: 'corrupt-test', stop_reason: 'end_turn' }, corruptDir);
      assert.deepEqual(out, { continue: true });
    } finally {
      fs.rmSync(corruptDir, { recursive: true, force: true });
    }
  });

});
