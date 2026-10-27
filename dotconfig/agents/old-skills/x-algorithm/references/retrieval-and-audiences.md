# Retrieval backends and audience formation

## Scope and provenance

Audited revision: `3aa0fa336c4a20e4149b6151629b6050897bb8a5`. Scope: `thunder/`, `phoenix-rankall/`, `phoenix-rankall-strato/`, and `simclusters/`; Home Mixer and Phoenix are consulted only to establish integration. Citations are repository-relative `path:line` plus symbol; prepend `source/` when locating the bundled source. Numbers below are **checked-in defaults/constants**, not verified production configuration. Flags, deciders, upstream stores, experiments, traffic allocation, data freshness, and deployed versions remain external unless explicitly shown.

Three distinct mechanisms must not be conflated:

| Mechanism | What it actually retrieves | Audience implication |
|---|---|---|
| Thunder | Recent posts indexed under authors supplied in the viewer's following list | A viewer following an author creates direct in-network supply. An author following a viewer does not create the reverse edge. |
| Phoenix corpus/index pipelines | Eligible post IDs, author IDs, topic memberships, metadata, and semantic IDs, exported as time-windowed snapshots | Admission makes a post available to a configured retrieval corpus; it neither guarantees retrieval nor a feed position. |
| SimClusters ANN | Posts sharing weighted engagement-derived cluster coordinates with a source embedding | The current Home Mixer integration uses **previously engaged tweet embeddings**, not a direct viewer **InterestedIn** query. Viewer/producer profiles nevertheless help construct the tweet embeddings. |

Integration evidence: `home-mixer/sources/thunder_source.rs:24` (`Source::source`); `home-mixer/sources/simclusters_source.rs:24,88,156,182` (`SimclustersSource`, `post_signal_ids`, `build_query`); `phoenix/README.md:109–125` (candidate tower and checkpoint index). SimClusters is not wholly obsolete: its source is wired into Home Mixer and its checked-in enable default is `true` (`home-mixer/candidate_pipeline/phoenix_candidate_pipeline.rs:318`; `home-mixer/params/param.rs:54–59`). Many *other* SimClusters jobs are offline, legacy, ads, account-recommendation, or evaluation paths, not evidence of additional active For You sources.

## 1. Thunder: storage, limits, and exact reply/repost behavior

### 1.1 Storage and ingestion

`PostStore` is an in-memory `DashMap<post_id, Arc<CompactPost>>`, plus author-keyed `VecDeque<TinyPost>` maps for originals, secondary posts, and videos, and a deletion/tombstone map. Compact records retain IDs, creation time, reply/source/conversation relationships, and three booleans; they are not full text/media objects. Optional IDs are stored as zero and reconstructed as `None`. There is no embedding or engagement score in this backend. [`thunder/posts/post_store.rs:21–109`, `TinyPost`, `CompactPost`, `PostStore`]

Checked-in limits:

| Limit | Value | Exact role |
|---|---:|---|
| Retention | 172,800 seconds / 48 hours | CLI default, overridable |
| Posting-list size | 5,000 | Per author **per map**, not 5,000 per author across all types |
| Original return quota | 50 | Per author |
| Secondary return quota | 30 | Replies and reposts share this quota |
| Video return quota | 100 | Per author |
| Tiny-post scan | 500 | Per author/map, after excluding requested post IDs, before full-record/reply eligibility |
| Input following IDs | 10,000 | First entries retained |
| Input excluded IDs | 10,000 | First entries retained |
| Default response size | 1,200 posts / 600 videos | Used only when request `max_results <= 0`; a positive requested limit is not clamped to these defaults |
| Request timeout | 0 ms | Default disables the store's elapsed-time cutoff |
| QPS limit | 8,000 | CLI default; service returns resource-exhausted on limiter rejection |

Sources: `thunder/config.rs:1–14` (all constants); `thunder/args.rs:48–49,84–88` (`post_retention_seconds`, `request_timeout_ms`, `qps_limit`); `thunder/thunder_service.rs:149–158,223–255` (`get_in_network_posts`).

`insert_posts` accepts only `created_at < current_time` and `current_time - created_at <= retention_seconds`; same-second and future timestamps fail this check. It sorts each incoming batch oldest-first. `finalize_init` sorts all per-author queues, trims all five partitions, and reapplies tombstones. Subsequent batches are appended; there is no global re-sort on each insertion, so reverse queue traversal is an insertion-order approximation to recency when events arrive out of order. Duplicate post IDs replace the compact record but skip re-adding/reclassifying posting-list entries. When a queue is full its front item is evicted and removed from the shared post map, even if another queue still contains a reference. [`thunder/posts/post_store.rs:128–225`, `insert_posts`, `finalize_init`, `insert_posts_internal`; `thunder/posts/post_store.rs:606–632`, `sort_all_user_posts`]

Creation event handling skips `core_data.nullcast == true`. It sets repost from `share`, reply from `reply`, and copies source/reply IDs. `has_video` requires **exactly one media entity**, `VideoInfo`, and duration **at least 5,000 ms**. GIFs, multiple-media posts, missing durations, and shorter videos do not qualify for this flag. The v2 consumer additionally sets reply true if either reply-to ID is present, even if the upstream boolean is false. [`thunder/kafka/tweet_events_listener.rs:55–74,209–244`, `is_eligible_video`, `process_message_batch`; `thunder/kafka/tweet_events_listener_v2.rs:135–151`, `deserialize_batch`]

Delete events remove the record and record a tombstone; insertions consult tombstones. Tombstones use deletion time for their own retention and are placed under reserved author key `0`. A regular delete event is ignored by the feeder if the original post's creation age exceeds retention; a `QuotedTweetDeleteEvent` deletes its **quoting tweet ID**. The v2 consumer applies creations then deletions within a processed batch. [`thunder/posts/post_store.rs:112–125,164–166,524–535,581–583`; `thunder/kafka/tweet_events_listener.rs:246–263`; `thunder/kafka/tweet_events_listener_v2.rs:212–219`]

Serving starts after Kafka catch-up and finalization. Auto-trim runs every two minutes, trimming author IDs whose modulo-five partition matches that pass; a full nominal sweep takes ten minutes. Reads do not independently test age, so **48 hours is not a strict read-time cutoff**; retained records can outlive it until trim, especially with out-of-order queues. Trimming stops at the first non-expired front record. The default `PostStore` also uses 48 hours and timeout zero. [`thunder/main.rs:90–116`; `thunder/posts/post_store.rs:477–560,644–647`]

**End-to-end boundary:** Home Mixer independently applies its candidate-ID-based `AgeFilter` with `MAX_POST_AGE=172800` seconds: age must be present and **≤48 hours**. Thunder returning a retained older record therefore does not establish eligibility for the ordinary Phoenix feed pipeline. See [pipeline-and-filters.md](pipeline-and-filters.md); `home-mixer/params/config.rs:36`, `home-mixer/filters/age_filter.rs:16–19,29–31`, `home-mixer/candidate_pipeline/phoenix_candidate_pipeline.rs:359–362`.

### 1.2 Retrieval, exclusions, and ordering

The service consumes the caller's following IDs. It fetches a following list itself only when the list is empty **and `debug` is true**. An empty ordinary request therefore does not independently discover follows. It removes three hard-coded author IDs from the supplied list: `1720665183188922368` (@grok), `1909390269533011968` (@gork), `1999031187604717568` (@products). [`thunder/thunder_service.rs:29–36,184–216,260–268`]

For each author/map: traverse queue backwards → omit excluded **stored post IDs** → take up to 500 tiny entries → hydrate from the shared map → omit reposts whose `source_user_id` equals the requesting viewer → apply the secondary reply rules below → take the author quota. Missing/evicted records and ineligible replies consume the 500-entry scan budget, but excluded IDs do not. A source post ID is not automatically excluded merely because it appears in `exclude_tweet_ids`; the exclusion predicate tests the wrapper record's own ID. No source-ID deduplication is performed here. [`thunder/posts/post_store.rs:286–365`, `get_posts_from_map`]

Originals are fetched first, secondaries next, sharing one start time. Timeout is checked before each author's queue, returns partial results, and can favor earlier supplied authors and originals if enabled. Final scoring always sorts descending by `created_at` and takes `max_results`; accepted algorithm labels are empty/`recent`/`default`/`latest`, and unsupported strings fall back to the same recent algorithm. [`thunder/posts/post_store.rs:251–282,301–315`; `thunder/thunder_service.rs:270–301,322–325`, `score_recent`]

