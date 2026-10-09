# Pipeline, sources, eligibility, and feed assembly

Audited snapshot: `3aa0fa336c4a20e4149b6151629b6050897bb8a5`. All citations are repository-relative `path:line-range` plus a symbol; open the corresponding file under this skill's `source/`. This reference covers orchestration and source **wrappers**, not the internal retrieval models or scoring formula. See [features-and-context.md](features-and-context.md) for field and hydration provenance.

**Reading rule:** registration, runtime enablement, and successful execution are different facts. Defaults below are the snapshot's primary production feature-switch values, configurable per recipient/request, not universal platform rules. `home-mixer/params/param.rs:1-15` (`param!` defaults) and `home-mixer/server.rs:74-225` (`QueryBuilder`) establish that distinction.

## 1. Execution contract

`CandidatePipeline::execute_stages` runs these stages in this exact order:

1. Query hydrators.
2. Dependent query hydrators, if a pipeline supplies any.
3. Sources.
4. Candidate hydrators.
5. Preselection filters, sequentially.
6. Scorers, sequentially.
7. Selector.
8. Postselection hydrators.
9. Postselection filters, sequentially.
10. Truncate to the pipeline's `result_size`.
11. Finalize selected candidates.
12. Spawn detached side effects and return the result.

Evidence: `candidate-pipeline/candidate_pipeline.rs:111-161` (`execute_stages`). There is no automatic replenishment after postselection removal. Selecting 50 and returning at most 35 does not guarantee 35 eligible posts.

### Concurrency, errors, and diagnostic collections

- A query-hydrator group, source group, or candidate-hydrator group uses `join_all`. Every member sees the **same stage input**; successful updates are then applied in registration order. Listing CoreData before another hydrator does not let that other hydrator see newly hydrated CoreData in the same group. Sources are concatenated in registration order, not completion order. `candidate-pipeline/candidate_pipeline.rs:222-330` (`hydrate_query`, `hydrate_dependent_query`, `fetch_candidates`, `run_hydrators`).
- Query-hydrator errors are logged and leave the old query fields. Source errors contribute no candidates. Per-candidate hydration errors preserve the old candidate fields. A hydrator result-length mismatch skips the entire update. Cached hydration caches successful defaults/empty values as well as populated ones. `candidate-pipeline/query_hydrator.rs:8-37`, `candidate-pipeline/source.rs:9-40`, `candidate-pipeline/hydrator.rs:33-66,149-214` (`update_all`, cached hydration).
- Filters are synchronous partitions into kept/removed; only kept candidates reach the next filter. Scorers run in order over the surviving vector. Side effects run concurrently in a detached task; failures are recorded, not returned as feed failures. `candidate-pipeline/candidate_pipeline.rs:332-444` (filter/scorer/side-effect runners); `candidate-pipeline/filter.rs:6-67` (`Filter`); `candidate-pipeline/side_effect.rs:7-38` (`SideEffectInput`).
- `retrieved_candidates` is the **hydrated, prefilter** collection. Filtered candidates are diagnostic output, not side-effect input. `non_selected_candidates` includes selector leftovers and final truncation leftovers, not postselection-filter removals. Side effects receive query + selected + nonselected. `candidate-pipeline/candidate_pipeline.rs:111-161` (`execute_stages`).

## 2. Registered pipelines and limits

### Phoenix inner ranked-post pipeline

Construction is authoritative: `home-mixer/candidate_pipeline/phoenix_candidate_pipeline.rs:232-471` (`PhoenixCandidatePipeline` construction).

| Stage | Registration order |
|---|---|
| Query hydration | ScoringSequence → RetrievalSequence → BlockedUserIds → MutedUserIds → FollowedUserIds → SubscribedUserIds → CachedPosts → MutualFollow → UserDemographics → FollowedGrokTopics → FollowedStarterPacks → UserInstalledApps → ExplicitEngagementSignals → ImplicitEngagementSignals → ImpressionBloomFilter → Ip → UserInferredGender |
| Sources | Thunder → TweetMixer → Simclusters → Phoenix → PhoenixTopics → PhoenixMOE → CachedPosts |
| Candidate hydration | InNetwork → BidirectionalFollow → CoreData → Quote → MediaInfo → Subscription → Gizmoduck → BlockedBy → FilteredTopics → LanguageCode → EngagementCounts → SemanticId |
| Prefilters | DropDuplicates → CoreDataHydration → Age → SelfTweet → OONRetweetReply → OONNsfwSimclusters → RetweetDeduplication → IneligibleSubscription → PreviouslySeenPosts → PreviouslySeenPostsBackup → PreviouslyServedPosts → ViewerMutedKeyword → AuthorSocialgraph → Brazil2026Election → Video → TopicIds → NewUserMinEngagement → InventoryHoldout → FavHoldout |
| Scorers | PhoenixScorer → RankingScorer → VMRanker |
| Selection | TopKScoreSelector |
| Postselection hydration | VF → AdsBrandSafetyVf → TweetTypeMetrics → FollowingRepliedUsers → MutualFollowJaccard → TopicFeedbackContext → AiTrendFeedbackContext |
| Postfilters | VF → AncillaryVF → DedupConversation |
| Side effects | PhoenixExperiments → RerankingKafka → RetrievalCandidatesKafka → RedisPostCandidateCache → ScoredStats → ResponseDiversityStats → AuthorServedMetrics → MutualFollowStats → Debug → PhoenixRequestCache; concurrent execution, not sequential writes |

`ImpressedPostsQueryHydrator` is constructed as `_impressed_posts_hydrator` at lines 285-287 but **not registered**. The backup filter therefore has no automatically populated impressed-ID history from this construction.

`TopKScoreSelector` selects 50; the inner result limit is 35. `home-mixer/selectors/top_k_score_selector.rs:1-15` (`TopKScoreSelector`); `home-mixer/candidate_pipeline/phoenix_candidate_pipeline.rs:1015-1017` (`result_size`); `home-mixer/params/config.rs:17-38` (hard constants).

### Outer feeds and alternate endpoint

