---
name: effect-error-handling
description: Implement typed error handling in Effect using Schema.TaggedErrorClass, catchTag/catchTags, and recovery patterns. Use this skill when working with Effect error channels, handling expected failures, or designing error recovery strategies.
---

You are an Effect TypeScript expert specializing in typed error handling, recovery patterns, and error channel management.

## Effect Documentation Access

For comprehensive Effect documentation, view the Effect v4 repository at `.references/effect-v4/`

Reference this for:
- Schema.TaggedErrorClass and error class creation
- Error handling combinators (catchTag, catchTags, catch)
- Error transformation and recovery patterns
- Defects vs error channel distinction

## Core Error Handling Philosophy

Effect distinguishes between two types of failures:

1. **Expected Errors (Error Channel)** - Business logic failures that should be handled
   - Type-safe and tracked in the effect signature: `Effect<A, E, R>`
   - Represented by the `E` type parameter
   - Handle with catchTag, catchTags, catch

2. **Unexpected Errors (Defects)** - Programming errors that indicate bugs
   - Not tracked in the type system
   - Result from programming mistakes (null refs, unhandled cases, assertions)
   - Usually should NOT be caught; use catchDefect only at boundaries

### When to Use Error Channel vs Defects

```typescript
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

declare const findUser: (userId: string) => Effect.Effect<User, UserNotFound>
declare const validatePassword: (user: User, password: string) => Effect.Effect<boolean, InvalidCredentials>
declare const database: { query: (sql: string, ...params: ReadonlyArray<unknown>) => Effect.Effect<unknown> }

interface User {
  readonly id: string
  readonly name: string
}

// CORRECT - Expected business failures in error channel
class UserNotFound extends Schema.TaggedErrorClass<UserNotFound>()(
  "UserNotFound",
  { userId: Schema.String, message: Schema.String }
) {}

class InvalidCredentials extends Schema.TaggedErrorClass<InvalidCredentials>()(
  "InvalidCredentials",
  { reason: Schema.String, message: Schema.String }
) {}

const authenticateUser = (userId: string, password: string): Effect.Effect<User, UserNotFound | InvalidCredentials> =>
  Effect.gen(function* () {
    const user = yield* findUser(userId) // Can fail with UserNotFound
    const valid = yield* validatePassword(user, password) // Can fail with InvalidCredentials
    return user
  })

// CORRECT - Programmer errors as defects (use Effect.die)
const assertPositive = (n: number): Effect.Effect<number> =>
  n > 0
    ? Effect.succeed(n)
    : Effect.die(new Error(`Expected positive number, got ${n}`))

// WRONG - Business failure as defect
const findUserWrong = (userId: string): Effect.Effect<User> =>
  Effect.gen(function* () {
    const user = yield* database.query("SELECT * FROM users WHERE id = ?", userId)
    if (!user) {
      yield* Effect.die(new Error("User not found")) // Should be in error channel!
    }
    return user as User
  })
```

## Creating Tagged Errors

Always use `Schema.TaggedErrorClass` with a `message` field.

### Basic Tagged Error

```typescript
import * as Schema from "effect/Schema"

// Simple error with message only
export class NetworkError extends Schema.TaggedErrorClass<NetworkError>()(
  "NetworkError",
  { message: Schema.String }
) {}

// Error with rich context
export class ValidationError extends Schema.TaggedErrorClass<ValidationError>()(
  "ValidationError",
  {
    field: Schema.String,
    message: Schema.String,
    value: Schema.optional(Schema.Unknown),
  }
) {}

// Error with optional cause
export class DatabaseError extends Schema.TaggedErrorClass<DatabaseError>()(
  "DatabaseError",
  {
    operation: Schema.String,
    message: Schema.String,
    cause: Schema.optional(Schema.Unknown),
  }
) {}

// Usage
const error = new ValidationError({
  field: "email",
  message: "Invalid email format",
  value: "not-an-email",
})
```

### Error with Reason Discriminator

For bindings that wrap a single external system, use a `reason` literal union to keep the error surface compact while remaining precise:

