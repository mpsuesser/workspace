# AMSynth

Category: Instruments

[Tone.AMSynth](../classes/AMSynth.md) is composed of two [Tone.Synths](../classes/Synth.md) where one Tone.Synth modulates the amplitude of a second Tone.Synth.

## Code

```js
const synth = new Tone.AMSynth({
	harmonicity: 2.5,
	oscillator: {
		type: "fatsawtooth",
	},
	envelope: {
		attack: 0.1,
		decay: 0.2,
		sustain: 0.2,
		release: 0.3,
	},
	modulation: {
		type: "square",
	},
	modulationEnvelope: {
		attack: 0.5,
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
	name: "AMSynth",
	parent: document.querySelector("#content"),
});
```

Source: [amSynth.html](https://github.com/Tonejs/Tone.js/blob/main/examples/amSynth.html)
