---
slug: formula-sheet
num: 99
title: Formula sheet
short: Formula sheet
summary: Key midterm formulas grouped by lecture, each with a one-line reminder of what it means.
---
Print this page (Ctrl+P hides the menus) or read it the night before. Each formula has a homework-based priority; select its badge for the reason. The lesson pages explain the grade and how to compute the formula.

## Probability (L2)

| Priority | Formula | Meaning |
|---|---|---|
| {{priority:prob-sum-rule}} | $p(X) = \sum_Y p(X, Y)$ | sum rule: marginal = add the joint over the other variable |
| {{priority:prob-product-rule}} | $p(X, Y) = p(Y \mid X)\,p(X)$ | product rule |
| {{priority:prob-bayes}} | $p(A \mid B) = \dfrac{p(B \mid A)\,p(A)}{p(B)}$ | Bayes: posterior ∝ likelihood × prior |
| {{priority:prob-independence}} | $p(x, y) = p(x)\,p(y)$ | independence |
| {{priority:prob-expectation-discrete}} | $E[X] = \sum_x x\,p(x)$ | expected value |
| {{priority:prob-variance}} | $\mathrm{Var}[X] = E[X^2] - E[X]^2$ | variance / spread |
| {{priority:prob-variance-properties}} | $\mathrm{Var}[CX] = C^2\mathrm{Var}[X]$, $\mathrm{Var}[X + C] = \mathrm{Var}[X]$ | constants |
| {{priority:prob-bernoulli}} | $\mathrm{Bern}: \lambda^x(1-\lambda)^{1-x}$ | one yes/no trial |
| {{priority:prob-binomial}} | $\mathrm{Bin}: \binom{n}{k}p^k(1-p)^{n-k}$ | $k$ successes in $n$ trials; mean $np$ |
| {{priority:prob-gaussian}} | $\mathcal{N}: \frac{1}{\sqrt{2\pi\sigma^2}}e^{-(x-\mu)^2/(2\sigma^2)}$ | Gaussian |
| {{priority:prob-exponential}} | $\mathrm{Exp}: \lambda e^{-\lambda x}$ | waiting times |

## Information (L2, L5, L7)

| Priority | Formula | Meaning |
|---|---|---|
| {{priority:prob-entropy}} | $H(X) = -\sum_i p_i\log_2 p_i$ | entropy: 0 if pure, 1 for a 50/50 binary split |
| {{priority:prob-cross-entropy}} | $H(p, q) = -\sum_x p(x)\log q(x)$ | cross-entropy (classification loss) |
| {{priority:prob-kl-divergence}} | $D_{KL}(P\|Q) = \sum_x P(x)\log\frac{P(x)}{Q(x)} = H(P,Q) - H(P)$ | KL ≥ 0, not symmetric, ∞ if Q is zero where P is positive |
| {{priority:prob-mutual-information}} | $I(X;Y) = H(X) - H(X \mid Y)$ | mutual information = information gain |

## MLE / MAP (L2, L4)

| Priority | Formula | Meaning |
|---|---|---|
| {{priority:prob-mle-recipe}} | $\hat\theta_{MLE} = \arg\max_\theta\prod_i p(x_i \mid \theta) = \arg\max_\theta\sum_i\log p(x_i \mid \theta)$ | maximise (log-)likelihood |
| {{priority:prob-coin-mle}} | Coin: $\hat\theta = s/N$ | MLE = proportion of heads |
| {{priority:prob-categorical-mle}} | Die: $\hat\theta_k = N_k/N$ | MLE = relative frequency of each face |
| {{priority:classification-map}} | $h_{MAP} = \arg\max_h P(D \mid h)P(h)$ | MAP includes the prior |
| {{priority:classification-mle}} | $h_{ML} = \arg\max_h P(D \mid h)$ | MLE; agrees with MAP for a uniform prior |
| {{priority:classification-gaussian-mle}} | Gaussian noise ⟹ MLE = least squares; Laplace noise ⟹ least absolute error | |

## Linear regression (L3)