```typescript
import * as Schema from "effect/Schema"

export class ApiError extends Schema.TaggedErrorClass<ApiError>()(
  "ApiError",
  {
    reason: Schema.Literals([
      "BadRequest",
      "Unauthorized",
      "NotFound",
      "RateLimited",
      "ServerError",
      "Timeout"
    ]),
    message: Schema.String,
    statusCode: Schema.optional(Schema.Number),
    details: Schema.optional(
      Schema.Record(Schema.String, Schema.Unknown)
    ),
  }
) {}
```

### Error with Custom Properties

```typescript
import * as Schema from "effect/Schema"

export class HttpError extends Schema.TaggedErrorClass<HttpError>()(
  "HttpError",
  {
    status: Schema.Number,
    body: Schema.String,
    message: Schema.String,
  }
) {
  // Add computed properties
  get isClientError() {
    return this.status >= 400 && this.status < 500
  }

  get isServerError() {
    return this.status >= 500
  }
}

// Usage
const error = new HttpError({ status: 404, body: "Not Found", message: "Resource not found" })
error.isClientError // true
```

## Handling Errors by Tag

### catchTag - Single Error Type

```typescript
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

declare const createGuestUser: (id: string) => User

interface User {
  readonly id: string
  readonly name: string
}

class NotFound extends Schema.TaggedErrorClass<NotFound>()(
  "NotFound",
  { id: Schema.String, message: Schema.String }
) {}

class Unauthorized extends Schema.TaggedErrorClass<Unauthorized>()(
  "Unauthorized",
  { message: Schema.String }
) {}

//          Effect<User, NotFound | Unauthorized, Dependencies>
//      ↓
const getUser = (id: string): Effect.Effect<User, NotFound | Unauthorized> => Effect.fail(new NotFound({ id, message: `User ${id} not found` }))

// Handle single error type
//          Effect<User, Unauthorized, Dependencies>
//      ↓
const program = getUser("123").pipe(
  Effect.catchTag("NotFound", (error) =>
    // Return default user when not found
    Effect.succeed(createGuestUser(error.id))
  )
)
```

> **v4 Array Form:** In Effect v4, `catchTag` also accepts an array of tags to handle multiple error types with a single handler:
>
> ```typescript
> Effect.catchTag(["ParseError", "ReservedPortError"], (_) => Effect.succeed(3000))
> ```
>
> This is a concise alternative to `catchTags` when you want the same recovery logic for several error types. The caught error is typed as the union of the matched types.

### catchTags - Multiple Error Types

```typescript
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

interface Data {
  readonly data: ReadonlyArray<unknown>
  readonly cached?: boolean
  readonly timeout?: boolean
  readonly parseError?: boolean
}

class NetworkError extends Schema.TaggedErrorClass<NetworkError>()(
  "NetworkError",
  { message: Schema.String }
) {}

class TimeoutError extends Schema.TaggedErrorClass<TimeoutError>()(
  "TimeoutError",
  { message: Schema.String }
) {}

class ParseError extends Schema.TaggedErrorClass<ParseError>()(
  "ParseError",
  { input: Schema.String, message: Schema.String }
) {}

//          Effect<Data, NetworkError | TimeoutError | ParseError, Dependencies>
//      ↓
const fetchData = (): Effect.Effect<Data, NetworkError | TimeoutError | ParseError> => Effect.fail(new NetworkError({ message: "Connection refused" }))

// Handle multiple error types at once
//          Effect<Data, never, Dependencies>
//      ↓
const program = fetchData().pipe(
  Effect.catchTags({
    NetworkError: (_error) =>
      Effect.succeed({ data: [], cached: true }),

    TimeoutError: (_error) =>
      Effect.succeed({ data: [], timeout: true }),

    ParseError: (error) =>
      // Access error-specific fields
      Effect.logError(`Failed to parse: ${error.input}`).pipe(
        Effect.as({ data: [], parseError: true })
      )
  })
)
```

### catch - Handle All Errors