| Pipeline | Exact stage composition | Evidence |
|---|---|---|
| For You outer | ServedHistory + PastRequestTimestamps query hydration; ScoredPosts + Ads + WhoToFollow + Prompts + PushToHome + JetfuelFrames + FeedSurvey sources; PushToHomeDedup prefilter; BlenderSelector; AdAdjacentServed postfilter. No outer candidate hydration or scoring. | `home-mixer/candidate_pipeline/for_you_candidate_pipeline.rs:185-234` (construction) |
| Ranked Following outer | ServedHistory + PastRequestTimestamps; ScoredPosts + Ads; BlenderSelector. No outer filters or scorers. | `home-mixer/candidate_pipeline/ranked_following_candidate_pipeline.rs:113-161`; `home-mixer/ranked_following_feed_server.rs:28-80` (`get_ranked_following_feed`, `get_ranked_following_feed_urt`) |
| Following outer | ServedHistory + PastRequestTimestamps + FollowedUserIds; ReverseChronPosts + Ads + WhoToFollow + Prompts; InvalidConversationModule; FollowingBlenderSelector. | `home-mixer/candidate_pipeline/following_candidate_pipeline.rs:164-216` (construction) |
| ReverseChronPosts inner | No query hydration. FollowingNightOwl; concurrent CoreData + ConversationGapAncestor + QuotedPostText; FollowingRetweetDeduplication → FollowingViewerMutedKeyword → SelfReplyChain; PassthroughSelector; concurrent FollowingBlockedBy + VFFollowing + AdsBrandSafetyVf + TweetTypeMetrics; AuthorSocialgraph → VF → AncillaryVF. No scorers or side effects. | `home-mixer/candidate_pipeline/reverse_chron_posts_pipeline.rs:148-237` (construction/trait) |
| PhoenixScores | ScoringSequence, FollowedUserIds, UserDemographics, UserInferredGender, FollowedGrokTopics, FollowedStarterPacks, UserInstalledApps, Ip; SeedCandidates; CoreData, InNetwork, Gizmoduck, MediaInfo, LanguageCode, Quote, SemanticId; CoreDataHydration filter; PhoenixScorer then PhoenixScoresRankingScorer; PassthroughSelector; ResultSizeFilter; ScoredStats side effect. This is not the full feed-eligibility pipeline. | `home-mixer/candidate_pipeline/phoenix_scores_pipeline.rs:109-188` (construction) |

Hard caps: Phoenix 35; For You outer `35 + 4 + 8 = 47` (module/frame budget); Ranked Following 38; Following blender 110, inner fetch 101, outer cap 112. Who-to-follow position is 6 (zero-based insertion 5), prompt insertion index 0, survey position 12 (index 11); frame budget 8. `home-mixer/params/config.rs:17-38` (constants); outer `result_size` methods at `home-mixer/candidate_pipeline/for_you_candidate_pipeline.rs:323-325`, `home-mixer/candidate_pipeline/ranked_following_candidate_pipeline.rs:224-226`, `home-mixer/candidate_pipeline/following_candidate_pipeline.rs:291-293`; inner `home-mixer/candidate_pipeline/reverse_chron_posts_pipeline.rs:235-237`. PhoenixScores has hard cap 2800 and configurable `PhoenixScoresResultSize`, default 2800: `home-mixer/candidate_pipeline/phoenix_scores_pipeline.rs:447-449`; `home-mixer/filters/result_size_filter.rs:8-20` (`filter`); `home-mixer/params/param.rs:1096-1101`.

## 3. Every source wrapper

An enabled source can still fail or return zero candidates. Request-shaping details here do not establish what an external backend or model does internally.

### Ranked-post retrieval wrappers

| Source | Enablement and request/output behavior |
|---|---|
| `ThunderSource` | Disabled on cache-hit queries. Sends viewer, followed IDs, quality-factor-adjusted `ThunderMaxResults`, excluded seen IDs, configured algorithm, `debug=false`, `is_video_request=false`. Can dispatch to CAPI by decider or resolve a Thunder cluster/channel; absent channel is a source error. Copies author/post/repost/reply metadata; ancestors are direct parent plus distinct conversation root. Stores returned in-network reply metadata in the query's shared once-cell. Served type is ForYouInNetwork or RankedFollowing according to `in_network_only`. `home-mixer/sources/thunder_source.rs:15-123` (`enable`, `source`). |
| `TweetMixerSource` | Flag on, not in-network-only, no cache hit. Sends HomeRecommendedTweets product, viewer/app/nonempty user-agent/country/language, optional seen-ID exclusion set, no cursor/random-tweets/prediction ID, quality-adjusted max. Rejects IDs whose inferred age is unavailable or >48h; missing/invalid author becomes 0, reply optional; labels ForYouTweetMixer. `home-mixer/sources/tweet_mixer_source.rs:17-109` (`source`). |
| `SimclustersSource` | Flag on, not in-network-only, no cache hit, and at least one explicit/implicit post signal. Combines all signal types, sorts newest first, deduplicates tweet IDs. One ANN query per signal; any individual query error fails the source. Requests cosine similarity, source LOG_FAV_LONGEST_L2_EMBEDDING_TWEET, candidate LOG_FAV_BASED_TWEET, model MODEL_20M_145K_2020; ANN results 200, min score 0, top posts/cluster 800, scan clusters 50, candidate ages 0..configured hours. Post-ANN keeps score **>0.5**, takes at most `max(10000 / signal_count,1)` per query, round-robin interleaves distinct IDs, truncates to 800. Performs CoreData hydration inside the source and removes author 0 before pipeline hydration. Cache key `(signal_id,max_age_hours)`, capacity 2,000,000, TTL 600s. `home-mixer/sources/simclusters_source.rs:24-228` (`source`, `post_signal_ids`, `build_query`, `interleave_by_post_id`). |
| `PhoenixSource` | Flag on, no topic or bulk topic (>6 requested IDs), not in-network-only, no cache hit. Missing retrieval sequence is an error. Sends viewer, sequence + optional Arrow bytes, quality-adjusted max, cold-start max, empty topic list, no topic mode, client/user contexts, retry/fallback flags. Cluster can switch for short histories when positive new-user threshold is set; missing metadata length counts as 0. Production-cluster deciders can override to Experiment2Fou then Experiment1Fou. Dataset 13 gets ForYouPhoenixRetrievalCold, others ordinary retrieval. `home-mixer/sources/phoenix_source.rs:23-118` (`resolve_cluster`, `source`, `served_type_for_dataset`). |
| `PhoenixTopicsSource` | Nonempty nonbulk topic request, not in-network-only, no cache hit; **does not use EnablePhoenixSource as its gate**. Requires retrieval sequence. Sends topic IDs through `resolve_first`, selected filtering mode, quality-adjusted Phoenix max, cold max 0; client/user context arguments are None. Response gets ordinary Phoenix retrieval served type. `home-mixer/sources/phoenix_topics_source.rs:25-93` (`enable`, `source`). |
| `PhoenixMOESource` | MOE flag on, no topic or bulk topic, not in-network-only, no cache hit, and decider `disable_home_mixer_phoenix_moe_source` not active. Requires retrieval sequence. Sends configured MOE cluster/max/cold max, no topic mode or client/user contexts; labels ForYouPhoenixRetrievalMoe. `home-mixer/sources/phoenix_moe_source.rs:16-72` (`enable`, `source`). |
| `CachedPostsSource` | Only when `has_cached_posts`; clones `query.cached_posts`, preserving hydrated fields and prior score metadata. `home-mixer/sources/cached_posts_source.rs:8-16`. |
| `SeedCandidatesSource` | Nonempty endpoint seed list; constructs candidates containing only tweet ID plus defaults, preserving input order. `home-mixer/sources/seed_candidates_source.rs:8-23`. |

