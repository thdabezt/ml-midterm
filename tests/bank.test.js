// Checks the question bank: structure, and every key homework/slide answer
// recomputed independently from the raw data.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadTheory, loadQuestions } from '../tools/build.mjs';

const lectures = loadTheory();
const questions = await loadQuestions(lectures.map((l) => l.slug));
const byId = Object.fromEntries(questions.map((q) => [q.id, q]));
const answers = (id) => byId[id].fields.map((f) => f.answer);
const close = (a, b, tol = 1e-3) => assert.ok(Math.abs(a - b) <= tol, `${a} vs ${b}`);

const sum = (a) => a.reduce((s, v) => s + v, 0);
const log2 = (x) => Math.log(x) / Math.LN2;
const H = (...c) => { const n = sum(c); return -sum(c.filter((x) => x).map((x) => (x / n) * log2(x / n))); };
const G = (...c) => { const n = sum(c); return 1 - sum(c.map((x) => (x / n) ** 2)); };
const sigmoid = (z) => 1 / (1 + Math.exp(-z));

function normalEq(xs, ys) {
  const m = xs.length; const Sx = sum(xs); const Sy = sum(ys);
  const Sxx = sum(xs.map((x) => x * x)); const Sxy = sum(xs.map((x, i) => x * ys[i]));
  const det = m * Sxx - Sx * Sx;
  return [(Sxx * Sy - Sx * Sxy) / det, (m * Sxy - Sx * Sy) / det];
}
function gdEpochs(xs, ys, alpha, epochs) {
  let w0 = 0; let w1 = 0; const out = [];
  for (let e = 0; e < epochs; e++) {
    const err = xs.map((x, i) => w0 + w1 * x - ys[i]);
    const g0 = sum(err) / xs.length; const g1 = sum(err.map((v, i) => v * xs[i])) / xs.length;
    w0 -= alpha * g0; w1 -= alpha * g1; out.push(w0, w1);
  }
  return out;
}
function naiveBayes(rows, query) {
  const score = (c) => {
    const rc = rows.filter((r) => r.at(-1) === c);
    return (rc.length / rows.length) * query.reduce((p, v, j) => (p * rc.filter((r) => r[j] === v).length) / rc.length, 1);
  };
  return [score('Yes'), score('No')];
}

const BADMINTON = [
  ['Sunny', 'High', 'High', 'No', 'No'], ['Sunny', 'High', 'High', 'Yes', 'No'], ['Overcast', 'High', 'High', 'No', 'Yes'],
  ['Rainy', 'Medium', 'High', 'No', 'Yes'], ['Rainy', 'Low', 'Low', 'No', 'Yes'], ['Rainy', 'Low', 'Low', 'Yes', 'No'],
  ['Overcast', 'Low', 'Low', 'Yes', 'Yes'], ['Sunny', 'Medium', 'High', 'No', 'No'], ['Sunny', 'Low', 'Low', 'No', 'Yes'],
  ['Rainy', 'Medium', 'High', 'Yes', 'Yes'],
];
const TENNIS = [
  ['Sunny', 'Hot', 'High', 'Weak', 'No'], ['Sunny', 'Hot', 'High', 'Strong', 'No'], ['Overcast', 'Hot', 'High', 'Weak', 'Yes'],
  ['Rain', 'Mild', 'High', 'Weak', 'Yes'], ['Rain', 'Cool', 'Normal', 'Weak', 'Yes'], ['Rain', 'Cool', 'Normal', 'Strong', 'No'],
  ['Overcast', 'Cool', 'Normal', 'Strong', 'Yes'], ['Sunny', 'Mild', 'High', 'Weak', 'No'], ['Sunny', 'Cool', 'Normal', 'Weak', 'Yes'],
  ['Rain', 'Mild', 'Normal', 'Weak', 'Yes'], ['Sunny', 'Mild', 'Normal', 'Strong', 'Yes'], ['Overcast', 'Mild', 'High', 'Strong', 'Yes'],
  ['Overcast', 'Hot', 'Normal', 'Weak', 'Yes'], ['Rain', 'Mild', 'High', 'Strong', 'No'],
];

test('bank structure', () => {
  assert.ok(questions.length >= 150, `only ${questions.length} questions`);
  assert.ok(lectures.some((l) => l.num === 8 && l.slug === 'l8-unsupervised-learning'), 'missing Lecture 8');
  for (const l of lectures.filter((x) => x.num >= 1 && x.num <= 8)) {
    const qs = questions.filter((q) => q.lesson === l.slug);
    assert.ok(qs.length >= 12, `${l.slug} has ${qs.length} questions`);
    assert.ok(qs.some((q) => q.type === 'mcq'), `${l.slug} has no MCQ`);
  }
  for (const q of questions.filter((x) => x.type === 'mcq')) assert.ok(q.answer < q.options.length);
  const hw = questions.filter((q) => q.source.kind === 'hw').map((q) => q.id);
  for (const id of ['hw01-ex1', 'hw01-ex2', 'hw02-ex1a', 'hw02-ex1b', 'hw02-ex2', 'hw02-ex3', 'hw04-ex1', 'hw04-ex2', 'hw04-ex3', 'hw05-ex1', 'hw05-ex2', 'hw05-ex3', 'hw06-ex1', 'hw06-ex2', 'hw06-ex3', 'hw07-ex1', 'hw07-ex2', 'hw07-ex3']) {
    assert.ok(hw.includes(id), `missing homework exercise ${id}`);
  }
});

