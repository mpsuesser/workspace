# Reach optimization: mechanisms, controllable actions, and tests

This is a decision framework, not an unpublished ranking formula. **Code-backed** denotes a mechanism in the pinned source; **inference** denotes a practical implication; **experiment** denotes something to test with account-specific data. Exact coefficients, thresholds, and exceptions belong to the mechanism manuals linked below.

## 1. Define the objective before optimizing

Ask for, or infer from supplied context:

- **Audience:** named communities, problems, professions, languages, geography, expertise level, and examples of relevant accounts. “Tech” is less actionable than “maintainers deciding how to migrate TypeScript libraries to Effect v4.”
- **Outcome:** total impressions, impressions among that audience, substantive discussion, relevant followers, profile visits, qualified clicks, signups, or revenue. These can disagree.
- **Account baseline:** follower count and composition, representative strong/weak posts, current posting pattern, available analytics, account/post visibility reports, and any recent changes.
- **Constraints:** content capacity, media capability, tolerance for broad/off-topic attention, and whether the post's real purpose requires a link or a narrower audience.

Do not block a useful initial answer on a full intake form. State assumptions and request only information that would change the recommendation.

### Metric distinctions

| Metric | What it helps answer | What it does not establish |
|---|---|---|
| Impressions | How often content was displayed under the product's definition | Unique people, attention quality, or target-community membership |
| Engagements / impressions | Response conditional on delivered exposure | The model's predicted probabilities or the causal effect of the content change |
| Profile visits | Interest in the author | A known direct effect of changing the bio on ranking |
| Follows attributed to a post, if available | Post-to-follower conversion | Long-term follower relevance or retention |
| Substantive replies from target accounts | Qualitative niche resonance | Complete niche reach; most viewers do not reply |
| Relevant follows / profile visits | Profile conversion, if attribution and windows align | A clean randomized estimate when traffic sources differ |
| Qualified link clicks or conversions | External business outcome | Total on-platform attention or a universal link-ranking penalty |
| Reach per post and per week | Marginal performance versus total output | A universal optimum cadence |
| Negative feedback/visibility labels, if available | Evidence of dissatisfaction or eligibility restriction | All private feedback or every reason for weak reach |

Treat missing analytics as missing, not zero. Define numerators, denominators, attribution windows, and what the interface actually measures. Public engagement totals are a limited proxy; do not relabel them as dwell, model score, unique reach, or audience composition.

## 2. Diagnose the limiting stage

| Observed pattern | First hypotheses to investigate | Mechanism reference |
|---|---|---|
| Little reach even to followers | Recent inventory/availability, timing versus follower activity, personalized ranking, labels, post type, sample size | Pipeline; retrieval; visibility |
| Follower reach but little discovery | OON eligibility, original versus reply/repost, candidate retrieval/audience match, account/post labels | Retrieval; filters; visibility |
| Broad impressions but few relevant follows | Audience mismatch or weak profile conversion; wrong objective | Retrieval; profile section below |
| One post performs, adjacent posts do not | Content/viewer match, repeated-author competition, inventory/age, ordinary variance | Ranking; filters |
| Replies perform differently from originals | Different candidate eligibility, parent availability, network status, conversation deduplication | Pipeline; ranking |
| Quotes disappear with otherwise acceptable text | Quoted/ancestor availability and ancillary visibility verdicts | Pipeline; visibility |
| Abrupt distribution change | Changed mix/cadence, new labels or takedowns, audience changes, config change, sparse evidence | Transparency; visibility; provenance |
| Reports or labels appear in Under the Hood | Exact label-to-rule mapping and reporting period/lag | Transparency; visibility; enforcement |

These are diagnostic hypotheses, not a reverse-engineered diagnosis from impressions alone. A low-ranked post and a filtered post can look similar from the author's analytics. Follow the chain: **available → retrievable → eligible → competitive → selected → actually delivered**.

## 3. Profile optimization

**Code-backed:** the feed loads author/account information; follows affect candidate routing and ranking conditions; author-follow and profile-click outcomes exist in the action system. The complete inputs and weights are in [features-and-context.md](features-and-context.md), [phoenix-models.md](phoenix-models.md), and [ranking-and-weights.md](ranking-and-weights.md). A loaded field is not automatically a positive ranking multiplier.

**Inference:** optimize a profile to help the right person recognize relevance and choose to follow:

- Name the subject matter and intended audience clearly in the bio.
- Make the promised value consistent with recent posts.
- Use a pinned post as evidence: a strong explanation, useful resource, clear product demonstration, or credible body of work.
- Make identity, expertise, and next action easy to understand. Treat avatar/banner/link choices as human conversion design unless an explicit algorithmic path is demonstrated.
- If the goal is a specific pocket of X, communicate that specificity. A bio promising “everything about everything” may convert poorly among a narrowly targeted audience; this is a communication hypothesis, not a coded “niche score.”

