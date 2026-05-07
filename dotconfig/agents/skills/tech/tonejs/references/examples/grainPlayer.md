# Granular Synthesis

Category: Instruments

[Tone.GrainPlayer](../classes/GrainPlayer.md) uses [granular synthesis](https://en.wikipedia.org/wiki/Granular_synthesis) to enable you to adjust pitch and playback rate independently. The grainSize is the amount of time each small chunk of audio is played for and the overlap is the amount of crossfading transition time between successive grains.

## Code

```js
// the player
const player = new Tone.GrainPlayer({
	url: "https://tonejs.github.io/audio/berklee/arpeggio3crazy.mp3",
	loop: true,
	grainSize: 0.1,
	overlap: 0.05,
}).toDestination();

ui({
	parent: document.querySelector("#content"),
	tone: player,
});

// bind the interface
document
	.querySelector("tone-play-toggle")
	.addEventListener("start", () => player.start());
document
	.querySelector("tone-play-toggle")
	.addEventListener("stop", () => player.stop());
```

Source: [grainPlayer.html](https://github.com/Tonejs/Tone.js/blob/main/examples/grainPlayer.html)
