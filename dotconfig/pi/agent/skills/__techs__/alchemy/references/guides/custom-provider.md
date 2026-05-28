# Writing a Custom Resource Provider

A provider is an Effect `Layer` that implements lifecycle methods (`reconcile`, `delete`, optionally `diff`, `read`, `precreate`, `tail`, `logs`) for a resource type. This guide walks through building a Stripe `Product` provider end-to-end.

See [Provider](../concepts/provider.md) for concepts and [Resource Lifecycle](../concepts/resource-lifecycle.md) for when each method fires.

## 1. Declare props and attributes

```ts
// src/stripe/Product.ts
export interface StripeProductProps {
  name: string;
  description?: string;
  active?: boolean;
}

export interface StripeProductAttributes {
  productId: string;
  created: number;
}
```

## 2. Declare the Resource type and constructor

```ts
import { Resource } from "alchemy";

export type StripeProduct = Resource<
  "Stripe.Product",
  StripeProductProps,
  StripeProductAttributes
>;

export const StripeProduct = Resource<StripeProduct>("Stripe.Product");
```

The string `Type` (`"Stripe.Product"`) is what Alchemy uses to look up the provider at plan time — it must be globally unique.

## 3. Scaffold the provider Layer

```ts
import * as Provider from "alchemy/Provider";
import * as Effect from "effect/Effect";

export const StripeProductProvider = () =>
  Provider.effect(
    StripeProduct,
    Effect.gen(function* () {
      return StripeProduct.Provider.of({
        reconcile: () => Effect.die("not implemented"),
        delete: () => Effect.die("not implemented"),
      });
    }),
  );
```

- `Provider.effect` wraps an Effect that returns a `ProviderService` into a `Layer<Provider<StripeProduct>>`.
- `StripeProduct.Provider.of({...})` is a typed constructor — it forces every method's input/output to match the resource's props and attributes.
- The outer `Effect.gen` runs once when the layer is built. Acquire shared dependencies (clients, credentials) here.

## 4. Acquire credentials via a Context tag

```ts
// src/stripe/Credentials.ts
import * as Context from "effect/Context";
import * as Redacted from "effect/Redacted";

export class StripeCredentials extends Context.Tag("StripeCredentials")<
  StripeCredentials,
  { apiKey: Redacted.Redacted<string> }
>() {}
```

Yield it inside the provider's outer Effect:

```ts
export const StripeProductProvider = () =>
  Provider.effect(
    StripeProduct,
    Effect.gen(function* () {
      const { apiKey } = yield* StripeCredentials;
      const stripe = new Stripe(Redacted.value(apiKey));
      return StripeProduct.Provider.of({
        reconcile: /* ... */,
        delete: /* ... */,
      });
    }),
  );
```

The layer's type becomes `Layer<Provider<StripeProduct>, never, StripeCredentials>`. Credentials get supplied via an AuthProvider (step 8).

## 5. Implement `reconcile`

Shape: **observe → ensure → sync → return**. Must work for all three input cases:

| `output` | `olds` | Meaning |
|---|---|---|
| `undefined` | `undefined` | Greenfield create |
| defined | defined | Routine update |
| defined | `undefined` | Adoption — engine adopted via `read` |

```ts
reconcile: Effect.fnUntraced(function* ({ news, output }) {
  // Observe — fetch live state if we have a cached id.
  let product = output?.productId
    ? yield* Effect.tryPromise(() =>
        stripe.products.retrieve(output.productId),
      ).pipe(Effect.catchAll(() => Effect.succeed(undefined)))
    : undefined;

  // Ensure — create if missing.
  if (!product) {
    product = yield* Effect.tryPromise(() =>
      stripe.products.create({
        name: news.name,
        description: news.description,
        active: news.active,
      }),
    );
  }

  // Sync — patch any mutable field that drifted.
  if (
    product.name !== news.name ||
    product.description !== (news.description ?? null) ||
    product.active !== (news.active ?? true)
  ) {
    product = yield* Effect.tryPromise(() =>
      stripe.products.update(product!.id, {
        name: news.name,
        description: news.description,
        active: news.active,
      }),
    );
  }

  return {
    productId: product.id,
    created: product.created,
  };
}),
```

Don't branch the body on `output === undefined` — that just renames the old `create`/`update` split. Trust observed cloud state, not `olds`. The reconciler must be idempotent.

## 6. Implement `delete`

```ts
delete: Effect.fnUntraced(function* ({ output }) {
  yield* Effect.tryPromise(() =>
    stripe.products.del(output.productId),
  ).pipe(
    Effect.catchAll((cause) =>
      cause instanceof Error && cause.message.includes("No such product")
        ? Effect.void
        : Effect.fail(cause),
    ),
  );
}),
```

