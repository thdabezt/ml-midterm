---
slug: l7-model-optimization
num: 7
title: Feature Selection & Model Optimization
short: Overfitting, regularization, ensembles
summary: True vs empirical error, overfitting and underfitting, the bias–variance trade-off, learning curves, and the fixes: feature selection (filter, wrapper, embedded), regularization (ridge, lasso) and ensembles (bagging, random forests, boosting/AdaBoost, stacking).
---
This lecture ties everything together: *why* models fail on new data and *what to do about it*. Homework 2 Exercise 2 (ridge regression) and all of Homework 5 (reject option, bias–variance decomposition, random forest pseudocode) belong here.

:::exam What the midterm can ask from this lecture
- Recognise overfitting / underfitting from a picture, a learning curve or train vs test errors.
- High bias vs high variance and what fixes each (more data, more/fewer features, change λ…).
- Filter vs wrapper vs embedded feature selection; information gain or χ² for a feature.
- Ridge (L2) vs Lasso (L1); the effect of $\lambda \to 0$ and $\lambda \to \infty$.
- Bagging vs boosting; bootstrap sampling (≈ 37% left out); AdaBoost weight updates; majority-vote ensemble error.
- Bias–variance decomposition of the squared error (Homework 5).
:::

## True error vs empirical error

:::formula Two kinds of error (p5)
| | True error (risk) | Empirical (training) error |
|---|---|---|
| Classification | $P(f(X) \ne Y)$ | $\frac1n\sum_{i=1}^n\mathbf{1}[f(X_i) \ne Y_i]$ |
| Regression | $E[(f(X) - Y)^2]$ | $\frac1n\sum_{i=1}^n(f(X_i) - Y_i)^2$ |
:::

:::read
- True error: performance on a **random new** point $(X, Y)$, what we really care about.
- Empirical error: performance on the **training** data, which we can compute.
- $\mathbf{1}[\cdot]$ is 1 if the condition is true and 0 otherwise, so the sum counts mistakes.
:::

:::example Faces (p6)
The whole population has 20 faces, 10 misclassified: $\text{error}_D(h) = 10/20 = 0.5$. Our sample of 5 faces contains only 1 misclassified: $\text{error}_S(h) = 1/5 = 0.2$. A small sample can make a classifier look much better than it is.
:::

**Risk analysis** (p11–13): true risk $R(f) = E[\text{loss}(f(X), Y)]$, empirical risk $\hat R(f) = \frac1n\sum_i\text{loss}(f(X_i), Y_i)$, best possible predictor $f^* = \arg\min R(f)$, and ERM picks $\hat f_n = \arg\min_{f \in \mathcal{F}}\hat R(f)$ inside a model class $\mathcal{F}$.

:::formula Excess risk = estimation error + approximation error (p12)
$$R(\hat f_n) - R(f^*) = \underbrace{R(\hat f_n) - \inf_{f\in\mathcal{F}}R(f)}_{\text{estimation error}} + \underbrace{\inf_{f\in\mathcal{F}}R(f) - R(f^*)}_{\text{approximation error}}$$
:::

:::read
- **Approximation error**: the class $\mathcal{F}$ is too restricted to contain the truth (e.g. a line for curved data). It **decreases** as $\mathcal{F}$ gets more complex.
- **Estimation error**: with finite random data we do not even find the best member of $\mathcal{F}$. It **increases** with complexity (more to estimate from the same data).
- Their sum is U-shaped in complexity: the best model is in the middle (p13).
:::

## Overfitting and underfitting

- **Overfitting** (p7): too many features or too complex a model. It fits the training set very well but **fails to generalise**. Example: a degree-4 polynomial through every one of 6 house prices.
- **Underfitting**: the model is too simple to capture the pattern (a straight line through clearly curved data).
- The same holds for classification (p8): a straight boundary underfits, a quadratic boundary fits, a very high-order boundary wraps around single points and overfits.

**Model complexity** (p9): as complexity grows, empirical error keeps falling, but true error is U-shaped. Empirical error is therefore **not** a good indicator of true error for complex models. Complexity knobs (p10):

| Model | More complex when… |
|---|---|
| Polynomial regression | higher degree $k$ |
| Decision tree | greater depth / more leaves |
| k-nearest neighbours | **smaller** $k$ (1-NN is the most complex) |

## Bias–variance trade-off

Setting (p14): $Y = f^*(X) + \epsilon$, $\epsilon \sim \mathcal{N}(0, \sigma^2)$. Even the optimal predictor has error $R(f^*) = E[\epsilon^2] = \sigma^2$, the **irreducible noise**.

- **Bias** (p15): how far the **average** prediction (over many training sets) is from the truth. Caused by a model that is too simple.
- **Variance** (p16): how much the prediction **changes** from one training set to another. Caused by a model that is too flexible.

