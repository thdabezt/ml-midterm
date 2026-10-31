---
slug: l3-linear-regression
num: 3
title: Linear Regression
short: Linear regression
summary: Fit a straight line (or plane) to data. The cost function J (mean squared error), gradient descent step by step, the learning rate, multivariate regression, and the normal equation w = (XᵀX)⁻¹Xᵀy.
---
Linear regression is the most "calculation-heavy" topic before the midterm. Homework 2 (file `HW03-ML.pdf`) asks for **both** solution methods on a 4-point dataset, ridge regression, and multi-output regression. Homework 4 Exercise 1 applies the normal equation to a classification dataset. Expect at least one practical exam question here.

:::exam What the midterm can ask from this lecture
- Compute $J(w_0, w_1)$ for given data and parameters.
- Do 1–2 steps of (batch) gradient descent by hand.
- Solve the normal equation for a small dataset ($2\times2$ inverse).
- Effect of the learning rate (too small / too large / decaying).
- Gradient descent vs normal equation: pros and cons.
:::

## The supervised learning setup

Recap of the formal setting (p4): input $\mathbf{x} \in \mathcal{X} \subseteq \mathbb{R}^n$; output $y \in \mathcal{Y}$, which is $\mathbb{R}$ for **regression**, $\{+1, -1\}$ for binary classification, $\{1, \dots, K\}$ for multi-class. There is an unknown **target function** $f: \mathcal{X} \to \mathcal{Y}$. We get training data $D = \{(\mathbf{x}_1, y_1), \dots, (\mathbf{x}_m, y_m)\}$ and look for a **hypothesis** $h \approx f$ inside a **hypothesis space** $\mathcal{H}$.

The lecture repeats the statistical learning framework of Lecture 2 (p6–8): true error $L_{\mathcal{D},c}(h)$ is unknown, so **Empirical Risk Minimisation** minimises the training error $L_S(h)$ instead.

**Hypothesis spaces** (p10): linear $h(x) = ax + b$ (already infinitely many choices of $a, b$); polynomial $h(x) = ax^2 + bx + c$; any nonlinear $h(x) = g(x)$.

**Key issues in ML** (p12): good hypothesis spaces; algorithms for them; finding the best hypothesis efficiently (**optimisation**); accuracy on future data (**overfitting / generalisation**); how much data is needed (**statistical**); intractable problems (**computational**); turning applications into ML problems (**engineering**).

## The model and its notation

Running example (p13–14): predict a house's price from its size (Portland, OR).

| Size $x$ (feet²) | Price $y$ (\$1000s) |
|---|---|
| 2104 | 460 |
| 1416 | 232 |
| 1534 | 315 |
| 852 | 178 |

Notation: $m$ = number of training examples; $x$ = input / feature; $y$ = output / target; $(x_i, y_i)$ = the $i$-th example.

:::formula @regression-univariate-model Univariate linear regression (p15)
$$h(x) = w_0 + w_1 x$$
:::

:::read
- $w_0$ = **intercept** (bias): the prediction when $x = 0$; where the line crosses the y-axis.
- $w_1$ = **slope**: how much the prediction increases when $x$ increases by 1.
- Learning = choosing the numbers $w_0, w_1$.
- Example on slide p22: $h(x) = 50 + 0.06x$ predicts $50 + 0.06 \times 2000 = 170$ (i.e. \$170k) for a 2000 ft² house.
:::

## The cost function J (mean squared error)

:::formula @regression-squared-cost Cost function (p16)
$$J(w_0, w_1) = \frac{1}{2m}\sum_{i=1}^{m}\big(h(x_i) - y_i\big)^2 \qquad\text{Goal: } \min_{w_0, w_1} J(w_0, w_1)$$
:::

:::read
- $h(x_i) - y_i$ = the **error (residual)** on example $i$: prediction minus truth (the dotted vertical segments in the slide picture).
- Square it: negative and positive errors both count, and big errors count a lot more.
- Add over all $m$ examples, divide by $m$ → average squared error (MSE).
- The extra $\frac12$ is only for convenience: it cancels the 2 that appears when you differentiate a square.
:::

