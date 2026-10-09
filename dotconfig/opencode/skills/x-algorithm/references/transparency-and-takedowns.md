# Under the Hood transparency and takedowns

Audited snapshot: `3aa0fa336c4a20e4149b6151629b6050897bb8a5`. Citations give repository-relative `path:line` and symbols; source is bundled in `../source/`. Published defaults are not verification of live switch values. For the full ordered visibility registry and exact label/reason namespaces, use [visibility and labels](visibility-and-labels.md).

## Reading the report correctly

**Under the Hood is a delayed, allowlisted aggregate report, not a live visibility verdict or a reach measurement.** It counts post labels in a bounded observation horizon and account labels at daily sample points. The code does not calculate lost impressions, a ranking penalty percentage, or which individual viewer received which treatment. The JSON carries `notes` explicitly describing the report as “best-effort.” (`under-the-hood/strato/columns/underTheHoodReport.User.strato:36-38,252-335`, `reportNotes`, `buildReportJson`; post/account counting below.)

The README says transparency can reveal manually applied labels and unpublished-system outcomes (`README.md:418-433`). The report implementation does **not** contain a manual-versus-automated provenance column: its post rows expose label/about/effect/posts/denominator/percentage, and account rows label/about/effect/days/denominator/percentage. Descriptions say “automated systems,” “user report,” or both, but do not establish how any **particular instance** was assigned. Full safety-label transport has richer source metadata, separate from this aggregate. (`under-the-hood/strato/columns/underTheHoodReport.User.strato:180-250`; `visibility-filtering-client/tweet_safety_label.rs:180-217`, `proto_to_safety_label`.)

## Availability, dates, and serving behavior

