# nextjs/no-sync-scripts

## What it does

This rule prevents the use of synchronous `
// Dynamic src without async/defer
```

Examples of **correct** code for this rule:

```javascript
// Script with async attribute

// Script with defer attribute

// Script with spread props (allowed as it might include async/defer)
```

## Version

This rule was added in v0.2.0.
