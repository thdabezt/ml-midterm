import { test } from 'node:test';
import assert from 'node:assert/strict';
import svm from '../content/practice/l6-svm.js';
import optimization from '../content/practice/l7-model-optimization.js';

const bank = [...svm.questions, ...optimization.questions];
const byId = Object.fromEntries(bank.map((q) => [q.id, q]));
const answers = (id) => byId[id].fields.map((f) => f.answer);
const close = (a, b, tol = 1e-10) => assert.ok(Math.abs(a - b) < tol, `${a} vs ${b}`);
const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
const sub = (a, b) => a.map((v, i) => v - b[i]);
const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);

// Independent geometry: find closest points of the two convex hulls, then
// construct their perpendicular bisector in canonical SVM score units.
function hull(points) {
  const sorted = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (sorted.length < 2) return sorted;
  const side = (rows) => {
    const result = [];
    for (const p of rows) {
      while (result.length > 1 && cross(result.at(-2), result.at(-1), p) <= 0) result.pop();
      result.push(p);
    }
    return result;
  };
  return [...side(sorted).slice(0, -1), ...side([...sorted].reverse()).slice(0, -1)];
}

function projection(p, a, b) {
  const edge = sub(b, a);
  const square = dot(edge, edge);
  const t = square ? Math.max(0, Math.min(1, dot(sub(p, a), edge) / square)) : 0;
  return a.map((v, i) => v + t * edge[i]);
}

function maximumMargin(positive, negative) {
  const hp = hull(positive); const hn = hull(negative);
  let closest;
  const consider = (p, n) => {
    const diff = sub(p, n); const square = dot(diff, diff);
    if (!closest || square < closest.square) closest = { p, n, square };
  };
  for (const p of hp) {
    hn.forEach((n, i) => consider(p, projection(p, n, hn[(i + 1) % hn.length])));
  }
  for (const n of hn) {
    hp.forEach((p, i) => consider(projection(n, p, hp[(i + 1) % hp.length]), n));
  }
  const w = sub(closest.p, closest.n).map((v) => 2 * v / closest.square);
  const b = 1 - dot(w, closest.p);
  for (const p of positive) assert.ok(dot(w, p) + b >= 1 - 1e-10);
  for (const n of negative) assert.ok(-(dot(w, n) + b) >= 1 - 1e-10);
  return { w, b, margin: Math.sqrt(closest.square) };
}

test('both newly supplied homework sheets have all three exercises', () => {
  for (const sheet of ['06', '07']) {
    for (let exercise = 1; exercise <= 3; exercise++) {
      const id = `hw${sheet}-ex${exercise}`;
      assert.equal(byId[id]?.source.kind, 'hw', `missing ${id}`);
    }
  }
});

test('HW06 polynomial feature maps reproduce the kernels', () => {
  const phi = ([x, y]) => [1, Math.SQRT2 * x, Math.SQRT2 * y, x * x, y * y, Math.SQRT2 * x * y];
  for (const x of [[-2, 1], [0, 0], [1, 2], [3, -1]]) {
    for (const z of [[2, -1], [0, 0], [-1, 2]]) close(dot(phi(x), phi(z)), (dot(x, z) + 1) ** 2);
  }
  const x = [1, 2]; const z = [-1, 1];
  const offsetMap = ([a, b]) => [2, 2 * a, 2 * b, a * a, b * b, Math.SQRT2 * a * b];
  close(answers('hw06-ex1-v1')[0], dot(x, z));
  close(answers('hw06-ex1-v1')[1], dot(offsetMap(x), offsetMap(z)));
});

test('HW06 SVM answers come from closest convex-hull points', () => {
  const cases = [
    ['hw06-ex2', [[1, 1], [2, 2], [2, 0]], [[0, 0], [1, 0], [0, 1]]],
    ['hw06-ex3', [[1, 4], [2, 3]], [[4, 5], [5, 6]]],
    ['hw06-ex3-v1', [[3, 0], [3, 2]], [[1, 0], [1, 2]]],
  ];
  for (const [id, positive, negative] of cases) {
    const { w, b, margin } = maximumMargin(positive, negative);
    [w[0], w[1], b, margin].forEach((value, i) => close(answers(id)[i], value));
  }
});

