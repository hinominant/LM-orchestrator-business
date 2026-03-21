'use strict';
/**
 * design-md スキル — 構造テスト
 *
 * 検証項目:
 *   - スキルファイルの存在と frontmatter 構造
 *   - DESIGN.md 出力フォーマットの定義
 *   - Artisan SKILL.md に DESIGN.md 参照ルールが追加されているか
 *   - /frontend-design コマンドに DESIGN.md 生成ステップが含まれるか
 *   - mcp-settings.json に Figma MCP 記載例があるか
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '../..');

describe('design-md skill', () => {

  it('skill file exists at skills/design-md.md', () => {
    const skillPath = path.join(ROOT, 'skills/design-md.md');
    assert.ok(fs.existsSync(skillPath), 'skills/design-md.md should exist');
  });

  it('has correct frontmatter with name and description', () => {
    const content = fs.readFileSync(path.join(ROOT, 'skills/design-md.md'), 'utf8');
    assert.match(content, /^---\n/, 'should start with frontmatter');
    assert.match(content, /name:\s*design-md/i, 'frontmatter should have name: design-md');
    assert.match(content, /description:/, 'frontmatter should have description');
  });

  it('contains DESIGN.md output format definition', () => {
    const content = fs.readFileSync(path.join(ROOT, 'skills/design-md.md'), 'utf8');
    assert.match(content, /DESIGN\.md/, 'should reference DESIGN.md');
    assert.match(content, /color|colour|カラー/i, 'should define color tokens');
    assert.match(content, /spacing|スペーシング/i, 'should define spacing tokens');
    assert.match(content, /typography|タイポグラフィ/i, 'should define typography tokens');
  });

});

describe('Artisan DESIGN.md reference rule', () => {

  it('Artisan SKILL.md references DESIGN.md', () => {
    const content = fs.readFileSync(path.join(ROOT, 'agents/artisan/SKILL.md'), 'utf8');
    assert.match(content, /DESIGN\.md/, 'Artisan should reference DESIGN.md');
  });

});

describe('/frontend-design DESIGN.md generation step', () => {

  it('frontend-design.md includes DESIGN.md generation step', () => {
    const content = fs.readFileSync(path.join(ROOT, 'commands/frontend-design.md'), 'utf8');
    assert.match(content, /DESIGN\.md/, 'should reference DESIGN.md generation');
  });

});

describe('mcp-settings.json Figma MCP example', () => {

  it('mcp-settings.json includes Figma MCP configuration example', () => {
    const content = fs.readFileSync(path.join(ROOT, '_templates/mcp-settings.json'), 'utf8');
    assert.match(content, /figma/i, 'should include Figma MCP example');
  });

});