`delete` must also be idempotent — treat "already deleted" as success.

## 7. Implement `diff` (optional)

Runs at plan time, returns one of:

- `{ action: "noop" }` — change is trivial, skip update
- `{ action: "update", stables?: [...] }` — apply in place
- `{ action: "replace", deleteFirst?: boolean }` — destroy and recreate
- `undefined` / `void` — fall back to default (update)

```ts
import { isResolved } from "alchemy/Diff";

diff: Effect.fnUntraced(function* ({ news, olds }) {
  if (!isResolved(news)) return undefined;
  if (news.description !== olds.description) {
    return { action: "replace" } as const;
  }
  return undefined;
}),
```

For attributes immutable across all updates, declare at top level:

```ts
return StripeProduct.Provider.of({
  stables: ["productId"],
  /* ... */
});
```

## 8. Implement `read` (optional, for recovery and adoption)

```ts
read: Effect.fnUntraced(function* ({ output }) {
  if (!output?.productId) return undefined;
  const product = yield* Effect.tryPromise(() =>
    stripe.products.retrieve(output.productId),
  ).pipe(Effect.catchAll(() => Effect.succeed(undefined)));
  if (!product) return undefined;
  return { productId: product.id, created: product.created };
}),
```

For ownership-aware reads, brand foreign attributes with `Unowned`:

```ts
import { Unowned } from "alchemy/AdoptPolicy";

read: Effect.fnUntraced(function* ({ id, olds }) {
  const live = yield* lookupByName(olds.name);
  if (!live) return undefined;
  const attrs = { productId: live.id, created: live.created };
  return ownsResource(id, live.tags) ? attrs : Unowned(attrs);
}),
```

The engine routes plain attrs → silent adoption, `Unowned(attrs)` → fail with `OwnedBySomeoneElse` unless `--adopt` (or `adopt(true)` wrapping the deploy).

## 9. Implement an AuthProvider

Plug into Alchemy's profile/login system. `AuthProvider` has five methods: `configure`, `login`, `logout`, `prettyPrint`, `read`.

```ts
// src/stripe/AuthProvider.ts
import { AuthProviderLayer } from "alchemy/Auth/AuthProvider";

export type StripeAuthConfig =
  | { method: "env" }
  | { method: "stored" };

export type StripeStoredCredentials = { apiKey: string };

export type StripeResolvedCredentials = {
  apiKey: Redacted.Redacted<string>;
  source: { type: StripeAuthConfig["method"] };
};

export const STRIPE_AUTH_PROVIDER_NAME = "Stripe";
const STORAGE_KEY = "stripe-stored";

export const StripeAuth = AuthProviderLayer<
  StripeAuthConfig,
  StripeResolvedCredentials
>()(STRIPE_AUTH_PROVIDER_NAME, {
  configure: (profileName, ctx) => configureCredentials(profileName, ctx),
  login: (profileName, config) => login(profileName, config),
  logout: (profileName, config) => logout(profileName, config),
  prettyPrint: (profileName, config) => prettyPrint(profileName, config),
  read: (profileName, config) => resolveCredentials(profileName, config),
});
```

`configure` runs once when the user runs `alchemy login`. Use `alchemy/Util/Clank` for terminal prompts:

```ts
import * as Clank from "alchemy/Util/Clank";
import { writeCredentials } from "alchemy/Auth/Credentials";
import { retryOnce } from "alchemy/Auth/Env";

const configureCredentials = (profileName: string, ctx: ConfigureContext) =>
  Effect.gen(function* () {
    if (ctx.ci) return { method: "env" as const };
    const method = yield* Clank.select({
      message: "Stripe authentication method",
      options: [
        { value: "env", label: "Environment Variables", hint: "STRIPE_API_KEY" },
        { value: "stored", label: "API Key", hint: "stored in ~/.alchemy/credentials" },
      ],
    }).pipe(retryOnce);
    // ... handle each method ...
  });
```

`Clank` provides `select`, `text`, `password`, `confirm`, `multiselect`, `success`, `info`, `warn`, `error`, `openUrl`.

`read` is called every deploy to materialize credentials:

