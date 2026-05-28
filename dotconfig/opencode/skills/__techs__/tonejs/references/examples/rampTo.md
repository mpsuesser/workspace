# Ramping Values

Category: Signals

Working with signals is different than working with numbers or strings: Signals are values which are updated at audio rate, which allows for sample-accurate scheduling and ramping. `.rampTo(value, rampTime)` smoothly changes the signal from the current value to the target value over the duration of the rampTime. This example uses `.rampTo` in to smooth out changes in volume and frequency.

## Code

```js
const oscillators = [];

const bassFreq = 32;

for (let i = 0; i < 8; i++) {
	oscillators.push(new Tone.Oscillator({
		frequency: bassFreq * i,
		type: "sawtooth4",
		volume: -Infinity,
		detune: Math.random() * 30 - 15,
	}).toDestination());
}

// bind the interface
document.querySelector("tone-play-toggle").addEventListener("start", e => {
	oscillators.forEach(o => {
		o.start();
		o.volume.rampTo(-20, 1);
	});
});

document.querySelector("tone-play-toggle").addEventListener("stop", e => {
	oscillators.forEach(o => {
		o.stop("+1.2");
		o.volume.rampTo(-Infinity, 1);
	});
});

document.querySelector("tone-slider").addEventListener("input", e => {
	oscillators.forEach((osc, i) => {
		osc.frequency.rampTo(bassFreq * i * parseFloat(e.target.value), 0.4);
	});
});
```

Source: [rampTo.html](https://github.com/Tonejs/Tone.js/blob/main/examples/rampTo.html)
