/* Small, local lesson experiments. Classic scripts share this registry; the
   numerical models also run in Node so their answers can be checked directly. */
(function () {
  'use strict';
  const panels = new Map();
  let sequence = 0;
  const escape = (value) => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const fmt = (value, digits = 3) => {
    if (value === Infinity) return '∞';
    if (value === -Infinity) return '−∞';
    if (!Number.isFinite(value)) return '—';
    return Number(value.toFixed(digits)).toString();
  };
  const uid = (prefix = 'visual') => `${prefix}-${++sequence}`;

  function plot(host, options) {
    const { title, description = '', xLabel = '', yLabel = '', xMin, xMax, yMin, yMax, draw, equalAspect = false } = options;
    if (![xMin, xMax, yMin, yMax].every(Number.isFinite) || xMin >= xMax || yMin >= yMax) throw new RangeError('Plot ranges must be finite and increasing');
    const width = Math.max(240, Math.floor(host.clientWidth || 600));
    const height = 300;
    let left = 46; let right = width - 18; let top = 28; let bottom = height - 44;
    if (equalAspect) {
      const scale = Math.min((right - left) / (xMax - xMin), (bottom - top) / (yMax - yMin));
      const w = scale * (xMax - xMin); const h = scale * (yMax - yMin);
      left += (right - left - w) / 2; right = left + w;
      top += (bottom - top - h) / 2; bottom = top + h;
    }
    const sx = (x) => left + (x - xMin) * (right - left) / (xMax - xMin);
    const sy = (y) => bottom - (y - yMin) * (bottom - top) / (yMax - yMin);
    const ticks = (min, max) => Array.from({ length: 5 }, (_, i) => ({ value: min + (max - min) * i / 4, label: fmt(min + (max - min) * i / 4, 2) }));
    const xTicks = options.xTicks || ticks(xMin, xMax);
    const yTicks = options.yTicks || ticks(yMin, yMax);
    const titleId = uid('plot-title'); const clipId = uid('plot-clip');
    const grid = yTicks.map(({ value, label }) => `<line x1="${left}" x2="${right}" y1="${sy(value)}" y2="${sy(value)}" stroke="var(--line)"/><text x="${left - 7}" y="${sy(value) + 4}" text-anchor="end">${escape(label)}</text>`).join('');
    const xAxis = xTicks.map(({ value, label }) => `<line x1="${sx(value)}" x2="${sx(value)}" y1="${bottom}" y2="${bottom + 4}" stroke="var(--line)"/><text x="${sx(value)}" y="${bottom + 19}" text-anchor="middle">${escape(label)}</text>`).join('');
    return `<svg class="visual-plot" viewBox="0 0 ${width} ${height}" width="100%" height="${height}" role="img" aria-labelledby="${titleId}"><title id="${titleId}">${escape(title)}</title><desc>${escape(description)}</desc><defs><clipPath id="${clipId}"><rect x="${left - 6}" y="${top - 6}" width="${right - left + 12}" height="${bottom - top + 12}"/></clipPath></defs>${grid}${xAxis}<line x1="${left}" x2="${right}" y1="${bottom}" y2="${bottom}" stroke="var(--ink-3)"/><line x1="${left}" x2="${left}" y1="${top}" y2="${bottom}" stroke="var(--ink-3)"/><text x="${left}" y="15">${escape(yLabel)}</text><text x="${(left + right) / 2}" y="${height - 4}" text-anchor="middle">${escape(xLabel)}</text><g clip-path="url(#${clipId})">${draw({ sx, sy, width, height, left, right, top, bottom })}</g></svg>`;
  }

  const models = Object.create(null);
  function register(key, panel) {
    if (!/^[a-z][a-z0-9-]*$/.test(key) || panels.has(key) || typeof panel.mount !== 'function') throw new Error(`Invalid or duplicate lesson visual: ${key}`);
    panels.set(key, panel); models[key] = panel.model;
  }
  function mountVisuals(root) {
    const cleanups = [];
    for (const host of root.querySelectorAll('[data-visual]')) {
      const panel = panels.get(host.dataset.visual);
      if (!panel) continue;
      const mounted = panel.mount(host) || {};
      if (typeof ResizeObserver !== 'undefined' && mounted.redraw) {
        let width = host.clientWidth;
        const observer = new ResizeObserver(() => {
          if (Math.abs(host.clientWidth - width) < 1) return;
          width = host.clientWidth; mounted.redraw();
        });
        observer.observe(host); cleanups.push(() => observer.disconnect());
      }
      if (mounted.dispose) cleanups.push(mounted.dispose);
    }
    return () => cleanups.forEach((cleanup) => cleanup());
  }
  globalThis.MLVisuals = { helpers: { escape, fmt, uid, plot }, models, register, get: (key) => panels.get(key), mountVisuals };

  function binaryInformation(p, q, base = 'bits') {
    if (![p, q].every((x) => Number.isFinite(x) && x >= 0 && x <= 1) || !['bits', 'nats'].includes(base)) throw new RangeError('Use probabilities from 0 to 1 and bits or nats');
    const divisor = base === 'bits' ? Math.LN2 : 1;
    const weightedLog = (weight, probability) => weight === 0 ? 0 : probability === 0 ? Infinity : -weight * Math.log(probability) / divisor;
    const terms = [p, 1 - p].map((weight, i) => {
      const predicted = i === 0 ? q : 1 - q;
      return { p: weight, q: predicted, entropy: weightedLog(weight, weight), crossEntropy: weightedLog(weight, predicted) };
    });
    const entropy = terms.reduce((sum, term) => sum + term.entropy, 0);
    const crossEntropy = terms.reduce((sum, term) => sum + term.crossEntropy, 0);
    return { p, q, base, terms, entropy, crossEntropy, kl: Math.max(0, crossEntropy - entropy) };
  }

  function mountInformation(host) {
    const id = uid('information');
    host.innerHTML = `<h3>Explore entropy, cross-entropy and KL</h3><p>Compare the actual proportions P with the predicted proportions Q. Move Q away from P to see the extra loss.</p>
      <div class="visual-controls"><label for="${id}-p">Actual P(outcome 1): <output data-value="p">0.5</output><input id="${id}-p" data-control="p" type="range" min="0" max="100" step="1" value="50"></label><label for="${id}-q">Predicted Q(outcome 1): <output data-value="q">0.75</output><input id="${id}-q" data-control="q" type="range" min="0" max="100" step="1" value="75"></label><label for="${id}-base">Logarithm units<select id="${id}-base" data-control="base"><option value="bits">Bits (log₂)</option><option value="nats">Nats (ln)</option></select></label></div>
      <div class="visual-actions"><button class="btn ghost" type="button" data-match>Match Q to P</button></div>
      <div data-distributions class="visual-distributions"></div><div class="visual-chart" data-chart></div>
      <p class="visual-note">Solid curve: cross-entropy. Dashed horizontal line: entropy H(P). The dot marks your current Q.</p>
      <div class="visual-results" data-results aria-live="polite"></div><p class="visual-equation" data-equation></p>
      <div class="visual-table-wrap"><table class="visual-table"><thead><tr><th>Outcome</th><th>P</th><th>Q</th><th>−P log P</th><th>−P log Q</th></tr></thead><tbody data-terms></tbody></table></div>
      <p class="visual-note" data-note></p>`;
    const pInput = host.querySelector('[data-control="p"]'); const qInput = host.querySelector('[data-control="q"]'); const baseInput = host.querySelector('[data-control="base"]');
    const chart = host.querySelector('[data-chart]');
    function draw() {
      const value = binaryInformation(Number(pInput.value) / 100, Number(qInput.value) / 100, baseInput.value);
      const { p, q, entropy, crossEntropy, kl, terms, base } = value;
      host.querySelector('[data-value="p"]').textContent = fmt(p, 2); host.querySelector('[data-value="q"]').textContent = fmt(q, 2);
      host.querySelector('[data-distributions]').innerHTML = [{ name: 'Actual P', values: [p, 1 - p], color: 'var(--accent)' }, { name: 'Predicted Q', values: [q, 1 - q], color: 'var(--theory)' }].map((distribution) => `<div><b>${distribution.name}</b>${distribution.values.map((probability, i) => `<div class="visual-prob-row"><span>Outcome ${i + 1}</span><span class="visual-prob-track"><span style="width:${probability * 100}%;background:${distribution.color}"></span></span><span>${fmt(probability, 2)}</span></div>`).join('')}</div>`).join('');
      const ymax = base === 'bits' ? 7 : 5;
      chart.innerHTML = plot(chart, { title: 'Cross-entropy is smallest when prediction Q matches actual P', description: `Actual outcome-1 proportion ${fmt(p)}. Current cross-entropy ${fmt(crossEntropy)} ${base}; entropy floor ${fmt(entropy)} ${base}. Infinite endpoints are omitted from the curve.`, xLabel: 'Predicted Q(outcome 1)', yLabel: `Loss (${base})`, xMin: 0, xMax: 1, yMin: 0, yMax: ymax, draw: ({ sx, sy, left, right, top }) => {
        const curve = Array.from({ length: 199 }, (_, i) => { const x = (i + 1) / 200; return `${i ? 'L' : 'M'}${sx(x)},${sy(binaryInformation(p, x, base).crossEntropy)}`; }).join(' ');
        const pointY = Number.isFinite(crossEntropy) ? sy(crossEntropy) : top;
        const labelX = Math.max(left + 55, Math.min(right - 55, sx(q)));
        return `<path d="${curve}" fill="none" stroke="var(--theory)" stroke-width="2.5"/><line x1="${left}" x2="${right}" y1="${sy(entropy)}" y2="${sy(entropy)}" stroke="var(--good)" stroke-width="1.5" stroke-dasharray="5 4"/><circle cx="${sx(q)}" cy="${pointY}" r="5" fill="var(--practice)"/><text x="${labelX}" y="${Math.max(top + 14, pointY - 10)}" text-anchor="middle">Q=${fmt(q, 2)}${Number.isFinite(crossEntropy) ? '' : ', loss ∞'}</text>`;
      } });
      host.querySelector('[data-results]').innerHTML = `<div><span>Entropy H(P)</span><strong>${fmt(entropy)} ${base}</strong></div><div><span>Cross-entropy H(P,Q)</span><strong>${fmt(crossEntropy)} ${base}</strong></div><div><span>KL: extra loss</span><strong>${fmt(kl)} ${base}</strong></div>`;
      host.querySelector('[data-equation]').textContent = `H(P,Q) = H(P) + KL(P‖Q) = ${fmt(entropy)} + ${fmt(kl)} = ${fmt(crossEntropy)} ${base}`;
      host.querySelector('[data-terms]').innerHTML = terms.map((term, i) => `<tr><td>${i + 1}</td><td>${fmt(term.p, 2)}</td><td>${fmt(term.q, 2)}</td><td>${fmt(term.entropy)}</td><td>${fmt(term.crossEntropy)}</td></tr>`).join('');
      host.querySelector('[data-note]').textContent = !Number.isFinite(crossEntropy) ? 'Q assigns zero probability to an outcome that actually occurs: cross-entropy and KL are infinite. The curve omits its infinite endpoints; the displayed result is exact.' : kl < 1e-12 ? 'P and Q match: cross-entropy equals entropy and KL is zero. Zero-weight terms contribute 0, including 0 log 0.' : 'Entropy depends only on P. Cross-entropy adds the extra loss from a mismatched Q; KL measures that gap. The per-outcome contributions add to the totals above.';
    }
    host.addEventListener('input', draw);
    host.addEventListener('change', draw);
    host.querySelector('[data-match]').addEventListener('click', () => { qInput.value = pInput.value; draw(); });
    draw(); return { redraw: draw };
  }
  register('information', { mount: mountInformation, model: { binaryInformation } });
})();
