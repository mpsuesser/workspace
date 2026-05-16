# MonoSynth

Category: Instruments

[Tone.MonoSynth](../classes/MonoSynth.md) is composed of one oscillator, one filter, and two envelopes. Both envelopes are triggered simultaneously when a note is triggered.

## Code

```js
const synth = new Tone.PolySynth(Tone.MonoSynth, {
	volume: -8,
	oscillator: {
		type: "square8",
	},
	envelope: {
		attack: 0.05,
		decay: 0.3,
		sustain: 0.4,
		release: 0.8,
	},
	filterEnvelope: {
		attack: 0.001,
		decay: 0.7,
		sustain: 0.1,
		release: 0.8,
		baseFrequency: 300,
		octaves: 4,
	},
}).toDestination();

piano({
	noteon: (note) => synth.triggerAttack(note.name),
	noteoff: (note) => synth.triggerRelease(note.name),
	parent: document.querySelector("#content"),
});

ui({
	tone: synth,
	parent: document.querySelector("#content"),
	name: "MonoSynth",
});
```

Source: [monoSynth.html](https://github.com/Tonejs/Tone.js/blob/main/examples/monoSynth.html)
