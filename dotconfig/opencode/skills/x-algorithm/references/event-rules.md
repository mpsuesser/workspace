# Published event rules: Scarecrow / Botmaker

Snapshot: `3aa0fa336c4a20e4149b6151629b6050897bb8a5`. This is the complete inventory of **20 published `.bot` files** in `botmaker-rules/scarecrow/bot/`, plus relevant derived features and runtime semantics. Some production rules are intentionally omitted (`README.md:313,425`). See [reputation-and-enforcement.md](reputation-and-enforcement.md) for account models and the separate score-driven enforcement service.

All source citations use full repository-relative paths, resolved under the skill's `source/` directory, and line numbers refer to the bundled source snapshot. Each rule's source is its authoritative predicate; names such as “NonFollower”, “HighRecall”, “To_URL_Verdict”, or “FilterOutNotifications” are not sufficient to infer behavior.

## 1. Reading rules correctly

* A rule names an event, boolean `condition`, and `action`. Compiled evaluation marks true as VIOLATED and executes action; false is UNVIOLATED. Condition errors become ABORTED/ABORTED_IGNORED; action errors FAILED/FAILED_IGNORED; timeout cancels context. Source: `botmaker/src/scala/com/twitter/botmaker/rule/RuleEvaluator.scala:51-65,120-203`, `CompiledEvaluator.run`.
* **All selected rules for the event are evaluated**, except explicit `skipRules`; futures are joined. This is not the first-match-wins behavior of the separate abuse-enforcement YAML pipeline (`botmaker/src/scala/com/twitter/botmaker/rule/EventEvaluator.scala:12-30`). Multiple matching rules can apply multiple labels.
* `&&` short-circuits in order (`botmaker/src/java/com/twitter/botmaker/function/logic/Conjunction.java:68-81,123-153`). `MATCHES` uses full regex matching, not substring searching; default regex uses DOTALL (`botmaker/src/java/com/twitter/botmaker/function/string/RegexMatch.java:35-45`; `botmaker/src/java/com/twitter/botmaker/compiler/RegexCache.java:65-74`). Consequently `MATCHES ".*BAD"` differs from `MATCHES "BAD"`.
* `DoAsync` starts child expressions, reports their failures, and returns unit without awaiting their completion; a rule evaluating successfully does not prove each downstream label write completed (`botmaker/src/java/com/twitter/botmaker/function/DoAsync.java:44-58`).
* `TweetRtfApplyLabel` calls AIS AddLabelsV2 for a tweet, supports optional absolute expiration timestamp in ms; two-argument calls do **not** specify TTL. Removal calls the downstream remove-label operation (`scarecrow/function/ActionIntakeServiceRegistry.scala:21-98,102-140`). Do not invent a seven-day default for tweet labels.
* `SetUserLabel` is a Gizmoduck-facing migrated operation; documented optional expiration is an **absolute timestamp**, default now+7d; dark mode returns true without performing the operation (`scarecrow/legacy/ActionerRegistry.scala:12-66`). This is separate from key/value `SetLabelWithTtl` used for fatigue/dedup/media tags.
* `RateLimited(action,lookbackSecs,threshold,alias,fallback)` delegates to the actioner limiter; beyond limit calls fallback (or throws if none). The duplicate-text rules wrap the **whole action block**, so their 100,000/min value must not be described as a proven per-tweet throughput cap (`scarecrow/legacy/function/RateLimited.scala:32-46,74-125`). Additional rule-function action limiting depends on dynamic deciders/configuration (`scarecrow/ScarecrowBotMaker.scala:448-505`).
* Every published rule has `isActive: 'true'` and `actionLimits: {}`. This metadata does not establish live config activation, successful source loading, or absence of downstream/dynamic limits. Many export lines literally combine `description:\nevent:` or `owner:\nactionLimits:`; cite them as source exports rather than asserting they are stand-alone deployable YAML. `expiry` below is **rule metadata**, not label TTL.

## 2. Shared guards, score sources, and time helpers

Define `E(u)` for the exact four-way exclusion present in many rules:

```text
!IsTestUser(u)
&& !IsHighPageRankUser(u)
&& !Contains(GetLongList(`AutoExpiringTempSkipList`),u)
&& !IsUserGrayVerified(u)
```

This is only a notation for predicates explicitly present in a row; it is **not a universal platform exemption**. Backfills, media helpers, account-state handling and individual rules differ.

