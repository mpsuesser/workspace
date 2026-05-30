# find-to-fd

Transparently rewrites slow `find` shell commands (run via the **bash** tool)
into equivalent, much faster [`fd`](https://github.com/sharkdp/fd) commands.

The motivating case — agents running whole-filesystem searches that stall for
~60s of "no observed activity":

```
find / -type d -iname "*effect*skill*"
  ->  fd -H -I -t d --search-path / -g -i '*effect*skill*'
```

> pi's **builtin `find` tool** already uses `fd` internally and is fast. This
> extension only touches raw `find` invocations issued through the **bash**
> tool, which is where the slow searches actually come from.

## How it works

A `tool_call` handler inspects each bash command. When it finds a `find`
invocation whose entire expression maps exactly onto `fd`, it rewrites just that
invocation in place (`event.input.command`). Everything else — pipes,
redirections, other commands in the line — is preserved byte-for-byte.

**Correctness first.** If any part of the `find` expression falls outside the
verified-safe subset, the command is left completely untouched and the real
`find` runs. The extension never silently changes behavior.

## Translated (safe subset)

| `find`                       | `fd`                          |
| ---------------------------- | ----------------------------- |
| path operands                | `--search-path <root>`        |
| `-name GLOB`                 | `-g -s -- GLOB` (case-sensitive) |
| `-iname GLOB`                | `-g -i -- GLOB` (ignore-case) |
| `-type f\|d\|l\|b\|c\|p\|s`  | `-t <letter>`                 |
| `-maxdepth N` (N≥1)          | `--max-depth N`               |
| `-mindepth N`                | `--min-depth N`               |
| `-L` / `-follow`             | `-L`                          |
| `-P`                         | dropped (fd default)          |
| `-print`                     | dropped (find default action) |
| —                            | always adds `-H -I`           |

`-H -I` (`--hidden --no-ignore`) is injected so `fd` searches the **exact same
scope** as `find`, which honors no `.gitignore`/hidden rules. `-s`/`-i` pin the
case mode because `fd` defaults to *smart-case* (which would otherwise make
`-name '*.ts'` wrongly match `Bar.TS`).

## Left untouched (bail → real `find` runs)

`-exec`, `-delete`, `-path`/`-wholename`, `-regex`/`-iregex`, `-size`, `-mtime`
and other time tests, `-newer`, `-empty`, `-prune`, `-print0`, `-printf`, `-ls`,
`-depth`, `-perm`, `-user`/`-group`, boolean operators (`-o`, `-a`, `!`, `-not`)
and parentheses, `-H`, `-maxdepth 0`, multiple `-name` tests, comma `-type` lists
(GNU-only), patterns containing shell expansion (`$VAR`, `` `...` ``, `$(...)`),
commands containing heredocs (`<<`), and any redirection that interrupts the
middle of a `find` expression.

## Known, intentional differences

When a rewrite *does* happen, results match `find` except for two cosmetic
points inherent to `fd`:

- **Directory results from `fd` end with a trailing `/`** (e.g. `src/` vs `src`).
- **`fd` never emits the search root itself**, whereas `find <dir> -type d`
  lists `<dir>` at depth 0.
- For a relative root, `fd` prints `foo` where `find` prints `./foo`.

## Configuration

| Env var                  | Effect                                |
| ------------------------ | ------------------------------------- |
| `PI_FIND_TO_FD_DISABLE=1`| Disable rewriting entirely.           |
| `PI_FIND_TO_FD_DEBUG=1`  | Log each rewrite (and skips) to stderr. |

If neither `fd` nor `fdfind` is on `PATH`, the extension does nothing.

## Tests

```
node --experimental-strip-types find-to-fd/translate.test.ts
```

Runs unit assertions on the rewrite output plus **behavioral parity** checks
that execute real `find` and the rewritten `fd` against a fixture tree and
assert identical result sets.
