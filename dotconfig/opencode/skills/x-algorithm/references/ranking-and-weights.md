# Ranking, coefficients, cold start, and DPP

## Scope and evidence rules

Audited snapshot: **`3aa0fa336c4a20e4149b6151629b6050897bb8a5`**. Repository-relative citations below resolve under the skill's `source/` directory; for example, `home-mixer/scorers/ranking_scorer.rs` is bundled as `source/home-mixer/scorers/ranking_scorer.rs`. Line ranges refer to this snapshot, not a moving branch.

- **Code** means behavior directly implemented here; **default** means a source-declared fallback/configuration value, not proof of every production request's settings; **doc claim** means explanatory prose or a historical example; **inference** means a consequence derived from code.
- Action coefficients multiply **viewer-specific predicted probabilities**, or the explicitly continuous prediction heads. They do **not** multiply observed engagement counts. Actual counts are separate fields and enter some model inputs and the optional cold-start sampler. A coefficient ratio is not “one report cancels N likes,” a reach multiplier, or a distribution guarantee. `RankingScorer` explicitly explains this distinction; its additional statements about typical report prevalence, training-event eligibility, and coordinated reports are **comments**, not independently implemented or verified protections in this scorer (`home-mixer/scorers/ranking_scorer.rs:338–369`, `RankingScorer`; duplicated in `home-mixer/params/param.rs:321–349`).
- Read all seven `home-mixer/scorers/` files, all three `home-mixer/params/` files, all ten `vm-ranker/` files, the bidirectional-change document, and the cited supporting code/tests. Tests below are evidence of intended behavior from source inspection, **not a claim that this incomplete public snapshot was built or its tests executed**.

## 1. Execution order, score identities, and gates

### Main Phoenix candidate pipeline

The constructed scorer sequence is **`PhoenixScorer → RankingScorer → VMRanker`**, then `TopKScoreSelector`. Candidate hydration and pre-scoring filters precede it; visibility and conversation filters follow selection (`home-mixer/candidate_pipeline/phoenix_candidate_pipeline.rs:333–447`, `PhoenixCandidatePipeline`). The generic pipeline runs enabled scorers sequentially and applies each result before the next; per-candidate errors retain the previous candidate rather than replacing its fields (`candidate-pipeline/candidate_pipeline.rs:386–402`, scoring loop; `candidate-pipeline/scorer.rs:20–55`, `run`, `update_all`).

| Stage | Gate and behavior | Output/important failure behavior |
|---|---|---|
| `PhoenixScorer` | Disabled on `has_cached_posts`; otherwise disabled only by decider `disable_home_mixer_phoenix_ranker`. `EnableRanking` does not control it. | Predicts `phoenix_scores`, optional `backbone_scores`, returned slate context and request metadata. Missing scoring sequence returns successful default candidates, whose score fields overwrite existing Phoenix fields on update. RPC error returns errors for all candidates, preserving old fields through `update_all`. |
| `RankingScorer` | `EnableRanking=true` by default, with no cached-post exclusion. | Recomputes `weighted_score` and locally adjusted `score`; also writes `author_policy_zeroed`, `cold_start_lift_to_rank`, and persisted context. |
| `VMRanker` | `EnableVMRanker=true` by default, independently of `EnableRanking`. | Sends current `score`; replaces only `score` with response values. Missing response IDs retain their local `score`; RPC errors preserve local values via the generic error handling. |
| `TopKScoreSelector` | Normal selector; reads `score`, not `weighted_score`. | Missing score becomes `−∞`; sorts descending and keeps up to 50. Zero and negative scores are not excluded by this selector. |

Sources: `home-mixer/scorers/phoenix_scorer.rs:17–130` (`enable`, `score`, `update`); `home-mixer/scorers/ranking_scorer.rs:563–693`; `home-mixer/scorers/vm_ranker.rs:54–122`; `home-mixer/selectors/top_k_score_selector.rs:8–14`; `candidate-pipeline/selector.rs:48–74`; `home-mixer/params/config.rs:17–24`.

`weighted_score` is the **offset-transformed weighted model value before cold-start, author diversity, and OON adjustment**, not the raw dot product. `score` is the mutable downstream ranking value; DPP can zero it without changing `weighted_score`. `backbone_scores` are stored separately and are not inputs to `RankingScorer`. Relevant fields: `home-mixer/models/candidate.rs:12–36`, `PostCandidate`; scorer writes: `home-mixer/scorers/ranking_scorer.rs:573–583,629–693`.

### Prediction routing and input boundaries

`PhoenixScorer::resolve_cluster` starts with `PhoenixInferenceClusterId`. If `PhoenixRankerNewUserHistoryThreshold>0`, scoring-sequence metadata length (missing metadata → 0) strictly below that threshold selects `PhoenixRankerNewUserInferenceClusterId` **before** decider overrides. Otherwise, only a configured `Experiment1Fou`/`Experiment2Fou` cluster is subject to `override_qf_use_experiment2_fou` (first priority), then `override_qf_use_experiment1_fou`. “New user” here means sparse action history, not account age (`home-mixer/scorers/phoenix_scorer.rs:23–60`).

The product surface is `HomeTimelineRankedFollowing` when `in_network_only`, otherwise `HomeTimelineRanking`. Predictions are looked up by **original post ID** (`retweeted_tweet_id` when present); repost wrappers can consequently receive the original post's predictions. `last_scored_at_ms`, prediction ID and reranker tag are recorded (`home-mixer/scorers/phoenix_scorer.rs:81–117`; `home-mixer/models/candidate.rs:250–255`, `get_original_tweet_id`, `get_original_author_id`).

The prediction request includes only the first **2,800** candidates, cloned scoring and optional columnar sequences, a `u32`-cast reranker head tag, `return_logprob=true`, optional backbone return, viewer/device contexts, and parsed experiment overrides (`home-mixer/util/phoenix_request.rs:15,157–226`, `build_tweet_infos`, `build_prediction_request`). The scorer still attempts lookup for every input candidate; the missing-prediction lookup implementation is external to this snapshot. Do not invent its behavior, calibration, time units, or a complete log-probability-to-`PhoenixScores` transformation.

Observed counts, media, quote/repost/reply status, author relationships, semantic IDs, and content features are sent to prediction as features, separately from output probabilities (`home-mixer/models/candidate.rs:295–355`, `as_tweet_info`). A model feature's existence does not imply a fixed additive ranking coefficient.

### Alternate Phoenix-scores endpoint

`PhoenixScoresPipeline` uses `PhoenixScorer → PhoenixScoresRankingScorer`, a passthrough selector and result-size filter. Its lightweight ranking scorer is always enabled, calls **unperturbed** `ScoringWeights::from_params`, computes the same head terms and offset, sets both score fields equal, and omits cold-start/diversity/OON/VM processing. The pipeline's listed hydrators also omit bidirectional-follow hydration and engagement-count hydration; it is not an exact main-feed replay (`home-mixer/scorers/phoenix_scores_ranking_scorer.rs:7–38`; `home-mixer/candidate_pipeline/phoenix_scores_pipeline.rs:135–187`).

## 2. Complete local weighted-value calculation

### All 26 head coefficients

`p_*` denotes the corresponding optional prediction field; missing fields contribute zero through `apply`. The three fields named continuous are **numeric output slots whose semantics depend on model configuration**, not necessarily predictions in seconds or non-probabilistic heads. In the published flagship Phoenix configuration, click-dwell slot 2 predicts **P(raw click dwell >10 seconds)**, with sigmoid activation and no seconds rescaling. The unpublished client conversion prevents proving that this slot arrives unchanged as `PhoenixScores.click_dwell_time`; do not generalize one preset to every deployed model. See [phoenix-models.md](phoenix-models.md), §6 “Continuous slots: names do not guarantee output units,” and `phoenix/xrex/configs/xrecsys.py:684–690`, `phoenix/xrex/models/loss_recsys.py:225–247`, `phoenix/xrex/models/recsys_model.py:282–299,2302–2311`.

