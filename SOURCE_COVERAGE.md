# Source coverage

The 2026-10-31 update compares the existing study-site source with the 11 supplied PDFs in `C:\Users\Admin\Downloads\`. These PDFs are reference material; their assignment-submission instructions are not instructions for maintaining the app. No course PDF is copied into the repository.

## Supplied documents and coverage

| Supplied PDF | PDF pages | Coverage in the site |
|---|---:|---|
| `Lecture 1_Introduction to ML.pdf` | 38 | Existing L1 definitions, learning types and applications. Added the missing practical checklist for choosing ML (p30–31), application costs (p31) and healthcare workflow (p36), with two new MCQs. |
| `Lecture 2_General Concepts for ML.pdf` | 61 | Existing L2 random variables, probability, distributions, information measures, statistical learning, data splits, cross-validation and workflows. |
| `Lecture 3_Linear Regression.pdf` | 55 | Existing L3 model/cost, gradient descent, multivariate regression, normal equation and pseudoinverse. |
| `Lecture 4_Classification_P1 (2).pdf` | 46 | Existing L4 Bayes/MAP/MLE, generative models, Naive Bayes and smoothing, logistic regression and softmax. |
| `Lecture 5_Classification_P2_DT (1).pdf` | 46 | Existing decision-tree lesson: Hunt's algorithm, attribute types, Gini, entropy, gain, gain ratio and classification error. Its title slide calls it Lecture 4, Classification P2. |
| `Lecture 6_Feature Selection & Model Optimization.pdf` | 46 | Existing model-optimization lesson, including bias/variance, feature selection, regularization and ensembles. The supplied title slide calls it Lecture 6; the established site lesson is L7. |
| `Lecture 7_Clustering.pdf` | 50 | **Additional coverage in the existing L8 lesson**: applications/data/distance (p4–16), clustering families (p17–22), K-means/SSE/elbow/initialization/variants/limits (p25–35), HAC/linkages/dendrograms/limits (p36–42), DBSCAN/types/parameters/limits (p43–48), algorithm choice (p49). Adds 20 supplementary questions, three drills and formula-sheet entries; the existing elbow and border-bridge MCQs are reused. |
| `HW.pdf` | 1 | Existing HW01 Ex 1–2: MLE for coin and categorical/die probabilities (`hw01-ex1`, `hw01-ex2`). |
| `HW-1.pdf` | 2 | Existing HW02: analytical regression (`hw02-ex1a`), two gradient-descent epochs (`hw02-ex1b`), ridge derivation (`hw02-ex2`), multi-output regression (`hw02-ex3`). This is the same exercise set previously attributed to `HW03-ML.pdf`. |
| `HW4 (1).pdf` | 2 | Already covered: Ex 1 is the badminton Naive Bayes exercise (`hw04-ex2` in the longer version); Ex 2 is the separable study-hours logistic exercise (`hw04-ex3`). Both scanned pages were visually checked. |
| `HW_Cluster.pdf` | 1 | **New HW08 Ex 1–2**: one K-means epoch (`hw08-ex1`) and DBSCAN at two radii (`hw08-ex2`), with full memberships and calculations in theory and practice. |

The site's SVM lesson and HW05 content come from the earlier source set, not the 11 PDFs above. They remain available.

## Numbering and page references

The supplied copies use mixed lecture numbering and differ in length from some earlier decks. Preserve established lesson URLs, question IDs and the L1–L8 site sequence rather than renumbering saved progress. In particular, the clustering filename says “Lecture 7” while its first page says **Lecture 8: Unsupervised Learning**; the supplement stays in the existing `l8-unsupervised-learning` lesson. The original 59-page L8 lesson, slide exercises and evaluation metrics remain available.

HW08 supplement questions labelled “Clustering” use **1-based PDF page numbers in the supplied 50-page file**. Existing questions labelled “L8” and the main L8 theory use the original 59-page deck; the HW08 theory sections identify their separate source explicitly. New introduction material explicitly cites the supplied 38-page PDF. Existing unqualified page references in older lessons/questions refer to their earlier decks and need not match the supplied shorter copies. The coverage table is a topic mapping, not a claim of identical pagination. A full remapping of older page citations remains a separate editorial task.

## Calculation conventions and checks

- K-means uses squared Euclidean distance for assignment and SSE. One epoch means assigning all points using fixed old centres, then updating all means. HW08's first updated centres are `(2,10)`, `(6,6)`, `(1.5,3.5)`; SSE is 37.
- DBSCAN neighbourhoods include self and satisfy `distance <= epsilon`. With MinPts 2, HW08 gives `{A3,A5,A6}`, `{A4,A8}` and noise `{A1,A2,A7}` at epsilon 2. At epsilon `sqrt(10)`, the clusters are `{A1,A4,A8}`, `{A2,A7}`, `{A3,A5,A6}` with no noise. The solution also gives the results if “2” means two other neighbours.
- The cosine expression shown on the clustering distance slide is a similarity. Notes distinguish that from `1 - cosine similarity` and mention zero-vector handling.
- HAC examples use distances consistently. Ward's value is an increase in SSE, not the same quantity as a single/complete/average-link distance. The average-link slide's cosine-similarity wording is identified explicitly.
- Tests recompute HW08 memberships/centres/SSE from coordinates and DBSCAN results under both counting conventions. New numeric examples and drill endpoints are checked; all 18 generators render valid math for 300 seeds each.

Current totals: **10 theory/reference pages, 229 questions, 20 homework exercise entries, 55 homework-style variants, 18 drills**. Exercise 1a and 1b of HW02 count as separate question-bank entries, as in the earlier site totals.

The upstream HW06/HW07 exercises and L8 evaluation content are retained. The two new introduction MCQs and 20 supplementary clustering questions add 22 entries beyond the upstream bank.
