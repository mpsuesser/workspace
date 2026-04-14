# pi-mode-toggler

Mode toggler package for pi.

Provides:
- an overlay mode toggler on `alt+p`
- an empty-editor spacebar shortcut to open the toggler
- shared mode registration helpers for other extensions

Local extensions can import from:

```ts
import { createModeToggle, formatModeLabel } from "./pi-mode-toggler/index.ts";
```
