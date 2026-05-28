# Class ToneBufferSource

Wrapper around the native BufferSourceNode.

#### Hierarchy

- OneShotSource<[ToneBufferSourceOptions](../interfaces/ToneBufferSourceOptions.md)>
  - ToneBufferSource

- Defined in [Tone/source/buffer/ToneBufferSource.ts:35](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/ToneBufferSource.ts#L35)

## Constructors

### constructor

- new ToneBufferSource(url?, onload?): [ToneBufferSource](ToneBufferSource.md)

- #### Parameters

  - `Optional` url: string \| AudioBuffer \| [ToneAudioBuffer](ToneAudioBuffer.md)
    The buffer to play or url to load
  - `Optional` onload: (() => void)
    The callback to invoke when the buffer is done playing.

    - - (): void

      - #### Returns void

  #### Returns [ToneBufferSource](ToneBufferSource.md)

  Overrides OneShotSource<ToneBufferSourceOptions>.constructor

  - Defined in [Tone/source/buffer/ToneBufferSource.ts:64](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/ToneBufferSource.ts#L64)

- new ToneBufferSource(options?): [ToneBufferSource](ToneBufferSource.md)

- #### Parameters

  - `Optional` options: Partial<[ToneBufferSourceOptions](../interfaces/ToneBufferSourceOptions.md)>

  #### Returns [ToneBufferSource](ToneBufferSource.md)

  Overrides OneShotSource<ToneBufferSourceOptions>.constructor

  - Defined in [Tone/source/buffer/ToneBufferSource.ts:68](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/ToneBufferSource.ts#L68)

## Properties

### `Readonly` context

context: [BaseContext](BaseContext.md)

The context belonging to the node.

Inherited from OneShotSource.context

- Defined in [Tone/core/context/ToneWithContext.ts:40](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L40)

### debug

debug: boolean = false

Set this debug flag to log all events that happen in this class.

Inherited from OneShotSource.debug

- Defined in [Tone/core/Tone.ts:49](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L49)

### getStateAtTime

getStateAtTime: ((time) => [BasicPlaybackState](../types/BasicPlaybackState.md)) = ...

Get the playback state at the given time

#### Type declaration

- - (time): [BasicPlaybackState](../types/BasicPlaybackState.md)

  - #### Parameters

    - time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

    #### Returns [BasicPlaybackState](../types/BasicPlaybackState.md)

Inherited from OneShotSource.getStateAtTime

- Defined in [Tone/source/OneShotSource.ts:220](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/OneShotSource.ts#L220)

### input

input: undefined

Sources do not have input nodes

Inherited from OneShotSource.input

- Defined in [Tone/source/OneShotSource.ts:37](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/OneShotSource.ts#L37)

### `Readonly` name

name: string = "ToneBufferSource"

Overrides OneShotSource.name

- Defined in [Tone/source/buffer/ToneBufferSource.ts:36](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/ToneBufferSource.ts#L36)

### onended

onended: onEndedCallback = noOp

The callback to invoke after the source is done playing.

Inherited from OneShotSource.onended

- Defined in [Tone/source/OneShotSource.ts:32](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/OneShotSource.ts#L32)

### output

output: [Gain](Gain.md)<"gain"> = ...

The public output node

Inherited from OneShotSource.output

- Defined in [Tone/source/OneShotSource.ts:57](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/OneShotSource.ts#L57)

### `Readonly` playbackRate

playbackRate: [Param](Param.md)<"positive">

The frequency of the oscillator

- Defined in [Tone/source/buffer/ToneBufferSource.ts:47](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/ToneBufferSource.ts#L47)

### `Static` version

version: string = version

The version number semver

Inherited from OneShotSource.version

- Defined in [Tone/core/Tone.ts:28](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L28)

## Accessors

### blockTime

- get blockTime(): number

- The number of seconds of 1 processing block (128 samples)

  #### Returns number

  #### Example

  ``` ts
  console.log(Tone.Destination.blockTime);
  ```

  Inherited from OneShotSource.blockTime

  - Defined in [Tone/core/context/ToneWithContext.ts:108](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L108)

### buffer

- get buffer(): [ToneAudioBuffer](ToneAudioBuffer.md)

- The audio buffer belonging to the player.

  #### Returns [ToneAudioBuffer](ToneAudioBuffer.md)

  - Defined in [Tone/source/buffer/ToneBufferSource.ts:243](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/ToneBufferSource.ts#L243)

- set buffer(buffer): void

- #### Parameters

  - buffer: [ToneAudioBuffer](ToneAudioBuffer.md)

  #### Returns void

  - Defined in [Tone/source/buffer/ToneBufferSource.ts:246](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/ToneBufferSource.ts#L246)

### channelCount

- get channelCount(): number

- channelCount is the number of channels used when up-mixing and down-mixing connections to any inputs to the node. The default value is 2 except for specific nodes where its value is specially determined.

  #### Returns number

  Inherited from OneShotSource.channelCount

  - Defined in [Tone/core/context/ToneAudioNode.ts:153](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L153)

- set channelCount(channelCount): void

- #### Parameters

  - channelCount: number

  #### Returns void

  Inherited from OneShotSource.channelCount

  - Defined in [Tone/core/context/ToneAudioNode.ts:156](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L156)

### channelCountMode

- get channelCountMode(): ChannelCountMode

- channelCountMode determines how channels will be counted when up-mixing and down-mixing connections to any inputs to the node. The default value is "max". This attribute has no effect for nodes with no inputs.

  - "max" - computedNumberOfChannels is the maximum of the number of channels of all connections to an input. In this mode channelCount is ignored.
  - "clamped-max" - computedNumberOfChannels is determined as for "max" and then clamped to a maximum value of the given channelCount.
  - "explicit" - computedNumberOfChannels is the exact value as specified by the channelCount.

  #### Returns ChannelCountMode

  Inherited from OneShotSource.channelCountMode

  - Defined in [Tone/core/context/ToneAudioNode.ts:170](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L170)

- set channelCountMode(channelCountMode): void

- #### Parameters

  - channelCountMode: ChannelCountMode

  #### Returns void

  Inherited from OneShotSource.channelCountMode

  - Defined in [Tone/core/context/ToneAudioNode.ts:173](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L173)

### channelInterpretation

- get channelInterpretation(): ChannelInterpretation

- channelInterpretation determines how individual channels will be treated when up-mixing and down-mixing connections to any inputs to the node. The default value is "speakers".

  #### Returns ChannelInterpretation

  Inherited from OneShotSource.channelInterpretation

  - Defined in [Tone/core/context/ToneAudioNode.ts:184](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L184)

- set channelInterpretation(channelInterpretation): void

- #### Parameters

  - channelInterpretation: ChannelInterpretation

  #### Returns void

  Inherited from OneShotSource.channelInterpretation

  - Defined in [Tone/core/context/ToneAudioNode.ts:187](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L187)

### curve

- get curve(): OneShotSourceCurve

- The curve applied to the fades, either "linear" or "exponential"

  #### Returns OneShotSourceCurve

  - Defined in [Tone/source/buffer/ToneBufferSource.ts:138](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/ToneBufferSource.ts#L138)

- set curve(t): void

- #### Parameters

  - t: OneShotSourceCurve

  #### Returns void

  - Defined in [Tone/source/buffer/ToneBufferSource.ts:141](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/ToneBufferSource.ts#L141)

### disposed

- get disposed(): boolean

- Indicates if the instance was disposed. 'Disposing' an instance means that all of the Web Audio nodes that were created for the instance are disconnected and freed for garbage collection.

  #### Returns boolean

  Inherited from OneShotSource.disposed

  - Defined in [Tone/core/Tone.ts:96](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L96)

### fadeIn

- get fadeIn(): [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

- The fadeIn time of the amplitude envelope.

  #### Returns [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  - Defined in [Tone/source/buffer/ToneBufferSource.ts:118](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/ToneBufferSource.ts#L118)

- set fadeIn(t): void

- #### Parameters

  - t: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Returns void

  - Defined in [Tone/source/buffer/ToneBufferSource.ts:121](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/ToneBufferSource.ts#L121)

### fadeOut

- get fadeOut(): [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

- The fadeOut time of the amplitude envelope.

  #### Returns [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  - Defined in [Tone/source/buffer/ToneBufferSource.ts:128](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/ToneBufferSource.ts#L128)

- set fadeOut(t): void

- #### Parameters

  - t: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Returns void

  - Defined in [Tone/source/buffer/ToneBufferSource.ts:131](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/ToneBufferSource.ts#L131)

### loop

- get loop(): boolean

- If the buffer should loop once it's over.

  #### Returns boolean

  - Defined in [Tone/source/buffer/ToneBufferSource.ts:253](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/ToneBufferSource.ts#L253)

- set loop(loop): void

- #### Parameters

  - loop: boolean

  #### Returns void

  - Defined in [Tone/source/buffer/ToneBufferSource.ts:256](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/ToneBufferSource.ts#L256)

### loopEnd

- get loopEnd(): [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

- If loop is true, the loop will end at this position.

  #### Returns [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  - Defined in [Tone/source/buffer/ToneBufferSource.ts:233](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/ToneBufferSource.ts#L233)

- set loopEnd(loopEnd): void

- #### Parameters

  - loopEnd: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Returns void

  - Defined in [Tone/source/buffer/ToneBufferSource.ts:236](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/ToneBufferSource.ts#L236)

### loopStart

- get loopStart(): [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

- If loop is true, the loop will start at this position.

  #### Returns [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  - Defined in [Tone/source/buffer/ToneBufferSource.ts:223](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/ToneBufferSource.ts#L223)

- set loopStart(loopStart): void

- #### Parameters

  - loopStart: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Returns void

  - Defined in [Tone/source/buffer/ToneBufferSource.ts:226](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/ToneBufferSource.ts#L226)

### numberOfInputs

- get numberOfInputs(): number

- The number of inputs feeding into the AudioNode. For source nodes, this will be 0.

  #### Returns number

  #### Example

  ``` ts
  const node = new Tone.Gain();
  console.log(node.numberOfInputs);
  ```

  Inherited from OneShotSource.numberOfInputs

  - Defined in [Tone/core/context/ToneAudioNode.ts:52](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L52)

### numberOfOutputs

- get numberOfOutputs(): number

- The number of outputs of the AudioNode.

  #### Returns number

  #### Example

  ``` ts
  const node = new Tone.Gain();
  console.log(node.numberOfOutputs);
  ```

  Inherited from OneShotSource.numberOfOutputs

  - Defined in [Tone/core/context/ToneAudioNode.ts:70](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L70)

### sampleTime

- get sampleTime(): number

- The duration in seconds of one sample.

  #### Returns number

  Inherited from OneShotSource.sampleTime

  - Defined in [Tone/core/context/ToneWithContext.ts:99](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L99)

### state

- get state(): [BasicPlaybackState](../types/BasicPlaybackState.md)

- Get the playback state at the current time

  #### Returns [BasicPlaybackState](../types/BasicPlaybackState.md)

  Inherited from OneShotSource.state

  - Defined in [Tone/source/OneShotSource.ts:236](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/OneShotSource.ts#L236)

## Methods

### cancelStop

- cancelStop(): this

- Cancel a scheduled stop event

  #### Returns this

  Inherited from OneShotSource.cancelStop

  - Defined in [Tone/source/OneShotSource.ts:243](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/OneShotSource.ts#L243)

### chain

- chain(...nodes): this

- Connect the output of this node to the rest of the nodes in series.

  #### Parameters

  - `Rest` ...nodes: [InputNode](../types/InputNode.md)\[\]

  #### Returns this

  #### Example

  ``` ts
  const player = new Tone.Player("https://tonejs.github.io/audio/drum-samples/handdrum-loop.mp3");
  player.autostart = true;
  const filter = new Tone.AutoFilter(4).start();
  const distortion = new Tone.Distortion(0.5);
  // connect the player to the filter, distortion and then to the master output
  player.chain(filter, distortion, Tone.Destination);
  ```

  Inherited from OneShotSource.chain

  - Defined in [Tone/core/context/ToneAudioNode.ts:249](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L249)

### connect

- connect(destination, outputNum?, inputNum?): this

- connect the output of a ToneAudioNode to an AudioParam, AudioNode, or ToneAudioNode

  #### Parameters

  - destination: [InputNode](../types/InputNode.md)
    The output to connect to
  - outputNum: number = 0
    The output to connect from
  - inputNum: number = 0
    The input to connect to

  #### Returns this

  Inherited from OneShotSource.connect

  - Defined in [Tone/core/context/ToneAudioNode.ts:205](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L205)

### disconnect

- disconnect(destination?, outputNum?, inputNum?): this

- disconnect the output

  #### Parameters

  - `Optional` destination: [InputNode](../types/InputNode.md)
  - outputNum: number = 0
  - inputNum: number = 0

  #### Returns this

  Inherited from OneShotSource.disconnect

  - Defined in [Tone/core/context/ToneAudioNode.ts:234](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L234)

### dispose

- dispose(): this

- Clean up.

  #### Returns this

  Overrides OneShotSource.dispose

  - Defined in [Tone/source/buffer/ToneBufferSource.ts:266](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/ToneBufferSource.ts#L266)

### fan

- fan(...nodes): this

- connect the output of this node to the rest of the nodes in parallel.

  #### Parameters

  - `Rest` ...nodes: [InputNode](../types/InputNode.md)\[\]

  #### Returns this

  #### Example

  ``` ts
  const player = new Tone.Player("https://tonejs.github.io/audio/drum-samples/conga-rhythm.mp3");
  player.autostart = true;
  const pitchShift = new Tone.PitchShift(4).toDestination();
  const filter = new Tone.Filter("G5").toDestination();
  // connect a node to the pitch shift and filter in parallel
  player.fan(pitchShift, filter);
  ```

  Inherited from OneShotSource.fan

  - Defined in [Tone/core/context/ToneAudioNode.ts:264](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L264)

### get

- get(): [ToneBufferSourceOptions](../interfaces/ToneBufferSourceOptions.md)

- Get the object's attributes.

  #### Returns [ToneBufferSourceOptions](../interfaces/ToneBufferSourceOptions.md)

  #### Example

  ``` ts
  const osc = new Tone.Oscillator();
  console.log(osc.get());
  ```

  Inherited from OneShotSource.get

  - Defined in [Tone/core/context/ToneWithContext.ts:170](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L170)

### immediate

- immediate(): number

- Return the current time of the Context clock without any lookAhead.

  #### Returns number

  #### Example

  ``` ts
  setInterval(() => {
      console.log(Tone.immediate());
  }, 100);
  ```

  Inherited from OneShotSource.immediate

  - Defined in [Tone/core/context/ToneWithContext.ts:92](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L92)

### now

- now(): number

- Return the current time of the Context clock plus the lookAhead.

  #### Returns number

  #### Example

  ``` ts
  setInterval(() => {
      console.log(Tone.now());
  }, 100);
  ```

  Inherited from OneShotSource.now

  - Defined in [Tone/core/context/ToneWithContext.ts:81](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L81)

### set

- set(props): this

- Set multiple properties at once with an object.

  #### Parameters

  - props: RecursivePartial<[ToneBufferSourceOptions](../interfaces/ToneBufferSourceOptions.md)>

  #### Returns this

  #### Example

  ``` ts
  const filter = new Tone.Filter().toDestination();
  // set values using an object
  filter.set({
      frequency: "C6",
      type: "highpass"
  });
  const player = new Tone.Player("https://tonejs.github.io/audio/berklee/Analogsynth_octaves_highmid.mp3").connect(filter);
  player.autostart = true;
  ```

  Inherited from OneShotSource.set

  - Defined in [Tone/core/context/ToneWithContext.ts:215](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L215)

### start

- start(time?, offset?, duration?, gain?): this

- Start the buffer

  #### Parameters

  - `Optional` time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
    When the player should start.
  - `Optional` offset: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
    The offset from the beginning of the sample to start at.
  - `Optional` duration: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
    How long the sample should play. If no duration is given, it will default to the full length of the sample (minus any offset)
  - gain: number = 1
    The gain to play the buffer back at.

  #### Returns this

  Overrides OneShotSource.start

  - Defined in [Tone/source/buffer/ToneBufferSource.ts:152](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/ToneBufferSource.ts#L152)

### stop

- stop(time?): this

- Stop the source node at the given time.

  #### Parameters

  - `Optional` time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
    When to stop the source

  #### Returns this

  Inherited from OneShotSource.stop

  - Defined in [Tone/source/OneShotSource.ts:151](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/OneShotSource.ts#L151)

### toDestination

- toDestination(): this

- Connect the output to the context's destination node.

  #### Returns this

  #### Example

  ``` ts
  const osc = new Tone.Oscillator("C2").start();
  osc.toDestination();
  ```

  Inherited from OneShotSource.toDestination

  - Defined in [Tone/core/context/ToneAudioNode.ts:216](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L216)

### toFrequency

- toFrequency(freq): number

- Convert the input to a frequency number

  #### Parameters

  - freq: [Unit](../modules/Unit.md).[Frequency](../types/Unit.Frequency.md)

  #### Returns number

  #### Example

  ``` ts
  const gain = new Tone.Gain();
  console.log(gain.toFrequency("4n"));
  ```

  Inherited from OneShotSource.toFrequency

  - Defined in [Tone/core/context/ToneWithContext.ts:132](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L132)

### toMaster

- toMaster(): this

- Connect the output to the context's destination node.

  #### Returns this

  #### See

  [toDestination](ToneBufferSource.md#toDestination)

  #### Deprecated

  Inherited from OneShotSource.toMaster

  - Defined in [Tone/core/context/ToneAudioNode.ts:226](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L226)

### toSeconds

- toSeconds(time?): number

- Convert the incoming time to seconds. This is calculated against the current TransportClass bpm

  #### Parameters

  - `Optional` time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Returns number

  #### Example

  ``` ts
  const gain = new Tone.Gain();
  setInterval(() => console.log(gain.toSeconds("4n")), 100);
  // ramp the tempo to 60 bpm over 30 seconds
  Tone.getTransport().bpm.rampTo(60, 30);
  ```

  Inherited from OneShotSource.toSeconds

  - Defined in [Tone/core/context/ToneWithContext.ts:121](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L121)

### toString

- toString(): string

- Convert the class to a string

  #### Returns string

  #### Example

  ``` ts
  const osc = new Tone.Oscillator();
  console.log(osc.toString());
  ```

  Inherited from OneShotSource.toString

  - Defined in [Tone/core/Tone.ts:106](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L106)

### toTicks

- toTicks(time?): number

- Convert the input time into ticks

  #### Parameters

  - `Optional` time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md) \| [TimeClass](TimeClass.md)<number, TimeBaseUnit>

  #### Returns number

  #### Example

  ``` ts
  const gain = new Tone.Gain();
  console.log(gain.toTicks("4n"));
  ```

  Inherited from OneShotSource.toTicks

  - Defined in [Tone/core/context/ToneWithContext.ts:142](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L142)

### `Static` getDefaults

- getDefaults(): [ToneBufferSourceOptions](../interfaces/ToneBufferSourceOptions.md)

- #### Returns [ToneBufferSourceOptions](../interfaces/ToneBufferSourceOptions.md)

  Overrides OneShotSource.getDefaults

  - Defined in [Tone/source/buffer/ToneBufferSource.ts:103](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/ToneBufferSource.ts#L103)
