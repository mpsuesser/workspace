# Oscillators

Category: Basic

The oscillator has 4 basic types which can be altered by setting the number of partials and partials array.\
\
[Tone.Oscillator](../classes/Oscillator.md) docs.

## Code

```js
const osc = new Tone.Oscillator({
	type: "square",
	frequency: 440,
	volume: -16,
}).toDestination();

ui({
	tone: osc,
	parent: document.querySelector("#content"),
});

// bind the interface
document
	.querySelector("tone-momentary-button")
	.addEventListener("down", () => osc.start());
document
	.querySelector("tone-momentary-button")
	.addEventListener("up", () => osc.stop());
```

Source: [oscillator.html](https://github.com/Tonejs/Tone.js/blob/main/examples/oscillator.html)
