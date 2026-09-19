# typescript/no-unsafe-declaration-merging

## What it does

Disallow unsafe declaration merging.

### Why is this bad?

Declaration merging between classes and interfaces is unsafe.
The TypeScript compiler doesn't check whether properties are initialized, which can lead to TypeScript not detecting code that will cause runtime errors.

### Examples

Examples of **incorrect** code for this rule:

```ts
interface Foo {}
class Foo {}
```

Examples of **correct** code for this rule:

```ts
interface Foo {}
class Bar {}
```

## Version

This rule was added in v0.0.11.
