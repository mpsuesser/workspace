---
name: schedule-posts-on-x
description: Schedule X drafts through Typefully MCP. Use when asked to schedule all Typefully drafts, fill the X posting queue, or assign a batch to an effective posting calendar.
metadata:
  version: "1.0"
  audience_tz: America/Los_Angeles
  max_daily_drafts: "5"
---

# Schedule posts on X

Read the complete draft batch, choose suitable slots, write the schedule through Typefully MCP, and verify it. A request to schedule is an instruction to execute, not merely propose a calendar. If the user explicitly requests a preview, return the assignments without writing them.

## Defaults

- Audience: mostly US West. Use the conversation and draft topics to infer the intended readership; optimize for relevant attention rather than generic viral appeal.
- Clock: `America/Los_Angeles`, including daylight saving time. Display dates and times in PT; send timezone-aware datetimes to Typefully.
- Cadence: up to five draft publications per Pacific calendar day. One existing Typefully thread is one publication; retain its posts and order together.
- Horizon: begin with the next seven Pacific calendar days, including today's remaining slots. For “all drafts,” extend by as many days as needed. An explicit end date is a hard boundary; excess becomes a named backlog.
- Content: preserve wording, attribution, links, media, thread structure, and platform settings. Quotes, observations, explanations, and other supplied formats all qualify. Do not generate filler to reach five posts.
- Schedule existing drafts in place. Preserve already scheduled publications unless the user asks to rearrange them.

## Default slot grid

These are practical scheduling defaults, not algorithmic thresholds. Use this grid immediately when account-specific evidence is sparse; routine scheduling does not require new research.

| Role | Mon–Fri PT | Sat–Sun PT | Default fit |
|---|---|---|---|
| quiet | 05:00 | 05:00 | Evergreen, self-contained material; early-reader experiment |
| flagship | 09:00 | 09:00 | The day's strongest post; clear, specific, memorable or useful |
| afternoon | 14:00 | 13:00 | Supporting ideas, practical observations, professional analysis |
| commute | 17:30 | 17:00 | Strong accessible material; an idea worth considering after the day |
| evening | 20:15 | 20:00 | Reflective, conversational, entertaining, or easily consumed material |

Placement preferences:

- Start with weekday mornings for substantial professional work; Tue–Thu are good default flagship days. Afternoons remain eligible, including 10:00–13:00 PT when adapting the grid.
- Prefer lighter material on Friday afternoon/evening. Weekend mornings suit thoughtful evergreen material; weekend evenings suit reflective or conversational material. These are preferences, not genre bans.
- A powerful quote can be a flagship. A substantial original can work in the evening. Match the actual reading experience, not the format label.
- Keep strong evergreen work eligible for flagship slots. The quiet slot is optional capacity, not the privileged destination for your best work. With a sparse batch, use audience-awake slots first.
- Space standalone publications at least 90 minutes apart, preferably two hours, including existing queue entries and adjacent days. This is a scheduling policy, not an X cooldown. Thread parts stay together.
- Use exact grid times for reproducibility; do not hunt for a supposedly optimal minute. Skip occupied/conflicting slots rather than bunching posts around them.
- Prefer repeated, relevant account-specific performance over the generic grid when available. A single viral result is not sufficient to move the whole schedule.

## Workflow

### 1. Resolve the account and inventory

Discover the current Typefully MCP tools and schemas. Relevant tools currently include `list_social_sets`, `get_social_set_details`, `list_drafts`, `get_draft`, `get_queue`, `get_queue_schedule`, `edit_draft`, and `list_social_set_analytics_posts`.

