# Deploy a Lambda Function

In this part you'll stand up the smallest piece of compute AWS offers — a single **Lambda Function** with a public **Function URL** — and grow it across the rest of this section into S3, DynamoDB, SQS, and Kinesis.

## Prerequisites

- [Bun](https://bun.sh) (recommended) or Node.js 22+.
- An AWS account with credentials available locally (an SSO profile, `~/.aws/credentials`, or `AWS_*` environment variables).
- The AWS profile you want to use exported as `AWS_PROFILE` (or `default` will be used).

## Bootstrap the project

```sh
mkdir my-app && cd my-app && bun init -y
bun add alchemy effect @effect/platform-bun
```

## Create the Stack

```ts
import * as Alchemy from "alchemy";
import * as AWS from "alchemy/AWS";
import * as Effect from "effect/Effect";

export default Alchemy.Stack(
  "MyApp",
  {
    providers: AWS.providers(),
    state: Alchemy.localState(),
  },
  Effect.gen(function* () {
    return {};
  }),
);
```

`providers: AWS.providers()` registers every AWS resource and IAM policy binding that ships with Alchemy, and resolves credentials from the ambient `AWS_PROFILE` (defaulting to `default`).

`state: Alchemy.localState()` stores deploy state under `.alchemy/` next to your code — good enough for local iteration; remote state for CI is covered later.

## Declare a Lambda Function

A Lambda Function in Alchemy is a class. Create `src/api.ts`:

```ts
import * as AWS from "alchemy/AWS";
import * as Effect from "effect/Effect";

export default class Api extends AWS.Lambda.Function<Api>()(
  "Api",
  { main: import.meta.filename },
  Effect.gen(function* () {
    return {};
  }),
) {}
```

The `<Api>` type argument plus the empty `()` is a one-time bit of ceremony — it lets TypeScript reason about `Api` as a typed handle.

`main: import.meta.filename` tells Alchemy this same file is the bundle entrypoint. At deploy time it'll be bundled with Rolldown into a zip and uploaded as the function's code.

## Serve HTTP from a Function URL

Add a `fetch` field — Alchemy treats anything returned from the `Effect.gen` block as the runtime API, and `fetch` specifically is wired up to handle incoming HTTP requests:

```ts
import * as AWS from "alchemy/AWS";
import * as Effect from "effect/Effect";
import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse";

export default class Api extends AWS.Lambda.Function<Api>()(
  "Api",
  { main: import.meta.filename },
  Effect.gen(function* () {
    return {
      fetch: Effect.succeed(HttpServerResponse.text("Hello from Lambda!")),
    };
  }),
) {}
```

`HttpServerResponse.text(...)` is the same `effect/unstable/http` API used everywhere else — Alchemy adapts it to the Lambda event envelope under the hood.

## Expose a public URL

Set `url: true` on the props to ask AWS for a public **Function URL** — no API Gateway, no auth, just a public HTTPS endpoint:

```ts
export default class Api extends AWS.Lambda.Function<Api>()(
  "Api",
  { main: import.meta.filename, url: true },
  Effect.gen(function* () {
    return {
      fetch: Effect.succeed(HttpServerResponse.text("Hello from Lambda!")),
    };
  }),
) {}
```

The resolved `Api` resource will now expose a `functionUrl` field carrying that endpoint.

## Customize per stage

Lambda has knobs you'll want to tune per stage — memory, timeout, log retention. Swap the static props object for `Stack.useSync`:

```ts
import { Stack } from "alchemy/Stack";

export default class Api extends AWS.Lambda.Function<Api>()(
  "Api",
  Stack.useSync((stack) => ({
    main: import.meta.filename,
    url: true,
    memory: stack.stage === "prod" ? 1024 : 512,
  })),
  Effect.gen(function* () {
    return {
      fetch: Effect.succeed(HttpServerResponse.text("Hello from Lambda!")),
    };
  }),
) {}
```

`Stack.useSync` is the synchronous accessor for any value in the surrounding Effect context — handy for stack-level config like `stage`, `appName`, or anything else you'd want to vary per environment.

## Wire the function into the Stack

```ts
import * as Alchemy from "alchemy";
import * as AWS from "alchemy/AWS";
import * as Effect from "effect/Effect";
import Api from "./src/api.ts";

export default Alchemy.Stack(
  "MyApp",
  {
    providers: AWS.providers(),
    state: Alchemy.localState(),
  },
  Effect.gen(function* () {
    const api = yield* Api;
    return { url: api.functionUrl };
  }),
);
```

Yielding `Api` returns the resolved Lambda outputs — the function ARN, role ARN, log group, and the public Function URL we asked for with `url: true`.

## Deploy

Alchemy bundles `src/api.ts` with Rolldown, packages it into a zip, creates the IAM execution role, uploads the function, and provisions the Function URL. The first deploy takes a moment because of role propagation; subsequent deploys are seconds.

## Test it

```ts
import * as Alchemy from "alchemy";
import * as AWS from "alchemy/AWS";
import * as Test from "alchemy/Test/Bun";
import { expect } from "bun:test";
import * as Effect from "effect/Effect";
import * as HttpClient from "effect/unstable/http/HttpClient";
import Stack from "../alchemy.run.ts";

const { test, beforeAll, deploy } = Test.make({
  providers: AWS.providers(),
  state: Alchemy.localState(),
});

const stack = beforeAll(deploy(Stack));

test(
  "Api responds over Function URL",
  Effect.gen(function* () {
    const { url } = yield* stack;
    const response = yield* HttpClient.get(url);
    expect(yield* response.text).toBe("Hello from Lambda!");
  }),
);
```

```sh
bun test test/integ.test.ts
```

Next: [add an S3 Bucket](./s3.md) and bind read/write operations into the function.
