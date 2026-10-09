---
name: jev-brainstorm
description: Brainstorm ways to use Jev toward a goal, drawing on 50 source-linked examples of interfaces, agents, data workflows, simulations, and creative applications. Use alongside typesafe-ai during Jev idea generation.
---

# Jev brainstorm

Load `typesafe-ai` first if it is not already in the conversation; it supplies the core intuitions and current documentation pointers. Use this collection to find mechanisms that transfer to the user's goal, including combinations across unrelated domains. Recommend a few promising adaptations and distinguish the source's demonstrated behavior from your proposed extension.

These 50 examples were selected for variety and reusable ideas from [jev-experiments](https://github.com/dabit3/jev-experiments), [ten-levels-of-jev](https://github.com/disler/ten-levels-of-jev), and projects discovered through [awesome-jev](https://github.com/daftAI2026/awesome-jev/blob/main/README.md). Source READMEs reviewed on 2026-10-04. Treat these as design references: demos, simulations, and experimental libraries have different evidence behind them; consult the linked project and live TypeSafe docs when implementing.

## Fast interfaces and live workflows

### 1. Describe the effect, find the command
[NL Palette](https://github.com/dabit3/jev-experiments/tree/main/nl-palette)

An editor palette maps “make this louder” to increasing font size and “make it look like paper” to a sepia theme. One request selects the command and speculatively answers its possible argument questions; code consumes only the winning command's arguments. This turns an existing action catalog into a natural-language interface without generating executable instructions.

### 2. Find things by what happened
[Launcher](https://github.com/dabit3/jev-experiments/tree/main/jev-launcher)

A launcher understands “the last PDF I opened” and “all the links I visited today about this topic” using locally retrieved candidates with explicit recency evidence. Jev distinguishes one-item intent from set intent and judges individual membership; code constructs editable groups that can become saved workspaces. The transferable idea is searching by remembered circumstances, with opened, added, and modified times kept distinct.

### 3. Search that follows a changing intention
[Jev Instant Search](https://github.com/dabit3/jev-experiments/tree/main/jev-instant-search)

Local lexical search finds product candidates, then Jev scores their relevance alongside questions about budget, gifts, and sorting preferences. “Keep coffee hot on a hike” can favor vacuum bottles over coffee makers, while ordinary code combines the signals and handles prices. Sequence-aware updates and request coalescing let semantic refinement accompany typing without an old answer overwriting a newer query.

### 4. A spellchecker for consequential messages
[Send Guard](https://github.com/dabit3/jev-experiments/tree/main/send-guard)

A message composer continuously judges promises, confidential information, tone, and audience fit while the author types. Code identifies candidate spans, and Jev judges whether each fragment is problematic in this particular channel, producing exact underlines without generating quotations. The same Friday date can be harmless internally and a binding commitment externally: context changes the judgment while the UI remains familiar.

### 5. Column headers as semantic formulas
[Judge Sheets](https://github.com/dabit3/jev-experiments/tree/main/judge-sheets)

Typing “Urgency” or “Ready to buy?” into a spreadsheet header selects a prediction schema using the header and sample rows. The sheet fills ordinary asynchronous JUDGE, PICK, or RATE formulas, batching questions that share source text and caching their answers. Semantic interpretation becomes part of the spreadsheet dependency graph, so counts, averages, filters, and downstream formulas update as judgments arrive.

### 6. Know when a speaker has finished
[Jev Voice Turn](https://github.com/dabit3/jev-experiments/tree/main/jev-voice-turn)

Partial speech transcripts feed judgments about turn completion, intent, and interruption while code retains pause timers and speech control. “Send a message to…” can extend the waiting period, whereas a complete request can trigger earlier than a fixed silence timeout; “stop” can interrupt playback without treating every backchannel as a cancellation. The demo's measurements use a simulated microphone, but the mechanism is semantic endpointing over changing text.

### 7. Meeting notes people can correct in the room
[Fern / Live Minutes](https://github.com/dabit3/jev-experiments/tree/main/live-minutes)

Each finished utterance is classified as an action, decision, question, risk, update, or chatter, with parallel judgments about owner, deadline kind, blockage, and reversal. Code copies the utterance, resolves dates and attendee identities, and updates the meeting's structured notes. Surfacing an assignment immediately makes it a shared object participants can correct, while reversal detection allows later statements to supersede earlier decisions.

### 8. Reply suggestions without reply generation
[Agent Assist](https://github.com/dabit3/jev-experiments/tree/main/agent-assist)

Every incoming support message updates intent, frustration, churn, escalation flags, and a selection from a hand-written macro catalog. Strong selections can populate the composer; ambiguous ones become a short list of alternatives, and the same signals reorder a supervisor's queue. This makes one judgment batch useful at both the individual conversation and fleet-wide attention levels, with eligibility rules calculated separately in code.

### 9. Invent a filter in plain English
[Sift / Inbox Blitz](https://github.com/dabit3/jev-experiments/tree/main/inbox-blitz)

An operator describes a label such as “customers threatening to cancel” or “sarcastic tone,” and Jev judges each email against that meaning. Match probabilities stream into the inbox, then labels can be intersected and existing triage dimensions reweighted without repeating inference. The interface lets users create semantic views on demand rather than waiting for someone to implement a new classifier or search syntax.

### 10. Moderate before publication, with different interventions
[ModStream](https://github.com/dabit3/jev-experiments/tree/main/modstream)

Messages are held briefly while a single request judges harassment, scams, evasion, spam, severity, and whether the sender may need support. Code maps those distinct signals into release, hiding, timeout, review, or a care queue, so similar vocabulary need not imply the same intervention. Stored judgments also let moderators replay policy changes over recent messages without paying for another classification pass.

## Code, search, and simulations

### 11. Alert on meaning rather than log level
[Log Sentinel](https://github.com/dabit3/jev-experiments/tree/main/log-sentinel)

Jev distinguishes an ERROR that already recovered from an INFO event describing a silent failure, such as an empty successful payment response. It supplies actionability, severity, category, and security signals while code groups stack traces and aggregates incidents. This suggests semantic monitoring wherever the operational consequence lives in an event's meaning rather than its severity label.

### 12. Review a commit before it exists
[Commit Sentry](https://github.com/dabit3/jev-experiments/tree/main/commit-sentry)

Staged hunks are judged in parallel for secret exposure, sensitive logging, destructive changes, skipped tests, API changes, and other concerns. A Choice selects an offending added line for an exact citation, then a second-stage check compares the commit message with the classified changes. The useful composition is local evidence checks followed by a higher-level consistency check, fast enough to sit at the commit boundary.

### 13. Semantic squiggles while editing
[Jev Lint](https://github.com/dabit3/jev-experiments/tree/main/jev-lint)

An editor sends changed lines with their enclosing function and asks about bugs, security, misleading names, unreachable code, and performance smells. Code turns answers into markers, clusters neighboring reports, and discards results whose source lines changed in flight. This brings checks such as “isEmpty actually means nonempty” into the same interaction loop as syntax diagnostics, while preserving the source snapshot each judgment concerned.

### 14. Computer use through real controls
[Jev AX Pilot](https://github.com/dabit3/jev-experiments/tree/main/jev-ax-pilot)

A macOS pilot flattens the Accessibility tree into actionable element IDs and asks Jev to choose a control, shortcut, or other bounded next step. Text comes from candidates extracted from the user's goal; arithmetic, interaction, and observation stay in code. The pattern is a fresh action space on each observation, making UI control possible without asking the decision model to perceive screenshots or invent coordinates.

### 15. A swarm with personalities
[Jev Swarm](https://github.com/dabit3/jev-experiments/tree/main/jev-swarm)

Arena creatures receive local perceptions and personality descriptions, then choose movement, boost use, and a nearby target. Several creatures' question sets share one request, while physics, cooldowns, collisions, and target tracking run locally. It demonstrates how natural-language traits can alter many small policies inside the same deterministic world, rather than requiring a generated story for every character.

### 16. Rank maneuvers, validate with physics
[Jev Tower](https://github.com/dabit3/jev-experiments/tree/main/jev-tower)

In an air-traffic simulation, code predicts conflicts and Jev chooses among a bounded menu of maneuvers, with urgency and handoff judgments alongside. A deterministic validator checks the choice and can try the next-highest-probability maneuver when the first is invalid. The transferable mechanism is using the whole distribution as an ordered proposal set while exact geometry and constraints determine which proposals can execute.

### 17. Turn reports into resource requests
[Jev Dispatch](https://github.com/dabit3/jev-experiments/tree/main/jev-dispatch)

A fictional dispatch center interprets incoming reports into incident categories, severity, hazard flags, unit packages, and possible duplicates of open incidents. Code handles geographic matching, merging, nearest-available-unit allocation, and stale answers. This separates semantic demand interpretation from resource scheduling, a pattern that can transfer to field service, maintenance, logistics, or incident response simulations.

### 18. Search that admits nothing answers the question
[Turbo Rerank](https://github.com/dabit3/jev-experiments/tree/main/turbo-rerank)

A lexical retriever supplies passages, and one Jev request asks an independent relevance Score for each plus a Noul about whether any candidate actually answers the query. Code orders the original passages and can display “no good answer” instead of presenting the least-bad result as sufficient. Ranking and answer availability become separate outputs, useful for deciding whether to retrieve more evidence or ask a follow-up.

## Decisions inside an agent

### 19. Compact at a meaningful boundary
[Ten Levels: Should I Compact](https://github.com/disler/ten-levels-of-jev#level-7-should-i-compact)

An agent harness asks whether the task changed, a unit of work finished, earlier history remains necessary, or a multi-step edit is still underway. Code combines those judgments with token usage to decide when to recommend compaction; another Choice identifies where the live work begins. Context management becomes sensitive to the work's structure rather than solely to a window-size threshold.

### 20. Learn about a file without loading it
[Ten Levels: Cheap Reads](https://github.com/disler/ten-levels-of-jev#level-8-cheap-reads)

The agent asks a boolean, categorical, or rubric question about a file, and a tool sends the contents to Jev while returning only the typed answer. “Does this module validate tokens?” can be answered without the whole module entering the main agent's context. This creates a distinction between reading to learn one fact and reading to edit or quote the actual source.

### 21. Scout broadly, inspect narrowly
[Ten Levels: Files at Scale](https://github.com/disler/ten-levels-of-jev#level-9-files-at-scale)

Code expands paths or globs and removes unsuitable files, then Jev judges the remaining files independently in parallel. A second pass selects which real path to inspect first from the short list. The mechanism turns repository exploration into broad semantic screening followed by focused reading, useful when behavior is easier to describe than filenames or symbols.

### 22. Let the agent write its own decision questions
[Ten Levels: Agentic Jev](https://github.com/disler/ten-levels-of-jev#level-10-agentic-jev)

A generic tool combines agent-supplied state, file contents, command output, and a question block authored by the agent itself. The example classifies a test failure before editing, then judges a diff and checks the resulting test evidence. Jev becomes a reusable decision coprocessor the agent reaches for when it needs a bounded answer, rather than a fixed-purpose hook chosen by the harness author.

### 23. Route both capability and effort
[Ten Levels: Intent and Model Routing](https://github.com/disler/ten-levels-of-jev#level-5-intent-and-model-routing)

A cheap preliminary judgment selects a script, fast agent, reasoning agent, browser agent, or human, with companion questions about ambiguity and required capabilities. A related router chooses model tier and reasoning effort separately. This suggests allocating compute by the work actually needed: exact lookups can bypass generation, while ambiguous or research-heavy tasks take a different route.

### 24. Make an idea verdict decomposable
[Ten Levels: Composite Scoring](https://github.com/disler/ten-levels-of-jev#level-3-composite-scoring)

An idea is scored on problem strength, demand, monetization, and differentiation, then code combines the dimensions into kill, fix, or ship bands. The interesting part is that the weights remain outside the model, making disagreements about priorities explicit and cheaply adjustable. Use the shape for comparative screening of concepts or proposals, treating the inputs as judgments rather than proof of market demand.

### 25. Check a citation's relationship to a claim
[Ten Levels: Confidence Gating](https://github.com/disler/ten-levels-of-jev#level-4-confidence-gating)

The citation example asks whether the source supports the claim and whether the quote is faithful, then uses uncertainty to determine review behavior. These are separate questions: text can be copied accurately yet fail to establish the conclusion attached to it. That decomposition transfers to research assistants, generated reports, and any workflow where evidence must support more than just a matching phrase.

### 26. Screen evidence as it enters context
[Ten Levels: Guardrail Hooks](https://github.com/disler/ten-levels-of-jev#level-6-guardrail-hooks)

A tool-result hook asks whether retrieved text is ordinary data or contains instructions aimed at manipulating the agent. Suspicious results receive a warning banner before they enter the main model's context, preserving the material while changing how it is presented. The broader idea is contextual annotation at ingestion; the repository explicitly treats these judgments as signals rather than complete security controls.

## Data, memory, and reusable judgments

### 27. Navigate a graph by semantic intent
[neo4jev](https://github.com/jexp/neo4jev)

At each node, real outgoing relationships become Choice options and a companion Noul asks whether the goal has been reached. Code uses the returned probabilities to branch through a beam search over actual graph edges. This lets “find paths connecting these kinds of things” guide graph exploration without generating a query language or inventing relationships absent from the database.

### 28. Subscribe to meanings, not just topics
[Semantic Pub/Sub](https://github.com/damiensmith1/semantic-pubsub-jev)

Subscribers describe their interests in plain language, and each published message is judged against all relevant subscriptions in one batch. The routing decision travels with the message so replay and delivery instances share the same judgment. It is a semantic event bus; the project's wording-sensitivity findings also suggest giving subscribers examples of what their predicates actually catch.

### 29. Decide whether an agent is worth waking
[wakegate](https://github.com/shitianfang/wakegate)

Before resuming a sleeping agent, Jev compares a new event or observation with what the agent was waiting for. Code skips clearly irrelevant wakeups but forces a wake for user messages, uncertainty, failures, or a bounded skip limit. This moves semantic judgment ahead of context restoration, potentially avoiding full agent turns whose only conclusion would be “nothing relevant changed.”

### 30. Memory made from quotes, audited against evidence
[jevmory](https://github.com/romiluz13/jevmory)

Session records become candidate sentences, and Jev grades durability, significance, support, and contradiction while code stores selected verbatim excerpts. A later audit compares memory lines with the evidence and distinguishes stale, wrong, unsupported, and retained claims. The reusable idea is memory as source selection plus maintenance, allowing a remembered statement to keep its provenance instead of becoming an untraceable summary.

### 31. Resolve conflicts by choosing among valid candidates
[Hunkpick](https://github.com/hfnissum-byte/Hunkpick)

Code constructs merge candidates from both sides, the ancestor, unions, and line- or token-level merges, then removes candidates that fail the supported syntax checks. Jev chooses among survivors or no match and separately judges whether a person should decide. This is a repair pattern built around candidate generation and validation: the model chooses a proposed repair, while syntax validity remains distinct from semantic correctness.

### 32. Add semantic predicates to ordinary SQL
[jevQL](https://github.com/kylemclaren/jevql)

Queries can filter, classify, group, or order rows by natural-language judgments through functions such as `jev`, `jev_choice`, and `jev_score`. The client pushes ordinary predicates to PostgreSQL first, batches judgments over surviving rows, then applies semantic operations locally. It shows how AI can become an operator in an existing data language, with caching keyed by the row and question rather than by a generated answer paragraph.

### 33. Import content by selecting source blocks
[Vellum](https://github.com/sanity-labs/vellum)

A Markdown parser exposes blocks and type-compatible fragments; Jev chooses which fragments supply which CMS fields and how blocks form nested sections. Code copies accepted values and runs schema validation, leaving unavailable fields missing rather than inventing them. Bidirectional field-to-source and source-to-field judgments provide a useful pattern for semantic mapping between schemas while preserving exact source content.

### 34. Split packets at document boundaries
[DocJev](https://github.com/jerryjliu/docjev)

Local extraction turns PDFs and office documents into page text, and Jev judges categories and boundaries between component documents. Two adjacent publications can share a category yet still require a split, while tables and appendices may belong to one continuing document. Code guarantees exact page coverage and exports original pages, making semantic boundary detection useful without rewriting the documents themselves.

### 35. Understand a form without seeing the answers
[jev-fill-pdf](https://github.com/takumi-golf/jev-fill-pdf)

Noisy OCR labels around PDF fields are matched to profile keys such as name or postal code using one Choice per field. The user's actual values stay in the browser, where code fills the selected fields. Confirmed mappings are cached by a form fingerprint, turning a semantic interpretation into reusable local autofill with no further inference for known forms.

## Creative and accessible experiences

### 36. Compile a creature from its description
[Jev Creature Forge](https://github.com/Amine-LG/jev-creature-forge)

Descriptions become a typed creature genome: Choice selects anatomical families, Score places traits on visual scales, and Noul decides whether parts are present. Explicit user properties are locked, inferred traits guide later questions, and deterministic code constructs the SVG anatomy. The result can be edited and replayed locally, illustrating how semantic choices can drive procedural creation without image generation.

### 37. Persuade a character according to its values
[Honeytongue](https://github.com/tbrought/honeytongue)

A player types or speaks an argument, and Jev judges whether a specific character is convinced, unconvinced, offended, or hearing a repetition. Persona and goal provide the context, so an appeal that works on a greedy merchant may fail with an honest guard. Code owns the consequences, making open-ended player language part of an authored game mechanic rather than requiring free-form NPC dialogue.

### 38. Free-text input into an authored story
[jeff-ink](https://github.com/saembit/jeff-ink)

Players type what they want to do, and Jev maps the utterance onto the current choices in an Ink story, with no-match, help, and off-story signals. The engine advances only along branches the author supplied. This decouples expressive input from generated output: the experience can feel conversational while the narrative, pacing, and reachable outcomes remain authored.

### 39. Art direction from the sound of a room
[Roomtone](https://github.com/0xStoneyStark/roomtone)

Local audio analysis converts sound into descriptors, which Jev maps to visual patterns, glyphs, palettes, composition, motion, and intensity. Slow scene decisions and faster “live feel” judgments run on different clocks while rendering and beat response remain local. Sampling from the returned distributions makes variation responsive to the music rather than merely random, without sending audio to the text-only model.

### 40. Pair music with a taste
[Sound & Sip](https://github.com/toshinoritakata/music-cocktail)

On-device audio analysis produces acoustic features, genre and mood tags, and tempo; Jev uses these to choose from an existing cocktail catalog. Recipe descriptions supply the other side of the comparison, while code restricts candidates for preferences such as non-alcoholic drinks. This is a cross-domain recommendation experiment: semantic associations connect sound to taste, with the pairing framed as creative interpretation rather than a measured fact.

### 41. Help someone find a missing word
[Aphasia Word Finder](https://github.com/nautahakk/aphasia-word-finder)

A person describes a word indirectly, and Jev selects candidates from a fixed vocabulary augmented with personal names and places. Parallel shortlist questions feed a second selection pass, and the person taps a picture tile to have the chosen word spoken. The prototype has not been tested with people with aphasia, but its mechanism suggests accessible interfaces that tolerate fragmented descriptions and make recognition easier than recall.

## Learning, investigation, and adaptive products

### 42. Turn repeated judgments into a local model
[Jevstiller](https://github.com/tomerglick57/Jevstiller)

A proxy initially sends classification traffic to Jev, then trains a small local student using the returned probability distributions. Confident, familiar inputs can move to the student after evaluation, while novel inputs and a continuing audit sample still reach Jev. The interesting lifecycle is semantic prototyping followed by task-specific distillation; agreement with the teacher is measured separately from correctness against real labels.

### 43. Improve a judgment through selective feedback
[jev-align](https://github.com/sutro-sh/jev-align)

The workflow selects uncertain examples plus a random audit sample for labeling, then uses GEPA to propose improvements to a reusable AI function's definition. Users inspect the proposed diff and measurements before accepting a version, and production examples can feed the next round. This treats question design as an iterative product with feedback and versioning, rather than a prompt someone writes once and forgets.

### 44. Discover which writing traits predict outcomes
[jev-writer](https://github.com/Kaos599/jev-writer)

Jev scores published writing against named rubric dimensions, then ordinary statistics compare those signals with observed engagement. Deterministic features such as length compete with semantic ones, and the analysis accounts for multiple comparisons and publication-date trends. The useful move is turning judgments into testable features: evidence may support a writing hypothesis, or the pipeline may honestly produce no confirmed finding.

### 45. Screen research one criterion at a time
[jev-screen](https://github.com/gbesse/jev-screen)

Each paper's title and abstract receive one Noul per inclusion or exclusion criterion, and code produces include, exclude, or maybe outcomes. Individual criterion results expose why a record was routed and let reviewers prioritize uncertain cases while measuring recall against human screening. This is a documented second-screener design with synthetic demo judgments, illustrating conjunctive eligibility rules rather than a single compensating relevance score.

### 46. Choose the next useful intake question
[Jev OpenFisca Intake](https://github.com/gbesse/jev-openfisca-intake)

A narrative about a household is related to an explicit variable schema, and Jev selects the next useful question from the remaining inputs. Inferred values remain unconfirmed until accepted; code handles completion and validated inputs for the downstream OpenFisca simulation. The example suggests adaptive interviews that gather structured facts for an existing calculation engine rather than asking a model to calculate entitlements.

### 47. Track how commitments change
[Jev Marianne](https://github.com/gbesse/jev-marianne)

Pairs of sourced political statements are classified as new commitments, clarifications, reformulations, possible reversals, or unrelated remarks. Exact equality, IDs, dates, and version history stay in code, while Jev handles the semantic relationship. The same pattern could monitor product promises or policy revisions: detect a change in meaning without confusing that judgment with whether the promise is true or fulfilled.

### 48. Find test impact beyond the import graph
[jev-test-impact](https://github.com/criguex/jev-test-impact)

Import relationships, ownership, and tags first select tests deterministically; Jev handles ambiguous connections between diffs and black-box test behavior. Each remaining question asks whether a change could alter a particular test's result, with broad test execution retained when inference fails. This makes semantic judgment a supplement to static analysis, especially where end-to-end behavior crosses boundaries the dependency graph cannot express.

### 49. Learn a page template once
[Unclutter](https://github.com/kitze/unclutter)

Jev classifies bounded descriptions of page elements as useful content, ads, promotions, newsletter blocks, or other clutter. Code derives and validates selectors, then saves reusable rules keyed by the site's page template so later matching pages need no model request. The general pattern is using one semantic inspection to establish a reversible deterministic behavior for repeated structures.

### 50. Turn a transcript into a navigable timeline
[jev-skip](https://github.com/valentynkit/jev-skip)

Caption windows become bounded choices such as content, sponsor, intro, recap, or self-promotion, evaluated together against the transcript. Code paints a probability-weighted seek-bar map and schedules skips only for qualifying segments. Beyond sponsor skipping, the mechanism suggests semantic navigation through recorded material using source timestamps and uncertainty directly, rather than generating a summary detached from the playback experience.