Shared Phoenix response conversion flattens response candidate groups, skips missing candidate payloads, copies tweet/author/reply/repost IDs, and attaches retrieval source cluster/score/one-based position **within served type**. Positions are computed by descending retrieval score; output order is not changed by that ranking pass. `home-mixer/util/phoenix_request.rs:17-69` (`candidates_from_retrieval_response`, `positions_within_served_type`). This retrieval score is not itself the final ranked score.

Relevant defaults: Phoenix enabled / max1000 / cold0; Thunder max1200 / algorithm `default` / cluster `amp`; TweetMixer disabled / max800; Simclusters enabled / age48h; MOE disabled / max200 / cold0; ordinary retrieval Experiment1Fou, topic Experiment2Fou, MOE Experiment3Memy04; new-user history threshold0 (inactive); retries0; fallback disabled. `home-mixer/params/param.rs:4-71,128-242,714-718` (`param!` declarations). Quality-factor adjustment means configured max is not necessarily the dispatched count.

### Feed, auxiliary, and Following sources

| Source | Request and behavior |
|---|---|
| `ScoredPostsSource` | Calls inner scored-post server on cloned hydrated query, converts returned ScoredPosts to Post feed items with temporary position0. `home-mixer/sources/scored_posts_source.rs:12-31`. |
| `ReverseChronPostsSource` | Requires nonempty follow list; executes ReverseChronPostsPipeline. Marks response truncated when hydrated retrieval count ≥101 and records minimum positive **selected** tweet ID in shared pagination metadata. Converts selected candidates to ScoredPosts. `home-mixer/sources/reverse_chron_posts_source.rs:25-54`. |
| `FollowingNightOwlSource` | Requires follows. Searches realtime + archive, recency ranking, full source, from-user and reply-to-user sets = viewer + follows. Base query is `filter:follows include:retweets include:protected include:spam`; positive request time adds a 365-day recall bound, clamped at epoch0. Requests101 results with collector timeout300ms. Cursor TOP uses FreshSince; BOTTOM SearchAfter; GAP requires positive ID and gap boundary, adds `max_id:id-1` plus FreshSince boundary; malformed GAP errors. No/other cursor uses FromSize. Cursor bytes encode creation-ms and tweet ID. Results sort by tweet ID descending, are marked in-network/FollowingInNetwork, score0; optional reply/repost/quote IDs and text are copied. `home-mixer/sources/following_night_owl_source.rs:14-225` (`build_request`, `base_query`, `pagination_for_cursor`, `hit_to_post_candidate`). |
| `AdsSource` | EnableAdsSource and not preview. AdIndex product surface = HomeTimelineRanking, HomeTimelineRankedFollowing, or HomeTimelineLatest. Sends viewer/app/country/language/IP/user-agent/roles/device/mobile-device/ad IDs/client version. DSP context is kept only if Google native signature is nonempty (single or list). Wraps every returned AdInfo. `home-mixer/sources/ads_source.rs:15-73` (`build_ad_index_request`). |
| `WhoToFollowSource` | Flag and `who_to_follow_eligible`. Requests HomeWhoToFollow or HomeReverseChronWhoToFollow, up to200 reactive exclusion IDs from prior WHO_TO_FOLLOW history, client viewer/app/country/language/IP/user-agent; no cursor/debug/followed-or-dismissed reactive ID. Empty recommendations produce no module; truncates returned user list to3. `home-mixer/sources/who_to_follow_source.rs:14-121` (`source`, `build_wtf_request`, `get_excluded_user_ids`). |
| `PromptsSource` | EnablePrompts. Sends viewer/app/device-if-nonempty/country/language/user-agent/IP and optional roles; HOME_TIMELINE or HOME_LATEST_TIMELINE; targeting fields are None; supports inline, full-cover, half-cover, relevance prompts. Binary-serializes each injection; serialization failure fails the source. `home-mixer/sources/prompts_source.rs:18-102` (`source`, `build_get_injections_request`). |
| `PushToHomeSource` | Request has focal ID. Fetches TES CoreData; absence produces nothing, explicit TES error fails source. Root posts additionally fetch a replier facepile; replies have empty facepile. Emits its own PushToHome variant with reply/conversation IDs and ForYouPushToHome served type. This path is separate from the ranked-post VF/filter pipeline. `home-mixer/sources/push_to_home_source.rs:18-98` (`source`, facepile helper). |
| `JetfuelFrameSource` | Any eligible catalog frame. Enumerates desired occurrences against maximum preframe feed length, prioritizes pinned frames, caps requests at8; concurrent Strato payload fetch with viewer context. Rotating cards resume after last served route index using `?i=`. Empty/missing payload omitted; partial failures retain successes; failures with no successful item return source error. `home-mixer/sources/jetfuel_frame_source.rs:19-105` (`source`). |
| `FeedSurveySource` | EnableFeedSurvey and history eligibility; returns one marker. `home-mixer/sources/feed_survey_source.rs:9-20`. |
| `PopularTopicsSource` (dormant) | Literal `enable=false`, absent from `sources/mod.rs`. Contains Strato popular-topic retrieval and author hydration, but must not be described as a registered production candidate source. `home-mixer/sources/popular_topics_source.rs:1-105`; `home-mixer/sources/mod.rs:1-17`. |

Defaults: Ads on; WhoToFollow on with30h fatigue; Prompts on; FeedSurvey off with24h fatigue; Jetfuel master and individual frame flags off. `home-mixer/params/param.rs:835-839,1011-1024,1039-1087`.

## 4. Every filter predicate

The following table gives the **keep/drop rule**, including absence behavior. The Phoenix registration order is in §2; placement matters because earlier removal changes the input of every later stage.

