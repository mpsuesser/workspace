# Resource

A **Resource** represents a cloud entity managed by Alchemy — a bucket, database, queue, function, DNS record, or anything else with a reconcile/delete lifecycle.

## Declaring a Resource

Resources are declared with a **logical ID** and optional **input properties**:

```ts
const bucket = yield* Cloudflare.R2Bucket("Bucket");
const queue = yield* AWS.SQS.Queue("Jobs", {
  fifoQueue: true,
});
```

The logical ID (`"Bucket"`, `"Jobs"`) is stable across deploys. It identifies the resource within the stack and keys its state.

## Input Properties and Output Attributes

Every resource has two sides:

- **Input Properties** — the desired configuration you pass in (e.g. `fifoQueue: true`)
- **Output Attributes** — the values produced after creation (e.g. `queueUrl`, `queueArn`)

Output attributes are exposed as lazy [`Output`](./outputs.md) references that resolve once the upstream resource has been created:

```ts
const bucket = yield* Cloudflare.R2Bucket("Bucket");
bucket.bucketName; // Output<string>
```

See [Inputs and Outputs](./outputs.md) for the full operator set (`map`, `mapEffect`, `all`, `interpolate`, `ref`).

## Resources are Effects

A resource constructor like `Cloudflare.R2Bucket("Bucket")` returns an `Effect`. Calling it does not talk to the cloud. `yield*`-ing it inside a [Stack](./stack.md) doesn't either — it just **registers the resource on the stack** and hands back a typed [`Output`](./outputs.md) reference:

```ts
// 1. Build the Effect — no API calls, no state mutation.
const Bucket = Cloudflare.R2Bucket("Bucket");

// 2. Register it on the stack — still no API calls;
//    alchemy is just collecting the desired-state graph.
export default Alchemy.Stack(
  "MyApp",
  { providers: Cloudflare.providers() },
  Effect.gen(function* () {
    const bucket = yield* Bucket;
    return { name: bucket.bucketName };
  }),
);
```

Cloud APIs are only touched later, when `alchemy deploy` runs the collected graph through plan and apply. See [Resource Lifecycle](./resource-lifecycle.md).

### Sharing across files

Since a declaration is a value, you can `export` it and import it anywhere — handlers, layers, other resources:

```ts
// src/bucket.ts
export const Bucket = Cloudflare.R2Bucket("Bucket");
```

```ts
// alchemy.run.ts
import { Bucket } from "./src/bucket.ts";

export default Alchemy.Stack(
  "MyApp",
  { providers: Cloudflare.providers() },
  Effect.gen(function* () {
    yield* Bucket;
  }),
);
```

Importing the same `Bucket` from multiple files is safe. Alchemy keys resources by their fully qualified name, so even if two modules `yield*` it, it registers once.

## Referencing existing resources

Every resource constructor exposes a static `ref` returning a typed reference to a resource that has been deployed elsewhere — another stage of the same stack, or a different stack entirely:

```ts
const project = yield* Neon.Project.ref("app-db", {
  stage: "staging",
});
// project: Neon.Project — same shape, same typed attributes
```

Lookup is keyed by `{ stack, stage, id }`; both options default to the current stack/stage. It's lazy (no cloud calls at declaration), typed (same interface as a freshly deployed resource), and strict (fails fast with `InvalidReferenceError` when the target is missing).

A typical pattern: PR-preview stages reference long-lived `staging` resources instead of provisioning their own:

```ts
const project = stage.startsWith("pr-")
  ? yield* Neon.Project.ref("app-db", { stage: "staging" })
  : yield* Neon.Project("app-db", { region: "aws-us-east-1" });
```

See the [Shared database across stages](../guides/shared-database.md) guide for the canonical walkthrough.

## Logical ID vs physical name

The first argument to a resource constructor is its **logical ID** — a name you choose to identify the resource within its stack:

```ts
const Bucket = Cloudflare.R2Bucket("Bucket"); // logical ID: "Bucket"
const Jobs = AWS.SQS.Queue("Jobs");           // logical ID: "Jobs"
```

The logical ID is how alchemy tracks the resource in state across deploys:

- **Stable across deploys** — keep the same ID and alchemy keeps updating the same underlying cloud resource.
- **Stable across renames** — change the variable name, change the TypeScript class, move the file; as long as the logical ID stays the same, alchemy still recognizes it.
- **Rename = replace** — change the logical ID and alchemy treats it as a new resource (and deletes the old one on the next deploy).

Logical IDs only need to be unique **within a stack**.

The **physical name** is what the cloud actually sees — `myapp-dev_sam-bucket-a3f1` on R2, an ARN suffix on AWS, etc. Alchemy generates it from:

```
{stack-name}-{stage}-{logical-id}-{instance-id}
   "myapp"    "dev_sam"  "Bucket"     "a3f1"
```