| Helper/symbol | Exact meaning | Citation |
|---|---|---|
| `IsHighPageRankUser` | Try UserCred V2 score; try user-label set, default empty. If score exists OR `PREDICTED_HIGH_PAGE_RANK` present: true iff score≥54 or predicted label. Otherwise fallback to Gizmoduck followers **>25000**, absent count 0. Logs chosen definition/verdict and caches. | `botmaker-rules/scarecrow/derived-feature/IsHighPageRankUser.df:2-27`; `botmaker-rules/scarecrow/derived-feature/HighPageRankThreshold.df:2` |
| `IsUserGrayVerified` | `GetUser(u).safety.verified_type`, if nonnull lowercase == `government`, else false | `botmaker-rules/scarecrow/derived-feature/IsUserGrayVerified.df:2-10` |
| `IsUserGoldVerified` | Same, lowercase == `business` | `botmaker-rules/scarecrow/derived-feature/IsUserGoldVerified.df:2-10` |
| `GetUserHealthScores` | HSS account score retrieval, converts named strings to `UserHealthModel`; invalid names throw; event cache | `scarecrow/legacy/StratoRegistry.scala:137-166` |
| `GetUserCredV2` | Fetches optional score/mass/snapshot timestamp via Strato; event cache | `scarecrow/legacy/StratoRegistry.scala:120-134` |
| `SetTweetRtfApplyLabelWithExpirationMs` | Only applies if absolute expiration > current time; passes timestamp in TweetRtfApplyLabel optional slot; otherwise increments expired-TTL stat | `botmaker-rules/scarecrow/derived-feature/SetTweetRtfApplyLabelWithExpirationMs.df:2-19` |
| `SetRemediationFatigueLabel` | Key/value TRUE, rule-specific namespace `RemediationFatigueLabel + "_" + RULE_ID`, caller-supplied TTL seconds | `botmaker-rules/scarecrow/derived-feature/SetRemediationFatigueLabel.df:2-11`; `botmaker-rules/scarecrow/derived-feature/CreateRemediationFatigueNamespace.df:2` |
| BigQuery/Botmaker dedup | Namespace `"bq_to_bm_namespace" + jobName`; HasLabel check; Set TRUE with default **86400 seconds** | `botmaker-rules/scarecrow/derived-feature/BQ_to_BM_namespace.df:2`; `botmaker-rules/scarecrow/derived-feature/HasBigQuerytoBotmakerLabel.df:2-3`; `botmaker-rules/scarecrow/derived-feature/SetBigQuerytoBotmakerLabel.df:2-3` |
| Support notes | Per RULE_ID~user key; lookback 86400s; default max 1; write note actor 95731075 iff prior count<max, then increment. On counter error defaults to max, suppressing note. | `botmaker-rules/scarecrow/derived-feature/AddTwitterSupportGuanoNote.df:2-29` |

`OneWeekInSecs`, `SevenDaysInSecs`, `OneDayInSecs`/`DayInSecs`, `OneDayInMillis`, `OneMinuteInSecs`, and `ThirtyDaysInSecs` express their named 7d/1d/60s/30d periods. Helper references remain within the published derived-feature files. `AutoExpiringTempSkipList` membership, predicted-PageRank label production, HSS served values and URL reputation model internals are external state, not enumerated in this export.

## 3. Account/spam reputation rules (all four)

| Rule / event | Exact predicate (all conjuncts unless stated) | Actions, restrictions, TTL | Source |
|---|---|---|---|
| **20998** `AgathaSpamProduction__ApplySearchTopTweetLabel` / `tweet` | tweetId and spammerId exist; `E(spammerId)`; HSS `AgathaAllSpamReportsPerFav > .9975 OR AgathaSpamSuspended > .98`; missing map entries −1. Score map cached as `bot_20998_agatha_scores`. | Async tweet **AGATHA_SPAM**, expiration now+7d. It does not directly modify a ranker score. | `botmaker-rules/scarecrow/bot/AgathaSpamProduction__ApplySearchTopTweetLabel.bot:3-28` |
| **21278** `ProductionAgatha__FilterOutOrganicNotifications` / `new_send_notification_write` | spammerId/victimId exist and differ; `E(spammerId)`; no remediation fatigue; existing user labels do not contain AGATHA_SPAM_TOP_USER; HSS **SpamSuspended > .99 OR AllSpamReportsPerFav > .999 OR SpamReportsPerFav > .999** (full names all prefixed `Agatha`; missing −1). | Async user **AGATHA_SPAM_TOP_USER**, now+7d; set rule-specific fatigue 6d. Label application is the visible action; no direct notification-drop call in this file. | `botmaker-rules/scarecrow/bot/ProductionAgatha__FilterOutOrganicNotifications.bot:3-35` |
| **20719** `PinnedLowQualityOrBadUrl` / `user_modification` | spammerId exists, `E(spammerId)`; `profileDesign.pinnedTweetIds.simple.after` exists, nonnull/nonempty; before absent OR differs; expanded URLs for `ToLong(after)` nonempty; any resolved reputation verdict exactly BAD or LOW_QUALITY. | Support note; user **SPAM_HIGH_RECALL**, now+7d. No automatic unlabel on later profile cleanup is shown. | `botmaker-rules/scarecrow/bot/PinnedLowQualityOrBadUrl.bot:3-41` |
| **20732** `FollowFromActorWithPinnedLowQualityOrBadUrl` / `follow` | spammerId exists, `E(spammerId)`; any pinned ID converted to Long is !=NULL and !="", tweet found, text URLs nonempty, any resolved reputation verdict BAD or LOW_QUALITY. | Support note stating notification restriction; user **SPAM_HIGH_RECALL**, now+7d; log. | `botmaker-rules/scarecrow/bot/FollowFromActorWithPinnedLowQualityOrBadUrl.bot:3-46` |

