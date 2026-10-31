---
slug: l8-clustering
num: 8
title: Unsupervised Learning – Clustering
short: K-means, HAC, DBSCAN
summary: Clustering from zero: distances and scaling, hard and soft clusters, K-means and SSE, the elbow method, K-means++, bisecting K-means, hierarchical clustering and linkage, and DBSCAN with core, border and noise points. Includes both HW08 exercises worked by hand.
sourceNote: Based on Lecture 7_Clustering.pdf (50 PDF pages), whose title slide says Lecture 8: Unsupervised Learning, and HW_Cluster.pdf (Homework 08). Page references below are PDF page numbers.
---
Clustering finds groups in **unlabelled data**. Unlike classification, there is no answer column telling the algorithm which group each object belongs to. The groups depend on the features, their scales, the distance measure and the algorithm.

:::exam What to practise
- Assign points to their nearest centre, then average the coordinates: **one K-means epoch** (HW08 Exercise 1).
- Calculate squared distances and SSE; explain why a smaller SSE does not by itself identify the best number of clusters.
- Distinguish K-means++ from choosing the farthest point deterministically.
- Merge clusters using single, complete, average or Ward linkage; read a dendrogram.
- List epsilon-neighbourhoods and identify **core, border and noise** points, then form DBSCAN clusters (HW08 Exercise 2).
- Choose an algorithm based on shape, density, noise and whether the number of clusters is known.
:::

## What makes a cluster?

Objects in one group should be **similar to each other**, and different from objects in other groups (p5). Think of short distances within groups and longer distances between groups. This is an intuition; each algorithm makes it precise in a different way.

**Applications** (p4–10): customer segmentation, grouping news stories, finding unusual transactions or messages, grouping players with similar styles, image segmentation, and recommendations. An isolated point can be an anomaly candidate, but a cluster assignment alone does not establish fraud or any other real-world label.

**There may be several sensible answers** (p16). Four small groups can also be viewed as two larger groups. The useful grouping depends on the question you want to answer.

## Data, scales and distances

High dimensionality, mixed attribute types, feature scales, data size, noise, outliers, and cluster shape/density all affect the result (p11–14). A difference of 1000 in income can overwhelm a difference of 10 in age if you use raw Euclidean distance. Choose meaningful features and scale numeric features when appropriate.

:::formula Common distance measures (p15)
For two vectors with $d$ coordinates:
$$d_2(\mathbf{x},\mathbf{y})=\sqrt{\sum_{j=1}^{d}(x_j-y_j)^2},\qquad d_1(\mathbf{x},\mathbf{y})=\sum_{j=1}^{d}|x_j-y_j|$$
$$d_p(\mathbf{x},\mathbf{y})=\left(\sum_{j=1}^{d}|x_j-y_j|^p\right)^{1/p},\quad p\ge1$$
$$s_{\cos}(\mathbf{x},\mathbf{y})=\frac{\mathbf{x}^T\mathbf{y}}{\lVert\mathbf{x}\rVert_2\lVert\mathbf{y}\rVert_2},\qquad d_{\cos}=1-s_{\cos}$$
:::

:::read
- $x_j,y_j$: coordinate $j$ of the two points. Subtract corresponding coordinates, never mix the axes.
- $\sum$: add over the coordinates. Euclidean distance squares each difference, adds, then takes a square root. Manhattan distance adds absolute differences.
- Minkowski generalises both: $p=1$ is Manhattan; $p=2$ is Euclidean.
- $\mathbf{x}^T\mathbf{y}$: dot product; the denominator multiplies the two vector lengths. Cosine compares **direction** rather than magnitude and is undefined for a zero vector.
- The slide labels the cosine expression as a distance, but that expression is **similarity**: larger means more similar. With $1-s_{\cos}$, smaller means more similar. This dissimilarity is not a metric in general.
:::

