import { test } from 'node:test';
import assert from 'node:assert/strict';
import '../src/visuals.js';
import '../src/visuals-regression.js';

const { regression, logistic } = globalThis.MLVisuals.models;
const close = (actual, expected, tolerance = 1e-10) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} vs ${expected}`);
const data = [[-1, 0], [0, 2], [1, 4], [2, 5]];

function rawCost(w0, w1) {
  return data.reduce((sum, [x, y]) => sum + (w0 + w1 * x - y) ** 2, 0) / (2 * data.length);
}

test('regression visual uses the homework data, half-MSE cost and per-point residuals', () => {
  assert.deepEqual(regression.points, data);
  const initial = regression.calculate(0, 0);
  close(initial.cost, 45 / 8);
  assert.deepEqual(initial.rows.map((row) => row.prediction), [0, 0, 0, 0]);
  assert.deepEqual(initial.rows.map((row) => row.error), [0, -2, -4, -5]);
  assert.deepEqual(initial.rows.map((row) => row.squaredError), [0, 4, 16, 25]);
  const fitted = regression.calculate(1.9, 1.7);
  close(fitted.cost, 0.0375);
  fitted.gradient.forEach((value) => close(value, 0));
  for (const weights of [[1, 1], [-2, 3], [0.7, -1.2]]) {
    close(regression.calculate(...weights).cost, rawCost(...weights));
  }
});

test('regression visual gradients agree with independent numerical derivatives', () => {
  const delta = 1e-5;
  for (const [w0, w1] of [[0, 0], [1, 1], [-2, 3], [0.7, -1.2]]) {
    const gradient = regression.calculate(w0, w1).gradient;
    close(gradient[0], (rawCost(w0 + delta, w1) - rawCost(w0 - delta, w1)) / (2 * delta), 1e-8);
    close(gradient[1], (rawCost(w0, w1 + delta) - rawCost(w0, w1 - delta)) / (2 * delta), 1e-8);
  }
});

test('one batch step updates both weights from the old errors and matches HW02 epochs', () => {
  const first = regression.step(0, 0, 0.01);
  close(first.w0, 0.0275);
  close(first.w1, 0.035);
  close(first.beforeCost, rawCost(0, 0));
  close(first.afterCost, rawCost(first.w0, first.w1));
  assert.ok(first.afterCost < first.beforeCost);
  const second = regression.step(first.w0, first.w1, 0.01);
  close(second.w0, 0.05455);
  close(second.w1, 0.0693375);
  const unchanged = regression.step(-1.2, 2.1, 0);
  close(unchanged.w0, -1.2); close(unchanged.w1, 2.1);
  const overshoot = regression.step(0, 0, 2);
  assert.ok(overshoot.afterCost > overshoot.beforeCost);
});

test('sigmoid visual probability depends on z, while the true label selects the loss', () => {
  close(logistic.sigmoid(0), 0.5);
  close(logistic.sigmoid(Math.log(3)), 0.75);
  close(logistic.sigmoid(-Math.log(3)), 0.25);
  for (const z of [-7, -2, 0, 2, 7]) {
    const p = 1 / (1 + Math.exp(-z));
    const positive = logistic.calculate(z, 1);
    const negative = logistic.calculate(z, 0);
    close(positive.probability, p); close(negative.probability, p);
    close(positive.loss, -Math.log(p));
    close(negative.loss, -Math.log(1 - p));
    close(positive.observedProbability, p);
    close(negative.observedProbability, 1 - p);
  }
  close(logistic.calculate(0, 0).loss, Math.LN2);
  close(logistic.calculate(0, 1).loss, Math.LN2);
  assert.ok(logistic.calculate(2, 1).loss < logistic.calculate(-2, 1).loss);
  assert.ok(logistic.calculate(2, 0).loss > logistic.calculate(-2, 0).loss);
});

test('binary cross-entropy stays finite and accurate for very large scores', () => {
  close(logistic.softplus(0), Math.LN2);
  close(logistic.softplus(1000), 1000);
  close(logistic.softplus(-1000), 0);
  const cases = [[1000, 1, 1, 0], [1000, 0, 1, 1000], [-1000, 1, 0, 1000], [-1000, 0, 0, 0]];
  for (const [z, y, probability, loss] of cases) {
    const actual = logistic.calculate(z, y);
    assert.ok(Number.isFinite(actual.loss));
    close(actual.probability, probability);
    close(actual.loss, loss);
  }
  // Correct positive-label loss remains nonzero when ordinary sigmoid rounding
  // has already made p exactly 1; subtracting z from softplus(z) would lose it.
  const certain = logistic.calculate(40, 1);
  assert.equal(certain.probability, 1);
  assert.ok(certain.loss > 0);
  close(certain.loss / Math.exp(-40), 1, 1e-10);
});