**Agatha direction:** these high HSS values identify adverse-model tails; they are not high credibility. **UserCred direction:** `E` protects high-credibility/predicted-high-PageRank accounts from these particular rules. The 54 threshold has no equivalence to the UserCred snapshot safeguard's 55 or enforcement service's additional 50 threshold.

## 4. Duplicate-content campaign rules (both)

Shared eligibility: entityId/jobName/notes all exist; entityType exactly `tweetIdCluster`. Convert entityId's string-ID list to Long list. For each tweet, require no job-specific `_prod` dedup label, no existing COPYPASTA_SPAM, and **both** `TryOrElse(GetTweet(id).card2.name != "promo_video_convo",FALSE)` and `TryOrElse(... != "promo_image_convo",FALSE)`. A card lookup/field exception therefore makes it **ineligible**, not automatically nonpromotional. Actionable tweets additionally require `E(GetTweetAuthorId(id))`.

| Rule / event | Allowed jobName | Actions / TTL | Source |
|---|---|---|---|
| **21711** `BBQDuplicateTextProd` / `bqbm_scheduled_queries` | `bbq_duplicate_text_unigrams` OR `bbq_duplicate_text_characters_cjk` | Nonempty actionable list: rate-limit whole block by original jobName, 60s/100000; apply **COPYPASTA_SPAM**, no explicit tweet TTL; set `_prod` BQ dedup **1d**. For author lookup succeeding (else −1), support note capped at 1/day/rule/user. Log rate-limit fallback and unactionable set. | `botmaker-rules/scarecrow/bot/BBQDuplicateTextProd.bot:3-73` |
| **21599** `BBQDuplicateTextRepliesProd` / same event | `bbq_duplicate_text_unigrams_replies` OR `bbq_duplicate_text_characters_replies_cjk` | Same labels, dedup and whole-block rate limit; no support-note action in this rule. | `botmaker-rules/scarecrow/bot/BBQDuplicateTextRepliesProd.bot:3-58` |

The upstream BigQuery text-similarity queries/clustering thresholds are **not** published in these files. Neither rule exposes a universal “post the same text N times” boundary. Local `downrankNote` values are constructed but unused; do not count them as writes.

## 5. URL reputation rules (six)

Notation: `chain=redirectionChain`; `V=GetUrlVerdictForSingleChain(chain)`. When an author is resolved: if originalTweetId exists, !=0 and !=tweetId, look up original tweet user ID; otherwise use tcoUserId. “Active tweet” in action: originalTweetId if exists and !=0, otherwise tweetId. This distinction preserves the exact original-ID handling.

