# Overview and provenance

## Snapshot identity

| Item | Value |
|---|---|
| Repository | https://github.com/xai-org/x-algorithm |
| Commit | `3aa0fa336c4a20e4149b6151629b6050897bb8a5` |
| Commit time | `2026-09-22T04:11:08+00:00` |
| Commit message | `Open-source X Recommendation Algorithm` |
| Skill audit date | September 22, 2026 |
| Source evidence | All 2,084 tracked blobs, 14,720,549 bytes, under `../source/` |
| Integrity inventory | `../SOURCE-MANIFEST.json`: path, original Git mode/blob ID, SHA-256, byte and line counts |
| License | Apache-2.0; complete upstream license at [source/LICENSE](../source/LICENSE) |

Upstream symlink blobs are saved as inert text containing their exact target, not followed. Executable modes are recorded rather than applied. This preserves evidence and prevents dependencies outside the snapshot from masquerading as bundled source. No `.git`, generated training output, downloaded weights, private production data, or executable deployment installation is included.

## Release context

The root README's “Notable Updates” records:

- **August 13, 2026:** configuration/action weights published; visibility/enforcement and account/media systems added; Phoenix demonstration replaced with training/serving code and synthetic-data generation; SimClusters added; Under the Hood pilot introduced.
- **August 14:** explicit clarification that weights multiply personalized predicted probabilities/continuous values, not observed engagement totals; Brazil election account filtering noted, with account list updated August 27.
- **September 18:** Under the Hood added information about country/legal visibility restrictions on accounts/posts.

Evidence: `README.md:29-57`. These are upstream release descriptions, not a reconstruction of every historical deployment.

## Two paths, two distinct questions

### Request path: “What does this viewer receive now?”

1. Home Mixer hydrates viewer/request context: engagement sequence, follows, blocks, mutes, keywords, seen/served state, topics, and other request inputs.
2. Parallel candidate sources retrieve inventory. Thunder is primarily followed-author recent content; Phoenix retrieval and SimClusters supply discovery candidates. Additional wrappers and special sources are cataloged in the pipeline manual.
3. Candidate hydration attaches data needed by filters, ranking, and response construction.
4. Pre-scoring filters remove ineligible/repeated/old/missing items.
5. Phoenix predicts per-viewer action outcomes. RankingScorer blends them and applies conditional adjustments. VMRanker invokes embedding-based reranking.
6. Selection orders and limits candidates.
7. Visibility and ancillary/conversation processing can remove selected candidates.
8. The outer For You pipeline blends ranked posts with ads, Who to Follow, prompts, and other modules; blending can alter organic adjacency/order.
9. Side effects record serving, update caches, and emit events used by later requests.

The exact implementation order, gates, and failure handling in [pipeline-and-filters.md](pipeline-and-filters.md) take precedence over this overview. Source: `README.md:63-169,241-281` and pipeline code cited there.

### Labeling path: “Can this content be recommended or displayed?”

Text/media classifiers, account-response aggregates, behavior models, and graph reputation produce evidence used by event rules and enforcement. These systems write labels on posts/accounts. Visibility Filtering reads labels plus viewer-author relationships, viewer settings/country, and account/post state to return allow/interstitial/drop. Ancillary post eligibility can propagate to a quote, repost, or conversation candidate.

A model score, a label assignment, and a visibility verdict are separate stages. The existence of a classifier does not establish that its output is a Phoenix ranking feature or that every label always drops content.

Source: `README.md:171-230,285-318`; see visibility, content, and enforcement manuals for exact connecting code.

## What the public snapshot establishes

- Source-visible formulas, threshold/default values, conditions, dependency contracts, published rules, transformations, data structures, and test expectations.
- The configuration defaults the repository describes as periodically synchronized to primary production values.
- Concrete mechanisms through which follows, engagement history, candidate content, feedback, account labels, and repeated exposure may affect distribution.
- Architecture/training/serving code sufficient for the included synthetic Phoenix proof of concept, where its manifests and quickstart are supplied.

## What it cannot establish

- The exact personalized score of a particular real post for a particular viewer without the learned parameters, features, and runtime configuration.
- A fixed causal number of impressions earned by changing a bio, hashtag, posting interval, link placement, follower count, or engagement count.
- The full deployed experiment mix or current configuration beyond the pinned release. The README says the aim is to expose experiments reaching a notable share, giving 10% as an example; that is not a completeness guarantee for all traffic.
- Full Grox prompt text or all botmaker rules. The README expressly identifies these as partly unpublished.
- Hidden service internals behind calls whose definitions are absent, deployment topology omitted from the release, or proprietary training data.
- Which labels a particular user's account currently has, unless the user supplies the relevant reporting output.
- Whole-platform behavior outside the represented For You paths, such as universal search ranking or every notification/reply ordering system.

Source: `README.md:406-438,444-448`. Keep uncertainty local to the missing fact instead of weakening source-backed facts with vague blanket caveats.

## Interpreting negative evidence

Three distinct claims:

1. “This scorer does not read field X” can be verified by its inputs and arithmetic.
2. “No published path in the snapshot uses X for purpose Y” requires a repository-wide search and call-path analysis.
3. “X can never affect reach” generally does not follow: model content representations, omitted systems, human behavior, and other platform surfaces may still mediate an effect.

When checking a popular claim, identify the claimed component and causal path. Report the narrowest finding that the source actually supports.
