import { test } from 'node:test';
import assert from 'node:assert/strict';
import '../src/visuals.js';
import '../src/visuals-models.js';

const informationGain = globalThis.MLVisuals.models['information-gain'];
const svmGeometry = globalThis.MLVisuals.models['svm-geometry'];
const close = (actual, expected, tolerance = 1e-12) => assert.ok(Math.abs(actual - expected) < tolerance, `${actual} vs ${expected}`);

test('information gain independently matches the eight original HW07 patient rows', () => {
  // Recompute from a separate transcription of the original rows.
  const rows = [
    ['Young', 'High', 'Normal', 'Yes', 1], ['Old', 'High', 'High', 'No', 0],
    ['Middle', 'Normal', 'Normal', 'Yes', 1], ['Old', 'Normal', 'High', 'No', 0],
    ['Young', 'High', 'High', 'Yes', 1], ['Old', 'Normal', 'High', 'No', 0],
    ['Middle', 'Normal', 'Normal', 'Yes', 1], ['Middle', 'High', 'High', 'No', 0],
  ];
  const entropy = (ys) => {
    const p = ys.reduce((a, y) => a + y, 0) / ys.length;
    return p === 0 || p === 1 ? 0 : -p * Math.log2(p) - (1 - p) * Math.log2(1 - p);
  };
  for (const [feature, j, expected] of [['Age', 0, 0.6556390622295665], ['BloodPressure', 1, 0], ['Cholesterol', 2, 0.5487949406953986], ['Smoker', 3, 1]]) {
    const parentEntropy = entropy(rows.map((row) => row[4]));
    const children = [...new Set(rows.map((row) => row[j]))].map((value) => rows.filter((row) => row[j] === value));
    const weighted = children.reduce((sum, child) => sum + child.length / rows.length * entropy(child.map((row) => row[4])), 0);
    const result = informationGain(feature);
    close(result.parent.entropy, parentEntropy);
    close(result.gain, parentEntropy - weighted);
    close(result.gain, expected);
    close(result.branches.reduce((sum, branch) => sum + branch.weight, 0), 1);
    assert.equal(result.branches.reduce((sum, branch) => sum + branch.yes, 0), 4);
    assert.equal(result.branches.reduce((sum, branch) => sum + branch.no, 0), 4);
    for (const branch of result.branches) {
      const sourceRows = rows.filter((row) => row[j] === branch.value);
      assert.equal(branch.total, sourceRows.length);
      close(branch.entropy, entropy(sourceRows.map((row) => row[4])));
      close(branch.weightedEntropy, branch.weight * branch.entropy);
    }
  }
  assert.throws(() => informationGain('PatientID'), /Unknown/);
});

test('SVM default projection lands on the line and its segment is perpendicular', () => {
  const result = svmGeometry();
  assert.equal(result.valid, true);
  assert.equal(result.score, 5);
  assert.equal(result.label, 1);
  close(result.norm, Math.sqrt(5));
  close(result.distance, Math.sqrt(5));
  close(result.fullMargin, 2 / Math.sqrt(5));
  close(result.foot.x, 1);
  close(result.foot.y, 1);
  close(result.w1 * result.foot.x + result.w2 * result.foot.y + result.b, 0);
  // A boundary direction is (-w2,w1); its dot product with P-H must vanish.
  close((result.x - result.foot.x) * -result.w2 + (result.y - result.foot.y) * result.w1, 0);
  close(Math.hypot(result.x - result.foot.x, result.y - result.foot.y), result.distance);
});

test('SVM projection and distances are invariant to rescaling the same boundary', () => {
  const input = { w1: -3, w2: 4, b: 2, x: 3, y: -1 };
  const original = svmGeometry(input);
  for (const factor of [0.25, 2, -1, -3]) {
    const scaled = svmGeometry({ ...input, w1: input.w1 * factor, w2: input.w2 * factor, b: input.b * factor });
    close(scaled.distance, original.distance);
    close(scaled.foot.x, original.foot.x);
    close(scaled.foot.y, original.foot.y);
    close(scaled.fullMargin, original.fullMargin / Math.abs(factor));
    assert.equal(scaled.label, original.label * Math.sign(factor));
  }
});

test('SVM handles vertical, horizontal and boundary points without division by a zero coordinate', () => {
  const vertical = svmGeometry({ w1: 2, w2: 0, b: -4, x: 5, y: -3 });
  close(vertical.foot.x, 2); close(vertical.foot.y, -3); close(vertical.distance, 3);
  const horizontal = svmGeometry({ w1: 0, w2: -2, b: 4, x: -3, y: 5 });
  close(horizontal.foot.x, -3); close(horizontal.foot.y, 2); close(horizontal.distance, 3);
  assert.equal(horizontal.label, -1);
  const boundary = svmGeometry({ w1: 2, w2: 1, b: -3, x: 1, y: 1 });
  assert.equal(boundary.label, 0); close(boundary.distance, 0);
  close(boundary.foot.x, 1); close(boundary.foot.y, 1);
});

test('zero SVM weights explicitly omit undefined geometry', () => {
  for (const bias of [-2, 0, 3]) {
    const result = svmGeometry({ w1: 0, w2: 0, b: bias });
    assert.equal(result.valid, false);
    assert.equal(result.score, bias);
    assert.equal(result.label, Math.sign(bias));
    assert.equal(result.foot, null);
    assert.equal(result.distance, null);
    assert.equal(result.fullMargin, null);
    assert.ok(!/NaN|Infinity/.test(JSON.stringify(result)));
  }
  assert.throws(() => svmGeometry({ w1: Infinity }), /finite/);
});
