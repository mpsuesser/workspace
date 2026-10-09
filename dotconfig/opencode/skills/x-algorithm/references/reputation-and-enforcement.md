# Account reputation, behavioral detection, and enforcement

Snapshot: `3aa0fa336c4a20e4149b6151629b6050897bb8a5`. Every `path:line` citation is relative to the bundled source snapshot. This reference covers `user-cred-v2/`, `agatha/`, `bdsm/`, and `abuse-enforcement-service/`; [event-rules.md](event-rules.md) covers all 20 published Scarecrow Botmaker rules and their helpers/runtime. Values are snapshot defaults or published configurations, not a claim about current deployment.

## 1. System boundaries and direction of signals

| Producer | Computation/output | Concrete consumer established here |
|---|---|---|
| UserCred V2 | Daily graph computation; nonnegative mass and logarithmic 0–100 credibility score | Scarecrow `IsHighPageRankUser` exemption; enforcement credibility prechecks. It is **not** a per-post For You ranking score or a published direct multiplier. |
| Agatha | Offline labels → feature/label association statistics → account scores → percentile calibration | HSS `GetUserHealthScores`; event rules apply `AGATHA_SPAM` and `AGATHA_SPAM_TOP_USER`. High scores mean stronger association with the named adverse label, not higher credibility. |
| BDSM | Recent action sequence → eight independent sigmoid head scores → policy-gated event labels | Score-result stream to enforcement. Model probabilities, diagnostic `0.5` flags, and enforcement operating points are different. |
| Scarecrow/Botmaker | Event-specific predicates and actions | Account labels, tweet RTF labels, URL verdicts, review reports, notes. |
| Abuse enforcement service | Incoming labels/requested actions + hydrated account/credibility facts → ordered policy | Action Intake Service (AIS) labels, challenges, suspensions. |

The release explicitly groups these as upstream producers of labels that drive visibility filtering (`README.md:53`, `README.md:296-314`). A model output or a rule filename alone does not establish a feed-ranking effect; follow the resulting label into the visibility policy. Missing model-to-service glue must not be invented.

## 2. UserCred V2: exact graph and equations

### Population, edges, initialization

* A valid user has an ID and is not marked `restricted`, `deactivated`, `suspended`, or `erased`; absent flags do not exclude. `userState == 1` means near-zero. Premium means **any** blue, gray, gold, verified-organization, or organization-affiliate flag (`user-cred-v2/ValidUserInfo.scala:14-37`, `fromFlatUser`).
* Follows come from the latest Flock snapshot, only `stateId == 0`. Directed edge is follower/source → followed/destination (`user-cred-v2/Edge.scala:13-18`; `user-cred-v2/UserCredV2App.scala:24-30`). Follow-graph destination must be valid, source must be valid **and not near-zero**. Every valid user remains a node, including near-zero users and users without outgoing edges (`user-cred-v2/UserCredV2App.scala:287-317`, `getPageRankGraph`). Thus near-zero users may receive follow mass but do not distribute it through outgoing follows.
* Engagement edges are Favorite or Retweet events in `[dateRange.end − 7 days, dateRange.end]`; require author ID, engaging ID > 0, and engaging ID != author ID. Repeated events contribute counts, not just distinct pairs (`user-cred-v2/UserCredV2App.scala:79-99`, `readEngagementEdges`; `user-cred-v2/UserCredV2Config.scala:25`).
* Both follow and engagement inputs exclude exact `(sourceId,destinationId)` pairs in the latest account-expansion investigations snapshot no older than seven days. No reverse-pair inference is shown (`user-cred-v2/UserCredV2App.scala:102-118`, `filterLinkedUserEdges`).
* Fresh mass is 1 per valid account, normalized. First snapshot uses fresh mass. Later runs read prior mass from a snapshot no older than seven days, join it onto the current valid population, use fresh mass for new accounts, then renormalize. The separate **engagement weighting** prior is the unjoined prior snapshot, not that warm-start result (`user-cred-v2/UserMass.scala:10-13`; `user-cred-v2/UserCredV2App.scala:120-138,195-227`).

### Teleport distribution

Let `m_prev(u)` be prior mass, `c(u,v)` the number of retained favorite/retweet events from u to v, and `C(u)=Σv c(u,v)`.

```text
e_raw(v) = Σu m_prev(u) · c(u,v)/C(u)
e(v)     = normalize(e_raw)(v)
q(v)     = uniform over valid, non-near-zero premium users; zero elsewhere
p(v)     = normalize((1−β)q(v) + βe(v)), β default 0.5
```

`normalize` divides by total mass if positive, otherwise returns zero (`user-cred-v2/UserCredV2App.scala:141-192,272-284`, `computeTeleportWeights`, `getNormalizedUserMassPipe`). Engagement destinations are **not explicitly joined to valid users here**; their mass can exist in `p` and then be omitted when teleport weights are joined to graph nodes. Engagement sources need prior mass but are not explicitly checked against current `isNearZero`. Do not silently substitute a cleaner graph algorithm for this implementation. Snapshot mass gates below can catch resulting mass loss.

### PageRank iteration and reported score

For follow outdegree `d(u)`, and current mass `m_t`:

```text
r_t(v)   = Σ(u→v, d(u)>0) m_t(u)/d(u)
M_t      = 1 − Σv r_t(v)                       # missing/dangling mass
m_t+1(v) = (1−α)r_t(v) + p(v)[α+(1−α)M_t]     # α default 0.2
Δ_t      = Σv |m_t+1(v)−m_t(v)|
score(v) = 0                                 if mass <= 0
           clamp(165.2 + 7.07 ln(mass), 0,100) otherwise
```

Mass splits evenly across outgoing follow neighbors, not proportionally to engagement; engagement affects teleport weights. Iterate while `Δ > 0.001` and `curIteration+1 < 50` (defaults). Teleport weights remain fixed during the iteration run. Sources: `user-cred-v2/UserCredV2App.scala:246-269,320-389`, `runPageRank`, `doPageRank`; `user-cred-v2/UserCredV2Config.scala:27-45`; `user-cred-v2/UserCredV2.scala:9-18`, `fromMass`.

Higher incoming mass increases score logarithmically. More outgoing neighbors divides the source's transferable mass; it is not an unconditional penalty for following people. Premium membership contributes to one component of teleport support, not an additive score bonus. Block/report counts are **not inputs to this implementation**.

### Cadence, publishing safeguards, and three different thresholds

Production job explicitly schedules daily batches, first time `2026-04-27`. Publishes daily Parquet `{userId,mass,score}` and, if configured, versioned Manhattan `{score,mass,snapshotTimestampMsec}` (`user-cred-v2/UserCredV2App.scala:453-505,518-531`).

Publication gates: relative row-count change ≤ 5%; mass sum in `[0.99,1.005]`; relative count change for score ≥ **55** ≤ 5%. Relative comparison is `abs(current/previous−1)`; a zero baseline passes only for zero current count. First snapshot omits baseline-relative gates. Score ≥ 90 count is measured, not used as a gate. Failure writes a quarantine snapshot and fails, unless `skip_gate` explicitly overrides (`user-cred-v2/SnapshotSafeguard.scala:21-87`; `user-cred-v2/UserCredV2App.scala:392-449`; `user-cred-v2/UserCredV2Config.scala:40-45`).

Do not conflate: **55** is the default snapshot-count safeguard threshold; **54** is the Botmaker high-PageRank helper threshold; **50.0** is an additional published abuse-enforcement skip threshold. Botmaker considers `score >= 54 OR PREDICTED_HIGH_PAGE_RANK`; only when score is absent and predicted label absent does it fall back to follower count **> 25,000**. A present low score does not get the follower fallback. Source: `botmaker-rules/scarecrow/derived-feature/IsHighPageRankUser.df:2-27`, `botmaker-rules/scarecrow/derived-feature/HighPageRankThreshold.df:2`; enforcement YAML cited below.

## 3. Agatha: labels are aggregated training targets, not direct ranking penalties

### Rate targets and population accounting

For target user u, let `I_u` be sampled distinct adverse actors and `F_u` sampled distinct out-of-network favorite actors. Outer-join both populations and default missing counts to zero. For the global prior, scale each `(I,F)` pair proportionally so `I+F ≤ 1000`; let the resulting totals give `π=ΣI'/Σ(I'+F')`. Then:

