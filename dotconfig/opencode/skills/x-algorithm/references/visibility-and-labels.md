# Visibility filtering and label propagation

Audited snapshot: `3aa0fa336c4a20e4149b6151629b6050897bb8a5`. Citations are repository-relative `path:line` followed by symbols; the corresponding files are bundled under `../source/`. This is an inventory of the published implementation and its defaults, not a readout of live feature switches. See [transparency and takedowns](transparency-and-takedowns.md) for legal-country joins and the report's counting rules.

## What executes, and in what order

`Policy::evaluate` ANDs the conditions in each clause, checks its audience, and walks the registered clauses in order. The first **Drop or Tombstone is terminal**. Interstitial and limited-engagement slots retain their first matching rule independently; a later terminal discards both. No match produces unrestricted `Shown`. Several clauses can share one rule name. Registry tests count **30 Home rule names, 56 recommendation rule names**; these are not counts of predicate clauses. (`visibility-filtering/rules/registry.rs:33-84`, `Policy::rules/evaluate`; `visibility-filtering/rules/rule_spec.rs:118-146`, `RuleClause::applies`, `Audience::admits`; `visibility-filtering/rules/registry.rs:231-307`, `wired_rule_order_matches_pre_migration_sequence`.)

| Policy | Registered sequence |
|---|---|
| `FilterAll` | `FilterAllRule`: no conditions, everyone, Drop `UnspecifiedReason`. |
| `TimelineHome` | Rules 1–30 below. |
| `TimelineHomeRecommendations` | Rules 1–30, then 31–56. Recommendation-only rows are all drops, including those after Home interstitial rows. |
| `TimelineHomeHydration` | Rules 9–16, **24**, 19–23, 25–30, in that order. Omits author-state, socialgraph, nullcast, stale-edit, and recommendation-only blocks. |

Sources: `visibility-filtering/rules/registry.rs:100-136`, the four policy statics; `visibility-filtering/rules/tweet_rules.rs:421-426`, `FILTER_ALL`; `visibility-filtering/rules/registry.rs:310-338`, hydration-order test.

Audience legend: **E** = everyone; **A** = everyone except the logged-in candidate author; **AF** = everyone except author and logged-in followers. Logged-out viewers are not rescued by a follower bit. Unless AF is explicitly written, **a follower is not a rule-level exception**. The caller normally selects Home for in-network posts and Recommendations for out-of-network posts. In `VFCandidateHydrator`, missing `in_network` means out-of-network, ancestors/quotes go to Recommendations, repost originals go to Home, and Home results overwrite recommendation results for overlapping IDs. This is why the README's follower shorthand must not be generalized into every individual predicate. (`visibility-filtering/rules/rule_spec.rs:125-135`, `Audience::admits`; `visibility-filtering/models/mod.rs:89-100`, author/follow predicates; `home-mixer/candidate_hydrators/vf_candidate_hydrator.rs:60-110`, `hydrate`; `README.md:397-400`.)

### Complete Home rule registry

`D(x)` = Drop with `FilteredReason::x`. `I(x)` = media interstitial with `InterstitialReason::x(true)`, legacy reason `ContainNsfwMedia`. `D(NSFW-result)` = `SafetyResult { reason: NsfwHighPrecision, action: Drop }`, not a label named “NSFW-result”. Predicate definitions below remove ambiguity from abbreviated table terms.