```typescript
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

declare const getDefaultResult: () => Result

interface Result {
  readonly value: string
}

class InvalidInput extends Schema.TaggedErrorClass<InvalidInput>()(
  "InvalidInput",
  { message: Schema.String }
) {}

class ProcessingError extends Schema.TaggedErrorClass<ProcessingError>()(
  "ProcessingError",
  { message: Schema.String }
) {}

//          Effect<Result, InvalidInput | ProcessingError, Dependencies>
//      ↓
const process = (): Effect.Effect<Result, InvalidInput | ProcessingError> => Effect.fail(new InvalidInput({ message: "Bad input" }))

// Handle all errors with single handler
//          Effect<Result, never, Dependencies>
//      ↓
const program = process().pipe(
  Effect.catch((error) =>
    // error is typed as: InvalidInput | ProcessingError
    Effect.logError(`Operation failed: ${error._tag}`).pipe(
      Effect.as(getDefaultResult())
    )
  )
)
```

## Exhaustive Error Handling with Match

Use Match for exhaustive error handling with compile-time guarantees:

```typescript
import * as Effect from "effect/Effect"
import * as Match from "effect/Match"
import * as Schema from "effect/Schema"

declare const dangerousOperation: () => Effect.Effect<string, AppError>

class ConnectionError extends Schema.TaggedErrorClass<ConnectionError>()(
  "ConnectionError",
  { message: Schema.String }
) {}

class AuthError extends Schema.TaggedErrorClass<AuthError>()(
  "AuthError",
  { message: Schema.String }
) {}

class DataError extends Schema.TaggedErrorClass<DataError>()(
  "DataError",
  { message: Schema.String }
) {}

type AppError = ConnectionError | AuthError | DataError

const handleError = (error: AppError): Effect.Effect<string> =>
  Match.value(error).pipe(
    Match.tag("ConnectionError", () =>
      Effect.succeed("Please check your network connection")
    ),
    Match.tag("AuthError", () =>
      Effect.succeed("Authentication required")
    ),
    Match.tag("DataError", (err) =>
      Effect.succeed(`Data error: ${err.message}`)
    ),
    Match.exhaustive // Compiler ensures all cases handled
  )

const program = dangerousOperation().pipe(
  Effect.catch(handleError)
)
```

## Error Transformation

### mapError - Transform Error Type

```typescript
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

declare const fetchFromDatabase: () => Effect.Effect<Data, InfrastructureError>

interface Data {
  readonly value: string
}

class DomainError extends Schema.TaggedErrorClass<DomainError>()(
  "DomainError",
  { message: Schema.String }
) {}

class InfrastructureError extends Schema.TaggedErrorClass<InfrastructureError>()(
  "InfrastructureError",
  { message: Schema.String, cause: Schema.optional(Schema.Unknown) }
) {}

// Transform infrastructure errors to domain errors
//          Effect<Data, DomainError, Dependencies>
//      ↓
const program = fetchFromDatabase().pipe(
  Effect.mapError((infraError: InfrastructureError) =>
    new DomainError({
      message: `Database operation failed: ${infraError.message}`,
    })
  )
)
```

## Error Recovery Patterns

### Fallback with orElse

```typescript
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

interface Data {
  readonly value: string
}

class PrimaryServiceError extends Schema.TaggedErrorClass<PrimaryServiceError>()(
  "PrimaryServiceError",
  { message: Schema.String }
) {}

class SecondaryServiceError extends Schema.TaggedErrorClass<SecondaryServiceError>()(
  "SecondaryServiceError",
  { message: Schema.String }
) {}

const primaryService: Effect.Effect<Data, PrimaryServiceError> = Effect.fail(new PrimaryServiceError({ message: "Primary down" }))
const secondaryService: Effect.Effect<Data, SecondaryServiceError> = Effect.fail(new SecondaryServiceError({ message: "Secondary down" }))

// Try primary, fallback to secondary
//          Effect<Data, SecondaryServiceError, Dependencies>
//      ↓
const program = primaryService.pipe(
  Effect.orElse(() => secondaryService)
)
```

### Retry with Schedule

```typescript
import * as Effect from "effect/Effect"
import * as Schedule from "effect/Schedule"
import * as Schema from "effect/Schema"

interface Data {
  readonly value: string
}

class TransientError extends Schema.TaggedErrorClass<TransientError>()(
  "TransientError",
  { message: Schema.String }
) {}

const unreliableOperation: Effect.Effect<Data, TransientError> = Effect.fail(new TransientError({ message: "Temporary failure" }))

// Retry with exponential backoff
const program = unreliableOperation.pipe(
  Effect.retry(
    Schedule.exponential("100 millis").pipe(
      Schedule.compose(Schedule.recurs(5)) // Max 5 retries
    )
  )
)
```

