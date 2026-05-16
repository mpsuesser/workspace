# Class Sequence<ValueType>

A sequence is an alternate notation of a part. Instead of passing in an array of \[time, event\] pairs, pass in an array of events which will be spaced at the given subdivision. Sub-arrays will subdivide that beat by the number of items are in the array. Sequence notation inspiration from [Tidal Cycles](http://tidalcycles.org/)

#### Example

``` ts
const synth = new Tone.Synth().toDestination();
const seq = new Tone.Sequence((time, note) => {
    synth.triggerAttackRelease(note, 0.1, time);
    // subdivisions are given as subarrays
}, ["C4", ["E4", "D4", "E4"], "G4", ["A4", "G4"]]).start(0);
Tone.Transport.start();
```

#### Type Parameters

- ValueType = any

#### Hierarchy ([view full](../hierarchy.md#Sequence))

- [ToneEvent](ToneEvent.md)<[ValueType](Sequence.md#constructor.new_Sequence.ValueType-1)>
  - Sequence

- Defined in [Tone/event/Sequence.ts:40](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Sequence.ts#L40)

## Constructors

### constructor

- new Sequence<[ValueType](Sequence.md#constructor.new_Sequence.ValueType-1)>(callback?, events?, subdivision?): [Sequence](Sequence.md)<[ValueType](Sequence.md#constructor.new_Sequence.ValueType-1)>

- #### Type Parameters

  - ValueType = any

  #### Parameters

  - `Optional` callback: [ToneEventCallback](../types/ToneEventCallback.md)<[ValueType](Sequence.md#constructor.new_Sequence.ValueType-1)>
    The callback to invoke with every note
  - `Optional` events: SequenceEventDescription<[ValueType](Sequence.md#constructor.new_Sequence.ValueType-1)>
    The sequence of events
  - `Optional` subdivision: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
    The subdivision between which events are placed.

  #### Returns [Sequence](Sequence.md)<[ValueType](Sequence.md#constructor.new_Sequence.ValueType-1)>

  Overrides [ToneEvent](ToneEvent.md).[constructor](ToneEvent.md#constructor)

  - Defined in [Tone/event/Sequence.ts:71](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Sequence.ts#L71)

- new Sequence<[ValueType](Sequence.md#constructor.new_Sequence-1.ValueType-2)>(options?): [Sequence](Sequence.md)<[ValueType](Sequence.md#constructor.new_Sequence.ValueType-1)>

- #### Type Parameters

  - ValueType = any

  #### Parameters

  - `Optional` options: Partial<SequenceOptions<[ValueType](Sequence.md#constructor.new_Sequence.ValueType-1)>>

  #### Returns [Sequence](Sequence.md)<[ValueType](Sequence.md#constructor.new_Sequence.ValueType-1)>

  Overrides [ToneEvent](ToneEvent.md).[constructor](ToneEvent.md#constructor)

  - Defined in [Tone/event/Sequence.ts:76](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Sequence.ts#L76)

## Properties

### callback

callback: [ToneEventCallback](../types/ToneEventCallback.md)<[ValueType](Sequence.md#constructor.new_Sequence.ValueType-1)>

The callback to invoke.

Inherited from [ToneEvent](ToneEvent.md).[callback](ToneEvent.md#callback)

- Defined in [Tone/event/ToneEvent.ts:69](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/ToneEvent.ts#L69)

### `Readonly` context

context: [BaseContext](BaseContext.md)

The context belonging to the node.

Inherited from [ToneEvent](ToneEvent.md).[context](ToneEvent.md#context)

- Defined in [Tone/core/context/ToneWithContext.ts:40](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L40)

### debug

debug: boolean = false

Set this debug flag to log all events that happen in this class.

Inherited from [ToneEvent](ToneEvent.md).[debug](ToneEvent.md#debug)

- Defined in [Tone/core/Tone.ts:49](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L49)

### mute

mute: boolean

If mute is true, the callback won't be invoked.

Inherited from [ToneEvent](ToneEvent.md).[mute](ToneEvent.md#mute)

- Defined in [Tone/event/ToneEvent.ts:118](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/ToneEvent.ts#L118)

### `Readonly` name

name: string = "Sequence"

Overrides [ToneEvent](ToneEvent.md).[name](ToneEvent.md#name)

- Defined in [Tone/event/Sequence.ts:41](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Sequence.ts#L41)

### value

value: [ValueType](Sequence.md#constructor.new_Sequence.ValueType-1)

The value which is passed to the callback function.

Inherited from [ToneEvent](ToneEvent.md).[value](ToneEvent.md#value)

- Defined in [Tone/event/ToneEvent.ts:75](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/ToneEvent.ts#L75)

### `Static` version

version: string = version

The version number semver

Inherited from [ToneEvent](ToneEvent.md).[version](ToneEvent.md#version)

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

  Inherited from ToneEvent.blockTime

  - Defined in [Tone/core/context/ToneWithContext.ts:108](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L108)

### disposed

- get disposed(): boolean

- Indicates if the instance was disposed. 'Disposing' an instance means that all of the Web Audio nodes that were created for the instance are disconnected and freed for garbage collection.

  #### Returns boolean

  Inherited from ToneEvent.disposed

  - Defined in [Tone/core/Tone.ts:96](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L96)

### events

- get events(): any\[\]

- The sequence

  #### Returns any\[\]

  - Defined in [Tone/event/Sequence.ts:125](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Sequence.ts#L125)

- set events(s): void

- #### Parameters

  - s: any\[\]

  #### Returns void

  - Defined in [Tone/event/Sequence.ts:128](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Sequence.ts#L128)

### humanize

- get humanize(): boolean \| [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

- If set to true, will apply small random variation to the callback time. If the value is given as a time, it will randomize by that amount.

  #### Returns boolean \| [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Example

  ``` ts
  const event = new Tone.ToneEvent();
  event.humanize = true;
  ```

  Overrides ToneEvent.humanize

  - Defined in [Tone/event/Sequence.ts:322](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Sequence.ts#L322)

- set humanize(variation): void

- #### Parameters

  - variation: boolean \| [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Returns void

  Overrides ToneEvent.humanize

  - Defined in [Tone/event/Sequence.ts:325](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Sequence.ts#L325)

### length

- get length(): number

- The number of scheduled events

  #### Returns number

  - Defined in [Tone/event/Sequence.ts:332](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Sequence.ts#L332)

### loop

- get loop(): number \| boolean

- If the note should loop or not between ToneEvent.loopStart and ToneEvent.loopEnd. If set to true, the event will loop indefinitely, if set to a number greater than 1 it will play a specific number of times, if set to false, 0 or 1, the part will only play once.

  #### Returns number \| boolean

  Overrides ToneEvent.loop

  - Defined in [Tone/event/Sequence.ts:264](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Sequence.ts#L264)

- set loop(l): void

- #### Parameters

  - l: number \| boolean

  #### Returns void

  Overrides ToneEvent.loop

  - Defined in [Tone/event/Sequence.ts:267](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Sequence.ts#L267)

### loopEnd

- get loopEnd(): number

- The index at which the sequence should end looping

  #### Returns number

  Overrides ToneEvent.loopEnd

  - Defined in [Tone/event/Sequence.ts:285](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Sequence.ts#L285)

- set loopEnd(index): void

- #### Parameters

  - index: number

  #### Returns void

  Overrides ToneEvent.loopEnd

  - Defined in [Tone/event/Sequence.ts:288](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Sequence.ts#L288)

### loopStart

- get loopStart(): number

- The index at which the sequence should start looping

  #### Returns number

  Overrides ToneEvent.loopStart

  - Defined in [Tone/event/Sequence.ts:274](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Sequence.ts#L274)

- set loopStart(index): void

- #### Parameters

  - index: number

  #### Returns void

  Overrides ToneEvent.loopStart

  - Defined in [Tone/event/Sequence.ts:277](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Sequence.ts#L277)

### playbackRate

- get playbackRate(): number

- The playback rate of the event. Defaults to 1.

  #### Returns number

  #### Example

  ``` ts
  const note = new Tone.ToneEvent();
  note.loop = true;
  // repeat the note twice as fast
  note.playbackRate = 2;
  ```

  Overrides ToneEvent.playbackRate

  - Defined in [Tone/event/Sequence.ts:304](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Sequence.ts#L304)

- set playbackRate(rate): void

- #### Parameters

  - rate: number

  #### Returns void

  Overrides ToneEvent.playbackRate

  - Defined in [Tone/event/Sequence.ts:307](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Sequence.ts#L307)

### probability

- get probability(): number

- The probability of the notes being triggered.

  #### Returns number

  Overrides ToneEvent.probability

  - Defined in [Tone/event/Sequence.ts:311](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Sequence.ts#L311)

- set probability(prob): void

- #### Parameters

  - prob: number

  #### Returns void

  Overrides ToneEvent.probability

  - Defined in [Tone/event/Sequence.ts:314](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Sequence.ts#L314)

### progress

- get progress(): number

- The current progress of the loop interval. Returns 0 if the event is not started yet or it is not set to loop.

  #### Returns number

  Overrides ToneEvent.progress

  - Defined in [Tone/event/Sequence.ts:318](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Sequence.ts#L318)

### sampleTime

- get sampleTime(): number

- The duration in seconds of one sample.

  #### Returns number

  Inherited from ToneEvent.sampleTime

  - Defined in [Tone/core/context/ToneWithContext.ts:99](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L99)

### startOffset

- get startOffset(): number

- The start from the scheduled start time.

  #### Returns number

  Overrides ToneEvent.startOffset

  - Defined in [Tone/event/Sequence.ts:297](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Sequence.ts#L297)

- set startOffset(start): void

- #### Parameters

  - start: number

  #### Returns void

  Overrides ToneEvent.startOffset

  - Defined in [Tone/event/Sequence.ts:300](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Sequence.ts#L300)

### state

- get state(): [BasicPlaybackState](../types/BasicPlaybackState.md)

- Returns the playback state of the note, either "started" or "stopped".

  #### Returns [BasicPlaybackState](../types/BasicPlaybackState.md)

  Inherited from ToneEvent.state

  - Defined in [Tone/event/ToneEvent.ts:220](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/ToneEvent.ts#L220)

### subdivision

- get subdivision(): number

- The subdivision of the sequence. This can only be set in the constructor. The subdivision is the interval between successive steps.

  #### Returns number

  - Defined in [Tone/event/Sequence.ts:159](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Sequence.ts#L159)

## Methods

### cancel

- cancel(time?): this

- Cancel all scheduled events greater than or equal to the given time

  #### Parameters

  - `Optional` time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md) \| [TransportTimeClass](TransportTimeClass.md)<number>
    The time after which events will be cancel.

  #### Returns this

  Inherited from [ToneEvent](ToneEvent.md).[cancel](ToneEvent.md#cancel)

  - Defined in [Tone/event/ToneEvent.ts:302](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/ToneEvent.ts#L302)

### clear

- clear(): this

- Clear all of the events

  #### Returns this

  - Defined in [Tone/event/Sequence.ts:249](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Sequence.ts#L249)

### dispose

- dispose(): this

- #### Returns this

  Overrides [ToneEvent](ToneEvent.md).[dispose](ToneEvent.md#dispose)

  - Defined in [Tone/event/Sequence.ts:254](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Sequence.ts#L254)

### get

- get(): [ToneEventOptions](../interfaces/ToneEventOptions.md)<[ValueType](Sequence.md#constructor.new_Sequence.ValueType-1)>

- Get the object's attributes.

  #### Returns [ToneEventOptions](../interfaces/ToneEventOptions.md)<[ValueType](Sequence.md#constructor.new_Sequence.ValueType-1)>

  #### Example

  ``` ts
  const osc = new Tone.Oscillator();
  console.log(osc.get());
  ```

  Inherited from [ToneEvent](ToneEvent.md).[get](ToneEvent.md#get)

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

  Inherited from [ToneEvent](ToneEvent.md).[immediate](ToneEvent.md#immediate)

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

  Inherited from [ToneEvent](ToneEvent.md).[now](ToneEvent.md#now)

  - Defined in [Tone/core/context/ToneWithContext.ts:81](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L81)

### set

- set(props): this

- Set multiple properties at once with an object.

  #### Parameters

  - props: RecursivePartial<[ToneEventOptions](../interfaces/ToneEventOptions.md)<[ValueType](Sequence.md#constructor.new_Sequence.ValueType-1)>>

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

  Inherited from [ToneEvent](ToneEvent.md).[set](ToneEvent.md#set)

  - Defined in [Tone/core/context/ToneWithContext.ts:215](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L215)

### start

- start(time?, offset?): this

- Start the part at the given time.

  #### Parameters

  - `Optional` time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
    When to start the part.
  - `Optional` offset: number
    The offset index to start at

  #### Returns this

  Overrides [ToneEvent](ToneEvent.md).[start](ToneEvent.md#start)

  - Defined in [Tone/event/Sequence.ts:140](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Sequence.ts#L140)

### stop

- stop(time?): this

- Stop the part at the given time.

  #### Parameters

  - `Optional` time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
    When to stop the part.

  #### Returns this

  Overrides [ToneEvent](ToneEvent.md).[stop](ToneEvent.md#stop)

  - Defined in [Tone/event/Sequence.ts:149](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Sequence.ts#L149)

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

  Inherited from [ToneEvent](ToneEvent.md).[toFrequency](ToneEvent.md#toFrequency)

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

  Inherited from [ToneEvent](ToneEvent.md).[toSeconds](ToneEvent.md#toSeconds)

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

  Inherited from [ToneEvent](ToneEvent.md).[toString](ToneEvent.md#toString)

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

  Inherited from [ToneEvent](ToneEvent.md).[toTicks](ToneEvent.md#toTicks)

  - Defined in [Tone/core/context/ToneWithContext.ts:142](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L142)

### `Static` getDefaults

- getDefaults(): SequenceOptions<any>

- #### Returns SequenceOptions<any>

  Overrides [ToneEvent](ToneEvent.md).[getDefaults](ToneEvent.md#getDefaults)

  - Defined in [Tone/event/Sequence.ts:100](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Sequence.ts#L100)