### 1.3 Reply/repost eligibility decision table

An **original** is `!is_reply && !is_retweet`; everything else goes in the secondary map. For ordinary non-video retrieval, the following set activates this secondary predicate:

| Secondary record | Result before quota |
|---|---|
| No `in_reply_to_post_id` | Passes reply predicate. A normal repost does not require its source to be in the store. |
| Reply-to post missing from the store | Reject |
| Reply-to record is neither reply nor repost | Accept; the root author need not be followed |
| Reply-to record is itself reply/repost | Accept only if candidate has `conversation_id`, the parent record's `in_reply_to_post_id == candidate.conversation_id`, **and** candidate's `in_reply_to_user_id` is in the supplied following set |
| Deeper reply without that relationship | Reject |
| Any repost of the requesting viewer's own post | Reject separately, in every map |

This is **not** “all replies to followed users” and **not** “all conversation participants must be followed.” It admits a followed author's direct reply to a stored original from an unfollowed author; a reply-to-reply additionally needs the immediate replied-to user followed and the parent to point at the conversation root. A malformed secondary lacking a reply-to-post ID passes the reply predicate because it uses `Option::is_none_or`. [`thunder/posts/post_store.rs:162,251–278,335–363`; regression examples `thunder/posts/post_store.rs:756–878`, `test_reply_and_retweet_filtering`]

Video list inclusion begins with the record's `has_video`. If false on a repost and its source is present, it inherits eligibility when that source has video and is not a reply. Any record marked reply is then ineligible. This inference occurs at insertion; missing sources are not subsequently revisited by this code. Video retrieval calls the common scan with an empty following set and therefore bypasses the secondary reply predicate; replies were already excluded from video insertion. [`thunder/posts/post_store.rs:199–245`]

**Backend boundary:** no general per-viewer block/mute/protected-account/visibility evaluation or source-post hydration occurs in this store scan. Home Mixer hydration/filters remain necessary; do not describe Thunder admission as final visibility approval.

## 2. Phoenix admission/event routing: `phoenix-rankall-strato`

### 2.1 Event timing and engagement thresholds

Two checked-in stream forwarders delay events by **two minutes**: timeline Favorite events to `favoriteEventProcessor`, and content-understanding realtime unified-post metadata to `postCreationEventProcessor`. Both declare a 120-minute max-lag SLO and `lifecycle = Development`; that is source metadata, not proof of deployed latency or traffic. Post creation discards the metadata payload and executes the candidate processor with its post ID and `PostCreation`. The second favorite forwarder reads `phoenix_rankall_fav_event`, sends `Fav` indexing requests to the same candidate processor, and is local-zone-only. [`phoenix-rankall-strato/stream_forwarders/favoriteEventForwarder.strato:3–20`; `phoenix-rankall-strato/stream_forwarders/postCreationEventForwarder.strato:3–22`; `phoenix-rankall-strato/stream_forwarders/favoritePhoenixIndexingEventForwarder.strato:3–17`; `phoenix-rankall-strato/columns/phoenix_rank_all/postCreationEventProcessor.strato:7–14`]

Favorite processor rules:

* Only `Favorite` events are processed; unfavorites and all other events are ignored. The favorite count comes from the event's embedded tweet counts, not the subsequently fetched unified counter. Missing count produces no indexing request.
* Cache miss: trigger if post age is **less than 49 hours** and count is **less than 1,073,741,824 (`2^30`)**. There is no minimum-count check in this branch.
* Cache hit: additionally require count `>= nextTriggerThreshold`, at least **one minute** since latest update, and no more than **48 hours** since first update (`> 48h` rejects; exactly 48h passes).
* Missing creation timestamp defaults to zero and thus ages out.
* After a trigger, `nextThreshold = 2^(floor(log2(count))+1)` for positive counts. The special count-zero branch also yields **2**, not 1. Cache first-update time is preserved across updates.
* Threshold cache TTL is **50 hours**. Eviction/cache loss can permit re-triggering through the uncached branch.

Sources: `phoenix-rankall-strato/columns/favoriteEventProcessor.strato:14–63,96–157` (`nextPowerOfTwo`, `cacheNewThreshold`, execute); `phoenix-rankall-strato/lib/eventProcessing.strato:28–70` (`checkCachedTweetNewFavEventShouldTrigger`, `checkUncachedTweetNewFavEventShouldTrigger`); `phoenix-rankall-strato/columns/tweetUpdateThresholdsCache.strato:13–20`.

`minEngagements = 32` and `checkPassMinFavCount` exist in the shared library, but the inspected favorite execute path **does not call that helper**. Similarly, repeat-favorite helpers describe age/time rules but no bundled repeat forwarder proves they execute on this path. Do not turn either into a universal 32-like admission rule. [`phoenix-rankall-strato/lib/eventProcessing.strato:34–109`; `phoenix-rankall-strato/columns/favoriteEventProcessor.strato:117–147`]

### 2.2 Hydration, safety, and routing order

`phoenixRankAllCandidateProcessor` requires lightweight Tweet metadata and an author ID. Lightweight hydration fetches pure core data, media entities, and communities. It separately fetches unified post annotations, safe unified-counter totals, and author follower count (missing count becomes zero). Unified counters requested: repost, reply, favorite, quote, bookmark, displayed, not-interested, report, block. These are metadata; no weighted “quality score” is computed by this processor. [`phoenix-rankall-strato/lib/eventProcessing.strato:207–235,267–287,359–369`; `phoenix-rankall-strato/columns/phoenix_rank_all/phoenixRankAllCandidateProcessor.strato:402–421`]

Routing is ordered, with deliberate exceptions:

| Route/event | Conditions and output |
|---|---|
| `EvergreenVideo` / `EvergreenNsfwVideo` | Only `hasImmersiveVideo` required after metadata/author hydration; emits the matching evergreen index. These branches precede community/reply/repost/VF checks. |
| Fav → `search_unfiltered` | Not community, not repost, safe UEC favorite count `>= 1`. Emitted **before** reply/NSFW/VF rejection, so replies or otherwise rejected posts can enter this search route. |
| Main rejection chain | Reject community first, then reply, then repost, then `shouldDropPostByVF || isNsfwPost`. Quote posts are not rejected solely for being quotes (`share` denotes repost here). |
| Rejected NSFW Fav with immersive video | After passing the earlier community/reply/repost checks, this exception tries `nsfw_video` (emitted only if the valid-video check passes) and emits metadata and multimodal metadata regardless of that strict video check. It can execute even when VF also says drop. This is a separate corpus, not proof of Home Recommendations eligibility. |
| Accepted Fav | Always emits `1fav` main and backup; computes all six topic experiments and emits each nonempty result; emits `32fav` only if safe UEC favorite count `>= 32`; for immersive media additionally tries `video`, `1fav_video`, and `imagine`; emits metadata and multimodal metadata. |
| Accepted PostCreation | Emits `post_creation`; also `video` if valid; emits metadata. No minimum favorites required. |
| `ads` | `buildAdsIndex` helper exists, but no execute branch invokes it in this file. |

Sources: `phoenix-rankall-strato/columns/phoenix_rank_all/phoenixRankAllCandidateProcessor.strato:16–99,263–329,424–483` (`build*`, execute).

`1fav` is an **event-route name**, not a hard UEC-count gate: `build1FavIndex` emits even when fetched UEC favorites are zero, incrementing a race counter. The source Favorite event and UEC hydration can disagree. A post can therefore enter `1fav` without the processor proving a current count of one. [`phoenix-rankall-strato/columns/phoenix_rank_all/phoenixRankAllCandidateProcessor.strato:78–89`]

Safety specifics:

* The local variable named `isAdultPost` actually calls **`isNsfwPost`**, which checks only annotation `tweetBoolMetadata.isNsfw`. The broader library helper `isAdultPost` checks `isNsfw || isAdult`, but is not called here. Missing annotations/boolean metadata/NSFW field default to false.
* VF uses `TimelineHomeRecommendations`, without a viewer ID. If the decider enables Rust, it calls `visibility/xai/shouldDropTweet`; decider errors select legacy, and Rust VF errors/missing verdict become false. Legacy `visibility/service/shouldDropTweetV2` missing verdict also becomes false; its call is not wrapped by the same local try/catch. This is not a blanket guarantee that every failure is swallowed.
* Shared `isAuthorEligible`/`isAuthorVisible` helpers exist but are not independently enforced by the candidate execute chain. Do not infer a follower-count threshold, verified-only rule, or a full author-safety check from unused helpers.

