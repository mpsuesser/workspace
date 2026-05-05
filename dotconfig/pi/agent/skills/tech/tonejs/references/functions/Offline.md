# Function Offline

- Offline(callback, duration, channels?, sampleRate?): Promise<[ToneAudioBuffer](../classes/ToneAudioBuffer.md)>

- Generate a buffer by rendering all of the Tone.js code within the callback using the OfflineAudioContext. The OfflineAudioContext is capable of rendering much faster than real time in many cases. The callback function also passes in an offline instance of [Context](../classes/Context.md) which can be used to schedule events along the Transport.

  #### Parameters

  - callback: ((context) => void \| Promise<void>)
    All Tone.js nodes which are created and scheduled within this callback are recorded into the output Buffer.

    - - (context): void \| Promise<void>

      - #### Parameters

        - context: [OfflineContext](../classes/OfflineContext.md)

        #### Returns void \| Promise<void>
  - duration: number
    the amount of time to record for.
  - channels: number = 2
  - sampleRate: number = ...

  #### Returns Promise<[ToneAudioBuffer](../classes/ToneAudioBuffer.md)>

  The promise which is invoked with the ToneAudioBuffer of the recorded output.

  #### Example

  ``` ts
  // render 2 seconds of the oscillator
  Tone.Offline(() => {
      // only nodes created in this callback will be recorded
      const oscillator = new Tone.Oscillator().toDestination().start(0);
  }, 2).then((buffer) => {
      // do something with the output buffer
      console.log(buffer);
  });
  ```

  #### Example

  ``` ts
  // can also schedule events along the Transport
  // using the passed in Offline Transport
  Tone.Offline(({ transport }) => {
      const osc = new Tone.Oscillator().toDestination();
      transport.schedule(time => {
          osc.start(time).stop(time + 0.1);
      }, 1);
      // make sure to start the transport
      transport.start(0.2);
  }, 4).then((buffer) => {
      // do something with the output buffer
      console.log(buffer);
  });
  ```

  - Defined in [Tone/core/context/Offline.ts:41](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Offline.ts#L41)
