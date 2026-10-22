// Warm-up questions for the Math toolkit page (not used in the mock midterm).
const r = String.raw;

export default {
  lesson: 'math-toolkit',
  questions: [
    {
      id: 'm-sum',
      type: 'numeric',
      source: { kind: 'slide', label: 'Math toolkit · sums' },
      prompt: r`Data $x = (-1, 0, 1, 2)$ and $y = (0, 2, 4, 5)$ (the Homework 2 dataset). Compute $\sum x_i^2$ and $\sum x_iy_i$.`,
      fields: [
        { label: r`$\sum x_i^2$`, answer: 6, tol: 0.001 },
        { label: r`$\sum x_iy_i$`, answer: 14, tol: 0.001 },
      ],
      solution: r`Square first, then add: $1 + 0 + 1 + 4 = 6$.

Multiply pairwise, then add: $(-1)(0) + 0\cdot2 + 1\cdot4 + 2\cdot5 = 0 + 0 + 4 + 10 = 14$.

These two sums (with $\sum x = 2$ and $\sum y = 11$) are all you need for the normal equation in Homework 2.`,
    },
    {
      id: 'm-log',
      type: 'numeric',
      source: { kind: 'slide', label: 'Math toolkit · logarithms' },
      prompt: r`Compute $\log_2 8$, $\log_2 0.25$ and $\log_2 0.6$ (3 decimals).`,
      fields: [
        { label: r`$\log_2 8$`, answer: 3, tol: 0.001 },
        { label: r`$\log_2 0.25$`, answer: -2, tol: 0.001 },
        { label: r`$\log_2 0.6$`, answer: -0.737, tol: 0.002 },
      ],
      solution: r`- $2^3 = 8$ so $\log_2 8 = 3$.
- $0.25 = 1/4 = 2^{-2}$ so $\log_2 0.25 = -2$.
- No nice power: use $\log_2 0.6 = \ln 0.6 / \ln 2 = -0.5108 / 0.6931 = -0.737$.

Numbers below 1 have negative logs.`,
    },
    {
      id: 'm-sigmoid',
      type: 'numeric',
      source: { kind: 'slide', label: 'Math toolkit · sigmoid' },
      prompt: r`Compute $\sigma(0)$, $\sigma(2)$ and $\sigma(-2)$, where $\sigma(z) = \dfrac{1}{1 + e^{-z}}$.`,
      fields: [
        { label: r`$\sigma(0)$`, answer: 0.5, tol: 0.001 },
        { label: r`$\sigma(2)$`, answer: 0.8808, tol: 0.002 },
        { label: r`$\sigma(-2)$`, answer: 0.1192, tol: 0.002 },
      ],
      solution: r`- $\sigma(0) = 1/(1 + 1) = 0.5$.
- $\sigma(2) = 1/(1 + e^{-2}) = 1/(1 + 0.1353) = 0.8808$.
- $\sigma(-2) = 1 - \sigma(2) = 0.1192$ (symmetry), or directly $1/(1 + e^{2}) = 1/8.389$.`,
    },
    {
      id: 'm-inverse',
      type: 'numeric',
      source: { kind: 'slide', label: 'Math toolkit · 2×2 inverse' },
      prompt: r`Let $A = \begin{bmatrix}4 & 14\\ 14 & 54\end{bmatrix}$. Find the determinant and the entries of $A^{-1}$.`,
      fields: [
        { label: r`$\det A$`, answer: 20, tol: 0.001 },
        { label: r`$(A^{-1})_{11}$`, answer: 2.7, tol: 0.001 },
        { label: r`$(A^{-1})_{12}$`, answer: -0.7, tol: 0.001 },
        { label: r`$(A^{-1})_{22}$`, answer: 0.2, tol: 0.001 },
      ],
      solution: r`$\det A = 4\cdot54 - 14\cdot14 = 216 - 196 = 20$.

Swap the diagonal, negate the off-diagonal, divide by 20:
$$A^{-1} = \frac{1}{20}\begin{bmatrix}54 & -14\\ -14 & 4\end{bmatrix} = \begin{bmatrix}2.7 & -0.7\\ -0.7 & 0.2\end{bmatrix}$$
This exact matrix appears in Homework 4 Exercise 1.`,
    },
    {
      id: 'm-derivative',
      type: 'numeric',
      source: { kind: 'slide', label: 'Math toolkit · derivatives' },
      prompt: r`$f(w) = (2w - 6)^2$. Compute $f'(1)$ and the $w$ where $f$ is smallest.`,
      fields: [
        { label: r`$f'(1)$`, answer: -16, tol: 0.001 },
        { label: r`minimising $w$`, answer: 3, tol: 0.001 },
      ],
      solution: r`Chain rule: $f'(w) = 2(2w - 6)\cdot 2 = 8w - 24$.

- $f'(1) = 8 - 24 = -16$ (negative slope, so increasing $w$ lowers $f$; gradient descent would move right).
- $f'(w) = 0 \Rightarrow w = 3$, where $f(3) = 0$.`,
    },
    {
      id: 'm-argmax',
      type: 'mcq',
      source: { kind: 'slide', label: 'Math toolkit · argmax' },
      prompt: r`A classifier outputs $P(\text{cat}) = 0.2$, $P(\text{dog}) = 0.7$, $P(\text{bird}) = 0.1$. What are $\max_k P(k)$ and $\arg\max_k P(k)$?`,
      options: [r`max = dog, argmax = 0.7`, r`max = 0.7, argmax = dog`, r`max = 0.7, argmax = 0.7`, r`max = 1, argmax = dog`],
      answer: 1,
      solution: r`$\max$ returns the **largest value** (0.7). $\arg\max$ returns the **input** that gives it (dog). Classifiers predict the argmax class.`,
    },
    {
      id: 'm-norms',
      type: 'numeric',
      source: { kind: 'slide', label: 'Math toolkit · norms' },
      prompt: r`For $\mathbf{w} = (3, -4)$ compute $\lVert\mathbf{w}\rVert_2$, $\lVert\mathbf{w}\rVert_2^2$ and $\lVert\mathbf{w}\rVert_1$.`,
      fields: [
        { label: r`$\lVert\mathbf{w}\rVert_2$`, answer: 5, tol: 0.001 },
        { label: r`$\lVert\mathbf{w}\rVert_2^2$`, answer: 25, tol: 0.001 },
        { label: r`$\lVert\mathbf{w}\rVert_1$`, answer: 7, tol: 0.001 },
      ],
      solution: r`- L2: $\sqrt{3^2 + (-4)^2} = \sqrt{25} = 5$.
- Squared L2: $25$ (the ridge penalty uses this).
- L1: $|3| + |-4| = 7$ (the lasso penalty uses this).`,
    },
  ],
};
