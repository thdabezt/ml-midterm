# Handoff: ML Studyroom

State as of 2026-10-31. Read this before changing anything.

- **Live site:** https://thdabezt.github.io/ml-midterm/ (version 1.1.1)
- **Repo:** https://github.com/thdabezt/ml-midterm (`main`; every push deploys via GitHub Actions)
- **Course:** INT3405 Machine Learning, VNU-UET. Midterm = 10 MCQs + 2–3 practical questions (Lecture 0), week 9.

## What exists

| Part | Where | Notes |
|---|---|---|
| **Math for idiots** (the "Math toolkit" page) | `content/theory/00-math-toolkit.md` | Math from zero for a reader with almost no math background: reading notation, Σ/Π, logs (and how to do log₂ on a calculator), e and the sigmoid, probability, derivatives and partial derivatives, vectors/matrices and the 2×2 inverse, norms, argmax, combinations, Lagrange multipliers, English–Vietnamese glossary. Seven warm-up questions in `content/practice/l0-math.js`. **This page is the backbone of the site.** Every lesson assumes the reader may not know the math, so keep that standard for any new content. |
| Theory, L1–L7 | `content/theory/01…07-*.md` | Each formula gets a `:::formula` box, a `:::read` box (explained symbol by symbol, "how to read it") and a `:::steps` / `:::example` box with small numbers. Slide page refs like "(p34)". |
| Formula sheet | `content/theory/99-formula-sheet.md` | One printable page. |
| Question bank | `content/practice/l*.js` | 170 questions: all 12 homework exercises (HW01, HW02 = `HW03-ML.pdf`, HW04 incl. `HW4 (1).pdf`, HW05), 29 homework-style variants, slide quizzes, MCQs. |
| Drills | `src/generators.js` | 15 random-number generators with worked solutions. |
| App | `src/app.js`, `src/styles.css`, `src/index.html` | Hash router, practice/answer checking, mock midterm, review list, localStorage progress. |
| Build / tests | `tools/build.mjs`, `tools/render.mjs`, `tests/` | KaTeX renders at build time, so a broken formula fails the build. The tests recompute homework answers from raw data and render 300 drills per generator. |

## How to work on it

```sh
npm install
npm test          # must pass; CI runs it before deploying
npm run build     # writes dist/
npm start         # http://127.0.0.1:4174
```

- **Writing math in practice files:** use `String.raw` template strings (`r\`...\``). A plain `'...'` string silently drops LaTeX backslashes. The build has a guard for this.
- **New question:** add an object to the lecture's file in `content/practice/` with `id`, `type` (`mcq` | `numeric` | `written`), `source` (`hw` | `variant` | `slide` | `quiz`), `prompt`, `solution`, and `options`+`answer` or `fields`. For any new numeric homework answer, add an independent recomputation in `tests/bank.test.js`.
- **MCQ options are shuffled at display time**, so never write "option B" in a solution.
- **After layout/CSS/JS changes, bump `version` in `package.json`.** Assets load as `?v=<version>`, and GitHub Pages lets browsers cache HTML for 10 minutes.
- Layout lives in a `.shell` wrapper, not on `<body>`. Elements injected by browser extensions broke the old body grid (fixed in 1.1.1).

## Decisions already made (do not redo without the user)

- English site. The user wants chat replies in English too.
- Public repo, original write-ups only; the course PDFs are not committed.
- Slide typos are corrected with a visible note where they would mislead (e.g. margin 2/‖w‖, the multivariate Gaussian sign, the L5 p37 entropy example).
- HW04 Ex 3 (logistic regression, study hours) has perfectly separable data, so the MLE does not exist. The model answer explains this and gives ≈ 0.85 (L2-regularised). Keep that explanation.

## Open items / ideas

1. **Lecture 8 (unsupervised learning) is missing.** Its slides were not in the `ML/` folder. Add a theory page plus questions when the slides arrive, and keep the "math for idiots" style (k-means distance, etc. explained from zero).
2. KNN has no slides (listed in the L4/L5 outlines only). It is covered only via HW05 and L7.
3. Possible extras: a link from each formula to its Math-toolkit section; more drills (Gini split on a table, perceptron run); progress sync across devices (currently browser-only).

## Source material (local, not in the repo)

`C:\Users\Admin\Downloads\Y3S1\ML\`: lecture PDFs L0–L7, homework PDFs, plus older Vietnamese notes `HW03_LoiGiai.md` and `Tuan3_TomTat.md`. Slide formulas are images, so read the PDFs page by page as images rather than relying on text extraction.
