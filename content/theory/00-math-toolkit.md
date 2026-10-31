---
slug: math-toolkit
num: 0
title: Math toolkit
short: Math toolkit
summary: All the notation and math the course uses, explained from zero with small worked examples. Read this first if formulas look like a foreign language.
---
Machine learning formulas look scary because they pack a lot into a few symbols. Underneath, almost everything in this course is built from **eight skills**: reading notation, sums (Σ), logarithms, exponentials, probability, derivatives, vectors/matrices, and "find the best value" (argmin/argmax). This page teaches each one with numbers you can check on a calculator.

:::tip How to use this page
Read it once now. Then whenever a lesson says "see Math toolkit", jump back to the matching section. You do not need to memorise proofs. You only need to be able to *read* a formula and *plug numbers in*.
:::

## Reading notation

| Symbol | Read it as | Example |
|---|---|---|
| $x_i$ | "x sub i": the $i$-th item in a list | if $x = (4, 7, 9)$ then $x_2 = 7$ |
| $x_{ij}$ | row $i$, column $j$ of a table | feature $j$ of example $i$ |
| $\mathbf{x}$ (bold) | a **vector**: a list of numbers | $\mathbf{x} = (1, 2104, 5)$ |
| $X$ (capital) | a **matrix**: a table of numbers, or a random variable | |
| $m$ or $N$ | number of training examples | $m = 4$ data points |
| $n$ or $d$ | number of features (columns) | |
| $\in$ | "belongs to" / "is one of" | $y \in \{0, 1\}$: $y$ is 0 or 1 |
| $\mathbb{R}$, $\mathbb{R}^n$ | real numbers; lists of $n$ real numbers | $\mathbf{x} \in \mathbb{R}^3$ |
| $:=$ | "becomes" (update the value) | $w := w - 0.1$ |
| $\approx$ | approximately equal | $h(x) \approx f(x)$ |
| $\sim$ | "is drawn from the distribution" | $x \sim \mathcal{N}(0, 1)$ |
| $\hat{y}$, $\hat{f}$ ("hat") | an **estimate** or prediction | $\hat{y}$ = predicted $y$ |
| $\theta$, $\mathbf{w}$ | the model's **parameters** (the numbers we learn) | |
| $h(x)$ | the **hypothesis** = our model's prediction for input $x$ | $h(x) = 2 + 3x$ |
| $P(A \mid B)$ | probability of $A$ **given** $B$ is known | |
| $\lVert \mathbf{w} \rVert$ | length (norm) of the vector $\mathbf{w}$ | |

:::tip The single most useful habit
When you meet a formula, say it out loud in words, symbol by symbol. "$J$ equals one over two $m$, times the sum for $i$ from 1 to $m$, of $h$ of $x_i$ minus $y_i$, squared." Once you can *say* it, you can compute it.
:::

## Sums (Σ) and products (Π)

:::formula Sum
$$\sum_{i=1}^{m} a_i = a_1 + a_2 + \dots + a_m$$
:::

:::read
- $\Sigma$ (capital sigma) means **add up**.
- The bottom $i=1$ says where the counter $i$ starts; the top $m$ says where it stops.
- Everything to the right of $\Sigma$ is what you add, once for each value of $i$.
:::

:::example Compute a sum
Data: $x = (-1, 0, 1, 2)$, so $m = 4$.

- $\sum_{i=1}^{4} x_i = -1 + 0 + 1 + 2 = 2$
- $\sum_{i=1}^{4} x_i^2 = 1 + 0 + 1 + 4 = 6$ (square **first**, then add)
- $\sum_{i=1}^{4} 3x_i = 3 \cdot 2 = 6$ (a constant can be pulled out of a sum)
:::

:::formula Product
$$\prod_{i=1}^{m} a_i = a_1 \times a_2 \times \dots \times a_m$$
:::

$\Pi$ (capital pi) is the same idea but you **multiply**. It appears in likelihoods: the probability of independent events all happening is the product of their probabilities.