```text
rate(u) = (I_u + 0.1) / (I_u + F_u + 0.1/π)
UserLabel = (userId, labelName, positiveCount=I_u,
             totalCount=I_u+F_u, smoothedRatio=rate(u))
```

This is not raw `blocks/favorites`; the denominator includes adverse interactions, and the global cap applies to prior estimation, not each user's final counts. Holding prior fixed, adverse interactions increase the target and favorites decrease it. Each source actor contributes to at most **100** target pairs via reservoir sampling before target counts are collected. `LabelUtil.getLabelSizes` groups by the tuple's second element (actor), samples, then groups/counts by target. Sources: `agatha/scalding/labels/LabelUtil.scala:12-43`; `agatha/scalding/labels/rate_based_labels/RateBasedLabels.scala:29-55,59-100`.

| Target/input | Exact source/filter | Citation |
|---|---|---|
| Favorite denominator | Favorite events only; exclude self-favorites and test accounts on either side; distinct `(tweet author,favoriter)`. Exclude any pair connected by follows **in either direction** in latest follow snapshot. That follow read shows no state filter. | `agatha/scalding/labels/favs/Favs.scala:15-67`, `getFavs`, `getInNetwork` |
| `BlocksPerFav` | Latest Flock block snapshot; update timestamp `> start` and `<= end` (seconds); both IDs > 0 and not known artificial; state 0 or 2; distinct `(blocked,blocker)`. | `agatha/scalding/labels/rate_based_labels/RateBasedLabels.scala:120-139` |
| `ReportsPerFav` | RTP reports over **180 days ending at end**; `tool == AbuseTriageTool`, reporter ID and create timestamp present; distinct `(reportedUserId,reporter)`. | `agatha/scalding/labels/rate_based_labels/RateBasedLabels.scala:65-66,142-158` |
| `SpamReportsPerFav` | Tattle events: DirectMessageReport, ReportAsSpam, UserReport, TweetReport; `isLegit` true (absent false); distinct `(spammerId,victimId)`. | `agatha/scalding/labels/rate_based_labels/RateBasedLabels.scala:161-183` |
| `AllSpamReportsPerFav` | Same four tattle types, no `isLegit` gate. | `agatha/scalding/labels/rate_based_labels/RateBasedLabels.scala:67-70,161-183` |
| Mention-filtered helper definitions | Distinct `(mention.tweeterId,mentionedUserId)` when any interaction has selected engagement. Blocks: Block or Mute. Reports: Annoying, Harassment, HatefulConduct, Impersonation, Offensive, PrivateInfo, SelfHarm, Spam, UnauthorizedPhoto, ViolentThreat reports. | `agatha/scalding/labels/rate_based_labels/RateBasedLabels.scala:186-229` |

Paths in the last five rows are under `agatha/scalding/labels/rate_based_labels/`. The exported rate job writes **four** targets; mention-filtered readers/helpers exist but are not invoked by `getUserLabels`. `BlocksPerFav` is generated but is absent from the published `RateBasedJobConfig.labelNames`, prediction label set, and Blink label set: avoid claiming it directly drives the two live Agatha spam rules. Sources: `agatha/scalding/labels/rate_based_labels/RateBasedLabels.scala:102-117`; `agatha/scalding/RateBasedBuildJob.scala:22-29`; `agatha/scalding/AgathaFeaturesPredictJob.scala:26-35`; `agatha/scalding/blink/BlinkScoreJobTemplate.scala:225-235`.

Rate extraction history is 30 days **before the passed batch start**, ending at batch end; it is not necessarily exactly a 30×24h window. Reports replace that with the 180-day range above. Output layout is daily; scheduled extraction/build/predict/Blink jobs take their schedule from `MediaScienceBatch.batchArgs(args)` (no hardcoded run interval in those templates). Sources: `agatha/scalding/labels/rate_based_labels/RateBasedLabelsExtraction.scala:10-15`; `agatha/scalding/labels/LabelExtractionTemplate.scala:24-34,40-68`; `agatha/hub/agatha/job/AgathaJobTemplates.scala:77-101,117-128,132-150,166-176`; `agatha/scalding/blink/BlinkScoreJobTemplate.scala:209-220`.

### Binary targets

* `SpamSuspended`: positives from suspension events whose lowercased action is `suspend`, reason is `other` or `spam`, and note does not contain `#chaq`; distinct users. Do not describe this as all suspensions. Negative population is active users minus positives; label is 0/1 with total count 1. Sources: `agatha/scalding/util/GetSuspendedUsers.scala:13-26`; `agatha/scalding/labels/spam_suspended/SpamSuspendedLabelExtraction.scala:15-26`; `agatha/scalding/labels/LabelUtil.scala:46-60`.
* NSFW positives: account label record value in `{NsfwHighPrecision,NsfwAvatarImage,NsfwBannerImage}`; same active-negative construction. Both binary label jobs use 30-day history settings (`agatha/scalding/labels/nsfw/NSFWLabelExtraction.scala:12-40`).
* Active requires combined user + safety + extended user + userState; not deactivated/suspended and state value != 1 (`agatha/scalding/util/GetActiveUsers.scala:11-24`). Active feature job uses active ∪ suspended users and **explicitly omits a third production population from this release** (`agatha/scalding/data/ActiveUserFeaturesJob.scala:18-41`).

### Feature inventory and model construction

Published active-feature extraction has 21-day history and these enabled loaders (`agatha/scalding/data/ActiveUserFeaturesJob.scala:18-37`):

| Enabled source | Exact construction |
|---|---|
| AbuseReportGraph, FollowGraph | Latest Flock snapshot (read range extends start by 7 days); state 0 or 2, no test accounts; both inbound/outbound feature directions (`agatha/scalding/data/loaders/MostRecentEdgeSourceDataLoader.scala:24-47`; `agatha/scalding/data/loaders/AbuseReportGraphDataLoader.scala:8-11`; `agatha/scalding/data/loaders/FollowGraphDataLoader.scala:8-11`). |
| FavGraph | Distinct non-self favorite user→author pairs, no test accounts; both directions (`agatha/scalding/data/loaders/FavGraphDataLoader.scala:19-39`). |
| Tweet-author graphs | First applicable valid non-self relation in priority retweet → quote → reply; separate mentions excluding IDs in those relation fields; distinct, both directions (`agatha/scalding/data/loaders/TweetAuthorEngagementGraph.scala:18-81`). |
| Hashtags | Lowercase distinct tags; original vs retweet source determined by different retweeted author; no test-account author (`agatha/scalding/data/loaders/HashtagTweetsDataLoader.scala:20-62`). |
| Legit tattle | Distinct spammer/victim pairs, both not test, `isLegit` true, both directions (`agatha/scalding/data/loaders/LegitTattleGraphDataLoader.scala:18-37`). |
| Non-legit no-block tattle | Distinct spammer/victim pairs, both not test, non-Block type and `isLegit` absent/false, both directions (`agatha/scalding/data/loaders/NonLegitTattlesNoBlocksGraphDataLoader.scala:20-39`). |
| Direct-message graph | Distinct sender/receiver pairs from DM participants, both directions; marked experimental for Blink exclusion (`agatha/scalding/data/loaders/DirectMessageGraphDataLoader.scala:19-32`; `agatha/scalding/data/ActiveUserFeaturesJob.scala:33-37`). |
| CombinedUser | `email_state`; creation week/month/year; `created_via`; signup IPv4 exact,/16,/24; `ceil(ln(1+count))` buckets for followers/followings/active followers; signup country/region; push device carrier/client IDs; distinct tokenized profile-description tokens (language detection/Penguin 6); signup category and verified flag. Requires user, extended user, safety; excludes restricted, frictionless, deactivated, test accounts. Encodes `featureType:value` with weight 1 (`agatha/scalding/data/loaders/CombinedUserDataLoader.scala:31-174,180-189`). |

Loader paths above are under `agatha/scalding/data/loaders/`. Additional block/mute/list/contributor/faved-tweet/retweeted-tweet loaders in the directory are not evidence that the published active job enables them.

