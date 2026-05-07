# react/no-danger-with-children

## What it does

Disallows when a DOM element is using both `children` and `dangerouslySetInnerHTML` properties.

### Why is this bad?

React will throw a warning if this rule is ignored and both `children` and `dangerouslySetInnerHTML` are used.

### Examples

Examples of **incorrect** code for this rule:

```jsx
<div dangerouslySetInnerHTML={{ __html: "HTML" }}>Children</div>;
React.createElement("div", { dangerouslySetInnerHTML: { __html: "HTML" } }, "Children");
```

Examples of **correct** code for this rule:

```jsx
<div>Children</div>
<div dangerouslySetInnerHTML={{ __html: "HTML" }} />
```

## Version

This rule was added in v0.9.6.
