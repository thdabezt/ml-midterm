import { test } from 'node:test';
import assert from 'node:assert/strict';
import '../src/visuals.js';
import '../src/visuals-regression.js';
import '../src/visuals-models.js';
import '../src/visuals-clustering.js';
import { LESSON_VISUALS, md } from '../tools/render.mjs';
import { loadTheory } from '../tools/build.mjs';

const { models, helpers, get } = globalThis.MLVisuals;
const information = models.information.binaryInformation;
const close = (a, b, tolerance = 1e-10) => assert.ok(Math.abs(a - b) < tolerance, `${a} vs ${b}`);

test('information visual reproduces cross-entropy, KL and the log-base conversion', () => {
  const bits = information(0.5, 0.75);
  close(bits.entropy, 1);
  close(bits.crossEntropy, 1.207518749639422);
  close(bits.kl, 0.207518749639422);
  const nats = information(0.5, 0.75, 'nats');
  close(nats.entropy, bits.entropy * Math.LN2);
  close(nats.crossEntropy, bits.crossEntropy * Math.LN2);
  close(nats.kl, bits.kl * Math.LN2);
  assert.notEqual(information(0.2, 0.7).kl, information(0.7, 0.2).kl);
});

test('information visual handles exact zero probabilities without clipping or NaN', () => {
  assert.equal(information(0, 0).entropy, 0);
  assert.equal(information(0, 0).crossEntropy, 0);
  assert.equal(information(1, 1).crossEntropy, 0);
  assert.equal(information(0, 1).crossEntropy, Infinity);
  assert.equal(information(1, 0).kl, Infinity);
  assert.equal(information(0, 0).terms[0].crossEntropy, 0);
  close(information(0, 0.25).crossEntropy, -Math.log2(0.75));
  for (let i = 0; i <= 20; i++) for (let j = 0; j <= 20; j++) {
    const value = information(i / 20, j / 20);
    assert.ok(!Number.isNaN(value.entropy) && !Number.isNaN(value.crossEntropy) && !Number.isNaN(value.kl));
    assert.ok(value.entropy >= 0 && value.crossEntropy + 1e-12 >= value.entropy && value.kl >= 0);
    assert.equal(information(i / 20, i / 20).kl, 0);
  }
  assert.throws(() => information(-0.1, 0.5), RangeError);
  assert.throws(() => information(0.5, NaN), RangeError);
});

test('every lesson visual is registered, rendered and placed in its intended lesson', () => {
  const intended = { information: 'l2-general-concepts', regression: 'l3-linear-regression', logistic: 'l4-classification', 'information-gain': 'l5-decision-tree', 'svm-geometry': 'l6-svm', kmeans: 'l8-unsupervised-learning', dbscan: 'l8-unsupervised-learning' };
  const occurrences = [];
  for (const lesson of loadTheory()) for (const section of lesson.sections) {
    for (const [, key] of section.html.matchAll(/data-visual="([a-z0-9-]+)"/g)) {
      assert.equal(lesson.slug, intended[key]); occurrences.push(key);
      assert.equal(typeof get(key).mount, 'function');
      assert.ok(models[key]);
    }
  }
  assert.deepEqual(occurrences.sort(), Object.keys(LESSON_VISUALS).sort());
  assert.throws(() => md('{{visual:not-a-real-panel}}'), /Unknown lesson visual/);
  assert.throws(() => md('inline {{visual:information}} text'), /standalone paragraph/);
});

test('SVM plots use equal pixel units and safe finite plot ranges', () => {
  const html = helpers.plot({ clientWidth: 360 }, { title: 'Geometry', xMin: -5, xMax: 5, yMin: -5, yMax: 5, equalAspect: true, draw: ({ sx, sy }) => { close(sx(1) - sx(0), sy(0) - sy(1)); return ''; } });
  assert.ok(!/NaN|Infinity/.test(html));
  assert.match(html, /role="img"/);
  assert.throws(() => helpers.plot({ clientWidth: 360 }, { xMin: 0, xMax: 0, yMin: 0, yMax: 1 }), RangeError);
});
