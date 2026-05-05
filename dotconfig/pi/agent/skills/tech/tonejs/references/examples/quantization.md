# Quantization

Category: Sequencing / Timing

Using the "@" symbol, [Time](https://github.com/Tonejs/Tone.js/wiki/Time) expressions can be [quantized](https://en.wikipedia.org/wiki/Quantization_(music)) (aligned to a subdivision). In this example, a note's start time is aligned to the given subdivision.\
\
The Transport must be started

## Code

```js
const polySynth = new Tone.PolySynth(Tone.Synth).toDestination();

function loop() {
	requestAnimationFrame(loop);
	// @ts-ignore
	const [bar, beat, sixteenth] = Tone.Transport.position.split(":");
	document.querySelector("#progress").textContent = `
		bar: ${bar}, beat: ${beat}, sixteenth: ${sixteenth}
	`;
}
loop();

// bind the interface
document.querySelector("tone-play-toggle").addEventListener("start", e => {
	Tone.Transport.start();
	// enable all of the buttons if it's playing
	// @ts-ignore		
	Array.from(document.querySelectorAll("tone-button")).forEach(el => el.disabled = false);
});
document.querySelector("tone-play-toggle").addEventListener("stop", () => {
	Tone.Transport.stop();
	// disable all of the buttons if it's not playing
	// @ts-ignore		
	Array.from(document.querySelectorAll("tone-button")).forEach(el => el.disabled = true);
});
document.querySelector("#at8n").addEventListener("click", e => {
	polySynth.triggerAttackRelease("B4", "8n", "@8n");
});
document.querySelector("#at4n").addEventListener("click", e => {
	polySynth.triggerAttackRelease("E4", "8n", "@4n");
});
document.querySelector("#at2n").addEventListener("click", e => {
	polySynth.triggerAttackRelease("G3", "8n", "@2n");
});
document.querySelector("#at1m").addEventListener("click", e => {
	polySynth.triggerAttackRelease("C2", "8n", "@1m");
});
```

Source: [quantization.html](https://github.com/Tonejs/Tone.js/blob/main/examples/quantization.html)
