const r = String.raw;

export default {
  lesson: 'l7-model-optimization',
  questions: [
    // ---------- Homework 7 (supplied filename HW_07.pdf) ----------
    {
      id: 'hw07-ex1',
      type: 'numeric',
      source: { kind: 'hw', label: 'HW_07.pdf Exercise 1 (p1)' },
      prompt: r`Rank the four features for predicting Heart Disease using information gain (base-2 logs):

| Patient | Age | Blood Pressure | Cholesterol | Smoker | Heart Disease |
|---|---|---|---|---|---|
| 1 | Young | High | Normal | Yes | Yes |
| 2 | Old | High | High | No | No |
| 3 | Middle | Normal | Normal | Yes | Yes |
| 4 | Old | Normal | High | No | No |
| 5 | Young | High | High | Yes | Yes |
| 6 | Old | Normal | High | No | No |
| 7 | Middle | Normal | Normal | Yes | Yes |
| 8 | Middle | High | High | No | No |

Enter the gain of each feature in bits and identify the largest in your explanation. Patient ID is an identifier, not a candidate feature.

**Source note:** we use the supplied filename $\texttt{HW\_07.pdf}$ to identify this sheet; its printed header instead says "Homework 01" and "INT3424, AIT3007".`,
      fields: [
        { label: 'Gain(Age), bits', answer: 0.6556390622295665, tol: 0.002 },
        { label: 'Gain(Blood Pressure), bits', answer: 0, tol: 0.002 },
        { label: 'Gain(Cholesterol), bits', answer: 0.5487949406953986, tol: 0.002 },
        { label: 'Gain(Smoker), bits', answer: 1, tol: 0.002 },
      ],
      solution: r`There are 4 Yes and 4 No targets, so the parent entropy is $H(Y)=-0.5\log_2(0.5)-0.5\log_2(0.5)=1$ bit. For each feature, subtract its weighted child entropy:

| Feature | Child counts (Yes, No) | Weighted child entropy | Gain |
|---|---|---|---|
| Age | Young (2,0), Old (0,3), Middle (2,1) | $\frac38H(2/3,1/3)=0.344361$ | $0.655639$ |
| Blood Pressure | High (2,2), Normal (2,2) | $\frac48(1)+\frac48(1)=1$ | $0$ |
| Cholesterol | Normal (3,0), High (1,4) | $\frac58H(1/5,4/5)=0.451205$ | $0.548795$ |
| Smoker | Yes (4,0), No (0,4) | $0$ | $1$ |

For example, $H(2/3,1/3)=-\frac23\log_2\frac23-\frac13\log_2\frac13\approx0.918296$. Pure children such as (2,0) have entropy 0; use the convention $0\log_2 0=0$.

Ranking: **Smoker > Age > Cholesterol > Blood Pressure**. Smoker perfectly separates this tiny table. That is a statement about these eight rows, not evidence of a perfect medical rule for new patients; feature selection and evaluation must use separate training/validation data.`,
    },
    {
      id: 'hw07-ex1-v1',
      type: 'mcq',
      source: { kind: 'variant', label: 'like HW_07.pdf Ex 1' },
      prompt: r`An 8-row binary dataset has 4 Yes and 4 No targets. Candidate feature branches have counts (Yes, No):
- Age: Young (2,0), Middle (2,1), Old (0,3).
- Blood Pressure: High (2,2), Normal (2,2).
- Cholesterol: Normal (3,0), High (1,4).

If these are the only available features, which has the largest information gain?`,
      options: ['Age', 'Blood Pressure', 'Cholesterol', 'All three tie'],
      answer: 0,
      solution: r`Parent entropy is 1. Age has gain $1-\frac38H(2/3,1/3)\approx0.6556$. Cholesterol has gain $1-\frac58H(1/5,4/5)\approx0.5488$. Blood Pressure has gain 0. Thus **Age** is the best of the available features.`,
    },
    {
      id: 'hw07-ex2',
      type: 'written',
      source: { kind: 'hw', label: 'HW_07.pdf Exercise 2 (pp1–2, L1 regularization)' },
      prompt: r`For $X\in\mathbb{R}^{n\times p}$, $\vec{y}\in\mathbb{R}^n$ and $\lambda>0$, consider
$$R_{\mathrm{reg}}(\vec{\theta})=\frac12\lVert X\vec{\theta}-\vec{y}\rVert_2^2+\lambda\lVert\vec{\theta}\rVert_1.$$
1. Why is this objective not differentiable everywhere?
2. Show that it is convex.
3. With all coordinates except $\theta_j$ held fixed, find $\rho_j,z_j$ such that
$$\frac12\frac{\partial}{\partial\theta_j}\lVert X\vec{\theta}-\vec{y}\rVert_2^2=-\rho_j+\theta_jz_j.$$
Explain how these quantities can give a coordinate update.`,
      solution: r`First unpack the norms: $\lVert X\vec{\theta}-\vec{y}\rVert_2^2=\sum_i(\sum_kx_{ik}\theta_k-y_i)^2$, and $\lVert\vec{\theta}\rVert_1=\sum_k|\theta_k|$. Here $x_{ik}$ is row $i$, feature $k$ of $X$.

**1. Non-differentiability.** The slope of $|\theta_j|$ is $-1$ to the left of 0 and $+1$ to the right; at 0 there is no single derivative. With $\lambda>0$, adding a smooth squared-error term does not remove this corner. The objective is differentiable when every penalised coordinate is nonzero, but not at a zero coordinate.

**2. Convexity.** The squared-error term has Hessian $X^TX$, and for every vector $\vec{v}$,
$$\vec{v}^TX^TX\vec{v}=\lVert X\vec{v}\rVert_2^2\ge0.$$
Thus the quadratic is convex. Absolute value is convex because $|ta+(1-t)b|\le t|a|+(1-t)|b|$ for $0\le t\le1$ (triangle inequality). Summing these absolute values and multiplying by $\lambda>0$ preserves convexity. The sum of the two convex terms is convex; it need not be strictly convex, so a minimiser need not be unique.

**3. Coordinate quantities.** Define the partial residual $r_i^{(j)}=y_i-\sum_{k\ne j}x_{ik}\theta_k$: what remains of target $i$ after accounting for all other features. Differentiating the squared-error term gives
$$\sum_i x_{ij}(x_{ij}\theta_j-r_i^{(j)})=-\underbrace{\sum_ix_{ij}r_i^{(j)}}_{\rho_j}+\theta_j\underbrace{\sum_ix_{ij}^2}_{z_j}.$$
Therefore $\rho_j=\sum_i x_{ij}(y_i-\sum_{k\ne j}x_{ik}\theta_k)$ and $z_j=\sum_i x_{ij}^2$.

For fixed other coordinates, discard terms not depending on $\theta_j$; the objective becomes $\frac12z_j\theta_j^2-\rho_j\theta_j+\lambda|\theta_j|+\text{constant}$. If $z_j>0$, minimise the positive and negative branches and check 0:
$$\theta_j\leftarrow\begin{cases}(\rho_j-\lambda)/z_j&\rho_j>\lambda,\\0&|\rho_j|\le\lambda,\\(\rho_j+\lambda)/z_j&\rho_j<-\lambda.\end{cases}$$
This **soft-thresholding** update sets weak coordinates exactly to zero. Cycle through coordinates, recomputing the partial residuals, until convergence. If $z_j=0$, column $j$ is all zeros; choose $\theta_j=0$ to minimise its L1 penalty instead of dividing by zero.`,
    },
    {
      id: 'hw07-ex2-v1',
      type: 'numeric',
      source: { kind: 'variant', label: 'like HW_07.pdf Ex 2 (one Lasso coordinate)' },
      prompt: r`For a single feature without an intercept, $X=(1,2)^T$, $\vec{y}=(3,5)^T$, minimise $\frac12\lVert X\theta-\vec{y}\rVert_2^2+\lambda|\theta|$ with $\lambda=1$. Compute $\rho=\sum_ix_iy_i$, $z=\sum_ix_i^2$ and the minimising $\theta$.`,
      fields: [
        { label: r`$\rho$`, answer: 13, tol: 0.001 },
        { label: r`$z$`, answer: 5, tol: 0.001 },
        { label: r`$\theta$`, answer: 2.4, tol: 0.002 },
      ],
      solution: r`$\rho=1(3)+2(5)=13$, $z=1^2+2^2=5$. Since $13>\lambda=1$, the positive branch gives $\theta=(13-1)/5=2.4$.

Check: the smooth derivative is $5\theta-13=-1$ at 2.4 and the L1 derivative is $+1$, so the total is 0. Convexity makes this the global minimum. Ordinary least squares would give $13/5=2.6$; Lasso shrinks it towards 0.`,
    },
    {
      id: 'hw07-ex3',
      type: 'numeric',
      source: { kind: 'hw', label: 'HW_07.pdf Exercise 3 (p2, majority voting)' },
      prompt: r`For an example whose true class is 1, each of $M$ binary classifiers predicts 1 with probability $\theta$. A **strict** majority (more than $M/2$ votes for 1) predicts class 1; a tie does not. Under the independent, identically distributed voter assumption needed for a binomial model, derive the probability of a correct ensemble prediction.

Enter that probability for $\theta=0.51$ with $M=1000$ and $M=10000$. Explain what happens as $M$ becomes very large and why the independence assumption matters.`,
      fields: [
        { label: r`$P(\text{correct}),\ M=1000$`, answer: 0.726098555730504, tol: 0.0005 },
        { label: r`$P(\text{correct}),\ M=10000$`, answer: 0.976718287480731, tol: 0.0005 },
      ],
      solution: r`Let $V_m=1$ when voter $m$ predicts 1. For a true class-1 example, assume $V_1,\ldots,V_M$ are independent Bernoulli variables with the same success probability $\theta$. The number of correct votes is $S=\sum_mV_m\sim\mathrm{Binomial}(M,\theta)$.

A strict majority needs at least $\lfloor M/2\rfloor+1$ correct votes, so
$$p=P(S>M/2)=\sum_{k=\lfloor M/2\rfloor+1}^{M}\binom{M}{k}\theta^k(1-\theta)^{M-k}=1-F_{\mathrm{Binomial}(M,\theta)}(\lfloor M/2\rfloor).$$
For $M=1000$, sum from 501: $p\approx0.726099$ (**72.61%**). For $M=10000$, sum from 5001: $p\approx0.976718$ (**97.67%**). Do not include the tie terms $k=500$ or $5000$.

Use a binomial survival function or a numerically stable recurrence; factorials such as $10000!$ overflow ordinary calculators. A normal approximation gives intuition: the vote count has mean $M\theta$ and standard deviation $\sqrt{M\theta(1-\theta)}$, so the mean's advantage above the halfway mark grows relative to the noise like $\sqrt M$.

As $M\to\infty$, the fraction $S/M$ approaches $\theta=0.51>0.5$ and $p\to1$. More generally the limit is 1 for $\theta>0.5$, 0 for $\theta<0.5$, and $1/2$ for $\theta=0.5$. Finite even/odd changes and ties mean accuracy need not increase at every single increment of $M$.

The source gives an accuracy but does not explicitly state independence; it is an **extra assumption** required by the suggested binomial calculation. Perfectly correlated classifiers all make the same prediction, so their majority remains only 51% accurate however large $M$ is. This calculation is conditional on true class 1; it does not specify accuracy on class 0 or overall accuracy across both classes.`,
    },
    {
      id: 'hw07-ex3-v1',
      type: 'numeric',
      source: { kind: 'variant', label: 'like HW_07.pdf Ex 3 (small ensemble and ties)' },
      prompt: r`Independent voters each predict the correct class 1 with probability $\theta=0.6$. Compute the probability of a strict-majority prediction of class 1 for $M=4$ and for $M=5$. A tie is not a class-1 prediction.`,
      fields: [
        { label: r`$P(\text{correct}),\ M=4$`, answer: 0.4752, tol: 0.0005 },
        { label: r`$P(\text{correct}),\ M=5$`, answer: 0.68256, tol: 0.0005 },
      ],
      solution: r`For 4 voters a strict majority needs 3 or 4 successes:
$$\binom43(0.6)^3(0.4)+(0.6)^4=0.3456+0.1296=0.4752.$$
For 5 voters it needs 3, 4 or 5:
$$\binom53(0.6)^3(0.4)^2+\binom54(0.6)^4(0.4)+(0.6)^5=0.3456+0.2592+0.07776=0.68256.$$
Counting ties as failures makes the 4-voter accuracy lower than a single voter's 0.6. This does not contradict the large-ensemble limit; it shows why finite-ensemble tie rules matter.`,
    },
    // ---------- Homework 5 ----------
    {
      id: 'hw05-ex1',
      type: 'written',
      source: { kind: 'hw', label: 'HW05 Exercise 1 (reject option)' },
      prompt: r`In classification one may assign $x$ to a class $j$ or, if too uncertain, **reject**. Let $\alpha_i$ be the action "choose $i$", for $i = 1..C+1$, where $C + 1$ is the reject action. With true class $Y = j$, the loss is
$$\lambda(\alpha_i \mid Y = j) = \begin{cases}0 & \text{if } i = j \in \{1..C\}\\ \lambda_r & \text{if } i = C + 1\\ \lambda_s & \text{otherwise}\end{cases}$$
1. Show that the minimum risk is obtained by deciding $Y = j$ if $p(Y = j \mid x) \ge p(Y = k \mid x)$ for all $k$ (j is the most probable class) **and** $p(Y = j \mid x) \ge 1 - \frac{\lambda_r}{\lambda_s}$; otherwise reject.
2. Describe what happens as $\lambda_r/\lambda_s$ increases from 0 to 1.`,
      solution: r`Write $p_k = p(Y = k \mid x)$. The **conditional risk** of an action is its expected loss under the posterior: $R(\alpha_i \mid x) = \sum_j\lambda(\alpha_i \mid Y = j)\,p_j$.

**Part 1.**
- Choose a class $i \in \{1..C\}$: loss 0 if $Y = i$, $\lambda_s$ otherwise:
$$R(\alpha_i \mid x) = \lambda_s\sum_{j \ne i}p_j = \lambda_s(1 - p_i).$$
- Reject: loss $\lambda_r$ whatever the class: $R(\alpha_{C+1} \mid x) = \lambda_r\sum_j p_j = \lambda_r$.

The Bayes decision picks the action with the smallest risk.
1. Among the classes, $\lambda_s(1 - p_i)$ is smallest when $p_i$ is **largest**, so the best class is $j = \arg\max_k p_k$, i.e. $p_j \ge p_k$ for all $k$.
2. Choose $j$ rather than reject when $R(\alpha_j \mid x) \le R(\alpha_{C+1} \mid x)$:
$$\lambda_s(1 - p_j) \le \lambda_r \iff 1 - p_j \le \frac{\lambda_r}{\lambda_s} \iff p_j \ge 1 - \frac{\lambda_r}{\lambda_s}.$$
3. Otherwise ($p_j < 1 - \lambda_r/\lambda_s$) rejecting has lower risk, so reject. ∎

**Part 2.** The threshold $\theta = 1 - \lambda_r/\lambda_s$ falls from 1 to 0.
- $\lambda_r/\lambda_s = 0$: rejecting is free, $\theta = 1$: reject unless completely certain ($p_j = 1$).
- As the ratio grows, rejecting gets relatively more expensive, $\theta$ drops, and we reject **less often**, accepting less confident predictions.
- $\lambda_r/\lambda_s \to 1$: $\theta \to 0$; since $\max_k p_k \ge 1/C > 0$, we **never reject**; the rule becomes the ordinary "pick the most probable class". (For $\lambda_r \ge \lambda_s$ rejecting is never worth it.)`,
    },
    {
      id: 'hw05-ex1-v1',
      type: 'numeric',
      source: { kind: 'variant', label: 'like HW05 Ex 1' },
      prompt: r`A 3-class classifier with a reject option has $\lambda_s = 1$ (misclassification) and $\lambda_r = 0.3$ (reject). For an input with posteriors $p = (0.6, 0.3, 0.1)$, compute the rejection threshold $1 - \lambda_r/\lambda_s$, the risk of predicting class 1, and the risk of rejecting. Then decide (1 = reject, 0 = predict class 1).`,
      fields: [
        { label: 'threshold', answer: 0.7, tol: 0.001 },
        { label: 'risk(class 1)', answer: 0.4, tol: 0.001 },
        { label: 'risk(reject)', answer: 0.3, tol: 0.001 },
        { label: 'reject? (1/0)', answer: 1, tol: 0.01 },
      ],
      solution: r`- Threshold $= 1 - 0.3/1 = 0.7$.
- Risk of class 1 $= \lambda_s(1 - p_1) = 1 \times 0.4 = 0.4$.
- Risk of reject $= \lambda_r = 0.3$.

$0.3 < 0.4$ (equivalently $p_1 = 0.6 < 0.7$) → **reject**. If $\lambda_r$ were 0.5, the threshold would be 0.5 and class 1 would be predicted.`,
    },
    {
      id: 'hw05-ex2',
      type: 'written',
      source: { kind: 'hw', label: 'HW05 Exercise 2 (linear smoothers, bias–variance)' },
      prompt: r`We have $N$ pairs $(\vec{x}_i, y_i)$ i.i.d. with $\vec{x}_i \sim h(\vec{x})$, $y_i = f(\vec{x}_i) + \epsilon_i$, $\epsilon_i \sim (0, \sigma^2)$. Consider estimators linear in the $y_i$:
$$\hat f(\vec{x}_0) = \sum_{i=1}^{N}\ell_i(\vec{x}_0; \mathcal{X})\,y_i,$$
where the weights depend on all the $\vec{x}_i$ (denoted $\mathcal{X}$) but not on the $y_i$.
1. Show that linear regression and $k$-nearest-neighbour regression are members of this class; give the weights $\ell_i(\vec{x}_0; \mathcal{X})$ explicitly.
2. Decompose the conditional mean-squared error $E_{\mathcal{Y}|\mathcal{X}}\big(f(\vec{x}_0) - \hat f(\vec{x}_0)\big)^2$ into a conditional squared bias and a conditional variance.`,
      solution: r`**1a. Linear regression.** With design matrix $X$ (rows $\vec{x}_i^T$, including the 1 for the intercept), the least-squares weights are $\hat{\vec{w}} = (X^TX)^{-1}X^T\vec{y}$, so
$$\hat f(\vec{x}_0) = \vec{x}_0^T\hat{\vec{w}} = \underbrace{\vec{x}_0^T(X^TX)^{-1}X^T}_{\text{row vector } \vec{\ell}(\vec{x}_0)^T}\vec{y} = \sum_i\ell_i(\vec{x}_0; \mathcal{X})\,y_i,\qquad \ell_i(\vec{x}_0; \mathcal{X}) = \vec{x}_0^T(X^TX)^{-1}\vec{x}_i.$$
The weights use only $\vec{x}_0$ and the training inputs, never the $y_i$ ✓.

**1b. k-NN regression.** Let $N_k(\vec{x}_0)$ be the indices of the $k$ training points closest to $\vec{x}_0$. Then $\hat f(\vec{x}_0) = \frac1k\sum_{i \in N_k(\vec{x}_0)}y_i$, so
$$\ell_i(\vec{x}_0; \mathcal{X}) = \begin{cases}1/k & \text{if } \vec{x}_i \in N_k(\vec{x}_0)\\ 0 & \text{otherwise.}\end{cases}$$
The neighbourhood depends only on the $x$'s ✓.

**2. Decomposition.** Conditioning on $\mathcal{X}$, the only randomness is in the $\epsilon_i$. Let $\bar f(\vec{x}_0) = E_{\mathcal{Y}|\mathcal{X}}[\hat f(\vec{x}_0)] = \sum_i\ell_i\,f(\vec{x}_i)$ (because $E[y_i] = f(\vec{x}_i)$).

Add and subtract $\bar f(\vec{x}_0)$:
$$E\big(f(\vec{x}_0) - \hat f(\vec{x}_0)\big)^2 = \big(f(\vec{x}_0) - \bar f(\vec{x}_0)\big)^2 + 2\big(f(\vec{x}_0) - \bar f(\vec{x}_0)\big)\underbrace{E\big[\bar f(\vec{x}_0) - \hat f(\vec{x}_0)\big]}_{=0} + E\big(\hat f(\vec{x}_0) - \bar f(\vec{x}_0)\big)^2.$$
So
$$E_{\mathcal{Y}|\mathcal{X}}\big(f(\vec{x}_0) - \hat f(\vec{x}_0)\big)^2 = \underbrace{\Big(f(\vec{x}_0) - \sum_i\ell_i(\vec{x}_0; \mathcal{X})f(\vec{x}_i)\Big)^2}_{\text{conditional bias}^2} + \underbrace{\sigma^2\sum_i\ell_i(\vec{x}_0; \mathcal{X})^2}_{\text{conditional variance}}.$$
The variance line uses $\hat f - \bar f = \sum_i\ell_i\epsilon_i$ with independent $\epsilon_i$: $\mathrm{Var} = \sum_i\ell_i^2\sigma^2$.

**Interpretation.** For k-NN the variance is $\sigma^2\cdot k\cdot\frac{1}{k^2} = \sigma^2/k$: a larger $k$ lowers variance but averages farther points, increasing bias (L7 p10: small $k$ = high complexity).`,
    },
    {
      id: 'hw05-ex2-v1',
      type: 'numeric',
      source: { kind: 'variant', label: 'like HW05 Ex 2' },
      prompt: r`(a) 3-NN regression: the three nearest neighbours of $x_0$ have targets $2, 4, 9$, and the noise variance is $\sigma^2 = 0.9$. Give the prediction and the conditional variance $\sigma^2\sum_i\ell_i^2$.
(b) Linear regression **through the origin**, $h(x) = wx$, with training inputs $x = (1, 2, 3)$: here $\ell_i(x_0) = \frac{x_0x_i}{\sum_jx_j^2}$. Give $\ell_3(x_0)$ for $x_0 = 2$.`,
      fields: [
        { label: '(a) prediction', answer: 5, tol: 0.001 },
        { label: '(a) variance', answer: 0.3, tol: 0.001 },
        { label: r`(b) $\ell_3(2)$`, answer: 3 / 7, tol: 0.002 },
      ],
      solution: r`(a) $\ell_i = 1/3$ for the three neighbours: $\hat f = (2 + 4 + 9)/3 = 5$. Variance $= 0.9\cdot3\cdot\frac19 = 0.9/3 = 0.3$.

(b) $\hat w = \frac{\sum x_iy_i}{\sum x_i^2}$, so $\hat f(x_0) = x_0\hat w = \sum_i\frac{x_0x_i}{\sum_j x_j^2}y_i$. With $\sum x_j^2 = 14$: $\ell_3(2) = \frac{2\cdot3}{14} = \frac37 = 0.429$.`,
    },
    {
      id: 'hw05-ex3',
      type: 'written',
      source: { kind: 'hw', label: 'HW05 Exercise 3 (random forest)' },
      prompt: r`Write the pseudo-code of the **Random Forest regression** algorithm.`,
      solution: r`~~~text
RandomForestRegression(D, B, m_try, n_min)
  # D: n training pairs (x_i, y_i), x_i has p features
  # B: number of trees; m_try: features tried per split (often p/3)
  # n_min: minimum number of samples in a leaf
  for b = 1 .. B:
      D_b <- draw n samples from D uniformly WITH replacement   # bootstrap
      T_b <- GrowTree(D_b)
  return {T_1, ..., T_B}

GrowTree(S):
  if |S| <= n_min or all y in S are equal:
      return Leaf(value = mean of y in S)
  F <- random subset of m_try features (out of p)
  best <- none
  for each feature j in F:
      for each candidate threshold t of feature j:
          S_L <- {(x, y) in S : x_j <= t};  S_R <- S \ S_L
          score <- SSE(S_L) + SSE(S_R)     # SSE = sum of (y - mean)^2
          keep (j, t) with the smallest score
  return Node(j, t, GrowTree(S_L), GrowTree(S_R))   # no pruning

Predict(x):
  return (1/B) * sum_{b=1..B} T_b(x)        # average of the trees
~~~

Key points to mention:
- **Bagging**: each tree sees a bootstrap sample, about 63% distinct examples; the remaining ≈37% are **out-of-bag** and give a free error estimate.
- **Random feature subsets** at each split make the trees less correlated, so averaging reduces variance more than plain bagging.
- Regression trees choose splits by reduction of squared error / variance and predict the **mean** in each leaf; the forest **averages** (classification forests use Gini/entropy and a **majority vote**).`,
    },
    // ---------- ensembles ----------
    {
      id: 'l7-bootstrap',
      type: 'numeric',
      source: { kind: 'slide', label: 'L7 p36–37' },
      prompt: r`A bootstrap sample of size $n$ is drawn with replacement from $n$ examples. Compute the probability that a given example is **never** drawn for $n = 10$ and $n = 1000$, and the expected number of **distinct** examples in a bootstrap sample when $n = 1000$.`,
      fields: [
        { label: 'n = 10', answer: 0.3487, tol: 0.002 },
        { label: 'n = 1000', answer: 0.3677, tol: 0.002 },
        { label: 'distinct, n = 1000', answer: 632.3, tol: 1.5 },
      ],
      solution: r`One draw misses a given example with probability $1 - \frac1n$; all $n$ independent draws miss it with probability $(1 - \frac1n)^n$.
- $n = 10$: $0.9^{10} = 0.349$.
- $n = 1000$: $0.999^{1000} = 0.368 \approx 1/e$.
- Distinct: $1000(1 - 0.368) = 632$: the famous "63.2%".`,
    },
    {
      id: 'l7-ensemble-vote',
      type: 'numeric',
      source: { kind: 'slide', label: 'L7 p34' },
      prompt: r`An ensemble takes a majority vote of independent base classifiers. Compute the probability that the ensemble is wrong for (a) 5 classifiers each with error 0.3 and (b) 25 classifiers each with error 0.35 (the slide example).`,
      fields: [
        { label: '(a) 5 × ε = 0.3', answer: 0.16308, tol: 0.002 },
        { label: '(b) 25 × ε = 0.35', answer: 0.0604, tol: 0.002 },
      ],
      solution: r`The vote is wrong when a majority is wrong: at least 3 of 5, or at least 13 of 25.

(a) $\sum_{i=3}^{5}\binom5i0.3^i0.7^{5-i} = 10(0.027)(0.49) + 5(0.0081)(0.7) + 0.00243 = 0.1323 + 0.02835 + 0.00243 = 0.163$.

(b) $\sum_{i=13}^{25}\binom{25}{i}0.35^i0.65^{25-i} = 0.060$, as on the slide.

Both are far below the individual error. This only works if the classifiers are independent and each has $\varepsilon < 0.5$; with $\varepsilon = 0.6$ three voters would be wrong 64.8% of the time, worse than one.`,
    },
    {
      id: 'l7-adaboost-slide',
      type: 'numeric',
      source: { kind: 'variant', label: 'like L7 p45' },
      prompt: r`Boosting in the style of L7 p45 (misclassified examples get **double** weight, then normalise). Four examples start with equal weights $\vec{D}_0 = (\frac14, \frac14, \frac14, \frac14)$. Classifier $h_1$ misclassifies $x_2$ only; then $h_2$ misclassifies $x_1$ and $x_2$. Give the weight of $x_2$ in $\vec{D}_1$, and the weights of $x_1$ and $x_2$ in $\vec{D}_2$.`,
      fields: [
        { label: r`$x_2$ in $\vec{D}_1$`, answer: 0.4, tol: 0.002 },
        { label: r`$x_1$ in $\vec{D}_2$`, answer: 0.25, tol: 0.002 },
        { label: r`$x_2$ in $\vec{D}_2$`, answer: 0.5, tol: 0.002 },
      ],
      solution: r`**Round 1:** relative weights $(1, 2, 1, 1)$, sum 5 → $\vec{D}_1 = (\frac15, \frac25, \frac15, \frac15)$.

**Round 2:** double $x_1$ and $x_2$ relative to $\vec{D}_1$: $(2, 4, 1, 1)$, sum 8 → $\vec{D}_2 = (\frac28, \frac48, \frac18, \frac18) = (0.25, 0.5, 0.125, 0.125)$.

$x_2$, misclassified twice, now carries half of the total weight, so the next round's sample will be dominated by it.`,
    },
    {
      id: 'l7-adaboost-alpha',
      type: 'numeric',
      source: { kind: 'variant', label: 'AdaBoost formula' },
      prompt: r`In standard AdaBoost a classifier with weighted error $\varepsilon$ gets vote weight $\alpha = \frac12\ln\frac{1 - \varepsilon}{\varepsilon}$; misclassified weights are multiplied by $e^{\alpha}$ and correct ones by $e^{-\alpha}$, then normalised. Five examples have weight 0.2 each and $h_1$ misclassifies exactly one ($\varepsilon = 0.2$). Compute $\alpha$, the new weight of the misclassified example, and the new weight of each correct example.`,
      fields: [
        { label: r`$\alpha$`, answer: 0.6931, tol: 0.002 },
        { label: 'misclassified weight', answer: 0.5, tol: 0.002 },
        { label: 'each correct weight', answer: 0.125, tol: 0.002 },
      ],
      solution: r`$\alpha = \frac12\ln\frac{0.8}{0.2} = \frac12\ln 4 = 0.693$, so $e^{\alpha} = 2$ and $e^{-\alpha} = 0.5$.

Unnormalised: misclassified $0.2\times2 = 0.4$; each correct $0.2\times0.5 = 0.1$ (four of them, 0.4 in total). Sum $= 0.8$.

Normalised: misclassified $0.4/0.8 = 0.5$; each correct $0.1/0.8 = 0.125$. After every round the misclassified examples hold exactly half the weight.`,
    },
    // ---------- feature selection ----------
    {
      id: 'l7-ig-tennis',
      type: 'numeric',
      source: { kind: 'variant', label: 'like L7 p27 (Play Tennis data, L4 p27)' },
      prompt: r`For the 14-day Play Tennis data (9 Yes, 5 No; entropy 0.940), compute the information gain of **Humidity** (High: 3 Yes / 4 No, Normal: 6 Yes / 1 No) and of **Wind** (Weak: 6 Yes / 2 No, Strong: 3 Yes / 3 No).`,
      fields: [
        { label: 'Gain(Humidity)', answer: 0.1518, tol: 0.003 },
        { label: 'Gain(Wind)', answer: 0.0481, tol: 0.003 },
      ],
      solution: r`**Humidity:** High (3, 4): $H = 0.985$; Normal (6, 1): $H = 0.592$. Weighted $= \frac{7}{14}0.985 + \frac{7}{14}0.592 = 0.788$. Gain $= 0.940 - 0.788 = 0.152$.

**Wind:** Weak (6, 2): $H = 0.811$; Strong (3, 3): $H = 1$. Weighted $= \frac{8}{14}0.811 + \frac{6}{14}1 = 0.892$. Gain $= 0.048$.

Ranking for a filter method: Outlook (0.247) > Humidity (0.152) > Wind (0.048) > Temperature (0.029).`,
    },
    {
      id: 'l7-outlook-ig',
      type: 'numeric',
      source: { kind: 'slide', label: 'L7 p27' },
      prompt: r`Play Golf by Outlook: Sunny 3 Yes / 2 No, Overcast 4 / 0, Rainy 2 / 3 (14 days, 9 Yes / 5 No). Compute $\text{Entropy}(\text{PlayGolf})$, $E(\text{PlayGolf}, \text{Outlook})$ and the gain.`,
      fields: [
        { label: 'Entropy(T)', answer: 0.9403, tol: 0.002 },
        { label: 'E(T, Outlook)', answer: 0.6935, tol: 0.002 },
        { label: 'Gain', answer: 0.2467, tol: 0.002 },
      ],
      solution: r`- $\text{Entropy}(T) = -\frac9{14}\log_2\frac9{14} - \frac5{14}\log_2\frac5{14} = 0.410 + 0.530 = 0.940$.
- $E(3, 2) = E(2, 3) = 0.971$, $E(4, 0) = 0$.
- $E(T, \text{Outlook}) = \frac5{14}0.971 + \frac4{14}0 + \frac5{14}0.971 = 0.693$.
- Gain $= 0.940 - 0.693 = 0.247$ (slide p27).`,
    },
    {
      id: 'l7-chi2',
      type: 'numeric',
      source: { kind: 'slide', label: 'L7 p28' },
      prompt: r`Compute $\chi^2 = \sum\frac{(O - E)^2}{E}$ between a binary feature and a binary class, with observed counts: feature = yes → (30 positive, 10 negative); feature = no → (20 positive, 40 negative).`,
      fields: [{ label: r`$\chi^2$`, answer: 16.667, tol: 0.02 }],
      solution: r`Totals: rows 40 and 60, columns 50 and 50, $N = 100$. Expected $E = \frac{\text{row}\times\text{col}}{N}$: row 1 → 20, 20; row 2 → 30, 30.
$$\chi^2 = \frac{(30-20)^2}{20} + \frac{(10-20)^2}{20} + \frac{(20-30)^2}{30} + \frac{(40-30)^2}{30} = 5 + 5 + 3.33 + 3.33 = 16.67$$
Large → the feature and the class are clearly related → keep the feature.`,
    },
    {
      id: 'l7-chi2-outlook',
      type: 'numeric',
      source: { kind: 'variant', label: 'like L7 p28 (Outlook table of p27)' },
      prompt: r`Using the Outlook × Play table of L7 p27 (Sunny 3 Yes / 2 No, Overcast 4 / 0, Rainy 2 / 3), compute the $\chi^2$ statistic.`,
      fields: [{ label: r`$\chi^2$`, answer: 3.5467, tol: 0.01 }],
      solution: r`Totals: rows 5, 4, 5; columns Yes 9, No 5; $N = 14$.

| | Yes: O / E | No: O / E |
|---|---|---|
| Sunny | 3 / 3.214 | 2 / 1.786 |
| Overcast | 4 / 2.571 | 0 / 1.429 |
| Rainy | 2 / 3.214 | 3 / 1.786 |

$\chi^2 = 0.014 + 0.026 + 0.794 + 1.429 + 0.459 + 0.825 = 3.547$.`,
    },
    {
      id: 'l7-faces',
      type: 'numeric',
      source: { kind: 'variant', label: 'like L7 p6' },
      prompt: r`A population of 40 objects contains 10 that a hypothesis $h$ misclassifies. A training sample of 8 objects happens to contain only 1 misclassified object. Give the true error $\text{error}_D(h)$ and the sample error $\text{error}_S(h)$.`,
      fields: [
        { label: r`$\text{error}_D$`, answer: 0.25, tol: 0.001 },
        { label: r`$\text{error}_S$`, answer: 0.125, tol: 0.001 },
      ],
      solution: r`$\text{error}_D = 10/40 = 0.25$; $\text{error}_S = 1/8 = 0.125$. The sample makes $h$ look twice as good as it is: empirical error is only an estimate of the true error.`,
    },
    // ---------- concept MCQs ----------
    {
      id: 'l7-learning-curve',
      type: 'mcq',
      source: { kind: 'slide', label: 'L7 p21' },
      prompt: r`On a learning curve, training error and validation error quickly meet at a **high** error level and stay flat as more data is added. What is the diagnosis?`,
      options: ['High variance; collect more data', 'High bias; more data will not help, use a more complex model', 'Perfect fit', 'The learning rate is too small'],
      answer: 1,
      solution: r`Both errors high and close together = **high bias** (underfitting). More data does not help (the curves are already flat); add features, use a more flexible model, or reduce regularisation. High variance shows a **large gap** that shrinks with more data.`,
    },
    {
      id: 'l7-high-variance',
      type: 'mcq',
      source: { kind: 'slide', label: 'L7 p21–22' },
      prompt: r`Training error 2%, validation error 25%. Which action is **least** likely to help?`,
      options: ['Get more training data', 'Increase the regularisation λ', 'Use fewer features', 'Add more polynomial features'],
      answer: 3,
      solution: r`The large gap means **high variance** (overfitting). More data, stronger regularisation, fewer features, or bagging all help. Adding polynomial features makes the model more complex and the overfitting worse.`,
    },
    {
      id: 'l7-knn-complexity',
      type: 'mcq',
      source: { kind: 'slide', label: 'L7 p10' },
      prompt: r`Which model is the **most complex** (most prone to overfitting)?`,
      options: ['k-NN with k = 50', 'k-NN with k = 1', 'A depth-1 decision tree', 'Polynomial regression of degree 0'],
      answer: 1,
      solution: r`L7 p10: for k-NN a **small** neighbourhood means higher complexity; 1-NN memorises the training set. Depth-1 trees and degree-0 polynomials are very simple.`,
    },
    {
      id: 'l7-lasso',
      type: 'mcq',
      source: { kind: 'slide', label: 'L7 p24, p31' },
      prompt: r`Which regulariser tends to set some weights **exactly to zero**, and so performs embedded feature selection?`,
      options: [r`Ridge, $\lambda\lVert\vec{w}\rVert_2^2$`, r`Lasso, $\lambda\lVert\vec{w}\rVert_1$`, 'Both equally', 'Neither'],
      answer: 1,
      solution: r`The L1 penalty (Lasso, "least absolute shrinkage and selection operator") produces **sparse** weights, so it is listed as an embedded feature-selection method (L7 p24). Ridge shrinks weights towards 0 but rarely to exactly 0.`,
    },
    {
      id: 'l7-fs-families',
      type: 'mcq',
      source: { kind: 'slide', label: 'L7 p24–29' },
      prompt: r`Match each method to its feature-selection family: (i) ranking features by χ² before training, (ii) forward selection, retraining the model for every candidate subset, (iii) Lasso.`,
      options: ['(i) wrapper, (ii) filter, (iii) embedded', '(i) filter, (ii) wrapper, (iii) embedded', '(i) embedded, (ii) wrapper, (iii) filter', '(i) filter, (ii) embedded, (iii) wrapper'],
      answer: 1,
      solution: r`**Filter**: score features once, independently of the learner (χ², information gain, Pearson…). **Wrapper**: search subsets using the learner's performance (forward/backward selection, RFE). **Embedded**: selection happens inside training (Lasso, auto-encoder bottleneck).`,
    },
    {
      id: 'l7-bag-vs-boost',
      type: 'mcq',
      source: { kind: 'slide', label: 'L7 p38–44' },
      prompt: r`Which statement about bagging and boosting is correct?`,
      options: [
        'Bagging trains models sequentially, re-weighting hard examples',
        'Boosting trains models in parallel on bootstrap samples with equal votes',
        'Bagging trains models in parallel on bootstrap samples and votes with equal weights; boosting trains sequentially, increasing the weight of misclassified examples and giving accurate models larger votes',
        'Both always reduce bias but never variance',
      ],
      answer: 2,
      solution: r`L7 p44: bagging = **parallel**, boosting = **sequential**. Bagging samples uniformly with replacement and averages with equal weights (reduces variance). Boosting focuses on hard examples and weights accurate classifiers more (mainly reduces bias; can overfit noisy data).`,
    },
    {
      id: 'l7-bullseye',
      type: 'mcq',
      source: { kind: 'slide', label: 'L7 p17' },
      prompt: r`On the bias–variance bullseye, predictions from different training sets are scattered widely **around** the centre. This corresponds to:`,
      options: ['High bias, low variance (underfitting)', 'Low bias, high variance (overfitting)', 'Low bias, low variance (ideal)', 'High bias, high variance'],
      answer: 1,
      solution: r`Centred on average → low bias. Widely scattered → high variance. The slide labels this cell "Overfitting". A tight cluster away from the centre is high bias / low variance, "Underfitting".`,
    },
    {
      id: 'l7-risk-decomp',
      type: 'mcq',
      source: { kind: 'slide', label: 'L7 p12–13' },
      prompt: r`When the model class $\mathcal{F}$ becomes more complex (with the same amount of data), what typically happens to the approximation and estimation errors?`,
      options: [
        'Both decrease',
        'Approximation error decreases, estimation error increases',
        'Approximation error increases, estimation error decreases',
        'Both increase',
      ],
      answer: 1,
      solution: r`A richer $\mathcal{F}$ gets closer to the optimal predictor $f^*$ (approximation error ↓), but it is harder to pick its best member from finite data (estimation error ↑). Their sum, the excess risk, is U-shaped (L7 p13).`,
    },
    {
      id: 'l7-lambda-inf',
      type: 'mcq',
      source: { kind: 'slide', label: 'L7 p31, HW02 Ex 2' },
      prompt: r`In ridge regression (intercept not penalised), what model do you get as $\lambda \to \infty$?`,
      options: [
        'The ordinary least-squares solution',
        r`A constant prediction equal to the mean $\bar y$ (all other weights → 0): underfitting`,
        'A model that fits the training data perfectly',
        'The weights grow to infinity',
      ],
      answer: 1,
      solution: r`The penalty $\lambda\sum_{j\ge1}w_j^2$ dominates, forcing $w_1..w_n \to 0$. The best constant under squared error is the mean, so $h(\vec{x}) \to \bar y$: high bias, low variance.`,
    },
    {
      id: 'l7-ensemble-condition',
      type: 'mcq',
      source: { kind: 'slide', label: 'L7 p34' },
      prompt: r`Majority voting of many base classifiers lowers the error **only if**:`,
      options: [
        'The base classifiers are identical',
        'Each base classifier is better than random guessing (ε < 0.5) and their errors are (roughly) independent',
        'Each base classifier has error above 0.5',
        'There are exactly 25 classifiers',
      ],
      answer: 1,
      solution: r`The binomial calculation assumes independent errors with $\varepsilon < 0.5$. Identical classifiers make identical mistakes (no gain); with $\varepsilon > 0.5$ the vote makes things worse. Bootstrap samples and random features exist to make the members different.`,
    },
    {
      id: 'l7-stacking',
      type: 'mcq',
      source: { kind: 'slide', label: 'L7 p46' },
      prompt: r`In stacking, what is the input of the meta-learner?`,
      options: ['The raw features only', 'The predictions of the base learners (made on held-out examples)', 'The bootstrap samples', 'The weights of the base learners'],
      answer: 1,
      solution: r`Base learners (e.g. a decision tree, Naive Bayes, a neural net) make predictions; the meta-learner takes those predictions as features and outputs the final prediction. It is trained on predictions for left-out examples (leave-one-out cross-validation) so it learns how much to trust each learner on new data.`,
    },
    {
      id: 'l7-irreducible',
      type: 'mcq',
      source: { kind: 'slide', label: 'L7 p14' },
      prompt: r`With $Y = f^*(X) + \epsilon$, $\epsilon \sim \mathcal{N}(0, \sigma^2)$, what is the expected squared error of the **optimal** predictor $f^*$?`,
      options: ['0', r`$\sigma^2$`, r`$\sigma$`, 'It depends on the training set size'],
      answer: 1,
      solution: r`$R(f^*) = E[(f^*(X) - Y)^2] = E[\epsilon^2] = \sigma^2$. "The optimal predictor does not have zero error": the noise is irreducible.`,
    },
  ],
};