```ts
import { getEnvRedacted } from "alchemy/Auth/Env";
import { readCredentials } from "alchemy/Auth/Credentials";

const resolveCredentials = (profileName: string, config: StripeAuthConfig) =>
  Match.value(config).pipe(
    Match.when({ method: "env" }, () =>
      Effect.gen(function* () {
        const apiKey = yield* getEnvRedacted("STRIPE_API_KEY");
        if (!apiKey) return yield* new AuthError({ message: "..." });
        return { apiKey, source: { type: "env" as const } };
      }),
    ),
    Match.when({ method: "stored" }, () =>
      readCredentials<StripeStoredCredentials>(profileName, STORAGE_KEY).pipe(
        Effect.flatMap((creds) =>
          creds == null
            ? Effect.fail(new AuthError({ message: "..." }))
            : Effect.succeed({
                apiKey: Redacted.make(creds.apiKey),
                source: { type: "stored" as const },
              }),
        ),
      ),
    ),
    Match.exhaustive,
  );
```

## 10. Bridge AuthProvider → Credentials

```ts
// src/stripe/Credentials.ts (additions)
import { getAuthProvider } from "alchemy/Auth/AuthProvider";
import { ALCHEMY_PROFILE, Profile } from "alchemy/Auth/Profile";

export const fromAuthProvider = () =>
  Layer.effect(
    StripeCredentials,
    Effect.gen(function* () {
      const profile = yield* Profile;
      const auth = yield* getAuthProvider<
        StripeAuthConfig,
        StripeResolvedCredentials
      >(STRIPE_AUTH_PROVIDER_NAME);
      const profileName = yield* ALCHEMY_PROFILE;
      const ci = yield* Config.boolean("CI").pipe(Config.withDefault(false));
      const config = yield* profile.loadOrConfigure(auth, profileName, { ci });
      const creds = yield* auth.read(profileName, config as StripeAuthConfig);
      return { apiKey: creds.apiKey };
    }),
  );
```

## 11. Bundle into `providers()`

```ts
import * as Provider from "alchemy/Provider";
import * as Layer from "effect/Layer";

export class Providers extends Provider.ProviderCollection<Providers>()(
  "Stripe",
) {}

export const providers = () =>
  Layer.effect(
    Providers,
    Provider.collection([StripeProduct]),
  ).pipe(
    Layer.provide(StripeProductProvider()),
    Layer.provideMerge(fromAuthProvider()),
    Layer.provideMerge(StripeAuth),
  );
```

`Layer.provide` is private (wires providers into the collection); `Layer.provideMerge` keeps the auth machinery in scope for the host stack.

Usage:

```ts
import * as Stripe from "./src/stripe";

export default Alchemy.Stack(
  "MyApp",
  { providers: Stripe.providers() },
  Effect.gen(function* () {
    const pro = yield* Stripe.Product("Pro", {
      name: "Pro plan",
      description: "Everything in Free, plus...",
    });
    return { productId: pro.productId };
  }),
);
```

## 12. Test the lifecycle

```ts
import * as Test from "alchemy/Test/Vitest";
import * as StripeProvider from "../src/stripe";

const { test } = Test.make({ providers: StripeProvider.providers() });

test.provider(
  "create, update, delete a product",
  (stack) => Effect.gen(function* () {
    const created = yield* stack.deploy(
      Effect.gen(function* () {
        return yield* StripeProvider.Product("TestProduct", {
          name: "v1",
          description: "first version",
        });
      }),
    );
    expect(created.productId).toBeDefined();

    const updated = yield* stack.deploy(
      Effect.gen(function* () {
        return yield* StripeProvider.Product("TestProduct", {
          name: "v2",
          description: "first version",
        });
      }),
    );
    expect(updated.productId).toBe(created.productId);

    yield* stack.destroy();
  }),
);
```

To verify replacement, change a `stables` field (or a field your `diff` flags as `replace`) and assert `updated.productId !== created.productId`.

## Reference implementations

- [`Axiom/VirtualField.ts`](https://github.com/sam-goodwin/alchemy-effect/blob/main/packages/alchemy/src/Axiom/VirtualField.ts) — minimal CRUD with `diff` and `read`
- [`Cloudflare/R2/Bucket.ts`](https://github.com/sam-goodwin/alchemy-effect/blob/main/packages/alchemy/src/Cloudflare/R2/Bucket.ts) — production provider with bindings and replace semantics
- [`Axiom/AuthProvider.ts`](https://github.com/sam-goodwin/alchemy-effect/blob/main/packages/alchemy/src/Axiom/AuthProvider.ts) — full AuthProvider with `env` + `stored`
- [`Axiom/Credentials.ts`](https://github.com/sam-goodwin/alchemy-effect/blob/main/packages/alchemy/src/Axiom/Credentials.ts) — `fromAuthProvider()` bridge layer
- [`Axiom/Providers.ts`](https://github.com/sam-goodwin/alchemy-effect/blob/main/packages/alchemy/src/Axiom/Providers.ts) — bundling a `providers()` layer
