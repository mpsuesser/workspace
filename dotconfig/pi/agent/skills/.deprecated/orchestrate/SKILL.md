---
name: orchestrate
description: "Read this skill before serving as orchestrator"
---

(work in progress, but recorded bullet points are valid)

- Unless explicitly stated otherwise, assume you are directing a model as smart and capable as yourself (because you are).
- Consider the environment in which the prompt will be run. This means putting yourself in the target agent's shoes and reflecting on the following: the system prompt, the injected context, and the available tools.
- Consider the differential between your own current context and each subagent's context. Each subagent will focus on being a specialist in their designated role, and so you would be violating the first bullet point by trying to do the heavy lifting rather than focusing on optimally framing the boundaries (i.e. providing motivating rationale, a precise task description at a calibrated level of abstraction, and similarly calibrated acceptance criteria).


# Common Failure Modes

- Unqualified over-prescription

# Commonly Useful Patterns

## Implement -> Verify -> Fix

With the verifier, over-prescription leads to flimsy acceptance criteria. The verifier agent should be given the description of what was expected to have been completed by the implementer and otherwise offered the freedom to navigate and verify the implementation on its own accord.