:::steps Computing J by hand
1. For each example compute the prediction $h(x_i) = w_0 + w_1x_i$.
2. Compute the error $e_i = h(x_i) - y_i$ and square it.
3. Add the squares, divide by $2m$.
:::

:::example Slide data (1,1), (2,2), (3,3) with $h(x) = w_1x$ (p18–20)
$m = 3$.
- $w_1 = 1$: predictions 1, 2, 3 → errors 0 → $J = 0$ (perfect fit).
- $w_1 = 0.5$: predictions 0.5, 1, 1.5 → errors $-0.5, -1, -1.5$ → squares $0.25 + 1 + 2.25 = 3.5$ → $J = 3.5/6 = 0.583$.
- $w_1 = 0$: errors $-1, -2, -3$ → squares $1 + 4 + 9 = 14$ → $J = 14/6 = 2.333$.

Plotting $J$ against $w_1$ gives a **bowl (parabola)** with its bottom at $w_1 = 1$. With two parameters $J(w_0, w_1)$ is a 3-D bowl, usually drawn as **contour lines** (ellipses); the centre of the ellipses is the best $(w_0, w_1)$ (p22–25).
:::

## Gradient descent

**Idea** (p26): start somewhere, then repeatedly take a small step **downhill** until you reach a minimum.

:::formula @regression-gradient-update Gradient descent update (p29)
$$w_j := w_j - \alpha\,\frac{\partial}{\partial w_j}J(w_0, w_1)\qquad (j = 0, 1;\ \text{update both simultaneously})$$
:::

:::read
- $\frac{\partial J}{\partial w_j}$: the slope of the cost in direction $w_j$. Positive slope → decrease $w_j$; negative slope → increase $w_j$. The minus sign does this automatically.
- $\alpha$ (alpha): the **learning rate** = step size (rule of thumb on the slide: 0.1).
- **Simultaneous update**: compute *both* new values using the *old* $w_0, w_1$, then replace both. Do not use the new $w_0$ to compute the new $w_1$.
:::

For linear regression the derivatives are (p30, derived in the Math toolkit):

:::formula @regression-batch-gradient Gradient descent for linear regression (p31)
$$\frac{\partial J}{\partial w_0} = \frac{1}{m}\sum_{i=1}^{m}\big(h(x_i) - y_i\big) \qquad \frac{\partial J}{\partial w_1} = \frac{1}{m}\sum_{i=1}^{m}\big(h(x_i) - y_i\big)\,x_i$$
$$w_0 := w_0 - \alpha\frac{1}{m}\sum_{i=1}^{m}\big(h(x_i) - y_i\big) \qquad w_1 := w_1 - \alpha\frac{1}{m}\sum_{i=1}^{m}\big(h(x_i) - y_i\big)x_i$$
:::

:::steps One iteration ("epoch") of batch gradient descent by hand
1. Make a table with columns $x_i,\ y_i,\ h(x_i),\ e_i = h(x_i) - y_i,\ e_i x_i$.
2. Sum the $e_i$ column and the $e_ix_i$ column.
3. Gradients: $g_0 = \frac{1}{m}\sum e_i$, $g_1 = \frac{1}{m}\sum e_ix_i$.
4. Update: $w_0 \leftarrow w_0 - \alpha g_0$, $w_1 \leftarrow w_1 - \alpha g_1$.
5. Next epoch: recompute the table with the **new** weights.
:::

:::example Data (1,2), (2,3), (3,5); start $w_0 = w_1 = 0$, $\alpha = 0.1$
| $x_i$ | $y_i$ | $h(x_i)$ | $e_i$ | $e_ix_i$ |
|---|---|---|---|---|
| 1 | 2 | 0 | −2 | −2 |
| 2 | 3 | 0 | −3 | −6 |
| 3 | 5 | 0 | −5 | −15 |
| | | | **−10** | **−23** |

$g_0 = -10/3 = -3.333$, $g_1 = -23/3 = -7.667$.
$w_0 = 0 - 0.1(-3.333) = 0.3333$, $w_1 = 0 - 0.1(-7.667) = 0.7667$.