`BuilderApp` intersects available feature users and label users. It uses smoothed ratio if present, otherwise `positiveCount/totalCount`; learns per-feature/per-label PMI-like association, not a manually assigned penalty (`agatha/hub/agatha/builder/Builder.scala:16-64`). Let `x` be feature value, `y` target, `N` instances, `Sx=Σx`, `Sy=Σy`, `Sxy=Σxy`, `Sxy2=Σ(xy)^2`:

```text
E = (Sx/N)(Sy/N)
P = max((Sxy + 10000 E)/(N + 10000), 1e−20)
SE = sqrt((max(Sxy2/N,1e−10) − (Sxy/N)^2)/N)
P_corrected = max(P−2SE,E) if P>E, else min(P+2SE,E)
association = ln(P_corrected) − ln(E)
```

Discard absolute association < .01; negative associations retained (`positive=false`), no PMI discount; feature minimum count 20, no configured per-instance feature count/sum caps. Sources: `agatha/hub/pmi/math/Math.scala:14-20,23-92`; `agatha/hub/agatha/job/AgathaJobTemplates.scala:19-39`; sums/cross-products: `agatha/hub/pmi/PMI.scala:60-144,148-194`.

Prediction removes each labeled user's own contribution from cross-product sums, squared sums, marginal sums, and N before recomputing association (leave-one-out); unlabeled users use learned association directly. Group by `(user,featureClass,label)` and summarize **present** associations with count, mean, population variance, standardized third/fourth central moments when enough observations (`agatha/hub/pmi/PMISetExtractors.scala:47-104`; `agatha/hub/agatha/predict/Predict.scala:17-49`; `agatha/hub/agatha/predict/Aggregators.scala:30-38`; `agatha/hub/pmi/math/aggregators/Moments.scala:47-64,140-157`). Prediction reads rate, suspension, and NSFW models with a further 14-day snapshot search expansion; configured history 14 days (`agatha/scalding/AgathaFeaturesPredictJob.scala:26-62`).

### Blink aggregation, calibration, signs

For retained feature classes c, with association count `n_c` and mean `μ_c`, and label prior `π_label` (unweighted mean label value across its users):

```text
rawBlink(u,label) = [Σc n_c μ_c + ln(π_label)] / [Σc n_c + 1]
```

This is a count-weighted association average with a log-prior pseudo-observation, **not** a ratio, logistic posterior, or sum of independent penalties. Calibrate separately per label using active users' raw scores, `calibrateDistinct(numPartitions=1000,k=12,reducers=500)`; apply mapping to all scored users. Calibration implementation itself is imported, not published under Agatha. Sources: `agatha/scalding/blink/BlinkScoreJobTemplate.scala:64-129,134-193`.

All labels exclude experimental DM inbound/outbound. Additional Blink exclusions (`BlinkScoreConfig`, `agatha/scalding/blink/BlinkScoreJobTemplate.scala:237-263`):

| Label | Excluded classes beyond DM |
|---|---|
| ReportsPerFav | BlockGraph both; FavGraph inbound; AbuseReportGraph inbound; LegitTattleGraph both; NonLegitTattleNoBlocksGraph both |
| AllSpamReportsPerFav | FavGraph inbound; both legit/non-legit tattle directions |
| SpamReportsPerFav | Both legit/non-legit tattle directions |
| SpamSuspended, NSFW | None |

Writes raw and calibrated daily snapshots; four spam/report calibrated label scores have Manhattan import datasets; NSFW is in score output but absent from this import map (`agatha/scalding/blink/BlinkScoreJobTemplate.scala:265-270,278-323`). The two Botmaker Agatha rules consume **HSS scores** with their own thresholds; exact operational mapping/calibration serving glue beyond these names is not included (`scarecrow/legacy/StratoRegistry.scala:137-166`). See [event-rules.md](event-rules.md).

## 4. BDSM: exact sequence input and classifier outputs

### Architecture, dimensions, pipeline

Bidirectional transformer encoder: time-aware rotary position encoding from `impr_ts` (seconds) minus minimum positive timestamp; CLS position 0; grouped-query attention; RMSNorm; SwiGLU; padding attention mask, no causal mask. CLS raw embedding feeds a separately trained GELU MLP; sigmoid on each of eight logits. A separate normalized 128-dimensional contrastive projection is returned but the classifier uses `cls_raw`. Sources: `bdsm/runtime/model.py:62-80,239-326`; `bdsm/runtime/task_heads.py:14-33`; `bdsm/runtime/gpu_scorer.py:140`. README declares 256 actions, 512 sequence length, width 1024; checkpoint config supplies layer/head dimensions (`bdsm/README.md:102-103`; `bdsm/runtime/model.py:11-33`). Rust extension defaults of 4096/128/20 are **not** the authoritative served dimensions (`bdsm/rust/abuse-v3-features/src/lib.rs:327`).

Kafka action events → Rust dedup/cooldown accumulator → Redis queue → cache/store sequence prefetch + Rust extraction → Kafka GPU-ready batches → normalization + GPU inference → eight-score rows → sink policy/ledgers → BigQuery and protobuf `ScoreResult`. Sequence cache is default-on, store fallback, optional real-time action merge/resort; internal services/schema bindings and model artifacts are not furnished as a self-contained public deployment (`bdsm/README.md:53-101`). Backbone self-supervised training (masked attributes; every-sixth-step two-view InfoNCE) is described in `bdsm/README.md:42-51`; published task-head training uses cached embeddings rather than request-time ranking.

### Exact feature extraction and normalization

`extract_single_user_arrow` decompresses Zstd Arrow IPC, takes first `user_actions` list, retains **last min(total,seq_len)** actions, left-pads zeros; invalid user extraction leaves zero/masked row. Missing/null/unsupported scalar fields become zero/false/empty. Action IDs clamp into `[0,n_action_types−1]`, zero has no hot bit; model uses argmax. Sources: `bdsm/rust/abuse-v3-features/src/lib.rs:13-138,237-323,392-417`.

The optional Python fallback is not feature-equivalent: prefetcher uses it if Rust import fails (`bdsm/runtime/batch_prefetcher.py:200-207,568-574`); `bdsm/runtime/manhattan_arrow_adapter.py:63-71,119,229-249` reads only seven basic action fields, caps dwell at 300000ms, and emits a small action feature subset plus zero user features. It does not populate many required Backbone inputs (e.g. device fields). The full inventory below describes the Rust serving path; do not assume fallback can run this Backbone unchanged.

