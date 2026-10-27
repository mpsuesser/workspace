# Features, context, hydration, and missing values

Audited snapshot: `3aa0fa336c4a20e4149b6151629b6050897bb8a5`. Citations are repository-relative `path:line-range` and symbols; resolve them under this skill's `source/`. For registration order, all filters, retrieval wrappers, feed assembly and histories/cache writes, see [pipeline-and-filters.md](pipeline-and-filters.md).

**A field's existence is not evidence that a model consumes it.** Distinguish (1) declared storage, (2) hydrated value, (3) serialized outbound request, (4) observed model implementation. This reference proves the first three where code is present; it does not infer learned importance or causal reach effects from a field name.

## 1. Identity and absence conventions

`PostCandidate` derives Default: ordinary numbers start0, text/vector/map fields empty, booleans false, Options None. Hydration can create `Some(false)` or `Some(0)`, which is different from None. `ScoredPostsQuery` has both derived Default and a constructor that additionally sets request time, decider and request values. Transport conversion can later replace absence with0/false/MediumRisk. `home-mixer/models/candidate.rs:11-102` (`PostCandidate`); `home-mixer/models/query.rs:43-127,131-235` (`ScoredPostsQuery::new`); `home-mixer/scored_posts_server.rs:77-124` (`post_candidate_to_scored_post`).

Important identity helpers:

- `get_original_tweet_id`: retweeted ID if present, otherwise candidate ID.
- `get_original_author_id`: retweeted user if present, otherwise candidate author.
- These use Option presence, not a positive-ID check. A malformed `Some(0)` is not treated as None by these helpers.
- `related_post_ids_iter` used by seen/served filters: candidate ID + retweeted ID + **direct reply-to ID**, not all ancestors or quote.
- `get_screen_names` maps focal author and available repost-author screen names; it is not a general all-ancillary-user lookup.
- `semantic_id_prefix(levels)` exists only when `levels>0` and enough codes exist.

Evidence: `home-mixer/models/candidate.rs:227-263` (`CandidateHelpers`); `home-mixer/util/candidates_util.rs:6-17` (related-ID helpers).

## 2. Complete query-field inventory

The inventory below accounts for every field in `ScoredPostsQuery`; grouping is explanatory, not a claim that each group is sent to Phoenix. Exact types and serde exclusions: `home-mixer/models/query.rs:43-127`.

| Fields | Meaning/provenance |
|---|---|
| `user_id`, `client_app_id`, `country_code`, `language_code` | Viewer/request identity. Country/language are request context, not candidate author geography. |
| `seen_ids`, `served_ids`, `bloom_filter_entries`, `impressed_post_ids` | Four distinct exclusion-history representations. Bloom entries contain bit words, size cap, false-positive rate. Seen is request-supplied; outer served-history hydration can replace served IDs; impressed backup hydration exists but is unregistered in Phoenix. |
| `in_network_only`, `request_type`, `is_bottom_request`, `is_top_request` | Surface/retrieval/pagination decisions. RequestType variants ForYou, RankedFollowing, Following, ScoredPosts, PhoenixScores. |
| `scoring_sequence`, `columnar_scoring_sequence`, `retrieval_sequence`, `columnar_retrieval_sequence` | Separate UAAS ranking/retrieval histories and optional Arrow bytes; omitted from debug serde. |
| `user_features` | Viewer muted keywords, blocked/muted/followed/subscribed IDs, optional **viewer** follower count. Full nested inventory below. |
| `user_roles`, `params`, `decider`, `fs_recipient_inputs` | Experiment/gate and feature-switch targeting context; decider/recipient inputs omitted from serde. |
| `request_id`, `prediction_id`, `request_time_ms` | Request tracing, prediction correlation, time. Request ID and prediction ID are separate. |
| `cached_posts`, `has_cached_posts`, `return_backbone_scores` | Candidate-cache payload/activation and endpoint output request. Nonempty cache payload does not imply activation; threshold is500. |
| `topic_ids`, `excluded_topic_ids`, `exclude_videos` | Explicit request controls, not inferred user interests. Topic request is nonempty IDs; bulk means vector length>6. |
| `in_network_replies` | Shared once-cell written by ThunderSource, containing reply author + parent ID; later facepile source. |
| `viewer_minhash` | Optional viewer relationship-set sketch, used for selected-candidate Jaccard metadata. |
| `ip_address`, `user_agent`, `time_zone`, `device_network_type`, `client_version` | Client/device/network context; raw IP and location are distinct fields. |
| `device_id`, `mobile_device_id`, `mobile_device_ad_id`, `dsp_client_context` | Device/ad request context; DSP context skipped in serde. Not all are in Phoenix client context. |
| `user_demographics`, `ip_location`, `user_age_in_years`, `resurrection_time_ms` | Hydrated demographics/geolocation plus age and resurrection boundary data. Account age inferred from user ID is a different quantity from age in years. |
| `user_inferred_gender`, `user_inferred_gender_score` | Store/prediction output, separate from demographics gender. |
| `followed_grok_topics`, `followed_starter_packs`, `user_installed_apps` | Optional multihot context: topics `[bool;32]`, packs `[bool;20]`, apps vector. |
| `explicit_engagement_signals`, `implicit_engagement_signals` | Per-action post histories for auxiliary retrieval. Not interchangeable with the UAAS sequence. |
| `subscription_level` | Viewer's subscription level from viewer data; distinct from per-author subscribed IDs and post subscription eligibility. |
| `is_shadow_traffic`, `is_preview`, `is_polling` | Execution/logging/ad/source gates. Shadow traffic can force selected context/count hydrators on. |
| `cursor`, `request_context`, `served_history`, `non_polling_timestamps` | Cursor and prior feed delivery/request context; served history skipped in debug serde. |
| `who_to_follow_eligible`, `feed_survey_eligible` | Module fatigue results from served-history hydration; constructor defaults false. |
| `push_to_home_post_id`, `seed_candidate_post_ids` | Separate auxiliary/explicit-seed entry points. |
| `following_pagination_meta` | Shared OnceLock with `response_truncated` + optional `bottom_tweet_id`; supplied by ReverseChronPostsSource for Following URT. |

