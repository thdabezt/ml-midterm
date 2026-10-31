const r = String.raw;

export default {
  lesson: 'l2-general-concepts',
  questions: [
    // ---------- Homework 1 ----------
    {
      id: 'hw01-ex1',
      type: 'written',
      source: { kind: 'hw', label: 'HW01 Exercise 1' },
      prompt: r`Let $X$ be the number of heads in $N$ independent coin tosses, where heads has probability $\theta$ and tails $1 - \theta$. The probability of exactly $s$ heads in $N$ tosses follows a binomial distribution. What is the sensible value of $\theta$? (Hint: use MLE.)`,
      solution: r`**1. Likelihood.** Observing $s$ heads in $N$ tosses has probability
$$L(\theta) = \binom{N}{s}\theta^s(1 - \theta)^{N - s}.$$

**2. Log-likelihood** (log turns the product into a sum; $\binom{N}{s}$ is a constant):
$$\ell(\theta) = \log\binom{N}{s} + s\log\theta + (N - s)\log(1 - \theta).$$

**3. Differentiate and set to zero** (the derivative of $\log(1 - \theta)$ is $-\frac{1}{1-\theta}$, chain rule):
$$\ell'(\theta) = \frac{s}{\theta} - \frac{N - s}{1 - \theta} = 0.$$

**4. Solve.** Multiply both sides by $\theta(1 - \theta)$: $s(1 - \theta) = (N - s)\theta \Rightarrow s - s\theta = N\theta - s\theta \Rightarrow s = N\theta$.
$$\boxed{\hat\theta_{MLE} = \frac{s}{N}}$$

**5. Check it is a maximum:** $\ell''(\theta) = -\frac{s}{\theta^2} - \frac{N - s}{(1 - \theta)^2} < 0$.

So the sensible value is the observed **fraction of heads**. The same result comes from the Bernoulli form of the slides (L2 p66–67), $L(\theta) = \prod_i\theta^{x_i}(1 - \theta)^{1 - x_i}$. Extra facts (p68): $E[\hat\theta] = \theta$ (unbiased), $\mathrm{Var}[\hat\theta] = \theta(1-\theta)/N \to 0$.`,
    },
    {
      id: 'hw01-ex1-v1',
      type: 'numeric',
      source: { kind: 'variant', label: 'like HW01 Ex 1' },
      prompt: r`A coin is tossed $N = 100$ times and lands heads $s = 37$ times. Give the MLE $\hat\theta$ and the variance of the estimator, $\theta(1-\theta)/N$, evaluated at $\hat\theta$.`,
      fields: [
        { label: r`$\hat\theta$`, answer: 0.37, tol: 0.001 },
        { label: r`$\mathrm{Var}[\hat\theta]$`, answer: 0.002331, tol: 0.00002 },
      ],
      solution: r`$\hat\theta = s/N = 37/100 = 0.37$.

$\mathrm{Var} = \frac{0.37 \times 0.63}{100} = \frac{0.2331}{100} = 0.002331$ (standard deviation ≈ 0.048).`,
    },
    {
      id: 'hw01-ex1-v2',
      type: 'numeric',
      source: { kind: 'variant', label: 'like HW01 Ex 1 / L2 p66' },
      prompt: r`The tosses are $D = (1, 0, 1, 1, 0, 1, 1, 1)$ (1 = heads). Find $\hat\theta_{MLE}$ and the maximum log-likelihood $\ell(\hat\theta) = \sum_i\big[x_i\ln\hat\theta + (1 - x_i)\ln(1 - \hat\theta)\big]$ (natural log).`,
      fields: [
        { label: r`$\hat\theta$`, answer: 0.75, tol: 0.001 },
        { label: r`$\ell(\hat\theta)$`, answer: -4.4987, tol: 0.005 },
      ],
      solution: r`$s = 6$ heads, $N = 8$ → $\hat\theta = 6/8 = 0.75$.

$\ell = 6\ln 0.75 + 2\ln 0.25 = 6(-0.2877) + 2(-1.3863) = -1.7261 - 2.7726 = -4.4987$.

Any other $\theta$ gives a smaller (more negative) value, e.g. $\theta = 0.5$: $8\ln 0.5 = -5.545$.`,
    },
    {
      id: 'hw01-ex2',
      type: 'written',
      source: { kind: 'hw', label: 'HW01 Exercise 2' },
      prompt: r`A $C$-sided die is rolled $N$ times. Let $Y_n \in \{1, \dots, C\}$ be the $n$-th outcome, $Y_n \sim \mathrm{Cat}(\theta_1, \dots, \theta_C)$ with $\sum_{k=1}^{C}\theta_k = 1$. Estimate the probabilities $\theta_k$ from the dataset $D = \{y_n : n = 1..N\}$. (Hint: use MLE.)`,
      solution: r`Let $N_k = \sum_n \mathbb{1}[y_n = k]$ be how many times face $k$ appeared, so $\sum_k N_k = N$.

**1. Likelihood.** One roll: $P(y_n) = \theta_{y_n} = \prod_k\theta_k^{\mathbb{1}[y_n = k]}$. All rolls (independent):
$$L(\vec{\theta}) = \prod_{n=1}^{N}\theta_{y_n} = \prod_{k=1}^{C}\theta_k^{N_k}.$$

**2. Log-likelihood:** $\ell(\vec{\theta}) = \sum_{k=1}^{C}N_k\log\theta_k$.

**3. Constraint** $\sum_k\theta_k = 1$ → Lagrangian:
$$\mathcal{L}(\vec{\theta}, \lambda) = \sum_k N_k\log\theta_k + \lambda\Big(1 - \sum_k\theta_k\Big).$$

**4. Derivatives = 0:** $\dfrac{\partial\mathcal{L}}{\partial\theta_k} = \dfrac{N_k}{\theta_k} - \lambda = 0 \Rightarrow \theta_k = \dfrac{N_k}{\lambda}$.

**5. Use the constraint:** $\sum_k\frac{N_k}{\lambda} = \frac{N}{\lambda} = 1 \Rightarrow \lambda = N$.
$$\boxed{\hat\theta_k = \frac{N_k}{N}}$$

The MLE of each face's probability is its **relative frequency**. (Without the constraint the log-likelihood has no maximum, because increasing every $\theta_k$ increases it.)`,
    },
    {
      id: 'hw01-ex2-v1',
      type: 'numeric',
      source: { kind: 'variant', label: 'like HW01 Ex 2' },
      prompt: r`A 6-sided die is rolled 30 times. Faces 1–6 appear $(4, 6, 5, 3, 7, 5)$ times. Give the MLE of $\theta_3$ and $\theta_5$.`,
      fields: [
        { label: r`$\hat\theta_3$`, answer: 5 / 30, tol: 0.002 },
        { label: r`$\hat\theta_5$`, answer: 7 / 30, tol: 0.002 },
      ],
      solution: r`$\hat\theta_k = N_k / N$ with $N = 30$: $\hat\theta_3 = 5/30 = 0.1667$, $\hat\theta_5 = 7/30 = 0.2333$. Check: the six estimates add up to $30/30 = 1$.`,
    },
    // ---------- slide quizzes ----------
    {
      id: 'l2-quiz-p10',
      type: 'numeric',
      source: { kind: 'quiz', label: 'L2 p10 quiz' },
      prompt: r`(a) Toss a coin twice; $X$ = number of heads. How many values can $X$ take? (b) Roll two dice; $X$ = sum. How many values can $X$ take?`,
      fields: [
        { label: '(a) values', answer: 3, tol: 0.01 },
        { label: '(b) values', answer: 11, tol: 0.01 },
      ],
      solution: r`(a) $X \in \{0, 1, 2\}$: 3 values. (b) $X \in \{2, 3, \dots, 12\}$: 11 values. Both are **discrete** random variables.`,
    },
    {
      id: 'l2-quiz-dice',
      type: 'numeric',
      source: { kind: 'quiz', label: 'L2 p48 Quiz 1' },
      prompt: r`What is the probability that the total of two dice is greater than 9, given that the first die is a 5?`,
      fields: [{ label: 'probability', answer: 1 / 3, tol: 0.002 }],
      solution: r`Given first = 5, the total is $5 + d_2 > 9 \iff d_2 > 4 \iff d_2 \in \{5, 6\}$: 2 of the 6 equally likely values.
$$P = \frac{2}{6} = \frac13 \approx 0.333$$
Formula view: $P(T > 9 \mid F = 5) = \frac{P(T > 9, F = 5)}{P(F = 5)} = \frac{2/36}{6/36} = \frac13$.`,
    },
    {
      id: 'l2-quiz-dice-v1',
      type: 'numeric',
      source: { kind: 'variant', label: 'like L2 p48 Quiz 1' },
      prompt: r`Two fair dice are rolled. Given that **at least one** die shows a 6, what is the probability that the total is 7?`,
      fields: [{ label: 'probability', answer: 2 / 11, tol: 0.002 }],
      solution: r`Restrict to the condition: outcomes with at least one 6 are $(6, 1..6)$ and $(1..5, 6)$: $6 + 5 = 11$ outcomes (do not count $(6,6)$ twice).

Among them, total 7: $(6, 1)$ and $(1, 6)$ → 2 outcomes.
$$P = \frac{2}{11} \approx 0.182$$`,
    },
    {
      id: 'l2-quiz-trousers',
      type: 'numeric',
      source: { kind: 'quiz', label: 'L2 p48 Quiz 2' },
      prompt: r`A school has 60% boys and 40% girls. Girls wear trousers or skirts in equal numbers; all boys wear trousers. An observer sees a random student wearing trousers. What is the probability that the student is a girl?`,
      fields: [{ label: 'P(girl | trousers)', answer: 0.25, tol: 0.002 }],
      solution: r`Bayes' rule.
1. $P(T \mid G) = 0.5$, $P(G) = 0.4$; $P(T \mid B) = 1$, $P(B) = 0.6$.
2. Sum rule: $P(T) = 1 \cdot 0.6 + 0.5 \cdot 0.4 = 0.8$.
3. $P(G \mid T) = \dfrac{P(T \mid G)P(G)}{P(T)} = \dfrac{0.2}{0.8} = 0.25$.

Counting check with 100 students: 60 boys in trousers + 20 girls in trousers = 80 in trousers, of which 20 are girls → $20/80$.`,
    },
    {
      id: 'l2-bayes-v1',
      type: 'numeric',
      source: { kind: 'variant', label: 'like L2 p48 Quiz 2' },
      prompt: r`Machine A makes 60% of a factory's items with a 2% defect rate; machine B makes the other 40% with a 5% defect rate. An item is defective. What is the probability it came from machine A?`,
      fields: [{ label: 'P(A | defective)', answer: 0.375, tol: 0.002 }],
      solution: r`- $P(D, A) = 0.02 \times 0.6 = 0.012$; $P(D, B) = 0.05 \times 0.4 = 0.020$.
- $P(D) = 0.012 + 0.020 = 0.032$.
- $P(A \mid D) = 0.012 / 0.032 = 0.375$.

Even though A makes most items, B is the more likely source of a defect.`,
    },
    {
      id: 'l2-quiz-rain',
      type: 'mcq',
      source: { kind: 'quiz', label: 'L2 p49 Quiz 3' },
      prompt: r`We want to predict whether the next day is Rain or Sunny. Which distribution models the target?`,
      options: ['Gaussian', 'Bernoulli', 'Exponential', 'Uniform over the real line'],
      answer: 1,
      solution: r`Two possible outcomes → **Bernoulli** with parameter $\lambda = P(\text{Rain})$: $P(x) = \lambda^x(1-\lambda)^{1-x}$.`,
    },
    {
      id: 'l2-quiz-gpa',
      type: 'mcq',
      source: { kind: 'quiz', label: 'L2 p49 Quiz 4' },
      prompt: r`We want to model the GPA of a UET student. Which distribution is the most natural choice?`,
      options: ['Bernoulli', 'Categorical', 'Gaussian (normal)', 'Binomial'],
      answer: 2,
      solution: r`GPA is a **continuous** score that clusters around an average, like exam scores and IQ on L2 p39 → Gaussian $\mathcal{N}(\mu, \sigma^2)$. (Strictly it is bounded, e.g. 0–4, but the normal is the standard model.)`,
    },
    {
      id: 'l2-quiz-kl',
      type: 'mcq',
      source: { kind: 'quiz', label: 'L2 p49 Quiz 5' },
      prompt: r`What happens to $D_{KL}(P \,\|\, Q)$ if the supports of $P$ and $Q$ do not overlap?`,
      options: ['It equals 0', 'It equals 1', 'It becomes infinite', 'It becomes negative'],
      answer: 2,
      solution: r`$D_{KL}(P\|Q) = \sum_x P(x)\log\frac{P(x)}{Q(x)}$. Where $P(x) > 0$ but $Q(x) = 0$, the ratio is $P(x)/0$ and the log is $+\infty$. So the KL divergence is **infinite**. (This is one reason other distances, like the Wasserstein distance, are used for non-overlapping distributions.)`,
    },
    // ---------- expectation, variance, distributions ----------
    {
      id: 'l2-ev',
      type: 'numeric',
      source: { kind: 'slide', label: 'L2 p18–20' },
      prompt: r`$X$ takes values 0, 1, 2 with probabilities 0.2, 0.5, 0.3. Compute $E[X]$, $E[X^2]$ and $\mathrm{Var}[X]$.`,
      fields: [
        { label: r`$E[X]$`, answer: 1.1, tol: 0.001 },
        { label: r`$E[X^2]$`, answer: 1.7, tol: 0.001 },
        { label: r`$\mathrm{Var}[X]$`, answer: 0.49, tol: 0.001 },
      ],
      solution: r`- $E[X] = 0(0.2) + 1(0.5) + 2(0.3) = 1.1$.
- $E[X^2] = 0(0.2) + 1(0.5) + 4(0.3) = 1.7$.
- $\mathrm{Var}[X] = E[X^2] - E[X]^2 = 1.7 - 1.21 = 0.49$.`,
    },
    {
      id: 'l2-var-props',
      type: 'numeric',
      source: { kind: 'slide', label: 'L2 p19, p21' },
      prompt: r`$E[X] = 5$ and $\mathrm{Var}[X] = 4$. Compute $E[3X + 2]$ and $\mathrm{Var}[3X + 2]$.`,
      fields: [
        { label: r`$E[3X+2]$`, answer: 17, tol: 0.001 },
        { label: r`$\mathrm{Var}[3X+2]$`, answer: 36, tol: 0.001 },
      ],
      solution: r`- $E[3X + 2] = 3E[X] + 2 = 17$.
- $\mathrm{Var}[3X + 2] = 3^2\,\mathrm{Var}[X] = 9 \times 4 = 36$: the constant is squared, and adding 2 changes nothing.`,
    },
    {
      id: 'l2-binomial',
      type: 'numeric',
      source: { kind: 'slide', label: 'L2 p34–35' },
      prompt: r`A biased coin has $P(\text{head}) = 0.3$. In 5 tosses, what is the probability of exactly 2 heads? What is the expected number of heads?`,
      fields: [
        { label: 'P(X = 2)', answer: 0.3087, tol: 0.001 },
        { label: 'E[X]', answer: 1.5, tol: 0.001 },
      ],
      solution: r`Binomial with $n = 5$, $p = 0.3$:
$$P(X = 2) = \binom{5}{2}0.3^2\,0.7^3 = 10 \times 0.09 \times 0.343 = 0.3087.$$
$E[X] = np = 1.5$.`,
    },
    {
      id: 'l2-joint',
      type: 'numeric',
      source: { kind: 'slide', label: 'L2 p22–27' },
      prompt: r`Joint distribution: $p(x{=}0, y{=}0) = 0.1$, $p(0, 1) = 0.3$, $p(1, 0) = 0.2$, $p(1, 1) = 0.4$. Compute the marginal $p(x = 1)$, the conditional $p(y = 1 \mid x = 1)$, and the product $p(x = 1)\,p(y = 1)$.`,
      fields: [
        { label: r`$p(x=1)$`, answer: 0.6, tol: 0.001 },
        { label: r`$p(y=1 \mid x=1)$`, answer: 2 / 3, tol: 0.002 },
        { label: r`$p(x=1)p(y=1)$`, answer: 0.42, tol: 0.001 },
      ],
      solution: r`- Sum rule: $p(x = 1) = 0.2 + 0.4 = 0.6$; $p(y = 1) = 0.3 + 0.4 = 0.7$.
- Conditional: $p(y = 1 \mid x = 1) = \frac{0.4}{0.6} = 0.667$.
- $p(x = 1)p(y = 1) = 0.42 \ne p(1, 1) = 0.4$, so $x$ and $y$ are **not independent** (also $p(y{=}1 \mid x{=}1) = 0.667 \ne p(y{=}1) = 0.7$).`,
    },
    {
      id: 'l2-cdf',
      type: 'numeric',
      source: { kind: 'slide', label: 'L2 p15, p41' },
      prompt: r`$X \sim \mathrm{Exp}(\lambda = 0.5)$, whose CDF is $F(x) = 1 - e^{-0.5x}$ for $x \ge 0$. Compute $P(1 < X \le 3)$.`,
      fields: [{ label: 'probability', answer: 0.3834, tol: 0.002 }],
      solution: r`$P(a < X \le b) = F(b) - F(a) = (1 - e^{-1.5}) - (1 - e^{-0.5}) = e^{-0.5} - e^{-1.5} = 0.6065 - 0.2231 = 0.3834$.`,
    },
    {
      id: 'l2-density',
      type: 'mcq',
      source: { kind: 'slide', label: 'L2 p14, p38' },
      prompt: r`The density of $\mathcal{N}(0, 0.04)$ at $x = 0$ is $\frac{1}{\sqrt{2\pi\cdot0.04}} \approx 1.995$. Which statement is true?`,
      options: [
        'This is impossible, a probability cannot exceed 1',
        'It is fine: a density can exceed 1; only the total area under it must equal 1',
        'It means P(X = 0) = 1.995',
        'The variance must be wrong',
      ],
      answer: 1,
      solution: r`For a continuous RV, $f(x)$ is a **density**, not a probability. Probabilities are areas $\int_a^b f(x)\,dx$, and $P(X = 0) = 0$. A narrow Gaussian ($\sigma = 0.2$) is tall: its peak is about 1.995, while the total area is still 1.`,
    },
    // ---------- information measures ----------
    {
      id: 'l2-entropy',
      type: 'numeric',
      source: { kind: 'slide', label: 'L2 p44' },
      prompt: r`A random variable takes 4 values with probabilities $(0.5, 0.25, 0.125, 0.125)$. Compute its entropy in bits.`,
      fields: [{ label: 'H(X)', answer: 1.75, tol: 0.002 }],
      solution: r`$H = -\sum p\log_2 p = 0.5(1) + 0.25(2) + 0.125(3) + 0.125(3) = 0.5 + 0.5 + 0.375 + 0.375 = 1.75$ bits.

(Each $-\log_2 p$: $-\log_2 0.5 = 1$, $-\log_2 0.25 = 2$, $-\log_2 0.125 = 3$.) A uniform distribution over 4 values would give the maximum, $\log_2 4 = 2$ bits.`,
    },
    {
      id: 'l2-kl',
      type: 'numeric',
      source: { kind: 'slide', label: 'L2 p46–47' },
      prompt: r`$P = (0.5, 0.5)$ is the true distribution and $Q = (0.75, 0.25)$ is a model. Using $\log_2$, compute the cross-entropy $H(P, Q)$ and the KL divergence $D_{KL}(P\|Q)$.`,
      fields: [
        { label: r`$H(P,Q)$`, answer: 1.2075, tol: 0.003 },
        { label: r`$D_{KL}(P\|Q)$`, answer: 0.2075, tol: 0.003 },
      ],
      solution: r`- $H(P, Q) = -[0.5\log_2 0.75 + 0.5\log_2 0.25] = -[0.5(-0.415) + 0.5(-2)] = 0.2075 + 1 = 1.2075$.
- $H(P) = 1$ (fair coin).
- $D_{KL}(P\|Q) = H(P, Q) - H(P) = 0.2075$ bits.

Direct formula: $0.5\log_2\frac{0.5}{0.75} + 0.5\log_2\frac{0.5}{0.25} = 0.5(-0.585) + 0.5(1) = 0.2075$ ✓.`,
    },
    {
      id: 'l2-kl-props',
      type: 'mcq',
      source: { kind: 'slide', label: 'L2 p46–47' },
      prompt: r`Which statement about the KL divergence is **false**?`,
      options: [
        r`$D_{KL}(P\|Q) \ge 0$`,
        r`$D_{KL}(P\|Q) = 0$ exactly when $P = Q$`,
        r`$D_{KL}(P\|Q) = D_{KL}(Q\|P)$ for all $P, Q$`,
        r`$D_{KL}(P\|Q) = H(P, Q) - H(P)$`,
      ],
      answer: 2,
      solution: r`KL is **not symmetric**. Example from the previous question: $D_{KL}(P\|Q) = 0.2075$ but $D_{KL}(Q\|P) = 0.75\log_2 1.5 + 0.25\log_2 0.5 = 0.1887$.`,
    },
    {
      id: 'l2-entropy-max',
      type: 'mcq',
      source: { kind: 'slide', label: 'L2 p44' },
      prompt: r`Which distribution over 3 outcomes has the **highest** entropy?`,
      options: ['(1, 0, 0)', '(0.5, 0.5, 0)', '(1/3, 1/3, 1/3)', '(0.6, 0.3, 0.1)'],
      answer: 2,
      solution: r`Entropy measures uncertainty and is largest when all outcomes are equally likely: $\log_2 3 = 1.585$ bits. $(1, 0, 0)$ has entropy 0 (no uncertainty); $(0.5, 0.5, 0)$ has 1 bit; $(0.6, 0.3, 0.1)$ has 1.295 bits.`,
    },
    {
      id: 'l2-mi',
      type: 'mcq',
      source: { kind: 'slide', label: 'L2 p45' },
      prompt: r`The mutual information $I(X; Y) = 0$. What can you conclude?`,
      options: ['X and Y are independent', 'X = Y', 'H(X) = 0', 'H(X | Y) = 0'],
      answer: 0,
      solution: r`$I(X; Y) = H(X) - H(X \mid Y)$: knowing $Y$ removes no uncertainty about $X$, which happens exactly when they are **independent**. ($H(X \mid Y) = 0$ would mean $Y$ determines $X$, the opposite extreme.)`,
    },
    {
      id: 'l2-bayes-names',
      type: 'mcq',
      source: { kind: 'slide', label: 'L2 p26' },
      prompt: r`In $p(\theta \mid X) \propto p(X \mid \theta)\,p(\theta)$, the three terms are respectively:`,
      options: ['prior, likelihood, posterior', 'posterior, likelihood, prior', 'likelihood, posterior, prior', 'posterior, prior, likelihood'],
      answer: 1,
      solution: r`$p(\theta \mid X)$ = **posterior** (belief after seeing data), $p(X \mid \theta)$ = **likelihood**, $p(\theta)$ = **prior**.`,
    },
    // ---------- learning theory ----------
    {
      id: 'l2-true-vs-train',
      type: 'mcq',
      source: { kind: 'slide', label: 'L2 p55–56' },
      prompt: r`Which quantity can the learning algorithm actually compute?`,
      options: [
        r`The true error $L_{\mathcal{D},c}(h) = \mathbb{P}_{x\sim\mathcal{D}}[h(x) \ne c(x)]$`,
        r`The training error $L_S(h) = |\{i : h(x_i) \ne y_i\}| / m$`,
        r`The data distribution $\mathcal{D}$`,
        r`The labelling function $c$`,
      ],
      answer: 1,
      solution: r`The learner only sees the sample $S$. $\mathcal{D}$ and $c$ are unknown, so the true error cannot be computed; Empirical Risk Minimisation minimises the **training error** $L_S(h)$ instead.`,
    },
    {
      id: 'l2-overfit',
      type: 'mcq',
      source: { kind: 'slide', label: 'L2 p57, p60' },
      prompt: r`A classifier has 1% error on the data it was trained on and 35% error on a fresh sample from the same distribution. This is:`,
      options: ['Underfitting', 'Overfitting', 'Good generalisation', 'A data-generation error'],
      answer: 1,
      solution: r`Tiny training error but large error on new data = **overfitting**. Generalisation means the two errors are similar ($L_{S_1}(h) \approx L_{S_2}(h)$).`,
    },
    {
      id: 'l2-cv',
      type: 'numeric',
      source: { kind: 'slide', label: 'L2 p59' },
      prompt: r`A dataset has 200 examples. With 10-fold cross-validation, how many models are trained and how many examples is each trained on? With leave-one-out (LOOCV), how many models are trained?`,
      fields: [
        { label: 'models (10-fold)', answer: 10, tol: 0.01 },
        { label: 'training size each', answer: 180, tol: 0.01 },
        { label: 'models (LOOCV)', answer: 200, tol: 0.01 },
      ],
      solution: r`10-fold: 10 folds of 20; each model trains on the other 9 folds = 180 examples and is validated on 20. LOOCV: one model per example = 200 models, each trained on 199.`,
    },
    {
      id: 'l2-validation',
      type: 'mcq',
      source: { kind: 'slide', label: 'L2 p58' },
      prompt: r`What is the validation set used for?`,
      options: [
        'Fitting the model parameters',
        'Choosing hyper-parameters and comparing models, without touching the test set',
        'Reporting the final performance',
        'Replacing the training set when it is too small',
      ],
      answer: 1,
      solution: r`Training set → fit parameters. **Validation set → choose hyper-parameters / model.** Test set → a final, untouched estimate of the true error.`,
    },
  ],
};