Both weights moved up, because the line $h = 0$ was below every point.
:::

**Batch** gradient descent (p41) means every step uses **all** $m$ training examples. In homework language: batch size $= m$ → one update per epoch.

:::note Local minima (p27–28)
On a bumpy cost surface, different starting points can lead gradient descent to different **local minima**. The linear-regression cost is a convex bowl, so it has only one (global) minimum.
:::

{{visual:regression}}

## Learning rate and convergence

- **Convergence test** (p46): stop when $J$ decreases by less than $10^{-3}$ in one iteration. Plot $J$ against the number of iterations: it should go down every time.
- **$\alpha$ too small**: tiny steps, slow convergence.
- **$\alpha$ too large**: overshoots the bottom, $J$ may go up and **diverge**.
- **Gradually decreased** $\alpha_t = \alpha / t$: big steps first, small steps near the minimum (p47). {{priority:regression-decaying-rate}}

:::pitfall
If $J$ increases from one iteration to the next, the fix is a **smaller** $\alpha$, not more iterations.
:::

## Multivariate linear regression

With several features (size, bedrooms, floors, age; p42): $n$ = number of features, $\mathbf{x}_i$ = feature vector of example $i$, $x_{ij}$ = feature $j$ of example $i$.

:::formula @regression-multivariate-model Hypothesis with n features (p43)
$$h(\mathbf{x}) = w_0 + w_1x_1 + \dots + w_nx_n = \sum_{j=0}^{n} w_jx_j = \mathbf{w}^T\mathbf{x}\qquad (x_0 = 1)$$
:::

:::read
The trick $x_0 = 1$ lets the intercept $w_0$ join the dot product, so $\mathbf{x}, \mathbf{w} \in \mathbb{R}^{n+1}$. In a data matrix this is the **column of 1s** on the left.
:::

:::formula @regression-vector-gradient Vector gradient descent (p44–45)
$$\mathbf{w} := \mathbf{w} - \alpha\nabla J(\mathbf{w}), \qquad \frac{\partial J}{\partial w_j} = \frac{1}{m}\sum_{i=1}^{m}\big(h(\mathbf{x}_i) - y_i\big)x_{ij}, \qquad \nabla J(\mathbf{w}) = \frac1m X^T(X\mathbf{w} - \mathbf{y})$$
:::

## Normal equation (analytical solution)

Instead of walking downhill, jump straight to the bottom: the minimum is where the gradient is **zero** (p48). In 1-D, $J(w) = aw^2 + bw + c$ is a parabola and you solve $J'(w) = 0$.

Stack the data into a matrix (p49): $X$ is $m \times (n+1)$ (one row per example, first column all 1s), $\mathbf{y}$ is $m \times 1$. Then

:::formula @regression-matrix-cost Squared-error cost in matrix form
$$J(\mathbf{w}) = \frac{1}{2m}(X\mathbf{w} - \mathbf{y})^T(X\mathbf{w} - \mathbf{y})$$
:::

:::formula @regression-normal-equation Normal equation (p50–51)
$$\nabla J = 0 \;\Longrightarrow\; X^TX\,\mathbf{w} = X^T\mathbf{y} \;\Longrightarrow\; \mathbf{w} = (X^TX)^{-1}X^T\mathbf{y} = X^\dagger\mathbf{y}$$
:::

:::read
- $X^T$: transpose of $X$ (rows become columns).
- $(X^TX)$ is a small square matrix, $(n+1)\times(n+1)$: $2\times2$ for one feature.
- $X^\dagger = (X^TX)^{-1}X^T$ is the **pseudo-inverse**, size $(n+1)\times m$.
- No learning rate, no iterations: one formula.
:::

:::steps Solving the normal equation with one feature
1. Make a table with $x_i, y_i, x_i^2, x_iy_i$ and add each column.
2. $X^TX = \begin{bmatrix} m & \sum x\\ \sum x & \sum x^2\end{bmatrix}$, $X^T\mathbf{y} = \begin{bmatrix}\sum y\\ \sum xy\end{bmatrix}$.
3. Invert the $2\times2$ matrix: swap the diagonal, negate the off-diagonal, divide by the determinant $m\sum x^2 - (\sum x)^2$.
4. Multiply: $\mathbf{w} = (X^TX)^{-1}X^T\mathbf{y}$.
5. Check: the errors $h(x_i) - y_i$ should **add up to 0** (a property of the least-squares line with an intercept).
:::

