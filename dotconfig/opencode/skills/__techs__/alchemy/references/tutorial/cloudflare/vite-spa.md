# Add a Vite SPA

`Cloudflare.Vite` invokes Vite programmatically (via `createBuilder`), builds your client assets, ships them to Cloudflare, and serves them through a Worker — so your frontend and backend share one URL surface and one deploy.

Three paths:

1. [Set it up manually](#set-it-up-manually) — start from an empty project.
2. [Use the `create-vite` template](#use-the-create-vite-template) — start from Vite's official React + TS scaffold.
3. [Deploy an existing Vite project](#deploy-an-existing-vite-project).

## Set it up manually

The bare minimum is **an `index.html` with a script tag**. No `vite.config.ts`, no `package.json` `build` script, no `main` entry. Alchemy supplies the Vite config itself.

A minimal React SPA looks like:

```
.
├── index.html          # entry HTML, references the client bundle
└── src/
    └── main.tsx        # client entry imported by index.html
```

```sh
bun add react react-dom
bun add -d @types/react @types/react-dom @vitejs/plugin-react
```

### Create index.html

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>My App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### Create src/main.tsx

```tsx
import React from "react";
import ReactDOM from "react-dom/client";

function App() {
  return (
    <main>
      <h1>Hello from Alchemy + Vite</h1>
      <p>Edit <code>src/main.tsx</code> and redeploy.</p>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

### Add it to the Stack

```ts
import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";
import Worker from "./src/worker.ts";

export default Alchemy.Stack(
  "MyApp",
  {
    providers: Cloudflare.providers(),
    state: Cloudflare.state(),
  },
  Effect.gen(function* () {
    const worker = yield* Worker;
    const web = yield* Cloudflare.Vite("Website");
    return {
      url: worker.url,
      webUrl: web.url,
    };
  }),
);
```

The defaults set `notFoundHandling: "single-page-application"`, which is what makes client-side routing work — a deep link like `/about` returns `index.html` instead of a 404, and your router handles it on the client.

Any framework Vite supports works the same way — vanilla TS, Vue, Solid, Svelte — bring whatever `src/` layout the framework wants.

### Inject the Worker URL at build time

A pure SPA needs the backend's URL baked into the JS bundle at build time — there's no server to resolve it on each request. Pass `env` to `Cloudflare.Vite` and any `VITE_`-prefixed entry is inlined as `import.meta.env.<KEY>` during the Vite build:

```ts
const worker = yield* Worker;
const web = yield* Cloudflare.Vite("Website", {
  env: {
    VITE_API_URL: worker.url.as<string>(),
  },
});
```

Then read it from the SPA:

```ts
const apiUrl = import.meta.env.VITE_API_URL;
await fetch(`${apiUrl}/api/hello`);
```

A few notes:

- **Only `VITE_`-prefixed keys are inlined into the bundle**, matching Vite's default `envPrefix`. Other keys are still attached to the deployed Worker as runtime bindings but stay out of the SPA's JS.
- **`Redacted` values are unwrapped** when they're `VITE_`-prefixed — prefixing means "this is public", so the redaction is taken as a marker for log scrubbing, not for hiding the value from the bundle. Don't prefix secrets with `VITE_`.
- **`Output` values resolve at deploy time** before the build runs, so `worker.url.as<string>()` works as shown.

## Use the create-vite template

If you'd rather start from a real framework scaffold (React + TS with HMR, ESLint, etc.), use Vite's official template:

```sh
bun create vite@latest web -- --template react-ts
cd web && bun install && cd ..
```

That drops a complete project into `./web/`. Since the SPA isn't at the project root, set `rootDir`:

```ts
const web = yield* Cloudflare.Vite("Website", {
  rootDir: "./web",
});
```

`rootDir` defaults to `process.cwd()`, so you only set it when your `index.html` isn't next to `alchemy.run.ts`.

## Deploy an existing Vite project

Already have a Vite SPA? Point `Cloudflare.Vite` at it with `rootDir`:

```ts
const web = yield* Cloudflare.Vite("Website", {
  rootDir: "./path/to/your/spa",
});
```

Your existing `vite.config.ts`, plugins, aliases, and `tsconfig` are preserved — Alchemy merges its Cloudflare integration on top of your config.

Alchemy runs Vite on `rootDir`, uploads the assets, creates a Worker that serves them, and prints the new `webUrl` stack output:

```
{
  url: "https://myapp-worker-dev-you.workers.dev",
  webUrl: "https://myapp-web-dev-you.workers.dev",
}
```

Test it:

```ts
test(
  "Web SPA serves index.html",
  Effect.gen(function* () {
    const { webUrl } = yield* stack;
    const response = yield* HttpClient.get(webUrl);
    expect(response.status).toBe(200);
    expect(yield* response.text).toContain("<!doctype html>");
  }),
);
```

## Use a different framework

`Cloudflare.Vite` works with any Vite-based framework. The setup above is the SPA case (no SSR). For SSR frameworks, drop the `assets.config` block and let the framework's Vite plugin own the entry. Common choices:

- **TanStack Start** — full-stack React with file-based routing and server functions.
- **SolidStart** — SSR Solid with file-based routing.
- **SolidJS SSR (manual)** — when you want full control over the SSR pipeline.
- **Vue 3 SPA** — Vite's default Vue template, with the same `notFoundHandling: "single-page-application"` config.
- **Plain static site** — a single `index.html` (no framework) ships through `Cloudflare.Vite("Website")` with no extra config.

For deeper coverage of framework-specific patterns, see the [Frontend frameworks guide](../../guides/frontends.md).

## Add a backend resource

Most SPAs need to talk to a real backing service — a bucket for uploads, a database for state. Bindings give your Worker a typed handle to those resources.

Start with the simplest backend: an R2 bucket.

```ts
import * as Cloudflare from "alchemy/Cloudflare";
export const Bucket = Cloudflare.R2Bucket("Bucket");
```

## Bind the bucket to your worker

Add the bucket to the Vite worker's `bindings` map:

```ts
import { Bucket } from "./src/backend.ts";
const web = yield* Cloudflare.Vite("Website", {
  bindings: {
    BUCKET: Bucket,
  },
});
```

The key (`BUCKET`) is the field name on `env`; the value identifies the resource. `env.BUCKET` is now typed as `R2Bucket` end to end.

## Pull in Cloudflare's binding types

```sh
bun add -d @cloudflare/workers-types
```

```jsonc
{
  "compilerOptions": {
    "types": [
      "bun",
      "vite/client",
      "@cloudflare/workers-types"
    ]
  }
}
```

## Option 1 — call the binding directly

Inside a server route, `env.BUCKET` is the standard Cloudflare R2 client. Use it as a regular `async`/`await` API:

```ts
import { createFileRoute } from "@tanstack/react-router";
import { env } from "../env.ts";

export const Route = createFileRoute("/api/hello")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const key = new URL(request.url).searchParams.get("key");
        if (!key) return new Response("Missing 'key'", { status: 400 });
        const object = await env.BUCKET.get(key);
        if (!object) return new Response("Not found", { status: 404 });
        return new Response(object.body);
      },
    },
  },
});
```

## Add an Effect-native Worker

When the work is shared across routes, deserves typed errors, or needs Effect-native primitives, factor it into its own Worker:

```ts
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";
import { HttpServerRequest } from "effect/unstable/http/HttpServerRequest";
import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse";