The table gives **source defaults**, before optional weight perturbation and candidate-specific adjustments. Every row is consumed by `compute_weighted_parts` (`home-mixer/scorers/ranking_scorer.rs:368–473`); loading is at `:54–133`.

| Prediction field | Parameter symbol | Default coefficient | Applicability / transformation | Declaration in `home-mixer/params/param.rs` |
|---|---|---:|---|---|
| `favorite_score` | `FavoriteWeight` | 0.5 | Direct. | 350 |
| `reply_score` | `ReplyWeight` | 5.0 | Add 15.0 by default for eligible mutual-follow originals; see §4. | 351–357 |
| `retweet_score` | `RetweetWeight` | 1.0 | Direct predicted repost action; not a blanket boost for being a repost. | 364 |
| `photo_expand_score` | `PhotoExpandWeight` | 0.05 | Direct; no local photo-presence gate in this sum. | 365–370 |
| `video_open_score` | `VideoOpenWeight` | 0.07 | Direct; no local video-duration gate for this head. | 371–376 |
| `click_score` | `ClickWeight` | 0.4 | Direct, also optionally conditions continuous click dwell. | 377 |
| `open_link_score` | `OpenLinkWeight` | 0.2 | Direct; no current in-network/live-broadcast restriction. | 378 |
| `profile_click_score` | `ProfileClickWeight` | 0.0 | Implemented but zero-weight default. | 379–384 |
| `vqv_score` | `VqvWeight` | 0.0 | Viewer follower-count and candidate minimum-duration gate, even if overridden nonzero. | 385 |
| `share_score` | `ShareWeight` | 2.0 | Direct; separate from DM/copy heads. | 386 |
| `share_via_dm_score` | `ShareViaDmWeight` | 5.0 | Direct. | 387–392 |
| `share_via_copy_link_score` | `ShareViaCopyLinkWeight` | 20.0 | Direct. | 393–398 |
| `dwell_score` | `DwellWeight` | 0.05 | Binary/probability dwell head; optional mutual-follow additive boost defaults 0.0. | 399; 358–363 |
| `quote_score` | `QuoteWeight` | 5.0 | Predicted quote action, not a categorical boost for quote posts. | 400 |
| `quoted_click_score` | `QuotedClickWeight` | 0.05 | Direct. | 401–406 |
| `quoted_vqv_score` | `QuotedVqvWeight` | 0.0 | Optional quoted-video-duration gate. | 407–412 |
| `follow_author_score` | `FollowAuthorWeight` | 4.0 | Predicted follow action; not “new author” status. | 413–418 |
| `post_unexplored_score` | `PostUnexploredWeight` | 0.02 | Additive only when multiplicative mode off, and only `in_network==Some(true)` by default. | 419–442 |
| `dwell_time` | `ContDwellTimeWeight` | 0.004 | Named continuous output slot; optionally multiplied by unexplored factor. | 443–448 |
| `click_dwell_time` | `ContClickDwellTimeWeight` | 0.0 | Model-dependent numeric slot, not necessarily seconds; optional product with `click_score`. | 449–460 |
| `active_secs_5m_residual_norm` | `ContActiveSecs5mResidualNormWeight` | 0.0 | Named residual-normalized output slot; direct weighted value. | 461–466 |
| `not_interested_score` | `NotInterestedWeight` | −43.2 | Direct. | 468–473 |
| `block_author_score` | `BlockAuthorWeight` | −31.2 | Direct. | 474–479 |
| `mute_author_score` | `MuteAuthorWeight` | −58.8 | Direct. | 480–485 |
| `report_score` | `ReportWeight` | −234.0 | Direct. | 486 |
| `not_dwelled_score` | `NotDwelledWeight` | −0.02 | Direct. | 487–492 |

These action parameter keys are `rust_home_mixer_` plus the snake-case symbol, e.g. `rust_home_mixer_cont_active_secs_5m_residual_norm_weight`. The exact declarations above are authoritative. `post_unexplored` also has logging alias `pdwell`; that is **not an additional head or contribution** (`home-mixer/scorers/ranking_scorer.rs:263–331`, `applied_weights_map`).

### Precise formula and gates

For each effective weighted term `t_h`, compute:

```text
apply(x, w) = (x if present else 0)*w
pos = sum(t_h where t_h >= 0)
neg = sum(-t_h where t_h < 0)
S = pos - neg
```

For finite inputs, missing fields contribute zero and the sign-partition equations above hold. The implementation branches on the **sign of each realized term**, not a fixed partition into positive/negative head names. It contains no probability clipping or finite-value validation: the actual negative branch is `else`, so a NaN term enters it and contaminates `neg`; even a missing field can produce NaN with a nonfinite weight (`0*∞`). Source: `home-mixer/scorers/ranking_scorer.rs:368–473` (`apply`, `compute_weighted_parts`).

Special terms, with `U=post_unexplored_score`, `D=dwell_time`, `CD=click_dwell_time`, `C=click_score`:

```text
A = !PostUnexploredWeightInNetworkOnly || in_network == Some(true)

dwell_time_term = w_D * D_or_zero
if EnableMultiplicativePostUnexplored && A && U is present:
    dwell_time_term *= (1 + U * MultiplicativePostUnexploredAlpha)

unexplored_term = 0                                if multiplicative mode OR !A
                 w_U * U_or_zero                   otherwise

click_dwell_input = CD                             if !EnableCdwellOnImpr
                    CD*C                          if enabled and both present
                    CD                            if enabled and C missing
                    missing                       if CD missing
click_dwell_term = w_CD * click_dwell_input_or_zero
```

Multiplicative unexplored mode affects **only the continuous `dwell_time` term**, not the entire score, `dwell_score`, or `click_dwell_time`. Missing U means an unchanged continuous term; zero alpha means no modulation but still removes the additive U term. The additive `PostUnexploredWeight` becomes ineffective in this mode. Negative/out-of-range U or alpha are not clamped. Unknown network status fails the default in-network-only test. Sources: `home-mixer/scorers/ranking_scorer.rs:224–261,402–460`; tests `:878–1045` (`post_unexplored_additive_when_multiplicative_disabled`, `multiplicative_post_unexplored_modulates_only_the_dwell_time_term`, two network-only cases).

**Media gates:** VQV uses its configured weight only when the **viewer** has fewer than 10,000 followers (unknown follower count also passes) and the candidate's **minimum** video duration is present and **strictly greater** than `MinVideoDurationMs=10,000`. At exactly 10 seconds it is zero. This is not an author-popularity gate. Quoted VQV uses its configured weight unconditionally when `EnableQuotedVqvDurationCheck=false`; when true, quoted duration must likewise be present and strictly greater than the threshold, without the viewer-follower restriction (`home-mixer/util/candidates_util.rs:4,19–60`, `vqv_weight`, `quoted_vqv_weight`; boundary tests `:66–109`). Both VQV weights default zero, so enabling a duration gate alone changes no VQV contribution.

`MediaInfoHydrator` obtains media by original-post ID, stores minimum and maximum durations separately, and is skipped for cached posts. Missing media info becomes explicit no-media fields and absent durations; an individual upstream error remains an error. Minimum duration really is `min(video_durations_ms)`; there is no average/max substitution for VQV (`home-mixer/candidate_hydrators/media_info_hydrator.rs:72–148`). Other media/head terms above are not locally conditional on `has_media`, `has_photo`, `has_video`, or topic status.

### Offset transformation (not a conventional normalization)

Let:

