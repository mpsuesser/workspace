# Reverb

Category: Effects

[Tone.Reverb](../classes/Reverb.md) is a convolution-based reverb. An impulse response is created with a decaying noise burst when you click 'Generate Reverb'. The 'Decay Time' controls how long the noise burst lasts. If the 'Decay Time' is changed, a new noise burst will need to be generated.

## Code

```js
const reverb = new Tone.Reverb().toDestination();

const player = new Tone.Player({
	url: "https://tonejs.github.io/audio/berklee/shaker_slow_1.mp3",
	loop: true,
	volume: 6,
}).connect(reverb);

ui({
	parent: document.querySelector("#content"),
	tone: reverb,
});

// bind the interface
document
	.querySelector("tone-play-toggle")
	.addEventListener("start", () => player.start());
document
	.querySelector("tone-play-toggle")
	.addEventListener("stop", () => player.stop());
```

Source: [reverb.html](https://github.com/Tonejs/Tone.js/blob/main/examples/reverb.html)
