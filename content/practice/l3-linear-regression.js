const r = String.raw;

const HW2_TABLE = r`| $i$ | $x_i$ | $y_i$ | $x_i^2$ | $x_iy_i$ |
|---|---|---|---|---|
| 1 | −1 | 0 | 1 | 0 |
| 2 | 0 | 2 | 0 | 0 |
| 3 | 1 | 4 | 1 | 4 |
| 4 | 2 | 5 | 4 | 10 |
| **Σ** | **2** | **11** | **6** | **14** |`;

export default {
  lesson: 'l3-linear-regression',
  questions: [
    // ---------- Homework 2 (file HW03-ML.pdf) ----------
    {
      id: 'hw02-ex1a',
      type: 'numeric',
      source: { kind: 'hw', label: 'HW02 Exercise 1a', note: 'File HW03-ML.pdf, titled Homework 02' },
      prompt: r`Given the data $(x, y)$: $\{(-1, 0), (0, 2), (1, 4), (2, 5)\}$. Find the least-squares regression line $h(x) = w_0 + w_1x$ using the **analytical solution**.`,
      fields: [
        { label: r`$w_0$`, answer: 1.9, tol: 0.005 },
        { label: r`$w_1$`, answer: 1.7, tol: 0.005 },
      ],
      solution: r`**Table of sums** ($m = 4$):

${HW2_TABLE}

**Normal equation** $X^TX\vec{w} = X^T\vec{y}$ (L3 p50), with
$$X = \begin{bmatrix}1 & -1\\ 1 & 0\\ 1 & 1\\ 1 & 2\end{bmatrix},\quad X^TX = \begin{bmatrix}m & \sum x\\ \sum x & \sum x^2\end{bmatrix} = \begin{bmatrix}4 & 2\\ 2 & 6\end{bmatrix},\quad X^T\vec{y} = \begin{bmatrix}\sum y\\ \sum xy\end{bmatrix} = \begin{bmatrix}11\\ 14\end{bmatrix}$$

**Invert** (determinant $4\cdot6 - 2\cdot2 = 20$):
$$(X^TX)^{-1} = \frac{1}{20}\begin{bmatrix}6 & -2\\ -2 & 4\end{bmatrix}$$

**Multiply:**
$$\vec{w} = \frac{1}{20}\begin{bmatrix}6\cdot11 - 2\cdot14\\ -2\cdot11 + 4\cdot14\end{bmatrix} = \frac{1}{20}\begin{bmatrix}38\\ 34\end{bmatrix} = \begin{bmatrix}1.9\\ 1.7\end{bmatrix}$$

$$\boxed{h(x) = 1.9 + 1.7x}$$

Same thing without matrices: set $\partial J/\partial w_0 = 0$ and $\partial J/\partial w_1 = 0$ (L3 p48) to get the system $4w_0 + 2w_1 = 11$, $2w_0 + 6w_1 = 14$. From the first, $w_0 = (11 - 2w_1)/4$; substituting gives $w_1 = 1.7$, $w_0 = 1.9$.

**Check:** predictions $0.2, 1.9, 3.6, 5.3$; errors $0.2, -0.1, -0.4, 0.3$ add up to 0 ✓. Minimum cost $J = \frac{0.04 + 0.01 + 0.16 + 0.09}{2\cdot4} = 0.0375$.`,
    },
    {
      id: 'hw02-ex1b',
      type: 'numeric',
      source: { kind: 'hw', label: 'HW02 Exercise 1b', note: 'File HW03-ML.pdf' },
      prompt: r`Same data $\{(-1, 0), (0, 2), (1, 4), (2, 5)\}$. Find $h(x) = w_0 + w_1x$ with **gradient descent**: 2 epochs, learning rate $\alpha = 0.01$, batch size $m = 4$, initial parameters $= 0$. Use $J = \frac{1}{2m}\sum(h(x_i) - y_i)^2$. Give the weights after each epoch.`,
      fields: [
        { label: r`$w_0$ after epoch 1`, answer: 0.0275, tol: 0.0002 },
        { label: r`$w_1$ after epoch 1`, answer: 0.035, tol: 0.0002 },
        { label: r`$w_0$ after epoch 2`, answer: 0.05455, tol: 0.0002 },
        { label: r`$w_1$ after epoch 2`, answer: 0.0693375, tol: 0.0002 },
      ],
      solution: r`Batch size = $m$ = 4, so this is **batch GD**: each epoch uses all 4 points and makes exactly **one** update (L3 p41):
$$w_0 := w_0 - \alpha\frac1m\sum(h(x_i) - y_i),\qquad w_1 := w_1 - \alpha\frac1m\sum(h(x_i) - y_i)x_i\quad\text{(simultaneously)}$$

**Epoch 1** ($w_0 = w_1 = 0$, so every $h(x_i) = 0$):

| $x_i$ | $y_i$ | $h$ | $e_i = h - y$ | $e_ix_i$ |
|---|---|---|---|---|
| −1 | 0 | 0 | 0 | 0 |
| 0 | 2 | 0 | −2 | 0 |
| 1 | 4 | 0 | −4 | −4 |
| 2 | 5 | 0 | −5 | −10 |
| | | | **−11** | **−14** |

$w_0 = 0 - 0.01\cdot\frac{-11}{4} = 0.0275$, $\quad w_1 = 0 - 0.01\cdot\frac{-14}{4} = 0.035$.

**Epoch 2** ($h(x) = 0.0275 + 0.035x$):

| $x_i$ | $y_i$ | $h$ | $e_i$ | $e_ix_i$ |
|---|---|---|---|---|
| −1 | 0 | −0.0075 | −0.0075 | 0.0075 |
| 0 | 2 | 0.0275 | −1.9725 | 0 |
| 1 | 4 | 0.0625 | −3.9375 | −3.9375 |
| 2 | 5 | 0.0975 | −4.9025 | −9.805 |
| | | | **−10.82** | **−13.735** |

$w_0 = 0.0275 + 0.01\cdot\frac{10.82}{4} = 0.05455$, $\quad w_1 = 0.035 + 0.01\cdot\frac{13.735}{4} = 0.0693375$.

$$h(x) \approx 0.0546 + 0.0693x$$

**Vector shortcut:** $\nabla J = \frac1m(X^TX\vec{w} - X^T\vec{y})$ with $X^TX = \begin{bmatrix}4&2\\2&6\end{bmatrix}$, $X^T\vec{y} = (11, 14)$ from part a. Epoch 2: $X^TX\vec{w} = (0.18, 0.265)$, so $\nabla J = \frac14(0.18 - 11,\ 0.265 - 14) = (-2.705, -3.43375)$ → same update.

**Comment:** $J$ goes $5.625 \to 5.429 \to 5.239$: decreasing but far from the minimum 0.0375, and $\vec{w}$ is far from $(1.9, 1.7)$, because $\alpha = 0.01$ is small (the "too small" case on L3 p47). If your class drops the $\frac12$ (uses $\frac1m\sum$), every gradient doubles, so the weights become $(0.055, 0.07)$ after epoch 1 and $(0.1082, 0.13735)$ after epoch 2.`,
    },
    {
      id: 'hw02-ex2',
      type: 'written',
      source: { kind: 'hw', label: 'HW02 Exercise 2 (ridge)', note: 'File HW03-ML.pdf' },
      prompt: r`**Ridge regression.** Write the gradient-descent approach and the analytical solution for ridge regression in detail (L2 penalty added to $J(\vec{w})$, where $J$ is the MSE). Explain what happens when $\lambda \to \infty$.`,
      solution: r`**Cost** (do not penalise the intercept $w_0$):
$$J(\vec{w}) = \frac{1}{2m}\Big[\sum_{i=1}^{m}(\vec{w}^T\vec{x}_i - y_i)^2 + \lambda\sum_{j=1}^{n}w_j^2\Big] = \frac{1}{2m}\Big[(X\vec{w} - \vec{y})^T(X\vec{w} - \vec{y}) + \lambda\,\vec{w}^TL\vec{w}\Big],\quad L = \mathrm{diag}(0, 1, \dots, 1)$$

**Gradient.** The MSE part gives the usual terms; $\frac{\lambda}{2m}w_j^2$ differentiates to $\frac{\lambda}{m}w_j$:
$$\frac{\partial J}{\partial w_0} = \frac1m\sum_i e_i,\qquad \frac{\partial J}{\partial w_j} = \frac1m\sum_i e_ix_{ij} + \frac{\lambda}{m}w_j\ (j \ge 1),\qquad e_i = \vec{w}^T\vec{x}_i - y_i$$
Vector form: $\nabla J = \frac1m\big[X^T(X\vec{w} - \vec{y}) + \lambda L\vec{w}\big]$.

**Gradient descent:**
- initialise $\vec{w}$ (e.g. zeros); repeat until $J$ decreases by less than $10^{-3}$:
- $w_0 := w_0 - \frac{\alpha}{m}\sum_i e_i$
- $w_j := w_j\big(1 - \frac{\alpha\lambda}{m}\big) - \frac{\alpha}{m}\sum_i e_ix_{ij}$ for $j = 1..n$, all updated **simultaneously**.

The factor $1 - \frac{\alpha\lambda}{m} < 1$ shrinks every weight each step (**weight decay**). Large $\lambda$ needs a smaller $\alpha$ (if $\frac{\alpha\lambda}{m} > 1$ the weights oscillate).

**Analytical solution.** Set $\nabla J = 0$:
$$X^TX\vec{w} + \lambda L\vec{w} = X^T\vec{y} \;\Rightarrow\; \boxed{\vec{w} = (X^TX + \lambda L)^{-1}X^T\vec{y}}$$
($\lambda = 0$ gives back the normal equation; penalising $w_0$ too replaces $L$ by $I$.) For $\lambda > 0$ the matrix is always invertible, even when $X^TX$ is singular (e.g. L3 p52 with $m < n + 1$).

**When $\lambda \to \infty$:** any non-zero $w_j$ ($j \ge 1$) costs $\frac{\lambda}{2m}w_j^2 \to \infty$, so all $w_j \to 0$. The model becomes $h(\vec{x}) = w_0$, and minimising $\sum(w_0 - y_i)^2$ gives $w_0 = \bar y$: a **flat line at the mean** (→ 0 if $w_0$ is penalised too). The model ignores its inputs: **underfitting** (high bias, low variance). Numerically on the Exercise 1 data: $w_1 = \frac{17}{10 + 2\lambda}$, giving $1.7, 0.85, 0.34, 0.081$ for $\lambda = 0, 5, 20, 100$, and $w_0 \to \bar y = 2.75$. Choose $\lambda$ by cross-validation.`,
    },
    {
      id: 'hw02-ex3',
      type: 'numeric',
      source: { kind: 'hw', label: 'HW02 Exercise 3 (multi-output)', note: 'File HW03-ML.pdf' },
      prompt: r`Linear regression with 2-dimensional responses $\vec{y}_i \in \mathbb{R}^2$ and binary inputs $x_i \in \{0, 1\}$:

| $x$ | $\vec{y}$ |
|---|---|
| 0 | $(-1, -1)^T$ |
| 0 | $(-1, -2)^T$ |
| 0 | $(-2, -1)^T$ |
| 1 | $(1, 1)^T$ |
| 1 | $(1, 2)^T$ |
| 1 | $(2, 1)^T$ |

Embed $x$ with $\phi(0) = (1, 0)^T$, $\phi(1) = (0, 1)^T$; the model is $h(x) = W^T\phi(x)$ with $W \in \mathbb{R}^{2\times2}$. Using the MSE cost, find $W$.`,
      fields: [
        { label: r`$w_{11}$`, answer: -4 / 3, tol: 0.002 },
        { label: r`$w_{12}$`, answer: -4 / 3, tol: 0.002 },
        { label: r`$w_{21}$`, answer: 4 / 3, tol: 0.002 },
        { label: r`$w_{22}$`, answer: 4 / 3, tol: 0.002 },
      ],
      solution: r`**Set-up.** $h(0) = W^T(1, 0)^T = (w_{11}, w_{12})^T$ (row 1 of $W$) and $h(1) = (w_{21}, w_{22})^T$ (row 2). So the $x = 0$ points are predicted by row 1 only, the $x = 1$ points by row 2 only.

**Cost:**
$$J = \frac{1}{2\cdot6}\Big[\sum_{x_i = 0}\big((w_{11} - y_{i1})^2 + (w_{12} - y_{i2})^2\big) + \sum_{x_i = 1}\big((w_{21} - y_{i1})^2 + (w_{22} - y_{i2})^2\big)\Big]$$

**Each entry separately** (derivative = 0): e.g. $\frac{\partial J}{\partial w_{11}} = \frac16\sum_{x_i=0}(w_{11} - y_{i1}) = 0 \Rightarrow 3w_{11} = -1 - 1 - 2 \Rightarrow w_{11} = -\frac43$.
Similarly $w_{12} = \frac{-1-2-1}{3} = -\frac43$, $w_{21} = \frac{1+1+2}{3} = \frac43$, $w_{22} = \frac{1+2+1}{3} = \frac43$.

**Matrix route** (normal equation per output column): $\Phi$ has rows $\phi(x_i)^T$, so $\Phi^T\Phi = \mathrm{diag}(3, 3)$ and
$$W = (\Phi^T\Phi)^{-1}\Phi^TY = \frac13\begin{bmatrix}-4 & -4\\ 4 & 4\end{bmatrix} = \begin{bmatrix}-4/3 & -4/3\\ 4/3 & 4/3\end{bmatrix}$$

Each row of $W$ is the **average response** of its group, because $\phi$ is one-hot. Multi-output regression = one independent regression per output. Minimum cost: $J = \frac{4/3 + 4/3}{12} = \frac29$.`,
    },
    // ---------- Homework 4 Exercise 1 ----------
    {
      id: 'hw04-ex1',
      type: 'numeric',
      source: { kind: 'hw', label: 'HW04 Exercise 1' },
      prompt: r`A two-class dataset has feature matrix and labels
$$X = \begin{bmatrix}1 & 2\\ 1 & 3\\ 1 & 4\\ 1 & 5\end{bmatrix},\qquad y = \begin{bmatrix}0\\0\\1\\1\end{bmatrix}.$$
Use the **normal equation** to compute the weight vector $\vec{w}$ for the hypothesis $h(X) = X\vec{w}$.`,
      fields: [
        { label: r`$w_0$ (intercept)`, answer: -0.9, tol: 0.005 },
        { label: r`$w_1$`, answer: 0.4, tol: 0.005 },
      ],
      solution: r`The first column is already the column of 1s.

1. $X^TX = \begin{bmatrix}4 & 2+3+4+5\\ 14 & 4+9+16+25\end{bmatrix} = \begin{bmatrix}4 & 14\\ 14 & 54\end{bmatrix}$, $\quad X^T\vec{y} = \begin{bmatrix}0+0+1+1\\ 0+0+4+5\end{bmatrix} = \begin{bmatrix}2\\ 9\end{bmatrix}$.
2. $\det = 4\cdot54 - 14^2 = 216 - 196 = 20$, so $(X^TX)^{-1} = \frac{1}{20}\begin{bmatrix}54 & -14\\ -14 & 4\end{bmatrix}$.
3. $\vec{w} = \frac{1}{20}\begin{bmatrix}54\cdot2 - 14\cdot9\\ -14\cdot2 + 4\cdot9\end{bmatrix} = \frac{1}{20}\begin{bmatrix}-18\\ 8\end{bmatrix} = \begin{bmatrix}-0.9\\ 0.4\end{bmatrix}$.

$$\boxed{h(x) = -0.9 + 0.4x}$$

**Using it as a classifier:** predictions $-0.1, 0.3, 0.7, 1.1$. With threshold 0.5 → classes $0, 0, 1, 1$: all correct. The boundary is $-0.9 + 0.4x = 0.5 \Rightarrow x = 3.5$. Note that least squares does not output probabilities (−0.1 and 1.1 lie outside [0, 1]), which motivates logistic regression (L4).`,
    },
    // ---------- variants ----------
    {
      id: 'l3-ne-v1',
      type: 'numeric',
      source: { kind: 'variant', label: 'like HW02 Ex 1a' },
      prompt: r`Fit $h(x) = w_0 + w_1x$ to $\{(1, 1), (2, 3), (4, 3), (5, 5)\}$ with the normal equation.`,
      fields: [
        { label: r`$w_0$`, answer: 0.6, tol: 0.005 },
        { label: r`$w_1$`, answer: 0.8, tol: 0.005 },
      ],
      solution: r`Sums: $m = 4$, $\sum x = 12$, $\sum x^2 = 1 + 4 + 16 + 25 = 46$, $\sum y = 12$, $\sum xy = 1 + 6 + 12 + 25 = 44$.

$X^TX = \begin{bmatrix}4 & 12\\ 12 & 46\end{bmatrix}$, $\det = 184 - 144 = 40$, $X^T\vec{y} = (12, 44)^T$.
$$\vec{w} = \frac{1}{40}\begin{bmatrix}46\cdot12 - 12\cdot44\\ -12\cdot12 + 4\cdot44\end{bmatrix} = \frac{1}{40}\begin{bmatrix}24\\ 32\end{bmatrix} = \begin{bmatrix}0.6\\ 0.8\end{bmatrix}$$
Shortcut: $w_1 = \frac{4\cdot44 - 12\cdot12}{4\cdot46 - 144} = \frac{32}{40} = 0.8$, $w_0 = \bar y - w_1\bar x = 3 - 2.4 = 0.6$.`,
    },
    {
      id: 'l3-gd-v1',
      type: 'numeric',
      source: { kind: 'variant', label: 'like HW02 Ex 1b' },
      prompt: r`Data $\{(0, 1), (1, 3), (2, 2), (3, 4)\}$. Run batch gradient descent for 2 epochs with $\alpha = 0.1$, starting from $w_0 = w_1 = 0$, cost $J = \frac{1}{2m}\sum(h(x_i) - y_i)^2$.`,
      fields: [
        { label: r`$w_0$ after epoch 1`, answer: 0.25, tol: 0.0005 },
        { label: r`$w_1$ after epoch 1`, answer: 0.475, tol: 0.0005 },
        { label: r`$w_0$ after epoch 2`, answer: 0.40375, tol: 0.0005 },
        { label: r`$w_1$ after epoch 2`, answer: 0.74625, tol: 0.0005 },
      ],
      solution: r`**Epoch 1** (all $h = 0$): errors $\vec{e} = (-1, -3, -2, -4)$, $\sum e = -10$; elementwise products $(e_ix_i)_i = (0, -3, -4, -12)$, $\sum ex = -19$.
$w_0 = 0 - 0.1\cdot\frac{-10}{4} = 0.25$, $w_1 = 0 - 0.1\cdot\frac{-19}{4} = 0.475$.

**Epoch 2** ($h = 0.25 + 0.475x$): predictions $0.25, 0.725, 1.2, 1.675$; errors $-0.75, -2.275, -0.8, -2.325$, $\sum e = -6.15$; $\sum ex = 0 - 2.275 - 1.6 - 6.975 = -10.85$.
$w_0 = 0.25 + 0.1\cdot\frac{6.15}{4} = 0.40375$, $w_1 = 0.475 + 0.1\cdot\frac{10.85}{4} = 0.74625$.

(The exact least-squares answer is $w_0 = 1.3$, $w_1 = 0.8$; GD is still on its way.)`,
    },
    {
      id: 'l3-grad-v1',
      type: 'numeric',
      source: { kind: 'variant', label: 'like HW02 Ex 1b' },
      prompt: r`For the HW02 data $\{(-1, 0), (0, 2), (1, 4), (2, 5)\}$ and current weights $w_0 = 1$, $w_1 = 1$, compute the gradient components $\partial J/\partial w_0$ and $\partial J/\partial w_1$ (cost with $\frac{1}{2m}$).`,
      fields: [
        { label: r`$\partial J/\partial w_0$`, answer: -1.25, tol: 0.002 },
        { label: r`$\partial J/\partial w_1$`, answer: -1.5, tol: 0.002 },
      ],
      solution: r`$h(x) = 1 + x$: predictions $0, 1, 2, 3$; errors $e = h - y = 0, -1, -2, -2$.
- $\partial J/\partial w_0 = \frac14\sum e = \frac{-5}{4} = -1.25$.
- $\partial J/\partial w_1 = \frac14\sum e\,x = \frac14(0 + 0 - 2 - 4) = -1.5$.

Both negative → GD will **increase** both weights (towards 1.9 and 1.7).`,
    },
    {
      id: 'l3-cost-v1',
      type: 'numeric',
      source: { kind: 'slide', label: 'L3 p16–20' },
      prompt: r`Training points $(1, 1), (2, 2), (3, 3)$. Compute $J(w_0, w_1) = \frac{1}{2m}\sum(h(x_i) - y_i)^2$ for (a) $h(x) = 0.5x$ and (b) $h(x) = 1 + 0.5x$.`,
      fields: [
        { label: '(a) J', answer: 3.5 / 6, tol: 0.002 },
        { label: '(b) J', answer: 0.5 / 6, tol: 0.002 },
      ],
      solution: r`$m = 3$, so divide the sum of squares by 6.
- (a) predictions $0.5, 1, 1.5$; errors $-0.5, -1, -1.5$; squares $0.25 + 1 + 2.25 = 3.5$; $J = 0.583$.
- (b) predictions $1.5, 2, 2.5$; errors $0.5, 0, -0.5$; squares $0.25 + 0 + 0.25 = 0.5$; $J = 0.083$.

(b) fits better. The best possible here is $h(x) = x$ with $J = 0$.`,
    },
    {
      id: 'l3-cost-init',
      type: 'numeric',
      source: { kind: 'variant', label: 'like HW02 Ex 1b' },
      prompt: r`For the HW02 data $\{(-1, 0), (0, 2), (1, 4), (2, 5)\}$, compute the cost $J$ at the starting point $w_0 = w_1 = 0$ and at the optimum $w_0 = 1.9$, $w_1 = 1.7$.`,
      fields: [
        { label: r`$J(0, 0)$`, answer: 5.625, tol: 0.002 },
        { label: r`$J(1.9, 1.7)$`, answer: 0.0375, tol: 0.0005 },
      ],
      solution: r`- At $(0, 0)$ every error is $-y_i$: $\frac{0 + 4 + 16 + 25}{8} = \frac{45}{8} = 5.625$.
- At the optimum the errors are $0.2, -0.1, -0.4, 0.3$: $\frac{0.04 + 0.01 + 0.16 + 0.09}{8} = \frac{0.3}{8} = 0.0375$.`,
    },
    {
      id: 'l3-ridge-v1',
      type: 'numeric',
      source: { kind: 'variant', label: 'like HW02 Ex 2' },
      prompt: r`Ridge regression on the HW02 data $\{(-1, 0), (0, 2), (1, 4), (2, 5)\}$ with $\lambda = 5$, penalising only $w_1$: $\vec{w} = (X^TX + \lambda L)^{-1}X^T\vec{y}$, $L = \mathrm{diag}(0, 1)$. Find $w_0$ and $w_1$.`,
      fields: [
        { label: r`$w_0$`, answer: 2.325, tol: 0.003 },
        { label: r`$w_1$`, answer: 0.85, tol: 0.003 },
      ],
      solution: r`$X^TX + 5L = \begin{bmatrix}4 & 2\\ 2 & 6 + 5\end{bmatrix} = \begin{bmatrix}4 & 2\\ 2 & 11\end{bmatrix}$, $\det = 44 - 4 = 40$, $X^T\vec{y} = (11, 14)$.
$$\vec{w} = \frac{1}{40}\begin{bmatrix}11\cdot11 - 2\cdot14\\ -2\cdot11 + 4\cdot14\end{bmatrix} = \frac{1}{40}\begin{bmatrix}93\\ 34\end{bmatrix} = \begin{bmatrix}2.325\\ 0.85\end{bmatrix}$$
Compared with $\lambda = 0$ ($w_1 = 1.7$) the slope is halved and the intercept moves towards $\bar y = 2.75$.`,
    },
    {
      id: 'l3-predict-multi',
      type: 'numeric',
      source: { kind: 'slide', label: 'L3 p42–43' },
      prompt: r`A multivariate model is $h(\vec{x}) = 80 + 0.1x_1 + 20x_2 - 5x_3 - 1x_4$ with $x_1$ = size, $x_2$ = bedrooms, $x_3$ = floors, $x_4$ = age. Predict the price (in \$1000s) of the first house on L3 p42: size 2104, 5 bedrooms, 1 floor, 45 years.`,
      fields: [{ label: r`$h(\vec{x})$`, answer: 340.4, tol: 0.05 }],
      solution: r`$h = \vec{w}^T\vec{x}$ with $x_0 = 1$: $80 + 0.1(2104) + 20(5) - 5(1) - 1(45) = 80 + 210.4 + 100 - 5 - 45 = 340.4$.`,
    },
    // ---------- concept MCQs ----------
    {
      id: 'l3-lr-large',
      type: 'mcq',
      source: { kind: 'slide', label: 'L3 p46–47' },
      prompt: r`While running gradient descent, $J(\vec{w})$ goes **up** from one iteration to the next and keeps growing. What is the most likely cause and fix?`,
      options: ['α is too small; increase it', 'α is too large; decrease it', 'Too few iterations; run longer', 'The normal equation must be used instead'],
      answer: 1,
      solution: r`A too-large learning rate overshoots the minimum and can diverge (middle plot of L3 p47). For small enough $\alpha$, $J$ decreases every iteration (p46). Too small an $\alpha$ only makes convergence **slow**, never increasing.`,
    },
    {
      id: 'l3-simultaneous',
      type: 'mcq',
      source: { kind: 'slide', label: 'L3 p29, p31' },
      prompt: r`Which pseudo-code performs a correct **simultaneous** gradient-descent update?`,
      options: [
        r`$w_0 := w_0 - \alpha\,\partial_0J(w_0, w_1)$; then $w_1 := w_1 - \alpha\,\partial_1J(w_0, w_1)$ using the new $w_0$`,
        r`$t_0 := w_0 - \alpha\,\partial_0J(w_0, w_1)$; $t_1 := w_1 - \alpha\,\partial_1J(w_0, w_1)$; then $w_0 := t_0$, $w_1 := t_1$`,
        r`$w_1 := w_1 - \alpha\,\partial_1J$ first, then $w_0$ using the new $w_1$`,
        r`Update only the parameter with the larger gradient`,
      ],
      answer: 1,
      solution: r`Both gradients must be computed from the **old** $(w_0, w_1)$, then both values replaced. Using a freshly updated $w_0$ to compute $w_1$'s gradient is a different (non-standard) algorithm.`,
    },
    {
      id: 'l3-gd-vs-ne',
      type: 'mcq',
      source: { kind: 'slide', label: 'L3 p53' },
      prompt: r`You have $m = 5{,}000$ examples and $n = 200{,}000$ features. Which method is preferable, and why?`,
      options: [
        'Normal equation, because it needs no learning rate',
        r`Gradient descent, because the normal equation must invert an $(n+1)\times(n+1)$ matrix, which is very slow for large $n$`,
        'Normal equation, because gradient descent cannot handle many features',
        'Either, they have the same cost',
      ],
      answer: 1,
      solution: r`The normal equation needs $(X^TX)^{-1}$, roughly $O(n^3)$, hopeless for 200,000 features. Gradient descent "works well even when $n$ is large". (Here $m < n + 1$ also makes $X^TX$ singular.)`,
    },
    {
      id: 'l3-dims',
      type: 'mcq',
      source: { kind: 'slide', label: 'L3 p49–51' },
      prompt: r`With $m = 100$ examples and $n = 5$ features (plus $x_0 = 1$), what are the sizes of $X$, $X^TX$ and the pseudo-inverse $X^\dagger$?`,
      options: [r`$100\times5$, $5\times5$, $5\times100$`, r`$100\times6$, $6\times6$, $6\times100$`, r`$6\times100$, $100\times100$, $100\times6$`, r`$100\times6$, $100\times100$, $6\times6$`],
      answer: 1,
      solution: r`$X$ is $m\times(n+1) = 100\times6$. $X^TX$ is $(n+1)\times(n+1) = 6\times6$. $X^\dagger = (X^TX)^{-1}X^T$ is $(n+1)\times m = 6\times100$, so $\vec{w} = X^\dagger\vec{y}$ is $6\times1$.`,
    },
    {
      id: 'l3-singular',
      type: 'mcq',
      source: { kind: 'slide', label: 'L3 p52' },
      prompt: r`The normal-equation example on L3 p52 has 4 houses and 4 features plus an intercept. What goes wrong?`,
      options: [
        r`Nothing, $\vec{w}$ is unique`,
        r`$X^TX$ ($5\times5$) is singular because $m = 4 < n + 1 = 5$, so $(X^TX)^{-1}$ does not exist and infinitely many $\vec{w}$ fit perfectly`,
        'Gradient descent diverges',
        'The cost function is not convex',
      ],
      answer: 1,
      solution: r`$X^TX$ has rank at most $m = 4$ but size $5\times5$, so it is not invertible. Many weight vectors give zero training error. Fixes: more data, fewer features, or ridge regularisation ($X^TX + \lambda L$ is invertible).`,
    },
    {
      id: 'l3-x0',
      type: 'mcq',
      source: { kind: 'slide', label: 'L3 p43' },
      prompt: r`Why do we define $x_0 = 1$ in multivariate linear regression?`,
      options: [
        'To normalise the features',
        r`So that the intercept $w_0$ fits into the dot product: $h(\vec{x}) = \sum_{j=0}^n w_jx_j = \vec{w}^T\vec{x}$`,
        'To avoid division by zero',
        'Because the first feature is always 1 in real data',
      ],
      answer: 1,
      solution: r`$w_0\cdot1 + w_1x_1 + \dots = \vec{w}^T\vec{x}$ with $\vec{x}, \vec{w} \in \mathbb{R}^{n+1}$. In the matrix $X$ it is the column of ones.`,
    },
    {
      id: 'l3-batch',
      type: 'mcq',
      source: { kind: 'slide', label: 'L3 p41' },
      prompt: r`"Batch" gradient descent means:`,
      options: ['Each step uses one random training example', 'Each step uses all training examples', 'The learning rate is chosen per batch', 'Training stops after one pass'],
      answer: 1,
      solution: r`"Batch: each step of gradient descent uses **all** the training examples" (L3 p41). One random example per step is stochastic GD.`,
    },
    {
      id: 'l3-convergence',
      type: 'mcq',
      source: { kind: 'slide', label: 'L3 p46' },
      prompt: r`Which automatic convergence test is suggested on the slides?`,
      options: [
        r`Stop when $J(\vec{w}) = 0$`,
        r`Stop when $J(\vec{w})$ decreases by less than $10^{-3}$ in one iteration`,
        'Stop after exactly 100 iterations',
        'Stop when the learning rate reaches 0',
      ],
      answer: 1,
      solution: r`"Declare convergence if $J(\vec{w})$ decreases by less than $10^{-3}$ in one iteration." $J$ rarely reaches exactly 0 on real data.`,
    },
    {
      id: 'l3-hypothesis-space',
      type: 'mcq',
      source: { kind: 'slide', label: 'L3 p10' },
      prompt: r`How many hypotheses does the linear hypothesis space $h(x) = ax + b$ contain?`,
      options: ['2', 'One per training example', 'Infinitely many: every choice of a and b', 'Exactly one, the least-squares line'],
      answer: 2,
      solution: r`Any real $a, b$ give a hypothesis, so the space is **infinite**. Learning searches it for the one that best fits the data (minimum $J$).`,
    },
    {
      id: 'l3-gd-direction',
      type: 'mcq',
      source: { kind: 'slide', label: 'L3 p29' },
      prompt: r`At the current point, $\partial J/\partial w_1 = 3.2$. In which direction does gradient descent move $w_1$?`,
      options: ['It increases w₁', 'It decreases w₁', 'It leaves w₁ unchanged', 'It depends on w₀ only'],
      answer: 1,
      solution: r`$w_1 := w_1 - \alpha \cdot 3.2$: a positive slope means $J$ grows as $w_1$ grows, so the step goes the other way (decreases $w_1$).`,
    },
  ],
};
