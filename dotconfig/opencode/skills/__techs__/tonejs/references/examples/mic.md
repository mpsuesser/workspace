# Microphone

Category: Basic

If supported, Tone.UserMedia uses `getUserMedia` to open the user's microphone where it can then be processed with Tone.js. Only works on https domains.

## Code

```js
// you probably DONT want to connect the microphone
// directly to the master output because of feedback.
const mic = new Tone.UserMedia();

const micFFT = new Tone.FFT();
mic.connect(micFFT);

fft({
	tone: micFFT,
	parent: document.querySelector("#content")
});

// bind the interface
const micButton = document.querySelector("tone-mic-button");
micButton.supported = Tone.UserMedia.supported;
micButton.addEventListener("open", () => mic.open());
micButton.addEventListener("close", () => mic.close());
```

Source: [mic.html](https://github.com/Tonejs/Tone.js/blob/main/examples/mic.html)