| Rule / event | Exact predicate | Actions, guards, TTL | Source |
|---|---|---|---|
| **5239** `LQ_Tweets_With_LQ_URL_Verdict_At_Mention_To_NonFollower` / `url_event` | tweetId/chain/isReply/isRetweet exist; !isReply && !isRetweet; chain nonempty; resolved author>0 (original-author lookup errors→−1); V **MATCHES "LOW_QUALITY"**; at least one screen name mentioned in current tweet text resolves to a user **not following resolved author**; `E(spammerId)` (not resolved author). | Re-fetch V; if exact LOW_QUALITY, apply **SPAM_HIGH_RECALL** to active tweet, no explicit TTL; counters/log. | `botmaker-rules/scarecrow/bot/LQ_Tweets_With_LQ_URL_Verdict_At_Mention_To_NonFollower.bot:3-50` |
| **6754** `...NonFollower_v2` / `url_event` | tcoUserId/tweetId/chain exist; nonempty chain; final hop's GetUrlVerdict not GOOD/WHITELIST; any hop exactly LOW_QUALITY; `E(spammerId)`. | **SPAM_HIGH_RECALL** to tweetId, no TTL; counter. **No mention, nonfollower, reply or retweet check despite filename.** | `botmaker-rules/scarecrow/bot/LQ_Tweets_With_LQ_URL_Verdict_At_Mention_To_NonFollower_v2.bot:3-18` |
| **3226** `Tweet_Spam_High_Recall_RTF_All_Bad_URL_Sources` / `url_event` | tweetId/chain exist, nonempty; V MATCHES **".*BAD"**; `E(resolved author)`. | Async note/log/counters; exact V MATCHES **"BAD"** → **SPAM**, otherwise **SPAM_HIGH_RECALL**, on active tweet. No explicit TTL. | `botmaker-rules/scarecrow/bot/Tweet_Spam_High_Recall_RTF_All_Bad_URL_Sources.bot:3-47` |
| **20789** `Tweet_Search_Blacklist_RTF_All_UNSAFE_URL_Sources` / `url_event` | tweetId/chain exist, nonempty; V MATCHES **".*UNSAFE"**; `E(resolved author)`. | Async, **only if re-read V MATCHES exact "UNSAFE"**: individually add absent **SEARCH_BLACKLIST**, **UNSAFE_URL**, **DO_NOT_AMPLIFY**, **MALICIOUS_URL** to active tweet; note each addition + stats. No explicit TTL. A prefixed verdict matching condition but not exact action test need not label. | `botmaker-rules/scarecrow/bot/Tweet_Search_Blacklist_RTF_All_UNSAFE_URL_Sources.bot:3-60` |
| **2002** `tweet_rtf_or_unrtf_on_bad_verdict` / `url_reputation_change` | verdict exists and ==BAD; action PUT or DELETE. | Find t.co slugs by entity/matchingType; re-resolve each slug's chain; PUT retains verdict string **containing BAD and not containing WHITELIST or GOOD**; DELETE retains strings **not containing BAD** (lookup failure fallback `"no"`). Resolve slug suffixes→tweet IDs; PUT **SPAM**, DELETE remove **SPAM**. No `E`, no cap, no explicit TTL. | `botmaker-rules/scarecrow/bot/tweet_rtf_or_unrtf_on_bad_verdict.bot:3-36` |
| **20790** `rtf_tweets_on_unsafe_verdict` / `url_reputation_change` | verdict exists and ==UNSAFE; action exists and PUT/DELETE. | Async all entity/matchingType slugs→tweet IDs: PUT all four **SEARCH_BLACKLIST**, **DO_NOT_AMPLIFY**, **UNSAFE_URL**, **MALICIOUS_URL**; DELETE removes all four. **No re-check of other unsafe chains, no `E`, no cap, no explicit TTL** in this file. | `botmaker-rules/scarecrow/bot/rtf_tweets_on_unsafe_verdict.bot:3-35` |

URL reputation readers delegate to legacy/downstream implementations; the code here does not publish the full URL verdict precedence algorithm (`scarecrow/legacy/UrlVerdictRegistry.scala:13-126`). Preserve exact string/regex distinctions above instead of assuming all “bad URL” signals have identical outcomes.

## 6. Adult-content propagation rules (six)

### Media thresholds

Current helpers delegate to the “NewModelLogic” helpers and increment migration counters:

```text
NearPerfect: precisionNewNsfw exists && precisionNewNsfw >= .999
HighPrecision: precisionNewNsfw exists && precisionNewNsfw >= .95
HighRecall: category and recallNewNsfw exist
            && ((category != TWEET_VIDEO && recallNewNsfw <= .8568428)
                || (category == TWEET_VIDEO && recallNewNsfw <= .6))
```

The high-recall comparison is **<=**, not >=. Do not substitute ordinary probability-threshold intuition for the published named metric. Sources: `botmaker-rules/scarecrow/derived-feature/IsNearPerfectNsfwNewModelLogic.df:2-4`; `botmaker-rules/scarecrow/derived-feature/IsHighPrecisionNsfwNewModelLogic.df:2-4`; `botmaker-rules/scarecrow/derived-feature/IsHighRecallNsfwNewModelLogic.df:2-9`; wrappers `botmaker-rules/scarecrow/derived-feature/IsNearPerfectNsfw.df:2-7`, `botmaker-rules/scarecrow/derived-feature/IsHighPrecisionNsfw.df:2-7`, `botmaker-rules/scarecrow/derived-feature/IsHighRecallNsfw.df:2-7`.

Feature provenance: `FeaturesOfMediaUpdate.putTags` maps an **`xxnsfw` tag** to `probabilityNewNsfw` and, if supplied, `precisionNewNsfw`, `recallNewNsfw`, `falsePositiveRateNewNsfw`; `xxnfswv2`/`xxnsfwv2` instead map to the separate `NsfwV2` suffix. Media category/user/tweet/media IDs come from the event; entityId comes from optional ownership_info.entity_id. Sources: `botmaker/scarecrow_features/src/main/java/com/twitter/scarecrow/features/FeaturesOfMediaUpdate.java:47-118,122-126,149-154,175-178`. Hence the rules above do not compare raw `probabilityNewNsfw` or older calibration-bucket booleans.

