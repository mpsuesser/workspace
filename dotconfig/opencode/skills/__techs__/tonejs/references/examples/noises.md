# Noise

Category: Basic

[Tone.Noise](../classes/Noise.md) has 3 different types of noise. Careful, it's loud!

## Code

```js
// make the noise and connect it to the output
const noise = new Tone.Noise({
	volume: -10,
	type: "brown",
}).toDestination();

const toneWaveform = new Tone.Waveform();
noise.connect(toneWaveform);

waveform({
	parent: document.querySelector("#content"),
	tone: toneWaveform,
});

ui({
	parent: document.querySelector("#content"),
	tone: noise,
});

// bind the inteface
document
	.querySelector("tone-momentary-button")
	.addEventListener("down", () => noise.start());
document
	.querySelector("tone-momentary-button")
	.addEventListener("up", () => noise.stop());
```

Source: [noises.html](https://github.com/Tonejs/Tone.js/blob/main/examples/noises.html)
