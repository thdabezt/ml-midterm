---
slug: l2-general-concepts
num: 2
title: General Concepts for ML
short: Probability & learning theory
summary: Probability rules and Bayes, the standard distributions (Bernoulli, binomial, categorical, Gaussian…), entropy, cross-entropy, KL divergence, mutual information, maximum likelihood (MLE), and the learning framework (training vs true error, validation, cross-validation).
---
This lecture is the **math foundation** of the course. Homework 1 (MLE for a coin and for a die) comes straight from its last slides, and the slide quiz (p48–49) is exactly the kind of short calculation that appears as a multiple-choice question.

:::exam What the midterm can ask from this lecture
- Conditional probability / Bayes' rule word problems (dice, "girl wearing trousers").
- Which distribution models a given variable (Bernoulli, categorical, binomial, Gaussian, exponential…).
- Compute expected value, variance, entropy, cross-entropy or KL divergence for a small table.
- **Derive an MLE**: coin → $\theta = s/N$; die → $\theta_k = N_k/N$.
- Training error vs true error, overfitting, train / validation / test, k-fold and leave-one-out cross-validation.
:::

## Random variables

A **random variable (RV)** is a variable whose value is a numerical outcome of a random experiment (p9).

- **Discrete RV**: countable values. Two coin tosses, $X$ = number of heads: $X \in \{0, 1, 2\}$ → **3 values**. Two dice, $X$ = sum: $X \in \{2, \dots, 12\}$ → **11 values** (p10 quiz).
- **Continuous RV**: values in $\mathbb{R}$ or an interval, e.g. height, weight, time to finish a task.

### Discrete: probability mass ("density") function

:::formula @prob-discrete-mass
$$p_i = f(x_i) = P(X = x_i), \qquad f(x_i) \ge 0, \qquad \sum_{i=1}^{n} f(x_i) = 1$$
:::

:::example Two coins, X = number of heads (p12)
Outcomes TT, TH, HT, HH are equally likely (1/4 each).

| $x$ | 0 | 1 | 2 |
|---|---|---|---|
| $P(X = x)$ | 1/4 | 2/4 | 1/4 |

The probabilities add to 1. ✓
:::

### Continuous: density and cumulative distribution

:::formula @prob-continuous-density
$$f(x) \ge 0, \qquad \int_{-\infty}^{+\infty} f(x)\,dx = 1, \qquad P(a < X < b) = \int_a^b f(x)\,dx$$
:::

:::read
- $\int_a^b f(x)\,dx$ is the **area under the curve** $f$ between $a$ and $b$. For a continuous RV, probability = area.
- A single point has probability 0, so $P(a \le X \le b) = P(a < X < b)$.
- $f(x)$ itself is **not** a probability; it can be bigger than 1 (only the total area must be 1).
:::

**Cumulative distribution function (CDF)** (p15–17): $F(x) = P(X \le x)$.

:::formula @prob-cdf Cumulative distribution function
$$F(x)=P(X\le x)$$
:::

- $0 \le F(x) \le 1$; $F$ never decreases; $F(-\infty) = 0$, $F(+\infty) = 1$.
- $P(a < X \le b) = F(b) - F(a)$. {{priority:prob-cdf-interval}}
- Discrete: $F(x_0) = \sum_{x_i \le x_0} p_i$. {{priority:prob-discrete-cdf}}
- Continuous: $F(x_0) = \int_{-\infty}^{x_0} f(x)\,dx$, and $f(x) = F'(x)$. {{priority:prob-continuous-cdf}}

## Expected value and variance

:::formula @prob-expectation-discrete Expected value (mean)
$$E[X] = \sum_x x\,P(X = x) \quad\text{(discrete)}$$
:::

:::formula @prob-expectation-continuous Continuous expected value
$$E[X] = \int x\,f(x)\,dx \quad\text{(continuous)}$$
:::

:::read
"Multiply each value by its probability and add up." It is the long-run average.
:::

:::formula @prob-variance Variance
$$\mathrm{Var}[X] = E\big[(X - E[X])^2\big] = E[X^2] - (E[X])^2$$
:::

:::formula @prob-standard-deviation Standard deviation from variance
$$\sigma = \sqrt{\mathrm{Var}[X]}$$
:::

:::example A fair die
Values 1..6, each with probability 1/6.

1. $E[X] = (1+2+3+4+5+6)/6 = 21/6 = 3.5$
2. $E[X^2] = (1+4+9+16+25+36)/6 = 91/6 = 15.1667$
3. $\mathrm{Var}[X] = 15.1667 - 3.5^2 = 15.1667 - 12.25 = 2.9167$, so $\sigma = 1.708$.
:::

