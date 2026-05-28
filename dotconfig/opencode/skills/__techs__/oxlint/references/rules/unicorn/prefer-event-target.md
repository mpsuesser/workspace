# unicorn/prefer-event-target

## What it does

Prefers `EventTarget` over `EventEmitter`.

This rule reduces the bundle size and makes your code more cross-platform friendly.

See the [differences](https://nodejs.org/api/events.html#eventtarget-and-event-api) between `EventEmitter` and `EventTarget`.

### Why is this bad?

While [`EventEmitter`](https://nodejs.org/api/events.html#class-eventemitter) is only available in Node.js, [`EventTarget`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget) is also available in _Deno_ and browsers.

### Examples

Examples of **incorrect** code for this rule:

```javascript
class Foo extends EventEmitter {}
```

Examples of **correct** code for this rule:

```javascript
class Foo extends OtherClass {}
```

## Version

This rule was added in v0.0.18.
