const r = String.raw;

const POINTS = r`| Point | Coordinates |
|---|---|
| $A_1$ | $(2,10)$ |
| $A_2$ | $(2,5)$ |
| $A_3$ | $(8,4)$ |
| $A_4$ | $(5,8)$ |
| $A_5$ | $(7,5)$ |
| $A_6$ | $(6,4)$ |
| $A_7$ | $(1,2)$ |
| $A_8$ | $(4,9)$ |`;

const NEIGHBOURS = r`| Point | Neighbours at $\epsilon=2$ | Neighbours at $\epsilon=\sqrt{10}$ |
|---|---|---|
| $A_1$ | $A_1$ | $A_1,A_8$ |
| $A_2$ | $A_2$ | $A_2,A_7$ |
| $A_3$ | $A_3,A_5,A_6$ | $A_3,A_5,A_6$ |
| $A_4$ | $A_4,A_8$ | $A_4,A_8$ |
| $A_5$ | $A_3,A_5,A_6$ | $A_3,A_5,A_6$ |
| $A_6$ | $A_3,A_5,A_6$ | $A_3,A_5,A_6$ |
| $A_7$ | $A_7$ | $A_2,A_7$ |
| $A_8$ | $A_4,A_8$ | $A_1,A_4,A_8$ |`;