| Rule / event | Exact predicate | Actions, restrictions, TTL | Source |
|---|---|---|---|
| **7429** `NSFW_Card_Image_Media_To_URL_Verdict` / `media_update` | category/entityId exist; category CARD_IMAGE; NearPerfect | Treat entityId as last-hop URL; missing current verdict UNKNOWN. If NearPerfect and verdict !=NSFW_CARD_IMAGE and !=BAD, write exact-match **NSFW_CARD_IMAGE** URL verdict **7d**, source botmaker/bot_7429. Else-if existing NSFW_CARD_IMAGE and !HighRecall && !HighPrecision, attempts deletion only if `creationTimestampInSec−nowSeconds > 60*60*1000`. That removal arm is unreachable under stable input because entry requires NearPerfect, which implies HighPrecision; timestamp comparison is also a future-facing 3,600,000-second difference, **not** “older than an hour.” | `botmaker-rules/scarecrow/bot/NSFW_Card_Image_Media_To_URL_Verdict.bot:3-29` |
| **7413** `NSFW_Card_Image_URL_to_Tweet_Verdict` / `url_reputation_change` | verdict/entity/matchingType exist; verdict NSFW_CARD_IMAGE; action PUT/DELETE | Set internal NSFW_Url→NSFW_Card_Image_Url **1h** marker if different (does not suppress processing). Helper finds linked tweets using match type **1**, partitions already-labeled and unlabeled-found. PUT: apply **NSFW_CARD_IMAGE** to first **5000** unlabeled; DELETE: remove from **all** labeled returned. No user-credibility/test guard, no tweet-label TTL. | `botmaker-rules/scarecrow/bot/NSFW_Card_Image_URL_to_Tweet_Verdict.bot:3-35`; `botmaker-rules/scarecrow/derived-feature/GetTweetLabelInfoFromURL.df:2-25` |
| **24493** `NSFW_Grok_Generated_Image_To_URL_Verdict` / `media_update` | category/entityId exist; category GROK_GENERATED_IMAGE; HighPrecision | Decode event thrift; fetch/log Grok share IDs; set internal namespace **GrokMediaNsfwDetection**, media entityId, value NearPerfectNsfw if NearPerfect else HighPrecisionNsfw, **75d**. **No URL verdict write despite filename.** | `botmaker-rules/scarecrow/bot/NSFW_Grok_Generated_Image_To_URL_Verdict.bot:3-27` |
| **24603** `NSFW_Grok_Share` / `grok_share` | grokMediaIds and shareId exist; Length(shareId)>0; any media ID's GrokMediaNsfwDetection label !="" | Construct `https://x.com/i/grok/share/` + Trim(shareId); if current verdict neither NSFW_CARD_IMAGE nor BAD, exact-match **NSFW_CARD_IMAGE** URL verdict **7d**, source botmaker/bot_24603. Test is pre-trim length; any nonempty media tag qualifies. | `botmaker-rules/scarecrow/bot/NSFW_Grok_Share.bot:3-21` |
| **22358** `nsfw_user_write_user_label` / `health_side_effect` | subevent nsfw_user; GetUser(userId)!=NULL; !IsTestUser(userId) | Invoke account-label-or-report helper **twice**, for NSFW_HIGH_PRECISION and NSFW_HIGH_RECALL; default label expiry **7d**, helper exceptions/3d branch below. Shared report fatigue can suppress the second review. | `botmaker-rules/scarecrow/bot/nsfw_user_write_user_label.bot:3-10` |
| **22418** `NsfwTweetMediaProcessor` / `health_side_effect` | subevent nsfw_tweet_media (no explicit user/test/score-existence guard beyond branches) | label=="3" and score exists and >.99 → aggregate NSFW_NEAR_PERFECT; independently label=="3" → aggregate NSFW_HIGH_PRECISION; label=="4" → aggregate NSFW_HIGH_RECALL. If any helper returns true, write Guano note. Account labeling/review depends on aggregation/helper below, not just one post. | `botmaker-rules/scarecrow/bot/NsfwTweetMediaProcessor.bot:3-39` |

### Exact account aggregation and label/review helper

`ApplyNsfwUserLabel(tweetId,label,userId,reason)` (`botmaker-rules/scarecrow/derived-feature/ApplyNsfwUserLabel.df:2-51`):

