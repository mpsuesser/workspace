# Worked examples: what the published mechanisms actually imply

All probabilities and candidate pools below are **invented illustrations**, not predictions for any real account. Arithmetic uses the pinned defaults in [ranking-and-weights.md](ranking-and-weights.md), which remains the authoritative formula reference. Unless explicitly varied, assume no perturbation, no cold-start lift, first candidate from its author, successful hydration, and no later filter or VM change. These simplifications isolate the mechanism; they are not production guarantees.

## 1. A reply coefficient is not a whole-score multiplier

Suppose the only nonzero outputs are:

| Prediction | Value | Default coefficient | Contribution |
|---|---:|---:|---:|
| Favorite probability | 0.10 | 0.5 | 0.0500 |
| Reply probability | 0.01 | 5.0 | 0.0500 |
| Report probability | 0.0001 | −234.0 | −0.0234 |

Raw net value is `0.0766`; the nonnegative offset gives `0.0776`.

For an eligible mutual-follow original, the reply coefficient becomes `5+15=20`, adding `15×0.01=0.15` to the raw net value. The offset score is now `0.2276`, approximately **2.933 times** this example's prior value—not universally four times. If reply probability were zero, the default mutual-follow reply increment would add nothing. Quotes can satisfy the helper's original-post condition; replies and repost wrappers cannot.

For an otherwise ordinary OON candidate with the first set of outputs, the default post-offset network factor would give `0.0776×0.75=0.0582`. That is a score transformation, not a predicted 25% reduction in delivered impressions. Different viewers generally have different prediction values, so this controlled arithmetic is not an empirical follower/non-follower comparison.

Evidence: ranking manual §§2–4; `home-mixer/scorers/ranking_scorer.rs:228–261,368–483,540–559,573–685`.

## 2. A report coefficient does not cancel counted likes

In the same local formula, a change of `0.0001` in predicted report probability changes the raw term by `−0.0234`. A change of `0.0468` in predicted favorite probability changes it by `+0.0234`.

This is only a **marginal equality between two model-output changes with everything else fixed**. It says nothing about how a received report changes a prediction, how many likes change another prediction, or what separate labeling systems do. Turning these coefficient ratios into “one report cancels 468 likes” substitutes observed counts for model outputs and is incorrect.

Evidence: ranking manual §§2 and 9; `home-mixer/scorers/ranking_scorer.rs:338–473`.

## 3. Negative values take a different offset branch

At defaults, the offset uses `P=43.34`, `N=367.22`, and `T=410.56`.

- Raw net `S=0.1` → `0.101`.
- Raw net `S=0` → `0.001`.
- Raw net `S=−0.1` → `((−0.1+367.22)/410.56)×0.001`, approximately `0.0008941933`.

Thus negative values are not simply dropped, and all scores are not divided by a common weight sum. The transform is piecewise. A candidate with all heads absent also starts at `S=0` and receives `0.001` before subsequent adjustments; that is not evidence the model favorably evaluated it.

Evidence: ranking manual §2 “Offset transformation”; `home-mixer/scorers/ranking_scorer.rs:135–175,475–483`.

## 4. Author diversity creates within-request competition, not a posting timer

Three candidates arrive at the diversity step:

| Candidate | Author | Incoming score | Earlier same-author candidates | Multiplier | Adjusted score |
|---|---|---:|---:|---:|---:|
| A1 | A | 1.001 | 0 | 1 | 1.001 |
| A2 | A | 0.901 | 1 | 0.625 | 0.563125 |
| B1 | B | 0.701 | 0 | 1 | 0.701 |

After this adjustment B1 can outrank A2 despite a lower incoming score. Nothing in this calculation encodes a minimum number of minutes between A1 and A2. Their co-occurrence in a viewer's candidate pool is what matters. The same two posts need not coexist in every viewer request, and later stages still apply.

Evidence: ranking manual §3; `home-mixer/scorers/ranking_scorer.rs:485–538`.

## 5. “Under 1,000 impressions” does not promise 1,000 impressions

Consider an original candidate with present author follower count 500, present Home impressions 200, and age one hour. These satisfy only some default cold-start requirements. It must also pass the relevant author/viewer corpus policy, nonzero-pool position condition, and winner selection, and the pool must have a target score.

At default target bounds `[15,16)`, a pool of only 15 candidates has no target. With a sufficiently large pool, the target is the incoming score at **zero-based rank 15**. At most one selected eligible candidate is lifted to `max(its score, target score)`. The lift is not an inserted guaranteed slot, and downstream author/network/DPP/filtering behavior may change the result.

Boundary distinctions:

- Exactly **1,000 author followers** satisfies the default follower cap.
- Exactly **1,000 Home impressions** fails the strict impression threshold.
- A newly created account does not itself satisfy the eligibility checks.
- An old account with a qualifying recent post can satisfy them.

Evidence: ranking manual §5 and cold-start parameter ledger; `home-mixer/scorers/author_cold_start.rs:220–357,376–414`.

## 6. DPP rejection and candidate deletion are different

Suppose a DPP-enabled service sees two positive-scored candidates with identical embeddings. Its greedy determinant procedure can select only one, then exhaust independent volume. The service preserves the selected candidate's original score and returns **zero** for the other.

The Home Mixer top-K selector sorts and truncates but has no general positive-score requirement. If too few positive candidates remain, a zeroed candidate can still occupy a returned slot before later filtering. If VM DPP is disabled at service startup, the same caller may simply receive its scores back. An enabled Home Mixer call is not proof of an enabled DPP service.

Evidence: ranking manual §§7–8; `vm-ranker/dpp.rs:217–314,390–431`; `vm-ranker/scoring/dpp_model.rs:170–181`; `candidate-pipeline/selector.rs:48–74`.

## 7. Improving a predicted action can still yield no extra delivery

Even if an edit increased a viewer's predicted share probability, it would help only along the eligible path:

1. The edited post must be retrieved as a candidate.
2. Its data and referenced content must remain available.
3. It must pass request-specific filters.
4. The increased term must improve its score enough relative to competitors after adjustments.
5. It must survive selection, visibility/conversation processing, and blending.

The source provides no general conversion from “score increased by X” to “impressions increase by Y.” A helpful account review identifies which stage is plausibly limiting and chooses an observable test.

Evidence: [pipeline-and-filters.md](pipeline-and-filters.md), [retrieval-and-audiences.md](retrieval-and-audiences.md), [visibility-and-labels.md](visibility-and-labels.md), and [optimization-playbook.md](optimization-playbook.md).
