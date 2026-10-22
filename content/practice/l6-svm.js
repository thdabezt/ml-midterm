const r = String.raw;

export default {
  lesson: 'l6-svm',
  questions: [
    {
      id: 'l6-quiz-and-or-xor',
      type: 'written',
      source: { kind: 'quiz', label: 'L6 p7 mini exercises' },
      prompt: r`Mini exercises from the slides, with inputs $x_1, x_2 \in \{0, 1\}$ and output $+1$ for true, $-1$ for false:
1. Use a linear function to represent the AND function.
2. Use a linear function to represent the OR function.
3. Use linear functions to represent the XOR function.`,
      solution: r`We need $\mathbf{w}, b$ with $\mathrm{sgn}(w_1x_1 + w_2x_2 + b)$ equal to the truth table.

**1. AND** (true only for (1,1)): $f = x_1 + x_2 - 1.5$. Scores: (0,0) → −1.5, (0,1) → −0.5, (1,0) → −0.5, (1,1) → +0.5 ✓.

**2. OR** (false only for (0,0)): $f = x_1 + x_2 - 0.5$. Scores: −0.5, +0.5, +0.5, +1.5 ✓.

**3. XOR** (true for (0,1) and (1,0)): **no single line works**. The positive points (0,1), (1,0) and the negative points (0,0), (1,1) sit on opposite corners of a square; any line putting (0,1) and (1,0) on one side puts at least one of the others there too, so XOR is **not linearly separable**. Combine two linear functions:
- $h_1 = x_1 + x_2 - 0.5$ (OR) and $h_2 = -x_1 - x_2 + 1.5$ (NAND);
- XOR $= $ AND of the two: $\mathrm{sgn}\big(\mathrm{step}(h_1) + \mathrm{step}(h_2) - 1.5\big)$, where step is 1 for positive and 0 otherwise.
Check (1,1): $h_1 = 1.5 > 0$, $h_2 = -0.5 < 0$ → $1 + 0 - 1.5 < 0$ → false ✓. (0,1): both positive → $2 - 1.5 > 0$ → true ✓.

This is the classic reason a single perceptron cannot learn XOR, and why we need either multiple layers or a feature map (kernels).`,
    },
    {
      id: 'l6-distance',
      type: 'numeric',
      source: { kind: 'slide', label: 'L6 p4, p8' },
      prompt: r`A linear classifier has $\mathbf{w} = (2, 1)$, $b = -3$. For the point $\mathbf{x} = (3, 2)$, compute the score $\mathbf{w}^T\mathbf{x} + b$, the predicted label, and the distance from $\mathbf{x}$ to the hyperplane.`,
      fields: [
        { label: 'score', answer: 5, tol: 0.001 },
        { label: 'label (+1 / −1)', answer: 1, tol: 0.01 },
        { label: 'distance', answer: 5 / Math.sqrt(5), tol: 0.003 },
      ],
      solution: r`Score $= 2\cdot3 + 1\cdot2 - 3 = 5 > 0$ → label $+1$. Distance $= \frac{|5|}{\lVert\mathbf{w}\rVert} = \frac{5}{\sqrt{4 + 1}} = \frac{5}{2.236} = 2.236$.`,
    },
    {
      id: 'l6-margin',
      type: 'numeric',
      source: { kind: 'slide', label: 'L6 p17–18' },
      prompt: r`An SVM has weight vector $\mathbf{w} = (3, 4)$. What is its margin (the distance between the lines $\mathbf{w}^T\mathbf{x} + b = \pm1$)? What if $\mathbf{w} = (0.6, 0.8)$?`,
      fields: [
        { label: r`margin, $\mathbf{w} = (3, 4)$`, answer: 0.4, tol: 0.002 },
        { label: r`margin, $\mathbf{w} = (0.6, 0.8)$`, answer: 2, tol: 0.002 },
      ],
      solution: r`Margin $= 2/\lVert\mathbf{w}\rVert$. $\lVert(3, 4)\rVert = 5$ → $0.4$. $\lVert(0.6, 0.8)\rVert = 1$ → $2$. A **smaller** $\lVert\mathbf{w}\rVert$ means a **wider** margin, which is why SVM minimises $\frac12\lVert\mathbf{w}\rVert^2$.`,
    },
    {
      id: 'l6-two-points',
      type: 'numeric',
      source: { kind: 'variant', label: 'hard-margin SVM by hand' },
      prompt: r`Hard-margin SVM with two training points: $\mathbf{x}_1 = (2, 2)$ with $y_1 = +1$ and $\mathbf{x}_2 = (0, 0)$ with $y_2 = -1$. Both are support vectors and by symmetry $\mathbf{w} = (a, a)$. Find $a$, $b$ and the margin.`,
      fields: [
        { label: r`$a$`, answer: 0.5, tol: 0.002 },
        { label: r`$b$`, answer: -1, tol: 0.002 },
        { label: 'margin', answer: 2 * Math.SQRT2, tol: 0.005 },
      ],
      solution: r`Support vectors lie on the margin lines:
- $\mathbf{x}_1$: $\mathbf{w}^T\mathbf{x}_1 + b = 2a + 2a + b = +1$
- $\mathbf{x}_2$: $\mathbf{w}^T\mathbf{x}_2 + b = b = -1$

So $b = -1$, $4a = 2$, $a = 0.5$: $\mathbf{w} = (0.5, 0.5)$, boundary $0.5x_1 + 0.5x_2 - 1 = 0$, i.e. $x_1 + x_2 = 2$, passing through the midpoint (1, 1).

Margin $= 2/\lVert\mathbf{w}\rVert = 2/0.7071 = 2.83$, exactly the distance between the two points, $\sqrt{8}$ ✓.`,
    },
    {
      id: 'l6-perceptron',
      type: 'numeric',
      source: { kind: 'slide', label: 'L6 p9' },
      prompt: r`Perceptron with current $\mathbf{w} = (1, -1)$, $b = 0$. It sees $\mathbf{x} = (2, 3)$ with $y = +1$, then $\mathbf{x}' = (-1, 2)$ with $y' = -1$. Apply the update rule (update when $s_i < 0$) to both examples in order. Give the final $\mathbf{w}$ and $b$.`,
      fields: [
        { label: r`$w_1$`, answer: 4, tol: 0.001 },
        { label: r`$w_2$`, answer: 0, tol: 0.001 },
        { label: r`$b$`, answer: 0, tol: 0.001 },
      ],
      solution: r`**Example 1:** $s = y(\mathbf{w}^T\mathbf{x} + b) = +1\cdot(2 - 3 + 0) = -1 < 0$ → mistake.
$\mathbf{w} \leftarrow (1, -1) + (2, 3) = (3, 2)$, $b \leftarrow 0 + 1 = 1$.

**Example 2:** $s = -1\cdot(3\cdot(-1) + 2\cdot2 + 1) = -1\cdot2 = -2 < 0$ → mistake.
$\mathbf{w} \leftarrow (3, 2) + (-1)(-1, 2) = (4, 0)$, $b \leftarrow 1 + (-1) = 0$.

Final: $\mathbf{w} = (4, 0)$, $b = 0$. Check: example 1 score $8 > 0$ ✓, example 2 score $-4 < 0$ ✓.`,
    },
    {
      id: 'l6-hinge',
      type: 'numeric',
      source: { kind: 'slide', label: 'L6 p22–23' },
      prompt: r`Compute the hinge loss $\max(0, 1 - y f(\mathbf{x}))$ for three examples with $y f(\mathbf{x}) = 1.5$, $0.2$ and $-0.5$.`,
      fields: [
        { label: r`$yf = 1.5$`, answer: 0, tol: 0.001 },
        { label: r`$yf = 0.2$`, answer: 0.8, tol: 0.001 },
        { label: r`$yf = -0.5$`, answer: 1.5, tol: 0.001 },
      ],
      solution: r`- 1.5: correct and outside the margin → $\max(0, -0.5) = 0$.
- 0.2: correct but **inside** the margin → $0.8$.
- −0.5: on the wrong side → $1.5$.

In the soft-margin SVM, these numbers are exactly the optimal slacks $\xi_i$.`,
    },
    {
      id: 'l6-soft-objective',
      type: 'numeric',
      source: { kind: 'slide', label: 'L6 p21' },
      prompt: r`For a soft-margin SVM with $\mathbf{w} = (1, 1)$, $C = 2$ and slacks $\xi = (0, 0.5, 1.2)$, compute the primal objective $\frac12\mathbf{w}^T\mathbf{w} + C\sum_i\xi_i$. Which of the three examples is misclassified?`,
      fields: [
        { label: 'objective', answer: 4.4, tol: 0.002 },
        { label: 'misclassified example (1, 2 or 3)', answer: 3, tol: 0.01 },
      ],
      solution: r`$\frac12(1 + 1) + 2(0 + 0.5 + 1.2) = 1 + 3.4 = 4.4$.

Slack meaning: $\xi = 0$ → on or outside the margin; $0 < \xi \le 1$ → inside the margin but on the correct side; $\xi > 1$ → misclassified. So only example 3 ($\xi = 1.2$) is misclassified.`,
    },
    {
      id: 'l6-dual-w',
      type: 'numeric',
      source: { kind: 'slide', label: 'L6 p24, p32' },
      prompt: r`A trained linear SVM has two support vectors: $\mathbf{x}_1 = (1, 1)$, $y_1 = +1$, $\alpha_1 = 0.25$ and $\mathbf{x}_2 = (-1, -1)$, $y_2 = -1$, $\alpha_2 = 0.25$; all other $\alpha_i = 0$; $b = 0$. Compute $\mathbf{w} = \sum_i\alpha_iy_i\mathbf{x}_i$ and the decision value $f(\mathbf{x})$ for $\mathbf{x} = (2, 0)$.`,
      fields: [
        { label: r`$w_1$`, answer: 0.5, tol: 0.001 },
        { label: r`$w_2$`, answer: 0.5, tol: 0.001 },
        { label: r`$f((2,0))$`, answer: 1, tol: 0.001 },
      ],
      solution: r`$\mathbf{w} = 0.25\cdot(+1)(1, 1) + 0.25\cdot(-1)(-1, -1) = (0.25, 0.25) + (0.25, 0.25) = (0.5, 0.5)$.
Check the dual constraint: $\sum\alpha_iy_i = 0.25 - 0.25 = 0$ ✓.

$f(\mathbf{x}) = \sum_i\alpha_iy_i\,\mathbf{x}_i^T\mathbf{x} + b = 0.25(2) - 0.25(-2) + 0 = 1$ (same as $\mathbf{w}^T\mathbf{x} = 1$) → class $+1$, exactly on the margin line.`,
    },
    {
      id: 'l6-bias',
      type: 'numeric',
      source: { kind: 'slide', label: 'L6 p24' },
      prompt: r`An SVM has $\mathbf{w} = (1, 2)$. A support vector $\mathbf{x}_s = (1, 1)$ has label $y_s = +1$. Using $y_s(\mathbf{w}^T\mathbf{x}_s + b) = 1$, find $b$.`,
      fields: [{ label: r`$b$`, answer: -2, tol: 0.001 }],
      solution: r`$y_s(\mathbf{w}^T\mathbf{x}_s + b) = 1$ and $y_s = \pm1$ give $\mathbf{w}^T\mathbf{x}_s + b = y_s$, so $b = y_s - \mathbf{w}^T\mathbf{x}_s = 1 - (1 + 2) = -2$. With several support vectors, average these values. (The slide writes the model as $\mathbf{w}\cdot\mathbf{x} - b$, which gives $b = \mathbf{w}\cdot\mathbf{x}_s - y_s = +2$, the same boundary.)`,
    },
    {
      id: 'l6-kernels',
      type: 'numeric',
      source: { kind: 'slide', label: 'L6 p35–36' },
      prompt: r`For $\mathbf{x} = (1, 0, 2)$ and $\mathbf{z} = (2, 1, 1)$, compute the linear kernel, the polynomial kernel $(\mathbf{x}^T\mathbf{z} + 1)^2$, and the RBF kernel $\exp(-\gamma\lVert\mathbf{x} - \mathbf{z}\rVert^2)$ with $\gamma = 0.1$.`,
      fields: [
        { label: 'linear', answer: 4, tol: 0.001 },
        { label: 'polynomial', answer: 25, tol: 0.001 },
        { label: 'RBF', answer: Math.exp(-0.3), tol: 0.002 },
      ],
      solution: r`- Linear: $1\cdot2 + 0\cdot1 + 2\cdot1 = 4$.
- Polynomial: $(4 + 1)^2 = 25$.
- RBF: $\lVert\mathbf{x} - \mathbf{z}\rVert^2 = (-1)^2 + (-1)^2 + 1^2 = 3$, so $e^{-0.1\cdot3} = e^{-0.3} = 0.741$.`,
    },
    {
      id: 'l6-kernel-map',
      type: 'numeric',
      source: { kind: 'slide', label: 'L6 p36' },
      prompt: r`With $\Phi(\mathbf{x}) = (x_1^2,\ x_2^2,\ \sqrt2x_1x_2,\ \sqrt2x_1,\ \sqrt2x_2,\ 1)$ (degree 2, $b = 1$), compute $\Phi(\mathbf{x})^T\Phi(\mathbf{z})$ for $\mathbf{x} = (1, 1)$, $\mathbf{z} = (2, -1)$, and compare with $(\mathbf{x}^T\mathbf{z} + 1)^2$.`,
      fields: [{ label: r`$\Phi(\mathbf{x})^T\Phi(\mathbf{z})$`, answer: 4, tol: 0.001 }],
      solution: r`$\Phi(\mathbf{x}) = (1, 1, \sqrt2, \sqrt2, \sqrt2, 1)$, $\Phi(\mathbf{z}) = (4, 1, -2\sqrt2, 2\sqrt2, -\sqrt2, 1)$.
Dot product $= 4 + 1 - 4 + 4 - 2 + 1 = 4$.

Kernel: $\mathbf{x}^T\mathbf{z} = 2 - 1 = 1$, $(1 + 1)^2 = 4$ ✓. The kernel gives the 6-D dot product from a 2-D computation: that is the kernel trick.`,
    },
    {
      id: 'l6-multiclass-count',
      type: 'numeric',
      source: { kind: 'slide', label: 'L6 p44–46' },
      prompt: r`For a 5-class problem, how many binary SVMs are trained by one-vs-rest and by one-vs-one? How many does one-vs-one need for 10 classes?`,
      fields: [
        { label: 'one-vs-rest, k = 5', answer: 5, tol: 0.01 },
        { label: 'one-vs-one, k = 5', answer: 10, tol: 0.01 },
        { label: 'one-vs-one, k = 10', answer: 45, tol: 0.01 },
      ],
      solution: r`One-vs-rest: $k$ classifiers. One-vs-one: $\frac{k(k-1)}{2}$: $\frac{5\cdot4}{2} = 10$ and $\frac{10\cdot9}{2} = 45$.`,
    },
    {
      id: 'l6-vote',
      type: 'mcq',
      source: { kind: 'slide', label: 'L6 p47' },
      prompt: r`One-vs-one with 4 classes. Pairwise winners for a test point: (1 vs 2) → 2, (1 vs 3) → 3, (1 vs 4) → 1, (2 vs 3) → 2, (2 vs 4) → 2, (3 vs 4) → 4. Which class is predicted?`,
      options: ['Class 1', 'Class 2', 'Class 3', 'Class 4'],
      answer: 1,
      solution: r`Votes: class 1 → 1, class 2 → 3, class 3 → 1, class 4 → 1. **Class 2** has the most votes.`,
    },
    // ---------- concepts ----------
    {
      id: 'l6-large-c',
      type: 'mcq',
      source: { kind: 'slide', label: 'L6 p21, p23' },
      prompt: r`In a soft-margin SVM, what happens when $C$ is made very large?`,
      options: [
        'The margin gets wider and more training errors are tolerated (higher bias)',
        'Training errors become very expensive, so the margin narrows to fit the training data: lower bias, higher variance',
        'The kernel changes from linear to RBF',
        'Nothing; C only affects training speed',
      ],
      answer: 1,
      solution: r`$C$ multiplies the slack (training error) term. Large $C$ → avoid violations at any cost → narrow margin, risk of overfitting (lower bias, higher variance). Small $C$ → wide margin, tolerates errors (higher bias, lower variance). As $C \to \infty$ it becomes the hard-margin SVM.`,
    },
    {
      id: 'l6-sv',
      type: 'mcq',
      source: { kind: 'slide', label: 'L6 p17, p24' },
      prompt: r`In the dual solution of an SVM, which training points are the support vectors?`,
      options: [r`Points with $\alpha_i = 0$`, r`Points with $\alpha_i > 0$, lying on (or inside) the margin`, 'All training points', 'Points farthest from the boundary'],
      answer: 1,
      solution: r`Complementary slackness $\alpha_i(1 - y_i(\mathbf{w}^T\mathbf{x}_i + b)) = 0$: if a point is strictly outside the margin, $\alpha_i = 0$. Only points with $\alpha_i > 0$ contribute to $\mathbf{w} = \sum\alpha_iy_i\mathbf{x}_i$. Removing any other point would not change the solution.`,
    },
    {
      id: 'l6-xor',
      type: 'mcq',
      source: { kind: 'quiz', label: 'L6 p7' },
      prompt: r`Which Boolean function **cannot** be computed by a single linear threshold $\mathrm{sgn}(w_1x_1 + w_2x_2 + b)$?`,
      options: ['AND', 'OR', 'NAND', 'XOR'],
      answer: 3,
      solution: r`AND ($x_1 + x_2 - 1.5$), OR ($x_1 + x_2 - 0.5$) and NAND ($-x_1 - x_2 + 1.5$) are linearly separable. **XOR** is not; it needs two linear functions combined, or a feature map such as adding $x_1x_2$.`,
    },
    {
      id: 'l6-valid-kernel',
      type: 'mcq',
      source: { kind: 'slide', label: 'L6 p34' },
      prompt: r`A function $\kappa(x, y)$ can be used as an SVM kernel if it is:`,
      options: [
        'Positive for all inputs',
        r`Symmetric, and every Gram matrix $K_{ij} = \kappa(x_i, x_j)$ is positive semi-definite (Mercer's condition)`,
        'Differentiable everywhere',
        'Bounded between 0 and 1',
      ],
      answer: 1,
      solution: r`Valid kernel ⇔ $\kappa(x, y) = \kappa(y, x)$ and $\mathbf{a}^TK\mathbf{a} \ge 0$ for all $\mathbf{a}$ and any set of points. Then a feature map $\Phi$ with $\kappa(x, y) = \Phi(x)^T\Phi(y)$ exists. (The RBF kernel happens to lie in (0, 1], but that is not the requirement.)`,
    },
    {
      id: 'l6-why-dual',
      type: 'mcq',
      source: { kind: 'slide', label: 'L6 p24, p34, p38' },
      prompt: r`Why does the dual form of the SVM make the kernel trick possible?`,
      options: [
        'Because the dual has fewer variables',
        r`Because the training data appears only through dot products $\mathbf{x}_i^T\mathbf{x}_j$, which can be replaced by $\kappa(\mathbf{x}_i, \mathbf{x}_j)$`,
        'Because the dual is always linear',
        'Because the dual removes the constraints',
      ],
      answer: 1,
      solution: r`Dual objective: $\sum\alpha_i - \frac12\sum\alpha_i\alpha_jy_iy_j\,\mathbf{x}_i^T\mathbf{x}_j$, and prediction $f(\mathbf{x}) = \sum\alpha_iy_i\,\mathbf{x}_i^T\mathbf{x} + b$. Only dot products appear, so replacing them by $\kappa$ trains a linear SVM in feature space without ever computing $\Phi$.`,
    },
    {
      id: 'l6-hard-margin',
      type: 'mcq',
      source: { kind: 'slide', label: 'L6 p19–20' },
      prompt: r`The data contains two points of opposite classes at the same location. What happens with a hard-margin SVM?`,
      options: [
        'It finds a boundary with zero margin',
        r`The constraints $y_i(\mathbf{w}^T\mathbf{x}_i + b) \ge 1$ cannot all hold, so there is no solution; a soft margin (slack variables) is needed`,
        'It ignores one of the points',
        'It automatically switches to an RBF kernel',
      ],
      answer: 1,
      solution: r`The data is not linearly separable, so the hard-margin QP is infeasible ("hard margin SVM cannot be applied directly", L6 p20). Soft margin relaxes the constraints to $\ge 1 - \xi_i$ and penalises $C\sum\xi_i$.`,
    },
    {
      id: 'l6-feature-map',
      type: 'mcq',
      source: { kind: 'slide', label: 'L6 p27–30' },
      prompt: r`1-D data: class A at $x = -3, -2, 2, 3$ and class B at $x = -1, 0, 1$. No single threshold separates them. Which mapping makes them linearly separable?`,
      options: [r`$x \mapsto 2x$`, r`$x \mapsto (x, x^2)$`, r`$x \mapsto x + 1$`, r`$x \mapsto -x$`],
      answer: 1,
      solution: r`With $x^2$ as a second coordinate, class B has $x^2 \le 1$ and class A has $x^2 \ge 4$, so the horizontal line $x^2 = 2.5$ separates them. Linear maps such as $2x$ cannot change the interleaved order.`,
    },
    {
      id: 'l6-rbf-gamma',
      type: 'mcq',
      source: { kind: 'slide', label: 'L6 p35, p40' },
      prompt: r`For the RBF kernel $\exp(-\gamma\lVert\mathbf{x}_i - \mathbf{x}_j\rVert^2)$, what does a very large $\gamma$ tend to cause?`,
      options: [
        'A nearly linear boundary (underfitting)',
        'Very local influence of each point, wiggly boundaries that wrap individual points (overfitting)',
        'No change in the boundary',
        'A polynomial boundary of degree γ',
      ],
      answer: 1,
      solution: r`Large $\gamma$ (small $\sigma$) makes the similarity drop to 0 a short distance away, so each training point only influences its immediate neighbourhood: many separate "blobs" (like L6 p40) and overfitting. Small $\gamma$ gives smoother boundaries.`,
    },
    {
      id: 'l6-curse-kernel',
      type: 'mcq',
      source: { kind: 'slide', label: 'L6 p42–43' },
      prompt: r`Why is training a kernel SVM on millions of examples hard, and what is one remedy from the slides?`,
      options: [
        'Kernels need GPUs; buy more GPUs',
        'Standard QP solvers cost about O(N³) (at least O(N²) with SMO); approximate the kernel with an explicit feature map z(x) (random Fourier features or Nyström) and train a linear model',
        'Kernel SVMs cannot use more than 1000 examples; subsample',
        'The kernel matrix is always singular; add regularisation',
      ],
      answer: 1,
      solution: r`"Curse of kernelisation": kernel training is $O(N^2)$–$O(N^3)$ while linear classifiers train in $O(N)$. Kernel approximation builds $\mathbf{z}(\mathbf{x}) \in \mathbb{R}^D$ with $\kappa(\mathbf{x}_i, \mathbf{x}_j) \approx \mathbf{z}(\mathbf{x}_i)^T\mathbf{z}(\mathbf{x}_j)$, then trains a fast linear model.`,
    },
    {
      id: 'l6-perceptron-margin',
      type: 'mcq',
      source: { kind: 'quiz', label: 'L6 p10 question' },
      prompt: r`Slide question: "Can you tell an easy dataset from a difficult one, given its linear separation properties?" According to the perceptron convergence theorem $t \le R^2(\lVert\mathbf{w}^\star\rVert^2 + b^2)/\delta^2$, which dataset is easiest?`,
      options: [
        'Separable with a large margin δ relative to its radius R',
        'Separable with a tiny margin δ',
        'Not linearly separable',
        'All separable datasets need the same number of updates',
      ],
      answer: 0,
      solution: r`The bound on the number of mistakes grows like $(R/\delta)^2$. A wide gap between the classes (large $\delta$) → few updates: easy. A tiny gap → many updates: difficult. Non-separable data → the perceptron never converges.`,
    },
    {
      id: 'l6-ovo-fast',
      type: 'mcq',
      source: { kind: 'slide', label: 'L6 p48' },
      prompt: r`One-vs-one trains more SVMs than one-vs-rest, yet it is usually **faster** to train. Why?`,
      options: [
        'Because it uses a simpler kernel',
        'Because each of its problems uses only the data of two classes (about 2N/k examples), and SVM training cost grows faster than linearly in the number of examples',
        'Because it trains the SVMs on GPUs in parallel',
        'Because it needs no support vectors',
      ],
      answer: 1,
      solution: r`If training costs $O(n^d)$ with $d > 1$, one-vs-rest costs $k\,O(N^d)$ while one-vs-one costs $\frac{k(k-1)}{2}O\big((2N/k)^d\big)$, which is smaller for $d \ge 2$ (Hsu & Lin, 2002). Accuracies are similar.`,
    },
  ],
};