:::example Two points on a grid
Let $\mathbf{x}=(1,2)$ and $\mathbf{y}=(4,6)$.
1. Coordinate differences: $1-4=-3$, $2-6=-4$.
2. Squared Euclidean distance: $(-3)^2+(-4)^2=25$. Euclidean distance: $\sqrt{25}=5$.
3. Manhattan distance: $|-3|+|-4|=7$. Minkowski with $p=2$ gives 5 again.
4. Dot product: $1\cdot4+2\cdot6=16$. Lengths: $\sqrt5$ and $\sqrt{52}$. Cosine similarity: $16/\sqrt{260}\approx0.9923$; cosine dissimilarity: $0.0077$.
:::

:::tip Save square roots in hand calculations
To compare Euclidean distances, compare their **squares**: the square root preserves order. To check $d\le\epsilon$, compare $d^2\le\epsilon^2$. This makes the exact boundary $\epsilon=\sqrt{10}$ in HW08 easy to handle.
:::

## Types of clustering

| Type (p17–22) | Meaning | Example |
|---|---|---|
| Partitional / hard | each point belongs to one of several non-overlapping groups | K-means |
| Hierarchical | clusters are nested, forming a tree | HAC |
| Fuzzy / soft | a point can have weighted memberships in several groups | fuzzy clustering |
| Density-based | dense regions separated by sparse regions; points can be noise | DBSCAN |
| Model-based | fit a model that could have generated the observations | Gaussian mixture model |

These descriptions can overlap: a model-based method can give soft memberships. A mixture weight or membership is different from a known class label.

## K-means: assignment, update, repeat

Choose $K$ initial **centroids** (centres). One epoch consists of two stages (p25–26):

:::formula K-means updates and objective
$$c_i=\arg\min_{k\in\{1,\dots,K\}}\lVert\mathbf{x}_i-\boldsymbol\mu_k\rVert_2^2,\qquad C_k=\{\mathbf{x}_i:c_i=k\}$$
$$\boldsymbol\mu_k=\frac{1}{|C_k|}\sum_{\mathbf{x}_i\in C_k}\mathbf{x}_i,\qquad \mathrm{SSE}=\sum_{k=1}^{K}\sum_{\mathbf{x}_i\in C_k}\lVert\mathbf{x}_i-\boldsymbol\mu_k\rVert_2^2$$
:::

:::read
- $i$: point number; $k$: cluster number; $\boldsymbol\mu_k$: centre of cluster $k$.
- $\arg\min$: return the **cluster index** with the smallest distance, not the distance itself. Resolve an exact tie using a stated, consistent rule.
- $C_k$: the set of points assigned to centre $k$; $|C_k|$: how many points it contains.
- The update averages **each coordinate separately**. The centre need not be one of the original data points.
- SSE (also called WCSS here) adds **squared Euclidean distances to the assigned centres**. It is not the sum of all pairwise distances.
:::

:::steps One epoch, then the full algorithm
1. Keep all current centres fixed. Assign **every** point to its nearest centre.
2. Recompute each centre from **all** the points assigned to it.
3. For one epoch only, stop here. For a full run, repeat assignment and update until the assignments/centres stop changing, or a stated tolerance/iteration limit is reached.
4. If a cluster becomes empty, its mean is undefined; an implementation must specify a repair such as reinitialising that centre.
:::

:::example Tiny 1-D run
Points: $0,2,8,10$; initial centres: $0,8$.
- Assignment: $C_1=\{0,2\}$, $C_2=\{8,10\}$.
- Update: $\mu_1=(0+2)/2=1$ and $\mu_2=(8+10)/2=9$.
- SSE after the update: $(0-1)^2+(2-1)^2+(8-9)^2+(10-9)^2=4$.
- A second assignment produces the same groups, so the algorithm has converged.
:::

With exact assignment/mean updates, neither stage increases the objective. This gives a **local** solution, not a guarantee of the global minimum (p28–29). The basic run costs $O(nKId)$ for $n$ points, $K$ centres, $I$ iterations and $d$ attributes (p26).

## HW08 Exercise 1: one epoch by hand

The eight points are $A_1=(2,10)$, $A_2=(2,5)$, $A_3=(8,4)$, $A_4=(5,8)$, $A_5=(7,5)$, $A_6=(6,4)$, $A_7=(1,2)$, $A_8=(4,9)$. Initial centres: $\mu_1=A_1$, $\mu_2=A_4$, $\mu_3=A_7$.

