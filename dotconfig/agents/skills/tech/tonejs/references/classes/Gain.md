# Class Gain<TypeName>

A thin wrapper around the Native Web Audio GainNode. The GainNode is a basic building block of the Web Audio API and is useful for routing audio and adjusting gains.

#### Example

``` ts
return Tone.Offline(() => {
    const gainNode = new Tone.Gain(0).toDestination();
    const osc = new Tone.Oscillator(30).connect(gainNode).start();
    gainNode.gain.rampTo(1, 0.1);
    gainNode.gain.rampTo(0, 0.4, 0.2);
}, 0.7, 1);
```

#### Type Parameters

- TypeName extends "gain" \| "decibels" \| "normalRange" = "gain"

#### Hierarchy ([view full](../hierarchy.md#Gain))

- [ToneAudioNode](ToneAudioNode.md)<GainOptions<[TypeName](Gain.md#constructor.new_Gain.TypeName-1)>>
  - Gain

- Defined in [Tone/core/context/Gain.ts:28](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Gain.ts#L28)

## Constructors

### constructor

- new Gain<[TypeName](Gain.md#constructor.new_Gain.TypeName-1)>(gain?, units?): [Gain](Gain.md)<[TypeName](Gain.md#constructor.new_Gain.TypeName-1)>

- #### Type Parameters

  - TypeName extends "decibels" \| "normalRange" \| "gain" = "gain"

  #### Parameters

  - `Optional` gain: [UnitMap](../interfaces/Unit.UnitMap.md)\[[TypeName](Gain.md#constructor.new_Gain.TypeName-1)\]
    The initial gain of the GainNode
  - `Optional` units: [TypeName](Gain.md#constructor.new_Gain.TypeName-1)
    The units of the gain parameter.

  #### Returns [Gain](Gain.md)<[TypeName](Gain.md#constructor.new_Gain.TypeName-1)>

  Overrides [ToneAudioNode](ToneAudioNode.md).[constructor](ToneAudioNode.md#constructor)

  - Defined in [Tone/core/context/Gain.ts:56](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Gain.ts#L56)

- new Gain<[TypeName](Gain.md#constructor.new_Gain-1.TypeName-2)>(options?): [Gain](Gain.md)<[TypeName](Gain.md#constructor.new_Gain.TypeName-1)>

- #### Type Parameters

  - TypeName extends "decibels" \| "normalRange" \| "gain" = "gain"

  #### Parameters

  - `Optional` options: Partial<GainOptions<[TypeName](Gain.md#constructor.new_Gain.TypeName-1)>>

  #### Returns [Gain](Gain.md)<[TypeName](Gain.md#constructor.new_Gain.TypeName-1)>

  Overrides [ToneAudioNode](ToneAudioNode.md).[constructor](ToneAudioNode.md#constructor)

  - Defined in [Tone/core/context/Gain.ts:57](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Gain.ts#L57)

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

### `Readonly` gain

gain: [Param](Param.md)<[TypeName](Gain.md#constructor.new_Gain.TypeName-1)>

The gain parameter of the gain node.

#### Example

``` ts
const gainNode = new Tone.Gain(0).toDestination();
const osc = new Tone.Oscillator().connect(gainNode).start();
gainNode.gain.rampTo(1, 0.1);
gainNode.gain.rampTo(0, 2, "+0.5");
```

- Defined in [Tone/core/context/Gain.ts:41](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Gain.ts#L41)

### `Readonly` input

input: GainNode = ...

The input node or nodes. If the object is a source, it does not have any input and this.input is undefined.

Overrides [ToneAudioNode](ToneAudioNode.md).[input](ToneAudioNode.md#input)

- Defined in [Tone/core/context/Gain.ts:49](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Gain.ts#L49)

### `Readonly` name

name: string = "Gain"

The name of the class

Overrides [ToneAudioNode](ToneAudioNode.md).[name](ToneAudioNode.md#name)

- Defined in [Tone/core/context/Gain.ts:31](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Gain.ts#L31)

### `Readonly` output

output: GainNode = ...

The output nodes. If the object is a sink, it does not have any output and this.output is undefined.

Overrides [ToneAudioNode](ToneAudioNode.md).[output](ToneAudioNode.md#output)

- Defined in [Tone/core/context/Gain.ts:50](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Gain.ts#L50)

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

### sampleTime

- get sampleTime(): number

- The duration in seconds of one sample.

  #### Returns number

  Inherited from ToneAudioNode.sampleTime

  - Defined in [Tone/core/context/ToneWithContext.ts:99](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L99)

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

  Inherited from [ToneAudioNode](ToneAudioNode.md).[connect](ToneAudioNode.md#connect)

  - Defined in [Tone/core/context/ToneAudioNode.ts:205](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L205)

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

- Clean up.

  #### Returns this

  Overrides [ToneAudioNode](ToneAudioNode.md).[dispose](ToneAudioNode.md#dispose)

  - Defined in [Tone/core/context/Gain.ts:88](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Gain.ts#L88)

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

- get(): GainOptions<[TypeName](Gain.md#constructor.new_Gain.TypeName-1)>

- Get the object's attributes.

  #### Returns GainOptions<[TypeName](Gain.md#constructor.new_Gain.TypeName-1)>

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

  - props: RecursivePartial<GainOptions<[TypeName](Gain.md#constructor.new_Gain.TypeName-1)>>

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

  [toDestination](Gain.md#toDestination)

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

- getDefaults(): GainOptions<any>

- #### Returns GainOptions<any>

  Overrides [ToneAudioNode](ToneAudioNode.md).[getDefaults](ToneAudioNode.md#getDefaults)

  - Defined in [Tone/core/context/Gain.ts:77](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Gain.ts#L77)
