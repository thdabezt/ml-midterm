---
slug: l6-svm
num: 6
title: Classification (3) – Support Vector Machines
short: SVM
summary: The perceptron, the maximum-margin idea, hard- and soft-margin SVM (slack variables, C, hinge loss), the dual and support vectors, feature maps and the kernel trick (linear, polynomial, RBF), and multi-class SVMs (one-vs-rest, one-vs-one).
---
SVM questions in a midterm are mostly **conceptual** (what the margin is, what C does, which points are support vectors, why kernels) plus small calculations: a point's distance to a hyperplane, a margin $2/\lVert\mathbf{w}\rVert$, a kernel value, or the number of one-vs-one classifiers.

:::exam What the midterm can ask from this lecture
- Classify a point with $f(\mathbf{x}) = \mathrm{sgn}(\mathbf{w}^T\mathbf{x} + b)$; distance from a point to the hyperplane; margin $= 2/\lVert\mathbf{w}\rVert$.
- Perceptron update rule; linear separability; AND / OR are linearly separable, XOR is not.
- Hard vs soft margin; role of slack $\xi_i$ and of $C$ (large C → low bias, high variance).
- Hinge loss value for a given $y\,f(\mathbf{x})$.
- Support vectors = points with $\alpha_i > 0$ (on or inside the margin).
- Compute a linear / polynomial / RBF kernel value; why the kernel trick is efficient.
- One-vs-rest needs $k$ SVMs, one-vs-one needs $k(k-1)/2$.
:::

## Problem setting

Training data $(\mathbf{x}_1, y_1), (\mathbf{x}_2, y_2), \dots$ with labels $y_i \in \{+1, -1\}$ (p4). Goal: find a **linear hyperplane** (decision boundary) that separates the classes, and classify with

:::formula @svm-linear-classifier Linear classifier
$$f(\mathbf{x}) = \mathrm{sgn}(\mathbf{w}^T\mathbf{x} + b)$$
:::

:::read
- $\mathbf{w}^T\mathbf{x} + b$ is a score; $\mathrm{sgn}$ returns $+1$ if the score is positive, $-1$ if negative.
- The **hyperplane** is the set of points with score exactly 0: a line in 2-D, a plane in 3-D.
- $\mathbf{w}$ is perpendicular to the hyperplane and points towards the $+1$ side; $b$ shifts it.
:::

:::example
$\mathbf{w} = (1, 2)$, $b = -4$. Point $(3, 1)$: score $3 + 2 - 4 = 1 > 0$ → class $+1$. Point $(1, 1)$: $1 + 2 - 4 = -1$ → class $-1$.
:::

## The perceptron

The hyperplane $H = \{\mathbf{x} : \mathbf{w}^T\mathbf{x} + b = 0\}$ splits space into the positive side ($\mathbf{w}^T\mathbf{x} + b \ge 0$, $y = +1$) and the negative side ($< 0$, $y = -1$) (p6).

:::formula @svm-separability Linear separability (p7)
$$D \text{ is linearly separable} \iff \exists\,\mathbf{w}, b:\ s_i = y_i(\mathbf{w}^T\mathbf{x}_i + b) \ge 0\ \ \forall i$$
:::

:::read
$s_i$ is positive exactly when example $i$ is on the correct side: $y_i = +1$ needs a positive score, $y_i = -1$ a negative score, and multiplying by $y_i$ turns both into "positive = correct".
:::

:::note Strict inequality
Taken literally, "$\ge 0$" is satisfied by $\mathbf{w} = 0, b = 0$ for any dataset (every score is 0). The intended meaning is **strictly** correct, $s_i > 0$ for all $i$, equivalently $s_i \ge \delta > 0$ as in the convergence theorem below.
:::

:::example Slide mini-exercise (p7): AND, OR, XOR
Inputs $x_1, x_2 \in \{0, 1\}$, output $+1$ for "true".
- **AND**: $x_1 + x_2 - 1.5$. Only $(1,1)$ gives a positive score (0.5).
- **OR**: $x_1 + x_2 - 0.5$. Only $(0,0)$ is negative (−0.5).
- **XOR** (true when exactly one input is 1) is **not linearly separable**: no single line separates $\{(0,1), (1,0)\}$ from $\{(0,0), (1,1)\}$. Use two linear functions, $h_1 = $ OR $= x_1 + x_2 - 0.5$ and $h_2 = $ NAND $= -x_1 - x_2 + 1.5$, then XOR = AND($h_1 > 0$, $h_2 > 0$).
:::

