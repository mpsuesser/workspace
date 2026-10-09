# Claim checks and common confusions

This index identifies the exact question to resolve, rather than replacing implementation detail with folklore. Follow the linked manual for current snapshot values and exceptions.

## Scoring claims

| Claim/question | Accurate answer or verification boundary | Read |
|---|---|---|
| “One report cancels N likes.” | False interpretation of action weights. They multiply personalized predicted probabilities/continuous values, not observed event counts. Count changes may affect upstream state through other mechanisms. | [ranking](ranking-and-weights.md); `README.md:39,341-349` |
| “The largest positive coefficient tells me the best content format.” | It does not: prediction scales, base rates, caps/transforms, viewer context, eligibility, and other objectives matter. | [ranking](ranking-and-weights.md), [models](phoenix-models.md) |
| “Replies are worth exactly X times likes.” | A ratio of coefficients is a marginal arithmetic ratio for their specified model outputs, not a causal exchange rate between real replies and likes. Check any action-specific corrections and transforms. | [ranking](ranking-and-weights.md) |
| “More engagement can only help.” | Negative predictions, different engagement types, author/content eligibility, and viewer-specific satisfaction invalidate this generalization. | [ranking](ranking-and-weights.md), [visibility](visibility-and-labels.md) |
| “This post has one global algorithm score.” | Scores are viewer/request dependent. Counts are shared metadata, not a universal recommendation score. | [models](phoenix-models.md), [features](features-and-context.md) |
| “Candidates cannot attend to one another, so other posts cannot affect rank.” | Model candidate isolation is narrower than final-ranking independence. Repeated-author adjustments, diversity reranking, selection, deduplication, and blending introduce competition. | [ranking](ranking-and-weights.md), [pipeline](pipeline-and-filters.md) |
| “Dwell always means the same thing.” | Inspect the exact head/label: binary dwell, continuous dwell time, click dwell, active seconds, and video outcomes are distinct. | [models](phoenix-models.md), [ranking](ranking-and-weights.md) |
| “A zero-weight action cannot matter at all.” | Zero direct contribution in that formula is narrower than no effect on history, learned representations, other heads, or retrieval. | [ranking](ranking-and-weights.md), [models](phoenix-models.md) |

## Account, followers, and targeting claims

| Claim/question | Accurate answer or verification boundary | Read |
|---|---|---|
| “Following a large account makes my posts in-network for it.” | Direction reversed. That account must follow you for your posts to be in its followed-author inventory; mutual-follow conditions are separate. | [retrieval](retrieval-and-audiences.md), [ranking](ranking-and-weights.md) |
| “Liking posts in a niche automatically retargets my posts into that niche.” | Your history directly personalizes your consumption. Any effect on others' recommendations needs a specific graph/model path; there is no general reciprocal targeting guarantee. | [retrieval](retrieval-and-audiences.md), [models](phoenix-models.md) |
| “More followers always produce more discovery reach.” | Follows can create in-network opportunities; relevant interactions/graph structure and per-viewer rank matter. Count alone is not a guaranteed OON multiplier. | [retrieval](retrieval-and-audiences.md), [reputation](reputation-and-enforcement.md) |
| “Removing inactive followers improves my global score.” | Requires a demonstrated affected computation and net causal evidence. Do not infer it from engagement-rate arithmetic alone. | [reputation](reputation-and-enforcement.md), [optimization](optimization-playbook.md) |
| “There is a perfect follower/following ratio.” | Inspect exact UserCred/valid-user/graph construction conditions if relevant. Those do not establish a universal author growth optimum. | [reputation](reputation-and-enforcement.md) |
| “Premium/verified always gives a fixed For You boost.” | Trace the exact flag, subscriber/viewer/author distinction, branch, gate, and configured coefficient. Subscription access and verification metadata are not themselves a universal multiplier. | [features](features-and-context.md), [ranking](ranking-and-weights.md), [pipeline](pipeline-and-filters.md) |
| “New author means a newly created account.” | Verify the boost's actual eligibility fields and thresholds; an impression-based criterion is different from account age. | [ranking](ranking-and-weights.md) |
| “Mutual follows currently have the viral multiplier someone quoted.” | Consult the pinned defaults and bidirectional-boost change history. Historical/experimental values must be labeled as such. | [ranking](ranking-and-weights.md); `source/docs/BIDIRECTIONAL_BOOST_CHANGE.md` |
| “Every author is permanently assigned one niche.” | SimClusters represents multiple weighted interests/associations; Phoenix adds learned representations. No general permanent single-topic assignment follows. | [retrieval](retrieval-and-audiences.md) |
| “Changing bio keywords directly changes a known ranking coefficient.” | Distinguish human profile conversion, metadata hydration, text representation, and actual scorer input. Prove the specific path before asserting direct ranking causality. | [features](features-and-context.md), [models](phoenix-models.md), [optimization](optimization-playbook.md) |

