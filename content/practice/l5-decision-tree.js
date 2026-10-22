const r = String.raw;

const LOAN = r`| ID | Home Owner | Marital Status | Annual Income | Defaulted |
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
| 10 | No | Single | 90K | Yes |`;

const CUSTOMERS = r`20 customers, 10 of class C0 and 10 of class C1. Candidate splits (class counts C0, C1 per branch):
- **Gender**: M → (6, 4), F → (4, 6)
- **Car Type**: Family → (1, 3), Sports → (8, 0), Luxury → (1, 7)
- **Customer ID**: 20 branches, each with a single customer (pure)`;

export default {
  lesson: 'l5-decision-tree',
  questions: [
    // ---------- slide quizzes ----------
    {
      id: 'l5-quiz-p26',
      type: 'numeric',
      source: { kind: 'quiz', label: 'L5 p26 "Which test condition is the best?"' },
      prompt: r`${CUSTOMERS}

Compute the weighted Gini index after splitting on Gender and after splitting on Car Type (multi-way).`,
      fields: [
        { label: 'Gini_split (Gender)', answer: 0.48, tol: 0.003 },
        { label: 'Gini_split (Car Type)', answer: 0.1625, tol: 0.003 },
      ],
      solution: r`Parent: $1 - 0.5^2 - 0.5^2 = 0.5$.

**Gender:** each child has $p = (0.6, 0.4)$ or $(0.4, 0.6)$: $1 - 0.36 - 0.16 = 0.48$. Weighted: $\frac{10}{20}0.48 + \frac{10}{20}0.48 = 0.48$ (gain only 0.02).

**Car Type:**
- Family (1, 3): $1 - \frac{1}{16} - \frac{9}{16} = 0.375$
- Sports (8, 0): $0$
- Luxury (1, 7): $1 - \frac{1}{64} - \frac{49}{64} = 0.219$
- Weighted: $\frac{4}{20}0.375 + \frac{8}{20}0 + \frac{8}{20}0.219 = 0.075 + 0.0875 = 0.1625$ (gain 0.3375).

Car Type is much better than Gender. Customer ID would give 0 (every child pure), but it is useless for new customers; see the gain-ratio question.`,
    },
    {
      id: 'l5-quiz-p26-id',
      type: 'mcq',
      source: { kind: 'quiz', label: 'L5 p26, p39' },
      prompt: r`${CUSTOMERS}

Which split has the **highest information gain**, and is it a good choice?`,
      options: [
        'Gender; yes',
        'Car Type; yes',
        'Customer ID; no, because each branch has one record and the split cannot generalise to new customers',
        'Customer ID; yes, because all children are pure',
      ],
      answer: 2,
      solution: r`Every Customer-ID child is pure, so its weighted entropy is 0 and the gain is the full parent entropy (1 bit), the maximum possible. But a new customer has a new ID, so the rule is useless. Impurity measures favour **many small pure partitions** (L5 p39), which is why C4.5 uses the **gain ratio**.`,
    },
    {
      id: 'l5-quiz-p35',
      type: 'mcq',
      source: { kind: 'quiz', label: 'L5 p35 "Which of these is the best?"' },
      prompt: r`Three ways to split on Car Type (class counts C1, C2):
- Multi-way: Family (1, 3), Sports (8, 0), Luxury (1, 7): Gini 0.163
- {Sports, Luxury} (9, 7) vs {Family} (1, 3): Gini 0.468
- {Sports} (8, 0) vs {Family, Luxury} (2, 10): Gini 0.167

Which split is best by the Gini criterion?`,
      options: ['Multi-way', '{Sports, Luxury} vs {Family}', '{Sports} vs {Family, Luxury}', 'All are equal'],
      answer: 0,
      solution: r`Lower weighted Gini = purer children = larger gain. Multi-way (0.163) is best, with {Sports} vs {Family, Luxury} (0.167) almost as good and the best **binary** split. {Sports, Luxury} vs {Family} (0.468) is poor because it mixes Sports (all C1) with Luxury (mostly C2).

Check the binary one: (2, 10) has Gini $1 - \frac{4}{144} - \frac{100}{144} = 0.278$; weighted $\frac{12}{20}0.278 = 0.167$.`,
    },
    // ---------- single-node impurity ----------
    {
      id: 'l5-node',
      type: 'numeric',
      source: { kind: 'slide', label: 'L5 p28–43' },
      prompt: r`A node holds 3 records of class C1 and 7 of class C2. Compute its Gini index, entropy (base 2) and classification error.`,
      fields: [
        { label: 'Gini', answer: 0.42, tol: 0.002 },
        { label: 'Entropy', answer: 0.8813, tol: 0.002 },
        { label: 'Error', answer: 0.3, tol: 0.002 },
      ],
      solution: r`$p = (0.3, 0.7)$.
- Gini $= 1 - 0.09 - 0.49 = 0.42$ (shortcut $2p(1-p) = 2\cdot0.3\cdot0.7$).
- Entropy $= -0.3\log_2 0.3 - 0.7\log_2 0.7 = 0.3(1.737) + 0.7(0.515) = 0.521 + 0.360 = 0.881$.
- Error $= 1 - \max(0.3, 0.7) = 0.3$.`,
    },
    {
      id: 'l5-node-3class',
      type: 'numeric',
      source: { kind: 'slide', label: 'L5 p28, p42' },
      prompt: r`A node holds 4, 4 and 2 records of three classes. Compute its Gini index, entropy and classification error.`,
      fields: [
        { label: 'Gini', answer: 0.64, tol: 0.002 },
        { label: 'Entropy', answer: 1.5219, tol: 0.003 },
        { label: 'Error', answer: 0.6, tol: 0.002 },
      ],
      solution: r`$p = (0.4, 0.4, 0.2)$.
- Gini $= 1 - (0.16 + 0.16 + 0.04) = 0.64$ (maximum for 3 classes is $1 - 1/3 = 0.667$).
- Entropy $= -2(0.4\log_2 0.4) - 0.2\log_2 0.2 = 2(0.529) + 0.464 = 1.522$ (maximum $\log_2 3 = 1.585$).
- Error $= 1 - 0.4 = 0.6$.`,
    },
    // ---------- gains ----------
    {
      id: 'l5-loan-ig',
      type: 'numeric',
      source: { kind: 'slide', label: 'L5 p4, p38 (loan data)' },
      prompt: r`Using **information gain** (entropy), compute the gain of splitting the loan data on Home Owner and on Marital Status (multi-way). Which would ID3 put at the root?

${LOAN}`,
      fields: [
        { label: 'Gain (Home Owner)', answer: 0.1916, tol: 0.003 },
        { label: 'Gain (Marital Status)', answer: 0.2813, tol: 0.003 },
      ],
      solution: r`Parent: 7 No, 3 Yes → $H = -0.7\log_2 0.7 - 0.3\log_2 0.3 = 0.881$.

**Home Owner:** Yes → IDs 1, 4, 7: (3 No, 0 Yes) → $H = 0$. No → 7 records: (4 No, 3 Yes) → $H = -\frac47\log_2\frac47 - \frac37\log_2\frac37 = 0.985$.
$M = \frac{3}{10}0 + \frac{7}{10}0.985 = 0.690$, Gain $= 0.881 - 0.690 = 0.192$.

**Marital Status:** Single → IDs 1, 3, 8, 10: (2, 2) → 1. Married → 2, 4, 6, 9: (4, 0) → 0. Divorced → 5, 7: (1, 1) → 1.
$M = 0.4(1) + 0.4(0) + 0.2(1) = 0.6$, Gain $= 0.281$.

→ ID3 picks **Marital Status** (higher gain).`,
    },
    {
      id: 'l5-loan-gini',
      type: 'numeric',
      source: { kind: 'variant', label: 'like L5 p34 (loan data)' },
      prompt: r`Same loan data. Using the **Gini index**, compute the gain $\text{Gini(parent)} - \text{Gini}_{split}$ for Home Owner and for Marital Status (multi-way).

${LOAN}`,
      fields: [
        { label: 'Gini gain (Home Owner)', answer: 0.0771, tol: 0.002 },
        { label: 'Gini gain (Marital Status)', answer: 0.12, tol: 0.002 },
      ],
      solution: r`Parent (7, 3): $1 - 0.49 - 0.09 = 0.42$.

- Home Owner: Yes (3, 0) → 0; No (4, 3) → $1 - \frac{16}{49} - \frac{9}{49} = 0.490$. Split $= 0.7 \times 0.490 = 0.343$. Gain $= 0.077$.
- Marital Status: Single (2, 2) → 0.5; Married (4, 0) → 0; Divorced (1, 1) → 0.5. Split $= 0.4(0.5) + 0.2(0.5) = 0.30$. Gain $= 0.12$.

Gini agrees with information gain: Marital Status is the better root.`,
    },
    {
      id: 'l5-binary-v1',
      type: 'numeric',
      source: { kind: 'variant', label: 'like L5 p34' },
      prompt: r`A parent node has (C1 = 6, C2 = 6). Split B sends (5, 2) to child N1 and (1, 4) to child N2. Compute Gini(N1), Gini(N2), the weighted Gini of the split, and the gain.`,
      fields: [
        { label: 'Gini(N1)', answer: 20 / 49, tol: 0.002 },
        { label: 'Gini(N2)', answer: 0.32, tol: 0.002 },
        { label: 'weighted Gini', answer: 0.3714, tol: 0.002 },
        { label: 'gain', answer: 0.1286, tol: 0.002 },
      ],
      solution: r`- Gini(N1) $= 1 - (5/7)^2 - (2/7)^2 = 1 - \frac{29}{49} = 0.408$.
- Gini(N2) $= 1 - (1/5)^2 - (4/5)^2 = 1 - \frac{17}{25} = 0.32$.
- Weighted $= \frac{7}{12}0.408 + \frac{5}{12}0.32 = 0.238 + 0.133 = 0.371$.
- Parent Gini $= 0.5$ → gain $= 0.5 - 0.371 = 0.129$.`,
    },
    {
      id: 'l5-entropy-v1',
      type: 'numeric',
      source: { kind: 'variant', label: 'like L5 p38' },
      prompt: r`A parent node has 8 positive and 4 negative records. An attribute splits it into child 1 with (6 positive, 1 negative) and child 2 with (2 positive, 3 negative). Compute the parent entropy and the information gain.`,
      fields: [
        { label: 'Entropy(parent)', answer: 0.9183, tol: 0.003 },
        { label: 'Information gain', answer: 0.1686, tol: 0.003 },
      ],
      solution: r`- Parent $(8/12, 4/12)$: $H = -\frac23\log_2\frac23 - \frac13\log_2\frac13 = 0.390 + 0.528 = 0.918$.
- Child 1 $(6/7, 1/7)$: $H = 0.191 + 0.401 = 0.592$.
- Child 2 $(2/5, 3/5)$: $H = 0.529 + 0.442 = 0.971$.
- Weighted: $\frac{7}{12}0.592 + \frac{5}{12}0.971 = 0.345 + 0.405 = 0.750$.
- Gain $= 0.918 - 0.750 = 0.169$.`,
    },
    {
      id: 'l5-continuous',
      type: 'numeric',
      source: { kind: 'slide', label: 'L5 p25, p36' },
      prompt: r`Split the loan data on Annual Income with a binary test $A \le v$. Sorted incomes with their class: 60 N, 70 N, 75 N, 85 Y, 90 Y, 95 Y, 100 N, 120 N, 125 N, 220 N. Compute the weighted Gini for $v = 80$ and for $v = 97.5$. Which is the better threshold?`,
      fields: [
        { label: 'Gini_split (v = 80)', answer: 0.3429, tol: 0.003 },
        { label: 'Gini_split (v = 97.5)', answer: 0.3, tol: 0.003 },
      ],
      solution: r`**$v = 80$** (the slide's split): ≤ 80 → 60, 70, 75: (Yes 0, No 3) → Gini 0. > 80 → (Yes 3, No 4) → $1 - \frac{9}{49} - \frac{16}{49} = 0.490$. Weighted $= 0.7 \times 0.490 = 0.343$.

**$v = 97.5$** (between 95 and 100): ≤ 97.5 → six records (3 Yes, 3 No) → 0.5. > 97.5 → 100, 120, 125, 220: all No → 0. Weighted $= 0.6 \times 0.5 = 0.30$.

$0.30 < 0.343$, so **97.5** is better. Method: sort the values, try the midpoints between neighbours, keep the lowest weighted impurity.`,
    },
    {
      id: 'l5-gainratio',
      type: 'numeric',
      source: { kind: 'slide', label: 'L5 p40–41' },
      prompt: r`${CUSTOMERS}

The parent entropy is 1. Compute the Split Info and the gain ratio for (a) Customer ID and (b) Car Type (multi-way, information gain 0.620).`,
      fields: [
        { label: 'SplitInfo (Customer ID)', answer: 4.3219, tol: 0.003 },
        { label: 'GainRatio (Customer ID)', answer: 0.2314, tol: 0.003 },
        { label: 'SplitInfo (Car Type)', answer: 1.5219, tol: 0.003 },
        { label: 'GainRatio (Car Type)', answer: 0.4076, tol: 0.003 },
      ],
      solution: r`Split Info $= -\sum_i\frac{n_i}{n}\log_2\frac{n_i}{n}$ (entropy of the branch sizes).

(a) 20 branches of size 1: $-20\cdot\frac{1}{20}\log_2\frac{1}{20} = \log_2 20 = 4.322$. Gain $= 1 - 0 = 1$. Ratio $= 1/4.322 = 0.231$.

(b) Sizes 4, 8, 8: $-(0.2\log_2 0.2 + 2\cdot0.4\log_2 0.4) = 0.464 + 1.058 = 1.522$ (slide: 1.52). Ratio $= 0.620/1.522 = 0.408$.

Gain ratio now prefers Car Type over Customer ID, which is the point of C4.5's criterion.`,
    },
    {
      id: 'l5-badminton-root',
      type: 'numeric',
      source: { kind: 'variant', label: 'HW04 data, L5 method' },
      prompt: r`Using the 10-day badminton table from Homework 4 (6 Yes, 4 No), compute the information gain of **Outlook** (Sunny: 1 Yes / 3 No, Overcast: 2 / 0, Rainy: 3 / 1) and of **Wind** (No: 4 Yes / 2 No, Yes: 2 / 2).`,
      fields: [
        { label: 'Gain(Outlook)', answer: 0.3219, tol: 0.003 },
        { label: 'Gain(Wind)', answer: 0.02, tol: 0.003 },
      ],
      solution: r`Parent $(0.6, 0.4)$: $H = 0.971$.

**Outlook:** Sunny (1, 3) → $H = 0.811$; Overcast (2, 0) → 0; Rainy (3, 1) → 0.811. $M = 0.4(0.811) + 0.2(0) + 0.4(0.811) = 0.649$. Gain $= 0.322$.

**Wind:** No (4, 2) → $H = 0.918$; Yes (2, 2) → 1. $M = 0.6(0.918) + 0.4(1) = 0.951$. Gain $= 0.020$.

Outlook would be the root (it also beats Temperature, 0.095, and Humidity, 0.046).`,
    },
    // ---------- concepts ----------
    {
      id: 'l5-trace',
      type: 'mcq',
      source: { kind: 'slide', label: 'L5 p4–10' },
      prompt: r`Tree: **Home Owner?** Yes → NO. No → **Marital Status?** Married → NO; Single or Divorced → **Income?** < 80K → NO, > 80K → YES. Classify (Home Owner = No, Marital Status = Divorced, Income = 95K).`,
      options: ['Defaulted = NO, at the Home Owner node', 'Defaulted = NO, at the Married leaf', 'Defaulted = YES, at the Income > 80K leaf', 'Cannot be classified'],
      answer: 2,
      solution: r`Root: Home Owner = No → go to Marital Status. Divorced → go to Income. 95K > 80K → leaf **YES** (this matches record 5 of the training data).`,
    },
    {
      id: 'l5-ordinal',
      type: 'mcq',
      source: { kind: 'slide', label: 'L5 p23' },
      prompt: r`Shirt Size is ordinal: Small < Medium < Large < Extra Large. Which binary split is **not allowed**?`,
      options: ['{Small} vs {Medium, Large, Extra Large}', '{Small, Medium} vs {Large, Extra Large}', '{Small, Large} vs {Medium, Extra Large}', '{Small, Medium, Large} vs {Extra Large}'],
      answer: 2,
      solution: r`Binary splits of an ordinal attribute must **preserve the order**; each group must be a contiguous range. {Small, Large} skips Medium, so it "violates the order property" (L5 p23). Nominal attributes have no such restriction.`,
    },
    {
      id: 'l5-hunt-leaf',
      type: 'mcq',
      source: { kind: 'slide', label: 'L5 p14, p19' },
      prompt: r`In Hunt's algorithm, when does a node $t$ become a leaf?`,
      options: [
        r`When $D_t$ contains records of more than one class`,
        r`When all records in $D_t$ belong to the same class (or all have identical attribute values)`,
        'After exactly three levels',
        'When the node has at least 10 records',
      ],
      answer: 1,
      solution: r`If $D_t$ is pure, $t$ is a leaf labelled with that class. Otherwise apply an attribute test, split, and recurse. Splitting also stops if all records have identical attribute values (no test can separate them) or by early termination.`,
    },
    {
      id: 'l5-max-impurity',
      type: 'mcq',
      source: { kind: 'slide', label: 'L5 p42, p45' },
      prompt: r`For a two-class problem, what are the maximum values of entropy, Gini and classification error?`,
      options: ['1, 1, 1', '1, 0.5, 0.5', '0.5, 0.5, 0.5', '1, 0.5, 1'],
      answer: 1,
      solution: r`All three peak at $p = 0.5$: entropy $= 1$, Gini $= 1 - 0.25 - 0.25 = 0.5$, error $= 1 - 0.5 = 0.5$. In general Gini and error peak at $1 - 1/c$ and entropy at $\log_2 c$.`,
    },
    {
      id: 'l5-gainratio-why',
      type: 'mcq',
      source: { kind: 'slide', label: 'L5 p40' },
      prompt: r`Why does C4.5 divide information gain by Split Info?`,
      options: [
        'To make the gain always lie between 0 and 1',
        'To penalise splits into many small partitions, which information gain unfairly favours',
        'To handle continuous attributes',
        'To speed up the computation',
      ],
      answer: 1,
      solution: r`Split Info is large when the data is cut into many small branches, so dividing by it penalises such splits (e.g. Customer ID). "Designed to overcome the disadvantage of information gain."`,
    },
    {
      id: 'l5-disadvantage',
      type: 'mcq',
      source: { kind: 'slide', label: 'L5 p46' },
      prompt: r`Which is a **disadvantage** of decision trees listed on the slides?`,
      options: [
        'They are slow at classifying new records',
        'They are hard to interpret even when small',
        'Each decision boundary involves only a single attribute, and greedy splitting can miss interacting attributes',
        'They cannot handle irrelevant attributes',
      ],
      answer: 2,
      solution: r`Advantages: cheap to build, very fast to classify, easy to interpret, robust to noise, handle redundant/irrelevant attributes. Disadvantages: greedy splitting may pass over attributes that only work together, and each split tests **one** attribute (axis-parallel boundaries).`,
    },
    {
      id: 'l5-induction',
      type: 'mcq',
      source: { kind: 'slide', label: 'L5 p12' },
      prompt: r`In the decision-tree classification framework, learning the tree from the training set is called ______ and applying it to the test set is called ______.`,
      options: ['deduction; induction', 'induction; deduction', 'induction; induction', 'pruning; deduction'],
      answer: 1,
      solution: r`Training set → tree-induction algorithm → model (**induction**). Model → apply to test set (**deduction**).`,
    },
    {
      id: 'l5-ig-mi',
      type: 'mcq',
      source: { kind: 'slide', label: 'L5 p38' },
      prompt: r`Information gain used by ID3/C4.5 is equal to which quantity from Lecture 2?`,
      options: ['The KL divergence between the children', 'The mutual information between the class variable and the splitting attribute', 'The cross-entropy of the parent', 'The variance of the class'],
      answer: 1,
      solution: r`$\text{Gain} = H(\text{class}) - H(\text{class} \mid \text{attribute}) = I(\text{class}; \text{attribute})$, the mutual information (L5 p38, L2 p45).`,
    },
  ],
};