:::formula Decomposition of the expected squared error at a point $x_0$
$$E\big[(Y - \hat f(x_0))^2\big] = \sigma^2 + \underbrace{\big(E[\hat f(x_0)] - f(x_0)\big)^2}_{\text{bias}^2} + \underbrace{E\big[(\hat f(x_0) - E[\hat f(x_0)])^2\big]}_{\text{variance}}$$
:::

:::read
Expectations are over training sets. Without the noise term (comparing $\hat f$ to the true $f(x_0)$, as in Homework 5 Exercise 2), the error is exactly **bias² + variance**. Proof idea: add and subtract $E[\hat f(x_0)]$, expand the square; the cross term has expectation 0.
:::

| Bullseye picture (p17) | Low variance | High variance |
|---|---|---|
| **High bias** | tight cluster, off-centre: **underfitting** | scattered and off-centre |
| **Low bias** | tight cluster on the centre: ideal | scattered around the centre: **overfitting** |

High bias / low variance = flat lines that look the same on every dataset but miss the curve; low bias / high variance = wiggly curves that follow each dataset but disagree with each other (p19).

## Learning curves

Plot training and test (cross-validation) error against the training set size $m$ (p21):

| | High bias (underfitting) | High variance (overfitting) |
|---|---|---|
| Training error | rises and flattens at a **high** level | stays **low** |
| Test / CV error | falls and meets the training error, still **high** | much higher than training: a **large gap** |
| More data helps? | **No** | **Yes** (the gap shrinks) |

:::tip Diagnosis cheat sheet
- Train error high, test error high (close together): **high bias** → more features, more complex model, smaller λ.
- Train error low, test error much higher: **high variance** → more data, fewer features, larger λ, simpler model, ensembles (bagging).
:::

## Fix 1: feature selection

Two ways to fight overfitting (p22): **reduce the number of features** (feature selection, model selection) or **regularise** (keep all features but shrink the parameters; works well when many features each contribute a bit).

**Feature selection** (p23): find the best subset of features → a simpler model.

| Family (p24–25) | How | Examples |
|---|---|---|
| Unsupervised | ignore the label | drop incomplete features, highly correlated (multicollinear) features, near-zero-variance features |
| **Filter** | score each feature **once, before** learning; keep the top ones | Pearson's r, Kendall τ, Spearman ρ, **χ²**, **mutual information / information gain**, F-score, point-biserial |
| **Wrapper** | search feature subsets, **training the model** to score each subset | forward selection, backward elimination, recursive feature elimination |
| **Embedded** | selection happens **inside** training | **LASSO**, auto-encoder with a bottleneck |

:::formula Information gain of a feature (p27)
$$E(T, X) = \sum_{c \in X}P(c)\,E(c), \qquad \text{Gain}(T, X) = \text{Entropy}(T) - E(T, X)$$
:::

:::example Play Golf by Outlook (p27)
14 days, 9 Yes / 5 No: $\text{Entropy}(T) = -\frac{9}{14}\log_2\frac{9}{14} - \frac{5}{14}\log_2\frac{5}{14} = 0.940$.

| Outlook | Yes | No | Entropy |
|---|---|---|---|
| Sunny (5) | 3 | 2 | 0.971 |
| Overcast (4) | 4 | 0 | 0 |
| Rainy (5) | 2 | 3 | 0.971 |

$E(T, \text{Outlook}) = \frac{5}{14}0.971 + \frac{4}{14}0 + \frac{5}{14}0.971 = 0.693$. **Gain = 0.940 − 0.693 = 0.247.** Do the same for every feature and keep the ones with the largest gain.
:::

:::formula Chi-square score (p28)
$$\chi^2 = \sum_i\frac{(O_i - E_i)^2}{E_i}$$
:::

:::read
$O_i$ = observed count in cell $i$; $E_i$ = the count **expected if the feature and the target were independent** $= \frac{\text{row total} \times \text{column total}}{\text{grand total}}$. A big $\chi^2$ means the feature and target are related → keep it. Independent → uninformative.
:::

:::example χ² for a 2×2 table
Feature A vs class: (A = yes: 30 positive, 10 negative), (A = no: 20 positive, 40 negative). Totals: rows 40 and 60, columns 50 and 50, grand total 100.
Expected: $40\cdot50/100 = 20$ and $20$ in the first row; $30$ and $30$ in the second.
$\chi^2 = \frac{(30-20)^2}{20} + \frac{(10-20)^2}{20} + \frac{(20-30)^2}{30} + \frac{(40-30)^2}{30} = 5 + 5 + 3.33 + 3.33 = 16.67$.
:::

**Wrapper methods** (p29): gradually add (forward selection) or remove (backward elimination) the most / least useful feature, retraining each time. More accurate than filters but much more expensive.

## Fix 2: regularization

