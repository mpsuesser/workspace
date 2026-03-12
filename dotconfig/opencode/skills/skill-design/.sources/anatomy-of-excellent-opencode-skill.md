---
title: "Anatomy of an Excellent OpenCode Skill: Lessons from cloudflare-skill"
subtitle: "How decision trees, progressive disclosure, and 60 reference files make AI assistants actually useful"
author: JP Caparas
url: https://jpcaparas.medium.com/anatomy-of-an-excellent-opencode-skill-lessons-from-cloudflare-skill-0f853babc471
date: 2026-01-16
extracted: 2026-01-23
---

# Anatomy of an Excellent OpenCode Skill: Lessons from cloudflare-skill


## How decision trees, progressive disclosure, and 60 reference files make AI assistants actually useful

*All the docs referenced in a single SKILL.md file*

**You’ve written skills for commit messages.** Maybe one for your team’s coding style. Perhaps a skill that reminds the AI to use your preferred testing framework.

**But what happens when you need to teach an AI assistant *an entire platform*? **Not just one API, ***but 60+ products (holy moly)***. Not just a few configuration options, but hundreds of bindings, flags, and deployment modes. Not just “here’s how Workers work” but “here’s when to use Workers vs Pages vs Durable Objects vs Workflows vs Containers.”

Mind: blown.

That’s the problem Dillon Mulroy solved with `cloudflare-skill`, and the way he solved it **offers lessons for anyone building skills that need to scale.**


## The Problem: Cloudflare Is Big

Cloudflare’s developer platform has grown into something sprawling. Workers for serverless functions. Pages for full-stack apps. D1 for SQL. R2 for object storage. Durable Objects for stateful coordination. Queues for async processing. Vectorize for embeddings. Workers AI for inference. Hyperdrive for database connections. Tunnel for networking. And that’s before you get to security products, media handling, or infrastructure-as-code.

**The official documentation is thorough but scattered. **An AI assistant working from web searches or generic training data will miss nuances, suggest deprecated patterns, or pick the wrong product entirely.

`cloudflare-skill` packages all of this into a format optimised for LLM consumption. You literally just need to run the command on the README and voila:

*Just run the install.sh script*

*Instaskills!*


## A Quick Primer on Agent Skills

Before we dissect `cloudflare-skill`, it helps to understand the standard it’s built on.

