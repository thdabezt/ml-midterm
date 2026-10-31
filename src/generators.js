/* Calculation drills: each generator makes a fresh problem from a random
   number source and returns { prompt, fields, solution } (HTML with $..$ math).
   Loaded as a plain script in the browser and imported by the Node tests. */
(function (root) {
  'use strict';

  const int = (rng, lo, hi) => lo + Math.floor(rng() * (hi - lo + 1));
  const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];
  const round = (x, d = 4) => Math.round(x * 10 ** d) / 10 ** d;
  const f = (x, d = 4) => {
    const v = round(x, d);
    return Object.is(v, -0) ? '0' : String(v);
  };
  const sum = (a) => a.reduce((s, v) => s + v, 0);
  const par = (v) => (v < 0 ? `(${v})` : `${v}`); // wrap negatives inside products
  const log2 = (x) => Math.log(x) / Math.LN2;
  const sigmoid = (z) => 1 / (1 + Math.exp(-z));
  const field = (label, answer, tol) => ({ label, answer, tol: tol != null ? tol : Math.max(0.002, Math.abs(answer) * 0.005) });
  const entropy = (counts) => {
    const n = sum(counts);
    return -sum(counts.filter((c) => c > 0).map((c) => (c / n) * log2(c / n)));
  };
  const gini = (counts) => {
    const n = sum(counts);
    return 1 - sum(counts.map((c) => (c / n) ** 2));
  };
  const comb = (n, k) => {
    let r = 1;
    for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
    return r;
  };
  const table = (head, rows) => `<table><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</table>`;

  const list = [];

  // ---------------- Lecture 2 ----------------
  list.push({
    id: 'bayes-rule',
    lesson: 'l2-general-concepts',
    title: "Bayes' rule word problem",
    blurb: 'Two groups, a test or a trait, find the posterior P(A | B).',
    make(rng) {
      const pA = int(rng, 1, 7) / 10;
      const pBgA = int(rng, 5, 19) * 0.05;
      let pBgN = int(rng, 1, 12) * 0.05;
      if (Math.abs(pBgN - pBgA) < 0.05) pBgN = Math.max(0.05, pBgA - 0.25);
      const joint = pA * pBgA;
      const pB = joint + (1 - pA) * pBgN;
      const post = joint / pB;
      return {
        prompt: `<p>In a population, $${f(pA * 100, 0)}\\%$ belong to group A. A trait B appears in $${f(pBgA * 100, 0)}\\%$ of group A and in $${f(pBgN * 100, 0)}\\%$ of everyone else. A random person has trait B. Compute $P(B)$ and $P(A \\mid B)$.</p>`,
        fields: [field('$P(B)$', pB), field('$P(A \\mid B)$', post)],
        solution: `<ol>
          <li>Joint: $P(B, A) = P(B \\mid A)P(A) = ${f(pBgA)} \\times ${f(pA)} = ${f(joint)}$.</li>
          <li>Sum rule: $P(B) = P(B \\mid A)P(A) + P(B \\mid \\neg A)P(\\neg A) = ${f(joint)} + ${f(pBgN)} \\times ${f(1 - pA)} = ${f(pB)}$.</li>
          <li>Bayes: $P(A \\mid B) = \\dfrac{${f(joint)}}{${f(pB)}} = ${f(post)}$.</li></ol>`,
      };
    },
  });

  list.push({
    id: 'mle',
    lesson: 'l2-general-concepts',
    title: 'MLE for a coin and a die',
    blurb: 'Homework 1 with new counts: θ = s/N and θₖ = Nₖ/N.',
    make(rng) {
      const N = int(rng, 20, 60);
      const s = int(rng, 3, N - 3);
      const counts = [0, 0, 0, 0, 0, 0].map(() => int(rng, 2, 12));
      const M = sum(counts);
      const k = int(rng, 1, 6);
      return {
        prompt: `<p>(a) A coin lands heads $s = ${s}$ times in $N = ${N}$ tosses. Give the MLE $\\hat\\theta$.</p>
          <p>(b) A 6-sided die is rolled $${M}$ times with face counts $(${counts.join(', ')})$. Give the MLE $\\hat\\theta_{${k}}$.</p>`,
        fields: [field('(a) $\\hat\\theta$', s / N), field(`(b) $\\hat\\theta_{${k}}$`, counts[k - 1] / M)],
        solution: `<ol><li>Bernoulli MLE: $\\hat\\theta = s/N = ${s}/${N} = ${f(s / N)}$ (from $\\ell'(\\theta) = \\frac{s}{\\theta} - \\frac{N-s}{1-\\theta} = 0$).</li>
          <li>Categorical MLE (Lagrange multiplier for $\\sum\\theta_k = 1$): $\\hat\\theta_k = N_k/N = ${counts[k - 1]}/${M} = ${f(counts[k - 1] / M)}$.</li></ol>`,
      };
    },
  });

  list.push({
    id: 'expectation',
    lesson: 'l2-general-concepts',
    title: 'Expected value and variance',
    blurb: 'A small discrete distribution: E[X], E[X²], Var[X].',
    make(rng) {
      const xs = [0, 1, 2, 3];
      const raw = xs.map(() => int(rng, 1, 6));
      const tot = sum(raw);
      const ps = raw.map((r) => r / tot);
      const ex = sum(xs.map((x, i) => x * ps[i]));
      const ex2 = sum(xs.map((x, i) => x * x * ps[i]));
      return {
        prompt: `<p>$X$ takes the values 0, 1, 2, 3 with probabilities $${raw.map((r) => `\\tfrac{${r}}{${tot}}`).join(',\\ ')}$. Compute $E[X]$, $E[X^2]$ and $\\mathrm{Var}[X]$.</p>`,
        fields: [field('$E[X]$', ex), field('$E[X^2]$', ex2), field('$\\mathrm{Var}[X]$', ex2 - ex * ex)],
        solution: `<ol><li>$E[X] = \\sum x\\,p(x) = (0\\cdot${raw[0]} + 1\\cdot${raw[1]} + 2\\cdot${raw[2]} + 3\\cdot${raw[3]})/${tot} = ${f(ex)}$.</li>
          <li>$E[X^2] = (0 + ${raw[1]} + 4\\cdot${raw[2]} + 9\\cdot${raw[3]})/${tot} = ${f(ex2)}$.</li>
          <li>$\\mathrm{Var}[X] = E[X^2] - E[X]^2 = ${f(ex2)} - ${f(ex)}^2 = ${f(ex2 - ex * ex)}$.</li></ol>`,
      };
    },
  });

  list.push({
    id: 'entropy-kl',
    lesson: 'l2-general-concepts',
    title: 'Entropy, cross-entropy, KL',
    blurb: 'Two binary distributions P and Q in bits.',
    make(rng) {
      const p = int(rng, 1, 9) / 10;
      let q = int(rng, 1, 9) / 10;
      if (q === p) q = p > 0.5 ? p - 0.3 : p + 0.3;
      const hp = entropy([p, 1 - p]);
      const hpq = -(p * log2(q) + (1 - p) * log2(1 - q));
      return {
        prompt: `<p>True distribution $P = (${f(p)}, ${f(1 - p)})$, model $Q = (${f(q)}, ${f(1 - q)})$. Using $\\log_2$, compute $H(P)$, $H(P, Q)$ and $D_{KL}(P\\|Q)$.</p>`,
        fields: [field('$H(P)$', hp), field('$H(P,Q)$', hpq), field('$D_{KL}(P\\|Q)$', hpq - hp)],
        solution: `<ol><li>$H(P) = -${f(p)}\\log_2 ${f(p)} - ${f(1 - p)}\\log_2 ${f(1 - p)} = ${f(hp)}$.</li>
          <li>$H(P, Q) = -${f(p)}\\log_2 ${f(q)} - ${f(1 - p)}\\log_2 ${f(1 - q)} = ${f(hpq)}$.</li>
          <li>$D_{KL}(P\\|Q) = H(P,Q) - H(P) = ${f(hpq - hp)}$ (always $\\ge 0$).</li></ol>`,
      };
    },
  });

  // ---------------- Lecture 3 ----------------
  function makePoints(rng, m) {
    const xs = [];
    while (xs.length < m) {
      const x = int(rng, -2, 5);
      if (!xs.includes(x)) xs.push(x);
    }
    xs.sort((a, b) => a - b);
    const a = int(rng, -2, 3); const b = pick(rng, [0.5, 1, 1.5, 2, -1]);
    const ys = xs.map((x) => Math.round(a + b * x + int(rng, -2, 2)));
    return { xs, ys };
  }

  list.push({
    id: 'normal-equation',
    lesson: 'l3-linear-regression',
    title: 'Normal equation (one feature)',
    blurb: 'Like HW02 Ex 1a: sums table, XᵀX, 2×2 inverse, w.',
    make(rng) {
      const { xs, ys } = makePoints(rng, 4);
      const m = 4; const Sx = sum(xs); const Sy = sum(ys);
      const Sxx = sum(xs.map((x) => x * x)); const Sxy = sum(xs.map((x, i) => x * ys[i]));
      const det = m * Sxx - Sx * Sx;
      const w0 = (Sxx * Sy - Sx * Sxy) / det; const w1 = (m * Sxy - Sx * Sy) / det;
      return {
        prompt: `<p>Fit $h(x) = w_0 + w_1x$ to the points ${xs.map((x, i) => `$(${x}, ${ys[i]})$`).join(', ')} using the normal equation $\\mathbf{w} = (X^TX)^{-1}X^T\\mathbf{y}$.</p>`,
        fields: [field('$w_0$', w0), field('$w_1$', w1)],
        solution: `${table(['$x$', '$y$', '$x^2$', '$xy$'], [...xs.map((x, i) => [x, ys[i], x * x, x * ys[i]]), [`<b>${Sx}</b>`, `<b>${Sy}</b>`, `<b>${Sxx}</b>`, `<b>${Sxy}</b>`]])}
          <ol><li>$X^TX = \\begin{bmatrix}${m} & ${Sx}\\\\ ${Sx} & ${Sxx}\\end{bmatrix}$, $X^T\\mathbf{y} = \\begin{bmatrix}${Sy}\\\\ ${Sxy}\\end{bmatrix}$.</li>
          <li>Determinant $= ${m}\\cdot${Sxx} - ${par(Sx)}^2 = ${det}$; $(X^TX)^{-1} = \\frac{1}{${det}}\\begin{bmatrix}${Sxx} & ${-Sx}\\\\ ${-Sx} & ${m}\\end{bmatrix}$.</li>
          <li>$w_0 = \\frac{${Sxx}\\cdot${par(Sy)} - ${par(Sx)}\\cdot${par(Sxy)}}{${det}} = ${f(w0)}$, $\\quad w_1 = \\frac{${m}\\cdot${par(Sxy)} - ${par(Sx)}\\cdot${par(Sy)}}{${det}} = ${f(w1)}$.</li>
          <li>Check: the residuals $h(x_i) - y_i$ add up to 0.</li></ol>`,
        decimals: 3,
      };
    },
  });

  list.push({
    id: 'gradient-descent',
    lesson: 'l3-linear-regression',
    title: 'Gradient descent epoch',
    blurb: 'Like HW02 Ex 1b: one batch update of w₀, w₁ by hand.',
    make(rng) {
      const { xs, ys } = makePoints(rng, 4);
      const m = 4;
      const alpha = pick(rng, [0.01, 0.05, 0.1]);
      const w0 = pick(rng, [0, 0, 0.5, 1]); const w1 = pick(rng, [0, 0, 0.5, -0.5]);
      const h = xs.map((x) => w0 + w1 * x);
      const e = h.map((v, i) => v - ys[i]);
      const ex = e.map((v, i) => v * xs[i]);
      const g0 = sum(e) / m; const g1 = sum(ex) / m;
      const n0 = w0 - alpha * g0; const n1 = w1 - alpha * g1;
      return {
        prompt: `<p>Data ${xs.map((x, i) => `$(${x}, ${ys[i]})$`).join(', ')}. Current weights $w_0 = ${w0}$, $w_1 = ${w1}$, learning rate $\\alpha = ${alpha}$, cost $J = \\frac{1}{2m}\\sum(h(x_i) - y_i)^2$. Do one batch gradient-descent update.</p>`,
        fields: [field('new $w_0$', n0, 0.0005), field('new $w_1$', n1, 0.0005)],
        solution: `${table(['$x_i$', '$y_i$', '$h(x_i)$', '$e_i = h - y$', '$e_ix_i$'], [...xs.map((x, i) => [x, ys[i], f(h[i]), f(e[i]), f(ex[i])]), ['', '', '', `<b>${f(sum(e))}</b>`, `<b>${f(sum(ex))}</b>`]])}
          <ol><li>$\\partial J/\\partial w_0 = \\frac{1}{${m}}\\sum e_i = ${f(g0)}$; $\\partial J/\\partial w_1 = \\frac{1}{${m}}\\sum e_ix_i = ${f(g1)}$.</li>
          <li>$w_0 := ${w0} - ${alpha}\\times(${f(g0)}) = ${f(n0, 5)}$.</li>
          <li>$w_1 := ${w1} - ${alpha}\\times(${f(g1)}) = ${f(n1, 5)}$ (both computed from the old weights).</li></ol>`,
        decimals: 4,
      };
    },
  });

  list.push({
    id: 'cost',
    lesson: 'l3-linear-regression',
    title: 'Cost function J',
    blurb: 'Mean squared error with the 1/(2m) factor.',
    make(rng) {
      const { xs, ys } = makePoints(rng, 3);
      const w0 = int(rng, -1, 2); const w1 = pick(rng, [0.5, 1, 1.5, 2]);
      const e = xs.map((x, i) => w0 + w1 * x - ys[i]);
      const J = sum(e.map((v) => v * v)) / 6;
      return {
        prompt: `<p>Compute $J(w_0, w_1) = \\frac{1}{2m}\\sum_{i}(h(x_i) - y_i)^2$ for $h(x) = ${w0} + ${w1}x$ on the points ${xs.map((x, i) => `$(${x}, ${ys[i]})$`).join(', ')}.</p>`,
        fields: [field('$J$', J)],
        solution: `<ol><li>Predictions: ${xs.map((x) => `$${f(w0 + w1 * x)}$`).join(', ')}.</li>
          <li>Errors $h - y$: ${e.map((v) => `$${f(v)}$`).join(', ')}; squares sum to $${f(sum(e.map((v) => v * v)))}$.</li>
          <li>$J = ${f(sum(e.map((v) => v * v)))} / (2\\cdot3) = ${f(J)}$.</li></ol>`,
      };
    },
  });

  // ---------------- Lecture 4 ----------------
  list.push({
    id: 'naive-bayes',
    lesson: 'l4-classification',
    title: 'Naive Bayes table',
    blurb: 'Like HW04 Ex 2: count, multiply, compare (MLE, no smoothing).',
    make(rng) {
      const vals = [['Sunny', 'Rainy', 'Cloudy'], ['Hot', 'Cool'], ['High', 'Low']];
      const names = ['Outlook', 'Temp', 'Humidity'];
      let rows; let q; let sy; let sn;
      for (let tries = 0; tries < 200; tries++) {
        rows = [];
        for (let i = 0; i < 10; i++) rows.push([...vals.map((v) => pick(rng, v)), rng() < 0.55 ? 'Yes' : 'No']);
        const ny = rows.filter((r) => r[3] === 'Yes').length;
        if (ny < 3 || ny > 7) continue;
        q = vals.map((v) => pick(rng, v));
        const score = (c) => {
          const rc = rows.filter((r) => r[3] === c);
          return (rc.length / rows.length) * q.reduce((p, v, j) => p * rc.filter((r) => r[j] === v).length / rc.length, 1);
        };
        sy = score('Yes'); sn = score('No');
        if ((sy > 0 || sn > 0) && Math.abs(sy - sn) > 0.002) break;
      }
      const cls = (c) => rows.filter((r) => r[3] === c);
      const line = (c) => {
        const rc = cls(c);
        return `$\\frac{${rc.length}}{10}${q.map((v, j) => `\\cdot\\frac{${rc.filter((r) => r[j] === v).length}}{${rc.length}}`).join('')} = ${f(c === 'Yes' ? sy : sn, 5)}$`;
      };
      return {
        prompt: `<p>Classify the day (${q.map((v, j) => `${names[j]} = ${v}`).join(', ')}) with Naive Bayes.</p>
          ${table(['Day', ...names, 'Play'], rows.map((r, i) => [i + 1, ...r]))}`,
        fields: [field('score Yes', sy, Math.max(0.0005, sy * 0.01)), field('score No', sn, Math.max(0.0005, sn * 0.01)), field('Play? (1 = Yes, 0 = No)', sy > sn ? 1 : 0, 0.01)],
        solution: `<ol><li>Priors: $P(\\text{Yes}) = ${cls('Yes').length}/10$, $P(\\text{No}) = ${cls('No').length}/10$.</li>
          <li>Each conditional = (rows with that value <b>and</b> that class) / (rows of that class).</li>
          <li>Yes: ${line('Yes')}</li><li>No: ${line('No')}</li>
          <li>Predict <b>${sy > sn ? 'Yes' : 'No'}</b> (the larger score).</li></ol>`,
        decimals: 4,
      };
    },
  });

  list.push({
    id: 'logistic',
    lesson: 'l4-classification',
    title: 'Logistic regression prediction',
    blurb: 'Sigmoid of a linear score; find the decision boundary.',
    make(rng) {
      const w1 = pick(rng, [0.4, 0.5, 0.8, 1, 1.2, 1.5]);
      const w0 = -int(rng, 2, 6);
      const x = int(rng, 1, 8);
      const z = w0 + w1 * x;
      return {
        prompt: `<p>A logistic regression model has $w_0 = ${w0}$, $w_1 = ${w1}$, so $P(y = 1 \\mid x) = \\sigma(w_0 + w_1x)$. Compute $P(y = 1 \\mid x = ${x})$ and the input value where $P = 0.5$.</p>`,
        fields: [field(`$P(y=1 \\mid ${x})$`, sigmoid(z)), field('boundary $x$', -w0 / w1)],
        solution: `<ol><li>$z = ${w0} + ${w1}\\cdot${x} = ${f(z)}$.</li>
          <li>$\\sigma(z) = \\frac{1}{1 + e^{${f(-z)}}} = \\frac{1}{1 + ${f(Math.exp(-z))}} = ${f(sigmoid(z))}$.</li>
          <li>$P = 0.5 \\iff z = 0 \\iff x = ${-w0}/${w1} = ${f(-w0 / w1)}$.</li></ol>`,
      };
    },
  });

  // ---------------- Lecture 5 ----------------
  list.push({
    id: 'impurity',
    lesson: 'l5-decision-tree',
    title: 'Node impurity',
    blurb: 'Gini, entropy and classification error of one node.',
    make(rng) {
      const a = int(rng, 0, 9); const b = int(rng, 1, 9);
      const c = [a, b];
      const n = a + b;
      return {
        prompt: `<p>A node holds $${a}$ records of class C1 and $${b}$ of class C2. Compute its Gini index, entropy (base 2) and classification error.</p>`,
        fields: [field('Gini', gini(c)), field('Entropy', entropy(c)), field('Error', 1 - Math.max(a, b) / n)],
        solution: `<ol><li>$p = (${a}/${n}, ${b}/${n}) = (${f(a / n)}, ${f(b / n)})$.</li>
          <li>Gini $= 1 - ${f(a / n)}^2 - ${f(b / n)}^2 = ${f(gini(c))}$.</li>
          <li>Entropy $= ${[a, b].filter((v) => v > 0).map((v) => `-${f(v / n)}\\log_2 ${f(v / n)}`).join(' ')} = ${f(entropy(c))}$.</li>
          <li>Error $= 1 - \\max(p) = ${f(1 - Math.max(a, b) / n)}$.</li></ol>`,
      };
    },
  });

  list.push({
    id: 'split-gain',
    lesson: 'l5-decision-tree',
    title: 'Split gain (Gini and entropy)',
    blurb: 'Weighted child impurity and gain of a binary split.',
    make(rng) {
      const l = [int(rng, 1, 8), int(rng, 0, 6)];
      const r = [int(rng, 0, 6), int(rng, 1, 8)];
      const p = [l[0] + r[0], l[1] + r[1]];
      const n = sum(p); const nl = sum(l); const nr = sum(r);
      const gM = (nl / n) * gini(l) + (nr / n) * gini(r);
      const hM = (nl / n) * entropy(l) + (nr / n) * entropy(r);
      return {
        prompt: `<p>A parent node with (C1, C2) = (${p[0]}, ${p[1]}) is split into a left child (${l[0]}, ${l[1]}) and a right child (${r[0]}, ${r[1]}). Compute the Gini gain and the information gain.</p>`,
        fields: [field('Gini gain', gini(p) - gM), field('Information gain', entropy(p) - hM)],
        solution: `<ol><li>Gini: parent $${f(gini(p))}$; left $${f(gini(l))}$; right $${f(gini(r))}$; weighted $\\frac{${nl}}{${n}}${f(gini(l))} + \\frac{${nr}}{${n}}${f(gini(r))} = ${f(gM)}$; gain $= ${f(gini(p) - gM)}$.</li>
          <li>Entropy: parent $${f(entropy(p))}$; left $${f(entropy(l))}$; right $${f(entropy(r))}$; weighted $= ${f(hM)}$; gain $= ${f(entropy(p) - hM)}$.</li></ol>`,
      };
    },
  });

  // ---------------- Lecture 6 ----------------
  list.push({
    id: 'svm-geometry',
    lesson: 'l6-svm',
    title: 'SVM score, distance, margin',
    blurb: 'Classify a point, its distance to the hyperplane, the margin 2/‖w‖.',
    make(rng) {
      const w = [pick(rng, [1, 2, 3, -1, -2]), pick(rng, [1, 2, 4, -2])];
      const b = int(rng, -4, 4);
      const x = [int(rng, -3, 4), int(rng, -3, 4)];
      const s = w[0] * x[0] + w[1] * x[1] + b;
      const nw = Math.hypot(w[0], w[1]);
      return {
        prompt: `<p>An SVM has $\\mathbf{w} = (${w[0]}, ${w[1]})$, $b = ${b}$. For $\\mathbf{x} = (${x[0]}, ${x[1]})$ compute the score $\\mathbf{w}^T\\mathbf{x} + b$, the distance from $\\mathbf{x}$ to the hyperplane, and the margin.</p>`,
        fields: [field('score', s, 0.001), field('distance', Math.abs(s) / nw), field('margin', 2 / nw)],
        solution: `<ol><li>Score $= ${par(w[0])}\\cdot${par(x[0])} + ${par(w[1])}\\cdot${par(x[1])} + ${par(b)} = ${s}$ → class $${s >= 0 ? '+1' : '-1'}$.</li>
          <li>$\\lVert\\mathbf{w}\\rVert = \\sqrt{${w[0] ** 2} + ${w[1] ** 2}} = ${f(nw)}$; distance $= |${s}|/${f(nw)} = ${f(Math.abs(s) / nw)}$.</li>
          <li>Margin $= 2/\\lVert\\mathbf{w}\\rVert = ${f(2 / nw)}$.</li></ol>`,
      };
    },
  });

  list.push({
    id: 'kernels',
    lesson: 'l6-svm',
    title: 'Kernel values',
    blurb: 'Linear, polynomial and RBF kernels for two vectors.',
    make(rng) {
      const x = [int(rng, -2, 3), int(rng, -2, 3)];
      const z = [int(rng, -2, 3), int(rng, -2, 3)];
      const d = pick(rng, [2, 3]);
      const g = pick(rng, [0.1, 0.2, 0.5]);
      const dot = x[0] * z[0] + x[1] * z[1];
      const dist2 = (x[0] - z[0]) ** 2 + (x[1] - z[1]) ** 2;
      return {
        prompt: `<p>For $\\mathbf{x} = (${x[0]}, ${x[1]})$ and $\\mathbf{z} = (${z[0]}, ${z[1]})$ compute the linear kernel, the polynomial kernel $(\\mathbf{x}^T\\mathbf{z} + 1)^{${d}}$ and the RBF kernel $\\exp(-${g}\\lVert\\mathbf{x} - \\mathbf{z}\\rVert^2)$.</p>`,
        fields: [field('linear', dot, 0.001), field('polynomial', (dot + 1) ** d, 0.001), field('RBF', Math.exp(-g * dist2))],
        solution: `<ol><li>$\\mathbf{x}^T\\mathbf{z} = ${par(x[0])}\\cdot${par(z[0])} + ${par(x[1])}\\cdot${par(z[1])} = ${dot}$.</li>
          <li>Polynomial: $(${dot} + 1)^{${d}} = ${(dot + 1) ** d}$.</li>
          <li>$\\lVert\\mathbf{x} - \\mathbf{z}\\rVert^2 = ${dist2}$, so RBF $= e^{-${g}\\cdot${dist2}} = ${f(Math.exp(-g * dist2))}$.</li></ol>`,
      };
    },
  });

  // ---------------- Lecture 7 ----------------
  list.push({
    id: 'ensemble',
    lesson: 'l7-model-optimization',
    title: 'Ensemble majority vote',
    blurb: 'Error of a vote of T independent classifiers; bootstrap left-out rate.',
    make(rng) {
      const T = pick(rng, [3, 5, 7, 9, 11]);
      const eps = pick(rng, [0.1, 0.2, 0.25, 0.3, 0.35, 0.4]);
      const n = pick(rng, [5, 10, 20, 50]);
      const k0 = Math.floor(T / 2) + 1;
      let err = 0;
      for (let i = k0; i <= T; i++) err += comb(T, i) * eps ** i * (1 - eps) ** (T - i);
      return {
        prompt: `<p>(a) An ensemble of $T = ${T}$ independent classifiers, each with error $\\varepsilon = ${eps}$, takes a majority vote. What is the ensemble error?<br>(b) For a bootstrap sample from $n = ${n}$ examples, what is the probability a given example is left out?</p>`,
        fields: [field('(a) ensemble error', err), field('(b) left-out probability', (1 - 1 / n) ** n)],
        solution: `<ol><li>Wrong when at least $${k0}$ of $${T}$ are wrong: $\\sum_{i=${k0}}^{${T}}\\binom{${T}}{i}${eps}^i(${f(1 - eps)})^{${T}-i} = ${f(err)}$ (vs $${eps}$ for one classifier).</li>
          <li>$(1 - \\frac{1}{${n}})^{${n}} = ${f((1 - 1 / n) ** n)}$ (tends to $1/e \\approx 0.368$).</li></ol>`,
      };
    },
  });

  list.push({
    id: 'chi-square',
    lesson: 'l7-model-optimization',
    title: 'Chi-square feature score',
    blurb: 'χ² for a 2×2 feature-vs-class table.',
    make(rng) {
      const O = [[int(rng, 5, 40), int(rng, 5, 40)], [int(rng, 5, 40), int(rng, 5, 40)]];
      const R = O.map(sum); const C = [O[0][0] + O[1][0], O[0][1] + O[1][1]]; const N = sum(R);
      const E = O.map((row, i) => row.map((_, j) => (R[i] * C[j]) / N));
      let chi = 0;
      for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) chi += (O[i][j] - E[i][j]) ** 2 / E[i][j];
      return {
        prompt: `<p>Observed counts of a binary feature vs a binary class:</p>${table(['', 'class +', 'class −'], [['feature = yes', O[0][0], O[0][1]], ['feature = no', O[1][0], O[1][1]]])}<p>Compute $\\chi^2 = \\sum\\frac{(O - E)^2}{E}$.</p>`,
        fields: [field('$\\chi^2$', chi)],
        solution: `<ol><li>Row totals $${R[0]}, ${R[1]}$; column totals $${C[0]}, ${C[1]}$; $N = ${N}$.</li>
          <li>Expected $E = \\frac{\\text{row}\\times\\text{col}}{N}$: $${E.flat().map((v) => f(v, 3)).join(',\\ ')}$.</li>
          <li>$\\chi^2 = ${O.flat().map((o, k) => `\\frac{(${o} - ${f(E.flat()[k], 3)})^2}{${f(E.flat()[k], 3)}}`).join(' + ')} = ${f(chi)}$.</li></ol>`,
      };
    },
  });

  // ---------------- Lecture 8 ----------------
  list.push({
    id: 'kmeans-epoch',
    lesson: 'l8-unsupervised-learning',
    title: 'One K-means epoch and SSE',
    blurb: 'Assign 1-D points to fixed seeds, update the means, compute SSE.',
    make(rng) {
      const offset = int(rng, -5, 5); const step = int(rng, 1, 4);
      const xs = [0, 1, 3, 8, 10, 11].map((v) => offset + step * v);
      const left = xs.slice(0, 3); const right = xs.slice(3);
      const means = [sum(left) / 3, sum(right) / 3];
      const sse = sum(left.map((x) => (x - means[0]) ** 2)) + sum(right.map((x) => (x - means[1]) ** 2));
      return {
        prompt: `<p>Points on a line: $${xs.join(', ')}$. Initial centres $\\mu_1=${xs[0]}$, $\\mu_2=${xs[5]}$. Run <b>one</b> K-means assignment/update epoch. Compute the new centres and SSE after that update.</p>`,
        fields: [field('new $\\mu_1$', means[0]), field('new $\\mu_2$', means[1]), field('SSE after update', sse)],
        solution: `<ol><li>Compare squared distances to the two fixed seeds. The split is at their midpoint $${f((xs[0] + xs[5]) / 2)}$: $C_1=\\{${left.join(', ')}\\}$, $C_2=\\{${right.join(', ')}\\}$.</li>
          <li>Average each group: $\\mu_1=(${left.map(par).join('+')})/3=${f(means[0])}$; $\\mu_2=(${right.map(par).join('+')})/3=${f(means[1])}$.</li>
          <li>Using these new means, $\\mathrm{SSE}=\\sum_{x\\in C_1}(x-\\mu_1)^2+\\sum_{x\\in C_2}(x-\\mu_2)^2=${f(sse)}$. Stop before the next assignment.</li></ol>`,
      };
    },
  });

  list.push({
    id: 'hac-linkage',
    lesson: 'l8-unsupervised-learning',
    title: 'HAC linkage scores',
    blurb: 'Single, complete, average and Ward for two small clusters.',
    make(rng) {
      const a = int(rng, -4, 4); const width = int(rng, 1, 3);
      const gap = int(rng, 1, 5); const span = int(rng, 1, 4);
      const A = [a, a + width]; const B = [a + width + gap, a + width + gap + span];
      const ds = A.flatMap((x) => B.map((y) => Math.abs(x - y)));
      const ma = sum(A) / 2; const mb = sum(B) / 2;
      const ward = (ma - mb) ** 2;
      return {
        prompt: `<p>On a line, $A=\\{${A.join(', ')}\\}$, $B=\\{${B.join(', ')}\\}$. Compute single-link, complete-link, average-link distances and the Ward <b>increase in SSE</b>.</p>`,
        fields: [field('single-link', Math.min(...ds)), field('complete-link', Math.max(...ds)), field('average-link', sum(ds) / 4), field('Ward SSE increase', ward)],
        solution: `<ol><li>The four cross-pair distances are $${ds.join(', ')}$.</li><li>Single = minimum $${Math.min(...ds)}$; complete = maximum $${Math.max(...ds)}$; average $=(${ds.join('+')})/4=${f(sum(ds) / 4)}$.</li>
          <li>Means: $${f(ma)}$, $${f(mb)}$. Ward: $\\frac{2\\cdot2}{2+2}(${par(f(ma))}-${par(f(mb))})^2=${f(ward)}$. Ward is an SSE increase, not a pairwise distance.</li></ol>`,
      };
    },
  });

  list.push({
    id: 'dbscan-neighbourhoods',
    lesson: 'l8-unsupervised-learning',
    title: 'DBSCAN core, border, noise',
    blurb: 'Count epsilon-neighbours including self, then find core components.',
    make(rng) {
      const offset = int(rng, -5, 5); const step = int(rng, 1, 4);
      const xs = [0, 1, 2, 6, 7, 8, 12].map((v) => offset + step * v);
      const neighbours = xs.map((x) => xs.filter((y) => Math.abs(x - y) <= step));
      const core = neighbours.map((n) => n.length >= 3);
      const border = xs.map((x, i) => !core[i] && xs.some((y, j) => core[j] && Math.abs(x - y) <= step));
      const nc = core.filter(Boolean).length; const nb = border.filter(Boolean).length;
      return {
        prompt: `<p>DBSCAN on the 1-D points $${xs.join(', ')}$, with $\\epsilon=${step}$ and MinPts $=3$, <b>counting self</b>. Include points exactly at epsilon. Give the core, border, noise and cluster counts.</p>`,
        fields: [field('core points', nc, 0.01), field('border points', nb, 0.01), field('noise points', xs.length - nc - nb, 0.01), field('clusters', 2, 0.01)],
        solution: `${table(['Point', 'Epsilon-neighbourhood', 'Type'], xs.map((x, i) => [x, neighbours[i].join(', '), core[i] ? 'Core' : border[i] ? 'Border' : 'Noise']))}
          <p>The core points $${xs[1]}$ and $${xs[4]}$ are farther apart than epsilon, so they form two components. Attach their border neighbours: clusters $\\{${xs.slice(0, 3).join(', ')}\\}$ and $\\{${xs.slice(3, 6).join(', ')}\\}$. Point $${xs[6]}$ is noise. Totals: ${nc} core, ${nb} border, ${xs.length - nc - nb} noise, 2 clusters.</p>`,
      };
    },
  });

  root.MLGen = { list, helpers: { entropy, gini, sigmoid, comb } };
})(typeof globalThis !== 'undefined' ? globalThis : window);
