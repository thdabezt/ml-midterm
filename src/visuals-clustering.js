/* Interactive HW08 clustering. The models are pure and can run in Node;
   controls and SVGs are created only when a panel is mounted. */
(function (root) {
  'use strict';

  const V = root.MLVisuals;
  const { escape, fmt, uid, plot } = V.helpers;
  const POINTS = Object.freeze([
    ['A1', 2, 10], ['A2', 2, 5], ['A3', 8, 4], ['A4', 5, 8],
    ['A5', 7, 5], ['A6', 6, 4], ['A7', 1, 2], ['A8', 4, 9],
  ].map(([id, x, y]) => Object.freeze({ id, x, y })));
  const INITIAL_CENTERS = Object.freeze([0, 3, 6].map((i) => Object.freeze({ x: POINTS[i].x, y: POINTS[i].y })));
  const PALETTE = ['var(--accent)', 'var(--theory)', 'var(--practice)', 'var(--bad)', 'var(--good)', 'var(--warn)'];
  const color = (label) => label < 0 ? 'var(--ink-3)' : PALETTE[label % PALETTE.length];
  const squaredDistance = (a, b) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
  const copyCenters = (centers) => centers.map(({ x, y }) => ({ x, y }));
  const coordinate = (p) => `(${fmt(p.x)}, ${fmt(p.y)})`;
  const members = (points, indices) => indices.map((i) => points[i].id).join(', ') || 'None';
  const options = () => POINTS.map((p, i) => `<option value="${i}">${escape(p.id)} ${escape(coordinate(p))}</option>`).join('');
  const checkPoints = (points) => {
    if (!Array.isArray(points) || points.some((p) => !Number.isFinite(p.x) || !Number.isFinite(p.y))) throw new Error('Clustering points need finite x and y coordinates.');
  };

  function assign(points, centers) {
    checkPoints(points); checkPoints(centers);
    if (!centers.length) throw new Error('K-means needs at least one centre.');
    const distances = points.map((p) => centers.map((c) => squaredDistance(p, c)));
    // A strict comparison keeps the first centre when two distances are tied.
    const labels = distances.map((row) => row.reduce((best, value, i) => value < row[best] ? i : best, 0));
    const groups = centers.map((_, k) => points.map((__, i) => i).filter((i) => labels[i] === k));
    return { distances, labels, groups };
  }

  function initialState(centers = INITIAL_CENTERS) {
    checkPoints(centers);
    if (!centers.length) throw new Error('K-means needs at least one centre.');
    return {
      epoch: 0, centers: copyCenters(centers), assignmentCenters: copyCenters(centers),
      labels: null, distances: [], groups: centers.map(() => []), emptyClusters: [], converged: false,
    };
  }

  function step(state, points = POINTS) {
    if (state.converged) return state;
    const assignmentCenters = copyCenters(state.centers);
    const assigned = assign(points, assignmentCenters);
    const emptyClusters = [];
    const centers = assigned.groups.map((indices, k) => {
      if (!indices.length) { emptyClusters.push(k); return { ...assignmentCenters[k] }; }
      return {
        x: indices.reduce((sum, i) => sum + points[i].x, 0) / indices.length,
        y: indices.reduce((sum, i) => sum + points[i].y, 0) / indices.length,
      };
    });
    return {
      epoch: state.epoch + 1, centers, assignmentCenters, ...assigned, emptyClusters,
      converged: centers.every((c, k) => c.x === assignmentCenters[k].x && c.y === assignmentCenters[k].y),
    };
  }

  function analyze(points = POINTS, eps = 2, minSamples = 2) {
    checkPoints(points);
    if (!Number.isFinite(eps) || eps < 0 || !Number.isInteger(minSamples) || minSamples < 1) throw new Error('DBSCAN needs a nonnegative radius and a positive integer minimum count.');
    const radiusSquared = eps * eps;
    const neighbors = points.map((p) => points.flatMap((q, j) => {
      const distanceSquared = squaredDistance(p, q);
      // Relative roundoff protection includes sqrt(10)'s exact boundary, while
      // radius zero still includes only coincident points.
      const tolerance = Number.EPSILON * 16 * Math.max(radiusSquared, distanceSquared);
      return distanceSquared <= radiusSquared + tolerance ? [j] : [];
    }));
    const core = neighbors.map((ns) => ns.length >= minSamples);
    const labels = points.map(() => -1);
    const coreComponents = [];
    for (let start = 0; start < points.length; start++) {
      if (!core[start] || labels[start] >= 0) continue;
      const label = coreComponents.length; const component = []; const queue = [start];
      labels[start] = label;
      while (queue.length) {
        const i = queue.shift(); component.push(i);
        for (const j of neighbors[i]) if (core[j] && labels[j] < 0) { labels[j] = label; queue.push(j); }
      }
      coreComponents.push(component.sort((a, b) => a - b));
    }
    const types = points.map((_, i) => {
      if (core[i]) return 'core';
      const touching = neighbors[i].filter((j) => core[j]).map((j) => labels[j]);
      if (!touching.length) return 'noise';
      // A shared border joins the first core component; it cannot connect them.
      labels[i] = Math.min(...touching);
      return 'border';
    });
    const clusters = coreComponents.map((_, label) => points.map((__, i) => i).filter((i) => labels[i] === label));
    const counts = {
      clusters: clusters.length,
      core: types.filter((t) => t === 'core').length,
      border: types.filter((t) => t === 'border').length,
      noise: types.filter((t) => t === 'noise').length,
    };
    return { eps, minSamples, neighbors, core, coreComponents, types, labels, clusters, counts };
  }

  function pointLabel(p, sx, sy) {
    const offsets = { A3: [8, 14], A6: [-22, 14] };
    const [dx, dy] = offsets[p.id] || [8, -9];
    return `<text x="${sx(p.x) + dx}" y="${sy(p.y) + dy}" fill="var(--ink)" font-size="12">${escape(p.id)}</text>`;
  }

  function mountKmeans(host) {
    let state = initialState(); let selected = 7;
    const pointId = uid('kmeans-point');
    host.innerHTML = `<h3>Step through HW08 K-means</h3><p>Start at A1, A4 and A7. Each step assigns every point using the same three centres, then averages each assigned group.</p><div class="visual-controls"><label for="${pointId}">Inspect a point<select id="${pointId}" data-kmeans-point>${options()}</select></label></div>
      <div class="visual-actions"><button type="button" class="btn" data-kmeans-step>Step one full epoch</button><button type="button" class="btn ghost" data-kmeans-reset>Reset to HW08 seeds</button></div>
      <p class="visual-note" data-kmeans-status aria-live="polite"></p>
      <div class="visual-chart" data-kmeans-chart></div>
      <p class="visual-note">Small circles are data points. Their colours show the assignment <b>before the latest mean update</b>. Diamonds are updated centres; dashed rings show the previous centres when they moved. Equal-distance ties go to the lower cluster number.</p>
      <div data-kmeans-results></div>
      <div class="visual-equation" data-kmeans-distances aria-live="polite"></div>`;
    const chart = host.querySelector('[data-kmeans-chart]');
    const results = host.querySelector('[data-kmeans-results]');
    const distanceOutput = host.querySelector('[data-kmeans-distances]');
    const stepButton = host.querySelector('[data-kmeans-step]');
    const pointSelect = host.querySelector('[data-kmeans-point]');
    pointSelect.value = String(selected);

    function draw() {
      stepButton.disabled = state.converged;
      host.querySelector('[data-kmeans-status]').textContent = state.epoch === 0
        ? 'Epoch 0: seeds are A1, A4 and A7. Step once to reproduce HW08 Exercise 1.'
        : `Epoch ${state.epoch} complete: assigned all eight points, then updated all three means.${state.converged ? ' Converged: the centres did not move, so another epoch would keep the same assignments.' : ' No extra reassignment has been performed.'}`;
      chart.innerHTML = plot(chart, {
        title: `HW08 K-means, epoch ${state.epoch}`,
        description: 'Eight labelled homework points, coloured by their last batch assignment, with diamond markers for centres. The table below lists memberships and centre coordinates.',
        xLabel: 'x coordinate', yLabel: 'y coordinate', xMin: 0, xMax: 10, yMin: 0, yMax: 12,
        draw: ({ sx, sy }) => {
          let svg = '';
          if (state.labels) POINTS.forEach((p, i) => {
            const c = state.assignmentCenters[state.labels[i]];
            svg += `<line x1="${sx(p.x)}" y1="${sy(p.y)}" x2="${sx(c.x)}" y2="${sy(c.y)}" stroke="${color(state.labels[i])}" stroke-opacity="0.24" stroke-dasharray="3 4"/>`;
          });
          state.assignmentCenters.forEach((c, k) => {
            if (!state.epoch || squaredDistance(c, state.centers[k]) === 0) return;
            svg += `<circle cx="${sx(c.x)}" cy="${sy(c.y)}" r="11" fill="none" stroke="${color(k)}" stroke-width="2" stroke-dasharray="3 3"/>`;
          });
          POINTS.forEach((p, i) => {
            const fill = state.labels ? color(state.labels[i]) : 'var(--ink-3)';
            if (i === selected) svg += `<circle cx="${sx(p.x)}" cy="${sy(p.y)}" r="10" fill="none" stroke="var(--ink)" stroke-width="2"/>`;
            svg += `<circle cx="${sx(p.x)}" cy="${sy(p.y)}" r="5" fill="${fill}" stroke="var(--panel)" stroke-width="1.5"/>${pointLabel(p, sx, sy)}`;
          });
          state.centers.forEach((c, k) => {
            const x = sx(c.x); const y = sy(c.y);
            const [dx, dy] = [[-30, 12], [-24, -10], [11, 3]][k];
            svg += `<path d="M ${x} ${y - 8} L ${x + 8} ${y} L ${x} ${y + 8} L ${x - 8} ${y} Z" fill="none" stroke="${color(k)}" stroke-width="3"/><text x="${x + dx}" y="${y + dy}" fill="${color(k)}" font-size="12" font-weight="600">C${k + 1}</text>`;
          });
          return svg;
        },
      });
      results.innerHTML = `<div class="visual-table-wrap"><table class="visual-table"><caption>Epoch ${state.epoch}: memberships and centres</caption><thead><tr><th scope="col">Cluster</th><th scope="col">Used for assignment</th><th scope="col">Members from that assignment</th><th scope="col">${state.epoch ? 'Updated mean' : 'Starting centre'}</th></tr></thead><tbody>${state.centers.map((c, k) => `<tr><th scope="row" style="color:${color(k)}">C${k + 1}</th><td>${escape(coordinate(state.assignmentCenters[k]))}</td><td>${state.labels ? escape(members(POINTS, state.groups[k])) : 'Not assigned yet'}</td><td>${escape(coordinate(c))}</td></tr>`).join('')}</tbody></table></div>`;
      const point = POINTS[selected];
      const distances = state.assignmentCenters.map((c) => squaredDistance(point, c));
      const chosen = assign([point], state.assignmentCenters).labels[0];
      distanceOutput.innerHTML = `<p><b>${escape(point.id)} ${escape(coordinate(point))}</b>: squared Euclidean distance = (x − centre x)² + (y − centre y)².</p><div class="visual-table-wrap"><table class="visual-table"><thead><tr><th scope="col">${state.epoch ? 'Centre used in the latest assignment' : 'Seed for the first assignment'}</th><th scope="col">Squared distance</th><th scope="col">Euclidean distance</th></tr></thead><tbody>${distances.map((d, k) => `<tr><th scope="row">C${k + 1} ${escape(coordinate(state.assignmentCenters[k]))}</th><td>${fmt(d)}</td><td>${fmt(Math.sqrt(d))}</td></tr>`).join('')}</tbody></table></div><p>${state.epoch ? 'Last assignment' : 'First assignment would be'}: <b>C${chosen + 1}</b>, the smallest squared distance.${state.epoch ? ' These distances use the centres before the latest update, matching the plotted membership colours.' : ''}</p>`;
    }
    stepButton.addEventListener('click', () => { state = step(state); draw(); });
    host.querySelector('[data-kmeans-reset]').addEventListener('click', () => { state = initialState(); draw(); });
    pointSelect.addEventListener('change', () => { selected = Number(pointSelect.value); draw(); });
    draw();
    return { redraw: draw };
  }

  function mountDbscan(host) {
    let eps = 2; let minSamples = 2; let selected = 1;
    const epsId = uid('dbscan-eps'); const minId = uid('dbscan-min'); const pointId = uid('dbscan-point');
    host.innerHTML = `<h3>Explore HW08 DBSCAN neighbourhoods</h3><p>Change the radius or the minimum count, then inspect any point to see why it is core, border or noise.</p><div class="visual-controls"><label for="${epsId}">Neighbourhood radius ε <output data-dbscan-eps-value></output><input id="${epsId}" data-dbscan-eps type="range" min="0" max="5" step="0.05" value="2"></label><label for="${minId}">Minimum samples, including self<select id="${minId}" data-dbscan-min><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option></select></label><label for="${pointId}">Inspect a point<select id="${pointId}" data-dbscan-point>${options()}</select></label></div>
      <div class="visual-actions"><button type="button" class="btn ghost" data-dbscan-preset="2">HW08: ε = 2</button><button type="button" class="btn ghost" data-dbscan-preset="sqrt10">HW08: ε = √10 exactly</button></div>
      <div class="visual-chart" data-dbscan-chart></div>
      <p class="visual-note">● Filled circle: core. ○ Hollow circle: border. × Cross: noise. Colours identify clusters; an outlined ring marks the inspected point. The shaded ellipse is a Euclidean circle in data coordinates, allowing for the two axis scales.</p>
      <div data-dbscan-results aria-live="polite"></div>
      <p class="visual-note">Euclidean distance; neighbours at exactly ε are included, and each point counts itself. Only connected <b>core</b> points grow clusters. A shared border joins the first core component and cannot merge components.</p>`;
    const epsInput = host.querySelector('[data-dbscan-eps]');
    const minInput = host.querySelector('[data-dbscan-min]');
    const pointSelect = host.querySelector('[data-dbscan-point]');
    const chart = host.querySelector('[data-dbscan-chart]');
    const results = host.querySelector('[data-dbscan-results]');
    pointSelect.value = String(selected);

    function draw() {
      const result = analyze(POINTS, eps, minSamples); const inspected = POINTS[selected];
      const exactRoot = eps === Math.sqrt(10);
      host.querySelector('[data-dbscan-eps-value]').textContent = exactRoot ? `= √10 ≈ ${fmt(eps)} (exact preset)` : `= ${fmt(eps)}`;
      host.querySelectorAll('[data-dbscan-preset]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.dbscanPreset === 'sqrt10' ? exactRoot : eps === 2)));
      chart.innerHTML = plot(chart, {
        title: `HW08 DBSCAN: radius ${exactRoot ? 'square root of 10' : fmt(eps)}, minimum count ${minSamples}`,
        description: `Eight labelled homework points: ${result.counts.clusters} clusters, ${result.counts.core} core, ${result.counts.border} border and ${result.counts.noise} noise points. The inspected point's radius neighbourhood is shaded; its neighbours are listed below.`,
        xLabel: 'x coordinate', yLabel: 'y coordinate', xMin: 0, xMax: 10, yMin: 0, yMax: 12,
        draw: ({ sx, sy }) => {
          const rx = Math.abs(sx(inspected.x + eps) - sx(inspected.x));
          const ry = Math.abs(sy(inspected.y + eps) - sy(inspected.y));
          let svg = `<ellipse cx="${sx(inspected.x)}" cy="${sy(inspected.y)}" rx="${rx}" ry="${ry}" fill="var(--accent-soft)" fill-opacity="0.55" stroke="var(--accent)" stroke-width="1.5" stroke-dasharray="5 4"/>`;
          POINTS.forEach((p, i) => {
            const x = sx(p.x); const y = sy(p.y); const ink = color(result.labels[i]);
            if (i === selected) svg += `<circle cx="${x}" cy="${y}" r="11" fill="none" stroke="var(--ink)" stroke-width="2"/>`;
            if (result.types[i] === 'noise') svg += `<path d="M ${x - 5} ${y - 5} L ${x + 5} ${y + 5} M ${x - 5} ${y + 5} L ${x + 5} ${y - 5}" stroke="var(--ink-3)" stroke-width="2.5"/>`;
            else svg += `<circle cx="${x}" cy="${y}" r="6" fill="${result.types[i] === 'core' ? ink : 'var(--panel)'}" stroke="${ink}" stroke-width="2.5"/>`;
            svg += pointLabel(p, sx, sy);
          });
          return svg;
        },
      });
      const noise = result.types.flatMap((t, i) => t === 'noise' ? [i] : []);
      const border = result.types.flatMap((t, i) => t === 'border' ? [i] : []);
      results.innerHTML = `<div class="visual-results"><div><span>Clusters</span><strong>${result.counts.clusters}</strong></div><div><span>Core points</span><strong>${result.counts.core}</strong></div><div><span>Border points</span><strong>${result.counts.border}</strong></div><div><span>Noise points</span><strong>${result.counts.noise}</strong></div></div><p><b>${escape(inspected.id)} neighbourhood:</b> ${escape(members(POINTS, result.neighbors[selected]))}. Count = <b>${result.neighbors[selected].length}</b>, including self; ${result.neighbors[selected].length >= minSamples ? 'meets' : 'does not meet'} minimum ${minSamples}. Type: <b>${result.types[selected]}</b>${result.labels[selected] < 0 ? '' : `, cluster C${result.labels[selected] + 1}`}.</p><ul>${result.clusters.map((group, label) => `<li><b style="color:${color(label)}">C${label + 1}</b>: ${escape(members(POINTS, group))}</li>`).join('')}<li><b>Border:</b> ${escape(members(POINTS, border))}</li><li><b>Noise:</b> ${escape(members(POINTS, noise))}</li></ul><div class="visual-table-wrap"><table class="visual-table"><caption>Every point's neighbourhood and type</caption><thead><tr><th scope="col">Point</th><th scope="col">Neighbours, including self</th><th scope="col">Count</th><th scope="col">Type</th><th scope="col">Cluster</th></tr></thead><tbody>${POINTS.map((p, i) => `<tr><th scope="row">${escape(p.id)}</th><td>${escape(members(POINTS, result.neighbors[i]))}</td><td>${result.neighbors[i].length}</td><td>${result.types[i]}</td><td>${result.labels[i] < 0 ? 'None' : `C${result.labels[i] + 1}`}</td></tr>`).join('')}</tbody></table></div>${minSamples === 2 && (eps === 2 || exactRoot) ? '<p class="visual-note">At minimum 2, raising ε from 2 to √10 creates a new A2/A7 cluster from noise. Cluster count can rise when former noise becomes a cluster.</p>' : ''}`;
    }
    epsInput.addEventListener('input', () => { eps = Number(epsInput.value); draw(); });
    minInput.addEventListener('change', () => { minSamples = Number(minInput.value); draw(); });
    pointSelect.addEventListener('change', () => { selected = Number(pointSelect.value); draw(); });
    host.querySelectorAll('[data-dbscan-preset]').forEach((button) => button.addEventListener('click', () => {
      eps = button.dataset.dbscanPreset === 'sqrt10' ? Math.sqrt(10) : 2;
      epsInput.value = String(eps); draw();
    }));
    draw();
    return { redraw: draw };
  }

  V.register('kmeans', {
    mount: mountKmeans,
    model: { points: POINTS, initialCenters: INITIAL_CENTERS, squaredDistance, assign, initialState, step },
  });
  V.register('dbscan', {
    mount: mountDbscan,
    model: { points: POINTS, squaredDistance, analyze },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
