# Writing Style

Consistent style makes skills easier to read and reduces cognitive load.

## Use Imperative Voice

Always write instructions in imperative/infinitive form:

```markdown
# GOOD (imperative)
Create a new component.
Run the migration script.
Add the dependency to package.json.

# BAD (passive/suggestive)
You should create a new component.
A new component should be created.
The migration script needs to be run.
Consider adding the dependency.
```

## Be Direct

State what to do, not what could be done:

```markdown
# GOOD
Use `Schema.TaggedStruct` for domain types.

# BAD
You might want to consider using Schema.TaggedStruct,
which could be a good choice for domain types.
```

## Omit Needless Words

Every word should earn its place:

```markdown
# GOOD
Handle errors with `catchTag`.

# BAD
In order to properly handle errors that may occur
during execution, you should make use of the catchTag
function which is provided by Effect.
```

## Structure for Scanning

Use formatting to enable quick scanning:

### Headers Over Prose

```markdown
# GOOD
## Pattern: Retry with Backoff
[content]

## Pattern: Circuit Breaker
[content]

# BAD
Now let's talk about retry patterns. First, there's
retry with backoff. [content] Another pattern is
the circuit breaker. [content]
```

### Lists Over Paragraphs

```markdown
# GOOD
Requirements:
- Node.js 18+
- pnpm 8+
- TypeScript 5+

# BAD
You'll need to have Node.js version 18 or higher
installed, along with pnpm version 8 or higher.
TypeScript 5 or higher is also required.
```

### Tables for Comparisons

```markdown
# GOOD
| Option | When to Use |
|--------|-------------|
| KV | Simple key-value |
| D1 | SQL queries |

# BAD
Use KV when you need simple key-value storage.
If you need SQL queries, use D1 instead.
```

## Code Examples

### Show, Don't Describe

```markdown
# GOOD
\`\`\`typescript
const user = yield* UserService.findById(id)
\`\`\`

# BAD
Call the findById method on UserService, passing the id,
and yield the result to get the user.
```

### One Concept Per Example

```markdown
# GOOD
// Basic usage
const value = yield* Effect.succeed(42)

// With error handling
const value = yield* Effect.try(() => riskyOperation())

# BAD
// Here's everything at once
const value = yield* Effect.try(() => riskyOperation()).pipe(
  Effect.retry(Schedule.exponential("100 millis")),
  Effect.timeout("5 seconds"),
  Effect.tap((v) => Console.log(`Got: ${v}`)),
  Effect.catchTag("TimeoutError", () => Effect.succeed(defaultValue))
)
```

## Avoid

- **Hedging**: "might", "could", "perhaps", "it's possible"
- **Filler**: "basically", "actually", "really", "very"
- **Redundancy**: "in order to", "the fact that", "it is important to note"
- **Meta-commentary**: "as mentioned above", "we will now discuss"
- **Apologies**: "unfortunately", "sadly"
