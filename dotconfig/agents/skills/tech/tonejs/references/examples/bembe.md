# MetalSynth

Category: Instruments

[Tone.MetalSynth](../classes/MetalSynth.md) creates metallic, inharmonic sounds using 6 [Tone.FMOscillators](../classes/FMOscillator.md) with a tuning based on the TR-808 Cymbal. [Tone.MembraneSynth](../classes/MembraneSynth.md) makes kick and tom-like sounds using a frequency envelope which is triggered on notes attack.

## Code

```js
const bell = new Tone.MetalSynth({
	harmonicity: 12,
	resonance: 800,
	modulationIndex: 20,
	envelope: {
		decay: 0.4,
	},
	volume: -15,
}).toDestination();

const bellPart = new Tone.Sequence(
	(time, freq) => {
		bell.triggerAttack(freq, time, Math.random() * 0.5 + 0.5);
	},
	[
		[300, null, 200],
		[null, 200, 200],
		[null, 200, null],
		[200, null, 200],
	],
	"4n"
).start(0);

const conga = new Tone.MembraneSynth({
	pitchDecay: 0.008,
	octaves: 2,
	envelope: {
		attack: 0.0006,
		decay: 0.5,
		sustain: 0,
	},
}).toDestination();

const congaPart = new Tone.Sequence(
	(time, pitch) => {
		conga.triggerAttack(pitch, time, Math.random() * 0.5 + 0.5);
	},
	["G3", "C4", "C4", "C4"],
	"4n"
).start(0);

Tone.Transport.bpm.value = 115;

drawer()
	.add({
		tone: conga,
		title: "Conga",
	})
	.add({
		tone: bell,
		title: "Bell",
	});

// connect the UI with the components
document
	.querySelector("tone-play-toggle")
	.addEventListener("start", () => Tone.Transport.start());
document
	.querySelector("tone-play-toggle")
	.addEventListener("stop", () => Tone.Transport.stop());
```

Source: [bembe.html](https://github.com/Tonejs/Tone.js/blob/main/examples/bembe.html)
