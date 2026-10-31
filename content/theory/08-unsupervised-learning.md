---
slug: l8-unsupervised-learning
num: 8
title: Unsupervised Learning - Clustering
short: Clustering, K-means, HAC, DBSCAN
summary: Clustering without labels; distance and scaling; K-means, K-means++ and bisecting K-means; hierarchical clustering and linkage; DBSCAN core, border and noise points; evaluating clusters with Davies-Bouldin, Dunn and silhouette scores.
---
Clustering discovers groups in **unlabelled data**. You have the inputs (customers, documents, pixels), but no teacher has supplied the correct group for each one. This lecture covers clustering; the title does not mean that every unsupervised method, such as PCA, is taught here.

:::exam What the midterm can ask from this lecture
- Explain the goal of clustering, its applications, and why a dataset can have several reasonable groupings.
- Calculate Euclidean and Manhattan distances or cosine similarity; explain why feature scales matter.
- Run assignment and centroid-update steps, calculate SSE, read an elbow plot, and explain initialization and K-means++.
- Merge clusters with single, complete or average linkage; interpret a dendrogram.
- Identify DBSCAN core, border and noise points using a stated distance, Eps and MinPts; find the clusters.
- Calculate or interpret Davies-Bouldin, Dunn and silhouette scores, including which direction is better.
:::

## What a cluster means

The aim is **high similarity within a group** and **low similarity between groups** (p5). In distance language: small **intra-cluster** distances and large **inter-cluster** distances. These are goals; different algorithms turn them into different mathematical rules.

Applications (p4, p6-10): customer segmentation, grouping news about the same story, anomaly detection, finding athletes with similar playing styles, image segmentation, and recommendations. An isolated point can be an anomaly, but a clustering result alone does not prove that it is fraud or spam.

:::example Grouping customers
Represent each customer by two numbers: visits per month and average purchase amount. Customers with similar habits may form groups even though the data contain no labels such as "frequent shopper". We give those groups names **after** examining the result. Cluster numbers 0, 1 and 2 are identifiers, not ranked scores or known class labels.
:::

The same picture can reasonably contain 2, 4 or 6 groups depending on the desired detail (p15). The result depends on the **data**, our **definition of a cluster**, and the **algorithm** (p11-13).

| Type (p16-21) | Meaning | Example |
|---|---|---|
| **Partitional** | one flat division into non-overlapping groups | K-means |
| **Hierarchical** | nested groups, represented by a tree | HAC; bisecting K-means |
| **Fuzzy / soft** | one point can have membership weights in several groups | fuzzy c-means |
| **Density-based** | dense regions separated by sparse regions; noise can remain unassigned | DBSCAN |
| **Model-based** | assume a data-generating model and estimate its components | Gaussian mixture model |

These descriptions can overlap. A mixture model, for example, can give soft membership probabilities.

## Distance and feature scaling

A point is a list of numbers. For $\mathbf{x}=(x_1,x_2)$, $x_1$ is its first coordinate and $x_2$ its second. A **distance** is a number expressing how far apart two points are; smaller means closer (p14).

:::formula Euclidean and Manhattan distance (p14)
$$d_2(\mathbf{x},\mathbf{y})=\sqrt{\sum_{j=1}^{d}(x_j-y_j)^2},\qquad d_1(\mathbf{x},\mathbf{y})=\sum_{j=1}^{d}|x_j-y_j|$$
:::

:::read
- $d$ is the number of coordinates (features); $j$ counts them.
- $x_j-y_j$ compares the two values of feature $j$. The bars $|\cdot|$ mean **absolute value**: discard the minus sign, so $|-3|=3$.
- **Euclidean / L2:** square each difference, add, then take the square root. This is straight-line distance.
- **Manhattan / L1:** add the absolute differences. Think of travelling along horizontal and vertical streets.
- For assigning to the closest Euclidean centre, the square root can be skipped: squared distances have the same ordering.
:::

:::steps Two points: $(1,2)$ and $(4,6)$
1. Coordinate differences: $1-4=-3$ and $2-6=-4$.
2. Euclidean: $\sqrt{(-3)^2+(-4)^2}=\sqrt{9+16}=5$.
3. Manhattan: $|-3|+|-4|=3+4=7$.
4. Squared Euclidean distance is $25$, not $5$. This is the quantity used in the usual K-means SSE.
:::

