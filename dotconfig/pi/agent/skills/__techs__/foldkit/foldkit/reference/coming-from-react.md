# Coming from React

If your intuition is React-shaped, this is the translation layer. Most of your mental models *transfer* — they just land in different syntactic places. A few of them don't transfer and you should let them go.

This reference assumes you've read the main skill. Read that first; come here when you find yourself reaching for a React pattern and want to know the Foldkit equivalent.

## The conceptual swap

| What you're used to | Where it lives in Foldkit |
|---|---|
| `useState` | Model (a single state tree, defined with Effect Schema) |
| `useReducer` | `update` function |
| `useEffect` for one-off side effects | A Command returned from `update` |
| `useEffect` for ongoing streams (intervals, listeners, observers) | A Subscription gated on Model state |
| `useEffect` for DOM access on mount | `Mount` (with `acquireRelease` for cleanup) |
| `useRef` + `useEffect` for DOM access | Mount providing the live `Element` |
| `useContext`, Redux, Zustand, Jotai, MobX | The single Model. No prop drilling, no providers, no parallel stores. |
| `useMemo` / `useCallback` | `createLazy` / `createKeyedLazy` for view subtrees. Generally unnecessary — Foldkit has no stale-closure problem. |
| Custom hooks | Pure functions in `domain/` modules |
| JSX | Typed function-call DSL: `h.div([attrs], [children])` |
| Component props | Function parameters (subviews are `(model, ...) => Html`) |
| Component state | Embedded as a Submodel field on the parent Model |
| Event handlers (`onClick={() => fn()}`) | Messages (`h.OnClick(ClickedSave())`) |
| React Router / TanStack Router | `foldkit/route` (bidirectional biparsers) |
| React Hook Form / Formik / Zod | Model fields + Messages + `foldkit/fieldValidation` |
| RxJS / TanStack Query | Subscriptions for streams; Commands + Effect's typed error channel for requests |
| Headless UI / Radix UI / React Aria | `foldkit/ui` (every component as a TEA Submodel) |
| Error boundaries | Effect's typed error channel inside Commands + `crash.view` for unrecoverable runtime crashes |
| `useTransition` / Suspense | Loading-state fields in the Model (`isLoading: boolean`, or `Status = Idle | Loading | Loaded | Failed` tagged enum) |
| Concurrent React's tearing concerns | No tearing — one Model, one update, one render |

## What goes away

These React concerns don't exist in Foldkit. If you're reaching for them, the answer is somewhere else.

- **Stale closures.** `update` always receives the latest Model. There is no closure capturing an old state value. Add a field; use it from any handler; it's always current.
- **Dependency arrays.** Subscriptions express dependencies via `modelToDependencies` returning a typed record. The runtime restarts the stream when those deps change. No `[count, isPlaying, ...]` lint suppressions.
- **`forwardRef`, `Ref` types.** Mount gives you the `Element` directly. You never thread refs through component layers.
- **Render-cycle ordering** (hook rules, "don't call hooks in conditionals"). `view` is just a function. Call subviews from anywhere, conditionally or in a map, without restrictions.
- **`useEffect` cleanup ordering bugs.** `Effect.acquireRelease` co-locates setup and cleanup as one expression. The release function's input is the success value of the acquire body; if construction fails, no release runs. Mount and Subscription both use this.
- **Tearing between client and server state.** There is no server state. State is the Model. Server data arrives via Commands and gets folded into the Model.
- **Provider hell.** No `<Provider>` wrapping. Resources are an Effect Layer passed once to `makeProgram`. ManagedResources are wired in `makeProgram`. Everything is in one place.
- **`memo()` / `React.memo`.** View memoization is opt-in via `createLazy` / `createKeyedLazy` when profiling tells you to. The default is "rebuild the VNode tree on every Model change" — Snabbdom's diff handles this cheaply for most subtrees.
- **HMR causing stale state.** Vite + the `@foldkit/vite-plugin` HMR preserves the live Model across reloads of `main.ts`.

