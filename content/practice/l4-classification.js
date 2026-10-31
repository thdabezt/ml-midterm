const r = String.raw;

const BADMINTON = r`| Day | Outlook | Temperature | Humidity | Wind | Play |
|---|---|---|---|---|---|
| 1 | Sunny | High | High | No | No |
| 2 | Sunny | High | High | Yes | No |
| 3 | Overcast | High | High | No | Yes |
| 4 | Rainy | Medium | High | No | Yes |
| 5 | Rainy | Low | Low | No | Yes |
| 6 | Rainy | Low | Low | Yes | No |
| 7 | Overcast | Low | Low | Yes | Yes |
| 8 | Sunny | Medium | High | No | No |
| 9 | Sunny | Low | Low | No | Yes |
| 10 | Rainy | Medium | High | Yes | Yes |`;

const TENNIS = r`| Day | Outlook | Temp | Humidity | Wind | Play |
|---|---|---|---|---|---|
| 1 | Sunny | Hot | High | Weak | No |
| 2 | Sunny | Hot | High | Strong | No |
| 3 | Overcast | Hot | High | Weak | Yes |
| 4 | Rain | Mild | High | Weak | Yes |
| 5 | Rain | Cool | Normal | Weak | Yes |
| 6 | Rain | Cool | Normal | Strong | No |
| 7 | Overcast | Cool | Normal | Strong | Yes |
| 8 | Sunny | Mild | High | Weak | No |
| 9 | Sunny | Cool | Normal | Weak | Yes |
| 10 | Rain | Mild | Normal | Weak | Yes |
| 11 | Sunny | Mild | Normal | Strong | Yes |
| 12 | Overcast | Mild | High | Strong | Yes |
| 13 | Overcast | Hot | Normal | Weak | Yes |
| 14 | Rain | Mild | High | Strong | No |`;

const PLAY_FIELD = { label: 'Play? (1 = Yes, 0 = No)', tol: 0.01 };

