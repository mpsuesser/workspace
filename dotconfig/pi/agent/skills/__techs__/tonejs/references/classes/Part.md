# Class Part<ValueType>

Part is a collection ToneEvents which can be started/stopped and looped as a single unit.

#### Example

``` ts
const synth = new Tone.Synth().toDestination();
const part = new Tone.Part(((time, note) => {
    // the notes given as the second element in the array
    // will be passed in as the second argument
    synth.triggerAttackRelease(note, "8n", time);
}), [[0, "C2"], ["0:2", "C3"], ["0:3:2", "G2"]]).start(0);
Tone.Transport.start();
```

#### Example

``` ts
const synth = new Tone.Synth().toDestination();
// use an array of objects as long as the object has a "time" attribute
const part = new Tone.Part(((time, value) => {
    // the value is an object which contains both the note and the velocity
    synth.triggerAttackRelease(value.note, "8n", time, value.velocity);
}), [{ time: 0, note: "C3", velocity: 0.9 },
    { time: "0:2", note: "C4", velocity: 0.5 }
]).start(0);
Tone.Transport.start();
```

#### Type Parameters

- ValueType = any

#### Hierarchy ([view full](../hierarchy.md#Part))

- [ToneEvent](ToneEvent.md)<[ValueType](Part.md#constructor.new_Part.ValueType-1)>
  - Part

- Defined in [Tone/event/Part.ts:60](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Part.ts#L60)

## Constructors

### constructor

- new Part<[ValueType](Part.md#constructor.new_Part.ValueType-1)>(callback?, value?): [Part](Part.md)<[ValueType](Part.md#constructor.new_Part.ValueType-1)>

- #### Type Parameters

  - ValueType = any

  #### Parameters

  - `Optional` callback: [ToneEventCallback](../types/ToneEventCallback.md)<CallbackType<[ValueType](Part.md#constructor.new_Part.ValueType-1)>>
    The callback to invoke on each event
  - `Optional` value: [ValueType](Part.md#constructor.new_Part.ValueType-1)\[\]
    the array of events

  #### Returns [Part](Part.md)<[ValueType](Part.md#constructor.new_Part.ValueType-1)>

  Overrides [ToneEvent](ToneEvent.md).[constructor](ToneEvent.md#constructor)

  - Defined in [Tone/event/Part.ts:80](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Part.ts#L80)

- new Part<[ValueType](Part.md#constructor.new_Part-1.ValueType-2)>(options?): [Part](Part.md)<[ValueType](Part.md#constructor.new_Part.ValueType-1)>

- #### Type Parameters

  - ValueType = any

  #### Parameters

  - `Optional` options: Partial<PartOptions<[ValueType](Part.md#constructor.new_Part.ValueType-1)>>

  #### Returns [Part](Part.md)<[ValueType](Part.md#constructor.new_Part.ValueType-1)>

  Overrides [ToneEvent](ToneEvent.md).[constructor](ToneEvent.md#constructor)

  - Defined in [Tone/event/Part.ts:84](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Part.ts#L84)

## Properties

### callback

callback: [ToneEventCallback](../types/ToneEventCallback.md)<[ValueType](Part.md#constructor.new_Part.ValueType-1)>

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

name: string = "Part"

Overrides [ToneEvent](ToneEvent.md).[name](ToneEvent.md#name)

- Defined in [Tone/event/Part.ts:61](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Part.ts#L61)

### value

value: [ValueType](Part.md#constructor.new_Part.ValueType-1)

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

  - Defined in [Tone/event/Part.ts:411](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Part.ts#L411)

- set humanize(variation): void

- #### Parameters

  - variation: boolean \| [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Returns void

  Overrides ToneEvent.humanize

  - Defined in [Tone/event/Part.ts:414](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Part.ts#L414)

### length

- get length(): number

- The number of scheduled notes in the part.

  #### Returns number

  - Defined in [Tone/event/Part.ts:494](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Part.ts#L494)

### loop

- get loop(): number \| boolean

- If the part should loop or not between Part.loopStart and Part.loopEnd. If set to true, the part will loop indefinitely, if set to a number greater than 1 it will play a specific number of times, if set to false, 0 or 1, the part will only play once.

  #### Returns number \| boolean

  #### Example

  ``` ts
  const part = new Tone.Part();
  // loop the part 8 times
  part.loop = 8;
  ```

  Overrides ToneEvent.loop

  - Defined in [Tone/event/Part.ts:433](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Part.ts#L433)

- set loop(loop): void

- #### Parameters

  - loop: number \| boolean

  #### Returns void

  Overrides ToneEvent.loop

  - Defined in [Tone/event/Part.ts:436](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Part.ts#L436)

### loopEnd

- get loopEnd(): [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

- The loopEnd point determines when it will loop if Part.loop is true.

  #### Returns [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  Overrides ToneEvent.loopEnd

  - Defined in [Tone/event/Part.ts:450](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Part.ts#L450)

- set loopEnd(loopEnd): void

- #### Parameters

  - loopEnd: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Returns void

  Overrides ToneEvent.loopEnd

  - Defined in [Tone/event/Part.ts:453](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Part.ts#L453)

### loopStart

- get loopStart(): [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

- The loopStart point determines when it will loop if Part.loop is true.

  #### Returns [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  Overrides ToneEvent.loopStart

  - Defined in [Tone/event/Part.ts:467](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Part.ts#L467)

- set loopStart(loopStart): void

- #### Parameters

  - loopStart: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Returns void

  Overrides ToneEvent.loopStart

  - Defined in [Tone/event/Part.ts:470](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Part.ts#L470)

### playbackRate

- get playbackRate(): number

- The playback rate of the part

  #### Returns number

  Overrides ToneEvent.playbackRate

  - Defined in [Tone/event/Part.ts:483](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Part.ts#L483)

- set playbackRate(rate): void

- #### Parameters

  - rate: number

  #### Returns void

  Overrides ToneEvent.playbackRate

  - Defined in [Tone/event/Part.ts:486](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Part.ts#L486)

### probability

- get probability(): number

- The probability of the notes being triggered.

  #### Returns number

  Overrides ToneEvent.probability

  - Defined in [Tone/event/Part.ts:403](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Part.ts#L403)

- set probability(prob): void

- #### Parameters

  - prob: number

  #### Returns void

  Overrides ToneEvent.probability

  - Defined in [Tone/event/Part.ts:406](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Part.ts#L406)

### progress

- get progress(): number

- The current progress of the loop interval. Returns 0 if the event is not started yet or it is not set to loop.

  #### Returns number

  Inherited from ToneEvent.progress

  - Defined in [Tone/event/ToneEvent.ts:407](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/ToneEvent.ts#L407)

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

  - Defined in [Tone/event/Part.ts:170](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Part.ts#L170)

- set startOffset(offset): void

- #### Parameters

  - offset: number

  #### Returns void

  Overrides ToneEvent.startOffset

  - Defined in [Tone/event/Part.ts:173](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Part.ts#L173)

### state

- get state(): [BasicPlaybackState](../types/BasicPlaybackState.md)

- Returns the playback state of the note, either "started" or "stopped".

  #### Returns [BasicPlaybackState](../types/BasicPlaybackState.md)

  Inherited from ToneEvent.state

  - Defined in [Tone/event/ToneEvent.ts:220](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/ToneEvent.ts#L220)

## Methods

### add

- add(obj): this

- Add a an event to the part.

  #### Parameters

  - obj: {\
        time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md);\
        \[key: string\]: any;\
    }
    - ##### \[key: string\]: any

    - ##### time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Returns this

  #### Example

  ``` ts
  const part = new Tone.Part();
  part.add("1m", "C#+11");
  ```

  - Defined in [Tone/event/Part.ts:246](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Part.ts#L246)

- add(time, value?): this

- #### Parameters

  - time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
  - `Optional` value: any

  #### Returns this

  - Defined in [Tone/event/Part.ts:247](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Part.ts#L247)

### at

- at(time, value?): null \| [ToneEvent](ToneEvent.md)<any>

- Get/Set an Event's value at the given time. If a value is passed in and no event exists at the given time, one will be created with that value. If two events are at the same time, the first one will be returned.

  #### Parameters

  - time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
    The time of the event to get or set.
  - `Optional` value: any
    If a value is passed in, the value of the event at the given time will be set to it.

  #### Returns null \| [ToneEvent](ToneEvent.md)<any>

  #### Example

  ``` ts
  const part = new Tone.Part();
  part.at("1m"); // returns the part at the first measure
  part.at("2m", "C2"); // set the value at "2m" to C2.
  // if an event didn't exist at that time, it will be created.
  ```

  - Defined in [Tone/event/Part.ts:208](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Part.ts#L208)

### cancel

- cancel(after?): this

- Cancel scheduled state change events: i.e. "start" and "stop".

  #### Parameters

  - `Optional` after: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md) \| [TransportTimeClass](TransportTimeClass.md)<number>
    The time after which to cancel the scheduled events.

  #### Returns this

  Overrides [ToneEvent](ToneEvent.md).[cancel](ToneEvent.md#cancel)

  - Defined in [Tone/event/Part.ts:342](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Part.ts#L342)

### clear

- clear(): this

- Remove all of the notes from the group.

  #### Returns this

  - Defined in [Tone/event/Part.ts:332](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Part.ts#L332)

### dispose

- dispose(): this

- #### Returns this

  Overrides [ToneEvent](ToneEvent.md).[dispose](ToneEvent.md#dispose)

  - Defined in [Tone/event/Part.ts:498](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Part.ts#L498)

### get

- get(): [ToneEventOptions](../interfaces/ToneEventOptions.md)<[ValueType](Part.md#constructor.new_Part.ValueType-1)>

- Get the object's attributes.

  #### Returns [ToneEventOptions](../interfaces/ToneEventOptions.md)<[ValueType](Part.md#constructor.new_Part.ValueType-1)>

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

### remove

- remove(obj): this

- Remove an event from the part. If the event at that time is a Part, it will remove the entire part.

  #### Parameters

  - obj: {\
        time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md);\
        \[key: string\]: any;\
    }
    - ##### \[key: string\]: any

    - ##### time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Returns this

  - Defined in [Tone/event/Part.ts:306](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Part.ts#L306)

- remove(time, value?): this

- #### Parameters

  - time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
  - `Optional` value: any

  #### Returns this

  - Defined in [Tone/event/Part.ts:307](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Part.ts#L307)

### set

- set(props): this

- Set multiple properties at once with an object.

  #### Parameters

  - props: RecursivePartial<[ToneEventOptions](../interfaces/ToneEventOptions.md)<[ValueType](Part.md#constructor.new_Part.ValueType-1)>>

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
  - `Optional` offset: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
    The offset from the start of the part to begin playing at.

  #### Returns this

  Overrides [ToneEvent](ToneEvent.md).[start](ToneEvent.md#start)

  - Defined in [Tone/event/Part.ts:116](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Part.ts#L116)

### stop

- stop(time?): this

- Stop the part at the given time.

  #### Parameters

  - `Optional` time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
    When to stop the part.

  #### Returns this

  Overrides [ToneEvent](ToneEvent.md).[stop](ToneEvent.md#stop)

  - Defined in [Tone/event/Part.ts:184](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Part.ts#L184)

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

- getDefaults(): PartOptions<any>

- #### Returns PartOptions<any>

  Overrides [ToneEvent](ToneEvent.md).[getDefaults](ToneEvent.md#getDefaults)

  - Defined in [Tone/event/Part.ts:105](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Part.ts#L105)
