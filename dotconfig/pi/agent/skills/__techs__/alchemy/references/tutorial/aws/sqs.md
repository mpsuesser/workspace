# Send & Consume SQS Messages

DynamoDB Streams notify you of **table changes**. Sometimes you want a more general-purpose mailbox — anything you can serialize to JSON, dropped into a queue, processed asynchronously somewhere else. That's what **SQS** is for. In this part you'll add a **Queue**, send messages to it from the Lambda you've been building, and stand up a **second Lambda** that consumes them.

## Add a Queue

```ts
import * as AWS from "alchemy/AWS";
import * as DynamoDB from "alchemy/AWS/DynamoDB";
import * as SQS from "alchemy/AWS/SQS";

Effect.gen(function* () {
  const bucket = yield* S3.Bucket("Blobs");
  const table = yield* DynamoDB.Table("Items", { /* ... */ });
  const queue = yield* SQS.Queue("Jobs");
  // ... existing bindings ...
});
```

Calling `SQS.Queue("Jobs")` provisions a standard queue with the defaults (4-day retention, 30-second visibility timeout, no delivery delay). FIFO queues, dead-letter targets, and the rest of the props can be supplied as a second argument when you need them.

## Bind SendMessage on the producer

`SQS.SendMessage.bind(queue)` returns a callable Effect — same shape as `S3.PutObject` or `DynamoDB.PutItem` — and quietly attaches `sqs:SendMessage` scoped to the queue ARN:

```ts
const putItem = yield* DynamoDB.PutItem.bind(table);
const sendMessage = yield* SQS.SendMessage.bind(queue);
```

Hook it into the existing `PUT /items/:id` route so every new record also drops a `job.created` message onto the queue:

```ts
if (request.method === "PUT") {
  const content = yield* request.text;
  yield* putItem({
    Item: {
      id: { S: id },
      content: { S: content },
    },
  });
  yield* sendMessage({
    MessageBody: JSON.stringify({
      type: "job.created",
      id,
      content,
    }),
  });
  return HttpServerResponse.empty({ status: 204 });
}
```

The producer also needs the runtime layer for `SendMessage`:

```ts
}).pipe(
  Effect.provide(
    Layer.mergeAll(
      AWS.Lambda.BucketEventSource,
      AWS.Lambda.TableEventSource,
      DynamoDB.GetItemLive,
      DynamoDB.PutItemLive,
      S3.PutObjectLive,
      S3.GetObjectLive,
      SQS.SendMessageLive,
    ),
  ),
),
```

## Stand up a consumer Lambda

Consumers live as their own Lambda Function. Create `src/worker.ts`:

```ts
import * as AWS from "alchemy/AWS";
import * as Effect from "effect/Effect";

export default class Worker extends AWS.Lambda.Function<Worker>()(
  "JobsWorker",
  { main: import.meta.filename },
  Effect.gen(function* () {
    return {};
  }),
) {}
```

This consumer doesn't need a Function URL — its only entrypoint is the SQS message poller AWS will configure for it.

## Share the queue definition

Both producer and consumer need to reference the same queue — the cleanest way to do that is to lift the declaration into a small shared module:

```ts
// src/queue.ts
import * as SQS from "alchemy/AWS/SQS";
export const Jobs = SQS.Queue("Jobs");
```

Now both functions can import `Jobs`. Update the producer:

```ts
import { Jobs } from "./queue.ts";
// ...
const queue = yield* Jobs;
```

## Resolve the queue in the consumer

```ts
import * as AWS from "alchemy/AWS";
import * as Effect from "effect/Effect";
import { Jobs } from "./queue.ts";

export default class Worker extends AWS.Lambda.Function<Worker>()(
  "JobsWorker",
  { main: import.meta.filename },
  Effect.gen(function* () {
    const queue = yield* Jobs;
    return {};
  }),
) {}
```

## Subscribe to messages

`SQS.messages(queue).subscribe(...)` is the consumer-side mirror of `notifications` / `stream`: a typed `Stream<SQSRecord>` you can compose with any operator:

