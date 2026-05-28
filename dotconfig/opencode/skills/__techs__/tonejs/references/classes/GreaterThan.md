# Class GreaterThan

Output 1 if the signal is greater than the value, otherwise outputs 0. can compare two signals or a signal and a number.

#### Example

``` ts
return Tone.Offline(() => {
    const gt = new Tone.GreaterThan(2).toDestination();
    const sig = new Tone.Signal(4).connect(gt);
}, 0.1, 1);
```

#### Hierarchy ([view full](../hierarchy.md#GreaterThan))

- [Signal](Signal.md)<"number">
  - GreaterThan

- Defined in [Tone/signal/GreaterThan.ts:22](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/GreaterThan.ts#L22)

## Constructors

### constructor

- new GreaterThan(value?): [GreaterThan](GreaterThan.md)

- #### Parameters

  - `Optional` value: number
    The value to compare to

  #### Returns [GreaterThan](GreaterThan.md)

  Overrides [Signal](Signal.md).[constructor](Signal.md#constructor)

  - Defined in [Tone/signal/GreaterThan.ts:55](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/GreaterThan.ts#L55)

- new GreaterThan(options?): [GreaterThan](GreaterThan.md)

- #### Parameters

  - `Optional` options: Partial<[GreaterThanOptions](../types/GreaterThanOptions.md)>

  #### Returns [GreaterThan](GreaterThan.md)

  Overrides [Signal](Signal.md).[constructor](Signal.md#constructor)

  - Defined in [Tone/signal/GreaterThan.ts:56](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/GreaterThan.ts#L56)

## Properties

### `Readonly` comparator

comparator: [Param](Param.md)<"number">

The signal to compare to the incoming signal against.

#### Example

``` ts
return Tone.Offline(() => {
    // change the comparison value
    const gt = new Tone.GreaterThan(1.5).toDestination();
    const signal = new Tone.Signal(1).connect(gt);
    gt.comparator.setValueAtTime(0.5, 0.1);
}, 0.5, 1);
```

- Defined in [Tone/signal/GreaterThan.ts:50](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/GreaterThan.ts#L50)

### `Readonly` context

context: [BaseContext](BaseContext.md)

The context belonging to the node.

Inherited from [Signal](Signal.md).[context](Signal.md#context)

- Defined in [Tone/core/context/ToneWithContext.ts:40](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L40)

### debug

debug: boolean = false

Set this debug flag to log all events that happen in this class.

Inherited from [Signal](Signal.md).[debug](Signal.md#debug)

- Defined in [Tone/core/Tone.ts:49](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L49)

### `Readonly` input

input: [ToneAudioNode](ToneAudioNode.md)<ToneWithContextOptions>

The input node or nodes. If the object is a source, it does not have any input and this.input is undefined.

Overrides [Signal](Signal.md).[input](Signal.md#input)

- Defined in [Tone/signal/GreaterThan.ts:27](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/GreaterThan.ts#L27)

### `Readonly` name

name: string = "GreaterThan"

The name of the class

Overrides [Signal](Signal.md).[name](Signal.md#name)

- Defined in [Tone/signal/GreaterThan.ts:23](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/GreaterThan.ts#L23)

### `Readonly` output

output: [ToneAudioNode](ToneAudioNode.md)<ToneWithContextOptions>

The output nodes. If the object is a sink, it does not have any output and this.output is undefined.

Overrides [Signal](Signal.md).[output](Signal.md#output)

- Defined in [Tone/signal/GreaterThan.ts:28](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/GreaterThan.ts#L28)

### `Readonly` override

override: boolean = false

Indicates if the value should be overridden on connection.

Overrides [Signal](Signal.md).[override](Signal.md#override)

- Defined in [Tone/signal/GreaterThan.ts:25](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/GreaterThan.ts#L25)

### `Static` version

version: string = version

The version number semver

Inherited from [Signal](Signal.md).[version](Signal.md#version)

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

  Inherited from Signal.blockTime

  - Defined in [Tone/core/context/ToneWithContext.ts:108](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L108)

### channelCount

- get channelCount(): number

- channelCount is the number of channels used when up-mixing and down-mixing connections to any inputs to the node. The default value is 2 except for specific nodes where its value is specially determined.

  #### Returns number

  Inherited from Signal.channelCount

  - Defined in [Tone/core/context/ToneAudioNode.ts:153](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L153)

- set channelCount(channelCount): void

- #### Parameters

  - channelCount: number

  #### Returns void

  Inherited from Signal.channelCount

  - Defined in [Tone/core/context/ToneAudioNode.ts:156](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L156)

### channelCountMode

- get channelCountMode(): ChannelCountMode

- channelCountMode determines how channels will be counted when up-mixing and down-mixing connections to any inputs to the node. The default value is "max". This attribute has no effect for nodes with no inputs.

  - "max" - computedNumberOfChannels is the maximum of the number of channels of all connections to an input. In this mode channelCount is ignored.
  - "clamped-max" - computedNumberOfChannels is determined as for "max" and then clamped to a maximum value of the given channelCount.
  - "explicit" - computedNumberOfChannels is the exact value as specified by the channelCount.

  #### Returns ChannelCountMode

  Inherited from Signal.channelCountMode

  - Defined in [Tone/core/context/ToneAudioNode.ts:170](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L170)

- set channelCountMode(channelCountMode): void

- #### Parameters

  - channelCountMode: ChannelCountMode

  #### Returns void

  Inherited from Signal.channelCountMode

  - Defined in [Tone/core/context/ToneAudioNode.ts:173](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L173)

### channelInterpretation

- get channelInterpretation(): ChannelInterpretation

- channelInterpretation determines how individual channels will be treated when up-mixing and down-mixing connections to any inputs to the node. The default value is "speakers".

  #### Returns ChannelInterpretation

  Inherited from Signal.channelInterpretation

  - Defined in [Tone/core/context/ToneAudioNode.ts:184](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L184)

- set channelInterpretation(channelInterpretation): void

- #### Parameters

  - channelInterpretation: ChannelInterpretation

  #### Returns void

  Inherited from Signal.channelInterpretation

  - Defined in [Tone/core/context/ToneAudioNode.ts:187](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L187)

### convert

- get convert(): boolean

- #### Returns boolean

  Inherited from Signal.convert

  - Defined in [Tone/signal/Signal.ts:202](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/Signal.ts#L202)

- set convert(convert): void

- #### Parameters

  - convert: boolean

  #### Returns void

  Inherited from Signal.convert

  - Defined in [Tone/signal/Signal.ts:205](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/Signal.ts#L205)

### disposed

- get disposed(): boolean

- Indicates if the instance was disposed. 'Disposing' an instance means that all of the Web Audio nodes that were created for the instance are disconnected and freed for garbage collection.

  #### Returns boolean

  Inherited from Signal.disposed

  - Defined in [Tone/core/Tone.ts:96](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L96)

### maxValue

- get maxValue(): number

- #### Returns number

  Inherited from Signal.maxValue

  - Defined in [Tone/signal/Signal.ts:220](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/Signal.ts#L220)

### minValue

- get minValue(): number

- #### Returns number

  Inherited from Signal.minValue

  - Defined in [Tone/signal/Signal.ts:223](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/Signal.ts#L223)

### numberOfInputs

- get numberOfInputs(): number

- The number of inputs feeding into the AudioNode. For source nodes, this will be 0.

  #### Returns number

  #### Example

  ``` ts
  const node = new Tone.Gain();
  console.log(node.numberOfInputs);
  ```

  Inherited from Signal.numberOfInputs

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

  Inherited from Signal.numberOfOutputs

  - Defined in [Tone/core/context/ToneAudioNode.ts:70](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L70)

### overridden

- get overridden(): boolean

- #### Returns boolean

  Inherited from Signal.overridden

  - Defined in [Tone/signal/Signal.ts:213](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/Signal.ts#L213)

- set overridden(overridden): void

- #### Parameters

  - overridden: boolean

  #### Returns void

  Inherited from Signal.overridden

  - Defined in [Tone/signal/Signal.ts:216](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/Signal.ts#L216)

### sampleTime

- get sampleTime(): number

- The duration in seconds of one sample.

  #### Returns number

  Inherited from Signal.sampleTime

  - Defined in [Tone/core/context/ToneWithContext.ts:99](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L99)

### units

- get units(): keyof [UnitMap](../interfaces/Unit.UnitMap.md)

- #### Returns keyof [UnitMap](../interfaces/Unit.UnitMap.md)

  Inherited from Signal.units

  - Defined in [Tone/signal/Signal.ts:209](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/Signal.ts#L209)

### value

- get value(): [UnitMap](../interfaces/Unit.UnitMap.md)\[[TypeName](Signal.md#constructor.new_Signal.TypeName-1)\]

- #### Returns [UnitMap](../interfaces/Unit.UnitMap.md)\[[TypeName](Signal.md#constructor.new_Signal.TypeName-1)\]

  Inherited from Signal.value

  - Defined in [Tone/signal/Signal.ts:195](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/Signal.ts#L195)

- set value(value): void

- #### Parameters

  - value: [UnitMap](../interfaces/Unit.UnitMap.md)\[[TypeName](Signal.md#constructor.new_Signal.TypeName-1)\]

  #### Returns void

  Inherited from Signal.value

  - Defined in [Tone/signal/Signal.ts:198](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/Signal.ts#L198)

## Methods

### apply

- apply(param): this

- #### Parameters

  - param: AudioParam \| [Param](Param.md)<"number">

  #### Returns this

  #### See

  [Param.apply](Param.md#apply).

  Inherited from [Signal](Signal.md).[apply](Signal.md#apply)

  - Defined in [Tone/signal/Signal.ts:230](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/Signal.ts#L230)

### cancelAndHoldAtTime

- cancelAndHoldAtTime(time): this

- #### Parameters

  - time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Returns this

  Inherited from [Signal](Signal.md).[cancelAndHoldAtTime](Signal.md#cancelAndHoldAtTime)

  - Defined in [Tone/signal/Signal.ts:186](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/Signal.ts#L186)

### cancelScheduledValues

- cancelScheduledValues(time): this

- #### Parameters

  - time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Returns this

  Inherited from [Signal](Signal.md).[cancelScheduledValues](Signal.md#cancelScheduledValues)

  - Defined in [Tone/signal/Signal.ts:182](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/Signal.ts#L182)

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

  Inherited from [Signal](Signal.md).[chain](Signal.md#chain)

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

  Inherited from [Signal](Signal.md).[connect](Signal.md#connect)

  - Defined in [Tone/signal/Signal.ts:95](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/Signal.ts#L95)

### disconnect

- disconnect(destination?, outputNum?, inputNum?): this

- disconnect the output

  #### Parameters

  - `Optional` destination: [InputNode](../types/InputNode.md)
  - outputNum: number = 0
  - inputNum: number = 0

  #### Returns this

  Inherited from [Signal](Signal.md).[disconnect](Signal.md#disconnect)

  - Defined in [Tone/core/context/ToneAudioNode.ts:234](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L234)

### dispose

- dispose(): this

- Dispose and disconnect

  #### Returns this

  Overrides [Signal](Signal.md).[dispose](Signal.md#dispose)

  - Defined in [Tone/signal/GreaterThan.ts:86](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/GreaterThan.ts#L86)

### exponentialApproachValueAtTime

- exponentialApproachValueAtTime(value, time, rampTime): this

- #### Parameters

  - value: number
  - time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
  - rampTime: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Returns this

  Inherited from [Signal](Signal.md).[exponentialApproachValueAtTime](Signal.md#exponentialApproachValueAtTime)

  - Defined in [Tone/signal/Signal.ts:157](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/Signal.ts#L157)

### exponentialRampTo

- exponentialRampTo(value, rampTime, startTime?): this

- #### Parameters

  - value: number
  - rampTime: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
  - `Optional` startTime: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Returns this

  Inherited from [Signal](Signal.md).[exponentialRampTo](Signal.md#exponentialRampTo)

  - Defined in [Tone/signal/Signal.ts:133](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/Signal.ts#L133)

### exponentialRampToValueAtTime

- exponentialRampToValueAtTime(value, time): this

- #### Parameters

  - value: number
  - time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Returns this

  Inherited from [Signal](Signal.md).[exponentialRampToValueAtTime](Signal.md#exponentialRampToValueAtTime)

  - Defined in [Tone/signal/Signal.ts:129](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/Signal.ts#L129)

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

  Inherited from [Signal](Signal.md).[fan](Signal.md#fan)

  - Defined in [Tone/core/context/ToneAudioNode.ts:264](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L264)

### get

- get(): [SignalOptions](../interfaces/SignalOptions.md)<any>

- Get the object's attributes.

  #### Returns [SignalOptions](../interfaces/SignalOptions.md)<any>

  #### Example

  ``` ts
  const osc = new Tone.Oscillator();
  console.log(osc.get());
  ```

  Inherited from [Signal](Signal.md).[get](Signal.md#get)

  - Defined in [Tone/core/context/ToneWithContext.ts:170](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L170)

### getValueAtTime

- getValueAtTime(time): number

- #### Parameters

  - time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Returns number

  Inherited from [Signal](Signal.md).[getValueAtTime](Signal.md#getValueAtTime)

  - Defined in [Tone/signal/Signal.ts:118](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/Signal.ts#L118)

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

  Inherited from [Signal](Signal.md).[immediate](Signal.md#immediate)

  - Defined in [Tone/core/context/ToneWithContext.ts:92](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L92)

### linearRampTo

- linearRampTo(value, rampTime, startTime?): this

- #### Parameters

  - value: number
  - rampTime: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
  - `Optional` startTime: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Returns this

  Inherited from [Signal](Signal.md).[linearRampTo](Signal.md#linearRampTo)

  - Defined in [Tone/signal/Signal.ts:141](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/Signal.ts#L141)

### linearRampToValueAtTime

- linearRampToValueAtTime(value, time): this

- #### Parameters

  - value: number
  - time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Returns this

  Inherited from [Signal](Signal.md).[linearRampToValueAtTime](Signal.md#linearRampToValueAtTime)

  - Defined in [Tone/signal/Signal.ts:125](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/Signal.ts#L125)

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

  Inherited from [Signal](Signal.md).[now](Signal.md#now)

  - Defined in [Tone/core/context/ToneWithContext.ts:81](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L81)

### rampTo

- rampTo(value, rampTime, startTime?): this

- #### Parameters

  - value: number
  - rampTime: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
  - `Optional` startTime: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Returns this

  Inherited from [Signal](Signal.md).[rampTo](Signal.md#rampTo)

  - Defined in [Tone/signal/Signal.ts:190](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/Signal.ts#L190)

### set

- set(props): this

- Set multiple properties at once with an object.

  #### Parameters

  - props: RecursivePartial<[SignalOptions](../interfaces/SignalOptions.md)<any>>

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

  Inherited from [Signal](Signal.md).[set](Signal.md#set)

  - Defined in [Tone/core/context/ToneWithContext.ts:215](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L215)

### setRampPoint

- setRampPoint(time): this

- #### Parameters

  - time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Returns this

  Inherited from [Signal](Signal.md).[setRampPoint](Signal.md#setRampPoint)

  - Defined in [Tone/signal/Signal.ts:121](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/Signal.ts#L121)

### setTargetAtTime

- setTargetAtTime(value, startTime, timeConstant): this

- #### Parameters

  - value: number
  - startTime: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
  - timeConstant: number

  #### Returns this

  Inherited from [Signal](Signal.md).[setTargetAtTime](Signal.md#setTargetAtTime)

  - Defined in [Tone/signal/Signal.ts:165](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/Signal.ts#L165)

### setValueAtTime

- setValueAtTime(value, time): this

- #### Parameters

  - value: number
  - time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Returns this

  Inherited from [Signal](Signal.md).[setValueAtTime](Signal.md#setValueAtTime)

  - Defined in [Tone/signal/Signal.ts:114](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/Signal.ts#L114)

### setValueCurveAtTime

- setValueCurveAtTime(values, startTime, duration, scaling?): this

- #### Parameters

  - values: number\[\]
  - startTime: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
  - duration: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
  - `Optional` scaling: number

  #### Returns this

  Inherited from [Signal](Signal.md).[setValueCurveAtTime](Signal.md#setValueCurveAtTime)

  - Defined in [Tone/signal/Signal.ts:173](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/Signal.ts#L173)

### targetRampTo

- targetRampTo(value, rampTime, startTime?): this

- #### Parameters

  - value: number
  - rampTime: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
  - `Optional` startTime: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Returns this

  Inherited from [Signal](Signal.md).[targetRampTo](Signal.md#targetRampTo)

  - Defined in [Tone/signal/Signal.ts:149](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/Signal.ts#L149)

### toDestination

- toDestination(): this

- Connect the output to the context's destination node.

  #### Returns this

  #### Example

  ``` ts
  const osc = new Tone.Oscillator("C2").start();
  osc.toDestination();
  ```

  Inherited from [Signal](Signal.md).[toDestination](Signal.md#toDestination)

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

  Inherited from [Signal](Signal.md).[toFrequency](Signal.md#toFrequency)

  - Defined in [Tone/core/context/ToneWithContext.ts:132](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L132)

### toMaster

- toMaster(): this

- Connect the output to the context's destination node.

  #### Returns this

  #### See

  [toDestination](GreaterThan.md#toDestination)

  #### Deprecated

  Inherited from [Signal](Signal.md).[toMaster](Signal.md#toMaster)

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

  Inherited from [Signal](Signal.md).[toSeconds](Signal.md#toSeconds)

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

  Inherited from [Signal](Signal.md).[toString](Signal.md#toString)

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

  Inherited from [Signal](Signal.md).[toTicks](Signal.md#toTicks)

  - Defined in [Tone/core/context/ToneWithContext.ts:142](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L142)

### `Static` getDefaults

- getDefaults(): [GreaterThanOptions](../types/GreaterThanOptions.md)

- #### Returns [GreaterThanOptions](../types/GreaterThanOptions.md)

  Overrides [Signal](Signal.md).[getDefaults](Signal.md#getDefaults)

  - Defined in [Tone/signal/GreaterThan.ts:80](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/GreaterThan.ts#L80)