export default {
  lesson: 'l8-unsupervised-learning',
  questions: [
    {
      id: 'hw08-ex1',
      type: 'numeric',
      source: { kind: 'hw', label: 'HW08 Exercise 1 · HW_Cluster.pdf' },
      prompt: r`Run **one K-means epoch only**, using Euclidean distance and initial centres $\mu_1=A_1$, $\mu_2=A_4$, $\mu_3=A_7$.

${POINTS}

First write the members of each cluster on paper, then enter the new centre coordinates. Keep all initial centres fixed during assignment.`,
      fields: [
        { label: r`new $\mu_{1,x}$`, answer: 2, tol: 0.001 },
        { label: r`new $\mu_{1,y}$`, answer: 10, tol: 0.001 },
        { label: r`new $\mu_{2,x}$`, answer: 6, tol: 0.001 },
        { label: r`new $\mu_{2,y}$`, answer: 6, tol: 0.001 },
        { label: r`new $\mu_{3,x}$`, answer: 1.5, tol: 0.001 },
        { label: r`new $\mu_{3,y}$`, answer: 3.5, tol: 0.001 },
      ],
      solution: r`Compare squared distances; the smallest in each row gives the assignment.

| Point | to $A_1$ | to $A_4$ | to $A_7$ | Cluster |
|---|---|---|---|---|
| $A_1$ | 0 | 13 | 65 | 1 |
| $A_2$ | 25 | 18 | 10 | 3 |
| $A_3$ | 72 | 25 | 53 | 2 |
| $A_4$ | 13 | 0 | 52 | 2 |
| $A_5$ | 50 | 13 | 45 | 2 |
| $A_6$ | 52 | 17 | 29 | 2 |
| $A_7$ | 65 | 52 | 0 | 3 |
| $A_8$ | 5 | 2 | 58 | 2 |

1. $C_1=\{A_1\}$: $\mu_1=(2,10)$.
2. $C_2=\{A_3,A_4,A_5,A_6,A_8\}$: $\mu_2=(30/5,30/5)=(6,6)$.
3. $C_3=\{A_2,A_7\}$: $\mu_3=(3/2,7/2)=(1.5,3.5)$.

Stop after this update. A second assignment would be part of the next epoch.`,
    },
    {
      id: 'hw08-ex2',
      type: 'numeric',
      source: { kind: 'hw', label: 'HW08 Exercise 2 · HW_Cluster.pdf' },
      prompt: r`Apply **DBSCAN** to these eight points, with Euclidean distance and **MinPts = 2, counting the point itself**. Include neighbours exactly at distance $\epsilon$.

${POINTS}

On paper, list the clusters for (a) $\epsilon=2$ and (b) $\epsilon=\sqrt{10}$. Enter the cluster and noise counts below; noise is not a cluster.`,
      fields: [
        { label: r`(a) clusters at $\epsilon=2$`, answer: 2, tol: 0.01 },
        { label: '(a) noise points', answer: 3, tol: 0.01 },
        { label: r`(b) clusters at $\epsilon=\sqrt{10}$`, answer: 3, tol: 0.01 },
        { label: '(b) noise points', answer: 0, tol: 0.01 },
      ],
      solution: r`Use $d^2\le4$ for (a), and $d^2\le10$ for (b): no rounded square roots are needed.

${NEIGHBOURS}

**(a)** Core points: $A_3,A_4,A_5,A_6,A_8$. The core graph has components $\{A_3,A_5,A_6\}$ and $\{A_4,A_8\}$: **2 clusters**. $A_1,A_2,A_7$ touch no core, so there are **3 noise points** and no border points.

**(b)** All eight points are core. Components: $\{A_1,A_4,A_8\}$, $\{A_2,A_7\}$, $\{A_3,A_5,A_6\}$: **3 clusters**, **0 noise**.

Notice $d^2(A_2,A_7)=10$ exactly; include that edge. $A_1$ connects to $A_4$ through $A_8$ even though $d^2(A_1,A_4)=13$. Increasing epsilon can create a new cluster from former noise, so the count need not decrease.

If “2” means two **other** neighbours instead, use MinPts = 3 counting self: (a) only $\{A_3,A_5,A_6\}$ is a cluster, with 5 noise; (b) $\{A_1,A_4,A_8\}$ and $\{A_3,A_5,A_6\}$ are clusters, with $A_2,A_7$ noise.`,
    },
    {
      id: 'l8-kmeans-v1',
      type: 'numeric',
      source: { kind: 'variant', label: 'like HW08 Exercise 1' },
      prompt: r`Points on a line: $0,2,8,10$. Initial centres $\mu_1=0$, $\mu_2=8$. Run one assignment/update epoch. Give the new centres and SSE **after** the update.`,
      fields: [
        { label: r`new $\mu_1$`, answer: 1 },
        { label: r`new $\mu_2$`, answer: 9 },
        { label: 'SSE after update', answer: 4 },
      ],
      solution: r`$0,2$ are closer to 0; $8,10$ are closer to 8. Means: $(0+2)/2=1$, $(8+10)/2=9$. SSE: $(0-1)^2+(2-1)^2+(8-9)^2+(10-9)^2=4$.`,
    },
    {
      id: 'l8-sse-hw-v1',
      type: 'numeric',
      source: { kind: 'variant', label: 'HW08 Ex 1 · extra SSE check' },
      prompt: r`After HW08's first K-means update, the clusters are $C_1=\{(2,10)\}$, $C_2=\{(8,4),(5,8),(7,5),(6,4),(4,9)\}$, $C_3=\{(2,5),(1,2)\}$, with means $(2,10),(6,6),(1.5,3.5)$. Compute the total SSE.`,
      fields: [{ label: 'SSE', answer: 37, tol: 0.001 }],
      solution: r`$C_1$: 0. $C_2$: $8+5+2+4+13=32$. $C_3$: $2.5+2.5=5$. Total $0+32+5=37$. Each term is squared distance to that point's **own** centre.`,
    },
    {
      id: 'l8-distances',
      type: 'numeric',
      source: { kind: 'slide', label: 'Clustering p15 · distance measures' },
      prompt: r`For $\mathbf{x}=(1,2)$ and $\mathbf{y}=(4,6)$, compute Euclidean distance, Manhattan distance and cosine **similarity**.`,
      fields: [
        { label: 'Euclidean distance', answer: 5 },
        { label: 'Manhattan distance', answer: 7 },
        { label: 'cosine similarity', answer: 16 / Math.sqrt(260), tol: 0.0005 },
      ],
      solution: r`Differences $(-3,-4)$. Euclidean: $\sqrt{9+16}=5$. Manhattan: $3+4=7$. Dot product $=16$; lengths $\sqrt5$ and $\sqrt{52}$, so cosine $=16/\sqrt{260}\approx0.9923$. The corresponding cosine dissimilarity is $1-0.9923\approx0.0077$.`,
    },
    {
      id: 'l8-kmeans-plus-plus',
      type: 'numeric',
      source: { kind: 'variant', label: 'like Clustering p31' },
      prompt: r`K-means++ on points $0,2,6$, with first centre 0. What are the probabilities that 2 and 6 become the next centre?`,
      fields: [
        { label: 'P(next centre = 2)', answer: 0.1, tol: 0.001 },
        { label: 'P(next centre = 6)', answer: 0.9, tol: 0.001 },
      ],
      solution: r`Distances to the chosen centre: $0,2,6$; squared distances: $0,4,36$. Normalise by $40$: probabilities $4/40=0.1$, $36/40=0.9$. This is random sampling, not deterministic farthest-point selection.`,
    },
    {
      id: 'l8-linkage',
      type: 'numeric',
      source: { kind: 'variant', label: 'like Clustering p38' },
      prompt: r`On a line, $A=\{0,2\}$ and $B=\{5,9\}$. Compute single-link, complete-link and average-link distances, and the **increase in SSE** under Ward's method.`,
      fields: [
        { label: 'single-link', answer: 3 },
        { label: 'complete-link', answer: 9 },
        { label: 'average-link', answer: 6 },
        { label: 'Ward SSE increase', answer: 36 },
      ],
      solution: r`Cross-pair distances are $5,9,3,7$. Minimum $=3$, maximum $=9$, average $=24/4=6$. Means are 1 and 7; Ward's increase $=\frac{2\cdot2}{2+2}(1-7)^2=36$. Equivalently, separate-cluster SSE is $2+8=10$ and merged SSE about mean 4 is $16+4+1+25=46$; the increase is $46-10=36$.`,
    },
    {
      id: 'l8-hac-cut',
      type: 'numeric',
      source: { kind: 'variant', label: 'like Clustering p36–41' },
      prompt: r`Use single-link HAC on the 1-D points $0,2,5,9$. At what three heights do merges occur? How many clusters remain after a cut at height 3.5?`,
      fields: [
        { label: 'first merge height', answer: 2 },
        { label: 'second merge height', answer: 3 },
        { label: 'third merge height', answer: 4 },
        { label: 'clusters at height 3.5', answer: 2, tol: 0.01 },
      ],
      solution: r`Merge $0,2$ at 2. Distance from $\{0,2\}$ to 5 is $\min(5,3)=3$, so add 5 at 3. Distance from $\{0,2,5\}$ to 9 is $\min(9,7,4)=4$. The cut at 3.5 is after the second merge: clusters $\{0,2,5\}$ and $\{9\}$.`,
    },
    {
      id: 'l8-dbscan-border',
      type: 'numeric',
      source: { kind: 'variant', label: 'like HW08 Exercise 2' },
      prompt: r`DBSCAN on $0,1,2,4,8$, with $\epsilon=1.1$ and MinPts $=3$ **counting self**. Give the numbers of core points, border points, noise points and clusters.`,
      fields: [
        { label: 'core points', answer: 1, tol: 0.01 },
        { label: 'border points', answer: 2, tol: 0.01 },
        { label: 'noise points', answer: 2, tol: 0.01 },
        { label: 'clusters', answer: 1, tol: 0.01 },
      ],
      solution: r`Neighbourhoods: $N(0)=\{0,1\}$, $N(1)=\{0,1,2\}$, $N(2)=\{1,2\}$, $N(4)=\{4\}$, $N(8)=\{8\}$. Only 1 is core; 0 and 2 are border. Points 4 and 8 touch no core and are noise. Cluster: $\{0,1,2\}$.`,
    },
    {
      id: 'l8-unlabelled',
      type: 'mcq',
      source: { kind: 'slide', label: 'Clustering p4–5' },
      prompt: 'A retailer groups customers by purchase patterns without known segment labels. What distinguishes this from classification?',
      options: ['Clustering discovers groups without training labels', 'Clustering requires a labelled class for every customer', 'Clustering always finds exactly two groups', 'Clustering predicts only real-valued targets'],
      answer: 0,
      solution: 'Clustering is unsupervised: the groups are discovered from the input representation. Classification learns to predict predefined labels from labelled examples.',
    },
    {
      id: 'l8-soft-clusters',
      type: 'mcq',
      source: { kind: 'slide', label: 'Clustering p18–22' },
      prompt: 'A point can belong to several clusters with different membership weights. Which type is this?',
      options: ['Hard partitional clustering', 'Fuzzy / soft clustering', 'A dendrogram cut only', 'Supervised regression'],
      answer: 1,
      solution: 'Fuzzy/soft clustering allows weighted membership in several groups. Hard partitional clustering puts each point in one group; hierarchical clustering represents nested groups.',
    },
    {
      id: 'l8-scale',
      type: 'mcq',
      source: { kind: 'slide', label: 'Clustering p12–15' },
      prompt: 'You change income from dollars to cents while leaving age in years. What can happen to Euclidean-distance clustering?',
      options: ['Nothing; Euclidean distance is invariant to scaling one coordinate', 'Income differences can dominate and change the clusters', 'All clusters become soft', 'The algorithm automatically standardises every feature'],
      answer: 1,
      solution: 'Income differences become 100 times larger, and their squared-distance contributions become 10,000 times larger. Feature scales affect distances; choose a suitable representation and scaling.',
    },
    {
      id: 'l8-kmeans-epoch',
      type: 'mcq',
      source: { kind: 'slide', label: 'Clustering p26' },
      prompt: 'What is one standard batch K-means epoch?',
      options: ['Assign one point, move its centre, then process the next point', 'Assign all points using fixed current centres, then recompute every cluster mean', 'Recompute only the largest cluster centre', 'Run until the globally optimal partition is found'],
      answer: 1,
      solution: 'Assignment uses the same old centres for every point. The update then averages each assigned group. Another assignment is the next epoch; convergence can require several epochs.',
    },
    {
      id: 'l8-local-optimum',
      type: 'mcq',
      source: { kind: 'slide', label: 'Clustering p28–31' },
      prompt: 'K-means has converged. Which claim is justified?',
      options: ['It must be the global minimum of SSE', 'Its result can depend on the initial centres; restarts may find a lower SSE', 'Its SSE must be zero', 'Changing the distance measure cannot affect the answer'],
      answer: 1,
      solution: 'K-means can converge to a local solution. Multiple restarts or K-means++ improve the initialisation, but do not certify the global optimum.',
    },
    {
      id: 'l8-bisecting',
      type: 'mcq',
      source: { kind: 'slide', label: 'Clustering p32' },
      prompt: 'How does bisecting K-means build K clusters?',
      options: ['Start with singleton clusters and merge the closest pair', 'Start with one cluster and repeatedly split a chosen cluster using 2-means', 'Assign every point to every cluster with equal weights', 'Expand only epsilon-neighbourhoods of core points'],
      answer: 1,
      solution: 'Start with all points together. Try several 2-means bisections of a chosen cluster, keep the best split by SSE, and repeat until K clusters remain. The split history can also define a hierarchy.',
    },
    {
      id: 'l8-shapes',
      type: 'mcq',
      source: { kind: 'slide', label: 'Clustering p33–35, p43, p48' },
      prompt: 'Which algorithm is designed to recover connected dense regions with arbitrary shapes and to mark some points as noise?',
      options: ['Ordinary K-means', 'DBSCAN', 'Linear regression', 'Naive Bayes'],
      answer: 1,
      solution: 'DBSCAN uses density connectivity, so it can recover non-globular clusters and leave noise unassigned. A single epsilon can still fail when cluster densities differ greatly.',
    },
    {
      id: 'l8-hac-irreversible',
      type: 'mcq',
      source: { kind: 'slide', label: 'Clustering p36–42' },
      prompt: 'In ordinary agglomerative hierarchical clustering, what happens after two clusters have been merged?',
      options: ['The merge is undone whenever a better global partition is found', 'The merge stays; later steps can merge the combined cluster further', 'The algorithm switches to supervised learning', 'Their points are removed as noise'],
      answer: 1,
      solution: 'Agglomerative HAC merges groups irreversibly. Its dendrogram records the sequence; cutting that tree chooses a level of grouping without rerunning or undoing the construction.',
    },
    {
      id: 'l8-dbscan-core',
      type: 'mcq',
      source: { kind: 'slide', label: 'Clustering p43–46 · counting self' },
      prompt: 'MinPts = 4, counting self. A point has exactly three OTHER points within epsilon. What type is it?',
      options: ['Core', 'Border only', 'Noise', 'Impossible to tell without K'],
      answer: 0,
      solution: 'The neighbourhood contains 3 other points plus the point itself: size 4. The core test is at least MinPts, including equality.',
    },
    {
      id: 'l8-dbscan-epsilon',
      type: 'mcq',
      source: { kind: 'variant', label: 'HW08 Ex 2 · radius effect' },
      prompt: 'When epsilon increases with MinPts fixed, which statement is always true?',
      options: ['The number of clusters strictly decreases', 'A core point remains core because its neighbourhood cannot shrink', 'All former noise points must become core', 'Every pair of points in a cluster must become direct neighbours'],
      answer: 1,
      solution: 'Increasing epsilon only adds neighbours, so a core point stays core. Clusters can merge, but new clusters can also form from former noise: HW08 has 2 clusters at epsilon 2 and 3 at square root of 10. Cluster membership uses connectivity, not all-pairs proximity.',
    },
    {
      id: 'l8-dbscan-parameters',
      type: 'mcq',
      source: { kind: 'slide', label: 'Clustering p47–49' },
      prompt: 'What is a limitation of choosing one epsilon for DBSCAN?',
      options: ['It requires the true labels during training', 'A radius suitable for a sparse cluster may merge dense clusters or admit noise', 'It guarantees equal-sized groups', 'It makes feature scaling irrelevant'],
      answer: 1,
      solution: 'Varying densities are difficult for one global radius. A k-distance plot can suggest a starting epsilon, but the result still depends on scale, dimension and the data; no elbow guarantees the right grouping.',
    },
  ],
};
