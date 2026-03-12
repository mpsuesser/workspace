# Decision Trees

Decision trees help the AI make choices, not just follow instructions. They're the key differentiator between documentation and expertise.

## Why Decision Trees

Without decision trees:
> "Here are 6 storage options: KV, D1, R2, Durable Objects, Queues, Vectorize"

With decision trees:
```
Need storage?
├─ Simple key-value, global reads → KV
├─ SQL queries, relational data → D1
├─ Large files, S3-compatible → R2
├─ Per-user state, coordination → Durable Objects
├─ Async job processing → Queues
└─ Vector embeddings, similarity → Vectorize
```

The tree encodes **when** to use each option, not just **what** they are.

## Anatomy of a Good Tree

```
[User's goal as a question]?
├─ [Requirement/constraint] → [destination]
├─ [Requirement/constraint] → [destination]
├─ [Requirement/constraint] → [destination]
└─ [Fallback/default] → [destination]
```

### Rules

1. **Start with goal, not product** - "Need storage?" not "Which storage product?"
2. **Branch on requirements** - Things the user knows about their use case
3. **Terminate at specific destinations** - File paths, not categories
4. **Include a fallback** - For edge cases

## Examples

### Good: Goal-Oriented

```
Need to run code?
├─ Serverless functions at the edge → workers/
├─ Full-stack web app with Git deploys → pages/
├─ Stateful coordination/real-time → durable-objects/
├─ Long-running multi-step jobs → workflows/
└─ Scheduled tasks (cron) → cron-triggers/
```

### Bad: Product-Oriented

```
Which compute product?
├─ Workers → workers/
├─ Pages → pages/
├─ Durable Objects → durable-objects/
```

This doesn't help - the user already needs to know the products to choose.

### Good: Multi-Level

```
Need a database?
├─ Key-value access pattern
│   ├─ Global, eventually consistent → kv/
│   └─ Strong consistency, single region → durable-objects/
├─ Relational/SQL needed
│   ├─ Serverless, Cloudflare-native → d1/
│   └─ Existing Postgres/MySQL → hyperdrive/
└─ Vector/similarity search → vectorize/
```

## Integration with Router

In comprehensive skills, the SKILL.md is mostly decision trees:

```markdown
## Task Router

**What are you trying to do?**

[Tree 1: Running code]

[Tree 2: Storing data]

[Tree 3: Networking]

[Tree 4: Security]
```

Each tree covers a category of user goals. Together they cover the platform.

## Common Mistakes

### Too Many Levels
```
Need X?
├─ A
│   ├─ A1
│   │   ├─ A1a → ...
│   │   └─ A1b → ...
```

More than 2-3 levels gets confusing. Flatten or split into separate trees.

### Overlapping Branches
```
Need storage?
├─ Fast reads → KV
├─ Global distribution → KV  ← overlaps!
├─ Key-value → KV            ← overlaps!
```

Branches should be mutually exclusive based on requirements.

### Missing Context
```
├─ Use this for performance → workers/
```

"Performance" compared to what? Be specific about the requirement.