Sources: `phoenix-rankall-strato/lib/eventProcessing.strato:157–173,246–265,308–325`; `phoenix-rankall-strato/columns/phoenix_rank_all/phoenixRankAllCandidateProcessor.strato:442–456`.

Video semantics differ from Thunder: `hasImmersiveVideo` means any media key categorized `TweetVideo` or `AmplifyVideo`; `hasValidImmersiveVideo` requires at least one such entity, **every media entity** in those accepted categories, and **every duration strictly greater than 10,000 ms**. `imagine` requires media additional metadata `grokPostId` and is attempted only inside the accepted Fav/immersive-video branch. Evergreen branches do not use the strict duration/all-media test. [`phoenix-rankall-strato/lib/eventProcessing.strato:23–24,371–403`; `phoenix-rankall-strato/columns/phoenix_rank_all/phoenixRankAllCandidateProcessor.strato:263–329,424–432,467–470`]

### 2.3 Topic/niche corpora

Topic entity IDs originate in **unified post annotations**, not explicit author-selected audience labels. `getUnifiedPostTopicEntityIds` returns annotation entity IDs without a score threshold. `getUnifiedPostContentCategories` is a separate helper: ascending score sort then IDs divisible by 10,000; do not confuse it with the topic-index path. [`phoenix-rankall-strato/lib/eventProcessing.strato:290–306`]

For each accepted Fav post, the processor computes these variants and emits a backup-topic event only when that variant's topic list is nonempty:

| Option | Index | Filter |
|---:|---|---|
| 0 | `1fav_topic` | All annotated topic IDs |
| 1 | `1fav_topic_option_1` | Topics mapping to an author's curated V0 categories |
| 2 | `1fav_topic_option_2` | Topics mapping to an author's V1-category helper; variable names elsewhere say V0V1, but the called helper is `getAuthorV1Categories` |
| 3 | `1fav_topic_option_3` | Author's recent-post category fraction `>= 0.90` |
| 4 | `1fav_topic_option_4` | Fraction `>= 0.75` |
| 5 | `1fav_topic_option_5` | Fraction `>= 0.50` |

Recent-post analysis reads `recommendations/twistly/userRecentEngagedTweets`, keeps `OriginalTweetMetadata` and retweet metadata **only when quoted**, sorts newest-first and takes **15**. Each post contributes at most once to a given category via a set; denominator is **all selected posts**, including those without category annotations. Category fraction is `number of selected posts with category / number of selected posts`; no posts gives empty categories. Post-based filtering converts qualified local categories to the **first** mapped XAI-category ID and retains tweet topic IDs whose supertopic is in that set. This is not “post exactly N times about a topic” and not a universal author niche score. Imported curated lists/category mappings are not present in these audited directories. [`phoenix-rankall-strato/lib/eventProcessing.strato:431–458,461–603`; `phoenix-rankall-strato/columns/phoenix_rank_all/phoenixRankAllCandidateProcessor.strato:116–165,213–260`]

Two special topics are appended **after** every variant's filtering, including curated/recent-post variants:

* `2000000000000000001`: annotations include News entity `1925949634972626944` and tag or normalized tag exactly `Iran` or `iran`.
* `2000000000000000002`: annotations include Business/Finance entity `1925949659857530880` and lowercased tag/normalized tag exactly one of `interest rates`, `federal reserve`, `bonds`, `options`, `futures`, `employment`, `energy`, `oil`, `stocks`, `macroeconomics`, `economy`.

These match **annotation tags**, not arbitrary hashtag substrings. No general keyword reach multiplier follows from them. [`phoenix-rankall-strato/columns/phoenix_rank_all/phoenixRankAllCandidateProcessor.strato:168–241`]

All six topic lists are also stored in Manhattan (`filtered_topics_by_experiment`, two-day TTL), with one-hour found-cache and five-minute missing-cache TTL. This is additional possible freshness lag, not necessarily the event-delivery delay. [`phoenix-rankall-strato/columns/mh/filteredTopicsByExperiment.strato:5–25`]

## 3. Phoenix rank-all snapshot maintenance and retrieval boundary

### 3.1 Pipelines and windows

This Rust component consumes events and produces **Parquet snapshots**, not personalized request-time ranking scores. `MainProcessor` only validates nonzero post/author IDs and nonempty index name before producing `Core`. `TopicProcessor` adds a static local post/author blacklist. `MetadataProcessor` selects metadata records. SID processors add semantic codes. `Analysis` consumes Home Mixer scored-candidate logs; `Ads` is declared but `is_implemented` is false. [`phoenix-rankall/src/processor/main_processor.rs:27–63`; `phoenix-rankall/src/processor/topic_processor.rs:26–75`; `phoenix-rankall/src/config/mod.rs:103–135`; `phoenix-rankall/src/main.rs:76–144`]

Default topic routing (`Cli::effective_topic` can override): Main/SID → `phoenix_rank_all_indexing_event`; Topic → `phoenix_rank_all_indexing_event_backup`; Metadata/SID-tail → `phoenix_rankall_metadata_event`; Analysis → `home_mixer_phoenix_scored_candidates`. [`phoenix-rankall/src/config/mod.rs:94–124`]

All time windows below are **post age from Snowflake ID**, not time since last favorite or time since ingestion. `WindowConfig` formats filenames as `<name>_<days>day` or `<name>_<min>to<max>day`:

| Pipeline | Checked-in window set |
|---|---|
| Main | `post_creation`: 1d; `1fav`: 1d, 2d; `1fav_video`: 0–2d, 2–4d, 4–14d, 4–30d; `32fav`: 1d; `video`: 2d, 4d, 7d, 14d, 30d; `nsfw_video`: 2d, 7d; `evergreen_video` and `evergreen_nsfw_video`: 1,825d |
| Topic | `1fav`, `1fav_topic`, and options 1–5: 1d each |
| Metadata | 1d, 2d, 3d |
| SID | `1fav`: 1d; `1fav_video`: 0–2d, 2–4d, 4–14d, 4–30d; `video`: 2d, 4d, 14d, 4–14d; `nsfw_video`: 2d, 7d, 14d, 4–14d; `evergreen_video`: 1,825d; `imagine`: 4d |
| SID-tail | `tail`: 1d |

Source: `phoenix-rankall/src/config/mod.rs:138–191,217–240`, `PipelineKind::window_configs`, `WindowConfig`.

The main and SID routers use **exact equality** `window.name == record.index_name`, despite the main router's `prefix_window_router` name. Topic routing is an explicit seven-name mapping. Consequently Strato's `search_unfiltered`, `ads`, or `imagine` events do not imply Main stores those rows; Main has no such windows, while SID has `imagine`. `evergreen_nsfw_video` has a Main window but no SID window. [`phoenix-rankall/src/store/base.rs:1195–1240`; `phoenix-rankall/src/config/mod.rs:140–189`]

### 3.2 Persistence, compaction, and freshness

Snapshot CLI defaults: seek **12 hours**, dump interval **180 seconds**, retain **3 versions**, commit after dump **true**, independent commit interval **0** (disabled), max poll records **500**. These are not end-to-end retrieval refresh guarantees. [`phoenix-rankall/src/config/mod.rs:26–61`]

Records are upserted by post ID per window. At dump, pending data is merged into main data; IDs below `snowflake(now - retention)` are removed. Bounded windows additionally export only IDs **below** `snowflake(now - min_age)`; young rows remain in memory and a `prefloor_` snapshot for future maturation/restart recovery. Snapshots sort IDs ascending. Thus the upper age boundary is inclusive at ID cutoff; the min-age cutoff is strict in Snowflake-ID space. [`phoenix-rankall/src/store/base.rs:83–92,130–207,322–408`, `load_existing_data`, `dump_all_windows`; periodic equivalent `phoenix-rankall/src/store/base.rs:464–550`]

Writes use Snappy Parquet, temporary file → versioned file rename → atomic symlink replacement; cleanup removes older versions. This establishes local atomic snapshot publication, not remote model deployment. [`phoenix-rankall/src/store/writer.rs:9–80`, `atomic_write_parquet`]

Metadata merge uses maximum per engagement count, OR for media booleans, maximum video duration and author-follower count, and incoming nonzero author ID. It therefore **does not reflect decrements** such as unfavorites as a lower snapshot count. Core and SID stored values otherwise take the incoming value; this is not a count-weighted ranking function. [`phoenix-rankall/src/processor/record.rs:65–80,117–148`, `EngagementCounts::merge`, `IndexRecord::merge_with`; `phoenix-rankall/src/store/base.rs:51–57`]

