# Monorepos

Two ways to organize an Alchemy monorepo with a backend API and a frontend website:

1. **Single-stack** — one `alchemy.run.ts` at the root that deploys both. **Recommended.**
2. **Multi-stack** — each package owns its own `alchemy.run.ts`; the frontend reads the backend's outputs via a typed cross-stack reference.

## Which one?

Start with single-stack. It's simpler, faster to iterate on, and avoids deploy-ordering and reference-resolution gotchas.

| Situation | Use |
|---|---|
| One team owns both packages, ships them together | Single-stack |
| One `deploy` / `destroy` per environment | Single-stack |
| Just starting | Single-stack |
| Independent deploy cadences (different teams, CI) | Multi-stack |
| Backend has other consumers with their own lifecycle | Multi-stack |
| Need to `destroy` frontend without touching backend | Multi-stack |

Examples:
- `examples/monorepo-single-stack`
- `examples/monorepo-multi-stack`

## Shared base — workspace + backend

Workspace `package.json`:

```json
{
  "name": "monorepo",
  "private": true,
  "type": "module",
  "workspaces": ["frontend", "backend"]
}
```

`backend/package.json`:

```json
{
  "name": "backend",
  "private": true,
  "type": "module",
  "dependencies": {
    "alchemy": "workspace:*",
    "effect": "catalog:"
  },
  "exports": {
    ".": {
      "bun": "./src/index.ts",
      "import": "./lib/index.js",
      "default": "./lib/index.js"
    },
    "./Client": {
      "bun": "./src/Client.ts",
      "import": "./lib/Client.js",
      "default": "./lib/Client.js"
    }
  }
}
```

The `bun` condition resolves `import "backend"` to TS source under Bun. The `./Client` subpath keeps the browser bundle tightly scoped to runtime client only.

### Shared API schema

```ts
// backend/src/Spec.ts
import * as Schema from "effect/Schema";
import * as HttpApi from "effect/unstable/httpapi/HttpApi";
import * as HttpApiEndpoint from "effect/unstable/httpapi/HttpApiEndpoint";
import * as HttpApiGroup from "effect/unstable/httpapi/HttpApiGroup";

export class Greeting extends Schema.Class<Greeting>("Greeting")({
  message: Schema.String,
}) {}

export const hello = HttpApiEndpoint.get("hello", "/", { success: Greeting });

export class HelloGroup extends HttpApiGroup.make("Hello").add(hello) {}
export class BackendApi extends HttpApi.make("BackendApi").add(HelloGroup) {}
```

### Worker

```ts
// backend/src/Service.ts
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Etag from "effect/unstable/http/Etag";
import * as HttpPlatform from "effect/unstable/http/HttpPlatform";
import * as HttpRouter from "effect/unstable/http/HttpRouter";
import * as HttpApiBuilder from "effect/unstable/httpapi/HttpApiBuilder";
import { BackendApi, Greeting } from "./Spec.ts";

export default class Service extends Cloudflare.Worker<Service>()(
  "Service",
  { main: import.meta.filename },
  Effect.gen(function* () {
    const helloGroup = HttpApiBuilder.group(BackendApi, "Hello", (handlers) =>
      handlers.handle("hello", () =>
        Effect.succeed(new Greeting({ message: "Hello World" })),
      ),
    );
    return {
      fetch: HttpApiBuilder.layer(BackendApi).pipe(
        Layer.provide(helloGroup),
        Layer.provide([HttpPlatform.layer, Etag.layer]),
        HttpRouter.toHttpEffect,
      ),
    };
  }),
) {}
```

### Typed client

```ts
// backend/src/Client.ts
import * as HttpApiClient from "effect/unstable/httpapi/HttpApiClient";
import { BackendApi } from "./Spec.ts";

export const BackendClient = (baseUrl: string) =>
  HttpApiClient.make(BackendApi, { baseUrl });
```

### React entry

```tsx
// frontend/src/main.tsx
import { BackendClient } from "backend/Client";
import * as Effect from "effect/Effect";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8787";
const client = BackendClient(API_URL).pipe(
  Effect.provide(FetchHttpClient.layer),
);
```