| # | Exact rule name | Predicate (all required unless OR shown) | Audience | Treatment | Source / registry block |
|---:|---|---|:---:|---|---|
| 1 | `SuspendedAuthorRule` | author `is_suspended` | A | D(`AuthorIsSuspended`) | `visibility-filtering/rules/author_rules.rs:22-30`, `AUTHOR_STATE_DROPS` |
| 2 | `DeactivatedAuthorRule` | author `is_deactivated` | A | D(`AuthorIsDeactivated`) | `visibility-filtering/rules/author_rules.rs:31-38` |
| 3 | `ErasedAuthorRule` | author `is_erased` | A | D(`AuthorAccountIsInactive`) | `visibility-filtering/rules/author_rules.rs:39-46` |
| 4 | `OffboardedAuthorRule` | author `is_offboarded` | A | D(`AuthorAccountIsInactive`) | `visibility-filtering/rules/author_rules.rs:47-54` |
| 5 | `ProtectedAuthorDropRule` | author `is_protected` | AF | D(`AuthorIsProtected`) | `visibility-filtering/rules/author_rules.rs:55-63` |
| 6 | `ViewerBlocksAuthorRule` | logged in AND viewer blocks author | E | D(`ViewerBlocksAuthor`) | `visibility-filtering/rules/author_rules.rs:175-188`, `SOCIALGRAPH_DROPS` |
| 7 | `ViewerMutesAuthorRule` | logged in AND viewer mutes author | E | D(`ViewerMutesAuthor`) | `visibility-filtering/rules/author_rules.rs:189-199` |
| 8 | `MutedRetweetsRule` | logged in AND repost AND viewer mutes reposts from author | E | D(`UnspecifiedReason`) | `visibility-filtering/rules/author_rules.rs:200-212` |
| 9 | `PdnaTweetLabelRule` | post label `PDNA` | A | D(NSFW-result) | `visibility-filtering/rules/tweet_rules.rs:11-14,61-67`, `TWEET_LABEL_DROPS` |
| 10 | `BounceTweetLabelRule` | `BOUNCE` | A | D(`TweetIsBounced`) | `visibility-filtering/rules/tweet_rules.rs:68-73` |
| 11 | `SpamTweetLabelRule` | `SPAM` | A | D(`PossiblyUndesirable`) | `visibility-filtering/rules/tweet_rules.rs:74-79` |
| 12 | `ForEmergencyUseOnlyDropRule` | `FOR_EMERGENCY_USE_ONLY` | E | D(`UnspecifiedReason`) | `visibility-filtering/rules/tweet_rules.rs:80-85` |
| 13 | `FosnrHatefulConductDropRule` | `FOSNR_HATEFUL_CONDUCT` | A | D(`PossiblyUndesirable`) | `visibility-filtering/rules/tweet_rules.rs:86-91` |
| 14 | `FosnrViolentSpeechDropRule` | `FOSNR_VIOLENT_SPEECH` | A | D(`PossiblyUndesirable`) | `visibility-filtering/rules/tweet_rules.rs:92-97` |
| 15 | `FosnrAbuseDropRule` | `FOSNR_ABUSE` | A | D(`PossiblyUndesirable`) | `visibility-filtering/rules/tweet_rules.rs:98-103` |
| 16 | `FosnrCivicIntegrityDropRule` | `FOSNR_CIVIC_INTEGRITY` | A | D(`PossiblyUndesirable`) | `visibility-filtering/rules/tweet_rules.rs:104-110` |
| 17 | `NullcastedTweetDropRule` | nullcast AND not repost AND not community post | E | D(`TweetIsNullcast`) | `visibility-filtering/rules/tweet_rules.rs:375-384`, `NULLCAST_DROP` |
| 18 | `DropStaleTweetsRule` | superseded edit AND not repost | E | D(`UnspecifiedReason`) | `visibility-filtering/rules/tweet_rules.rs:386-394`, `STALE_TWEET_DROP` |
| 19 | `DropLegalTakendownPostRule` | legal-country join (spelling `Takendown` is literal) | A | D(`UnspecifiedReason`) | `visibility-filtering/rules/tweet_rules.rs:396-407`, `TAKEDOWN_DROPS` |
| 20 | `DropLocalLawsTakendownPostRule` | local-laws-country join | A | D(`UnspecifiedReason`) | `visibility-filtering/rules/tweet_rules.rs:408-419` |
| 21 | `SensitiveViewerLoggedOutDropRule` | logged out AND any one of sensitive clauses S1/S2/S3 below | A | D(`ContainNsfwMedia`) | `visibility-filtering/rules/tweet_rules.rs:312-333`, `SENSITIVE_VIEWER_DROPS` |
| 22 | `SensitiveViewerUnderageDropRule` | known age <18 AND S1/S2/S3 | A | D(`ContainNsfwMedia`) | `visibility-filtering/rules/tweet_rules.rs:334-345` |
| 23 | `SensitiveViewerNoStatedAgeDropRule` | logged in, age `NotStated`, NSFW-gating country AND S1/S2/S3 | A | D(`ContainNsfwMedia`) | `visibility-filtering/rules/tweet_rules.rs:346-373` |
| 24 | `DropExclusiveTweetContentRule` | exclusive content AND [logged out OR (not conversation author AND not super-follower AND (repost OR not candidate author))] | mixed; see formula | D(`ExclusiveTweet`) | `visibility-filtering/rules/tweet_rules.rs:247-275`, `EXCLUSIVE_TWEET_DROP` |
| 25 | `NsfwHighPrecisionAdultInterstitialRule` | `NSFW_HIGH_PRECISION`, post timestamp **>1705536000000**, sensitive-media opt-in false | A | I(`Nudity`) | `visibility-filtering/rules/tweet_rules.rs:112-129`, `NSFW_MEDIA_INTERSTITIALS` |
| 26 | `NsfwHighPrecisionInterstitialRule` | `NSFW_HIGH_PRECISION`, timestamp **≤1705536000000**, opt-in false | A | I(`Sensitive`) | `visibility-filtering/rules/tweet_rules.rs:130-144` |
| 27 | `GoreAndViolenceInterstitialRule` | `GORE_AND_VIOLENCE_HIGH_PRECISION`, opt-in false | A | I(`Violence`) | `visibility-filtering/rules/tweet_rules.rs:145-156` |
| 28 | `NsfwCardImageInterstitialRule` | `NSFW_CARD_IMAGE`, opt-in false | A | I(`Sensitive`) | `visibility-filtering/rules/tweet_rules.rs:157-169` |
| 29 | `NsfwAdminInterstitialRule` | (author admin-NSFW OR post admin-NSFW), has media, opt-in false | A | I(`Sensitive`) | `visibility-filtering/rules/tweet_rules.rs:277-293`, `NSFW_AUTHOR_INTERSTITIAL` |
| 30 | `NsfwUserInterstitialRule` | (author self-NSFW OR post self-NSFW), has media, opt-in false | A | I(`SensitiveUser`) | `visibility-filtering/rules/tweet_rules.rs:294-310` |

Sensitive clauses (three ordered clauses per rule name): **S1** has media AND one of `NSFW_HIGH_PRECISION`, `NSFW_HIGH_RECALL`, `GORE_AND_VIOLENCE_HIGH_PRECISION`; **S2** has media AND **not repost** AND any author/post NSFW user/admin flag; **S3** `NSFW_TEXT` OR `NSFW_CARD_IMAGE`, with **no media requirement**. No sensitive-media opt-in exception is present in these drops. (`visibility-filtering/rules/tweet_rules.rs:20-51,321-373`.) Conversely, label-based interstitial rules 25–28 have **no explicit has-media predicate**.

### Complete recommendation-only extension

These execute only when the selected policy is `TimelineHomeRecommendations`; they are not dynamically skipped merely because a follow relationship exists. All are Drop.