1. Map label to HLL topic: NSFW_NEAR_PERFECT→NSFWNearPerfectImagePosted; HIGH_PRECISION→NSFWHighPrecisionImagePosted; HIGH_RECALL→NSFWHighRecallImagePosted. Namespace NsfwUser, key userId, value tweetId.
2. Add using **60-second** precision, **26-hour** retention, slice 1, timestamp argument 0. Namespace is current DC (first 4 hostname characters) + `.NsfwUser`. Read union count from `atla.NsfwUser` and `pdxa.NsfwUser`, **86400-second lookback**, precision 60, cache TTL 0, slice 1. Helpers: `botmaker-rules/scarecrow/derived-feature/AddToHLLForDataCenter.df:2-9`; `botmaker-rules/scarecrow/derived-feature/GetDataCenterName.df:2`; `botmaker-rules/scarecrow/derived-feature/GetHLLCountFromDataCenters.df:2-9`.
3. Require successful add helper and approximate distinct tweet count **>2**, i.e. at least approximately three distinct posts in one day, not three media assets or three repeated events for one tweet.
4. If no key/value label in `Fatigue + RULE_ID + label` for user, set TRUE **1d**, then call `ApplyNsfwUserLabelOrCreateReport`. Otherwise false. Fatigue is set **before** downstream label/report success. Distinct NSFW topics/fatigue namespaces mean near-perfect and precision can both be processed for a label-3 event.

`ApplyNsfwUserLabelOrCreateReport(userId,label,reason,labelExpiry=now+7d)` (`botmaker-rules/scarecrow/derived-feature/ApplyNsfwUserLabelOrCreateReport.df:2-90`) has these exact branches:

| Order | Condition | Outcome |
|---|---|---|
| 1 | Any: NsfwUserLabelRemoved stored timestamp > now−90d; OR `TryOrElse(highPageRank && NsfwConsumerFollowerScoreDouble<.1,FALSE)`; OR gray verified; OR temp skip list; OR gold verified | Enter review path. If `ApplyNsfwUserLabelReported` marker absent, set APPLIED **7d** with cache update. Then create MEDIA_PROACTIVE_REVIEW report (ID 2241808), write the support note, and return true **only if** highPageRank OR skip-list OR gray OR gold. Otherwise return false. If marker already exists, return false. **Manual removal alone on an ordinary account sets the marker but submits no report, writes no support note, and returns false**, because the nested guard fails. |
| 2 | Otherwise !highPageRank && !skip-list && !gray | Support note; SetUserLabel using requested/default **7d** expiration. Gold was already handled above. |
| 3 | Otherwise `!TryOrElse(GetUser(u).safety.nsfw_admin,FALSE)` | Support note; SetUserLabel **3d**. This can cover high-PageRank users not caught by low-consumer-score review gate. High PageRank is not a universal NSFW exemption. |
| 4 | Otherwise | No label; note that nsfw_admin already present; false. |

Helper logs user ID, follower count, verified followers and NSFW consumer follower score after branch. `GetVerifiedFollowers` retrieves `platform-manipulation/verifiedFollowers.User` (`botmaker-rules/scarecrow/derived-feature/GetVerifiedFollowers.df:2-9`); that count is **logging only here**, not a numerical enforcement guard. `ApplyNsfwUserLabel` returning true can mean a review report rather than an applied account label, so the calling rule's `labeledUser` variable/note text is not authoritative evidence of a write.

## 7. Reply spam and violence/gore (remaining two)

| Rule / event | Exact predicate | Actions, restrictions, TTL | Source |
|---|---|---|---|
| **25026** `GroxTweetProcessor` / `health_side_effect` | userId/spamScore/postId exist; subevent groxScore; spamScore **>=.97**; !IsTestUser(userId) | Fetch post, conversation ID, conversation author. If userId != conversation author and not highPageRank/skip-list/gray: tweet **RISKY_HIGH_VIZ_REPLY**, now+**14d**; otherwise skip/log. No explicit reply flag required in the condition. | `botmaker-rules/scarecrow/bot/GroxTweetProcessor.bot:3-36` |
| **20616** `ViolenceAndGore_ImageModel_MTT` / `media_update` | category/spammerId/mediaId/eventThrift exist; !test; update_info/escherbird_annotations/mediaAnnotations present; any annotation domainId **140**, groupId **34**, entityId **1199070453920223232** with matching category threshold | TWEET_IMAGE: enclosing media annotation **precision > .6** (strict); TWEET_VIDEO: **raw_score >= .95**; AVATAR_IMAGE/BANNER_IMAGE: **raw_score >= .85**. Cache selected score. Avatar/banner → MEDIA_PROACTIVE_REVIEW report (banner mediaId converted by appending string "000"); tweet image/video with tweetId: if not highPageRank/skip-list/gray, **GORE_AND_VIOLENCE_HIGH_PRECISION**, no explicit TTL, Guano note; otherwise review report. Other categories false. | `botmaker-rules/scarecrow/bot/ViolenceAndGore_ImageModel_MTT.bot:3-103` |