```text
P = w_favorite + w_reply + w_retweet + w_photo_expand + w_video_open
  + w_click + w_open_link + w_profile_click + w_vqv + w_share
  + w_share_via_dm + w_share_via_copy_link + w_dwell + w_quote
  + w_quoted_click + w_quoted_vqv + w_follow_author
  + (0 if multiplicative_unexplored else w_post_unexplored)
N = -(w_not_interested + w_block_author + w_mute_author + w_report + w_not_dwelled)
T = P + N
epsilon_offset = 0.001

O(S) = max(S, 0)                   if T == 0
       ((S + N)/T)*0.001           if T != 0 and S < 0
       S + 0.001                  otherwise
weighted_score = O(S)
```

`P` excludes **all three continuous coefficients and both bidirectional boost increments**. It includes nominal VQV and additive unexplored coefficients even when those terms are gated off for this candidate. It is recomputed from perturbed base weights when perturbation is enabled; it is not recomputed per candidate (`home-mixer/scorers/ranking_scorer.rs:135–175,475–483`, `recompute_sums`, `offset_score`; `home-mixer/params/config.rs:39`, `NEGATIVE_SCORES_OFFSET`).

**Derived at defaults:** `P=43.34`, `N=367.22`, `T=410.56`. A candidate with all prediction fields absent has `S=0`, hence `weighted_score=0.001` before other transforms. The negative branch and nonnegative branch need not be continuous at zero. There is no general `[0,1]` bound or guarantee of positivity: unusual overrides, negative continuous values, or nonfinite predictions can violate intuitive assumptions. `T==0` bypasses the offset entirely. Do not describe this as dividing every score by the sum of weights.

### Per-viewer weight perturbation

If `WeightPerturbationSigma<=0`, no perturbation. Otherwise, for each of the 26 table heads:

```text
digest = MD5("{WeightPerturbationSalt}:{user_id}:{head_name}")
sign = +1 if digest[0] & 1 == 1 else -1
w'_h = w_h * exp(sigma * sign)
```

This is deterministic two-point multiplicative perturbation for a viewer/salt/head, **not Gaussian sampling per request**. For finite, nonzero perturbation multipliers, coefficient signs are preserved and zero weights remain zero. Extreme/nonfinite sigma values can cause overflow, underflow, or NaN. Hash labels for continuous heads are `dwell_time`, `click_dwell_time`, `active_secs_5m_residual_norm`; other labels are the table's action name without `_score`. Neither bidirectional increment, multiplicative alpha, media thresholds nor downstream multiplier params are perturbed. Sums are recomputed afterward (`home-mixer/scorers/ranking_scorer.rs:166–221`, `perturbed`, `weights_mut`, `perturbation_sign`).

Sharp logging discrepancy: `RerankingKafkaSideEffect` reports `ScoringWeights::from_params(...).applied_weights_map()` **without `.perturbed(query)`**, while `RankingScorer` uses perturbed weights. Therefore the logged applied map does not reproduce actual base coefficients when sigma is positive. The map separately lists boosts/gates, not each candidate's effective coefficient (`home-mixer/side_effects/reranking_kafka_side_effect.rs:76–88`; `home-mixer/scorers/ranking_scorer.rs:263–331,573`).

## 3. Transform ordering, author diversity, and network adjustment

### Default and alternate paths

`MultiplierPreOffset=false` (default):

```text
perturb base coefficients -> head terms -> S -> W=O(S)
-> AuthorColdStart(W), including MOE policy zeroing
-> rank this adjusted pool by score, assign per-author repetition k
-> multiply by diversity(k)
-> multiply by effective OON factor when applicable
-> VMRanker (if enabled) -> final-score top-K
```

`MultiplierPreOffset=true`:

```text
perturb base coefficients -> head terms -> S and diagnostic W=O(S)
-> rank pool by W to assign per-author k
-> m = diversity(k) * (effective OON factor if applicable else 1)
-> S' = m*S if S >= 0, else S unchanged
-> O(S') -> AuthorColdStart, including MOE policy zeroing
-> VMRanker (if enabled) -> final-score top-K
```

Disabling author diversity makes its multiplier 1. The alternate path leaves negative raw net values untouched by author/OON multipliers; it does not multiply `pos` alone or move negative penalties independently. The main `weighted_score` remains `W`, not `O(S')`. In the default path cold-start can change the ordering used to assign author repetition; in the alternate path it cannot. Sources: `home-mixer/scorers/ranking_scorer.rs:573–685`, `RankingScorer::score`.

### Author repetition decay

`author_pool_counts` sorts **the current candidate pool** descending by its relevant pre-diversity scores and counts earlier candidates with exactly the same `candidate.author_id`. First candidate gets `k=0`, next `k=1`, etc. The multiplier is:

```text
diversity(k) = (1 - AuthorDiversityFloor) * AuthorDiversityDecay^k
             + AuthorDiversityFloor
default     = 0.75 * 0.5^k + 0.25
k=0,1,2,3   -> 1, 0.625, 0.4375, 0.34375
```

It is a one-pass score multiplier, not a hard per-author quota, iterative slate selection, or historical fatigue multiplier. It keys on wrapper author rather than `get_original_author_id`, relevant for reposts. Code does not clamp decay/floor to sensible ranges. Equal finite scores retain input order in this stable sort; incomparable scores compare equal (`home-mixer/scorers/ranking_scorer.rs:485–538`, `diversity_multiplier`, `author_pool_counts`, `apply_author_diversity`; test `:749–775`).

Although `SlateContext` has `k`, `fatigue`, ranks/gaps and semantic-neighbor fields, they do not drive these diversity calculations. Context persistence is **all-or-none**: use `served_slate_context` only if every candidate has one; otherwise, only on cached requests, use stored `slate_context` if every candidate has one. Otherwise set returned context to `None`. Scores always recompute pool counts. Tests explicitly show a stored `k=5` does not cause additional decay (`home-mixer/scorers/ranking_scorer.rs:508–514,598–604,777–835`; `home-mixer/models/candidate.rs:127–175`, `SlateContext`).

### Out-of-network factor, replies, reposts, and viewer age

Apply the selected network factor when:

- `in_network==Some(false)`; or
- `in_network==Some(true)` **and** `EnableOonRescoreForInNetworkRepliesRetweets=true` **and** either reply ID or repost ID is present.
- `in_network==None` is not multiplied. With the flag false, in-network replies/reposts retain the ordinary in-network treatment.

Select the factor in this order:

1. Nonempty `query.topic_ids` → `TopicOonWeightFactor=0.5`.
2. Otherwise, account age returned by `duration_since_creation_opt(user_id)` is **strictly below** `NewUserAgeThresholdSecs` and following-list length is **at least 5** → `NewUserOonWeightFactor=0.00001`.
3. Otherwise → `OonWeightFactor=0.75`.

The age threshold defaults **0**, so the new-viewer factor is normally inactive. Unknown age is ineligible. Topic factor wins over account-age handling; excluded topics alone do not make a topic request. This concerns the **viewer account**, not author account age, and differs from sparse-history prediction routing. Source: `home-mixer/scorers/ranking_scorer.rs:540–559,585–596,657–668`; `home-mixer/models/query.rs:238–248`; `home-mixer/params/config.rs:38`. Tests: `home-mixer/scorers/ranking_scorer.rs:838–849,1114–1240` cover OON, flag on/off, age threshold zero, and following count below five.

In-network hydration checks the wrapper `author_id` against viewer ID/following list and skips cached posts (`home-mixer/candidate_hydrators/in_network_candidate_hydrator.rs:10–44`). The main pipeline **filters out OON replies/reposts before scoring**, and also drops replies missing ancestors. Thus generic scorer handling of an OON reply is not proof that such a post normally reaches it (`home-mixer/filters/oon_retweet_reply_filter.rs:7–21`; `home-mixer/candidate_pipeline/phoenix_candidate_pipeline.rs:359–388`). Quotes are not excluded by these reply/repost checks merely for having `quoted_tweet_id`.

