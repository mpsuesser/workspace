# Class Clock<TypeName>

A sample accurate clock which provides a callback at the given rate. While the callback is not sample-accurate (it is still susceptible to loose JS timing), the time passed in as the argument to the callback is precise. For most applications, it is better to use Tone.Transport instead of the Clock by itself since you can synchronize multiple callbacks.

#### Example

``` ts
// the callback will be invoked approximately once a second
// and will print the time exactly once a second apart.
const clock = new Tone.Clock(time => {
    console.log(time);
}, 1);
clock.start();
```

#### Type Parameters

- TypeName extends "bpm" \| "hertz" = "hertz"

#### Hierarchy

- ToneWithContext<ClockOptions>
  - Clock

#### Implements

- [Emitter](Emitter.md)<ClockEvent>

- Defined in [Tone/core/clock/Clock.ts:39](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/clock/Clock.ts#L39)

## Constructors

### constructor

- new Clock<[TypeName](Clock.md#constructor.new_Clock.TypeName-1)>(callback?, frequency?): [Clock](Clock.md)<[TypeName](Clock.md#constructor.new_Clock.TypeName-1)>

- #### Type Parameters

  - TypeName extends "bpm" \| "hertz" = "hertz"

  #### Parameters

  - `Optional` callback: ClockCallback
    The callback to be invoked with the time of the audio event
  - `Optional` frequency: [Unit](../modules/Unit.md).[Frequency](../types/Unit.Frequency.md)
    The rate of the callback

  #### Returns [Clock](Clock.md)<[TypeName](Clock.md#constructor.new_Clock.TypeName-1)>

  Overrides ToneWithContext<ClockOptions>.constructor

  - Defined in [Tone/core/clock/Clock.ts:80](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/clock/Clock.ts#L80)

- new Clock<[TypeName](Clock.md#constructor.new_Clock-1.TypeName-2)>(options): [Clock](Clock.md)<[TypeName](Clock.md#constructor.new_Clock.TypeName-1)>

- #### Type Parameters

  - TypeName extends "bpm" \| "hertz" = "hertz"

  #### Parameters

  - options: Partial<ClockOptions>

  #### Returns [Clock](Clock.md)<[TypeName](Clock.md#constructor.new_Clock.TypeName-1)>

  Overrides ToneWithContext<ClockOptions>.constructor

  - Defined in [Tone/core/clock/Clock.ts:81](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/clock/Clock.ts#L81)

## Properties

### callback

callback: ClockCallback = noOp

The callback function to invoke at the scheduled tick.

- Defined in [Tone/core/clock/Clock.ts:48](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/clock/Clock.ts#L48)

### `Readonly` context

context: [BaseContext](BaseContext.md)

The context belonging to the node.

Inherited from ToneWithContext.context

- Defined in [Tone/core/context/ToneWithContext.ts:40](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L40)

### debug

debug: boolean = false

Set this debug flag to log all events that happen in this class.

Implementation of [Emitter](Emitter.md).[debug](Emitter.md#debug)

Inherited from ToneWithContext.debug

- Defined in [Tone/core/Tone.ts:49](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L49)

### emit

emit: ((event, ...args) => this)

#### Type declaration

- - (event, ...args): this

  - #### Parameters

    - event: any
    - `Rest` ...args: any\[\]

    #### Returns this

Implementation of [Emitter](Emitter.md).[emit](Emitter.md#emit)

- Defined in [Tone/core/clock/Clock.ts:329](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/clock/Clock.ts#L329)

### frequency

frequency: TickSignal<[TypeName](Clock.md#constructor.new_Clock.TypeName-1)>

The rate the callback function should be invoked.

- Defined in [Tone/core/clock/Clock.ts:74](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/clock/Clock.ts#L74)

### `Readonly` name

name: string = "Clock"

Implementation of [Emitter](Emitter.md).[name](Emitter.md#name)

Overrides ToneWithContext.name

- Defined in [Tone/core/clock/Clock.ts:43](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/clock/Clock.ts#L43)

### off

off: ((event, callback?) => this)

#### Type declaration

- - (event, callback?): this

  - #### Parameters

    - event: ClockEvent
    - `Optional` callback: ((...args) => void)
      - - (...args): void

        - #### Parameters

          - `Rest` ...args: any\[\]

          #### Returns void

    #### Returns this

Implementation of [Emitter](Emitter.md).[off](Emitter.md#off)

- Defined in [Tone/core/clock/Clock.ts:325](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/clock/Clock.ts#L325)

### on

on: ((event, callback) => this)

#### Type declaration

- - (event, callback): this

  - #### Parameters

    - event: ClockEvent
    - callback: ((...args) => void)
      - - (...args): void

        - #### Parameters

          - `Rest` ...args: any\[\]

          #### Returns void

    #### Returns this

Implementation of [Emitter](Emitter.md).[on](Emitter.md#on)

- Defined in [Tone/core/clock/Clock.ts:323](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/clock/Clock.ts#L323)

### once

once: ((event, callback) => this)

#### Type declaration

- - (event, callback): this

  - #### Parameters

    - event: ClockEvent
    - callback: ((...args) => void)
      - - (...args): void

        - #### Parameters

          - `Rest` ...args: any\[\]

          #### Returns void

    #### Returns this

Implementation of [Emitter](Emitter.md).[once](Emitter.md#once)

- Defined in [Tone/core/clock/Clock.ts:324](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/clock/Clock.ts#L324)

### `Static` version

version: string = version

The version number semver

Implementation of [Emitter](Emitter.md).[version](Emitter.md#version)

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

  Implementation of Emitter.disposed

  Inherited from ToneWithContext.disposed

  - Defined in [Tone/core/Tone.ts:96](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L96)

### sampleTime

- get sampleTime(): number

- The duration in seconds of one sample.

  #### Returns number

  Inherited from ToneWithContext.sampleTime

  - Defined in [Tone/core/context/ToneWithContext.ts:99](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L99)

### seconds

- get seconds(): number

- The time since ticks=0 that the Clock has been running. Accounts for tempo curves

  #### Returns number

  - Defined in [Tone/core/clock/Clock.ts:196](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/clock/Clock.ts#L196)

- set seconds(s): void

- #### Parameters

  - s: number

  #### Returns void

  - Defined in [Tone/core/clock/Clock.ts:199](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/clock/Clock.ts#L199)

### state

- get state(): [PlaybackState](../types/PlaybackState.md)

- Returns the playback state of the source, either "started", "stopped" or "paused".

  #### Returns [PlaybackState](../types/PlaybackState.md)

  - Defined in [Tone/core/clock/Clock.ts:117](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/clock/Clock.ts#L117)

### ticks

- get ticks(): number

- The number of times the callback was invoked. Starts counting at 0 and increments after the callback was invoked.

  #### Returns number

  - Defined in [Tone/core/clock/Clock.ts:186](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/clock/Clock.ts#L186)

- set ticks(t): void

- #### Parameters

  - t: number

  #### Returns void

  - Defined in [Tone/core/clock/Clock.ts:189](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/clock/Clock.ts#L189)

## Methods

### dispose

- dispose(): this

- Clean up

  #### Returns this

  Implementation of [Emitter](Emitter.md).[dispose](Emitter.md#dispose)

  Overrides ToneWithContext.dispose

  - Defined in [Tone/core/clock/Clock.ts:311](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/clock/Clock.ts#L311)

### get

- get(): ClockOptions

- Get the object's attributes.

  #### Returns ClockOptions

  #### Example

  ``` ts
  const osc = new Tone.Oscillator();
  console.log(osc.get());
  ```

  Inherited from ToneWithContext.get

  - Defined in [Tone/core/context/ToneWithContext.ts:170](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L170)

### getSecondsAtTime

- getSecondsAtTime(time): number

- Return the elapsed seconds at the given time.

  #### Parameters

  - time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
    When to get the elapsed seconds

  #### Returns number

  The number of elapsed seconds

  - Defined in [Tone/core/clock/Clock.ts:208](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/clock/Clock.ts#L208)

### getStateAtTime

- getStateAtTime(time): [PlaybackState](../types/PlaybackState.md)

- Returns the scheduled state at the given time.

  #### Parameters

  - time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
    The time to query.

  #### Returns [PlaybackState](../types/PlaybackState.md)

  The name of the state input in setStateAtTime.

  #### Example

  ``` ts
  const clock = new Tone.Clock();
  clock.start("+0.1");
  clock.getStateAtTime("+0.1"); // returns "started"
  ```

  - Defined in [Tone/core/clock/Clock.ts:303](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/clock/Clock.ts#L303)

### getTicksAtTime

- getTicksAtTime(time?): number

- Get the clock's ticks at the given time.

  #### Parameters

  - `Optional` time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
    When to get the tick value

  #### Returns number

  The tick value at the given time.

  - Defined in [Tone/core/clock/Clock.ts:239](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/clock/Clock.ts#L239)

### getTimeOfTick

- getTimeOfTick(tick, before?): number

- Get the time of the given tick. The second argument is when to test before. Since ticks can be set (with setTicksAtTime) there may be multiple times for a given tick value.

  #### Parameters

  - tick: number
    The tick number.
  - before: number = ...
    When to measure the tick value from.

  #### Returns number

  The time of the tick

  - Defined in [Tone/core/clock/Clock.ts:230](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/clock/Clock.ts#L230)

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

### nextTickTime

- nextTickTime(offset, when): number

- Get the time of the next tick

  #### Parameters

  - offset: number
    The tick number.
  - when: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Returns number

  - Defined in [Tone/core/clock/Clock.ts:247](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/clock/Clock.ts#L247)

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

### pause

- pause(time?): this

- Pause the clock. Pausing does not reset the tick counter.

  #### Parameters

  - `Optional` time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
    The time when the clock should stop.

  #### Returns this

  - Defined in [Tone/core/clock/Clock.ts:170](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/clock/Clock.ts#L170)

### set

- set(props): this

- Set multiple properties at once with an object.

  #### Parameters

  - props: RecursivePartial<ClockOptions>

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

### setTicksAtTime

- setTicksAtTime(ticks, time): this

- Set the clock's ticks at the given time.

  #### Parameters

  - ticks: number
    The tick value to set
  - time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
    When to set the tick value

  #### Returns this

  - Defined in [Tone/core/clock/Clock.ts:217](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/clock/Clock.ts#L217)

### start

- start(time?, offset?): this

- Start the clock at the given time. Optionally pass in an offset of where to start the tick counter from.

  #### Parameters

  - `Optional` time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
    The time the clock should start
  - `Optional` offset: number
    Where the tick counter starts counting from.

  #### Returns this

  - Defined in [Tone/core/clock/Clock.ts:127](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/clock/Clock.ts#L127)

### stop

- stop(time?): this

- Stop the clock. Stopping the clock resets the tick counter to 0.

  #### Parameters

  - `Optional` time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
    The time when the clock should stop.

  #### Returns this

  #### Example

  ``` ts
  const clock = new Tone.Clock(time => {
      console.log(time);
  }, 1);
  clock.start();
  // stop the clock after 10 seconds
  clock.stop("+10");
  ```

  - Defined in [Tone/core/clock/Clock.ts:154](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/clock/Clock.ts#L154)

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

  Implementation of [Emitter](Emitter.md).[toString](Emitter.md#toString)

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

- getDefaults(): ClockOptions

- Returns all of the default options belonging to the class.

  #### Returns ClockOptions

  Overrides ToneWithContext.getDefaults

  - Defined in [Tone/core/clock/Clock.ts:106](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/clock/Clock.ts#L106)
