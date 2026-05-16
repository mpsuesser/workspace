# Spatialization

Category: Effects

Tone.Panner3D and Tone.Listener work together to create 3D audio. Connect your synths and sources to Panner3D and then to the master output, anything you connect to the panner will be spatialized according the position of the panner relative to the position of the listener. This example synchronizes the position of the camera with Tone.Listener and the position of each of the spheres with a track.\
\
Note: the 3D panning effect is more effective with headphones.

## Code

```js
function createPlayerPlusPanner(url, positionX, positionY, positionZ) {
	const panner = new Tone.Panner3D({
		panningModel: "HRTF",
		positionX,
		positionY,
		positionZ,
	}).toDestination();

	const player = new Tone.Player({
		url,
		loop: true,
	}).connect(panner).sync().start(0);
}
createPlayerPlusPanner("https://tonejs.github.io/audio/berklee/taps_1c.mp3", 2, 0, 0);
createPlayerPlusPanner("https://tonejs.github.io/audio/berklee/tinkle3.mp3", 0, 0, 2);
createPlayerPlusPanner("https://tonejs.github.io/audio/berklee/tapping1.mp3", -2, 0, 2);
createPlayerPlusPanner("https://tonejs.github.io/audio/berklee/thump1.mp3", -2, 0, -2);

document.querySelector("tone-play-toggle").addEventListener("start", () => Tone.Transport.start());
document.querySelector("tone-play-toggle").addEventListener("stop", () => Tone.Transport.stop());

function setRotation(angle) {
	Tone.Listener.forwardX.value = Math.sin(angle);
	Tone.Listener.forwardY.value = 0;
	Tone.Listener.forwardZ.value = -Math.cos(angle);
}

document.querySelector("#xSlider").addEventListener("input", (e) => Tone.Listener.positionX.value = parseFloat(e.target.value));
document.querySelector("#zSlider").addEventListener("input", (e) => Tone.Listener.positionY.value = parseFloat(e.target.value));
document.querySelector("#rotation").addEventListener("input", (e) => setRotation(parseFloat(e.target.value)));
```

Source: [spatialPanner.html](https://github.com/Tonejs/Tone.js/blob/main/examples/spatialPanner.html)