## 4. Mutual-follow/bidirectional boost and documented history

Eligibility is exactly:

```text
in_reply_to_tweet_id is None
AND retweeted_tweet_id is None
AND is_mutual_follow_author == Some(true)
```

For eligible candidates, `reply_weight=ReplyWeight+BidirectionalFollowReplyWeightBoost` and `dwell_weight=DwellWeight+BidirectionalFollowDwellWeightBoost` when the respective increment is nonzero. At defaults that is **20.0 instead of 5.0 on predicted reply probability**, and unchanged **0.05** on the probability dwell head. It is not `score*4`, not an additive 15-point score boost, and not a change to continuous dwell weight. Without perturbation its raw-net incremental term is `15*p_reply`; the subsequent offset/diversity/network/DPP stages still apply (`home-mixer/scorers/ranking_scorer.rs:228–261,421–448`).

The eligibility helper does not separately require `in_network==Some(true)`: it trusts the mutual-follow field. “Original” here excludes replies and repost wrappers but **does not exclude quotes**. `None`/false mutual status gives no boost. Hydration checks reverse following via SocialGraph and intersects with the viewer's following list; the default `EnableAllAuthorFollowHydration=true` checks all candidate authors and also populates `author_follows_viewer`. Turning that auxiliary flag off narrows checks to followed authors but still computes mutual status. Hydration is skipped for cached posts and returns errors for every candidate on SocialGraph failure (`home-mixer/candidate_hydrators/bidirectional_follow_hydrator.rs:15–72`). This is independent of the Jaccard feature; `MutualFollowJaccardHydrator` is post-selection in the main pipeline (`home-mixer/candidate_pipeline/phoenix_candidate_pipeline.rs:423–435`).

Tests cover mutual originals, exclusion of replies/reposts/non-mutuals, explicit zero-increment no-op, relationship intersection, empty following, feature gate, and cached skip (`home-mixer/scorers/ranking_scorer.rs:1047–1112`; `home-mixer/candidate_hydrators/bidirectional_follow_hydrator.rs:168–214`).

**Historical doc claims, not observed rollout configuration:**

| Date | What the document says | Evidence |
|---|---|---|
| July 10, 2026 | Small A/B groups tested reply increments 5, 10, 15, 20; most users had 0. Dwell boost was tested but not broadly shipped. | `docs/BIDIRECTIONAL_BOOST_CHANGE.md:5–7` |
| July 13, 2026 | Increment 20 broadly launched for many users, while 0/5/10/15 experiments continued. Historical diff adds hydration, model field and reply/dwell increments. | `docs/BIDIRECTIONAL_BOOST_CHANGE.md:9,14–475` |
| July 24, 2026 | Increment changed 20 → 15 following experimentation and feedback about missing discussion from unfollowed accounts. | `docs/BIDIRECTIONAL_BOOST_CHANGE.md:11,478–495` |
| Audited snapshot | Code default increment is 15; dwell increment 0; hydration true. | `home-mixer/params/param.rs:352–363,762–773` |

The historical diff contains obsolete adjacent `OpenLinkWeightInNetworkOnly` / `OpenLinkWeightLiveBroadcastOnly` fields (`docs/BIDIRECTIONAL_BOOST_CHANGE.md:334–357`) and tests named/asserting “disabled/default boost is noop” despite its displayed launch defaults (`:219–224,458–471`). These are **not current behavior**. The current scorer has no open-link gating and its zero-boost test explicitly overrides both increments to zero. This bundle supplies one pinned source snapshot; the document's dates are not independently verified Git commits. Do not infer other coefficient rollout histories from them.

## 5. Author cold start (“new-author boost”)

The README calls this a “new-author boost” (`README.md:125–130`). The implemented mechanism does **not** test author account age, new-to-viewer status, or absence from engagement history. It is a **low-impression, small-follower, recent-original candidate score lift**, with separate experiment-corpus policy. The README's compact list is not the authoritative transform order; use §3.

### Gates, viewer arms, and author corpus

`ColdStartParams::read` reads all cold-start controls and `viewer_arm`. Treatment wins if both viewer arm flags are true; otherwise control if its flag true; otherwise holdout. Author corpus similarly prioritizes treatment over control, using `AuthorRulesEvaluator` on **author ID**, with per-call deduplication of authors. Holdout does not evaluate author corpus. The evaluator creates an author recipient and separately suppresses duplicate experiment-impression logs via a 10-minute/500,000-entry/64-shard cache; it does not cache a permanent corpus assignment (`home-mixer/scorers/author_cold_start.rs:44–90,178–197,376–389`; `home-mixer/util/author_rules.rs:10–53`).

If `EnableViewerColdStart=false`, return incoming scores unchanged, all policy-zero flags false, no lift. Corpus/parameter reads and tracked-ID logging occur **before** this return. Thus this switch also disables the MOE zeroing policy, not only the lift (`home-mixer/scorers/author_cold_start.rs:376–414`).

When enabled:

| Viewer arm | Which MOE candidates keep their score? | Which candidates may receive the lift? |
|---|---|---|
| Holdout (default arm) | None; all MOE candidates zeroed. | Non-MOE regardless of author corpus. |
| Control | None; all MOE candidates zeroed. | Non-MOE authors in control corpus. |
| Treatment | Only authors in treatment corpus. | Treatment-corpus authors from either MOE or non-MOE. |

“MOE” means exactly `served_type==ForYouPhoenixRetrievalMoe`, not a generic neural architecture label or any historical retrieval-source membership. Non-MOE candidates not eligible for lifting retain their ordinary scores. Zeroing sets both `score=0` and `author_policy_zeroed=true`; it is not itself candidate deletion (`home-mixer/scorers/author_cold_start.rs:167–218,232–237`).

### Target, eligibility, and winner

1. Sort the **incoming, pre-policy-zeroing scores** descending with `total_cmp`. Set `hi=min(ColdStartSlotMax, len)`, `lo=min(ColdStartSlotMin, hi)`. If `lo>=hi`, no lift target. Otherwise draw integer `r` uniformly from `[lo, hi)` and set `target=sorted_scores[r]`. Defaults `[15,16)` choose **zero-based rank 15**, i.e. the 16th score, with no target-rank randomness at defaults. A pool of 15 or fewer yields no target. Importantly, a subsequently policy-zeroed MOE score can still determine the target (`home-mixer/scorers/author_cold_start.rs:220–230,399–408`; regression example `:641–651`).
2. Rank the **post-policy** scores among values `!=0.0`; tie-break by lower original index. Exact zero is omitted, not all nonpositive values. Let `n` be that nonzero count and `cutoff=(LowImpressionsMaxPositionRatio*n) as usize`. Candidate position must be **strictly below** this cutoff (`:92–105,295–310`).
3. Require all of: no reply ID; no repost ID; present author follower count **≤** cap; arm/corpus eligibility; present ID-derived post age **≤** max age; the position condition; and present `view_count_on_home` **<** impression threshold. There is no network-status test. Quotes can pass; missing follower count, missing age, or missing Home impressions fails eligibility. Negative stored `i32` follower counts are not clamped in this eligibility test (`:171–176,300–313`).
4. Default winner is highest current score among eligible candidates; score ties choose the **larger** original index, unlike the position tie-break. Optional Thompson mode selects as below (`:240–287,315–328`).
5. For at most **one** winner, `new_score=max(current_score,target)`. Record a lift decision and target rank even if the winner was already above the target and its score does not change; the cold-start counter likewise increments for a selected winner. This is not slot insertion or a guarantee of final rank. Default-path author/OON discounts and later DPP can weaken or eliminate its final selection (`:330–357,399–414`; local ordering in `home-mixer/scorers/ranking_scorer.rs:646–680`).