The gore note says score “>=” for images, but executable predicate is **> .6**; preserve the executable comparison. Gore's high-credibility path sends for manual review rather than silently doing nothing. Grox's exempt/own-conversation path does skip direct labeling.

## 8. Rule metadata expiry inventory (not action TTL)

All source files above end with `isActive: 'true'`, `actionLimits: {}`. `MAX` below is exact exported timestamp `+292278994-08-17T07:12:55.807Z`, not a conventional human date or evidence of immortal label storage.

| ID | Rule filename stem | Published expiry | Citation |
|---|---|---|---|
| 20998 | AgathaSpamProduction__ApplySearchTopTweetLabel | 2029-09-25T13:38:02.674Z | `botmaker-rules/scarecrow/bot/AgathaSpamProduction__ApplySearchTopTweetLabel.bot:29` |
| 21711 | BBQDuplicateTextProd | 2027-02-21T03:14:23.214Z | `botmaker-rules/scarecrow/bot/BBQDuplicateTextProd.bot:75` |
| 21599 | BBQDuplicateTextRepliesProd | MAX | `botmaker-rules/scarecrow/bot/BBQDuplicateTextRepliesProd.bot:60` |
| 20732 | FollowFromActorWithPinnedLowQualityOrBadUrl | 2027-06-01T21:00:00Z | `botmaker-rules/scarecrow/bot/FollowFromActorWithPinnedLowQualityOrBadUrl.bot:48` |
| 25026 | GroxTweetProcessor | 2029-06-14T01:10:58.669Z | `botmaker-rules/scarecrow/bot/GroxTweetProcessor.bot:38` |
| 5239 | LQ_Tweets_With_LQ_URL_Verdict_At_Mention_To_NonFollower | MAX | `botmaker-rules/scarecrow/bot/LQ_Tweets_With_LQ_URL_Verdict_At_Mention_To_NonFollower.bot:52` |
| 6754 | LQ_Tweets_With_LQ_URL_Verdict_At_Mention_To_NonFollower_v2 | 2028-02-08T02:44:00Z | `botmaker-rules/scarecrow/bot/LQ_Tweets_With_LQ_URL_Verdict_At_Mention_To_NonFollower_v2.bot:20` |
| 7429 | NSFW_Card_Image_Media_To_URL_Verdict | MAX | `botmaker-rules/scarecrow/bot/NSFW_Card_Image_Media_To_URL_Verdict.bot:31` |
| 7413 | NSFW_Card_Image_URL_to_Tweet_Verdict | MAX | `botmaker-rules/scarecrow/bot/NSFW_Card_Image_URL_to_Tweet_Verdict.bot:37` |
| 24493 | NSFW_Grok_Generated_Image_To_URL_Verdict | 2029-10-18T21:18:09.279Z | `botmaker-rules/scarecrow/bot/NSFW_Grok_Generated_Image_To_URL_Verdict.bot:29` |
| 24603 | NSFW_Grok_Share | 2029-11-22T17:50:09.833Z | `botmaker-rules/scarecrow/bot/NSFW_Grok_Share.bot:23` |
| 22358 | nsfw_user_write_user_label | 2031-07-31T16:37:35.583Z | `botmaker-rules/scarecrow/bot/nsfw_user_write_user_label.bot:12` |
| 22418 | NsfwTweetMediaProcessor | 2032-08-31T08:41:48.520Z | `botmaker-rules/scarecrow/bot/NsfwTweetMediaProcessor.bot:41` |
| 20719 | PinnedLowQualityOrBadUrl | 2029-05-10T23:41:51.129Z | `botmaker-rules/scarecrow/bot/PinnedLowQualityOrBadUrl.bot:43` |
| 21278 | ProductionAgatha__FilterOutOrganicNotifications | MAX | `botmaker-rules/scarecrow/bot/ProductionAgatha__FilterOutOrganicNotifications.bot:37` |
| 20790 | rtf_tweets_on_unsafe_verdict | MAX | `botmaker-rules/scarecrow/bot/rtf_tweets_on_unsafe_verdict.bot:36` |
| 2002 | tweet_rtf_or_unrtf_on_bad_verdict | MAX | `botmaker-rules/scarecrow/bot/tweet_rtf_or_unrtf_on_bad_verdict.bot:39` |
| 20789 | Tweet_Search_Blacklist_RTF_All_UNSAFE_URL_Sources | MAX | `botmaker-rules/scarecrow/bot/Tweet_Search_Blacklist_RTF_All_UNSAFE_URL_Sources.bot:62` |
| 3226 | Tweet_Spam_High_Recall_RTF_All_Bad_URL_Sources | 2035-03-26T19:42:00Z | `botmaker-rules/scarecrow/bot/Tweet_Spam_High_Recall_RTF_All_Bad_URL_Sources.bot:49` |
| 20616 | ViolenceAndGore_ImageModel_MTT | 2050-03-01T19:45:59.522Z | `botmaker-rules/scarecrow/bot/ViolenceAndGore_ImageModel_MTT.bot:105` |