`UserFeatures` fields are exactly `muted_keywords`, `blocked_user_ids`, `muted_user_ids`, `followed_user_ids`, `subscribed_user_ids`, `follower_count`. Missing Thrift fields decode to empty lists/None; these names must not be confused with author features. `home-mixer/models/user_features.rs:5-74` (`UserFeatures`, `from_thrift`). `ImpressionBloomFilterEntry`, `RequestType`, `FollowingPaginationMeta`: `home-mixer/models/query.rs:20-41`. Shared in-network replies: `home-mixer/models/in_network_reply.rs:1-23`.

### Boundary construction

QueryBuilder rejects user0, concurrently fetches viewer/resurrection with200ms timeouts, falls back to default viewer/None, gathers viewer roles/muted keywords/follower count/subscription/age and feature-switch recipient data, then applies explicit overrides. Recommendation opt-out forces in-network-only. `home-mixer/server.rs:74-225` (`QueryBuilder`). Recipient shape is `home-mixer/models/fs_recipient.rs:1-55` (`FsRecipientInputs`).

`GetTwitterContextViewer` serializes viewer ID, app ID, request country/language with other context defaults. It is a smaller object than the entire query. `home-mixer/models/query.rs:251-260`. Client country enum conversion, IP location, model UserContext and ads client context follow separate paths; a single "geography feature" description would erase those differences.

## 3. Every query hydrator

Unless a row states a local fallback, an error returned by a query hydrator leaves existing query fields intact. On a newly built query that often means empty/None. The hydrators run concurrently against the original stage query, and their `update` methods assign only owned fields. `candidate-pipeline/candidate_pipeline.rs:222-266` (query hydration); `candidate-pipeline/query_hydrator.rs:8-37` (`QueryHydrator`).

| Hydrator | Gate, request, update, and missing behavior | Evidence |
|---|---|---|
| `ScoringSequenceQueryHydrator` | EnableScoringSequenceHydration. UAAS ranking model type, configured cluster/aggregation/source-data type, Arrow response, five-minute window, max sequence length; production non-PhoenixScores requests include prediction ID. Writes scoring sequence + optional bytes. Unknown enum text falls back to Arrow / DenseWithFavVqvCleaned. | `home-mixer/query_hydrators/scoring_sequence_query_hydrator.rs:31-73` |
| `RetrievalSequenceQueryHydrator` | EnableRetrievalSequenceHydration. Separate UAAS Retrieval model type and aggregation/max-length controls, same window/Arrow output, request ID None. Writes retrieval sequence + bytes. | `home-mixer/query_hydrators/retrieval_sequence_query_hydrator.rs:30-73` |
| `BlockedUserIdsQueryHydrator` | SocialGraph blocked IDs for viewer; assigns only nested blocked list. | `home-mixer/query_hydrators/blocked_user_ids_query_hydrator.rs:10-33` |
| `MutedUserIdsQueryHydrator` | SocialGraph muted IDs for viewer; assigns nested muted list. | `home-mixer/query_hydrators/muted_user_ids_query_hydrator.rs:10-33` |
| `FollowedUserIdsQueryHydrator` | Only if existing followed list empty; SocialGraph followed IDs; writes nested followed list. Following outer hydration can supply this before the inner pipeline. | `home-mixer/query_hydrators/followed_user_ids_query_hydrator.rs:12-37` |
| `SubscribedUserIdsQueryHydrator` | SocialGraph subscribed-to author IDs; writes nested subscribed list. | `home-mixer/query_hydrators/subscribed_user_ids_query_hydrator.rs:10-33` |
| `CachedPostsQueryHydrator` | EnableCachedPosts. Redis key viewer/topics/in-network/exclude-videos;300ms GET; zstd JSON decode; empty bytes default; activate at≥500 candidates. Writes payload and bool. Error does not activate cache. | `home-mixer/query_hydrators/cached_posts_query_hydrator.rs:11-81` |
| `MutualFollowQueryHydrator` | EnableMutualFollowJaccardHydration. Strato viewer minhash fetch; writes optional sketch. This does not populate the exact mutual-follow boolean. | `home-mixer/query_hydrators/mutual_follow_query_hydrator.rs:12-37` |
| `UserDemographicsQueryHydrator` | EnableContextFeatures **or shadow traffic**. Fetch viewer demographics; writes optional demographics. | `home-mixer/query_hydrators/user_demographics_query_hydrator.rs:12-30` |
| `FollowedGrokTopicsQueryHydrator` | EnableContextFeatures or shadow.300ms store fetch; writes optional32-position topic multihot. Absent store value remains None. | `home-mixer/query_hydrators/followed_grok_topics_query_hydrator.rs:11-44` |
| `FollowedStarterPacksQueryHydrator` | EnableContextFeatures or shadow.300ms store fetch; writes optional20-position pack multihot. | `home-mixer/query_hydrators/followed_starter_packs_query_hydrator.rs:11-44` |
| `UserInstalledAppsQueryHydrator` | EnableUserInstalledAppsHydration or shadow.300ms store fetch of slugs; maps existing result to multihot using `NUM_INSTALLED_APPS` or `NUM_INSTALLED_APPS_128` according to EnableUserInstalledAppsV2; missing slugs stays None. The imported vocabulary/constant definitions are not present in the released wrapper tree. | `home-mixer/query_hydrators/user_installed_apps_query_hydrator.rs:8-49` |
| `ExplicitEngagementSignalsQueryHydrator` | EnableExplicitEngagementSignals.300ms fetch; constructs Favorite, Retweet, Reply, Bookmark, Share, OriginalTweet histories, newest-first/deduplicated/truncated per type. | `home-mixer/query_hydrators/explicit_engagement_signals_query_hydrator.rs:16-112` |
| `ImplicitEngagementSignalsQueryHydrator` | EnableImplicitEngagementSignals.300ms fetch; PhotoExpand, VideoQualityView, ImmersiveVideoQualityView. Video entries must be nonpromoted and duration≥10 seconds. Per-type recency/dedup/cap. | `home-mixer/query_hydrators/implicit_engagement_signals_query_hydrator.rs:19-137` |
| `ImpressionBloomFilterQueryHydrator` | Only when query Bloom entries empty. Fetch HOME_TIMELINE surface; absent record/entries becomes empty. Preserves supplied size-cap/false-positive-rate/bit words; does not reconstruct exact seen IDs. | `home-mixer/query_hydrators/impression_bloom_filter_query_hydrator.rs:14-53` |
| `IpQueryHydrator` | EnableIpFeature **and nonempty raw IP**. Fetches location; writes optional `ip_location`. | `home-mixer/query_hydrators/ip_query_hydrator.rs:12-30` |
| `UserInferredGenderQueryHydrator` | EnableInferredGenderHydration or shadow.300ms store lookup. Only a successful **miss** for account `days_since_creation==0` falls back to gRPC prediction. Store error/timeout does not invoke fallback. Invalid gender enum becomes None; score retained if available. | `home-mixer/query_hydrators/user_inferred_gender_query_hydrator.rs:12-65` |
| `ServedHistoryQueryHydrator` | EnableUrtMigrationComponents. Fetch viewer+timeline+platform history; replace served IDs; compute WTF/survey fatigue eligibility and retain full history. Recent-ID helper takes first configured count of flattened tweet/source IDs inside time window; absent module history means eligible. | `home-mixer/query_hydrators/served_history_query_hydrator.rs:25-118` |
| `PastRequestTimestampsQueryHydrator` | EnableUrtMigrationComponents. Fetch optional nonpolling timestamps; assign. | `home-mixer/query_hydrators/past_request_timestamps_query_hydrator.rs:18-35` |
| `ImpressedPostsQueryHydrator` (unregistered in Phoenix) | Fetch impressed post IDs and assign; class exists, but constructor stores it in an unused local instead of query hydrator list. Do not present it as an active backup fetch. | `home-mixer/query_hydrators/impressed_posts_query_hydrator.rs:1-26`; `home-mixer/candidate_pipeline/phoenix_candidate_pipeline.rs:285-287` |

