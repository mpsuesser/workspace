# Class ToneEvent<ValueType>

ToneEvent abstracts away this.context.transport.schedule and provides a schedulable callback for a single or repeatable events along the timeline.

#### Example

``` ts
const synth = new Tone.PolySynth().toDestination();
const chordEvent = new Tone.ToneEvent(((time, chord) => {
    // the chord as well as the exact time of the event
    // are passed in as arguments to the callback function
    synth.triggerAttackRelease(chord, 0.5, time);
}), ["D4", "E4", "F4"]);
// start the chord at the beginning of the transport timeline
chordEvent.start();
// loop it every measure for 8 measures
chordEvent.loop = 8;
chordEvent.loopEnd = "1m";
```

#### Type Parameters

- ValueType = any

#### Hierarchy ([view full](../hierarchy.md#ToneEvent))

- ToneWithContext<[ToneEventOptions](../interfaces/ToneEventOptions.md)<[ValueType](ToneEvent.md#constructor.new_ToneEvent.ValueType-1)>>
  - ToneEvent
    - [Part](Part.md)
    - [Sequence](Sequence.md)

- Defined in [Tone/event/ToneEvent.ts:56](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/ToneEvent.ts#L56)

## Constructors

### constructor

- new ToneEvent<[ValueType](ToneEvent.md#constructor.new_ToneEvent.ValueType-1)>(callback?, value?): [ToneEvent](ToneEvent.md)<[ValueType](ToneEvent.md#constructor.new_ToneEvent.ValueType-1)>

- #### Type Parameters

  - ValueType = any

  #### Parameters

  - `Optional` callback: [ToneEventCallback](../types/ToneEventCallback.md)<[ValueType](ToneEvent.md#constructor.new_ToneEvent.ValueType-1)>
    The callback to invoke at the time.
  - `Optional` value: [ValueType](ToneEvent.md#constructor.new_ToneEvent.ValueType-1)
    The value or values which should be passed to the callback function on invocation.

  #### Returns [ToneEvent](ToneEvent.md)<[ValueType](ToneEvent.md#constructor.new_ToneEvent.ValueType-1)>

  Overrides ToneWithContext< ToneEventOptions<ValueType> >.constructor

  - Defined in [Tone/event/ToneEvent.ts:124](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/ToneEvent.ts#L124)

- new ToneEvent<[ValueType](ToneEvent.md#constructor.new_ToneEvent-1.ValueType-2)>(options?): [ToneEvent](ToneEvent.md)<[ValueType](ToneEvent.md#constructor.new_ToneEvent.ValueType-1)>

- #### Type Parameters

  - ValueType = any

  #### Parameters

  - `Optional` options: Partial<[ToneEventOptions](../interfaces/ToneEventOptions.md)<[ValueType](ToneEvent.md#constructor.new_ToneEvent.ValueType-1)>>

  #### Returns [ToneEvent](ToneEvent.md)<[ValueType](ToneEvent.md#constructor.new_ToneEvent.ValueType-1)>

  Overrides ToneWithContext< ToneEventOptions<ValueType> >.constructor

  - Defined in [Tone/event/ToneEvent.ts:125](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/ToneEvent.ts#L125)

## Properties

### callback

callback: [ToneEventCallback](../types/ToneEventCallback.md)<[ValueType](ToneEvent.md#constructor.new_ToneEvent.ValueType-1)>

The callback to invoke.

- Defined in [Tone/event/ToneEvent.ts:69](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/ToneEvent.ts#L69)

### `Readonly` context

context: [BaseContext](BaseContext.md)

The context belonging to the node.

Inherited from ToneWithContext.context

- Defined in [Tone/core/context/ToneWithContext.ts:40](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L40)

### debug

debug: boolean = false

Set this debug flag to log all events that happen in this class.

Inherited from ToneWithContext.debug

- Defined in [Tone/core/Tone.ts:49](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L49)

### mute

mute: boolean

If mute is true, the callback won't be invoked.

- Defined in [Tone/event/ToneEvent.ts:118](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/ToneEvent.ts#L118)

### `Readonly` name

name: string = "ToneEvent"

Overrides ToneWithContext.name

- Defined in [Tone/event/ToneEvent.ts:59](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/ToneEvent.ts#L59)

### value

value: [ValueType](ToneEvent.md#constructor.new_ToneEvent.ValueType-1)

The value which is passed to the callback function.

- Defined in [Tone/event/ToneEvent.ts:75](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/ToneEvent.ts#L75)

### `Static` version

version: string = version

The version number semver

Inherited from ToneWithContext.version

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

  Inherited from ToneWithContext.blockTime

  - Defined in [Tone/core/context/ToneWithContext.ts:108](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L108)

### disposed

- get disposed(): boolean

- Indicates if the instance was disposed. 'Disposing' an instance means that all of the Web Audio nodes that were created for the instance are disconnected and freed for garbage collection.

  #### Returns boolean

  Inherited from ToneWithContext.disposed

  - Defined in [Tone/core/Tone.ts:96](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L96)

### humanize

- get humanize(): boolean \| [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

- If set to true, will apply small random variation to the callback time. If the value is given as a time, it will randomize by that amount.

  #### Returns boolean \| [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Example

  ``` ts
  const event = new Tone.ToneEvent();
  event.humanize = true;
  ```

  - Defined in [Tone/event/ToneEvent.ts:254](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/ToneEvent.ts#L254)

- set humanize(variation): void

- #### Parameters

  - variation: boolean \| [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Returns void

  - Defined in [Tone/event/ToneEvent.ts:258](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/ToneEvent.ts#L258)

### loop

- get loop(): number \| boolean

- If the note should loop or not between ToneEvent.loopStart and ToneEvent.loopEnd. If set to true, the event will loop indefinitely, if set to a number greater than 1 it will play a specific number of times, if set to false, 0 or 1, the part will only play once.

  #### Returns number \| boolean

  - Defined in [Tone/event/ToneEvent.ts:351](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/ToneEvent.ts#L351)

- set loop(loop): void

- #### Parameters

  - loop: number \| boolean

  #### Returns void

  - Defined in [Tone/event/ToneEvent.ts:354](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/ToneEvent.ts#L354)

### loopEnd

- get loopEnd(): [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

- The loopEnd point is the time the event will loop if ToneEvent.loop is true.

  #### Returns [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  - Defined in [Tone/event/ToneEvent.ts:379](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/ToneEvent.ts#L379)

- set loopEnd(loopEnd): void

- #### Parameters

  - loopEnd: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Returns void

  - Defined in [Tone/event/ToneEvent.ts:382](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/ToneEvent.ts#L382)

### loopStart

- get loopStart(): [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

- The time when the loop should start.

  #### Returns [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  - Defined in [Tone/event/ToneEvent.ts:392](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/ToneEvent.ts#L392)

- set loopStart(loopStart): void

- #### Parameters

  - loopStart: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Returns void

  - Defined in [Tone/event/ToneEvent.ts:395](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/ToneEvent.ts#L395)

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

  - Defined in [Tone/event/ToneEvent.ts:367](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/ToneEvent.ts#L367)

- set playbackRate(rate): void

- #### Parameters

  - rate: number

  #### Returns void

  - Defined in [Tone/event/ToneEvent.ts:370](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/ToneEvent.ts#L370)

### probability

- get probability(): number

- The probability of the notes being triggered.

  #### Returns number

  - Defined in [Tone/event/ToneEvent.ts:239](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/ToneEvent.ts#L239)

- set probability(prob): void

- #### Parameters

  - prob: number

  #### Returns void

  - Defined in [Tone/event/ToneEvent.ts:242](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/ToneEvent.ts#L242)

### progress

- get progress(): number

- The current progress of the loop interval. Returns 0 if the event is not started yet or it is not set to loop.

  #### Returns number

  - Defined in [Tone/event/ToneEvent.ts:407](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/ToneEvent.ts#L407)

### sampleTime

- get sampleTime(): number

- The duration in seconds of one sample.

  #### Returns number

  Inherited from ToneWithContext.sampleTime

  - Defined in [Tone/core/context/ToneWithContext.ts:99](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L99)

### startOffset

- get startOffset(): number

- The start from the scheduled start time.

  #### Returns number

  - Defined in [Tone/event/ToneEvent.ts:229](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/ToneEvent.ts#L229)

- set startOffset(offset): void

- #### Parameters

  - offset: number

  #### Returns void

  - Defined in [Tone/event/ToneEvent.ts:232](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/ToneEvent.ts#L232)

### state

- get state(): [BasicPlaybackState](../types/BasicPlaybackState.md)

- Returns the playback state of the note, either "started" or "stopped".

  #### Returns [BasicPlaybackState](../types/BasicPlaybackState.md)

  - Defined in [Tone/event/ToneEvent.ts:220](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/ToneEvent.ts#L220)

## Methods

### cancel

- cancel(time?): this

- Cancel all scheduled events greater than or equal to the given time

  #### Parameters

  - `Optional` time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md) \| [TransportTimeClass](TransportTimeClass.md)<number>
    The time after which events will be cancel.

  #### Returns this

  - Defined in [Tone/event/ToneEvent.ts:302](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/ToneEvent.ts#L302)

### dispose

- dispose(): this

- #### Returns this

  Overrides ToneWithContext.dispose

  - Defined in [Tone/event/ToneEvent.ts:423](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/ToneEvent.ts#L423)

### get

- get(): [ToneEventOptions](../interfaces/ToneEventOptions.md)<[ValueType](ToneEvent.md#constructor.new_ToneEvent.ValueType-1)>

- Get the object's attributes.

  #### Returns [ToneEventOptions](../interfaces/ToneEventOptions.md)<[ValueType](ToneEvent.md#constructor.new_ToneEvent.ValueType-1)>

  #### Example

  ``` ts
  const osc = new Tone.Oscillator();
  console.log(osc.get());
  ```

  Inherited from ToneWithContext.get

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

  Inherited from ToneWithContext.immediate

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

  Inherited from ToneWithContext.now

  - Defined in [Tone/core/context/ToneWithContext.ts:81](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L81)

### set

- set(props): this

- Set multiple properties at once with an object.

  #### Parameters

  - props: RecursivePartial<[ToneEventOptions](../interfaces/ToneEventOptions.md)<[ValueType](ToneEvent.md#constructor.new_ToneEvent.ValueType-1)>>

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

  Inherited from ToneWithContext.set

  - Defined in [Tone/core/context/ToneWithContext.ts:215](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L215)

### start

- start(time?): this

- Start the note at the given time.

  #### Parameters

  - `Optional` time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md) \| [TransportTimeClass](TransportTimeClass.md)<number>
    When the event should start.

  #### Returns this

  - Defined in [Tone/event/ToneEvent.ts:266](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/ToneEvent.ts#L266)

### stop

- stop(time?): this

- Stop the Event at the given time.

  #### Parameters

  - `Optional` time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md) \| [TransportTimeClass](TransportTimeClass.md)<number>
    When the event should stop.

  #### Returns this

  - Defined in [Tone/event/ToneEvent.ts:283](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/ToneEvent.ts#L283)

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

  Inherited from ToneWithContext.toFrequency

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

  Inherited from ToneWithContext.toSeconds

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

  Inherited from ToneWithContext.toString

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

  Inherited from ToneWithContext.toTicks

  - Defined in [Tone/core/context/ToneWithContext.ts:142](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L142)

### `Static` getDefaults

- getDefaults(): [ToneEventOptions](../interfaces/ToneEventOptions.md)<any>

- #### Returns [ToneEventOptions](../interfaces/ToneEventOptions.md)<any>

  Overrides ToneWithContext.getDefaults

  - Defined in [Tone/event/ToneEvent.ts:149](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/ToneEvent.ts#L149)
