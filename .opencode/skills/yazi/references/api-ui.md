# Plugin API — UI & Layout

Renderable elements and layout primitives for building plugin UIs.

Renderables: `Line`, `Text`, `List`, `Bar`, `Border`, `Gauge`, `Clear`.
Non-renderable: `Rect`, `Pad`, `Pos`, `Style`, `Span`, `Layout`, `Constraint`.

## Table of Contents

- [Rect](#rect)
- [Pad](#pad)
- [Pos](#pos)
- [Style](#style)
- [Span](#span)
- [Line](#line)
- [Text](#text)
- [Layout & Constraint](#layout--constraint)
- [List, Bar, Border, Gauge, Clear](#list-bar-border-gauge-clear)
- [Enums: Align, Wrap, Edge](#enums)
- [Color aliases (AsColor)](#colors)
- [ui.* functions](#ui-functions)
- [ps.* — DDS publish/subscribe](#ps-functions)

## Rect

Area within the terminal. Use `ui.Layout` to compute — don't create manually unless values are precise.

```lua
ui.Rect { x = 10, y = 10, w = 20, h = 30 }
ui.Rect.default  -- { x=0, y=0, w=0, h=0 }
```

| Property | Type | Property | Type |
|----------|------|----------|------|
| `x` | `integer` | `left` | `integer` |
| `y` | `integer` | `right` | `integer` |
| `w` | `integer` | `top` | `integer` |
| `h` | `integer` | `bottom` | `integer` |

| Method | Signature |
|--------|-----------|
| `pad` | `(self, padding: Pad) -> self` |

## Pad

```lua
ui.Pad(top, right, bottom, left)
ui.Pad.top(n)        -- top only
ui.Pad.right(n)      -- right only
ui.Pad.bottom(n)     -- bottom only
ui.Pad.left(n)       -- left only
ui.Pad.x(n)          -- left + right
ui.Pad.y(n)          -- top + bottom
ui.Pad.xy(x, y)      -- both axes
```

## Pos

Position = origin + offset:

```lua
ui.Pos { "center", x = 5, y = 3, w = 20, h = 10 }
```

Origins: `"top-left"`, `"top-center"`, `"top-right"`, `"bottom-left"`, `"bottom-center"`, `"bottom-right"`, `"center"`, `"hovered"`

## Style

Chainable style builder. All methods return `self`.

```lua
ui.Style():fg("white"):bg("black"):bold():italic()
```

| Method | Description |
|--------|-------------|
| `fg(color)` | Foreground color |
| `bg(color)` | Background color |
| `bold()` | Bold |
| `dim()` | Dim |
| `italic()` | Italic |
| `underline()` | Underline |
| `blink()` | Blink |
| `blink_rapid()` | Rapid blink |
| `reverse()` | Reverse fg/bg |
| `hidden()` | Hidden |
| `crossed()` | Strikethrough |
| `reset()` | Reset all |
| `patch(style)` | Merge another style |

## Span

Smallest text unit. Inherits `Style` methods.

```lua
ui.Span("hello"):fg("red"):bold()
ui.Span(existing_span)  -- clone
```

| Method | Signature |
|--------|-----------|
| `visible()` | `-> boolean` — has printable chars |
| `style(s)` | `(Style) -> self` |

## Line

A line of spans. Inherits `Style` methods. **Renderable.**

```lua
ui.Line("simple string")
ui.Line(ui.Span("styled"))
ui.Line { "mixed", ui.Span("content"):fg("red"), ui.Line("nested") }
```

| Method | Signature | Description |
|--------|-----------|-------------|
| `area(rect?)` | `-> self \| Rect` | Set/get area |
| `width()` | `-> integer` | Calculate width |
| `align(a)` | `(Align) -> self` | Set alignment |
| `visible()` | `-> boolean` | Has printable chars |
| `style(s)` | `(Style) -> self` | Set style |

## Text

Multi-line text. Inherits `Style` methods. **Renderable.**

```lua
ui.Text("foo\nbar")
ui.Text { ui.Line("line 1"), ui.Line("line 2") }
ui.Text { "mixed", ui.Span("span"), ui.Line("line") }
ui.Text.parse(ansi_string)  -- parse ANSI escape codes
```

| Method | Signature | Description |
|--------|-----------|-------------|
| `area(rect?)` | `-> self \| Rect` | Set/get area |
| `align(a)` | `(Align) -> self` | Set alignment |
| `wrap(w)` | `(Wrap) -> self` | Set wrapping |
| `max_width()` | `-> integer` | Max width across lines |
| `style(s)` | `(Style) -> self` | Set style |

## Layout & Constraint

Split an area into sub-areas:

```lua
local areas = ui.Layout()
  :direction(ui.Layout.HORIZONTAL)  -- or VERTICAL
  :margin(1)           -- all sides
  :margin_h(1)         -- horizontal only
  :margin_v(1)         -- vertical only
  :constraints({
    ui.Constraint.Percentage(50),
    ui.Constraint.Percentage(50),
  })
  :split(area)

local left = areas[1]
local right = areas[2]
```

### Constraint types (priority order)

| Constructor | Description |
|------------|-------------|
| `ui.Constraint.Min(n)` | At least `n` |
| `ui.Constraint.Max(n)` | At most `n` |
| `ui.Constraint.Length(n)` | Exactly `n` |
| `ui.Constraint.Percentage(p)` | `p%` of total |
| `ui.Constraint.Ratio(num, den)` | `num/den` of total |
| `ui.Constraint.Fill(scale)` | Fill remaining, proportional to other Fill elements |

## List, Bar, Border, Gauge, Clear

### List (Renderable)

```lua
ui.List { ui.Text("item 1"), ui.Text("item 2") }
ui.List { "string1", "string2" }  -- convenience
```

Methods: `area(rect?)`, `style(s)`

### Bar (Renderable)

```lua
ui.Bar(ui.Edge.LEFT):symbol("│"):style(ui.Style():fg("blue")):area(rect)
```

Methods: `area(rect?)`, `symbol(s)`, `style(s)`

### Border (Renderable)

```lua
ui.Border(ui.Edge.ALL):type(ui.Border.ROUNDED):style(ui.Style():fg("gray")):area(rect)
```

Border types: `PLAIN`, `ROUNDED`, `DOUBLE`, `THICK`, `QUADRANT_INSIDE`, `QUADRANT_OUTSIDE`

Methods: `area(rect?)`, `type(t)`, `style(s)`

### Gauge (Renderable)

```lua
ui.Gauge():percent(75):label("75%"):style(s):gauge_style(gs):area(rect)
```

Methods: `area(rect?)`, `percent(n)`, `ratio(f)` (0-1), `label(s)`, `style(s)`, `gauge_style(s)`

### Clear (Renderable)

Clears area content. Place after the widget to clear:

```lua
{ ui.Text("..."):area(rect), ui.Clear(rect) }
```

## Enums

### Align

`ui.Align.LEFT`, `ui.Align.CENTER`, `ui.Align.RIGHT`

### Wrap

`ui.Wrap.NO`, `ui.Wrap.YES`, `ui.Wrap.TRIM` (wrap + trim leading whitespace)

### Edge

`ui.Edge.NONE`, `ui.Edge.TOP`, `ui.Edge.RIGHT`, `ui.Edge.BOTTOM`, `ui.Edge.LEFT`, `ui.Edge.ALL`

## Colors

AsColor accepts: `"black"`, `"white"`, `"red"`, `"lightred"`, `"green"`, `"lightgreen"`, `"yellow"`, `"lightyellow"`, `"blue"`, `"lightblue"`, `"magenta"`, `"lightmagenta"`, `"cyan"`, `"lightcyan"`, `"gray"`, `"darkgray"`, `"reset"`, or any string (hex `"#rrggbb"`).

## ui Functions

| Function | Context | Description |
|----------|---------|-------------|
| `ui.hide()` | async | Hide Yazi, return `permit`. Call `permit:drop()` to restore. |
| `ui.render()` | sync | Re-render UI (call after state changes) |
| `ui.truncate(text, opts)` | any | Truncate text to width: `{max: int, rtl?: bool}` |

## ps Functions

DDS publish/subscribe. **Sync context only.**

| Function | Signature | Description |
|----------|-----------|-------------|
| `ps.pub(kind, value)` | `(string, Sendable)` | Publish to local instance |
| `ps.pub_to(receiver, kind, value)` | `(integer, string, Sendable)` | Publish to specific instance (0=broadcast) |
| `ps.sub(kind, callback)` | `(string, fun(body))` | Subscribe to local events |
| `ps.sub_remote(kind, callback)` | `(string, fun(body))` | Subscribe to remote events |
| `ps.unsub(kind)` | `(string)` | Unsubscribe local |
| `ps.unsub_remote(kind)` | `(string)` | Unsubscribe remote |

Kind naming: use plugin prefix, e.g. `"my-plugin-event"`. Cannot use built-in kinds.