Relevant snapshot defaults (`home-mixer/params/param.rs`):

- UAAS cluster Fou (`home-mixer/params/param.rs:145-150`), both aggregation types DENSE_WITH_LONG_DWELL (`home-mixer/params/param.rs:151-162`), source data NEW_UUA_ARROW and xDS true, scoring/retrieval max1024 (`home-mixer/params/param.rs:885-903`), both hydration flags true (`home-mixer/params/param.rs:741-753`). Window300000ms is a hard request parameter, **not a proof that only five minutes of user history can influence the model**; UAAS aggregation semantics are external. `home-mixer/params/config.rs:34-34` (`UAS_WINDOW_TIME_MS`).
- Context and IP true, explicit/implicit signals true, per-type cap15 (`home-mixer/params/param.rs:681-712`). Installed-app hydration true, V2 false, inferred gender true (`home-mixer/params/param.rs:720-739`). Mutual-follow Jaccard hydration false (`home-mixer/params/param.rs:755-760`). URT migration true (`home-mixer/params/param.rs:984-989`). These ranges are `param!` declarations.
- Shared engagement model: each `EngagementSignal` has tweet ID, optional author ID, engaged-at-ms; per-type lists are sorted descending time, deduped by tweet ID, then truncated. Different action types may retain the same tweet. `home-mixer/models/engagement_signals.rs:4-50` (`EngagementSignalType`, `sort_dedup_truncate`).

## 4. Complete candidate-field inventory

Every field in `PostCandidate` is listed below. Except for explicit derived defaults, optional data should be treated as unknown until provenance is known. Source wrappers may initialize a subset before hydration. `home-mixer/models/candidate.rs:11-102` is the authoritative field/type list.