:::formula Minkowski distance (p14)
$$d_p(\mathbf{x},\mathbf{y})=\left(\sum_{j=1}^{d}|x_j-y_j|^p\right)^{1/p},\qquad p\ge1$$
:::

:::read
This is one family containing Manhattan ($p=1$) and Euclidean ($p=2$). The outside power $1/p$ means "take the $p$-th root". Here $p$ is a distance parameter, not a probability. For coordinate differences 3 and 4, $p=1$ gives $7$ and $p=2$ gives $5$, exactly as above.
:::

:::formula Cosine similarity and cosine distance (p14)
$$\operatorname{cosim}(\mathbf{x},\mathbf{y})=\frac{\mathbf{x}^T\mathbf{y}}{\|\mathbf{x}\|_2\|\mathbf{y}\|_2},\qquad d_{\cos}=1-\operatorname{cosim}(\mathbf{x},\mathbf{y})$$
:::

:::read
- The dot product $\mathbf{x}^T\mathbf{y}$ multiplies matching coordinates and adds them.
- $\|\mathbf{x}\|_2$ is the Euclidean length of $\mathbf{x}$ from the origin. Both vectors must have nonzero length.
- Cosine compares **directions**. Similarity 1 means the same direction, 0 means perpendicular, and -1 means opposite directions.
- The picture on p14 labels cosine as $D$, but the displayed cosine formula is a **similarity**: larger is more similar. Subtracting from 1 turns it into the usual cosine dissimilarity.
:::

:::example Cosine ignores overall size
For $\mathbf{x}=(1,0)$ and $\mathbf{y}=(2,0)$, the dot product is 2 and the lengths are 1 and 2: similarity $2/(1\cdot2)=1$, cosine distance 0. Their Euclidean distance is nevertheless 1. For $(1,0)$ and $(0,1)$, similarity is 0 and cosine distance is 1.
:::

**Scale matters** (p12). If age changes by 1 year but income by 10,000 currency units, raw Euclidean distance can be dominated by income. Normalize or standardize appropriate numeric features before comparing them. For categories such as colours, arbitrary codes 1, 2, 3 do not automatically define meaningful distances. Mixed or binary features may need different representations or distances.

High dimensionality, dataset size, noise, outliers, cluster shape, unequal sizes and unequal densities all affect the choice of method (p12-13). Reducing dimensions can help when many features are uninformative; it is not a guarantee of better groups.

## K-means: assign, average, repeat

Choose the number of groups $K$ **before** running ordinary K-means. Each group has a **centroid**, its coordinate-wise mean. Alternate between assigning points to their closest centroid and recomputing the centroids (p24-25).

:::formula Centroid and sum of squared errors, SSE (p25)
$$\boldsymbol{\mu}_k=\frac1{|C_k|}\sum_{\mathbf{x}\in C_k}\mathbf{x},\qquad \operatorname{SSE}=\sum_{k=1}^{K}\sum_{\mathbf{x}\in C_k}\|\mathbf{x}-\boldsymbol{\mu}_k\|_2^2$$
:::

:::read
- $C_k$ is the set of points in cluster $k$; $|C_k|$ is the **number** of points in that set, not an absolute value of a coordinate.
- $\boldsymbol{\mu}_k$ ("mu k") is its centroid. Add the first coordinates and divide by the number of points; do the same for every other coordinate.
- The inner SSE sum adds squared point-to-centroid distances within one cluster; the outer sum adds the results across all $K$ clusters. **Smaller SSE is better for fixed $K$.** WCSS (within-cluster sum of squares) is another name used on p27.
- A centroid can lie between data points; it need not be an observed point.
:::

:::steps The algorithm (p25)
1. Choose $K$ initial centroids.
2. Calculate each point's distance to each current centroid. Assign it to the closest one; state a consistent rule if there is a tie.
3. Recompute **all** centroids from those assignments.
4. Repeat steps 2-3 until the assignments or centroids stop changing, or a chosen iteration limit is reached.
5. An empty cluster has no mean. A practical implementation must explicitly handle it, for example by choosing a new centre.
:::

