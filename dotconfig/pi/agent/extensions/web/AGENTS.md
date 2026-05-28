# AGENTS.md — pi-web-access

Web search, content extraction, code search, and video understanding for pi.

## Build / Lint / Test Commands

```sh
bun run check          # lint + format + typecheck (with auto-fix)
bun run test           # vitest run (all tests)
bun run typecheck      # TypeScript no-emit type-check only
```

### Running a single test

```sh
bunx vitest run test/index.test.ts             # single file
bunx vitest run -t "exports a pi extension"    # by test name pattern
bunx vitest run test/index.test.ts -t "export" # file + name
```

### Verification before submitting

All three should pass:

```sh
bun run check && bun run test && bun run typecheck
```

## Project Structure

```
*.ts           Root TypeScript modules for tools/providers/extension entry
skills/        Bundled pi skills
test/          Vitest smoke and regression tests
vite.config.ts Lint rules, formatting, and test config (vite-plus)
```

Single-package project. Bun is the package manager. No monorepo tooling.

## Current Baseline

- `bun run test` passes
- `bun run typecheck` is currently red against pi `0.67.2` types and will be cleaned up as we touch the codebase