| Filter | Predicate and edge cases | Evidence |
|---|---|---|
| DropDuplicates | First candidate for each exact tweet ID survives; later retrieval provenance is appended to the kept candidate. Other fields are not merged. | `home-mixer/filters/drop_duplicates_filter.rs:8-32` (`filter`) |
| CoreDataHydration | Keep author ID nonzero. It does not require text or proof that a fresh TES fetch succeeded. | `home-mixer/filters/core_data_hydration_filter.rs:7-15` (`filter`) |
| Age | Keep inferred age ≤ configured constructor duration (48h here). Missing/unusable inferred age rejects. Uses candidate tweet ID, not original repost ID. | `home-mixer/filters/age_filter.rs:11-34` (`is_within_age`, `filter`); `home-mixer/params/config.rs:36-36` (`MAX_POST_AGE`) |
| SelfTweet | Remove candidate whose `author_id == query.user_id`. | `home-mixer/filters/self_tweet_filter.rs:7-19` (`filter`) |
| OONRetweetReply | Remove when `in_network == Some(false)` and either reply or repost; also remove **any reply** with empty ancestors. Unknown network is not equal to false. | `home-mixer/filters/oon_retweet_reply_filter.rs:7-21` (`filter`) |
| OONNsfwSimclusters | When Simclusters flag on, remove only served-type Simclusters + explicit OON + `nsfw_author==Some(true)`. | `home-mixer/filters/oon_nsfw_simclusters_filter.rs:9-26` (`enable`, `filter`) |
| RetweetDeduplication | First candidate for `retweeted_tweet_id.unwrap_or(tweet_id)` survives; append later provenance. Registration/source order therefore matters. | `home-mixer/filters/retweet_deduplication_filter.rs:8-33` (`filter`) |
| IneligibleSubscription | With subscription-author metadata, keep only if that author is in viewer subscribed IDs; missing subscription-author metadata keeps. | `home-mixer/filters/ineligible_subscription_filter.rs:8-30` (`filter`) |
| PreviouslySeenPosts | Remove if any related ID is explicit seen or **may** be in any impression Bloom filter. Related IDs are candidate tweet ID, optional retweeted ID, optional direct in-reply-to ID—**not the entire ancestors list and not the quoted ID**. Bloom positives can include false positives. | `home-mixer/filters/previously_seen_posts_filter.rs:10-34`; `home-mixer/util/candidates_util.rs:6-17` (`related_post_ids_iter`) |
| PreviouslySeenPostsBackup | Tests related IDs against `impressed_post_ids`; this history's hydrator is not registered in Phoenix. | `home-mixer/filters/previously_seen_posts_backup_filter.rs:1-32`; `home-mixer/candidate_pipeline/phoenix_candidate_pipeline.rs:285-287` |
| PreviouslyServedPosts | Enabled by EnableServedFilterAllRequests **or** bottom request whose context is not ForegroundTruncate. Thus all-request flag also enables ForegroundTruncate. Removes when any same related ID is in served IDs. Default all-request flag true. | `home-mixer/filters/previously_served_posts_filter.rs:13-33`; `home-mixer/params/param.rs:911-916` |
| ViewerMutedKeyword | No keywords: keep all. Tokenizes viewer mutes and candidate tweet text; MatchTweetGroup match removes. Does not independently scan quote/ancestor text. | `home-mixer/filters/viewer_muted_keyword_filter.rs:20-56` (`filter`) |
| AuthorSocialgraph | Remove viewer-muted or viewer-blocked candidate author, author-blocks-viewer, quoted-author-blocks-viewer, viewer-blocks-quoted-author, or viewer-blocks-retweeted-user. Missing optional block flags default false. This explicit filter does not independently mute every ancillary author. | `home-mixer/filters/author_socialgraph_filter.rs:9-59` (`filter`) |
| Brazil2026Election | For candidate author, retweeted author, quoted author, and every ancestor user: reject if listed in the hardcoded set and that particular user is not followed. No country-code check or feature-switch gate in this predicate. IDs in the released set are obfuscated; comments state an electoral-law motivation, not proof of geographic runtime restriction or legal compliance. | `home-mixer/filters/brazil_2026_election_filter.rs:13-20,5632-5672` (`BRAZIL_2026_ELECTION_USER_IDS`, filter); registration `home-mixer/candidate_pipeline/phoenix_candidate_pipeline.rs:373-382` |
| Video | Enabled only for `exclude_videos`; keep if `min_video_duration_ms.is_none()`. It is not a `has_video` check; a present duration of0 still removes. | `home-mixer/filters/video_filter.rs:7-22` |
| TopicIds | Topic/exclusion requests only; details immediately below. | `home-mixer/filters/topic_ids_filter.rs:14-105` |
| NewUserMinEngagement | Flag + new/resurrected viewer window; explicit OON only; details below. | `home-mixer/filters/new_user_min_engagement_filter.rs:31-116` |
| InventoryHoldout | Flag and at least one positive percentage. Classify repost before reply before original; clamp each percentage to100; hash original tweet ID + viewer ID to bucket0..99; remove bucket<percentage. Defaults flag false/all percentages0. | `home-mixer/filters/inventory_holdout_filter.rs:16-79`; `home-mixer/params/param.rs:918-941` |
| FavHoldout | Flag (default false). Same deterministic original-ID/viewer holdout, with percentage from fav-count steps; missing or≤1 fav keeps. Uses strict `favs > threshold`, not ≥. | `home-mixer/filters/fav_holdout_filter.rs:9-66`; `home-mixer/params/param.rs:943-948` |
| VF | Remove actions Drop, Tombstone, NotEvaluated. Missing action is kept; Allow, Interstitial, Avoid, Downrank survive this predicate. A Downrank action here is not itself an implemented score multiplier. | `home-mixer/filters/vf_filter.rs:8-29` (`should_filter`) |
| AncillaryVF | Remove candidate only if `drop_ancillary_posts == Some(true)`; None/false keep. | `home-mixer/filters/ancillary_vf_filter.rs:7-18` (`filter`) |
| DedupConversation | Group by minimum ancestor ID or original post ID if no ancestors. Highest `score.unwrap_or(0)` wins; strict greater means ties retain first. A later winner replaces the first winner's vector slot. | `home-mixer/filters/dedup_conversation_filter.rs:8-48` (`get_conversation_id`) |
| FollowingRetweetDeduplication | Collect all native tweet IDs first; keep native posts; then first repost with neither wrapper nor original already seen. Finally partition by kept tweet IDs in original order. Thus native posts take precedence regardless of original vector position. | `home-mixer/filters/following_retweet_deduplication_filter.rs:8-47` |
| FollowingViewerMutedKeyword | Same tokenizer/matcher, but scans nonempty focal, quoted, and ancestor texts. Missing text adds no match. | `home-mixer/filters/following_viewer_muted_keyword_filter.rs:19-64` (`candidate_matches`) |
| SelfReplyChain | Nonreply, empty ancestor users, or author0 keeps. Otherwise find first ancestor author different from focal author; keep if viewer or followed; all-self chain keeps. | `home-mixer/filters/self_reply_chain_filter.rs:8-45` (`should_keep`) |
| InvalidConversationModule | Following outer filter invokes conversation grouping: per minimum ancestor/root choose largest focal tweet ID, remove other reply focals and standalone absorbed ancestors, and remove repost wrappers of module-contained posts; preserve selected focals. | `home-mixer/filters/invalid_conversation_module_filter.rs:8-16`; `home-mixer/util/conversation_grouping.rs:6-65` (`select_conversation_modules`) |
| PushToHomeDedup | Enabled when query has push-to-home ID, even if that source returns no item. Removes only Post variants whose focal ID or retweeted ID equals that query ID; keeps other variants. Does not compare conversation IDs. | `home-mixer/filters/push_to_home_dedup_filter.rs:7-26` (`enable`, `filter`) |
| AdAdjacentServed | Optional postblend relocation/removal, described in §6. | `home-mixer/filters/ad_adjacent_served_filter.rs:1-228` |
| ResultSize | PhoenixScores-only truncation to feature-switch result size; not a recommendation-eligibility rule. | `home-mixer/filters/result_size_filter.rs:8-20` (`filter`) |
| PopularTopicsAuthorDedup (dormant) | For PopularTopics served type only, keep first nonzero author; author0 always keeps. Not in registered filter module list/pipelines. | `home-mixer/filters/popular_topics_author_dedup_filter.rs:9-33`; `home-mixer/filters/mod.rs:1-30` |

