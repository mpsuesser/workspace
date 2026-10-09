# Scheduling evidence

Reviewed September 22, 2026. These references support practical starting points; the exact grid, role assignments, 90-minute spacing, and five-per-day ceiling are editorial policies.

## Timing studies

- [Buffer, March 13, 2026](https://buffer.com/resources/best-time-to-post-on-twitter-x/): 8.7 million posts; reports engagement-rate patterns, with weekday 9–11 a.m. **local time** strongest and Tue–Thu strong overall. Supports the weekday 09:00 flagship starting point.
- [Sprout Social, March 31, 2026](https://sproutsocial.com/insights/best-times-to-post-on-twitter/): recommends Tue–Thu noon–6 p.m. **local time** for X. Its nearly two billion engagements cover six platforms, not X alone. Supports keeping afternoon/EOD slots available.
- [Eden / Dan Koe, August 21, 2026](https://eden.so/blog/best-time-to-post-on-x/): 7,627,422 original posts from 14,671 creators, August 2025–August 2026. Breakout means at least twice the author's recent median likes. Reports early-morning and late-evening **ET** advantages, plus weekends. The pooled best/worst hour difference is 2.5 percentage points; the media/text-only difference is 6.7 points. These are associations, not causal gains. Zero-like posts are excluded, the sample favors established creators, and the midnight–6 a.m. ET advantage reverses in the under-1,000-follower subgroup. Supports optional quiet/weekend experiments, not overnight flagship placement by default.
- [SocialBee, September 11, 2026](https://socialbee.com/blog/best-times-to-post-on-twitter/): 707,338 posts from January–June 2026, comparing impressions with each account's typical performance. Favors 7–11 p.m. **local time**, especially Sunday 7 p.m. Its weak Thursday 1 p.m. cell is also **local time**, not ET. Supports keeping evening/weekend slots available.

These studies use different samples and outcomes. Local-time recommendations stay local; converting Eden's ET windows to PT is different from assuming its pattern repeats at the same local hour. No combined finding warrants a weekday 10 a.m.–1 p.m. PT blackout. Professional-versus-reflective slot choices are audience-behavior heuristics, not measured genre-specific guarantees.

## Algorithm checks

Pinned source: `xai-org/x-algorithm`, commit `3aa0fa336c4a20e4149b6151629b6050897bb8a5`. The installed `x-algorithm` skill contains the full audited snapshot and mechanism manuals.

- [`RankingScorer::author_pool_counts` and `apply_author_diversity`](https://github.com/xai-org/x-algorithm/blob/3aa0fa336c4a20e4149b6151629b6050897bb8a5/home-mixer/scorers/ranking_scorer.rs#L485-L537): same-author candidates can compete within a request. This does not establish a wall-clock cooldown or an optimal daily quota.
- [`AgeFilter`](https://github.com/xai-org/x-algorithm/blob/3aa0fa336c4a20e4149b6151629b6050897bb8a5/home-mixer/filters/age_filter.rs#L16-L31) and [`MAX_POST_AGE`](https://github.com/xai-org/x-algorithm/blob/3aa0fa336c4a20e4149b6151629b6050897bb8a5/home-mixer/params/config.rs#L36): the ordinary Phoenix pipeline filters by a 48-hour age bound. This is neither a guaranteed distribution lifespan nor evidence of a universal first-15–30-minute success test.
- [`compute_weighted_parts`](https://github.com/xai-org/x-algorithm/blob/3aa0fa336c4a20e4149b6151629b6050897bb8a5/home-mixer/scorers/ranking_scorer.rs#L381-L460): scoring combines viewer-specific predicted actions and attention, including negative outcomes. Media presence and raw engagement counts are not universal fixed score bonuses.

## Typefully contract

Verified against the connected MCP catalog on the review date. Discover live schemas on each run. `edit_draft` supports partial updates; a future `publish_at` schedules an existing draft. `plan_at` creates an inert plan. `get_queue` includes both states, interprets dates in the social set's timezone, and limits each range to 62 days. `list_drafts` is paginated and exposes a truncated preview; use `get_draft` for full content. Scheduling is draft-wide across enabled platforms.