| # | Exact rule name | Trigger | Audience | `FilteredReason` | Source |
|---:|---|---|:---:|---|---|
| 31 | `DropTweetsWithDmcaMediaRule` | `has_dmca_media` | E | `UnspecifiedReason` | `visibility-filtering/rules/tweet_rules.rs:428-436`, `RECS_MEDIA_DROPS` |
| 32 | `DropTweetsWithGeoRestrictedMediaRule` | request country fails media allow/deny lists | E | `UnspecifiedReason` | `visibility-filtering/rules/tweet_rules.rs:437-448` |
| 33 | `DropNsfwUserAuthorRule` | author `is_nsfw_user` | A | `ContainNsfwMedia` | `visibility-filtering/rules/author_rules.rs:65-73`, `OON_NSFW_AUTHOR_DROPS` |
| 34 | `DropNsfwAdminAuthorRule` | author `is_nsfw_admin` | A | `ContainNsfwMedia` | `visibility-filtering/rules/author_rules.rs:74-82` |
| 35 | `TweetNsfwUserDropRule` | post user-NSFW flag | E | `ContainNsfwMedia` | `visibility-filtering/rules/tweet_rules.rs:171-179`, `OON_TWEET_FLAG_DROPS` |
| 36 | `TweetNsfwAdminDropRule` | post admin-NSFW flag | E | `ContainNsfwMedia` | `visibility-filtering/rules/tweet_rules.rs:180-188` |
| 37 | `NsfwHighRecallDropRule` | post `NSFW_HIGH_RECALL` | A | `ContainNsfwMedia` | `visibility-filtering/rules/tweet_rules.rs:190-196`, `OON_TWEET_LABEL_DROPS` |
| 38 | `NsfwHighPrecisionOonDropRule` | post `NSFW_HIGH_PRECISION` | A | `ContainNsfwMedia` | `visibility-filtering/rules/tweet_rules.rs:197-203` |
| 39 | `GoreAndViolenceOonDropRule` | post `GORE_AND_VIOLENCE_HIGH_PRECISION` | A | `ContainNsfwMedia` | `visibility-filtering/rules/tweet_rules.rs:204-209` |
| 40 | `NsfwCardImageOonDropRule` | post `NSFW_CARD_IMAGE` | A | `ContainNsfwMedia` | `visibility-filtering/rules/tweet_rules.rs:210-215` |
| 41 | `DoNotAmplifyOonDropRule` | post `DO_NOT_AMPLIFY` | A | `PossiblyUndesirable` | `visibility-filtering/rules/tweet_rules.rs:216-221` |
| 42 | `MaliciousUrlOonDropRule` | post `MALICIOUS_URL` | A | `PossiblyUndesirable` | `visibility-filtering/rules/tweet_rules.rs:222-227` |
| 43 | `SpamHighRecallDropRule` | post `SPAM_HIGH_RECALL` | A | `PossiblyUndesirable` | `visibility-filtering/rules/tweet_rules.rs:228-233` |
| 44 | `NsfwTextTweetLabelDropRule` | post `NSFW_TEXT` | A | NSFW-result (defined above) | `visibility-filtering/rules/tweet_rules.rs:234-239` |
| 45 | `FosnrAbuseInsultsOonDropRule` | post `FOSNR_ABUSE_INSULTS` | A | `PossiblyUndesirable` | `visibility-filtering/rules/tweet_rules.rs:240-245` |
| 46 | `NsfwHighRecallUserLabelRule` | author `NsfwHighRecall` | A | `UnspecifiedReason` | `visibility-filtering/rules/author_rules.rs:84-92`, `OON_USER_LABEL_DROPS` |
| 47 | `NsfwHighPrecisionUserLabelRule` | author `NsfwHighPrecision` | A | `UnspecifiedReason` | `visibility-filtering/rules/author_rules.rs:93-100` |
| 48 | `SpamHighRecallUserLabelRule` | author `SpamHighRecall` | A | `UnspecifiedReason` | `visibility-filtering/rules/author_rules.rs:101-108` |
| 49 | `CompromisedUserLabelRule` | author `Compromised` | A | `UnspecifiedReason` | `visibility-filtering/rules/author_rules.rs:109-116` |
| 50 | `ReadOnlyUserLabelRule` | author `ReadOnly` | A | `UnspecifiedReason` | `visibility-filtering/rules/author_rules.rs:117-124` |
| 51 | `ImpersonationHighPrecisionUserLabelRule` | author `ImpersonationHighPrecision` | A | `UnspecifiedReason` | `visibility-filtering/rules/author_rules.rs:125-132` |
| 52 | `NsfwAvatarImageRule` | author `NsfwAvatarImage` | A | `UnspecifiedReason` | `visibility-filtering/rules/author_rules.rs:133-140` |
| 53 | `NsfwBannerImageRule` | author `NsfwBannerImage` | A | `UnspecifiedReason` | `visibility-filtering/rules/author_rules.rs:141-148` |
| 54 | `AbusiveHighRecallRule` | author `AbusiveHighRecall` | **AF** | `UnspecifiedReason` | `visibility-filtering/rules/author_rules.rs:149-156` |
| 55 | `NsfwNearPerfectAuthorRule` | author `NsfwNearPerfect` | A | `UnspecifiedReason` | `visibility-filtering/rules/author_rules.rs:157-164` |
| 56 | `DoNotAmplifyNonFollowerRule` | author `DoNotAmplify` | **AF** | `UnspecifiedReason` | `visibility-filtering/rules/author_rules.rs:165-173` |

### Treatment is not a ranking coefficient

The published policy constructs Drop and Interstitial only. Tombstone/`LocalRegulations` and LimitedEngagement/`ConversationControl` are modeled but explicitly marked unused until a policy clause exists. `Downrank` and `Avoid` exist in the client action enum, not in these rule tables. No score multiplier or numerical downrank is calculated by `Policy::evaluate`. (`visibility-filtering/rules/rule_spec.rs:97-116`, `ActionSpec`; `visibility-filtering/models/verdict.rs:34-52`; `visibility-filtering-client/models.rs:56-67`, `Action`; `README.md:470-472`.)

