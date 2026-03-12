# Writing Skill Content

Effective skill content is concrete, opinionated, and actionable.

## Core Principles

### 1. Be Concrete

Show working code, not descriptions of code:

```typescript
// GOOD: Complete, runnable
import { Schema } from "effect"

export const User = Schema.TaggedStruct("User", {
  id: Schema.String,
  email: Schema.String
})

// BAD: Abstract description
// "Use Schema.TaggedStruct for your domain types"
```

### 2. Be Opinionated

State what TO DO and what NOT to do. Skills encode best practices:

```typescript
// DO: Pattern matching with Match.typeTags
const result = Match.typeTags<State>()({
  Loading: () => "loading",
  Ready: ({ value }) => value,
  Error: ({ error }) => error.message
})

// DON'T: Manual tag checks
if (state._tag === "Loading") { ... }
else if (state._tag === "Ready") { ... }
```

### 3. Show Transformations

Before (wrong) → After (correct):

```typescript
// BEFORE (wrong)
try {
  const data = JSON.parse(input)
} catch (e) {
  throw new Error("Parse failed")
}

// AFTER (correct)
const data = yield* Schema.decodeUnknown(MySchema)(input).pipe(
  Effect.mapError((e) => new ParseError({ cause: e }))
)
```

### 4. Include Imports

Every example should be runnable without guessing imports:

```typescript
import { Effect, Schema, Match } from "effect"
import * as NodeFS from "@effect/platform-node/NodeFileSystem"
```

### 5. Use `declare` for Context

When the pattern is the focus, not the setup:

```typescript
declare const config: Config
declare const MySchema: Schema.Schema<MyType>

// Pattern being demonstrated
const result = Schema.decodeSync(MySchema)(input)
```

## Content Types

| Type | Purpose | Example |
|------|---------|---------|
| Patterns | What TO do | "Use Effect.gen for sequential operations" |
| Anti-patterns | What NOT to do | "Avoid nested Effect.flatMap chains" |
| Gotchas | Hidden pitfalls | "Response bodies can only be read once" |
| Decisions | How to choose | "KV vs D1 vs R2" decision tree |

## See Also

- [examples.md](./examples.md) - Writing code examples
- [../decision-trees/](../decision-trees/) - Building decision trees
- [../gotchas/writing.md](../gotchas/writing.md) - Writing gotchas