The **Agent Skills Standard** is an open format originally developed by Anthropic for giving AI agents reusable capabilities. Released as an open standard at [agentskills.io](https://agentskills.io/), it’s since been adopted by 12+ platforms including Claude Code, OpenCode, GitHub Copilot, Cursor, VS Code, Gemini CLI, and OpenAI Codex.

At its core, a skill is just a directory containing a `SKILL.md` file:


```
skill-name/├── SKILL.md          # Required: instructions and metadata├── scripts/          # Optional: executable code├── references/       # Optional: additional documentation└── assets/           # Optional: templates, images, data files```

The `SKILL.md` file uses YAML frontmatter for metadata:


```
---name: skill-name           # Required: 1-64 chars, lowercase, hyphens onlydescription: What it does  # Required: 1-1024 charslicense: MIT               # Optionalcompatibility: Requires X  # Optional: environment requirementsmetadata:                  # Optional: arbitrary key-value pairs  author: your-name  version: "1.0"---# Instructions go here in Markdown```


## Why Skills Beat Alternatives

Skills aren’t the only way to customise AI coding assistants. Cursor has `.cursorrules`. Claude Code has `CLAUDE.md`. Aider has `.aider.conf.yml`. But skills offer something the others don't: **portability and progressive loading**.

The progressive loading is the key differentiator. A `.cursorrules` file loads its entire contents into every conversation. A skill loads only metadata at startup (~100 tokens per skill), full instructions when triggered, and resources only as needed.

*Those are pretty sizeable savings in context real estate.*

*Progressive disclosure means you can install 50 skills without bloating your context window.*

OpenCode searches these locations (in order):

- `.opencode/skill/<name>/SKILL.md` (project-level)
- `~/.config/opencode/skill/<name>/SKILL.md` (global)
- `.claude/skills/<name>/SKILL.md` (Claude-compatible, project)
- `~/.claude/skills/<name>/SKILL.md` (Claude-compatible, global)

The Claude-compatible paths mean you can share skills between OpenCode and Claude Code without duplicating files.

When a skill is available, OpenCode lists it in the system prompt:


```
<available_skills>  <skill>    <name>cloudflare</name>    <description>Comprehensive Cloudflare platform skill...</description>  </skill></available_skills>```

The AI loads a skill by calling `skill({ name: "cloudflare" })`. From there, it can read additional reference files as needed.


## Meet the Creator: Dillon Mulroy

Before dissecting the skill, it helps to understand who built it.

Dillon Mulroy is a Software Engineer on Cloudflare’s Workers team, where he builds the serverless platform that powers millions of applications at the edge. But his open source work extends well beyond his day job.

There’s a pattern here: developer experience tooling. His TypeScript Neovim plugins have helped thousands of developers get faster feedback without leaving their editor. The `better-result` library brings functional programming patterns to TypeScript error handling. His Jujutsu tools reflect an early-adopter mentality toward next-generation version control.

`cloudflare-skill` fits the same mould: identify a workflow friction point, build a focused tool to solve it, share it with the community.

**Find Dillon online:**

- GitHub: [github.com/dmmulroy](https://github.com/dmmulroy)
- Twitter/X: [@dillon_mulroy](https://twitter.com/dillon_mulroy)
- Website: [dillonis.online](https://dillonis.online/)


## The Structure: More Than a Single File

Most skills are a single `SKILL.md` file. `cloudflare-skill` is an entire directory tree:


```
skill/cloudflare/├── SKILL.md              # Main manifest + decision trees└── references/           # 60+ product subdirectories    └── <product>/        ├── README.md         # Overview, when to use        ├── api.md            # Runtime API reference        ├── configuration.md  # wrangler.toml + bindings        ├── patterns.md       # Usage patterns        └── gotchas.md        # Pitfalls, limitations```

Plus a slash command:


```
command/cloudflare.md     # /cloudflare entrypoint```

This structure isn’t arbitrary. It’s designed around how AI assistants load and use context.

And here’s how quick it loads up the docs:

*Presto*


## Pattern 1: Decision Trees Over Flat Lists

The first thing you notice about `cloudflare-skill` is its decision trees. Here’s how the main `SKILL.md` handles the question "I need to run code":


```
Need to run code?├─ Serverless functions at the edge → workers/├─ Full-stack web app with Git deploys → pages/├─ Stateful coordination/real-time → durable-objects/├─ Long-running multi-step jobs → workflows/├─ Run containers → containers/├─ Multi-tenant (customers deploy code) → workers-for-platforms/└─ Scheduled tasks (cron) → cron-triggers/```

This works well for several reasons:

- **It mirrors how developers think.** You don’t start with “I want to use Workers.” You start with “I need to run some code on Cloudflare.”
- **It forces disambiguation.** The AI can’t just default to the most common product. It has to understand the use case first.
- **It points to the right reference.** Each branch terminates at a specific directory, so the AI knows exactly which files to load next.

There are **seven** of these trees in the main `SKILL.md`:

- “I need to run code”
- “I need to store data”
- “I need AI/ML”
- “I need networking/connectivity”
- “I need security”
- “I need media/content”
- “I need infrastructure-as-code”

Together, they cover the entire Cloudflare platform without requiring the AI to hold all 60+ product references in memory at once.

*That’s progressive disclosure in a nutshell.*


## Pattern 2: The 5-File Reference Structure

Each product directory follows a consistent structure:

This separation matters because different tasks need different information. Setting up a new D1 database? You need `README.md` and `configuration.md`. Writing queries? Load `api.md`. Hitting a weird error? Check `gotchas.md`.

The AI doesn’t need to load all five files for every interaction. It loads what’s relevant.

Here’s how the Workers README structures its content:


```
# Cloudflare WorkersExpert guidance for building, deploying, and optimizing Cloudflare Workers applications.## OverviewCloudflare Workers run on V8 isolates (NOT containers/VMs):- Extremely fast cold starts (< 1ms)- Global deployment across 300+ locations- Web standards compliant (fetch, URL, Headers, Request, Response)- Support JS/TS, Python, Rust, and WebAssembly**Key principle**: Workers use web platform APIs wherever possible for portability.## When to Use Workers- API endpoints at the edge- Request/response transformation- Authentication/authorization layers- Static asset optimization- A/B testing and feature flags- Rate limiting and security- Proxy/routing logic- WebSocket applications## In This Reference- [Configuration](./configuration.md) - wrangler.jsonc setup, bindings- [API](./api.md) - Runtime APIs, bindings, execution context- [Patterns](./patterns.md) - Common workflows, testing, optimization- [Gotchas](./gotchas.md) - Common issues, limits, troubleshooting## See Also- [KV](../kv/README.md) - Key-value storage- [D1](../d1/README.md) - SQL database- [R2](../r2/README.md) - Object storage```

Notice the “See Also” section. Cross-references are one level deep, pointing to sibling directories. No nested chains that could confuse the AI about what to load next.


## Pattern 3: The gotchas.md Pattern

This is where `cloudflare-skill` earns its reputation. Every product has a `gotchas.md` file that encodes tribal knowledge: the things that aren't obvious from the API docs, the mistakes that burn you the first time, the limits that aren't prominently documented.

Here’s an excerpt from the Workers gotchas:


```
# Workers Gotchas​## CPU Time Limits​**Standard**: 10ms CPU time**Unbound**: 30ms CPU time​**Solutions**:- Use `ctx.waitUntil()` for background work- Offload heavy compute to Durable Objects- Consider Workers AI for ML workloads​## Response Bodies Are Streams​```typescript// ❌ BADconst response = await fetch(url);await logBody(response.text());  // First readreturn response;  // Body already consumed!​// ✅ GOODconst response = await fetch(url);const text = await response.text();await logBody(text);return new Response(text, response);```## Common Errors### "Error: Body has already been used"**Cause**: Response body read twice**Solution**: Clone response before reading: `response.clone()```````

This is exactly the kind of information that’s hard to find in official docs but essential for productive development. By bundling it into the skill, the AI can warn you before you hit these problems.


## Pattern 4: Progressive Disclosure Done Right

The Agent Skills standard supports three levels of progressive disclosure:

- **Metadata** (~100 tokens): Name and description, loaded at startup
- **Instructions** (<5,000 tokens): Full SKILL.md body, loaded on activation
- **Resources** (as needed): Additional files, loaded when referenced

`cloudflare-skill` uses all three levels.

The description in the frontmatter is specific enough to trigger on relevant queries:


```
---name: cloudflaredescription: Comprehensive Cloudflare platform skill covering Workers,   Pages, storage (KV, D1, R2), AI (Workers AI, Vectorize, Agents SDK),   networking (Tunnel, Spectrum), security (WAF, DDoS), and   infrastructure-as-code (Terraform, Pulumi). Use for any Cloudflare   development task.references:  - workers  - pages  - d1  - durable-objects  - workers-ai---```

The main SKILL.md contains the decision trees and product index, but not the detailed reference material. That lives in the `references/` subdirectories, loaded only when needed.

The result: you can have 60+ product references without paying the token cost upfront. The AI loads what it needs, when it needs it.

*It really is just that simple.*


## Pattern 5: The Slash Command Workflow

`cloudflare-skill` includes a slash command at `command/cloudflare.md` that orchestrates the skill:


```
---description: Load Cloudflare skill and get contextual guidance---​Load the Cloudflare platform skill and help with any Cloudflare development task.​## Workflow​### Step 1: Check for --update-skill flag​If $ARGUMENTS contains `--update-skill`:[update instructions...]​### Step 2: Load cloudflare skillskill({ name: 'cloudflare' })​### Step 3: Identify task type from user request​Analyze $ARGUMENTS to determine:- **Product(s) needed** (Workers, D1, R2, Durable Objects, etc.)- **Task type** (new project setup, feature implementation, debugging)​Use decision trees in SKILL.md to select correct product.​### Step 4: Read relevant reference files​Based on task type, read from `references/<product>/`:​| Task | Files to Read ||------|---------------|| New project | `README.md` + `configuration.md` || Implement feature | `README.md` + `api.md` + `patterns.md` || Debug/troubleshoot | `gotchas.md` |```

This command acts as a conductor: it loads the skill, analyses the request, consults the decision trees, and loads only the relevant reference files. The user just types `/cloudflare set up a D1 database with migrations` and the rest happens automatically.


## What Sets This Apart

Let’s identify what separates `cloudflare-skill` from a typical skill:

Most skills say “when writing TypeScript, use these patterns.” `cloudflare-skill` says “when you need storage, here’s how to pick between KV, D1, R2, Queues, Vectorize, and Durable Objects.”

The decision trees encode architectural knowledge. They’re teaching the AI to think like a Cloudflare expert, not just copy patterns.

With 60+ products, a monolithic skill would blow past any reasonable context window. The directory structure ensures the AI loads only what’s needed. You can ask about Workers without paying for the WAF documentation.

The gotchas files are gold. They contain the warnings you’d get from a colleague who’s been burned before. “Response bodies are streams, don’t read them twice.” “CPU time limits are 10ms, not wall-clock time.” This is the tribal knowledge that separates productive developers from frustrated ones.

The 5-file structure makes updates predictable. Need to add a new product? Create a directory with five files. Need to update API documentation? Edit `api.md`. Need to add a new gotcha? Append to `gotchas.md`. No hunting through a massive monolithic file.

To put the scale in perspective, here’s how `cloudflare-skill` compares to other skills:

*cloudflare-skill is one of the chunkier skills I’ve encountered hence why it needs a deeper dive.*

*(Data based on repository structure analysis. Anthropic’s docx and pdf skills from the official skills repository.)*


## Patterns You Can Steal

If you’re building a skill for a complex domain, here’s what to take from `cloudflare-skill`:

If your domain has multiple tools/products/approaches for similar problems, write a decision tree. Start with the user’s goal, branch on requirements, terminate at specific references.


```
Need a database?├─ Simple key-value → Use KV├─ Relational queries → Use D1├─ Existing Postgres/MySQL → Use Hyperdrive└─ Per-user isolated data → Use Durable Objects storage```

The 5-file pattern (README, api, configuration, patterns, gotchas) works for most technical domains. Adapt it:

Whatever you’re documenting, there are things that aren’t obvious. Limits that bite. Patterns that seem right but break. Defaults that surprise. Capture them explicitly.

When file A references file B, that’s fine. When file A references file B which references file C, the AI can get confused about what’s loaded. Keep the reference graph shallow.


## Write descriptions that trigger correctly

Your description should include:

- What the skill does (capabilities)
- When to use it (trigger conditions)
- Key domain terms (for matching)

Bad: “Helps with cloud stuff” Good: “Comprehensive Cloudflare platform skill covering Workers, Pages, storage (KV, D1, R2)…”


## Skills Worth Watching

`cloudflare-skill` isn’t the only well-designed skill in the ecosystem. Here are others worth studying:

The [anthropics/skills](https://github.com/anthropics/skills) repository (42,500+ stars) includes production-quality skills for document handling:

- **docx**: Word document manipulation
- **pdf**: PDF processing
- **pptx**: PowerPoint creation
- **xlsx**: Excel spreadsheet handling

These demonstrate the script-bundling pattern: skills that include executable code the AI can run without loading it into context.

From [awesome-claude-skills](https://github.com/travisvn/awesome-claude-skills) (5,100+ stars):

- **obra/superpowers**: 20+ battle-tested skills for TDD, debugging, collaboration
- **ios-simulator-skill**: iOS app building and testing automation
- **playwright-skill**: General browser automation


## The Broader Ecosystem

The Agent Skills standard has been adopted by 12+ platforms: Claude Code, OpenCode, GitHub Copilot, Cursor, VS Code, Gemini CLI, OpenAI Codex, and more. A skill you write today works across all of them.


## What Else Could Be Built?

`cloudflare-skill` proves the pattern works for large platforms. What else deserves similar treatment?

**Cloud platforms:**

- AWS (even more sprawling than Cloudflare)
- Vercel (deployment, edge functions, storage)
- Supabase (auth, database, storage, realtime)
- Netlify (similar scope to Vercel)

**Frameworks:**

- Next.js (App Router vs Pages Router, server components, caching)
- Rails (generators, Active Record, Action Cable, Hotwire)
- Laravel (Eloquent, queues, broadcasting, Livewire)

**Specialised domains:**

- Kubernetes (resources, networking, storage, RBAC)
- Terraform (providers, modules, state management)
- GraphQL (schema design, resolvers, caching)

The pattern scales to any domain where:

- Multiple products/approaches solve similar problems

Configuration is complex

- Undocumented gotchas exist
- The official docs are comprehensive but scattered


## The Core Insight

The best skills don’t just provide information. They help the AI make decisions.

A flat list of API methods is useful. A decision tree that helps choose between six storage options based on your requirements changes how the AI works with you.

`cloudflare-skill` succeeds because it encodes architectural judgement, not just documentation. It teaches the AI to think like a Cloudflare expert: assess the problem, pick the right tool, configure it correctly, avoid the pitfalls.

That’s the bar for excellent skills. Not “here’s what exists” but “here’s how to choose.”


## References

- `cloudflare-skill`** Repository** — The skill dissected in this article [https://github.com/dmmulroy/cloudflare-skill](https://github.com/dmmulroy/cloudflare-skill)
- **Agent Skills Specification** — The open standard for portable AI skills [https://agentskills.io/specification](https://agentskills.io/specification)
- **Anthropic’s Official Skills** — Production-quality skills from the standard’s creators [https://github.com/anthropics/skills](https://github.com/anthropics/skills)
- **awesome-claude-skills** — Community-curated collection of skills [https://github.com/travisvn/awesome-claude-skills](https://github.com/travisvn/awesome-claude-skills)
- **Writing OpenCode Agent Skills** — My previous guide on skill fundamentals [https://jpcaparas.medium.com/writing-opencode-agent-skills-a-practical-guide-with-examples-870ff24eec66](https://jpcaparas.medium.com/writing-opencode-agent-skills-a-practical-guide-with-examples-870ff24eec66)
- **Anthropic Engineering Blog: Equipping Agents with Skills** — The design philosophy behind skills [https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
