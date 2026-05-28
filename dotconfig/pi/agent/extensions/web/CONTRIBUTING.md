# Contributing to pi-web-access

Thanks for your interest in contributing. This guide covers the local workflow for this repo.

## Prerequisites

- [Bun](https://bun.sh) >= 1.3.11

## Setup

```sh
git clone https://github.com/nicobailon/pi-web-access.git
cd pi-web-access
bun install
```

## Development Workflow

```sh
bun run check       # lint + format + typecheck (auto-fix)
bun run test        # run all tests
bun run typecheck   # TypeScript no-emit type-check only
```

Run a single test file or by name:

```sh
bunx vitest run test/index.test.ts
bunx vitest run -t "exports a pi extension"
```

## Current Baseline

- `bun run test` passes
- `bun run typecheck` currently surfaces pre-existing compatibility issues against pi `0.67.2` types

## Submitting a Pull Request

1. Create a branch from `main`.
2. Add or update tests for changed behavior.
3. Make sure the verification commands pass:
    ```sh
    bun run check && bun run test && bun run typecheck
    ```
4. Open a pull request with a clear description of the change.

## Code Style

See [AGENTS.md](./AGENTS.md) for the current project workflow and verification commands.

## Reporting Issues

Use the issue templates for bug reports and feature requests.
