# ML Studyroom

Study site for the INT3405 Machine Learning midterm (VNU-UET), covering Lectures 1–8. Current version: **1.4.0**.

**Website:** https://thdabezt.github.io/ml-midterm/

## Sections

**Theory**
- **Math toolkit** for readers with little math background: notation, Σ/Π, logarithms, sigmoid, probability, derivatives and partial derivatives, vectors and matrices (2×2 inverse), norms, distances and centroids, argmax, combinations, Lagrange multipliers, and an English–Vietnamese glossary.
- One page per lecture (L1 Introduction, L2 General concepts, L3 Linear regression, L4 Bayes / Naive Bayes / logistic regression, L5 Decision trees, L6 SVM, L7 Feature selection & model optimization, L8 Unsupervised learning). Every formula has a "how to read it" box (symbol by symbol) and a "how to compute it" box with a small worked example. Slide page numbers are cited so you can cross-check. L8 covers clustering types, distances, k-means and its variants, HAC/linkages, DBSCAN, and Davies–Bouldin, Dunn and silhouette scores.
- **Formula sheet**: a printable reference grouped by lecture, including clustering and the HW07 Lasso and majority-vote formulas.
- **Formula priorities** on the lesson definitions and formula-sheet rows: **P1** = used in homework and supports other homework or follow-on calculations; **P2** = used in a standalone homework task without a follow-on dependency identified; **P3** = not used in the supplied homework. Each lesson formula gives its reason; formula-sheet badges reveal that same reason when selected. Grades use original HW01–HW08 tasks and their required calculations, with slide-only examples and added variants kept separate.
- **Seven interactive visuals** inside the relevant lessons: entropy/cross-entropy/KL with adjustable P and Q and bits/nats; line fitting, residuals and batch gradient descent; sigmoid and binary cross-entropy; information gain on the HW07 table; SVM distance/margin geometry; and HW08 k-means and DBSCAN. Pictures, numeric substitutions and result tables update together. All run locally in the browser without chart-library dependencies.

**Practice**
- **209 questions**: all 20 supplied homework exercises restated and solved step by step (HW01, HW02 = `HW03-ML.pdf`, HW04 including the shorter `HW4 (1).pdf` variant, HW05, HW06 = `HW_week06.pdf`, HW07 = `HW_07.pdf`, HW08 = `HW_Cluster.pdf`), 48 practice variants, the in-slide quizzes, and multiple-choice questions on the slide content. L8 has 27 questions, including HW08's k-means/DBSCAN exercises and the three-iteration clustering and DBSCAN slide exercises.
- Tags show the source: *Homework*, *Homework-style*, *From slides*, *Slide quiz*.
- Multiple choice, numeric answers (decimal comma, dot or fractions such as `-4/3` accepted), and "explain / derive" questions with model answers and self-marking.
- **15 calculation drills** with random numbers and worked steps (Bayes' rule, MLE, expectation, entropy/KL, normal equation, gradient descent, cost J, Naive Bayes, logistic regression, impurity, split gain, SVM geometry, kernels, ensembles, χ²).
- **Mock midterm** in the course's stated format (Lecture 0: 10 MCQs + 2–3 practical questions), optional timer, scored on submit.
- Review list of wrong and bookmarked questions. Progress is stored in the browser only.

## Notes on content

- Slide typos are corrected with a note where they would mislead (e.g. the margin $2/\|w\|$, the sign in the multivariate Gaussian, the entropy example on L5 p37).
- L8 p26/p51 combines L1 distance with a k-means instruction. Its worked exercise explicitly uses Manhattan assignments, arithmetic-mean updates and ties to cluster 1; a true L1 objective uses coordinate medians. DBSCAN follows the L1 heading, counts the point itself, and explains the Euclidean alternative. The conventional Davies–Bouldin definition and silhouette divisor are stated with corrections to p56/p58.
- HW06's feature map has six coordinates despite its printed target space being five-dimensional. `HW_07.pdf` is identified by its supplied filename because its header instead says "Homework 01" and lists different course codes. Its binomial ensemble solution states the independent-voter assumption and excludes even-size ties from a strict majority.
- HW08 uses the stated convention of Euclidean distance. One k-means epoch means assigning all points to the original seeds, then updating the means once. DBSCAN counts self and includes points exactly at the radius; at $\varepsilon=\sqrt{10}$, the formerly noisy pair A2/A7 forms a new cluster, so the cluster count increases from 2 to 3.
- HW04 Exercise 3 (logistic regression on study hours) uses perfectly separable data, so the unregularised MLE has no finite solution; the model answer explains this and gives the regularised result (≈ 0.85).
- Summaries and solutions are original writing; the course PDFs are not included in this repository.

## Run locally

Requires Node.js 22+.

```sh
npm install
npm test
npm run build
npm start
```

Then open http://127.0.0.1:4174. `npm run build` renders all Markdown and LaTeX to static HTML in `dist/` (KaTeX runs at build time, so a broken formula fails the build). `npm test` recomputes key homework and clustering answers from raw data (including SVM convex-hull geometry, the patient information-gain table, large binomial tails, and both distance conventions for the DBSCAN exercise) and checks that 300 random problems per drill render valid math.

See [HANDOFF.md](HANDOFF.md) for current state, conventions and open items.

## Layout

```
content/theory/*.md      lesson pages (Markdown + LaTeX, ":::formula" style boxes)
content/practice/*.js    question bank, one file per lecture
content/formula-priorities.json  shared formula grades, reasons and homework references
src/                     page shell, styles, app (router, practice, exam), drill generators
src/visuals*.js          interactive lesson panels and independently tested numerical models
tools/                   build, render (Markdown + KaTeX), local server
tests/                   answer and generator checks
```

## Deploy

The GitHub Actions workflow runs the tests, builds `dist/` and publishes it to GitHub Pages on every push to `main`.