| Boundary | Actual behavior |
|---|---|
| Legacy/protobuf `filter_tweets` | `proto_action`: Drop→Drop; Tombstone→Drop/Unspecified; any media restriction→Interstitial + legacy reason; no media→Allow, even if engagement exists. Evaluation completeness status is not exposed by `to_visibility_result`. (`visibility-filtering/treatment.rs:99-129`; `visibility-filtering/filter_tweets.rs:125-134`.) |
| Thrift `evaluate_tweets` | Unrestricted→Allow; media-only→`ComposedMediaVisibilityResults`/`BlurredImageInterstitial`, opacity **0.8**; engagement-only→LimitedEngagements; simultaneous media+engagement→not representable here (`None`). Only protected, suspended, author-blocks-viewer, viewer-blocks-author, viewer-mutes-author, exclusive, and FilterAll-unspecified Drop reasons are projected; other drops return `None` and become **NotEvaluated**, not Allow. (`visibility-filtering/treatment.rs:12-83`.) |
| `EvaluateTweetsEndpoint` | Unknown safety enum→invalid argument; known enum without Rust policy→unimplemented. Quote-context inputs→NotEvaluated and are not hydrated; incomplete or unresolved candidate→Failed; unsupported treatment projection→NotEvaluated; serialization failure→Failed. (`visibility-filtering/evaluate_tweets.rs:48-116`.) |
| Home `VFFilter` | Drops `Drop`, `Tombstone`, `NotEvaluated`; keeps `Allow`, `Interstitial`, `Avoid`, `Downrank`; missing action also kept. Keeping a Downrank action here does not prove a downstream score change. (`home-mixer/filters/vf_filter.rs:8-26`.) |
| Ancillary posts | A successfully returned dropping action on an ancestor, quote, or repost original drops the candidate; tombstoned ancestor IDs are skipped. Missing/error ancillary results do not trip this predicate. (`home-mixer/candidate_hydrators/vf_candidate_hydrator.rs:140-168`, `should_drop_ancillary`.) |

## Hydrated context, defaults, and failure distinctions

| Context | Source and exact semantics |
|---|---|
| Viewer identity | `normalize_viewer_id` accepts only IDs with signed-i64 interpretation >0; absent/zero/out-of-range become logged out. (`visibility-filtering/filter_tweets.rs:102-104`.) |
| Viewer preference/age/country | Gizmoduck ACCOUNT + EXTENDED_PROFILE. `nsfw_view` missing→false. Age present→`Known`; no age on existing account→`NotStated`; nonexistent user→`Unknown`. RPC error/timeout→**Incomplete** `(false, Unknown, no account country)` while retaining logged-in identity and request country. Logged out→complete `(false, Unknown, none)`. Countries lowercased. (`visibility-filtering/hydration/viewer_hydrator.rs:13,20-85`, `hydrate`.) |
| Unknown versus unstated age | `Known(age)<18` alone is underage. Only logged-in `NotStated` qualifies for no-stated-age gating. `Unknown` does not. Consequently lookup failure does not become “underage” or “no stated age”, but false sensitive preference can still yield an interstitial. (`visibility-filtering/models/viewer.rs:17-43`; viewer hydrator above.) |
| Country choice | NSFW gating: account country, falling back to request country. Legal and media geo joins: **request country only**. These are intentionally different accessors. (`visibility-filtering/rules/context.rs:78-85,262-286`.) |
| Author identity | Request author wins, then TES pure-core author, then recovered author-ID cache. If all absent, candidate cannot resolve. Composite-TES author is not used in this resolver. (`visibility-filtering/models/mod.rs:53-75`, `resolve_candidate`.) |
| Author state and labels | One Gizmoduck SAFETY+LABELS lookup per distinct author, projected by key to posts. Flags map directly. Absent user→all-false/empty default. Missing/Failed/Partial response state→Incomplete; other response states complete. Only 11 LabelValue variants map into the author bitset; others counted as unmapped, ignored. (`visibility-filtering/hydration/gizmoduck_hydrator.rs:39-145`, `hydrate`, `evaluable_author_features`, `author_label`.) |
| Socialgraph | Logged-out: complete default relationships without RPC. Logged-in: distinct author batch; missing responses marked failed; final absent values default all false (including follow/block/mute). Thus failure can remove follower exceptions while suppressing a block/mute trigger; there is no single universal fail-open/fail-closed description. (`visibility-filtering/hydration/socialgraph_hydrator.rs:18-55,100-116`; `visibility-filtering/hydration/mod.rs:86-108`; `visibility-filtering/models/relationship.rs:1-7`.) |
| Exclusive content | Composite TES provides conversation author. Super-follow checked against distinct **conversation/root authors**. Missing key in successful map→false/complete; RPC failure/timeout→false/incomplete but exclusive control retained. Logged out uses empty successful map. (`visibility-filtering/hydration/exclusive_content_hydrator.rs:18-68`; `visibility-filtering/rules/context.rs:115-133`.) |
| Post features | Core text from pure-core; source/repost ID, media, takedowns, NSFW flags, community/nullcast/edit control from composite TES. Missing composite→default fields, even if pure-core has source information. Has-media means nonempty media entities; restrictions only from entities with media keys, metadata and restrictions; DMCA ORed, allow and deny lists concatenated. (`visibility-filtering/hydration/tes_hydrator.rs:162-219`, `build_tweet_features`, `media_feature`.) |
| Superseded edit | Initial edit list or nested initial edit list on an edit; stale iff last ID exists and differs from candidate ID. Missing edit control/nested initial/empty list→false. Repost is simply present `source_tweet_id`. (`visibility-filtering/models/mod.rs:106-108,126-142`.) |
| Label lookup | Successful full map retained for response; key-only set used for rules. Error/missing map→empty rule label set **without** a successful full-map response. Empty successful map and failed lookup are different. (`visibility-filtering/hydration/safety_label_hydrator.rs:41-61`.) |
| Combined completeness | A candidate is failed if pure core absent, author not complete-found/not-found, failed relationship/composite, absent full label map, or incomplete exclusive. Viewer incomplete marks all resolved candidates failed. Nevertheless `FilterTweets::run` evaluates available/default context. Unresolved author yields Drop `UnspecifiedReason`, `by="unresolved_author_id"`; legacy endpoint returns verdict, typed endpoint reports failure. (`visibility-filtering/hydration/mod.rs:273-313`; `visibility-filtering/filter.rs:67-101`; `visibility-filtering/models/verdict.rs:55-61`.) |

