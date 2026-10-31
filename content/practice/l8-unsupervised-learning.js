const r = String.raw;

const POINTS = r`| Point | A | B | C | D | E | F | G | H | I | J | K | L |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| $x$ | 1 | 0 | 0 | 3 | 2 | 1 | 5 | 4 | 3 | 3 | 2 | 2 |
| $y$ | 1 | 1 | 6 | 6 | 1 | 2 | 2 | 5 | 4 | 5 | 4 | 6 |`;

export default {
  lesson: 'l8-unsupervised-learning',
  questions: [
    {
      id: 'l8-purpose', type: 'mcq',
      source: { kind: 'slide', label: 'L8 p5, clustering' },
      prompt: r`What is the main goal of clustering when no class labels are supplied?`,
      options: ['Group similar objects together and separate dissimilar groups', 'Fit the supplied target labels with minimum classification error', 'Give every point a unique class', 'Make within-cluster distances as large as possible'],
      answer: 0,
      solution: r`A useful cluster has **high similarity within it** and **low similarity to other clusters**. There are no supplied correct class labels to learn from. The grouping depends on the features, distance and algorithm.`,
    },
    {
      id: 'l8-scaling', type: 'mcq',
      source: { kind: 'variant', label: 'applying L8 p12, feature scales (new example)' },
      prompt: r`You cluster customers using age (roughly 20-80) and annual income (roughly 20,000-200,000) with Euclidean distance. Why consider scaling the features first?`,
      options: ['Income can dominate the distance simply because its numerical scale is larger', 'Scaling supplies the missing class labels', 'Scaling always reveals the true number of clusters', 'Euclidean distance ignores numerical scale'],
      answer: 0,
      solution: r`Distance adds coordinate differences, usually after squaring. An income difference of 10,000 overwhelms an age difference of 10. Standardisation or another justified scaling makes the relative influence a deliberate choice. It does not guarantee good clusters.`,
    },
    {
      id: 'l8-types', type: 'mcq',
      source: { kind: 'slide', label: 'L8 p17-21, clustering types' },
      prompt: r`Which statement correctly distinguishes clustering types?`,
      options: ['Partitional clustering gives non-overlapping groups; hierarchical clustering gives nested groups; fuzzy clustering allows weighted membership in several groups', 'Hierarchical clustering always assigns every point to every cluster with equal weight', 'Fuzzy clustering requires one hard membership per point', 'Model-based clustering makes no assumptions about how data were generated'],
      answer: 0,
      solution: r`A partition is one flat grouping. A hierarchy stores groups inside larger groups, often as a dendrogram. Fuzzy methods use membership weights. Model-based methods, such as a Gaussian mixture, assume a data-generating model.`,
    },
    {
      id: 'l8-distance-v1', type: 'numeric',
      source: { kind: 'variant', label: 'L8 distance practice (new numbers)' },
      prompt: r`For $x=(1,2)$ and $z=(4,6)$, compute Manhattan ($L_1$) distance, Euclidean ($L_2$) distance, and squared Euclidean distance.`,
      fields: [
        { label: '$d_1(x,z)$', answer: 7, tol: 0.001 },
        { label: '$d_2(x,z)$', answer: 5, tol: 0.001 },
        { label: '$d_2(x,z)^2$', answer: 25, tol: 0.001 },
      ],
      solution: r`Subtract one coordinate at a time: $1-4=-3$, $2-6=-4$.
- Manhattan: take absolute values and add: $|-3|+|-4|=3+4=7$.
- Squared Euclidean: square and add: $(-3)^2+(-4)^2=9+16=25$.
- Euclidean: take the square root: $\sqrt{25}=5$.

Keep the square root for distance; omit it for the squared-distance objective of standard K-means.`,
    },
    {
      id: 'l8-kmeans-small-v1', type: 'numeric',
      source: { kind: 'variant', label: 'like L8 p25, one K-means iteration' },
      prompt: r`Run one **assignment then mean-update** iteration of standard Euclidean K-means on the one-dimensional points $0,2,8,10$, starting at centroids $c_1=0,c_2=8$. Compute the two updated centroids and the total SSE using those updated centroids.`,
      fields: [
        { label: '$c_1$ after update', answer: 1, tol: 0.001 },
        { label: '$c_2$ after update', answer: 9, tol: 0.001 },
        { label: 'SSE after update', answer: 4, tol: 0.001 },
      ],
      solution: r`1. Assign to the nearer starting centroid: $C_1=\{0,2\}$ and $C_2=\{8,10\}$.
2. The new centroid is the arithmetic **mean**: $c_1=(0+2)/2=1$, $c_2=(8+10)/2=9$.
3. Add squared distances to the new means: $(0-1)^2+(2-1)^2+(8-9)^2+(10-9)^2=1+1+1+1=4$.

SSE means sum of squared errors, not their average and not the sum of unsquared distances.`,
    },
    {
      id: 'l8-quiz-p26', type: 'numeric',
      source: { kind: 'quiz', label: 'L8 p26 / p51, three clustering iterations' },
      prompt: r`${POINTS}

The slide asks for three iterations starting at $c_1=(0,0)$ and $c_2=(2,2)$ using **Manhattan distance**. To make the exercise unambiguous, use these conventions: an iteration is assignment followed by an **arithmetic-mean update**, and an equal-distance tie goes to cluster 1. Enter both centroid coordinates after each of the three iterations.

**Convention note:** this follows the slide's hybrid instruction. Standard K-means uses squared Euclidean distance and means; minimising a Manhattan-distance objective uses coordinate-wise medians instead.`,
      fields: [
        { label: 'iteration 1: $c_{1x}$', answer: 1 / 3, tol: 0.002 },
        { label: 'iteration 1: $c_{1y}$', answer: 8 / 3, tol: 0.002 },
        { label: 'iteration 1: $c_{2x}$', answer: 25 / 9, tol: 0.002 },
        { label: 'iteration 1: $c_{2y}$', answer: 35 / 9, tol: 0.002 },
        { label: 'iteration 2: $c_{1x}$', answer: 4 / 5, tol: 0.002 },
        { label: 'iteration 2: $c_{1y}$', answer: 11 / 5, tol: 0.002 },
        { label: 'iteration 2: $c_{2x}$', answer: 22 / 7, tol: 0.002 },
        { label: 'iteration 2: $c_{2y}$', answer: 32 / 7, tol: 0.002 },
        { label: 'iteration 3: $c_{1x}$', answer: 9 / 5, tol: 0.002 },
        { label: 'iteration 3: $c_{1y}$', answer: 7 / 5, tol: 0.002 },
        { label: 'iteration 3: $c_{2x}$', answer: 17 / 7, tol: 0.002 },
        { label: 'iteration 3: $c_{2y}$', answer: 36 / 7, tol: 0.002 },
      ],
      solution: r`For each point, compute $|x-c_x|+|y-c_y|$ to both current centroids. Choose the smaller distance (tie: cluster 1), then average the coordinates **only after assigning every point**.

| Iteration | Cluster 1 | Cluster 2 | New $c_1$ | New $c_2$ |
|---|---|---|---|---|
| 1 | A, B, C | D, E, F, G, H, I, J, K, L | $(1/3,8/3)$ | $(25/9,35/9)$ |
| 2 | A, B, C, E, F | D, G, H, I, J, K, L | $(4/5,11/5)$ | $(22/7,32/7)$ |
| 3 | A, B, E, F, G | C, D, H, I, J, K, L | $(9/5,7/5)$ | $(17/7,36/7)$ |

First-iteration example: A has distances $2$ and $2$, so joins cluster 1. C has distances $6$ and $6$, so also joins cluster 1. For that cluster, mean $x=(1+0+0)/3=1/3$, mean $y=(1+1+6)/3=8/3$.

Third-iteration example: G has distances $|5-4/5|+|2-11/5|=4.4$ and $|5-22/7|+|2-32/7|=31/7\approx4.429$, so it switches to cluster 1. These are three iterations, not a claim that the algorithm has converged. Other tie or median conventions can give different answers.`,
    },
    {
      id: 'l8-kmeans-objective', type: 'mcq',
      source: { kind: 'slide', label: 'L8 p25, p28-30' },
      prompt: r`For **standard Euclidean K-means**, what is true of the alternating assignment and mean-update steps?`,
      options: ['They do not increase SSE, but the final result can depend on initial centroids and need not be the global minimum', 'They always find the global minimum on the first run', 'They maximise the distance from every point to its own centroid', 'They choose the number of clusters automatically'],
      answer: 0,
      solution: r`Assigning to the closest centroid minimises each point's current squared error. Given fixed assignments, the arithmetic mean minimises the cluster's sum of squared errors. Neither step increases SSE, but different starting centroids can lead to different local solutions. This argument requires the standard squared Euclidean objective.`,
    },
    {
      id: 'l8-elbow', type: 'mcq',
      source: { kind: 'slide', label: 'L8 p27, elbow method' },
      prompt: r`Why not choose $K$ simply by taking the smallest possible training SSE?`,
      options: ['SSE can keep falling as K increases, reaching zero with one centroid per distinct point; an elbow looks for diminishing improvement', 'SSE always rises as K increases', 'The elbow proves the unique true K', 'K-means cannot compute SSE for more than two clusters'],
      answer: 0,
      solution: r`More centroids give the model more flexibility. At the extreme each distinct data point can be its own centroid, giving SSE 0 and a uselessly fine grouping. The elbow is a practical trade-off, and some datasets have no clear elbow.`,
    },
    {
      id: 'l8-initialisation', type: 'mcq',
      source: { kind: 'slide', label: 'L8 p28-32, initial centroids' },
      prompt: r`Which approach can reduce the risk of a poor K-means initialisation?`,
      options: ['Use multiple starts and compare final SSE, or use K-means++ to spread initial centres probabilistically', 'Always start every centroid at exactly the same location', 'Skip reassignment after the first update', 'Increase the number of iterations and assume a global optimum is guaranteed'],
      answer: 0,
      solution: r`Different starts explore different local solutions. K-means++ chooses later centres with probability proportional to squared distance from the nearest centre already chosen. It favours uncovered areas, while still being a random procedure. Bisecting K-means is another strategy in the slides.`,
    },
    {
      id: 'l8-kmeanspp-v1', type: 'numeric',
      source: { kind: 'variant', label: 'like L8 p31, K-means++ probabilities' },
      prompt: r`A centre has already been selected at 0. The remaining one-dimensional points are 1, 3 and 4. In standard K-means++, compute the probabilities that the next centre is each point.`,
      fields: [
        { label: '$P(1)$', answer: 1 / 26, tol: 0.001 },
        { label: '$P(3)$', answer: 9 / 26, tol: 0.001 },
        { label: '$P(4)$', answer: 16 / 26, tol: 0.001 },
      ],
      solution: r`Nearest-centre distances are $1,3,4$. **Square** them to get weights $1,9,16$. The sum is 26, so normalising gives $1/26\approx0.0385$, $9/26\approx0.3462$, $16/26\approx0.6154$. The farthest point is most likely; it is not selected with certainty.`,
    },
    {
      id: 'l8-kmeans-limits', type: 'mcq',
      source: { kind: 'slide', label: 'L8 p33-35, limitations' },
      prompt: r`Which dataset is especially awkward for standard K-means?`,
      options: ['Two curved, interlocking moon-shaped clusters', 'Well-separated compact groups with similar sizes and densities', 'Two tiny spherical groups far apart', 'One-dimensional points whose natural groups are far apart'],
      answer: 0,
      solution: r`Nearest-centroid assignment favours compact, roughly globular clusters. Curved or interlocking groups can be cut apart by centroid boundaries. Different sizes, different densities and outliers can also cause trouble. A density method can suit non-globular shapes when its density settings fit the data.`,
    },
    {
      id: 'l8-mean-median', type: 'written',
      source: { kind: 'variant', label: 'clarifying the L1 instruction on L8 p26' },
      prompt: r`For one cluster with one-dimensional points $0,0,9$, compare centre $c=3$ with centre $c=0$. Compute the sum of squared distances and the sum of absolute distances for each. Explain why the update for standard K-means is a mean, while an $L_1$ objective uses a median.`,
      solution: r`The mean is $(0+0+9)/3=3$; the median (middle sorted value) is 0.

| Centre | Sum of squared distances | Sum of absolute distances |
|---|---|---|
| $c=3$ | $9+9+36=54$ | $3+3+6=12$ |
| $c=0$ | $0+0+81=81$ | $0+0+9=9$ |

The mean is better for **squared** error; the median is better for **absolute** error. In several dimensions, an $L_1$ objective uses a median separately for each coordinate (K-medians). The slide's instruction to use L1 distance with K-means therefore needs an explicit update convention.`,
    },
    {
      id: 'l8-linkage-v1', type: 'numeric',
      source: { kind: 'variant', label: 'like L8 p38, linkage distances' },
      prompt: r`Two one-dimensional clusters are $A=\{0,2\}$ and $B=\{5,9\}$. Using ordinary absolute distance, compute single-link, complete-link and average-link distances. Also compute Ward's increase in total squared error if A and B are merged.`,
      fields: [
        { label: 'single-link', answer: 3, tol: 0.001 },
        { label: 'complete-link', answer: 9, tol: 0.001 },
        { label: 'average-link', answer: 6, tol: 0.001 },
        { label: 'Ward SSE increase', answer: 36, tol: 0.001 },
      ],
      solution: r`The four cross-cluster distances are $|0-5|=5$, $|0-9|=9$, $|2-5|=3$, $|2-9|=7$.
- Single-link = smallest = **3**.
- Complete-link = largest = **9**.
- Average-link = $(5+9+3+7)/4=6$.
- Ward: old means 1 and 7, new mean 4. Old SSE is $[(0-1)^2+(2-1)^2]+[(5-7)^2+(9-7)^2]=2+8=10$. Merged SSE is $16+4+1+25=46$. Increase $=46-10=36$.

Equivalent shortcut: $\frac{|A||B|}{|A|+|B|}(\mu_A-\mu_B)^2=\frac{2\cdot2}{4}(1-7)^2=36$. Ward measures an **increase in squared error**, rather than the closest pair distance.`,
    },
    {
      id: 'l8-hac-v1', type: 'numeric',
      source: { kind: 'variant', label: 'like L8 p36-39, single-link HAC' },
      prompt: r`Run single-link agglomerative clustering on one-dimensional points $0,2,7,10$ with absolute distance. Starting with four singleton clusters, enter the three merge heights of the dendrogram, in order.`,
      fields: [
        { label: 'first merge height', answer: 2, tol: 0.001 },
        { label: 'second merge height', answer: 3, tol: 0.001 },
        { label: 'third merge height', answer: 5, tol: 0.001 },
      ],
      solution: r`1. Merge $\{0\}$ and $\{2\}$ at distance 2.
2. Distances now include $d(\{0,2\},\{7\})=\min(7,5)=5$ and $d(\{7\},\{10\})=3$, so merge 7 and 10 at height 3.
3. Merge $\{0,2\}$ with $\{7,10\}$ at their smallest cross distance, $|2-7|=5$.

A horizontal cut strictly between heights 3 and 5 leaves two clusters: $\{0,2\}$ and $\{7,10\}$.`,
    },
    {
      id: 'l8-hac-limits', type: 'mcq',
      source: { kind: 'slide', label: 'L8 p36, p42' },
      prompt: r`What is a limitation of ordinary agglomerative hierarchical clustering?`,
      options: ['An early merge is not undone later, so a poor merge can affect the whole hierarchy', 'It must be given labelled training examples', 'It cannot display nested groups', 'Every linkage definition gives the same hierarchy'],
      answer: 0,
      solution: r`HAC begins with single points and repeatedly merges clusters. It does not split an earlier merge back apart. The linkage rule affects the result; single-link can chain points together, while complete-link favours more compact groups. A straightforward worst-case implementation takes $O(n^3)$ time, as stated on p36; improved implementations can be faster.`,
    },
    {
      id: 'l8-dbscan-types', type: 'mcq',
      source: { kind: 'variant', label: 'like L8 p43-46, DBSCAN point types (new counts)' },
      prompt: r`DBSCAN counts the point itself in its $\varepsilon$-neighbourhood. With MinPts = 4, a point has only 2 points in its own neighbourhood but lies within $\varepsilon$ of a core point. What type is it?`,
      options: ['Border point', 'Core point', 'Noise point', 'Centroid'],
      answer: 0,
      solution: r`It is not core because its neighbourhood count 2 is below 4. It is **border** because it is close enough to a core point. A noise point is neither core nor border. Border points can join a cluster but do not extend the cluster by themselves.`,
    },
    {
      id: 'l8-quiz-p51', type: 'numeric',
      source: { kind: 'quiz', label: 'L8 p51, DBSCAN with L1 distance' },
      prompt: r`${POINTS}

Follow the slide's **L1-distance heading**: use Manhattan distance, $\varepsilon=1.95$, MinPts = 3, and count the point itself. Find the number of clusters, core points, border points, and noise points. A neighbour has distance **at most** $\varepsilon$.`,
      fields: [
        { label: 'number of clusters', answer: 2, tol: 0.01 },
        { label: 'number of core points', answer: 4, tol: 0.01 },
        { label: 'number of border points', answer: 6, tol: 0.01 },
        { label: 'number of noise points', answer: 2, tol: 0.01 },
      ],
      solution: r`With integer coordinates, Manhattan distances are integers. Here $d_1\le1.95$ means distance 0 or 1. Include self when counting.

| Point | Neighbourhood | Count | Type |
|---|---|---|---|
| A | A, B, E, F | 4 | core |
| B | A, B | 2 | border |
| C | C | 1 | noise |
| D | D, J, L | 3 | core |
| E | A, E | 2 | border |
| F | A, F | 2 | border |
| G | G | 1 | noise |
| H | H, J | 2 | border |
| I | I, J, K | 3 | core |
| J | D, H, I, J | 4 | core |
| K | I, K | 2 | border |
| L | D, L | 2 | border |

Core components are $\{A\}$ and $\{D,I,J\}$. Attach their border points: clusters **{A,B,E,F}** and **{D,H,I,J,K,L}**. C and G stay noise. Thus the four answers are **2, 4, 6, 2**.

**Metric matters:** if the teacher instead intends Euclidean distance, the same two clusters and noise points result, but all ten non-noise points are core and there are no border points. This happens because diagonal neighbours at distance $\sqrt2$ are then included.`,
    },
    {
      id: 'l8-dbscan-border-bridge', type: 'mcq',
      source: { kind: 'slide', label: 'L8 p44-45, DBSCAN connectivity' },
      prompt: r`A non-core border point is within $\varepsilon$ of core points from two otherwise disconnected core components. Must DBSCAN merge those components into one cluster?`,
      options: ['No; clusters expand through core points, and the shared border point can be assigned to one component', 'Yes; any chain of border points merges clusters', 'Yes; every border point is also core', 'No; the border point must always be marked as noise'],
      answer: 0,
      solution: r`The slide algorithm connects nearby **core points** to form components, then attaches border points. A border point does not propagate expansion. A shared border point may be assigned to either reachable component depending on processing order, without joining the core components.`,
    },
    {
      id: 'l8-dbscan-limits', type: 'mcq',
      source: { kind: 'slide', label: 'L8 p47-48, DBSCAN parameters and limitations' },
      prompt: r`Why can one global DBSCAN radius be a problem when clusters have very different densities?`,
      options: ['A radius suitable for dense groups can mark a sparse group as noise; a larger radius can merge nearby groups', 'DBSCAN always requires the correct K in advance', 'DBSCAN cannot find curved clusters', 'Increasing the radius always increases the number of clusters'],
      answer: 0,
      solution: r`The radius $\varepsilon$ controls what counts as a neighbourhood; MinPts controls how many neighbours make a point core. A single density threshold may not fit dense and sparse groups simultaneously. A sorted k-neighbour-distance plot can help choose a radius, but does not remove this limitation.`,
    },
    {
      id: 'l8-metric-direction', type: 'mcq',
      source: { kind: 'slide', label: 'L8 p54-58, cluster evaluation' },
      prompt: r`When comparing valid clusterings on the **same dataset with the same distance convention**, which directions usually indicate better compactness and separation?`,
      options: ['Lower Davies-Bouldin, higher Dunn, higher silhouette', 'Higher Davies-Bouldin, lower Dunn, lower silhouette', 'All three must be lower', 'All three require true class labels'],
      answer: 0,
      solution: r`Davies-Bouldin compares within-cluster scatter to between-centroid distance, so smaller is better. Dunn divides separation by cluster diameter, so larger is better. Silhouette compares within-cluster distance to the nearest other cluster's average distance, so larger is better. These are **internal** criteria; they need no true class labels and can prefer different geometries.`,
    },
    {
      id: 'l8-silhouette-v1', type: 'numeric',
      source: { kind: 'variant', label: 'like L8 p58, silhouette (corrected denominator)' },
      prompt: r`The one-dimensional clusters are $A=\{0,2\}$ and $B=\{8,10\}$, using absolute distance. For point 2, compute its average within-cluster distance $a$, nearest other-cluster average distance $b$, and silhouette $s=(b-a)/\max(a,b)$. Then compute the mean silhouette of all four points. Exclude the point itself when averaging within its own cluster.`,
      fields: [
        { label: '$a(2)$', answer: 2, tol: 0.001 },
        { label: '$b(2)$', answer: 7, tol: 0.001 },
        { label: '$s(2)$', answer: 5 / 7, tol: 0.001 },
        { label: 'mean silhouette', answer: 47 / 63, tol: 0.001 },
      ],
      solution: r`For point 2, the only **other** point in its own cluster is 0: $a=|2-0|=2$. Average distance to B is $b=(|2-8|+|2-10|)/2=(6+8)/2=7$. So $s(2)=(7-2)/7=5/7\approx0.7143$.

For point 0, $a=2$, $b=(8+10)/2=9$, so $s(0)=7/9$. Symmetry gives $s(8)=5/7$ and $s(10)=7/9$. Mean $=\frac14(7/9+5/7+5/7+7/9)=47/63\approx0.7460$.

**Slide correction:** p58 excludes self in the sum but prints $|C|$ in the denominator for $a$. Use **$|C|-1$**, the number of other points. Silhouette lies between -1 and 1; a singleton is conventionally assigned 0.`,
    },
    {
      id: 'l8-db-index-v1', type: 'numeric',
      source: { kind: 'variant', label: 'like L8 p56, Davies-Bouldin index' },
      prompt: r`For one-dimensional clusters $A=\{0,2\}$ and $B=\{8,10\}$, use the conventional Davies-Bouldin definition: $S_i$ is the **mean Euclidean distance** to cluster i's centroid, and $R_{ij}=(S_i+S_j)/|c_i-c_j|$. DB is the mean over clusters of their largest $R_{ij}$. Compute $S_A$, the distance between centroids, and DB.`,
      fields: [
        { label: '$S_A$', answer: 1, tol: 0.001 },
        { label: 'centroid distance', answer: 8, tol: 0.001 },
        { label: 'Davies-Bouldin', answer: 0.25, tol: 0.001 },
      ],
      solution: r`Centroids are $c_A=(0+2)/2=1$ and $c_B=(8+10)/2=9$. The mean distances to the centroids are $S_A=(1+1)/2=1$ and $S_B=1$. Centroid separation $=|1-9|=8$.

There is only one other cluster for each cluster, so both worst ratios are $(1+1)/8=1/4$. Their mean is **0.25**. Lower values indicate compact groups far apart.

The slide describes the idea using "variance" and a nearby cluster. This question states the conventional definition precisely: mean distance for scatter and a **maximum ratio** over other clusters, which need not be the nearest centroid alone.`,
    },
    {
      id: 'l8-dunn-v1', type: 'numeric',
      source: { kind: 'variant', label: 'like L8 p57, Dunn index' },
      prompt: r`For clusters $A=\{0,2\}$ and $B=\{8,10\}$ with absolute distance, use Dunn = (smallest distance between points in different clusters) / (largest within-cluster pair distance). Compute the numerator, denominator and Dunn index.`,
      fields: [
        { label: 'smallest inter-cluster distance', answer: 6, tol: 0.001 },
        { label: 'largest cluster diameter', answer: 2, tol: 0.001 },
        { label: 'Dunn index', answer: 3, tol: 0.001 },
      ],
      solution: r`The closest cross-cluster pair is 2 and 8, distance 6. Each cluster has diameter 2: $|0-2|=|8-10|=2$. Dunn $=6/2=3$. A larger ratio means the closest gap between clusters is large relative to the widest cluster. Outliers can strongly affect either extreme.`,
    },
    {
      id: 'l8-silhouette-interpretation', type: 'mcq',
      source: { kind: 'variant', label: 'like L8 p58, silhouette interpretation (new numbers)' },
      prompt: r`A non-singleton point has average distance $a=8$ to other points in its own cluster and nearest other-cluster average distance $b=2$. What does its silhouette indicate?`,
      options: [r`$s=-0.75$: the point is, on average, closer to another cluster, suggesting a questionable assignment`, r`$s=0.75$: the point is very well placed`, r`$s=3$: silhouette is unbounded`, r`$s=0$: all points are equally far away`],
      answer: 0,
      solution: r`$s=(b-a)/\max(a,b)=(2-8)/8=-6/8=-0.75$. A negative value means $b<a$: another cluster is closer on average than the assigned cluster. Values near 1 indicate strong separation; values near 0 indicate overlap or a boundary.`,
    },
    {
      id: 'l8-complexity-v1', type: 'numeric',
      source: { kind: 'variant', label: 'like L8 p25, K-means complexity' },
      prompt: r`K-means has a dominant distance-computation cost proportional to $nKId$: n points, K centroids, I iterations, d coordinates. For $n=200$, $K=3$, $I=10$, $d=4$, how many point-centroid distance evaluations are made, and how many coordinate comparisons do they involve? Ignore initialisation and mean-update costs.`,
      fields: [
        { label: 'point-centroid distance evaluations', answer: 6000, tol: 0.01 },
        { label: 'coordinate comparisons', answer: 24000, tol: 0.01 },
      ],
      solution: r`Each iteration compares every point to every centroid: $nK=200\cdot3=600$ distances. Ten iterations give $600\cdot10=6,000$ distances. Each distance uses four coordinates, giving $6,000\cdot4=24,000$ coordinate comparisons. This counts the stated operations; big-O notation describes growth rather than an exact full runtime.`,
    },
  ],
};