**Margin of a hyperplane** (p8): the smallest distance from any data point to $H$,

:::formula @svm-point-distance Point-to-hyperplane distance and one-sided margin (p8)
$$d(\mathbf{x},H)=\frac{|\mathbf{w}^T\mathbf{x}+b|}{\lVert\mathbf{w}\rVert},\qquad\delta=\min_i\frac{|\mathbf{w}^T\mathbf{x}_i+b|}{\lVert\mathbf{w}\rVert}$$
:::
If $\lVert\mathbf{w}\rVert = 1$ the distance is just $|\mathbf{w}^T\mathbf{x}_i + b|$; if the closest point has $|\mathbf{w}^T\mathbf{x}_i + b| = 1$ then $\delta = 1/\lVert\mathbf{w}\rVert$.

:::example Distance from a point to a hyperplane
$\mathbf{w} = (3, 4)$, $b = -5$, point $(2, 1)$: $|3\cdot2 + 4\cdot1 - 5| / \sqrt{9 + 16} = 5/5 = 1$.
:::

:::formula @svm-perceptron Perceptron algorithm (p9)
For each example, compute $s_i = y_i(\mathbf{w}^T\mathbf{x}_i + b)$. If it is misclassified:
$$\mathbf{w} \leftarrow \mathbf{w} + y_i\mathbf{x}_i, \qquad b \leftarrow b + y_i$$
Repeat passes over the data until every $s_i \ge 0$.
:::

:::example One perceptron update
$\mathbf{w} = (1, 0)$, $b = 0$, example $\mathbf{x} = (-1, 2)$ with $y = +1$. Score $s = 1\cdot(-1 + 0) = -1 < 0$: mistake. Update $\mathbf{w} = (1, 0) + (-1, 2) = (0, 2)$, $b = 0 + 1 = 1$. New score $s = 0\cdot(-1) + 2\cdot2 + 1 = 5 \ge 0$ ✓.
:::

:::note Starting from zero
With $\mathbf{w} = 0, b = 0$ every score is exactly 0. In practice treat $s_i \le 0$ as a mistake (most textbooks do), otherwise the algorithm would stop immediately with $\mathbf{w} = 0$.
:::

**Convergence theorem** (p10–12): if the data is separable with margin $\delta > 0$, the perceptron makes at most the following number of updates.

:::formula @svm-perceptron-bound Perceptron convergence bound
$$t\le\frac{R^2(\lVert\mathbf{w}^{\star}\rVert^2+b^2)}{\delta^2},\qquad R^2=\max_i\lVert\mathbf{x}_i\rVert^2+1$$
:::

So a **large margin** (an "easy" dataset) means **few** mistakes; a tiny margin (a "difficult" dataset) can need many. If the data is not separable, the perceptron never stops.

## Maximum margin: the idea of SVM

Many lines separate the data (p13–15). Which is best? SVM picks the one with the **largest margin**: the width the boundary could grow before hitting a data point (p16). A wide margin is more robust to noise and generalises better.

:::formula @svm-margin SVM geometry (p17–18)
$$\mathbf{w}^T\mathbf{x} + b = +1,\quad \mathbf{w}^T\mathbf{x} + b = 0,\quad \mathbf{w}^T\mathbf{x} + b = -1 \qquad\qquad \text{Margin} = \frac{2}{\lVert\mathbf{w}\rVert}$$
:::

:::read
- The middle line is the decision boundary; the two outer lines are the **margin boundaries**.
- **Support vectors** are the training points lying exactly on the outer lines. Only they determine the boundary.
- The distance between the two outer lines is $2/\lVert\mathbf{w}\rVert$. (Slide p17 prints $\lVert\mathbf{w}\rVert^2$; p18 has the correct $2/\lVert\mathbf{w}\rVert$.)
- Maximising $2/\lVert\mathbf{w}\rVert$ is the same as minimising $\frac12\lVert\mathbf{w}\rVert^2$ (nicer to optimise).
:::

:::formula @svm-hard-margin Hard-margin SVM (p18–19)
$$\min_{\mathbf{w}, b}\ \frac12\mathbf{w}^T\mathbf{w} \quad\text{subject to}\quad y_i(\mathbf{w}^T\mathbf{x}_i + b) \ge 1,\ \ i = 1, \dots, l$$
:::