:::example A complete small run
One-dimensional data: $0,2,8,10$. Let $K=2$ and initial centres be 0 and 10.

| Round | Assignments using current centres | New centres |
|---|---|---|
| 1 | $\{0,2\}$ and $\{8,10\}$ | $(0+2)/2=1$ and $(8+10)/2=9$ |
| 2 | $\{0,2\}$ and $\{8,10\}$ again | 1 and 9 again: stop |

Final SSE $=(0-1)^2+(2-1)^2+(8-9)^2+(10-9)^2=4$. In two dimensions, the centroid of $(0,2)$ and $(2,4)$ is $((0+2)/2,(2+4)/2)=(1,3)$.
:::

### The L1 exercise on p26 and p51

:::note State the convention before calculating
The slides request "K-Means using L1-Distance", while p25 gives a **mean** centroid update. Standard K-means minimizes **squared Euclidean** SSE. If the objective is instead the sum of Manhattan distances, coordinate-wise **medians**, rather than means, minimize it; that is called **k-medians**. The practice solution follows the course wording as an **L1 assignment + mean update** exercise, with ties assigned to cluster 1. Its usual K-means SSE-decrease guarantee does not follow from this mixed convention.
:::

To do the slide exercise by hand: make a table with one row per point, its two L1 distances, and its chosen cluster. Finish all assignments before averaging. One iteration means **one full assignment followed by one update**; three iterations does not automatically mean convergence. The practice question includes the original 12-point table and all three rounds.

### Choosing K and initial centres

**Elbow method** (p27): plot SSE against $K$ and look for a bend where adding another cluster gives much less improvement. For example, SSE values 100, 45, 20, 18, 17 for $K=1,2,3,4,5$ suggest an elbow near 3. This is a heuristic; some curves have no clear elbow. Do not simply choose the smallest SSE: using one cluster per point can reduce it to zero.

Different initial centroids can lead to different **local** optima (p28-30). Several restarts and retaining the lowest-SSE result can help. They do not prove that the global optimum has been found.

:::formula K-means++ seeding (p31)
$$P(\text{choose }\mathbf{x})=\frac{D(\mathbf{x})^2}{\sum_{\mathbf{z}}D(\mathbf{z})^2},\qquad D(\mathbf{x})=\min_{\text{chosen centre }\boldsymbol{\mu}}\|\mathbf{x}-\boldsymbol{\mu}\|_2$$
:::

:::read
Choose the first centre uniformly from the data. For every remaining point, find its distance $D$ to the **nearest centre already chosen**. Square that distance, then divide by the total squared distances to get a probability. Faraway points are more likely to become new centres, but the farthest point is **not guaranteed** to be selected. Repeat until there are $K$ centres, then run ordinary K-means.
:::

:::example Squared-distance probabilities
Two remaining candidates have nearest-centre distances 1 and 3. Their weights are $1^2=1$ and $3^2=9$, giving probabilities $1/(1+9)=0.1$ and $9/(1+9)=0.9$. The denominator makes the probabilities add to 1.
:::

**Bisecting K-means** (p32): start with all points in one cluster; choose a cluster, split it using 2-means several times, keep the best split by SSE, then repeat until $K$ clusters exist. Recording the splits gives a hierarchy; stopping at $K$ leaves gives a partition. It is a **top-down** approach, unlike bottom-up HAC.

**Cost** (p25): $O(nKId)$ for $n$ points, $K$ centres, $I$ iterations and $d$ features. Read this as "points times centres times iterations times coordinates": doubling $I$ roughly doubles the work when the other quantities stay fixed.

**Limitations** (p33-35): K-means prefers compact, roughly spherical groups of comparable size and density. It can split a large group, merge smaller ones, or cut across curved shapes. Means are pulled by outliers. The method requires a chosen $K$, meaningful numeric coordinates, suitable scaling and careful initialization.

## Hierarchical agglomerative clustering (HAC)

**Agglomerative means build up by merging** (p36-37). Start with one cluster per point. At each step merge the closest pair of clusters, update the cluster distances, and repeat until one cluster or the requested number remains. The key question is: how do we measure distance between **groups**?