The nonzero-position cast is not a clamp to `[0,1]`; nonsensical runtime ratio/other numeric overrides are not validated in this helper. Policy-zeroed candidates have no nonzero position and cannot normally be lifted. Even with cold-start disabled, other scorer stages can still change scores.

### Optional Thompson sampler: counts really do enter here

For each eligible candidate:

```text
n = ColdStartImpressionScale * (view_count_on_home or 0)
x = min(max(fav_count or 0, 0), n)
alpha = ColdStartBetaAlpha0 + x
beta  = ColdStartBetaBeta0 + max(n-x, 0)
reward ~ Beta(alpha, beta)
```

Sort rewards descending (index ascending on reward ties), retain the top `min(ColdStartTsTopK, eligible_count)`, then choose the **highest ordinary ranking score among that shortlist** (larger index on score ties). It does not directly use reward as the final score and does not necessarily select the maximum Beta draw when top-K exceeds one. Empty eligibility returns none; `top_k==0` or either prior parameter `<=0` falls back to ordinary score argmax; a failed Beta distribution construction yields a fixed sample `0.5`. Scale is not validated here. Missing favorites becomes zero, negatives are clamped, and favorites above scaled impressions are capped (`home-mixer/scorers/author_cold_start.rs:247–287`, `sample_reward`, `pick_thompson`).

Defaults: sampler off; `alpha0=0.75`, `beta0=49.25` (derived prior mean `0.015`); scale 1; shortlist K=2. These observed favorites/Home-impression counts must not be confused with `favorite_score`, `dwell_score`, or other Phoenix predictions. Tests include zero-K fallback and a seeded example where an uncertain zero-impression candidate beats a high-impression/zero-favorite candidate (`:744–753,916–935`).

### Count freshness and diagnostic fields

`EngagementCountsHydrator` populates actual counts and `view_count_on_home` from the engagement-counter result, keyed by original post ID. It defaults enabled and also runs for shadow traffic regardless of its flag. Its cache is one million entries/60-second TTL. On a cached-post request, client fetches are restricted to `cold_start_base_eligible` candidates; others preserve counts. Client error returns an empty map and fetch-eligible missing entries become absent counts, not zero impressions. Cache hits can prevent a fresh network fetch (`home-mixer/candidate_hydrators/engagement_counts_hydrator.rs:17–65,73–168,308–329`).

`ColdStartTrackedIds` is diagnostic only: split comma-separated tweet/author IDs, trim, ignore parse failures, deduplicate, and count matching candidates by `(tweet_id, served_type)` before enable gating. It is not an allowlist, forced boost, or corpus override (`home-mixer/scorers/author_cold_start.rs:124–165,382–396`).

The separate post-candidate Redis cache selects candidates with **positive `weighted_score`**, sorts by that value rather than final `score`, takes at most `MaxPostsToCache=750`, and stores them for **180 seconds**; writes require production and a noncached request. **Inference:** a positive-weighted candidate zeroed by author policy or DPP can still enter this cache, and a later request can recompute local adjustments/DPP using stored Phoenix predictions. Cached-post status therefore does not mean “retain the previous final ranking”; meanwhile relationship/media hydration skips can retain older candidate features (`home-mixer/side_effects/redis_post_candidate_cache_side_effect.rs:10–11,22–46,53–90`; `home-mixer/scorers/phoenix_scorer.rs:65–74`; `home-mixer/scorers/ranking_scorer.rs:563–583`; `home-mixer/scorers/vm_ranker.rs:54–57`).

## 6. Parameter/default ledger

All rows below are **declarations**, not production experiment assignments. `home-mixer/params/param.rs:1` says defaults were mirrored from config, last sync `2026-09-21T16:23:47Z`. Runtime feature switches match a recipient and then apply request overrides (`home-mixer/server.rs:178–196`, `evaluate_feature_switches`). Config is external: `FS_PATH=/usr/local/config/features/home-mixer/main/rust_home_mixer.yml`; decider overlay path depends on `DATACENTER` (`home-mixer/params/config.rs:1–11`; initialization `home-mixer/main.rs:140`). Author rules are evaluated separately (§5). Full live rule percentages/assignments are not published here.

### Ranking and conditional term controls

All line ranges in this table are in `home-mixer/params/param.rs`; consumption is in §§1–5.

| Symbol | Default | Applicability / alternative | Lines |
|---|---|---|---|
| `EnableRanking` | true | Main local scorer gate. | 257 |
| `EnableAuthorDiversity` | true | Repetition multiplier; false makes it 1. | 258–263 |
| `AuthorDiversityDecay` | 0.5 | Exponential base. | 264–269 |
| `AuthorDiversityFloor` | 0.25 | Asymptotic floor only for suitable decay. | 270–275 |
| `MultiplierPreOffset` | false | Selects alternate ordering in §3. | 289–294 |
| `OonWeightFactor` | 0.75 | Ordinary applicable network factor. | 283–288 |
| `EnableOonRescoreForInNetworkRepliesRetweets` | true | Applies OON factor to in-network reply/repost candidates. | 296–301 |
| `TopicOonWeightFactor` | 0.5 | Nonempty requested topics, precedence over age. | 302–307 |
| `NewUserAgeThresholdSecs` | 0 | Disables age-based factor at default. | 308–313 |
| `NewUserOonWeightFactor` | 0.00001 | Only age-eligible viewers with ≥5 following. | 314–319 |
| `BidirectionalFollowReplyWeightBoost` | 15.0 | Additive coefficient on eligible originals. | 352–357 |
| `BidirectionalFollowDwellWeightBoost` | 0.0 | Implemented alternative on probability dwell head. | 358–363 |
| `EnableMultiplicativePostUnexplored` | false | Replace additive unexplored with continuous-dwell modulation. | 425–430 |
| `MultiplicativePostUnexploredAlpha` | 0.0 | Only active in that mode; not `PostUnexploredWeight`. | 431–436 |
| `PostUnexploredWeightInNetworkOnly` | true | Applies to additive and multiplicative variants. | 437–442 |
| `EnableCdwellOnImpr` | false | Optional `click_dwell_time*click_score` with missing-click fallback. | 455–460 |
| `WeightPerturbationSigma` | 0.0 | Inactive unless positive. | 494–499 |
| `WeightPerturbationSalt` | empty string | Per-viewer/head deterministic hash salt. | 500–505 |
| `MinVideoDurationMs` | 10,000 | Strict duration boundary for VQV; not general video eligibility. | 668–672 |
| `EnableQuotedVqvDurationCheck` | false | Optional quoted-VQV gate. | 674–679 |
| `EnableBidirectionalFollowHydration` | true | Relationship input; additionally skipped for cached requests. | 762–767 |
| `EnableAllAuthorFollowHydration` | true | Broader reverse-follow hydration, not broader mutual eligibility. | 768–773 |
| `EnableMutualFollowJaccardHydration` | false | Distinct post-selection feature; not a local boost control. | 755–760 |
| `LogSlateContext` | false | Request-cache logging control, not author-diversity enable. | 276–281 |
| `RerankerHeadTag` | 0 | Forwarded to sequence and metadata as `u32`, not a local coefficient. | 282 |

Other hardcoded ranking constants: `NEGATIVE_SCORES_OFFSET=0.001`, `NEW_USER_MIN_FOLLOWING=5`, `TOP_K_CANDIDATES_TO_SELECT=50`, `RESULT_SIZE=35`, `FEED_MODULE_SLOTS=4`, `MAX_JETFUEL_FRAMES_PER_RESPONSE=8`, derived `FOR_YOU_MAX_RESULT_SIZE=47`, `RANKED_FOLLOWING_MAX_RESULT_SIZE=38`, `MAX_POST_AGE=172800` seconds (`home-mixer/params/config.rs:17–24,36–39`). These are different quantities: a 50-candidate selector is not a promise of 50 visible organic posts. VQV's `MAX_FOLLOWERS_THRESHOLD=10_000` is separate (`home-mixer/util/candidates_util.rs:4`).

