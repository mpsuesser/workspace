# wow-quest-sounds

Classic World of Warcraft quest sounds for pi:

- **Quest accepted** flourish when you submit a fresh prompt.
- **Quest complete** fanfare when the top-level agent finishes its turn.

## Triggers

| Cue            | Event        | Gating                                                                      |
| -------------- | ------------ | --------------------------------------------------------------------------- |
| Quest accepted | `input`      | `source === "interactive"` and idle submit (no steers / queued follow-ups). |
| Quest complete | `agent_end`  | `ctx.hasUI` is `true` and not inside a subagent.                            |

Subagents run as separate `pi` processes in print mode (`hasUI === false`,
`PI_SUBAGENT_DEPTH >= 1`), so neither cue fires for them — only the session you
are talking to directly makes noise.

Each cue is spawned detached and plays to completion; cues are never killed, so
on a very fast turn the tail of the accept flourish may briefly overlap the
complete fanfare (the OS mixes them).

## Disable without unloading

```sh
export WOW_QUEST_SOUNDS=off   # also accepts 0 / false / no
```

To unload entirely, add `"-extensions/wow-quest-sounds/index.ts"` to the
`extensions` array in `~/.pi/agent/settings.json`.

## Playback

Uses the first available of `mpv`, `ffplay`, or `afplay`. At least one must be
on `PATH`. `mpv` is preferred because macOS `afplay` misreads the length of
these game `.ogg` files and stops early; it is kept only as a last resort.

## Assets

`assets/*.ogg` are the authentic Blizzard files extracted from the WoW client:

- `quest-accept.ogg` — `Sound/Interface/iQuestActivate.ogg` (FileDataID 567400)
- `quest-complete.ogg` — `Sound/Interface/iQuestComplete.ogg` (FileDataID 567439)
