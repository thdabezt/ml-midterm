// Every drill generator must produce finite answers and valid KaTeX, for many seeds.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import katex from 'katex';
import '../src/generators.js';

const { list, helpers } = globalThis.MLGen;

function mulberry32(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function checkMath(html, where) {
  const blocks = [...html.matchAll(/\$\$([\s\S]+?)\$\$/g), ...html.replace(/\$\$[\s\S]+?\$\$/g, '').matchAll(/\$([^$\n]+?)\$/g)];
  for (const [, tex] of blocks) {
    assert.doesNotThrow(() => katex.renderToString(tex, { throwOnError: true, strict: 'ignore' }), `${where}: ${tex}`);
  }
  assert.ok(!/NaN|undefined|Infinity/.test(html), `${where}: bad value in ${html.slice(0, 200)}`);
}

test('generators produce valid problems', () => {
  assert.ok(list.length >= 12);
  const ids = new Set();
  for (const g of list) {
    assert.ok(!ids.has(g.id)); ids.add(g.id);
    for (let seed = 1; seed <= 300; seed++) {
      const p = g.make(mulberry32(seed * 7919));
      const where = `${g.id} seed ${seed}`;
      assert.ok(p.fields.length >= 1, where);
      for (const f of p.fields) {
        assert.ok(Number.isFinite(f.answer), `${where}: answer ${f.answer}`);
        assert.ok(f.tol > 0, where);
        checkMath(f.label, where);
      }
      checkMath(p.prompt, where);
      checkMath(p.solution, where);
    }
  }
});

test('helpers', () => {
  assert.equal(helpers.entropy([5, 5]), 1);
  assert.ok(Math.abs(helpers.gini([1, 5]) - 0.2778) < 1e-4);
  assert.equal(helpers.comb(25, 13), 5200300);
  assert.equal(helpers.sigmoid(0), 0.5);
});

test('clustering drills: numerical answers at the random range endpoints', () => {
  const byId = Object.fromEntries(list.map((g) => [g.id, g]));
  const cases = [
    [0, 'kmeans-epoch', [-11 / 3, 14 / 3, 28 / 3]],
    [0.999999, 'kmeans-epoch', [31 / 3, 131 / 3, 448 / 3]],
    [0, 'hac-linkage', [1, 3, 2, 4]],
    [0.999999, 'hac-linkage', [5, 12, 8.5, 72.25]],
    [0, 'dbscan-neighbourhoods', [2, 4, 1, 2]],
    [0.999999, 'dbscan-neighbourhoods', [2, 4, 1, 2]],
  ];
  for (const [randomValue, id, expected] of cases) {
    assert.equal(byId[id].lesson, 'l8-unsupervised-learning');
    const actual = byId[id].make(() => randomValue).fields.map((f) => f.answer);
    actual.forEach((answer, i) => assert.ok(Math.abs(answer - expected[i]) < 1e-9, `${id}: ${answer} vs ${expected[i]}`));
    assert.equal(actual.length, expected.length);
  }
});