| Feature(s) emitted | Exact raw field or transform | Source in `bdsm/rust/abuse-v3-features/src/` |
|---|---|---|
| `action_types`; `tweet_ids_raw`, `author_ids_raw` | `action_name` hot vector; tweet/author IDs also retained outside `action_seq` | `bdsm/rust/abuse-v3-features/src/lib.rs:402-414,543-558` |
| `product_surface`, `client_app_id`, `hour_of_day`, `impr_ts` | Raw surface/app; `(engagement_time_ms/3,600,000)%24`; timestamp `/1000` | `bdsm/rust/abuse-v3-features/src/lib.rs:411-417` |
| `device_battery`, `device_brightness`, `device_charging`, `device_network`, `device_storage_ratio` | Raw battery/brightness/charging/network; available/max storage when max > 0, else 0 | `bdsm/rust/abuse-v3-features/src/lib.rs:420-426` |
| `is_following_author`, `target_has_media`, `post_language` | `is_author_followed_by_user`, `has_media`, `post_language_code` | `bdsm/rust/abuse-v3-features/src/lib.rs:294-301,428-436` |
| `target_popularity`, `view_count` | `log10(1+favorite+retweet+reply+quote+view)/7`; `log10(1+view)/7` | `bdsm/rust/abuse-v3-features/src/lib.rs:429-434,461` |
| `serve_to_action_ms` | If served > 0 and engagement > served: `ln(1+gap_ms)/ln(1+300000)`, else 0 | `bdsm/rust/abuse-v3-features/src/lib.rs:438-441` |
| `ip_hash`, `country_code`, `timezone`, `page_context` | Raw `ip_address`, `engaging_ip_country_code`, timezone, page (IP is not rehashed here) | `bdsm/rust/abuse-v3-features/src/lib.rs:309-313,442-459` |
| `search_query_hash`, `section_hash` | First four SHA256 bytes, big-endian integer, modulo 1024 or 256; empty string→0 | `bdsm/rust/abuse-v3-features/src/lib.rs:140-145,444-456` |
| `external_link_duration`, `video_duration_ms` | Positive link duration: `ln(1+ms)/ln(1+300000)`; positive first video duration: `ln(1+ms/1000)/ln(301)` | `bdsm/rust/abuse-v3-features/src/lib.rs:446-455` |
| `tweet_feed_position`, `is_promoted_tweet` | Raw tweet position; promoted ID > 0 | `bdsm/rust/abuse-v3-features/src/lib.rs:450-451` |
| `quoting_author_hash`, `in_reply_to_author_hash`, `retweeting_author_hash`, `quoted_author_hash` | SHA256 of big-endian i64, first four bytes modulo 65536; zero→0 | `bdsm/rust/abuse-v3-features/src/lib.rs:148-154,462-465` |
| `continuous_actions[...,0]` | Adjacent positive timestamps: `min(ln(1+max(gap_ms,0)/60000),10)/10`; first/missing→0 | `bdsm/rust/abuse-v3-features/src/lib.rs:472-479,560-569` |
| `continuous_actions[...,1]` | Positive dwell: `ln(1+dwell_ms/1000)/ln(301)`; else 0 | `bdsm/rust/abuse-v3-features/src/lib.rs:481-486` |
| `had_prior_render` | This positive tweet ID previously appeared in action 11 or 12 in retained sequence | `bdsm/rust/abuse-v3-features/src/lib.rs:489-500` |
| `action_burst_count` | Other actions among previous five/next five indices with both timestamps > 0 and absolute time difference < 1000 ms | `bdsm/rust/abuse-v3-features/src/derived.rs:26-39` |
| `same_author_streak` | Consecutive identical positive author run ending at action, default 1 | `bdsm/rust/abuse-v3-features/src/derived.rs:41-49` |
| `action_transition` | `(previous_action*n_action_types + current_action)%4096`, first 0 | `bdsm/rust/abuse-v3-features/src/derived.rs:51-53` |
| `engagement_without_impression` | Action in `{1,2,3,4,5,6,7,8,9,10,61,62,70}`, positive tweet, no prior 11/12 for it | `bdsm/rust/abuse-v3-features/src/derived.rs:19-21,55-62` |
| `time_since_tweet_created` | Snowflake creation `(tweetId >> 22)+1288834974657`; positive elapsed: `min(ln(1+elapsed_minutes)/10,1)` | `bdsm/rust/abuse-v3-features/src/lib.rs:156-160`; `bdsm/rust/abuse-v3-features/src/derived.rs:64-70` |
| `dwell_to_action_ratio` | Normalized dwell / normalized serve-to-action iff latter > .01, else 0 | `bdsm/rust/abuse-v3-features/src/derived.rs:73-77` |
| `action_category` | IDs 61/62/63→2; every other real action→1 (padding 0) | `bdsm/rust/abuse-v3-features/src/lib.rs:181-185,467-469` |
| Repeated sequence statistics | Natural-log action entropy; `1/(1+population stddev(gap_ms))` for at least 2 valid adjacent gaps; fraction dwell>0; distinct positive IPs/100; positive timestamp span hours/168; max occurrences of a positive tweet ID / action count. Entire tuple zero if <2 actions. Repeated at every nonpadding position. | `bdsm/rust/abuse-v3-features/src/derived.rs:81-148`; `bdsm/rust/abuse-v3-features/src/lib.rs:518-526` |

**Serving normalization overrides Rust's action-group and client-platform mappings.** Final `action_group` table (`bdsm/runtime/feature_norm.py:5-49`):

| Group | Action IDs |
|---|---|
| 1 | 1,2 |
| 2 | 4,7 |
| 3 | 6,9,5,8 |
| 4 | 29,30,14,70,60,39 |
| 5 | 11,12 |
| 6 | 31,37 |
| 7 | 36,34 |
| 8 | 21,61,62 |
| 9 | 10,16,67 |
| 10 | 23,63,64 |
| 11 | 25,65,66 |
| 12 | 50,53,54,55,56,58,13 |
| 0 | All other IDs |

Final platform: app 258901→1; 129032→2; 3033300→3; any other `0<id<1000`→4; otherwise 0 (`bdsm/runtime/feature_norm.py:52-70`). The complete raw action-name dictionary is `bdsm/runtime/action_names.json:1-198`; it is a vocabulary, not an enforcement rule list. Important exact IDs for interpreting features and policy:

| IDs | Exact action names (same order as IDs) | Citation |
|---|---|---|
| 1,2,3,4,5,6,7,8,9,10 | SERVER_TWEET_FAV, UNFAV, CREATE, REPLY, QUOTE, RETWEET, UNREPLY, UNQUOTE, UNRETWEET, REPORT (each suffix prefixed SERVER_TWEET_) | `bdsm/runtime/action_names.json:3-12` |
| 11,12,13,14 | CLIENT_TWEET_RECAP_DWELLED, CLIENT_TWEET_RECAP_NOT_DWELLED, CLIENT_TWEET_VIDEO_QUALITY_VIEW, CLIENT_TWEET_PHOTO_EXPAND | `bdsm/runtime/action_names.json:13-16` |
| 15,16,17,18,19,20 | CLIENT_TWEET_CLICK_MENTION_SCREEN_NAME, REPORT, NOT_INTERESTED_IN, UNDO_NOT_INTERESTED_IN, SEE_FEWER, UNDO_SEE_FEWER (same CLIENT_TWEET_ prefix) | `bdsm/runtime/action_names.json:17-22` |
| 21–28 | CLIENT_TWEET_FOLLOW_AUTHOR, UNFOLLOW_AUTHOR, BLOCK_AUTHOR, UNBLOCK_AUTHOR, MUTE_AUTHOR, UNMUTE_AUTHOR, MUTE_CONVERSATION, UNMUTE_CONVERSATION (same prefix) | `bdsm/runtime/action_names.json:23-30` |
| 29–37 | CLIENT_TWEET_CLICK, CLICK_PROFILE, CLICK_SHARE, SHARE_VIA_COPY_LINK, CLICK_SEND_VIA_DIRECT_MESSAGE, UNBOOKMARK, CLICK_HASHTAG, BOOKMARK, SHARE (same prefix) | `bdsm/runtime/action_names.json:31-39` |
| 38–49 | CLIENT_QUOTED_TWEET_CLICK; CLIENT_TWEET_OPEN_LINK; CLIENT_TWEET_TAKE_SCREENSHOT; CLIENT_TWEET_TRANSLATE_CLICK; CLIENT_TWEET_NOT_RELEVANT; CLIENT_TWEET_UNDO_NOT_RELEVANT; CLIENT_CARD_CLICK; CLIENT_TWEET_SHOW_MORE_EXPAND; CLIENT_TWEET_CLICK_GROK_ANALYZE; CLIENT_TWEET_VIDEO_OPEN; CLIENT_QUOTED_TWEET_VIDEO_QUALITY_VIEW; CLIENT_QUOTED_TWEET_PHOTO_EXPAND | `bdsm/runtime/action_names.json:40-51` |
| 50–60 | CLIENT_NOTIFICATION_OPEN, CLIENT_NOTIFICATION_CLICK, CLIENT_NOTIFICATION_SEE_LESS_OFTEN, CLIENT_NOTIFICATION_DISMISS, CLIENT_APP_ENTER, CLIENT_APP_EXIT, CLIENT_NOTIFICATION_IMPRESSION, CLIENT_PROFILE_CLICK, CLIENT_NOTIFICATION_SENT, SERVER_TWEET_POST_UNEXPLORED, CLIENT_TWEET_EXTERNAL_LINK_LONG_DWELLED | `bdsm/runtime/action_names.json:52-62` |
| 61–67 | SERVER_PROFILE_FOLLOW, UNFOLLOW, BLOCK, UNBLOCK, MUTE, UNMUTE, REPORT (same SERVER_PROFILE_ prefix) | `bdsm/runtime/action_names.json:63-69` |
| 68–73 | CLIENT_TWEET_CAROUSEL_SWIPE_NEXT, CLIENT_TWEET_CAROUSEL_SWIPE_PREVIOUS, CLIENT_EXTERNAL_LINK_SESSION, CLIENT_TWEET_RENDER_IMPRESSION, CLIENT_TWEET_DETAILS_IMPRESSION, CLIENT_TWEET_IMMERSIVE_IMPRESSION | `bdsm/runtime/action_names.json:70-75` |
| 74–83 | CLIENT_TWEET_VIDEO_PLAYBACK_START, PLAYBACK_COMPLETE, PLAYBACK_25, PLAYBACK_50, PLAYBACK_75, PLAYBACK_95, HEARTBEAT, MRC_VIEW, VIEW, VIEW_THRESHOLD (same CLIENT_TWEET_VIDEO_ prefix) | `bdsm/runtime/action_names.json:76-85` |
| 85,86,87,88,89,90,91,92,93,94,103 | CLIENT_TWEET_VIDEO_WATCH_TIME; CLIENT_EXTERNAL_LINK_SESSION_LESS_THAN_3_SEC, LESS_THAN_5_SEC, LESS_THAN_10_SEC, MORE_THAN_30_SEC, MORE_THAN_60_SEC (same link-session prefix); CLIENT_TWEET_VIDEO_PLAY_FROM_TAP; CLIENT_TWEET_GALLERY_IMPRESSION; CLIENT_EXTERNAL_LINK_SESSION_MORE_THAN_3_SEC, MORE_THAN_5_SEC; CLIENT_TWEET_DETAIL_DWELL | `bdsm/runtime/action_names.json:87-98` |
| 128–157,166,200–252 | Ads conversion/engagement vocabulary, exact enum names in cited dictionary; not mapped to a nonzero action group by `feature_norm` | `bdsm/runtime/action_names.json:99-128,137,142-194` |
| 158–163 | CLIENT_EXTERNAL_LINK_SESSION_MORE_THAN_15_SEC, MORE_THAN_20_SEC, MORE_THAN_25_SEC (same prefix); CLIENT_TWEET_RELEVANT_TO_SEARCH; CLIENT_TWEET_NOT_RELEVANT_TO_SEARCH; CLIENT_TWEET_REPLY_DOWNVOTE | `bdsm/runtime/action_names.json:129-134` |