The instance ID is a short deterministic suffix tied to a specific instance of the resource. While the resource lives, the instance ID stays the same, so re-running create finds the existing resource instead of duplicating it.

The whole scheme means:

- **Stages don't collide** — `dev_sam` and `prod` produce different physical names from the same code.
- **Creates are idempotent** — same logical ID + same instance ID = same physical name on retry.
- **State can recover** — if persistence fails, alchemy can re-run create and find the existing cloud resource.

The instance ID is the part that **does** change when a resource is replaced.

## Replacement

Some property changes can't be applied in place. Changing a DynamoDB table's partition key, for example, can't be done on a live table — it must be re-created.

Before:

```ts
const Jobs = DynamoDB.Table("Jobs", {
  partitionKey: "id",
  attributes: { id: "S" },
});
```

After:

```ts
const Jobs = DynamoDB.Table("Jobs", {
  partitionKey: "tenantId",
  attributes: { tenantId: "S" },
});
```

The logical ID (`"Jobs"`) doesn't change, but the **instance ID does** — and so does the physical name:

```
before:  myapp-prod-jobs-a3f1
after:   myapp-prod-jobs-9b2c
```

When the next plan runs, alchemy:

1. Creates a new table with the new instance ID (and physical name)
2. Updates downstream resources to reference the new one
3. Deletes the old table

The resource's [provider](./provider.md) decides which property changes trigger replacement vs in-place update (via `diff`).

## Defining your own Resource type

A resource is just a typed Effect. To support a new cloud or third-party API, declare a `Resource` type with its input props and output attributes — then implement its provider as a `Layer`. The same engine plans, deploys, and destroys it.

See [Writing a Custom Resource Provider](../guides/custom-provider.md) for a step-by-step walkthrough.

```ts
// 1. Declare the type + constructor.
export type StripeProduct = Resource<
  "Stripe.Product",
  { name: string; price: number }, // input props
  { productId: string; priceId: string } // output attrs
>;

export const StripeProduct = Resource<StripeProduct>("Stripe.Product");

// 2. Use it like any built-in resource.
const Pro = yield* StripeProduct("Pro", {
  name: "Pro plan",
  price: 2900,
});
// ^? typed Pro.productId, Pro.priceId
```

- **Inputs & outputs are typed** — Props you pass in, attributes the provider returns. Both fully typed, both checked at the call site.
- **Compose with built-in providers** — Merge your provider Layer with `Cloudflare.providers()` or `AWS.providers()`. One stack, mixed clouds.

The lifecycle hooks the provider implements — `reconcile`, `delete`, `diff`, `read` — are documented in [Provider](./provider.md).

## The resource graph

Passing an `Output` from one resource as input to another draws an edge in the dependency graph:

```ts
const Bucket = yield* Cloudflare.R2Bucket("Bucket");
const Sessions = yield* Cloudflare.KVNamespace("Sessions");
const Queue = yield* AWS.SQS.Queue("Queue", {
  name: Output.interpolate`${Bucket.bucketName}-events`,
});
const Worker = yield* Cloudflare.Worker("Worker", {
  main: import.meta.path,
  bindings: { Bucket, Sessions, Queue },
});
```

Alchemy reads the Outputs in each resource's props and builds a DAG, then deploys in topological order:

1. `Bucket` and `Sessions` have no dependencies → created **in parallel**.
2. `Queue` depends on `Bucket.bucketName` → waits for `Bucket`, then created.
3. `Worker` depends on all three → created last, after every upstream Output has resolved.

Cycles (Worker A binds Worker B, Worker B binds Worker A) are handled with a two-phase plan — see [Circular Bindings](../guides/circular-bindings.md).

## Circular references

Real systems have cycles. Two Workers that call each other. A Lambda that invokes another Lambda. Tables that reference each other. Most IaC engines reject these — alchemy resolves them by splitting each [Platform](./platform.md) resource into two pieces:

- A **class** that acts as the Tag (the identity / declaration)
- A **`.make(...)`** Layer that supplies the runtime implementation

The class can be referenced before its implementation exists, so two Workers can name each other in their handlers without a hard ordering constraint.

```ts
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";
import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse";

// The class is the Tag — used as a typed identifier elsewhere.
export class MyWorker extends Cloudflare.Worker<MyWorker>()("MyWorker", {
  main: import.meta.path,
}) {}

// The default export is the Layer — the runtime implementation.
export default MyWorker.make(
  Effect.gen(function* () {
    return {
      fetch: Effect.gen(function* () {
        return HttpServerResponse.text("hello");
      }),
    };
  }),
);
```

To compose Workers that reference each other, provide both Layers to your Stack with `Effect.provide`. See [Circular Bindings](../guides/circular-bindings.md) for a complete A↔B example.
