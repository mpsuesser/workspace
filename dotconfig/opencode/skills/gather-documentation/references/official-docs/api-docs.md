# API Documentation

Capturing API references for skill creation.

## What Makes Good API Documentation

For a skill, API docs should provide:
- **Complete surface area** - All public APIs
- **Type signatures** - Parameters and return types
- **Brief descriptions** - What each API does
- **Usage examples** - How to call it

## Capture Template

For each API/method:

```markdown
### functionName(params): ReturnType

Brief description of what it does.

**Parameters:**
- `param1: Type` - Description
- `param2?: Type` - Optional. Description

**Returns:** Description of return value

**Example:**
\`\`\`typescript
const result = functionName(arg1, arg2)
\`\`\`

**Notes:** Any gotchas or important details
```

## Organizing API References

### By Module/Namespace
```markdown
## Window API
### window.create()
### window.close()
### window.setTitle()

## Dialog API
### dialog.open()
### dialog.save()
### dialog.message()
```

### By Operation Type
```markdown
## Creating Resources
### createWindow()
### createMenu()

## Reading State
### getWindow()
### getMenuItems()

## Modifying State
### setWindowTitle()
### updateMenu()
```

### By Use Case
```markdown
## File Operations
### open() - Open file dialog
### save() - Save file dialog
### readFile() - Read file contents

## User Interaction
### message() - Show message box
### confirm() - Show confirmation
### prompt() - Get user input
```

## Handling Large APIs

For APIs with many methods:

### Tier the Coverage
```
Tier 1 (full detail): Most-used APIs
Tier 2 (signature + brief): Common APIs
Tier 3 (just listed): Rare/advanced APIs
```

### Split into Files
```
references/
├── api-core.md      # Essential APIs
├── api-window.md    # Window management
├── api-dialog.md    # Dialogs
└── api-advanced.md  # Rare/advanced
```

## Extracting from Official Docs

### Structured API Docs
If official docs have structured API reference:
1. Follow their organization
2. Extract signatures and descriptions
3. Preserve their examples

### Inline Documentation
If APIs are documented in guides:
1. Scan guides for API mentions
2. Collect into structured reference
3. Note which guide each came from

### Source Code (TypeScript)
If types are published:
1. Find type definitions (.d.ts files)
2. Extract public interfaces
3. Add descriptions from JSDoc or guides

## Example: Tauri JS API

```markdown
# Tauri JavaScript API

## Window

### appWindow

The current window instance.

\`\`\`typescript
import { appWindow } from '@tauri-apps/api/window'
\`\`\`

### WebviewWindow.getByLabel(label)

Get a window by its label.

**Parameters:**
- `label: string` - Window label set in tauri.conf.json

**Returns:** `WebviewWindow | null`

\`\`\`typescript
const mainWindow = WebviewWindow.getByLabel('main')
\`\`\`

### WebviewWindow.setTitle(title)

Set the window title.

**Parameters:**
- `title: string` - New window title

**Returns:** `Promise<void>`

\`\`\`typescript
await appWindow.setTitle('My App - Document.txt')
\`\`\`
```