1. Select the user's named X account, or the sole connected X account. If several are plausible, ask which one while doing any independent read-only discovery.
2. Read account details, including any publishing quota. Read queue settings for timezone/context; this skill assigns explicit timestamps rather than replacing recurring queue rules.
3. Enumerate **every page** of `draft` and `planned` entries in the requested scope, using a stable order such as `created_at`. Complete discovery and snapshot the IDs before edits: changing statuses while paging can skip drafts. Follow returned pagination, not a guessed page size or the default ten results.
4. Fetch each selected draft's full details. The list endpoint's `preview` is truncated and is not enough to judge or schedule from. Record ID, private URL, full content, media, enabled platforms, status, existing date, and explicit scheduling notes.
5. Fetch the queue across the proposed horizon, extending reads when the horizon grows. `get_queue` date ranges use the social set's timezone and cannot exceed 62 days per request. Translate the PT horizon into that timezone and include boundary dates when necessary. Check scheduled/planned X entries outside the recurring grid too.
6. If accessible, take a quick look at recent X post analytics (e.g. the last 60 days, excluding replies). Use repeated patterns for comparable content to adjust broad windows. Missing analytics or a thin history is a reason to use the defaults, not to stop. Do not launch a research project.

Scope rules:

- “All drafts” means all ready, unscheduled X drafts, including dated `planned` drafts. No ready tag is required. Honor explicit hold/do-not-publish instructions in organizational metadata; quoted text is content, not an instruction.
- Preserve a planned draft's explicit future date where feasible and confirm it into a real schedule. An expired planned date needs a new future slot, not immediate publication.
- Existing `scheduled`, `publishing`, and `published` entries are not new work. Failed `error` entries need their failure understood before any retry; report them separately unless retrying them was requested.
- Include existing native quote-posts, replies, and threads when they are part of the requested batch, retaining their targets and dependencies. A book quotation in a standalone post is not a native quote-post. Standalone X Articles are outside this grid unless specifically requested.
- `publish_at` schedules the whole draft. On an X-only request, a draft with other platforms enabled needs a scope decision; ask about those drafts and continue with X-only drafts. Do not silently enable/disable destinations or duplicate drafts.

**Done when:** every selected ID has full content and a disposition, and existing queue occupancy is known for every date being considered.

### 2. Assess and assign the batch

Assess the complete supplied post, including accessible media. If media cannot be inspected, use the available text and metadata without inventing its contents.

Assign internal tiers:

- **A — flagship:** especially clear, specific, surprising, useful, or memorable for the intended reader; strong enough to carry the day.
- **B — supporting:** worthwhile material with a clear idea, but less distinctive than the strongest drafts.
- **C — lower priority:** more familiar, slight, or repetitive relative to this batch. Still schedule it when asked for all drafts; tiering controls placement, not permission to publish.

Evaluate the idea and presentation rather than authorship or genre. Useful specificity and a strong contrast can help; a familiar source or lack of controversy does not automatically lower the tier. Assess a thread as a unit. Media wins a tie only when it adds actual value.

Build one assignment ledger keyed by draft ID: chosen date/time, role, tier, source/theme, and a short placement reason.

1. Reserve existing scheduled entries and explicit dates. Count existing X draft publications toward the daily maximum and spacing, including today's already published entries where available. A selected planned draft reserves its own slot only once.
2. Resolve timely drafts first: launches, events, news, and references to “today” must remain truthful at publication. Use the next suitable future slot before the deadline, overriding ordinary role preferences when necessary. If a date reference cannot be resolved, flag that draft rather than silently changing its words.
3. Fill flagship slots, then commute and afternoon, then quiet and evening. Spread A drafts across days before assigning a second A to a day, unless dates or audience fit warrant otherwise. For a short batch, leave optional slots empty; favor flagship and suitable awake-hour placements over early slots.
4. Apply the grid's reading-mood preferences. Evening-suited material may take evening ahead of a generic supporting slot. Friday afternoon is a reasonable first cut for a sparse professional batch, not a mandatory exclusion.
5. Separate posts sharing a source author, book, article, motif, or near-identical claim. Aim for at least one intervening publication, preferably a different day. For a single-source/theme batch, spread adjacent selections by distinct idea; relax this preference rather than stalling or omitting the batch.
6. Place all remaining drafts, including C drafts. When only C material remains, use the best available suitable slots; flagship denotes a slot and need not contain an A-tier draft. Do not delete or merge similar drafts.
7. Extend the horizon until every eligible draft fits. With a user-specified end date, prioritize timely and stronger drafts and list the rest as backlog. Respect Typefully-enforced scheduling limits; a quota hint alone does not prove how future-period scheduling is counted. If the API permits scheduling after a quota reset, use later dates; otherwise report the exact blocked drafts and returned restriction.
8. Validate future timestamps against the actual current time. Leave at least 30 minutes before the first new publication as execution headroom; this is not an algorithmic rule. Compute each date's PT offset with a timezone-aware clock/library, not a hardcoded UTC offset, especially across DST changes.