export default {
  lesson: 'l4-classification',
  questions: [
    // ---------- Homework 4 Exercise 2: Naive Bayes ----------
    {
      id: 'hw04-ex2',
      type: 'numeric',
      source: { kind: 'hw', label: 'HW04 Exercise 2', note: 'Exercise 1 in the shorter HW4 (1).pdf' },
      prompt: r`A Naive Bayes system decides whether the weather suits badminton, from 10 days of data:

${BADMINTON}

A new day is **Outlook = Overcast, Temperature = Medium, Humidity = High, Wind = No**. Using Naive Bayes with maximum-likelihood estimates, compute the (unnormalised) score of each class and decide.`,
      fields: [
        { label: r`$P(\text{Yes})\prod P(x_j \mid \text{Yes})$`, answer: 0.022222, tol: 0.0003 },
        { label: r`$P(\text{No})\prod P(x_j \mid \text{No})$`, answer: 0, tol: 0.0001 },
        { ...PLAY_FIELD, answer: 1 },
      ],
      solution: r`**Priors:** Yes on days 3, 4, 5, 7, 9, 10 → 6 days; No on days 1, 2, 6, 8 → 4 days. $P(\text{Yes}) = 6/10$, $P(\text{No}) = 4/10$.

**Conditional probabilities** (count inside each class; the denominator is the class size, 6 or 4):

| Feature value | $P(\cdot \mid \text{Yes})$ | $P(\cdot \mid \text{No})$ |
|---|---|---|
| Outlook = Overcast | 2/6 (days 3, 7) | **0/4** |
| Temperature = Medium | 2/6 (days 4, 10) | 1/4 (day 8) |
| Humidity = High | 3/6 (days 3, 4, 10) | 3/4 (days 1, 2, 8) |
| Wind = No | 4/6 (days 3, 4, 5, 9) | 2/4 (days 1, 8) |

**Scores:**
- Yes: $\frac{6}{10}\cdot\frac26\cdot\frac26\cdot\frac36\cdot\frac46 = 0.6\cdot\frac{48}{1296} = 0.0222$.
- No: $\frac{4}{10}\cdot\frac04\cdot\frac14\cdot\frac34\cdot\frac24 = 0$.

$0.0222 > 0$ → **Yes, the day is suitable for badminton.** Normalised: $P(\text{Yes} \mid \vec{x}) = 1$.

**Remark.** The No score is exactly 0 only because "Overcast" never occurred on a No day (an MLE zero count). With Laplace smoothing ($+1$ to each count, $+$number of values to each denominator) the scores are Yes $= 0.6\cdot\frac38\cdot\frac39\cdot\frac48\cdot\frac58 = 0.0208$ and No $= 0.4\cdot\frac17\cdot\frac27\cdot\frac46\cdot\frac36 = 0.0054$: still **Yes**, now with $P(\text{Yes} \mid \vec{x}) = 0.79$.`,
    },
    {
      id: 'hw04-ex2-laplace',
      type: 'numeric',
      source: { kind: 'variant', label: 'like HW04 Ex 2 (smoothed)' },
      prompt: r`Same badminton data and the same new day (Overcast, Medium, High, Wind = No), but use **Laplace (add-one) smoothing** for the conditional probabilities: $P(v \mid c) = \frac{\text{count}(v, c) + 1}{\text{count}(c) + K}$, where $K$ is the number of possible values of that feature (Outlook 3, Temperature 3, Humidity 2, Wind 2). Priors stay unsmoothed.

${BADMINTON}`,
      fields: [
        { label: 'score Yes', answer: 0.020833, tol: 0.0003 },
        { label: 'score No', answer: 0.005442, tol: 0.0002 },
        { label: 'P(Yes | x) after normalising', answer: 0.7929, tol: 0.003 },
      ],
      solution: r`Yes (6 days): Overcast $\frac{2+1}{6+3} = \frac39$, Medium $\frac{2+1}{6+3} = \frac39$, High humidity $\frac{3+1}{6+2} = \frac48$, Wind No $\frac{4+1}{6+2} = \frac58$.
Score $= 0.6\cdot\frac39\cdot\frac39\cdot\frac48\cdot\frac58 = 0.6\cdot0.0347 = 0.02083$.

No (4 days): Overcast $\frac{0+1}{4+3} = \frac17$, Medium $\frac{1+1}{4+3} = \frac27$, High $\frac{3+1}{4+2} = \frac46$, Wind No $\frac{2+1}{4+2} = \frac36$.
Score $= 0.4\cdot\frac17\cdot\frac27\cdot\frac46\cdot\frac36 = 0.005442$.

$P(\text{Yes} \mid \vec{x}) = \frac{0.02083}{0.02083 + 0.00544} = 0.793$ → Yes.`,
    },
    {
      id: 'hw04-ex2-v1',
      type: 'numeric',
      source: { kind: 'variant', label: 'like HW04 Ex 2' },
      prompt: r`Same badminton data. Classify the day **Outlook = Sunny, Temperature = Low, Humidity = Low, Wind = Yes** with Naive Bayes (MLE, no smoothing).

${BADMINTON}`,
      fields: [
        { label: 'score Yes', answer: 0.008333, tol: 0.0002 },
        { label: 'score No', answer: 0.009375, tol: 0.0002 },
        { ...PLAY_FIELD, answer: 0 },
      ],
      solution: r`Yes (6 days: 3, 4, 5, 7, 9, 10): Sunny 1/6 (day 9), Low temp 3/6 (5, 7, 9), Low humidity 3/6 (5, 7, 9), Wind Yes 2/6 (7, 10).
Score $= 0.6\cdot\frac16\cdot\frac36\cdot\frac36\cdot\frac26 = 0.6\cdot\frac{18}{1296} = 0.00833$.

No (4 days: 1, 2, 6, 8): Sunny 3/4 (1, 2, 8), Low temp 1/4 (6), Low humidity 1/4 (6), Wind Yes 2/4 (2, 6).
Score $= 0.4\cdot\frac34\cdot\frac14\cdot\frac14\cdot\frac24 = 0.4\cdot\frac{6}{256} = 0.009375$.

$0.009375 > 0.00833$ → **No** (close call: $P(\text{No} \mid \vec{x}) = 0.53$).`,
    },
    {
      id: 'hw04-ex2-v2',
      type: 'numeric',
      source: { kind: 'variant', label: 'like HW04 Ex 2' },
      prompt: r`Same badminton data. Classify **Outlook = Rainy, Temperature = High, Humidity = High, Wind = No** (MLE, no smoothing).

${BADMINTON}`,
      fields: [
        { label: 'score Yes', answer: 0.016667, tol: 0.0003 },
        { label: 'score No', answer: 0.01875, tol: 0.0003 },
        { ...PLAY_FIELD, answer: 0 },
      ],
      solution: r`Yes: Rainy 3/6 (4, 5, 10), High temp 1/6 (3), High humidity 3/6 (3, 4, 10), Wind No 4/6 (3, 4, 5, 9).
Score $= 0.6\cdot\frac36\cdot\frac16\cdot\frac36\cdot\frac46 = 0.6\cdot\frac{36}{1296} = 0.01667$.

No: Rainy 1/4 (6), High temp 2/4 (1, 2), High humidity 3/4 (1, 2, 8), Wind No 2/4 (1, 8).
Score $= 0.4\cdot\frac14\cdot\frac24\cdot\frac34\cdot\frac24 = 0.4\cdot\frac{12}{256} = 0.01875$.

→ **No**.`,
    },
    // ---------- Play Tennis slides ----------
    {
      id: 'l4-quiz-p27',
      type: 'numeric',
      source: { kind: 'quiz', label: 'L4 p27 & p29' },
      prompt: r`Based on the table, classify $\vec{x}$ = (Outlook = Sunny, Temp = Cool, Humidity = High, Wind = Strong) with Naive Bayes.

${TENNIS}`,
      fields: [
        { label: 'score Yes', answer: 0.005291, tol: 0.0002 },
        { label: 'score No', answer: 0.020571, tol: 0.0003 },
        { ...PLAY_FIELD, answer: 0 },
      ],
      solution: r`9 Yes days, 5 No days.

| | Yes | No |
|---|---|---|
| prior | 9/14 | 5/14 |
| Sunny | 2/9 | 3/5 |
| Cool | 3/9 | 1/5 |
| High | 3/9 | 4/5 |
| Strong | 3/9 | 3/5 |

Yes: $\frac{9}{14}\cdot\frac29\cdot\frac39\cdot\frac39\cdot\frac39 = 0.0053$. No: $\frac{5}{14}\cdot\frac35\cdot\frac15\cdot\frac45\cdot\frac35 = 0.0206$.

→ **PlayTennis = No** (the slide's answer, p29).`,
    },
    {
      id: 'l4-quiz-p28',
      type: 'numeric',
      source: { kind: 'quiz', label: 'L4 p28' },
      prompt: r`Based on the same table, classify $\vec{x}$ = (Outlook = Overcast, Temp = Hot, Humidity = High, Wind = Weak). (The slides ask this but do not solve it.)

${TENNIS}`,
      fields: [
        { label: 'score Yes', answer: 0.014109, tol: 0.0003 },
        { label: 'score No', answer: 0, tol: 0.0001 },
        { ...PLAY_FIELD, answer: 1 },
      ],
      solution: r`Yes (9 days): Overcast 4/9 (3, 7, 12, 13), Hot 2/9 (3, 13), High 3/9 (3, 4, 12), Weak 6/9 (3, 4, 5, 9, 10, 13).
Score $= \frac{9}{14}\cdot\frac49\cdot\frac29\cdot\frac39\cdot\frac69 = 0.6429\cdot\frac{144}{6561} = 0.0141$.

No (5 days): Overcast **0/5** → score $= 0$.

→ **PlayTennis = Yes**. Overcast days were always "Yes" in the data, so MLE Naive Bayes is certain.`,
    },
    {
      id: 'l4-tennis-v1',
      type: 'numeric',
      source: { kind: 'variant', label: 'like L4 p27' },
      prompt: r`Same Play Tennis table. Classify (Outlook = Rain, Temp = Mild, Humidity = Normal, Wind = Weak).

${TENNIS}`,
      fields: [
        { label: 'score Yes', answer: 0.042328, tol: 0.0004 },
        { label: 'score No', answer: 0.004571, tol: 0.0002 },
        { ...PLAY_FIELD, answer: 1 },
      ],
      solution: r`Yes: Rain 3/9 (4, 5, 10), Mild 4/9 (4, 10, 11, 12), Normal 6/9 (5, 7, 9, 10, 11, 13), Weak 6/9.
Score $= \frac{9}{14}\cdot\frac39\cdot\frac49\cdot\frac69\cdot\frac69 = 0.0423$.

No: Rain 2/5 (6, 14), Mild 2/5 (8, 14), Normal 1/5 (6), Weak 2/5 (1, 8).
Score $= \frac{5}{14}\cdot\frac25\cdot\frac25\cdot\frac15\cdot\frac25 = 0.00457$.

→ **Yes** ($P(\text{Yes} \mid \vec{x}) = 0.90$).`,
    },
    // ---------- Homework 4 Exercise 3: logistic regression ----------
    {
      id: 'hw04-ex3',
      type: 'written',
      source: { kind: 'hw', label: 'HW04 Exercise 3', note: 'Exercise 2 in HW4 (1).pdf' },
      prompt: r`Predict whether a student passes an exam from hours of study:

| Study hours | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| Pass (1 = yes) | 0 | 0 | 0 | 1 | 1 | 1 | 1 | 1 | 1 | 1 |

Using logistic regression, predict the probability that a student who studies **5 hours** passes.`,
      solution: r`**Model.** $P(\text{pass} \mid x) = \sigma(w_0 + w_1x) = \dfrac{1}{1 + e^{-(w_0 + w_1x)}}$, trained by maximum likelihood, i.e. minimising the cross-entropy
$$\mathcal{L}(\vec{w}) = -\sum_{i=1}^{10}\big[y_i\ln p_i + (1 - y_i)\ln(1 - p_i)\big],\qquad p_i = \sigma(w_0 + w_1x_i).$$
There is no closed form (L4 p40), so use gradient descent: $\nabla\mathcal{L} = \sum_i(p_i - y_i)\,(1, x_i)^T$, $\vec{w} := \vec{w} - \eta\nabla\mathcal{L}$.

**First step by hand** ($\vec{w} = 0$, all $p_i = 0.5$, averaged gradient, $\eta = 0.1$): $p_i - y_i = 0.5$ for 3 fails and $-0.5$ for 7 passes.
- $g_0 = \frac{1}{10}(3\cdot0.5 - 7\cdot0.5) = -0.2$
- $g_1 = \frac{1}{10}\big(0.5(1+2+3) - 0.5(4+\dots+10)\big) = \frac{1}{10}(3 - 24.5) = -2.15$
- $w_0 = 0.02$, $w_1 = 0.215$; already $P(\text{pass} \mid 5) = \sigma(1.095) = 0.75$.

**Important observation: the data is perfectly separable.** Every student with ≤ 3 hours failed and every student with ≥ 4 hours passed. The likelihood can always be increased by making the sigmoid steeper around $x = 3.5$, so the MLE weights grow without bound (L4 p39–40: the loss keeps decreasing). Gradient descent gives, for example:

| Iterations ($\eta = 0.1$) | $w_0$ | $w_1$ | $P(\text{pass} \mid 5)$ |
|---|---|---|---|
| 1 | 0.02 | 0.215 | 0.75 |
| 1,000 | −4.63 | 1.42 | 0.92 |
| 10,000 | −11.95 | 3.46 | 0.995 |

The boundary $-w_0/w_1$ moves towards 3.5 hours (3.26 after 1,000 iterations, 3.45 after 10,000), and $P(\text{pass} \mid 5) \to 1$.

**Answer.** A student who studies 5 hours is predicted to **pass with high probability**: about **0.85** with standard L2-regularised logistic regression (scikit-learn defaults give $w_0 = -4.03$, $w_1 = 1.16$, so $P = \sigma(1.77) = 0.854$), approaching 1 for unregularised MLE. State the method you used (iterations or regularisation), because on separable data the exact number depends on it.`,
    },
    {
      id: 'hw04-ex3-v1',
      type: 'numeric',
      source: { kind: 'variant', label: 'like HW04 Ex 3' },
      prompt: r`A logistic regression trained on the study-hours data gives $w_0 = -4.03$, $w_1 = 1.16$, so $P(\text{pass} \mid x) = \sigma(w_0 + w_1x)$. Compute $P(\text{pass})$ for 5 hours and for 2 hours, and the number of hours where the probability is exactly 0.5.`,
      fields: [
        { label: 'P(pass | 5 h)', answer: 0.8545, tol: 0.003 },
        { label: 'P(pass | 2 h)', answer: 0.1532, tol: 0.003 },
        { label: 'boundary (hours)', answer: 4.03 / 1.16, tol: 0.01 },
      ],
      solution: r`- 5 h: $z = -4.03 + 5.80 = 1.77$, $P = \frac{1}{1 + e^{-1.77}} = \frac{1}{1.1703} = 0.854$.
- 2 h: $z = -4.03 + 2.32 = -1.71$, $P = \frac{1}{1 + e^{1.71}} = \frac{1}{6.529} = 0.153$.
- $P = 0.5 \iff z = 0 \iff x = 4.03/1.16 = 3.47$ hours.`,
    },
    {
      id: 'l4-lr-v2',
      type: 'numeric',
      source: { kind: 'variant', label: 'like HW04 Ex 3' },
      prompt: r`A model $P(y = 1 \mid x) = \sigma(-3 + 0.8x)$ is used. Compute $P(y = 1)$ at $x = 5$ and $x = 2$, and the decision boundary.`,
      fields: [
        { label: 'P at x = 5', answer: 0.7311, tol: 0.003 },
        { label: 'P at x = 2', answer: 0.1978, tol: 0.003 },
        { label: 'boundary x', answer: 3.75, tol: 0.01 },
      ],
      solution: r`- $x = 5$: $z = 1$, $\sigma(1) = 1/(1 + 0.3679) = 0.731$.
- $x = 2$: $z = -1.4$, $\sigma(-1.4) = 1/(1 + 4.055) = 0.198$.
- Boundary: $-3 + 0.8x = 0 \Rightarrow x = 3.75$. Predict class 1 for $x > 3.75$.`,
    },
    {
      id: 'l4-heart',
      type: 'numeric',
      source: { kind: 'slide', label: 'L4 p41–42' },
      prompt: r`The heart-disease model on the slides is $p(y = 1 \mid x) = \sigma(w_1x + w_0)$ with $w_1 = 0.58$, $w_0 = -3.34$ ($x$ = age group 1..8). Compute the probability of heart disease for age groups 5 and 6.`,
      fields: [
        { label: 'group 5', answer: 0.3917, tol: 0.003 },
        { label: 'group 6', answer: 0.5349, tol: 0.003 },
      ],
      solution: r`- Group 5: $z = 2.90 - 3.34 = -0.44$, $\sigma(-0.44) = 1/(1 + e^{0.44}) = 1/2.553 = 0.392$.
- Group 6: $z = 3.48 - 3.34 = 0.14$, $\sigma(0.14) = 0.535$.

The probability crosses 0.5 between groups 5 and 6 ($x = 3.34/0.58 = 5.76$): the dashed red line on L4 p42.`,
    },
    {
      id: 'l4-lr-gd',
      type: 'numeric',
      source: { kind: 'variant', label: 'like HW04 Ex 3' },
      prompt: r`Logistic regression with 0/1 labels on $(x, y) = (0, 0), (1, 0), (2, 1), (3, 1)$. Starting from $w_0 = w_1 = 0$, do **one** gradient-descent step with learning rate $\eta = 0.5$ and the averaged gradient $\frac1m\sum_i(\sigma(w_0 + w_1x_i) - y_i)(1, x_i)$.`,
      fields: [
        { label: r`new $w_0$`, answer: 0, tol: 0.001 },
        { label: r`new $w_1$`, answer: 0.25, tol: 0.001 },
      ],
      solution: r`1. All scores are 0 → every $p_i = 0.5$.
2. Errors $p_i - y_i$: $0.5, 0.5, -0.5, -0.5$.
3. $g_0 = \frac14(0.5 + 0.5 - 0.5 - 0.5) = 0$; $g_1 = \frac14(0 + 0.5 - 1 - 1.5) = \frac14(-2) = -0.5$.
4. $w_0 = 0 - 0.5\cdot0 = 0$; $w_1 = 0 - 0.5\cdot(-0.5) = 0.25$.`,
    },
    {
      id: 'l4-logloss',
      type: 'numeric',
      source: { kind: 'slide', label: 'L4 p38–39' },
      prompt: r`With labels $y \in \{-1, +1\}$, each example costs $\ln(1 + \exp(-y\,\vec{w}^T\vec{x}))$. Compute the cost for (a) $y = +1$, $\vec{w}^T\vec{x} = 2$ and (b) $y = -1$, $\vec{w}^T\vec{x} = 1$.`,
      fields: [
        { label: '(a)', answer: 0.1269, tol: 0.002 },
        { label: '(b)', answer: 1.3133, tol: 0.002 },
      ],
      solution: r`- (a) $y\vec{w}^T\vec{x} = 2$ (correct and confident): $\ln(1 + e^{-2}) = \ln 1.1353 = 0.127$.
- (b) $y\vec{w}^T\vec{x} = -1$ (wrong side): $\ln(1 + e^{1}) = \ln 3.718 = 1.313$.

Correct confident predictions cost almost nothing; mistakes cost roughly linearly in how wrong they are (L4 p39 plots).`,
    },
    {
      id: 'l4-softmax',
      type: 'numeric',
      source: { kind: 'slide', label: 'L4 p47' },
      prompt: r`A 3-class conditional exponential (softmax) model gives scores $\vec{w}_k^T\vec{x} = 1, 2, 3$ for classes 1, 2, 3. Compute $p(\mathcal{C}_1 \mid \vec{x})$ and $p(\mathcal{C}_3 \mid \vec{x})$.`,
      fields: [
        { label: r`$p(\mathcal{C}_1 \mid \vec{x})$`, answer: 0.0900, tol: 0.002 },
        { label: r`$p(\mathcal{C}_3 \mid \vec{x})$`, answer: 0.6652, tol: 0.002 },
      ],
      solution: r`$e^1 = 2.718$, $e^2 = 7.389$, $e^3 = 20.086$; $Z = 30.193$.
$p_1 = 2.718/30.193 = 0.090$, $p_2 = 0.245$, $p_3 = 20.086/30.193 = 0.665$.`,
    },
    {
      id: 'l4-laplace-text',
      type: 'numeric',
      source: { kind: 'slide', label: 'L4 p23–24' },
      prompt: r`In class "sports", the mega-document has 10 words in total over a vocabulary of $|\mathcal{V}| = 5$ words. The word "election" appears 0 times and "goal" appears 3 times. With add-one smoothing, compute $P(\text{election} \mid \text{sports})$ and $P(\text{goal} \mid \text{sports})$.`,
      fields: [
        { label: 'P(election | sports)', answer: 1 / 15, tol: 0.001 },
        { label: 'P(goal | sports)', answer: 4 / 15, tol: 0.001 },
      ],
      solution: r`$P(w \mid c) = \frac{\text{count}(w, c) + 1}{|\mathcal{V}| + \sum_w\text{count}(w, c)} = \frac{\text{count} + 1}{5 + 10}$.
- election: $\frac{0 + 1}{15} = 0.0667$ (not 0, so one unseen word no longer zeroes the whole product).
- goal: $\frac{3 + 1}{15} = 0.2667$.`,
    },
    {
      id: 'l4-gauss-gen',
      type: 'numeric',
      source: { kind: 'slide', label: 'L4 p15–17' },
      prompt: r`A 1-D Gaussian generative classifier is trained on class A: $x = 1, 3$ and class B: $x = 6, 8, 10$. Compute the MLE mean of each class and the prior $p(A)$.`,
      fields: [
        { label: r`$\mu_A$`, answer: 2, tol: 0.001 },
        { label: r`$\mu_B$`, answer: 8, tol: 0.001 },
        { label: r`$p(A)$`, answer: 0.4, tol: 0.001 },
      ],
      solution: r`$\mu_k$ = average of the class's points (the $\delta$ in L4 p17 just selects them): $\mu_A = (1 + 3)/2 = 2$, $\mu_B = (6 + 8 + 10)/3 = 8$. Prior = fraction of examples: $p(A) = 2/5 = 0.4$. (Variances: $\sigma_A^2 = 1$, $\sigma_B^2 = 8/3$.)`,
    },
    // ---------- concept MCQs ----------
    {
      id: 'l4-map-mle',
      type: 'mcq',
      source: { kind: 'slide', label: 'L4 p10–12' },
      prompt: r`Two hypotheses: $P(D \mid h_1) = 0.4$, $P(h_1) = 0.2$; $P(D \mid h_2) = 0.3$, $P(h_2) = 0.8$. Which does MAP choose, and which does MLE choose?`,
      options: ['MAP: h₁, MLE: h₁', 'MAP: h₂, MLE: h₁', 'MAP: h₁, MLE: h₂', 'MAP: h₂, MLE: h₂'],
      answer: 1,
      solution: r`MAP compares $P(D \mid h)P(h)$: $0.4\cdot0.2 = 0.08$ vs $0.3\cdot0.8 = 0.24$ → $h_2$. MLE compares only $P(D \mid h)$: $0.4 > 0.3$ → $h_1$. They differ because the prior is not uniform.`,
    },
    {
      id: 'l4-map-uniform',
      type: 'mcq',
      source: { kind: 'slide', label: 'L4 p12' },
      prompt: r`When are the MAP and ML hypotheses guaranteed to be the same?`,
      options: ['When the data set is large', 'When every hypothesis has the same prior probability', 'When the likelihood is Gaussian', 'Never'],
      answer: 1,
      solution: r`With $P(h_i) = P(h_j)$ for all hypotheses, the prior is a constant and $\arg\max_h P(D \mid h)P(h) = \arg\max_h P(D \mid h)$.`,
    },
    {
      id: 'l4-mse-noise',
      type: 'mcq',
      source: { kind: 'slide', label: 'L4 p4, p13–14' },
      prompt: r`Minimising the **sum of squared errors** in linear regression is equivalent to maximum likelihood under which assumption on the noise $\epsilon_i = y_i - f(x_i)$?`,
      options: ['Laplace noise', 'Gaussian noise with mean 0', 'Uniform noise', 'No noise at all'],
      answer: 1,
      solution: r`With $\epsilon_i \sim \mathcal{N}(0, \sigma^2)$ the log-likelihood is a constant minus $\frac{1}{2\sigma^2}\sum(y_i - h(x_i))^2$, so maximising it = minimising squared error. Laplace noise leads instead to the absolute error (MAE).`,
    },
    {
      id: 'l4-nb-assumption',
      type: 'mcq',
      source: { kind: 'slide', label: 'L4 p21, p30' },
      prompt: r`The "naive" assumption of Naive Bayes is that:`,
      options: [
        'All classes are equally likely',
        'The features are independent of each other given the class',
        'The features are independent of the class',
        'Each feature is Gaussian',
      ],
      answer: 1,
      solution: r`**Conditional independence**: $p(\vec{x} \mid \mathcal{C}_k) = \prod_j p(x_j \mid \mathcal{C}_k)$. It is seldom true in practice (features are often correlated), but it makes estimation easy and classification accuracy is often good.`,
    },
    {
      id: 'l4-zero-count',
      type: 'mcq',
      source: { kind: 'slide', label: 'L4 p24' },
      prompt: r`A test document contains a word that never appeared in the training documents of any class. With plain MLE Naive Bayes, what happens, and what is the fix?`,
      options: [
        'The word is ignored automatically; no fix needed',
        'Every class gets probability 0; fix with Laplace (add-one) smoothing',
        'Every class gets probability 1; fix by removing the word',
        'Only the largest class gets probability 0',
      ],
      answer: 1,
      solution: r`$P(\text{newword} \mid \mathcal{C}_k) = 0$ for every class, so every product is 0 and the classifier cannot decide. Smoothing adds 1 to every count: $\frac{\text{count} + 1}{|\mathcal{V}| + \sum\text{count}}$.`,
    },
    {
      id: 'l4-boundary',
      type: 'mcq',
      source: { kind: 'slide', label: 'L4 p33–36' },
      prompt: r`The decision boundary of logistic regression $P(y = 1 \mid \vec{x}) = \sigma(\vec{w}^T\vec{x} + b)$ is:`,
      options: [r`$\vec{w}^T\vec{x} + b = 0.5$`, r`$\vec{w}^T\vec{x} + b = 0$, a hyperplane`, r`$\sigma(\vec{w}^T\vec{x} + b) = 0$`, 'A curve that depends on the data density'],
      answer: 1,
      solution: r`$P = 0.5 \iff \sigma(z) = 0.5 \iff z = 0$. So the boundary is the **linear** set $\vec{w}^T\vec{x} + b = 0$ (equivalently the log-odds $\ln\frac{p(y=1|\vec{x})}{p(y=-1|\vec{x})} = 0$).`,
    },
    {
      id: 'l4-gen-disc',
      type: 'mcq',
      source: { kind: 'slide', label: 'L4 p50' },
      prompt: r`Which statement correctly contrasts generative and discriminative models?`,
      options: [
        'Generative models learn P(y | x) directly; discriminative models learn P(x | y)',
        'Discriminative models learn P(y | x) directly and usually perform better; generative models learn P(x | y), are cheap and converge fast but are more sensitive to noise',
        'Naive Bayes is discriminative; logistic regression is generative',
        'Both always give the same accuracy',
      ],
      answer: 1,
      solution: r`L4 p50: discriminative (e.g. logistic regression) model $P(y \mid \vec{x})$, usually better and robust to noise, but slower to train. Generative (e.g. Naive Bayes) model $P(\vec{x} \mid y)$, fast and cheap, but sensitive to noise and usually worse.`,
    },
    {
      id: 'l4-sigmoid-deriv',
      type: 'numeric',
      source: { kind: 'slide', label: 'L4 p37' },
      prompt: r`If $\sigma(a) = 0.8$, what are $\sigma(-a)$ and $\frac{d\sigma}{da}$ at that point?`,
      fields: [
        { label: r`$\sigma(-a)$`, answer: 0.2, tol: 0.001 },
        { label: r`$d\sigma/da$`, answer: 0.16, tol: 0.001 },
      ],
      solution: r`$\sigma(-a) = 1 - \sigma(a) = 0.2$. $\frac{d\sigma}{da} = \sigma(1 - \sigma) = 0.8\times0.2 = 0.16$.`,
    },
    {
      id: 'l4-closed-form',
      type: 'mcq',
      source: { kind: 'slide', label: 'L4 p39–40' },
      prompt: r`Which is true about training logistic regression by maximum likelihood?`,
      options: [
        'It has a closed-form solution like the normal equation',
        'The objective is convex (one global optimum) but has no closed form, so gradient descent is used',
        'The objective is non-convex with many local minima',
        'It is trained by counting, like Naive Bayes',
      ],
      answer: 1,
      solution: r`L4 p40: "Convex objective function, global optimal. No closed-form solution. Gradient descent." with step size $\eta_t \propto 1/\sqrt{t}$.`,
    },
    {
      id: 'l4-nb-vs-lr',
      type: 'mcq',
      source: { kind: 'slide', label: 'L4 p45, p49' },
      prompt: r`On the Reuters text data, which classifier was more accurate, and what do Naive Bayes and logistic regression have in common?`,
      options: [
        'Naive Bayes (88%); both are non-linear',
        'Logistic regression (88% vs 77%); both have linear decision boundaries',
        'They tie; both use the independence assumption',
        'Naive Bayes (77% vs 88%); both are trained by gradient descent',
      ],
      answer: 1,
      solution: r`Logistic regression 88%, Naive Bayes 77% (L4 p45). Both give **linear** boundaries (p49); NB fixes the weights from counts, $w_j = \ln\frac{p(j|y=+1)}{p(j|y=-1)}$, LR learns them by MLE.`,
    },
    {
      id: 'l4-equal-likelihood',
      type: 'mcq',
      source: { kind: 'slide', label: 'L4 p16' },
      prompt: r`A Gaussian generative classifier has class densities $p(x \mid A) = \mathcal{N}(3, 1)$, $p(x \mid B) = \mathcal{N}(8, 1)$ and priors $p(A) = 0.3$, $p(B) = 0.7$. For $x = 5.5$ (exactly halfway), which class is predicted?`,
      options: ['A, because it is closer', 'B, because the likelihoods are equal and B has the larger prior', 'Neither; the classifier abstains', 'A, because priors are ignored'],
      answer: 1,
      solution: r`$x = 5.5$ is 2.5 from both means with equal variances, so $p(5.5 \mid A) = p(5.5 \mid B) = 0.0175$. The decision $\arg\max_k p(x \mid \mathcal{C}_k)p(\mathcal{C}_k)$ is then settled by the prior: $0.7 > 0.3$ → **B**.`,
    },
  ],
};
