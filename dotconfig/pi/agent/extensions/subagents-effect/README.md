# subagents-effect

Effect-first rewrite of the Pi subagents extension.

This package is intentionally separate from the existing `subagents` extension so it can be implemented and tested without destabilizing the current tool.

## Implementation plan

Detailed implementation prompts live in:

```text
prompts/implementation-slices/
```

Start with `00-global-rules.md`, then work through the numbered slices.

## Initial commands

```bash
npm install
npm run check
```

The extension entrypoint will be `src/extension/index.ts` once implementation begins.