:::formula Linkage rules for a distance $d$ (p38-41)
$$d_{\mathrm{single}}(A,B)=\min_{a\in A,\ b\in B}d(a,b),\qquad d_{\mathrm{complete}}(A,B)=\max_{a\in A,\ b\in B}d(a,b)$$
$$d_{\mathrm{average}}(A,B)=\frac1{|A||B|}\sum_{a\in A}\sum_{b\in B}d(a,b)$$
:::

:::read
- Check every **cross-cluster** pair: one point in $A$, one in $B$.
- **Single-link:** choose the smallest pairwise distance (nearest neighbours). It can connect groups through a chain of nearby points.
- **Complete-link:** choose the largest pairwise distance (farthest neighbours). It favours groups with small diameter.
- **Average-link:** add all cross-pair distances and divide by the number of pairs, $|A||B|$. This is not simply the distance between centroids.
- Page 38 mentions averaging cosine similarities. When working with a **distance**, use the average distance and merge the smallest value; when given similarities, the direction of comparison must match the stated convention.
:::

:::example Three linkage answers from the same points
On a number line let $A=\{0,2\}$ and $B=\{6,8\}$. The four cross-distances are $|0-6|=6$, $|0-8|=8$, $|2-6|=4$, $|2-8|=6$.

- Single-link $=\min(6,8,4,6)=4$.
- Complete-link $=\max(6,8,4,6)=8$.
- Average-link $=(6+8+4+6)/4=6$.
:::

**Ward's method** (p38) merges the pair causing the **smallest increase in total within-cluster SSE**, using Euclidean geometry. It does not minimize the nearest-pair distance. For two singleton clusters $\{0\}$ and $\{2\}$, SSE before the merge is 0; their merged centre is 1 and SSE is $1+1=2$, so the increase is 2.

A **dendrogram** is the tree recording the merges (p39-41). Leaves are the original points; a joining branch records a merge, and its height records the linkage value. Cut horizontally at a chosen height; the number of branches the cut crosses gives the number of remaining clusters. The left-to-right order of leaves is not a numerical feature value.

:::steps Tiny single-link hierarchy
Data: $0,2,7,10$.
1. Merge $\{0\}$ and $\{2\}$ at distance 2.
2. Merge $\{7\}$ and $\{10\}$ at distance 3.
3. Single-link distance between the two remaining groups is $|2-7|=5$, so the final merge is at height 5.
4. A cut between heights 3 and 5 leaves two clusters: $\{0,2\}$ and $\{7,10\}$.
:::

**Limitations** (p42): greedy merges cannot be undone in that run, and an early poor merge can affect everything above it. Noise, different cluster sizes and unsuitable linkage can cause trouble. A basic implementation can take $O(n^3)$ time (p36); efficient implementations depend on the linkage and data representation. HAC builds a hierarchy instead of directly optimizing the ordinary K-means SSE objective.

## DBSCAN: dense regions plus noise

DBSCAN grows clusters through connected **dense neighbourhoods** (p43-46). It can find curved shapes and leave isolated points as noise. Its main parameters are a radius **Eps**, written $\varepsilon$, and the minimum neighbourhood count **MinPts**. It does not require $K$ in advance.

:::formula Eps neighbourhood
$$N_{\varepsilon}(p)=\{q:d(p,q)\le\varepsilon\},\qquad p\text{ is core if }|N_{\varepsilon}(p)|\ge\operatorname{MinPts}$$
:::

:::read
- $p$ is the point being checked; $q$ runs through data points.
- The braces mean "the set of all points whose distance from $p$ is at most Eps". Points **exactly** Eps away are included.
- We count **the point itself**, since $d(p,p)=0$. Some classroom conventions exclude it, so state the convention before calculating. The practice problems include it.
- **Core:** enough points in its own neighbourhood.
- **Border:** not core, but within Eps of at least one core point.
- **Noise:** neither core nor border. "Boundary point" on p51 means border point.
:::

