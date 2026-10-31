---
slug: l5-decision-tree
num: 5
title: Classification (2) – Decision Trees
short: Decision trees
summary: How a decision tree predicts, Hunt's algorithm, test conditions for each attribute type, and the impurity measures used to choose splits: Gini index, entropy and information gain, gain ratio, classification error, all with worked numbers.
---
Decision trees are the friendliest calculation topic: everything is **counting** plus Gini or entropy. The slide deck itself asks "Which test condition is the best?" twice, which is exactly an exam question. Homework 5 asks for random-forest pseudocode, which builds on this lecture (see Lecture 7 for bagging).

:::exam What the midterm can ask from this lecture
- Trace a tree to classify a new record.
- Compute Gini, entropy or classification error of a node from its class counts.
- Compute the **weighted** impurity after a split and the **gain**; pick the best attribute.
- Why information gain prefers many-valued attributes (Customer ID) and how **gain ratio** fixes it.
- Binary vs multi-way splits; ordinal splits must keep the order; continuous attributes use a threshold.
- Advantages and disadvantages of decision trees.
:::

## What a decision tree is

A tree of questions (p3): **internal (decision) nodes** test an attribute, **branches** are the answers, **leaf nodes** give the class. The top node is the **root**.

:::example Loan default tree (p4–10)
Training data: 10 borrowers with *Home Owner*, *Marital Status*, *Annual Income*, and the class *Defaulted*.

| ID | Home Owner | Marital Status | Annual Income | Defaulted |
|---|---|---|---|---|
| 1 | Yes | Single | 125K | No |
| 2 | No | Married | 100K | No |
| 3 | No | Single | 70K | No |
| 4 | Yes | Married | 120K | No |
| 5 | No | Divorced | 95K | Yes |
| 6 | No | Married | 60K | No |
| 7 | Yes | Divorced | 220K | No |
| 8 | No | Single | 85K | Yes |
| 9 | No | Married | 75K | No |
| 10 | No | Single | 90K | Yes |

One tree that fits it: **Home Owner?** Yes → NO. No → **Marital Status?** Married → NO. Single/Divorced → **Income?** < 80K → NO, > 80K → YES.

Classify (Home Owner = No, Married, 80K): root → No branch → MarSt = Married → leaf **NO**. So "Defaulted = No".

Several different trees can fit the same data (p11, e.g. start with Marital Status instead).
:::

**Induction vs deduction** (p12): *learning* the tree from the training set is **induction** (tree-induction algorithm); *applying* it to the test set is **deduction**. Algorithms: Hunt's (one of the earliest), CART, ID3, C4.5, SLIQ, SPRINT (p13).

## Hunt's algorithm

:::steps General procedure (p14)
Let $D_t$ be the training records that reach node $t$.
1. If all records in $D_t$ have the **same class** $y_t$: make $t$ a **leaf** labelled $y_t$.
2. Otherwise: pick an **attribute test**, split $D_t$ into smaller subsets (one child per outcome).
3. Apply the procedure **recursively** to each child.
:::

:::example Hunt's on the loan data (p15–18), counts written (No, Yes)
- (a) One leaf "Defaulted = No" with (7, 3).
- (b) Split on Home Owner: Yes → (3, 0) pure; No → (4, 3) still mixed.
- (c) Split the No branch on Marital Status: Married → (3, 0) pure; Single/Divorced → (1, 3).
- (d) Split that branch on Income: < 80K → (1, 0), ≥ 80K → (0, 3). All leaves pure: stop.
:::

**Design issues** (p19): how to split (the test condition depends on the attribute type, and we need a measure of how good a split is), and when to stop (all records in one class, identical attribute values, or early termination).

## Test conditions by attribute type

| Type | Example | Multi-way split | Binary split |
|---|---|---|---|
| **Binary** | Home Owner | Yes / No | (same) |
| **Nominal** (no order) | Marital Status | one branch per value | any grouping into two sets: {Married} vs {Single, Divorced}, … |
| **Ordinal** (ordered) | Shirt size S < M < L < XL | one branch per value | groupings must **keep the order**: {S, M} vs {L, XL} is fine, {S, L} vs {M, XL} is **not** |
| **Continuous** | Annual Income | ranges, e.g. <10K, [10K, 25K), … | threshold: $A < v$ vs $A \ge v$ |

