---
slug: formula-sheet
num: 99
title: Formula sheet
short: Formula sheet
summary: A printable midterm formula reference, grouped by lecture, each with a one-line reminder of what it means. Includes clustering distances, K-means, HAC and DBSCAN.
---
Print this page (Ctrl+P hides the menus) or read it the night before. Each line links a formula to the idea behind it; the lesson pages explain how to compute each one.

## Probability (L2)

| Formula | Meaning |
|---|---|
| $p(X) = \sum_Y p(X, Y)$ | sum rule: marginal = add the joint over the other variable |
| $p(X, Y) = p(Y \mid X)\,p(X)$ | product rule |
| $p(A \mid B) = \dfrac{p(B \mid A)\,p(A)}{p(B)}$ | Bayes: posterior ∝ likelihood × prior |
| $p(x, y) = p(x)\,p(y)$ | independence |
| $E[X] = \sum_x x\,p(x)$, $\mathrm{Var}[X] = E[X^2] - E[X]^2$ | mean and spread |
| $\mathrm{Var}[CX] = C^2\mathrm{Var}[X]$, $\mathrm{Var}[X + C] = \mathrm{Var}[X]$ | constants |
| $\mathrm{Bern}: \lambda^x(1-\lambda)^{1-x}$ | one yes/no trial |
| $\mathrm{Bin}: \binom{n}{k}p^k(1-p)^{n-k}$ | $k$ successes in $n$ trials; mean $np$ |
| $\mathcal{N}: \frac{1}{\sqrt{2\pi\sigma^2}}e^{-(x-\mu)^2/(2\sigma^2)}$ | Gaussian |
| $\mathrm{Exp}: \lambda e^{-\lambda x}$ | waiting times |

## Information (L2, L5, L7)

| Formula | Meaning |
|---|---|
| $H(X) = -\sum_i p_i\log_2 p_i$ | entropy: 0 if pure, 1 for a 50/50 binary split |
| $H(p, q) = -\sum_x p(x)\log q(x)$ | cross-entropy (classification loss) |
| $D_{KL}(P\|Q) = \sum_x P(x)\log\frac{P(x)}{Q(x)} = H(P,Q) - H(P)$ | KL ≥ 0, not symmetric, ∞ if supports do not overlap |
| $I(X;Y) = H(X) - H(X \mid Y)$ | mutual information = information gain |

## MLE / MAP (L2, L4)

| Formula | Meaning |
|---|---|
| $\hat\theta_{MLE} = \arg\max_\theta\prod_i p(x_i \mid \theta) = \arg\max_\theta\sum_i\log p(x_i \mid \theta)$ | maximise (log-)likelihood |
| Coin: $\hat\theta = s/N$; die: $\hat\theta_k = N_k/N$ | MLE = relative frequency |
| $h_{MAP} = \arg\max_h P(D \mid h)P(h)$; $h_{ML} = \arg\max_h P(D \mid h)$ | MAP = MLE when the prior is uniform |
| Gaussian noise ⟹ MLE = least squares; Laplace noise ⟹ least absolute error | |

## Linear regression (L3)

| Formula | Meaning |
|---|---|
| $h(\mathbf{x}) = \mathbf{w}^T\mathbf{x} = w_0 + w_1x_1 + \dots$ ($x_0 = 1$) | model |
| $J(\mathbf{w}) = \frac{1}{2m}\sum_i(h(\mathbf{x}_i) - y_i)^2$ | cost (MSE) |
| $\frac{\partial J}{\partial w_j} = \frac1m\sum_i(h(\mathbf{x}_i) - y_i)x_{ij}$ | gradient ($x_{i0} = 1$) |
| $w_j := w_j - \alpha\frac{\partial J}{\partial w_j}$ (simultaneously) | gradient descent |
| $\mathbf{w} = (X^TX)^{-1}X^T\mathbf{y}$ | normal equation |
| $X^TX = \begin{bmatrix}m & \sum x\\ \sum x & \sum x^2\end{bmatrix}$, $X^T\mathbf{y} = \begin{bmatrix}\sum y\\ \sum xy\end{bmatrix}$ | one-feature shortcut |
| $w_1 = \frac{m\sum xy - \sum x\sum y}{m\sum x^2 - (\sum x)^2}$, $w_0 = \bar y - w_1\bar x$ | same, without matrices |
| $\begin{bmatrix}a&b\\c&d\end{bmatrix}^{-1} = \frac{1}{ad - bc}\begin{bmatrix}d&-b\\-c&a\end{bmatrix}$ | 2×2 inverse |
| Ridge: $\mathbf{w} = (X^TX + \lambda L)^{-1}X^T\mathbf{y}$; GD $w_j := w_j(1 - \frac{\alpha\lambda}{m}) - \frac{\alpha}{m}\sum_i e_ix_{ij}$ | L2 regularisation |