### Provide Default Value

```typescript
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

declare const getDefaultConfig: () => Config

interface Config {
  readonly port: number
  readonly host: string
}

class FetchError extends Schema.TaggedErrorClass<FetchError>()(
  "FetchError",
  { message: Schema.String }
) {}

const fetchConfig: Effect.Effect<Config, FetchError> = Effect.fail(new FetchError({ message: "Config not available" }))

// Provide default on failure
//          Effect<Config, never, Dependencies>
//      ↓
const program = fetchConfig.pipe(
  Effect.orElseSucceed(() => getDefaultConfig())
)
```

### Convert Error to Option

```typescript
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

interface Item {
  readonly id: string
  readonly name: string
}

class NotFoundError extends Schema.TaggedErrorClass<NotFoundError>()(
  "NotFoundError",
  { message: Schema.String }
) {}

const findItem: Effect.Effect<Item, NotFoundError> = Effect.fail(new NotFoundError({ message: "Not found" }))

// Convert to Option (None if error)
//          Effect<Option<Item>, never, Dependencies>
//      ↓
const program = findItem.pipe(
  Effect.option
)
```

## Error Channel vs Defect Operators

### Converting Errors to Defects

```typescript
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

interface Config {
  readonly port: number
  readonly host: string
}

class ConfigError extends Schema.TaggedErrorClass<ConfigError>()(
  "ConfigError",
  { message: Schema.String }
) {}

const loadConfig: Effect.Effect<Config, ConfigError> = Effect.fail(new ConfigError({ message: "Missing config" }))

// Convert error to defect (terminates fiber)
//          Effect<Config, never, Dependencies>
//      ↓
const program = loadConfig.pipe(
  Effect.orDie // Error becomes a defect
)

// With custom defect message
const program2 = loadConfig.pipe(
  Effect.orDieWith((error) =>
    new Error(`Fatal: Configuration failed to load: ${error._tag}`)
  )
)
```

### Handling Defects (Boundary Only)

```typescript
import * as Effect from "effect/Effect"

declare const dangerousPlugin: () => Effect.Effect<unknown>
declare const getDefaultPluginBehavior: () => unknown

// NOTE: ONLY use at application boundaries
const safeProgram = dangerousPlugin().pipe(
  Effect.catchDefect((defect) =>
    Effect.logError(`Plugin crashed: ${defect}`).pipe(
      Effect.as(getDefaultPluginBehavior())
    )
  )
)
```

## Layered Error Handling

Structure error handling in layers from specific to general:

```typescript
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

declare const validateUserData: (data: UserData) => Effect.Effect<ValidatedUserData, ValidationError>
declare const saveToDatabase: (data: ValidatedUserData) => Effect.Effect<string, DatabaseError>
declare const notifyUserCreated: (userId: string) => Effect.Effect<void, NetworkError>

interface UserData {
  readonly name: string
  readonly email: string
}

interface ValidatedUserData {
  readonly name: string
  readonly email: string
}

class ValidationError extends Schema.TaggedErrorClass<ValidationError>()(
  "ValidationError",
  { message: Schema.String }
) {}

class DatabaseError extends Schema.TaggedErrorClass<DatabaseError>()(
  "DatabaseError",
  { message: Schema.String }
) {}

class NetworkError extends Schema.TaggedErrorClass<NetworkError>()(
  "NetworkError",
  { message: Schema.String }
) {}

class UnknownError extends Schema.TaggedErrorClass<UnknownError>()(
  "UnknownError",
  { message: Schema.String, cause: Schema.optional(Schema.Unknown) }
) {}

const createUser = (data: UserData) =>
  Effect.gen(function* () {
    // Layer 1: Validate input
    const validated = yield* validateUserData(data).pipe(
      Effect.catchTag("ValidationError", (error) =>
        Effect.fail(new UnknownError({ message: error.message, cause: error }))
      )
    )

    // Layer 2: Database operation
    const userId = yield* saveToDatabase(validated).pipe(
      Effect.catchTag("DatabaseError", (error) =>
        Effect.fail(new UnknownError({ message: error.message, cause: error }))
      )
    )

    // Layer 3: Network notification
    yield* notifyUserCreated(userId).pipe(
      Effect.catchTag("NetworkError", (error) =>
        // Non-critical: log but don't fail
        Effect.logWarning(`Failed to notify: ${error._tag}`)
      )
    )

    return userId
  })
```