`LogSlateContext` is consumed by `PhoenixRequestCacheSideEffect` when assembling score context (`home-mixer/side_effects/phoenix_request_cache_side_effect.rs:93`); it does not make persisted slate context influence the local score.

### Cold-start and author/viewer experiment controls

Line ranges below are also `home-mixer/params/param.rs`; all eligibility remains conjunctive as in §5.

| Symbol | Default | Applicability / caveat | Lines |
|---|---|---|---|
| `EnableViewerColdStart` | true | Actual key `rust_home_mixer_enable_viewer_cold_start_boost`; gates both policy and lift. | 612–617 |
| `ColdStartImpressionThreshold` | 1,000 | Strictly fewer **Home** impressions, not a promised 1,000 impressions. | 574–579 |
| `ColdStartSlotMin` | 15 | Inclusive zero-based target rank. | 580–585 |
| `ColdStartSlotMax` | 16 | Exclusive target rank; pool-clamped. | 586–591 |
| `ColdStartFollowerCap` | 1,000 | Author follower count ≤ cap, field must exist. | 592–597 |
| `ColdStartMaxPostAgeSecs` | 172,800 | Inclusive post-age bound. | 598–603 |
| `LowImpressionsMaxPositionRatio` | 0.85 | Key ends `low_impressions_max_boost_position_ratio`; position < integer cutoff in nonzero pool. | 605–610 |
| `EnableColdStartThompsonSampling` | false | Optional shortlist procedure, not default lottery. | 618–623 |
| `ColdStartBetaAlpha0` | 0.75 | Beta prior; nonpositive invokes score fallback. | 624–629 |
| `ColdStartBetaBeta0` | 49.25 | Same. | 630–635 |
| `ColdStartTsTopK` | 2 | Shortlist size; zero invokes score fallback. | 636–641 |
| `ColdStartImpressionScale` | 1.0 | Scales n in posterior, not threshold eligibility. | 642–647 |
| `ColdStartTrackedIds` | empty string | Logging only. | 648–653 |
| `PhoenixMoeCodivertViewerIsControl` | false | Control viewer arm if treatment false. | 170–175 |
| `PhoenixMoeCodivertViewerIsTreatment` | false | Treatment wins; both false → holdout. | 176–181 |
| `AuthorIsControl` | false | Author-rule corpus membership. | 206–211 |
| `AuthorIsTreatment` | false | Treatment author corpus, priority over control. | 212–217 |
| `EnableEngagementCountsHydration` | true | Counts input; shadow-traffic override in hydrator. | 810–815 |
| `UseEngagementCounterViewCountForImpressionBoost` | true | **Declared but no consumer found in published Home Mixer**. Current cold-start unconditionally uses `view_count_on_home`. | 828–833 |
| `EnableCachedPosts` | true | Enables the cached-candidate path; not a cold-start disable. | 655–660 |
| `MaxPostsToCache` | 750 | Cache candidate limit, not number selected/boosted. | 661–666 |

Related retrieval declarations, **not extra ranking bonuses**: `EnablePhoenixMOESource=false`, `PhoenixMOEMaxResults=200`, `PhoenixMoeColdStartMaxResults=0`, `AuthorPhoenixMoeEnabled=false`, `PhoenixColdStartMaxResults=0`, `PhoenixRetrievalMOEInferenceClusterId="Experiment3Memy04"` (`home-mixer/params/param.rs:16–21,164–205`). Candidate presence from MOE requires retrieval to supply it; enabling viewer cold-start alone does not turn that source on.

### Prediction/history and service-input controls

| Symbol | Default | Meaning relevant to scoring | `home-mixer/params/param.rs` lines |
|---|---|---|---|
| `PhoenixInferenceClusterId` | `Experiment1Fou` | Configured prediction cluster, subject to routing rules §1. | 61–66 |
| `PhoenixRankerNewUserInferenceClusterId` | `Experiment1Fou` | Alternate sparse-history cluster. | 244–249 |
| `PhoenixRankerNewUserHistoryThreshold` | 0 | Alternate routing inactive by default; strict count comparison. | 250–255 |
| `PhoenixExperimentOverrides` | empty string | `;`-separated `key=value` entries; trim, skip malformed/empty keys, send to predictor. | 544–549 |
| `EnableScoringSequenceHydration` | true | Hydrates model action history. | 748–753 |
| `MaxSeqLengthScoring` | 1,024 | Requested scoring history length. | 892–897 |
| `PhoenixAggregationType` | `DENSE_WITH_LONG_DWELL` | Scoring sequence aggregation enum. | 151–156 |
| `UserActionsClusterId` | `Fou` | Sequence service cluster. | 145–150 |
| `UasSourceDataType` | `NEW_UUA_ARROW` | Source format enum. | 886–891 |
| `UseXdsForUas` | true | Sequence-service transport. | 885 |
| `EnableContextFeatures` | true | Demographics/followed-topic/starter-pack context hydration; model inputs, not fixed bonuses. | 681–686 |
| `EnableIpFeature` | true | Actual key ends `enable_geo_features`; geo model inputs. | 688–693 |
| `EnableExplicitEngagementSignals` | true | Additional query feature hydration. | 695–700 |
| `EnableImplicitEngagementSignals` | true | Additional query feature hydration. | 701–706 |
| `EngagementSignalsMaxPerType` | 15 | Per-type input cap, not action coefficient. | 707–712 |
| `EnableUserInstalledAppsHydration` / `EnableUserInstalledAppsV2` | true / false | Installed-app context variant. | 720–732 |
| `EnableInferredGenderHydration` | true | Model context. | 734–739 |
| `EnableSemanticIdHydration` | true | Candidate feature hydration, not this local diversity formula. | 816–821 |
| `PhoenixScoresResultSize` | 2,800 | Alternate Phoenix-scores endpoint output control. | 1096–1101 |
| `EnablePhoenixScoreStatsExperimentBucket` | false | Score-stat experiment logging, not scorer enable. | 103–108 |
| `EnableResponseDiversityStatsExperimentBucket` | false | Diversity-stat logging, not author/DPP enable. | 121–126 |
| `EnablePhoenixRequestCacheSideEffect` / `PhoenixRequestCacheSideEffectTtlSeconds` | true / 10,800 | Prediction request logging/cache, distinct from post-candidate cache. | 971–982 |

`ScoringSequenceQueryHydrator` requests a **300,000-ms UAS window**, ranking model type and Arrow response format; invalid aggregation strings fall back to `DenseWithFavVqvCleaned`, invalid source strings to `Arrow`. This is the request parameter sent to an external aggregation service, not enough evidence to claim “the model only remembers five minutes” (`home-mixer/query_hydrators/scoring_sequence_query_hydrator.rs:31–73`; `home-mixer/params/config.rs:34`). Ranking history and retrieval history are distinct: retrieval defaults `EnableRetrievalSequenceHydration=true`, `MaxSeqLengthRetrieval=1024`, `PhoenixRetrievalAggregationType="DENSE_WITH_LONG_DWELL"`, alternate new-user retrieval cluster `Experiment1Lap7`, and threshold 0 (`home-mixer/params/param.rs:157–162,219–230,741–746,898–903`). They do not modify local action weights.

Adjacent new-viewer **filter**, not a score multiplier: `EnableNewUserMinEngagementFilter=false`, metric `"fav"`, `NewUserMinEngagementFilterUseRatio=false`, `NewUserMinEngagementThreshold=0.0`, max account age 1,800 seconds, max resurrection age 1,800 seconds (`home-mixer/params/param.rs:774–809`). It is positioned before scoring (`home-mixer/candidate_pipeline/phoenix_candidate_pipeline.rs:383–387`). Its settings must not be confused with the age-based OON factor or author cold-start eligibility.

### VM request controls versus service startup defaults