:::formula Regularised learning (p30–31)
$$\hat f_n = \arg\min_{f \in \mathcal{F}}\big\{\hat R_n(f) + C(f)\big\} \qquad\qquad \min_{\mathbf{w}}\ \frac{1}{2m}\sum_{i=1}^{m}(h(\mathbf{x}_i) - y_i)^2 + \phi(\mathbf{w})$$
:::

| Regulariser $\phi(\mathbf{w})$ | Name | Effect |
|---|---|---|
| $\lambda\lVert\mathbf{w}\rVert_2^2 = \lambda\sum_j w_j^2$ | **Ridge** (L2; the slide misspells it "rigid") | shrinks all weights smoothly towards 0 |
| $\lambda\lVert\mathbf{w}\rVert_1 = \lambda\sum_j\lvert w_j\rvert$ | **Lasso** (least absolute shrinkage and selection operator) | pushes some weights to **exactly 0** → feature selection (embedded) |

:::read The role of λ
- $\lambda = 0$: ordinary least squares, can overfit.
- Larger $\lambda$: smaller weights, simpler model, more bias, less variance.
- $\lambda \to \infty$: every penalised weight → 0; the model becomes $h(\mathbf{x}) = \bar y$ (a flat line) if $w_0$ is not penalised: **underfitting**.
- Choose $\lambda$ with a validation set or cross-validation.
:::

:::steps Ridge regression, both solutions (Homework 2 Exercise 2)
Cost: $J(\mathbf{w}) = \frac{1}{2m}\Big[\sum_i(\mathbf{w}^T\mathbf{x}_i - y_i)^2 + \lambda\sum_{j=1}^{n}w_j^2\Big]$ (usually $w_0$ is not penalised).
1. Gradient: $\frac{\partial J}{\partial w_0} = \frac1m\sum_i e_i$; $\frac{\partial J}{\partial w_j} = \frac1m\sum_i e_ix_{ij} + \frac{\lambda}{m}w_j$ for $j \ge 1$, where $e_i = \mathbf{w}^T\mathbf{x}_i - y_i$.
2. **Gradient descent**: $w_j := w_j\big(1 - \frac{\alpha\lambda}{m}\big) - \frac{\alpha}{m}\sum_i e_ix_{ij}$. The factor $1 - \frac{\alpha\lambda}{m} < 1$ shrinks the weight every step ("weight decay").
3. **Analytical**: setting the gradient to 0: $(X^TX + \lambda L)\mathbf{w} = X^T\mathbf{y}$, so $\mathbf{w} = (X^TX + \lambda L)^{-1}X^T\mathbf{y}$ with $L = \mathrm{diag}(0, 1, \dots, 1)$ (use $I$ if $w_0$ is penalised too). For $\lambda > 0$ this matrix is always invertible.
:::

**Regularised logistic regression** (p32): $\min_{\mathbf{w}}\sum_i\ln(1 + \exp(-y_i\mathbf{w}^T\mathbf{x}_i)) + \lambda\lVert\mathbf{w}\rVert_2^2$ (L2) or $+ \lambda\lVert\mathbf{w}\rVert_1$ (L1, "sparse logistic regression"). This also fixes the infinite-weight problem on separable data.

## Fix 3: ensembles

**Idea** (p33): train several models and **combine** them (vote or average). Usually improves accuracy, often by a lot.

:::formula Why it works (p34)
With 25 independent classifiers, each with error $\varepsilon = 0.35$, a majority vote is wrong only if **13 or more** are wrong:
$$\sum_{i=13}^{25}\binom{25}{i}\varepsilon^i(1-\varepsilon)^{25-i} \approx 0.06$$
:::

:::read
The sum adds the binomial probabilities of 13, 14, …, 25 mistakes. 6% is far below 35%. This needs the classifiers to be **independent** (or at least different) and each better than random ($\varepsilon < 0.5$); with $\varepsilon > 0.5$ voting makes things worse.
:::

### Bagging (bootstrap aggregating)

- **Bootstrap sample** (p36): from $n$ examples draw $n$ **with replacement**. Some examples repeat, others are missing.
- Probability that a given example is never drawn: $(1 - \frac1n)^n \to \frac1e \approx 0.37$. So each bootstrap sample leaves out about **37%** of the data (and contains about 63% distinct examples).

:::steps Bagging algorithm (p38)
1. **Create** $k$ bootstrap samples $D_1, \dots, D_k$.
2. **Train** a separate classifier $h_i$ on each $D_i$.
3. **Classify** a new instance by a vote with **equal weights** (regression: average the predictions).
:::

Bagging approximates the Bayesian average $\sum_i P(c \mid h_i, x)$ with $h_i$ sampled from the posterior $P(h \mid D)$ (p35, p39). It mainly **reduces variance**, so it suits unstable, high-variance models such as deep decision trees.

