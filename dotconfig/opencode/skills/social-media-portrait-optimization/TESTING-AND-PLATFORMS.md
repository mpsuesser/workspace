# Testing, continuity, and platform adaptation

This testing workflow is a practical synthesis. It is not a validated growth model. See [SOURCES.md](SOURCES.md) for the original evidence and [AUDIT.md](AUDIT.md) for inspection criteria.

## Select the smallest useful test

### 1. Visual feasibility check

Before asking anyone to rate candidates, eliminate technical failures through circular-thumbnail and contextual previews. This resolves crop, blur, clipping, and many contrast issues cheaply.

### 2. Audience-perception comparison

Use a small shortlist, generally two or three candidates. Present equivalent sizes and context; vary one factor at a time when trying to learn what caused a difference. For final selection, compare the strongest complete version of each candidate.

Ask people resembling the intended audience specific questions:

- Which image is easiest to recognize at this size?
- Which feels more approachable / editorial / professional / playful for this account's purpose?
- Which would you expect to belong to the described kind of creator, and what visual cue gave that impression?
- For an existing audience, can you recognize the person after the change?

Keep the intended positioning brief the same for all raters. Randomize presentation order if feasible; avoid signaling which candidate the owner prefers. Record audience, sample size, exact prompt, and disagreement. A convenience sample offers directional feedback, not statistical certainty.

Photofeeler offers standardized professional-impression ratings. Use those as another perception signal; its raters may not represent the user's audience. Science of People recommends comparative photo testing. Neither establishes that a higher score causes more X followers. [PF01, SOP01]

### 3. Live account observation

Use a live change only when the remaining question matters enough to justify disrupting recognition. Keep a record of the old avatar, change date, candidate, relevant content/campaign changes, and the metric the user cares about.

Possible metrics, **only when available and meaningfully defined**:

- Profile visits relative to relevant exposure.
- New follows relative to profile visits, as a rough ratio rather than a clean attribution funnel: some follows occur directly from other surfaces.
- Qualified inquiries or another account-specific outcome.
- Feedback from existing followers about recognition.

Set the observation window and minimum meaningful traffic before looking at results, based on the account's baseline variability. There is no defensible universal “test for seven days” rule. Low-traffic accounts may learn more from audience feedback than from noisy analytics.

Sequential before/after changes confound the avatar with content, reach, news, audience mix, and timing. A platform generally does not provide a randomized profile-photo experiment; call the result observational unless assignment truly was randomized. Do not report statistical significance without an appropriate design and analysis.

Avoid cycling through many portraits rapidly. That changes the recognition conditions the test is trying to assess. Prefer pretesting followed by one deliberate deployment.

### Why the famous 35% result is not a forecast

Cyrus Shepard reported about a 35% CTR improvement from author-photo experiments in Google search in 2012. He called the process non-scientific and acknowledged ranking effects. This motivates testing image choices; it supplies neither an expected X lift nor a winning color. [CS01]

## Platform adaptation

Transfer the principles of legibility, intended impression, and recognition. Reinspect the actual presentation surface before transferring crop or styling rules.

| Context | Adaptation question |
| --- | --- |
| X/Twitter | Does the face remain recognizable in posts, replies, and notifications, including light/dark interfaces? Does the portrait fit the voice people encounter? |
| LinkedIn | Does the intended professional audience find the portrait appropriate for this person's role? Evaluate with the headline and banner if available; formality is a choice, not a universal requirement. |
| Instagram / Threads | Does the portrait hold its identity beside visual content and in relevant circular placements? Check any interface rings/overlays in a real preview. |
| YouTube | Does the avatar remain recognizable beside videos, comments, and channel branding without competing with video thumbnails? |
| Communities / messaging | Is this the same professional identity, a private account, or an intentional pseudonym? Recognition requirements may differ. |

These are inspection prompts, not claims about current dimensions or platform ranking systems.

### People, logos, and pseudonymous brands

For a person-led brand, a face is a strong default supported by several practitioner sources. Koe explicitly says writing-led businesses can operate without showing one's face, while a headshot helps. [DK05]

For an organization, pseudonym, or privacy preference, retain the user's identity strategy and apply the same small-format recognition tests to the symbol or illustration. Do not force a face photograph as a prerequisite for success. A logo's suitability depends on what the account represents.

## Export requirements

### X snapshot — verified 2026-09-23

Official X Help recommends **400 × 400 pixels**, a **maximum file size of 2 MB**, and accepts **JPEG, GIF, or PNG**. A static PNG or JPEG is a straightforward export choice. Keep the important content circle-safe. [X01]

Use the [current X Help page](https://help.x.com/en/managing-your-account/common-issues-when-uploading-profile-photo) when producing a fresh deliverable; supported formats, limits, and rendering behavior may change. Do not infer animation support from a listed file extension.

Historical recommendations of 500-pixel or 600-pixel source images in Kawasaki's articles are production guidance from those dates, not current X specifications.

For another platform, retrieve its official current requirements rather than copying X's values. Preserve a larger original so multiple exports remain possible. Upload and inspect the actual result when the user has asked for deployment and account tools permit it; otherwise provide an export and state that in-app rendering is unverified.

## Deployment checklist

1. Save the previous avatar and the full-quality new source.
2. Confirm the final likeness, crop, circular preview, and file requirements.
3. Update the intended professional accounts from a profile inventory; respect deliberately separate identities. [PEF01]
4. Check the real rendered result where access is available.
5. Record a reason to revisit: material appearance/positioning change, visible technical problem, or meaningful evidence from the chosen test.

Stop when the image is clear, recognizable, and fit for purpose. Scheduled cosmetic churn is not a growth strategy. [DK06, DK08, JW03]
