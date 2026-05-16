# Class PitchShift

PitchShift does near-realtime pitch shifting to the incoming signal. The effect is achieved by speeding up or slowing down the delayTime of a DelayNode using a sawtooth wave. Algorithm found in [this pdf](http://dsp-book.narod.ru/soundproc.pdf). Additional reference by [Miller Pucket](http://msp.ucsd.edu/techniques/v0.11/book-html/node115.html).

#### Hierarchy

- FeedbackEffect<[PitchShiftOptions](../interfaces/PitchShiftOptions.md)>
  - PitchShift

- Defined in [Tone/effect/PitchShift.ts:26](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/effect/PitchShift.ts#L26)

## Constructors

### constructor

- new PitchShift(pitch?): [PitchShift](PitchShift.md)

- #### Parameters

  - `Optional` pitch: number
    The interval to transpose the incoming signal by.

  #### Returns [PitchShift](PitchShift.md)

  Overrides FeedbackEffect<PitchShiftOptions>.constructor

  - Defined in [Tone/effect/PitchShift.ts:88](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/effect/PitchShift.ts#L88)

- new PitchShift(options?): [PitchShift](PitchShift.md)

- #### Parameters

  - `Optional` options: Partial<[PitchShiftOptions](../interfaces/PitchShiftOptions.md)>

  #### Returns [PitchShift](PitchShift.md)

  Overrides FeedbackEffect<PitchShiftOptions>.constructor

  - Defined in [Tone/effect/PitchShift.ts:89](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/effect/PitchShift.ts#L89)

## Properties

### `Readonly` context

context: [BaseContext](BaseContext.md)

The context belonging to the node.

Inherited from FeedbackEffect.context

- Defined in [Tone/core/context/ToneWithContext.ts:40](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L40)

### debug

debug: boolean = false

Set this debug flag to log all events that happen in this class.

Inherited from FeedbackEffect.debug

- Defined in [Tone/core/Tone.ts:49](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L49)

### `Readonly` delayTime

delayTime: [Param](Param.md)<"time">

The amount of delay on the input signal

- Defined in [Tone/effect/PitchShift.ts:73](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/effect/PitchShift.ts#L73)

### feedback

feedback: [Param](Param.md)<"normalRange">

The amount of signal which is fed back into the effect input.

Inherited from FeedbackEffect.feedback

- Defined in [Tone/effect/FeedbackEffect.ts:40](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/effect/FeedbackEffect.ts#L40)

### input

input: [Gain](Gain.md)<"gain"> = ...

The effect input node

Inherited from FeedbackEffect.input

- Defined in [Tone/effect/Effect.ts:49](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/effect/Effect.ts#L49)

### `Readonly` name

name: string = "PitchShift"

Overrides FeedbackEffect.name

- Defined in [Tone/effect/PitchShift.ts:27](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/effect/PitchShift.ts#L27)

### output

output: [CrossFade](CrossFade.md) = ...

The effect output

Inherited from FeedbackEffect.output

- Defined in [Tone/effect/Effect.ts:54](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/effect/Effect.ts#L54)

### wet

wet: [Signal](Signal.md)<"normalRange"> = ...

The wet control is how much of the effected will pass through to the output. 1 = 100% effected signal, 0 = 100% dry signal.

Inherited from FeedbackEffect.wet

- Defined in [Tone/effect/Effect.ts:34](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/effect/Effect.ts#L34)

### `Static` version

version: string = version

The version number semver

Inherited from FeedbackEffect.version

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

  Inherited from FeedbackEffect.blockTime

  - Defined in [Tone/core/context/ToneWithContext.ts:108](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L108)

### channelCount

- get channelCount(): number

- channelCount is the number of channels used when up-mixing and down-mixing connections to any inputs to the node. The default value is 2 except for specific nodes where its value is specially determined.

  #### Returns number

  Inherited from FeedbackEffect.channelCount

  - Defined in [Tone/core/context/ToneAudioNode.ts:153](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L153)

- set channelCount(channelCount): void

- #### Parameters

  - channelCount: number

  #### Returns void

  Inherited from FeedbackEffect.channelCount

  - Defined in [Tone/core/context/ToneAudioNode.ts:156](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L156)

### channelCountMode

- get channelCountMode(): ChannelCountMode

- channelCountMode determines how channels will be counted when up-mixing and down-mixing connections to any inputs to the node. The default value is "max". This attribute has no effect for nodes with no inputs.

  - "max" - computedNumberOfChannels is the maximum of the number of channels of all connections to an input. In this mode channelCount is ignored.
  - "clamped-max" - computedNumberOfChannels is determined as for "max" and then clamped to a maximum value of the given channelCount.
  - "explicit" - computedNumberOfChannels is the exact value as specified by the channelCount.

  #### Returns ChannelCountMode

  Inherited from FeedbackEffect.channelCountMode

  - Defined in [Tone/core/context/ToneAudioNode.ts:170](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L170)

- set channelCountMode(channelCountMode): void

- #### Parameters

  - channelCountMode: ChannelCountMode

  #### Returns void

  Inherited from FeedbackEffect.channelCountMode

  - Defined in [Tone/core/context/ToneAudioNode.ts:173](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L173)

### channelInterpretation

- get channelInterpretation(): ChannelInterpretation

- channelInterpretation determines how individual channels will be treated when up-mixing and down-mixing connections to any inputs to the node. The default value is "speakers".

  #### Returns ChannelInterpretation

  Inherited from FeedbackEffect.channelInterpretation

  - Defined in [Tone/core/context/ToneAudioNode.ts:184](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L184)

- set channelInterpretation(channelInterpretation): void

- #### Parameters

  - channelInterpretation: ChannelInterpretation

  #### Returns void

  Inherited from FeedbackEffect.channelInterpretation

  - Defined in [Tone/core/context/ToneAudioNode.ts:187](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L187)

### disposed

- get disposed(): boolean

- Indicates if the instance was disposed. 'Disposing' an instance means that all of the Web Audio nodes that were created for the instance are disconnected and freed for garbage collection.

  #### Returns boolean

  Inherited from FeedbackEffect.disposed

  - Defined in [Tone/core/Tone.ts:96](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L96)

### numberOfInputs

- get numberOfInputs(): number

- The number of inputs feeding into the AudioNode. For source nodes, this will be 0.

  #### Returns number

  #### Example

  ``` ts
  const node = new Tone.Gain();
  console.log(node.numberOfInputs);
  ```

  Inherited from FeedbackEffect.numberOfInputs

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

  Inherited from FeedbackEffect.numberOfOutputs

  - Defined in [Tone/core/context/ToneAudioNode.ts:70](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L70)

### pitch

- get pitch(): number

- Repitch the incoming signal by some interval (measured in semi-tones).

  #### Returns number

  #### Example

  ``` ts
  const pitchShift = new Tone.PitchShift().toDestination();
  const osc = new Tone.Oscillator().connect(pitchShift).start().toDestination();
  pitchShift.pitch = -12; // down one octave
  pitchShift.pitch = 7; // up a fifth
  ```

  - Defined in [Tone/effect/PitchShift.ts:176](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/effect/PitchShift.ts#L176)

- set pitch(interval): void

- #### Parameters

  - interval: number

  #### Returns void

  - Defined in [Tone/effect/PitchShift.ts:179](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/effect/PitchShift.ts#L179)

### sampleTime

- get sampleTime(): number

- The duration in seconds of one sample.

  #### Returns number

  Inherited from FeedbackEffect.sampleTime

  - Defined in [Tone/core/context/ToneWithContext.ts:99](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L99)

### windowSize

- get windowSize(): number

- The window size corresponds roughly to the sample length in a looping sampler. Smaller values are desirable for a less noticeable delay time of the pitch shifted signal, but larger values will result in smoother pitch shifting for larger intervals. A nominal range of 0.03 to 0.1 is recommended.

  #### Returns number

  - Defined in [Tone/effect/PitchShift.ts:204](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/effect/PitchShift.ts#L204)

- set windowSize(size): void

- #### Parameters

  - size: number

  #### Returns void

  - Defined in [Tone/effect/PitchShift.ts:207](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/effect/PitchShift.ts#L207)

## Methods

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

  Inherited from FeedbackEffect.chain

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

  Inherited from FeedbackEffect.connect

  - Defined in [Tone/core/context/ToneAudioNode.ts:205](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L205)

### disconnect

- disconnect(destination?, outputNum?, inputNum?): this

- disconnect the output

  #### Parameters

  - `Optional` destination: [InputNode](../types/InputNode.md)
  - outputNum: number = 0
  - inputNum: number = 0

  #### Returns this

  Inherited from FeedbackEffect.disconnect

  - Defined in [Tone/core/context/ToneAudioNode.ts:234](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L234)

### dispose

- dispose(): this

- #### Returns this

  Overrides FeedbackEffect.dispose

  - Defined in [Tone/effect/PitchShift.ts:212](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/effect/PitchShift.ts#L212)

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

  Inherited from FeedbackEffect.fan

  - Defined in [Tone/core/context/ToneAudioNode.ts:264](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L264)

### get

- get(): [PitchShiftOptions](../interfaces/PitchShiftOptions.md)

- Get the object's attributes.

  #### Returns [PitchShiftOptions](../interfaces/PitchShiftOptions.md)

  #### Example

  ``` ts
  const osc = new Tone.Oscillator();
  console.log(osc.get());
  ```

  Inherited from FeedbackEffect.get

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

  Inherited from FeedbackEffect.immediate

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

  Inherited from FeedbackEffect.now

  - Defined in [Tone/core/context/ToneWithContext.ts:81](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L81)

### set

- set(props): this

- Set multiple properties at once with an object.

  #### Parameters

  - props: RecursivePartial<[PitchShiftOptions](../interfaces/PitchShiftOptions.md)>

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

  Inherited from FeedbackEffect.set

  - Defined in [Tone/core/context/ToneWithContext.ts:215](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L215)

### toDestination

- toDestination(): this

- Connect the output to the context's destination node.

  #### Returns this

  #### Example

  ``` ts
  const osc = new Tone.Oscillator("C2").start();
  osc.toDestination();
  ```

  Inherited from FeedbackEffect.toDestination

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

  Inherited from FeedbackEffect.toFrequency

  - Defined in [Tone/core/context/ToneWithContext.ts:132](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L132)

### toMaster

- toMaster(): this

- Connect the output to the context's destination node.

  #### Returns this

  #### See

  [toDestination](PitchShift.md#toDestination)

  #### Deprecated

  Inherited from FeedbackEffect.toMaster

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

  Inherited from FeedbackEffect.toSeconds

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

  Inherited from FeedbackEffect.toString

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

  Inherited from FeedbackEffect.toTicks

  - Defined in [Tone/core/context/ToneWithContext.ts:142](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L142)

### `Static` getDefaults

- getDefaults(): [PitchShiftOptions](../interfaces/PitchShiftOptions.md)

- #### Returns [PitchShiftOptions](../interfaces/PitchShiftOptions.md)

  Overrides FeedbackEffect.getDefaults

  - Defined in [Tone/effect/PitchShift.ts:159](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/effect/PitchShift.ts#L159)
