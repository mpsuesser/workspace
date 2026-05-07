# Function start

- start(): Promise<void>

- Most browsers will not play *any* audio until a user clicks something (like a play button). Invoke this method on a click or keypress event handler to start the audio context. More about the Autoplay policy [here](https://developers.google.com/web/updates/2017/09/autoplay-policy-changes#webaudio)

  #### Returns Promise<void>

  #### Example

  ``` ts
  document.querySelector("button").addEventListener("click", async () => {
      await Tone.start();
      console.log("context started");
  });
  ```

  - Defined in [Tone/core/Global.ts:74](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Global.ts#L74)
