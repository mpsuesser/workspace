# Writing Code Examples

Code examples are the core of most skills. Make them excellent.

## Requirements

### Complete
Include all imports, types, and context needed to understand:

```typescript
// GOOD
import { Effect, Console } from "effect"

const program = Effect.gen(function* () {
  yield* Console.log("Hello")
})

Effect.runPromise(program)

// BAD (missing context)
const program = Effect.gen(function* () {
  yield* Console.log("Hello")
})
```

### Runnable
Examples should work if copy-pasted (with appropriate setup):

```typescript
// GOOD - can verify this works
import { Schema } from "effect"

const User = Schema.Struct({
  id: Schema.String,
  name: Schema.String
})

const result = Schema.decodeUnknownSync(User)({ id: "1", name: "Alice" })
console.log(result) // { id: "1", name: "Alice" }
```

### Focused
One concept per example. Use `declare` to hide irrelevant setup:

```typescript
// Demonstrating: Error recovery with catchTag
declare const fetchUser: (id: string) => Effect.Effect<User, NetworkError | NotFoundError>

const program = fetchUser("123").pipe(
  Effect.catchTag("NotFoundError", () => Effect.succeed(defaultUser))
)
```

## Formatting Patterns

### Side-by-Side Comparison

```typescript
// WRONG
if (state._tag === "Loading") {
  return <Spinner />
}

// RIGHT  
Match.typeTags<State>()({
  Loading: () => <Spinner />,
  Ready: ({ data }) => <Content data={data} />,
  Error: ({ error }) => <ErrorDisplay error={error} />
})
```

### Progressive Complexity

```typescript
// Basic
const simple = Schema.String

// With constraints
const constrained = Schema.String.pipe(
  Schema.minLength(1),
  Schema.maxLength(100)
)

// Full pattern
const robust = Schema.String.pipe(
  Schema.minLength(1),
  Schema.maxLength(100),
  Schema.brand("Username")
)
```

### Inline Comments for Key Points

```typescript
const program = Effect.gen(function* () {
  const config = yield* Config           // Dependency injection
  const data = yield* fetchData(config)  // May fail with NetworkError
  yield* validate(data)                  // May fail with ValidationError
  return data
})
```

## Anti-Patterns in Examples

### Too Abstract
```typescript
// BAD - what does this mean in practice?
// "Use the service pattern for dependencies"
```

### Missing Error Context
```typescript
// BAD - what errors can this throw?
const data = yield* fetchData()

// GOOD - explicit about failure modes
const data = yield* fetchData().pipe(
  Effect.mapError((e) => new FetchError({ url, cause: e }))
)
```

### Framework Soup
```typescript
// BAD - mixing concerns
const Component = () => {
  const [state, setState] = useState()
  const data = useQuery()
  const mutation = useMutation()
  // ... 50 more lines
}

// GOOD - focus on the pattern being taught
declare const useUserQuery: () => QueryResult<User>

const Component = () => {
  const { data, isLoading } = useUserQuery()
  // Pattern demonstration only
}
```