:::steps Compare squared distances, then average
For example, $d^2(A_2,A_7)=(2-1)^2+(5-2)^2=10$.

| Point | to $A_1$ | to $A_4$ | to $A_7$ | Assigned cluster |
|---|---|---|---|---|
| $A_1$ | 0 | 13 | 65 | 1 |
| $A_2$ | 25 | 18 | 10 | 3 |
| $A_3$ | 72 | 25 | 53 | 2 |
| $A_4$ | 13 | 0 | 52 | 2 |
| $A_5$ | 50 | 13 | 45 | 2 |
| $A_6$ | 52 | 17 | 29 | 2 |
| $A_7$ | 65 | 52 | 0 | 3 |
| $A_8$ | 5 | 2 | 58 | 2 |

- $C_1=\{A_1\}$, so $\mu_1=(2,10)$.
- $C_2=\{A_3,A_4,A_5,A_6,A_8\}$, so $\mu_2=((8+5+7+6+4)/5,(4+8+5+4+9)/5)=(6,6)$.
- $C_3=\{A_2,A_7\}$, so $\mu_3=((2+1)/2,(5+2)/2)=(1.5,3.5)$.

Optional check: SSE with these new centres and these assignments is $0+32+5=37$.
:::

:::pitfall One epoch is not convergence
Do not move a centre after assigning just one point. Do not reassign $A_8$ to a new centre after the update when the question asks for **one epoch only**. That reassignment belongs to the next epoch.
:::

## Choosing K and initial centres

**Elbow method** (p27): run K-means for different $K$, plot SSE/WCSS against $K$, and look for a bend where adding clusters gives much less improvement. The globally minimal SSE cannot increase with $K$, so choosing the smallest SSE without any complexity trade-off would favour too many clusters. Separate local runs can fluctuate because of poor initialisation; use multiple restarts. An elbow may be unclear or absent.

**Initialisation matters** (p28–30). Different seeds can produce different local solutions. Run multiple initialisations and keep the lowest-SSE result for the same $K$, or use K-means++ / hierarchical initialisation.

:::formula K-means++ sampling (p31)
$$D(\mathbf{x})=\min_{\boldsymbol\mu\in M}d_2(\mathbf{x},\boldsymbol\mu),\qquad P(\text{next centre}=\mathbf{x})=\frac{D(\mathbf{x})^2}{\sum_{\mathbf{z}}D(\mathbf{z})^2}$$
:::

:::read
$M$ is the set of centres already chosen. Choose the **first** centre uniformly from the data. For each next centre, find each point's distance to its **nearest** chosen centre, square it, and divide by the total. Distant points are more likely, but the farthest point is **not guaranteed** to be selected. Repeat until there are $K$ centres, then run ordinary K-means.
:::

:::example K-means++ probabilities
Points $0,2,6$; first centre $0$. Squared distances: $0,4,36$, total 40. The probabilities of choosing $0,2,6$ next are $0,0.1,0.9$. If every remaining distance is zero, there are no more distinct locations to seed; the weighted formula needs a special case.
:::

**Bisecting K-means** (p32): start with one cluster containing every point. Choose a cluster to split; run 2-means on it several times and keep the bisection with the lowest SSE. Replace it with the two children, then repeat until there are $K$ clusters. The repeated splits also form a hierarchy. This reduces some initialisation problems but does not guarantee a global optimum.

**Limitations** (p33–35): K-means struggles with very different cluster sizes/densities and non-globular shapes. Means are sensitive to outliers; feature scales matter; $K$ must be chosen. Ordinary mean-based K-means assumes numeric coordinates with a meaningful squared Euclidean objective.

## Hierarchical agglomerative clustering (HAC)

**Agglomerative** means build upwards (p36–37):
1. Start with one cluster per point.
2. Compute distances between clusters using a chosen **linkage** rule.
3. Merge the closest pair, update cluster distances, repeat.
4. Stop at the required $K$, or merge all the way to one cluster to obtain a **dendrogram**.