| Concern | Exact implementation | Source / symbol |
|---|---|---|
| Entry point | Requires authenticated Twitter user; only returns report when enabled. Otherwise missing. | `under-the-hood/strato/columns/underTheHoodReport.strato:8-18`, `fetchOp` |
| Feature switches | `under_the_hood_report_enabled=false`; `under_the_hood_report_max_month_bucket=0`; `under_the_hood_report_takedowns_enabled=false`. Recipient setup includes `birdwatch_team` and `employee` roles. | `under-the-hood/strato/lib/params.strato:3-22` |
| Switch source | `features/visibility/main`, not embedded production rollout assignments. | `under-the-hood/strato/columns/featureSwitches.strato:1-4` |
| Eligibility | Account creation strictly **earlier than now−365 days** (exactly 365 days does not pass); **≥10 eligible posts** in report month. A suspended account immediately returns missing. Missing Gizmoduck user fails age check. | `under-the-hood/strato/columns/underTheHoodReport.User.strato:16-21,338-354,372-381,442-460` |
| Period | UTC calendar month. Start first day/end last day; English month label. Starts with previous calendar month. | `under-the-hood/strato/columns/underTheHoodReport.User.strato:40-109` |
| Calendar publication floor | `now >= UTC midnight at the start of the month's **last date** + 10 days`. Before that use month before previous. The variable/comment call it ten days after month end, but this is the literal boundary (e.g. September's last-date midnight +10 days = October 10 00:00 UTC). | `under-the-hood/strato/columns/underTheHoodReport.User.strato:19,79-103`, `monthPublishCalendarReady`, `reportMonthBucket` |
| Month cap | If max-month switch >0 and calendar candidate exceeds it, use cap. No additional validation is shown here. | `under-the-hood/strato/columns/underTheHoodReport.User.strato:90-103` |
| Observation readiness | `finalThroughDay >= last day of month`. Primary month considered ready if user **or** `userId=-1` metadata row says complete; if neither does, fall back **one month**. A present user row must itself be complete to return a report, even if meta made primary selection ready. | `under-the-hood/strato/columns/underTheHoodReport.User.strato:137-140,356-370,383-440` |
| No user row | Complete metadata can return `reportInfo` with posts check false and age result, no report JSON. Missing/incomplete metadata→missing. A present eligible complete row→JSON; ineligible complete row→reportInfo only. | `under-the-hood/strato/columns/underTheHoodReport.User.strato:415-465` |
| Account-day denominator | Inclusive interval between firstCoveredDay and completeThroughDay if both valid within month; otherwise calendar days in month. | `under-the-hood/strato/columns/underTheHoodReport.User.strato:117-129`, `daysInPeriod` |
| Generation timestamp | `generatedAtMs`, else `snapshotEpoch`, else request-time fallback; formatted UTC ISO seconds. It is not a label event timestamp. | `under-the-hood/strato/columns/underTheHoodReport.User.strato:142-153,454-455` |
| Percentages | `(numerator*10000/denominator).toInt`, displayed as hundredths of a percent: truncates, does not round; nonpositive denominator→`0%`. | `under-the-hood/strato/columns/underTheHoodReport.User.strato:165-177`, `formatPercentage` |
| Output totals | `totalPostLabels`/`totalAccountLabels` only emitted as **zero when their section is empty**; not positive counts when nonempty. | `under-the-hood/strato/columns/underTheHoodReport.User.strato:295-335` |
| Privacy/access boundary | Per-user column accessible from outer report column or visibility/birdwatch admin groups; outer column picks authenticated ID. | `under-the-hood/strato/columns/underTheHoodReport.User.strato:471-490`; outer entry point above |

### Post counting: exact window, events, removal and edit behavior

`UthDailyPostsApp` reads creation records and label events from batch-day start minus observationDays through end-of-day; default **7 days**. `countLabelsAsOf` limits each post to `[creationTime, min(creationTime+7 days, batchDayEnd))`. Horizon is based on creation timestamp, not seven days after labeling. A post labeled after its horizon is not added by that event to this report. Observation-age/finality is assigned by calendar-day difference. (`under-the-hood/scalding/UthDailyPostsJob.scala:33-49,102-122,311-323,337-394,417-424`.)

| Question | Answer from implementation |
|---|---|
| What is an eligible post? | Creation records in range, user in requested scope, **not a repost** (`shareSourceTweetId.isEmpty`), **not nullcast**. Quote-posts and replies are not excluded by these predicates. Logical ID is `initialTweetId` if present, otherwise tweet ID; Snowflake creation time from logical ID. (`under-the-hood/scalding/UthDailyPostsJob.scala:217-233`, `loadPosts`.) |
| How are edits/duplicates counted? | Denominator distinct `(userId, authoredDay, logicalId)`; label reduction keys logical ID/user/day/label/creation time, joining physical tweet IDs to logical post. Multiple edit records do not independently count as separate eligible posts. (`under-the-hood/scalding/UthDailyPostsJob.scala:235-255,344-367`.) |
| What is `carried`? | One per logical post **ever Applied** for that label within the accepted horizon, even if later removed. Multiple assignments/renewals do not count multiple times. A remove-only row does not create carried count. (`under-the-hood/scalding/UthDailyPostsJob.scala:369-394`, `countLabelsAsOf`.) |
| What counts as removed? | Last event is remove; or last apply has finite expiry ≥creation and **strictly before deadline**. Expiry exactly at deadline does not count removed. Ties on event timestamp prefer apply. (`under-the-hood/scalding/UthDailyPostsJob.scala:325-335,369-388`, `removedAfterLastAction`.) |
| Does report subtract removals? | **No.** Serving sums `carried` for `posts`; `removed` is persisted but not exposed/subtracted in `postLabelRow`. This is historical occurrence, not current active-label count. (`under-the-hood/strato/columns/underTheHoodReport.User.strato:155-158,180-211,268-279`.) |
| Which event timestamps? | Applied/Removed events only; event timestamp first, label createdAt fallback, else zero. Apply expiration default Long.MaxValue. (`under-the-hood/scalding/UthDailyPostsJob.scala:257-273`, `loadLabelEvents`.) |
| Snapshot gap fill? | Default on; most recent safety-label snapshot no older than **10 days**, or provided filtered snapshot TSV. Expired ≤lookback-start rows excluded; created must be <batch end. Missing created time uses Long.MinValue, which `actionInHorizon` explicitly accepts. Snapshot rows are treated as applies, so they are not exact event-history reconstruction. `--noSnapshotUnion` disables; filtered snapshot path requires union. (`under-the-hood/scalding/UthDailyPostsJob.scala:41-44,72-94,275-323,417-425`.) |
| Can a post count in multiple label rows? | Yes, grouping is per label; percentages across different labels are overlapping, not disjoint categories. (`under-the-hood/scalding/UthDailyPostsJob.scala:365-394`.) |
| Does user/admin NSFW metadata count? | Separate flag path defaults to **`nsfwAdmin` only**, emitted as `NSFW_ADMIN_STAMPED` and reported under alias `NSFW_ADMIN`. Uses creation records, same no-repost/no-nullcast/logical-ID dedup; rows final immediately, age=0, removed=0. Not a live query of current account flag for every old post. `tweetFlags=none` disables. (`under-the-hood/scalding/UthDailyPostsJob.scala:125-145,180-215,412-439`; `under-the-hood/strato/lib/underTheHoodLabels.strato:107-109`.) |

### Account counting is a midnight sample, not duration

`UthDailyAccountLabelsApp` reconstructs state from a recent `UserLabelRecords` seed plus Gizmoduck modification logs, with optional NSFW-admin safety-flag seed/deltas. It sorts events and consumes those with timestamp **≤UTC day start**. A label counts that day iff active and expiration **>day start**. A brief label applied and removed entirely between midnight samples can therefore be absent from account-day totals. It does not sum hours or count “any time during day.” (`under-the-hood/scalding/UthDailyAccountLabelsJob.scala:28-101,118-125,132-186`, `labelsActiveOnDays`.)

* Seed as-of is the **maximum createdAt among seed rows**; empty seed fails job, future or older-than-replay-floor seed fails requirements. Defaults: seedLookbackDays=**2**, freshnessSlackDays=**2**. `seedOnly` omits modification deltas. (`under-the-hood/scalding/UthDailyAccountLabelsJob.scala:33-77,206-221`.)
* Deltas require user ID, do not accept explicit `success=false`, timestamp strictly after seed and before window end. Only `labels.asJson` changes with parseable before/after produce events; every name in after is an active event with expiration, names removed from before are inactive events. (`under-the-hood/scalding/AccountLabelEvents.scala:21-54`, `deltaEventsPipe`.)
* Safety flag reporting defaults to `NsfwAdmin` only; `safetyFlags=none` disables. Flag seeds use replay-floor timestamp; changes require timestamp after seed and before end. (`under-the-hood/scalding/UthDailyAccountLabelsJob.scala:132-160,201-219`.)
* Account activeDays are distinct per label/day before monthly rollup. Serving counts length of activeDays. Counts for different labels overlap. (`under-the-hood/scalding/UthUserMonthMhPublisherJob.scala:250-260,302-315`; `under-the-hood/strato/columns/underTheHoodReport.User.strato:281-293`.)

### Monthly aggregation, data lag and runnable surfaces

`UthUserMonthMhPublisher` defaults to **90-day** daily lookback, **7-day** post observation, daily data floor **20260701**, 50 write shards. Optional `postTakedownDataFirstDay` / `accountTakedownDataFirstDay` determine inclusion of the separate takedown daily datasets; merely having their job source is not proof its data is included. `tsvOnly` and publication-epoch overrides are supported. (`under-the-hood/scalding/UthUserMonthMhPublisherJob.scala:27-52,350-400`, `UthUserMonthMhConfig.fromArgs`.)

Safety post rows retain freshest as-of per user/authored-day/label. Takedown rows retain freshest as-of for **entire user/authored-day group**, then dedup labels and remove carried=0 rows, preventing stale country-combination labels persisting. Post per-day duplicate row selection later takes max `(carried,removed)`, not sum; eligible duplicate daily counts are summed. `finalThroughDay=min(completeThroughDay, asOfDay−postObservationDays)`; month metadata and user rows use this bound. This is arithmetic metadata, not an independent audit that every input partition arrived. (`under-the-hood/scalding/UnderTheHoodCommon.scala:96-122`, `latestAsOfPostLabelRows`, `finalThroughDay`; `under-the-hood/scalding/UthUserMonthMhPublisherJob.scala:173-207,270-326`.)

Default scheduled starts in code: posts and account labels **2026-06-30**, post takedowns **2026-08-01**. These are scheduler declarations, not guarantees of historic availability. (`under-the-hood/scalding/UthDailyPostsJob.scala:449-460`; `under-the-hood/scalding/UthDailyAccountLabelsJob.scala:231-244`; `under-the-hood/scalding/UthDailyPostTakedownLabelsJob.scala:267-280`.)

`legacy_experimental_adhoc/` contains earlier exploratory/backfill jobs; current report semantics above come from the current daily jobs and serving column, not those experiments. The separate reference-month publisher produces population/reference aggregates; current `underTheHoodReport.User` fetches **userMonthAggregates**, not referenceMonthAggregates. A cohort feature in serving thrift is not proof it is rendered. (`under-the-hood/strato/columns/underTheHoodReport.User.strato:389-413`; `under-the-hood/scalding/UthUserMonthMhPublisherJob.scala:329-336`, brandSafetyAgg empty.)

### Experimental reference and brand-safety taxonomy

`UthReferenceMonthMhPublisherApp` is explicitly **“experimental-only / unused now”** at `under-the-hood/scalding/UthReferenceMonthMhPublisherJob.scala:27`. Its code exists, but is not evidence that the current report includes peer comparisons or brand-safety scores.

| Defined surface | Exact values / computation |
|---|---|
| `UthBrandSafetyCategory` | `SAFE=1`, `LOW_RISK=2`, `MEDIUM_RISK=3`, `NOT_OBSERVED=4`; explicitly experimental/unused. User-month and reference-cohort brandSafetyAgg are empty and not served in reportJson. |
| `UthFollowerClass` | `ALL=1`, `LT_1K=2`, `FROM_1K_TO_10K=3`, `FROM_10K_TO_100K=4`, `GTE_100K=5`; thresholds <1,000, <10,000, <100,000, otherwise ≥100,000. |
| Reference cohort dimensions | `followerClass`: own bucket plus ALL; `eligiblePostsInMonth`: ALL plus **GT_10 only if >10**, GT_100 only if >100. These strict thresholds differ from serving eligibility ≥10. |
| Reference sample | Eligible-post user-months inner-join recent Usersource follower snapshot; excludes deactivated, suspended, erased; missing follower count→0. Snapshot max age default 10 days. No serving 365-day age filter here. |
| Reference rates | Per-user carried-label count / max(1, eligible posts); account active-day count / max(1, covered days). Country variants rolled up to reason type. All users expanded over labels observed anywhere that month; missing label contributes zero. |
| `UthRateStats` | mean, p10/p25/p50/p75/p90/p99, nUsers. QTree compression parameter 9 for positive rates; zero mass accounted separately; positive quantile estimated as midpoint of QTree bounds. Mean is user-rate mean, not impression-weighted loss. |

Sources: `under-the-hood/thrift/uth_serving.thrift:25-50,65-79,93-115`; `under-the-hood/scalding/UnderTheHoodCommon.scala:51-55`; `under-the-hood/scalding/UthReferenceMonthMhPublisherJob.scala:110-193,258-350,352-414,486-505`, `loadFollowers`, `eligiblePostVolumeValues`, `RateSketch`, `buildReference`.

## Complete public label allowlists and meaning

These tables inventory **all entries in the report's public copy maps**. “Report description” is the source's summary of wider-product behavior; “Rust VF” points to the narrower implemented rules, including author/age/media exceptions. In particular the report copy says users without stated age generally; Rust gates that category by country. The NSFW precision copy mentions India-local-law treatment, but the Rust registry does **not** contain an India-specific NSFW-label tombstone. A legal takedown reason may independently match. Do not derive a missing rule from copy. (`under-the-hood/strato/lib/underTheHoodLabels.strato:3-105`; `visibility-filtering/rules/registry.rs:100-136`; `visibility-filtering/rules/tweet_rules.rs:312-419`.)

### Post labels (18 public keys plus one alias)

| Exact key | Report description: cause / impact | Rust VF relationship | Source in `postLabels` |
|---|---|---|---|
| `NSFW_HIGH_RECALL` | Automated possible adult content; hidden from nonfollower recommendations and underage/unstated/logged-out viewers | Recs drop; sensitive-viewer drop requires media; no precision-style blur rule | `under-the-hood/strato/lib/underTheHoodLabels.strato:4-9` |
| `NSFW_HIGH_PRECISION` | Automated or user-report likely adult content; warning, recommendation/age/logged-out exclusion; copy adds India restricted due to local laws | Precision blur old/new cutoff, recs drop, media-sensitive drop; no India-specific label rule | `under-the-hood/strato/lib/underTheHoodLabels.strato:10-15` |
| `NSFW_TEXT` | Automated likely adult sexually explicit language; recommendation/age/logged-out exclusion | Recs NSFW-result drop; sensitive drop independent of media | `under-the-hood/strato/lib/underTheHoodLabels.strato:16-21` |
| `NSFW_CARD_IMAGE` | Automated likely adult content; warning and recommendation/age/logged-out exclusion | Sensitive blur, recs drop, sensitive drop independent of media | `under-the-hood/strato/lib/underTheHoodLabels.strato:22-27` |
| `GORE_AND_VIOLENCE_HIGH_PRECISION` | Automated or user-report likely violent content; warning and recommendation/age/logged-out exclusion | Violence blur, recs drop, media-sensitive drop | `under-the-hood/strato/lib/underTheHoodLabels.strato:28-33` |
| `SPAM_HIGH_RECALL` | Automated possible spam; nonfollower recommendation exclusion | Recs-only label drop | `under-the-hood/strato/lib/underTheHoodLabels.strato:34-37` |
| `SPAM` | Automated or report likely Authenticity violation; not shown on X | Home+Recs drop except author | `under-the-hood/strato/lib/underTheHoodLabels.strato:38-42` |
| `MALICIOUS_URL` | Automated likely malicious link; nonfollower recommendation exclusion | Recs-only drop | `under-the-hood/strato/lib/underTheHoodLabels.strato:43-47` |
| `DO_NOT_AMPLIFY` | Historical malicious-link label, being replaced by MALICIOUS_URL; included because remaining labels hide recommendations | **Still registered**, despite migration copy | `under-the-hood/strato/lib/underTheHoodLabels.strato:48-53` |
| `PDNA` | Automated likely ToS violation; not shown pending further review | Home+Recs drop except author, legacy reason NsfwHighPrecision | `under-the-hood/strato/lib/underTheHoodLabels.strato:54-58` |
| `BOUNCE` | Automated or report ToS violation; not shown pending author deletion | Home+Recs drop except author | `under-the-hood/strato/lib/underTheHoodLabels.strato:59-63` |
| `FOR_EMERGENCY_USE_ONLY` | Emergency incident response/custom notice; notice and not Home | Home+Recs drop for everyone; notice implementation not in registry | `under-the-hood/strato/lib/underTheHoodLabels.strato:64-68` |
| `FOSNR_ABUSE` | User-report Abuse/Harassment violation; profile-only discoverability and explanatory label | Home+Recs drop except author; profile notice not implemented here | `under-the-hood/strato/lib/underTheHoodLabels.strato:69-74` |
| `FOSNR_HATEFUL_CONDUCT` | Automation or report Hateful Conduct violation; profile-only and explanatory label | Home+Recs drop except author | `under-the-hood/strato/lib/underTheHoodLabels.strato:75-80` |
| `FOSNR_VIOLENT_SPEECH` | User-report Violent Content violation; profile-only and explanatory label | Home+Recs drop except author | `under-the-hood/strato/lib/underTheHoodLabels.strato:81-86` |
| `FOSNR_CIVIC_INTEGRITY` | User-report Civic Integrity violation; profile-only and explanatory label | Home+Recs drop except author | `under-the-hood/strato/lib/underTheHoodLabels.strato:87-92` |
| `FOSNR_ABUSE_INSULTS` | Automated or report Abuse/Harassment violation; nonfollower recommendation exclusion and explanatory label | Recs-only drop except author | `under-the-hood/strato/lib/underTheHoodLabels.strato:93-98` |
| `NSFW_ADMIN` | Post written by account with report-detected admin-NSFW state; warning and recommendation/age/logged-out exclusion | Safety flag, not a tested SafetyLabelType key; admin flag rules depend on media/repost/viewer context | `under-the-hood/strato/lib/underTheHoodLabels.strato:99-105` |
| Alias `NSFW_ADMIN_STAMPED` | Resolves to public `NSFW_ADMIN` | Creation-time stamp count path above | `under-the-hood/strato/lib/underTheHoodLabels.strato:107-109` |

Exact active predicate/action citations for this crosswalk: `visibility-filtering/rules/tweet_rules.rs:61-169` (`TWEET_LABEL_DROPS`, `NSFW_MEDIA_INTERSTITIALS`), `:171-245` (`OON_TWEET_FLAG_DROPS`, `OON_TWEET_LABEL_DROPS`), `:277-373` (flag interstitials, sensitive drops); full ordered table in sibling reference.

### Account labels (12 public keys)

| Exact key | Report description: cause / impact | Local distinction | Source in `accountLabels` |
|---|---|---|---|
| `ReadOnly` | Locked for ToS violation requiring post removal; account can only read until removal, posts hidden from nonfollower recommendations | Recs label drop here; account write lock elsewhere | `under-the-hood/strato/lib/underTheHoodLabels.strato:112-117` |
| `Compromised` | Automated or report-detected compromised account; recommendation exclusion, password reset required | Recs label drop here; reset workflow elsewhere | `under-the-hood/strato/lib/underTheHoodLabels.strato:118-123` |
| `SpamHighRecall` | Automated likely spam; recommendation exclusion | Recs label drop | `under-the-hood/strato/lib/underTheHoodLabels.strato:124-127` |
| `NsfwHighRecall` | Automated possible adult-content posting; recommendation exclusion | Recs label drop | `under-the-hood/strato/lib/underTheHoodLabels.strato:128-132` |
| `NsfwHighPrecision` | Automated likely adult-content posting; recommendation exclusion | Recs label drop | `under-the-hood/strato/lib/underTheHoodLabels.strato:133-137` |
| `NsfwAvatarImage` | Automated possible adult-content posting; recommendation exclusion | Recs label drop | `under-the-hood/strato/lib/underTheHoodLabels.strato:138-142` |
| `NsfwNearPerfect` | Automated possible adult-content posting; recommendation exclusion | Recs label drop | `under-the-hood/strato/lib/underTheHoodLabels.strato:143-147` |
| `NsfwBannerImage` | Automated possible adult-content posting; recommendation exclusion | Recs label drop | `under-the-hood/strato/lib/underTheHoodLabels.strato:148-152` |
| `NsfwAdmin` | Account identified via report as primarily adult/violent-content posting; warning and recommendation/age/logged-out exclusion | **Safety flag**, not local AuthorLabel enum | `under-the-hood/strato/lib/underTheHoodLabels.strato:153-158` |
| `ImpersonationHighPrecision` | Automated likely Authenticity violation; recommendation exclusion | Recs label drop | `under-the-hood/strato/lib/underTheHoodLabels.strato:159-163` |
| `AbusiveHighRecall` | Automated possible Authenticity violation; recommendation exclusion, security challenge against automated abuse | Explicit follower exception in Rust rule; challenge elsewhere | `under-the-hood/strato/lib/underTheHoodLabels.strato:164-169` |
| `DoNotAmplify` | Automated likely ToS violation; recommendation exclusion pending review | Explicit follower exception in Rust rule | `under-the-hood/strato/lib/underTheHoodLabels.strato:170-176` |

All other local AuthorLabel drops are author-excepted, not follower-excepted inside Recommendations (`visibility-filtering/rules/author_rules.rs:84-173`). Normal in-network posts use Home instead. `NsfwUser`, `POSSIBLY_NSFW_ACCOUNT`, and `SOFT_NSFW` have **no public allowlist entry** here; omission does not prove absence from upstream systems or zero effect elsewhere.

Name resolution removes underscores and uppercases, maps direct canonical key first then alias. Unknown labels return false from `isPostLabel`/`isAccountLabel` and do not render; direct name helper returns original unknown code, while unknown description/effect helper returns empty string. (`under-the-hood/strato/lib/underTheHoodLabels.strato:332-415`.)

## Legal, country and copyright: runtime visibility

### Country joins in the Rust registry

`TakedownPredicates` uses **request country**, not account country. Comparisons ignore ASCII case, without a trim at this Rust join. `xx` is worldwide; `xy` worldwide copyright. Legal/local rules exclude the author and occur in Home, Recommendations, and HomeHydration. Media rules are Recommendations-only and include everyone. (`visibility-filtering/rules/context.rs:250-319`; `visibility-filtering/rules/tweet_rules.rs:396-448`; registry order in sibling reference.)

| Input reason/restriction | Matching behavior | Exact treatment/rule |
|---|---|---|
| `LegalRequest(country)` except `xy` | `xx` matches all; ordinary code must equal present request country | Drop Unspecified / `DropLegalTakendownPostRule`, except author |
| `LegalRequest(xy)` | Explicitly **ignored** by legal extractor | No drop from this reason |
| `UnspecifiedReason(country)` | `xx` **or `xy`** matches worldwide; ordinary code must equal request country | Same legal drop |
| `Dmca` post reason | Converted to effective `xy`, matches worldwide even with no request country | Same legal drop |
| `BystanderReport(country)` | Ordinary country only, must equal present request country | Drop Unspecified / `DropLocalLawsTakendownPostRule`, except author |
| `BystanderReport(xx)` / `(xy)` | Explicitly **ignored**, unlike generic worldwide check | No local-laws drop from reason |
| Missing request country | Ordinary legal/local country reasons do not match; worldwide legal/DMCA still match | As above |
| Media `is_dmca=true` | Any qualifying media entity suffices | Drop Unspecified / `DropTweetsWithDmcaMediaRule`, everyone, Recommendations only |
| Media geo restriction | Nonempty concatenated allow-list omits request country OR deny-list contains it; absent country treated as literal `xx`. Case-insensitive. Deny wins if both lists include country. | Drop Unspecified / `DropTweetsWithGeoRestrictedMediaRule`, everyone, Recommendations only |

Sources: `visibility-filtering/rules/context.rs:262-319`, `in_viewer_country`, `media_restricted_in_viewer_country`, `legal_takedown_country`, `local_laws_takedown_country`; `visibility-filtering/hydration/tes_hydrator.rs:195-219`, `media_feature`. Account NSFW-gating geography instead uses account-country priority; do not reuse these country semantics for it (`visibility-filtering/rules/context.rs:78-85`).

### Account takedown redaction versus post takedown handling

`RedactUnenforcedTakedownsFilter` is installed at the end of the published Gizmoduck read filter chain. It runs for `GetRequest` responses **only if enableReadGate is true**; it removes selected entries from `takedownCountryReasons`, leaving the user and other takedown fields in place, and increments `redacted_unenforced_takedowns`. It trims and case-folds country codes. The gate's provider/deployed setting is not in these files. (`takedowns/gizmoduck/ReadFilters.scala:10-37`; `takedowns/gizmoduck/RedactUnenforcedTakedownsFilter.scala:18-61,80`.)

| Account stored reason | Redacted as unenforced on enabled reads? |
|---|:---:|
| `UnspecifiedReason(xy)` | Yes |
| `LegalRequest(xy)` | Yes |
| `BystanderReport(xx)` | Yes |
| `BystanderReport(xy)` | Yes |
| `Dmca` | Yes |
| Other reason/country, including legal/unspecified `xx` and ordinary country | No |

Source: `takedowns/gizmoduck/RedactUnenforcedTakedownsFilter.scala:64-80`, `isUnenforcedTakedown`. **Do not apply this account-only list to post reasons:** post `UnspecifiedReason(xy)` and post `Dmca` do cause worldwide Rust legal drops.

`TakedownReasonsTransform.get` does work only if envelope `hasTakedown` is true. It obtains tweet reasons from populated envelope or Tbird Manhattan fallback; retrieves author's Gizmoduck TAKEDOWNS; concatenates tweet + user reasons, and separately preserves `tweetypieOnlyTakedownReasons=tweet reasons`. Missing author/user reasons become empty. No deduplication shown. The `TakedownReasonsColumn` exposes this transform through `TweetFieldKeyType.TakedownReasons`. (`takedowns/tweet-entity-service/TakedownReasonsTransform.scala:19-73`; `takedowns/tweet-entity-service/TakedownReasonsColumn.scala:14-25`.)

## Takedown reporting taxonomy and rendering exceptions

`TakedownLabels.ReasonType` exact names/order: **1 `LegalRequest`**, **2 `BystanderReport`**, **3 `UnspecifiedReason`**, **4 `Dmca`**, **5 `is_dmca`** (local symbol `DmcaMedia`). Only first three country-scoped. Account-event spelling parser accepts `LEGAL_REQUEST`, `BYSTANDER_REPORT`, `UNSPECIFIED`, `DMCA`. Unknown arms ignored. Country normalization trims/lowercases; generated labels distinct/sort countries, e.g. `LegalRequest(de, fr)`. Serving splits label and country list; display uppercase codes. (`under-the-hood/scalding/TakedownLabels.scala:7-83`, `ReasonType`, `label`, `splitForServing`; `under-the-hood/strato/lib/underTheHoodLabels.strato:252-278`.)

Complete public-copy keys:

| Key | Post report | Account report | Meaning/effect in public copy |
|---|:---:|:---:|---|
| `BystanderReport(country)` | Yes | Yes | Found to violate local law after third-party report; post / account's posts not shown in named countries |
| `LegalRequest(country)` | Yes | Yes | Legal demand; not shown in named countries |
| `UnspecifiedReason(country)` | Yes | Yes | Historical legal-demand or third-party local-law withholding; not shown in named countries |
| `LegalRequest(xx)` | Yes | Yes | Worldwide legal-demand withholding; not shown on X |
| `UnspecifiedReason(xx)` | Yes | Yes | Worldwide historical withholding; not shown on X |
| `UnspecifiedReason(xy)` | Yes | **No** | Copyright-holder/representative report, along with DMCA; post not shown |
| `Dmca` | Yes | **No** | Copyright-holder/representative report; post not shown |
| `is_dmca` | Yes | **No** | Nonfollower recommendation exclusion; media unavailable where post appears |
| `LegalRequest(xy)` | **No** | **No** | No public-copy entry |
| `BystanderReport(xx)` / `(xy)` | **No** | **No** | No public-copy entry |

Sources: `under-the-hood/strato/lib/underTheHoodLabels.strato:178-250`, `postTakedowns`, `accountTakedowns`. Entries only render when the takedown switch is enabled and `postTakedownInfo`/`accountTakedownInfo` resolve. Resolver priority is **xx first, then xy, then ordinary-country**; no-country scoped labels resolve none. Thus a country list containing xx or xy selects that special key rather than one ordinary-country row; an unsupported special key suppresses the row. Display name includes supplied uppercase codes. (`under-the-hood/strato/lib/underTheHoodLabels.strato:255-305`; `under-the-hood/strato/columns/underTheHoodReport.User.strato:180-250`.)

### Post takedown reconstruction

`UthDailyPostTakedownLabelsApp` combines PCTD audit actions, DMCA audit deltas, and (default enabled) TweetTakedownEvent state observations. It reads logs starting **observationDays +1 day** before range start, eligible post creation records starting observationDays before, maps physical IDs to logical initial IDs, deduplicates observations, then replays by user/logical post. Default horizon **7 days**, positive required; supports `noTweetEvents`, defaults four write shards. Only creation-eligible posts join, so the same repost/nullcast exclusions apply. (`under-the-hood/scalding/UthDailyPostTakedownLabelsJob.scala:39-55,65-125,189-227,239-256`.)

* PCTD post deltas require action type `Status`, tweet ID, known reason or nonempty country fallback→UnspecifiedReason; timestamp seconds×1000; `takendown` determines applied/reversed. (`under-the-hood/scalding/TakedownDeltas.scala:76-97`.)
* DMCA-media audit rows require type `Media`, tweet ID, parseable content `(dmca)` or `(undo_dmca) [numericMediaId:…]`. It **excludes** rows with fingerprintId, copyrightViolationInfo, or `byAutomatedServiceIdentifier="user-image-service"` (`isCopyrightViolationRow`). This is an explicit input exclusion, not a blanket manual-only or automated-only definition. (`under-the-hood/scalding/TakedownDeltas.scala:99-134`.)
* TweetTakedownEvent snapshots use event flags timestamp and supported reason arms. At equal timestamps, state observations reset withholding to union of supplied reasons; deltas sorted false→true apply afterward, so add wins over same-time removal. DMCA-media tracked per media ID, and any remaining withheld media adds synthetic `is_dmca`. (`under-the-hood/scalding/TakedownDeltas.scala:137-153`; `under-the-hood/scalding/TakedownReplay.scala:17-40`, `effectiveStates`.)
* `labelRowsAsOf` requires post creation inside creation window and observation timestamp before min(creation+horizon, batchEnd). Unlike normal safety `actionInHorizon`, it **does not explicitly require event timestamp ≥creation**. (`under-the-hood/scalding/UthDailyPostTakedownLabelsJob.scala:201-227`.)
* For each reason type ever observed, report label reflects most recent **nonempty country set**. `carried=1` even if no longer withheld; `removed=1` when absent from final state. It also emits superseded country-combination labels with carried/removed=0 to clear old aggregates. First-withheld timestamp and final withheld boolean appear in debug TSV, not public report row. (`under-the-hood/scalding/TakedownReplay.scala:46-79`, `postLabels`; `under-the-hood/scalding/UthDailyPostTakedownLabelsJob.scala:168-175`.)

### Account takedown reconstruction

`UthPctdAccountTakedownEventsApp` works backward from a Usersource snapshot near end-of-range pivot, combining account PCTD audit deltas and Gizmoduck takedown field changes. It excludes recognized test accounts as well as applying optional user scope. Snapshot anchoring chooses one reason per `(user,country)` with priority **LegalRequest > BystanderReport > Dmca > UnspecifiedReason**. Countryless DMCA becomes `xy`. (`under-the-hood/scalding/UthPctdAccountTakedownEventsJob.scala:46-81,127-159`.)

PCTD deltas require `User` type, nonempty country, timestamp **>rangeStart and ≤pivot**. At a midnight, withholding is inverse of the next delta's applied flag; if none, snapshot presence. Reason selection is latest after-arm at/before day start, otherwise earliest before-arm after day start, otherwise snapshot reason, otherwise highest-priority audit reason. Unknown reason can leave a withheld state without rendered reason row. Outer-join keys originate from audit deltas or snapshot; arm-only keys do not independently seed a key. (`under-the-hood/scalding/UthPctdAccountTakedownEventsJob.scala:247-349`, `deltas`, `KeyResolution`, `resolveKeys`, `withheldAtDayStarts`.)

Gizmoduck changes accept `takedowns.takedownCountryReasons` string arms or `takedowns.asJson`; explicit failed modifications excluded. Parsers map only known reason types, so malformed/missing values are not a general recovery of all legal policy data. (`under-the-hood/scalding/UthPctdAccountTakedownEventsJob.scala:161-242`.)

Daily account takedown rows group `(user,day,reason)` countries into one sorted/distinct reason-country label. Default write shards four; outputPath required; optional debug TSV. Scheduled account-takedown start is **2026-08-01**. (`under-the-hood/scalding/UthPctdAccountTakedownEventsJob.scala:386-425,439-451`, `accountLabelRows`, `UthPctdAccountTakedownEventsConfig`.)

## Coverage / limits for answers

Covered locally: complete 18-post/12-account public label maps and alias; legal/copyright copy variants; all runtime takedown country exceptions; account-read redaction; post/account merge; report auth/eligibility/switches; calendar and observation lag; edit/dedup/removal/expiration counting; post/admin flags; manual/automated provenance distinction; post and account takedown replay and exclusions; monthly freshness handling.

Not established by this snapshot: current rollout, live label status for a specific account, whether every production dataset partition was available, exact upstream label classifiers/policy internals, full imported enum definitions, or Grox prompt text. README explicitly lists Grox `.j2` prompts and some Botmaker rules as unpublished (`README.md:418-438`). Report descriptions can explain intended broader-product effects, but do not substitute for the implemented rule predicate or prove a current enforcement. Empty report sections mean no **rendered allowlisted counts in that report window**, not a certificate that every post is unrestricted now.
