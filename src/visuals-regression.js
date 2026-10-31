// Classic script in the browser; the registered models also run without a DOM.
(() => {
  'use strict';
  const V = globalThis.MLVisuals;
  const { escape, fmt, uid, plot } = V.helpers;
  const points = Object.freeze([[-1, 0], [0, 2], [1, 4], [2, 5]].map(Object.freeze));

  function finite(value, name) {
    if (!Number.isFinite(value)) throw new RangeError(`${name} must be a finite number.`);
    return value;
  }

  function regression(w0, w1) {
    finite(w0, 'w0'); finite(w1, 'w1');
    const rows = points.map(([x, y]) => {
      const prediction = w0 + w1 * x;
      const error = prediction - y;
      return { x, y, prediction, error, squaredError: error * error };
    });
    const n = rows.length;
    const cost = rows.reduce((sum, row) => sum + row.squaredError, 0) / (2 * n);
    const gradient = [
      rows.reduce((sum, row) => sum + row.error, 0) / n,
      rows.reduce((sum, row) => sum + row.error * row.x, 0) / n,
    ];
    if (![cost, ...gradient].every(Number.isFinite)) throw new RangeError('Use smaller weights so the cost remains finite.');
    return { w0, w1, rows, cost, gradient };
  }

  function step(w0, w1, alpha) {
    finite(alpha, 'alpha');
    if (alpha < 0) throw new RangeError('The learning rate must be nonnegative.');
    const before = regression(w0, w1);
    // Both updates use the same old prediction/error table.
    const next0 = w0 - alpha * before.gradient[0];
    const next1 = w1 - alpha * before.gradient[1];
    const after = regression(next0, next1);
    return { w0: next0, w1: next1, alpha, gradient: before.gradient, beforeCost: before.cost, afterCost: after.cost };
  }

  function mountRegression(host) {
    const ids = { w0: uid('regression-w0'), w1: uid('regression-w1'), alpha: uid('regression-alpha') };
    const state = { w0: 0, w1: 0, alpha: 0.01, lastStep: null };
    host.innerHTML = `<h3>Fit a line to the homework data</h3>
      <p>Change the intercept and slope, then take one gradient-descent step to see the errors change.</p>
      <div class="visual-controls">
        <label for="${ids.w0}">Intercept w₀ <input id="${ids.w0}" data-control="w0" type="number" step="any" value="0"></label>
        <label for="${ids.w1}">Slope w₁ <input id="${ids.w1}" data-control="w1" type="number" step="any" value="0"></label>
        <label for="${ids.alpha}">Learning rate α <input id="${ids.alpha}" data-control="alpha" type="number" min="0" step="any" value="0.01"></label>
      </div>
      <div class="visual-actions"><button class="btn" type="button" data-action="step">Take one batch step</button><button class="btn ghost" type="button" data-action="reset">Reset</button></div>
      <p class="visual-note">Larger dots are observed targets; smaller dots lie on the prediction line. Dashed segments show the residuals.</p>
      <div class="visual-chart" data-chart="regression"></div>
      <div class="visual-results" aria-live="polite" aria-atomic="true" data-results></div>
      <p class="visual-equation" data-equation></p>
      <p class="visual-equation" data-step></p>
      <div class="visual-table-wrap"><table class="visual-table"><caption>HW02: prediction minus target gives the error</caption><thead><tr><th scope="col">x</th><th scope="col">Target y</th><th scope="col">Prediction h(x)</th><th scope="col">Error e</th><th scope="col">e²</th></tr></thead><tbody data-rows></tbody></table></div>
      <p class="visual-note">J = Σe² / (2m), with m = 4. Both weights update simultaneously from the old errors. A large learning rate can increase the cost.</p>
      <p class="visual-note" role="status" data-status></p>`;
    const chart = host.querySelector('[data-chart]');
    const results = host.querySelector('[data-results]');
    const equation = host.querySelector('[data-equation]');
    const stepText = host.querySelector('[data-step]');
    const rows = host.querySelector('[data-rows]');
    const status = host.querySelector('[data-status]');
    const controls = Object.fromEntries(['w0', 'w1', 'alpha'].map((name) => [name, host.querySelector(`[data-control="${name}"]`)]));

    function draw() {
      const current = regression(state.w0, state.w1);
      const lineEnds = [-1.5, 2.5].map((x) => [x, state.w0 + state.w1 * x]);
      const ys = [0, 5, ...lineEnds.map((p) => p[1])];
      const low = Math.min(...ys); const high = Math.max(...ys);
      const pad = Math.max(0.6, (high - low) * 0.12);
      chart.innerHTML = plot(chart, {
        title: 'Observed targets, predicted regression line and residuals',
        description: `Four homework points and h(x) = ${state.w0} + ${state.w1} times x. Dashed segments join each target to its prediction.`,
        xLabel: 'Input x', yLabel: 'Target / prediction', xMin: -1.5, xMax: 2.5, yMin: low - pad, yMax: high + pad,
        draw: ({ sx, sy }) => {
          const line = `<line x1="${sx(lineEnds[0][0])}" y1="${sy(lineEnds[0][1])}" x2="${sx(lineEnds[1][0])}" y2="${sy(lineEnds[1][1])}" stroke="var(--practice)" stroke-width="2.5"/>`;
          return line + current.rows.map((row) => `<line x1="${sx(row.x)}" y1="${sy(row.y)}" x2="${sx(row.x)}" y2="${sy(row.prediction)}" stroke="var(--accent)" stroke-width="2" stroke-dasharray="5 4"/>
            <circle cx="${sx(row.x)}" cy="${sy(row.prediction)}" r="3.5" fill="var(--practice)"><title>Prediction ${escape(fmt(row.prediction, 4))}</title></circle>
            <circle cx="${sx(row.x)}" cy="${sy(row.y)}" r="5" fill="var(--theory)"><title>Observed (${row.x}, ${row.y})</title></circle>`).join('');
        },
      });
      results.innerHTML = `<div><span>Cost J</span><strong>${escape(fmt(current.cost, 6))}</strong></div><div><span>Gradient for w₀</span><strong>${escape(fmt(current.gradient[0], 6))}</strong></div><div><span>Gradient for w₁</span><strong>${escape(fmt(current.gradient[1], 6))}</strong></div>`;
      equation.textContent = `h(x) = ${fmt(state.w0, 5)} + (${fmt(state.w1, 5)}) × x; J = [${current.rows.map((row) => `(${fmt(row.error, 4)})²`).join(' + ')}] / 8 ≈ ${fmt(current.cost, 6)}.`;
      rows.innerHTML = current.rows.map((row) => `<tr>${[row.x, row.y, row.prediction, row.error, row.squaredError].map((value) => `<td>${escape(fmt(value, 5))}</td>`).join('')}</tr>`).join('');
      if (state.lastStep) {
        const s = state.lastStep;
        stepText.textContent = `Last step: w₀ = ${fmt(s.old0, 6)} − ${fmt(s.alpha, 4)} × (${fmt(s.gradient[0], 6)}) = ${fmt(s.w0, 6)}; w₁ = ${fmt(s.old1, 6)} − ${fmt(s.alpha, 4)} × (${fmt(s.gradient[1], 6)}) = ${fmt(s.w1, 6)}. Cost: ${fmt(s.beforeCost, 6)} → ${fmt(s.afterCost, 6)}.`;
      } else stepText.textContent = 'Start at zero, or choose your own weights. The next step uses the gradient shown above.';
    }

    for (const [name, input] of Object.entries(controls)) {
      input.addEventListener('input', () => {
        input.setCustomValidity('');
        const value = input.valueAsNumber;
        if (!Number.isFinite(value) || !input.validity.valid) {
          status.textContent = 'Enter finite weights and a nonnegative learning rate. The chart keeps the last valid values.';
          return;
        }
        try {
          const candidate = { ...state, [name]: value };
          regression(candidate.w0, candidate.w1);
          state[name] = value; state.lastStep = null; status.textContent = '';
          draw();
        } catch (error) { input.setCustomValidity(error.message); status.textContent = error.message; }
      });
    }
    host.querySelector('[data-action="step"]').addEventListener('click', () => {
      if (Object.values(controls).some((input) => !Number.isFinite(input.valueAsNumber) || !input.validity.valid)) {
        status.textContent = 'Complete the weight and learning-rate fields before taking a step.';
        return;
      }
      try {
        const next = step(state.w0, state.w1, state.alpha);
        state.lastStep = { ...next, old0: state.w0, old1: state.w1 };
        state.w0 = next.w0; state.w1 = next.w1;
        controls.w0.value = String(state.w0); controls.w1.value = String(state.w1);
        status.textContent = ''; draw();
      } catch (error) { status.textContent = error.message; }
    });
    host.querySelector('[data-action="reset"]').addEventListener('click', () => {
      Object.assign(state, { w0: 0, w1: 0, alpha: 0.01, lastStep: null });
      for (const [name, input] of Object.entries(controls)) { input.value = String(state[name]); input.setCustomValidity(''); }
      status.textContent = ''; draw();
    });
    draw();
    return { redraw: draw };
  }

  function sigmoid(z) {
    finite(z, 'z');
    if (z >= 0) return 1 / (1 + Math.exp(-z));
    const ez = Math.exp(z);
    return ez / (1 + ez);
  }

  function softplus(z) {
    finite(z, 'z');
    return Math.max(z, 0) + Math.log1p(Math.exp(-Math.abs(z)));
  }

  function logistic(z, y) {
    finite(z, 'z');
    if (y !== 0 && y !== 1) throw new RangeError('The true label must be 0 or 1.');
    // This branch avoids log(0), exponential overflow and subtractive loss of
    // precision when a large positive score correctly predicts label 1.
    return { z, y, probability: sigmoid(z), observedProbability: sigmoid(y === 1 ? z : -z), loss: softplus(y === 1 ? -z : z) };
  }

  function mountLogistic(host) {
    const ids = { z: uid('logistic-z'), y: uid('logistic-y') };
    const state = { z: 0, y: 1 };
    host.innerHTML = `<h3>Sigmoid and binary cross-entropy</h3>
      <p>Move the score z, then change the true label to see which confident predictions are costly.</p>
      <div class="visual-controls">
        <label for="${ids.z}">Score z <input id="${ids.z}" data-control="z" type="range" min="-8" max="8" step="0.1" value="0"><output for="${ids.z}" data-score>0</output></label>
        <label for="${ids.y}">True label y <select id="${ids.y}" data-control="y"><option value="1">1 — positive</option><option value="0">0 — negative</option></select></label>
      </div>
      <div class="visual-actions"><button class="btn ghost" type="button" data-action="reset">Reset</button></div>
      <div class="visual-chart" data-chart="logistic"></div>
      <div class="visual-results" aria-live="polite" aria-atomic="true" data-results></div>
      <p class="visual-equation" data-probability></p>
      <p class="visual-equation" data-loss></p>
      <p class="visual-note">Changing y changes the loss. For a fixed z, the sigmoid probability stays the same. These logarithms use natural ln, so the loss is in nats.</p>
      <p class="visual-note">Cross-entropy rewards confidence in the correct label and penalises confidence in the wrong one. The curve displays P(y = 1), even when the true label is 0.</p>`;
    const chart = host.querySelector('[data-chart]');
    const score = host.querySelector('[data-score]');
    const results = host.querySelector('[data-results]');
    const probabilityText = host.querySelector('[data-probability]');
    const lossText = host.querySelector('[data-loss]');
    const zInput = host.querySelector('[data-control="z"]');
    const yInput = host.querySelector('[data-control="y"]');

    function draw() {
      const current = logistic(state.z, state.y);
      score.value = fmt(state.z, 1);
      chart.innerHTML = plot(chart, {
        title: 'Sigmoid probability at the selected score',
        description: `The sigmoid curve maps score z to the probability of label 1. At z ${state.z}, that probability is ${current.probability}. The true label is ${state.y}.`,
        xLabel: 'Score z', yLabel: 'P(y = 1)', xMin: -8.5, xMax: 8.5, yMin: -0.05, yMax: 1.05,
        xTicks: [-8, -4, 0, 4, 8].map((value) => ({ value, label: String(value) })),
        yTicks: [0, 0.25, 0.5, 0.75, 1].map((value) => ({ value, label: String(value) })),
        draw: ({ sx, sy, right }) => {
          const path = Array.from({ length: 171 }, (_, i) => {
            const z = -8.5 + i / 10;
            return `${i ? 'L' : 'M'}${sx(z)},${sy(sigmoid(z))}`;
          }).join(' ');
          const anchor = state.z > 4 ? 'end' : 'start';
          const dx = state.z > 4 ? -8 : 8;
          const dy = current.probability > 0.8 ? 18 : -10;
          return `<line x1="${sx(-8)}" x2="${sx(8)}" y1="${sy(state.y)}" y2="${sy(state.y)}" stroke="var(--line)" stroke-dasharray="5 4"/>
            <text x="${right - 5}" y="${sy(state.y) + (state.y ? 15 : -7)}" text-anchor="end" fill="var(--ink-2)" font-size="12">true label y = ${state.y}</text>
            <path d="${path}" fill="none" stroke="var(--theory)" stroke-width="2.5"/>
            <line x1="${sx(state.z)}" x2="${sx(state.z)}" y1="${sy(0)}" y2="${sy(current.probability)}" stroke="var(--accent)" stroke-dasharray="4 4"/>
            <circle cx="${sx(state.z)}" cy="${sy(current.probability)}" r="5" fill="var(--accent)"/>
            <text x="${sx(state.z) + dx}" y="${sy(current.probability) + dy}" text-anchor="${anchor}" fill="var(--ink-2)" font-size="12">p = ${escape(fmt(current.probability, 3))}</text>`;
        },
      });
      results.innerHTML = `<div><span>P(y = 1)</span><strong>${escape(fmt(current.probability, 6))}</strong></div><div><span>True label</span><strong>${state.y}</strong></div><div><span>Binary cross-entropy</span><strong>${escape(fmt(current.loss, 6))}</strong></div>`;
      probabilityText.textContent = `p = σ(z) = 1 / [1 + exp(−z)] = 1 / [1 + exp(−(${fmt(state.z, 1)}))] ≈ ${fmt(current.probability, 6)}.`;
      lossText.textContent = `L = −[y ln(p) + (1 − y) ln(1 − p)]. With y = ${state.y}: L = ${state.y ? '−ln(p)' : '−ln(1 − p)'} ≈ −ln(${fmt(current.observedProbability, 6)}) ≈ ${fmt(current.loss, 6)}.`;
    }

    zInput.addEventListener('input', () => { state.z = zInput.valueAsNumber; draw(); });
    yInput.addEventListener('change', () => { state.y = Number(yInput.value); draw(); });
    host.querySelector('[data-action="reset"]').addEventListener('click', () => {
      state.z = 0; state.y = 1; zInput.value = '0'; yInput.value = '1'; draw();
    });
    draw();
    return { redraw: draw };
  }

  V.register('regression', { mount: mountRegression, model: { points, calculate: regression, step } });
  V.register('logistic', { mount: mountLogistic, model: { sigmoid, softplus, calculate: logistic } });
})();