:::example
Three coin tosses H, T, H with $P(H) = 0.6$: $\prod P = 0.6 \times 0.4 \times 0.6 = 0.144$.
:::

:::pitfall
$\left(\sum x_i\right)^2 \ne \sum x_i^2$. With $x = (1, 2)$: $(1+2)^2 = 9$ but $1^2 + 2^2 = 5$. Look at where the bracket and the power are.
:::

## Logarithms

A logarithm answers: **"what power do I raise the base to, to get this number?"**

:::formula
$$\log_b(a) = c \iff b^c = a$$
:::

:::example
- $\log_2 8 = 3$ because $2^3 = 8$.
- $\log_2 \tfrac{1}{2} = -1$ because $2^{-1} = \tfrac12$.
- $\log_2 1 = 0$ because $2^0 = 1$ (for any base).
- $\ln$ means $\log_e$ with $e \approx 2.71828$. $\ln e = 1$.
:::

**Rules you will use** (they turn products into sums, which is why ML loves logs):

| Rule | Example |
|---|---|
| $\log(ab) = \log a + \log b$ | $\log_2(4 \cdot 8) = 2 + 3 = 5$ |
| $\log(a/b) = \log a - \log b$ | $\log_2(1/4) = 0 - 2 = -2$ |
| $\log(a^k) = k \log a$ | $\log_2(8^2) = 2 \cdot 3 = 6$ |
| $\log_2 x = \dfrac{\ln x}{\ln 2}$ | $\log_2 5 = 1.6094/0.6931 = 2.3219$ |

:::steps Computing $\log_2$ on a calculator
1. Many calculators have a $\log_{\square}\square$ key. If not, use the change-of-base rule.
2. Type `ln(x) ÷ ln(2)` (or `log(x) ÷ log(2)`; both work).
3. Example: $\log_2(0.6) = \ln 0.6 / \ln 2 = -0.5108 / 0.6931 = -0.737$.
4. Logs of numbers **between 0 and 1 are negative**. That is why entropy has a minus sign in front: it makes the result positive.
:::

:::note Convention
$0 \cdot \log 0$ is treated as $0$. (A class with zero examples contributes nothing to entropy.)
:::

**Why logs in ML?** A likelihood is a product of many small probabilities, e.g. $0.6^{40} \times 0.4^{60}$. That number is tiny and hard to differentiate. Its log, $40\ln 0.6 + 60\ln 0.4$, is a simple sum. And because $\log$ always goes up when its input goes up, the $\theta$ that maximises the likelihood also maximises the log-likelihood.

## Exponentials and the sigmoid

$e^x$ (also written $\exp(x)$) is "2.71828 to the power $x$". Facts: $e^0 = 1$; $e^x > 0$ always; $e^{-x} = 1/e^x$; $\ln(e^x) = x$.

:::formula Sigmoid (logistic) function
$$\sigma(z) = \frac{1}{1 + e^{-z}}$$
:::

:::read
- Input $z$: any real number (it can be negative or huge).
- Output: always between 0 and 1, so it can be read as a **probability**.
- $\sigma(0) = 0.5$; big positive $z$ gives a value near 1; big negative $z$ gives a value near 0.
- Symmetry: $\sigma(-z) = 1 - \sigma(z)$.
:::

:::example
$\sigma(2) = \dfrac{1}{1 + e^{-2}} = \dfrac{1}{1 + 0.1353} = 0.8808$. And $\sigma(-2) = 1 - 0.8808 = 0.1192$.
:::

## Probability basics

| Notation | Meaning |
|---|---|
| $P(A)$ | probability that $A$ happens, between 0 and 1 |
| $P(A, B)$ or $P(A \cap B)$ | probability that **both** happen (joint) |
| $P(A \mid B)$ | probability of $A$ **when we already know** $B$ happened (conditional) |
| $P(\neg A)$, $P(\bar A)$ | probability that $A$ does **not** happen $= 1 - P(A)$ |

