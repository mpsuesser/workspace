# PolySynth

Category: Instruments

[Tone.PolySynth](../classes/PolySynth.md) handles voice creation and allocation for any monophonic instruments passed in as the second parameter. PolySynth is not a synthesizer by itself, it merely manages voices of one of the other types of synths, allowing any of the monophonic synthesizers to be polyphonic.

## Code

```js
const synth = new Tone.PolySynth(Tone.Synth, {
	oscillator: {
		partials: [0, 2, 3, 4],
	},
}).toDestination();

piano({
	parent: document.querySelector("#content"),
	polyphonic: true,
	noteon: (note) => synth.triggerAttack(note.name),
	noteoff: (note) => synth.triggerRelease(note.name),
});

ui({
	tone: synth,
	parent: document.querySelector("#content"),
});
```

Source: [polySynth.html](https://github.com/Tonejs/Tone.js/blob/main/examples/polySynth.html)
