# Envelope

Category: Basic

Envelopes ramp amplitude, frequency or any other parameter over time. [Tone.Envelope](../classes/Envelope.md) and the classes that extend it implement an [ADSR](https://en.wikipedia.org/wiki/Synthesizer#ADSR_envelope) envelope type which splits its ramp into four distinct phases: Attack, Decay, Sustain, Release. ![](https://upload.wikimedia.org/wikipedia/commons/e/ea/ADSR_parameter.svg)

## Code

```js
const env = new Tone.AmplitudeEnvelope({
	attack: 0.11,
	decay: 0.21,
	sustain: 0.5,
	release: 1.2,
}).toDestination();

// create an oscillator and connect it to the envelope
const osc = new Tone.Oscillator({
	partials: [3, 2, 1],
	type: "custom",
	frequency: "C#4",
	volume: -8,
})
	.connect(env)
	.start();

// bind the interface
drawer()
	.add({
		tone: env,
		name: "Envelope",
	})
	.add({
		tone: osc,
	});

document
	.querySelector("tone-momentary-button")
	.addEventListener("down", (e) => env.triggerAttack());
document
	.querySelector("tone-momentary-button")
	.addEventListener("up", (e) => env.triggerRelease());
```

Source: [envelope.html](https://github.com/Tonejs/Tone.js/blob/main/examples/envelope.html)