:::read
The constraint packs two conditions into one: $\mathbf{w}^T\mathbf{x}_i + b \ge 1$ for $y_i = +1$ and $\le -1$ for $y_i = -1$. It is a **quadratic programming** problem: quadratic objective, linear constraints, convex, **unique minimum**.
:::

:::example Two points by hand
$\mathbf{x}_1 = (1, 1)$, $y_1 = +1$ and $\mathbf{x}_2 = (-1, -1)$, $y_2 = -1$. By symmetry $\mathbf{w} = (a, a)$, and both points are support vectors:
$2a + b = 1$ and $-2a + b = -1$ → $b = 0$, $a = 0.5$. So $\mathbf{w} = (0.5, 0.5)$, boundary $x_1 + x_2 = 0$, margin $2/\lVert\mathbf{w}\rVert = 2/0.7071 = 2.83$, exactly the distance between the two points ✓.
:::

{{visual:svm-geometry}}

## Soft-margin SVM

Real data is often **not** linearly separable (p20), so the hard-margin constraints cannot all hold.

:::formula @svm-soft-margin Soft-margin primal (p21)
$$\min_{\mathbf{w}, b, \xi}\ \frac12\mathbf{w}^T\mathbf{w} + C\sum_{i=1}^{N}\xi_i \quad\text{s.t.}\quad y_i(\mathbf{w}^T\mathbf{x}_i + b) \ge 1 - \xi_i,\ \ \xi_i \ge 0$$
:::

:::read
- $\xi_i$ ("xi"), the **slack**: how much example $i$ violates the margin. $\xi_i = 0$: fine; $0 < \xi_i \le 1$: inside the margin but correct; $\xi_i > 1$: misclassified.
- $C$: the price of each unit of slack. It trades a **wide margin** against **few training errors**.
:::

:::formula @svm-hinge-loss Same thing as an unconstrained loss: hinge loss (p22–23)
$$\min_{\mathbf{w}, b}\ \underbrace{\frac12\sum_{j=1}^{d}w_j^2}_{\text{model complexity}} + C\underbrace{\sum_{i=1}^{N}\max\big(0,\ 1 - y_i[\mathbf{x}_i^T\mathbf{w} + b]\big)}_{\text{training error}}$$
:::

:::example Hinge loss $\ell(z) = \max(0, 1 - z)$ with $z = y\,f(\mathbf{x})$
- $z = 2$ (correct, outside the margin): loss 0.
- $z = 1$ (exactly on the margin): loss 0.
- $z = 0.5$ (correct but inside the margin): loss 0.5.
- $z = -1$ (wrong side): loss 2.
:::

**Choosing C** (p23): **large C** → training errors are expensive → narrow margin, fits the training data closely → **lower bias, higher variance** (risk of overfitting). **Small C** → wide margin, tolerates errors → **higher bias, lower variance**.

Regularised logistic regression has the same shape with the **logistic loss** $\ln(1 + \exp(-y_i[\mathbf{x}_i^T\mathbf{w} + b]))$ instead of the hinge loss.

## The dual problem and support vectors

:::formula @svm-dual Dual form (p24)
$$\max_{\alpha_i \in [0, C]}\ \sum_{i=1}^{N}\alpha_i - \frac12\sum_{i,j}\alpha_i\alpha_jy_iy_j\,\mathbf{x}_i^T\mathbf{x}_j \quad\text{s.t.}\quad \sum_i\alpha_iy_i = 0$$
:::

:::read
- One number $\alpha_i$ per training example (the Lagrange multiplier of its constraint), with $0 \le \alpha_i \le C$.
- The data appear **only through dot products** $\mathbf{x}_i^T\mathbf{x}_j$. This is what makes the kernel trick possible.
- **Complementary slackness**: $\alpha_i\big(1 - y_i(\mathbf{w}^T\mathbf{x}_i + b)\big) = 0$ (hard margin; with slack it becomes $\alpha_i(1 - \xi_i - y_i(\mathbf{w}^T\mathbf{x}_i + b)) = 0$). For the soft-margin dual with $0 \le \alpha_i \le C$:
  - $\alpha_i = 0$: the point is on or outside the margin and does not affect the solution;
  - $0 < \alpha_i < C$: the point lies exactly on the margin;
  - $\alpha_i = C$: the point is inside the margin or misclassified ($\xi_i > 0$).