### Cache and client boundaries

* Production Flock queries use forward **Positive** edges: follows graph **1**, blocks **3**, mutes **23**, muted reposts **10**, super-follows **55**. Successful responses with missing query-result slots decode those slots to empty edge sets and still create a relationship record for every requested author; this differs from RPC error, which returns an empty map and becomes failed hydration. Packed IDs decode complete eight-byte little-endian chunks, ignoring remainder bytes. Super-follow successful missing result also becomes an empty set (false), not a transport failure. (`visibility-filtering/clients/socialgraph_client.rs:11-15,63-91,102-158,194-240`, `decode_relationship_edges`, `select_edge_set`, `ProdSocialgraphClient`.)
* Author fallback cache is optional (`VF_FALLBACK_CACHE_ENABLED`, default off); author-ID fallback defaults on (`VF_AUTHOR_ID_FALLBACK_ENABLED`) with capacity `VF_AUTHOR_ID_FALLBACK_CAPACITY`, default **1,000,000**. Flags accept `1/true/yes/on` case-insensitively. Cache warming/dual-call comparison also default off. (`visibility-filtering/config.rs:39-71`.)
* `FallbackCache::resolve_hydration_batch` writes Found and NotFound; only Failed looks up resident stale Found/NotFound. It is capacity-bounded, with **no wall-clock TTL in CacheEntry**; generations stop older requests overwriting newer entries. Recovered author completeness is preserved, so an incomplete stored author remains incomplete; recovered author ID does not restore missing pure core. (`visibility-filtering/hydration/fallback_cache.rs:15-19,60-118,132-151`; `visibility-filtering/hydration/tes_hydrator.rs:121-160`; completeness check above.)
* Safety-label local cache: **1,000,000 entries**, posts younger than **5 minutes** get min(**30 seconds**, remaining time to five-minute boundary), older get **60 seconds**. Future-ID/invalid age not inserted. Only successes cached, including successful empty maps. This is cache TTL, **not the label's semantic expiration**. (`visibility-filtering/safety_label_source/source.rs:13-31,58-113`, `ttl_for_tweet`, `backfill_local`.)
* Remote chain: Twemcache hit wins; NotFound/Deleted→successful empty labels; miss, bad/missing response or decoding failure falls through to Manhattan. Missing/failed Manhattan is error, not clean empty. Ordinary cache misses optionally trigger warming. (`visibility-filtering/safety_label_source/cached_value.rs:16-40`, `decode`; `visibility-filtering/safety_label_source/lookup.rs:65-140`, `RemoteSource::get`.)
* Full label data transports score, applicable users/countries, holdback experiment, free-form source, typed source (`BotMakerAction.rule_id`, `ToolAction.agent_tool/actor_ldap`, `GrokAnnotationAction.source`), created and expiration timestamps. **Rule membership reads only keys**: this layer does not compare confidence, user/country applicability, holdback, or expiration itself. Upstream persistence/expiration internals are not supplied by the imported store. (`visibility-filtering-client/tweet_safety_label.rs:180-225`, `proto_to_safety_label`; `visibility-filtering/models/safety_labels.rs:15-27`; `visibility-filtering/safety_label_source/proto.rs:7-47`.)
* Safety-label client default **200 ms / 50 IDs per batch**; zero override restores defaults. Partial lookup IDs→`LookupFailed`; RPC-failed chunk IDs→`BatchFailed`; batch API returns an aggregate `Ok` with failures, not fabricated clean labels. (`visibility-filtering-client/tweet_safety_label.rs:18-31,161-177,229-333`.)
* Filter client default **400 ms / 50 IDs**; per-RPC errors become per-ID errors. Missing returned ID→`NotEvaluated`/Unspecified + label LookupFailed; missing action uses default `NotEvaluated`. Typed decoder enforces exact result count/order, present outcomes, 64 KiB action limit, no trailing bytes, and rejects an encoded NotEvaluated as evaluated action. (`visibility-filtering-client/vf_client.rs:243-245,370-458`; `visibility-filtering-client/evaluated.rs:5-41`.)
* `to_proto_safety_level` maps the client's `FilterNone`, Search variants, and `ExploreNsfwRecommendations` to **FilterAll**, not new implemented Rust policies. (`visibility-filtering-client/vf_client.rs:399-411`.)

## Exact label namespaces and impact crosswalk

Do not conflate a post `SafetyLabelType`, a Gizmoduck `LabelValue`, the local `AuthorLabel`, a `SafetyResultReason`, and an account/post safety flag. The imported **complete** `SafetyLabelType` and `LabelValue` definitions and numeric IDs are not in these directories; `visibility-filtering/models/safety_labels.rs:1` reexports the former. The tables above cover **every active label predicate in this registry**, not every possible upstream enum member. Presence in an enum/transport/report allowlist is not proof of a wired treatment.

### Author label conversion (exhaustive local mapping)

All mapped labels have the recommendation Drop shown above; only the two explicitly AF rows preserve a follower exception within that policy.

| Gizmoduck exact `LabelValue` | Local exact `AuthorLabel` / public report key | Rule # |
|---|---|---:|
| `NSFW_HIGH_RECALL` | `NsfwHighRecall` | 46 |
| `NSFW_HIGH_PRECISION` | `NsfwHighPrecision` | 47 |
| `NSFW_NEAR_PERFECT` | `NsfwNearPerfect` | 55 |
| `NSFW_AVATAR_IMAGE` | `NsfwAvatarImage` | 52 |
| `NSFW_BANNER_IMAGE` | `NsfwBannerImage` | 53 |
| `SPAM_HIGH_RECALL` | `SpamHighRecall` | 48 |
| `ABUSIVE_HIGH_RECALL` | `AbusiveHighRecall` | 54 (AF) |
| `COMPROMISED` | `Compromised` | 49 |
| `READ_ONLY` | `ReadOnly` | 50 |
| `IMPERSONATION_HIGH_PRECISION` | `ImpersonationHighPrecision` | 51 |
| `DO_NOT_AMPLIFY` | `DoNotAmplify` | 56 (AF) |