### Muted-keyword matching examples

Bundled tests establish case-insensitive matching and the shown accent normalization (`café` matches both `café` and `cafe`). An unprefixed mute `widget` matches plain `widget` and `#widget`; a `#launch` mute matches `#LAUNCH` but not plain `launch`. An unprefixed `exampleuser` matches both the plain name and `@exampleuser`. The phrase `crypto scam` matches its contiguous occurrence, not `crypto is great, scam artists are bad`. These are test-evidenced examples, not a claim to reconstruct every rule of the imported tokenizer. Ranked versus Following text scope remains as listed above. `home-mixer/filters/viewer_muted_keyword_filter.rs:119-191,216-251`.

### Topic inclusion, exclusion, and mode selection

`is_topic_request` means nonempty requested IDs; `is_bulk_topic_request` means **length>6**, not distinct count. `home-mixer/models/query.rs:238-248`.

- **Ordinary inclusion:** any requested topic passes through category expansion; keep on direct overlap with filtered topics, or on overlap with unfiltered requested topics **and** overlap with filtered expanded supertopic. Missing/empty metadata normally fails the required match. `home-mixer/filters/topic_ids_filter.rs:43-76` (`TopicIdsFilter::filter`).
- **Bulk inclusion:** form `excluded = all_production_topic_ids - expanded_requested`. Nonempty filtered topics are rejected only if **all** are in excluded. Missing/empty topic metadata keeps; a topic outside the production universe can keep. This is not ordinary positive-membership filtering. `home-mixer/filters/topic_ids_filter.rs:24-41` (`TopicIdsFilter::filter`).
- **Explicit exclusions run after inclusion:** expand exclusions and also retain raw excluded IDs. Reject any matching filtered topic; missing/empty filtered topic list also rejects. `home-mixer/filters/topic_ids_filter.rs:82-102` (`TopicIdsFilter::filter`).
- Full category inventory is `TopicIdExpansion` constants `home-mixer/filters/topic_ids_filter.rs:110-232`, expansions `home-mixer/filters/topic_ids_filter.rs:234-413`, universe `home-mixer/filters/topic_ids_filter.rs:432-521`, supertopic table `home-mixer/filters/topic_ids_filter.rs:527-639`. It includes synthetic Science/Technology, Entertainment, Business/Finance, Sports groups; politics/news/war, crypto/stocks, AI/software/robotics/space/biotech/electronics, music/movie/gaming/anime subdomains, sports/leagues, health/food/travel, religion/relationships, and other lifestyle categories. These are exact ID mappings, not keyword or hashtag matching.
- `resolve_first` is the retrieval mapping; do not substitute the entire filter expansion into a retrieval request. Override parsing/resolution lives at `home-mixer/filters/topic_ids_filter.rs:641-693` (`TopicFilteringOverrideMap`); first requested-topic override wins, otherwise configured default. Unknown experiment strings parse to Unfiltered. Modes Unfiltered/CuratedV0/CuratedV0V1/PostBased90Pct/PostBased75Pct/PostBased50Pct map to0..5. `home-mixer/models/candidate_features.rs:52-109` (`TopicFilteringExperiment`).
- Snapshot default mode is PostBased50Pct, override string empty. `home-mixer/params/param.rs:133-144`. This names an external metadata variant; it does not prove any particular post was correctly classified.

### New-viewer gate and fav holdout thresholds

`NewUserMinEngagementFilter` uses account creation age from user ID and optional resurrection timestamp. It requires the enable flag plus either account age strictly below its window **or** resurrection age nonnegative and strictly below its window; default disabled, windows1800s each. Metric string chooses fav, view, or combined engagement, with unknown strings falling back to fav. Combined engagement requires fav metadata and treats missing reply/repost/quote counts as0. Fav/engagement ratio mode needs positive views; the view metric ignores ratio mode. Explicit OON candidates with usable metric keep iff `value >= threshold`; absent usable metric keeps. If every candidate lacks the metric, batch is returned untouched. Explicit in-network/unknown-network candidates are retained. Default metric `fav`, ratio false, threshold0. `home-mixer/filters/new_user_min_engagement_filter.rs:9-116` (`enable`, `should_keep`, `metric_value`, age helpers); `home-mixer/params/param.rs:775-809` (`param!` defaults).

Fav holdout descending `(fav-count threshold → holdout percent)` table: `10000→15, 5000→15, 3000→15, 2000→14, 1500→13, 1000→13, 750→12, 500→11, 300→10, 200→9, 150→8, 100→7, 75→7, 50→6, 30→6, 20→5, 15→5, 10→5, 7→4, 5→4, 3→3, 2→3, 1→2`; first threshold strictly below the observed count wins;≤1/missing→0. These are optional experiment holdouts, not the scorer's engagement weights. `home-mixer/filters/fav_holdout_filter.rs:9-46` (`STEPS`, `holdout_percent`).

## 5. Visibility and conversation postselection

`VFCandidateHydrator` evaluates main in-network posts and repost originals at TimelineHome; main OON posts, ancestors, and quotes at TimelineHomeRecommendations. Merged Home results override duplicate IDs. Primary candidate evaluation errors leave the candidate unchanged through the generic error path; missing primary result produces missing fields. Ancillary errors/missing results are ignored; tombstone ancestors are skipped; a disallowed evaluated ancillary sets the drop flag. Client choice uses EnableXaiVfClient (default true); visibility-service internals are outside this wrapper. `home-mixer/candidate_hydrators/vf_candidate_hydrator.rs:34-181`; `home-mixer/params/param.rs:1089-1094`.

