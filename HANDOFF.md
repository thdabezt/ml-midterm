# Handoff: ML Studyroom

State as of 2026-10-31. Read this before changing anything.

- **Live site:** https://thdabezt.github.io/ml-midterm/ (version 1.4.1)
- **Repo:** https://github.com/thdabezt/ml-midterm (`main`; every push deploys via GitHub Actions)
- **Course:** INT3405 Machine Learning, VNU-UET. Midterm = 10 MCQs + 2–3 practical questions (Lecture 0), week 9.

## What exists

| Part | Where | Notes |
|---|---|---|
| **Math for idiots** (the "Math toolkit" page) | `content/theory/00-math-toolkit.md` | Math from zero for a reader with almost no math background: reading notation, Σ/Π, logs (and how to do log₂ on a calculator), e and the sigmoid, probability, derivatives and partial derivatives, vectors/matrices and the 2×2 inverse, norms, argmax, combinations, Lagrange multipliers, English–Vietnamese glossary. Seven warm-up questions in `content/practice/l0-math.js`. **This page is the backbone of the site.** Every lesson assumes the reader may not know the math, so keep that standard for any new content. |
| Theory, L1–L8 | `content/theory/01…08-*.md` | Each formula gets a `:::formula` box, a `:::read` box (explained symbol by symbol, "how to read it") and a `:::steps` / `:::example` box with small numbers. Slide page refs like "(p34)". L8 covers clustering through evaluation metrics; L7 now explains the HW07 Lasso coordinate update. |
| Formula sheet | `content/theory/99-formula-sheet.md` | Printable reference including L8 and HW07. |
| Formula priorities | `content/formula-priorities.json` | Shared P1/P2/P3 grades, plain-English reasons and original homework IDs. Used by keyed theory formula boxes and formula-sheet/table references; each theory page has a collapsible legend. |
| Question bank | `content/practice/l*.js` | 209 questions: all 20 supplied homework exercises (HW01, HW02 = `HW03-ML.pdf`, HW04 incl. `HW4 (1).pdf`, HW05, HW06 = `HW_week06.pdf`, HW07 = `HW_07.pdf`, HW08 = `HW_Cluster.pdf`), 48 variants, slide quizzes, MCQs. L8 has 27 questions. |
| Drills | `src/generators.js` | 15 random-number generators with worked solutions. |
| Interactive visuals | `src/visuals.js`, `src/visuals-regression.js`, `src/visuals-models.js`, `src/visuals-clustering.js` | Seven panels in L2/L3/L4/L5/L6/L8: information measures, regression/GD, sigmoid/loss, information gain, SVM geometry, k-means, DBSCAN. SVG plots, native controls and worked-number tables. Pure numerical models are exposed for independent tests in `tests/visuals*.test.js`. |
| App | `src/app.js`, `src/styles.css`, `src/index.html` | Hash router, practice/answer checking, mock midterm, review list, localStorage progress. |
| Build / tests | `tools/build.mjs`, `tools/render.mjs`, `tests/` | KaTeX renders at build time, so a broken formula fails the build. The tests recompute homework and clustering answers from raw data and render 300 drills per generator. New homework checks are in `tests/new-homework.test.js`; clustering checks are in `tests/unsupervised.test.js`. |

## How to work on it

```sh
npm install
npm test          # must pass; CI runs it before deploying
npm run build     # writes dist/
npm start         # http://127.0.0.1:4174
```

- **Vector notation:** use `\vec{x}`, `\vec{w}`, `\vec{\theta}`, etc. for whole vectors throughout lessons, questions and drills. Keep scalar components (`x_j`, `w_j`), scalar parameters (coin `\theta`, penalty `\lambda`) and matrices (`X`, covariance `\boldsymbol\Sigma`) distinct. `\mathbf{1}` in the classification-error formula is an indicator, not a vector. Plain-text full-vector labels use a combining arrow, e.g. w⃗.
- **Writing math in practice files:** use `String.raw` template strings (`r\`...\``). A plain `'...'` string silently drops LaTeX backslashes. The build has a guard for this.
- **New question:** add an object to the lecture's file in `content/practice/` with `id`, `type` (`mcq` | `numeric` | `written`), `source` (`hw` | `variant` | `slide` | `quiz`), `prompt`, `solution`, and `options`+`answer` or `fields`. For any new numeric homework answer, add an independent recomputation in `tests/bank.test.js`.
- **Formula priority:** write `:::formula @formula-key Optional title` for a formula box, or `{{priority:formula-key}}` in a table/prose definition. Define the key in `content/formula-priorities.json` with `grade`, a concise plain-English `reason`, and `homework` IDs. P1/P2 must cite original `source.kind = 'hw'` IDs; P3 must have an empty homework array. The renderer rejects missing/unknown keys. `tests/priorities.test.js` checks full coverage and evidence IDs. Review grades when new homework arrives; a variant or slide question alone does not establish homework use.
- **Interactive visual:** put `{{visual:panel-key}}` on its own paragraph inside the lesson. Approved keys live in `LESSON_VISUALS` in `tools/render.mjs`; implementations register with `MLVisuals.register`. Classic scripts load before the app. A panel returns `redraw` for width changes; route changes disconnect its ResizeObserver. Extend the build asset list and index script list for a new module. Use theme variables, native labelled controls and SVG axes; expose a pure numerical model and check the calculation independently.
- **MCQ options are shuffled at display time**, so never write "option B" in a solution.
- **After layout/CSS/JS changes, bump `version` in `package.json`.** Assets load as `?v=<version>`, and GitHub Pages lets browsers cache HTML for 10 minutes.
- Layout lives in a `.shell` wrapper, not on `<body>`. Elements injected by browser extensions broke the old body grid (fixed in 1.1.1).