| Priority | Formula | Meaning |
|---|---|---|
| {{priority:regression-univariate-model}} | $h(\vec{x}) = \vec{w}^T\vec{x} = w_0 + w_1x_1 + \dots$ ($x_0 = 1$) | model |
| {{priority:regression-squared-cost}} | $J(\vec{w}) = \frac{1}{2m}\sum_i(h(\vec{x}_i) - y_i)^2$ | cost (MSE) |
| {{priority:regression-batch-gradient}} | $\frac{\partial J}{\partial w_j} = \frac1m\sum_i(h(\vec{x}_i) - y_i)x_{ij}$ | gradient ($x_{i0} = 1$) |
| {{priority:regression-gradient-update}} | $w_j := w_j - \alpha\frac{\partial J}{\partial w_j}$ (simultaneously) | gradient descent |
| {{priority:regression-normal-equation}} | $\vec{w} = (X^TX)^{-1}X^T\vec{y}$ | normal equation |
| {{priority:regression-normal-equation}} | $X^TX = \begin{bmatrix}m & \sum x\\ \sum x & \sum x^2\end{bmatrix}$, $X^T\vec{y} = \begin{bmatrix}\sum y\\ \sum xy\end{bmatrix}$ | one-feature shortcut |
| {{priority:regression-univariate-shortcut}} | $w_1 = \frac{m\sum xy - \sum x\sum y}{m\sum x^2 - (\sum x)^2}$, $w_0 = \bar y - w_1\bar x$ | same, without matrices |
| {{priority:math-matrix-inverse}} | $\begin{bmatrix}a&b\\c&d\end{bmatrix}^{-1} = \frac{1}{ad - bc}\begin{bmatrix}d&-b\\-c&a\end{bmatrix}$ | 2×2 inverse |
| {{priority:regression-ridge-solution}} | $\vec{w} = (X^TX + \lambda L)^{-1}X^T\vec{y}$ | ridge analytical solution |
| {{priority:regression-ridge-update}} | $w_j := w_j(1 - \frac{\alpha\lambda}{m}) - \frac{\alpha}{m}\sum_i e_ix_{ij}$ | ridge gradient update |

## Naive Bayes and logistic regression (L4)

