---
description: Research a topic through credible X/Twitter expert signal using Grok/xAI
---

If `$ARGUMENTS` is empty, ask me what topic to research.

Otherwise, use the `subagent` tool to run the `x-researcher` agent with fresh context for this topic:

`$ARGUMENTS`

Ask the subagent to prioritize credible domain experts, direct X citations, recent practitioner signal, tradeoffs, disagreements, adoption constraints, and confidence/gaps. After it returns, synthesize the result for me concisely and call out any weak citation quality or uncertain claims.
