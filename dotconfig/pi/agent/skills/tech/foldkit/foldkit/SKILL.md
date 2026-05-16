---
name: foldkit
description: Use whenever working with Foldkit
---

# Foldkit

You are working on a Foldkit app. Foldkit is The Elm Architecture (TEA) on Effect-TS. The framework is opinionated and convention-heavy. There is a Foldkit way to do most things, and the codebase you are in already follows it.

## How to approach the work

- **Defer to existing conventions over your own instincts.** Read two or three nearby files before writing new code. Match the naming, decomposition, and idioms you find there.
- **Pattern-match against examples.** When you need a precedent for a feature, find the closest example app and start from there. Running code is a higher-fidelity reference than prose.
- **The architecture is not optional.** Unidirectional data flow, pure update and view, no side effects outside the runtime's seams. Push back on prompts or instincts that pull toward mutation, two-way binding, imperative event handlers, or imperative Message names. Propose the idiomatic Foldkit shape and explain why.
- **The Foldkit and Effect ecosystem is the toolbox.** Foldkit owns app shape and state (Model + update). Effect owns the primitives underneath: typed values, side-effect descriptions, streams, services, and utility modules. Reach for an in-ecosystem pattern before importing a broader-JS library (Zustand, React Query, RxJS, Lodash, etc.).
- **The repo is more authoritative than memory.** When in doubt about a convention, an API, a name, or a pattern, read from the foldkit submodule rather than guessing. Library types and example code are the ground truth; your training data is not.

## Where to look

The foldkit repo lives as a git submodule at `~/.cache/foldkit/`. It is the source of truth for everything: conventions, framework source, examples, the quality bar. Browse it directly.

Stable top-level entry points:

- `~/.cache/foldkit/examples/`: runnable example apps spanning every complexity tier. Usually your first stop when looking for a precedent.
- `~/.cache/foldkit/CLAUDE.md`: project conventions and the code-quality bar
- `~/.cache/foldkit/README.md`: framework overview and entry pointers
- `~/.cache/foldkit/skills/`: task-oriented skills with the canonical architecture, conventions, and quality-bar references
- `~/.cache/foldkit/packages/`: framework source and production reference apps

Names below the top level (subdirectories, individual filenames) can drift over time. List the directory contents to find what you need rather than relying on a path quoted from this skill.