| Priority | Formula | Meaning |
|---|---|---|
| {{priority:classification-naive-bayes}} | $\hat y = \arg\max_k P(C_k)\prod_j P(x_j \mid C_k)$ | Naive Bayes |
| {{priority:classification-conditional-frequency}} | $P(x_j = v \mid C_k) = \frac{\#(v, C_k)}{\#C_k}$ | conditional frequency (MLE) |
| {{priority:classification-laplace-smoothing}} | $P(x_j = v \mid C_k) = \frac{\#(v, C_k)+1}{\#C_k+|V|}$ | Laplace / add-one smoothing |
| {{priority:classification-sigmoid}} | $\sigma(z) = \frac{1}{1 + e^{-z}}$ | sigmoid |
| {{priority:classification-sigmoid-identities}} | $\sigma(-z) = 1-\sigma(z)$, $\sigma' = \sigma(1-\sigma)$ | sigmoid identities |
| {{priority:classification-logistic-model}} | $P(y = 1 \mid \vec{x}) = \sigma(\vec{w}^T\vec{x})$; labels ±1: $p(y \mid \vec{x}) = \sigma(y\,\vec{w}^T\vec{x})$ | logistic regression |
| {{priority:classification-linear-score}} | boundary: $\vec{w}^T\vec{x} = 0$ | where $P = 0.5$ |
| {{priority:classification-logistic-loss}} | loss $\sum_i\ln(1 + e^{-y_i\vec{w}^T\vec{x}_i})$ | logistic loss for labels ±1 |
| {{priority:classification-logistic-gradient}} | $\nabla J=\sum_i(\sigma(\vec{w}^T\vec{x}_i)-y_i)\vec{x}_i$ | logistic gradient for labels 0/1 |
| {{priority:classification-softmax}} | softmax $p(C_k \mid \vec{x}) = \frac{e^{\vec{w}_k^T\vec{x}}}{\sum_j e^{\vec{w}_j^T\vec{x}}}$ | multi-class |

## Decision trees (L5)

| Priority | Formula | Meaning |
|---|---|---|
| {{priority:tree-gini}} | $\text{Gini} = 1 - \sum_i p_i^2$ (2 classes: $2p(1-p)$, max 0.5) | impurity |
| {{priority:tree-entropy}} | $\text{Entropy} = -\sum_i p_i\log_2 p_i$ (max 1 for 2 classes) | impurity |
| {{priority:tree-classification-error}} | $\text{Error} = 1 - \max_i p_i$ | impurity |
| {{priority:tree-information-gain}} | $\text{Gain} = H(\text{parent}) - \sum_i\frac{n_i}{n}H(\text{child}_i)$ | entropy information gain; pick the largest |
| {{priority:tree-gain-ratio}} | $\text{SplitInfo} = -\sum_i\frac{n_i}{n}\log_2\frac{n_i}{n}$, $\text{GainRatio} = \frac{\text{Gain}}{\text{SplitInfo}}$ | penalises many small branches |

## SVM (L6)

| Priority | Formula | Meaning |
|---|---|---|
| {{priority:svm-linear-classifier}} | $f(\vec{x}) = \mathrm{sgn}(\vec{w}^T\vec{x} + b)$ | classifier |
| {{priority:svm-point-distance}} | distance $= \frac{|\vec{w}^T\vec{x} + b|}{\lVert\vec{w}\rVert}$ | point-to-boundary distance |
| {{priority:svm-margin}} | margin $= \frac{2}{\lVert\vec{w}\rVert}$ | full canonical margin |
| {{priority:svm-hard-margin}} | hard: $\min\frac12\lVert\vec{w}\rVert^2$ s.t. $y_i(\vec{w}^T\vec{x}_i + b) \ge 1$ | max margin |
| {{priority:svm-soft-margin}} | soft: $\min\frac12\lVert\vec{w}\rVert^2 + C\sum_i\xi_i$ s.t. $y_i(\vec{w}^T\vec{x}_i + b) \ge 1 - \xi_i$ | large C: low bias, high variance |
| {{priority:svm-hinge-loss}} | hinge $\max(0, 1 - y f(\vec{x}))$ | SVM loss |
| {{priority:svm-perceptron}} | perceptron: if wrong, $\vec{w} \leftarrow \vec{w} + y_i\vec{x}_i$, $b \leftarrow b + y_i$ | |
| {{priority:svm-dual}} | $\vec{w} = \sum_i\alpha_iy_i\vec{x}_i$; support vectors: $\alpha_i > 0$ | dual |
| {{priority:svm-linear-kernel}} | $\kappa(\vec{x},\vec{z})=\vec{x}^T\vec{z}$ | linear kernel / dot product |
| {{priority:svm-polynomial-kernel}} | $\kappa(\vec{x},\vec{z})=(\vec{x}^T\vec{z}/a+b)^d$ | polynomial kernel; HW06 uses degree 2 and offset 1 |
| {{priority:svm-rbf-kernel}} | $\kappa(\vec{x},\vec{z})=e^{-\gamma\lVert\vec{x}-\vec{z}\rVert^2}$ | RBF kernel |
| {{priority:svm-one-vs-one}} | one-vs-rest: $k$ SVMs; one-vs-one: $k(k-1)/2$ | multi-class |

## Model optimisation (L7)

| Priority | Formula | Meaning |
|---|---|---|
| {{priority:optimization-bias-variance}} | $E[(Y - \hat f)^2] = \sigma^2 + \text{bias}^2 + \text{variance}$ | bias–variance |
| {{priority:optimization-excess-risk}} | excess risk = estimation error + approximation error | |
| {{priority:optimization-ridge}} | ridge $+\lambda\lVert\vec{w}\rVert_2^2$ | L2 regularisation |
| {{priority:optimization-lasso}} | lasso $+\lambda\lVert\vec{w}\rVert_1$ | L1 regularisation; sparse weights |
| {{priority:optimization-chi-square}} | $\chi^2 = \sum\frac{(O - E)^2}{E}$, $E = \frac{\text{row} \times \text{col}}{\text{total}}$ | filter feature selection |
| {{priority:optimization-bootstrap-omission}} | $(1 - \frac1n)^n \to \frac1e \approx 0.37$ | fraction left out of a bootstrap sample |
| {{priority:optimization-binomial-majority}} | $P(\text{majority wrong}) = \sum_{i > T/2}\binom{T}{i}\varepsilon^i(1-\varepsilon)^{T-i}$ | ensemble of $T$ independent voters |
| {{priority:optimization-reject-option}} | reject if $\max_j p(j \mid x) < 1 - \frac{\lambda_r}{\lambda_s}$ | reject option (HW5) |
| {{priority:optimization-lasso-coordinate}} | Lasso coordinate: $z_j=\sum_i x_{ij}^2$, $\rho_j=\sum_i x_{ij}(y_i-\sum_{k\ne j}x_{ik}\theta_k)$ | squared-loss derivative $z_j\theta_j-\rho_j$ (HW07) |
| {{priority:optimization-binomial-majority}} | $P(\text{strict majority correct})=\sum_{k=\lfloor M/2\rfloor+1}^M\binom{M}{k}\theta^k(1-\theta)^{M-k}$ | independent voters, each correct with probability $\theta$; ties excluded |

## Clustering (L8)

| Priority | Formula | Meaning |
|---|---|---|
| {{priority:clustering-manhattan-distance}} | $d_1(\vec{x},\vec{z})=\sum_j|x_j-z_j|$ | Manhattan distance; L1 slide exercises |
| {{priority:clustering-euclidean-distance}} | $d_2(\vec{x},\vec{z})=\sqrt{\sum_j(x_j-z_j)^2}$ | Euclidean distance; HW08 convention |
| {{priority:clustering-cosine-similarity}} | $\cos(\vec{x},\vec{z})=\frac{\vec{x}^T\vec{z}}{\|\vec{x}\|_2\|\vec{z}\|_2}$ | similarity: larger means more aligned; nonzero vectors |
| {{priority:clustering-kmeans-assignment}} | $c(i)=\arg\min_k\|\vec{x}_i-\vec{\mu}_k\|_2^2$ | k-means assignment; state tie rule |
| {{priority:clustering-centroid}} | $\vec{\mu}_k=\frac{1}{|C_k|}\sum_{i\in C_k}\vec{x}_i$ | centroid update; handle empty clusters explicitly |
| {{priority:clustering-sse}} | $\mathrm{SSE}=\sum_k\sum_{i\in C_k}\|\vec{x}_i-\vec{\mu}_k\|_2^2$ | k-means objective / WCSS; lower for the same data and K |
| {{priority:clustering-kmeans-cost}} | $O(nKId)$ | k-means time: points × clusters × iterations × coordinates |
| {{priority:clustering-kmeanspp}} | $P(\vec{x}\text{ chosen next})=\frac{D(\vec{x})^2}{\sum_{\vec{z}}D(\vec{z})^2}$ | k-means++: distance to the nearest chosen centre |
| {{priority:clustering-linkage}} | $d_{\mathrm{single}}(A,B)=\min_{a\in A,b\in B}d(a,b)$; $d_{\mathrm{complete}}(A,B)=\max_{a\in A,b\in B}d(a,b)$ | HAC nearest / furthest pair |
| {{priority:clustering-linkage}} | $d_{\mathrm{avg}}(A,B)=\frac{\sum_{a\in A,b\in B}d(a,b)}{|A||B|}$ | average linkage: every cross-cluster pair |
| {{priority:clustering-ward}} | $\Delta\mathrm{SSE}=\frac{|A||B|}{|A|+|B|}\|\vec{\mu}_A-\vec{\mu}_B\|_2^2$ | Ward: merge with the smallest increase in SSE |
| {{priority:clustering-dbscan}} | $N_\varepsilon(p)=\{q:d(p,q)\le\varepsilon\}$; core if $|N_\varepsilon(p)|\ge\mathrm{MinPts}$ | DBSCAN; count the point itself; border = non-core neighbour of a core |
| {{priority:clustering-davies-bouldin}} | $\mathrm{DB}=\frac1K\sum_i\max_{j\ne i}\frac{S_i+S_j}{\|\vec{\mu}_i-\vec{\mu}_j\|_2}$, $S_i=\frac{1}{|C_i|}\sum_{\vec{x}\in C_i}\|\vec{x}-\vec{\mu}_i\|_2$ | Davies–Bouldin: lower is better; distinct centroids |
| {{priority:clustering-dunn}} | $\mathrm{Dunn}=\frac{\min_{i\ne j}\min_{x\in C_i,z\in C_j}d(x,z)}{\max_k\max_{x,z\in C_k}d(x,z)}$ | smallest separation / largest diameter: higher is better |
| {{priority:clustering-silhouette}} | $a(i)=\frac{\sum_{j\in C_i,j\ne i}d(i,j)}{|C_i|-1}$; $b(i)=\min_{C\ne C_i}\frac{\sum_{j\in C}d(i,j)}{|C|}$ | silhouette: own-cluster mean vs best other-cluster mean |
| {{priority:clustering-silhouette}} | $s(i)=\frac{b(i)-a(i)}{\max\{a(i),b(i)\}}\in[-1,1]$ | near 1 is good; singleton or zero denominator: use 0 |

For the L1-distance exercise on L8 p26/p51, follow its stated distance and specify ties; the usual squared-Euclidean k-means objective above has a mean update. A pure L1 objective uses coordinate medians instead. The lesson also explains the corrected silhouette divisor and Davies–Bouldin definition from p56/p58.