| Layer / symbol | Default | Exact applicability | Source |
|---|---|---|---|
| Home Mixer `EnableVMRanker` | true | Calls service even if service DPP is disabled. | `home-mixer/params/param.rs:526–531` |
| `VMRankerEnableFallback` | false | xDS RPC failure → DNS retry only when true; local-score retention is a separate behavior. | `:532–537`; `home-mixer/scorers/vm_ranker.rs:21–50` |
| `VMRankerClusterId` | `Experiment3` | Parse fallback is `Experiment1`; six variants `Experiment1`…`Experiment6` exist. | `home-mixer/params/param.rs:538–543`; `home-mixer/clients/vm_ranker_client.rs:32–74` |
| `VMRankerDppTheta` | 0.65 | Nonzero request override of service theta. | `home-mixer/params/param.rs:550–555` |
| `VMRankerDppMaxSelectedRank` | 150 | Nonzero request override of service pool limit. | `:556–561` |
| `VMRankerSendValueModelInputs` | false | Sends optional extra candidate/viewer fields. | `:562–567` |
| `VMRankerComputeValueModel` | false | Request flag set only when send-inputs AND compute flags true; ignored by published server. | `:568–573`; `home-mixer/scorers/vm_ranker.rs:64–81` |
| Service `dpp_enabled` | false | Actual startup gate constructing DPP context. | `vm-ranker/args.rs:15–16`; `vm-ranker/main.rs:23–44` |
| Service `dpp_top_k` | 50 | Max selected candidates (seed does not consume budget); no Home Mixer request override here. | `vm-ranker/args.rs:18–19` |
| Service `dpp_theta` | 0.5 | Used absent nonzero request override. | `vm-ranker/args.rs:21–22` |
| Service `dpp_max_selected_rank` | 100 | Used absent nonzero request override. | `vm-ranker/args.rs:24–25` |
| Service `embedding_dim` | 1,024 | Embedding store/fallback dimension. | `vm-ranker/args.rs:27–28` |
| Service `dpp_debug_viewer_id` | 0 | Debug dump disabled at zero; no ranking personalization. | `vm-ranker/args.rs:30–31`; `vm-ranker/scoring/dpp_model.rs:116–168` |
| Service `max_concurrent_requests` | 256 | Immediate resource-exhausted when no semaphore permit. | `vm-ranker/args.rs:12–13`; `vm-ranker/ranker_service.rs:62–73` |
| Service `grpc_port` / `http_port` | 9090 / 8080 | Transport/metrics ports. | `vm-ranker/args.rs:6–10` |
| Service `enable_profiling` | false | Optional profiling server on port 3000. | `vm-ranker/args.rs:33–34`; `vm-ranker/main.rs:19–21` |

Rows abbreviated `:line` in a source cell continue the explicit path immediately above. Head coefficient defaults are fully enumerated in §2; broader source/retrieval/ads/UI/filter parameters in `params/param.rs` are not additional terms in this scorer.

## 7. VM ranker: request, implementation gap, and fallback semantics

Home Mixer always sets `value_model_id="dpp"`, viewer ID, and each wrapper's tweet ID, original repost ID (absent → 0), and optional current score. DPP params are attached when `theta>0 OR max_selected_rank>0`; otherwise omitted. With optional value-model inputs, it additionally forwards author ID, `in_network` (unknown collapses to false), reply/repost/mutual booleans, policy-zero flag, target lift rank, minimum video duration, all 26 Phoenix heads, optional viewer FS recipient fields/overrides, topic-request flag, and compute flag (`home-mixer/scorers/vm_ranker.rs:141–188`; `home-mixer/scorers/vm_ranker_request.rs:6–74`).

**Missing implementation:** The published `vm-ranker/scoring/mod.rs:18–54` only supports DPP on already supplied scores or passthrough. It does not read `compute_value_model`, viewer feature-switch inputs, Phoenix heads, author-policy flags, or cold-start rank metadata to recompute weighted values. A non-`"dpp"` model ID with DPP context logs an error but still performs DPP. Without DPP context, every candidate returns its existing score or 0. Do not describe the request plumbing as a working alternate value model.

Request override details: service replaces theta only if `params.theta != 0.0`, pool size only if nonzero. Consequently **theta 0 in a request means “retain service default,” not disable diversity or set theta to zero**. Both request fields zero mean absent params in Home Mixer; they still do not disable a service started with DPP. A negative nonzero theta can reach the service when positive pool size causes params to be attached, then is clamped to zero by `rescore`. An actual zero-theta service startup is possible. `EnableVMRanker=true` plus default request theta 0.65 is not proof that service startup `dpp_enabled` was true (`vm-ranker/scoring/mod.rs:22–43`; `home-mixer/scorers/vm_ranker.rs:163–181`).

The service initializes an external multimodal embedding client via `get_mm_client(0,dim,false)`, preloads it before readiness, and fails startup if requested store/preload initialization fails. With DPP disabled it does not initialize the store (`vm-ranker/embedding_store.rs:8–22`; `vm-ranker/main.rs:23–44,78–86`). The embedding client, generated VM protos, and live embedding data are not included here.

Home Mixer requests prefer xDS only if a client exists and the cluster-specific gate selects it; xDS-to-DNS fallback is separately gated. Any final RPC failure produces per-candidate errors; generic `update_all` preserves the incoming score. A successful partial response preserves absent candidates' local score; duplicate response IDs collapse through a hash map. The server normally returns one result per request candidate (`home-mixer/scorers/vm_ranker.rs:21–50,83–122`; `candidate-pipeline/scorer.rs:49–55`; `vm-ranker/scoring/dpp_model.rs:170–181`). These are different from DPP rejection, which explicitly returns a **zero** score and therefore overwrites the local value.

## 8. DPP mathematics and actual selection semantics

### Pool and embeddings

`build_dpp_inputs` ignores candidates with missing `score`, sorts descending by score with original-index tie-break, takes at most `max_selected_rank`, then fetches embeddings. Reposts fetch the original post's embedding but retain the wrapper ID for output. Present embeddings use their computed L2 norm. Missing embeddings get a newly sampled normalized vector with components drawn from `Uniform(-1,1)`; after f16 conversion, the stored norm is **1.0**, not recomputed. This is a random fallback, **not a zero-vector fallback** and not uniform-sphere sampling. Distinct missing occurrences can receive distinct vectors, including duplicates/repost variants (`vm-ranker/scoring/dpp_model.rs:13–83`). The metrics description still says “missing embeddings (zero vector)” and is stale (`vm-ranker/metrics.rs:149–158`).

An optional `seed_tweet_id!=0` is fetched separately. A found seed is pinned into the DPP process, a missing seed is omitted with a metric, and the seed itself is not returned or charged against candidate top-K. Home Mixer's shown `build_request` leaves `seed_tweet_id` at its default, so this feature exists at service level but is **not exercised by this caller** (`vm-ranker/scoring/dpp_model.rs:85–114`; `home-mixer/scorers/vm_ranker.rs:175–181`).

### Kernel construction

Let `s_i` be the local score, `e_i` its f16 embedding, `n_i` norm, `m` pool size, and `eps=1e-6`:

```text
s_max = max(max_i(s_i), eps)
theta' = clamp(theta, 0, 1-eps)
alpha = theta' / (2*(1-theta'))
q_i = s_i / s_max                  for candidate i
q_seed = 1                        regardless of seed's stored score 0
f_i = exp(alpha*q_i)

L_ii = f_i^2
L_ij = f_i*f_j*cos_ij             for i != j
cos_ij = dot(e_i,e_j)/(n_i*n_j)    if n_i*n_j > eps
         0                        otherwise
```