| Fields | Scope and principal writer/consumer |
|---|---|
| `tweet_id`, `author_id`, `tweet_text` | Candidate/wrapper identity; sources + CoreData. For reposts, text can be replaced with original text while candidate author remains wrapper author. |
| `in_reply_to_tweet_id`, `retweeted_tweet_id`, `retweeted_user_id`, `quoted_tweet_id`, `quoted_user_id` | Post structure; source/CoreData/Quote. Optional original IDs determine other hydration keys. |
| `phoenix_scores`, `prediction_request_id`, `last_scored_at_ms`, `weighted_score`, `score` | Prediction and ranking output/correlation; not raw counts. PhoenixScores type is imported/re-exported from a dependency. |
| `author_policy_zeroed`, `cold_start_lift_to_rank` | Ranking-policy state carried on candidate. Default false/None; policy details belong to scorer audit. |
| `slate_context`, `served_slate_context`, `reranker_head_tag`, `backbone_scores` | Reranking/slate/model-output metadata. Presence is not proof all heads ran; request controls backbone output. |
| `served_type`, `retrieval_sources` | Primary route plus accumulated retrieval provenance. Dedup appends provenance without merging all candidate fields. |
| `in_network` | Viewer-to-candidate-author relationship; optional, not identical to whether original repost author is followed. |
| `ancestors`, `tombstone_ancestor_ids`, `ancestor_users`, `ancestor_texts` | Source conversation structure, CoreData ancestor authors, Following gap metadata/text. They are distinct collections, not a guaranteed complete aligned ancestry graph. |
| `quoted_tweet_text` | Quote content for derived content features/Following mute matching. |
| `min_video_duration_ms`, `max_video_duration_ms`, `has_photo`, `has_video`, `media_count`, `has_media` | Original-post media metadata; min and max duration have distinct consumers. |
| `quoted_video_duration_ms`, `quoted_has_media`, `quoted_has_photo`, `quoted_has_video`, `quoted_media_count`, `quoted_max_video_duration_ms` | Quote content metadata. Separate quoted minimum-duration lookup is feature-gated; quoted content/media lookup still exists when that gate is off. |
| `author_followers_count`, `author_screen_name`, `retweeted_screen_name` | Gizmoduck candidate-author count and focal/repost handles. Viewer follower count lives elsewhere. |
| `visibility_action`, `visibility_reason`, `drop_ancillary_posts` | Selected-candidate VF outputs used by postfilters; missing action is distinct from explicit NotEvaluated. |
| `subscription_author_id` | Subscription-only post eligibility owner, checked against viewer subscribed author IDs. |
| `tweet_type_metrics` | Binary metrics bitmap, produced after ranking; not itself a Phoenix input in the shown request builder. |
| `author_blocks_viewer`, `quoted_author_blocks_viewer` | Directional safety relationships; BlockedBy/Quote/FollowingBlockedBy. |
| `filtered_topic_ids`, `unfiltered_topic_ids` | Topic metadata variants; fields can contain Unfiltered-mode results despite the first field's name. |
| `following_replied_user_ids` | Selected-root facepile from Thunder reply metadata, not a fetched global reply-count feature. |
| `broadcast_is_live` | Dormant BroadcastLiveness hydrator target; existence is not active hydration. |
| `language_code` | TES original-post language metadata. |
| `fav_count`, `reply_count`, `repost_count`, `quote_count`, `view_count`, `view_count_on_home`, `bookmark_count` | Observed aggregate counts; original-post keyed. These are not predicted action probabilities. |
| `mutual_follow_jaccard`, `is_mutual_follow_author`, `author_follows_viewer` | Three different relationship concepts: minhash similarity, exact reciprocal relationship, and author→viewer follow. |
| `brand_safety_verdict`, `nsfw_author`, `nsfw_author_ads`, `nsfw_author_phoenix`, `safety_labels` | Separate safety/adjacency features with different label unions and consumers. Do not collapse them into one "shadowban" flag. |
| `semantic_ids` | SID-server codes keyed by original post+endpoint; used as structural metadata and serialized in TweetInfo. |
| `topic_feedback_topic`, `topic_feedback_topic_id`, `grok_topics`, `ai_trend_name`, `ai_trend_id` | Selected-candidate feedback UI context from Strato; not evidence of pre-ranking model consumption. |

Nested inventories:

- `RetrievalSource`: `served_type`, optional `cluster`, optional `score`, optional one-based `position`. `home-mixer/models/candidate.rs:104-124`.
- `SlateContext`: `k`, `pool_rank`, `pool_rank_gap`, `fatigue`, `pre_diversity_score`, `sid_known`, `sid_k_l1`, `sid_k_l2`, `sid_k_l3`, `sid_gap_l1`, `sid_gap_l2`, `sid_gap_l3`, `recon_cos_milli`, `recon_count_above`, `recon_gap_above`, `exact_k`, `exact_gap`. Proto conversion explicitly maps the l1/l2/l3 names to k1/k2/k3 and gap1/gap2/gap3. `home-mixer/models/candidate.rs:127-175`.
- `SafetyLabelInfo`: label enum, optional description, optional source category; serde uses label enum codec. `home-mixer/models/candidate.rs:178-184`.
- `FilteredTopicsByExperiment`: optional unfiltered, curated-v0, curated-v0-v1, post-based90/75/50-percent lists; missing fields remain None. `TopicFilteringExperiment` unknown name→Unfiltered, proto mode0..5. `home-mixer/models/candidate_features.rs:52-140`.
- `BlockedByUserIds` is a decode-only Strato/Thrift compatibility shape containing an ID vector; its presence does not establish that the current SocialGraph hydration reads it. `home-mixer/models/candidate_features.rs:11-49`.

## 5. Every candidate hydrator: inputs, outputs, and fallbacks

### Shared mechanics

Each same-stage hydrator sees the **original** candidates, not updates from earlier-listed hydrators. Hence author relationships and original-post keyed media/count/SID lookups can use source-supplied IDs before CoreData fills them. CoreData being registered earlier is not a dependency barrier. Simclusters is an important exception: it hydrates CoreData **inside its source** before returning candidates. `candidate-pipeline/candidate_pipeline.rs:283-330`; `home-mixer/sources/simclusters_source.rs:124-142`.

The generic cached-hydrator adapter filters `already_hydrated` candidates, looks up each remaining candidate's cache key, hydrates misses, caches successes, reconstructs candidate-aligned output and applies updates. **It does not deduplicate repeated uncached keys:** every miss is appended to the concrete hydrator's candidate/key vectors. Individual hydrators may deduplicate backend requests, as EngagementCounts does (`home-mixer/candidate_hydrators/engagement_counts_hydrator.rs:126-132`). Successful empty values may be cached; returned errors are not equivalent to successful misses. The result-length check protects the outer update, not every indexing operation inside a concrete hydrator. `candidate-pipeline/hydrator.rs:33-66,79-214` (`Hydrator`, `CachedHydrator`).

### Preselection hydration

