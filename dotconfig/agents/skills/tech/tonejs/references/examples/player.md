# Player

Category: Basic

Click on the button to play the audio file on loop using [Tone.Player](../classes/Player.md).

## Code

```js
// the player
const player = new Tone.Player({
	url: "https://tonejs.github.io/audio/loop/FWDL.mp3",
	loop: true,
	loopStart: 0.5,
	loopEnd: 0.7,
}).toDestination();

ui({
	tone: player,
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

Source: [player.html](https://github.com/Tonejs/Tone.js/blob/main/examples/player.html)