Topic blacklist files are `blacklisted_post_ids.txt` and `blacklisted_author_ids.txt` under the output directory, loaded during Topic pipeline construction. Missing/unreadable files give empty sets; invalid lines are skipped. This is not a universal Main/SID blacklist and no reload loop is shown. [`phoenix-rankall/src/processor/blacklist.rs:12–62`; `phoenix-rankall/src/main.rs:99–112`]

No deletion/tombstone variant exists in `IndexRecord`, and the shown Core/SID snapshot paths do not re-run viewer visibility or retract an admitted row when a later indexing attempt fails safety. Expiration, downstream checks, and any external deletion mechanisms must be distinguished. [`phoenix-rankall/src/processor/record.rs:6–49`; `phoenix-rankall/src/store/base.rs:322–375`]

### 3.3 SID hydration and small-author corpus

SID processor filters event index names to its configured windows, then calls the external SID lookup service. A lookup miss/error yields an empty SID **without dropping the post**. Default minimum post age is **180 seconds**, request timeout **10 seconds**, and SID levels **6**. Lookup omits nonpositive IDs and skips younger posts based on Snowflake creation time; it does not wait for them to mature within that call. A later backfill can hydrate their missing SIDs. Responses are paired positionally with eligible requested IDs. [`phoenix-rankall/src/processor/sid_processor.rs:59–98`; `phoenix-rankall/src/sid/client.rs:64–153`, `lookup_sids`; `phoenix-rankall/src/config/mod.rs:63–85`]

Backfill defaults: sleep **30 seconds** between cycles, batches **5,000**, at most **800,000 IDs per cycle**, missing posts only within **one hour** of creation. Despite CLI name `SID_BACKFILL_QPS_CAP`, the implementation applies a **per-cycle item cap**, not a per-second rate limiter. Missing IDs are sorted ascending/deduplicated; max-age `<= 0` disables that age cutoff. Batch size zero disables the backfill loop. Empty SID or first code `-1` means missing; writer emits six `-1` codes if SID length is not the configured number of levels. A nonempty wrong-length SID whose first code is not `-1` is not considered missing while in memory, even though serialization writes the sentinel. [`phoenix-rankall/src/sid/backfill.rs:12–110`; `phoenix-rankall/src/store/base.rs:75–78,245–283,721–762`]

SID-tail consumes metadata events, requires index name `metadata` (absent defaults to it), and admits authors whose follower count is **strictly less than 1,000** by default. Missing follower count becomes zero. Minimum favorite count defaults **0**; the favorite gate runs only when the configured minimum is positive. It exports `tail_1day` with the same missing-SID behavior. This is an explicit **others-following-the-author** threshold, not an author-following count, and is corpus eligibility rather than a universal small-account boost. [`phoenix-rankall/src/processor/sid_tail_processor.rs:64–119`; `phoenix-rankall/src/config/mod.rs:87–91,190`]

**Different boundary from ranking:** an author with **exactly 1,000 followers** fails this default SID-tail `<1000` admission but can pass the distinct cold-start ranking follower condition **≤1000**. Ranking requires additional present-count, age, position, corpus, and winner conditions; these are different mechanisms. See [ranking-and-weights.md](ranking-and-weights.md), §5, and `home-mixer/scorers/author_cold_start.rs:171–175,300–310`.

### 3.4 ANN versus Phoenix retrieval; refresh boundaries

Do not call rank-all a FAISS/HNSW ANN server: no such search algorithm is implemented in these rank-all directories. The current Phoenix documentation describes candidate-tower embeddings materialized over configured corpora **at checkpoint save**, embedded in `post_embeddings`, loaded by serving, then searched by user/candidate dot product. SID retrieval is another model path. Snapshot generation, SID availability/backfill, training/index materialization, checkpoint publication, and serving hot-swap are separate freshness stages. A 180-second Parquet dump does not mean a post becomes queryable within 180 seconds. [`phoenix/README.md:109–125`; `phoenix/xrex/inference/model_runner.py:1191–1265,1963–1970` (post-embedding checkpoint staging/replacement)]

Full Phoenix model/search mechanics belong in the companion Phoenix reference. Corpus selection and deployed refresh/checkpoint cadence cannot be inferred solely from `phoenix-rankall` CLI defaults.

## 4. SimClusters: representation lineage and graph direction

Notation: `u` is a consumer/viewer, `p` a producer/author, `c` a cluster, `t` a tweet. `F_up` is an active follow indicator; `W_up` is a time-decayed favorite weight from `u` to posts by `p`; `L_up = max(log10(1 + W_up), 0)`; `K_pc` is producer KnownFor membership. All formulas describe these code paths, not Phoenix's learned ranking weights.

### 4.1 User→producer graph and normalization

Active follows come from Flock edges with `state == 0`, oriented `(sourceId, destinationId)`. Favorites are keyed by `(favoring user, tweet, tweet author)` then aggregated to `(user, author)`. The graph retains follow edges and positive engagement edges; it does not reverse “I follow them” into “they follow me.” [`simclusters/simclusters_v2/scalding/UserUserNormalizedGraph.scala:37–46,169–180`; `simclusters/simclusters_v2/scalding/UserUserFavGraph.scala:118–178`]

Favorite state processing collapses events per user/tweet/author: final Favorite contributes `+1`; an unfavorite without a prior Favorite in that aggregation contributes `-1`; a matched Favorite→Unfavorite contributes nothing. Timestamps later than the batch endpoint clamp to the endpoint. New decayed contributions combine with previous graph values and decay to the batch end. Values below configurable `minScoreToKeep` (default **1e-5**) are removed, including negative values; an edge with no remaining half-life scores disappears. The helper filtering users requires both endpoints to exist and not be deactivated/suspended. [`simclusters/simclusters_v2/scalding/UserUserFavGraph.scala:107–178,199–302,321,362–363`]

The normalized-graph job requests the **100-day half-life** score. `transformFavEdges` tests presence of the requested half-life but reads map key `100` literally—do not assume arbitrary half-life arguments work identically. The two-day non-normalized graph also uses 100 days; normalized graph and producer norms use weekly jobs. [`simclusters/simclusters_v2/scalding/UserUserNormalizedGraph.scala:49–68,200–220`; `simclusters/simclusters_v2/scalding/UserUserGraph.scala:89–108`; `simclusters/simclusters_v2/scalding/ProducerNormsAndCounts.scala:98–103`]

Producer column norms are:

* `N_follow(p) = sqrt(sum_u F_up)`;
* `N_fav(p) = sqrt(sum_u W_up²)`;
* `N_logfav(p) = sqrt(sum_u L_up²)`.

Neighbor fields contain `F_up/N_follow(p)`, `W_up/N_fav(p)`, `L_up/N_logfav(p)` (zero for nonpositive denominator), alongside raw W/L and the follow boolean. These normalize by **the destination producer's incoming audience**, not by how many accounts the viewer follows. Each viewer's normalized adjacency is capped at default **2,000**, sorted descending lexicographically by `(raw 100-day favorite score, follower-normalized follow score)`. [`simclusters/simclusters_v2/scalding/ProducerNormsAndCounts.scala:19–75`; `simclusters/simclusters_v2/scalding/UserUserNormalizedGraph.scala:87–108,138–165,220`]

### 4.2 KnownFor: producer communities, not a text-topic label

The 2020 update job chooses at most **20 million** top users, with default **at least 400 active followers**, from a user similarity graph. User records need follower count, ID, and screen name, and cannot be suspended/deactivated. This selects by **incoming active followers**. The similarity graph input is external; the local code does not prove its full upstream computation. [`simclusters/simclusters_v2/scalding/update_known_for/UpdateKnownFor20M145K2020.scala:37–67`; `simclusters/simclusters_v2/scalding/TopUsersSimilarityGraph.scala:42–58,104–126`]

For SBF updating: default take **400 highest-scoring neighbors** per source before joining eligible destinations; make edges symmetric and merge duplicate directional weights with max; optionally square weights. Initialize from previous KnownFor, fill previously empty clusters among unassigned users, optimize with external `MHAlgorithm`, and heuristically score membership. Defaults: **3 epochs**, weight coefficient **10.0**, 16 CPUs, minimum cluster size 1, immediate updates, fixed RNG seed 1, no splitting into connected components. Number of clusters is the **maximum previous cluster ID**, not dynamically guaranteed to be 145,000 merely because the model is named `20M_145K_2020`. Output keeps the highest-scoring cluster if multiple assignments exist, hence zero-or-one cluster in this path. Weekly schedule. [`simclusters/simclusters_v2/scalding/update_known_for/UpdateKnownFor20M145K2020.scala:37–65`; `simclusters/simclusters_v2/scalding/update_known_for/UpdateKnownForSBFRunner.scala:244–290,405–451,469–495,530–564`]

