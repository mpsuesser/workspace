# Class LFO

LFO stands for low frequency oscillator. LFO produces an output signal which can be attached to an AudioParam or Tone.Signal in order to modulate that parameter with an oscillator. The LFO can also be synced to the transport to start/stop and change when the tempo changes.

#### Example

``` ts
return Tone.Offline(() => {
    const lfo = new Tone.LFO("4n", 400, 4000).start().toDestination();
}, 0.5, 1);
```

#### Hierarchy ([view full](../hierarchy.md#LFO))

- [ToneAudioNode](ToneAudioNode.md)<[LFOOptions](../types/LFOOptions.md)>
  - LFO

- Defined in [Tone/source/oscillator/LFO.ts:46](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/LFO.ts#L46)

## Constructors

### constructor

- new LFO(frequency?, min?, max?): [LFO](LFO.md)

- #### Parameters

  - `Optional` frequency: [Unit](../modules/Unit.md).[Frequency](../types/Unit.Frequency.md)
    The frequency of the oscillation. Typically, LFOs will be in the frequency range of 0.1 to 10 hertz.
  - `Optional` min: number
    The minimum output value of the LFO.
  - `Optional` max: number
    The maximum value of the LFO.

  #### Returns [LFO](LFO.md)

  Overrides [ToneAudioNode](ToneAudioNode.md).[constructor](ToneAudioNode.md#constructor)

  - Defined in [Tone/source/oscillator/LFO.ts:124](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/LFO.ts#L124)

- new LFO(options?): [LFO](LFO.md)

- #### Parameters

  - `Optional` options: Partial<[LFOOptions](../types/LFOOptions.md)>

  #### Returns [LFO](LFO.md)

  Overrides [ToneAudioNode](ToneAudioNode.md).[constructor](ToneAudioNode.md#constructor)

  - Defined in [Tone/source/oscillator/LFO.ts:125](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/LFO.ts#L125)

## Properties

### `Readonly` amplitude

amplitude: [Param](Param.md)<"normalRange">

The amplitude of the LFO, which controls the output range between the min and max output. For example if the min is -10 and the max is 10, setting the amplitude to 0.5 would make the LFO modulate between -5 and 5.

- Defined in [Tone/source/oscillator/LFO.ts:65](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/LFO.ts#L65)

### `Readonly` context

context: [BaseContext](BaseContext.md)

The context belonging to the node.

Inherited from [ToneAudioNode](ToneAudioNode.md).[context](ToneAudioNode.md#context)

- Defined in [Tone/core/context/ToneWithContext.ts:40](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L40)

### convert

convert: boolean = true

If the input value is converted using the [units](LFO.md#units)

- Defined in [Tone/source/oscillator/LFO.ts:111](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/LFO.ts#L111)

### debug

debug: boolean = false

Set this debug flag to log all events that happen in this class.

Inherited from [ToneAudioNode](ToneAudioNode.md).[debug](ToneAudioNode.md#debug)

- Defined in [Tone/core/Tone.ts:49](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L49)

### `Readonly` frequency

frequency: [Signal](Signal.md)<"frequency">

The frequency value of the LFO

- Defined in [Tone/source/oscillator/LFO.ts:116](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/LFO.ts#L116)

### `Readonly` input

input: undefined

There is no input node

Overrides [ToneAudioNode](ToneAudioNode.md).[input](ToneAudioNode.md#input)

- Defined in [Tone/source/oscillator/LFO.ts:101](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/LFO.ts#L101)

### `Readonly` name

name: string = "LFO"

The name of the class

Overrides [ToneAudioNode](ToneAudioNode.md).[name](ToneAudioNode.md#name)

- Defined in [Tone/source/oscillator/LFO.ts:47](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/LFO.ts#L47)

### `Readonly` output

output: [OutputNode](../types/OutputNode.md)

The output of the LFO

Overrides [ToneAudioNode](ToneAudioNode.md).[output](ToneAudioNode.md#output)

- Defined in [Tone/source/oscillator/LFO.ts:96](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/LFO.ts#L96)

### `Static` version

version: string = version

The version number semver

Inherited from [ToneAudioNode](ToneAudioNode.md).[version](ToneAudioNode.md#version)

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

  Inherited from ToneAudioNode.blockTime

  - Defined in [Tone/core/context/ToneWithContext.ts:108](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L108)

### channelCount

- get channelCount(): number

- channelCount is the number of channels used when up-mixing and down-mixing connections to any inputs to the node. The default value is 2 except for specific nodes where its value is specially determined.

  #### Returns number

  Inherited from ToneAudioNode.channelCount

  - Defined in [Tone/core/context/ToneAudioNode.ts:153](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L153)

- set channelCount(channelCount): void

- #### Parameters

  - channelCount: number

  #### Returns void

  Inherited from ToneAudioNode.channelCount

  - Defined in [Tone/core/context/ToneAudioNode.ts:156](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L156)

### channelCountMode

- get channelCountMode(): ChannelCountMode

- channelCountMode determines how channels will be counted when up-mixing and down-mixing connections to any inputs to the node. The default value is "max". This attribute has no effect for nodes with no inputs.

  - "max" - computedNumberOfChannels is the maximum of the number of channels of all connections to an input. In this mode channelCount is ignored.
  - "clamped-max" - computedNumberOfChannels is determined as for "max" and then clamped to a maximum value of the given channelCount.
  - "explicit" - computedNumberOfChannels is the exact value as specified by the channelCount.

  #### Returns ChannelCountMode

  Inherited from ToneAudioNode.channelCountMode

  - Defined in [Tone/core/context/ToneAudioNode.ts:170](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L170)

- set channelCountMode(channelCountMode): void

- #### Parameters

  - channelCountMode: ChannelCountMode

  #### Returns void

  Inherited from ToneAudioNode.channelCountMode

  - Defined in [Tone/core/context/ToneAudioNode.ts:173](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L173)

### channelInterpretation

- get channelInterpretation(): ChannelInterpretation

- channelInterpretation determines how individual channels will be treated when up-mixing and down-mixing connections to any inputs to the node. The default value is "speakers".

  #### Returns ChannelInterpretation

  Inherited from ToneAudioNode.channelInterpretation

  - Defined in [Tone/core/context/ToneAudioNode.ts:184](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L184)

- set channelInterpretation(channelInterpretation): void

- #### Parameters

  - channelInterpretation: ChannelInterpretation

  #### Returns void

  Inherited from ToneAudioNode.channelInterpretation

  - Defined in [Tone/core/context/ToneAudioNode.ts:187](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L187)

### disposed

- get disposed(): boolean

- Indicates if the instance was disposed. 'Disposing' an instance means that all of the Web Audio nodes that were created for the instance are disconnected and freed for garbage collection.

  #### Returns boolean

  Inherited from ToneAudioNode.disposed

  - Defined in [Tone/core/Tone.ts:96](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L96)

### max

- get max(): number

- The maximum output of the LFO.

  #### Returns number

  - Defined in [Tone/source/oscillator/LFO.ts:249](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/LFO.ts#L249)

- set max(max): void

- #### Parameters

  - max: number

  #### Returns void

  - Defined in [Tone/source/oscillator/LFO.ts:252](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/LFO.ts#L252)

### min

- get min(): number

- The minimum output of the LFO.

  #### Returns number

  - Defined in [Tone/source/oscillator/LFO.ts:238](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/LFO.ts#L238)

- set min(min): void

- #### Parameters

  - min: number

  #### Returns void

  - Defined in [Tone/source/oscillator/LFO.ts:241](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/LFO.ts#L241)

### numberOfInputs

- get numberOfInputs(): number

- The number of inputs feeding into the AudioNode. For source nodes, this will be 0.

  #### Returns number

  #### Example

  ``` ts
  const node = new Tone.Gain();
  console.log(node.numberOfInputs);
  ```

  Inherited from ToneAudioNode.numberOfInputs

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

  Inherited from ToneAudioNode.numberOfOutputs

  - Defined in [Tone/core/context/ToneAudioNode.ts:70](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L70)

### partials

- get partials(): number\[\]

- The oscillator's partials array.

  #### Returns number\[\]

  #### See

  [Oscillator.partials](Oscillator.md#partials)

  - Defined in [Tone/source/oscillator/LFO.ts:273](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/LFO.ts#L273)

- set partials(partials): void

- #### Parameters

  - partials: number\[\]

  #### Returns void

  - Defined in [Tone/source/oscillator/LFO.ts:276](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/LFO.ts#L276)

### phase

- get phase(): number

- The phase of the LFO.

  #### Returns number

  - Defined in [Tone/source/oscillator/LFO.ts:284](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/LFO.ts#L284)

- set phase(phase): void

- #### Parameters

  - phase: number

  #### Returns void

  - Defined in [Tone/source/oscillator/LFO.ts:287](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/LFO.ts#L287)

### sampleTime

- get sampleTime(): number

- The duration in seconds of one sample.

  #### Returns number

  Inherited from ToneAudioNode.sampleTime

  - Defined in [Tone/core/context/ToneWithContext.ts:99](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L99)

### state

- get state(): [BasicPlaybackState](../types/BasicPlaybackState.md)

- Returns the playback state of the source, either "started" or "stopped".

  #### Returns [BasicPlaybackState](../types/BasicPlaybackState.md)

  - Defined in [Tone/source/oscillator/LFO.ts:310](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/LFO.ts#L310)

### type

- get type(): [ToneOscillatorType](../types/ToneOscillatorType.md)

- The type of the oscillator.

  #### Returns [ToneOscillatorType](../types/ToneOscillatorType.md)

  #### See

  [Oscillator.type](Oscillator.md#type)

  - Defined in [Tone/source/oscillator/LFO.ts:261](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/LFO.ts#L261)

- set type(type): void

- #### Parameters

  - type: [ToneOscillatorType](../types/ToneOscillatorType.md)

  #### Returns void

  - Defined in [Tone/source/oscillator/LFO.ts:264](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/LFO.ts#L264)

### units

- get units(): keyof [UnitMap](../interfaces/Unit.UnitMap.md)

- The output units of the LFO.

  #### Returns keyof [UnitMap](../interfaces/Unit.UnitMap.md)

  - Defined in [Tone/source/oscillator/LFO.ts:295](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/LFO.ts#L295)

- set units(val): void

- #### Parameters

  - val: keyof [UnitMap](../interfaces/Unit.UnitMap.md)

  #### Returns void

  - Defined in [Tone/source/oscillator/LFO.ts:298](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/LFO.ts#L298)

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

  Inherited from [ToneAudioNode](ToneAudioNode.md).[chain](ToneAudioNode.md#chain)

  - Defined in [Tone/core/context/ToneAudioNode.ts:249](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L249)

### connect

- connect(node, outputNum?, inputNum?): this

- #### Parameters

  - node: [InputNode](../types/InputNode.md)
    the destination to connect to
  - `Optional` outputNum: number
    the optional output number
  - `Optional` inputNum: number
    the input number

  #### Returns this

  Overrides [ToneAudioNode](ToneAudioNode.md).[connect](ToneAudioNode.md#connect)

  - Defined in [Tone/source/oscillator/LFO.ts:319](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/LFO.ts#L319)

### disconnect

- disconnect(destination?, outputNum?, inputNum?): this

- disconnect the output

  #### Parameters

  - `Optional` destination: [InputNode](../types/InputNode.md)
  - outputNum: number = 0
  - inputNum: number = 0

  #### Returns this

  Inherited from [ToneAudioNode](ToneAudioNode.md).[disconnect](ToneAudioNode.md#disconnect)

  - Defined in [Tone/core/context/ToneAudioNode.ts:234](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L234)

### dispose

- dispose(): this

- Dispose and disconnect

  #### Returns this

  Overrides [ToneAudioNode](ToneAudioNode.md).[dispose](ToneAudioNode.md#dispose)

  - Defined in [Tone/source/oscillator/LFO.ts:340](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/LFO.ts#L340)

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

  Inherited from [ToneAudioNode](ToneAudioNode.md).[fan](ToneAudioNode.md#fan)

  - Defined in [Tone/core/context/ToneAudioNode.ts:264](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L264)

### get

- get(): [LFOOptions](../types/LFOOptions.md)

- Get the object's attributes.

  #### Returns [LFOOptions](../types/LFOOptions.md)

  #### Example

  ``` ts
  const osc = new Tone.Oscillator();
  console.log(osc.get());
  ```

  Inherited from [ToneAudioNode](ToneAudioNode.md).[get](ToneAudioNode.md#get)

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

  Inherited from [ToneAudioNode](ToneAudioNode.md).[immediate](ToneAudioNode.md#immediate)

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

  Inherited from [ToneAudioNode](ToneAudioNode.md).[now](ToneAudioNode.md#now)

  - Defined in [Tone/core/context/ToneWithContext.ts:81](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L81)

### set

- set(props): this

- Set multiple properties at once with an object.

  #### Parameters

  - props: RecursivePartial<[LFOOptions](../types/LFOOptions.md)>

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

  Inherited from [ToneAudioNode](ToneAudioNode.md).[set](ToneAudioNode.md#set)

  - Defined in [Tone/core/context/ToneWithContext.ts:215](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L215)

### start

- start(time?): this

- Start the LFO.

  #### Parameters

  - `Optional` time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
    The time the LFO will start

  #### Returns this

  - Defined in [Tone/source/oscillator/LFO.ts:186](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/LFO.ts#L186)

### stop

- stop(time?): this

- Stop the LFO.

  #### Parameters

  - `Optional` time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
    The time the LFO will stop

  #### Returns this

  - Defined in [Tone/source/oscillator/LFO.ts:197](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/LFO.ts#L197)

### sync

- sync(): this

- Sync the start/stop/pause to the transport and the frequency to the bpm of the transport

  #### Returns this

  #### Example

  ``` ts
  const lfo = new Tone.LFO("8n");
  lfo.sync().start(0);
  // the rate of the LFO will always be an eighth note, even as the tempo changes
  ```

  - Defined in [Tone/source/oscillator/LFO.ts:212](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/LFO.ts#L212)

### toDestination

- toDestination(): this

- Connect the output to the context's destination node.

  #### Returns this

  #### Example

  ``` ts
  const osc = new Tone.Oscillator("C2").start();
  osc.toDestination();
  ```

  Inherited from [ToneAudioNode](ToneAudioNode.md).[toDestination](ToneAudioNode.md#toDestination)

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

  Inherited from [ToneAudioNode](ToneAudioNode.md).[toFrequency](ToneAudioNode.md#toFrequency)

  - Defined in [Tone/core/context/ToneWithContext.ts:132](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L132)

### toMaster

- toMaster(): this

- Connect the output to the context's destination node.

  #### Returns this

  #### See

  [toDestination](LFO.md#toDestination)

  #### Deprecated

  Inherited from [ToneAudioNode](ToneAudioNode.md).[toMaster](ToneAudioNode.md#toMaster)

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

  Inherited from [ToneAudioNode](ToneAudioNode.md).[toSeconds](ToneAudioNode.md#toSeconds)

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

  Inherited from [ToneAudioNode](ToneAudioNode.md).[toString](ToneAudioNode.md#toString)

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

  Inherited from [ToneAudioNode](ToneAudioNode.md).[toTicks](ToneAudioNode.md#toTicks)

  - Defined in [Tone/core/context/ToneWithContext.ts:142](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L142)

### unsync

- unsync(): this

- unsync the LFO from transport control

  #### Returns this

  - Defined in [Tone/source/oscillator/LFO.ts:221](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/LFO.ts#L221)

### `Static` getDefaults

- getDefaults(): [LFOOptions](../types/LFOOptions.md)

- #### Returns [LFOOptions](../types/LFOOptions.md)

  Overrides [ToneAudioNode](ToneAudioNode.md).[getDefaults](ToneAudioNode.md#getDefaults)

  - Defined in [Tone/source/oscillator/LFO.ts:171](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/LFO.ts#L171)
