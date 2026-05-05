---
name: tonejs
description: Build browser audio and interactive music with Tone.js in TypeScript/JavaScript. Use when creating synths, samplers, players, effects, sequences, transport-synced events, Web Audio graphs, or any UI that makes sound with Tone.js.
---

# Tone.js

Tone.js is a Web Audio framework for interactive music in the browser.

When working with Tone.js, read the relevant local reference first. The files in `references/` mirror the Tone.js README, examples, and TypeDoc API docs.

## Critical rules

- Browser audio must start from a user gesture. Call `await Tone.start()` in a click/key handler before playing sound.
- Dispose nodes you create (`synth.dispose()`, `effect.dispose()`, etc.) when UI components unmount or sounds are no longer needed.
- Schedule with Tone's audio clock (`Tone.now()`, `Tone.Transport`, `triggerAttackRelease(..., time)`) instead of `setTimeout` for musical timing.
- In TypeScript modules, prefer `import * as Tone from "tone"`; examples from the Tone.js repo often use a global `Tone` object in browser HTML.

## Minimal example

```ts
import * as Tone from "tone";

async function play() {
  await Tone.start();
  const synth = new Tone.Synth().toDestination();
  synth.triggerAttackRelease("C4", "8n");
}
```

## Start here

- [README / installation / hello world](references/readme.md)
- [Full API map](references/api-map.md) (298 TypeDoc pages)
- [Examples map](references/examples.md) (34 examples)
- [Class hierarchy](references/hierarchy.md)

## Common API references

- [Install/import and hello world](references/readme.md)
- [Start audio after a user gesture](references/functions/start.md)
- [Current AudioContext time](references/functions/now.md)
- [Wait for samples/buffers to load](references/functions/loaded.md)
- [Synth](references/classes/Synth.md)
- [PolySynth](references/classes/PolySynth.md)
- [Sampler](references/classes/Sampler.md)
- [Player](references/classes/Player.md)
- [Transport](references/variables/Transport.md)
- [Sequence](references/classes/Sequence.md)
- [Part](references/classes/Part.md)
- [Loop](references/classes/Loop.md)
- [Reverb](references/classes/Reverb.md)
- [PingPongDelay](references/classes/PingPongDelay.md)
- [Filter](references/classes/Filter.md)
- [Envelope](references/classes/Envelope.md)

## Common examples

- [Simple Synth](references/examples/simpleSynth.md)
- [PolySynth](references/examples/polySynth.md)
- [Sampler](references/examples/sampler.md)
- [Player](references/examples/player.md)
- [Step Sequencer](references/examples/stepSequencer.md)
- [Events](references/examples/events.md)
- [PingPongDelay](references/examples/pingPongDelay.md)
- [Reverb](references/examples/reverb.md)
- [Offline Rendering](references/examples/offline.md)

## Task guide

- Simple note or synth sound: read [Synth](references/classes/Synth.md) and [start](references/functions/start.md).
- Chords/polyphony: read [PolySynth](references/classes/PolySynth.md).
- Sample playback: read [Sampler](references/classes/Sampler.md), [Player](references/classes/Player.md), and [loaded](references/functions/loaded.md).
- Rhythms/sequencing: read [Transport](references/variables/Transport.md), [Sequence](references/classes/Sequence.md), [Part](references/classes/Part.md), and [Loop](references/classes/Loop.md).
- Effects chain: read the effect class, then connect with `.connect()`, `.chain()`, or `.toDestination()`.