Separate older `UpdateKnownFor` code computes `TP = within-cluster edge weight`, `FN = all-neighbor edge weight - TP`, `FP = (cluster size - observed cluster neighbors) × global average edge weight`; sum score `a×TP - FN - FP`, ratio `TP/(TP+FN+FP)`, and a membership-weighted ratio. `pickBestCluster` requires configurable minimum same-cluster neighbors and chooses max of the caller-selected score. Do not substitute these formulas for the external SBF heuristic used by the 2020 runner. [`simclusters/simclusters_v2/scalding/UpdateKnownFor.scala:50–109`]

### 4.3 InterestedIn from KnownFor

For every outgoing viewer→producer neighbor with KnownFor, clamp `K_pc` to nonnegative and sum:

`followScore(u,c) = Σ_p F_up K_pc`

`favScore(u,c) = Σ_p W_up K_pc`

`logFavScore(u,c) = Σ_p L_up K_pc`.

Producer-normalized variants substitute the corresponding normalized edge weights. Social proof is the **distinct union of followed or positively-favorited producer IDs** contributing to the cluster, with default threshold **2**. Following and favoriting the same producer does not count twice in this full path. [`simclusters/simclusters_v2/scalding/InterestedInFromKnownFor.scala:204–290`, `userClusterPairsWithoutNormalization`]

Cluster-normalized score for family X is `X(u,c) / sqrt(Σ_v X(v,c)²)`, computed over surviving viewer/cluster pairs. Both raw and producer-normalized follow/favorite variants are stored; raw log-favorite and cluster-normalized log-favorite are also stored. NaN becomes zero. `numUsersInterestedInThisClusterUpperBound` is the count of these pairs, not author followers. [`simclusters/simclusters_v2/scalding/InterestedInFromKnownFor.scala:294–415`, `attachNormalizedScores`]

Weekly full job defaults: **50 clusters per viewer**, social proof 2. The standalone adhoc default is **20**, not 50. Truncation sorts descending lexicographically: raw favorite, log-favorite, follow, cluster-normalized log-favorite, producer-normalized follow. These fields are not summed into one universal score. [`simclusters/simclusters_v2/scalding/InterestedInFromKnownFor.scala:40,66–67,118–119,468–504`]

Variants must be kept separate:

* **KnownFor Lite:** two-day job, non-normalized user graph, default **200** clusters and proof 2; counts `numFollowed + numFaved` rather than a distinct producer union, so one producer can supply both counts. [`simclusters/simclusters_v2/scalding/InterestedInFromKnownForLite.scala:49–77,197–269`]
* **InterestedIn from producer embeddings (PE):** older updated-model jobs use up to **25** clusters per producer and **50** final viewer clusters by default. [`simclusters/simclusters_v2/scalding/InterestedInFromProducerEmbeddingsAdhocApp.scala:48–55,199–234`]
* **InterestedIn from aggregatable producer embeddings (IIAPE):** weekly 2020 job; transform producer score with **natural log `ln(1+s)`**, L2-normalize the complete producer vector, then retain top **5** coordinates; use the full KnownFor aggregation/social-proof machinery with default proof **2**; discard all output fields except follow, log-favorite, and cluster-normalized log-favorite **before** final truncation to **200**. Consequently raw favorite is absent during that truncation and the next sort key (log-favorite) matters. [`simclusters/simclusters_v2/scalding/InterestedInFromAggregatableProducerEmbeddings.scala:35–39,74–76,175–274`]

### 4.4 Producer embeddings from audience interests

Ordinary producer embeddings transpose the relationship: they aggregate **the InterestedIn vectors of people who engage with/follow the producer**. This is different from the author's own InterestedIn vector.

Fav-based `P(p,c) = Σ_u [W_up/N_fav(p)] × [favScore(u,c)/N_favCluster(c)]`; follow-based replaces W with F and the cluster's follow score. Inputs keep positive weights and matching model versions. Fav producer must have **more than 100 favers**; follow producer **more than 100 followers**. Similarities `>= 0.01` survive; keep top **60 clusters per producer** and **300 producers per cluster**. These are eligibility/pruning rules for these batch embeddings, not a platform-wide requirement to get recommendations. [`simclusters/simclusters_v2/scalding/embedding/ProducerEmbeddingsFromInterestedIn.scala:99–108,162–171,472–552,555–625`]

Aggregatable producer embeddings use a generic matrix job: row-L2-normalize producer→consumer matrix A, column-L2-normalize consumer→cluster matrix B, multiply, retain scores **strictly > 0.01**, top 60 clusters per producer and top 500 nouns per cluster in the generic configuration. The exported aggregatable vector multiplies scores back by the original producer row norm, undoing producer normalization. The base filters producers by **faver count > 100**, including subclasses unless overridden; relaxed log-favorite variant uses **> 15**. Log-favorite subclass uses raw `logFavScore` on both graph and interest sides; this graph field is log10, unlike IIAPE's later natural-log transform. [`simclusters/simclusters_v2/scalding/embedding/common/SimClustersEmbeddingJob.scala:61–77`; `simclusters/simclusters_v2/scalding/embedding/producer/AggregatableProducerEmbeddings.scala:25–83`; `simclusters/simclusters_v2/scalding/embedding/producer/AggregatableLogFavBasedProducerEmbeddings.scala:129–150,304–309`]

## 5. SimClusters tweet embeddings: weighting, decay, persistence

### 5.1 Online sparse tweet embedding

`TweetJob.generate` processes UUA **ServerTweetFav only**, with a logged-in user ID and tweet item. It requires author-info object presence and tests `!authorId.contains(userId)`; a missing nested author ID passes that exact test, while a known self-like does not. It rejects tweets whose Snowflake age is **>= three days**. The time used for contribution decay is **receivedTimestampMs**, not tweet creation time. Missing InterestedIn produces no contribution. No reply/repost/bookmark/dwell multiplier is present in this sparse tweet job. [`simclusters/simclusters_v2/summingbird/storm/TweetJob.scala:59–110,295–298`]

For each favoriter u, cluster c is eligible when the viewer's **raw `favScore(u,c)`** meets the model-specific threshold: Dec11 **0.15**, Updated **1.0**, 2020 **0.3**. The actual amount contributed is **`logFavScoreClusterNormalizedOnly(u,c)`**, despite the storage field name `favClusterNormalized8HrHalfLifeScore`. Missing fields default zero. [`simclusters/simclusters_v2/summingbird/common/Configs.scala:27–31`; `simclusters/simclusters_v2/summingbird/common/SimClustersInterestedInUtil.scala:18–52`]

The semantic aggregate at time T is:

`tweetScore(t,c,T) = Σ eligible Favorite events e on t [clusterNormalizedLogFav(u_e,c) × 2^(-(T-receivedTime_e)/8h)]`.

The event store sums decayed deltas; the top-K cache merges **absolute updated scores** using max after aligning timestamps, not sum (which would double-count). The half-life is **8 hours**. The implementation delegates arithmetic to Algebird's decayed-value monoid; this formula expresses its intended half-life semantics. [`simclusters/simclusters_v2/summingbird/storm/TweetJob.scala:101–129`; `simclusters/simclusters_v2/summingbird/common/Configs.scala:39–40`; `simclusters/simclusters_v2/summingbird/common/ThriftDecayedValueMonoid.scala:14–31`; `simclusters/simclusters_v2/summingbird/common/Monoids.scala:340–405`]

Caps/thresholds need their call sites:

| Structure | Checked-in behavior |
|---|---|
| Tweet→clusters admission | Updated score field kept when `>= 0.02` |
| Online tweet/entity top-K monoid | Uses **`topKClustersPerEntity = 50`**, not `topKClustersPerTweet = 400` |
| Cluster→tweets | Nominal **1,600**, score threshold **0.001** |
| Top-K merge pruning | Scores must be **> threshold** when merging two nonempty maps; truncates to K only when size **> 1.2K**, so nominal K is not an exact size invariant; empty-map shortcuts return the other map directly |
| Tweet→cluster offline job | Uses `topKClustersPerTweet = 400`; see offline section |
| Ordinary/hydrated cluster index age | 3 days at merge |
| Video cluster index age | 7 days at merge, although new TweetJob contributions still pass the common 3-day event eligibility |

