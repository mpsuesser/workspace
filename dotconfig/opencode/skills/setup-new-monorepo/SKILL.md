---
name: setup-new-monorepo
description: Use when asked to setup or initialize a new monorepo
---

# Setting up a new monorepo

When you're asked to set up a new monorepo, these decisions are already made — don't re-litigate them with the user, just apply them:

## Always yes

- **Package manager / workspaces**: bun workspaces. Use `catalog` for all non-dev dependencies and `catalog:dev` for all dev-only dependencies. Do not introduce additional subcatalogs beyond `catalog:dev`.
- **Runtime / core library**: Effect v4 (latest version).
- **Formatter**: dprint.
- **Linter**: oxlint.
- **Git hooks**: lefthook, running `bun run check` before commit.
- **Env files**: `.env` (start empty), `.envrc` that loads `.env` via direnv's `dotenv`.

## The canonical example

[`/Users/m/repos/mydb/`](file:///Users/m/repos/mydb/) is the reference for what "set up correctly" looks like in this house. When in doubt about shape, naming, or values — read the relevant file there and match it. In particular:

- `package.json` — workspaces layout (`packages/*`, `bindings/*`, `apps/*`), catalog/catalogs structure, the `check` / `typecheck` / `lint` / `fmt` / `test` script set, `prepare` script that installs lefthook, `trustedDependencies`.
- `dprint.json` — plugin set, includes/excludes, formatting options.
- `.oxlintrc.json` — plugin/category/rule set.
- `lefthook.yml` — pre-commit shape.
- `tsconfig.base.json` + `tsconfig.json` — strictness flags, the language-service plugin, include/exclude patterns.
- `.envrc`, `.env` — direnv setup.

Copy the *shape* of these files. Adapt the names, dependency versions (use latest), and workspace contents to the new project. Don't blindly copy mydb-specific things (e.g. drizzle config, alchemy scripts, `@mydb/*` paths) unless the new project actually needs them.

## Where to use judgment

The "always yes" list and the mydb reference cover the spine. Everything else — what apps/packages to scaffold, which Effect platform packages to pull in, whether to wire up alchemy or drizzle or vitest, how to structure CI — depends on what the user actually wants the monorepo *for*. Ask if it's unclear, otherwise pick sensible defaults based on the stated purpose.