**Properties** (p19, p21): $E[C] = C$; $E[CX] = C\,E[X]$; $E[X+Y] = E[X] + E[Y]$ always; $E[XY] = E[X]E[Y]$ **if independent**. {{priority:prob-expectation-properties}}

$\mathrm{Var}[C] = 0$; $\mathrm{Var}[CX] = C^2\mathrm{Var}[X]$; $\mathrm{Var}[X + C] = \mathrm{Var}[X]$; $\mathrm{Var}[X+Y] = \mathrm{Var}[X] + \mathrm{Var}[Y]$ **if independent**. {{priority:prob-variance-properties}}

:::pitfall
$\mathrm{Var}[3X] = 9\,\mathrm{Var}[X]$, not $3\,\mathrm{Var}[X]$: constants come out **squared**. Adding a constant shifts the values but does not change the spread.
:::

## The rules of probability and Bayes' theorem

:::formula @prob-normalization Three rules (p22)
$$\text{Basic: } p(x) \ge 0,\qquad \sum_x p(x) = 1$$
:::

:::formula @prob-sum-rule Sum rule: marginalise the joint distribution
$$p(X) = \sum_Y p(X,Y)$$
:::

:::formula @prob-product-rule Product rule for joint probability
$$p(X,Y)=p(Y\mid X)\,p(X)$$
:::

- **Joint** $p(x, y)$: both happen. All joint probabilities add up to 1.
- **Marginal** $p(x) = \sum_y p(x, y)$: "sum out" the variable you do not care about (row totals of a table).
- **Conditional** $p(x \mid y) = \dfrac{p(x, y)}{p(y)}$: zoom into the cases where $y$ happened. {{priority:math-conditional-probability}}
- **Independence**: $p(x \mid y) = p(x)$, equivalently $p(x, y) = p(x)\,p(y)$. {{priority:prob-independence}}

:::formula @prob-bayes Bayes' rule (p25–26)
$$p(\theta \mid X) = \frac{p(X \mid \theta)\,p(\theta)}{p(X)} \qquad\Longrightarrow\qquad \underbrace{p(\theta \mid X)}_{\text{posterior}} \propto \underbrace{p(X \mid \theta)}_{\text{likelihood}} \times \underbrace{p(\theta)}_{\text{prior}}$$
:::

:::read
- **Prior** $p(\theta)$: what you believe *before* seeing data.
- **Likelihood** $p(X \mid \theta)$: how well $\theta$ explains the data.
- **Posterior** $p(\theta \mid X)$: updated belief *after* seeing data.
- $\propto$ means "proportional to": equal up to a constant ($1/p(X)$) that does not depend on $\theta$.
:::

:::example Slide quiz 1 (p48): two dice
*P(total > 9 | first die is 5)?* Given the first die is 5, we need second die $> 4$, i.e. 5 or 6: **2 of 6** outcomes. Answer $= 2/6 = 1/3 \approx 0.333$.
:::

:::example Slide quiz 2 (p48): girl wearing trousers
60% boys (all wear trousers), 40% girls (half wear trousers).

1. $P(T \mid G) = 0.5$, $P(G) = 0.4$, so $P(T, G) = 0.5 \times 0.4 = 0.2$.
2. $P(T) = P(T \mid B)P(B) + P(T \mid G)P(G) = 1 \times 0.6 + 0.5 \times 0.4 = 0.8$ (sum rule).
3. $P(G \mid T) = \dfrac{P(T \mid G)P(G)}{P(T)} = \dfrac{0.2}{0.8} = 0.25$.
:::

## Typical distributions

