---
name: raised-ui-style
description: Recreate tactile raised controls with CSS.
---

# Raised UI Style

Use semantic controls and one reusable class:

```html
<button type="button" class="raised raised--primary">Continue</button>
<button type="button" class="raised raised--secondary">Continue with Google</button>
```

```css
.raised {
	background: var(--raised-bg);
	border: 1px solid var(--raised-border);
	border-radius: 0;
	box-shadow: 0 8px 20px var(--raised-shadow);
	color: var(--raised-color);
	cursor: pointer;
	height: 2.875rem;
	transition: transform 120ms ease, box-shadow 120ms ease, background 120ms ease;
}

.raised--primary { --raised-bg: #111; --raised-border: #111; --raised-color: #fbfaf9; --raised-shadow: rgb(17 17 17 / 14%); }
.raised--secondary { --raised-bg: #fff; --raised-border: rgb(17 17 17 / 22%); --raised-color: #111; --raised-shadow: rgb(17 17 17 / 10%); }

.raised:not(:disabled, [aria-disabled="true"]):hover {
	box-shadow: 0 12px 26px rgb(17 17 17 / 14%);
	transform: translateY(-2px);
}

.raised:not(:disabled, [aria-disabled="true"]):active {
	box-shadow: 0 5px 12px rgb(17 17 17 / 10%);
	transform: translateY(0);
}

.raised:focus-visible { outline: 2px solid #2563eb; outline-offset: 3px; }
.raised:disabled, .raised[aria-disabled="true"] { cursor: not-allowed; opacity: 0.5; }
```

The effect depends on the shadow-depth change and 2px hover lift; preserve both. Prefer palette tokens over literal colors in production.