Dictionary includes explicit placeholders 0,84,95,164,165,167–170,253–255 and gaps (e.g. 96–102); embedding capacity 256 does not imply 256 named real actions. In particular the extractor's “prior render” set is **11/12 only**, not every enum with IMPRESSION/RENDER in its name. Its `server_actions` set includes client action 70 and excludes some SERVER_* enums; that is executable feature logic, not a trustworthy semantic taxonomy.

The transformer consumes discrete embeddings for action/group/category/platform/app%512/page/country/timezone/language/network/search/section/transition/hour/day/surface; continuous feature-specific MLPs; six booleans; the six full-sequence stats plus two optional six-stat half-sequence sets (default zeros); optional `entity_rep_count/50` (default zero); three-hash embeddings for IP/author hashes; and continuous actions. Burst/streak/feed are scaled by 10/100/50. Discrete lookup clamps to vocab range (not modulo unless explicitly written); search extractor's 1024 buckets feed a 256-entry clamped embedding. Source: `bdsm/runtime/model.py:97-237`. The extractor also emits all-zero `user_features` `{account_age_norm,followers_log,is_verified,user_cred_norm,app_reputation}` (`bdsm/rust/abuse-v3-features/src/lib.rs:620-626`); this Backbone does not read that dictionary. **Do not claim UserCred directly enters this served classifier merely because `user_cred_norm` exists as a stub.**

### All eight heads and label taxonomy

Independent sigmoid probabilities in this exact order, not softmax classes; a legitimate score can coexist with bot scores. `bdsm/runtime/heads.py:16-122`; `bdsm/runtime/gpu_scorer.py:140`; `bdsm/runtime/labels.py:8-24` maps recognized flywheel strings or head names to boolean targets; absent/empty label list sets LegitimateUser, unknown nonempty labels produce no positives, mask initially all true.

| Index/head | Flywheel labels | Selection weight |
|---|---|---:|
| 0 FollowBot | FOLLOW_UNFOLLOW_CYCLE; PURE_FOLLOW_API_BURST; API_ONLY_BOT; GROWTH_SERVICE_BOT; FOLLOW_FARM_BOT | 27576 |
| 1 LikeBot | PURE_LIKE_API_BURST; LIKE_UNLIKE_CYCLE; STEADY_LIKE_DRIP; LIKE_FARM_BOT | 60320 |
| 2 EngagementAmplifier | LIKE_RETWEET_PAIR; FOLLOW_THEN_FAV_PIPELINE; FOLLOW_THEN_REPLY_PIPELINE; REPLY_THEN_FOLLOW_PIPELINE; ENGAGEMENT_AMPLIFIER; FOLLOW_LIKE_AMPLIFIER; OUTREACH_PIPELINE_BOT | 5496 |
| 3 ReplySpamBot | REPLY_SPAM_NO_CONSUMPTION; REPLY_SPAM_BOT; CONVERSATION_SPAMMER | 8922 |
| 4 TweetSpamBot | TWEET_CREATE_BURST; QUOTE_TWEET_SPAMMER; CONTENT_AMPLIFIER | 23425 |
| 5 RTBot | PURE_RETWEET_API_BURST; RETWEET_UNRETWEET_CYCLE | 5290 |
| 6 MultiActionBot | MULTI_ACTION_ENGAGEMENT_BOT; SCROLL_AND_LIKE; MIXED_AUTOMATION; SCROLL_BOT_NO_ENGAGEMENT; MIXED_ENGAGEMENT_AUTOMATION; SYNTHETIC_CONSUMER; AUTOMATED_ENGAGEMENT_BOT; PASSIVE_SURVEILLANCE_BOT; COORDINATED_INAUTHENTIC_BOT | 17474 |
| 7 LegitimateUser | LEGITIMATE_ORGANIC_USER; INFREQUENT_LEGITIMATE_USER; POWER_USER_API_CLIENT; NEW_ACCOUNT_ONBOARDING; DEVELOPER_TESTING; LEGITIMATE_USER | 0 |

These are label mappings, not hand-coded semantic definitions of each behavior; learned weights determine predictions. `ScoreResult` schema supports raw scores, sequence/version/fingerprint, summary labels/fired heads, counts, decoded actions, and enforcement note (`bdsm/proto/abuse_inference.proto:80-104`). The sink writer actually sets user/model/time/status SCORED, places `row.score_id` into scored_sequence_fingerprint, appends raw scores, labels, total actions and named counts; reason_code is highest non-legitimate score >.5. It does not populate every schema field. Fired-head priority is hard enforcement (plus other threshold-meeting hard heads), else cusp, else emitted paused-head, spam-bounce, starter-pack challenge. Additional co-firing hard heads are checked against threshold pairs without repeating FollowBot's unfollow-dominance guard. Sources: `bdsm/runtime/score_results_sink_focal.py:1202-1285`, `_publish_score_result`. Fired-head metadata is not proof every corresponding action was executed downstream.

### Training objective and reporting caveats

`bdsm/training/train_head.py:33-66` loads only `label_strength == "strong"` cached rows with finite CLS embeddings; `bdsm/training/train_head.py:157-175` rejects train/holdout user overlap, freezes backbone by construction, caps trainable parameters at 5M, uses warmup-cosine AdamW and global gradient clip 1. Shipped-config comment gives hidden widths **512,256**, batch 256, LR .001, 20,000 steps; CLI defaults differ (linear head unless widths supplied, batch 32, LR .0003, 12,000 steps, 500 warmup, focal gamma 2). Smoothing and reverse-CE weight come from the external backbone manifest (`bdsm/training/train_head.py:127-149`). The training loop shuffles cached rows and uses all-one masks (`bdsm/training/train_head.py:222-240`); head registry selection weights should not be reinterpreted as extra loss multipliers in this loop.

`masked_sce_focal_loss` (`bdsm/runtime/loss.py:7-49`) implements, for target y, prediction p=sigmoid(logit), smoothing s, reverse weight w, focal gamma γ:

```text
y_s = (1−s)y+s/2
CE  = −y_s ln(p_clip) − (1−y_s)ln(1−p_clip)
RCE = −p ln(y_s_clip) − (1−p)ln(1−y_s_clip)
f   = (1−[y p_clip+(1−y)(1−p_clip)])^γ       # f=1 when gamma<=0
loss = Σ mask·f·(CE+w·RCE)/(Σmask+1e−10)
```

