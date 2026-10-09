# Verification record

Audit date: **September 22, 2026**. Upstream snapshot: **`3aa0fa336c4a20e4149b6151629b6050897bb8a5`**.

## Method

Seven component audits examined the published request pipeline, ranking, Phoenix models, retrieval backends, visibility/reporting, account reputation/event enforcement, and content/media understanding. Separate reviews checked consultation design, high-impact mechanisms, and offline answerability. The manuals distinguish implementation, checked-in defaults, repository descriptions, inference, and unavailable dependencies.

This is **static source/document verification**, not execution of X's production systems, reconstruction of learned weights, or a claim that the released services were built and tested end-to-end. A cited source test documents an intended property; it is not represented as a test run performed during this audit.

## Source completeness

- Manifest compared with the pinned Git tree: **2,084 paths, original modes, and blob IDs matched exactly**.
- Archived source totals **14,720,549 bytes**.
- SHA-256 and Git-blob integrity checks cover every archived file.
- Original symlink content is preserved as inert target text, with its original mode recorded.
- File/symbol indexes are generated navigation aids; all original code, tests, configuration, documentation, and license blobs remain available under `source/`.

## Independently checked mechanism inventories

| Area | Checks |
|---|---|
| Local ranking | **26/26 coefficients**, field mapping, offset branches and sums, mutual-follow eligibility, ordering, author decay, OON conditions, cold-start boundaries, multiplicative unexplored, VQV gates |
| VM/DPP | Service versus caller gates, kernel, greedy selection, score preservation/zeroing, selector interaction, unavailable deployment state |
| Visibility | **56 recommendation rule names in exact order**, including 30 Home names plus 26 extensions; HomeHydration ordering; explicit follower exceptions |
| Label namespaces | 17 distinct active post-label triggers, 11 local author labels, 32 client safety-reason variants, UTH's 18 post keys plus alias and 12 account keys |
| Retrieval | Engaged-tweet SimClusters seeds, online/offline caps, Phoenix favorite-route thresholds and exceptions, Thunder retention versus request filtering, small-author boundary differences |
| Pipeline and context inventory | All 65 query fields and 75 candidate fields accounted for; every source, filter, side-effect, query-hydrator, and candidate-hydrator component file cited |
| Transparency | Report eligibility, historical carried-label counts, midnight account sampling, publication/observation lag, no per-instance assignment provenance, country/DMCA exceptions |
| Published event rules | **All 20 `.bot` files** represented; sampled helpers, counter/expiry behavior, exemptions, and unreachable branches checked |
| Reputation/behavior | UserCred formula and graph normalization, Agatha targets versus predictions, BDSM redacted values and branch ordering, mocked enforcement configuration distinguished |
| Content understanding | PTOS's 10 categories and 35 policy enum values, omitted prompts, sampled classifier-to-action mappings, reply-score persistence, media calibration and failure paths |

Corrections from review were incorporated into the manuals, including numerical perturbation qualifications, historical-document provenance, integration-boundary clarifications, and conditional NSFW-helper return/side-effect behavior.

Phoenix review also matched **all 212 named action labels** and their numeric gaps against the protobuf enum, checked full-table two-tower search and SID ordinal-score resolution, and reconciled continuous-slot terminology: the flagship click-dwell slot predicts **P(raw click dwell >10 seconds)**, while the full client mapping into Home Mixer remains unpublished.

Pipeline/feature review checked source and hydrator gates, identity-sensitive filters, cache and failure behavior, ad blending, request serialization, and Brazil election filtering. Corrections distinguish generic cache lookup from concrete deduplication, pre-module feed positions from later URT sort indexes, and request-builder capabilities from the actual Phoenix scorer's missing-sequence/cache/error branches.

## Offline consultation test

A separate reader was restricted to `SKILL.md` and authored manuals—**no source checkout, bundled source reading, or network**—and answered all 12 questions with supporting manual headings:

1. Exactly 1,000 followers versus 1,000 Home impressions for cold-start eligibility.
2. Exactly 10 seconds and viewer-versus-author follower count in VQV gating.
3. Why reports do not cancel counted likes at a fixed exchange rate.
4. Mutual-follow quote eligibility.
5. Why ten-minute spacing is not a coded author-diversity bypass.
6. Why 32 favorites is not universal Phoenix admission.
7. Current SimClusters engaged-tweet seeds versus direct InterestedIn queries.
8. Online 50-cluster versus offline 400-cluster behavior.
9. DPP zeroing versus deletion and possible survival through selection.
10. Removed post labels remaining in UTH historical counts.
11. Rule-specific follower exceptions versus policy selection.
12. Why an author's niche likes do not establish automatic retargeting of authored posts.

Long manuals can exceed a single tool-read limit. The router and section headings support targeted searches/slices rather than loading all reference text into one conversation.

## Repeatable mechanical checks

Run `python3 scripts/snapshot.py verify` from the skill directory. It checks snapshot identity/integrity, documentation file links, and explicit citation bounds. Bounds checks establish that the cited text exists, not that it semantically proves every surrounding sentence; semantic reviews above serve that separate purpose.
