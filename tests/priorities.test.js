import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { FORMULA_PRIORITIES, PRIORITY_LEVELS, md, renderTheory } from '../tools/render.mjs';

const theoryDir = new URL('../content/theory/', import.meta.url);
const sources = readdirSync(theoryDir).filter((file) => file.endsWith('.md')).map((file) => [file, readFileSync(new URL(file, theoryDir), 'utf8')]);
const homework = new Map();
for (const file of readdirSync(new URL('../content/practice/', import.meta.url)).filter((f) => f.endsWith('.js'))) {
  const { default: bank } = await import(new URL(`../content/practice/${file}`, import.meta.url));
  for (const question of bank.questions) if (question.source.kind === 'hw') homework.set(question.id, question);
}

test('every named formula and formula-sheet row has a valid priority', () => {
  const referenced = new Set();
  let blocks = 0;
  for (const [file, source] of sources) {
    for (const line of source.split(/\r?\n/).filter((l) => l.startsWith(':::formula'))) {
      const match = line.match(/^:::formula @([a-z][a-z0-9-]*)(?:\s|$)/);
      assert.ok(match, `${file}: missing priority key: ${line}`);
      assert.ok(FORMULA_PRIORITIES[match[1]], `${file}: unknown key ${match[1]}`);
      referenced.add(match[1]); blocks++;
    }
    for (const [, key] of source.matchAll(/\{\{priority:([a-z][a-z0-9-]*)\}\}/g)) {
      assert.ok(FORMULA_PRIORITIES[key], `${file}: unknown reference ${key}`);
      referenced.add(key);
    }
    if (file === '99-formula-sheet.md') {
      for (const row of source.split(/\r?\n/).filter((l) => l.startsWith('| ') && l.includes('$'))) {
        assert.match(row, /\{\{priority:[a-z][a-z0-9-]*\}\}/, `ungraded reference row: ${row}`);
      }
    }
  }
  assert.ok(blocks >= 70, 'formula coverage unexpectedly reduced');
  assert.deepEqual(new Set(Object.keys(FORMULA_PRIORITIES)), referenced, 'catalog and content references differ');
});

test('homework grades cite actual exercises and P3 has no homework evidence', () => {
  const grades = new Set();
  for (const [key, entry] of Object.entries(FORMULA_PRIORITIES)) {
    grades.add(entry.grade);
    assert.ok(Object.hasOwn(PRIORITY_LEVELS, entry.grade), `${key}: invalid grade`);
    assert.ok(typeof entry.reason === 'string' && entry.reason.trim().length > 10, `${key}: missing reason`);
    assert.ok(Array.isArray(entry.homework), `${key}: missing homework evidence`);
    assert.equal(new Set(entry.homework).size, entry.homework.length, `${key}: duplicate homework evidence`);
    if (entry.grade === 'P3') assert.equal(entry.homework.length, 0, `${key}: P3 cannot cite homework use`);
    else assert.ok(entry.homework.length > 0, `${key}: homework use needs evidence`);
    for (const id of entry.homework) assert.ok(homework.has(id), `${key}: ${id} is not an original homework exercise`);
  }
  assert.deepEqual(grades, new Set(['P1', 'P2', 'P3']));
});

test('lesson badges and reference badges use the same grade and retain rendered maths', () => {
  const key = Object.keys(FORMULA_PRIORITIES)[0];
  const grade = FORMULA_PRIORITIES[key].grade;
  const lesson = renderTheory(`:::formula @${key} Test formula\n$$x^2 + 1$$\n:::`);
  const sheet = md(`| Priority | Formula |\n|---|---|\n| {{priority:${key}}} | $x^2+1$ |`);
  for (const html of [lesson, sheet]) {
    assert.ok(html.includes(`data-formula="${key}"`));
    assert.ok(html.includes(`data-priority="${grade}"`));
    assert.ok(html.includes('class="katex"'));
    assert.ok(!html.includes('{{priority:'));
  }
  assert.match(lesson, /formula-priority-reason/);
  assert.match(sheet, /<table>/);
  assert.match(sheet, /<button type="button"/);
  assert.match(sheet, /data-priority-toggle aria-expanded="false"/);
  assert.match(sheet, /class="priority-reference-reason" hidden/);
});

test('missing, unknown and malformed formula priorities fail rendering', () => {
  assert.throws(() => renderTheory(':::formula Ungraded\n$x$\n:::'), /needs a priority key/);
  assert.throws(() => renderTheory(':::formula @not-a-real-formula Test\n$x$\n:::'), /Unknown or invalid/);
  assert.throws(() => md('{{priority:not-a-real-formula}}'), /Unknown or invalid/);
  assert.throws(() => md('{{priority:UPPERCASE}}'), /Malformed formula priority/);
});