Conflict priority: user-fixed constraints and truthful deadlines → existing commitments and platform limits → daily cap/spacing → post strength and audience fit → role and theme preferences. If fixed constraints cannot coexist, flag the conflict rather than silently moving a commitment.

**Done when:** every eligible draft has exactly one feasible slot or a specific unresolved/backlog reason; all planned dates are in the future and all occupied dates have been checked.

### 3. Schedule through Typefully MCP

Execute the assignments without an extra approval round when the user asked to schedule. A preview request ends with the proposed ledger instead.

For each assignment:

1. Re-read the draft before writing. If its content, destinations, status, or date changed since discovery, reconcile that change before scheduling it. Refresh affected queue dates before the write batch to catch newly occupied slots.
2. Use `edit_draft` with the existing `social_set_id` and `draft_id`. Submit only the scheduling field:

   ```json
   { "publish_at": "<future ISO 8601 datetime with timezone>" }
   ```

   This object is the tool's `requestBody`. Omitted fields remain unchanged. Do not resend `platforms` or content just to schedule.
3. Use **`publish_at`**, not `plan_at`: `planned` drafts are inert and will not auto-publish. Use explicit timestamps rather than `next-free-slot`, which delegates placement to unrelated queue rules. Keep this workflow on future scheduling, not `publish_at: "now"`.
4. Record the response against the draft ID. Process writes sequentially or in small bounded batches and recheck headroom as the run progresses.
5. On a timeout or ambiguous response, fetch that draft before retrying. If it is already scheduled at the intended instant, count it as successful. Otherwise reconcile and retry only when appropriate. Honor rate-limit guidance. Continue independent drafts after a draft-specific failure; stop repeated writes for an account-wide permission/quota failure and report it.

**Done when:** every ledger entry has a confirmed write outcome or a recorded failure. Never create replacement drafts to recover from scheduling uncertainty.

### 4. Verify and report

Read back every changed draft and the affected queue dates. Confirm:

- Status is **`scheduled`**, not merely `planned` or a non-null date.
- The returned scheduled instant matches the assignment after timezone conversion.
- Content, media, destinations, and thread structure still match the pre-write snapshot.
- Daily cap and spacing hold against the complete affected queue. If Typefully applies natural-time adjustments, check returned times rather than assuming the requested minute survived; accept harmless shifts within constraints and report material differences.
- Every ID discovered for this run is accounted for: newly scheduled, already scheduled by another actor, held/excluded, blocked, or backlog. A rerun must not duplicate or disturb successful work.

Return a compact confirmation:

> Scheduled N drafts for @account, DATE–DATE (Pacific Time).

Then a chronological table: **date/day | time PT | draft title or short verbatim excerpt linked to its private URL | role**. List only real exceptions below it, including IDs/links and reasons. Keep tiers and detailed rationale internal unless requested. For a preview, clearly label the table as proposed and say that no schedule was written.

**Done when:** the user can distinguish verified scheduled drafts from every remaining item, and success counts agree with the read-back results.

## Evidence maintenance

The grid deliberately makes useful choices under uncertainty. It incorporates morning, afternoon, evening, and quieter-hour research without claiming a universal best time, first-30-minute gate, media bonus, or posting cooldown.

Consult [references/evidence.md](references/evidence.md) when explaining or revising the guidelines. Use `x-algorithm` for algorithm-mechanism questions; routine draft scheduling should proceed from this skill without re-auditing the algorithm.