Clips use `[1e−7,1−1e−7]`. Nonfinite loss/gradient causes a hard stop at the loop's **every-500-step check**, not a published per-step validation (`bdsm/training/train_head.py:248-254`). The README's broad training description is not a substitute for these executable details.

Prefetch action histograms depend on generated `proto_gen.recsys_pb2.ActionName`; absent bindings make the name map empty, yielding empty named histograms and therefore `A=0` at the sink even if extraction produced valid features. Dominant create/reply client fractions choose the most common **positive** app ID but include **all matching actions**, including unknown/zero app IDs, in the denominator; round to four decimals (`bdsm/runtime/batch_prefetcher.py:589-624,725-738`). Its diagnostic `decoded_timeline`, `median_gap_sec`, `time_span_sec` accumulate/read the already log-normalized `continuous_actions[...,0]` without converting back to seconds (`bdsm/runtime/batch_prefetcher.py:629-655,701-706`); do not treat those display fields as literal elapsed seconds. These summaries are distinct from the raw timestamp input to RoPE.

### Sink operating policy: conditions, branches, cadence

Published `bdsm/runtime/sink_policy.yaml:4-40` **redacts** every 2-D threshold pair `(τ,λ)`, cusp delta and hard-reply threshold to 9.99, and minimum action count to 999999. They are placeholders, not actual operating points. The impossible minimum count prevents all enforcement lanes on a 512-action sequence. Do not infer a production boundary from them. CLI policy file > `BDSM_SINK_POLICY` > adjacent YAML > fallback; invalid present policy fails startup (`bdsm/runtime/score_results_sink_focal.py:269-309,565-573`).

Let `A` be total action histogram count, `L` LegitimateUser score, `B_h` bot head score, `N` configured minimum count. Exact lane order:

| Lane | Eligibility and effect | Source in `bdsm/runtime/score_results_sink_focal.py` |
|---|---|---|
| Hard enforcement | `A>=N`, tweet-create fraction < .5; first head in policy order FollowBot, EngagementAmplifier, RTBot with `B_h>=τ_h && L<=λ_h`; FollowBot ignored if unfollows > follows. | `bdsm/runtime/score_results_sink_focal.py:814-836`; `bdsm/runtime/sink_policy.yaml:17-20` |
| Age protection | If hard met and age gate enabled: unknown age suppresses **any** selected head; FollowBot younger than default 48h suppressed. | `bdsm/runtime/score_results_sink_focal.py:838-847`, CLI `bdsm/runtime/score_results_sink_focal.py:383-389` |
| Login starter pack | Selected FollowBot suppressed if pack-age <= default 1440 minutes; missing pack age does not suppress. | `bdsm/runtime/score_results_sink_focal.py:849-866`, CLI `bdsm/runtime/score_results_sink_focal.py:390-399` |
| Followed starter pack | Off by default; selected FollowBot with count>0: dry-run appends audit label; challenge mode replaces suspension with challenge if action ledger permits. | `bdsm/runtime/score_results_sink_focal.py:868-887,926-941`, CLI `bdsm/runtime/score_results_sink_focal.py:400-414` |
| Dwell telemetry dropout | If checker configured and reports dropout: dry-run audit only, otherwise suppress hard enforcement. Default checker disabled; checker error fail-closed unless opt-in fail-open. | `bdsm/runtime/score_results_sink_focal.py:184-213,889-896`, CLI `bdsm/runtime/score_results_sink_focal.py:466-496` |
| Reply hard-suspend exception | No hard enforcement and **no skip reason**, `A>=N`, ReplySpamBot **strictly >** hard threshold, dominant reply app official, dominant fraction >= .90 default. No legitimate ceiling and no tweet-create-dominance exclusion in this branch. | `bdsm/runtime/score_results_sink_focal.py:898-912`; `bdsm/runtime/sink_policy.yaml:38-40`; CLI `bdsm/runtime/score_results_sink_focal.py:557-563` |
| Hard output | Append `enforcement_threshold_reached` and selected head; otherwise specific skipped-age/pack/dropout/low-actions audit labels. | `bdsm/runtime/score_results_sink_focal.py:914-954` |
| Cusp | No enforcement/skip reason, `A>=N`, not create-dominant; configured EngagementAmplifier with `B>=τ−δ && L<=λ+δ`. Challenge split; canary optional, dwell checks only for canary; non-dry-run dropout exempts. | `bdsm/runtime/score_results_sink_focal.py:959-1013`; `bdsm/runtime/sink_policy.yaml:22-24` |
| Paused heads | Optional LikeBot/MultiActionBot subset + nonzero sample; no hard/cusp/skip, `A>=N`, not create-dominant; 2-D pair; sampled, dropout checked, action claim required; emits challenge, never suspension in this lane. | `bdsm/runtime/score_results_sink_focal.py:1016-1075`; `bdsm/runtime/sink_policy.yaml:26-28` |
| Spam bounce | Optional TweetSpamBot/ReplySpamBot subset + sample; no hard/cusp/emitted paused challenge/skip, `A>=N`; 2-D pair; dominant create/reply app official and fraction >= .90; stable sampling. Default dry-run audit; challenge mode claims separate ledger. No create-dominance exclusion. | `bdsm/runtime/score_results_sink_focal.py:1078-1137`; `bdsm/runtime/sink_policy.yaml:30-38` |

Official apps are `{3033300,129032,258901,191841}`. Challenge picker gives configured salted-CRC32 fraction to `enforcement_cusp_liveness`, remaining users unsalted CRC32(uid)%2 to Arkose/Captcha; default liveness share 0 (`bdsm/runtime/score_results_sink_focal.py:163-181`, `bdsm/runtime/sink_policy.yaml:38`). Cusp canary sample, paused-head sample and spam-bounce sample default 0; paused/spam subsets empty; liveness claim window default **0 days (disabled)**, maximum 1; spam-bounce window default 7 days, distinct `act:spam_bounce:<uid>` key, fail closed. Comments mentioning a 7-day liveness deployment are not the CLI default (`bdsm/runtime/score_results_sink_focal.py:415-464,499-555`).

Scoring cooldown is distinct from actioning cooldown: sink writes `scored:<uid>` default 1 hour below configured action-count split, 24 hours at/above; split defaults to policy minimum actions. Queue/prefetch triggering is event-driven, not a promised fixed rescore interval (`bdsm/runtime/score_results_sink_focal.py:338-364,1292-1340,1502-1508`). `_build_flag_config` uses 0.5 diagnostic thresholds (`bdsm/runtime/score_results_sink_focal.py:134-141`); the main loop additionally appends each **non-legitimate head name whose score > .5** to output labels before the policy lanes, calculates A from the named histogram, and defaults absent legitimate score to 1 (`bdsm/runtime/score_results_sink_focal.py:1570-1586`). Those head-name labels differ from `enforcement_threshold_reached`/challenge labels and are not standalone suspension thresholds. Appeal-note prose and key-action template selection are redacted (`bdsm/README.md:104-126`; `bdsm/runtime/score_results_sink_focal.py:81-131`).

## 5. Abuse enforcement service: hydrated facts, ordered decisions, concrete actions

### Evaluation semantics and runtime gates

Published user/post YAML mirrors have sync dates Aug 26/Aug 25, 2026; runtime requires both nonempty, compiling GrowthBook user and post rule features at startup. Baked-in files remain fallback, not proof they equal a later live configuration (`abuse-enforcement-service/service-lib/src/lib.rs:1192-1234`). `CompiledRules` evaluates CEL `when` clauses in list order and returns the **first true rule**, not all matches (`abuse-enforcement-service/service-lib/src/rules.rs:113-139,284-306`). Missing cred facts project as false/empty/0/0.0 (`abuse-enforcement-service/service-lib/src/rules.rs:267-271`). Evaluation errors skip with `rule_eval_error` (`abuse-enforcement-service/service-lib/src/lib.rs:380-399`).

Before rules: test-ID skip; per-user allowlist and, for posts, both post and author allowlists; fetch Gizmoduck account + credibility. `fetch_cred` combines external high-PageRank response and gray badge: `is_high = gray || highPageRank`, retaining UserCred score and follower count (`abuse-enforcement-service/service-lib/src/strato.rs:130-179`; `abuse-enforcement-service/service-lib/src/entities.rs:8-15`). This is a distinct fetch from Botmaker's helper; do not assert identical undocumented Strato implementation. For posts, author is incoming `score.user_id`; published code leaves post hydration `present=false`, labels empty and hydrates the author (`abuse-enforcement-service/service-lib/src/lib.rs:232-377`).

