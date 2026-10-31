// Recompute L8 calculation answers from the input data, independently of the
// explanatory solutions. These checks also lock the slide exercise conventions.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import bank from '../content/practice/l8-unsupervised-learning.js';
import { loadTheory, loadQuestions } from '../tools/build.mjs';

const byId = Object.fromEntries(bank.questions.map((q) => [q.id, q]));
const check = (id, expected) => {
  const fields = byId[id].fields;
  assert.equal(fields.length, expected.length, id);
  expected.forEach((value, i) => assert.ok(Math.abs(fields[i].answer - value) < 1e-10, `${id} field ${i}: ${fields[i].answer} vs ${value}`));
};
const mean = (xs) => xs.reduce((s, x) => s + x, 0) / xs.length;
const l1 = (a, b) => a.reduce((s, x, j) => s + Math.abs(x - b[j]), 0);
const squared = (a, b) => a.reduce((s, x, j) => s + (x - b[j]) ** 2, 0);
const points = [[1, 1], [0, 1], [0, 6], [3, 6], [2, 1], [1, 2], [5, 2], [4, 5], [3, 4], [3, 5], [2, 4], [2, 6]];
const names = 'ABCDEFGHIJKL';

test('L8 bank renders with valid math and covers the lecture topics', async () => {
  const slugs = [...new Set([...loadTheory().map((l) => l.slug), bank.lesson])];
  const rendered = (await loadQuestions(slugs)).filter((q) => q.lesson === bank.lesson);
  assert.ok(rendered.length >= 12);
  assert.ok(rendered.filter((q) => q.type === 'mcq').length >= 12);
  for (const id of ['l8-quiz-p26', 'l8-quiz-p51', 'l8-linkage-v1', 'l8-silhouette-v1', 'l8-db-index-v1', 'l8-dunn-v1']) assert.ok(byId[id], id);
});

test('distances, one K-means step, K-means++ probabilities and operation counts', () => {
  const x = [1, 2]; const z = [4, 6];
  check('l8-distance-v1', [l1(x, z), Math.sqrt(squared(x, z)), squared(x, z)]);
  const input = [0, 2, 8, 10]; const initial = [0, 8];
  const groups = initial.map((_, c) => input.filter((p) => Math.abs(p - initial[c]) < Math.abs(p - initial[1 - c])));
  const centers = groups.map(mean);
  check('l8-kmeans-small-v1', [...centers, groups.reduce((s, group, i) => s + group.reduce((v, p) => v + (p - centers[i]) ** 2, 0), 0)]);
  const weights = [1, 3, 4].map((p) => p ** 2); const total = weights.reduce((s, v) => s + v, 0);
  check('l8-kmeanspp-v1', weights.map((w) => w / total));
  check('l8-complexity-v1', [200 * 3 * 10, 200 * 3 * 10 * 4]);
});

test('slide p26: L1 assignments, ties to first cluster, arithmetic means for three rounds', () => {
  let centers = [[0, 0], [2, 2]]; const expected = []; const memberships = [];
  for (let iteration = 0; iteration < 3; iteration++) {
    const groups = [[], []];
    points.forEach((p, i) => groups[l1(p, centers[0]) <= l1(p, centers[1]) ? 0 : 1].push(i));
    memberships.push(groups.map((g) => g.map((i) => names[i]).join('')));
    centers = groups.map((g) => [0, 1].map((j) => mean(g.map((i) => points[i][j]))));
    expected.push(...centers.flat());
  }
  check('l8-quiz-p26', expected);
  assert.deepEqual(memberships, [['ABC', 'DEFGHIJKL'], ['ABCEF', 'DGHIJKL'], ['ABEFG', 'CDHIJKL']]);
});