## Domain-Specific Error Patterns

### Repository Errors

```typescript
import * as Schema from "effect/Schema"

export class EntityNotFound extends Schema.TaggedErrorClass<EntityNotFound>()(
  "EntityNotFound",
  {
    entityType: Schema.String,
    id: Schema.String,
    message: Schema.String,
  }
) {}

export class DuplicateEntity extends Schema.TaggedErrorClass<DuplicateEntity>()(
  "DuplicateEntity",
  {
    entityType: Schema.String,
    id: Schema.String,
    message: Schema.String,
  }
) {}

export class QueryError extends Schema.TaggedErrorClass<QueryError>()(
  "QueryError",
  {
    query: Schema.String,
    message: Schema.String,
    cause: Schema.optional(Schema.Unknown),
  }
) {}

export type RepositoryError = EntityNotFound | DuplicateEntity | QueryError
```

### Service Errors

```typescript
import * as Schema from "effect/Schema"

export class ServiceUnavailable extends Schema.TaggedErrorClass<ServiceUnavailable>()(
  "ServiceUnavailable",
  {
    service: Schema.String,
    message: Schema.String,
    retryAfter: Schema.optional(Schema.Number),
  }
) {}

export class ServiceTimeout extends Schema.TaggedErrorClass<ServiceTimeout>()(
  "ServiceTimeout",
  {
    service: Schema.String,
    message: Schema.String,
    timeoutMs: Schema.Number,
  }
) {}

export class InvalidResponse extends Schema.TaggedErrorClass<InvalidResponse>()(
  "InvalidResponse",
  {
    service: Schema.String,
    message: Schema.String,
    response: Schema.optional(Schema.Unknown),
  }
) {}

export type ServiceError = ServiceUnavailable | ServiceTimeout | InvalidResponse
```

### Error Boundaries

```typescript
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

declare const processRequest: (request: Request) => Effect.Effect<Response, ValidationError | NotFoundError | DatabaseError>
declare const HttpResponse: {
  badRequest: (message: string) => Response
  notFound: () => Response
  internalServerError: () => Response
}

interface Request {
  readonly url: string
}

interface Response {
  readonly status: number
}

class ValidationError extends Schema.TaggedErrorClass<ValidationError>()(
  "ValidationError",
  { message: Schema.String }
) {}

class NotFoundError extends Schema.TaggedErrorClass<NotFoundError>()(
  "NotFoundError",
  { message: Schema.String }
) {}

class DatabaseError extends Schema.TaggedErrorClass<DatabaseError>()(
  "DatabaseError",
  { message: Schema.String }
) {}

// Define clear boundaries where errors are handled
const apiEndpoint = (request: Request) =>
  Effect.gen(function* () {
    const result = yield* processRequest(request)
    return result
  }).pipe(
    // Error boundary: convert all errors to HTTP responses
    Effect.catchTags({
      ValidationError: (error) =>
        Effect.succeed(HttpResponse.badRequest(error.message)),
      NotFoundError: () =>
        Effect.succeed(HttpResponse.notFound()),
      DatabaseError: (error) =>
        Effect.logError(error).pipe(
          Effect.as(HttpResponse.internalServerError())
        )
    })
  )
```

## Quality Checklist

Before completing error handling implementation:

- [ ] All domain errors use `Schema.TaggedErrorClass` with a `message` field
- [ ] Error types have meaningful, specific names
- [ ] Errors include relevant context (ids, values, reasons)
- [ ] Business failures in error channel, programmer errors as defects
- [ ] catchTag/catchTags used for specific error handling
- [ ] catch only when handling truly all error types
- [ ] Error transformations preserve important context
- [ ] Recovery strategies match business requirements
- [ ] Defect handling only at application boundaries
- [ ] Error types exported from domain modules
- [ ] Tests cover error scenarios
- [ ] Type signatures accurately reflect error channel

Your error handling implementations should be type-safe, exhaustive, and maintain clear separation between expected failures and programmer errors.
