# Foldkit UI Components

Every component in `foldkit/ui` (re-exported as the `Ui` namespace from `foldkit`) is **headless and accessible**. Each one ships its own TEA Submodel (Model, Message, update, view), integrated into your app via the [Submodels](../SKILL.md#submodels) pattern. Components provide ARIA, keyboard navigation, focus management, and state; you provide the markup and styling through `toView` callbacks and slot attributes.

This reference is for "how do I wire up component X" and "what does each component contribute." For first-principles understanding, read the main skill. For deep API specifics, browse `~/.cache/foldkit/packages/foldkit/src/ui/<component>/` (every component's source is the authoritative spec).

## The shared pattern

Almost every component follows the same five-step integration recipe. Internalize it once and the components mostly differ only in their `view` config and which selection/lifecycle handlers they expose.

```typescript
import { Effect } from 'effect'
import { Command, Ui } from 'foldkit'
import { html } from 'foldkit/html'
import { m } from 'foldkit/message'
import { evo } from 'foldkit/struct'

// 1. Embed the component's Model as a field
const Model = S.Struct({
  dialog: Ui.Dialog.Model,
  // ...your other fields
})

// 2. Initialize with a unique id (and optional flags like isAnimated)
const init = () => [
  {
    dialog: Ui.Dialog.init({ id: 'confirm' }),
    // ...
  },
  [],
]

// 3. Wrap the component's Message in a Got*Message
const GotDialogMessage = m('GotDialogMessage', { message: Ui.Dialog.Message })

// 4. Delegate in update, mapping the child's Commands
GotDialogMessage: ({ message }) => {
  const [nextDialog, commands] = Ui.Dialog.update(model.dialog, message)
  return [
    evo(model, { dialog: () => nextDialog }),
    commands.map(Command.mapEffect(Effect.map(m => GotDialogMessage({ message: m })))),
  ]
},

// 5. Render via the component's view, passing toParentMessage + slot config
const dialogToParentMessage = (m: Ui.Dialog.Message): Message =>
  GotDialogMessage({ message: m })

Ui.Dialog.view({
  model: model.dialog,
  toParentMessage: dialogToParentMessage,
  // ...component-specific slots
})
```

Components that emit OutMessages (Drag and Drop, File Drop, Animation) return a **3-tuple** from `update` instead — `[Model, Commands, Option<OutMessage>]` — so the parent uses `Option.match` to handle the surfaced events. See [OutMessage in the main skill](../SKILL.md#outmessage).

## Programmatic helpers

Most stateful components expose `open` / `close` / `select` helpers that return `[Model, Commands]` directly. Use them in your own update arms to drive the component imperatively without dispatching its internal Messages:

```typescript
SelectedPerson: ({ value }) => {
  // selectItem reflects the selection AND returns the Commands that close
  // the dropdown and return focus to the trigger button:
  const [nextListbox, commands] = Ui.Listbox.selectItem(model.listbox, value)
  return [
    evo(model, {
      maybePerson: () => Option.some(value),
      listbox: () => nextListbox,
    }),
    commands.map(Command.mapEffect(Effect.map(m => GotListboxMessage({ message: m })))),
  ]
},
```

Common helpers:

- `Dialog.open(model)`, `Dialog.close(model)`, `Dialog.titleId(model)` (use as the `id` on a heading for accessible labeling)
- `Menu.open(model)`, `Menu.close(model)`
- `Popover.open(model)`, `Popover.close(model)`
- `Listbox.open(model)`, `Listbox.close(model)`, `Listbox.selectItem(model, item)`
- `Combobox.open(model)`, `Combobox.close(model)`, `Combobox.selectItem(model, item, displayText)`
- `Disclosure.open(model)`, `Disclosure.close(model)`, `Disclosure.toggle(model)`

## Mount names (for Scene tests)

Components that need to position floating panels, portal backdrops, or hand the live element to internal machinery declare their own Mounts. Your Scene tests must acknowledge these as they appear in the pending list. Common ones:

| Component | Mount definitions exported |
|---|---|
| `Ui.Popover` | `AnchorPopover` |
| `Ui.Listbox` | `AnchorListbox`, `PortalListboxBackdrop` (when modal) |
| `Ui.Combobox` | `AnchorCombobox`, `PortalComboboxBackdrop` (when modal) |
| `Ui.Menu` | `AnchorMenu`, `PortalMenuBackdrop` |
| `Ui.Dialog` | `PortalDialogBackdrop` (when a backdrop is rendered) |
| `Ui.DatePicker` | inherits Popover + Calendar mounts |

Pattern in a Scene test:

```typescript
Scene.click(Scene.role('button', { name: 'Pick a fruit' }))
Scene.Mount.expectExact(Ui.Listbox.AnchorListbox, Ui.Listbox.PortalListboxBackdrop)
Scene.Mount.resolveAll(
  [Ui.Listbox.AnchorListbox, Ui.Listbox.CompletedAnchorListbox()],
  [Ui.Listbox.PortalListboxBackdrop, Ui.Listbox.CompletedPortalListboxBackdrop()],
)

// When the listbox closes during the test, acknowledge the unmounts:
Scene.click(Scene.role('option', { name: 'Apple' }))
Scene.Mount.expectEnded(Ui.Listbox.AnchorListbox)
Scene.Mount.expectEnded(Ui.Listbox.PortalListboxBackdrop)
```

The complete and current list of exported Mounts for any component lives in `~/.cache/foldkit/packages/foldkit/src/ui/<component>/index.ts` — search for `Mount.define(`.

## Component-by-component notes

### Button — view-only, no Submodel

Button is the only component with **no Model, no Message, no update**. It's a thin wrapper that provides consistent ARIA and styling hooks. Don't embed it in your Model; just render it inline:

```typescript
Ui.Button.view({
  onClick: ClickedSave(),
  isDisabled: model.isSaving,
  toView: attributes =>
    h.button(
      [...attributes.button, h.Class('px-4 py-2 rounded-lg bg-blue-600 text-white')],
      ['Save'],
    ),
})
```

Foldkit uses `aria-disabled` rather than the native `disabled` attribute so disabled buttons remain focusable for screen readers. The `attributes.button` spread carries the accessibility attributes you should not override.

### Input / Textarea — view-only ARIA wrappers

Like Button, view-only. They handle aria-label/aria-describedby linking to associated label and description elements. You bring the `OnInput` Message:

```typescript
Ui.Input.view({
  value: model.email,
  onInput: value => ChangedEmail({ value }),
  toView: attributes =>
    h.input([...attributes.input, h.Class('border rounded px-3 py-2'), h.Type('email')]),
})
```

### Checkbox

Three-state (`Checked` / `Unchecked` / `Indeterminate`), keyboard space-to-toggle, label linking. Supports form integration via `name` + `value` props. Stateful Submodel.

### Fieldset

Groups related form controls with a `<legend>` and description. `isDisabled: true` propagates to every child (Foldkit components inside the fieldset will read the disabled state from the fieldset's context).

### Radio Group

Roving tabindex (only the selected radio is tab-focusable; arrow keys move between options). Per-option label/description linking. Stateful Submodel.

### Switch

Two-state toggle (`On` / `Off`) with keyboard space-to-toggle. Optional form integration. Stateful Submodel.

### Slider

Numeric range input with full pointer drag and keyboard semantics (arrows step, Page Up/Down jump, Home/End extreme, modifier-arrow for fine/coarse steps). ARIA slider role with `aria-valuemin` / `aria-valuemax` / `aria-valuenow` / `aria-valuetext`.

### Select

Native `<select>` wrapper with ARIA label/description linking. Use this for short option lists where the native browser UI is fine. For custom-styled dropdowns, use Listbox or Combobox.

### Listbox

Custom select dropdown with **persistent selection** (shows the selected value in the trigger), keyboard navigation, typeahead search, anchor positioning. Single-select by default; multi-select is a separate API (`Ui.Listbox.viewMulti`). The "selection" event is a Message *you* define — the component fires it via the `onSelectedItem` config callback:

```typescript
Ui.Listbox.view({
  model: model.listbox,
  toParentMessage: m => GotListboxMessage({ message: m }),
  onSelectedItem: value => SelectedPerson({ value }),     // Your Message
  items: people,
  itemToConfig: ({ item, isSelected, isActive }) => ({
    itemKey: item,
    itemContent: h.div([], [item]),
  }),
  buttonContent: h.span([], [Option.getOrElse(model.maybePerson, () => 'Choose...')]),
})
```

### Combobox

Searchable select. Text input for filtering; you control the filter logic by reading `model.combobox.inputValue` and passing a pre-filtered `items` array. Single- and multi-select APIs. Configure with `itemToValue` (the value stored in the Model) and `itemToDisplayText` (what appears in the input after selection).

### Dialog

Modal backed by the native `<dialog>` element. Uses `showModal()` so focus trapping, backdrop rendering, and scroll locking come from the browser — no JS focus trap needed. Slot config: `backdropAttributes`, `panelContent`, `panelAttributes`, `attributes` (on the `<dialog>` itself). Use `Ui.Dialog.titleId(model.dialog)` as the `id` on your heading for accessible labeling.

For non-modal floating content (tooltip, popover positioned relative to a trigger), use Popover instead.

### Menu

Dropdown for **actions** (vs Listbox, which is for selection). Keyboard navigation, typeahead, `aria-activedescendant` focus model. Each menu item dispatches a Message of your choice.

### Popover

Floating panel with arbitrary content. Natural Tab navigation (unlike Menu, doesn't trap or use activedescendant). Use for inline help cards, color picker panels, anything where the user might want to focus controls inside.

### Disclosure

The simplest show/hide toggle. Use for accordions, FAQs, collapsible sections. No portaling, no anchoring — just a toggle that hides/reveals content inline.

### Tabs

Tabbed interface. Keyboard navigation (Left/Right or Up/Down depending on orientation), Home/End, optional wrapping. You provide the panel content; the component handles tab focus and `aria-selected` / `aria-controls` / `tabindex`.

### Drag and Drop

The most complex component. Three-tuple update return (`[Model, Commands, Option<OutMessage>]`). Doesn't have a `view()` — instead, spread `Ui.DragAndDrop.draggable()` and `Ui.DragAndDrop.droppable()` attributes onto your own elements. Requires a `DragAndDrop.subscriptions` entry combined into your app's subscriptions for document-level pointer and keyboard listeners.

OutMessages: `Reordered` (carry the new ordering) and `Cancelled`. The parent handles these to actually reorder its domain data — Foldkit doesn't reorder your array for you, since you may want to reorder across containers, persist, animate, etc.

```typescript
GotDragAndDropMessage: ({ message }) => {
  const [nextDragAndDrop, commands, maybeOut] = Ui.DragAndDrop.update(model.dragAndDrop, message)
  // ... handle Option.match(maybeOut, { onSome: ({ Reordered, Cancelled }) => ... })
},
```

See `~/.cache/foldkit/examples/kanban/` for a production-grade integration.

### File Drop

File input + drop zone in one. Configurable accept patterns, single or multiple files. Emits OutMessages: `ReceivedFiles` (drop or input change), `ReceivedNonFiles` (text/URL drops that don't match the accept pattern). You decide what to do with the files.

### Calendar / Date Picker

Calendar is the inline grid (2D keyboard nav: arrows move days, Page Up/Down moves months, Home/End jump to start/end of row, Shift+Page Up/Down moves year). Locale-aware headers, min/max constraints, disabled-date support. Date Picker is the input + popover variant that uses Calendar internally.

### Toast / Tooltip

Toast: notification surface with stack management, dismissal, optional auto-dismiss timeouts. Tooltip: hover/focus-triggered content with positioning and keyboard support.

### Animation

CSS enter/leave coordinator. Used **internally** by Dialog, Menu, Popover, Listbox, Combobox when initialized with `isAnimated: true`. You typically only need it directly when animating your own content.

Animation uses OutMessages: your update handles `StartedLeaveAnimating` (provides `defaultLeaveCommand` — the Command to settlement-detect) and `TransitionedOut` (unmount content). Send `Ui.Animation.Showed()` to enter, `Ui.Animation.Hid()` to leave. Style with Tailwind `data-[closed]:opacity-0 data-[closed]:scale-95` patterns. For `height: auto` transitions, set `animateSize: true` at init — Animation wraps content in a CSS grid that animates `grid-template-rows` from `0fr` to `1fr`.

### Virtual List

Windowed rendering for large datasets. Renders only the items currently in view plus a configurable overscan buffer. Pass total count, item dimensions, and a render function per item.

## Styling discipline

These components are **headless**. They do not ship a default visual style. You bring CSS (Tailwind, vanilla CSS, CSS-in-JS — the framework is style-agnostic), and the components expose:

- **`attributes` spreads** — the accessibility attributes you must apply to the right elements. Spread them onto your element first, then add your styling classes.
- **`data-*` attributes** — components set data attributes reflecting state (`data-state="open"`, `data-checked`, `data-selected`, `data-active`, `data-closed`, etc.). Style off these in CSS rather than tracking state in your view code.

Example Tailwind v4 data-attribute styling:

```typescript
h.button(
  [
    ...attributes.button,
    h.Class(
      'rounded-lg border px-4 py-2 ' +
      'data-[state=open]:bg-gray-100 ' +
      'data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed',
    ),
  ],
  ['Toggle'],
)
```

Don't track open/closed/selected state in your *own* Model just to style; read it off the data attributes the component already sets.

## Where to go next

- **`~/.cache/foldkit/examples/ui-showcase/`** — every component, styled and interactive, with full Foldkit integration.
- **`~/.cache/foldkit/packages/foldkit/src/ui/<component>/`** — source of truth for any component. The `index.ts` lists every exported Model, Message, Mount, helper, and view config field.
- **`https://foldkit.dev/ui/<component>.md`** — live docs page per component (multi-select variants, advanced patterns, edge cases).
- **`https://foldkit.dev/api-reference/ui-<component>.md`** — full type signatures for every exported symbol.