Sources: `simclusters/simclusters_v2/summingbird/storm/TweetJob.scala:134–178,184–210`; `simclusters/simclusters_v2/summingbird/common/Configs.scala:51–73`; `simclusters/simclusters_v2/summingbird/common/Implicits.scala:38–63`; `simclusters/simclusters_v2/summingbird/common/Monoids.scala:119–132,149–165,340–405`. This prevents the common mistake of reading the unused-in-this-call-site 400 constant as the online cap.

The squared L2 norm sink sums squared retained tweet→cluster values. The hydrated cluster index includes author ID only when present. The video branch requires `TweetMetadata.isHighMediaResolution`, whose actual predicate is: not reply, no multiple media-key entries, no URLs, at least one `VideoInfo`, and original media **width > 480 and height > 480**. Metadata hydration requests `SafetyLevel.Recommendations`; this is not a general viewer-specific visibility check in every ANN result path. [`simclusters/simclusters_v2/summingbird/storm/TweetJob.scala:168–181,219–287`; `simclusters/simclusters_v2/summingbird/stores/TweetMetadataStore.scala:19–48,68–75`]

### 5.2 Persistent tweet embeddings

`PersistentTweetJob` listens to Favorite timeline events, requires hydrated favorite count **>= 8**, then reads the current tweet embedding. It maintains:

1. **Latest embedding:** choose most recent update timestamp, add update counts.
2. Additional timestamped samples when update count crosses powers of two `2^3…2^24`; code uses `.lastOption` on a filtered Set, so do not promise a deterministic largest crossed threshold for a batch crossing several thresholds.
3. **Longest-L2 embedding:** retain whichever observed embedding has larger L2 norm (ties retain existing/left). This captures a stronger historic vector, not necessarily the latest one and not an average. Metadata on this branch uses `favoriteCount + 1` as update count.

Sources: `simclusters/simclusters_v2/summingbird/storm/PersistentTweetJob.scala:23–123`; `simclusters/simclusters_v2/summingbird/common/Monoids.scala:174–206`. Home Mixer's source embedding is `LogFavLongestL2EmbeddingTweet`, so the source vector's persistence differs from the fresh candidate index's decay.

## 6. SimClusters ANN service and exact similarity formulas

### 6.1 Request-time service

`simclustersann` loads the requested source embedding; missing embedding returns `None`. It truncates source coordinates to the top `maxScanClusters`, fetches each cluster's tweet list and cluster details, and performs sparse inverted-index scoring. This is approximate because candidate generation and candidate norms are restricted to scanned cluster/list entries, not because it is a demonstrated HNSW index. Source normalization uses the **full supplied source embedding**. [`simclusters/simclustersann/candidate_source/SimClustersANNCandidateSource.scala:27–95`]

Let `J` be coordinates whose lists are scanned, `q_c` source weight, and `x_tc` candidate's listed weight:

`D_t = Σ_(c in J where t is listed) q_c x_tc`

`Q_t = Σ_(c in J where t is listed) x_tc²`

`S = sqrt(Σ_all source c q_c²)`; `G = ln(1 + Σ_all source c q_c²)`; `H_t` = fetched stored favorite squared L2 norm (missing/error → 0).

| Scoring enum | Formula |
|---|---|
| DotProduct | `D_t` |
| CosineSimilarity | `D_t / S / sqrt(Q_t)` |
| CosineSimilarityNoSourceEmbeddingNormalization | `D_t / sqrt(Q_t)` |
| LogCosineSimilarity | `D_t / G / ln(1 + Q_t)` |
| CosineSimilarityFavL2NormBased | `D_t / S / sqrt(max(Q_t,H_t))` |
| …FavL2NormBasedWithExploration | Use ordinary cosine C if `C > minScore` and full-norm score H `> C/sqrt(2)`; otherwise use H |

Source: `simclusters/simclustersann/candidate_source/ApproximateCosineSimilarity.scala:73–131`; norm definition `simclusters/simclusters_v2/common/CosineSimilarityUtil.scala:29–30`. These are retrieval similarity scores, not engagement probabilities.

Per cluster it considers at most `maxTopTweetsPerCluster` entries. Excludes the source tweet itself when source is a tweet; accepts IDs between earliest and latest age cutoffs **inclusive**. If max age hours is **>= 175,200** (20×365×24), earliest ID becomes zero. Filters final score `>= minScore`, sorts descending, returns at most `min(maxNumResults,1000)`. This service code has no viewer blocked-author, followed-author, seen-post, language, NSFW, or conversation predicate in the scoring loop. [`simclusters/simclustersann/candidate_source/ApproximateCosineSimilarity.scala:31–33,57–87,128–131`]

Implementation selection flag `approximate_cosine_similarity` defaults **original**; unknown strings also select original. **Optimized** supports only log-cosine/cosine/no-source-normalization/dot-product in its match. **Experimental** adds optional cluster-detail filtering and a configurable exploration denominator (default sqrt(2)). Its detail ratio is `numUsersWithNonZeroFollowScore / numUsersWithAnyNonZeroScore`, zero for missing details or zero denominator, retaining clusters with ratio `>= threshold` when enabled (threshold default zero). This is not a language filter or a content-safety classifier. [`simclusters/simclustersann/modules/SimClustersANNCandidateSourceModule.scala:20–39`; `simclusters/simclustersann/candidate_source/OptimizedApproximateCosineSimilarity.scala:76–88`; `simclusters/simclustersann/candidate_source/ExperimentalApproximateCosineSimilarity.scala:38–53,77–85,115–146`]

### 6.2 Store limits, caches, model routing

The backend's separate `MaxTopTweetPerCluster` flag defaults **200**. It limits what the store returns before the request's own limit; requesting 800 does not override a server deployed at the 200 default. Cluster index store is selected from external `ClusterConfig`: Manhattan or Memcache, else empty. Norm lookup exceptions become missing/zero. Cache layers: cluster→tweets Memcache **15 minutes**, local cache **10 minutes**, 150,000 keys; async update default false. Service timeout flag default 40 and cache timeout 15 are millisecond-oriented server settings; inspect deployment for overrides. [`simclusters/simclustersann/modules/ClusterTweetIndexProviderModule.scala:37–113`; `simclusters/simclustersann/modules/FlagsModule.scala:8–41`]

The online `TopKTweetsForClusterReadableStore.multiGet` decays score fields to current time. Key wrapper validates embedding type/model and exact half-life, returns None for invalid combinations, keeps positive values, sorts descending, then caps. Manhattan RO helper directly converts stored scores without this online decay wrapper. Cached scores need not represent per-request recomputation at exact current time. [`simclusters/simclusters_v2/summingbird/stores/TopKTweetsForClusterReadableStore.scala:43–62,95–144,191–208,232–253`]

`SimClustersAnnVariantFilter` validates source model version + **candidate embedding type** against an external service-name mapper. Embedding store dispatch is keyed by `(embedding type, model version)`, missing mappings → None; decider key `enable_<type>_<version>` gates each store, with fallback `Decider.True`. ANN embedding registration includes longest-L2 tweet embeddings for Updated and 2020, plus producer, InterestedIn, APE, address-book, and next-interest variants; registration is not proof Home Mixer queries each variant. `StoreBuilder`, model/service mappings, representation-manager data provenance, and live deciders are external. [`simclusters/simclustersann/filters/SimClustersAnnVariantFilter.scala:33–50`; `simclusters/simclustersann/modules/EmbeddingStoreModule.scala:26–57,69–107`; `simclusters/simclusters_v2/stores/SimClustersEmbeddingStore.scala:28–64,78–104`]

### 6.3 Current For You integration versus legacy ANN library

Current checked-in Home Mixer request: source `LogFavLongestL2EmbeddingTweet`, candidate `LogFavBasedTweet`, model **2020**, cosine, **200 results per source**, request scan **50 clusters**, **800 top posts per cluster**, min score **0**, min candidate age **0h**, max candidate age default **48h**. Home Mixer then requires score **strictly > 0.5**, uses a 10,000 divided-by-number-of-signals per-query cap (minimum 1), deduplicating round-robin interleave, and caps merged output at **800**. It hydrates core data and removes author-ID-zero rows. Source query/cache key is `(engaged tweet ID, max age)`; cache TTL **600 seconds**, size 2 million. Signals are explicit+implicit engaged tweets, sorted newest-first and deduplicated. It is disabled for in-network-only requests and requests with cached posts. [`home-mixer/sources/simclusters_source.rs:24–34,50–53,88–142,156–201`; `home-mixer/params/param.rs:713–718`]

