# Animation Sync

Category: Visualization

Audio scheduling and rendering visuals should always be kept separate. Instead of triggering visuals from within a scheduled event callback, schedule a 'deferred' callback using Tone.Draw which will be invoked on an animation frame at the exact moment of the scheduled event.\
\
For more information see [this wiki article](https://github.com/Tonejs/Tone.js/wiki/Performance).

## Code

```js
const synth = new Tone.Synth({
	oscillator: {
		type: "fmsine4",
		modulationType: "square"
	}
}).toDestination();

const loop = new Tone.Pattern(((time, note) => {
	synth.triggerAttackRelease(note, "16n", time);

	// Draw.schedule takes a callback and a time to invoke the callback
	Tone.Draw.schedule(() => {
		// the callback synced to the animation frame at the given time
		const noteElement = document.querySelector("#"+note);
		noteElement.classList.add("active");
		setTimeout(() => {
			noteElement.classList.remove("active");
		}, 100);
	}, time);
}), ["C4", "E4", "G4", "B4", "D5"]).start(0);

loop.interval = "16n";

drawer().add({
	tone: synth,
	title: "Piano",
});

// connect the UI with the components
document.querySelector("tone-play-toggle").addEventListener("start", () => Tone.Transport.start());
document.querySelector("tone-play-toggle").addEventListener("stop", () => Tone.Transport.stop());
```

Source: [animationSync.html](https://github.com/Tonejs/Tone.js/blob/main/examples/animationSync.html)