| Distribution | Models | Formula | Mean / variance | Priority |
|---|---|---|---|---|
| **Uniform** (discrete) | every outcome equally likely (day of week, a digit) | $P(X) = 1/\#\text{outcomes}$ | | {{priority:prob-uniform}} |
| **Bernoulli** $\mathrm{Bern}(\lambda)$ | one yes/no trial (coin, rain/sunny, male/female) | $P(x) = \lambda^x(1-\lambda)^{1-x}$, $x \in \{0,1\}$ | $\lambda$ / $\lambda(1-\lambda)$ | {{priority:prob-bernoulli}} |
| **Binomial** $\mathrm{Bin}(n, p)$ | number of successes in $n$ independent trials | $P(X = k) = \binom{n}{k}p^k(1-p)^{n-k}$ | $np$ / $np(1-p)$ | {{priority:prob-binomial}} |
| **Categorical** $\mathrm{Cat}(\boldsymbol\lambda)$ | one trial with $C > 2$ outcomes (die, image class) | $P(x = k) = \lambda_k$, $\sum_k \lambda_k = 1$ | | {{priority:prob-categorical}} |
| **Normal / Gaussian** $\mathcal{N}(\mu, \sigma^2)$ | continuous, bell-shaped (exam scores, IQ, height) | $\dfrac{1}{\sqrt{2\pi\sigma^2}}\exp\!\left(-\dfrac{(x-\mu)^2}{2\sigma^2}\right)$ | $\mu$ / $\sigma^2$ | {{priority:prob-gaussian}} |
| **Exponential** $\mathrm{Exp}(\lambda)$ | waiting times, call durations ($x \ge 0$) | $\lambda e^{-\lambda x}$ | $1/\lambda$ / $1/\lambda^2$ | {{priority:prob-exponential}} |

:::read The Bernoulli formula is a clever switch
$\lambda^x(1-\lambda)^{1-x}$: if $x = 1$ it becomes $\lambda^1(1-\lambda)^0 = \lambda$; if $x = 0$ it becomes $\lambda^0(1-\lambda)^1 = 1 - \lambda$. One formula covers both cases, which makes MLE derivations easy.
:::

:::example Binomial: 5 heads in 10 fair tosses (p35)
$$P(X = 5) = \binom{10}{5}0.5^5\,0.5^5 = 252 \times \frac{1}{1024} = 0.246$$
The slide's table gives 0.246094 ✓. The most likely count is 5 = $np$.
:::

The **multivariate normal** generalises the Gaussian to vectors $\mathbf{x} \in \mathbb{R}^D$ with a mean vector $\boldsymbol\mu$ and a covariance matrix $\boldsymbol\Sigma$:

:::formula @prob-multivariate-gaussian Multivariate Gaussian density
$$p(\mathbf{x}) = \frac{1}{(2\pi)^{D/2}|\boldsymbol\Sigma|^{1/2}}\exp\!\left(-\tfrac12(\mathbf{x}-\boldsymbol\mu)^T\boldsymbol\Sigma^{-1}(\mathbf{x}-\boldsymbol\mu)\right)$$
:::

(The slide prints the exponent without the minus sign; the minus is needed, otherwise the "bell" would point upwards.)

:::example Slide quiz 3 & 4 (p49)
- Predict tomorrow = Rain or Sunny: two outcomes → **Bernoulli**.
- Model the GPA of a UET student: a continuous score clustered around an average → **Gaussian (normal)**.
:::

## Entropy, cross-entropy, KL divergence, mutual information

:::formula @prob-entropy Entropy (p44)
$$H(X) = -\sum_{i=1}^{n} P(x_i)\log P(x_i)$$
:::

:::read
- Measures **uncertainty** or "surprise". With $\log_2$ the unit is **bits**.
- All outcomes equally likely → entropy is **largest**. One outcome certain → entropy is **0**.
- The minus sign is there because logs of probabilities (numbers ≤ 1) are negative.
:::

:::steps Computing entropy
1. List the probabilities $p_i$ (from counts: $p_i = n_i / n$).
2. For each, compute $p_i \log_2 p_i$ (skip $p_i = 0$, it contributes 0).
3. Add them and flip the sign.

Example $p = (0.5, 0.25, 0.25)$: $-(0.5\cdot(-1) + 0.25\cdot(-2) + 0.25\cdot(-2)) = 1.5$ bits.

Fair coin: $H = -(0.5\log_2 0.5 + 0.5\log_2 0.5) = 1$ bit. Coin with $p = 0.9$: $H = -(0.9\log_2 0.9 + 0.1\log_2 0.1) = 0.137 + 0.332 = 0.469$ bits.
:::

:::formula @prob-cross-entropy Cross-entropy (p46–47)
$$H(p, q) = -\sum_x p(x)\log q(x)$$
:::

:::formula @prob-kl-divergence KL divergence
$$D_{KL}(P \,\|\, Q) = \sum_x P(x)\log\frac{P(x)}{Q(x)} = H(P, Q) - H(P)$$
:::