**Continuous attributes** (p25, p36): either **discretise** into ranges (equal-width bins, equal-frequency bins/percentiles, or clustering; once at the start = static, or at every node = dynamic), or use a **binary decision** $A < v$ and search for the best $v$. For the search: sort the values, try each candidate split point, build the count matrix for $A \le v$ / $A > v$, and keep the one with the lowest impurity. Scanning all records for every $v$ is computationally inefficient.

## Measures of node impurity

We want children that are **purer** than the parent (p27): a node with (C0: 5, C1: 5) is highly impure; (C0: 9, C1: 1) is nearly pure. Let $p_i(t)$ = fraction of records of class $i$ at node $t$, and $c$ = number of classes.

:::formula @tree-gini Gini impurity (p28)
$$\text{Gini}(t)=1-\sum_i p_i(t)^2$$
:::

:::formula @tree-entropy Entropy impurity (p28)
$$\text{Entropy}(t)=-\sum_i p_i(t)\log_2 p_i(t)$$
:::

:::formula @tree-classification-error Classification-error impurity (p28)
$$\text{Error}(t)=1-\max_i p_i(t)$$
:::

:::read
- All three are **0 for a pure node** (one class only) and **largest when classes are equally mixed**.
- For 2 classes the maximums are: Gini 0.5, Entropy 1, Error 0.5 (p45). In general Gini max $= 1 - 1/c$, Error max $= 1 - 1/c$.
- Two-class shortcut for Gini with $p$ and $1 - p$: $\text{Gini} = 2p(1-p)$.
:::

:::example One node at a time (p31–32, p37, p43)
| Counts (C1, C2) | $p$ | Gini | Entropy | Error |
|---|---|---|---|---|
| (0, 6) | 0, 1 | $1 - 0 - 1 = 0$ | $0$ | $1 - 1 = 0$ |
| (1, 5) | 1/6, 5/6 | $1 - \frac{1}{36} - \frac{25}{36} = 0.278$ | $-\frac16\log_2\frac16 - \frac56\log_2\frac56 = 0.650$ | $1 - \frac56 = 0.167$ |
| (2, 4) | 2/6, 4/6 | $1 - \frac{4}{36} - \frac{16}{36} = 0.444$ | $0.918$ | $1 - \frac46 = 0.333$ |
| (3, 3) | 1/2, 1/2 | $0.5$ | $1$ | $0.5$ |

(The slide p37 has a typo, $\log_2(1/6)$ in the second term; it must be $\log_2(5/6)$ to get 0.65.)
:::

## Finding the best split: gain

:::formula @tree-information-gain Weighted entropy and information gain (p29, p38)
$$M_H=\sum_{i=1}^{k}\frac{n_i}{n}H(\text{child }i),\qquad\operatorname{IG}=H(\text{parent})-M_H$$
:::

:::formula @tree-gini-gain Weighted Gini impurity and gain (p29, p33)
$$M_G=\sum_{i=1}^{k}\frac{n_i}{n}\operatorname{Gini}(\text{child }i),\qquad\operatorname{Gain}_G=\operatorname{Gini}(\text{parent})-M_G$$
:::

:::read
- $I$ is the impurity measure you chose (Gini or entropy). $P$ = impurity before splitting.
- $n$ = records at the parent, $n_i$ = records in child $i$. Bigger children count more ("larger and purer partitions are sought", p34).
- Choose the split with the **highest gain**, equivalently the **lowest weighted impurity** $M$.
- With entropy, this gain is called **information gain**, used by ID3 and C4.5. It equals the **mutual information** between the class and the splitting attribute (p38).
:::

:::steps Computing the gain of one attribute
1. Count the classes at the parent; compute its impurity $P$.
2. For each value (branch) of the attribute: count the classes of the records going there; compute the child impurity.
3. Weight each child by $n_i/n$ and add: $M$.
4. $\text{Gain} = P - M$. Repeat for every attribute and take the biggest.
:::

:::example Binary attribute with Gini (p34)
Parent (C1 = 7, C2 = 5): $\text{Gini} = 1 - (7/12)^2 - (5/12)^2 = 0.486$.
Split B: N1 = (5, 1), N2 = (2, 4).
- $\text{Gini}(N1) = 1 - (5/6)^2 - (1/6)^2 = 0.278$; $\text{Gini}(N2) = 1 - (2/6)^2 - (4/6)^2 = 0.444$.
- $M = \frac{6}{12}0.278 + \frac{6}{12}0.444 = 0.361$; Gain $= 0.486 - 0.361 = 0.125$.
:::