**Experiment:** hold content theme reasonably stable while comparing profile-visit-to-relevant-follow conversion across a documented profile change. Account for which posts sent traffic. A single viral post can overwhelm an apparent profile effect.

**Unknown:** a universal optimal bio length, keyword density, avatar style, follower/following ratio, or Premium-based general reach multiplier cannot be inferred from a field's presence alone. Use [claim-checks.md](claim-checks.md) for the exact verification path.

## 4. Compose posts for the intended reader

**Code-backed:** Phoenix predicts multiple actions and attention outcomes for each viewer; a weighted combination and subsequent adjustments determine rank. Positive and negative predictions both matter. Content understanding and safety eligibility are separate paths.

**Inference:** make the post deliver value that the target reader can recognize and consume:

- **Opening:** specify the problem, result, observation, or disagreement early enough for the relevant reader to identify it.
- **Body:** include the evidence, example, demonstration, reasoning, or usable artifact that supports the claim.
- **Comprehensibility:** keep enough context for someone who does not already know you. Retrieval can expose content to non-followers.
- **Density:** remove filler, but preserve information needed to understand and use the post. Shorter is not automatically better; longer is not automatically more dwell.
- **Conversation:** a question earns its place when relevant replies improve the discussion. Raw reply counts are not a guaranteed score payment.
- **Sharing:** make the post useful to someone the reader might send it to. Avoid assuming every share path has the same coefficient.
- **Trust:** match the opening's promise with the content delivered. Inflated curiosity can attract clicks while also increasing dissatisfaction; the net effect is viewer-specific and unknown without evidence.

**Experiment:** compare concrete alternatives (example-first versus conclusion-first, diagram versus text explanation, specific versus broad framing) within the same topic and audience. Evaluate qualified engagement and downstream follows/conversions, not only headline impressions.

### Post types and formats

| Choice | Mechanism to check | Practical interpretation |
|---|---|---|
| Original post | Main retrieval and ranking eligibility | Useful baseline for independent discovery tests |
| Reply | Parent availability, network gates, ranking adjustments, conversation deduplication | A way to reach a conversation's readers, not an interchangeable original-post distribution path |
| Quote | Quoted-content hydration/eligibility plus its own content | Add self-contained value and recognize dependency on the quoted post's availability |
| Repost | Reposter/original-author identity, duplicate handling, network gates | Distribution can depend on relationships to both identities; do not assume a new independent content object |
| Thread | Replies/ancestors, conversation collapse, author competition | Make the entry post intelligible; do not multiply standalone-post reach expectations by thread length |
| Image | Media embeddings/classification, photo-expand prediction, content match | Use when it conveys information more effectively; image presence alone is not evidence of an unconditional boost |
| Video | Video predictions/continuous values, duration eligibility, request video filter, content safety | Match the audience's reason to watch; inspect exact watch-related definitions before interpreting analytics |
| Link | Link-click prediction, URL/card processing, potential eligibility rules | Judge qualified clicks and on-platform response together; follow link-specific code before claiming a blanket penalty |
| Subscriber-only | Access checks | Reduced eligible audience is a product/access choice, distinct from ranking quality |

Exact rules: [pipeline-and-filters.md](pipeline-and-filters.md), [ranking-and-weights.md](ranking-and-weights.md), [content-and-media.md](content-and-media.md), [visibility-and-labels.md](visibility-and-labels.md).

## 5. Reach the pockets that matter

### What the code supports

- Candidate retrieval is personalized. Phoenix representations and SimClusters relationships help find candidates beyond followed accounts.
- SimClusters distinguishes consumer interests, producer representations, and post representations. Who follows/engages with whom is richer than a single global follower count.
- A viewer following an author creates a direct in-network route, subject to the remaining pipeline.
- Viewer history and content/author representations participate in personalized prediction. Your own engagement changes your own input history; an effect on how other viewers rank your posts needs a separate path.

Details and exact constructions: [retrieval-and-audiences.md](retrieval-and-audiences.md), [phoenix-models.md](phoenix-models.md), [features-and-context.md](features-and-context.md).

### Controllable strategy — inference

1. Define two or three concrete audience problems rather than an abstract industry label.
2. Publish artifacts those people can use: reproductions, benchmark methodology, explanations, examples, decision criteria, case studies, or demonstrations.
3. Participate in existing relevant discussions with substantive contributions. This creates an opportunity for discovery by discussion readers, subject to reply visibility and ordering; any broader algorithmic effect is conditional. Measure relevant responses or profile visits rather than assuming exposure.
4. Encourage voluntary, relevant follows through a clear ongoing value proposition. Relevant followers can create repeat in-network opportunities and more informative audience response than unrelated followers.
5. Track *which people and communities* respond. High impressions among the wrong audience can be a poor result for a niche objective.
6. Expand into adjacent topics with an explicit connection to the core audience. Test whether the new audience overlaps rather than assuming a permanent “cluster lock” or instant “niche reset.”