:::formula Linkage rules in distance form (p38)
$$d_{\rm single}(A,B)=\min_{\mathbf{x}\in A,\mathbf{y}\in B}d(\mathbf{x},\mathbf{y}),\qquad d_{\rm complete}(A,B)=\max_{\mathbf{x}\in A,\mathbf{y}\in B}d(\mathbf{x},\mathbf{y})$$
$$d_{\rm average}(A,B)=\frac{1}{|A||B|}\sum_{\mathbf{x}\in A}\sum_{\mathbf{y}\in B}d(\mathbf{x},\mathbf{y})$$
$$\Delta_{\rm Ward}(A,B)=\frac{|A||B|}{|A|+|B|}\lVert\boldsymbol\mu_A-\boldsymbol\mu_B\rVert_2^2$$
:::

:::read
- $A,B$: two clusters, not single points. Consider **all cross-cluster pairs**.
- Single-link uses the closest pair; complete-link uses the farthest pair; average-link averages the $|A||B|$ cross-pair distances.
- Ward chooses the merge with the smallest **increase in within-cluster SSE**. Its formula uses the cluster sizes and the two means; it is not just the nearest-centroid rule.
- The slide describes average cosine **similarity**. Above, all rules use **distances**, so smaller is better. If given similarities instead, keep that convention consistent.
:::

:::example Four linkage scores
On a line, let $A=\{0,2\}$, $B=\{5,9\}$. Cross-cluster distances are $5,9,3,7$.
1. Single-link: $\min(5,9,3,7)=3$.
2. Complete-link: $\max(5,9,3,7)=9$.
3. Average-link: $(5+9+3+7)/4=6$.
4. Means: $\mu_A=1$, $\mu_B=7$. Ward increase: $(2\cdot2)/(2+2)\cdot(1-7)^2=36$.

The Ward value is an **SSE increase**, so do not compare its numerical scale directly with the other distance scores.
:::

**Reading a dendrogram** (p39–41): leaves are individual observations; each join shows a merge at its linkage height. Cut across the tree at a chosen height and count the branches you intersect to get the remaining clusters. For points $0,2,5,9$, single-link merges $\{0,2\}$ at height 2, adds 5 at height 3, then adds 9 at height 4. A cut between 3 and 4 leaves $\{0,2,5\}$ and $\{9\}$.

**Limitations** (p42): merges cannot be undone; early mistakes and noise can persist. Single-link can join groups through a thin chain. The naive repeated-search implementation has worst-case $O(n^3)$ time (p36); a full pairwise distance matrix needs $O(n^2)$ memory. The linkage choice affects which shapes the method can recover.

## DBSCAN: core, border and noise

DBSCAN grows **dense connected regions**, can find non-globular clusters, and can leave outliers unassigned (p43–46). It does not need $K$. Its two inputs are a neighbourhood radius $\epsilon$ (Eps) and a minimum count **MinPts**.

:::formula Epsilon-neighbourhood
$$N_\epsilon(\mathbf{x})=\{\mathbf{y}\in D:d(\mathbf{x},\mathbf{y})\le\epsilon\},\qquad \text{core if }|N_\epsilon(\mathbf{x})|\ge\mathrm{MinPts}$$
:::

:::read
- $D$: the dataset. $N_\epsilon(\mathbf{x})$ is the set of points within the radius, **including the boundary**.
- We **count the point itself**, since its distance to itself is 0. This convention is used throughout these notes and HW08 solutions.
- **Core**: at least MinPts points in its neighbourhood, counting itself.
- **Border**: not core, but within $\epsilon$ of at least one core point.
- **Noise**: neither core nor border. A point is not noise merely because its own neighbour count is small.
:::

:::steps Form clusters (p44)
1. List each neighbourhood and find the core points.
2. Connect core points whose distance is at most $\epsilon$.
3. Each connected component of that **core-point graph** forms a cluster.
4. Attach border points to an adjacent core component. A border point touching two components can be assigned according to traversal order; it does **not** merge them.
5. The remaining points are noise. A traversal implementation can initially mark a point as noise and later relabel it border after reaching a nearby core point.
:::