| Hydrator | Gate/key and behavior | Evidence |
|---|---|---|
| `InNetworkCandidateHydrator` | No candidate-cache hit. Tests candidate `author_id` in viewer followed set or equals viewer; writes Some(bool). It is not inferred from served-type name and does not switch to repost original author. | `home-mixer/candidate_hydrators/in_network_candidate_hydrator.rs:9-44` |
| `BidirectionalFollowHydrator` | EnableBidirectionalFollowHydration and no cache hit. Check author→viewer follow for all authors when EnableAllAuthorFollowHydration, otherwise only authors the viewer follows. Sets exact mutual bool as returned reverse-follow AND viewer follows; `author_follows_viewer` is Some only in all-author mode. Whole fetch error returns error for every candidate. | `home-mixer/candidate_hydrators/bidirectional_follow_hydrator.rs:15-72` |
| `CoreDataCandidateHydrator` | No cache hit; already-hydrated iff author nonzero AND nonempty text. Cached by post identity. Fetches focal CoreData and second ancestor when there are exactly2 ancestors, then repost source CoreData for original text. Uses source text if fetched, otherwise wrapper text. Missing focal yields successful default; explicit error returns per-candidate error. Only fills author when old author0, but replaces repost/reply IDs, ancestor users and text. Thus a source nonzero author may survive missing CoreData and CoreDataHydrationFilter. | `home-mixer/candidate_hydrators/core_data_candidate_hydrator.rs:26-180` |
| `QuoteHydrator` | No cache hit. TES quote-ID/user lookup keyed by candidate tweet ID, cached including None on missing/error result. Then concurrent quoted-author block lookup, optional minimum-video-duration lookup, quoted content fetch. Block errors become empty set, hence false. Quoted content cache accepts only entries with both text and media resolved; successful absent text/media become empty/default; error/timeout leaves missing portions. Updates all quote fields. | `home-mixer/candidate_hydrators/quote_hydrator.rs:18-130,153-305` |
| `MediaInfoHydrator` | No cache hit; original-post key. MediaInfoCache supplies booleans/count and duration list; count clamped0..i32::MAX, min/max duration cast to i32. Missing/absent result becomes explicit false booleans, count0, no durations; explicit per-ID error preserves old fields. | `home-mixer/candidate_hydrators/media_info_hydrator.rs:21-149` |
| `SubscriptionHydrator` | No cache hit; TES subscription metadata; writes optional subscription author. Missing means None, which the subscription filter keeps. | `home-mixer/candidate_hydrators/subscription_hydrator.rs:18-81` |
| `GizmoduckCandidateHydrator` | No cache hit; cache key focal author + optional repost author. Fetches both user records. Focal profile/count yields author follower count/handle and safety flags; repost profile yields repost handle. Either explicit lookup error fails that candidate update; absent records yield None. Focal author's safety is not silently replaced with repost author's safety. | `home-mixer/candidate_hydrators/gizmoduck_hydrator.rs:23-193` |
| `BlockedByHydrator` | No cache hit. SocialGraph `check_blocked_by(viewer, candidate author IDs)`, then Some(bool) for each; request failure returns error per candidate. | `home-mixer/candidate_hydrators/blocked_by_hydrator.rs:19-56` |
| `FilteredTopicsHydrator` | Topic request or exclusions, including cache-hit queries. Bulk **or any exclusions** forces Unfiltered experiment; otherwise resolves default/overrides. Fetches candidate IDs plus repost original IDs; reposts use original metadata. Fetch/decode/absent errors become `(None,None)` and successful default candidate updates. `need_unfiltered` only when chosen mode is not Unfiltered. | `home-mixer/candidate_hydrators/filtered_topics_hydrator.rs:14-131` |
| `LanguageCodeHydrator` | No cache hit; original-post key; TES language-code metadata; optional value, errors via per-item channel. | `home-mixer/candidate_hydrators/language_code_hydrator.rs:19-83` |
| `EngagementCountsHydrator` | EnableEngagementCountsHydration or shadow; original-post key;1,000,000-entry cache,60s TTL. Fetch miss IDs deduped; on whole client error logs and uses empty map, then returns **successful None counts**, which may overwrite/cache unknowns. On cached-post queries, client misses fetch only cold-start-base-eligible candidates using follower cap; others preserve prior counts. Existing hydration-cache hits can still update counts. | `home-mixer/candidate_hydrators/engagement_counts_hydrator.rs:17-168` |
| `SemanticIdHydrator` | No cache hit, EnableSemanticIdHydration, nonempty endpoint. Cache key original ID + endpoint hash. Batch unique IDs; absent entire lookup errors all, absent individual code errors that candidate. Writes Some(codes), preserving absence on failure rather than inventing codes. | `home-mixer/candidate_hydrators/semantic_id_hydrator.rs:20-118` |

CoreData ancestor users are assembled from parent-author metadata when ancestors nonempty and root-author fetch only when ancestors length exactly2. They are not guaranteed to enumerate every ancestor user. `home-mixer/candidate_hydrators/core_data_candidate_hydrator.rs:153-180` (`build_ancestor_users`).

Gizmoduck safety unions (`home-mixer/candidate_hydrators/gizmoduck_hydrator.rs:124-149`):

- `nsfw_author`: admin NSFW OR user NSFW OR NSFW_HIGH_PRECISION label.
- `nsfw_author_ads`: preceding union OR POSSIBLY_NSFW_ACCOUNT.
- `nsfw_author_phoenix`: user/admin NSFW OR either NSFW_HIGH_PRECISION/POSSIBLY_NSFW_ACCOUNT (same listed union as ads here, but distinct field/consumer).
- Missing author record remains None, not an affirmative safety classification.

Preselection defaults: bidirectional and all-author follow hydration true (`home-mixer/params/param.rs:762-773`); engagement counts true, semantic IDs true, configured SID endpoint nonempty (`home-mixer/params/param.rs:810-827`); quoted VQV-duration check false (`home-mixer/params/param.rs:674-679`). These are `param!` declarations. Most other preselection hydrators are controlled by cache-hit state rather than an independent feature flag.

### Following-specific hydration

| Hydrator | Behavior | Evidence |
|---|---|---|
| `ConversationGapAncestorHydrator` | Takes source-provided ancestry; fetches required ancestor CoreData, records tombstone IDs for missing entries and ancestor text for mute matching. Writes ancestors, tombstones, text map, not CoreData's ancestor-user vector. | `home-mixer/candidate_hydrators/conversation_gap_ancestor_hydrator.rs:16-106` |
| `QuotedPostTextHydrator` | Fetches existing quoted IDs' CoreData; writes quote text only. It does not discover new quote IDs or hydrate all quote media as QuoteHydrator does. | `home-mixer/candidate_hydrators/quoted_post_text_hydrator.rs:13-59` |
| `FollowingBlockedByHydrator` | Postselection SocialGraph check of focal and quote users; updates focal block flag and quote block flag when hydrated quote result present. | `home-mixer/candidate_hydrators/following_blocked_by_hydrator.rs:13-64` |
| `VFFollowingCandidateHydrator` | Postselection TimelineHome evaluation of focal/related posts; updates visibility action/reason and ancillary-drop state. | `home-mixer/candidate_hydrators/vf_following_candidate_hydrator.rs:16-92` |

