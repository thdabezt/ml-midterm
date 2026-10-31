---
slug: l1-introduction
num: 1
title: Introduction to Machine Learning
short: Intro to ML
summary: What machine learning is, how it differs from ordinary programming, statistics and deep learning, and the three types of learning (supervised, unsupervised, reinforcement).
---
This lecture has almost no math. It gives the vocabulary that every later lecture uses, and it is a common source of **easy multiple-choice points**: definitions, "which type of learning is this?", and "ML vs DL vs AI".

:::exam What the midterm can ask from this lecture
- Match a definition to its author (Samuel, Mitchell, Murphy).
- Classify a task as **classification / regression / clustering / dimensionality reduction / reinforcement learning**.
- Traditional programming vs ML: what goes **in** and what comes **out**.
- AI ⊃ ML ⊃ DL, and what makes DL different (it learns features itself).
- Curse of dimensionality and Occam's razor in one sentence each.
:::

## What is machine learning?

Three classic definitions (slide p12):

| Who | Definition (in short) | Key word |
|---|---|---|
| Arthur Samuel, 1959 | Gives computers the ability to **learn without being explicitly programmed**. | not programmed |
| Tom Mitchell, 1997 | A program that **improves its performance at some task through experience**. | task, performance, experience |
| Kevin Murphy, 2012 | Methods that **automatically detect patterns in data**, then use them to **predict** future data. | patterns, predict |

:::intuition Mitchell's definition as a checklist (T, P, E)
For any ML system, you should be able to name:
- **T**ask: what it does (e.g. filter spam).
- **P**erformance measure: how we score it (e.g. % of emails classified correctly).
- **E**xperience: the data it learns from (e.g. emails labelled spam / not spam).

If the score on T, measured by P, gets better as E grows, the program is learning.
:::

Machine learning is a branch of **artificial intelligence**. It focuses on programs that access data and use it to learn for themselves, extracting information, structure, predictions, decisions and actions (slide p13).

## Traditional programming vs machine learning

:::formula @intro-programming-swap The swap (slide p14)
- **Traditional programming:** Data + Program → computer → **Output**
- **Machine learning:** Data + Outcome (the right answers) → computer → **Program** (the model)
:::

:::example Spam filter
- Traditional: a human writes rules such as "if the email contains *free money*, mark it spam". The computer applies the rules.
- ML: we give the computer 10,000 emails already labelled spam / not spam. It *produces* the rules (a model) by itself, and the model then labels new emails.
:::

## ML vs statistics vs deep learning vs AI

- **Statistics vs ML** (p15): both work with **data**. Statistics emphasises *collecting, analysing, presenting* data; ML emphasises *algorithms* for **classification, regression, clustering**.
- **ML vs Deep Learning** (p16): classical ML needs a **human to design the features** (feature extraction), then a model classifies. Deep learning does **feature extraction + classification in one neural network**, learned end-to-end.
- **AI ⊃ ML ⊃ DL** (p17):
  - **AI**: any algorithm that mimics human intelligence, from simple rules to complex systems.
  - **ML**: algorithms that parse data, learn from it, and make informed decisions; they use **human-extracted features** and improve with experience.
  - **DL**: neural networks that **learn the important features by themselves** through repeated training.

:::pitfall
"Deep learning is a separate field from ML" is **false**. DL is a *subset* of ML, which is a subset of AI.
:::

**Why ML now?** The amount of data grows explosively (≈160 zettabytes a year projected for 2025, a quarter of it real-time; p18–19). No human can write rules for that much data, so we let algorithms learn from it.

**Applications** (p20–21): virtual assistants, social media (sentiment analysis, spam filtering), transport, finance (fraud detection, algorithmic trading), healthcare (diagnosis, drug discovery), e-commerce (recommendation), image recognition and retrieval, self-driving cars, stock analysis.

**History highlights** (p22): least squares / linear regression (1805), perceptron (1957), reinforcement learning (1959), SVMs (1964), backpropagation (1986), boosting/AdaBoost (1990), random forests (1995), LSTM (1997), deep CNNs (2012), GANs (2014), Transformers (2017).

## Types of machine learning