## What carries over (with adjustments)

- **Composition.** "Big component → smaller components" still holds — but in Foldkit, the unit is a Submodel (or just a sub-view function), not a component-with-its-own-state. Submodels embed Model + Message + update; sub-view functions are pure `(...args) => Html`.
- **Declarative views.** Same instinct, different syntax. `h.div([h.Class('...')], [h.span([], [model.name])])` is the same shape as `<div className="..."><span>{model.name}</span></div>` — the renderer is just a function call.
- **Conditional rendering.** Use `Match.tagsExhaustive` over tagged unions for the React `case` / discriminated-union pattern. Use `model.x ? a : b` or `if/else` returning `Html` for simple conditionals (and key the branches).
- **Lists with keys.** Same idea, mandatory by convention. `entries.map(e => h.keyed('li')(e.id, [], [...]))`. Never key by index.
- **Forms.** The state lives in the Model. Each field is a `Field` from `foldkit/fieldValidation` (four-state ADT). Submit is a Message. Server validation is a Command. The Hook Form / Formik intuition transfers; the implementation is dramatically simpler because you don't need to coordinate uncontrolled inputs.
- **Routing.** "URL drives state" still holds. Define routes as a tagged Schema union, parse on URL change, store the parsed route in the Model. View dispatches on `model.route._tag`.

## What does not carry over

- **The instinct to scatter state.** Resist the urge to put a UI toggle in component state because "the parent doesn't need to know." In Foldkit, the parent's Model is the only place state lives. If a Submodel has internal state, it's embedded as a field on the parent.
- **The instinct to do side effects in event handlers.** `OnClick` does not take a function. It takes a Message. The handler describes *what happened*, not what to do.
- **The instinct to fetch in components.** No fetch in view. Ever. Return a Command from update.
- **The instinct to use libraries for state and data fetching.** Zustand, Jotai, Redux Toolkit, React Query, SWR, Apollo — none of these belong in a Foldkit codebase. The Model is the state; Commands are the data fetching.
- **Strict mode "intentional double invocation."** Doesn't apply. `update` is pure; Foldkit runs it exactly once per Message in production. (DevTools may re-run `update` during time-travel replay, but that's deterministic because update is pure.)

## Side-by-side: the counter, evolved

### React: one `useState` becomes a `useState` + `useEffect` + `useRef`

In React, a play/pause auto-counter requires holding the interval ID in a ref because the effect needs to clear the previous interval before starting a new one:

```typescript
import { useEffect, useRef, useState } from 'react'

const TICK_INTERVAL_MS = 1000

function Counter() {
  const intervalRef = useRef<number>()
  const [count, setCount] = useState(0)
  const [isAutoCounting, setIsPlaying] = useState(false)

  useEffect(() => {
    if (isAutoCounting) {
      intervalRef.current = setInterval(() => {
        setCount(c => c + 1)
      }, TICK_INTERVAL_MS)
    }
    return () => clearInterval(intervalRef.current)
  }, [isAutoCounting])

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
      <button onClick={() => setIsPlaying(p => !p)}>
        {isAutoCounting ? 'Stop' : 'Auto-Count'}
      </button>
    </div>
  )
}
```

Miss the cleanup and you leak intervals. Add a `step` field that both the click and the tick read, and you've created a classic stale-closure bug — the effect captures the step value from the render at which it was scheduled.

### Foldkit: a new field, a Message, a Subscription

