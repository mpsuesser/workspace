# PingPongDelay

Category: Effects

A Ping Pong Delay is a stereo feedback delay where the delay bounces back and forth between the left and right channels. Hit the button to trigger a snare sample into the effect.\
\
[Tone.PingPongDelay](../classes/PingPongDelay.md) docs.

## Code

```js
// the feedback delay
const feedbackDelay = new Tone.PingPongDelay({
	delayTime: "8n",
	feedback: 0.6,
	wet: 0.5,
}).toDestination();

// play a snare sound through it
const player = new Tone.Player(
	"https://tonejs.github.io/audio/drum-samples/CR78/snare.mp3"
).connect(feedbackDelay);

const toneMeter = new Tone.Meter({ channelCount: 2 });
feedbackDelay.connect(toneMeter);

meter({
	tone: toneMeter,
	parent: document.querySelector("#content"),
});

document
	.querySelector("tone-momentary-button")
	.addEventListener("down", () => player.start());
document
	.querySelector("tone-momentary-button")
	.addEventListener("up", () => player.stop());
```

Source: [pingPongDelay.html](https://github.com/Tonejs/Tone.js/blob/main/examples/pingPongDelay.html)
