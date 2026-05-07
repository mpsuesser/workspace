# Class Loop<Options>

Loop creates a looped callback at the specified interval. The callback can be started, stopped and scheduled along the Transport's timeline.

#### Example

``` ts
const loop = new Tone.Loop((time) => {
    // triggered every eighth note.
    console.log(time);
}, "8n").start(0);
Tone.Transport.start();
```

#### Type Parameters

- Options extends [LoopOptions](../interfaces/LoopOptions.md) = [LoopOptions](../interfaces/LoopOptions.md)

#### Hierarchy ([view full](../hierarchy.md#Loop))

- ToneWithContext<[Options](Loop.md#constructor.new_Loop.Options-1)>
  - Loop
    - [Pattern](Pattern.md)

- Defined in [Tone/event/Loop.ts:40](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Loop.ts#L40)

## Constructors

### constructor

- new Loop<[Options](Loop.md#constructor.new_Loop.Options-1)>(callback?, interval?): [Loop](Loop.md)<[Options](Loop.md#constructor.new_Loop.Options-1)>

- #### Type Parameters

  - Options extends [LoopOptions](../interfaces/LoopOptions.md) = [LoopOptions](../interfaces/LoopOptions.md)

  #### Parameters

  - `Optional` callback: ((time) => void)
    The callback to invoke at the time.

    - - (time): void

      - #### Parameters

        - time: number

        #### Returns void
  - `Optional` interval: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
    The time between successive callback calls.

  #### Returns [Loop](Loop.md)<[Options](Loop.md#constructor.new_Loop.Options-1)>

  Overrides ToneWithContext<Options>.constructor

  - Defined in [Tone/event/Loop.ts:59](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Loop.ts#L59)

- new Loop<[Options](Loop.md#constructor.new_Loop-1.Options-2)>(options?): [Loop](Loop.md)<[Options](Loop.md#constructor.new_Loop.Options-1)>

- #### Type Parameters

  - Options extends [LoopOptions](../interfaces/LoopOptions.md) = [LoopOptions](../interfaces/LoopOptions.md)

  #### Parameters

  - `Optional` options: Partial<[LoopOptions](../interfaces/LoopOptions.md)>

  #### Returns [Loop](Loop.md)<[Options](Loop.md#constructor.new_Loop.Options-1)>

  Overrides ToneWithContext<Options>.constructor

  - Defined in [Tone/event/Loop.ts:60](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Loop.ts#L60)

## Properties

### callback

callback: ((time) => void)

The callback to invoke with the next event in the pattern

#### Type declaration

- - (time): void

  - #### Parameters

    - time: number

    #### Returns void

- Defined in [Tone/event/Loop.ts:53](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Loop.ts#L53)

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

### `Readonly` name

name: string = "Loop"

Overrides ToneWithContext.name

- Defined in [Tone/event/Loop.ts:43](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Loop.ts#L43)

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

- Random variation +/-0.01s to the scheduled time. Or give it a time value which it will randomize by.

  #### Returns boolean \| [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  - Defined in [Tone/event/Loop.ts:172](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Loop.ts#L172)

- set humanize(variation): void

- #### Parameters

  - variation: boolean \| [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Returns void

  - Defined in [Tone/event/Loop.ts:175](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Loop.ts#L175)

### interval

- get interval(): [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

- The time between successive callbacks.

  #### Returns [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Example

  ``` ts
  const loop = new Tone.Loop();
  loop.interval = "8n"; // loop every 8n
  ```

  - Defined in [Tone/event/Loop.ts:150](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Loop.ts#L150)

- set interval(interval): void

- #### Parameters

  - interval: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Returns void

  - Defined in [Tone/event/Loop.ts:153](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Loop.ts#L153)

### iterations

- get iterations(): number

- The number of iterations of the loop. The default value is `Infinity` (loop forever).

  #### Returns number

  - Defined in [Tone/event/Loop.ts:204](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Loop.ts#L204)

- set iterations(iters): void

- #### Parameters

  - iters: number

  #### Returns void

  - Defined in [Tone/event/Loop.ts:211](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Loop.ts#L211)

### mute

- get mute(): boolean

- Muting the Loop means that no callbacks are invoked.

  #### Returns boolean

  - Defined in [Tone/event/Loop.ts:193](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Loop.ts#L193)

- set mute(mute): void

- #### Parameters

  - mute: boolean

  #### Returns void

  - Defined in [Tone/event/Loop.ts:197](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Loop.ts#L197)

### playbackRate

- get playbackRate(): number

- The playback rate of the loop. The normal playback rate is 1 (no change). A `playbackRate` of 2 would be twice as fast.

  #### Returns number

  - Defined in [Tone/event/Loop.ts:161](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Loop.ts#L161)

- set playbackRate(rate): void

- #### Parameters

  - rate: number

  #### Returns void

  - Defined in [Tone/event/Loop.ts:164](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Loop.ts#L164)

### probability

- get probability(): number

- The probably of the callback being invoked.

  #### Returns number

  - Defined in [Tone/event/Loop.ts:182](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Loop.ts#L182)

- set probability(prob): void

- #### Parameters

  - prob: number

  #### Returns void

  - Defined in [Tone/event/Loop.ts:186](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Loop.ts#L186)

### progress

- get progress(): number

- The progress of the loop as a value between 0-1. 0, when the loop is stopped or done iterating.

  #### Returns number

  - Defined in [Tone/event/Loop.ts:140](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Loop.ts#L140)

### sampleTime

- get sampleTime(): number

- The duration in seconds of one sample.

  #### Returns number

  Inherited from ToneWithContext.sampleTime

  - Defined in [Tone/core/context/ToneWithContext.ts:99](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L99)

### state

- get state(): [BasicPlaybackState](../types/BasicPlaybackState.md)

- The state of the Loop, either started or stopped.

  #### Returns [BasicPlaybackState](../types/BasicPlaybackState.md)

  - Defined in [Tone/event/Loop.ts:133](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Loop.ts#L133)

## Methods

### cancel

- cancel(time?): this

- Cancel all scheduled events greater than or equal to the given time

  #### Parameters

  - `Optional` time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
    The time after which events will be cancel.

  #### Returns this

  - Defined in [Tone/event/Loop.ts:117](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Loop.ts#L117)

### dispose

- dispose(): this

- #### Returns this

  Overrides ToneWithContext.dispose

  - Defined in [Tone/event/Loop.ts:219](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Loop.ts#L219)

### get

- get(): [Options](Loop.md#constructor.new_Loop.Options-1)

- Get the object's attributes.

  #### Returns [Options](Loop.md#constructor.new_Loop.Options-1)

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

  - props: RecursivePartial<[Options](Loop.md#constructor.new_Loop.Options-1)>

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

- Start the loop at the specified time along the Transport's timeline.

  #### Parameters

  - `Optional` time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
    When to start the Loop.

  #### Returns this

  - Defined in [Tone/event/Loop.ts:99](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Loop.ts#L99)

### stop

- stop(time?): this

- Stop the loop at the given time.

  #### Parameters

  - `Optional` time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
    When to stop the Loop.

  #### Returns this

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

- getDefaults(): [LoopOptions](../interfaces/LoopOptions.md)

- #### Returns [LoopOptions](../interfaces/LoopOptions.md)

  Overrides ToneWithContext.getDefaults

  - Defined in [Tone/event/Loop.ts:83](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Loop.ts#L83)