:::formula Conditional probability and Bayes' rule
$$P(A \mid B) = \frac{P(A, B)}{P(B)} \qquad\qquad P(A \mid B) = \frac{P(B \mid A)\,P(A)}{P(B)}$$
:::

:::example Counting version
In a class of 10 students, 4 wear glasses and 3 of those 4 are girls. $P(\text{girl} \mid \text{glasses}) = 3/4$: restrict to the glasses group (4 people), then count girls (3).
:::

The full treatment (sum rule, product rule, independence, distributions) is in Lecture 2.

## Derivatives

A derivative tells you the **slope**: how fast a function goes up or down when you nudge its input. At the bottom of a valley the slope is **zero**, which is how we find the best parameters.

:::formula Rules you need (all of them)
| Function $f(x)$ | Derivative $f'(x)$ or $\frac{d}{dx}f$ |
|---|---|
| constant $c$ | $0$ |
| $x$ | $1$ |
| $x^k$ | $k\,x^{k-1}$ |
| $c \cdot g(x)$ | $c \cdot g'(x)$ |
| $g(x) + h(x)$ | $g'(x) + h'(x)$ |
| $\ln x$ | $1/x$ |
| $e^x$ | $e^x$ |
| $g(u(x))$ (chain rule) | $g'(u) \cdot u'(x)$ |
:::

:::example Chain rule on a squared error
$f(w) = (3w - 6)^2$. Outer function $u^2$ with $u = 3w - 6$.
$$f'(w) = 2u \cdot u' = 2(3w - 6)\cdot 3 = 18w - 36$$
Setting $f'(w) = 0$ gives $w = 2$, and indeed $f(2) = 0$ is the minimum.
:::

**Partial derivatives** ($\partial$, "partial"): when a function has several inputs, $\dfrac{\partial J}{\partial w_1}$ means "differentiate with respect to $w_1$ and **treat every other variable as a fixed number**".

:::example Partial derivatives of one squared error
$J(w_0, w_1) = \tfrac12(w_0 + w_1 x - y)^2$ for one point $(x, y)$. Let $e = w_0 + w_1x - y$ (the error).
- $\dfrac{\partial J}{\partial w_0} = \tfrac12 \cdot 2e \cdot 1 = e$ (because $\partial e/\partial w_0 = 1$)
- $\dfrac{\partial J}{\partial w_1} = \tfrac12 \cdot 2e \cdot x = e\,x$ (because $\partial e/\partial w_1 = x$)

This is exactly where the gradient-descent formulas in Lecture 3 come from: average these over all $m$ points.
:::

The **gradient** $\nabla J$ ("nabla J") is the list of all partial derivatives: $\nabla J = \left(\frac{\partial J}{\partial w_0}, \frac{\partial J}{\partial w_1}, \dots\right)$. It points uphill; gradient descent steps the opposite way.

## Vectors and matrices

**Vector:** a column of numbers, $\mathbf{w} = \begin{bmatrix} w_0 \\ w_1 \end{bmatrix}$. Its **transpose** $\mathbf{w}^T = [w_0\ \ w_1]$ is the same numbers lying flat.

:::formula Dot product
$$\mathbf{w}^T\mathbf{x} = \sum_j w_j x_j = w_0x_0 + w_1x_1 + \dots$$
:::

:::example
$\mathbf{w} = (2, 3)$, $\mathbf{x} = (1, 4)$: $\mathbf{w}^T\mathbf{x} = 2\cdot1 + 3\cdot4 = 14$. With $x_0 = 1$, this is the linear model $h(x) = w_0 + w_1x$ evaluated at $x = 4$.
:::

**Matrix multiplication** $AB$: entry (row $i$, column $j$) of the result = dot product of **row $i$ of $A$** with **column $j$ of $B$**. Sizes must match: $(a \times b)(b \times c) = (a \times c)$.

