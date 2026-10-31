import { test } from 'node:test';
import assert from 'node:assert/strict';
import '../src/visuals.js';
import '../src/visuals-clustering.js';

const kmeans = globalThis.MLVisuals.get('kmeans').model;
const dbscan = globalThis.MLVisuals.get('dbscan').model;
const pointNames = (model, indices) => indices.map((i) => model.points[i].id);
const coordinates = (centers) => centers.map(({ x, y }) => [x, y]);

test('K-means reproduces the one-epoch HW08 result without changing its input', () => {
  const start = kmeans.initialState(); const before = JSON.stringify(start);
  const result = kmeans.step(start);
  assert.equal(JSON.stringify(start), before);
  assert.equal(result.epoch, 1);
  assert.deepEqual(coordinates(result.assignmentCenters), [[2, 10], [5, 8], [1, 2]]);
  assert.deepEqual(coordinates(result.centers), [[2, 10], [6, 6], [1.5, 3.5]]);
  assert.deepEqual(result.groups.map((group) => pointNames(kmeans, group)), [['A1'], ['A3', 'A4', 'A5', 'A6', 'A8'], ['A2', 'A7']]);
  // A8 remains with C2 after that batch update, even though the new C1 is now
  // closer. Reassigning it here would silently perform part of another epoch.
  assert.equal(result.labels[7], 1);
  assert.deepEqual(result.distances[7], [5, 2, 58]);
  assert.equal(kmeans.assign([kmeans.points[7]], result.centers).labels[0], 0);
  assert.equal(result.converged, false);
});

test('K-means reaches the expected fixed point, and reset returns independent seeds', () => {
  let state = kmeans.initialState();
  for (let round = 0; round < 4; round++) state = kmeans.step(state);
  assert.equal(state.converged, true);
  assert.equal(state.epoch, 4);
  assert.deepEqual(state.groups.map((group) => pointNames(kmeans, group)), [['A1', 'A4', 'A8'], ['A3', 'A5', 'A6'], ['A2', 'A7']]);
  assert.deepEqual(coordinates(state.centers), [[11 / 3, 9], [7, 13 / 3], [1.5, 3.5]]);
  assert.equal(kmeans.step(state), state, 'a converged state does not increment the epoch');
  const reset = kmeans.initialState();
  reset.centers[0].x = -100;
  assert.deepEqual(coordinates(kmeans.initialState().centers), [[2, 10], [5, 8], [1, 2]]);
});

test('K-means ties select the lower cluster and empty clusters retain their centre', () => {
  const points = [{ id: 'mid', x: 1, y: 0 }];
  const state = kmeans.initialState([{ x: 0, y: 0 }, { x: 2, y: 0 }]);
  const result = kmeans.step(state, points);
  assert.deepEqual(result.labels, [0]);
  assert.deepEqual(result.emptyClusters, [1]);
  assert.deepEqual(coordinates(result.centers), [[1, 0], [2, 0]]);
  assert.throws(() => kmeans.assign(points, []), /at least one/);
});

test('DBSCAN reproduces HW08 at radius 2 and the inclusive square-root-of-10 boundary', () => {
  const radius2 = dbscan.analyze(dbscan.points, 2, 2);
  assert.deepEqual(radius2.counts, { clusters: 2, core: 5, border: 0, noise: 3 });
  assert.deepEqual(radius2.clusters.map((indices) => pointNames(dbscan, indices)), [['A3', 'A5', 'A6'], ['A4', 'A8']]);
  assert.deepEqual(radius2.types, ['noise', 'noise', 'core', 'core', 'core', 'core', 'noise', 'core']);
  assert.deepEqual(pointNames(dbscan, radius2.neighbors[2]), ['A3', 'A5', 'A6']);
  const root10 = dbscan.analyze(dbscan.points, Math.sqrt(10), 2);
  assert.deepEqual(root10.counts, { clusters: 3, core: 8, border: 0, noise: 0 });
  assert.deepEqual(root10.clusters.map((indices) => pointNames(dbscan, indices)), [['A1', 'A4', 'A8'], ['A2', 'A7'], ['A3', 'A5', 'A6']]);
  assert.deepEqual(pointNames(dbscan, root10.neighbors[1]), ['A2', 'A7']);
  assert.deepEqual(pointNames(dbscan, dbscan.analyze(dbscan.points, Math.sqrt(10) - 1e-7, 2).neighbors[1]), ['A2']);
  // Independent squared-distance checks include every point itself and every
  // pair exactly at the threshold; no rounded decimal distance is used.
  for (const [eps, result] of [[2, radius2], [Math.sqrt(10), root10]]) {
    dbscan.points.forEach((p, i) => {
      const expected = dbscan.points.flatMap((q, j) => (p.x - q.x) ** 2 + (p.y - q.y) ** 2 <= (eps === 2 ? 4 : 10) ? [j] : []);
      assert.deepEqual(result.neighbors[i], expected);
    });
  }
});

test('a shared DBSCAN border never merges two core components', () => {
  const xs = [-1.6, -1.5, -1.4, -0.9, 0, 0.9, 1.4, 1.5, 1.6];
  const points = xs.map((x, i) => ({ id: `P${i}`, x, y: 0 }));
  const result = dbscan.analyze(points, 1, 4);
  assert.deepEqual(result.counts, { clusters: 2, core: 8, border: 1, noise: 0 });
  assert.equal(result.types[4], 'border');
  assert.equal(result.labels[4], 0, 'shared border attaches deterministically to the first component');
  assert.deepEqual(result.coreComponents, [[0, 1, 2, 3], [5, 6, 7, 8]]);
  assert.deepEqual(result.clusters, [[0, 1, 2, 3, 4], [5, 6, 7, 8]]);
});

test('DBSCAN counts self, handles duplicates and does not expand through border points', () => {
  const duplicates = [{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 1e-8, y: 0 }];
  const zero = dbscan.analyze(duplicates, 0, 2);
  assert.deepEqual(zero.neighbors, [[0, 1], [0, 1], [2]]);
  assert.deepEqual(zero.types, ['core', 'core', 'noise']);
  const chain = [-0.1, -0.075, -0.05, -0.025, 0, 0.2, 0.4].map((x) => ({ x, y: 0 }));
  const result = dbscan.analyze(chain, 0.21, 5);
  assert.equal(result.types[5], 'border');
  assert.equal(result.types[6], 'noise');
  assert.equal(result.labels[6], -1);
  assert.deepEqual(dbscan.analyze([], 2, 2).counts, { clusters: 0, core: 0, border: 0, noise: 0 });
  assert.throws(() => dbscan.analyze(dbscan.points, -1, 2), /nonnegative/);
  assert.throws(() => dbscan.analyze(dbscan.points, 2, 1.5), /integer/);
});