| Type | Data you get | Goal | Sub-tasks and examples |
|---|---|---|---|
| **Supervised** | inputs **with** labels $D = \{(\mathbf{x}_i, y_i)\}_{i=1}^N$ | learn $y = f(\mathbf{x})$ | **Classification** (image classification, fraud detection, diagnostics); **Regression** (weather, market, life expectancy, population growth) |
| **Unsupervised** | inputs **only** $D = \{\mathbf{x}_i\}_{i=1}^N$ | find structure, learn $p(\mathbf{x}_i \mid \theta)$ | **Clustering** (customer segmentation, recommender systems, targeted marketing); **Dimensionality reduction** (compression, visualisation, structure discovery) |
| **Reinforcement** | rewards from an environment | choose actions that maximise cumulative reward | game AI, robot navigation, real-time decisions, skill acquisition |

### Supervised learning in symbols (p24)

:::formula @intro-supervised-notation
$$D = \{(\mathbf{x}_i, y_i)\}_{i=1}^{N}, \qquad y = f(\mathbf{x}), \qquad p(y \mid \mathbf{x}, D, \theta)$$
:::

:::read
- $D$: the training set; $N$: how many labelled examples.
- $\mathbf{x}$: a $d$-dimensional vector of **features** (also called attributes or covariates).
- $y$: the **response** (label / target).
- $p(y \mid \mathbf{x}, D, \theta)$: the probabilistic view, "how likely is each label $y$ for this input, given the training data and the model parameters $\theta$".
:::

- **Classification**: $y$ is a category, $y \in \{1, \dots, C\}$.
  - $C = 2$: binary; $C > 2$: multiclass; an input with several labels at once: **multi-label**.
  - Examples on the slides: iris flowers (setosa / versicolor / virginica from 4 measurements), emotion detection (7 emotions).
- **Regression**: $y$ is a real number, $y \in \mathbb{R}$. Examples: car fuel consumption (MPG) from weight and horsepower; Bitcoin price.

Data is stored as a **design matrix**: one **row per example** ($N$ rows), one **column per feature** ($D$ columns), plus a label column (p25).

### Unsupervised learning (p29–35)

There is **no response variable**. We learn a density $p(\mathbf{x}_i \mid \theta)$ or discover structure.

- **Clustering**: find subgroups in the data and decide which subgroup each point belongs to (e.g. countries grouped by test scores and happiness; MNIST digits forming 10 clusters).
- **Dimensionality reduction**: project data to a lower-dimensional space that keeps its "essence" (e.g. many photos of one scene vary only by lighting; face images grouped by person).

### Reinforcement learning (p36–38)

An **agent** takes an **action** $A_t$ in an **environment**; the environment returns a new **state** $S_{t+1}$ and a **reward** $R_{t+1}$. The agent learns to maximise the **cumulative reward**. The math framework is the **Markov decision process (MDP)**: states, actions, transition probabilities, rewards; outcomes are partly random and partly controlled by the decision maker.

:::steps Deciding the type of a task (exam trick)
1. Are there correct answers (labels) in the training data? No: **unsupervised**. Learning from rewards / trial and error: **reinforcement**.
2. If labels exist: is the label a **category** (spam/not, cat/dog/bird)? **Classification**. A **number** (price, temperature)? **Regression**.
3. Unsupervised: grouping similar items? **Clustering**. Reducing many features to few? **Dimensionality reduction**.
:::

## Two big ideas: curse of dimensionality and Occam's razor

**Curse of dimensionality** (p32): split each axis into $M$ intervals; the number of cells is $M^D$ in $D$ dimensions. With $M = 3$: 3 cells in 1-D, 9 in 2-D, 27 in 3-D. The space grows **exponentially**, so the data needed to fill it grows exponentially too. (Lecture 4 repeats this with 5 samples per axis: 5, 25, 125, …, $5^{10} = 9{,}765{,}625$.)

:::formula @intro-grid-cell-count Grid cells in D dimensions
$$\text{number of cells}=M^D$$
:::

**Occam's razor** (p33): if two models perform about equally well, **choose the simpler one**. It helps prevent overfitting and improves interpretability and generalisation.

## Discussion questions from the slides

The lecture ends its motivation part with three open questions (p8–10): *Do machines really learn? What prevents robots from being used in the real world? Can machines solve Millennium Prize problems such as P vs NP?* There is no single right answer; use them to practise explaining ML in your own words (e.g. "machines learn in Mitchell's sense: performance on a task improves with data, but they do not *understand* the way humans do").