test('linkage distances and Ward increase from raw clusters', () => {
  const a = [0, 2]; const b = [5, 9];
  const cross = a.flatMap((x) => b.map((y) => Math.abs(x - y)));
  const sse = (xs) => xs.reduce((s, x) => s + (x - mean(xs)) ** 2, 0);
  check('l8-linkage-v1', [Math.min(...cross), Math.max(...cross), mean(cross), sse([...a, ...b]) - sse(a) - sse(b)]);
  let clusters = [[0], [2], [7], [10]]; const heights = [];
  while (clusters.length > 1) {
    let closest = { d: Infinity };
    for (let i = 0; i < clusters.length; i++) for (let j = i + 1; j < clusters.length; j++) {
      const d = Math.min(...clusters[i].flatMap((x) => clusters[j].map((y) => Math.abs(x - y))));
      if (d < closest.d) closest = { d, i, j };
    }
    heights.push(closest.d);
    const merged = [...clusters[closest.i], ...clusters[closest.j]];
    clusters = clusters.filter((_, i) => i !== closest.i && i !== closest.j);
    clusters.push(merged);
  }
  check('l8-hac-v1', heights);
});

function dbscanTypes(distance) {
  const neighbourhoods = points.map((a) => points.map((b, j) => distance(a, b) <= 1.95 ? j : -1).filter((j) => j >= 0));
  const core = neighbourhoods.map((ns) => ns.length >= 3);
  const border = neighbourhoods.map((ns, i) => !core[i] && ns.some((j) => core[j]));
  const remaining = new Set(points.map((_, i) => i).filter((i) => core[i]));
  const components = [];
  while (remaining.size) {
    const component = new Set([remaining.values().next().value]);
    const queue = [...component];
    while (queue.length) {
      const i = queue.pop(); remaining.delete(i);
      for (const j of neighbourhoods[i].filter((j) => core[j])) if (!component.has(j)) { component.add(j); queue.push(j); }
    }
    components.push(component);
  }
  const labels = (flags) => flags.flatMap((yes, i) => yes ? [names[i]] : []);
  return { count: components.length, core: labels(core), border: labels(border), noise: labels(core.map((yes, i) => !yes && !border[i])) };
}

test('slide p51: DBSCAN neighbourhood counts, core connectivity and metric distinction', () => {
  const manhattan = dbscanTypes(l1);
  check('l8-quiz-p51', [manhattan.count, manhattan.core.length, manhattan.border.length, manhattan.noise.length]);
  assert.deepEqual(manhattan.core, ['A', 'D', 'I', 'J']);
  assert.deepEqual(manhattan.border, ['B', 'E', 'F', 'H', 'K', 'L']);
  assert.deepEqual(manhattan.noise, ['C', 'G']);
  const euclidean = dbscanTypes((a, b) => Math.sqrt(squared(a, b)));
  assert.equal(euclidean.count, 2);
  assert.equal(euclidean.core.length, 10);
  assert.deepEqual(euclidean.border, []);
  assert.deepEqual(euclidean.noise, ['C', 'G']);
});

test('silhouette, Davies-Bouldin and Dunn recomputed from every pair distance', () => {
  const clusters = [[0, 2], [8, 10]];
  const silhouette = (p, c) => {
    const own = clusters[c].filter((x) => x !== p);
    const a = mean(own.map((x) => Math.abs(p - x)));
    const b = Math.min(...clusters.filter((_, j) => j !== c).map((group) => mean(group.map((x) => Math.abs(p - x)))));
    return [a, b, (b - a) / Math.max(a, b)];
  };
  const all = clusters.flatMap((group, c) => group.map((p) => silhouette(p, c)[2]));
  check('l8-silhouette-v1', [...silhouette(2, 0), mean(all)]);
  const centers = clusters.map(mean);
  const scatter = clusters.map((group, i) => mean(group.map((x) => Math.abs(x - centers[i]))));
  const db = mean(clusters.map((_, i) => Math.max(...clusters.flatMap((__, j) => i === j ? [] : [(scatter[i] + scatter[j]) / Math.abs(centers[i] - centers[j])]))));
  check('l8-db-index-v1', [scatter[0], Math.abs(centers[0] - centers[1]), db]);
  const separation = Math.min(...clusters[0].flatMap((x) => clusters[1].map((y) => Math.abs(x - y))));
  const diameter = Math.max(...clusters.flatMap((group) => group.flatMap((x) => group.map((y) => Math.abs(x - y)))));
  check('l8-dunn-v1', [separation, diameter, separation / diameter]);
});