- **Support vectors are the points with $\alpha_i > 0$** (on or inside the margin).
- Solution: $\mathbf{w} = \sum_i\alpha_iy_i\mathbf{x}_i$. For any support vector exactly on the margin ($0 < \alpha_i < C$), $y_i(\mathbf{w}^T\mathbf{x}_i + b) = 1$ gives $b = y_i - \mathbf{w}^T\mathbf{x}_i$; average over those support vectors for stability. (The slide writes this with the sign convention $\mathbf{w}\cdot\mathbf{x} - b$, which flips the sign of $b$.)
:::

## Nonlinear SVM: feature maps

A 1-D dataset with the pattern ● ● ○ ○ ○ ● ● cannot be split by one threshold (p27). Map $x \mapsto (x, x^2)$: the points move onto a parabola where a straight line separates them (p28–29). In general, data that is complex in low dimensions can become linearly separable in a higher-dimensional **feature space** $\Phi(\mathbf{x})$ (p30).

Then learn $f(\mathbf{x}) = \mathbf{w}^T\Phi(\mathbf{x}) + b$ with the same SVM (p31). The dual uses $Q_{ij} = y_iy_j\Phi(\mathbf{x}_i)^T\Phi(\mathbf{x}_j)$, and $f(\mathbf{x}) = \sum_i\alpha_iy_i\Phi(\mathbf{x}_i)^T\Phi(\mathbf{x}) + b$ (p32).

:::formula @svm-feature-classifier Classifier in a transformed feature space (p31–32)
$$f(\mathbf{x})=\mathbf{w}^T\Phi(\mathbf{x})+b=\sum_i\alpha_iy_i\Phi(\mathbf{x}_i)^T\Phi(\mathbf{x})+b$$
:::

**Problem** (p33): explicit feature maps get huge. A degree-2 polynomial map of $\mathbf{x} \in \mathbb{R}^3$ already has 10 coordinates:
$$\left(1, \sqrt2x_1, \sqrt2x_2, \sqrt2x_3, x_1^2, x_2^2, x_3^2, \sqrt2x_1x_2, \sqrt2x_1x_3, \sqrt2x_2x_3\right).$$
High degrees are far worse.

## The kernel trick

:::formula @svm-feature-kernel Kernel (p34)
$$\kappa(\mathbf{x}_i, \mathbf{x}_j) = \Phi(\mathbf{x}_i)^T\Phi(\mathbf{x}_j)$$
:::

