/* Information gain and SVM geometry. Models are pure; mounting is browser-only. */
(function (root) {
  'use strict';

  const V = root.MLVisuals;
  const { escape: esc, fmt, uid, plot } = V.helpers;

  const FEATURES = Object.freeze({
    Age: 'Age', BloodPressure: 'Blood Pressure', Cholesterol: 'Cholesterol', Smoker: 'Smoker',
  });
  const PATIENTS = Object.freeze([
    { Age: 'Young', BloodPressure: 'High', Cholesterol: 'Normal', Smoker: 'Yes', target: 'Yes' },
    { Age: 'Old', BloodPressure: 'High', Cholesterol: 'High', Smoker: 'No', target: 'No' },
    { Age: 'Middle', BloodPressure: 'Normal', Cholesterol: 'Normal', Smoker: 'Yes', target: 'Yes' },
    { Age: 'Old', BloodPressure: 'Normal', Cholesterol: 'High', Smoker: 'No', target: 'No' },
    { Age: 'Young', BloodPressure: 'High', Cholesterol: 'High', Smoker: 'Yes', target: 'Yes' },
    { Age: 'Old', BloodPressure: 'Normal', Cholesterol: 'High', Smoker: 'No', target: 'No' },
    { Age: 'Middle', BloodPressure: 'Normal', Cholesterol: 'Normal', Smoker: 'Yes', target: 'Yes' },
    { Age: 'Middle', BloodPressure: 'High', Cholesterol: 'High', Smoker: 'No', target: 'No' },
  ].map((row) => Object.freeze(row)));

  function binaryEntropy(yes, no) {
    const n = yes + no;
    if (!n) return 0;
    return [yes, no].reduce((h, count) => count ? h - (count / n) * Math.log2(count / n) : h, 0);
  }

  function informationGain(input = 'Age') {
    const feature = typeof input === 'string' ? input : input.feature || 'Age';
    if (!Object.hasOwn(FEATURES, feature)) throw new RangeError(`Unknown information-gain feature: ${feature}`);
    const yes = PATIENTS.filter((row) => row.target === 'Yes').length;
    const parent = { yes, no: PATIENTS.length - yes, total: PATIENTS.length };
    parent.entropy = binaryEntropy(parent.yes, parent.no);
    const values = [...new Set(PATIENTS.map((row) => row[feature]))];
    const branches = values.map((value) => {
      const rows = PATIENTS.filter((row) => row[feature] === value);
      const y = rows.filter((row) => row.target === 'Yes').length;
      const weight = rows.length / parent.total;
      const entropy = binaryEntropy(y, rows.length - y);
      return { value, yes: y, no: rows.length - y, total: rows.length, weight, entropy, weightedEntropy: weight * entropy };
    });
    const weightedChildEntropy = branches.reduce((sum, branch) => sum + branch.weightedEntropy, 0);
    return { feature, label: FEATURES[feature], parent, branches, weightedChildEntropy, gain: parent.entropy - weightedChildEntropy };
  }

  function mountInformationGain(host) {
    const featureId = uid('gain-feature');
    host.innerHTML = `<h3>Explore information gain from class counts</h3>
      <div class="visual-controls"><label for="${featureId}">Split the homework table by
      <select id="${featureId}" name="feature">${Object.entries(FEATURES).map(([key, label]) => `<option value="${key}">${esc(label)}</option>`).join('')}</select>
      </label></div>
      <p class="visual-note">HW07 Exercise 1: the original eight patient rows. Compare the unsplit parent with each feature branch. Yes and No refer to the target column.</p>
      <p class="visual-note"><span style="color:var(--accent)">■</span> Yes (left bar) &nbsp; <span style="color:var(--theory)">■</span> No (right bar)</p>
      <div class="visual-chart" data-gain-chart></div>
      <div class="visual-results" data-gain-results aria-live="polite" aria-atomic="true"></div>
      <div class="visual-table-wrap"><table class="visual-table"><thead><tr><th scope="col" data-gain-feature-name>Age branch</th><th scope="col">Yes / No</th><th scope="col">Weight</th><th scope="col">Entropy (bits)</th><th scope="col">Weight × entropy</th></tr></thead><tbody data-gain-branches></tbody></table></div>
      <p class="visual-equation" data-gain-equation></p>
      <details><summary>See the eight homework rows</summary><div class="visual-table-wrap"><table class="visual-table">
        <thead><tr><th scope="col">Patient</th><th scope="col">Age</th><th scope="col">Blood Pressure</th><th scope="col">Cholesterol</th><th scope="col">Smoker</th><th scope="col">Heart Disease</th></tr></thead>
        <tbody>${PATIENTS.map((row, i) => `<tr><th scope="row">${i + 1}</th>${['Age', 'BloodPressure', 'Cholesterol', 'Smoker', 'target'].map((key) => `<td>${esc(row[key])}</td>`).join('')}</tr>`).join('')}</tbody>
      </table></div></details>
      <p class="visual-note">Bars count patients, not entropy. A pure branch has entropy 0; a balanced Yes/No branch has entropy 1 bit. The gain subtracts the <em>weighted</em> child entropy. A perfect split of these eight rows does not establish a medical rule for other people.</p>`;
    const select = host.querySelector('[name="feature"]');
    const chart = host.querySelector('[data-gain-chart]');
    const results = host.querySelector('[data-gain-results]');

    function draw() {
      const state = informationGain(select.value);
      const groups = [{ value: 'Parent', ...state.parent }, ...state.branches];
      const maxCount = Math.max(...groups.flatMap((group) => [group.yes, group.no]));
      chart.innerHTML = plot(chart, {
        title: `Class counts before and after splitting by ${state.label}`,
        description: groups.map((group) => `${group.value}: ${group.yes} Yes, ${group.no} No`).join('. '),
        xLabel: 'Group', yLabel: 'Patients', xMin: -0.6, xMax: groups.length - 0.4, yMin: 0, yMax: maxCount + 1,
        xTicks: groups.map((group, i) => ({ value: i, label: group.value })),
        yTicks: Array.from({ length: maxCount + 2 }, (_, i) => ({ value: i, label: String(i) })),
        draw({ sx, sy }) {
          return groups.map((group, i) => {
            return [{ kind: 'Yes', count: group.yes, offset: -0.18, colour: '--accent' }, { kind: 'No', count: group.no, offset: 0.18, colour: '--theory' }].map(({ kind, count, offset, colour }) => {
              const x = sx(i + offset - 0.14);
              const width = sx(i + offset + 0.14) - x;
              return `<rect x="${x}" y="${sy(count)}" width="${width}" height="${sy(0) - sy(count)}" fill="var(${colour})"><title>${esc(group.value)}: ${count} ${kind}</title></rect>
                <text x="${sx(i + offset)}" y="${sy(count) - 8}" text-anchor="middle" fill="var(--ink-2)" font-size="11">${count}</text>`;
            }).join('');
          }).join('');
        },
      });
      results.innerHTML = `<div><span>Parent entropy (${state.parent.yes} Yes / ${state.parent.no} No)</span><strong>${fmt(state.parent.entropy)} bit</strong></div>
        <div><span>Weighted child entropy</span><strong>${fmt(state.weightedChildEntropy, 6)} bits</strong></div>
        <div><span>Information gain: ${esc(state.label)}</span><strong data-gain-value>${fmt(state.gain, 6)} bits</strong></div>`;
      host.querySelector('[data-gain-feature-name]').textContent = `${state.label} branch`;
      host.querySelector('[data-gain-branches]').innerHTML = state.branches.map((branch) => `<tr><th scope="row">${esc(branch.value)}</th><td>${branch.yes} / ${branch.no}</td><td>${branch.total}/${state.parent.total} = ${fmt(branch.weight)}</td><td>${fmt(branch.entropy, 6)}</td><td>${fmt(branch.weightedEntropy, 6)}</td></tr>`).join('');
      host.querySelector('[data-gain-equation]').textContent = `Information gain(${state.label}) = parent entropy − weighted child entropy = ${fmt(state.parent.entropy, 6)} − ${fmt(state.weightedChildEntropy, 6)} = ${fmt(state.gain, 6)} bits.`;
    }
    select.addEventListener('change', draw);
    draw();
    return { redraw: draw };
  }

  const SVM_DEFAULTS = Object.freeze({ w1: 2, w2: 1, b: -3, x: 3, y: 2 });

  function svmGeometry(input = {}) {
    const values = { ...SVM_DEFAULTS, ...input };
    for (const key of Object.keys(SVM_DEFAULTS)) {
      if (!Number.isFinite(values[key])) throw new RangeError(`${key} must be a finite number`);
    }
    const { w1, w2, b, x, y } = values;
    const norm = Math.hypot(w1, w2);
    const score = w1 * x + w2 * y + b;
    const label = score > 0 ? 1 : score < 0 ? -1 : 0;
    if (!norm) return { ...values, norm, score, label, valid: false, foot: null, distance: null, fullMargin: null };
    const signedDistance = score / norm;
    return {
      ...values, norm, score, label, valid: true,
      distance: Math.abs(signedDistance), fullMargin: 2 / norm,
      foot: { x: x - signedDistance * (w1 / norm), y: y - signedDistance * (w2 / norm) },
    };
  }

  // Intersect w1*x + w2*y + b = level with a square plotting window.
  function lineSegment(state, level, extent) {
    const candidates = [];
    const add = (x, y) => {
      const slack = extent * 1e-10;
      if (Number.isFinite(x) && Number.isFinite(y) && x >= -extent - slack && x <= extent + slack && y >= -extent - slack && y <= extent + slack && !candidates.some((p) => Math.hypot(p.x - x, p.y - y) < slack)) candidates.push({ x, y });
    };
    if (state.w2) for (const x of [-extent, extent]) add(x, (level - state.b - state.w1 * x) / state.w2);
    if (state.w1) for (const y of [-extent, extent]) add((level - state.b - state.w2 * y) / state.w1, y);
    return candidates.slice(0, 2);
  }

  function mountSvmGeometry(host) {
    const controls = [
      { name: 'w1', label: 'Weight w₁', min: -5, max: 5 },
      { name: 'w2', label: 'Weight w₂', min: -5, max: 5 },
      { name: 'b', label: 'Bias b', min: -10, max: 10 },
      { name: 'x', label: 'Test point x', min: -6, max: 6 },
      { name: 'y', label: 'Test point y', min: -6, max: 6 },
    ];
    host.innerHTML = `<h3>Explore a linear boundary and its margin geometry</h3>
      <div class="visual-controls">${controls.map((control) => {
      const id = uid(`svm-${control.name}`);
      return `<label for="${id}">${esc(control.label)}: <output data-svm-control-value="${control.name}">${SVM_DEFAULTS[control.name]}</output>
        <input id="${id}" name="${control.name}" type="range" min="${control.min}" max="${control.max}" step="0.25" value="${SVM_DEFAULTS[control.name]}"></label>`;
    }).join('')}</div>
      <div class="visual-actions"><button type="button" class="btn ghost" data-svm-reset>Reset</button></div>
      <div class="visual-chart" data-svm-chart></div>
      <p class="visual-note">Solid line: score 0. Dashed lines: scores +1 and −1. P is the test point; H is its perpendicular foot on the score-0 line. The dotted segment measures their distance.</p>
      <p class="visual-equation" data-svm-equation></p>
      <div class="visual-results" data-svm-results aria-live="polite" aria-atomic="true"></div>
      <p class="visual-note" data-svm-geometry></p>
      <p class="visual-note">This explores the geometry of weights you choose. The strip width 2/‖w⃗‖ belongs to the canonical score lines ±1; it is not automatically a learned maximum-margin SVM. Scaling w⃗ and b together preserves the decision boundary but changes this strip width.</p>`;
    const inputs = Object.fromEntries(controls.map(({ name }) => [name, host.querySelector(`[name="${name}"]`)]));
    const chart = host.querySelector('[data-svm-chart]');
    const results = host.querySelector('[data-svm-results]');

    function draw() {
      const state = svmGeometry(Object.fromEntries(controls.map(({ name }) => [name, Number(inputs[name].value)])));
      controls.forEach(({ name }) => { host.querySelector(`[data-svm-control-value="${name}"]`).textContent = fmt(state[name]); });
      const extent = state.valid ? Math.max(6, Math.abs(state.x), Math.abs(state.y), Math.abs(state.foot.x), Math.abs(state.foot.y), (Math.abs(state.b) + 1) / state.norm) * 1.25 + 0.5 : 8;
      chart.innerHTML = plot(chart, {
        title: state.valid ? 'Linear classifier boundary, score strip, and point projection' : 'Zero weights: no decision hyperplane',
        description: state.valid ? `Point P (${fmt(state.x)}, ${fmt(state.y)}) has score ${fmt(state.score)}, distance ${fmt(state.distance)} from the boundary, and foot H (${fmt(state.foot.x)}, ${fmt(state.foot.y)}).` : 'Both weights are zero. The score is constant, so no boundary line, perpendicular foot, distance, or strip width is defined.',
        xLabel: 'x₁', yLabel: 'x₂', xMin: -extent, xMax: extent, yMin: -extent, yMax: extent, equalAspect: true,
        draw({ sx, sy, left, right, top }) {
          const lines = state.valid ? [0, 1, -1].map((level) => {
            const segment = lineSegment(state, level, extent);
            if (segment.length < 2) return '';
            return `<line x1="${sx(segment[0].x)}" y1="${sy(segment[0].y)}" x2="${sx(segment[1].x)}" y2="${sy(segment[1].y)}" stroke="var(${level ? '--accent' : '--theory'})" stroke-width="${level ? 1.5 : 2.5}"${level ? ' stroke-dasharray="6 4"' : ''}><title>score = ${level}</title></line>`;
          }).join('') : `<text x="${(left + right) / 2}" y="${top + 20}" text-anchor="middle" fill="var(--ink-2)">No hyperplane: both weights are 0</text>`;
          const projection = state.valid ? `<line x1="${sx(state.x)}" y1="${sy(state.y)}" x2="${sx(state.foot.x)}" y2="${sy(state.foot.y)}" stroke="var(--practice)" stroke-width="2" stroke-dasharray="2 4"/>
            <circle cx="${sx(state.foot.x)}" cy="${sy(state.foot.y)}" r="5" fill="none" stroke="var(--theory)" stroke-width="2"/>
            <text x="${sx(state.foot.x) + 8}" y="${sy(state.foot.y) + 17}" fill="var(--ink-2)">H</text>` : '';
          return `${lines}${projection}<circle cx="${sx(state.x)}" cy="${sy(state.y)}" r="5" fill="var(--practice)"><title>Test point P</title></circle>
            <text x="${sx(state.x) + 8}" y="${sy(state.y) - 8}" fill="var(--ink-2)">P</text>`;
        },
      });
      host.querySelector('[data-svm-equation]').innerHTML = `Score = w₁x₁ + w₂x₂ + b = (${fmt(state.w1)}) × (${fmt(state.x)}) + (${fmt(state.w2)}) × (${fmt(state.y)}) + (${fmt(state.b)}) = <strong data-svm-score>${fmt(state.score)}</strong>.`;
      if (!state.valid) {
        results.innerHTML = `<div><span>Boundary</span><strong data-svm-label>No hyperplane</strong></div><div><span>Point-to-boundary distance</span><strong data-svm-distance>Undefined</strong></div><div><span>Canonical ±1 strip width</span><strong data-svm-width>Undefined</strong></div>`;
        host.querySelector('[data-svm-geometry]').textContent = `Both weights are zero: every point has the constant score b = ${fmt(state.b)}. No hyperplane exists, so its perpendicular foot, distance and canonical strip width are undefined.`;
        return;
      }
      const labelText = state.label === 0 ? 'On boundary' : state.label === 1 ? '+1' : '−1';
      results.innerHTML = `<div><span>Predicted label${state.label === 0 ? ' (no sign assigned)' : ''}</span><strong data-svm-label>${labelText}</strong></div>
        <div><span>Distance = |score| / ‖w⃗‖</span><strong data-svm-distance>${fmt(state.distance)}</strong></div>
        <div><span>Canonical ±1 width = 2 / ‖w⃗‖</span><strong data-svm-width>${fmt(state.fullMargin)}</strong></div>`;
      host.querySelector('[data-svm-geometry]').textContent = `Weight length ‖w⃗‖ = √(w₁² + w₂²) = ${fmt(state.norm)}. Distance = ${fmt(Math.abs(state.score))} / ${fmt(state.norm)} = ${fmt(state.distance)}. Perpendicular foot H = (${fmt(state.foot.x)}, ${fmt(state.foot.y)}).`;
    }
    controls.forEach(({ name }) => inputs[name].addEventListener('input', draw));
    host.querySelector('[data-svm-reset]').addEventListener('click', () => {
      controls.forEach(({ name }) => { inputs[name].value = SVM_DEFAULTS[name]; });
      draw();
    });
    draw();
    return { redraw: draw };
  }

  V.register('information-gain', { mount: mountInformationGain, model: informationGain });
  V.register('svm-geometry', { mount: mountSvmGeometry, model: svmGeometry });
})(globalThis);