By contrast, `simclusters_v2/candidate_source/SimClustersANNCandidateSource.scala` is an older **library candidate source**, not the `simclustersann` service implementation. Its generic default config is 200 results, 1-day max age, min score 0.7, `LogFavBasedTweet`, partial normalization true, heavy ranking false, rerank budget 250, 200 tweets/cluster, 50 clusters. Crucially, its `minScore` is enforced by **HeavyRanker only**; with heavy ranking false, the library's fetch/rerank path simply orders and caps candidates without applying that minimum. Its log-cosine partial formula uses source **L2 norm**, unlike service LogCosine's source log norm. [`simclusters/simclusters_v2/candidate_source/SimClustersANNCandidateSource.scala:138–174,248–290`; `simclusters/simclusters_v2/candidate_source/HeavyRanker.scala:56–66`]

Legacy config mappings include filtered InterestedIn (partial normalization false, min 0.7, rerank 150), unfiltered InterestedIn (log-cosine, min 0, rerank 400), producer (min 0), longest-L2 tweet (min 0.3), relaxed producer (min 0.25), APE/next-interest (min 0, rerank 200), and topic embeddings (min 0.5, rerank 400). Those declared minima have the same heavy-ranker caveat. Legacy lookback media config: minimum 0 days, maximum **47 hours**, nominal `(2−0+1)×2000 = 6000` tweets per cluster for producer/tweet variants; topic variants still 200. Wrapper lookback is opt-in and merely concatenates online+lookback results without deduplication there. [`simclusters/simclusters_v2/candidate_source/SimClustersANNCandidateSource.scala:293–565`; `simclusters/simclusters_v2/candidate_source/SimClustersANNWrapperCandidateSource.scala:23–44`]

`ClusterRanker.getTopKClustersByScore` is a separate utility: rank by fav/follow/log-fav/cluster-normalized log-fav, or **producer-normalized** favorite for the option named `RankByNormalizedFavScore`; tie-break by the paired secondary score, take highest K, floor exported primary score at **1e-4**. It is not evidence that every current ANN query reselects clusters using that option. [`simclusters/simclusters_v2/candidate_source/ClusterRanker.scala:12–50`]

## 7. Topics, language, filters, and opt-out

### 7.1 Topic and locale embedding jobs

These are related sparse embedding producers, not additional proven current Home Mixer sources:

* **TFG topic embedding:** binary `(topic, language)→following user` matrix; require at least **100 topic-language followers**. Multiply row-L2-normalized topic audience by column-L2-normalized user interest matrix; retain **>0.001**, top **50 clusters per topic**. Fav and log-fav subclasses choose their corresponding interest scores; daily variants exist for Updated/2020. [`simclusters/simclusters_v2/scalding/embedding/tfg/TfgBasedTopicEmbeddingsBaseApp.scala:48–98`; `simclusters/simclusters_v2/scalding/embedding/common/SimClustersEmbeddingJob.scala:61–77`; `simclusters/simclusters_v2/scalding/embedding/tfg/FavTfgBasedTopicEmbeddings.scala:75–88`]
* **Inferred-language TFG:** one weighted row for topic+language+country, one topic+language, plus global topic weight 1. Language weights come from inferred consumed languages. Country-local rows need total L1 weight **>=10,000**; other rows **>=100**, not necessarily those exact counts of distinct people. Top 50, >0.001. [`simclusters/simclusters_v2/scalding/embedding/tfg/InferredLanguageTfgBasedTopicEmbeddingsBaseApp.scala:43–109`]
* **Engagement-weighted user-topic embedding:** select top **100 topics** per user/language by fav count, normalize each by sum of selected topic counts, and sum those weighted TFG topic embeddings. Input feature name is a **50-day favorite-count aggregate**; job reads recent aggregate data using a **21-day** feature-source lookback. These are distinct windows. [`simclusters/simclusters_v2/scalding/embedding/tfg/EngagementWeightedTfgBasedTopicEmbeddingsJob.scala:61–64,93–145,204–205`]
* **Locale entity V2:** takes Entity Real Graph Favorites EWMA at **14 days**, transforms with **ln(1+favScore)**, restricts to UTT entities, joins user language, then generic normalized matrix multiplication with user log-favorite interests. Top **100 clusters per entity** and **100 entities per cluster**, score >0.001. [`simclusters/simclusters_v2/scalding/embedding/LocaleEntitySimClustersEmbeddingV2Job.scala:179–235`]
* **Entity from producer embeddings:** uses the top **20 recommended producers per UTT entity**, normalizes their recommendation scores by score sum, combines producer embeddings, default top **100** output clusters. This is a semantic-entity construction path, not a promise that mentioning a topic gets that audience. [`simclusters/simclusters_v2/scalding/embedding/EntityEmbeddingFromProducerEmbeddingJob.scala:46,111,161–210`]
* **Global language embedding:** sum positive user log-favorite cluster scores once per joined favorite edge, divide by all users in that language source, keep top **400** clusters. This is activity-weighted rather than an unweighted average of active users. [`simclusters/simclusters_v2/scalding/embedding/GlobalSimClustersLanguageEmbedding.scala:51–130`]
* **Producer/topic follow-graph association:** separate account/topic job defaults to producers with 400 active followers, 50 producers per topic/locale, minimum 100 topic follows. Audience→topic follows and producer followers create the association. [`simclusters/simclusters_v2/scalding/topic_recommendations/ProducersForTopicsFromTopicFollowGraph.scala:71–75,146–151`]

### 7.2 Language and large-cluster filters are path-specific

Deprecated `LanguageFilteredLocaleEntityEmbeddingStore` keeps clusters whose highest device-language fraction matches requested locale language case-insensitively. **Missing cluster details pass**; details present but missing language distribution do not produce a matching dominant language. This is a cluster-level locale filter, not a universal tweet-language requirement. [`simclusters/simclusters_v2/stores/LanguageFilteredLocaleEntityEmbeddingStore.scala:12–16,33–71`]

`UserInterestedInReadableStore.defaultSimClustersEmbeddingStoreWithMtls` applies `numUsersInterestedInThisClusterUpperBound < 5,000,000`; absent size fails because `.exists` is required. PE/APE adapters call conversion without that size bound. Conversion chooses the specific raw fav/follow/log-fav field corresponding to embedding type; it does not always use cluster-normalized scores. Default model for this utility is Updated even though current Home Mixer source explicitly requests 2020. [`simclusters/simclusters_v2/summingbird/stores/UserInterestedInReadableStore.scala:26,50,64–75,111–135,193–241`]

Names such as `FilteredUserInterestedIn`, `UnfilteredUserInterestedIn`, `UserNextInterestedIn`, address-book variants, or `Model20m145k2020` identify representations/configurations. The external representation-manager store may implement additional transformations; the enum/name alone does not specify a complete filtering model. No inference that every For You viewer is assigned exactly one niche or that an author is permanently trapped in a cluster is justified.

### 7.3 Interest/KnownFor opt-out

`SimClustersOptOutUtil.getP13nOptOutSources` reads disabled personalization interests for **UserId** records. It distinguishes `RecommendationInterest` (InterestedIn) from `RecommendationKnownFor` (KnownFor), and only semantic-entity interests enter these sets. For each user, remove every cluster whose legible semantic-entity set has **any intersection** with opted-out entities, deduplicate remaining IDs, and omit empty results. No mapping/no opted-out set means no intersection and thus no removal. [`simclusters/simclusters_v2/scalding/optout/SimClustersOptOutUtil.scala:23–98`]

Legible entity embeddings use entity score **>=0.6**. Daily InterestedIn opt-out reads raw 2020 interests (28-day lookup range), preferences (4-day range), and legible entities (21-day prior range); daily KnownFor opt-out reads raw KnownFor (14-day), preferences (2-day), and legible entity data (90-day). These are snapshot-search windows, not necessarily retention or refresh latency. Output preserves scores only for allowed clusters and drops empty users. [`simclusters/simclusters_v2/scalding/inferred_entities/InferredEntities.scala:32–54`; `simclusters/simclusters_v2/scalding/optout/InterestedInOptOut.scala:35–57,97–124`; `simclusters/simclusters_v2/scalding/optout/KnownForOptOut.scala:35–57,62–95`]

This is not the same operation as a viewer clicking “Not interested” on a tweet, a block/mute filter, or disabling all personalization. No immediate propagation SLA or erasure from every derived tweet embedding can be inferred from these daily jobs.

## 8. Related code that must not be presented as active For You ranking rules

