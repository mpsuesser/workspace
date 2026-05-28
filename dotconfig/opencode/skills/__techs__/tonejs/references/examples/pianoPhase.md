# Playback Rate

Category: Sequencing / Timing

By slightly slowing down the playbackRate of the Tone.Sequence in the right channel, the two identical melodies phase against each other in interesting ways.\
\
Composition by Steve Reich. Inspiration from Alexander Chen.

## Code

```js
// set the bpm and time signature first
Tone.Transport.timeSignature = [6, 4];
Tone.Transport.bpm.value = 180;

// L/R channel merging
const merge = new Tone.Merge();

// a little reverb
const reverb = new Tone.Reverb({
	wet: 0.3
});

merge.chain(reverb, Tone.Destination);

// left and right synthesizers
const synthL = new Tone.Synth({
	oscillator: {
		type: "custom",
		partials: [2, 1, 2, 2],
	},
	envelope: {
		attack: 0.005,
		decay: 0.3,
		sustain: 0.2,
		release: 1,
	},
	portamento: 0.01,
	volume: -20
}).connect(merge, 0, 0);
const synthR = new Tone.Synth({
	oscillator: {
		type: "custom",
		partials: [2, 1, 2, 2],
	},
	envelope: {
		attack: 0.005,
		decay: 0.3,
		sustain: 0.2,
		release: 1,
	},
	portamento: 0.01,
	volume: -20
}).connect(merge, 0, 1);

// the two Tone.Sequences
const partL = new Tone.Sequence(((time, note) => {
	synthL.triggerAttackRelease(note, "8n", time);
}), ["E4", "F#4", "B4", "C#5", "D5", "F#4", "E4", "C#5", "B4", "F#4", "D5", "C#5"], "8n").start();

const partR = new Tone.Sequence(((time, note) => {
	synthR.triggerAttackRelease(note, "8n", time);
}), ["E4", "F#4", "B4", "C#5", "D5", "F#4", "E4", "C#5", "B4", "F#4", "D5", "C#5"], "8n").start("2m");

// set the playback rate of the right part to be slightly slower
partR.playbackRate = 0.985;

// bind the interface
document.querySelector("tone-play-toggle").addEventListener("start", () => Tone.Transport.start());
document.querySelector("tone-play-toggle").addEventListener("stop", () => Tone.Transport.stop());

// update the width of the fill bars to reflect the left and right progress
function progressToWidth(progress) {
	progress = Math.cos(progress * Math.PI * 2 + Math.PI);
	progress = (progress + 1) / 2;
	return `${progress * 100}%`;
}
function loop() {
	requestAnimationFrame(loop);
	// make it go out and back for each loop
	// @ts-ignore
	document.querySelector("#left").style.width = progressToWidth(partL.progress);
	// @ts-ignore
	document.querySelector("#right").style.width = progressToWidth(partR.progress);
}
loop();
```

Source: [pianoPhase.html](https://github.com/Tonejs/Tone.js/blob/main/examples/pianoPhase.html)