:::steps Finding clusters by hand (p44)
1. List the Eps neighbours of **every** point and count them.
2. Mark all core points using MinPts.
3. Connect pairs of core points that are within Eps. Each connected component of these core points starts one cluster.
4. Attach each border point to a cluster containing one of its core neighbours. A border point touching two clusters may be assigned according to processing order; it does not merge those two core components.
5. Leave the remaining points as noise. A chain consisting only of border points cannot propagate a cluster.
:::

:::example Core, border and noise on a number line
Points $A=0$, $B=0.5$, $C=1$, $D=1.8$, $E=5$. Use distance $|x-y|$, Eps $=1$, MinPts $=3$, including the point itself.

| Point | Neighbours within 1 | Count | Type |
|---|---|---|---|
| A | A, B, C | 3 | core |
| B | A, B, C | 3 | core |
| C | A, B, C, D | 4 | core |
| D | C, D | 2 | border: next to core C |
| E | E | 1 | noise |

The connected core points A, B, C form one cluster; attach D. Final result: cluster $\{A,B,C,D\}$ and noise E.
:::

**Choosing parameters** (p47): sort each point's distance to its chosen $k$-th nearest neighbour and look for a bend in the distance plot. Dense regions have small such distances; isolated points have large ones. Match the neighbour-count convention to whether self is included. Increasing Eps generally expands neighbourhoods; increasing MinPts makes the core criterion stricter.

**Limitations** (p48): one global Eps can fail when clusters have very different densities; high-dimensional distances can become less informative. Too small a radius may turn much of the dataset into noise; too large a radius may join distinct regions.

:::note The distance in the p51 exercise matters
The heading says **L1-Distance**, so the main practice solution uses Manhattan distance for both the assignment exercise and DBSCAN (Eps 1.95, MinPts 3, self included). Using Euclidean distance changes which points are core or border. The worked solution shows this difference explicitly; a radius has no meaning without its distance rule.
:::

## Choosing an algorithm

There is no universally best clustering method (p49-53). Choose based on feature types and scale, data size and dimensionality, noise, expected group shape and density, and whether you want a flat partition or a hierarchy.

| Method | Main choices | Useful when | Main caution |
|---|---|---|---|
| K-means | $K$, starting centres | numeric data with compact groups; many points | initialization, outliers, uneven sizes/densities, curved groups |
| HAC | distance, linkage, cut | you want a hierarchy and can afford pairwise comparisons | irreversible merges; time/memory for large data |
| DBSCAN | distance, Eps, MinPts | dense connected shapes and explicit noise handling | varying density, parameter choice, high dimensions |

## Evaluating clustering

A useful partition often has **cohesion** (points in a group are close) and **separation** (different groups are apart), illustrated on p54. A score measures a chosen mathematical notion of a good cluster; it does not establish that the groups match the real-world purpose.

The p55 map distinguishes **internal** evaluation (data and predicted groups only), **external** evaluation (compare with reference labels, if available), and **relative** evaluation (compare candidate clusterings). The three scores below are internal scores. Use the same preprocessing, distance and scoring convention when comparing results. State how noise is handled if evaluating DBSCAN.

### Davies-Bouldin index: smaller is better

:::formula Standard centroid-based Davies-Bouldin definition (p56)
$$S_i=\frac1{|C_i|}\sum_{\mathbf{x}\in C_i}\|\mathbf{x}-\boldsymbol{\mu}_i\|_2,\qquad M_{ij}=\|\boldsymbol{\mu}_i-\boldsymbol{\mu}_j\|_2$$
$$R_{ij}=\frac{S_i+S_j}{M_{ij}},\qquad \operatorname{DB}=\frac1K\sum_{i=1}^{K}\max_{j\ne i}R_{ij}$$
:::

:::read
- $S_i$ measures the average distance of a point in cluster $i$ from that cluster's centroid: smaller means more compact.
- $M_{ij}$ is the distance between two centroids: larger means better separation. Distinct centroids are needed for these ratios.
- For each cluster $i$, calculate every $R_{ij}$ and keep the **largest** (worst) one. Then average these worst ratios over all $K$ clusters.
- The score is nonnegative. A **smaller** score means less within-cluster scatter relative to separation under this definition.
:::

