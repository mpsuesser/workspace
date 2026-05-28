# Class Pattern<ValueType>

Pattern arpeggiates between the given notes in a number of patterns.

#### Example

``` ts
const pattern = new Tone.Pattern((time, note) => {
    // the order of the notes passed in depends on the pattern
}, ["C2", "D4", "E5", "A6"], "upDown");
```

#### Type Parameters

- ValueType

#### Hierarchy ([view full](../hierarchy.md#Pattern))

- [Loop](Loop.md)<[PatternOptions](../interfaces/PatternOptions.md)<[ValueType](Pattern.md#constructor.new_Pattern.ValueType-1)>>
  - Pattern

- Defined in [Tone/event/Pattern.ts:23](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Pattern.ts#L23)

## Constructors

### constructor

- new Pattern<[ValueType](Pattern.md#constructor.new_Pattern.ValueType-1)>(callback?, values?, pattern?): [Pattern](Pattern.md)<[ValueType](Pattern.md#constructor.new_Pattern.ValueType-1)>

- #### Type Parameters

  - ValueType

  #### Parameters

  - `Optional` callback: [ToneEventCallback](../types/ToneEventCallback.md)<[ValueType](Pattern.md#constructor.new_Pattern.ValueType-1)>
    The callback to invoke with the event.
  - `Optional` values: [ValueType](Pattern.md#constructor.new_Pattern.ValueType-1)\[\]
    The values to arpeggiate over.
  - `Optional` pattern: PatternName
    The name of the pattern

  #### Returns [Pattern](Pattern.md)<[ValueType](Pattern.md#constructor.new_Pattern.ValueType-1)>

  Overrides [Loop](Loop.md).[constructor](Loop.md#constructor)

  - Defined in [Tone/event/Pattern.ts:61](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Pattern.ts#L61)

- new Pattern<[ValueType](Pattern.md#constructor.new_Pattern-1.ValueType-2)>(options?): [Pattern](Pattern.md)<[ValueType](Pattern.md#constructor.new_Pattern.ValueType-1)>

- #### Type Parameters

  - ValueType

  #### Parameters

  - `Optional` options: Partial<[PatternOptions](../interfaces/PatternOptions.md)<[ValueType](Pattern.md#constructor.new_Pattern.ValueType-1)>>

  #### Returns [Pattern](Pattern.md)<[ValueType](Pattern.md#constructor.new_Pattern.ValueType-1)>

  Overrides [Loop](Loop.md).[constructor](Loop.md#constructor)

  - Defined in [Tone/event/Pattern.ts:66](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Pattern.ts#L66)

## Properties

### callback

callback: ((time, value?) => void)

The callback to be invoked at a regular interval

#### Type declaration

- - (time, value?): void

  - #### Parameters

    - time: number
    - `Optional` value: [ValueType](Pattern.md#constructor.new_Pattern.ValueType-1)

    #### Returns void

Overrides [Loop](Loop.md).[callback](Loop.md#callback)

- Defined in [Tone/event/Pattern.ts:54](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Pattern.ts#L54)

### `Readonly` context

context: [BaseContext](BaseContext.md)

The context belonging to the node.

Inherited from [Loop](Loop.md).[context](Loop.md#context)

- Defined in [Tone/core/context/ToneWithContext.ts:40](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L40)

### debug

debug: boolean = false

Set this debug flag to log all events that happen in this class.

Inherited from [Loop](Loop.md).[debug](Loop.md#debug)

- Defined in [Tone/core/Tone.ts:49](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L49)

### `Readonly` name

name: string = "Pattern"

Overrides [Loop](Loop.md).[name](Loop.md#name)

- Defined in [Tone/event/Pattern.ts:24](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Pattern.ts#L24)

### `Static` version

version: string = version

The version number semver

Inherited from [Loop](Loop.md).[version](Loop.md#version)

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

  Inherited from Loop.blockTime

  - Defined in [Tone/core/context/ToneWithContext.ts:108](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L108)

### disposed

- get disposed(): boolean

- Indicates if the instance was disposed. 'Disposing' an instance means that all of the Web Audio nodes that were created for the instance are disconnected and freed for garbage collection.

  #### Returns boolean

  Inherited from Loop.disposed

  - Defined in [Tone/core/Tone.ts:96](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L96)

### humanize

- get humanize(): boolean \| [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

- Random variation +/-0.01s to the scheduled time. Or give it a time value which it will randomize by.

  #### Returns boolean \| [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  Inherited from Loop.humanize

  - Defined in [Tone/event/Loop.ts:172](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Loop.ts#L172)

- set humanize(variation): void

- #### Parameters

  - variation: boolean \| [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Returns void

  Inherited from Loop.humanize

  - Defined in [Tone/event/Loop.ts:175](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Loop.ts#L175)

### index

- get index(): undefined \| number

- The current index of the pattern.

  #### Returns undefined \| number

  - Defined in [Tone/event/Pattern.ts:124](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Pattern.ts#L124)

### interval

- get interval(): [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

- The time between successive callbacks.

  #### Returns [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Example

  ``` ts
  const loop = new Tone.Loop();
  loop.interval = "8n"; // loop every 8n
  ```

  Inherited from Loop.interval

  - Defined in [Tone/event/Loop.ts:150](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Loop.ts#L150)

- set interval(interval): void

- #### Parameters

  - interval: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Returns void

  Inherited from Loop.interval

  - Defined in [Tone/event/Loop.ts:153](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Loop.ts#L153)

### iterations

- get iterations(): number

- The number of iterations of the loop. The default value is `Infinity` (loop forever).

  #### Returns number

  Inherited from Loop.iterations

  - Defined in [Tone/event/Loop.ts:204](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Loop.ts#L204)

- set iterations(iters): void

- #### Parameters

  - iters: number

  #### Returns void

  Inherited from Loop.iterations

  - Defined in [Tone/event/Loop.ts:211](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Loop.ts#L211)

### mute

- get mute(): boolean

- Muting the Loop means that no callbacks are invoked.

  #### Returns boolean

  Inherited from Loop.mute

  - Defined in [Tone/event/Loop.ts:193](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Loop.ts#L193)

- set mute(mute): void

- #### Parameters

  - mute: boolean

  #### Returns void

  Inherited from Loop.mute

  - Defined in [Tone/event/Loop.ts:197](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Loop.ts#L197)

### pattern

- get pattern(): PatternName

- The pattern type.

  #### Returns PatternName

  - Defined in [Tone/event/Pattern.ts:131](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Pattern.ts#L131)

- set pattern(pattern): void

- #### Parameters

  - pattern: PatternName

  #### Returns void

  - Defined in [Tone/event/Pattern.ts:134](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Pattern.ts#L134)

### playbackRate

- get playbackRate(): number

- The playback rate of the loop. The normal playback rate is 1 (no change). A `playbackRate` of 2 would be twice as fast.

  #### Returns number

  Inherited from Loop.playbackRate

  - Defined in [Tone/event/Loop.ts:161](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Loop.ts#L161)

- set playbackRate(rate): void

- #### Parameters

  - rate: number

  #### Returns void

  Inherited from Loop.playbackRate

  - Defined in [Tone/event/Loop.ts:164](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Loop.ts#L164)

### probability

- get probability(): number

- The probably of the callback being invoked.

  #### Returns number

  Inherited from Loop.probability

  - Defined in [Tone/event/Loop.ts:182](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Loop.ts#L182)

- set probability(prob): void

- #### Parameters

  - prob: number

  #### Returns void

  Inherited from Loop.probability

  - Defined in [Tone/event/Loop.ts:186](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Loop.ts#L186)

### progress

- get progress(): number

- The progress of the loop as a value between 0-1. 0, when the loop is stopped or done iterating.

  #### Returns number

  Inherited from Loop.progress

  - Defined in [Tone/event/Loop.ts:140](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Loop.ts#L140)

### sampleTime

- get sampleTime(): number

- The duration in seconds of one sample.

  #### Returns number

  Inherited from Loop.sampleTime

  - Defined in [Tone/core/context/ToneWithContext.ts:99](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L99)

### state

- get state(): [BasicPlaybackState](../types/BasicPlaybackState.md)

- The state of the Loop, either started or stopped.

  #### Returns [BasicPlaybackState](../types/BasicPlaybackState.md)

  Inherited from Loop.state

  - Defined in [Tone/event/Loop.ts:133](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Loop.ts#L133)

### value

- get value(): undefined \| [ValueType](Pattern.md#constructor.new_Pattern.ValueType-1)

- The current value of the pattern.

  #### Returns undefined \| [ValueType](Pattern.md#constructor.new_Pattern.ValueType-1)

  - Defined in [Tone/event/Pattern.ts:117](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Pattern.ts#L117)

### values

- get values(): [ValueType](Pattern.md#constructor.new_Pattern.ValueType-1)\[\]

- The array of events.

  #### Returns [ValueType](Pattern.md#constructor.new_Pattern.ValueType-1)\[\]

  - Defined in [Tone/event/Pattern.ts:105](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Pattern.ts#L105)

- set values(val): void

- #### Parameters

  - val: [ValueType](Pattern.md#constructor.new_Pattern.ValueType-1)\[\]

  #### Returns void

  - Defined in [Tone/event/Pattern.ts:108](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Pattern.ts#L108)

## Methods

### cancel

- cancel(time?): this

- Cancel all scheduled events greater than or equal to the given time

  #### Parameters

  - `Optional` time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
    The time after which events will be cancel.

  #### Returns this

  Inherited from [Loop](Loop.md).[cancel](Loop.md#cancel)

  - Defined in [Tone/event/Loop.ts:117](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Loop.ts#L117)

### dispose

- dispose(): this

- #### Returns this

  Inherited from [Loop](Loop.md).[dispose](Loop.md#dispose)

  - Defined in [Tone/event/Loop.ts:219](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Loop.ts#L219)

### get

- get(): [PatternOptions](../interfaces/PatternOptions.md)<[ValueType](Pattern.md#constructor.new_Pattern.ValueType-1)>

- Get the object's attributes.

  #### Returns [PatternOptions](../interfaces/PatternOptions.md)<[ValueType](Pattern.md#constructor.new_Pattern.ValueType-1)>

  #### Example

  ``` ts
  const osc = new Tone.Oscillator();
  console.log(osc.get());
  ```

  Inherited from [Loop](Loop.md).[get](Loop.md#get)

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

  Inherited from [Loop](Loop.md).[immediate](Loop.md#immediate)

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

  Inherited from [Loop](Loop.md).[now](Loop.md#now)

  - Defined in [Tone/core/context/ToneWithContext.ts:81](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L81)

### set

- set(props): this

- Set multiple properties at once with an object.

  #### Parameters

  - props: RecursivePartial<[PatternOptions](../interfaces/PatternOptions.md)<[ValueType](Pattern.md#constructor.new_Pattern.ValueType-1)>>

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

  Inherited from [Loop](Loop.md).[set](Loop.md#set)

  - Defined in [Tone/core/context/ToneWithContext.ts:215](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L215)

### start

- start(time?): this

- Start the loop at the specified time along the Transport's timeline.

  #### Parameters

  - `Optional` time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
    When to start the Loop.

  #### Returns this

  Inherited from [Loop](Loop.md).[start](Loop.md#start)

  - Defined in [Tone/event/Loop.ts:99](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Loop.ts#L99)

### stop

- stop(time?): this

- Stop the loop at the given time.

  #### Parameters

  - `Optional` time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
    When to stop the Loop.

  #### Returns this

  Inherited from [Loop](Loop.md).[stop](Loop.md#stop)

  - Defined in [Tone/event/Loop.ts:108](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Loop.ts#L108)

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

  Inherited from [Loop](Loop.md).[toFrequency](Loop.md#toFrequency)

  - Defined in [Tone/core/context/ToneWithContext.ts:132](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L132)

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

  Inherited from [Loop](Loop.md).[toSeconds](Loop.md#toSeconds)

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

  Inherited from [Loop](Loop.md).[toString](Loop.md#toString)

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

  Inherited from [Loop](Loop.md).[toTicks](Loop.md#toTicks)

  - Defined in [Tone/core/context/ToneWithContext.ts:142](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L142)

### `Static` getDefaults

- getDefaults(): [PatternOptions](../interfaces/PatternOptions.md)<any>

- #### Returns [PatternOptions](../interfaces/PatternOptions.md)<any>

  Overrides [Loop](Loop.md).[getDefaults](Loop.md#getDefaults)

  - Defined in [Tone/event/Pattern.ts:84](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Pattern.ts#L84)
