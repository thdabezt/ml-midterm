# ML Studyroom

Study site for the INT3405 Machine Learning midterm (VNU-UET), covering Lectures 1–8. Current version: **1.3.0**.

**Website:** https://thdabezt.github.io/ml-midterm/

## Sections

**Theory**
- **Math toolkit** for readers with little math background: notation, Σ/Π, logarithms, sigmoid, probability, derivatives and partial derivatives, vectors and matrices (2×2 inverse), norms, distances and centroids, argmax, combinations, Lagrange multipliers, and an English–Vietnamese glossary.
- One page per lecture (L1 Introduction, L2 General concepts, L3 Linear regression, L4 Bayes / Naive Bayes / logistic regression, L5 Decision trees, L6 SVM, L7 Feature selection & model optimization, L8 Unsupervised learning). Every formula has a "how to read it" box (symbol by symbol) and a "how to compute it" box with a small worked example. Slide page numbers are cited so you can cross-check. L8 covers clustering types, distances, k-means and its variants, HAC/linkages, DBSCAN, and Davies–Bouldin, Dunn and silhouette scores.
- **Formula sheet**: a printable reference grouped by lecture, including clustering and the HW07 Lasso and majority-vote formulas.

**Practice**
- **229 questions**: all 20 supplied homework exercise entries restated and solved step by step (HW01, HW02 = `HW03-ML.pdf`, HW04 including the shorter `HW4 (1).pdf` variant, HW05, HW06 = `HW_week06.pdf`, HW07 = `HW_07.pdf`, HW08 = `HW_Cluster.pdf`), 55 practice variants, the in-slide quizzes, and multiple-choice questions on the slide content. L8 has 45 questions, including the three-iteration clustering and DBSCAN slide exercises, both HW08 exercises, and additional variants. Two introduction MCQs cover when to use ML and application costs.
- Tags show the source: *Homework*, *Homework-style*, *From slides*, *Slide quiz*.
- Multiple choice, numeric answers (decimal comma, dot or fractions such as `-4/3` accepted), and "explain / derive" questions with model answers and self-marking.
- **18 calculation drills** with random numbers and worked steps (Bayes' rule, MLE, expectation, entropy/KL, normal equation, gradient descent, cost J, Naive Bayes, logistic regression, impurity, split gain, SVM geometry, kernels, ensembles, χ², a K-means epoch/SSE, HAC linkage and DBSCAN neighbourhoods).
- **Mock midterm** in the course's stated format (Lecture 0: 10 MCQs + 2–3 practical questions), optional timer, scored on submit.
- Review list of wrong and bookmarked questions. Progress is stored in the browser only.

## Notes on content

- The original 59-page L8 deck and the supplied 50-page `Lecture 7_Clustering.pdf` use different pagination. Both feed the existing `l8-unsupervised-learning` lesson. [SOURCE_COVERAGE.md](SOURCE_COVERAGE.md) maps the supplied PDFs and explains page references.
- HW08 uses Euclidean distance, inclusive epsilon boundaries and MinPts counting self. Its two radii give 2 clusters / 3 noise and 3 clusters / 0 noise; increasing epsilon can create a new cluster from former noise. Both exercises have worked theory and practice solutions.

- Slide typos are corrected with a note where they would mislead (e.g. the margin $2/\|w\|$, the sign in the multivariate Gaussian, the entropy example on L5 p37).
- L8 p26/p51 combines L1 distance with a k-means instruction. Its worked exercise explicitly uses Manhattan assignments, arithmetic-mean updates and ties to cluster 1; a true L1 objective uses coordinate medians. DBSCAN follows the L1 heading, counts the point itself, and explains the Euclidean alternative. The conventional Davies–Bouldin definition and silhouette divisor are stated with corrections to p56/p58.
- HW06's feature map has six coordinates despite its printed target space being five-dimensional. `HW_07.pdf` is identified by its supplied filename because its header instead says "Homework 01" and lists different course codes. Its binomial ensemble solution states the independent-voter assumption and excludes even-size ties from a strict majority.
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

Then open http://127.0.0.1:4174. `npm run build` renders all Markdown and LaTeX to static HTML in `dist/` (KaTeX runs at build time, so a broken formula fails the build). `npm test` recomputes key homework and clustering answers from raw data (including SVM convex-hull geometry, the patient information-gain table, large binomial tails, and both distance conventions for the slide DBSCAN exercise, and HW08 cluster memberships under both MinPts conventions) and checks that 300 random problems per drill render valid math.

See [HANDOFF.md](HANDOFF.md) for current state, conventions and open items.

## Layout

```
content/theory/*.md      lesson pages (Markdown + LaTeX, ":::formula" style boxes)
content/practice/*.js    question bank, one file per lecture
src/                     page shell, styles, app (router, practice, exam), drill generators
tools/                   build, render (Markdown + KaTeX), local server
tests/                   answer and generator checks
```

## Deploy

The GitHub Actions workflow runs the tests, builds `dist/` and publishes it to GitHub Pages on every push to `main`.