### Followers: what is controllable?

| Action | Directly under your control | Algorithmic conclusion supported |
|---|---|---|
| Follow another account | Yes | Changes your outgoing follow relationship; does not force them to follow you |
| Publish content relevant to a community | Yes | Changes available content and potential human response; no guaranteed cluster assignment |
| Receive relevant follows | Influence only | Each follow can change that viewer's relationship to you and candidate treatment |
| Receive likes/replies/shares | Influence only | Observed response may feed histories/representations; not a direct fixed score purchase |
| Remove/block a follower | Platform action, if chosen | Changes relationships/eligibility; a global reach benefit from “cleaning” followers needs evidence |
| Obtain arbitrary follower count | Not a reliable optimization objective | Count alone does not establish quality of graph edges, predicted response, or target reach |
| Manufacture coordinated engagement | Not evidence of useful audience fit | Behavior/reputation/enforcement systems exist; source-visible engagement is not a guaranteed positive distribution effect |

The defensible goal is **relevant voluntary relationships and useful audience response**, not a numerically “perfect” follower ratio.

## 6. Cadence and timing

**Code-backed:** inventory has age limits; viewers have seen/served state; multiple posts by one author can compete through author-diversity adjustments; conversation branches can be collapsed. Exact windows and formulas are in the pipeline, retrieval, and ranking manuals.

**Inference:** cadence has competing effects:

- More useful posts create more eligible opportunities across viewer sessions.
- Closely spaced posts may compete for the same viewers and slots.
- More output may reduce average quality or shift audience fit.
- A post's opportunity depends on when relevant viewers request feeds, what other inventory is available, and how it is ranked—not just its publication timestamp.

**Experiment:** test a feasible baseline and a modest alternative cadence while preserving topic/format quality. Measure total qualified reach per week, median reach per post, relevant follower gains, profile conversion, and production cost. Examine post-age windows consistently. Stratify by timezone/topic and separate unusual news events or viral outliers.

Avoid translating per-request author decay into “wait exactly N minutes,” or an age cutoff into “the post has a flat lifespan of N hours.” Neither follows without the missing viewer-session and inventory distributions. There is no universal daily post quota or best posting time established by this snapshot.

### Practical test design

1. State the hypothesis: e.g. “Spacing two substantial posts across distinct audience-active periods increases qualified weekly reach without reducing response quality.”
2. Choose an outcome and a guardrail before posting.
3. Record topic, format, time, post age at measurement, major external events, and any cross-promotion.
4. Alternate conditions where practical; avoid comparing a high-news week to a quiet week as if randomized.
5. Use repeated observations and distributions. Report sample size, median, spread, and outliers rather than selecting the best result.
6. Distinguish directional evidence from causal certainty. A creator-controlled observational test does not reveal private ranking features or experiment assignments.

## 7. Negative response, labels, and visibility diagnosis

**Code-backed:** ranking has negative-action predictions; separate account/content systems can assign labels and enforce eligibility restrictions; some rules differ between followers and recommendations. Under the Hood exposes aggregate label information with its own semantics and delays.

**Actionable diagnostic process:**

1. Identify whether the concern is weak performance, a known label, an unavailable post, a geographic restriction, or a follower/non-follower difference.
2. If available, inspect the user's [Under the Hood report](https://x.com/i/under_the_hood), including dates, labels, source attribution, and scope.
3. Map the exact label to the published rule and viewer conditions. A label count is not automatically a count of dropped impressions.
4. Check whether the post is a quote/reply/repost of an independently unavailable item.
5. Explain the documented effect and what the report cannot diagnose. Avoid declaring a “shadowban” from a small sample of impressions.

See [transparency-and-takedowns.md](transparency-and-takedowns.md), [visibility-and-labels.md](visibility-and-labels.md), [reputation-and-enforcement.md](reputation-and-enforcement.md), and [event-rules.md](event-rules.md).

## 8. Recommended response format for an account/post review

Use only the rows warranted by the user's material:

| Recommendation | Mechanism/evidence | Confidence | What to change | What to measure |
|---|---|---|---|---|
| Specific intervention | Source manual + path/symbol, or human-behavior inference | Code-backed / inference / experiment | Concrete edit or behavior | Defined outcome and comparison |

Prioritize the likely bottleneck. Improving the opening will not fix a known eligibility restriction; altering cadence may be irrelevant if the audience/topic is wrong; chasing broad impressions may reduce qualified conversion.

For rewriting a post, preserve the user's factual claims and voice, explain the few consequential changes, and tie each to readability/audience fit or an actual mechanism. Do not invent a numeric predicted score, guaranteed impressions, or a best format from unavailable model weights.