:::read
- $P$ = the true distribution, $Q$ = our model's guess.
- Cross-entropy: average surprise when reality follows $P$ but we expect $Q$. It is the **loss used for classification** (logistic regression, neural nets).
- KL divergence: the *extra* surprise from using $Q$ instead of $P$. Always $\ge 0$, and $= 0$ only when $P = Q$. It is **not symmetric**: $D_{KL}(P\|Q) \ne D_{KL}(Q\|P)$ in general.
:::

:::example
$P = (0.5, 0.5)$, $Q = (0.9, 0.1)$, base-2 logs.
- $H(P) = 1$.
- $H(P, Q) = -(0.5\log_2 0.9 + 0.5\log_2 0.1) = -(0.5(-0.152) + 0.5(-3.322)) = 1.737$.
- $D_{KL}(P\|Q) = 1.737 - 1 = 0.737$ bits.
:::

:::example Slide quiz 5 (p49): non-overlapping supports
If $P(x) > 0$ somewhere that $Q(x) = 0$, the term $P(x)\log\frac{P(x)}{0}$ is infinite. So $D_{KL}(P\|Q) = +\infty$: KL "explodes" when the distributions do not overlap.
:::

:::formula @prob-mutual-information Mutual information (p45)
$$I(X; Y) = H(X) - H(X \mid Y) = H(Y) - H(Y \mid X) = H(X) + H(Y) - H(X, Y)$$
:::

How much knowing $Y$ reduces the uncertainty about $X$. $I = 0$ when $X$ and $Y$ are independent. **Information gain** in decision trees (Lecture 5) is exactly the mutual information between the class and the splitting attribute.

## Maximum likelihood estimation (MLE)

This is **Homework 1**. The question: we observe data $D$; which parameter $\theta$ makes this data **most probable**?

:::formula @prob-mle-recipe The recipe
$$L(\theta) = P(D \mid \theta) = \prod_{i=1}^{N} P(x_i \mid \theta), \qquad \hat\theta_{MLE} = \arg\max_\theta L(\theta) = \arg\max_\theta \log L(\theta)$$
:::

:::steps MLE in five steps (works for every homework question)
1. Write the probability of **one** observation, $P(x_i \mid \theta)$.
2. Multiply over all observations (they are independent): $L(\theta) = \prod_i P(x_i \mid \theta)$.
3. Take the log so the product becomes a sum: $\ell(\theta) = \sum_i \log P(x_i \mid \theta)$.
4. Differentiate with respect to $\theta$ and set to 0.
5. Solve for $\theta$. (If there is a constraint such as $\sum_k \theta_k = 1$, add a Lagrange multiplier.)
:::

:::formula @prob-coin-mle Coin (Bernoulli), Homework 1 Exercise 1 and slides p65–68
Toss $N$ times, get $s$ heads. Each toss: $P(x_i) = \theta^{x_i}(1-\theta)^{1-x_i}$.

1. $L(\theta) = \prod_i \theta^{x_i}(1-\theta)^{1-x_i} = \theta^{s}(1-\theta)^{N-s}$ (the exponents add up: $\sum x_i = s$ heads, $\sum (1-x_i) = N-s$ tails).
2. $\ell(\theta) = s\log\theta + (N-s)\log(1-\theta)$.
3. $\ell'(\theta) = \dfrac{s}{\theta} - \dfrac{N-s}{1-\theta} = 0$ (derivative of $\log(1-\theta)$ is $\frac{-1}{1-\theta}$ by the chain rule).
4. $s(1-\theta) = (N-s)\theta \Rightarrow s - s\theta = N\theta - s\theta \Rightarrow s = N\theta$.
$$\boxed{\hat\theta_{MLE} = \frac{s}{N}}$$
The "sensible value" is the fraction of heads. With the binomial form $\binom{N}{s}\theta^s(1-\theta)^{N-s}$ you get the same answer, because $\binom{N}{s}$ does not depend on $\theta$ and disappears when you differentiate the log.

Properties (p68): unbiased, $E[\hat\theta] = \theta$; variance $\theta(1-\theta)/N \to 0$; consistent: $P(|\hat\theta - \theta| \ge \epsilon) \to 0$ as $N \to \infty$ (the slide prints $\infty$ by mistake).
:::

:::formula @prob-categorical-mle C-sided die (categorical), Homework 1 Exercise 2
Roll $N$ times; let $N_k$ = number of times face $k$ appeared ($\sum_k N_k = N$).

