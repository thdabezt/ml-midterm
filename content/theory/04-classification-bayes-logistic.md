---
slug: l4-classification
num: 4
title: Classification (1) – Bayes, Naive Bayes, Logistic Regression
short: Naive Bayes & logistic
summary: Bayes' theorem for learning (MAP vs MLE), why least squares is MLE, generative models and the Naive Bayes classifier with counting and Laplace smoothing, and discriminative models: logistic regression, the sigmoid, its loss and gradient.
---
Two of the most examinable calculations live here: the **Naive Bayes table problem** (Homework 4 Exercise 2 and the "Play Tennis" slides) and **logistic regression predictions** (Homework 4 Exercise 3). Both reduce to counting, multiplying fractions and computing a sigmoid.

:::exam What the midterm can ask from this lecture
- MAP vs MLE: definitions, and when they give the same answer (uniform prior).
- Why minimising squared error = MLE under Gaussian noise (MAE ↔ Laplace noise).
- **Naive Bayes by hand**: priors, conditional probabilities by counting, compare the two products, plus Laplace smoothing when a count is 0.
- Sigmoid values, logistic regression prediction $P(y = 1 \mid x)$, the decision boundary $\mathbf{w}^T\mathbf{x} = 0$.
- Generative vs discriminative models; Naive Bayes vs logistic regression.
:::

## Bayes' theorem for learning: MAP and MLE

:::formula @classification-bayes Bayes' theorem (p9)
$$P(h \mid D) = \frac{P(D \mid h)\,P(h)}{P(D)} \qquad \text{posterior} \propto \text{likelihood} \times \text{prior}$$
:::

:::read
- $h$: a hypothesis (a model); $D$: the training data.
- $P(h)$: prior, how plausible $h$ is before seeing data. $P(D \mid h)$: likelihood, how well $h$ explains the data. $P(h \mid D)$: posterior.
- $P(D)$ is the same for every $h$, so it can be ignored when we only want the **best** $h$.
:::

:::formula @classification-map MAP (p10–12)
$$h_{MAP} = \arg\max_{h \in \mathcal{H}} P(D \mid h)\,P(h)$$
:::

:::formula @classification-mle MLE (p10–12)
$$h_{ML} = \arg\max_{h \in \mathcal{H}} P(D \mid h)$$
:::

- **MAP** (maximum a posteriori): uses the prior, which "encodes knowledge or preference". Computationally intensive, but a gold standard for judging learners.
- **MLE**: assume every hypothesis is equally likely a priori, $P(h_i) = P(h_j)$. Then the prior cancels and MAP = MLE.

:::example MAP with a strong prior
A disease affects 0.8% of people. A test is positive for 98% of sick people and for 3% of healthy people. A patient tests positive.
- Sick: $P(+ \mid \text{sick})P(\text{sick}) = 0.98 \times 0.008 = 0.0078$
- Healthy: $P(+ \mid \text{healthy})P(\text{healthy}) = 0.03 \times 0.992 = 0.0298$

$h_{MAP}$ = **healthy**, even though the test is positive, because the prior is so small. (Normalised: $P(\text{sick} \mid +) = 0.0078/(0.0078 + 0.0298) = 0.21$.) MLE ignores the prior and would pick "sick" (0.98 > 0.03).
:::

## Least squares is MLE in disguise

Assume each target is the true function plus Gaussian noise (p13): $y_i = f(x_i) + \epsilon_i$, $\epsilon_i \sim \mathcal{N}(0, \sigma^2)$. Then (p14):

:::formula @classification-gaussian-mle Least squares from Gaussian maximum likelihood
$$h_{ML} = \arg\max_h \prod_{i=1}^m \frac{1}{\sqrt{2\pi\sigma^2}}e^{-\frac{(y_i - h(x_i))^2}{2\sigma^2}} = \arg\max_h \sum_{i=1}^m \Big[\ln\frac{1}{\sqrt{2\pi\sigma^2}} - \frac{(y_i - h(x_i))^2}{2\sigma^2}\Big] = \arg\min_h \sum_{i=1}^m (y_i - h(x_i))^2$$
:::

:::read Why each step is allowed
1. Independent data → likelihood = product of Gaussian densities.
2. Take $\ln$: product → sum, and $\ln e^{a} = a$.
3. The first term is a constant (no $h$ in it); dropping constants and the positive factor $\frac{1}{2\sigma^2}$ does not change the arg max.
4. Maximising $-(\text{something})$ = minimising $(\text{something})$.
:::