Source: `visibility-filtering/hydration/gizmoduck_hydrator.rs:130-145`, `author_label`; local enum `visibility-filtering/models/author.rs:56-70`. `NsfwAdmin` in the report is a **safety flag**, not a twelfth local `AuthorLabel`. `POSSIBLY_NSFW_ACCOUNT` is an allowed aggregation output but is **not mapped by this Rust author hydrator**. `SOFT_NSFW` is an aggregation input but has **no active Rust rule here**. `EGREGIOUS_NSFW` is used as an unrelated-label test, not an active predicate (`visibility-filtering/rules/tweet_rules.rs:488-517`). `NSFA_HIGH_PRECISION` appears in storage-codec fixtures, not the active registry (`visibility-filtering/safety_label_source/cached_value.rs:130-155`).

### Complete client `SafetyResultReason` taxonomy

These are reason codes, **not a list of active safety labels or classifier outputs**. Exact JSON strings follow `#[serde(rename_all = "SCREAMING_SNAKE_CASE")]`. All 32 variants and IDs are below. Only `NsfwHighPrecision` is constructed by the published tweet-rule constants (PDNA and NSFW_TEXT drops); existence of the others does not activate a rule. Thrift unknown numeric values default to `Episodic`. (`visibility-filtering-client/models.rs:12-47,143-176`, `SafetyResultReason`; `visibility-filtering/rules/tweet_rules.rs:11-14,61-67,234-238`.)

| ID | Rust variant | Exact serialized string |
|---:|---|---|
| 1 | `Episodic` | `EPISODIC` |
| 2 | `AbuseEpisodicEncourageSelfHarm` | `ABUSE_EPISODIC_ENCOURAGE_SELF_HARM` |
| 3 | `AbuseEpisodicHatefulConduct` | `ABUSE_EPISODIC_HATEFUL_CONDUCT` |
| 4 | `AbuseGlorificationOfViolence` | `ABUSE_GLORIFICATION_OF_VIOLENCE` |
| 5 | `AbuseGratuitousGore` | `ABUSE_GRATUITOUS_GORE` |
| 6 | `AbuseMobHarassment` | `ABUSE_MOB_HARASSMENT` |
| 7 | `AbuseMomentOfDeathOrDeceasedUser` | `ABUSE_MOMENT_OF_DEATH_OR_DECEASED_USER` |
| 8 | `AbusePrivateInformation` | `ABUSE_PRIVATE_INFORMATION` |
| 9 | `AbuseRightToPrivacy` | `ABUSE_RIGHT_TO_PRIVACY` |
| 10 | `AbuseThreatToExpose` | `ABUSE_THREAT_TO_EXPOSE` |
| 11 | `AbuseViolentSexualConduct` | `ABUSE_VIOLENT_SEXUAL_CONDUCT` |
| 12 | `AbuseViolentThreatHatefulConduct` | `ABUSE_VIOLENT_THREAT_HATEFUL_CONDUCT` |
| 13 | `AbuseViolentThreatOrBounty` | `ABUSE_VIOLENT_THREAT_OR_BOUNTY` |
| 14 | `OneOff` | `ONE_OFF` |
| 15 | `VotingMisinformation` | `VOTING_MISINFORMATION` |
| 16 | `HackedMaterials` | `HACKED_MATERIALS` |
| 17 | `Scams` | `SCAMS` |
| 18 | `PlatformManipulation` | `PLATFORM_MANIPULATION` |
| 19 | `MisinfoCivic` | `MISINFO_CIVIC` |
| 20 | `MisinfoCovid19` | `MISINFO_COVID19` |
| 21 | `MisinfoGeneric` | `MISINFO_GENERIC` |
| 22 | `MisinfoMedical` | `MISINFO_MEDICAL` |
| 23 | `MisinfoCrisis` | `MISINFO_CRISIS` |
| 24 | `DevelopmentOnlyPublicInterest` | `DEVELOPMENT_ONLY_PUBLIC_INTEREST` |
| 25 | `FosnrHatefulConduct` | `FOSNR_HATEFUL_CONDUCT` |
| 26 | `FosnrAbuse` | `FOSNR_ABUSE` |
| 27 | `FosnrUnspecified` | `FOSNR_UNSPECIFIED` |
| 28 | `FosnrViolentSpeech` | `FOSNR_VIOLENT_SPEECH` |
| 29 | `FosnrCivicIntegrity` | `FOSNR_CIVIC_INTEGRITY` |
| 30 | `FosnrSyntheticAndManipulatedMedia` | `FOSNR_SYNTHETIC_AND_MANIPULATED_MEDIA` |
| 31 | `NsfwHighPrecision` | `NSFW_HIGH_PRECISION` |
| 32 | `GoreAndViolenceHighPrecision` | `GORE_AND_VIOLENCE_HIGH_PRECISION` |

The separate camelCase `FilteredReason` enum is exactly: `containNsfwMedia`, `authorBlockViewer`, `possiblyUndesirable`, `unspecifiedReason`, `authorAccountIsInactive`, `authorIsProtected`, `authorIsUnsafe`, `reportedTweet`, `tweetMatchesViewerMutedKeyword`, `tweetIsBounced`, `safetyResult`, `authorIsDeactivated`, `authorIsSuspended`, `viewerMutesAuthor`, `tweetIsNullcast`, `exclusiveTweet`, `viewerBlocksAuthor`. Its broader vocabulary does not imply author-blocks-viewer, report, or muted-keyword rules in this registry. Client action strings are `notEvaluated`, `allow`, `drop`, `interstitial`, `downrank`, `tombstone`, `avoid`. (`visibility-filtering-client/models.rs:56-92`.)