1. $L(\boldsymbol\theta) = \prod_{n=1}^{N}\theta_{y_n} = \prod_{k=1}^{C}\theta_k^{N_k}$.
2. $\ell(\boldsymbol\theta) = \sum_k N_k \log\theta_k$, with the constraint $\sum_k\theta_k = 1$.
3. Lagrangian: $\mathcal{L} = \sum_k N_k\log\theta_k + \lambda\left(1 - \sum_k \theta_k\right)$.
4. $\dfrac{\partial\mathcal{L}}{\partial\theta_k} = \dfrac{N_k}{\theta_k} - \lambda = 0 \Rightarrow \theta_k = \dfrac{N_k}{\lambda}$.
5. Constraint: $\sum_k \dfrac{N_k}{\lambda} = 1 \Rightarrow \lambda = N$.
$$\boxed{\hat\theta_k = \frac{N_k}{N}}$$
Again "count and divide": the fraction of rolls that showed face $k$.
:::

:::pitfall
Without the constraint, $\sum_k N_k\log\theta_k$ grows forever as every $\theta_k$ grows, so there is no maximum. The constraint (probabilities sum to 1) is what makes the answer finite. That is why the homework writes $\sum_{k=1}^{C}\theta_k = 1$ under the question.
:::

## The statistical learning framework

**The learner's input** (p52): a **domain set** $\mathcal{X}$ (all possible objects), a **label set** $\mathcal{Y}$ ($\{0,1\}$, $\{-1,+1\}$, classes, or real values), and **training data** $S = \{(x_1, y_1), \dots, (x_m, y_m)\}$.

**The learner's output** (p53): a **prediction rule / hypothesis** $h: \mathcal{X} \to \mathcal{Y}$. Algorithm $A$ applied to $S$ gives $A(S)$.

**Data-generation pipeline** (p54): an unknown distribution $\mathcal{D}$ produces $x_i \sim \mathcal{D}$; an unknown correct labelling function $c$ gives $y_i = c(x_i)$. The learner sees only $S$, never $\mathcal{D}$ or $c$. Each run of the pipeline gives a new $S$.

:::formula @prob-classification-error True error vs training (empirical) error
$$L_{\mathcal{D},c}(h) = \mathbb{P}_{x \sim \mathcal{D}}[h(x) \ne c(x)] \qquad\qquad L_S(h) = \frac{|\{i \in [m] : h(x_i) \ne y_i\}|}{m}$$
:::

:::read
- **True error** (generalisation error): chance of a mistake on a *new random* example. This is what we care about, but we cannot compute it ($\mathcal{D}$ and $c$ are unknown).
- **Training error**: fraction of training examples the rule gets wrong. $[m]$ means $\{1, \dots, m\}$; $|\{\dots\}|$ means "how many".
- **Empirical Risk Minimisation (ERM)**: choose the $h$ with the smallest training error, $h_S$.
:::

**Overfitting vs generalisation** (p57): take two samples $S_1, S_2$ from the same $\mathcal{D}$. If the error on the data we trained on is tiny but the error on fresh data is large, the model **overfits**. If $L_{S_1}(h) \approx L_{S_2}(h)$, it **generalises**.

:::intuition Model complexity curve (p60)
As the model gets more complex, training (empirical) error keeps going **down**. Generalisation error first goes down, then goes **up** again. Left of the minimum: **underfitting**. Right of it: **overfitting**. The best model sits at the bottom of the generalisation curve. (Lecture 7 develops this.)
:::

## Train / validation / test and cross-validation

- **Training set**: fit the model's parameters.
- **Validation set**: choose hyper-parameters / compare models (e.g. the $\lambda$ in ridge regression).
- **Test set** (holdout): touched **once**, at the end, to estimate the true error.

**Cross-validation** (p59), when data is scarce:

| Scheme | How | Models trained | Priority |
|---|---|---|---|
| Hold-out | one split, e.g. 2/3 train, 1/3 validation | 1 | {{priority:prob-validation-counts}} |
| **k-fold** | split into $k$ equal folds; each fold is the validation set once, the other $k-1$ train | $k$ | {{priority:prob-validation-counts}} |
| **LOOCV** (leave-one-out) | $k = m$: each single example is the validation set once | $m$ | {{priority:prob-validation-counts}} |

The cross-validation score is the **average** validation error over the $k$ runs.

:::example
$m = 100$ examples, 5-fold CV: 5 models, each trained on 80 and validated on 20. LOOCV: 100 models, each trained on 99 and validated on 1.
:::

**Workflows** (p61–62). Supervised: raw data → feature extraction → feature matrix + labels → ML algorithm → model → evaluate (loop back) → predict labels for new data. Unsupervised: same, but **no labels**; the output for new data is a **cluster label**.