:::example Compute $X^TX$ and $X^T\mathbf{y}$ (used in every normal-equation question)
$$X = \begin{bmatrix}1 & -1\\ 1 & 0\\ 1 & 1\\ 1 & 2\end{bmatrix},\quad \mathbf{y} = \begin{bmatrix}0\\2\\4\\5\end{bmatrix}$$
$X^T$ has rows $(1,1,1,1)$ and $(-1,0,1,2)$.
- Top-left of $X^TX$: $(1,1,1,1)\cdot(1,1,1,1) = 4$ = number of points $m$.
- Off-diagonal: $(1,1,1,1)\cdot(-1,0,1,2) = 2 = \sum x_i$.
- Bottom-right: $(-1,0,1,2)\cdot(-1,0,1,2) = 6 = \sum x_i^2$.
- $X^T\mathbf{y} = \big((1,1,1,1)\cdot\mathbf{y},\ (-1,0,1,2)\cdot\mathbf{y}\big) = (11,\ 14) = (\sum y_i, \sum x_iy_i)$.
$$X^TX = \begin{bmatrix}4 & 2\\ 2 & 6\end{bmatrix},\qquad X^T\mathbf{y} = \begin{bmatrix}11\\ 14\end{bmatrix}$$
**Shortcut:** for one feature, $X^TX = \begin{bmatrix} m & \sum x\\ \sum x & \sum x^2\end{bmatrix}$ and $X^T\mathbf{y} = \begin{bmatrix}\sum y\\ \sum xy\end{bmatrix}$. Build a table of $x, y, x^2, xy$ and add the columns.
:::

:::formula Inverse of a 2×2 matrix
$$\begin{bmatrix} a & b\\ c & d\end{bmatrix}^{-1} = \frac{1}{ad - bc}\begin{bmatrix} d & -b\\ -c & a\end{bmatrix}$$
:::

:::steps
1. Compute the determinant $ad - bc$. If it is 0, there is no inverse.
2. Swap $a$ and $d$; flip the signs of $b$ and $c$.
3. Divide every entry by the determinant.
4. Check: $\begin{bmatrix}4&2\\2&6\end{bmatrix}^{-1} = \frac{1}{24-4}\begin{bmatrix}6&-2\\-2&4\end{bmatrix} = \begin{bmatrix}0.3&-0.1\\-0.1&0.2\end{bmatrix}$.
:::

**Identity matrix** $I$: 1s on the diagonal, 0 elsewhere. $AI = A$ and $A^{-1}A = I$.

## Norms (length of a vector)

| Name | Formula | Example $\mathbf{w} = (3, -4)$ |
|---|---|---|
| L2 norm | $\lVert\mathbf{w}\rVert_2 = \sqrt{\sum w_j^2}$ | $\sqrt{9 + 16} = 5$ |
| squared L2 | $\lVert\mathbf{w}\rVert_2^2 = \sum w_j^2 = \mathbf{w}^T\mathbf{w}$ | $25$ |
| L1 norm | $\lVert\mathbf{w}\rVert_1 = \sum \lvert w_j\rvert$ | $3 + 4 = 7$ |

Ridge regression adds $\lambda\lVert\mathbf{w}\rVert_2^2$; Lasso adds $\lambda\lVert\mathbf{w}\rVert_1$ (Lecture 7). The SVM margin is $2/\lVert\mathbf{w}\rVert$ (Lecture 6).

## Distances and averages for clustering

Lecture 8 compares points and replaces a group of points with its **centroid** (average point). A point such as $(2, 5)$ has two coordinates: first 2, then 5.

:::formula Distance between two points
$$d_1(\mathbf{x},\mathbf{z}) = \sum_{j=1}^{d}|x_j-z_j|, \qquad d_2(\mathbf{x},\mathbf{z}) = \sqrt{\sum_{j=1}^{d}(x_j-z_j)^2}$$
:::

:::read
- $d$ is the number of coordinates; $j$ visits them one at a time.
- Subtract the matching coordinates. For **Manhattan / L1** distance, remove the minus signs with absolute values and add. For **Euclidean / L2** distance, square the differences, add, then take the square root.
- Squared Euclidean distance $d_2^2$ skips the square root. It gives the same nearest point as $d_2$, because square roots preserve the order of nonnegative numbers.
:::