export const Bucket = Cloudflare.R2Bucket("Bucket");

export default class Backend extends Cloudflare.Worker<Backend>()(
  "Backend",
  { main: import.meta.path },
  Effect.gen(function* () {
    const bucket = yield* Cloudflare.R2Bucket.bind(Bucket);
    return {
      hello: Effect.fn("Backend.hello")(function* (key: string) {
        const object = yield* bucket.get(key);
        if (object === null) return null;
        return yield* object.text();
      }),
      fetch: Effect.gen(function* () {
        const request = yield* HttpServerRequest;
        const key = new URL(request.url, "http://x").searchParams.get("key");
        if (!key) {
          return HttpServerResponse.text("Missing 'key'", { status: 400 });
        }
        const object = yield* bucket.get(key);
        if (object === null) {
          return HttpServerResponse.text("Not found", { status: 404 });
        }
        return HttpServerResponse.raw(object.body);
      }),
    };
  }).pipe(Effect.provide(Cloudflare.R2BucketBindingLive)),
) {}
```

`hello` is a typed RPC method — any worker bound to `Backend` can call it across worker boundaries.

## Bind the Backend as a service

```ts
import Backend, { Bucket } from "./src/backend.ts";
const web = yield* Cloudflare.Vite("Website", {
  bindings: {
    BUCKET: Bucket,
    BACKEND: Backend,
  },
});
```

## Option 2 — call the worker's `fetch`

```ts
GET: async ({ request }) => {
  const key = new URL(request.url).searchParams.get("key");
  if (!key) return new Response("Missing 'key'", { status: 400 });
  return env.BACKEND.fetch(
    `https://backend/?key=${encodeURIComponent(key)}`,
  );
},
```

## Option 3 — call the worker's RPC method

Effect-native workers serialize results as wire envelopes. `toPromiseApi` is the consumer-side wrapper that auto-decodes those envelopes into a clean `Promise<T>` API:

```ts
import * as Cloudflare from "alchemy/Cloudflare";
import type Backend from "../backend.ts";
import { env } from "../env.ts";

const backend = Cloudflare.toPromiseApi<Backend>(env.BACKEND);

// ...
const value = await backend.hello(key);
if (value === null) return new Response("Not found", { status: 404 });
return new Response(value);
```

RPC keeps you off the HTTP detour — the call is a typed function, not a request, and the return value is the value itself.

Next: [run a Container](./containers.md).
