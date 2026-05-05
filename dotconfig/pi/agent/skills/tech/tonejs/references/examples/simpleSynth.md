# Synth

Category: Instruments

[Tone.Synth](../classes/Synth.md) is composed simply of a [Tone.OmniOscillator](../classes/OmniOscillator.md) routed through a [Tone.AmplitudeEnvelope](../classes/AmplitudeEnvelope.md).

## Code

```js
const synth = new Tone.Synth({
	oscillator: {
		type: "amtriangle",
		harmonicity: 0.5,
		modulationType: "sine",
	},
	envelope: {
		attackCurve: "exponential",
		attack: 0.05,
		decay: 0.2,
		sustain: 0.2,
		release: 1.5,
	},
	portamento: 0.05,
}).toDestination();

piano({
	tone: synth,
	parent: document.querySelector("#content"),
	noteon: (note) => synth.triggerAttack(note.name),
	noteoff: (note) => synth.triggerRelease(),
});

ui({
	tone: synth,
	name: "Synth",
	parent: document.querySelector("#content"),
});
```

Source: [simpleSynth.html](https://github.com/Tonejs/Tone.js/blob/main/examples/simpleSynth.html)
