# pi-mode-toggler

Mode toggler package for pi.

Provides:
- an overlay mode toggler on `tab`
- single-key mode toggles: press a mode key to toggle it, then the overlay closes
- `tab`, `escape`, or `ctrl+c` close the overlay without changing a mode
- an empty-editor spacebar shortcut to open the toggler
- shared mode registration helpers for other extensions

Local extensions can import from:

```ts
import { createModeToggle, formatModeLabel } from "./pi-mode-toggler/index.ts";
```

Register each mode with a unique key:

```ts
createModeToggle(pi, {
	id: "read-only",
	key: "r",
	color: "#800000",
	description: "Block write and edit tools",
});
```