**MSE vs MAE** (p4): squared error ↔ **Gaussian** noise; absolute error $\frac{1}{2m}\sum|h(x_i) - y_i|$ ↔ **Laplace** noise (sharper peak, heavier tails, so MAE is more robust to outliers).

## Generative models

A **generative** classifier models how each class *generates* data, then uses Bayes to classify (p15–17):

:::formula @classification-generative-rule Generative classification rule
$$p(\mathcal{C}_k \mid \mathbf{x}) \propto p(\mathbf{x} \mid \mathcal{C}_k)\,p(\mathcal{C}_k), \qquad k^* = \arg\max_k p(\mathbf{x} \mid \mathcal{C}_k)\,p(\mathcal{C}_k)$$
:::

- $p(\mathbf{x} \mid \mathcal{C}_k)$: **class-conditional density**, e.g. a Gaussian $\mathcal{N}(\mathbf{x} \mid \boldsymbol\mu_k, \Sigma_k)$.
- $p(\mathcal{C}_k)$: **class prior**.

:::formula @classification-gaussian-estimates Gaussian class mean and covariance (p17)
$$\boldsymbol\mu_k = \frac{\sum_i \delta(y_i, \mathcal{C}_k)\,\mathbf{x}_i}{\sum_i \delta(y_i, \mathcal{C}_k)}, \qquad \Sigma_k = \frac{\sum_i \delta(y_i, \mathcal{C}_k)(\mathbf{x}_i - \boldsymbol\mu_k)(\mathbf{x}_i - \boldsymbol\mu_k)^T}{\sum_i \delta(y_i, \mathcal{C}_k)}$$
:::

:::formula @classification-class-prior Class prior from counts (p17)
$$p(\mathcal{C}_k) = \frac{1}{n}\sum_i\delta(y_i, \mathcal{C}_k)$$
:::

:::read
$\delta(y_i, \mathcal{C}_k)$ is 1 if example $i$ belongs to class $k$ and 0 otherwise, so it simply **selects** the examples of class $k$. In words: $\boldsymbol\mu_k$ = average of class-$k$ points; $\Sigma_k$ = their spread; prior = fraction of points in class $k$.
:::

:::example 1-D Gaussian classifier
Class A: $x = 1, 2, 3$. Class B: $x = 6, 8$.
- $\mu_A = 2$, $\sigma_A^2 = \frac{(1)^2 + 0 + 1^2}{3} = 0.667$; $\mu_B = 7$, $\sigma_B^2 = \frac{1 + 1}{2} = 1$.
- Priors $p(A) = 3/5$, $p(B) = 2/5$.
- New $x = 4$: $p(4 \mid A) = \frac{1}{\sqrt{2\pi\cdot0.667}}e^{-4/1.333} = 0.4886 \times 0.0498 = 0.0243$; $p(4 \mid B) = \frac{1}{\sqrt{2\pi}}e^{-9/2} = 0.3989 \times 0.0111 = 0.0044$.
- Compare $0.6 \times 0.0243 = 0.0146$ vs $0.4 \times 0.0044 = 0.0018$ → class **A**.
:::

**Curse of dimensionality** (p19): if 5 samples suffice in 1-D, you need 25 in 2-D, 125 in 3-D and $5^{10} = 9{,}765{,}625$ in 10-D. Estimating a full $d$-dimensional density needs too much data, which motivates Naive Bayes.

## Naive Bayes classifier

:::formula @classification-naive-bayes Conditional independence and Naive Bayes classifier (p21, p26)
$$p(\mathbf{x} \mid \mathcal{C}_k) \approx \prod_{j=1}^{d} p(x_j \mid \mathcal{C}_k) \qquad\Longrightarrow\qquad \mathcal{C}_{NB} = \arg\max_{\mathcal{C}_k}\; P(\mathcal{C}_k)\prod_j P(x_j \mid \mathcal{C}_k)$$
:::

:::read
- "Naive": we pretend that, **once the class is known**, the features do not influence each other. Then one hard $d$-dimensional estimate becomes $d$ easy 1-D estimates.
- With categorical features each $P(x_j \mid \mathcal{C}_k)$ is just a **count ratio** (MLE).
- The approximation is often bad, but classification accuracy is good (89% on 20 Newsgroups, p25).
:::

