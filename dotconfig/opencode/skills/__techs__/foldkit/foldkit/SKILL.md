---
name: foldkit
description: Use whenever working with Foldkit
---

# Foldkit

You are working on a Foldkit app. Foldkit is The Elm Architecture (TEA) on Effect-TS for the browser. It is opinionated and convention-heavy. Every Foldkit app has the same architecture — not by convention, by design. There is one correct shape for state, one correct shape for events, one correct place for each kind of side effect. When you reach for a pattern, find the existing precedent in the codebase or in the cached examples and match it.

This skill is the working agent's reference. It is long because Foldkit's value comes from the discipline; trying to compress the discipline into bullet points strips the parts that matter. Read it through once at the start of any non-trivial Foldkit task, then come back to specific sections as needed. When something is genuinely unclear, drop to `~/.cache/foldkit/` (see [End notes](#end-notes-progressive-disclosure)).

## Table of contents

1. [The laws](#the-laws)
2. [The loop](#the-loop)
3. [The two-file shape](#the-two-file-shape)
4. [Model](#model)
5. [Messages](#messages)
6. [Update](#update)
7. [View](#view)
8. [Commands](#commands)
9. [Mount](#mount)
10. [Subscriptions](#subscriptions)
11. [Init & flags](#init--flags)
12. [Runtime / makeProgram](#runtime--makeprogram)
13. [Side effects & purity](#side-effects--purity)
14. [Routing & navigation](#routing--navigation)
15. [Field validation](#field-validation)
16. [Resources vs Managed resources](#resources-vs-managed-resources)
17. [Submodels](#submodels)
18. [OutMessage](#outmessage)
19. [Subscription organization](#subscription-organization)
20. [Project organization](#project-organization)
21. [Keying](#keying)
22. [Immutability with `evo`](#immutability-with-evo)
23. [View memoization](#view-memoization)
24. [Testing — Story (state machine)](#testing--story-state-machine)
25. [Testing — Scene (view)](#testing--scene-view)
26. [DevTools](#devtools)
27. [Crash view, slow view, freeze model](#crash-view-slow-view-freeze-model)
28. [DOM, Render, Canvas, File, CustomElement](#dom-render-canvas-file-customelement)
29. [UI components](#ui-components)
30. [The discipline (non-negotiables)](#the-discipline-non-negotiables)
31. [Common pitfalls](#common-pitfalls)
32. [End notes (progressive disclosure)](#end-notes-progressive-disclosure)

---

## The laws

These are non-negotiable. If you find yourself fighting them, you are fighting Foldkit and you will lose. Push back on prompts or instincts that pull toward any of these violations and propose the idiomatic shape.

1. **One Model.** All application state lives in one `Schema`-typed structure. No `useState`, no component-local state, no parallel stores.
2. **Update and view are pure.** Given the same inputs, they always return the same outputs. No `fetch`, no `Date.now()`, no `console.log` (in production), no DOM access, no `Math.random()`, no mutation. Zero side effects in these two functions. Period.
3. **Side effects live in exactly six places.** Commands, Mount, flags, Subscription streams, Resources, Managed Resources. That is the full list. Every other place is wrong.
4. **Every state change flows through a Message.** No direct mutation. No imperative "do this then that" outside the loop. Messages name what *happened*; update decides what it *means*.
5. **No `NoOp` Messages.** Every Message describes a real fact, even for fire-and-forget Commands where update is a no-op (use `Completed*`).
6. **Match exhaustively.** `Match.tagsExhaustive` on Message unions, route unions, status ADTs. The compiler must complain when you add a variant and forget to handle it.
7. **Use the existing precedent.** The cached examples (`~/.cache/foldkit/examples/`) and the framework source (`~/.cache/foldkit/packages/`) are higher-fidelity references than your training data or prose docs. When in doubt, browse them.
8. **The Foldkit and Effect ecosystem is the toolbox.** Foldkit owns app shape (Model, Message, update, view). Effect owns the primitives (Schema, Match, Stream, Layer, DateTime, Random, Option). Reach for an in-ecosystem pattern before importing a broader-JS library (Zustand, React Query, RxJS, Lodash, date-fns, immer — none of them belong here).

## The loop

Every Foldkit app runs the same loop:

```
          +------------------------------------------------------+
          |                                                      |
          ↓                                                      |
       Message                                                   |
          |                                                      |
          ↓                                                      |
  +---------------+                                              |
  |    update     |                                              |
  +-------+-------+                                              |
  ↓               ↓                                              |
Model    Command<Message>[]                                      |
  |               |                                              |
  |               +-> Runtime -----------------------------------+
  |                                                              |
  +-> view -> Browser -> user events ----------------------------+
  |                                                              |
  +-> view -> Mount(Element) -> Effect<Message> -> Runtime ------+
  |                                                              |
  +-> Subscriptions -> Stream<Message> -> Runtime ---------------+
  |                                                              |
  +-> ManagedResources -> acquire/release Messages -> Runtime ---+
```

A Message arrives. `update` receives the current Model and the Message and returns a new Model along with any Commands to execute. `view` renders the new Model as HTML. The five sources that produce Messages: Commands (one-shot), the Browser (event handlers), Mount (per-element lifecycle), Subscriptions (model-gated streams), and ManagedResources (lifecycle transitions). Five sources. One loop. Every state change flows through the same channel.

| Concept | Definition |
|---|---|
| **Model** | The single data structure that holds all application state. |
| **Message** | A fact about something that happened. Verb-first, past tense. |
| **update** | Pure function: `(Model, Message) → [Model, Command[]]`. |
| **view** | Pure function: `Model → Document`. Renders Messages on event handlers, never callbacks. |
| **Command** | Description of a one-shot side effect. Named, typed, args-aware. Runtime executes it and sends results back as Messages. |
| **Mount** | Per-element lifecycle effect. `Mount.define` for one-shot at acquire; `Mount.defineStream` for ongoing event streams from observers/listeners on the element. |
| **Subscription** | A scoped Stream gated by a slice of the Model. Runs while the slice holds a dependency-equivalent value; restarts when it changes. |
| **Resource** | App-lifetime singleton (`AudioContext`, `CanvasRenderingContext2D`) Commands draw on. Not a Message source. |
| **ManagedResource** | Like Resource, but scoped to a Model condition. Runtime acquires/releases and dispatches lifecycle Messages. Commands consume it as a typed handle. |
| **Runtime** | The engine that executes Commands, runs Subscriptions, manages Mount and ManagedResource lifecycles, routes Messages back into update. |

## The two-file shape

A Foldkit app lives in two files at minimum:

- **`src/main.ts`** — pure definitions: Model, Messages, update, init, view. Importable from tests with no side effects on import.
- **`src/entry.ts`** — runtime bootstrap: `Runtime.makeProgram` + `Runtime.run`. The *only* place runtime side effects happen at module load.

This split is structural, not stylistic. Tests import from `main.ts`; the runtime never boots inadvertently. As the app grows past one file, the same rule scales — see [Project organization](#project-organization).

## Model

The Model is your entire application state in a single immutable structure defined with [Effect Schema](https://effect.website/docs/schema/introduction/). Not a TypeScript type — a `Schema.Struct` value. The runtime needs to know your Model's shape *at runtime* (for equality checks, dependency comparison, freezing, decoding from flags), so it must exist as a value, not just a compile-time annotation.

```typescript
import { Schema as S } from 'effect'

export const Model = S.Struct({
  count: S.Number,
  isAutoCounting: S.Boolean,
})
export type Model = typeof Model.Type
```

The Model grows with the app. When you add new state, add a field; don't carve off a parallel store. There is one tree. State that "feels component-local" in React lives in the Model in Foldkit. If a Submodel encapsulates a feature, that Submodel's Model is a field on the parent's Model (see [Submodels](#submodels)).

Reach for Effect's data types when the shape calls for them: `S.Option(...)` for optional values, `S.Array(...)` for lists, `S.TaggedStruct(...)` for sum types, `S.Union([...])` for unions. `S.Literal('Idle' | 'Loading' | ...)` for finite string enums. Avoid `S.Unknown` and `S.Any` unless you have a specific reason — the Model's value comes from being typed end-to-end.

## Messages

A Message is a fact about something that happened. Not an instruction. `ClickedIncrement` does not say "add one to the count" — it says "the user clicked the increment button." `update` decides what that means.

```typescript
import { Schema as S } from 'effect'
import { m } from 'foldkit/message'

const ClickedIncrement = m('ClickedIncrement')
const SucceededFetchUser = m('SucceededFetchUser', { user: User })
const FailedFetchUser = m('FailedFetchUser', { error: S.String })

export const Message = S.Union([
  ClickedIncrement,
  SucceededFetchUser,
  FailedFetchUser,
])
export type Message = typeof Message.Type
```

`m()` creates a `TaggedStruct` with a callable constructor. `m('ClickedIncrement')` gives you a type to pattern-match on and a function to construct instances: `ClickedIncrement()`. With fields, the constructor takes the typed record: `SucceededFetchUser({ user })`.

### Naming convention (load-bearing)

Verb-first, past tense, with the verb prefix as a category marker:

- `Clicked*` — button clicks (`ClickedIncrement`, `ClickedSave`)
- `Updated*`, `Inputted*`, `Changed*` — input changes (`ChangedSearch`, `InputtedEmail`)
- `Submitted*` — form submissions (`SubmittedLoginForm`)
- `Pressed*` — keypresses (`PressedEscape`, `PressedEnter`)
- `Succeeded*` / `Failed*` — Command results that can meaningfully fail (`SucceededFetchUser` / `FailedFetchUser`)
- `Completed*` — fire-and-forget Command acknowledgments where update is a no-op (`CompletedLockScroll`, `CompletedFocusInput`)
- `Got*Message` — Submodel results that wrap a child Message (`GotSettingsMessage`). DevTools' Submodel filter requires this prefix.
- `Acquired*` / `Released*` — ManagedResource lifecycle (`AcquiredCamera`, `ReleasedCamera`)
- `Ticked*` — clock-driven events (`TickedFrame`, `Ticked`)
- `Received*` — externally-pushed data (`ReceivedWebSocketMessage`)

Anti-patterns to refuse:

- `Increment`, `AddToCart`, `SetUser`, `UpdateSearch` — imperative; not facts
- `MutateUserState`, `SetCartItems` — describes the effect on state, not the user event
- `NoOp` — every Message describes something. For acknowledged-but-update-does-nothing cases, use `Completed*`

### Why no NoOp

A `NoOp` Message turns the DevTools timeline into a wall of identical entries. Naming the Command result clearly makes the history a readable narrative: `Opened` → `CompletedFocusItems` → `CompletedLockScroll` → `CompletedSetupInert`. Each line tells you what happened. Mirror the Command verb: Command `LockScroll` → Message `CompletedLockScroll`.

## Update

`update` is the heart of your application logic. It is a pure function: `(Model, Message) → [Model, Command[]]`. Same inputs, same outputs, always. No hidden state, no ambient mutation. Test by passing in a Model and a Message and asserting on the output — that's the whole testing model.

Use `Match.tagsExhaustive` for Message dispatch. The compiler will refuse to compile if you add a Message variant and forget to handle it.

```typescript
import { Match as M } from 'effect'
import { Command } from 'foldkit'
import { evo } from 'foldkit/struct'

export const update = (
  model: Model,
  message: Message,
): readonly [Model, ReadonlyArray<Command.Command<Message>>] =>
  M.value(message).pipe(
    M.withReturnType<readonly [Model, ReadonlyArray<Command.Command<Message>>]>(),
    M.tagsExhaustive({
      ClickedIncrement: () => [evo(model, { count: n => n + 1 }), []],
      ClickedFetchUser: () => [
        evo(model, { isLoading: () => true }),
        [fetchUser(model.userId)],
      ],
      SucceededFetchUser: ({ user }) => [
        evo(model, { isLoading: () => false, user: () => user }),
        [],
      ],
      FailedFetchUser: () => [
        evo(model, { isLoading: () => false }),
        [],
      ],
    }),
  )
```

Notes:

- **Returns a tuple.** `[nextModel, commands]`. Commands is a `ReadonlyArray<Command<Message>>`. Empty array when no side effect is needed.
- **Pattern: `M.withReturnType<...>()`.** This pins the return type so `Match` can infer correctly across arms. Skip it and inference gets sloppy.
- **Use `evo` for updates.** See [Immutability with `evo`](#immutability-with-evo).
- **No fallback arm by default.** If you write `M.orElse(() => [model, []])`, you are silently swallowing future Messages. Use `tagsExhaustive` and let the compiler keep you honest.
- **No async, no `await`, no `.then`.** If you need data from elsewhere, return a Command.
- **No `Date.now()`, no `Math.random()`.** Pure means same inputs → same outputs. Request the value via a Command (see [Side effects & purity](#side-effects--purity)).

## View

`view` turns the Model into HTML. Pure function. No hooks, no effects, no local state. Given the same Model, it always returns the same `Document`.

```typescript
import { type Document, html } from 'foldkit/html'

export const view = (model: Model): Document => {
  const h = html<Message>()

  return {
    title: `Count: ${model.count}`,
    body: h.div(
      [h.Class('min-h-screen flex flex-col items-center justify-center gap-6 p-6')],
      [
        h.div([h.Class('text-6xl font-bold')], [model.count.toString()]),
        h.button(
          [h.OnClick(ClickedIncrement()), h.Class('bg-black text-white px-4 py-2')],
          ['+'],
        ),
      ],
    ),
  }
}
```

Foldkit's HTML is a typed function-call DSL, not JSX. Bind the factory once per module with `html<Message>()`, then reach for `h.div`, `h.button`, `h.OnClick`, etc. off the returned record. Each element function takes `(attributes[], children[])` — both arrays.

### Event handlers take Messages, not callbacks

```typescript
// Click: pass the Message directly.
h.button([h.OnClick(ClickedIncrement())], ['+'])

// Input: pass a function that maps the extracted value to a Message.
h.input([
  h.Value(model.searchText),
  h.OnInput(value => ChangedSearch({ text: value })),
])
```

The DSL ships typed handlers for the standard HTML event surface. `OnInput` hands you the extracted value. `OnPointerDown` hands you `{ pointerType, button, screenX, screenY, clientX, clientY }`. `OnKeyDown` hands you the key and a typed modifier set. `OnFileChange` hands you a typed file list. Reach for the typed handler before any escape hatch.

### View is pure — what that excludes

- No `fetch`, no `setTimeout`, no `addEventListener`. If you find yourself wanting any of these, the answer is a Command or a Subscription.
- No reading the DOM. No `document.getElementById`, no `window.innerWidth`. Reactive values come from Subscriptions or ResizeObserver via Mount; one-off reads come from Commands.
- No conditional logic that depends on something not in the Model. If the view needs to know it, it has to be in the Model.

### The `Document` return type

`view` returns a `Document` — an object with `title` (sets `document.title` on every render), `body` (the HTML tree), and optional `canonical` and `ogUrl` meta fields that the runtime syncs on every render. Both meta fields default to the current URL when omitted.

### Subviews

Sub-functions of `view` return `Html`, not `Document`. The convention is `someName + 'View'`:

```typescript
const cartView = (cart: Cart): Html => {
  const h = html<Message>()
  return h.div([h.Class('flex flex-col gap-2')], cart.items.map(itemView))
}
```

When a subview should be agnostic to its parent Message type (i.e. lives inside a Submodel that doesn't know its parent), make it generic over `ParentMessage`:

```typescript
export const view = <ParentMessage>(
  model: Model,
  toParentMessage: (message: Message) => ParentMessage,
): Html => {
  const h = html<ParentMessage>()
  return h.button(
    [h.OnClick(toParentMessage(ChangedTheme({ theme: 'dark' })))],
    ['Use dark theme'],
  )
}
```

See [Submodels](#submodels) for the full pattern.

### Why no JSX

The DSL is plain TypeScript. No transform, no compiler step. Every attribute is a known constructor. Every event handler returns a typed Message. Children are a typed array, not opaque variadic JSX. The shape of `OnClick(Message)` vs `onClick={() => fn()}` is the real distinction: JSX reaches into closures; the DSL hands you a value that flows through the entire loop, gets logged in DevTools, replays in tests, and lands in update.

When you need to render conditionally, dispatch on a tag with `Match.tagsExhaustive`:

```typescript
M.value(status).pipe(
  M.tagsExhaustive({
    Idle: () => h.empty,
    Loading: () => h.p([], ['Loading…']),
    Failed: ({ error }) => h.p([], [`Sorry: ${error}`]),
    Loaded: ({ greeting }) => h.p([], [greeting]),
  }),
)
```

`h.empty` is the empty VNode (use it instead of `null` or `undefined`). For multiple optional children, spread with conditional arrays: `[a, ...(cond ? [b] : []), c]` — and key the conditional siblings (see [Keying](#keying)).

## Commands

A Command is a description of a one-shot side effect: an HTTP request, a delay, a focus call, a localStorage write, a navigation. `update` does not execute anything itself — it returns Commands, and the runtime carries them out, sending the result back as a Message.

```typescript
import { Effect } from 'effect'
import { Command } from 'foldkit'

const ClickedResetAfterDelay = m('ClickedResetAfterDelay')
const CompletedDelayReset = m('CompletedDelayReset')

const DelayReset = Command.define(
  'DelayReset',           // The Command name (PascalCase, verb-first imperative)
  CompletedDelayReset,    // Result Message(s). At least one required.
)(
  Effect.sleep('1 second').pipe(Effect.as(CompletedDelayReset())),
)

// In update:
ClickedResetAfterDelay: () => [model, [DelayReset()]],
CompletedDelayReset:    () => [evo(model, { count: () => 0 }), []],
```

### Anatomy

A `Command` has three fields: `name` (identifies the Command in DevTools, traces, tests), `args` (the typed input record, when declared), and `effect` (what the runtime runs). You build one in two curried steps:

1. **Declare identity and shape**: `Command.define(name, args?, ...results)` — name, optional args schema, one or more result Message schemas.
2. **Provide the Effect**: pass an Effect (when no args), or an effect-builder function from args to Effect (when args are declared). The result is a callable Definition.

### Naming

PascalCase verb-first imperative on the Command itself: `FetchWeather`, `FocusButton`, `LockScroll`, `SaveTodos`, `NavigateInternal`. Messages are facts; Commands are instructions to the runtime. The resulting Message keeps the same verb in the past tense: `FetchWeather` → `SucceededFetchWeather` / `FailedFetchWeather`; `LockScroll` → `CompletedLockScroll`.

Several Commands can produce the same Message. `NavigateInternal`, `RedirectToLogin`, `ReplaceSearchUrl` all produce `CompletedNavigateInternal`. The Message is intentionally generic (update handles all internal navigations the same way); the Command name preserves the *why*.

### Args

Args carry the per-dispatch inputs that vary at call time. Everything else the Effect needs comes in through the Effect itself:

- Module-level constants → lexical scope
- App-wide dependencies → Foldkit Resources
- Model-driven handles → Foldkit ManagedResources
- Effect services → `yield*` inside the body

Args do not have to carry every value the Effect uses; they carry the per-dispatch inputs.

```typescript
const FetchWeather = Command.define(
  'FetchWeather',
  { zipCode: S.String },               // Args schema
  SucceededFetchWeather,
  FailedFetchWeather,
)(
  ({ zipCode }) =>                     // Factory receives typed args
    Effect.gen(function* () {
      const client = yield* HttpClient.HttpClient
      const response = yield* client.execute(
        HttpClientRequest.get(`/api/weather?zip=${zipCode}`),
      )
      const weather = yield* S.decodeUnknownEffect(WeatherSchema)(yield* response.json)
      return SucceededFetchWeather({ weather })
    }).pipe(
      Effect.catch(error => Effect.succeed(FailedFetchWeather({ error: String(error) }))),
      Effect.provide(FetchHttpClient.layer),
    ),
)

// In update:
SubmittedWeatherForm: () => [model, [FetchWeather({ zipCode: model.zipCodeInput })]],
```

### Error handling

Effect's typed error channel is the contract. If a Command can fail, the type signature says so. Use `Effect.catch` to turn failures into `Failed*` Messages — update handles errors the same way it handles success, as facts about what happened. The runtime always sees a result.

### Fire-and-forget Commands

Even Commands whose result update does nothing with should declare a `Completed*` result Message. The Message names the side effect so DevTools, Story/Scene tests, and replay can see it.

```typescript
const FocusInput = Command.define(
  'FocusInput',
  { selector: S.String },
  CompletedFocusInput,
)(({ selector }) =>
  Dom.focus(selector).pipe(Effect.ignore, Effect.as(CompletedFocusInput())),
)

// update no-ops:
CompletedFocusInput: () => [model, []],
```

### Commands are testable by design

Because update is pure and Commands are data (a name + args + an Effect), the entire update loop is simulatable. Tests send Messages, assert the Commands produced, resolve them with the result Message the Effect would have produced, and verify the Model. The actual Effect inside the Command is tested separately with `Effect.provide` and mock layers. See [Testing — Story](#testing--story-state-machine).

## Mount

Most Foldkit code is declarative. Mount is the seam where view code drops down to imperative DOM work bound to an element's lifetime. The element appears in the live DOM; the Mount's Effect runs. The element unmounts; the Mount's scope closes and any `Effect.acquireRelease` finalizers run.

### Two shapes

- **`Mount.define`** — Runs an `Effect<Message>` that produces exactly one Message at acquire. Use for anchor positioning, portaling, third-party library instantiation, reading element geometry on mount.
- **`Mount.defineStream`** — Runs a `Stream<Message>` from observers or listeners on the element. Use *only* when the Mount's job is to emit a continuous stream of Messages from things attached to the element: scroll events, IntersectionObserver entries, MutationObserver records.

Both require at least one declared result Message. Fire-and-forget Mounts declare `Completed*` for the same reason fire-and-forget Commands do.

### When to reach for Mount

Pick by what *causes* the side effect, not by ergonomics:

- **Command** — fires because `update` just returned it. The cause is a Message that just dispatched. Network, storage, focus-on-state-change, scroll lock, analytics.
- **Mount** — fires because an element appeared, and the author needs the live `Element` handle. Anchor positioning, portaling, attaching observers to a specific element, handing the element to a third-party library.
- **Subscription** — catches a long-running external event source whose lifetime is gated by a Model condition. Timers, document/window events, system theme changes, WebSocket message streams.
- **ManagedResource** — holds a stateful runtime object whose lifetime is tied to a Model condition AND whose handle is consumed by Commands. WebSocket, camera stream, third-party library instance with state.

Do not reach for Mount just because the work happens to coincide with an element appearing. If a Message just dispatched (like `Opened`), the cause is the Message, not the element. The element's appearance is coincidentally co-timed with the Message but isn't what causes the work. Use a Command from `update`'s handler instead. Focusing a search input when a dialog opens: the element appears, but the cause is `Opened`. A `FocusInput` Command from the `Opened` handler is the right shape.

### Two practical rules for Mount (both must hold)

1. **The factory uses the element parameter.** Mount provides the live element handle, and that handle is what makes Mount distinct from the alternatives. If your factory doesn't read or write the element, pick a different primitive.
2. **The work is DOM measurement or DOM manipulation on that element.** Read its geometry, mutate its CSS, attach an observer to it, portal it, hand it to a third-party library. Anything else is a Command (network, storage, analytics, focus-on-transition, page-level scroll lock), a Subscription whose dependencies are derived from the Model (timers, document-level keyboard listeners, system theme observers), or a ManagedResource whose lifetime tracks a Model condition.

### Portal-to-body example

```typescript
import { Effect } from 'effect'
import { Mount } from 'foldkit'

const CompletedPortalToBody = m('CompletedPortalToBody')

const PortalToBody = Mount.define(
  'PortalToBody',
  CompletedPortalToBody,
)(element =>
  Effect.gen(function* () {
    yield* Effect.acquireRelease(
      Effect.sync(() => document.body.appendChild(element)),
      () => Effect.sync(() => element.remove()),
    )
    return CompletedPortalToBody()
  }),
)

// In a view:
h.div([h.Class('fixed inset-0 bg-black/50'), h.OnMount(PortalToBody())])
```

### `acquireRelease` discipline

`Effect.acquireRelease` only guarantees atomicity of "acquire body completes → release is registered." If you construct a handle *before* the `acquireRelease` and the acquire body just returns the existing handle, interruption between the construction and the registration leaks the handle. Discipline: **construct the resource INSIDE the acquire body, never before it**. Whatever the release function needs must be the success value of the acquire Effect.

```typescript
// ✅ Construction is the acquire body's success value
const MountChart = Mount.define(
  'MountChart',
  { data: ChartData },
  SucceededMountChart,
  FailedMountChart,
)(({ data }) => element =>
  Effect.gen(function* () {
    yield* Effect.acquireRelease(
      Effect.tryPromise(() => import('some-chart-library')).pipe(
        Effect.map(({ Chart }) => new Chart(element, { data })),
      ),
      chart => Effect.sync(() => chart.destroy()),
    )
    return SucceededMountChart()
  }).pipe(
    Effect.catch(error =>
      Effect.succeed(FailedMountChart({ reason: error instanceof Error ? error.message : String(error) })),
    ),
  ),
)
```

### Args are captured at mount, not refreshed on subsequent renders

The factory runs once when the element enters the DOM. Every later render constructs a fresh MountAction with current arg values, but only the first invocation's args ever execute. Name args to express this: `initialScroll`, not `scroll`; `seedValue`, not `value`. If you need Model changes to drive ongoing DOM behavior post-mount, the cause is the Message that updated the Model — dispatch a Command from update's handler. Don't try to "re-trigger" a Mount.

### Only one Mount per element

Snabbdom stores a single `insert`/`destroy` hook per VNode. `[h.OnMount(A), h.OnMount(B)]` silently overwrites: the second `OnMount` replaces the first; A's factory never runs. If you need multiple lifetime-scoped behaviors on the same element, bundle them into a single Mount that does both in its acquire and releases both in its release.

### Mounts re-run during DevTools time-travel

When the user scrubs through history, Foldkit re-renders the historical Model. Elements carrying `OnMount` re-fire their factories. The two rules above are what keep Mount work inherently replay-safe: DOM measurement is read-only, DOM manipulation on an element that exists in both live and time-travel views is idempotent, observer attachment paired with release is self-balancing. Anything that mutates external state (network, storage, focus-on-transition, page-level scroll lock, library instantiation keyed on Model rather than element) is unsafe to re-run during replay and therefore not a Mount.

## Subscriptions

A Subscription binds a slice of your Model to a scoped Stream that may emit Messages. You name a slice of the Model via `modelToDependencies`, and Foldkit runs `dependenciesToStream` as a scoped Effect for exactly as long as that slice holds its dependency-equivalent value. When the slice changes, the scope closes (running any registered `Effect.acquireRelease` finalizers) and a fresh scope opens with the new dependencies.

This inverts the usual "subscribe to an event source" framing. The thing you are subscribed to is the **Model**, not the WebSocket, not the timer, not the document event. External event sources are what your Effect happens to *use* during the subscription's lifetime.

```typescript
import { Effect, Schema as S, Stream } from 'effect'
import { Subscription } from 'foldkit'

export const subscriptions = Subscription.make<Model, Message>()(entry => ({
  tick: entry(
    { isAutoCounting: S.Boolean },                        // Dependency shape
    {
      modelToDependencies: model => ({                    // Extract from Model
        isAutoCounting: model.isAutoCounting,
      }),
      dependenciesToStream: ({ isAutoCounting }) =>       // Build the Stream
        Stream.when(
          Stream.tick(Duration.seconds(1)).pipe(Stream.map(Ticked)),
          Effect.sync(() => isAutoCounting),
        ),
    },
  ),
}))
```

Foldkit structurally compares the dependencies between Model updates. The Stream is restarted only when the dependencies actually change, not on every Model update.

### Animation frames

For Subscriptions tied to the browser's paint clock, `Subscription.animationFrame` is the ready-made helper:

```typescript
export const subscriptions = Subscription.make<Model, Message>()(_entry => ({
  frame: Subscription.animationFrame({
    isActive: model => model.isPlaying,
    toMessage: deltaTime => TickedFrame({ deltaTime }),
  }),
}))
```

`deltaTime` makes simulation speed independent of frame rate. Multiply per-second velocities by it and motion stays consistent on 60Hz, 120Hz, or after a tab regains focus. For discrete game ticks (simulation steps once every N ms regardless of refresh rate), reach for `Stream.tick` instead. The Snake example uses `Stream.tick`; the canvas-art example uses `Subscription.animationFrame`.

### `keepAliveEquivalence` and `readDependencies`

When the dependencies include fast-changing fields you do NOT want triggering a restart, override the comparison with a custom `keepAliveEquivalence`, and read live dependencies via `readDependencies` inside the Stream body:

```typescript
autoScroll: entry(
  { isDragging: S.Boolean, clientY: S.Number },
  {
    modelToDependencies: model => ({
      isDragging: model.isDragging,
      clientY: model.clientY,
    }),
    keepAliveEquivalence: Equivalence.Struct({
      isDragging: Equivalence.Boolean,                    // Only restart on isDragging change
    }),
    dependenciesToStream: ({ isDragging }, readDependencies) =>
      Stream.when(
        Stream.callback<typeof CompletedAutoScroll.Type>(queue =>
          Effect.acquireRelease(
            Effect.sync(() => {
              const animationFrameIdRef = { current: 0 }
              const step = () => {
                const { clientY } = readDependencies()    // Read live deps
                window.scrollBy(0, clientY > window.innerHeight - 40 ? 5 : 0)
                Queue.offerUnsafe(queue, CompletedAutoScroll())
                animationFrameIdRef.current = requestAnimationFrame(step)
              }
              animationFrameIdRef.current = requestAnimationFrame(step)
              return animationFrameIdRef
            }),
            animationFrameIdRef => Effect.sync(() =>
              cancelAnimationFrame(animationFrameIdRef.current),
            ),
          ).pipe(Effect.flatMap(() => Effect.never)),
        ),
        Effect.sync(() => isDragging),
      ),
  },
),
```

### Subscriptions that emit no Messages

A Subscription whose only job is to maintain DOM state for its lifetime (e.g. `user-select: none` while a drag is active, `aria-hidden` on the document root while a modal is open) is still a valid Subscription — same primitive, same Model-gated lifetime. Use `Effect.acquireRelease` to apply the DOM state on entry and undo it on exit.

### Synchronous DOM work inside a Subscription

When a DOM mutation must run *synchronously* with the browser event (calling `preventDefault` on a keydown listener, where routing through `update` would arrive after the browser had committed the default), do it directly in a synchronous Effect inside the Stream body. `Stream.mapEffect` + `Effect.sync` is the typical shape when you also want to transform the event into a Message; `Stream.tap` when the mutation is the entire point.

## Init & flags

`init` returns the initial Model and any startup Commands as a tuple `[Model, Command[]]`.

```typescript
import type { Runtime } from 'foldkit'

export const init: Runtime.ProgramInit<Model, Message> = () => [{ count: 0 }, []]
```

For programs with routing, init receives the current URL as the first argument so you can set up initial state based on the route (`Runtime.RoutingProgramInit<Model, Message>`).

### Flags

Flags let you pass initialization data into the app at startup — typically persisted state from `localStorage`, configuration, or browser capability detection. Define a `Flags` schema and provide an `Effect` that loads them:

```typescript
import { BrowserKeyValueStore } from '@effect/platform-browser'
import { Effect, Option, Schema as S } from 'effect'
import { KeyValueStore } from 'effect/unstable/persistence'

const Flags = S.Struct({
  todos: S.Option(S.Array(Todo)),
})
type Flags = typeof Flags.Type

const flags: Effect.Effect<Flags> = Effect.gen(function* () {
  const store = yield* KeyValueStore.KeyValueStore
  const json = yield* Effect.fromOption(Option.fromNullishOr(yield* store.get('todos')))
  const todos = yield* S.decodeEffect(S.fromJsonString(S.Array(Todo)))(json)
  return Flags.make({ todos: Option.some(todos) })
}).pipe(
  Effect.catch(() => Effect.succeed(Flags.make({ todos: Option.none() }))),
  Effect.provide(BrowserKeyValueStore.layerLocalStorage),
)

// With flags, init takes them as the first argument:
const init: Runtime.ProgramInit<Model, Message, Flags> = flags => [
  { count: 0, savedTodos: flags.todos },
  [],
]
```

Flags are *the* place to do synchronous-feeling load-time work. They run once, before the runtime starts the loop. Everything afterward is Commands.

## Runtime / makeProgram

`Runtime.makeProgram` creates the runtime. `Runtime.run` starts it. Both live in `entry.ts`:

```typescript
import { Runtime } from 'foldkit'
import { init, Model, update, view } from './main'

const program = Runtime.makeProgram({
  Model,
  init,
  update,
  view,
  container: document.getElementById('root'),
})

Runtime.run(program)
```

### With routing

When the program manages the URL bar, add a `routing` config. The `init` function then receives the current URL:

```typescript
const program = Runtime.makeProgram({
  Model,
  init,
  update,
  view,
  container: document.getElementById('root'),
  routing: {
    onUrlRequest: request => ClickedLink({ request }),  // Link clicks
    onUrlChange: url => ChangedUrl({ url }),            // URL changes
  },
})
```

`onUrlRequest` is called when a link is clicked — you get an `Internal | External` request and decide how to handle it. `onUrlChange` is called when the URL changes — that's where you parse into a route and update the Model. See [Routing & navigation](#routing--navigation).

### Other config fields

- `subscriptions` — your `Subscription.make`/`Subscription.aggregate` record (see [Subscription organization](#subscription-organization))
- `resources` — an Effect `Layer` providing app-lifetime services (see [Resources](#resources-vs-managed-resources))
- `managedResources` — your `ManagedResource.makeManagedResources` record
- `crash` — `{ view?, report? }` to customize crash handling
- `slowView` — `{ thresholdMs?, onSlowView? }` (or `false` to disable)
- `freezeModel` — `false` to disable runtime model freezing in dev
- `devTools` — `{ show?, position?, mode?, banner?, Message?, excludeFromHistory?, maxEntries? }` (or `false` to disable)

## Side effects & purity

Zero side effects in `update` and `view`. Period. Every side effect in the program is described as an Effect (a value that represents a computation without executing it), and the Foldkit runtime is the only thing that executes Effects.

### The six places side effects live (and nowhere else)

| Place | What it's for |
|---|---|
| **Commands** | One-shot side effects triggered by a Message: HTTP requests, focus, storage, navigation, analytics. |
| **Mount** | Per-element lifecycle: portal, anchor, third-party library instantiation, observer attachment to a specific element. |
| **flags** | Startup load: `localStorage`, capability detection, configuration. |
| **Subscription streams** | Ongoing model-gated streams: timers, document events, system theme changes, WebSocket frames. |
| **Resources** | App-lifetime singletons: `AudioContext`, `CanvasRenderingContext2D`. |
| **ManagedResources** | Model-scoped stateful handles: camera, WebSocket connection, Web Worker pool. |

That is the complete list.

### Why zero side effects

- **DevTools replay.** DevTools replays Messages through pure `update`. If update had side effects, replay would re-fire them. Same for time-travel.
- **Predictability.** Reading `update` tells you everything about how a Message changes the Model. No hidden effects, no action-at-a-distance, no callbacks firing behind the scenes.
- **Testability.** Story tests send Messages and inspect the Model. No mocking, no spies, no fake timers. Because update is data-in/data-out.

### Common mistakes

- **`console.log` in `update`.** Fine for quick development, but production logging or error monitoring is a side effect that belongs in a Command. It fires during DevTools replay; you want structured control.
- **`Date.now()` in `update`.** Breaks purity: same Model + same Message produce different results depending on when run. Request the current time via a Command using Effect's `DateTime` module and return it as a Message.
- **`Math.random()` in `update`.** Same problem. Request the value via a Command using Effect's `Random` module.
- **`fetch` in `view`.** The view is called on every render. Return a Command from `update`.
- **DOM access anywhere.** `document.getElementById`, `window.innerWidth`, `getBoundingClientRect`. Use Subscriptions for reactive values, Commands (often with `Render.afterCommit`) for one-off reads.

### Request via Command pattern

When `update` needs a value it can't compute purely (random, current time, anything from the outside world), return a Command that produces the value and sends it back as a Message:

```typescript
RequestedApple: () => [model, [GenerateApplePosition()]],
GeneratedApple: ({ position }) => [{ ...model, apple: position }, []],

const GenerateApplePosition = Command.define(
  'GenerateApplePosition',
  GeneratedApple,
)(
  Effect.gen(function* () {
    const x = yield* Random.nextIntBetween(0, GRID_SIZE, { halfOpen: true })
    const y = yield* Random.nextIntBetween(0, GRID_SIZE, { halfOpen: true })
    return GeneratedApple({ position: { x, y } })
  }),
)
```

The `RequestedApple` handler always returns the same result (a Command). The actual random generation happens in the Effect. The result comes back as a Message. `update` stays pure.

## Routing & navigation

Foldkit's router is **bidirectional**: one route definition both parses URLs into typed data and builds URLs from that data. Same router, both directions.

```typescript
import { Schema as S, pipe } from 'effect'
import { Route } from 'foldkit'
import { int, literal, r, slash } from 'foldkit/route'

const HomeRoute = r('Home')
const PeopleRoute = r('People', { searchText: S.Option(S.String) })
const PersonRoute = r('Person', { personId: S.Number })
const NotFoundRoute = r('NotFound', { path: S.String })

const AppRoute = S.Union([HomeRoute, PeopleRoute, PersonRoute, NotFoundRoute])
type AppRoute = typeof AppRoute.Type

const homeRouter = pipe(Route.root, Route.mapTo(HomeRoute))
const peopleRouter = pipe(
  literal('people'),
  Route.query(S.Struct({ searchText: S.OptionFromOptional(S.String) })),
  Route.mapTo(PeopleRoute),
)
const personRouter = pipe(
  literal('people'),
  slash(int('personId')),
  Route.mapTo(PersonRoute),
)

// More specific routes first.
const routeParser = Route.oneOf(personRouter, peopleRouter, homeRouter)
const urlToAppRoute = Route.parseUrlWithFallback(routeParser, NotFoundRoute)
```

Order matters in `Route.oneOf` — put more specific routes first. `/people/:id` must come before `/people`.

### Building URLs

Same router, opposite direction:

```typescript
homeRouter()                                         // '/'
peopleRouter({ searchText: Option.some('alice') })   // '/people?searchText=alice'
personRouter({ personId: 42 })                       // '/people/42'

// In a view, type-safe links:
h.a([h.Href(personRouter({ personId: person.id }))], [person.name])
```

TypeScript ensures you provide the correct data. If `personRouter` expects `{ personId: number }`, you can't accidentally pass a string or forget the parameter.

### Navigation Commands

```typescript
import { Navigation } from 'foldkit'

Navigation.pushUrl(url)     // Push to history (back button works)
Navigation.replaceUrl(url)  // Replace current entry
Navigation.back()           // Browser back
Navigation.forward()        // Browser forward
Navigation.load(href)       // Full page load (external)
Navigation.openUrl(url)     // Open in new tab/window
```

Wrap each in a Command at the call site, mapping the result to a `Completed*` Message:

```typescript
const NavigateInternal = Command.define(
  'NavigateInternal',
  { url: S.String },
  CompletedNavigateInternal,
)(({ url }) =>
  Navigation.pushUrl(url).pipe(Effect.as(CompletedNavigateInternal())),
)
```

When a link is clicked, the `routing.onUrlRequest` handler receives `Internal | External`. Handle Internal with `pushUrl`, External with `load`. After `pushUrl`/`replaceUrl` changes the URL, Foldkit calls `routing.onUrlChange` with the new URL — that's where you parse and update the Model.

### Always key the route content

Branching views must be keyed (see [Keying](#keying)). Without a key, the virtual DOM patches one route's tree into another, causing stale input state, mismatched event handlers, and bugs that are extremely hard to track down:

```typescript
const routeContent = M.value(model.route).pipe(
  M.tagsExhaustive({
    Home: () => homeView(model),
    Products: () => productsView(model),
    NotFound: ({ path }) => notFoundView(path),
  }),
)

return {
  title: `${model.route._tag} — Shop`,
  body: h.div([], [
    navView(model.route),
    h.main([], [h.keyed('div')(model.route._tag, [], [routeContent])]),
  ]),
}
```

### Query parameters

`Route.query(Schema)` adds typed query-param parsing. Use `S.OptionFromOptional(...)` for optional params, `S.FiniteFromString` for numbers, `S.Literals([...])` for finite string sets.

## Field validation

Each form field is a four-state discriminated union: `NotValidated`, `Validating`, `Valid`, `Invalid`. This makes it impossible to render a success indicator while an error exists or show a spinner when validation is already complete.

```typescript
import { Field, email, makeRules, minLength } from 'foldkit/fieldValidation'

const usernameRules = makeRules({
  rules: [minLength(3, 'Must be at least 3 characters')],
})

const emailRules = makeRules({
  required: 'Email is required',                     // Empty → Invalid
  rules: [email('Please enter a valid email address')],
})

const Model = S.Struct({
  username: Field,
  email: Field,
})
```

Each rule is a `[predicate, errorMessage]` tuple. Foldkit ships built-in rules (`minLength`, `maxLength`, `pattern`, `email`, `url`, `startsWith`, `endsWith`, `includes`, `equals`, `oneOf`). Write your own:

```typescript
const noConsecutiveSpaces: Rule = [
  value => !/  /.test(value),
  'Cannot contain consecutive spaces',
]
```

### Applying validation

```typescript
const validateUsername = validate(usernameRules)

ChangedUsername: ({ value }) => [
  evo(model, { username: () => validateUsername(value) }),
  [],
],
```

`validate(rules)(value)` returns one of the four `Field` variants, failing fast at the first failing rule. `validateAll(rules)` collects every failing rule into the `errors` array.

### Async validation

For server-side checks ("Is this email taken?"), use `Validating` as a bridge: run `validate` first, transition to `Validating`, fire a Command, handle the result. Race conditions are prevented by an incrementing `validationId` — each keystroke increments it, and the result handler only applies if the ID still matches.

```typescript
ChangedEmail: ({ value }) => {
  const syncResult = validateEmail(value)
  const validationId = Number.increment(model.emailValidationId)
  return M.value(syncResult).pipe(
    M.tag('Valid', () => [
      evo(model, {
        email: () => Validating({ value }),
        emailValidationId: () => validationId,
      }),
      [CheckEmailAvailable({ email: value, validationId })],
    ]),
    M.orElse(() => [
      evo(model, { email: () => syncResult, emailValidationId: () => validationId }),
      [],
    ]),
  )
},

ValidatedEmail: ({ validationId, field }) =>
  validationId === model.emailValidationId
    ? [evo(model, { email: () => field }), []]
    : [model, []],
```

### Cross-field validation

A `Rule` only sees one value. For checks that compare fields (confirm-password matches password), handle the logic in `update` where you have the full Model.

### Form gating

`allValid([[field, rules], ...])` walks every pair. Required rules demand `Valid`; optional rules also accept `NotValidated`. Use this as the disabled gate on a submit button.

## Resources vs Managed resources

### Resources (app-lifetime)

For browser singletons that need to live for the entire app: `AudioContext`, `RTCPeerConnection`, `CanvasRenderingContext2D`. Define a `Context.Service`, pass its default layer to `makeProgram` via `resources`.

```typescript
import { Context, Effect, Layer } from 'effect'

class AudioContextService extends Context.Service<AudioContextService, AudioContext>()(
  'AudioContextService',
) {
  static readonly Default = Layer.sync(this, () => new AudioContext())
}

const PlayNote = Command.define(
  'PlayNote',
  { frequency: S.Number, duration: S.Number },
  CompletedPlayNote,
)(({ frequency, duration }) =>
  Effect.gen(function* () {
    const audioContext = yield* AudioContextService
    // ...
    return CompletedPlayNote()
  }),
)

const program = Runtime.makeProgram({
  ...,
  resources: AudioContextService.Default,
})
```

For multiple services: `Layer.mergeAll(A.Default, B.Default, C.Default)`.

**When NOT to use Resources.** Stateless services like `HttpClient` or `BrowserKeyValueStore` should be provided per-Command with `Effect.provide`. Per-Command provision keeps the dependency in the Command's type signature — readers can tell at a glance which Commands hit the network. Hoisting these into resources erases that signal. Use a one-line helper to avoid boilerplate:

```typescript
const withHttp = <A, E>(effect: Effect.Effect<A, E, HttpClient.HttpClient>) =>
  Effect.provide(effect, FetchHttpClient.layer)
```

### Managed Resources (model-scoped)

For stateful resources that should only exist while the Model is in a particular state — camera stream during a video call, WebSocket while on a chat page, Web Worker pool during a computation:

```typescript
import { ManagedResource } from 'foldkit'

const CameraStream = ManagedResource.tag<MediaStream>()('CameraStream')

const ManagedResourceDeps = S.Struct({
  camera: S.Option(S.Struct({ facingMode: S.String })),
})

const managedResources = ManagedResource.makeManagedResources(ManagedResourceDeps)<
  Model,
  Message
>({
  camera: {
    resource: CameraStream,
    modelToMaybeRequirements: model =>
      pipe(
        model.callState,
        Option.liftPredicate((cs): cs is typeof InCall.Type => cs._tag === 'InCall'),
        Option.map(cs => ({ facingMode: cs.facingMode })),
      ),
    acquire: ({ facingMode }) =>
      Effect.tryPromise(() => navigator.mediaDevices.getUserMedia({ video: { facingMode } })),
    release: stream =>
      Effect.sync(() => stream.getTracks().forEach(track => track.stop())),
    onAcquired: () => AcquiredCamera(),
    onReleased: () => ReleasedCamera(),
    onAcquireError: error => FailedAcquireCamera({ error: String(error) }),
  },
})
```

When `modelToMaybeRequirements` transitions from `Option.none()` to `Option.some(params)`, the resource is acquired and `onAcquired` is dispatched. When it goes back to `Option.none()`, the resource is released and `onReleased` fires. If the params change while active (e.g. switching cameras), the old resource is released and a new one is acquired with the new params. Failed acquisition dispatches `onAcquireError` — no crash.

### Accessing in Commands

Commands access the resource via `.get`. Since the resource might not be active, `.get` can fail with `ResourceNotAvailable`. The type system enforces handling:

```typescript
const TakePhoto = Command.define('TakePhoto', SucceededTakePhoto, CameraUnavailable)(
  Effect.gen(function* () {
    const stream = yield* CameraStream.get
    // ...
    return SucceededTakePhoto({ width, height })
  }).pipe(
    Effect.catchTag('ResourceNotAvailable', () => Effect.succeed(CameraUnavailable())),
  ),
)
```

This `catchTag` is a safety net. If your Model correctly gates Commands (only dispatching `TakePhoto` after `AcquiredCamera` has been received), the catch never fires. But if there's a bug, you get a graceful error instead of a crash.

## Submodels

Once your app has 30 Messages and a sprawling Model, decompose into Submodels. Each Submodel has its own Model, Message, update, view, init — same architecture, scoped to a feature. Composition is explicit: the parent embeds the child's Model, wraps the child's Messages, and delegates in update.

### The child module

The child is self-contained and knows nothing about its parent:

```typescript
// page/settings/model.ts
export const Model = S.Struct({ theme: S.String })
export type Model = typeof Model.Type

// page/settings/message.ts
export const ChangedTheme = m('ChangedTheme', { theme: S.String })
export const Message = S.Union([ChangedTheme])
export type Message = typeof Message.Type

// page/settings/update.ts
export const update = (model: Model, message: Message) =>
  M.value(message).pipe(
    M.tagsExhaustive({
      ChangedTheme: ({ theme }) => [evo(model, { theme: () => theme }), []],
    }),
  )
```

### Parent embedding

Three jobs: embed the Model, wrap the Messages, delegate in update.

**Embed:**
```typescript
export const Model = S.Struct({
  username: S.String,
  settings: Settings.Model,
})
```

**Wrap with `Got*Message`:**
```typescript
export const GotSettingsMessage = m('GotSettingsMessage', { message: Settings.Message })
export const Message = S.Union([GotSettingsMessage])
```

The `Got*Message` prefix is load-bearing: the DevTools Submodel filter requires it. Without it, child Messages won't appear in the filterable list.

**Delegate:**
```typescript
GotSettingsMessage: ({ message }) => {
  const [nextSettings, commands] = Settings.update(model.settings, message)

  const mappedCommands = Array.map(
    commands,
    Command.mapEffect(Effect.map(message => GotSettingsMessage({ message }))),
  )

  return [evo(model, { settings: () => nextSettings }), mappedCommands]
},
```

`Command.mapEffect` transforms the inner Effect (turning child Messages into parent Messages) while preserving the Command's name — traces still show the child's Command name.

For Mounts that surface from the child, `Mount.mapMessage(action, toParentMessage)` does the same lift. The original `Mount.define` name is preserved through the lift.

### Wiring the view

The child's view is generic over `ParentMessage` and binds `html<ParentMessage>()` inside. The parent invokes it with its own Message type and a `toParentMessage` callback:

```typescript
// page/settings/view.ts
export const view = <ParentMessage>(
  model: Model,
  toParentMessage: (message: Message) => ParentMessage,
): Html => {
  const h = html<ParentMessage>()
  return h.button(
    [h.OnClick(toParentMessage(ChangedTheme({ theme: 'dark' })))],
    ['Use dark theme'],
  )
}

// main.ts (parent)
export const view = (model: Model): Document => {
  const h = html<Message>()
  return {
    title: 'My App',
    body: h.div([], [
      Settings.view<Message>(model.settings, message =>
        GotSettingsMessage({ message }),
      ),
    ]),
  }
}
```

The same `Settings.view` can be embedded under any parent that supplies the same wrapping. The child has no static dependency on a particular parent's Message type.

### Multiple instances

For several instances of the same child, embed each as a separate field. For a dynamic number, use an array and include an ID in the wrapper Message to route updates to the correct instance.

## OutMessage

When the child Submodel needs to tell the parent that something significant happened — login succeeded, item added to cart, route should change — the child can't update parent state and shouldn't know about it. That breaks encapsulation. OutMessage is the seam: the child emits a semantic event ("login succeeded, here's the session"), the parent decides what to do with it.

### Defining

OutMessages live alongside the child's Message, follow the same past-tense naming. `SucceededLogin`, not `TransitionToLoggedIn`.

```typescript
// page/login/message.ts
export const SubmittedLoginForm = m('SubmittedLoginForm')
export const Message = S.Union([SubmittedLoginForm])

export const SucceededLogin = m('SucceededLogin', { sessionId: S.String })
export const OutMessage = S.Union([SucceededLogin])
export type OutMessage = typeof OutMessage.Type
```

### Emitting from the child

The child's update returns a **3-tuple** instead of the usual 2-tuple: `[Model, Commands, Option<OutMessage>]`. Most Messages return `Option.none()`. Only the significant moments return `Option.some(...)`:

```typescript
export const update = (model: Model, message: Message): [
  Model,
  ReadonlyArray<Command.Command<Message>>,
  Option.Option<OutMessage>,
] =>
  M.value(message).pipe(
    M.tagsExhaustive({
      SubmittedLoginForm: () => [model, [login(model.email, model.password)], Option.none()],
      SucceededRequestLogin: ({ sessionId }) => [
        model,
        [],
        Option.some(SucceededLogin({ sessionId })),
      ],
    }),
  )
```

### Handling in the parent

The parent uses `Option.match` on the OutMessage. `onNone` means the child handled it internally; `onSome` means the parent needs to act:

```typescript
GotLoginMessage: ({ message }) => {
  const [nextLogin, commands, maybeOut] = Login.update(model.login, message)

  const mappedCommands = Array.map(
    commands,
    Command.mapEffect(Effect.map(m => GotLoginMessage({ message: m }))),
  )

  return Option.match(maybeOut, {
    onNone: () => [evo(model, { login: () => nextLogin }), mappedCommands],
    onSome: outMessage =>
      M.value(outMessage).pipe(
        M.tagsExhaustive({
          SucceededLogin: ({ sessionId }) => [
            LoggedIn({ sessionId }),                         // Full Model transition
            [...mappedCommands, saveSession(sessionId)],
          ],
        }),
      ),
  })
},
```

This is where the power shows. When `SucceededLogin` arrives, the parent can do things the child has no knowledge of: transition to a different Model state, save the session, redirect. The child stays focused on its domain; the parent handles cross-cutting concerns.

## Subscription organization

Once Submodels emit Subscriptions, you need a story for where the definitions live and who translates child Streams into parent Messages. The shape mirrors how `update` and `view` compose.

### Three verbs

| Verb | What it does | When |
|---|---|---|
| `Subscription.make` | Declares Subscriptions at the current level. | The current level has its own Subscriptions to declare. |
| `Subscription.lift` | Lifts a child Submodel's Subscriptions into the current level's Model and Message via a `toChildModel` lens and a `toParentMessage` constructor. | Embedding a child whose Subscriptions all share the same wrapper Message. |
| `Subscription.aggregate` | Combines two or more Subscription records into one. Throws at startup on duplicate keys. | A level combines multiple sources (lifted children + inline entries). |

### Organization principles

- **Submodel cohesion.** A Submodel's Subscription wiring belongs next to its Model, Message, init, update, view.
- **One wrap per level.** A Subscription file produces Messages in its own Message type only. The parent wraps via `Subscription.lift`.
- **Uniform interface.** Every Submodel that exposes Subscriptions exports one named value: `subscriptions = Subscription.make(...)`. Parents combine via `Subscription.aggregate`.

### Composing

**Leaf Submodel:**
```typescript
export const subscriptions = Subscription.make<Model, Message>()(entry => ({
  escapeKey: entry({ isOpen: S.Boolean }, {
    modelToDependencies: model => ({ isOpen: model.isOpen }),
    dependenciesToStream: ({ isOpen }) =>
      Stream.when(
        Stream.fromEventListener<KeyboardEvent>(document, 'keydown').pipe(
          Stream.filter(event => event.key === 'Escape'),
          Stream.map(PressedEscape),
        ),
        Effect.sync(() => isOpen),
      ),
  }),
}))
```

**Composing Submodel:**
```typescript
const themeMenuSubscriptions = Subscription.lift(ThemeMenu.subscriptions)<Model, Message>({
  toChildModel: model => model.themeMenu,
  toParentMessage: message => GotThemeMenuMessage({ message }),
})

const localSubscriptions = Subscription.make<Model, Message>()(entry => ({
  // ... local entries
}))

export const subscriptions = Subscription.aggregate<Model, Message>()(
  themeMenuSubscriptions,
  localSubscriptions,
)
```

**Root:** same shape as a composing Submodel; lifts target the root Model and Message.

## Project organization

Starting simple: one `main.ts` with Model, Messages, update, init, view. Plus `entry.ts`. Stay here until the single file becomes hard to navigate.

As the app grows and you use Submodels, the canonical layout:

```
src/
├── entry.ts             Runtime bootstrap
├── main.ts              App-level init re-exports
├── model.ts             App-level state
├── message.ts           App-level messages
├── route.ts             Route definitions
├── update.ts            App-level update
├── subscription.ts      App-level subscriptions
│
├── page/                One folder per page or feature
│   ├── index.ts         Re-exports all pages
│   ├── home/
│   │   ├── index.ts     Re-exports the Home module
│   │   ├── model.ts
│   │   ├── message.ts
│   │   ├── update.ts
│   │   └── view.ts
│   └── products/
│       └── ...
│
└── domain/              Business logic spanning multiple pages
    ├── index.ts
    ├── cart.ts
    └── item.ts
```

Each page folder mirrors The Elm Architecture. As pages grow, split further into `view/` and `update/` subfolders.

### Domain modules

For business logic that spans multiple pages, create `domain/`. Each file is a domain concept with its schema and pure functions:

```typescript
// domain/cart.ts
export const Cart = S.Array(CartItem)
export type Cart = typeof Cart.Type

export const addItem = (item: Item) => (cart: Cart): Cart => { /* ... */ }
export const removeItem = (itemId: string) => (cart: Cart): Cart => { /* ... */ }
export const totalItems = (cart: Cart): number => { /* ... */ }
```

### Index re-exports

```typescript
// page/home/index.ts
export * as Model from './model'
export * as Message from './message'
export * from './init'
export * from './update'
export * from './view'

// page/index.ts
export * as Home from './home'
export * as Products from './products'

// domain/index.ts
export * as Cart from './cart'
export * as Item from './item'
```

Then:

```typescript
import { Cart, Item } from './domain'
import { Home, Products } from './page'

Home.Model
Home.view(model.home, m => HomeMessage({ message: m }))
Cart.addItem(item)(cart)
```

The pattern gives discoverability (`Home.` shows everything available) while keeping imports clean.

## Keying

Snabbdom (Foldkit's virtual DOM diff engine) patches one tree into another when the same DOM position renders different content. Without a key, this causes stale input state, mismatched event handlers, and carried-over focus. **Always key branch points.**

`keyed` tells Snabbdom that when the key changes, the old tree should be fully removed and the new tree inserted fresh — no diffing, no patching, no carryover.

### Three places keying matters

**1. Branching views** — a position rendering different content based on a value:

```typescript
const routeContent = M.value(model.route).pipe(
  M.tagsExhaustive({
    Products: () => productsView(model),
    Cart: () => cartView(model),
    Checkout: () => checkoutView(model),
    NotFound: ({ path }) => notFoundView(path),
  }),
)

return h.main([], [h.keyed('div')(model.route._tag, [], [routeContent])])
```

The same rule applies to any control-flow branch that produces different content: `Match`, `if/else`, ternaries.

**2. Mapped list items** — key by a stable model identifier (id, UUID), never by array position:

```typescript
h.ul(
  [],
  entries.map(entry =>
    h.keyed('li')(entry.id, [], [
      h.input([
        h.Value(entry.text),
        h.OnInput(text => EditedEntry({ id: entry.id, text })),
      ]),
    ]),
  ),
)
```

Positional diffing looks correct until an entry is removed from the middle of the list or the list reorders.

**3. Conditional inserts** — when a child appears or disappears between stable siblings, key each of them:

```typescript
h.div([], [
  h.keyed('div')('summary', [], [summaryView(model)]),
  ...(model.hasDiscount
    ? [h.keyed('div')('discount', [], [discountView(model)])]
    : []),
  h.keyed('div')('checkout', [], [checkoutView(model)]),
])
```

Snabbdom's diff can sometimes handle conditional inserts correctly by tag and class, but that's implicit. Explicit keys are clear intent and stay correct across refactors.

## Immutability with `evo`

Foldkit provides `evo` from `foldkit/struct` for immutable Model updates. It wraps Effect's `Struct.evolve` with stricter type checking. If you remove or rename a Model key, you get type errors everywhere you try to update it.

```typescript
import { evo } from 'foldkit/struct'

const newModel = evo(model, {
  count: count => count + 1,
  lastUpdated: () => Date.now(),    // Note: in update this would be a Command; example only
})

// Invalid keys are caught at compile time:
const bad = evo(model, {
  counnt: count => count + 1,       // ❌ Error: 'counnt' does not exist
})
```

Each property is a function `(current) => next`. Properties not included remain unchanged (by reference — important for view memoization). Use `evo` over spread syntax for every Model update.

## View memoization

Every Model change triggers a full `view(model)` call. For large subtrees that change infrequently, memoize with `createLazy` (single slot) or `createKeyedLazy` (per-key slots).

```typescript
import { createLazy, createKeyedLazy, html } from 'foldkit/html'

// Define the view function at MODULE LEVEL (stable reference).
const statsView = (revenue, orderCount, topProducts) => { /* ... */ }

// Create the lazy slot at MODULE LEVEL.
const lazyStats = createLazy()

// In view: wrap the call. If all args are referentially equal to last render,
// return the cached VNode — Snabbdom short-circuits on VNode reference equality.
const view = (model: Model) => {
  return {
    body: h.div([], [
      lazyStats(statsView, [model.revenue, model.orderCount, model.topProducts]),
    ]),
  }
}
```

**Both the view function and the lazy slot must be defined at module level.** If defined inside the view, a new reference is created each render and the cache is defeated.

Arguments are compared by reference (`===`), not value. This works naturally with `evo`: when a field isn't updated, `evo` preserves its reference. Only fields that actually changed get new references.

### `createKeyedLazy` for lists

```typescript
const contactView = (name, email, isSelected) => { /* ... */ }
const lazyContact = createKeyedLazy()

const contactListView = (contacts, maybeSelectedId) =>
  h.ul([], contacts.map(contact => {
    const isSelected = Option.exists(maybeSelectedId, id => id === contact.id)
    return lazyContact(contact.id, contactView, [contact.name, contact.email, isSelected])
  }))
```

When one item changes, only that item is recomputed. Others return their cached VNodes. Turns `O(n)` view rebuilds into `O(1)` when only a few items change.

**One slot per position.** A cached VNode can only be rendered at one position in the tree. If the same content needs to appear in multiple positions, create a separate lazy slot per position.

### When to memoize

Use lazy views when:
- A large subtree changes infrequently relative to how often its parent re-renders
- A list has many items but only a few change at a time (table of contents, contact lists, dashboards)
- The view function is expensive (deeply nested trees, many elements)

Don't memoize small views, views that change on every Model update, or leaf nodes. The check itself has small cost, so applying it everywhere adds overhead without benefit. If the [Slow View warning](#crash-view-slow-view-freeze-model) fires, memoization is usually the answer.

## Testing — Story (state machine)

`Story.story` simulates the update loop. Send Messages, resolve Commands inline, assert on the Model. Pure, deterministic, fast. Use Story for update logic, edge cases, and Command wiring.

```typescript
import { Story } from 'foldkit'
import { expect, test } from 'vitest'

test('delayed reset: count resets after the delay fires', () => {
  Story.story(
    update,
    Story.with({ count: 5 }),
    Story.message(ClickedResetAfterDelay()),
    Story.Command.expectExact(DelayReset),
    Story.Command.resolve(DelayReset, CompletedDelayReset()),
    Story.model(model => {
      expect(model.count).toBe(0)
    }),
  )
})
```

### API surface

| Step | What it does |
|---|---|
| `Story.story(update, ...steps)` | Runs the test. Throws on unresolved Commands at end. |
| `Story.with(model)` | Sets the initial Model. |
| `Story.message(msg)` | Dispatches a Message. Throws if there are unresolved Commands. |
| `Story.model(fn)` | Asserts on the current Model. |
| `Story.Command.resolve(Def, result)` | Resolves first pending Command matching `Def` by feeding `result` through update. |
| `Story.Command.resolveAll([Def, result], ...)` | Resolves multiple in order. Composes with `Array.makeBy(n, () => [Def, msg])`. |
| `Story.Command.expectHas(...)` | Subset check: these Commands are pending. Accepts Defs or instances. |
| `Story.Command.expectExact(...)` | Pending Commands are exactly these (order-independent). |
| `Story.Command.expectNone()` | No pending Commands. |
| `Story.expectOutMessage(msg)` | Asserts on the OutMessage produced this step. |
| `Story.expectNoOutMessage()` | No OutMessage this step. |

### Definition vs instance matchers

```typescript
// Definition: matches by name only.
Story.Command.expectHas(FetchWeather)

// Instance: matches by name AND structural-equal args. Catches arg regressions.
Story.Command.expectHas(FetchWeather({ zipCode: '90210' }))
```

Prefer instances when args are part of what you're verifying. `FetchWeather({ zipCode: '90210' })` fails if the runtime dispatched `FetchWeather({ zipCode: '99999' })`, where the Definition-only matcher would pass.

### Story doesn't render the view

Story doesn't run the view, so the Mount lifecycle is not observable from a Story test. Tests that need to acknowledge mounts use Scene (see below). Story tests can be run against a child Submodel's update in isolation — the function signature is the contract and works the same whether the parent calls it or the test does.

### Testing the Effects inside Commands

Story tests the state machine. The actual Effect inside a Command is tested separately with `Effect.provide` and a mock service layer:

```typescript
const mockClient = HttpClient.make(request => Effect.sync(() => /* ... */))

const message = await fetchWeather('90210').effect.pipe(
  Effect.provide(Layer.succeed(HttpClient.HttpClient, mockClient)),
  Effect.runPromise,
)

expect(message._tag).toBe('SucceededFetchWeather')
```

Two levels, clean separation: the simulation proves the state machine wires correctly, `Effect.provide` proves the side effect works.

## Testing — Scene (view)

`Scene.scene` exercises the view. Find elements the way users do (by role, label, placeholder), invoke interactions, assert on the rendered tree. The view function runs on every step, so if it crashes or renders the wrong thing, the test catches it. No DOM, no JSDOM, no browser — Scene operates on the VNode tree directly.

```typescript
import { Scene } from 'foldkit'
import { test } from 'vitest'

test('type a zip code, click get weather, see the forecast', () => {
  Scene.scene(
    { update, view },
    Scene.with(model),

    Scene.type(Scene.label('Zip code'), '90210'),
    Scene.click(Scene.role('button', { name: 'Get Weather' })),
    Scene.expect(Scene.role('button', { name: 'Loading...' })).toExist(),

    Scene.Command.expectExact(FetchWeather({ zipCode: '90210' })),
    Scene.Command.resolve(FetchWeather, SucceededFetchWeather({ weather })),

    Scene.inside(
      Scene.role('article'),
      Scene.expect(Scene.text('Beverly Hills, California')).toExist(),
      Scene.expect(Scene.text('72°F')).toExist(),
    ),
  )
})
```

### Always run Scene from the root

Scene must always run against the root `update` and `view`. In a Submodel app, only the root view has the `(model) => Document` signature Scene expects. Testing a child view in isolation means inventing a code path that never runs in production: the parent's Command mapping, OutMessage handling, and Model transitions would all be invisible. Test what users see, through the same code path they use.

### Locators

Locators find elements the way users find them. Each factory returns a single-match `Locator`. Interactions and assertions also accept raw CSS selector strings:

| Locator | Finds |
|---|---|
| `Scene.role(role, { name?, level?, checked?, selected?, pressed?, expanded?, disabled? })` | By ARIA role (explicit or implicit). The most common locator. `name` matches accessible name (string = exact, regex = full). |
| `Scene.label(text)` | Form controls by aria-label or associated `<label>` text. |
| `Scene.placeholder(text)` | Inputs by their placeholder. |
| `Scene.text(text)` | Elements by visible text content. |
| `Scene.altText(text)` | Images by their alt. |
| `Scene.title(text)` | Elements by their title attribute. |
| `Scene.testId(id)` | By `data-testid`. The escape hatch — prefer the accessible queries. |
| `Scene.displayValue(value)` | Form controls by their current value. |
| `Scene.selector(css)` | By CSS selector. Use when no accessible query fits. |

### Scoping

```typescript
// Scope a single locator
Scene.within(Scene.role('region', { name: 'Sidebar' }), Scene.role('link'))

// Scope a block of steps
Scene.inside(
  Scene.role('dialog', { name: 'Confirm' }),
  Scene.expect(Scene.role('heading')).toHaveText('Delete item?'),
  Scene.click(Scene.role('button', { name: 'Cancel' })),
)
```

### Multi-match

`Scene.all.*` factories return a `LocatorAll`. Pick one with `Scene.first`/`Scene.last`/`Scene.nth(i)`, or narrow with `Scene.filter({ has, hasNot, hasText, hasNotText })`:

```typescript
Scene.first(Scene.all.role('row'))
pipe(Scene.all.role('row'), Scene.filter({ hasText: 'Alice' }), Scene.first)
Scene.expectAll(Scene.all.role('row')).toHaveCount(3)
```

### Interactions

| Step | Invokes |
|---|---|
| `Scene.click(target)` | `OnClick` (bubbles to ancestors) |
| `Scene.doubleClick(target)` | `OnDoubleClick` |
| `Scene.pointerDown/Up(target, { pointerType?, button?, screenX?, screenY? })` | `OnPointerDown`/`OnPointerUp` |
| `Scene.hover(target)` | `OnMouseEnter` (falls back to `OnMouseOver`) |
| `Scene.focus/blur(target)` | `OnFocus`/`OnBlur` |
| `Scene.type(target, text)` | `OnInput` |
| `Scene.change(target, value)` | `OnChange` (for `<select>`) |
| `Scene.keydown(target, key, { shiftKey?, ctrlKey?, altKey?, metaKey? })` | `OnKeyDown`/`OnKeyDownPreventDefault` |
| `Scene.submit(target)` | `OnSubmit` |
| `Scene.changeFiles(target, files)` | `OnFileChange` |
| `Scene.dropFiles(target, files)` | `OnDropFiles` |
| `Scene.tap(fn)` | Run a function for side effects without breaking the chain. |

### Assertions

```typescript
Scene.expect(Scene.role('heading')).toExist()
Scene.expect(Scene.role('heading')).toHaveText('Welcome')
Scene.expect(Scene.role('heading')).toHaveText(/^Welcome/)
Scene.expect(Scene.role('heading')).toContainText('Welcome')
Scene.expect(Scene.role('dialog')).toBeAbsent()
Scene.expect(Scene.role('status')).toBeVisible()
Scene.expect(Scene.role('region')).toHaveAccessibleName('User session')
Scene.expect(Scene.label('Email')).toHaveValue('alice@example.com')
Scene.expect(Scene.role('button')).toBeDisabled()
Scene.expect(Scene.role('button')).not.toBeDisabled()      // .not on every matcher
```

Multi: `Scene.expectAll(Scene.all.role('row')).toHaveCount(3)`.

### Commands

Same Command-resolution semantics as Story. Scene tracks each Command as pending until resolved with the result Message its Effect would have produced. Resolving may cascade — resolving Command A produces Command B, and B resolves within the same `resolveAll`.

```typescript
Scene.Command.expectExact(FetchWeather({ zipCode: '90210' }))
Scene.Command.resolve(FetchWeather, SucceededFetchWeather({ weather }))
Scene.Command.resolveAll(
  [RequestAuthentication, SucceededRequestAuthentication({ session })],
  [TrackSignInAttempt, CompletedTrackSignInAttempt()],
)

// Submodel lift — child Command resolves with parent-wrapped Message:
Scene.Command.resolve(
  Search.FetchSuggestions,
  Search.SucceededFetchSuggestions({ suggestions }),
  message => GotSearchMessage({ message }),
)
```

Interactions throw if there are unresolved Commands. `Scene.scene` throws at the end if any remain.

### Mounts

When a rendered view contains `OnMount`, Scene tracks it as pending until the test resolves it with the result Message its Effect would have produced. Many UI components in `foldkit/ui` declare mounts internally (popovers positioning their panels, dialogs portaling backdrops, components handing the live element to a third-party library). The same `OnMount` shows up in the VNode tree, and Scene treats it as a pending mount.

```typescript
Scene.click(Scene.role('button', { name: 'Open' }))
Scene.Mount.expectExact(Ui.Popover.AnchorPopover)
Scene.Mount.resolve(Ui.Popover.AnchorPopover, Ui.Popover.CompletedAnchorPopover())

// When the mount unmounts during the test, acknowledge it:
Scene.Mount.expectEnded(Ui.Popover.AnchorPopover)
```

Every Mount that fires and unmounts during a scene must be acknowledged with `Scene.Mount.expectEnded`, even if it was already resolved. `resolve` handles the result Message; `expectEnded` handles the unmount. Unacknowledged unmounts throw at scene end.

`Scene.Mount.expectExact`, `expectHas`, `expectNone`, `resolveAll` follow the Command analogs.

### Story vs Scene

Use **Story** for update logic, edge cases, Command wiring, and any test that benefits from running against a child Submodel in isolation. Use **Scene** for user flows, view rendering, accessibility, and anything that needs to see the rendered tree (route changes, conditional rendering, dialog opening with its Mount). A well-tested app uses both.

## DevTools

Foldkit's DevTools is enabled by default in dev. It renders inside a shadow DOM (doesn't interfere with styles), shows every Message dispatched, lets you inspect Model/Message/Commands/Mounts at any point, and supports time-travel scrub.

Configure via `makeProgram({ devTools: { ... } })`:

- `show`: `'Development'` (default) or `'Always'` — enable in dev only or in all environments
- `position`: `'BottomRight'` (default), `'BottomLeft'`, `'TopRight'`, `'TopLeft'`
- `mode`: `'TimeTravel'` (default) or `'Inspect'`. Time-travel pauses on click; Inspect snapshots without pausing. Use `{ development: 'TimeTravel', production: 'Inspect' }` to differ by environment.
- `banner`: optional string at the top of the panel
- `Message`: your `Message` Schema (required for the MCP bridge)
- `excludeFromHistory`: array of Message `_tag` values to keep out of history (high-frequency dispatchers like frame ticks)
- `maxEntries`: history size (default 100, clamped 20–500)

Pass `devTools: false` to disable entirely.

### MCP bridge

The DevTools MCP server (`@foldkit/devtools-mcp`) exposes a running app to AI agents. Agents can read the current Model, list/inspect Message history, rewind, and dispatch Messages. Setup: `npx @foldkit/devtools-mcp init` in project root, then add `devToolsMcpPort` to the Vite plugin config and `Message` to `devTools` in `makeProgram`. Tools appear under `foldkit-devtools` once the dev server is running and the app is open in a browser tab.

## Crash view, slow view, freeze model

### Crash view

When Foldkit hits an unrecoverable error during `update`, `view`, or Command execution, it stops processing and renders a fallback UI. **There is no recovery.** The runtime is dead.

Default: built-in screen with error message and reload button. Customize via `crash.view`:

```typescript
const crashView = ({ error, model, message }: Runtime.CrashContext<Model, Message>): Document => {
  const h = html<never>()                                  // never — runtime is dead
  return {
    title: 'Something went wrong',
    body: h.div([], [
      h.h1([], ['Something went wrong']),
      h.p([], [error.message]),
      h.button(
        [h.Attribute('onclick', 'location.reload()')],     // Raw DOM handler
        ['Reload'],
      ),
    ]),
  }
}
```

Call `html<never>()` because no Messages will ever be dispatched. Use raw `Attribute('onclick', ...)` for interactivity since `OnClick` Messages would be silently ignored. This is the **only** exception to "use OnClick, never raw onclick."

`crash.report` is a synchronous callback for sending the error to Sentry or another logging service. Runs before `crash.view`.

### Slow view

Foldkit measures `view` execution time and warns when it exceeds the frame budget. Default threshold is 16ms (one frame at 60fps). Dev-only by default (gated behind `import.meta.hot` — zero runtime cost in production). Configure via `slowView: { thresholdMs?, onSlowView? }` or disable with `slowView: false`. The fix is usually `createLazy`/`createKeyedLazy`.

### Freeze model

Foldkit deep-freezes the Model after `init` and every `update` (dev only). Any accidental mutation throws a `TypeError` at the call site. Cost is amortized to O(diff) per update — already-frozen values short-circuit, and `evo` preserves unchanged branches by reference. Effect-tagged values (`Option`, `Result`, `DateTime`, etc.) are left untouched because they rely on `Hash.cached` lazy writes. Messages are never frozen. Disable with `freezeModel: false`.

## DOM, Render, Canvas, File, CustomElement

Short notes on the smaller modules. All API references live at `https://foldkit.dev/api-reference/...` and in `~/.cache/foldkit/packages/foldkit/src/`.

### `foldkit/dom`

DOM operations as Effects, to wrap in Commands. `Dom.focus(selector)`, `Dom.scrollIntoView`, `Dom.clickElement`, `Dom.lockScroll`, `Dom.advanceFocus`, etc. Each helper internally gates on the runtime's next render commit, so you can return a Command from `update` immediately after a state-changing Message and trust the element will exist. Failures (`ElementNotFound`) are typed — catch with `Effect.catch` or ignore with `Effect.ignore`.

### `foldkit/render`

Two primitives for synchronizing with the browser's render cycle:

- `Render.afterCommit` — resumes once the runtime has applied the latest VDOM patch. Use when you need to measure or read an element that was just brought into existence by the same Message.
- `Render.afterPaint` — resumes after the prior state has been displayed. Use for CSS transition orchestration (enter animations need the "before" state painted first).

Both are Effects you `yield` inside Commands or Subscriptions. The Dom helpers already gate on `afterCommit` internally — reach for it directly when building custom DOM Commands.

### `foldkit/canvas` (`Canvas` namespace)

Declarative 2D rendering. `Canvas.view` produces a `<canvas>` VNode whose pixels are a pure function of a `shapes` prop. Shape variants: `Rect`, `Circle`, `Path` (built from `MoveTo`/`LineTo`/`QuadTo`/`BezierTo`/`Close`), `Text`, `Group` (composes children with `translate`/`rotate`/`scale`/`opacity`). Pointer handlers (`onPointerDown`/`onPointerMove`/`onPointerUp`) receive a `Point` in canvas-local coordinates. Pair with `Subscription.animationFrame` for continuous animation.

### `foldkit/file`

Browser file APIs wrapped as Effects. `File.select(['application/pdf'])` and `File.selectMultiple(...)` open the native picker (wrap in a Command). `File.readAsText`, `File.readAsDataUrl`, `File.readAsArrayBuffer` decode contents. Event attributes: `OnFileChange` (file input), `OnDropFiles` (drop zone — call `preventDefault` for you), plus `AllowDrop`, `OnDragEnter`/`OnDragLeave` (only fire on true entry/exit, not bubbled events from child transitions). For tests: `Scene.changeFiles` and `Scene.dropFiles`.

### `foldkit/customElement` (`CustomElement` namespace)

Typed integration with native Web Components. Declare the shape (tag, properties, events) once with Schema, then mint a builder for your Message universe:

```typescript
const hexColorPicker = CustomElement.define({
  tag: 'hex-color-picker',
  properties: { color: S.String },
  events: { 'color-changed': S.Struct({ value: S.String }) },
})

const fillPicker = hexColorPicker.withMessage<Message>()

// In view:
fillPicker([
  fillPicker.Color(model.fillColor),
  fillPicker.OnColorChanged(detail => ChangedFillColor({ value: detail.value })),
])
```

Properties become PascalCase factories (`color` → `Color`). Events become `On{PascalCase}` factories from the kebab-case name (`color-changed` → `OnColorChanged`). Properties write JS properties through Snabbdom's `propsModule` (not HTML attributes), so they carry any JS value and diff across renders. Use this when the foreign DOM speaks the three regular web-component surfaces (typed JS properties, observed attributes, dispatched `CustomEvent`s). For foreign DOM that doesn't (an imperative `setValue(text)`-style code editor, a map renderer that wants its own element), use `Mount` instead.

## UI components

Foldkit ships a set of **headless, accessible** UI components in `foldkit/ui`. Each manages its own state with TEA (Model, Message, update, view) and integrates into your app via [Submodels](#submodels). Components are renderless — you provide markup and styling through a `toView` callback; the component provides ARIA, keyboard navigation, focus management, and state.

| Component | What it does |
|---|---|
| Button | Accessible button with consistent ARIA and data-attribute hooks for styling. |
| Input / Textarea | Text input with ARIA label/description linking. |
| Checkbox | Toggle with accessible labeling, keyboard support, indeterminate state, optional form integration. |
| Fieldset | Groups related form controls. Disabled state propagates to children. |
| Radio Group | Radio options with roving tabindex, keyboard navigation, per-option label/description. |
| Switch | On/off toggle. |
| Slider | Numeric range with pointer drag, keyboard step/page/home/end, ARIA slider semantics. |
| Select | Native select wrapper. |
| Listbox | Custom select dropdown with persistent selection, keyboard nav, typeahead. |
| Combobox | Autocomplete with filtering, keyboard nav, custom rendering. |
| Dialog | Modal using native `<dialog>` with focus trapping, backdrop, scroll locking. |
| Menu | Dropdown menu with keyboard nav, typeahead, `aria-activedescendant`. |
| Popover | Floating panel with arbitrary content and natural Tab navigation. |
| Disclosure | Show/hide toggle for collapsible sections. |
| Tabs | Tabbed interface with keyboard nav, Home/End, wrapping. |
| Drag and Drop | Sortable lists, cross-container movement, pointer tracking, keyboard nav, auto-scroll, screen-reader announcements. |
| File Drop | File input with drag-and-drop. Emits typed OutMessages. |
| Calendar / Date Picker | Inline calendar grid + input-with-popover variant. Locale-aware, min/max, disabled dates. |
| Toast / Tooltip | Notification surface and hover/focus tooltip. |
| Animation | CSS enter/leave animation lifecycle coordinator. Used internally by Dialog/Menu/Popover/Listbox/Combobox when `isAnimated`. Emits `TransitionedOut` for leave completion. |
| Virtual List | Windowed list rendering for large datasets. |

Each component exports its Mount definitions (`Ui.Popover.AnchorPopover`, `Ui.Listbox.AnchorListbox`, etc.) so consumer Scene tests can name them in `Scene.Mount.resolve` / `expectExact` / `expectEnded`. When you render a Dialog or Popover in a test, expect its internal mounts (anchor positioning, backdrop portaling) to appear in the pending list — resolve them like any other.

For working examples of every component, look at `~/.cache/foldkit/examples/ui-showcase/`. For component-specific docs (props, model shape, common patterns), see `~/.cache/foldkit/packages/foldkit/src/ui/<component>/`.

## The discipline (non-negotiables)

If you remember nothing else, remember this:

- **One Model. One update. One view. One loop.** Every state change flows through. No exceptions.
- **`update` and `view` are pure.** Zero side effects in either. Period. Side effects live in the six designated places, nowhere else.
- **No `NoOp`.** Every Message describes a real fact. Fire-and-forget Commands get `Completed*` Messages.
- **Verb-first, past-tense Messages.** `Clicked*`, `Updated*`, `Succeeded*`/`Failed*`, `Completed*`, `Got*Message`. Imperative names are for Commands.
- **`Match.tagsExhaustive` everywhere.** Let the compiler catch missing arms.
- **Always key branching views, mapped list items, and conditional siblings.** Without keys, Snabbdom patches incorrectly across structurally different trees.
- **Use `evo` for Model updates.** Never spread; never mutate. Unchanged branches stay reference-equal, which view memoization relies on.
- **Args captured at mount.** Mount's factory runs once; later renders' args are ignored. Name args `initial*` / `seed*`.
- **Construct resources inside `acquireRelease`.** Never before. The release function's input must be the success value of the acquire Effect.
- **Subscriptions subscribe to the Model.** Not to an event source. The event source is what the body happens to use.
- **`Got*Message` for Submodel wrappers.** DevTools' Submodel filter depends on this prefix.
- **`Command.mapEffect` and `Mount.mapMessage` when lifting child results.** The original name is preserved through the lift.
- **Scene tests run from the root.** Never from a child view in isolation.
- **No JSX. No external state stores. No Promises in `update`.** The tools you need ship with Foldkit and Effect.

## Common pitfalls

A non-exhaustive list of things to refuse, in priority order:

- **Reaching for React patterns.** No `useEffect`, no `useMemo`, no `useReducer`, no context. The Model is the context. `evo` is the reducer. `createLazy` is `useMemo`. Subscriptions are `useEffect`-shaped concerns that depend on Model state.
- **External state libraries.** No Zustand, no Jotai, no Redux Toolkit, no MobX. The Model is the state.
- **External async libraries.** No React Query, no SWR, no Apollo. Commands handle async; `Effect.catch` handles errors; Messages handle results.
- **Time / random / DOM in `update` or `view`.** Always Request via Command.
- **`NoOp` Messages, or generic `Update` / `Set` Messages.** Use `Completed*` for fire-and-forget; use specific past-tense names everywhere else.
- **Reaching for Mount when the cause is a Message.** Focus-on-open is a `FocusInput` Command from the `Opened` handler, not a `Mount` on the input.
- **Reaching for Subscription to translate Model changes into DOM side effects.** That's what `update` does on every Message via the Commands it returns. Subscriptions watch the Model to gate their *lifetime*; their emissions come from external sources.
- **Multiple `OnMount` on one element.** Silently overwrites. Bundle into one Mount that does both in acquire and releases both in release.
- **Constructing a handle before `acquireRelease`.** Leaks on interruption between construction and registration. Construct inside the acquire body.
- **Forgetting to key route content.** Causes stale input state and event handlers across navigation.
- **Forgetting to key list items.** Looks fine until a middle item is removed or the list reorders.
- **Defining a lazy view inside another view.** New function reference each render — cache never hits.
- **Spread updates (`{ ...model, foo: x }`) instead of `evo`.** Loses reference stability for unchanged fields, defeats view memoization, and breaks compile-time field checking.
- **Hoisting stateless services like `HttpClient` into Resources.** Erases the type-signature signal that says "this Command hits the network." Use per-Command `Effect.provide` with a `withHttp` helper instead.
- **Async cleanup ordering.** Mount cleanup runs on a separate fiber after Snabbdom's `destroy`. For idempotent DOM operations (`element.remove()`, observer `disconnect()`) this is fine. For ordering-sensitive cleanup, do the imperative work synchronously inside `acquire` and use `release` only for self-contained teardown.
- **Testing a child view in isolation with Scene.** Use Story for child update logic; use Scene only from the root.

## End notes (progressive disclosure)

This skill covers the high-leverage conceptual guidance — the architecture, the laws, the discipline, the patterns at scale, the testing primitives, the small modules' purpose. It is intentionally exhaustive for the day-to-day work of authoring idiomatic Foldkit code.

When something here is genuinely insufficient, descend in this order:

1. **`reference/`** — supplementary references in this skill that didn't fit at the top level:
   - [`reference/ui-components.md`](reference/ui-components.md) — per-component model shapes, slot patterns, integration recipes, Mount names exported by each component.
   - [`reference/coming-from-react.md`](reference/coming-from-react.md) — distilled React-to-Foldkit translations, side-by-side examples, where React intuition transfers and where it doesn't.

2. **`~/.cache/foldkit/`** — the vendored Foldkit repository, the ground truth. Browse it directly. Stable entry points:
   - `~/.cache/foldkit/examples/` — runnable example apps across the complexity spectrum (counter, todo, stopwatch, form, weather, routing, query-sync, snake, auth, shopping-cart, pixel-art, job-application, websocket-chat, kanban, map, canvas-art, generative-art, web-components, ui-showcase, typing-terminal). **Usually your first stop when you need a precedent.** Running code is higher-fidelity than prose.
   - `~/.cache/foldkit/packages/foldkit/src/` — framework source. The authoritative definition of every API. JSDoc comments on every exported function explain intent and edge cases.
   - `~/.cache/foldkit/packages/foldkit/src/ui/` — every UI component's source, including its Mount definitions and styling hooks.
   - `~/.cache/foldkit/CLAUDE.md` — Foldkit's own project conventions and quality bar.
   - `~/.cache/foldkit/skills/` — Foldkit's own agent skills (`generate-program`, `audit-program`) for end-to-end app generation and audit.

3. **`https://foldkit.dev/`** — the live documentation site. Every page is fetchable as Markdown by appending `.md` to the path (`https://foldkit.dev/core/architecture.md`). Useful for the small modules' API surface pages (`/api-reference/<module>.md`) that this skill doesn't enumerate exhaustively.

When something contradicts between this skill and `~/.cache/foldkit/`, **the cache wins**. Subtree-vendored source is the canonical reality of the version you are working against. This skill is a synthesis of the docs at a point in time; the framework moves.