## Naive Bayes and logistic regression (L4)

| Formula | Meaning |
|---|---|
| $\hat y = \arg\max_k P(C_k)\prod_j P(x_j \mid C_k)$ | Naive Bayes |
| $P(x_j = v \mid C_k) = \frac{\#(v, C_k)}{\#C_k}$; smoothed $\frac{\#(v, C_k) + 1}{\#C_k + |V|}$ | counting (MLE), Laplace |
| $\sigma(z) = \frac{1}{1 + e^{-z}}$, $\sigma(-z) = 1 - \sigma(z)$, $\sigma' = \sigma(1 - \sigma)$ | sigmoid |
| $P(y = 1 \mid \mathbf{x}) = \sigma(\mathbf{w}^T\mathbf{x})$; labels ±1: $p(y \mid \mathbf{x}) = \sigma(y\,\mathbf{w}^T\mathbf{x})$ | logistic regression |
| boundary: $\mathbf{w}^T\mathbf{x} = 0$ | where $P = 0.5$ |
| loss $\sum_i\ln(1 + e^{-y_i\mathbf{w}^T\mathbf{x}_i})$; 0/1 gradient $\sum_i(\sigma(\mathbf{w}^T\mathbf{x}_i) - y_i)\mathbf{x}_i$ | training |
| softmax $p(C_k \mid \mathbf{x}) = \frac{e^{\mathbf{w}_k^T\mathbf{x}}}{\sum_j e^{\mathbf{w}_j^T\mathbf{x}}}$ | multi-class |

## Decision trees (L5)

| Formula | Meaning |
|---|---|
| $\text{Gini} = 1 - \sum_i p_i^2$ (2 classes: $2p(1-p)$, max 0.5) | impurity |
| $\text{Entropy} = -\sum_i p_i\log_2 p_i$ (max 1 for 2 classes) | impurity |
| $\text{Error} = 1 - \max_i p_i$ | impurity |
| $\text{Gain} = I(\text{parent}) - \sum_i\frac{n_i}{n}I(\text{child}_i)$ | pick the largest |
| $\text{SplitInfo} = -\sum_i\frac{n_i}{n}\log_2\frac{n_i}{n}$, $\text{GainRatio} = \frac{\text{Gain}}{\text{SplitInfo}}$ | penalises many small branches |

## SVM (L6)

| Formula | Meaning |
|---|---|
| $f(\mathbf{x}) = \mathrm{sgn}(\mathbf{w}^T\mathbf{x} + b)$ | classifier |
| distance $= \frac{|\mathbf{w}^T\mathbf{x} + b|}{\lVert\mathbf{w}\rVert}$; margin $= \frac{2}{\lVert\mathbf{w}\rVert}$ | geometry |
| hard: $\min\frac12\lVert\mathbf{w}\rVert^2$ s.t. $y_i(\mathbf{w}^T\mathbf{x}_i + b) \ge 1$ | max margin |
| soft: $\min\frac12\lVert\mathbf{w}\rVert^2 + C\sum_i\xi_i$ s.t. $y_i(\mathbf{w}^T\mathbf{x}_i + b) \ge 1 - \xi_i$ | large C: low bias, high variance |
| hinge $\max(0, 1 - y f(\mathbf{x}))$ | SVM loss |
| perceptron: if wrong, $\mathbf{w} \leftarrow \mathbf{w} + y_i\mathbf{x}_i$, $b \leftarrow b + y_i$ | |
| $\mathbf{w} = \sum_i\alpha_iy_i\mathbf{x}_i$; support vectors: $\alpha_i > 0$ | dual |
| linear $\mathbf{x}^T\mathbf{z}$; poly $(\mathbf{x}^T\mathbf{z}/a + b)^d$; RBF $e^{-\gamma\lVert\mathbf{x} - \mathbf{z}\rVert^2}$ | kernels |
| one-vs-rest: $k$ SVMs; one-vs-one: $k(k-1)/2$ | multi-class |

## Model optimisation (L7)

| Formula | Meaning |
|---|---|
| $E[(Y - \hat f)^2] = \sigma^2 + \text{bias}^2 + \text{variance}$ | bias–variance |
| excess risk = estimation error + approximation error | |
| ridge $+\lambda\lVert\mathbf{w}\rVert_2^2$; lasso $+\lambda\lVert\mathbf{w}\rVert_1$ (sparse) | regularisation |
| $\chi^2 = \sum\frac{(O - E)^2}{E}$, $E = \frac{\text{row} \times \text{col}}{\text{total}}$ | filter feature selection |
| $(1 - \frac1n)^n \to \frac1e \approx 0.37$ | fraction left out of a bootstrap sample |
| $P(\text{majority wrong}) = \sum_{i > T/2}\binom{T}{i}\varepsilon^i(1-\varepsilon)^{T-i}$ | ensemble of $T$ independent voters |
| reject if $\max_j p(j \mid x) < 1 - \frac{\lambda_r}{\lambda_s}$ | reject option (HW5) |

## Clustering (L8)

| Formula | Meaning |
|---|---|
| $d_2(\mathbf{x},\mathbf{y})=\sqrt{\sum_j(x_j-y_j)^2}$; $d_1=\sum_j|x_j-y_j|$ | Euclidean and Manhattan distance; compare squared Euclidean distances to avoid square roots |
| $d_p=(\sum_j|x_j-y_j|^p)^{1/p}$, $p\ge1$ | Minkowski; $p=1$ Manhattan, $p=2$ Euclidean |
| $s_{\cos}=\frac{\mathbf{x}^T\mathbf{y}}{\lVert\mathbf{x}\rVert\lVert\mathbf{y}\rVert}$; $d_{\cos}=1-s_{\cos}$ | cosine is similarity, not distance; both vectors must be nonzero |
| $c_i=\arg\min_k\lVert\mathbf{x}_i-\boldsymbol\mu_k\rVert^2$; $\boldsymbol\mu_k=\frac1{|C_k|}\sum_{\mathbf{x}_i\in C_k}\mathbf{x}_i$ | one epoch: assign all points using fixed centres, then average each group |
| $\mathrm{SSE}=\sum_k\sum_{\mathbf{x}_i\in C_k}\lVert\mathbf{x}_i-\boldsymbol\mu_k\rVert^2$ | K-means objective; also WCSS; $K$ is specified, seeds affect the local solution |
| K-means++: $P(\mathbf{x})=D(\mathbf{x})^2/\sum_{\mathbf{z}}D(\mathbf{z})^2$ | $D$ is distance to the nearest chosen centre; sample randomly, weighted by squared distance |
| single-link $=\min_{x\in A,y\in B}d(x,y)$; complete-link $=\max_{x\in A,y\in B}d(x,y)$ | closest / farthest cross-cluster pair |
| average-link $=\frac1{|A||B|}\sum_{x\in A,y\in B}d(x,y)$ | mean of all cross-cluster distances |
| $\Delta_{\rm Ward}=\frac{|A||B|}{|A|+|B|}\lVert\mu_A-\mu_B\rVert^2$ | Ward's increase in SSE when merging |
| $N_\epsilon(x)=\{y:d(x,y)\le\epsilon\}$; core if $|N_\epsilon(x)|\ge\mathrm{MinPts}$ | count self and include the boundary; compare $d^2\le\epsilon^2$ |
| border = non-core within epsilon of a core; noise = neither | connect core points, attach border points; a border point cannot bridge core components |

HW08 check: one K-means epoch gives centres $(2,10),(6,6),(1.5,3.5)$ and SSE 37. DBSCAN with MinPts 2 counting self: epsilon 2 gives 2 clusters / 3 noise; epsilon $\sqrt{10}$ gives 3 clusters / 0 noise. See the clustering lesson for memberships and the full calculations.