Following registration has no MediaInfo, Gizmoduck, counts or ordinary InNetwork candidate hydrator; NightOwl already initializes in-network true and score0. Do not assume every Phoenix feature is hydrated on Following. `home-mixer/candidate_pipeline/reverse_chron_posts_pipeline.rs:148-192`; `home-mixer/sources/following_night_owl_source.rs:205-223`.

### Postselection hydration and dormant class

| Hydrator | Gate and output | Evidence |
|---|---|---|
| `VFCandidateHydrator` | Runs on selected candidates, including cached candidates. In-network main/repost originals use TimelineHome; OON main/ancestors/quotes Recommendations. Primary errors preserve old fields; missing primary result yields missing verdict; ancillary missing/errors ignored and tombstone ancestors skipped. Writes action/reason/drop-ancillary. EnableXaiVfClient chooses client, default true. | `home-mixer/candidate_hydrators/vf_candidate_hydrator.rs:34-181`; `home-mixer/params/param.rs:1089-1094` |
| `AdsBrandSafetyVfHydrator` | Fetch labels for original main, quote, ancestors. Whole request/primary-ID failure gives error; failed ancillary ID contributes MediumRisk. Computes worst verdict across related content, raises at least HighRisk on `nsfw_author_ads==Some(true)`, merges/sorts/dedups safety-label info by label type. Details §6. | `home-mixer/candidate_hydrators/ads_brand_safety_vf_hydrator.rs:22-140` |
| `TweetTypeMetricsHydrator` | Builds binary tweet-type metric bitmap from candidate/query state and updates only `tweet_type_metrics`. This runs concurrently with other postselection hydration, so it does not see their newly written fields. | `home-mixer/candidate_hydrators/tweet_type_metrics_hydrator.rs:1-275`; `home-mixer/util/tweet_type_metrics.rs:1-92` (`TWEET_TYPE_PREDICATES`, `bitset_get`) |
| `FollowingRepliedUsersHydrator` | Flag and **viewer follower_count≥1000**. From Thunder's `in_network_replies`, exclude viewer-blocked/muted reply authors, dedup/sort authors, exclude focal author. Root posts meeting minimum reply-user count get at most3 IDs, on at most configured max posts. Missing once-cell means empty list. Defaults flag false/min users0/max posts0. | `home-mixer/candidate_hydrators/following_replied_users_hydrator.rs:13-113`; `home-mixer/params/param.rs:507-524` |
| `MutualFollowJaccardHydrator` | Flag and viewer sketch present. Needs viewer length≥256; shorter viewer produces None. Fetch author sketches; absent author→None, short/errored/missing-result author→error. Similarity = equal-position hash count / min(vector lengths). This is a sketch estimate, not count of shared follows. Default disabled. | `home-mixer/candidate_hydrators/mutual_follow_jaccard_hydrator.rs:10-117` |
| `TopicFeedbackContextHydrator` | Flag, no topic request, not in-network-only. Eligible original has no reply/repost/ancestors/facepile (quotes are not excluded). Fetch unified annotations; recognized nonparent subtopics only for feedback selection. Count frequency, choose top2 topics (frequency descending then ID ascending), randomly pick one distinct candidate per topic. Set topic name/ID on chosen candidates; also retain fetched topic-name vector as grok_topics. Errors/absences leave fields None. | `home-mixer/candidate_hydrators/topic_feedback_context_hydrator.rs:15-188` |
| `AiTrendFeedbackContextHydrator` | Same surface/original gates. Fetch nonzero trend IDs, select top2 by frequency/ID, random distinct candidate per trend, fetch names; only nonempty successful names yield name/ID context. | `home-mixer/candidate_hydrators/ai_trend_feedback_context_hydrator.rs:12-156` |
| `BroadcastLivenessHydrator` (dormant) | Source file contains broadcast/media-card liveness logic and writes broadcast_is_live, but enable is literal false and module is absent from registered hydrators. | `home-mixer/candidate_hydrators/broadcast_liveness_hydrator.rs:81-190`; `home-mixer/candidate_hydrators/mod.rs:1-23` |

Topic/AI feedback defaults false (`home-mixer/params/param.rs:957-969`), brand-safety V2 false (`home-mixer/params/param.rs:855-860`, `param!` declarations). These postselection features cannot affect the preceding same-request Phoenix prediction merely by being stored on the final candidate. Cached persistence can carry metadata across requests; determine actual use from each consumer rather than from timing alone.

## 6. Safety metadata and brand-safety computation

`BrandSafetyVerdict` ordering is Unspecified0 < Safe1 < LowRisk2 < MediumRisk3 < HighRisk4; `worst_verdict` takes the larger enum value. It is used for ad adjacency, while `visibility_action` is used by postselection eligibility filters. A metrics counter containing "dropped" in AdsBrandSafety hydration records a risk escalation, not removal of the organic candidate. `home-mixer/models/brand_safety.rs:4-13,130-136`; `home-mixer/candidate_hydrators/ads_brand_safety_vf_hydrator.rs:102-131`.

### Default V1 verdict, evaluated in order