| Path/family | What is present; scope boundary |
|---|---|
| `simclusters_v2/scalding/offline_job/` | Offline aggregation/recommendation jobs. `SimClustersOfflineJob.computeAggregatedTweetClusterScores` emits normalized **fav, follow, and log-fav** 8-hour-decayed score families, unlike online TweetJob's log-fav contribution. Offline top tweet clusters default **400**, cluster top tweets **1,600**, thresholds 0.02/0.001. [`simclusters/simclusters_v2/scalding/offline_job/SimClustersOfflineJob.scala:24–110,113–164`] |
| `scalding/offline_tweets/ClusterTopMediaTweetsJob.scala` | Scheduled three-hour offline media lookback; **21-day** input lookback; **1,200 tweets per cluster/day partition**. Its files support lookback candidates; they do not change ordinary online index age to 21 days. [`simclusters/simclusters_v2/scalding/offline_tweets/ClusterTopMediaTweetsJob.scala:58–85,101–135`] |
| `summingbird/storm/Twhin*` | Dense TwHIN embeddings, not sparse SimClusters coordinates. Tweet job aggregates favoriter embeddings and separately quality-video-view embeddings. User job aggregates positive tweet interactions (fav/quote/repost/share/bookmark) and negative ones (report/see-fewer/not-interested/block/mute); login triggers a zero-vector update. Positive/negative half-life configuration is 1d/14d; dimensionality 200. These action sets are not weights in sparse TweetJob. [`simclusters/simclusters_v2/summingbird/storm/TwhinTweetJob.scala:49–111`; `simclusters/simclusters_v2/summingbird/storm/TwhinUserJob.scala:43–146`; `simclusters/simclusters_v2/summingbird/common/Configs.scala:42–48`; `simclusters/simclusters_v2/summingbird/common/Implicits.scala:73–83`] |
| `summingbird/storm/AdsTwhin*`, ads embedding stores | Ads-specific role/data paths and rebuilt/refreshed embeddings; general config includes **21-day AdsOldestTweetEventTime**. Do not apply this to organic sparse candidate retention or claim ads engagement is mixed into every organic tweet embedding. [`simclusters/simclusters_v2/summingbird/common/Configs.scala:9–10,69–73`; `simclusters/simclusters_v2/summingbird/storm/AdsTwhinRebuildTweetJob.scala:51–59`; `simclusters/simclusters_v2/summingbird/storm/AdsTwhinRebuildUserJob.scala:47–50`] |
| `simclusters_v2/stores/WtfMbcgStore.scala` | Reads **account** candidate sequences from Apollo for Who To Follow/model-based candidate generation, not tweet feed results. [`simclusters/simclusters_v2/stores/WtfMbcgStore.scala:15–34`] |
| `scalding/mbcg/`, `tweet_similarity/`, `scalding/tweet_similarity/` | Learned embedding generation, pair-feature adaptation, training-data collection and evaluation. Their feature/model definitions are not proof the current ANN service invokes the learned pair model. The shown current service directly runs its configured cosine implementation. |
| `scalding/embedding/twice/`, `common/clustering/` | Multi-interest clustering and representative selection (Louvain, connected components, largest dimension, medoid/max-fav representatives); do not replace the audited ordinary II/KnownFor aggregation with these variants merely because they coexist. [`simclusters/simclusters_v2/scalding/embedding/twice/InterestedInTwice.scala:35–49,118–142,162–185`] |
| `scalding/multi_type_graph/` | Multi-type graph includes follow/fav/block/abuse/spam-report users, followed topics, signup country, consumed language, favored/replied/reposted/notif-opened tweets, and search queries. Config has 100-day fav half-life, global min frequency 100, type-specific top-K caps. These are **not** a direct current For You signal-weight table. [`simclusters/simclusters_v2/scalding/multi_type_graph/assemble_multi_type_graph/Config.scala:12–30`] |
| `scalding/embedding/abuse/` | Abuse-oriented single-side/paired/cross-SimCluster feature generation. It is not evidence that cluster similarity itself is a visibility label or that a particular niche is suppressed. |
| `scalding/inferred_entities/`, topic recommendation jobs, `ClusterDetailsJob`, evaluation/conversion jobs | Human-legible labels, topic/account associations, aggregate cluster metadata, analytics, and output formats. These explain representation interpretation; they are not additional feed scoring stages without a demonstrated call path. |
| Phoenix rank-all `Analysis` | Consumes scored-candidate logs with a configured score-prefix default `phoenix.HomeExperiment1Lap7.`; this is analysis output, not an admission score used by Main. [`phoenix-rankall/src/config/mod.rs:47–52,117–123`] |
| Phoenix `ads`, `search_unfiltered`, NSFW/evergreen/video/topic corpus helpers | Distinct routes/windows; do not generalize their exceptions or thresholds to ordinary Home recommendations. See §§2–3. |

## 9. Translating “target a niche” into supported mechanisms

1. **An audience member follows the author:** directly adds that author's recent posts/reposts/eligible replies to the audience member's Thunder supply, subject to caller's follow list, caps, timeout, deletion, later filters, and ranker. It also contributes an incoming edge to follow-based producer representations and to that member's outgoing interest profile.
2. **The author follows niche accounts:** modifies the author's own outgoing follow graph and potentially their own InterestedIn/recommendation experience. It does **not** by itself put the author's posts into those accounts' followers' Thunder lists, make those people follow the author, or establish the author's producer audience. No “follow X accounts for guaranteed distribution to X's audience” rule is present.
3. **Niche consumers like the author's posts:** in sparse TweetJob, their qualified cluster-normalized log-favorite interests contribute to the post's coordinates, decaying with 8-hour half-life. Audience composition matters, not just raw like count. Producer embeddings can also reflect those consumers' long-term interests through offline incoming-edge aggregation.
4. **A viewer previously engages with a related tweet:** current Home Mixer can use that tweet's longest-L2 embedding as an ANN seed, retrieving shared-cluster candidates and requiring cosine >0.5 at the wrapper. “Related” here is engagement-cluster similarity; it is not demonstrated keyword matching.
5. **A post is annotated into a Phoenix topic corpus:** can make it eligible for a topic-retrieval route. Some experimental variants also require curated author categories or topic consistency among the last 15 selected original/quote posts. Which option is queried and deployed is external/configured; all six being generated does not mean all six decide the same feed.
6. **An author has few followers:** SID-tail's default `<1000` admission is one explicit small-author route. KnownFor's 400-active-follower and producer embedding's >100-faver/follower thresholds apply to different constructions; they do not imply accounts below them are excluded from Thunder/Phoenix/post-based ANN altogether.

Supported strategy-level inference: relevant engagement from the intended audience can shape engagement-derived retrieval representation; coherent content can affect annotation-based topic admission. **Not established:** a universal niche score, a required following/follower ratio, a numeric “stay in niche” multiplier, guaranteed reach from hashtags, a fixed posting cadence, an exact time-to-reclassification, or causal reach gains from any specific manipulation. Retrieval eligibility and similarity must still pass final hydration, filters, and ranking.

## 10. Configuration and evidence gaps

* No deployed flag/decider snapshots, traffic shares, actual corpus sizes, freshness SLAs, user cluster assignments, embeddings, curated author lists, or model weights are supplied by these directories. Checked-in names and constants are not production measurements.
* External dependencies include SBF `MHAlgorithm`, Algebird implementations, DAL source definitions/snapshots, representation-manager `StoreBuilder`, SimClusters multicluster/service mappers and parts of generated Thrift schemas, content-understanding annotation generation and category mappings, VF service results, SID lookup service, and snapshot→checkpoint deployment orchestration. Cite the interface and local transformation; do not invent their internals.
* The SimClusters full graph/KnownFor/InterestedIn lineage explains available builders. The ANN service delegates actual embedding reads through representation-manager; the exact deployed dataset/version's complete production lineage cannot be established merely by co-location of historical builders.
* Many historical timestamps in job classes are schedule start dates, not proof those versions remain deployed unchanged. Conversely, the current Home Mixer SimClusters source is explicit; do not label the entire directory “historical and inactive.”
* Source-local edge cases are material: Thunder's same-second rejection and insertion-order queues; retention only on insert/trim; Phoenix `1fav` count race; search/evergreen/NSFW exceptions; no rank-all tombstone record; high-water-mark count merging; online SimClusters 50 versus offline 400 cap; soft 1.2K cache truncation; service store default 200 versus request 800; legacy minScore ignored without heavy ranking. Preserve these distinctions when answering threshold questions.
