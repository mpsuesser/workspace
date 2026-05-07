# Function fanIn

- fanIn(...nodes): void

- Connect the output of one or more source nodes to a single destination node

  #### Parameters

  - `Rest` ...nodes: [OutputNode](../types/OutputNode.md)\[\]
    One or more source nodes followed by one destination node

  #### Returns void

  #### Example

  ``` ts
  const player = new Tone.Player("https://tonejs.github.io/audio/drum-samples/conga-rhythm.mp3");
  const player1 = new Tone.Player("https://tonejs.github.io/audio/drum-samples/conga-rhythm.mp3");
  const filter = new Tone.Filter("G5").toDestination();
  // connect nodes to a common destination
  Tone.fanIn(player, player1, filter);
  ```

  - Defined in [Tone/core/context/ToneAudioNode.ts:408](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L408)