## 9. Upstream-to-label paths and interpretation limits

Health-side-effect input adapters copy subevent name from `event.getSubeventName()`. NSFW_USER supplies userId/modelName; NSFW_TWEET_MEDIA supplies tweetId/userId/media key/source and optional label/score; GROX_SCORE supplies userId/postId/createdAt/spamScore. The rule predicates consume those flattened values rather than calling model inference inline (`botmaker/scarecrow_features/src/main/java/com/twitter/scarecrow/features/FeaturesOfHealthSideEffectEvent.java:120-125,157-174,187-194,204-249`). Presence of additional enum cases/adapters (e.g. SPOK_SCORE or GROX_USER_SCORE) is not evidence of a published matching rule.

| Upstream path | Persisted label/verdict emitted here | Important boundary |
|---|---|---|
| Offline Agatha → HSS score → tweet/new-notification event | AGATHA_SPAM tweet / AGATHA_SPAM_TOP_USER account | HSS score is not a request ranker output. Notification rule emits a user label, not an inline notification cancellation. |
| UserCred V2 snapshot → Strato → high-PageRank helper | No label directly; exception/short-TTL/review choice | Predicted-high-PageRank and skip-list membership come from external state. |
| BigQuery duplicate cluster event | COPYPASTA_SPAM tweet | SQL detection thresholds and campaign formation are not published. |
| URL verdict chain/event | SPAM, SPAM_HIGH_RECALL, SEARCH_BLACKLIST, UNSAFE_URL, DO_NOT_AMPLIFY, MALICIOUS_URL | Apply-on-event and retrospective backfill have different guards and deletion semantics. |
| Pinned URL + follow/profile edit | SPAM_HIGH_RECALL account | No auto-removal rule published for later pin cleanup. |
| Card media precision → URL verdict change | NSFW_CARD_IMAGE URL → NSFW_CARD_IMAGE tweet | URL TTL 7d does not establish tweet TTL; DELETE event drives explicit removal. |
| Grok generated-media precision → internal media tag → share event | 75d GrokMediaNsfwDetection tag → 7d NSFW_CARD_IMAGE URL → tweet propagation | Media rule alone does not write URL verdict. |
| nsfw_user health event | NSFW_HIGH_PRECISION/HIGH_RECALL account or review | Shared helper account exceptions/fatigue govern outcomes. |
| nsfw_tweet_media health event + HLL | NSFW_NEAR_PERFECT/HIGH_PRECISION/HIGH_RECALL account or review | >2 distinct posts/day plus fatigue; not a one-post account penalty. |
| Grox spam score health event | RISKY_HIGH_VIZ_REPLY tweet | Conversation author and credibility exceptions. |
| Violence/gore media annotation | GORE_AND_VIOLENCE_HIGH_PRECISION tweet or profile/tweet review | Different image precision/video raw thresholds; protected accounts route to review. |

The resulting enum strings must be followed into visibility filtering to state affected surfaces/actions. Label names alone do not prove shadowbanning, universal reach suppression, or exact ranking multipliers. The published rules contain no general posting-frequency cap, universal block/report ratio penalty, or global engagement “trust score” formula. That absence is a statement about this export, not a claim no omitted system has such logic.

## 10. Audit gaps and source quirks worth preserving

* **Unpublished rules:** explicitly acknowledged; runtime/registry function availability does not mean a rule invoking it exists in this release.
* **Dynamic dependencies:** skip lists, URL verdicts, health scores, predicted label, user snapshots, HLL state, BigQuery job outputs, actioner deciders and AIS success are external. Exact current state and rollout are unobservable from source.
* **Misleading names / dead branches:** rule 6754 has no nonfollower check; 24493 writes only a media tag; 7429's delete arm conflicts with its NearPerfect entry gate; 20789's outer regex permits more strings than inner action regex; manually removed NSFW label alone does not satisfy nested review-submit guard.
* **Time units:** user/tweet-label expiration arguments are absolute ms; URL/fatigue/dedup TTLs are seconds; HLL retention is hours and bucket precision is seconds. Rule expiry is separate from all of these.
* **No extra inference from comments:** helper returning true can mean reported, not labeled; “downrank” local string or descriptive note is not a ranking implementation; statistics and logs are not additional enforcement actions.