:::note Clarifying p56
The slide describes "variance" and the "nearest neighbouring cluster" informally. In the standard definition used here, $S_i$ is an **average unsquared distance**, and the comparison cluster maximizes the ratio $R_{ij}$; it is not necessarily the centroid that is nearest. This follows the [standard formulation in the scikit-learn documentation](https://scikit-learn.org/stable/modules/clustering.html#davies-bouldin-index).
:::

:::example Two clusters on a line
Let $C_1=\{0,2\}$ and $C_2=\{6,8\}$. Centroids: 1 and 7. Average scatter: $S_1=(1+1)/2=1$, $S_2=1$. Centroid separation: $M_{12}=6$. There is only one other cluster to compare with, so both worst ratios are $(1+1)/6=1/3$. Their average gives **DB $=1/3$**.
:::

### Dunn index: larger is better

:::formula Point-distance version of the Dunn index (p57)
$$\operatorname{Dunn}=\frac{\min_{i\ne j}\ \min_{a\in C_i,\ b\in C_j}d(a,b)}{\max_k\ \max_{a,b\in C_k}d(a,b)}$$
:::

:::read
The numerator is the **smallest distance between points in different clusters**. The denominator is the **largest within-cluster diameter**, where a diameter is the farthest distance between two points in one cluster. A large ratio means even the closest groups are separated relative to their own spread. This definition needs at least two clusters and a positive denominator; variants can use other separation or diameter definitions.
:::

:::example Reuse $\{0,2\}$ and $\{6,8\}$
The closest cross-cluster pair is 2 and 6, distance 4. Each cluster's diameter is 2. Thus **Dunn $=4/2=2$**. One outlier can greatly increase the denominator, which helps explain this score's sensitivity to extreme points.
:::

### Silhouette: compare a point with its own and other groups

:::formula Silhouette for point $i$ in cluster $C$ (p58)
$$a(i)=\frac1{|C|-1}\sum_{\substack{j\in C\\j\ne i}}d(i,j),\qquad b(i)=\min_{B\ne C}\frac1{|B|}\sum_{j\in B}d(i,j)$$
$$s(i)=\frac{b(i)-a(i)}{\max\{a(i),b(i)\}},\qquad \overline{s}=\frac1n\sum_{i=1}^{n}s(i)$$
:::

:::read
- $a(i)$: average distance to the **other** points in the same cluster. Small is good. Exclude $i$ itself from both the sum and the count.
- To find $b(i)$, average distances to **all** points of each other cluster separately, then take the smallest of those averages. It is not the distance to just one nearest point.
- $s(i)$ compares separation with cohesion. The dataset score $\overline{s}$ averages the point scores.
- Range: $-1\le s(i)\le1$. Near **1**: well placed; near **0**: near a boundary or overlapping groups; **negative**: another cluster is closer on average.
- A singleton cluster is conventionally assigned silhouette 0; if $a=b=0$, also use 0. The ordinary overall score requires between 2 and $n-1$ clusters.
:::

:::note Formula correction on p58
The slide sums over $j\ne i$ but divides by $|C|$. There are only $|C|-1$ other points, so the standard mean uses **$|C|-1$**. The expressions above use that correction, consistent with the [standard silhouette definition](https://scikit-learn.org/stable/modules/clustering.html#silhouette-coefficient).
:::

:::steps Silhouette of point 0 in $\{0,2\}$ versus $\{6,8\}$
1. Its only same-cluster neighbour is 2, so $a=|0-2|=2$.
2. Average distance to the other cluster: $b=(|0-6|+|0-8|)/2=(6+8)/2=7$.
3. $s=(7-2)/\max(2,7)=5/7\approx0.714$. This point is closer to its own group on average.
4. If instead a point had $a=5,b=2$, its score would be $(2-5)/5=-0.6$, suggesting a poor assignment.
:::

Exact silhouette evaluation uses pairwise distances: ordinarily $O(n^2)$ distance calculations, or $O(n^2d)$ arithmetic work for $d$-dimensional points. Storing a complete distance matrix uses $O(n^2)$ memory, though an implementation can compute distances in chunks.

:::tip Direction to remember
**SSE and Davies-Bouldin: lower is better. Dunn and silhouette: higher is better.** SSE should be compared carefully across different $K$; compactness-based scores may underrate valid curved or density-based groups.
:::