Source: `vm-ranker/dpp.rs:12,35–136`, `DppConfig`, `rescore`. The diagonal is explicitly set rather than derived from self-cosine; zero-norm embeddings still get a positive quality diagonal. Cosine is not clamped, shifted into `[0,1]`, or replaced with `1-cosine`. f16 norm sums use f32; dot products choose AVX512, AVX2/FMA/F16C or scalar paths and use the shorter embedding length if lengths differ, rather than rejecting dimension mismatch (`vm-ranker/scoring/dpp_model.rs:13–20`; `vm-ranker/helpers.rs:3–28,30–152`).

**Mathematical interpretation/inference:** where `L=diag(f) C diag(f)`, `log det L_Y = 2*alpha*sum(q_i in Y)+log det C_Y`; hence the quality coefficient is `theta'/(1-theta')`. Increasing theta generally emphasizes supplied score relative to volume diversity; theta zero makes every quality factor 1. This is a greedy determinant objective, not sampling post exposure probabilities or maximizing a global reach target. Because raw cosine can be negative, opposite collinear vectors can be determinant-redundant just like identical ones (for two unit vectors, determinant factor is `1-cos²`), rather than always “more diverse” because cosine is negative.

### Greedy Cholesky selection

`greedy_dpp` returns empty when `n==0` or `k==0`. If seed diagonal exceeds epsilon, select it first and set maximum iterations to `min(k+1,n)`; otherwise maximum is `min(k,n)`. Without seed, first item maximizes the diagonal, scanning in pool order and replacing only for a strict improvement. Initialize `log_det=ln(L_first,first)` and Cholesky row `c_0i=L_first,i/sqrt(L_first,first)` when the square root exceeds epsilon.

For each later step `s`:

```text
cv_i = L_ii - sum_{j<s}(c_ji^2)               over available i
b = argmax_i cv_i                            strict '>' scan tie handling
if cv_b <= 1e-6: stop (rank_exhausted)
select b; log_det += ln(cv_b)
c_si = (L_bi - sum_{j<s}(c_jb*c_ji)) / sqrt(cv_b)
```

This is greedy approximation, not an exact optimal subset search. Rank exhaustion can select far fewer than top-K. Source: `vm-ranker/dpp.rs:217–314`, `GreedyDppResult`, `greedy_dpp`. Tests explicitly select only the top scorer for identical embeddings and retain an orthogonal candidate over a near-duplicate higher-scored one (`:390–431`).

### Output is score preservation plus zeroing

After greedy selection, strip the seed, then **sort selected candidates by their original local score** and preserve those numeric scores. Determinant increments/log determinant do not become ranking scores (`vm-ranker/dpp.rs:135–171`). The wrapper then returns **every requested candidate in request order**: original score (missing→0) if its tweet ID belongs to the selected-ID set, **0 otherwise**. This includes candidates outside the top pool and those without input scores (`vm-ranker/scoring/dpp_model.rs:170–181`).

Consequences:

- DPP is implemented here as a score-preserving subset filter encoded via zeros, not numerical rescaling or reordering by determinant marginal gain. The later Home Mixer selector establishes score order.
- With normal positive scores and at least 50 survivors, zeros lose to them. With fewer survivors, zeroed candidates can still fill the 50-item Home Mixer selector because that selector has no positive-score predicate. Thus **“DPP rejected = can never be displayed” is not established by these components**. Likewise MOE policy zeroing alone is not removal (§5).
- Input negative scores are accepted: zeroed losers can outrank selected negative-scored candidates downstream. DPP does not enforce `score>0`.
- Output membership is by tweet ID, not input occurrence. Duplicate IDs share selected status; any selected occurrence can preserve the scores of other occurrences, including an occurrence outside the pool. The main pipeline's prior deduplication reduces this risk, but the service contract itself does not deduplicate IDs.
- Candidate pre-pool sort has index tie-break, but `rescore` sorts again with unstable score-only sorting. Do not promise deterministic equal-score selection; missing-embedding RNG is another source of nondeterminism. Viewer ID is unused in DPP math; personalization comes from supplied scores/inputs, while debug viewer ID only controls logs.

Sources: `vm-ranker/scoring/dpp_model.rs:43–81,116–181`; `vm-ranker/dpp.rs:35–55,154–171`; `home-mixer/selectors/top_k_score_selector.rs:8–14`; `candidate-pipeline/selector.rs:48–74`.

### Numerical/configuration edges and diagnostics

- `top_k=0` returns no selected IDs, causing all scores to be zero at the service wrapper. It is not a passthrough disable.
- Service `max_selected_rank=0` makes `build_dpp_inputs` empty, which safely returns no results and zeros all request candidates. Calling public `dpp::rescore` directly with nonempty inputs and `max_selected_rank=0` is different: it indexes an empty `top_indices` vector after computing `m=0` and can panic (`vm-ranker/scoring/dpp_model.rs:39–59`; `vm-ranker/dpp.rs:41–92`).
- `embedding_dim=0` is not guarded in `random_unit_embedding`: its zero-norm fallback writes `u[0]`. The external store may reject zero dimension first; that contract is absent (`vm-ranker/scoring/dpp_model.rs:23–35`; `vm-ranker/embedding_store.rs:19–22`).
- Clamping theta below 1 avoids literal division by zero but does not guarantee finite exponentials: near the upper clamp alpha is about 499,999.5, so `exp(alpha*q)` can overflow. Nonfinite input scores/embeddings and unusual negative scores have no general validation/recovery here. First selection also lacks the later `best_vol<=eps` termination test (`vm-ranker/dpp.rs:92–133,223–307`).
- DPP metrics report pool score summary, miss ratio, selected count, terminal conditional variance, log determinant, before/after mean cosine, original top-K overlap, seed status and a rescaling label **`unchanged`**. Labels/descriptions are observability, not an extra scoring objective or proof that metrics improved (`vm-ranker/dpp.rs:58–90,145–212`; `vm-ranker/metrics.rs:52–159`).
- Server runs DPP on `spawn_blocking`, converts task failures to errors, and exposes bounded concurrent requests. Errors can cause Home Mixer to retain its pre-DPP scores (§7), so effective diversity also depends on successful service execution (`vm-ranker/scoring/mod.rs:40–43`; `vm-ranker/ranker_service.rs:62–97`).

Tests in `vm-ranker/dpp.rs:375–572` cover empty/single input, identical/orthogonal embeddings, score preservation, candidate-pool bound, seed suppression without consuming budget, and basic dot products. They do not establish end-to-end exposure guarantees, numerical safety for pathological overrides, or production embedding coverage.

## 9. What is and is not recoverable from this snapshot

**Recoverable:** exact local action coefficients; all conditional terms and their order; author and OON multipliers; mutual-original eligibility; low-impression lift/corpus/Thompson algorithms; caller/server DPP gates; kernel/greedy math; response zeroing and local fallback; source defaults and historical document claims.

**Not recoverable from these files:** live feature-switch configurations/experiment assignments, live decider values, deployed VM startup flags, deployed learned model weights/calibration, inference-client conversion of prediction responses, external `PhoenixScores` definition, authoritative ID-age helper implementation, multimodal embedding client/data, or generated protocol implementations. `PhoenixScores` is re-exported from a missing component-library implementation (`home-mixer/models/candidate.rs:6`); egress dispatch is also re-exported (`home-mixer/util/egress.rs:1–3`); the published `candidate-pipeline/` tree supplies traits/framework rather than those referenced component-library internals. The local VM value-model compute path is absent despite request fields (§7).

**Do not turn these into claims:** every account receives these defaults; a particular post has a fixed reach multiplier; reports cancel counted likes; mutual followers always see each other's posts; every small/new author gets 1,000 views or a guaranteed slot; video/quotes/links categorically win; the five-minute UAS request window is the complete model memory; cached slate fatigue changes this local formula; or DPP-zeroed candidates are necessarily removed. Follow the actual candidate gates, optional prediction inputs, runtime overrides, score transforms, selection, and later filters.
