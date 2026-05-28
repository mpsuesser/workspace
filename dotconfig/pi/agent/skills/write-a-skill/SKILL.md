---
name: write-a-skill
description: Create new agent skills. Use when user wants to create, write, or build a new skill.
---

# Writing a skill

A skill is a prompt that gets loaded into a future agent's context when it picks up a relevant task. Your job is to capture two things from the user, then translate them into that prompt:

1. **How they want the skill used** — when it triggers, what shape of task, what they expect the agent to actually do (and not do).
2. **Their bar for a good result** — what "done well" looks like, what failure modes to avoid, any taste-level preferences that aren't obvious.

Everything else is in service of those two.

## The core principle

**Do not over-prescribe.** The agent reading the skill later is capable and will have full context about its task. You're priming its reasoning, not scripting it. Prefer transmitting intent, examples, and quality bars over step-by-step procedures. If a step is genuinely load-bearing (e.g. a non-obvious command, a required format), state it; otherwise trust the agent.

A good skill reads like a senior colleague briefing you on what matters, not a runbook.

## Working with the user

Interview the user enough to actually understand the skill. Ask about real triggers, real examples, and where prior attempts went wrong. If they hand you a rough draft, your job is to sharpen it, not pad it out.

When you're unsure whether to include something: leave it out. The user wants leverage, not coverage.

## The description field

The description is the only thing a future agent sees when deciding whether to load this skill. It must:

- Say what the skill is for in one line.
- Name concrete triggers ("Use when…") so the agent knows when to reach for it.

Keep it tight. If the description is vague, the skill will never get loaded at the right moment.

## Shape

A skill lives at `skills/<name>/SKILL.md` with frontmatter `name` and `description`. If the skill needs supporting reference material that would bloat SKILL.md, split it into sibling files and link to them; otherwise keep everything in one file. Length should match the actual complexity of the domain — some skills are ten lines, some are a few hundred. Don't pad to hit a template.

## Before you finish

Re-read the draft as if you were the future agent loading it cold. Ask:

- Would I know when to use this?
- Do I understand what "good" looks like here?
- Is anything in here just filler that the agent would have figured out anyway?

Cut the filler. Then show the user.