Kafka intake can require any configured positive label and reject any configured negative label before processing; these topic configurations are dynamic (`abuse-enforcement-service/service-lib/src/lib.rs:931-958`). Dedup is entity-keyed, with action-class bypass for higher-severity incoming configured heads; normal processing consults it before enforcement (`abuse-enforcement-service/service-lib/src/lib.rs:735-838`). Only success gets full dedup retention; skip/dry-run use shorter retention (`abuse-enforcement-service/service-lib/src/lib.rs:529-574`). Global/entity enforcement quota, dry-run, and AIS outcome remain further gates (`abuse-enforcement-service/service-lib/src/lib.rs:423-509`). Thus user fallback suspension is **not** evidence every scored account is suspended: upstream topic-label admission matters.

`EnforcementAction` supports suspend with policy/perm, user labels, post labels, Arkose, captcha and spam-liveness challenge; label TTL becomes absolute now+TTL ms. No-TTL specs carry no explicit expiration. User/post labeling and challenges are materialized through AIS (`abuse-enforcement-service/service-lib/src/service.rs:75-80,147-248,298-432,545-676`).

Exact AIS challenge payloads: Arkose uses `bounceViaSelection` uncheckedTags `[FAKE,FAKE_ARKOSE_LOG_RECAPTCHA_EXPERIMENT]`; captcha uses `[FAKE,FAKE_RECAPTCHA_ENTERPRISE_SCORE,FAKE_RECAPTCHA_ENTERPRISE_SCORE_ONLY]`; liveness uses `bounceViaTemplate(templateId="spam_liveness_check",policyTag="Spam")`. User labels serialize as Native/nativeUserLabels, tweet labels as Safety/safetyTweetLabels (`abuse-enforcement-service/service-lib/src/service.rs:35-45,305-427`).

Published CLI defaults: user and post daily enforcement maxima **500000 each**; full dedup **86400s**, skip dedup **900s** (`abuse-enforcement-service/service-lib/src/config.rs:204-217`). Dedup classes are none=0, label=1, challenge=2, suspend=3, with incoming class<=held class blocked; higher-class bypass requires claim acquisition, and code can restore a displaced successful hold when bypass does not act (`abuse-enforcement-service/service-lib/src/dedup_cache.rs:10-19,210-261,351-439`). These are deployment-overridable controls, not per-user model thresholds.

### Entire published user pipeline (ordered)

All rows below cite `abuse-enforcement-service/service-lib/rules/enforcement_user.yaml`. `has(x)` means exact membership in `score.labels`; `prefix(x)` means `score.model_version.startsWith(x)`. `SHR30` = add `SpamHighRecall`, TTL **2,592,000,000 ms = 30 days**; `suspendPM` = `act_suspend_user`, `perm:false`, `policy:PlatformManipulation`.

| Order / rule ID(s) | Exact predicate | Outcome | Citation |
|---|---|---|---|
| 1 `user_in_allowlist` | user_allowlist.is_allowlisted | skip | `abuse-enforcement-service/service-lib/rules/enforcement_user.yaml:6-10` |
| 2 `user_not_found` | !user.present | skip | `abuse-enforcement-service/service-lib/rules/enforcement_user.yaml:12-16` |
| 3 `very_high_follower_count` | cred.follower_count >= **12.34 (mock)** | skip | `abuse-enforcement-service/service-lib/rules/enforcement_user.yaml:18-23` |
| 4 `high_follower_count` | same **mock** predicate | skip (shadowed by prior identical predicate) | `abuse-enforcement-service/service-lib/rules/enforcement_user.yaml:25-30` |
| 5 `pagerank_skipped` | cred.is_high OR cred.score>=50.0 | skip | `abuse-enforcement-service/service-lib/rules/enforcement_user.yaml:32-38` |
| 6 `anchor_campaign_suspend` | has(anchor_campaign_suspend) | suspendPM | `abuse-enforcement-service/service-lib/rules/enforcement_user.yaml:41-43` |
| 7 `anchor_campaign_user` | has(anchor_campaign_user) | add SpamHighRecall, no explicit TTL | `abuse-enforcement-service/service-lib/rules/enforcement_user.yaml:44-46` |
| 8 `anchor_campaign_suspend_cse` | has(anchor_campaign_suspend_cse) | suspend, perm:true, Cse | `abuse-enforcement-service/service-lib/rules/enforcement_user.yaml:48-50` |
| 9 `panda_reports_embedding_v10_rough_spam` | has(same string) | suspendPM | `abuse-enforcement-service/service-lib/rules/enforcement_user.yaml:52-54` |
| 10 `already_spam_high_recall_labeled_llm_slop` | has(llm_slop_user) AND existing SpamHighRecall | skip | `abuse-enforcement-service/service-lib/rules/enforcement_user.yaml:58-62` |
| 11 `act_add_llm_slop_label` | has(llm_slop_user) | SHR30 | `abuse-enforcement-service/service-lib/rules/enforcement_user.yaml:64-69` |
| 12 `already_spam_high_recall_labeled_majority_poster` | has(SpamEmbeddingMajorityPoster) AND existing SpamHighRecall | skip | `abuse-enforcement-service/service-lib/rules/enforcement_user.yaml:71-75` |
| 13 `act_add_majority_poster_label` | has(SpamEmbeddingMajorityPoster) | SHR30 | `abuse-enforcement-service/service-lib/rules/enforcement_user.yaml:77-82` |
| 14 `act_spam_liveness_check` | has(spam_liveness_check_required) | spam liveness | `abuse-enforcement-service/service-lib/rules/enforcement_user.yaml:85-88` |
| 15 `already_suspended` | user.suspended | skip | `abuse-enforcement-service/service-lib/rules/enforcement_user.yaml:90-94` |
| 16 `already_deactivated` | user.deactivated | skip | `abuse-enforcement-service/service-lib/rules/enforcement_user.yaml:96-100` |
| 17 `act_cusp_arkose` | has(enforcement_cusp_arkose) AND !has(enforcement_threshold_reached) | Arkose | `abuse-enforcement-service/service-lib/rules/enforcement_user.yaml:102-107` |
| 18 `act_cusp_captcha` | has(enforcement_cusp_captcha) AND !has(enforcement_threshold_reached) | Captcha | `abuse-enforcement-service/service-lib/rules/enforcement_user.yaml:109-114` |
| 19 `act_cusp_liveness` | has(enforcement_cusp_liveness) AND !has(enforcement_threshold_reached) | spam liveness | `abuse-enforcement-service/service-lib/rules/enforcement_user.yaml:116-121` |
| 20 `act_inauthentic_detection_v45_suspend` | prefix(inauthentic_detection_v45) AND has(inauthentic_detection_v45_suspend) | suspendPM | `abuse-enforcement-service/service-lib/rules/enforcement_user.yaml:123-128` |
| 21 `act_inauthentic_detection_v45_label_and_captcha` | prefix(v45 full prefix above), has(inauthentic_detection_v45_label_shr) AND has(inauthentic_detection_v45_bounce_captcha) | act_all: SHR30 + Captcha | `abuse-enforcement-service/service-lib/rules/enforcement_user.yaml:130-141` |
| 22 `act_inauthentic_detection_v45_label_and_arkose` | same prefix, has(inauthentic_detection_v45_label_shr) AND has(inauthentic_detection_v45_bounce_arkose) | act_all: SHR30 + Arkose | `abuse-enforcement-service/service-lib/rules/enforcement_user.yaml:143-154` |
| 23 `act_inauthentic_detection_v45_label` | same prefix AND has(inauthentic_detection_v45_label_shr) | SHR30 | `abuse-enforcement-service/service-lib/rules/enforcement_user.yaml:156-161` |
| 24 `act_inauthentic_detection_v45_bounce_captcha` | same prefix AND has(inauthentic_detection_v45_bounce_captcha) | Captcha | `abuse-enforcement-service/service-lib/rules/enforcement_user.yaml:163-166` |
| 25 `act_inauthentic_detection_v45_bounce_arkose` | same prefix AND has(inauthentic_detection_v45_bounce_arkose) | Arkose | `abuse-enforcement-service/service-lib/rules/enforcement_user.yaml:168-171` |
| 26 `act_cluster_spam_extended_suspend` | prefix(cluster_spam_extended) AND has(cluster_spam_extended_suspend) | suspendPM | `abuse-enforcement-service/service-lib/rules/enforcement_user.yaml:173-178` |
| 27 `act_cluster_spam_extended_bounce` | same prefix AND has(cluster_spam_extended_bounce) | Arkose | `abuse-enforcement-service/service-lib/rules/enforcement_user.yaml:180-183` |
| 28 `act_cluster_spam_extended_label` | same prefix AND has(cluster_spam_extended_label_shr) | SHR30 | `abuse-enforcement-service/service-lib/rules/enforcement_user.yaml:185-190` |
| 29 `hold_cluster_spam` | prefix(cluster_spam) | skip cluster_spam_held | `abuse-enforcement-service/service-lib/rules/enforcement_user.yaml:192-196` |
| 30–32 `act_cluster_spam_suspend/bounce/label` | prefix(cluster_spam) AND corresponding cluster_spam_suspend / cluster_spam_bounce / cluster_spam_label_shr | Declared suspendPM / Arkose / SHR30; **unreachable under preceding hold** | `abuse-enforcement-service/service-lib/rules/enforcement_user.yaml:198-215` |
| 33 `platform_row_without_requested_actions` | has(abuse_platform_requested_actions) AND size(requested_actions)==0 | skip | `abuse-enforcement-service/service-lib/rules/enforcement_user.yaml:217-221` |
| 34 `act_requested_actions` | size(requested_actions)>0 | allowlisted requested-action expansion | `abuse-enforcement-service/service-lib/rules/enforcement_user.yaml:223-226` |
| 35 `act_suspend` | true | suspendPM | `abuse-enforcement-service/service-lib/rules/enforcement_user.yaml:228-233` |