:::example Core is not the same as member
Points on a line: $0,1,2,4,8$; $\epsilon=1.1$, MinPts $=3$.
- $N(0)=\{0,1\}$; $N(1)=\{0,1,2\}$; $N(2)=\{1,2\}$; $N(4)=\{4\}$; $N(8)=\{8\}$.
- Only 1 is core. Points 0 and 2 are border because they touch that core.
- One cluster: $\{0,1,2\}$. Noise: $\{4,8\}$. Border points do not expand the cluster through their own neighbours.
:::

## HW08 Exercise 2: DBSCAN at two radii

Use the same eight points as Exercise 1, Euclidean distance, MinPts $=2$, **counting self**, and $d\le\epsilon$.

:::steps Neighbourhood table
| Point | $N_2$ | $N_{\sqrt{10}}$ |
|---|---|---|
| $A_1$ | $\{A_1\}$ | $\{A_1,A_8\}$ |
| $A_2$ | $\{A_2\}$ | $\{A_2,A_7\}$ |
| $A_3$ | $\{A_3,A_5,A_6\}$ | $\{A_3,A_5,A_6\}$ |
| $A_4$ | $\{A_4,A_8\}$ | $\{A_4,A_8\}$ |
| $A_5$ | $\{A_3,A_5,A_6\}$ | $\{A_3,A_5,A_6\}$ |
| $A_6$ | $\{A_3,A_5,A_6\}$ | $\{A_3,A_5,A_6\}$ |
| $A_7$ | $\{A_7\}$ | $\{A_2,A_7\}$ |
| $A_8$ | $\{A_4,A_8\}$ | $\{A_1,A_4,A_8\}$ |

**At $\epsilon=2$:** core points are $A_3,A_4,A_5,A_6,A_8$. There are two clusters, $\{A_3,A_5,A_6\}$ and $\{A_4,A_8\}$; noise is $\{A_1,A_2,A_7\}$. There are no border points.

**At $\epsilon=\sqrt{10}$:** all eight points are core. There are three clusters: $\{A_1,A_4,A_8\}$, $\{A_2,A_7\}$ and $\{A_3,A_5,A_6\}$. There is no noise.

Checks: $d^2(A_2,A_7)=10$, so those points become neighbours exactly at the larger radius. $d^2(A_1,A_8)=5$, so $A_1$ joins the $A_4,A_8$ component through $A_8$. $d^2(A_1,A_4)=13>10$, but **every pair in a density-connected cluster need not be direct neighbours**.
:::

:::pitfall State the counting convention
The homework says “min sample is 2” without expanding the convention. The answers above count self. If an instructor instead requires **two other points**, that is MinPts $=3$ under our convention: at radius 2 only $\{A_3,A_5,A_6\}$ remains a cluster; at radius $\sqrt{10}$ the clusters are $\{A_1,A_4,A_8\}$ and $\{A_3,A_5,A_6\}$, with $A_2,A_7$ noise.

The number of clusters can **increase** when epsilon grows: previously isolated noise can become a new cluster. In the main answer, it changes from two to three.
:::

## Choosing an algorithm and DBSCAN parameters

For DBSCAN (p47), inspect a sorted **k-distance plot** and look for a knee separating short within-cluster distances from large isolated-point distances. State whether the plotted neighbour count includes self; with our convention, core status uses the distance to the $(\mathrm{MinPts}-1)$-th **other** neighbour when MinPts $>1$. Test whether the resulting groups make sense for the application.

Increasing epsilon adds neighbours. Increasing MinPts at a fixed radius makes the core condition harder. DBSCAN can struggle with **varying densities** and **high-dimensional** data (p48); one radius may not suit all groups.

| Question (p49) | K-means | HAC | DBSCAN |
|---|---|---|---|
| Must supply $K$? | Yes | Can choose a cut / stop at $K$ | No; supply epsilon and MinPts |
| What defines a group? | nearest mean | linkage-based merges | connected dense regions |
| Typical shape | compact, roughly globular | depends on linkage | can be arbitrary |
| Noise output? | every point is assigned | basic HAC includes every point | explicit noise points |
| Main caution | seeds, scales, outliers | irreversible merges, linkage, cost | scales, radius, varying densities |

Do not choose solely from an algorithm's name: inspect attribute types, size, dimension, noise, shape and density. All three depend on the chosen representation and distance.