:::example
For $\mathbf{x}=(1,2)$ and $\mathbf{z}=(4,6)$, the differences are $-3,-4$. L1 distance is $3+4=7$. L2 distance is $\sqrt{9+16}=5$. Squared L2 distance is $25$.
:::

:::formula A centroid is a coordinate-by-coordinate average
$$\mu_j = \frac{1}{|C|}\sum_{\mathbf{x}\in C}x_j$$
:::

:::read
$C$ is a cluster (a group of points), $|C|$ counts its points, and $\mu_j$ is coordinate $j$ of its centroid. The notation $\mathbf{x}\in C$ means "for every point in this cluster". Add the first coordinates and divide by the number of points; then repeat for the second coordinates.
:::

:::steps
For points $(1,2),(3,4),(5,3)$, there are $|C|=3$ points. The first coordinate is $(1+3+5)/3=3$; the second is $(2+4+3)/3=3$. Their centroid is $(3,3)$, even though it is not one of the original points.
:::

## Max, min, argmax, argmin

- $\max_x f(x)$ = the **highest value** of $f$.
- $\arg\max_x f(x)$ = the **input $x$** that gives the highest value.

:::example
$f(\text{cat}) = 0.2,\ f(\text{dog}) = 0.7,\ f(\text{bird}) = 0.1$. Then $\max f = 0.7$ and $\arg\max f = \text{dog}$. A classifier predicts the **argmax** class.
:::

**How to find a minimum by hand:** take the derivative, set it to 0, solve. That is the whole idea behind MLE (Lecture 2) and the normal equation (Lecture 3).

## Counting: combinations

:::formula
$$\binom{n}{k} = \frac{n!}{k!\,(n-k)!}, \qquad n! = 1 \cdot 2 \cdots n$$
:::

$\binom{n}{k}$ ("n choose k") counts the ways to pick $k$ items out of $n$. Example: $\binom{4}{2} = \frac{24}{2 \cdot 2} = 6$. It appears in the binomial distribution (Lecture 2) and the ensemble error (Lecture 7).

## Constrained optimisation (Lagrange multipliers)

Sometimes we must maximise something **subject to a rule**, e.g. probabilities must add to 1 ($\sum_k \theta_k = 1$). The trick:

:::steps
1. Write the objective $f$ and the constraint as $g = 0$ (e.g. $g = \sum_k\theta_k - 1$).
2. Build $\mathcal{L} = f + \lambda g$ ($\lambda$ is a new helper unknown).
3. Set the derivative of $\mathcal{L}$ with respect to every unknown to 0.
4. Solve, then use the constraint to find $\lambda$.
:::

Used in Homework 1 Exercise 2 (dice MLE) and in the SVM derivation (Lecture 6).

## English–Vietnamese glossary

| English | Tiếng Việt |
|---|---|
| feature / attribute | đặc trưng / thuộc tính |
| label / target | nhãn / biến mục tiêu |
| training set / test set | tập huấn luyện / tập kiểm tra |
| hypothesis | giả thuyết (hàm dự đoán) |
| cost / loss function | hàm chi phí / hàm mất mát |
| gradient descent | hạ gradient (giảm dần độ dốc) |
| learning rate | tốc độ học |
| likelihood | hàm hợp lý |
| maximum likelihood estimation (MLE) | ước lượng hợp lý cực đại |
| prior / posterior | tiên nghiệm / hậu nghiệm |
| entropy / information gain | entropy / độ lợi thông tin |
| overfitting / underfitting | quá khớp / chưa khớp |
| regularization | chính quy hoá |
| bias / variance | độ chệch / phương sai |
| ensemble, bagging, boosting | kết hợp mô hình, bagging, boosting |
| support vector machine | máy vector hỗ trợ |
| margin | lề |
| cluster / centroid | cụm / tâm cụm |
| core / border / noise point | điểm nhân / điểm biên / điểm nhiễu |
| hierarchical clustering / dendrogram | phân cụm phân cấp / biểu đồ cây |