### Presentation-only Thrift reason support

The client can recognize actions produced elsewhere; these mappings **do not enable new registry rules**. `get_appealable`, `get_soft_intervention`, `get_tweet_visibility_nudge`, and `get_limited_actions_policy` extract direct or composed fields; FOSNR appealable reason extraction specifically looks inside `TweetInterstitial.limited_engagements.reason=FosnrReason`. Drop recognizers include `ExclusiveTweet(true)`, `NsfwViewerIsUnderage(true)`, `NsfwViewerHasNoStatedAge(true)`, `NsfwLoggedOut(true)`, `PremiumTweet(true)`. (`visibility-filtering-client/graphql_results.rs:79-144,186-249`.)

| Renderer | Exact supported reasons → resource suffix/key |
|---|---|
| Blurred media | `ContainsNsfwMedia` or `Sensitive` → `nsfw`; `Nudity`→`nudity`; `Violence`→`violence`; `DisturbingOrControversial`→`disturbing_or_controversial`; `SensitiveUser`→`sensitive_user`. Produces `media_interstitials.blurred_image_interstitial_title_` and `_text_` plus suffix. |
| Tombstone | `DELETED`→`tombstone.deleted`; `BOUNCED`/`BOUNCE_DELETED`→`.violated`; `PROTECTED_AUTHOR`/`AUTHOR_BLOCKS_VIEWER`→`.limited`; `SUSPENDED_AUTHOR`→`.suspended`; `DEACTIVATED_AUTHOR`→`.deactivated`; `NSFW_VIEWER_IS_UNDERAGE`→`.underage`; `GRAPHIC_VIEWER_IS_UNDERAGE`→`.graphic_underage`; `NSFW_VIEWER_HAS_NO_STATED_AGE`→`.no_stated_age`; `GRAPHIC_VIEWER_HAS_NO_STATED_AGE`→`.graphic_no_stated_age`; `NSFW_LOGGED_OUT`→`.logged_out_age`; `COMMUNITY_TWEET_HIDDEN`→`.community_tweet_hidden`; `PREMIUM_TWEET`→`.premium_content`; `SENSITIVE_VIEWER_AGE_VERIFICATION`→`.age_verification`; `DEVELOPMENT_ONLY`→`.development_only`; `UNSPECIFIED`→`.unavailable`. Other reasons, including the modeled Rust `LOCAL_REGULATIONS`, do not map here. |
| Contextual interstitial | `MatchesMutedKeyword`→`interstitial.muted_keyword`; `ViewerReportedTweet`/`ViewerReportedAuthor`→`.reported`; `ViewerBlocksAuthor`→`.blocked`; `ViewerMutesAuthor`→`.muted`; `DevelopmentOnly`→`.development_only`; `HatefulConduct`→`.hateful_conduct`; `AbusiveBehavior`→`.abusive_behavior`. |
| Appealable `(policy,level)` | `(2,1)`/`(2,3)`→`hateful_conduct`; `(3,1)`/`(3,3)`→`abuse`; `(4,3)`→`violent_speech`; `(5,3)`→`civic_integrity`; `(6,1)`→`samm`; other combinations→none. |

Source: `visibility-filtering-client/graphql_results.rs:251-343`, `blurred_image_interstitial_resnames`, `tombstone_resname_and_link`, `contextual_thrift_interstitial_resname_link`, `appealable_policy_slug_link`. Translation tries full lowercased language, primary language, then English; unknown resource→none (`visibility-filtering-client/graphql_results.rs:7-50`). `resolve_blurred_image_interstitial` uses wire all-media results, not a reconstructed fallback from a tweet interstitial (`visibility-filtering-client/graphql_results.rs:135-183`).

## Configurable thresholds and fixed cutoffs

| Parameter | Snapshot default / exact logic | Citation |
|---|---|---|
| `rust_vf_nsfw_gating_countries` | `ar, au, br, ca, de, es, fr, gb, id, it, kr, mx, nl, ph, pt, th`; string array lowercased, **whole** malformed/missing array falls back to defaults; empty valid array disables country membership. Refresh every **30 s**; compares drift with sibling Scala config but uses Rust resolved list. | `visibility-filtering/params.rs:8-83`, `NsfwGatingCountries`, `resolve_with_origin` |
| `VF_FS_PATH` | `/usr/local/config/features/visibility/main/rust_vf.yml` | `visibility-filtering/config.rs:5-13` |
| Adult threshold | **18 years**; `Known(age)<18` | `visibility-filtering/models/viewer.rs:17,36-43` |
| NSFW precision interstitial cutoff | **1705536000000 ms** (2024-01-18 00:00 UTC), strict greater-than; uses Snowflake timestamp, not label application timestamp | `visibility-filtering/rules/tweet_rules.rs:112-144`; `visibility-filtering/rules/context.rs:141-145`; `visibility-filtering/models/mod.rs:26-30` |
| Hydration budgets | Per-hydrator cap **1 s**; default inbound request budget **400 ms**, subtract **10 ms** allowance; supplied gRPC timeout substitutes budget. | `visibility-filtering/hydration/mod.rs:37-52`, `request_context` |
| Classifier confidence threshold in VF | **None in these rules**: checks stored label membership. Do not convert “HighRecall”, “HighPrecision”, “NearPerfect” names into undocumented numeric confidence values. | `visibility-filtering/models/safety_labels.rs:15-27`; complete tables above |

## Post-label to account-label propagation

