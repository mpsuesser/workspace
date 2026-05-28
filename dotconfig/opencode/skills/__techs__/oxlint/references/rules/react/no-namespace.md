# react/no-namespace

## What it does

Enforce that namespaces are not used in React elements.

### Why is this bad?

Namespaces in React elements, such as svg:circle, are not supported by React.

### Examples

Examples of **incorrect** code for this rule:

```jsx
<ns:TestComponent />
<Ns:TestComponent />
```

Examples of **correct** code for this rule:

```jsx
<TestComponent />
<testComponent />
```

## Version

This rule was added in v0.15.13.
