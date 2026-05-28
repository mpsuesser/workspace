# LFO Effects

Category: Effects

These effects use an [LFO](../classes/LFO.md) (Low Frequency Oscillator) to modulate the effect. Click and drag the dot to change the frequency and depth of the effect.\
\
Docs on [Tone.AutoPanner](../classes/AutoPanner.md), [Tone.AutoFilter](../classes/AutoFilter.md), and [Tone.Tremolo](../classes/Tremolo.md)

## Code

```js
// AutoPanner - a panning modulation effect
const panner = new Tone.AutoPanner({
	frequency: 4,
	depth: 1,
})
	.toDestination()
	.start();

// AutoFilter - a filter modulation effect
const filter = new Tone.AutoFilter({
	frequency: 2,
	depth: 0.6,
})
	.toDestination()
	.start();

// Tremolo - an amplitude modulation effect
const tremolo = new Tone.Tremolo({
	frequency: 0.6,
	depth: 0.7,
})
	.toDestination()
	.start();

// the input oscillators
const pannerOsc = new Tone.Oscillator({
	volume: -12,
	type: "square6",
	frequency: "C4",
}).connect(panner);

const filterOsc = new Tone.Oscillator({
	volume: -12,
	type: "square6",
	frequency: "E4",
}).connect(filter);

const tremoloOsc = new Tone.Oscillator({
	volume: -12,
	type: "square6",
	frequency: "A4",
}).connect(tremolo);

// bind the interface
document
	.querySelector("#osc0")
	.addEventListener("start", () => pannerOsc.start());
document
	.querySelector("#osc0")
	.addEventListener("stop", () => pannerOsc.stop());
document
	.querySelector("#panner")
	.addEventListener(
		"input",
		(e) => (panner.frequency.value = parseFloat(e.target.value))
	);
document
	.querySelector("#osc1")
	.addEventListener("start", () => filterOsc.start());
document
	.querySelector("#osc1")
	.addEventListener("stop", () => filterOsc.stop());
document
	.querySelector("#filter")
	.addEventListener(
		"input",
		(e) => (filter.frequency.value = parseFloat(e.target.value))
	);
document
	.querySelector("#osc2")
	.addEventListener("start", () => tremoloOsc.start());
document
	.querySelector("#osc2")
	.addEventListener("stop", () => tremoloOsc.stop());
document
	.querySelector("#tremolo")
	.addEventListener(
		"input",
		(e) =>
			(tremolo.frequency.value = parseFloat(e.target.value))
	);
```

Source: [lfoEffects.html](https://github.com/Tonejs/Tone.js/blob/main/examples/lfoEffects.html)
