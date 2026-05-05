# PitchShift

Category: Effects

This example demonstrates the Pitch Shift effect.\
\
[Tone.Pitch Shift](../classes/PitchShift.md) docs.

## Code

```js
const pitchShift = new Tone.PitchShift().toDestination();
const player = new Tone.Player(
	"https://tonejs.github.io/audio/berklee/groovin_analogsynth1.mp3"
).connect(pitchShift);
player.loop = true;

const toneFFT = new Tone.FFT();
pitchShift.connect(toneFFT);
fft({
	parent: document.querySelector("#content"),
	tone: toneFFT,
});

// bind the interface
document
	.querySelector("tone-play-toggle")
	.addEventListener("start", () => player.start());
document
	.querySelector("tone-play-toggle")
	.addEventListener("stop", () => player.stop());
// document.querySelector("tone-play-toggle").addEventListener('start', () => {
// 	debugger;
// });

document
	.querySelector("tone-slider")
	.addEventListener("input", (e) => {
		pitchShift.pitch = parseFloat(e.target.value);
	});
```

Source: [pitchShift.html](https://github.com/Tonejs/Tone.js/blob/main/examples/pitchShift.html)