1. Any high-risk label → HighRisk: NSFW_HIGH_PRECISION, NSFW_HIGH_RECALL, GORE_AND_VIOLENCE_HIGH_PRECISION, PDNA, EGREGIOUS_NSFW, SOFT_NSFW.
2. Any medium-risk label → MediumRisk: NSFA_HIGH_PRECISION, NSFA_KEYWORDS_HIGH_PRECISION, NSFW_REPORTED_HEURISTICS, GORE_AND_VIOLENCE_REPORTED_HEURISTICS, NSFW_CARD_IMAGE, DO_NOT_AMPLIFY, MALICIOUS_URL, NSFA_COMMUNITY_NOTE, GROK_NSFA, NSFW_TEXT.
3. Without either GROK_SFA or GROK_NSFA_LIMITED → MediumRisk, including empty label map.
4. At tweet ID≥`2054275414225846272`, missing PTOS_REVIEWED → MediumRisk.
5. Any NSFA_LIMITED_INVENTORY, GROK_NSFA_LIMITED, NSFA_HIGH_RECALL → LowRisk.
6. Otherwise Safe.

Evidence: `home-mixer/models/brand_safety.rs:15-72` (`HIGH_RISK_LABELS`, `MEDIUM_RISK_LABELS`, `LOW_RISK_LABELS`, `compute_verdict`). These labels are inputs from an external store; the wrapper does not derive them from post text.

### Optional V2

If no GROK_SFA_V2/GROK_NSFA_V2/GROK_NSFA_LIMITED_V2/GROK_NSFA_EXPANDED_V2 exists, defer to V1. Otherwise high-risk union unchanged; medium union uses NSFA_KEYWORDS_HIGH_PRECISION, reported NSFW/gore heuristics, NSFW_CARD_IMAGE, DO_NOT_AMPLIFY, MALICIOUS_URL, NSFA_COMMUNITY_NOTE, GROK_NSFA_V2, GROK_NSFA_EXPANDED_V2, NSFW_TEXT. Requires GROK_SFA_V2 or GROK_NSFA_LIMITED_V2 and same PTOS cutoff; low-risk union GROK_NSFA_LIMITED_V2 or NSFA_HIGH_RECALL; else Safe. `home-mixer/models/brand_safety.rs:74-127` (`compute_verdict_v2`).

Label metadata conversion truncates source-description text to250 chars and maps BotMaker rule IDs to categories:1000..1099 Content;1100..1199 ContentLimited;1200..1399 Safety;1400..1499 Grok;1500..1600 Quote; everything else Legacy. This is serialized provenance, not a ranking coefficient. `home-mixer/models/brand_safety.rs:138-160`; `home-mixer/candidate_hydrators/ads_brand_safety_vf_hydrator.rs:22-27`.

## 7. What Home Mixer actually serializes toward Phoenix

This section establishes request construction, not model-feature consumption inside a remote predictor.

### Client, viewer, and device contexts

`build_client_context` returns None for user0; otherwise sends user ID, app ID, country, language, roles, raw IP and client version. It does **not** serialize the entire device/ad/query object. `home-mixer/util/phoenix_request.rs:72-87`.

`build_user_context` always returns Some and sends:

- demographic age bracket/gender/state, default0;
- user age in years, default0;
- inferred gender enum, default0, score default0.0;
- followed topics/packs converted to vectors, absent→empty;
- IP longitude/latitude, absent→0.0;
- DMA from optional ZIP via external `zip_to_dma_code`;
- installed-app vector, absent→empty.

Evidence: `home-mixer/util/phoenix_request.rs:89-136` (`build_user_context`). These default zeros are missing-value encodings at the request boundary, not factual age/gender/location observations. In particular, `country_code`, demographics `user_state`, IP coordinates, ZIP→DMA and timezone are distinct signals.

`build_device_feature` sends country enum from request country, network enum, timezone enum and raw IP. `home-mixer/util/phoenix_request.rs:138-145`. No source here establishes what an absent/invalid country's numerical enum means internally.

### Candidate-to-TweetInfo conversion

`build_tweet_infos` takes **at most2800** input candidates. The followed flag is recomputed for original author from followed IDs or viewer identity; it is not copied blindly from candidate.in_network. `home-mixer/util/phoenix_request.rs:147-177` (`candidate_to_tweet_info`, `build_tweet_infos`).

`PostCandidate::as_tweet_info` sends:

| Outbound feature | Mapping/absence behavior |
|---|---|
| tweet/author IDs | Original repost target IDs when present, otherwise focal. |
| retweeting tweet/author IDs | Wrapper IDs only when corresponding repost Option exists, otherwise0. |
| quote/reply IDs | Option→0. |
| author-followed bool | Caller-computed original-author relationship. |
| safety-label mask | SAFETY_BIT_AUTHOR_NSFW only when `retweeted_user_id` is None and `nsfw_author_phoenix==Some(true)`; otherwise0. Other safety-label-vector entries are not copied into this mask here. |
| minimum video duration | Option→0, cast u64. |
| fav/repost/quote/reply/bookmark counts | Option→0 then integer cast; raw counts, not weighted probabilities. |
| views | view_count→0; `view_count_on_home` is not this field. |
| language | optional code or empty string→external enum conversion. |
| tweet bool features | has_media default false; is_retweet/is_quote/is_reply determined by Option presence. Other fields default. |
| AuthorInfo | Original author ID and followed flag. Author-follows-viewer and followers only for nonreposts; reposts send None for these fields. Nonrepost followers clamp below0 to0. |
| semantic IDs | None→empty vector. |
| main/quoted ContentFeatures | Derived locally as below; main always Some, quote only if quoted tweet ID exists. |

Evidence: `home-mixer/models/candidate.rs:295-355` (`as_tweet_info`). **Candidate author followers are not the viewer's follower count**; the latter can affect other gates but is not substituted into AuthorInfo.

### Derived ContentFeatures

`build` and `build_quoted` encode has_video, max_video_duration_ms, has_photo, media_count, weighted_text_len, newline_count, has_url. Numeric media values are absent→0 and clamped nonnegative. Quote text absent→empty; quote object absent entirely without quote ID. `home-mixer/models/content_features.rs:4-88` (`build`, `build_quoted`, `TextMetrics::of`).

