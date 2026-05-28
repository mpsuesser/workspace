# Step Sequencer

Category: Sequencing / Timing

[Tone.Transport](../functions/getTransport.md) is the application-wide timekeeper. Its clock source enables sample-accurate scheduling as well as tempo-curves and automation. This example uses Tone.Sequence to invoke a callback every 16th note.

## Code

```js
const keys = new Tone.Players({
	urls: {
		0: "A1.mp3",
		1: "Cs2.mp3",
		2: "E2.mp3",
		3: "Fs2.mp3",
	},
	fadeOut: "64n",
	baseUrl: "https://tonejs.github.io/audio/casio/",
}).toDestination();

document
	.querySelector("tone-play-toggle")
	.addEventListener("start", () => Tone.Transport.start());
document
	.querySelector("tone-play-toggle")
	.addEventListener("stop", () => Tone.Transport.stop());
document
	.querySelector("tone-slider")
	.addEventListener(
		"input",
		(e) =>
			(Tone.Transport.bpm.value = parseFloat(e.target.value))
	);
document
	.querySelector("tone-step-sequencer")
	.addEventListener("trigger", ({ detail }) => {
		keys.player(detail.row).start(detail.time, 0, "16t");
	});
```

Source: [stepSequencer.html](https://github.com/Tonejs/Tone.js/blob/main/examples/stepSequencer.html)