The browser only imports from `"backend/Client"`, not the bare `"backend"` barrel — keeps the React bundle scoped to the runtime client.

## Option 1 — Single-stack (recommended)

One `alchemy.run.ts` at the workspace root deploys both. The frontend reads the Worker's URL directly off the in-memory output.

```ts
// alchemy.run.ts (root)
import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";
import { Path } from "effect/Path";
import Service from "./backend/src/Service.ts";

export default Alchemy.Stack(
  "Monorepo",
  {
    providers: Cloudflare.providers(),
    state: Cloudflare.state(),
  },
  Effect.gen(function* () {
    const backend = yield* Service;
    const path = yield* Path;
    const website = yield* Cloudflare.Vite("Website", {
      rootDir: path.resolve(import.meta.dirname, "frontend"),
      env: {
        VITE_API_URL: backend.url.as<string>(),
      },
    });
    return {
      backendUrl: backend.url.as<string>(),
      websiteUrl: website.url.as<string>(),
    };
  }),
);
```

Two things to know:
- `backend.url` is an `Output<string>`. Passing it into `Cloudflare.Vite`'s `env` makes Alchemy build the website *after* the Worker is deployed.
- `rootDir` lets a single stack build a Vite project that lives elsewhere in the workspace.

One plan, one apply, one set of state.

## Option 2 — Multi-stack

Each package owns its own `alchemy.run.ts`. Two extra moving parts:

- A typed `Backend` stack handle in `backend/src/Stack.ts`.
- Deploy ordering: backend first, then frontend (matching stages).

### Typed Stack handle

```ts
// backend/src/Stack.ts
import * as Alchemy from "alchemy";

export class Backend extends Alchemy.Stack<
  Backend,
  { url: string }
>()("Backend") {}
```

Re-export from the barrel so the frontend can import by package name:

```ts
// backend/src/index.ts
export * from "./Client.ts";
export * from "./Spec.ts";
export * from "./Stack.ts";
```

### Backend `alchemy.run.ts`

```ts
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";
import Service from "./src/Service.ts";
import { Backend } from "./src/Stack.ts";

export default Backend.make(
  {
    providers: Cloudflare.providers(),
    state: Cloudflare.state(),
  },
  Effect.gen(function* () {
    const api = yield* Service;
    return { url: api.url.as<string>() };
  }),
);
```

`Backend.make` is a typed shorthand for `Alchemy.Stack` using the name and output shape from the handle. If the returned object doesn't match `{ url: string }`, the file fails to typecheck.

### Frontend `alchemy.run.ts`

```ts
import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import { Backend } from "backend";
import * as Effect from "effect/Effect";

export default Alchemy.Stack(
  "Frontend",
  {
    providers: Cloudflare.providers(),
    state: Cloudflare.state(),
  },
  Effect.gen(function* () {
    const backend = yield* Backend;
    const website = yield* Cloudflare.Vite("Website", {
      env: { VITE_API_URL: backend.url },
    });
    return { url: website.url.as<string>() };
  }),
);
```

`yield* Backend` resolves to the **same stage** of the named stack — `sam` frontend reads `sam` backend, `pr-42` reads `pr-42`.

Deploy in order:

```sh
cd backend && alchemy deploy --stage sam
cd frontend && alchemy deploy --stage sam
```

Destroy in reverse — frontend first, then backend.

### Pin to a specific stage

```ts
const backend = yield* Backend.stage.prod;
const backend = yield* Backend.stage.staging;
const backend = yield* Backend.stage["pr-42"];
```

| Goal | Use |
|---|---|
| Frontend's stage maps 1:1 to backend's | `yield* Backend` |
| Always pin to a specific stage | `yield* Backend.stage.prod` |
| Branch on current stage | conditional — see [Shared database across stages](./shared-database.md) |

## Comparison

| Concern | Single-stack | Multi-stack |
|---|---|---|
| Number of `alchemy.run.ts` | 1 | 2 |
| Number of state files per stage | 1 | 2 |
| Deploy ordering | Implicit | Backend first |
| Cross-package reference | Direct `Output<string>` | `yield* Backend` → state-store lookup |
| `destroy` blast radius | Whole app | One package |
| Best for | Most projects | Independent deploy cadences |
