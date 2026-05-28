# Meter

Category: Visualization

[Tone.Meter](../classes/Meter.md) gives you the level of the incoming signal in decibels.

## Code

```js
const player = new Tone.Player({
	url: "https://tonejs.github.io/audio/berklee/Resonant_FM_laser1.mp3",
	loop: true,
}).toDestination();

const toneMeter = new Tone.Meter({
	channelCount: 2,
});
player.connect(toneMeter);

meter({
	tone: toneMeter,
	parent: document.querySelector("#content"),
});

ui({
	tone: player,
	name: "Player",
	parent: document.querySelector("#content"),
});

// bind the interface
document
	.querySelector("tone-play-toggle")
	.addEventListener("start", () => player.start());
document
	.querySelector("tone-play-toggle")
	.addEventListener("stop", () => player.stop());
```

Source: [meter.html](https://github.com/Tonejs/Tone.js/blob/main/examples/meter.html)