Both follower floors are explicitly redacted mock values. Account-state skips occur **after** several label/suspension branches; do not move them to the beginning in a paraphrase. The cluster hold also catches unmatched `cluster_spam_extended*` rows, since that string starts with `cluster_spam`.

### Entire published post pipeline (ordered)

All citations: `abuse-enforcement-service/service-lib/rules/enforcement_post.yaml`.

| Order / rule ID | Predicate | Action | Citation |
|---|---|---|---|
| 1 post_in_allowlist | post_allowlist.is_allowlisted | skip | `abuse-enforcement-service/service-lib/rules/enforcement_post.yaml:6-10` |
| 2 user_in_allowlist | user_allowlist.is_allowlisted | skip | `abuse-enforcement-service/service-lib/rules/enforcement_post.yaml:12-16` |
| 3 user_not_found | !user.present | skip | `abuse-enforcement-service/service-lib/rules/enforcement_post.yaml:18-22` |
| 4 high_follower_count | cred.follower_count>=**12.34 mock** AND !score.skip_author_credibility_prechecks | skip | `abuse-enforcement-service/service-lib/rules/enforcement_post.yaml:24-29` |
| 5 pagerank_skipped | (cred.is_high OR cred.score>=50.0) AND !score.skip_author_credibility_prechecks | skip | `abuse-enforcement-service/service-lib/rules/enforcement_post.yaml:31-37` |
| 6 act_add_llm_slop_post_label | has(llm_slop_post) | RiskyHighVizReply, 30d | `abuse-enforcement-service/service-lib/rules/enforcement_post.yaml:39-44` |
| 7 act_add_gibberish_post_label | has(gibberish_post) | SpamHighRecall, 30d | `abuse-enforcement-service/service-lib/rules/enforcement_post.yaml:46-51` |
| 8 act_add_fast_reply_spam_post_label | has(fast_reply_spam_post) | SpamHighRecall, 30d | `abuse-enforcement-service/service-lib/rules/enforcement_post.yaml:53-58` |
| 9 anchor_campaign_post | has(anchor_campaign_post) | SpamHighRecall, no explicit TTL | `abuse-enforcement-service/service-lib/rules/enforcement_post.yaml:60-62` |
| 10 act_add_spam_embedding_ptos_distilled_label | has(SpamEmbeddingPtosDistilled) | SpamHighRecall, no explicit TTL | `abuse-enforcement-service/service-lib/rules/enforcement_post.yaml:65-69` |
| 11 act_suspend_ncmec_reported_content_author | has(cse_reports_embedding_v2) | suspend author, perm:true, Cse | `abuse-enforcement-service/service-lib/rules/enforcement_post.yaml:71-76` |
| 12 act_requested_actions | size(requested_actions)>0 | allowlisted expansion | `abuse-enforcement-service/service-lib/rules/enforcement_post.yaml:78-81` |
| 13 post_no_actionable_label | true | skip | `abuse-enforcement-service/service-lib/rules/enforcement_post.yaml:83-87` |

Post credibility bypass does not bypass test-ID, allowlist, or missing-author checks. Requested actions do not bypass the preceding ordered YAML decisions (`abuse-enforcement-service/service-lib/src/lib.rs:402-410`). `resolve_requested_actions` accepts user kinds **suspend, label, bounce_captcha, bounce_arkose, spam_liveness_check**, and post kinds **post_label, suspend_author**; requires entity-specific dynamic kind allowlisting, allowlisted suspension policy or every requested label; empty label list and negative TTL rejected; TTL 0 means no explicit expiration; positive TTL passed through. Only first **16** requests considered; duplicate resolved ActionSpecs skipped; overflow counted as too_many_actions. Sources: `abuse-enforcement-service/service-lib/src/generic_actions.rs:9-19,80-218`; dynamic allowlists `abuse-enforcement-service/service-lib/src/growthbook.rs:250-270`.

## 6. Cross-component provenance and limits

* UserCred snapshot → `GetUserCredV2` returns score/mass/timestamp (`scarecrow/legacy/StratoRegistry.scala:120-134`) → high-PageRank helper → exceptions in Agatha, duplicate-text, URL, Grox and NSFW rules. Reputation here protects against selected automated actions; it is not evidence of a direct ranking reward.
* Blocks/reports/favorites → Agatha rate labels → association model → Blink calibrated scores → named HSS score reads → `AGATHA_SPAM` tweet label / `AGATHA_SPAM_TOP_USER` account label. Original adverse counts and calibrated score threshold are separate layers.
* NSFW media health-side-effect events → per-user HLL aggregation → NSFW account labels → Agatha NSFW training positives (precision/avatar/banner labels) and visibility consumers. This is a feedback/provenance relationship, not a guarantee every NSFW event labels the account; helper exemptions/fatigue apply.
* Behavioral action sequence → independent head probabilities → sink eligibility + challenge/suspend labels → dynamic topic admission → ordered enforcement + AIS. Neither a raw bot head above 0.5 nor a redacted policy value proves an enforcement action occurred.
* `llm_slop_user/post`, `SpamEmbeddingMajorityPoster`, distilled/cluster/anchor/panda labels and generic requested actions enter as upstream strings in this service; their generation is not established by the four account-model directories. Do not attribute them to BDSM without a producer path.

### Explicit gaps / nonclaims

1. Some Botmaker rules are unpublished (`README.md:313,425`); the 20-rule inventory is exhaustive **only for this snapshot's published files**.
2. BDSM operating points, minimum-action gate, appeal prose/key-action templates, learned artifacts and internal backing services are not recoverable from the export (`bdsm/README.md:74-126`). Head taxonomy does not reveal learned weights or feature importance.
3. Enforcement follower floors are mocked; live GrowthBook YAML/topic routing/action allowlists, deployed CLI flags, and external high-PageRank Strato code are not bundled as a full deployment.
4. Agatha has an explicitly omitted production user population, imported percentile calibration and HSS serving dependencies; daily output layout does not itself prove scheduler frequency. No fresh score is guaranteed on every request.
5. UserCred's engagement destination validity mismatch is faithfully documented; no hidden normalization/join is assumed. Failed snapshot quarantine is not an account enforcement action.
6. Upstream labels/credibility exemptions and downstream request ranking are different systems. Use downstream visibility source to establish exactly which product surfaces hide, interstitial, filter, or deboost each label.