Following uses `VFFollowingCandidateHydrator` with its TimelineHome evaluation path, including related posts, and the same final VF/ancillary predicates. `home-mixer/candidate_hydrators/vf_following_candidate_hydrator.rs:26-92`. Do not equate a VF request failure, missing verdict, and explicit NotEvaluated: the last is explicitly removed, while missing verdict is not.

Following's gap hydrator fills selected ancestor slots from TES, marks missing ancestors as tombstones, and supplies ancestor text for mute matching. General URT conversation assembly sorts ancestor IDs, shows root + at most one intermediate + focal, omits tombstone ancestor items, and includes all ancestor/focal IDs in conversation metadata. A following-replied facepile can cause a module even without ancestors. `home-mixer/candidate_hydrators/conversation_gap_ancestor_hydrator.rs:16-106`; `home-mixer/util/urt/convo_marshaller.rs:12-125` (`marshal_conversation_module`); `home-mixer/util/urt/mod.rs:72-82`.

## 6. Ad blending, modules, and reordering

### Shared checks

The feed selector partitions feed variants, dispatches ad blender by string, then inserts modules. It does not globally reindex every item's `position` after those insertions; vector order and stored position metadata should not be conflated. Snapshot default `AdsBlenderType="multi_risk"`; recognized names are `partition_organic_low_risk`, `safe_gap`, `multi_risk`, `time_gap`; unknown names fall back to partition. `home-mixer/selectors/blender_selector.rs:33-176` (`select`, insertion helpers); `home-mixer/params/param.rs:848-853` (`AdsBlenderType`).

Shared ad utilities require at least5 organic posts for normal injection. `compute_spacing` sorts the first4 ad insertion positions and takes their minimum positive difference: if it is≥3, requested spacing is that difference and minimum spacing is its ceiling-half; otherwise (also fewer than2 ads) defaults are requested3/minimum2. `has_avoid` means MediumRisk or HighRisk, not every non-Safe verdict. Per-ad compatibility checks can reject low-risk neighbors for BSR Low/IAS; handle exclusions inspect focal/repost/quote/ancestor users; keyword exclusions tokenize tweet text. `home-mixer/ads/util.rs:1-282` (`compute_spacing`, brand-safety, blocked-user and keyword helpers). Brand safety is adjacency policy here, not a universal organic-post eligibility filter.

The multi-risk ad blender assigns `position` **before** module insertion (`home-mixer/ads/multi_risk_blender.rs:230-235`). Later URT assigns descending entry sort indexes (`home-mixer/util/urt/mod.rs:126-128`); those are not a rewrite of every stored `FeedItem.position`.

### Blender differences

| Blender | Ordering and placement behavior | Evidence |
|---|---|---|
| Partition organic | Split safe and unsafe organics; allocate up to `min(ad_count,(organic_count-1)/spacing,safe_count/2)` slots; choose safe neighbor pairs; skip incompatible ads without advancing slot; rebuild safe–ad–safe triples and score-sorted filler. Can reorder organics. Truncates feed and removes trailing ad. | `home-mixer/ads/partition_organic_blender.rs:16-292` (`blend`) |
| Multi-risk | Similar pairing/rebuild, allowing additional MediumRisk pairs for ads with high brand-safety risk tolerance; per-ad checks still apply. Can reorder organics. | `home-mixer/ads/multi_risk_blender.rs:16-332` (`blend`) |
| Time-gap | Safe pairs plus filler chosen using normalized predicted dwell and minimum organic gap; can reorder. Defaults time target4s, dwell clamp0.5..2, minimum gap3. | `home-mixer/ads/time_gap_blender.rs:16-271`; `home-mixer/params/param.rs:861-884` |
| Safe-gap | Preserves organic order and scans eligible gaps. Does **not** invoke the same per-ad handle/keyword/BSR predicates as partition/multi-risk/time-gap. Do not transfer one blender's guarantees to another. | `home-mixer/ads/safe_gap_blender.rs:1-107` (`blend`) |
| Following | Preserves conversation units and does not insert inside adjacent related-post units. Scans ad pool for a compatible gap, evaluates whole-unit brand/handle/keyword compatibility, caps110, removes trailing ad. | `home-mixer/ads/following_ad_blender.rs:1-188` (`blend`) |

The `BlenderSelector` nonselected vector is made of default Post/Ad placeholders for count accounting; it is not a recoverable list of the actual omitted feed items. `home-mixer/selectors/blender_selector.rs:78-95,178-193` (`select`, `build_non_selected_placeholders`).

### Fixed modules and sports frames

For You insertion order is prompts → first who-to-follow at index5 → push-to-home pinned0 → planned frames → survey index11. Indices clamp to feed length; later insertions can shift earlier items. Following inserts prompts and who-to-follow separately, with who-to-follow requiring organic post count **>10**. `home-mixer/selectors/blender_selector.rs:70-176` (`select`, insertion helpers); `home-mixer/selectors/following_blender_selector.rs:26-139`; `home-mixer/params/config.rs:17-35`.

Frame catalog (`home-mixer/frames/catalog.rs:38-139`, `TIMELINES`, `eligible_in`):

- Soccer topic `1925950498420469760`: `/cards/soccer/timelineCarousel`, pinned rank0, first response only (implemented as not-bottom).
- NFL topic `1925951614067650560`: `/cards/nfl/timeline/pinned`, pinned rank0/not-bottom; `/cards/nfl/timeline/card`, recurring every7 items starting slot7, every response, rotating occurrences.
- MLB topic `1925951672561319936` and Baseball topic `1925950576740675584`: shared `/cards/mlb/timelineCarousel`, pinned rank0/not-bottom.
- Master + timeline/card flags gate eligibility. All catalog cards are nondismissible with placement ID0 in this snapshot. Planner deduplicates `(route,occurrence)`, drops unknown routes, sorts pinned ranks, assigns recurring occurrences to slots, sorts by slot/occurrence and caps8. Failed occurrence gaps close up. `home-mixer/frames/plan.rs:9-52` (`plan_in`); `home-mixer/frames/placement.rs:1-49`; `home-mixer/frames/served.rs:1-22` (rotation resumption).

### AdAdjacentServed postfilter

