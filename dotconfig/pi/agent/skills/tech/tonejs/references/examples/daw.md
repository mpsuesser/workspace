# Transport Sync

Category: Sequencing / Timing

This beat is composed of 3 independent Players each with a different loop length, synced to the Transport to start at different times and different offsets. The players stay synchronized to the position and offset of the Transport.

## Code

```js
// set the transport
Tone.Transport.bpm.value = 108;
Tone.Transport.loop = true;
Tone.Transport.loopStart = "4m";
Tone.Transport.loopEnd = "8m";

const kick = new Tone.Player({
	url: "https://tonejs.github.io/audio/loop/kick.mp3",
	loop: true
}).toDestination().sync().start(0);

const snare = new Tone.Player({
	url: "https://tonejs.github.io/audio/loop/snare.mp3",
	loop: true
}).toDestination().sync().start("2n");

const hh = new Tone.Player({
	url: "https://tonejs.github.io/audio/loop/hh.mp3",
	loop: true
}).toDestination().sync().start("3:3", "4n"); // start with an offset

// connect the UI with the components
document.querySelector("tone-play-toggle").addEventListener("start", () => Tone.Transport.start());
document.querySelector("tone-play-toggle").addEventListener("stop", () => Tone.Transport.stop());

// keep the playhead on track
setInterval(() => {
	// scale it between 0-1
	const progress = (Tone.Transport.progress + 1) / 2;
	document.querySelector("#progress").style = `left: ${progress*100}%`;
}, 16);
```

Source: [daw.html](https://github.com/Tonejs/Tone.js/blob/main/examples/daw.html)