:::read
A kernel computes the dot product **in the feature space** directly from the original vectors, without ever building $\Phi$. Since the dual only needs dot products, replace every $\mathbf{x}_i^T\mathbf{x}_j$ with $\kappa(\mathbf{x}_i, \mathbf{x}_j)$.
- Valid kernel: **symmetric**, $\kappa(x, y) = \kappa(y, x)$, and **positive semi-definite**: every Gram matrix $K_{ij} = \kappa(x_i, x_j)$ satisfies $\mathbf{a}^TK\mathbf{a} \ge 0$ (Mercer's condition).
- Benefits: **efficiency** (cheaper than computing $\Phi$) and **flexibility** (choose any valid kernel).
:::

| Kernel (p35) | Formula | Priority |
|---|---|---|
| Linear | $\kappa(\mathbf{x}_i, \mathbf{x}_j) = \mathbf{x}_i^T\mathbf{x}_j$ | {{priority:svm-linear-kernel}} |
| Polynomial (degree $d$) | $\kappa(\mathbf{x}_i, \mathbf{x}_j) = (\mathbf{x}_i^T\mathbf{x}_j/a + b)^d$ | {{priority:svm-polynomial-kernel}} |
| Gaussian / RBF | $\kappa(\mathbf{x}_i, \mathbf{x}_j) = \exp\!\left(-\dfrac{\lVert\mathbf{x}_i - \mathbf{x}_j\rVert^2}{2\sigma^2}\right) = \exp(-\gamma\lVert\mathbf{x}_i - \mathbf{x}_j\rVert^2)$ | {{priority:svm-rbf-kernel}} |

:::example Kernel values for $\mathbf{x} = (1, 2)$, $\mathbf{z} = (3, 1)$
- Linear: $1\cdot3 + 2\cdot1 = 5$.
- Polynomial $d = 2$, $a = 1$, $b = 1$: $(5 + 1)^2 = 36$.
- RBF with $\gamma = 0.5$: $\lVert\mathbf{x} - \mathbf{z}\rVert^2 = (1-3)^2 + (2-1)^2 = 5$, so $e^{-0.5\cdot5} = e^{-2.5} = 0.082$.

**Check the trick** (p36): with $\Phi(\mathbf{x}) = (x_1^2, x_2^2, \sqrt2x_1x_2, \sqrt{2b}x_1, \sqrt{2b}x_2, b)$ and $b = 1$: $\Phi(\mathbf{x}) = (1, 4, 2\sqrt2, \sqrt2, 2\sqrt2, 1)$, $\Phi(\mathbf{z}) = (9, 1, 3\sqrt2, 3\sqrt2, \sqrt2, 1)$. Dot product $= 9 + 4 + 12 + 6 + 4 + 1 = 36$ ✓, the same as $(\mathbf{x}^T\mathbf{z} + 1)^2$ but without building 6-D vectors.
:::

:::read RBF facts
- $\kappa = 1$ when the points coincide and goes towards 0 as they move apart: a **similarity** score.
- Its feature space is **infinite-dimensional** (p37: the Taylor series of $e^{2\gamma x_ix_j}$).
- Large $\gamma$ (small $\sigma$) → very local, wiggly boundaries (risk of overfitting); small $\gamma$ → smoother boundaries.
:::

With kernels the dual becomes $\max_\alpha \sum_i\alpha_i - \frac12\sum_{i,j}\alpha_i\alpha_jy_iy_j\kappa(\mathbf{x}_i, \mathbf{x}_j)$ and the decision function is $f(\mathbf{x}) = \sum_i\alpha_iy_i\kappa(\mathbf{x}_i, \mathbf{x}) + b$ (p38). Examples: a degree-2 polynomial kernel gives a parabola-shaped boundary (p39); RBF gives several separate "blob" regions (p40).

:::formula @svm-kernel-dual Kernel dual objective and decision score (p38)
$$\max_{\boldsymbol\alpha}\sum_i\alpha_i-\frac12\sum_{i,j}\alpha_i\alpha_jy_iy_j\kappa(\mathbf{x}_i,\mathbf{x}_j),\qquad f(\mathbf{x})=\sum_i\alpha_iy_i\kappa(\mathbf{x}_i,\mathbf{x})+b$$
The same dual feasibility constraints apply: $\sum_i\alpha_iy_i=0$, with $\alpha_i\ge0$ for hard margin or $0\le\alpha_i\le C$ for soft margin.
:::

Other points (p41): any linear method can be kernelised (e.g. kernel logistic regression); non-vector data (strings, graphs) works as long as the kernel matrix is PSD. Open questions on the slide: which kernel to use and how to set its parameters (in practice: try a few and pick by cross-validation).

**Curse of kernelisation** (p42): kernel SVM training costs $O(N^3)$ with standard QP solvers, at least $O(N^2)$ with faster ones such as SMO, while linear classifiers train in $O(N)$. **Kernel approximation** (p43) builds a new finite representation $\mathbf{z}(\mathbf{x}) \in \mathbb{R}^D$ with $\kappa(\mathbf{x}_i, \mathbf{x}_j) \approx \mathbf{z}(\mathbf{x}_i)^T\mathbf{z}(\mathbf{x}_j)$, then trains a fast linear model on $\mathbf{z}$. Two methods: random **Fourier** features (approximate the function) and **Nyström** (approximate the kernel matrix).

## Multi-class SVM

| Method | Binary SVMs trained | Prediction | Priority |
|---|---|---|---|
| **One-vs-rest** (one-against-the-rest), p44–45 | $k$: class $j$ vs all others | $\arg\max_j\ (\mathbf{w}^j)^T\Phi(\mathbf{x}) + b_j$ | {{priority:svm-one-vs-rest}} |
| **One-vs-one**, p46–47 | $k(k-1)/2$: one per pair of classes | each SVM votes; the class with the most votes wins | {{priority:svm-one-vs-one}} |

:::example
- 4 classes: one-vs-one needs $4\cdot3/2 = 6$ SVMs; one-vs-rest needs 4.
- 10 classes: one-vs-one needs $10\cdot9/2 = 45$.
- Voting example (p47): pairwise winners 1, 1, 1, 2, 4, 3 → votes: class 1 = 3, class 2 = 1, class 3 = 1, class 4 = 1 → predict **class 1**.
:::

Accuracy is similar for many problems [Hsu & Lin 2002], but **one-vs-one is fastest to train** (p48): each of its $k(k-1)/2$ problems has only about $2N/k$ examples, whereas one-vs-rest solves $k$ problems on all $N$ examples, and SVM training cost grows faster than linearly in the data size.