Default disabled. Enabled only on nonbottom requests, excluding PullToRefresh/Launch/Signup/ForegroundTruncate/Gap contexts. It tests literal adjacent organic `tweet_id` membership in served IDs. For an offending ad, it tries to move an unserved brand-compatible organic that is not already next to an ad into the gap; otherwise drops the ad. It cleans edge ads after removals and **reindexes only when a relocation/removal occurred**. This changes the feed **after** blending and can reduce ad count or reorder organics; merely enabling the filter does not guarantee final position metadata equals vector indices. `home-mixer/filters/ad_adjacent_served_filter.rs:1-228` (`enable`, `filter` and helpers; conditional reindex at 105–109); `home-mixer/params/param.rs:905-910`.

## 7. Response and pagination

QueryBuilder rejects viewer0. Viewer and resurrection fetches are concurrent with200ms timeouts and fallback to default viewer/None; recommendation opt-out forces in-network-only. Recipient-specific feature switches and explicit overrides are applied before execution. Request/prediction IDs, device/context, roles, age, cursor and endpoint flags are query inputs. `home-mixer/server.rs:74-225` (`QueryBuilder`).

`post_candidate_to_scored_post` maps absent scalar IDs/timestamps/score to0, unknown network tofalse, and absent brand-safety verdict toMediumRisk. It exports positive finite dwell and ancillary/safety/feedback metadata. These transport defaults do not retroactively mean hydration observed those values. Debug JSON contains query, retrieved, filtered and selected candidates; it is not an exhaustive dump of every scored/nonselected state. `home-mixer/scored_posts_server.rs:35-124` (`run_pipeline`, `post_candidate_to_scored_post`).

ForYou/Following test-user IDs return empty items early. Pipeline execution otherwise returns selected candidates even if individual components failed; URT binary serialization failures become tonic Internal. `home-mixer/for_you_server.rs:28-83`; `home-mixer/following_feed_server.rs:29-87`; `home-mixer/ranked_following_feed_server.rs:28-80` (`get_ranked_following_feed`, `get_ranked_following_feed_urt`).

General URT handles Post, PushToHome, Ad, WhoToFollow, Prompt, Frame, FeedSurvey variants. Unsupported/missing items disappear; some prompt variants produce instructions instead of entries. It aggregates feedback actions, builds navigation/new-tweets-pill instructions, assigns descending sort indexes to marshalled entries, adds top/bottom cursors, and emits TimelineState OK. Optional entry-ID nonce uses request ID and defaults off. `home-mixer/util/urt/mod.rs:29-189` (`make_urt_timeline`, `cursor_post_ids`); `home-mixer/params/param.rs:950-955`.

General cursor initial sort index resets to current-time ID on TOP, otherwise inherits incoming cursor or current-time ID. Cursor post IDs come from first/last positive organic Post IDs, not ads/modules. TOP serialized index adds10000; BOTTOM index derives from last entry with an additional−2. `home-mixer/util/urt/cursors.rs:6-90` (`initial_sort_index`, `build_cursors`). Following has a separate reverse-chron marshaller/cursor implementation using `FollowingPaginationMeta` to preserve gap/truncation semantics: `home-mixer/util/urt/reverse_chron_following/mod.rs:1-133`; `home-mixer/util/urt/reverse_chron_following/cursors.rs:1-146`.

Marshaller ownership for deeper response audits: post `home-mixer/util/urt/post_marshaller.rs:1-135`; conversation `home-mixer/util/urt/convo_marshaller.rs:15-125`; ads `home-mixer/util/urt/ad_marshaller.rs:1-730`; prompt `home-mixer/util/urt/prompt_marshaller.rs:1-547`; who-to-follow `home-mixer/util/urt/wtf_marshaller.rs:1-156`; push `home-mixer/util/urt/push_to_home_marshaller.rs:1-118`; frames `home-mixer/util/urt/frame_marshaller.rs:1-107`; survey `home-mixer/util/urt/feed_survey_marshaller.rs:1-172`; feedback `home-mixer/util/urt/feedback.rs:1-288`; client event/controller metadata `home-mixer/util/urt/client_event.rs:1-134`, `home-mixer/util/urt/controller_data.rs:1-77`. These serialize supplied metadata; they are not additional learned ranking stages.

## 8. Cache, histories, and detached side effects

### Candidate cache is a pipeline branch

`CachedPostsQueryHydrator` has a300ms Redis GET timeout, then zstd+JSON decode. Empty bytes produce default/empty result. A decoded vector activates the branch only at **≥500 candidates**; a smaller vector may be present on the query without enabling CachedPostsSource. Key dimensions are viewer, requested topics, in-network-only, exclude-videos; excluded-topic IDs are not an argument to this key call. Errors preserve original query fields. `home-mixer/query_hydrators/cached_posts_query_hydrator.rs:11-81`.

On a hit, fresh ranked-post sources, `PhoenixScorer`, and most candidate hydrators are disabled; filters still run and selected VF/brand safety rerun. **`RankingScorer` and `VMRanker` remain independently gated and can recompute downstream scores on cached predictions.** Counts have their own selective refresh behavior. Query hydrators were concurrent with cache reading, so cache detection does not retroactively save those concurrent requests. Missing scoring sequence on an uncached request produces successful default Phoenix updates without an RPC, whereas RPC failure preserves previous fields through error handling. See [features-and-context.md](features-and-context.md), “Request envelope and sequence”; `home-mixer/scorers/phoenix_scorer.rs:65-103,123-129`; `candidate-pipeline/scorer.rs:26-42,49-54`; `home-mixer/scorers/ranking_scorer.rs:563-566`; `home-mixer/scorers/vm_ranker.rs:54-57`.

`RedisPostCandidateCacheSideEffect`: production and not already cached. Combine selected + nonselected, retain `weighted_score>0`, sort descending weighted score, cap `MaxPostsToCache` (default750), serialize JSON/zstd level6, write TTL180s. Does not cache filter removals through this input. `home-mixer/side_effects/redis_post_candidate_cache_side_effect.rs:10-90`; `home-mixer/params/param.rs:655-666`.

`PhoenixRequestCacheSideEffect`: production and configurable on (default true), TTL10800s. No-op without a selected candidate prediction ID; the **first present selected prediction ID** keys all entries. Writes request-without-sequence/candidates only for uncached queries, selected tweet-info entries even for cache-hit queries; optional LogSlateContext attaches score/slate metadata. Protobuf/zstd level3 encoding errors fail immediately. ATLA and PDXA Redis writes run concurrently; their failure rate must be>10% to return a write error. `home-mixer/side_effects/phoenix_request_cache_side_effect.rs:16-144` (`side_effect`, encoding helper); `home-mixer/params/param.rs:971-982`. This logging/cache path is not a guarantee of model execution or durable logging for every returned item.