:::example "Which test condition is the best?" (p26, p35): 20 customers, 10 C0 and 10 C1
Parent Gini $= 0.5$.
- **Gender**: (6, 4) and (4, 6), each Gini $1 - 0.36 - 0.16 = 0.48$ → $M = 0.48$.
- **Car Type, multi-way**: Family (1, 3) → 0.375; Sports (8, 0) → 0; Luxury (1, 7) → 0.219. $M = \frac{4}{20}0.375 + \frac{8}{20}0 + \frac{8}{20}0.219 = 0.163$.
- Car Type, two-way {Sports, Luxury} vs {Family}: (9, 7) and (1, 3) → $M = 0.469$.
- Car Type, two-way {Sports} vs {Family, Luxury}: (8, 0) and (2, 10) → $M = \frac{12}{20}\cdot0.278 = 0.167$.
- **Customer ID**: 20 children with one record each, all pure → $M = 0$.

By raw impurity Customer ID "wins", which is useless for new customers. Among sensible choices **Car Type (multi-way, 0.163)** is best, with {Sports} vs {Family, Luxury} (0.167) the best binary split.
:::

:::example Information gain on the loan data
Parent (7 No, 3 Yes): $H = -0.7\log_2 0.7 - 0.3\log_2 0.3 = 0.881$.
- **Home Owner**: Yes (3, 0) → $H = 0$; No (4, 3) → $H = -\frac47\log_2\frac47 - \frac37\log_2\frac37 = 0.985$. $M = \frac{3}{10}0 + \frac{7}{10}0.985 = 0.690$. **Gain = 0.191**.
- **Marital Status**: Single (2 No, 2 Yes) → 1; Married (4, 0) → 0; Divorced (1, 1) → 1. $M = 0.4 + 0 + 0.2 = 0.6$. **Gain = 0.281**.

Marital Status has the higher information gain, so ID3 would put it at the root. (Hunt's illustration happened to start with Home Owner; any attribute is allowed there.)
:::

{{visual:information-gain}}

## The many-values problem and gain ratio

Impurity measures prefer splits into **many small pure partitions** (p39). Customer ID has the highest information gain (every child has entropy 0), but it cannot generalise.

:::formula @tree-gain-ratio Gain ratio (C4.5) (p40)
$$\text{Gain Ratio} = \frac{\text{Gain}_{split}}{\text{Split Info}}, \qquad \text{Split Info} = -\sum_{i=1}^{k}\frac{n_i}{n}\log_2\frac{n_i}{n}$$
:::

:::read
Split Info is the entropy of the **branch sizes**, ignoring classes. Many tiny branches → big Split Info → the gain is divided by a big number → penalised.
:::

:::example Split Info for the Car Type splits (p41)
- Multi-way, sizes 4, 8, 8 of 20: $-(0.2\log_2 0.2 + 2\cdot0.4\log_2 0.4) = 1.52$.
- {Sports, Luxury} vs {Family}, sizes 16, 4: $0.72$. {Sports} vs {Family, Luxury}, sizes 8, 12: $0.97$.
- Customer ID, 20 branches of size 1: $\log_2 20 = 4.32$. Its information gain is 1 (parent entropy 1, children 0), so gain ratio $= 1/4.32 = 0.23$. Car Type multi-way: information gain $= 1 - 0.380 = 0.620$, gain ratio $= 0.620/1.52 = 0.41$. Gain ratio now prefers Car Type. ✓
:::

## Classification error and comparing the measures

$\text{Error}(t) = 1 - \max_i p_i(t)$ (p42): maximum $1 - 1/c$ when the classes are equally distributed (least interesting), minimum 0 when all records belong to one class (most interesting).

For two classes (p45) all three curves are 0 at $p = 0$ and $p = 1$ and peak at $p = 0.5$: entropy peaks at 1, Gini at 0.5 (smooth curve), classification error at 0.5 (a triangle, below Gini). Gini and entropy are smooth and more sensitive to changes in purity, so they are preferred for growing trees.

## Advantages and disadvantages

| Advantages (p46) | Disadvantages |
|---|---|
| Inexpensive to construct | Greedy splitting can miss **interacting attributes** (useful together, not alone) |
| Extremely fast at classifying new records | Each decision boundary uses a **single attribute** (axis-parallel boundaries) |
| Easy to interpret (small trees) | Deep trees overfit (Lecture 7: more depth / leaves = more complexity) |
| Robust to noise; handles redundant and irrelevant attributes | |

:::tip Link to ensembles
A **random forest** (Homework 5 Exercise 3) trains many trees on bootstrap samples and, at each split, considers only a random subset of features; it averages the trees (regression) or takes a vote (classification). See Lecture 7.
:::
