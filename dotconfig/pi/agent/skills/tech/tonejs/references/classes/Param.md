# Class Param<TypeName>

Param wraps the native Web Audio's AudioParam to provide additional unit conversion functionality. It also serves as a base-class for classes which have a single, automatable parameter.

#### Type Parameters

- TypeName extends [UnitName](../types/Unit.UnitName.md) = "number"

#### Hierarchy

- ToneWithContext<[ParamOptions](../interfaces/ParamOptions.md)<[TypeName](Param.md#constructor.new_Param.TypeName-1)>>
  - Param

#### Implements

- AbstractParam<[TypeName](Param.md#constructor.new_Param.TypeName-1)>

- Defined in [Tone/core/context/Param.ts:64](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Param.ts#L64)

## Constructors

### constructor

- new Param<[TypeName](Param.md#constructor.new_Param.TypeName-1)>(param, units?, convert?): [Param](Param.md)<[TypeName](Param.md#constructor.new_Param.TypeName-1)>

- #### Type Parameters

  - TypeName extends keyof [UnitMap](../interfaces/Unit.UnitMap.md) = "number"

  #### Parameters

  - param: AudioParam
    The AudioParam to wrap
  - `Optional` units: [TypeName](Param.md#constructor.new_Param.TypeName-1)
    The unit name
  - `Optional` convert: boolean
    Whether or not to convert the value to the target units

  #### Returns [Param](Param.md)<[TypeName](Param.md#constructor.new_Param.TypeName-1)>

  Overrides ToneWithContext<ParamOptions<TypeName>>.constructor

  - Defined in [Tone/core/context/Param.ts:113](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Param.ts#L113)

- new Param<[TypeName](Param.md#constructor.new_Param-1.TypeName-2)>(options): [Param](Param.md)<[TypeName](Param.md#constructor.new_Param.TypeName-1)>

- #### Type Parameters

  - TypeName extends keyof [UnitMap](../interfaces/Unit.UnitMap.md) = "number"

  #### Parameters

  - options: Partial<[ParamOptions](../interfaces/ParamOptions.md)<[TypeName](Param.md#constructor.new_Param.TypeName-1)>>

  #### Returns [Param](Param.md)<[TypeName](Param.md#constructor.new_Param.TypeName-1)>

  Overrides ToneWithContext<ParamOptions<TypeName>>.constructor

  - Defined in [Tone/core/context/Param.ts:114](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Param.ts#L114)

## Properties

### `Readonly` context

context: [BaseContext](BaseContext.md)

The context belonging to the node.

Inherited from ToneWithContext.context

- Defined in [Tone/core/context/ToneWithContext.ts:40](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L40)

### convert

convert: boolean

Implementation of AbstractParam.convert

- Defined in [Tone/core/context/Param.ts:73](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Param.ts#L73)

### debug

debug: boolean = false

Set this debug flag to log all events that happen in this class.

Inherited from ToneWithContext.debug

- Defined in [Tone/core/Tone.ts:49](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L49)

### `Readonly` input

input: AudioParam \| GainNode

- Defined in [Tone/core/context/Param.ts:70](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Param.ts#L70)

### `Readonly` name

name: string = "Param"

Overrides ToneWithContext.name

- Defined in [Tone/core/context/Param.ts:68](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Param.ts#L68)

### overridden

overridden: boolean = false

Implementation of AbstractParam.overridden

- Defined in [Tone/core/context/Param.ts:74](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Param.ts#L74)

### `Readonly` units

units: keyof [UnitMap](../interfaces/Unit.UnitMap.md)

Implementation of AbstractParam.units

- Defined in [Tone/core/context/Param.ts:72](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Param.ts#L72)

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

### defaultValue

- get defaultValue(): [UnitMap](../interfaces/Unit.UnitMap.md)\[[TypeName](Param.md#constructor.new_Param.TypeName-1)\]

- #### Returns [UnitMap](../interfaces/Unit.UnitMap.md)\[[TypeName](Param.md#constructor.new_Param.TypeName-1)\]

  - Defined in [Tone/core/context/Param.ts:669](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Param.ts#L669)

### disposed

- get disposed(): boolean

- Indicates if the instance was disposed. 'Disposing' an instance means that all of the Web Audio nodes that were created for the instance are disconnected and freed for garbage collection.

  #### Returns boolean

  Inherited from ToneWithContext.disposed

  - Defined in [Tone/core/Tone.ts:96](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L96)

### maxValue

- get maxValue(): number

- #### Returns number

  Implementation of AbstractParam.maxValue

  - Defined in [Tone/core/context/Param.ts:201](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Param.ts#L201)

### minValue

- get minValue(): number

- #### Returns number

  Implementation of AbstractParam.minValue

  - Defined in [Tone/core/context/Param.ts:176](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Param.ts#L176)

### sampleTime

- get sampleTime(): number

- The duration in seconds of one sample.

  #### Returns number

  Inherited from ToneWithContext.sampleTime

  - Defined in [Tone/core/context/ToneWithContext.ts:99](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L99)

### value

- get value(): [UnitMap](../interfaces/Unit.UnitMap.md)\[[TypeName](Param.md#constructor.new_Param.TypeName-1)\]

- #### Returns [UnitMap](../interfaces/Unit.UnitMap.md)\[[TypeName](Param.md#constructor.new_Param.TypeName-1)\]

  Implementation of AbstractParam.value

  - Defined in [Tone/core/context/Param.ts:167](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Param.ts#L167)

- set value(value): void

- #### Parameters

  - value: [UnitMap](../interfaces/Unit.UnitMap.md)\[[TypeName](Param.md#constructor.new_Param.TypeName-1)\]

  #### Returns void

  Implementation of AbstractParam.value

  - Defined in [Tone/core/context/Param.ts:171](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Param.ts#L171)

## Methods

### apply

- apply(param): this

- Apply all of the previously scheduled events to the passed in Param or AudioParam. The applied values will start at the context's current time and schedule all of the events which are scheduled on this Param onto the passed in param.

  #### Parameters

  - param: AudioParam \| [Param](Param.md)<"number">

  #### Returns this

  - Defined in [Tone/core/context/Param.ts:615](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Param.ts#L615)

### cancelAndHoldAtTime

- cancelAndHoldAtTime(time): this

- #### Parameters

  - time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Returns this

  Implementation of AbstractParam.cancelAndHoldAtTime

  - Defined in [Tone/core/context/Param.ts:537](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Param.ts#L537)

### cancelScheduledValues

- cancelScheduledValues(time): this

- #### Parameters

  - time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Returns this

  Implementation of AbstractParam.cancelScheduledValues

  - Defined in [Tone/core/context/Param.ts:525](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Param.ts#L525)

### dispose

- dispose(): this

- #### Returns this

  Overrides ToneWithContext.dispose

  - Defined in [Tone/core/context/Param.ts:663](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Param.ts#L663)

### exponentialApproachValueAtTime

- exponentialApproachValueAtTime(value, time, rampTime): this

- #### Parameters

  - value: [UnitMap](../interfaces/Unit.UnitMap.md)\[[TypeName](Param.md#constructor.new_Param.TypeName-1)\]
  - time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
  - rampTime: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Returns this

  Implementation of AbstractParam.exponentialApproachValueAtTime

  - Defined in [Tone/core/context/Param.ts:455](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Param.ts#L455)

### exponentialRampTo

- exponentialRampTo(value, rampTime, startTime?): this

- #### Parameters

  - value: [UnitMap](../interfaces/Unit.UnitMap.md)\[[TypeName](Param.md#constructor.new_Param.TypeName-1)\]
  - rampTime: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
  - `Optional` startTime: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Returns this

  Implementation of AbstractParam.exponentialRampTo

  - Defined in [Tone/core/context/Param.ts:416](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Param.ts#L416)

### exponentialRampToValueAtTime

- exponentialRampToValueAtTime(value, endTime): this

- #### Parameters

  - value: [UnitMap](../interfaces/Unit.UnitMap.md)\[[TypeName](Param.md#constructor.new_Param.TypeName-1)\]
  - endTime: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Returns this

  Implementation of AbstractParam.exponentialRampToValueAtTime

  - Defined in [Tone/core/context/Param.ts:387](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Param.ts#L387)

### get

- get(): [ParamOptions](../interfaces/ParamOptions.md)<[TypeName](Param.md#constructor.new_Param.TypeName-1)>

- Get the object's attributes.

  #### Returns [ParamOptions](../interfaces/ParamOptions.md)<[TypeName](Param.md#constructor.new_Param.TypeName-1)>

  #### Example

  ``` ts
  const osc = new Tone.Oscillator();
  console.log(osc.get());
  ```

  Inherited from ToneWithContext.get

  - Defined in [Tone/core/context/ToneWithContext.ts:170](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L170)

### getValueAtTime

- getValueAtTime(time): [UnitMap](../interfaces/Unit.UnitMap.md)\[[TypeName](Param.md#constructor.new_Param.TypeName-1)\]

- #### Parameters

  - time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Returns [UnitMap](../interfaces/Unit.UnitMap.md)\[[TypeName](Param.md#constructor.new_Param.TypeName-1)\]

  Implementation of AbstractParam.getValueAtTime

  - Defined in [Tone/core/context/Param.ts:292](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Param.ts#L292)

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

### linearRampTo

- linearRampTo(value, rampTime, startTime?): this

- #### Parameters

  - value: [UnitMap](../interfaces/Unit.UnitMap.md)\[[TypeName](Param.md#constructor.new_Param.TypeName-1)\]
  - rampTime: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
  - `Optional` startTime: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Returns this

  Implementation of AbstractParam.linearRampTo

  - Defined in [Tone/core/context/Param.ts:430](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Param.ts#L430)

### linearRampToValueAtTime

- linearRampToValueAtTime(value, endTime): this

- #### Parameters

  - value: [UnitMap](../interfaces/Unit.UnitMap.md)\[[TypeName](Param.md#constructor.new_Param.TypeName-1)\]
  - endTime: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Returns this

  Implementation of AbstractParam.linearRampToValueAtTime

  - Defined in [Tone/core/context/Param.ts:369](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Param.ts#L369)

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

### rampTo

- rampTo(value, rampTime?, startTime?): this

- #### Parameters

  - value: [UnitMap](../interfaces/Unit.UnitMap.md)\[[TypeName](Param.md#constructor.new_Param.TypeName-1)\]
  - rampTime: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md) = 0.1
  - `Optional` startTime: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Returns this

  Implementation of AbstractParam.rampTo

  - Defined in [Tone/core/context/Param.ts:593](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Param.ts#L593)

### set

- set(props): this

- Set multiple properties at once with an object.

  #### Parameters

  - props: RecursivePartial<[ParamOptions](../interfaces/ParamOptions.md)<[TypeName](Param.md#constructor.new_Param.TypeName-1)>>

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

### setParam

- setParam(param): this

- Replace the Param's internal AudioParam. Will apply scheduled curves onto the parameter and replace the connections.

  #### Parameters

  - param: AudioParam

  #### Returns this

  - Defined in [Tone/core/context/Param.ts:650](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Param.ts#L650)

### setRampPoint

- setRampPoint(time): this

- #### Parameters

  - time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Returns this

  Implementation of AbstractParam.setRampPoint

  - Defined in [Tone/core/context/Param.ts:358](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Param.ts#L358)

### setTargetAtTime

- setTargetAtTime(value, startTime, timeConstant): this

- #### Parameters

  - value: [UnitMap](../interfaces/Unit.UnitMap.md)\[[TypeName](Param.md#constructor.new_Param.TypeName-1)\]
  - startTime: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
  - timeConstant: number

  #### Returns this

  Implementation of AbstractParam.setTargetAtTime

  - Defined in [Tone/core/context/Param.ts:470](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Param.ts#L470)

### setValueAtTime

- setValueAtTime(value, time): this

- #### Parameters

  - value: [UnitMap](../interfaces/Unit.UnitMap.md)\[[TypeName](Param.md#constructor.new_Param.TypeName-1)\]
  - time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Returns this

  Implementation of AbstractParam.setValueAtTime

  - Defined in [Tone/core/context/Param.ts:274](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Param.ts#L274)

### setValueCurveAtTime

- setValueCurveAtTime(values, startTime, duration, scaling?): this

- #### Parameters

  - values: [UnitMap](../interfaces/Unit.UnitMap.md)\[[TypeName](Param.md#constructor.new_Param.TypeName-1)\]\[\]
  - startTime: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
  - duration: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
  - scaling: number = 1

  #### Returns this

  Implementation of AbstractParam.setValueCurveAtTime

  - Defined in [Tone/core/context/Param.ts:504](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Param.ts#L504)

### targetRampTo

- targetRampTo(value, rampTime, startTime?): this

- #### Parameters

  - value: [UnitMap](../interfaces/Unit.UnitMap.md)\[[TypeName](Param.md#constructor.new_Param.TypeName-1)\]
  - rampTime: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
  - `Optional` startTime: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Returns this

  Implementation of AbstractParam.targetRampTo

  - Defined in [Tone/core/context/Param.ts:444](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Param.ts#L444)

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

- getDefaults(): [ParamOptions](../interfaces/ParamOptions.md)<any>

- #### Returns [ParamOptions](../interfaces/ParamOptions.md)<any>

  Overrides ToneWithContext.getDefaults

  - Defined in [Tone/core/context/Param.ts:160](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Param.ts#L160)