### History distinctions

- **Engagement history**: explicit/implicit post signals and UAAS sequences, used for retrieval/prediction inputs.
- **Seen/impression history**: request seen IDs, Bloom membership, optional impressed-post backup; different provenance and semantics.
- **Served history**: server-side delivery records, not proof that the viewer actually saw or engaged with the item. Outer query hydration replaces `served_ids` with recent IDs from history; it does not union them with the request vector. By default10-minute window and first100 flattened tweet/source IDs; no dedup in `recently_served_ids`. WTF fatigue30h and survey24h use latest matching entity served time. `home-mixer/query_hydrators/served_history_query_hydrator.rs:25-118`; `home-mixer/params/param.rs:1017-1037,1082-1087`.

### Side-effect inventory

| Component | What it owns / key limitations | Evidence |
|---|---|---|
| PhoenixExperimentsSideEffect | Shadow traffic only; no-op without scoring sequence; per-cluster shadow sampling. Prediction/experiment and scored-candidate logging work; not another authoritative selection stage. | `home-mixer/side_effects/phoenix_experiments_side_effect.rs:20-264` |
| RerankingKafkaSideEffect | Production + random5% sample. Selected/nonselected reranking records and available slate/score metadata. | `home-mixer/side_effects/reranking_kafka_side_effect.rs:20-182` |
| RetrievalCandidatesKafkaSideEffect | Production, not in-network-only, no cache hit, request-ID sampling. Bounded retrieval-provenance Kafka records; input is postfilter/selection collections, not the raw source universe. Defaults sample5%, max200. | `home-mixer/side_effects/retrieval_candidates_kafka_side_effect.rs:20-121`; `home-mixer/params/param.rs:109-120` |
| ScoredStatsSideEffect | Score/action and candidate statistics; metrics are observations, not extra ranking weights. | `home-mixer/side_effects/scored_stats_side_effect.rs:1-607` |
| ResponseDiversityStatsSideEffect | Author/semantic diversity metrics over served set. | `home-mixer/side_effects/response_diversity_stats_side_effect.rs:1-186` |
| AuthorServedMetricsSideEffect | Requires stats receiver, nonempty experiment buckets and nonempty tracked-author list; counts selected focal authors by post type. Bucket parameter defaults false and ID list empty; code reads `experiment_buckets`, not a direct boolean enable check. | `home-mixer/side_effects/author_served_metrics_side_effect.rs:1-115`; `home-mixer/params/param.rs:991-1002` |
| MutualFollowStatsSideEffect | EnableMutualFollowJaccardHydration; mutual-follow similarity statistics when metadata available. | `home-mixer/side_effects/mutual_follow_stats_side_effect.rs:1-66` |
| DebugSideEffect | Counts selected candidates; logs viewer and post/author IDs only for TRACE_USER_IDS. | `home-mixer/side_effects/debug_side_effect.rs:1-40` |
| AdsInjectionLoggingSideEffect | Production + EnableAdsInjectionLogging (default true); logs injection and adjacency data. | `home-mixer/side_effects/ads_injection_logging_side_effect.rs:1-188`; `home-mixer/params/param.rs:841-846` |
| ServedAdHistoryCacheSideEffect | Ad-history cache write; production and not preview. | `home-mixer/side_effects/served_ad_history_cache_side_effect.rs:20-66` |
| PublishSeenIdsToKafkaSideEffect | Production, nonempty seen IDs, EnablePublishSeenIdsToKafka (default true). Publishes **request `seen_ids`**, not selected-post IDs. | `home-mixer/side_effects/publish_seen_ids_to_kafka_side_effect.rs:35-78`; `home-mixer/params/param.rs:1004-1009` |
| ServedCandidatesKafkaSideEffect | Served feed-candidate Kafka output; production + shadow traffic + URT-migration gate. | `home-mixer/side_effects/served_candidates_kafka_side_effect.rs:31-215` |
| ClientEventsKafkaSideEffect | Production + EnableUrtMigrationComponents; builds client-event-style response/module records from selected items. | `home-mixer/side_effects/client_events_kafka_side_effect.rs:1-325` |
| ResponseStatsSideEffect | Feed response composition/count statistics. | `home-mixer/side_effects/response_stats_side_effect.rs:1-154` |
| UpdatePastRequestTimestampsSideEffect | Production + EnableUrtMigrationComponents, not polling, context not BackgroundFetch. Prepends request time to bounded nonpolling history; Following/RankedFollowing also update latest HomeLatest timestamp. | `home-mixer/side_effects/update_past_request_timestamps_side_effect.rs:20-65` |
| UpdateServedHistorySideEffect | Production + EnableUrtMigrationComponents. Records selected post ancestors+focal and module/ad entities, partitioned by timeline/platform, including frame rotation state. | `home-mixer/side_effects/update_served_history_side_effect.rs:25-313` |
| TruncateServedHistorySideEffect | Production + EnableUrtMigrationComponents + history length>imported MAX_RESPONSES. Deletes timestamps beyond that bound in hydrated history; no deletion if none have timestamps. Concurrent with other side effects. | `home-mixer/side_effects/truncate_served_history_side_effect.rs:20-59` |

All three outer feeds register AdsInjectionLogging → ServedAdHistoryCache → PublishSeenIdsToKafka → ServedCandidatesKafka → ClientEventsKafka → ResponseStats → UpdatePastRequestTimestamps → UpdateServedHistory → TruncateServedHistory. This is registration order, **not execution ordering**. Evidence: `home-mixer/candidate_pipeline/for_you_candidate_pipeline.rs:216-231`, `home-mixer/candidate_pipeline/following_candidate_pipeline.rs:188-203`, `home-mixer/candidate_pipeline/ranked_following_candidate_pipeline.rs:131-146` (`build`). Inner cache writes and outer serving writes have different input objects and run at different pipeline boundaries.

## 9. Evidence boundaries

This snapshot exposes wrappers, stage contracts, filters, metadata transformations, blending and serialization. It does not expose every dependency's service implementation, live decider/feature-switch assignment, current label store, or runtime outcomes. In particular:

- A listed source is not proof it ran; a default-on source is not proof it returned candidates.
- A missing VF response is not the same as an explicit disallow; a kept post is not proof every hydration succeeded.
- A score is not final placement: selection, VF/conversation dedup, ad reconstruction, fixed modules, final truncation and URT marshalling all follow it.
- Detached writes can fail after the feed returns. Served ≠ seen ≠ engaged.
- Dormant PopularTopics/BroadcastLiveness code and the unregistered impressed-post hydrator are not evidence of active behavior.
- No posting strategy, legal conclusion, or universal country/engagement threshold follows from these gates alone.