Text algorithm:

- Split by whitespace; whitespace codepoints still contribute their character weights separately.
- URL detection is token starts-with `https://` or `http://`, not a full URL parser.
- Count external URLs as URL tokens minus `u32::from(has_media)`, saturating at0; attachment contribution therefore subtracts at most one URL.
- Each external URL contributes23 weighted characters; non-URL tokens use codepoint weight.
- Weight0 for variation selectors FE0E/FE0F, skin-tone modifiers1F3FB..1F3FF, tag charactersE0020..E007F; weight1 for ranges0..4351,8192..8205,8208..8223,8242..8247; weight2 otherwise.
- Count literal newline characters; has_url is external URL count>0.

This proves those values are constructed for the request. It does not prove that adding newlines, links, media, or a particular length improves a learned score.

### Request envelope and sequence

`build_request_without_sequence_and_candidates` constructs one CandidateSet with viewer, product surface and device feature; request asks return_logprob, configured top logprobs constant, optional backbone scores, client/user contexts, request-ID string metadata, and parsed experiment overrides (`key=value;...`, trimmed, malformed pairs ignored, empty key ignored). `build_prediction_request` fills candidates, clones scoring sequence or default sequence, sets reranker head tag, and includes optional columnar bytes. `home-mixer/util/phoenix_request.rs:179-226`.

**Caller execution is narrower than builder capability:** `PhoenixScorer` is disabled on candidate-cache hits and by its kill-switch decider. Without a scoring sequence it returns successful default candidate updates **without calling prediction**, overwriting its owned prediction fields with defaults. An RPC error instead returns per-candidate errors, so generic scorer update preserves existing fields. Cached candidates can still run the independently gated `RankingScorer` and `VMRanker`; cache reuse is not reuse of an immutable final order. `home-mixer/scorers/phoenix_scorer.rs:65-103,123-129`; `candidate-pipeline/scorer.rs:26-42,49-54`; `home-mixer/scorers/ranking_scorer.rs:563-566`; `home-mixer/scorers/vm_ranker.rs:54-57`.

Retrieval differs: normal Phoenix passes client+user contexts; topic and MOE wrappers pass None for those two arguments. All require a present retrieval sequence rather than silently using a default. `home-mixer/sources/phoenix_source.rs:71-107`; `home-mixer/sources/phoenix_topics_source.rs:33-92`; `home-mixer/sources/phoenix_moe_source.rs:35-71`. Do not assume the prediction envelope and every retrieval request carry identical context.

`as_score_info_no_prediction_scores` deliberately constructs an empty prediction-score map, but preserves weighted/final scores, slate context and head tag, with other slot probabilities None. That helper's name is a useful guard against mistaking a logging object for full prediction output. `home-mixer/models/candidate.rs:265-293`.

## 8. Signals that must not be conflated

Profile visits are not a named action in the explicit/implicit auxiliary signal lists above. That is **not** proof they are absent from UAAS histories or every model input: those sequences are externally aggregated, and the explicit local matcher omits unrecognized variants. `home-mixer/query_hydrators/explicit_engagement_signals_query_hydrator.rs:75-95`; `home-mixer/query_hydrators/scoring_sequence_query_hydrator.rs:37-65`.

| Distinction | Correct reading |
|---|---|
| Viewer follower count vs author followers | `query.user_features.follower_count` comes from viewer data; `candidate.author_followers_count` comes from candidate-author Gizmoduck. E.g. facepile threshold1000 is a **viewer** condition. |
| Exact mutual follow vs Jaccard | BidirectionalFollow's boolean is a direct social-graph relation. MutualFollowJaccard is similarity of sketches, postselection and default-off. |
| In-network vs original-author-followed | Candidate network hydration checks candidate/wrapper author; Phoenix TweetInfo follows original author. Reposts can differ. |
| Observed counts vs prediction heads | EngagementCounts fields count observed events; PhoenixScores stores predicted outcomes. Counts may be serialized as inputs and used in explicit filters, but scoring weights do not simply multiply those raw counts. |
| Engagement vs seen vs served | Engagement contains timestamped action histories; Bloom/request seen records exposure information; served history records delivery. None is a substitute for the others. |
| Requested topics vs followed topics vs post topics | Query topic_ids change route/filtering; followed_grok_topics is user multihot context; filtered_topic_ids labels the post; feedback topic text is UI metadata. |
| Account age vs human age vs resurrection | Snowflake account age drives some new-user branches; `user_age_in_years` and demographics age bracket are viewer attributes; resurrection timestamp is separate activity lifecycle context. |
| VF vs ad brand safety | VF action can remove the candidate; brand verdict controls ad adjacency and is derived from related-post labels. A risk metric is not proof of organic suppression. |
| Declared vs active vs consumed | Broadcast field is declared but its hydrator disabled; impressed-ID fetch is constructed but unregistered; feedback hydrators run after ranking; request serialization still does not prove learned model use. |

Evidence for these separations: `home-mixer/models/query.rs:43-127`; `home-mixer/models/candidate.rs:11-102,295-355`; `home-mixer/models/user_features.rs:5-14`; query/candidate hydration rows above; `home-mixer/candidate_pipeline/phoenix_candidate_pipeline.rs:232-447` (timing/registration).

## 9. Scope and genuine gaps

The released tree omits implementations for several imported internal crates/services. Consequently this audit cannot establish installed-app vocabulary/legacy width, full UAAS aggregation internals, every TES/SocialGraph/Strato/VF store contract, label production, or remote model tokenization/consumption from these wrappers alone. The local `candidate-pipeline` directory does not include the imported `component_library` implementations; retain that boundary when citing a cache or client helper.

No live feature-switch assignment, runtime fetch success, or user-specific record was queried. Unknown/missing values, shadow overrides, cache reuse, concurrent hydration and endpoint-specific registration all affect which values reach a request. Use the bundled source to trace producer → update → consumer before making a claim about any particular field.