:::example
$n = 10$: $(1 - 0.1)^{10} = 0.9^{10} = 0.349$. $n = 100$: $0.99^{100} = 0.366$. The limit is $1/e = 0.368$.
:::

**Random forest** = bagging of decision trees **plus** a random subset of features at each split, which makes the trees less correlated.

:::steps Random forest for regression (Homework 5 Exercise 3)
Input: training set $D$ of $n$ examples with $p$ features; number of trees $B$; features per split $m_{try}$ (often $p/3$ for regression); minimum leaf size.
1. For $b = 1, \dots, B$:
   - draw a bootstrap sample $D_b$ of size $n$ from $D$ (with replacement);
   - grow a regression tree $T_b$ on $D_b$: at each node pick $m_{try}$ features at random, find the best split among them only (largest reduction of squared error / variance), split, and recurse until the node reaches the minimum size; do not prune.
2. Prediction for a new $\mathbf{x}$: $\hat f(\mathbf{x}) = \frac1B\sum_{b=1}^{B}T_b(\mathbf{x})$ (classification: majority vote).
3. Optional: the out-of-bag examples (the ≈37% not in $D_b$) give a free validation error.
:::

### Boosting and AdaBoost

Bagging is inefficient (p40): every example is equally likely to be sampled (no focus on hard cases), and every classifier gets the same vote (no reward for accurate ones). **Boosting** fixes both (p41): **focus on difficult examples** and give **accurate models larger weights**. Models are trained **sequentially**, each one concentrating on the mistakes of the previous ones (p42, p44). Risk: it can reach zero training error and then **overfit**.

- Misclassified examples get **larger** weights; correctly classified ones get **smaller** weights, so hard examples are sampled more often in the next round (p43: example 4 shows up five times in round 3).

:::example AdaBoost weights (p45), 5 examples
- $D_0 = (\frac15, \frac15, \frac15, \frac15, \frac15)$. $h_1$ misclassifies $x_1$ and $x_4$.
- Their weights are doubled relative to the others, then normalised: raw $(2, 1, 1, 2, 1)$, sum 7 → $D_1 = (\frac27, \frac17, \frac17, \frac27, \frac17)$.
- $h_2$ misclassifies only $x_4$: raw $(2, 1, 1, 4, 1)$, sum 9 → $D_2 = (\frac29, \frac19, \frac19, \frac49, \frac19)$.

(In full AdaBoost the multiplier is $e^{\alpha_t}$ with $\alpha_t = \frac12\ln\frac{1 - \varepsilon_t}{\varepsilon_t}$, which depends on the weighted error $\varepsilon_t$. The slide uses ×2 to show the idea.)
:::

| | Bagging | Boosting |
|---|---|---|
| Training | **parallel**, independent models | **sequential**, each depends on the previous |
| Sampling | uniform bootstrap | weighted towards hard examples |
| Combination | equal votes | accurate models weigh more |
| Mainly reduces | variance | bias (and variance) |
| Risk | little extra overfitting | can overfit noisy data |

### Stacking

Train several **different** base learners (e.g. decision tree, Naive Bayes, neural net), then a **meta-learner** that takes their predictions as inputs and outputs the final prediction. Train the meta-learner on predictions for held-out data, e.g. with leave-one-out cross-validation, so it does not just trust the base learners' training-set predictions (p46).

## Homework 5 topics in brief

:::note Reject option (Exercise 1)
Loss 0 for a correct decision, $\lambda_s$ for a wrong one, $\lambda_r$ for rejecting. The risk of choosing class $j$ is $\lambda_s(1 - p(j \mid x))$; the risk of rejecting is $\lambda_r$. So pick the most probable class $j$ if $\lambda_s(1 - p(j \mid x)) \le \lambda_r$, i.e. $p(j \mid x) \ge 1 - \frac{\lambda_r}{\lambda_s}$; otherwise reject. As $\lambda_r/\lambda_s$ goes from 0 to 1 the threshold falls from 1 to 0: rejecting becomes expensive, so we reject less and less (at ratio 0 we reject everything that is not certain, at ratio 1 we never reject).
:::

:::note Linear smoothers (Exercise 2)
Both linear regression and k-NN regression predict $\hat f(x_0) = \sum_i\ell_i(x_0; \mathcal{X})\,y_i$, a weighted sum of the training targets. Linear regression: $\ell_i(x_0) = [\mathbf{x}_0^T(X^TX)^{-1}X^T]_i$. k-NN: $\ell_i(x_0) = 1/k$ if $x_i$ is one of the $k$ nearest neighbours of $x_0$, else 0. The conditional MSE splits into squared bias $\big(f(x_0) - \sum_i\ell_if(x_i)\big)^2$ plus variance $\sigma^2\sum_i\ell_i^2$. See the practice section for the full derivation.
:::