:::example Data (1,2), (2,3), (3,5)
Sums: $m = 3$, $\sum x = 6$, $\sum x^2 = 14$, $\sum y = 10$, $\sum xy = 2 + 6 + 15 = 23$.
$$X^TX = \begin{bmatrix}3 & 6\\ 6 & 14\end{bmatrix},\quad \det = 42 - 36 = 6,\quad (X^TX)^{-1} = \frac16\begin{bmatrix}14 & -6\\ -6 & 3\end{bmatrix}$$
$$\mathbf{w} = \frac16\begin{bmatrix}14\cdot10 - 6\cdot23\\ -6\cdot10 + 3\cdot23\end{bmatrix} = \frac16\begin{bmatrix}2\\ 9\end{bmatrix} = \begin{bmatrix}0.333\\ 1.5\end{bmatrix}$$
So $h(x) = 0.333 + 1.5x$. Predictions 1.833, 3.333, 4.833; errors $-0.167 + 0.333 - 0.167 = 0$ ✓.
:::

:::formula @regression-univariate-shortcut Shortcut formulas for one feature (same answer, fewer matrices)
$$w_1 = \frac{m\sum xy - \sum x\sum y}{m\sum x^2 - (\sum x)^2}, \qquad w_0 = \bar y - w_1\bar x$$
Example above: $w_1 = \frac{3\cdot23 - 6\cdot10}{3\cdot14 - 36} = \frac{9}{6} = 1.5$, $w_0 = \frac{10}{3} - 1.5\cdot2 = 0.333$.
:::

:::pitfall
- $(X^TX)^{-1}$ does not exist when columns are redundant or when there are fewer examples than parameters. Slide p52 is such a case: 4 houses but 5 parameters ($m = 4 < n + 1 = 5$). Regularisation (ridge) fixes this.
- Do not forget the column of 1s; without it you fit a line through the origin.
:::

## Gradient descent vs normal equation

| Gradient descent | Normal equation |
|---|---|
| Must choose $\alpha$ | No $\alpha$ |
| Many iterations | No iterations |
| Works well even when $n$ (features) is large | Must compute $(X^TX)^{-1}$, cost about $O(n^3)$ (Lecture 4 p7 gives $O(mn^2 + n^3)$) |
| | Slow if $n$ is very large |

## Extensions used in Homework 2

**Ridge regression** (Exercise 2) adds an L2 penalty to $J$. Full details are in Lecture 7; the results to remember:

:::formula @regression-ridge-cost Ridge objective
$$J(\mathbf{w}) = \frac{1}{2m}\Big[\sum_i (h(\mathbf{x}_i) - y_i)^2 + \lambda\sum_{j\ge1}w_j^2\Big]$$
:::

:::formula @regression-ridge-solution Ridge analytical solution
$$\mathbf{w} = (X^TX + \lambda L)^{-1}X^T\mathbf{y},\qquad L = \mathrm{diag}(0, 1, \dots, 1)$$
:::

:::formula @regression-ridge-update Ridge gradient-descent update (weight decay)
$$w_j := w_j\left(1 - \frac{\alpha\lambda}{m}\right) - \frac{\alpha}{m}\sum_i e_ix_{ij},\qquad j\ge1$$
:::

As $\lambda \to \infty$, all $w_j$ ($j \ge 1$) shrink to 0 and the model becomes the flat line $h(x) = \bar y$ (**underfitting**). {{priority:regression-ridge-limit}}

**Multi-output regression** (Exercise 3): with $\mathbf{y}_i \in \mathbb{R}^2$ and $h(x) = W^T\phi(x)$, the MSE splits into one ordinary regression per output column.

:::formula @regression-multi-output Multi-output least-squares solution
$$W = (\Phi^T\Phi)^{-1}\Phi^TY$$
:::

Solve column by column, one response variable at a time.
