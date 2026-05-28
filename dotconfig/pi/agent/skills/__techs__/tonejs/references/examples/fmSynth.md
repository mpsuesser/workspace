# FMSynth

Category: Instruments

[Tone.FMSynth](../classes/FMSynth.md) is composed of two [Tone.Synths](../classes/Synth.md) where one Tone.Synth modulates the frequency of a second Tone.Synth.

## Code

```js
const synth = new Tone.FMSynth({
	modulationIndex: 12.22,
	envelope: {
		attack: 0.01,
		decay: 0.2,
	},
	modulation: {
		type: "square",
	},
	modulationEnvelope: {
		attack: 0.2,
		decay: 0.01,
	},
}).toDestination();

piano({
	tone: synth,
	parent: document.querySelector("#content"),
	noteon: (note) => synth.triggerAttack(note.name),
	noteoff: (note) => synth.triggerRelease(),
});

ui({
	tone: synth,
	name: "FMSynth",
	parent: document.querySelector("#content"),
});
```

Source: [fmSynth.html](https://github.com/Tonejs/Tone.js/blob/main/examples/fmSynth.html)