```ts
import * as SQS from "alchemy/AWS/SQS";
import * as Console from "effect/Console";
import * as Stream from "effect/Stream";
import { Jobs } from "./queue.ts";

export default class Worker extends AWS.Lambda.Function<Worker>()(
  "JobsWorker",
  { main: import.meta.filename },
  Effect.gen(function* () {
    const queue = yield* Jobs;
    yield* SQS.messages(queue, { batchSize: 10 }).subscribe((stream) =>
      stream.pipe(
        Stream.runForEach((record) =>
          Console.log(`received: ${record.body}`),
        ),
      ),
    );
    return {};
  }),
) {}
```

That single `.subscribe(...)` call creates the Lambda event source mapping pointing at the queue and grants the function `sqs:ReceiveMessage`, `DeleteMessage`, and `GetQueueAttributes` on the queue ARN.

## Provide the runtime layer

```ts
import * as Layer from "effect/Layer";

  }).pipe(Effect.provide(AWS.Lambda.QueueEventSource)),
) {}
```

## Wire the worker into the Stack

```ts
import Api from "./src/api.ts";
import Worker from "./src/worker.ts";

export default Alchemy.Stack(
  "MyApp",
  { providers: AWS.providers(), state: Alchemy.localState() },
  Effect.gen(function* () {
    const api = yield* Api;
    yield* Worker;
    return { url: api.functionUrl };
  }),
);
```

Two functions deploy in parallel — `Api` (with `SendMessage` permissions) and `JobsWorker` (with `ReceiveMessage` permissions plus an event source mapping pointing at `Jobs`).

## Verify

Trigger a write, then watch the consumer's logs:

```sh
curl -X PUT --data 'hello queue' "$URL/items/q1"
bun alchemy logs JobsWorker --follow
```

Within a couple of seconds you'll see:

```
received: {"type":"job.created","id":"q1","content":"hello queue"}
```

## Bonus: process records in parallel

`Stream.mapEffect` accepts a `concurrency` option, so you can fan out per-record work without rewriting anything:

```ts
stream.pipe(
  Stream.mapEffect(
    (record) => doSomethingWith(record.body).pipe(Effect.orDie),
    { concurrency: 4 },
  ),
  Stream.runDrain,
);
```

Up to 4 records process concurrently, and the event source mapping won't ack them until the stream completes.

## Bonus: forward a stream to SQS with `QueueSink`

`SendMessage.bind(queue)` is perfect for one-off sends from a request handler, but if you've got a `Stream` of payloads — DynamoDB change records, S3 notifications, anything — you don't want to call `sendMessage` per item. **`SQS.QueueSink`** is the sink-shaped counterpart: it consumes a `Stream<string>`, batches items into chunks of up to 10, and ships each chunk through `sqs:SendMessageBatch`.

```ts
import * as Stream from "effect/Stream";
import { Jobs } from "./queue.ts";

const queue = yield* Jobs;
const putItem = yield* DynamoDB.PutItem.bind(table);
const sink = yield* SQS.QueueSink.bind(queue);

yield* DynamoDB.stream(table, {
  streamViewType: "NEW_AND_OLD_IMAGES",
}).process((stream) =>
  stream.pipe(
    Stream.map((record) =>
      JSON.stringify({
        eventName: record.eventName,
        keys: record.dynamodb.Keys,
        newImage: record.dynamodb.NewImage,
      }),
    ),
    Stream.run(sink),
  ),
);
```

`QueueSink.bind(queue)` grants `sqs:SendMessage` and `sqs:SendMessageBatch` on the queue ARN, then returns a `Sink<void, string, readonly string[]>` you compose with `Stream.run`. `QueueSinkLive` is implemented on top of `SendMessageBatch`, so split the merged layer into two tiers with `Layer.provideMerge`:

```ts
}).pipe(
  Effect.provide(
    Layer.provideMerge(
      Layer.mergeAll(
        AWS.Lambda.BucketEventSource,
        AWS.Lambda.TableEventSource,
        SQS.QueueSinkLive,
      ),
      Layer.mergeAll(
        DynamoDB.GetItemLive,
        DynamoDB.PutItemLive,
        S3.PutObjectLive,
        S3.GetObjectLive,
        SQS.SendMessageBatchLive,
        SQS.SendMessageBatchPolicyLive,
      ),
    ),
  ),
),
```

Next: [stream higher-volume records through Kinesis](./kinesis.md).