test('mock exam has enough MCQ and calculation questions per lesson', () => {
  const pool = questions.filter((q) => !q.noExam && q.lesson !== 'math-toolkit');
  assert.ok(pool.filter((q) => q.type === 'mcq').length >= 20);
  assert.ok(pool.filter((q) => q.type === 'numeric').length >= 6);
});

test('linear regression answers (HW02, HW04 Ex1, variants)', () => {
  const [w0, w1] = normalEq([-1, 0, 1, 2], [0, 2, 4, 5]);
  assert.deepEqual(answers('hw02-ex1a').map((v) => +v.toFixed(6)), [+w0.toFixed(6), +w1.toFixed(6)]);
  gdEpochs([-1, 0, 1, 2], [0, 2, 4, 5], 0.01, 2).forEach((v, i) => close(answers('hw02-ex1b')[i], v, 1e-6));
  normalEq([2, 3, 4, 5], [0, 0, 1, 1]).forEach((v, i) => close(answers('hw04-ex1')[i], v, 1e-9));
  normalEq([1, 2, 4, 5], [1, 3, 3, 5]).forEach((v, i) => close(answers('l3-ne-v1')[i], v, 1e-9));
  gdEpochs([0, 1, 2, 3], [1, 3, 2, 4], 0.1, 2).forEach((v, i) => close(answers('l3-gd-v1')[i], v, 1e-9));
  // ridge, lambda = 5, intercept not penalised: [[4,2],[2,11]] w = [11,14]
  const det = 4 * 11 - 4;
  close(answers('l3-ridge-v1')[0], (11 * 11 - 2 * 14) / det, 1e-9);
  close(answers('l3-ridge-v1')[1], (-2 * 11 + 4 * 14) / det, 1e-9);
});

test('naive Bayes answers (HW04 Ex2, Play Tennis quizzes)', () => {
  const cases = [
    ['hw04-ex2', BADMINTON, ['Overcast', 'Medium', 'High', 'No']],
    ['hw04-ex2-v1', BADMINTON, ['Sunny', 'Low', 'Low', 'Yes']],
    ['hw04-ex2-v2', BADMINTON, ['Rainy', 'High', 'High', 'No']],
    ['l4-quiz-p27', TENNIS, ['Sunny', 'Cool', 'High', 'Strong']],
    ['l4-quiz-p28', TENNIS, ['Overcast', 'Hot', 'High', 'Weak']],
    ['l4-tennis-v1', TENNIS, ['Rain', 'Mild', 'Normal', 'Weak']],
  ];
  for (const [id, rows, query] of cases) {
    const [yes, no] = naiveBayes(rows, query);
    const a = answers(id);
    close(a[0], yes, 1e-5); close(a[1], no, 1e-5);
    assert.equal(a[2], yes > no ? 1 : 0, `${id} decision`);
  }
});

test('logistic regression answers', () => {
  close(answers('hw04-ex3-v1')[0], sigmoid(-4.03 + 1.16 * 5), 1e-4);
  close(answers('l4-heart')[0], sigmoid(0.58 * 5 - 3.34), 1e-4);
  close(answers('l4-heart')[1], sigmoid(0.58 * 6 - 3.34), 1e-4);
  close(answers('l4-logloss')[0], Math.log(1 + Math.exp(-2)), 1e-4);
});

test('decision tree answers', () => {
  close(answers('l5-loan-ig')[0], H(7, 3) - 0.7 * H(4, 3));
  close(answers('l5-loan-ig')[1], H(7, 3) - (0.4 * H(2, 2) + 0.2 * H(1, 1)));
  close(answers('l5-quiz-p26')[1], (4 / 20) * G(1, 3) + (8 / 20) * G(1, 7));
  close(answers('l5-entropy-v1')[1], H(8, 4) - ((7 / 12) * H(6, 1) + (5 / 12) * H(2, 3)));
  close(answers('l5-gainratio')[3], (1 - (0.2 * H(1, 3) + 0.4 * H(1, 7))) / H(4, 8, 8));
  close(answers('l5-badminton-root')[0], H(6, 4) - (0.4 * H(1, 3) + 0.4 * H(3, 1)));
});

test('information, ensembles, chi-square', () => {
  close(answers('l7-ig-tennis')[0], H(9, 5) - 0.5 * (H(3, 4) + H(6, 1)));
  close(answers('l7-ig-tennis')[1], H(9, 5) - ((8 / 14) * H(6, 2) + (6 / 14) * H(3, 3)));
  let comb = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return r; };
  let err = 0;
  for (let i = 13; i <= 25; i++) err += comb(25, i) * 0.35 ** i * 0.65 ** (25 - i);
  close(answers('l7-ensemble-vote')[1], err, 1e-3);
  close(answers('l7-bootstrap')[0], 0.9 ** 10, 1e-4);
  close(answers('l2-kl')[0], -(0.5 * log2(0.75) + 0.5 * log2(0.25)), 1e-4);
});
