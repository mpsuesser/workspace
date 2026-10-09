---
name: x-algorithm
description: "X For You algorithm reference and reach optimization. Use for questions about X/Twitter feed ranking, recommendation eligibility, engagement signals, niche distribution, profile or post optimization, posting cadence, followers, visibility labels, or claims about the xai-org/x-algorithm code."
---

# X For You algorithm

Self-contained, source-backed reference to **xai-org/x-algorithm**, pinned to **September 22, 2026**, commit **`3aa0fa336c4a20e4149b6151629b6050897bb8a5`**. All paths below are relative to this skill directory. This describes the published snapshot; it is not a live view of X configuration or a copy of learned production model weights.

## Answering workflow

1. **Route the question** using the table below. Read the relevant manual before making mechanism or numerical claims. For reach advice, also read [optimization-playbook.md](references/optimization-playbook.md). Done when the relevant retrieval, ranking, eligibility, and user-control distinctions are identified.
2. **For optimization, define the audience and objective.** Separate broad impressions from qualified reach, profile visits, relevant follows, replies, or conversions. Use supplied context, state reasonable assumptions, and ask only for information that would change the advice. Done when the intended audience and outcome are explicit; a full intake form is unnecessary.
3. **Resolve the exact condition.** Identify viewer versus author, follower versus non-follower, original versus reply/repost/quote, default versus feature-gated branch, and prediction versus observed engagement. Follow the manual's source citations for edge cases. Done when every claimed coefficient, threshold, exception, and causal link has evidence or an explicit uncertainty label.
4. **Answer in layers:** direct answer; mechanism with a local reference section and source path/symbol; practical implication; material uncertainty. Label advice as **code-backed**, **inference**, or **experiment**. An unknown should specify what is missing. For optimization, give controllable actions and measurements. Done when each recommendation has an evidence chain or a test, and the reader can distinguish implementation from hypothesis.

For a detail absent from the manuals, search the local [source inventory](indexes/source-inventory.md), component symbol index, and `source/`. The entire published tree is bundled here: **no GitHub checkout or network access is needed**. Read only the matching files/line ranges, not the whole archive. If the code calls an unpublished service or prompt, answer with the visible contract and the missing detail. Fetch newer algorithm evidence only when asked to update or compare releases. User-supplied public profiles, posts, and accessible reports may be read for the requested consultation; pasted/exported material supports the same workflow offline.

## Topic router

| Question | Read |
|---|---|
| Overall architecture, evidence strength, release scope, missing information | [overview-and-provenance.md](references/overview-and-provenance.md) |
| Weights, dwell, likes/replies/shares, negative signals, score formula, new authors, mutual follows, repeated authors, DPP reranking | [ranking-and-weights.md](references/ranking-and-weights.md) |
| Pipeline sequence, all filters, age/seen/served, replies/quotes/reposts, ads, blending, caching/failures | [pipeline-and-filters.md](references/pipeline-and-filters.md) |
| Which viewer/author/post fields are loaded; engagement history, profile/account metadata, hydration | [features-and-context.md](references/features-and-context.md) |
| Phoenix internals, embeddings/hashing, model features/labels, attention, training, losses, serving | [phoenix-models.md](references/phoenix-models.md) |
| Getting into the candidate pool, follows, target niches, Thunder, retrieval index, SimClusters, language/topics | [retrieval-and-audiences.md](references/retrieval-and-audiences.md) |
| Visibility eligibility, every rule/label, follower exceptions, adult/sensitive content, blocks/mutes | [visibility-and-labels.md](references/visibility-and-labels.md) |
| Account reputation, reports/blocks, UserCred/PageRank, behavior models, labels/challenges/suspensions | [reputation-and-enforcement.md](references/reputation-and-enforcement.md) |
| Published event rules and their triggers, labels, counters, TTLs | [event-rules.md](references/event-rules.md) |
| Text, images, video, URLs/cards, Grox classifiers, CLIP, adult-media modeling | [content-and-media.md](references/content-and-media.md) |
| Under the Hood, visibility diagnosis, legal/country withholding, report aggregation and lag | [transparency-and-takedowns.md](references/transparency-and-takedowns.md) |
| Profile, posts, cadence, relevant followers, experiments, broad versus niche reach | [optimization-playbook.md](references/optimization-playbook.md) |
| Common claims: links, Premium, hashtags, first-hour rules, follower ratios, deletion, shadowbans | [claim-checks.md](references/claim-checks.md), then the cited mechanism manual |
| Numerical examples: probability versus counts, mutual follows, negative scores, author competition, cold-start boundaries, DPP zeros | [worked-examples.md](references/worked-examples.md) |
| Obscure symbol, constant, schema field, test, or exact implementation | [source-inventory.md](indexes/source-inventory.md), then `indexes/symbols-<component>.md` and `source/<path>` |
| Refreshing or verifying this skill | [maintenance-and-coverage.md](references/maintenance-and-coverage.md) |

## Core mental model

**Eligible inventory → candidate retrieval → hydrated context → pre-ranking filters → personalized action predictions → weighted score and adjustments → diversity reranking → selection → visibility and conversation filtering → blending → served/seen feedback.**

- **Retrieval is a bottleneck.** A post that never becomes a candidate cannot win on rank. Thunder uses the viewer's follow relationships; Phoenix retrieval and SimClusters discover other content.
- **The score is viewer-specific.** Action weights multiply predicted probabilities or predicted continuous values, not raw like/reply/report counts. A coefficient ratio is not an exchange rate between observed engagements.
- **Ranking and eligibility are separate.** Labels, relationship controls, content availability, geographic requirements, and ancillary-post eligibility can remove a post regardless of its score.
- **A follow is directional.** Someone following you can make your posts in-network for that viewer. Your following someone changes your own viewer context; it does not automatically make your posts in-network for them. Mutual-follow adjustments are a separate conditional mechanism.
- **Post competition remains after model prediction.** Candidate-isolated transformer inference does not imply batch-independent final rank: author adjustments, reranking, selection, conversation deduplication, and blending depend on other candidates.
- **Defaults have provenance.** The repository says a cron syncs primary production defaults, while experiments and runtime overrides can differ. Cite a number as a snapshot default with its condition, not an immutable universal rule.

## Evidence discipline

Use these labels where the distinction matters:

- **Implementation:** directly visible control flow, formula, schema, or test at this commit.
- **Default:** a value in published configuration; state any gate or alternate branch.
- **Repository claim:** the README or an upstream document says it; verify important details against implementation.
- **Inference:** a plausible behavioral implication of an implementation, not an observed causal result.
- **Experiment:** a proposed test with the user's analytics.
- **Unknown/unpublished:** learned parameters, omitted rules/prompts, live experiment assignment, unavailable downstream logic, or a causal effect the source cannot establish.

Use modern source for modern claims. This snapshot includes SimClusters and graph/reputation systems alongside Phoenix; broad statements that the system has “no hand-engineered features,” “no graph signals,” or “only one transformer” lose important distinctions. Historical Twitter/2023 weights and early-2026 demonstration-model constants require an explicit historical comparison, not substitution into this snapshot.

## Citation convention

Manuals cite upstream-relative `path:line-range` plus symbols. Resolve these as `source/path` within this skill; line numbers refer to the immutable source snapshot. For a clickable external citation, use:

`https://github.com/xai-org/x-algorithm/blob/3aa0fa336c4a20e4149b6151629b6050897bb8a5/<path>#L<start>-L<end>`

Use a local manual heading for explanation and the pinned source path for the decisive fact. Cite `source/README.md` only for repository claims, not in preference to contradictory executable code.
