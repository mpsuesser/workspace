# Class Signal<TypeName>

A signal is an audio-rate value. Tone.Signal is a core component of the library. Unlike a number, Signals can be scheduled with sample-level accuracy. Tone.Signal has all of the methods available to native Web Audio [AudioParam](http://webaudio.github.io/web-audio-api/#the-audioparam-interface) as well as additional conveniences. Read more about working with signals [here](https://github.com/Tonejs/Tone.js/wiki/Signals).

#### Example

``` ts
const osc = new Tone.Oscillator().toDestination().start();
// a scheduleable signal which can be connected to control an AudioParam or another Signal
const signal = new Tone.Signal({
    value: "C4",
    units: "frequency"
}).connect(osc.frequency);
// the scheduled ramp controls the connected signal
signal.rampTo("C2", 4, "+0.5");
```

#### Type Parameters

- TypeName extends [UnitName](../types/Unit.UnitName.md) = "number"

#### Hierarchy ([view full](../hierarchy.md#Signal))

- [ToneAudioNode](ToneAudioNode.md)<[SignalOptions](../interfaces/SignalOptions.md)<any>>
  - Signal
    - [Add](Add.md)
    - [GreaterThan](GreaterThan.md)
    - [Multiply](Multiply.md)
    - [Subtract](Subtract.md)
    - [SyncedSignal](SyncedSignal.md)

#### Implements

- AbstractParam<[TypeName](Signal.md#constructor.new_Signal.TypeName-1)>

- Defined in [Tone/signal/Signal.ts:43](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/Signal.ts#L43)

## Constructors

### constructor

- new Signal<[TypeName](Signal.md#constructor.new_Signal.TypeName-1)>(value?, units?): [Signal](Signal.md)<[TypeName](Signal.md#constructor.new_Signal.TypeName-1)>

- #### Type Parameters

  - TypeName extends keyof [UnitMap](../interfaces/Unit.UnitMap.md) = "number"

  #### Parameters

  - `Optional` value: [UnitMap](../interfaces/Unit.UnitMap.md)\[[TypeName](Signal.md#constructor.new_Signal.TypeName-1)\]
    Initial value of the signal
  - `Optional` units: [TypeName](Signal.md#constructor.new_Signal.TypeName-1)
    The unit name, e.g. "frequency"

  #### Returns [Signal](Signal.md)<[TypeName](Signal.md#constructor.new_Signal.TypeName-1)>

  Overrides [ToneAudioNode](ToneAudioNode.md).[constructor](ToneAudioNode.md#constructor)

  - Defined in [Tone/signal/Signal.ts:66](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/Signal.ts#L66)

- new Signal<[TypeName](Signal.md#constructor.new_Signal-1.TypeName-2)>(options?): [Signal](Signal.md)<[TypeName](Signal.md#constructor.new_Signal.TypeName-1)>

- #### Type Parameters

  - TypeName extends keyof [UnitMap](../interfaces/Unit.UnitMap.md) = "number"

  #### Parameters

  - `Optional` options: Partial<[SignalOptions](../interfaces/SignalOptions.md)<[TypeName](Signal.md#constructor.new_Signal.TypeName-1)>>

  #### Returns [Signal](Signal.md)<[TypeName](Signal.md#constructor.new_Signal.TypeName-1)>

  Overrides [ToneAudioNode](ToneAudioNode.md).[constructor](ToneAudioNode.md#constructor)

  - Defined in [Tone/signal/Signal.ts:67](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/Signal.ts#L67)

## Properties

### `Readonly` context

context: [BaseContext](BaseContext.md)

The context belonging to the node.

Inherited from [ToneAudioNode](ToneAudioNode.md).[context](ToneAudioNode.md#context)

- Defined in [Tone/core/context/ToneWithContext.ts:40](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L40)

### debug

debug: boolean = false

Set this debug flag to log all events that happen in this class.

Inherited from [ToneAudioNode](ToneAudioNode.md).[debug](ToneAudioNode.md#debug)

- Defined in [Tone/core/Tone.ts:49](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L49)

### `Readonly` input

input: [InputNode](../types/InputNode.md)

The input node or nodes. If the object is a source, it does not have any input and this.input is undefined.

Overrides [ToneAudioNode](ToneAudioNode.md).[input](ToneAudioNode.md#input)

- Defined in [Tone/signal/Signal.ts:60](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/Signal.ts#L60)

### `Readonly` name

name: string = "Signal"

The name of the class

Overrides [ToneAudioNode](ToneAudioNode.md).[name](ToneAudioNode.md#name)

- Defined in [Tone/signal/Signal.ts:47](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/Signal.ts#L47)

### `Readonly` output

output: [OutputNode](../types/OutputNode.md)

The output nodes. If the object is a sink, it does not have any output and this.output is undefined.

Overrides [ToneAudioNode](ToneAudioNode.md).[output](ToneAudioNode.md#output)

- Defined in [Tone/signal/Signal.ts:58](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/Signal.ts#L58)

### `Readonly` override

override: boolean = true

Indicates if the value should be overridden on connection.

- Defined in [Tone/signal/Signal.ts:52](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/Signal.ts#L52)

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

### convert

- get convert(): boolean

- #### Returns boolean

  Implementation of AbstractParam.convert

  - Defined in [Tone/signal/Signal.ts:202](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/Signal.ts#L202)

- set convert(convert): void

- #### Parameters

  - convert: boolean

  #### Returns void

  Implementation of AbstractParam.convert

  - Defined in [Tone/signal/Signal.ts:205](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/Signal.ts#L205)

### disposed

- get disposed(): boolean

- Indicates if the instance was disposed. 'Disposing' an instance means that all of the Web Audio nodes that were created for the instance are disconnected and freed for garbage collection.

  #### Returns boolean

  Inherited from ToneAudioNode.disposed

  - Defined in [Tone/core/Tone.ts:96](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L96)

### maxValue

- get maxValue(): number

- #### Returns number

  Implementation of AbstractParam.maxValue

  - Defined in [Tone/signal/Signal.ts:220](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/Signal.ts#L220)

### minValue

- get minValue(): number

- #### Returns number

  Implementation of AbstractParam.minValue

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

### overridden

- get overridden(): boolean

- #### Returns boolean

  Implementation of AbstractParam.overridden

  - Defined in [Tone/signal/Signal.ts:213](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/Signal.ts#L213)

- set overridden(overridden): void

- #### Parameters

  - overridden: boolean

  #### Returns void

  Implementation of AbstractParam.overridden

  - Defined in [Tone/signal/Signal.ts:216](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/Signal.ts#L216)

### sampleTime

- get sampleTime(): number

- The duration in seconds of one sample.

  #### Returns number

  Inherited from ToneAudioNode.sampleTime

  - Defined in [Tone/core/context/ToneWithContext.ts:99](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L99)

### units

- get units(): keyof [UnitMap](../interfaces/Unit.UnitMap.md)

- #### Returns keyof [UnitMap](../interfaces/Unit.UnitMap.md)

  Implementation of AbstractParam.units

  - Defined in [Tone/signal/Signal.ts:209](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/Signal.ts#L209)

### value

- get value(): [UnitMap](../interfaces/Unit.UnitMap.md)\[[TypeName](Signal.md#constructor.new_Signal.TypeName-1)\]

- #### Returns [UnitMap](../interfaces/Unit.UnitMap.md)\[[TypeName](Signal.md#constructor.new_Signal.TypeName-1)\]

  Implementation of AbstractParam.value

  - Defined in [Tone/signal/Signal.ts:195](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/Signal.ts#L195)

- set value(value): void

- #### Parameters

  - value: [UnitMap](../interfaces/Unit.UnitMap.md)\[[TypeName](Signal.md#constructor.new_Signal.TypeName-1)\]

  #### Returns void

  Implementation of AbstractParam.value

  - Defined in [Tone/signal/Signal.ts:198](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/Signal.ts#L198)

## Methods

### apply

- apply(param): this

- #### Parameters

  - param: AudioParam \| [Param](Param.md)<"number">

  #### Returns this

  #### See

  [Param.apply](Param.md#apply).

  - Defined in [Tone/signal/Signal.ts:230](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/Signal.ts#L230)

### cancelAndHoldAtTime

- cancelAndHoldAtTime(time): this

- #### Parameters

  - time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Returns this

  Implementation of AbstractParam.cancelAndHoldAtTime

  - Defined in [Tone/signal/Signal.ts:186](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/Signal.ts#L186)

### cancelScheduledValues

- cancelScheduledValues(time): this

- #### Parameters

  - time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Returns this

  Implementation of AbstractParam.cancelScheduledValues

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

  Inherited from [ToneAudioNode](ToneAudioNode.md).[chain](ToneAudioNode.md#chain)

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

  Overrides [ToneAudioNode](ToneAudioNode.md).[connect](ToneAudioNode.md#connect)

  - Defined in [Tone/signal/Signal.ts:95](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/Signal.ts#L95)

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

  - Defined in [Tone/signal/Signal.ts:101](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/Signal.ts#L101)

### exponentialApproachValueAtTime

- exponentialApproachValueAtTime(value, time, rampTime): this

- #### Parameters

  - value: [UnitMap](../interfaces/Unit.UnitMap.md)\[[TypeName](Signal.md#constructor.new_Signal.TypeName-1)\]
  - time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
  - rampTime: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Returns this

  Implementation of AbstractParam.exponentialApproachValueAtTime

  - Defined in [Tone/signal/Signal.ts:157](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/Signal.ts#L157)

### exponentialRampTo

- exponentialRampTo(value, rampTime, startTime?): this

- #### Parameters

  - value: [UnitMap](../interfaces/Unit.UnitMap.md)\[[TypeName](Signal.md#constructor.new_Signal.TypeName-1)\]
  - rampTime: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
  - `Optional` startTime: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Returns this

  Implementation of AbstractParam.exponentialRampTo

  - Defined in [Tone/signal/Signal.ts:133](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/Signal.ts#L133)

### exponentialRampToValueAtTime

- exponentialRampToValueAtTime(value, time): this

- #### Parameters

  - value: [UnitMap](../interfaces/Unit.UnitMap.md)\[[TypeName](Signal.md#constructor.new_Signal.TypeName-1)\]
  - time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Returns this

  Implementation of AbstractParam.exponentialRampToValueAtTime

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

  Inherited from [ToneAudioNode](ToneAudioNode.md).[fan](ToneAudioNode.md#fan)

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

  Inherited from [ToneAudioNode](ToneAudioNode.md).[get](ToneAudioNode.md#get)

  - Defined in [Tone/core/context/ToneWithContext.ts:170](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L170)

### getValueAtTime

- getValueAtTime(time): [UnitMap](../interfaces/Unit.UnitMap.md)\[[TypeName](Signal.md#constructor.new_Signal.TypeName-1)\]

- #### Parameters

  - time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Returns [UnitMap](../interfaces/Unit.UnitMap.md)\[[TypeName](Signal.md#constructor.new_Signal.TypeName-1)\]

  Implementation of AbstractParam.getValueAtTime

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

  Inherited from [ToneAudioNode](ToneAudioNode.md).[immediate](ToneAudioNode.md#immediate)

  - Defined in [Tone/core/context/ToneWithContext.ts:92](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L92)

### linearRampTo

- linearRampTo(value, rampTime, startTime?): this

- #### Parameters

  - value: [UnitMap](../interfaces/Unit.UnitMap.md)\[[TypeName](Signal.md#constructor.new_Signal.TypeName-1)\]
  - rampTime: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
  - `Optional` startTime: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Returns this

  Implementation of AbstractParam.linearRampTo

  - Defined in [Tone/signal/Signal.ts:141](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/Signal.ts#L141)

### linearRampToValueAtTime

- linearRampToValueAtTime(value, time): this

- #### Parameters

  - value: [UnitMap](../interfaces/Unit.UnitMap.md)\[[TypeName](Signal.md#constructor.new_Signal.TypeName-1)\]
  - time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Returns this

  Implementation of AbstractParam.linearRampToValueAtTime

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

  Inherited from [ToneAudioNode](ToneAudioNode.md).[now](ToneAudioNode.md#now)

  - Defined in [Tone/core/context/ToneWithContext.ts:81](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L81)

### rampTo

- rampTo(value, rampTime, startTime?): this

- #### Parameters

  - value: [UnitMap](../interfaces/Unit.UnitMap.md)\[[TypeName](Signal.md#constructor.new_Signal.TypeName-1)\]
  - rampTime: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
  - `Optional` startTime: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Returns this

  Implementation of AbstractParam.rampTo

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

  Inherited from [ToneAudioNode](ToneAudioNode.md).[set](ToneAudioNode.md#set)

  - Defined in [Tone/core/context/ToneWithContext.ts:215](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L215)

### setRampPoint

- setRampPoint(time): this

- #### Parameters

  - time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Returns this

  Implementation of AbstractParam.setRampPoint

  - Defined in [Tone/signal/Signal.ts:121](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/Signal.ts#L121)

### setTargetAtTime

- setTargetAtTime(value, startTime, timeConstant): this

- #### Parameters

  - value: [UnitMap](../interfaces/Unit.UnitMap.md)\[[TypeName](Signal.md#constructor.new_Signal.TypeName-1)\]
  - startTime: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
  - timeConstant: number

  #### Returns this

  Implementation of AbstractParam.setTargetAtTime

  - Defined in [Tone/signal/Signal.ts:165](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/Signal.ts#L165)

### setValueAtTime

- setValueAtTime(value, time): this

- #### Parameters

  - value: [UnitMap](../interfaces/Unit.UnitMap.md)\[[TypeName](Signal.md#constructor.new_Signal.TypeName-1)\]
  - time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Returns this

  Implementation of AbstractParam.setValueAtTime

  - Defined in [Tone/signal/Signal.ts:114](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/Signal.ts#L114)

### setValueCurveAtTime

- setValueCurveAtTime(values, startTime, duration, scaling?): this

- #### Parameters

  - values: [UnitMap](../interfaces/Unit.UnitMap.md)\[[TypeName](Signal.md#constructor.new_Signal.TypeName-1)\]\[\]
  - startTime: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
  - duration: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
  - `Optional` scaling: number

  #### Returns this

  Implementation of AbstractParam.setValueCurveAtTime

  - Defined in [Tone/signal/Signal.ts:173](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/Signal.ts#L173)

### targetRampTo

- targetRampTo(value, rampTime, startTime?): this

- #### Parameters

  - value: [UnitMap](../interfaces/Unit.UnitMap.md)\[[TypeName](Signal.md#constructor.new_Signal.TypeName-1)\]
  - rampTime: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
  - `Optional` startTime: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Returns this

  Implementation of AbstractParam.targetRampTo

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

  [toDestination](Signal.md#toDestination)

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

### `Static` getDefaults

- getDefaults(): [SignalOptions](../interfaces/SignalOptions.md)<any>

- #### Returns [SignalOptions](../interfaces/SignalOptions.md)<any>

  Overrides [ToneAudioNode](ToneAudioNode.md).[getDefaults](ToneAudioNode.md#getDefaults)

  - Defined in [Tone/signal/Signal.ts:87](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/Signal.ts#L87)