## Content and scheduling claims

| Claim/question | Accurate answer or verification boundary | Read |
|---|---|---|
| “External links always suppress reach.” | Check link-related ranking terms and conditional rules/classifiers. A URL feature or link-click action is not proof of an unconditional link penalty. A narrower conditional effect may exist. | [ranking](ranking-and-weights.md), [content](content-and-media.md), [event rules](event-rules.md) |
| “Putting the link in a reply is always better.” | Changes post type, parent dependency, click path, and who sees which object. Compare the actual objective; no universal causal conclusion follows. | [pipeline](pipeline-and-filters.md), [optimization](optimization-playbook.md) |
| “Images/video receive an unconditional boost.” | Inspect media-conditioned terms, model outputs, duration gates, and viewer/request filters. Content usefulness and consumption predictions are not equivalent to mere media presence. | [ranking](ranking-and-weights.md), [content](content-and-media.md) |
| “Use exactly N hashtags.” | No universal optimum is established. Examine token/content/keyword and abuse paths if a specific claim is made; test relevance and response. | [content](content-and-media.md), [pipeline](pipeline-and-filters.md), [event rules](event-rules.md) |
| “Editing/deleting/reposting resets the algorithm.” | Inspect lifecycle events, IDs, deduplication, caches, seen/served records, and availability. A new ID is not proof of erased model history or guaranteed new reach. | [retrieval](retrieval-and-audiences.md), [pipeline](pipeline-and-filters.md) |
| “The first N minutes determine everything.” | A universal rule needs an explicit gate/window. Inventory age, decay, viewer history, updates, and feedback have different clocks. | [retrieval](retrieval-and-audiences.md), [pipeline](pipeline-and-filters.md), [models](phoenix-models.md) |
| “Publish exactly N times per day / wait exactly M minutes.” | Per-request author diversity does not encode a universal wall-clock schedule. Empirical cadence is audience- and quality-dependent. | [ranking](ranking-and-weights.md), [optimization](optimization-playbook.md) |
| “A thread is N independent chances at discovery.” | Replies have eligibility conditions, and conversations may be deduplicated after selection. | [pipeline](pipeline-and-filters.md) |
| “Reposting always refreshes the original's full recommendation lifetime.” | Distinguish repost timestamp/ID, original age, source-specific retention, and filters. Follow the actual branch rather than extrapolating from the UI. | [retrieval](retrieval-and-audiences.md), [pipeline](pipeline-and-filters.md) |
| “A quote is unaffected by the quoted post's labels.” | Ancillary visibility can cause removal when referenced content is dropped. | [visibility](visibility-and-labels.md), [pipeline](pipeline-and-filters.md) |

## Visibility and version claims

| Claim/question | Accurate answer or verification boundary | Read |
|---|---|---|
| “Low impressions prove a shadowban.” | Ranking, retrieval, audience mismatch, activity, competition, and eligibility can look similar. Use actual labels/reports and rule mapping where available. | [transparency](transparency-and-takedowns.md), [optimization](optimization-playbook.md) |
| “If followers can see it, everyone can be recommended it.” | Some visibility rules are recommendation-only; network state and access differ. | [visibility](visibility-and-labels.md) |
| “Every safety label drops a post.” | Labels and rules are distinct. The treatment can be allow/interstitial/drop and depends on context, thresholds, and gates. | [visibility](visibility-and-labels.md) |
| “Under the Hood's label total equals suppressed impressions.” | It is a report of labels/aggregates with time and scope semantics, not a counterfactual impression-loss measurement. | [transparency](transparency-and-takedowns.md) |
| “UserCred is the final For You score.” | Graph reputation is a separate upstream system. Prove its downstream use; do not replace the per-viewer action score with account PageRank. | [reputation](reputation-and-enforcement.md), [ranking](ranking-and-weights.md) |
| “The repo includes all prompts/rules/production weights.” | It explicitly omits some Grox prompts and botmaker rules; learned parameters and live assignments cannot be reconstructed from architecture alone. | [provenance](overview-and-provenance.md), [content](content-and-media.md) |
| “Early Phoenix/demo values still describe this release.” | The August 2026 release replaced the demo and added substantial systems and configuration. Use this pinned source. | [provenance](overview-and-provenance.md), [models](phoenix-models.md) |
| “A source default is guaranteed for every request today.” | Defaults are versioned primary values; runtime overrides and experiments remain possible, and the skill is not a live configuration feed. | [provenance](overview-and-provenance.md) |

## When a claim is not answered here

Extract the claim into a testable statement: **which input**, **which viewer group**, **which surface**, **which pipeline stage**, **which effect**, **which version**. Search the corresponding manual and local source for both the alleged feature and its use. A matching word in a schema is insufficient evidence; an absent literal string is insufficient evidence of no learned semantic effect.
