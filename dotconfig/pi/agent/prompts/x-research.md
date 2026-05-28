---
description: Research a topic through credible X/Twitter expert signal using Grok/xAI
---

If `$ARGUMENTS` is empty, ask me what topic to research.

Otherwise, use the `subagent` tool to run the `x-researcher` agent with fresh context for this topic:

`$ARGUMENTS`

After it returns, synthesize the result concisely for me. Preserve useful nuance, and call out weak citation quality or uncertainty when relevant.