test('HW06 removal examples distinguish redundant and necessary margin points', () => {
  const positive = [[1, 1], [2, 2], [2, 0]];
  const negative = [[0, 0], [1, 0], [0, 1]];
  const original = maximumMargin(positive, negative);
  const onMargin = (p, y) => Math.abs(y * (dot(original.w, p) + original.b) - 1) < 1e-10;
  assert.deepEqual(positive.filter((p) => onMargin(p, 1)), [[1, 1], [2, 0]]);
  assert.deepEqual(negative.filter((p) => onMargin(p, -1)), [[1, 0], [0, 1]]);
  close(maximumMargin(positive.slice(1), negative).margin, 1);
  close(maximumMargin(positive.filter((_, i) => i !== 2), negative).margin, original.margin);
  close(maximumMargin(positive, negative.filter((_, i) => i !== 1)).margin, 1);
  close(maximumMargin(positive, negative.slice(0, 2)).margin, original.margin);
});

test('HW07 information gain is recomputed from the patient rows', () => {
  const rows = [
    ['Young', 'High', 'Normal', 'Yes', 'Yes'],
    ['Old', 'High', 'High', 'No', 'No'],
    ['Middle', 'Normal', 'Normal', 'Yes', 'Yes'],
    ['Old', 'Normal', 'High', 'No', 'No'],
    ['Young', 'High', 'High', 'Yes', 'Yes'],
    ['Old', 'Normal', 'High', 'No', 'No'],
    ['Middle', 'Normal', 'Normal', 'Yes', 'Yes'],
    ['Middle', 'High', 'High', 'No', 'No'],
  ];
  const entropy = (subset) => {
    const counts = new Map();
    for (const row of subset) counts.set(row.at(-1), (counts.get(row.at(-1)) || 0) + 1);
    return -[...counts.values()].reduce((sum, n) => {
      const p = n / subset.length;
      return sum + p * Math.log2(p);
    }, 0);
  };
  const gains = [0, 1, 2, 3].map((j) => {
    const branches = [...new Set(rows.map((row) => row[j]))].map((v) => rows.filter((row) => row[j] === v));
    return entropy(rows) - branches.reduce((sum, subset) => sum + subset.length / rows.length * entropy(subset), 0);
  });
  gains.forEach((gain, j) => close(answers('hw07-ex1')[j], gain));
  assert.equal(gains.indexOf(Math.max(...gains)), 3);
});

test('HW07 Lasso coordinate minimises the original one-feature objective', () => {
  const xs = [1, 2]; const ys = [3, 5]; const lambda = 1;
  const rho = xs.reduce((sum, x, i) => sum + x * ys[i], 0);
  const z = dot(xs, xs);
  const [storedRho, storedZ, theta] = answers('hw07-ex2-v1');
  close(storedRho, rho); close(storedZ, z);
  // Check the derivative and objective directly rather than repeating the
  // soft-threshold formula used in the model answer.
  const derivative = xs.reduce((sum, x, i) => sum + x * (x * theta - ys[i]), 0) + lambda;
  close(derivative, 0);
  const objective = (t) => 0.5 * xs.reduce((sum, x, i) => sum + (x * t - ys[i]) ** 2, 0) + lambda * Math.abs(t);
  for (const step of [-0.1, -0.001, 0.001, 0.1]) assert.ok(objective(theta + step) > objective(theta));
});

// Start at a modal binomial term with relative weight 1, recur outwards, then
// normalise. No factorials or tiny endpoint powers enter this independent check.
function strictMajority(m, p) {
  const mode = Math.floor((m + 1) * p);
  const weights = Array(m + 1).fill(0);
  weights[mode] = 1;
  for (let k = mode; k < m; k++) weights[k + 1] = weights[k] * (m - k) / (k + 1) * p / (1 - p);
  for (let k = mode; k > 0; k--) weights[k - 1] = weights[k] * k / (m - k + 1) * (1 - p) / p;
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  const correct = weights.slice(Math.floor(m / 2) + 1).reduce((sum, weight) => sum + weight, 0);
  return correct / total;
}

test('HW07 binomial probabilities use a strict majority and remain stable for 10000 voters', () => {
  [1000, 10000].forEach((m, i) => close(answers('hw07-ex3')[i], strictMajority(m, 0.51), 1e-12));
  [4, 5].forEach((m, i) => close(answers('hw07-ex3-v1')[i], strictMajority(m, 0.6), 1e-12));
  close(strictMajority(4, 0.5), 5 / 16); // tie excluded
  close(strictMajority(5, 0.5), 0.5);
});