`safetyLabelToUserLevelAggregationV2Forwarder` consumes `vf_tweet_safety_labels_event_prod`, group `safety-label-user-level-aggregation-v2`, local-zone-only forwarding, **10-minute delay**, declared max-lag SLO **20 minutes**. The processor acts only on `Applied` events; removal events do not trigger account unlabeling. It is declared idempotent. (`safety-label-user-agg/safetyLabelToUserLevelAggregationV2Forwarder.strato:3-20`; `safety-label-user-agg/safetyLabelToUserLevelAggregationV2Processor.strato:12-26,119-121`.)

### Published default rules (both have `enabled: true`)

| Rule ID | Trigger | Condition | Output / expiry | Exclusions | Effective default consequence |
|---|---|---|---|---|---|
| `possibly_nsfw_account` | Applied `NSFW_HIGH_PRECISION` OR `SOFT_NSFW`, trigger post at most 60 days old | At least **11 matching posts in a window of 10**, max age 60 days, mediaOnly false; each post has either trigger label | `POSSIBLY_NSFW_ACCOUNT`, **7 days** | self-NSFW, admin-NSFW, high PageRank OR grey badge, existing `NSFW_HIGH_PRECISION` or `POSSIBLY_NSFW_ACCOUNT` | **Unreachable under this default condition**, despite enabled flag; minimum 11 > take(10). Validated configuration intentionally permits this. |
| `nsfw_high_precision` | Applied `NSFW_HIGH_PRECISION`, trigger post at most 60 days old | At least **3 of most recent 5** carry `NSFW_HIGH_PRECISION`, max age 60 days, mediaOnly false | `NSFW_HIGH_PRECISION`, **7 days** | admin-NSFW and existing `NSFW_HIGH_PRECISION`; self-NSFW and high PageRank/grey badge **not** excluded | Can label account; Rust maps resulting account label to recommendation rule 47. |

Source: `safety-label-user-agg/postToUserLabelRules.strato:360-432`, `defaultRulesJson`, `configuredRulesJson`; impossibility follows `matchesPostLabelCount` at lines 266-284, not an assumed disabled switch. Runtime JSON override key is **`safety_understanding_post_to_user_label_rules`**.

### Full aggregation contract and edge cases

* Config parse failure→empty rules. Validation is **all-or-nothing**, requires 1–10 unique nonempty-ID rules; 1–10 OR groups, each 1–10 AND conditions; window 1–10; minimum matching 1–**11** (not constrained ≤window); trigger/condition age 1–60 days; TTL 1–7 days. Only output labels `POSSIBLY_NSFW_ACCOUNT` and `NSFW_HIGH_PRECISION` allowed. Exclusion `highPageRankOrGreyBadge` must explicitly exist even though runtime accessor defaults false. Labels must resolve against imported Thrift enums; duplicate checks use original strings, while matching removes underscores and lowercases. (`safety-label-user-agg/postToUserLabelRules.strato:67-117,184-249`, `parseConfig`, `isValidRule`, `validRules`.)
* Event gate requires enabled, matching trigger label, and recent trigger. `isRecentPost` uses Snowflake time, inclusive lower bound in seconds; unknown Snowflake time defaults **now**. It has no explicit future-time upper bound. (`safety-label-user-agg/postToUserLabelRules.strato:77-88,119-138`.)
* Fetch trigger post's author via pure core; no author means no work. Fetch user SAFETY+LABELS (includeProtected), high PageRank, grey badge; absent user/safety/labels default false/empty and absent PageRank/badge false. Exclude per rule before choosing scan size. (`safety-label-user-agg/safetyLabelToUserLevelAggregationV2Processor.strato:28-60`.)
* Timeline is descending `profile/timelines/userTimeline/edgeBySource`. Scan is maximum needed window, or **4×** media-only window. For each timeline ID, resolve original post for a repost, fetch `visibility/baseTweetSafetyLabelMap` of the **original**, but retain the **timeline post ID** for recency. Missing labels→empty. Optional media lookup uses original post **or quoted post** media. The code does not deduplicate original posts after this conversion. (`safety-label-user-agg/postToUserLabelRules.strato:103-107,161-178`; `safety-label-user-agg/safetyLabelToUserLevelAggregationV2Processor.strato:61-84`.)
* Per condition: mediaOnly filtering occurs **before** take(window); recency and label match **after** take(window). Short/old windows are not filled by arbitrary further pagination. A label selector requires both (anyOf empty OR at least one anyOf matches) AND every allOf label; at least one configured selector label. Rules are OR of nonempty AND groups. (`safety-label-user-agg/postToUserLabelRules.strato:251-292`.)
* Multiple matching outputs of same label collapse to one with **maximum TTL**. Writes Gizmoduck labels with ID 0, `createdAtMsec=now`, `expiresAtMsec=now+ttlDays`, `byUser="Grox"`, `source=Some("Grox")`. No explicit removal path; excluded existing labels prevent refresh under the shown defaults. Actual expiry cleanup semantics live in imported Gizmoduck/storage, not this processor. (`safety-label-user-agg/postToUserLabelRules.strato:294-319`; `safety-label-user-agg/safetyLabelToUserLevelAggregationV2Processor.strato:89-106`.)

## Coverage and explicit gaps

Covered: all four registered safety policies; all 56 distinct Home/recommendation rule names and multi-clause exceptions; exact local author/reason enums; all 17 active post-label triggers; flags, treatment projections, caller policy selection, hydration/completeness and cache behavior; country/age cutoffs; configurable propagation and expiry writes.

Not present here: full imported post/user-label enums and numeric assignments, classifier weights and confidence policy behind label names, live feature-switch values, complete upstream data stores/services, wider-product policy enforcement implied by report copy, or Grox prompt text. README explicitly excludes Grox `.j2` prompts and some Botmaker rules (`README.md:418-438`). GraphQL treatment extraction and translation helpers support a broader action vocabulary (`visibility-filtering-client/graphql_results.rs:79-173`) but do not wire corresponding Rust rules. A label's existence, a public description, an enum reason, and an active predicate remain separate evidence.