:::steps Naive Bayes by hand (categorical features)
1. **Priors**: $P(\text{yes}) = \frac{\#\text{yes}}{\#\text{all}}$, $P(\text{no}) = \frac{\#\text{no}}{\#\text{all}}$.
2. For each feature value in the new example and each class: $P(\text{value} \mid \text{class}) = \frac{\#\text{rows with that value AND that class}}{\#\text{rows of that class}}$. Note: the denominator is the class count, **not** the total.
3. Score each class: prior × product of its conditional probabilities.
4. Predict the class with the bigger score. (To get real probabilities, divide each score by the sum of the scores.)
:::

:::formula @classification-conditional-frequency Conditional probability from class counts
$$P(x_j=v\mid\mathcal{C}_k)=\frac{\#\{i:x_{ij}=v,\ y_i=\mathcal{C}_k\}}{\#\{i:y_i=\mathcal{C}_k\}}$$
:::

:::example Play Tennis (slides p27–29): $\mathbf{x}$ = (Sunny, Cool, High humidity, Strong wind)
14 days: 9 Yes, 5 No.

| | Yes (9 days) | No (5 days) |
|---|---|---|
| Prior | 9/14 | 5/14 |
| Outlook = Sunny | 2/9 | 3/5 |
| Temp = Cool | 3/9 | 1/5 |
| Humidity = High | 3/9 | 4/5 |
| Wind = Strong | 3/9 | 3/5 |
| **Score** | $\frac{9}{14}\cdot\frac29\cdot\frac39\cdot\frac39\cdot\frac39 = 0.0053$ | $\frac{5}{14}\cdot\frac35\cdot\frac15\cdot\frac45\cdot\frac35 = 0.0206$ |

$0.0206 > 0.0053$ → **PlayTennis = No**. Normalised: $P(\text{No} \mid \mathbf{x}) = 0.0206/(0.0206 + 0.0053) = 0.795$.
:::

### Zero counts and Laplace smoothing

If a feature value never appears with a class in training, its MLE probability is 0 and the whole product becomes 0, no matter how strong the other evidence is (p24, the "new word" problem).

:::formula @classification-laplace-smoothing Laplace (add-one) smoothing (p24)
$$P(w_j \mid \mathcal{C}_k) = \frac{\text{count}(w_j, \mathcal{C}_k) + 1}{|\mathcal{V}| + \sum_{w \in \mathcal{V}}\text{count}(w, \mathcal{C}_k)}$$
:::

:::read
Add 1 to every count, and add the **number of possible values** $|\mathcal{V}|$ to the denominator so the probabilities still sum to 1. For a table feature with 3 possible values (Sunny/Overcast/Rainy) and a class with 4 rows: $P = \frac{\text{count} + 1}{4 + 3}$.
:::

:::pitfall
Homework 4 says "use MLE", which means **no smoothing**: a zero count really gives a zero score. Mention smoothing only as a remark unless the question asks for it.
:::

### Naive Bayes for text

A document is a **bag of words**: word order is ignored, $x_j$ = number of times word $w_j$ occurs (p22). Then $p(\mathbf{x} \mid \mathcal{C}_k) \propto \prod_j p(w_j \mid \mathcal{C}_k)^{x_j}$, and $p(w_j \mid \mathcal{C}_k)$ = frequency of $w_j$ in the "mega-document" made by joining all class-$k$ documents (p23).

:::formula @classification-text-naive-bayes Bag-of-words likelihood (p22–23)
$$p(\mathbf{x}\mid\mathcal{C}_k)\propto\prod_j p(w_j\mid\mathcal{C}_k)^{x_j}$$
:::

### Naive Bayes gives a linear decision boundary

Taking the log of the ratio of the two class scores (p31):

:::formula @classification-naive-bayes-log-odds Text Naive Bayes log-odds
$$\ln\frac{p(\mathcal{C}_1 \mid \mathbf{x})}{p(\mathcal{C}_2 \mid \mathbf{x})} = \ln\frac{p(\mathcal{C}_1)}{p(\mathcal{C}_2)} + \sum_j x_j\underbrace{\ln\frac{p(w_j \mid \mathcal{C}_1)}{p(w_j \mid \mathcal{C}_2)}}_{\text{weight of word } j}$$
:::
This is **linear in $\mathbf{x}$**: a constant plus a weighted sum. Gaussian class-conditionals with a **shared** covariance also give a linear boundary (p32). So why not learn the linear boundary directly? That is logistic regression (p33).

## Logistic regression (a discriminative model)

:::formula @classification-logistic-log-odds Log-odds model (p35–36), labels $y\in\{-1,+1\}$
$$\ln\frac{p(y=1\mid\mathbf{x})}{p(y=-1\mid\mathbf{x})}=\mathbf{w}^T\mathbf{x}$$
:::

:::formula @classification-logistic-model Logistic probability model (p35–36)
$$p(y\mid\mathbf{x})=\sigma(y\,\mathbf{w}^T\mathbf{x})\quad\text{for }y\in\{-1,+1\},\qquad P(y=1\mid\mathbf{x})=\sigma(\mathbf{w}^T\mathbf{x})\quad\text{for 0/1 labels}$$
:::

:::read
- $\mathbf{w}^T\mathbf{x}$ (with $x_0 = 1$ for the bias) is a **score**. The left side, the log of the odds, says the score measures how much more likely class $+1$ is than class $-1$.
- The sigmoid turns the score into a probability.
- **0/1 convention** (used in Homework 4 and most textbooks): $P(y = 1 \mid \mathbf{x}) = \sigma(\mathbf{w}^T\mathbf{x})$ and $P(y = 0 \mid \mathbf{x}) = 1 - \sigma(\mathbf{w}^T\mathbf{x})$. It is the same model written differently.
- **Decision rule**: predict class 1 when $P \ge 0.5$, i.e. when $\mathbf{w}^T\mathbf{x} \ge 0$. The **decision boundary** is $\mathbf{w}^T\mathbf{x} = 0$.
:::

:::formula @classification-linear-score Linear score and binary decision boundary
$$z=\mathbf{w}^T\mathbf{x}=w_0+\sum_{j=1}^{d}w_jx_j\quad(x_0=1),\qquad z=0\text{ at the }P=0.5\text{ boundary}$$
:::

:::formula @classification-sigmoid Sigmoid value (p37)
$$\sigma(a)=\frac{1}{1+e^{-a}}$$
:::

:::formula @classification-sigmoid-identities Sigmoid complement and derivative (p37)
$$\sigma(-a)=1-\sigma(a),\qquad\frac{d\sigma}{da}=\sigma(a)\big(1-\sigma(a)\big)$$
:::

:::example Heart disease (p41–42)
Feature $x$ = age group (1..8), fitted weights $w_1 = 0.58$, $w_0 = -3.34$.
- Age group 8: $z = 0.58 \cdot 8 - 3.34 = 1.30$, $P(\text{disease}) = \sigma(1.30) = \frac{1}{1 + e^{-1.3}} = \frac{1}{1.2725} = 0.786$.
- Age group 2: $z = 1.16 - 3.34 = -2.18$, $P = \sigma(-2.18) = 0.102$.
- Boundary: $0.58x - 3.34 = 0 \Rightarrow x = 5.76$, between groups 5 and 6 (the red dashed line on the slide).
:::

### Training: maximum likelihood

:::formula @classification-logistic-loss Loss to minimise (p38)
$$\mathcal{L}(\mathbf{w}) = \prod_i p(y_i \mid \mathbf{x}_i; \mathbf{w}) \;\;\Longrightarrow\;\; \mathbf{w}^* = \arg\min_{\mathbf{w}}\sum_{i=1}^N \ln\big(1 + \exp(-y_i\,\mathbf{w}^T\mathbf{x}_i)\big)$$
:::

:::read
Maximise the log-likelihood $\sum_i\ln\sigma(y_i\mathbf{w}^T\mathbf{x}_i)$, which is the same as minimising its negative. Since $-\ln\sigma(z) = \ln(1 + e^{-z})$, each example costs $\ln(1 + e^{-y_i\mathbf{w}^T\mathbf{x}_i})$: almost 0 when the example is confidently correct ($y_i\mathbf{w}^T\mathbf{x}_i \gg 0$), large when it is confidently wrong. With 0/1 labels this is the **cross-entropy** loss $-\sum_i[y_i\ln p_i + (1 - y_i)\ln(1 - p_i)]$.
:::

- The loss is **convex**, so there is one global optimum (p39–40), but **no closed-form solution**: use gradient descent.

:::formula @classification-logistic-gradient Gradient and update (p40)
$$\nabla\mathcal{L}(\mathbf{w}) = -\sum_{i=1}^N y_i\,\mathbf{x}_i\big(1 - p(y_i \mid \mathbf{x}_i)\big), \qquad \mathbf{w}_{t+1} = \mathbf{w}_t - \eta_t\nabla\mathcal{L}(\mathbf{w}_t)$$
With 0/1 labels: $\nabla = \sum_i \big(\sigma(\mathbf{w}^T\mathbf{x}_i) - y_i\big)\mathbf{x}_i$, the same "error × input" shape as linear regression.
:::

:::read
$1 - p(y_i \mid \mathbf{x}_i)$ is the "classification error" of example $i$: examples that are already predicted well barely move the weights.
:::

:::formula @classification-decaying-step Decreasing step-size example (p40)
$$\eta_t\propto1/\sqrt{t}$$
:::

:::example One gradient step by hand (0/1 labels)
Data: $(x, y) = (1, 0), (2, 0), (3, 1), (4, 1)$, start $w_0 = w_1 = 0$, step size $\eta = 0.1$, gradient averaged over the 4 examples.
1. All scores are 0, so every $p_i = \sigma(0) = 0.5$.
2. Errors $p_i - y_i$: $0.5, 0.5, -0.5, -0.5$.
3. $g_0 = \frac14(0.5 + 0.5 - 0.5 - 0.5) = 0$; $g_1 = \frac14(0.5\cdot1 + 0.5\cdot2 - 0.5\cdot3 - 0.5\cdot4) = \frac14(-2) = -0.5$.
4. $w_0 = 0$, $w_1 = 0 + 0.1 \times 0.5 = 0.05$. The slope becomes positive: more $x$ → more likely class 1.
:::

:::pitfall Perfectly separable data
If one threshold separates the classes perfectly (as in Homework 4 Exercise 3: fail for ≤ 3 hours, pass for ≥ 4 hours), the likelihood keeps increasing as the weights grow, so pure MLE has **no finite solution**. The boundary settles between the classes ($x = 3.5$) and the sigmoid becomes a step. In practice we stop gradient descent early or add regularisation (Lecture 7). Points far from the boundary then get probabilities near 1 or 0.
:::

### Multi-class: softmax

For $K$ classes (p47–48), give each class its own weight vector:

:::formula @classification-softmax Multi-class softmax
$$p(\mathcal{C}_k \mid \mathbf{x}) = \frac{\exp(\mathbf{w}_k^T\mathbf{x})}{\sum_{k'=1}^{K}\exp(\mathbf{w}_{k'}^T\mathbf{x})}$$
:::
The denominator $Z(\mathbf{x})$ (partition function) makes the $K$ probabilities sum to 1. Train by maximising $\sum_i\ln p(y_i \mid \mathbf{x}_i)$.

:::example
Scores $\mathbf{w}_k^T\mathbf{x} = (2, 1, 0)$: $e^2 = 7.389$, $e^1 = 2.718$, $e^0 = 1$, sum $= 11.107$ → probabilities $(0.665, 0.245, 0.090)$.
:::

## Generative vs discriminative

| | Discriminative (logistic regression) | Generative (Naive Bayes, Gaussian) |
|---|---|---|
| Models | $P(y \mid \mathbf{x})$ directly | $P(\mathbf{x} \mid y)$ (and $P(y)$) |
| Pros | usually better accuracy; robust to noisy data | fast convergence; cheap (Naive Bayes is just counting) |
| Cons | slow convergence (gradient descent); more computation | sensitive to noise; usually worse accuracy |

**Naive Bayes vs logistic regression** (p49): both give **linear** decision boundaries. Naive Bayes sets the weights from counts, $w_j = \ln\frac{p(j \mid y = +1)}{p(j \mid y = -1)}$, using the independence assumption. Logistic regression **learns** the weights by MLE with a broader assumption (exponential family). On Reuters text: Naive Bayes 77%, logistic regression 88% (p45).

:::note Outline vs content
The outline of this lecture lists Decision Trees and K-Nearest Neighbours, but their slides are in the next deck. Decision trees are covered in Lecture 5. KNN appears only through Homework 5 (k-NN regression) and Lecture 7 (model complexity: small $k$ = complex model).
:::