## Decisions already made (do not redo without the user)

- English site. The user wants chat replies in English too.
- Public repo, original write-ups only; the course PDFs are not committed.
- Slide typos are corrected with a visible note where they would mislead (e.g. margin 2/‖w‖, the multivariate Gaussian sign, the L5 p37 entropy example).
- HW04 Ex 3 (logistic regression, study hours) has perfectly separable data, so the MLE does not exist. The model answer explains this and gives ≈ 0.85 (L2-regularised). Keep that explanation.
- L8 p14's cosine formula is a similarity, not a distance. The lesson distinguishes it from cosine distance.
- L8 p26/p51's L1-distance k-means exercise uses **Manhattan assignment + arithmetic-mean update**, ties to cluster 1, with each iteration meaning assignment then update. This is a stated convention for the source's hybrid instruction; standard squared-Euclidean k-means uses means, while a true L1 objective uses coordinate medians. Do not silently change that convention or the answers.
- L8 p51 DBSCAN follows its L1-distance heading, with self included in MinPts: 2 clusters, 4 core, 6 border, 2 noise. If Euclidean distance was intended, the same groups/noise arise but all 10 non-noise points are core. Both interpretations are checked.
- L8 p56/p58 are corrected visibly: Davies–Bouldin uses mean distance to the centroid and the maximum scatter/separation ratio over other clusters; silhouette's within-cluster mean excludes self and divides by **cluster size minus 1**.
- HW06 Ex1 lists a six-coordinate feature map, so its printed target space $\mathbb{R}^5$ is corrected to $\mathbb{R}^6$. SVM deletion can leave the optimal margin unchanged or increase it; all four margin-point deletions are independently checked.
- `HW_07.pdf` has a mismatched "Homework 01 / INT3424, AIT3007" header. Identify it by filename. The ensemble solution requires independent, identically distributed votes conditional on true class 1; use **strict** majority (ties fail). For accuracy 0.51: probabilities ≈0.726099 at M=1000 and ≈0.976718 at M=10000. These do not establish overall two-class accuracy.
- HW08 (`HW_Cluster.pdf`, one page, IDs `hw08-ex1` and `hw08-ex2`) uses **Euclidean distance**, explicitly stated because the sheet omits the metric. Ex1 is one batch assignment to seeds A1/A4/A7 followed by one mean update, giving centres (2,10), (6,6), (1.5,3.5); do not reassign again. Ex2 counts self with min_samples=2 and includes the radius boundary. At Eps=2: two clusters, five cores, no borders, noise A1/A2/A7. At Eps=sqrt(10): three clusters, all eight points core; the new A2/A7 cluster forms exactly at that boundary. Independent checks are in `tests/bank.test.js`.
- User-defined priorities: **P1** = used in homework and supports other homework or follow-on calculations; **P2** = used in a self-contained homework task without a follow-on dependency identified; **P3** = not used by supplied homework. Follow-on means a concrete calculation dependency (including later steps), not a prediction of unseen assignments. Required intermediate formulas count as homework use; optional extensions do not. Keep different grades separate even if formulas originally shared a box or row.
- Priority examples: entropy/cross-entropy P1, KL P3; Naive Bayes classifier and the polynomial-kernel identity P2, while shared probability counting/dot products are P1. Clustering SSE is P1 through HW05 Ex3's regression-tree split scoring, not because HW08 asks for SSE. Continuous density integrals, Gini, chi-square, RBF, HAC and clustering evaluation metrics are P3 under the current supplied homework.
- Visual conventions: L2 shows the exact zero-probability limits (zero-weight terms contribute 0; positive P with zero Q gives infinite cross-entropy/KL), with consistent bits/nats. Logistic loss uses a stable softplus calculation. Regression steps update both weights from the old errors. SVM width is the canonical ±1 strip, not a claim of an optimally trained separator; zero weights have undefined geometry. K-means retains pre-update assignment centres and memberships. DBSCAN includes the exact sqrt(10) boundary and self-counting, and border points cannot bridge core components. The visuals do not change formula-priority grades or save answers as practice progress.

## Open items / ideas

1. KNN has no slides (listed in the L4/L5 outlines only). It is covered only via HW05 and L7.
2. Possible extras: a link from each formula to its Math-toolkit section; more drills (Gini split on a table, perceptron run, clustering); progress sync across devices (currently browser-only).

## Source material (local, not in the repo)

`C:\Users\Admin\Downloads\Y3S1\ML\`: lecture PDFs L0–L8, homework PDFs through `HW_Cluster.pdf` (Homework 08), plus older Vietnamese notes `HW03_LoiGiai.md` and `Tuan3_TomTat.md`. The new L7 feature-selection copy has the same topic coverage already present. A shorter `Lecture 7_Clustering.pdf` also exists, with an internal Lecture 8 title; site slide references remain tied to the 59-page `Lecture8-Unsupervised-Learning.pdf`. Slide formulas are images, so read the PDFs page by page as images rather than relying on text extraction. The 1.2.0 update reviewed all 59 L8 pages and both pages of HW06/HW07 visually; 1.2.1 reviewed the full HW08 page.
