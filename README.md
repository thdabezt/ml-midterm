# ML Studyroom

Study site for the INT3405 Machine Learning midterm (VNU-UET), covering Lectures 1–7.

**Website:** https://thdabezt.github.io/ml-midterm/

## Sections

**Theory**
- **Math toolkit** for readers with little math background: notation, Σ/Π, logarithms, sigmoid, probability, derivatives and partial derivatives, vectors and matrices (2×2 inverse), norms, argmax, combinations, Lagrange multipliers, and an English–Vietnamese glossary.
- One page per lecture (L1 Introduction, L2 General concepts, L3 Linear regression, L4 Bayes / Naive Bayes / logistic regression, L5 Decision trees, L6 SVM, L7 Feature selection & model optimization). Every formula has a "how to read it" box (symbol by symbol) and a "how to compute it" box with a small worked example. Slide page numbers are cited so you can cross-check.
- **Formula sheet**: every formula on one printable page.

**Practice**
- **170 questions**: all 12 homework exercises restated and solved step by step (HW01, HW02 = `HW03-ML.pdf`, HW04 including the shorter `HW4 (1).pdf` variant, HW05), 29 homework-style variants with new numbers, the in-slide quizzes, and multiple-choice questions on the slide content.
- Tags show the source: *Homework*, *Homework-style*, *From slides*, *Slide quiz*.
- Multiple choice, numeric answers (decimal comma, dot or fractions such as `-4/3` accepted), and "explain / derive" questions with model answers and self-marking.
- **15 calculation drills** with random numbers and worked steps (Bayes' rule, MLE, expectation, entropy/KL, normal equation, gradient descent, cost J, Naive Bayes, logistic regression, impurity, split gain, SVM geometry, kernels, ensembles, χ²).
- **Mock midterm** in the course's stated format (Lecture 0: 10 MCQs + 2–3 practical questions), optional timer, scored on submit.
- Review list of wrong and bookmarked questions. Progress is stored in the browser only.

## Notes on content

- Lecture 8 (unsupervised learning) is in the course plan before the midterm, but its slides were not available, so it is not covered.
- Slide typos are corrected with a note where they would mislead (e.g. the margin $2/\|w\|$, the sign in the multivariate Gaussian, the entropy example on L5 p37).
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

Then open http://127.0.0.1:4174. `npm run build` renders all Markdown and LaTeX to static HTML in `dist/` (KaTeX runs at build time, so a broken formula fails the build). `npm test` recomputes every key homework answer from the raw data and checks that 300 random problems per drill render valid math.

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
