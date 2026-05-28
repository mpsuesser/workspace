# Analysis

Category: Visualization

[Tone.FFT](../classes/FFT.md) returns the amplitude of the incoming signal at different frequencies. [Tone.Waveform](../classes/Waveform.md) returns the signal value between 0-1.

## Code

```js
const player = new Tone.Player({
	url: "https://tonejs.github.io/audio/berklee/arpeggio2.mp3",
	loop: true,
}).toDestination();

const toneMeter = new Tone.Meter();
player.connect(toneMeter);

const toneFFT = new Tone.FFT();
player.connect(toneFFT);

const toneWaveform = new Tone.Waveform();
player.connect(toneWaveform);

// bind the GUI
drawer().add({
	tone: player,
	title: "Player",
});
meter({
	tone: toneMeter,
	parent: document.querySelector("#content"),
});
fft({
	tone: toneFFT,
	parent: document.querySelector("#content"),
});
waveform({
	tone: toneWaveform,
	parent: document.querySelector("#content"),
});

document
	.querySelector("tone-play-toggle")
	.addEventListener("start", () => player.start());
document
	.querySelector("tone-play-toggle")
	.addEventListener("stop", () => player.stop());
```

Source: [analysis.html](https://github.com/Tonejs/Tone.js/blob/main/examples/analysis.html)
