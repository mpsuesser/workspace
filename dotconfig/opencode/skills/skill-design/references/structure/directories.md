# Skill Directory Types

Skills have three optional directories beyond SKILL.md, each with distinct purposes.

## Overview

```
skill-name/
├── SKILL.md              # Always loaded when skill activates
├── scripts/              # Executable code - runs WITHOUT loading
├── references/           # Documentation - loaded INTO context
└── assets/               # Output files - used in results, never loaded
```

## references/

**Purpose**: Documentation and reference material loaded into context when needed.

**Contents**:
- Markdown files with patterns, API docs, gotchas
- Organized by topic in subdirectories
- Loaded when agent needs specific information

**Token cost**: Loaded into context = uses tokens

```
references/
├── api.md              # Loaded when implementing
├── patterns.md         # Loaded for design guidance
└── gotchas.md          # Loaded when debugging
```

## scripts/

**Purpose**: Executable code for deterministic, repeatable operations.

**Contents**:
- Python, bash, or other scripts
- Code that should run exactly as written
- Utilities the agent can invoke

**Token cost**: Executed without loading = no token cost

**When to use**:
- Operation is fragile/error-prone if done manually
- Exact sequence matters
- Script handles edge cases the agent might miss
- Task is repeated often

```
scripts/
├── validate_config.py    # Deterministic validation
├── migrate_schema.sh     # Exact migration steps
└── generate_types.ts     # Code generation
```

**Usage in SKILL.md**:
```markdown
## Schema Migration

Run the bundled migration script:
\`\`\`bash
./scripts/migrate_schema.sh --from v1 --to v2
\`\`\`

Do not perform migration steps manually.
```

## assets/

**Purpose**: Files used in OUTPUT, not for agent context.

**Contents**:
- Templates to be filled in
- Icons, images, fonts
- Boilerplate files to copy
- Configuration templates

**Token cost**: Never loaded = no token cost

**When to use**:
- Agent needs to produce files with specific structure
- Output requires binary files (images, fonts)
- Templates should be copied, not recreated

```
assets/
├── templates/
│   ├── component.tsx.template
│   └── test.tsx.template
├── icons/
│   └── app-icon.png
└── configs/
    └── default.toml
```

**Usage in SKILL.md**:
```markdown
## Creating Components

Copy the template from assets/templates/component.tsx.template
and fill in the placeholders:
- {{NAME}}: Component name
- {{PROPS}}: Props interface
```

## Decision Guide

```
Is this documentation/guidance the agent needs to understand?
├─ Yes → references/
└─ No
    ├─ Is this code to execute for deterministic results?
    │   └─ Yes → scripts/
    └─ Is this a file to use in output?
        └─ Yes → assets/
```

## Anti-Patterns

### Loading scripts into context
```markdown
WRONG: Here's the migration script:
[500 lines of Python]

RIGHT: Run scripts/migrate.py
```

### Describing templates instead of providing them
```markdown
WRONG: Create a file with this structure...
[template description]

RIGHT: Copy assets/templates/config.toml and modify...
```

### Putting guidance in assets
```markdown
WRONG: assets/how-to-use.md

RIGHT: references/usage.md
```
