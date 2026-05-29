---
name: ui-ux-improvement
description: Project-agnostic UI/UX review and redesign guidance. Use when improving, auditing, polishing, or planning frontend product or interface work across any stack.
---

# UI/UX Improvement

Use this skill when the task is to improve an interface, whether the project uses React, Foldkit, plain HTML, a native UI toolkit, or something else. Your job is to combine strong design judgment with the implementation rules of the project in front of you.

## Load the right design brain

For serious design work, read the Impeccable references under `../impeccable/` and use them for taste, critique, and quality bar:

- `../impeccable/SKILL.md` for shared design laws and command routing
- `../impeccable/reference/product.md` for app UIs, dashboards, tools, settings, admin, data, and authenticated surfaces
- `../impeccable/reference/brand.md` for marketing, landing, portfolio, and other surfaces where design is the product
- task references such as `critique.md`, `audit.md`, `polish.md`, `layout.md`, `typeset.md`, `colorize.md`, `clarify.md`, and `harden.md` when they match the user's ask

Do not treat Impeccable as a React workflow. Treat it as design doctrine and review protocol unless the current project actually uses the assumptions its scripts expect.

## Obey the implementation stack

Before proposing code changes, identify the frontend stack and load the relevant technology skill. Examples:

- Foldkit project: load the Foldkit skill; implement only through Foldkit's model/message/update/view architecture.
- React project: use the project's existing component/state conventions.
- Plain HTML/CSS: improve the markup and styles directly.

The stack-specific skill wins on architecture. Impeccable wins on visual taste, UX rigor, anti-slop rules, typography, hierarchy, layout, color, motion, copy, and product polish.

## Operating modes

### Large redesign / rescue pass

When the user wants a broad UI overhaul, start system-first:

1. Read project context and inspect the main UI surfaces.
2. Establish or update the design specification before editing widely.
3. Build or refine shared primitives: shell, navigation, page headers, buttons, inputs, panels, badges, lists, tables, forms, empty/loading/error states.
4. Apply the shared vocabulary to the highest-leverage routes first.
5. Verify accessibility, responsive behavior, visual hierarchy, and consistency.

Avoid page-by-page decoration that creates new drift.

### Continuous Improvement review

When the user asks for a UI/UX Continuous Improvement loop, usually do not edit files. Inspect a focused surface and return:

1. concise precise findings
2. numbered improvement proposals
3. each proposal's target files/routes, user impact, risk, and acceptance checks

End in an approval posture: the user should be able to approve, reject, or request modifications to each proposal.

## Quality bar

Good work feels intentional in the product's own register. It avoids generic AI design tells, gratuitous decoration, unearned gradients or glass, identical card grids, fake delight, vague helper copy, inaccessible contrast, missing states, and component drift.

For product UIs, familiarity is often a feature. The interface should feel trustworthy, efficient, and coherent, not strange for its own sake.
