# Frontend frameworks

`Cloudflare.Vite` covers TanStack Start, Astro, SolidStart, Nuxt, React, and other Vite-based frameworks. `Cloudflare.StaticSite` wraps any custom build pipeline — Hugo, Eleventy, mdBook, Jekyll. One declaration; Alchemy builds and deploys to Cloudflare.

## Vite-based frameworks

`Cloudflare.Vite` uses Cloudflare's Vite plugin to build the server bundle and client assets in one `vite build`. Inputs are content-hashed; unchanged projects skip the build.

**TanStack Start (SSR):**

```ts
import * as Cloudflare from "alchemy/Cloudflare";

export const App = Cloudflare.Vite("App", {
  compatibility: { flags: ["nodejs_compat"] },
});
```

**Astro:**

```ts
export const Site = Cloudflare.Vite("Site");
```

**React + Vite:**

```ts
export const App = Cloudflare.Vite("App");
```

Key points:

- **SSR with `nodejs_compat`** — For frameworks that need Node APIs at runtime (TanStack Start, SolidStart, Nuxt), enable `nodejs_compat` in one line.
- **Static** — Drop the `compatibility` option for pure SPA or static sites. The Worker serves the built assets.
- **Content-hashed builds** — Every input file is hashed (respecting `.gitignore` by default).

## Static sites with any build pipeline

For everything Vite doesn't build, `Cloudflare.StaticSite` runs a shell command, hashes the output, and deploys as a Worker with static assets:

```ts
export const Blog = Cloudflare.StaticSite("Blog", {
  command: "hugo --minify",
  outdir: "public",
});
```

Hugo, Eleventy, mdBook, Jekyll — anything that produces a directory.

## Bind backend resources from your SSR Worker

The SSR Worker can bind to R2, KV, D1, DynamoDB — anything declared elsewhere in the stack:

```ts
import { Bucket } from "./Bucket.ts";
import { DB } from "./DB.ts";

export const App = Cloudflare.Vite("App", {
  bindings: { Bucket, DB },
});

// In your SSR loader / server function:
//   env.Bucket.get(key)   // typed via Cloudflare.InferEnv
//   env.DB.prepare(sql)
```