```typescript
const Model = S.Struct({
  count: S.Number,
  isAutoCounting: S.Boolean,
})

const ClickedIncrement = m('ClickedIncrement')
const ClickedToggleAutoCount = m('ClickedToggleAutoCount')
const Ticked = m('Ticked')

const subscriptions = Subscription.make<Model, Message>()(entry => ({
  tick: entry(
    { isAutoCounting: S.Boolean },
    {
      modelToDependencies: model => ({ isAutoCounting: model.isAutoCounting }),
      dependenciesToStream: ({ isAutoCounting }) =>
        Stream.when(
          Stream.tick(Duration.seconds(1)).pipe(Stream.map(Ticked)),
          Effect.sync(() => isAutoCounting),
        ),
    },
  ),
}))

const update = (model: Model, message: Message) =>
  M.value(message).pipe(
    M.tagsExhaustive({
      ClickedIncrement:       () => [evo(model, { count: c => c + 1 }), []],
      ClickedToggleAutoCount: () => [evo(model, { isAutoCounting: a => !a }), []],
      Ticked:                 () => [evo(model, { count: c => c + 1 }), []],
    }),
  )
```

When you add a `step` field, both `ClickedIncrement` and `Ticked` read `model.step`. The update function receives the latest Model every time a Message arrives. No refs, no sync effects, no stale closures. Add the field; use it from any case; it's always current.

## How the work scales

In React, complexity compounds. Each new feature touches existing effects, refs, and closures — adding a state field can break a hook that captured the old shape; adding an effect can race with an existing one; adding a subscription can stack listeners if cleanup is missed.

In Foldkit, complexity scales linearly. Each new feature adds Messages, update cases, possibly a Command or Subscription. They don't interact with each other through shared mutable state because there *is* no shared mutable state. Read the update function top to bottom and every behavior in the app is right there, each case independent.

This is the part that doesn't show up in a counter-example comparison. The toy versions look like Foldkit is more code. At real scale — a multiplayer app with WebSocket streams, mixed client/server state, keyboard handling, animations, reconnection — React's complexity compounds, Foldkit's doesn't.

## If you know Redux

The Model-View-Update pattern will feel familiar:

- **Model** ≈ Redux store
- **Message** ≈ action
- **`update`** ≈ root reducer
- **Commands** ≈ thunks / sagas (but typed, named, and synchronously testable)
- **Subscriptions** ≈ no good Redux analog — Redux subscribes to the store; Foldkit subscriptions subscribe to Model slices and emit Messages back

What's missing from the Redux setup: action creators (Messages have callable constructors), selectors (subview functions are just functions taking the Model), middleware (Commands and Subscriptions cover everything middleware was needed for), connected components (no connection needed — the whole view re-renders, Snabbdom diffs).

## If you know Elm

Foldkit *is* Elm's Model-View-Update on Effect-TS. The structural mapping is essentially 1:1:

- Elm `Cmd` → Foldkit Command
- Elm `Sub` → Foldkit Subscription
- Elm `Browser.application` → `Runtime.makeProgram` with routing
- Elm `Decoder` → Effect `Schema`
- Elm `Task` → Effect Effect
- Elm `Process.sleep` → `Effect.sleep` inside a Command
- Elm `Json.Encode` / `Json.Decode` → `Schema.encodeUnknownEffect` / `decodeUnknownEffect`
- The Elm Architecture's "ports" for FFI → Commands (calling into JS) + Mount (handing the DOM to JS libs) + CustomElement (typed web components)

Things Foldkit adds over Elm: typed errors via Effect's error channel, structured logging via Effect's Logger, dependency injection via Effect's Layer, the `Render.afterCommit` / `Render.afterPaint` primitives for fine-grained render-cycle work, Mount as a first-class primitive (Elm uses ports for this), ManagedResources as a first-class primitive for model-scoped lifecycles.

Things Elm has that Foldkit doesn't: a non-JS runtime (Foldkit ships TypeScript, runs on the browser's V8/SpiderMonkey/JSC). Compiler-enforced totality (TypeScript's checker is good but not Elm's level — `Match.tagsExhaustive` is the discipline that approximates it).

## What to read next

- The main [SKILL.md](../SKILL.md) — this file is supplementary; the laws and architecture live there.
- [`reference/ui-components.md`](./ui-components.md) — when you'd reach for Radix / Headless UI / React Aria.
- `~/.cache/foldkit/examples/` — every concept this reference touches has a runnable example.
