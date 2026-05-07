# Class TimeClass<Type, Unit>

TimeClass is a primitive type for encoding and decoding Time values. TimeClass can be passed into the parameter of any method which takes time as an argument.

#### Param: val

The time value.

#### Param: units

The units of the value.

#### Example

``` ts
const time = Tone.Time("4n"); // a quarter note
```

#### Type Parameters

- Type extends [Seconds](../types/Unit.Seconds.md) \| [Unit](../modules/Unit.md).[Ticks](../types/Unit.Ticks.md) = [Seconds](../types/Unit.Seconds.md)
- Unit extends string = TimeBaseUnit

#### Hierarchy ([view full](../hierarchy.md#TimeClass))

- TimeBaseClass<[Type](TimeClass.md#constructor.new_TimeClass.Type-1), [Unit](TimeClass.md#constructor.new_TimeClass.Unit-1)>
  - TimeClass
    - [FrequencyClass](FrequencyClass.md)
    - [TransportTimeClass](TransportTimeClass.md)

- Defined in [Tone/core/type/Time.ts:27](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/type/Time.ts#L27)

## Constructors

### constructor

- new TimeClass<[Type](TimeClass.md#constructor.new_TimeClass.Type-1), [Unit](TimeClass.md#constructor.new_TimeClass.Unit-1)>(context, value?, units?): [TimeClass](TimeClass.md)<[Type](TimeClass.md#constructor.new_TimeClass.Type-1), [Unit](TimeClass.md#constructor.new_TimeClass.Unit-1)>

- #### Type Parameters

  - Type extends number = number
  - Unit extends string = TimeBaseUnit

  #### Parameters

  - context: [BaseContext](BaseContext.md)
    The context associated with the time value. Used to compute Transport and context-relative timing.
  - `Optional` value: TimeValue
    The time value as a number, string or object
  - `Optional` units: [Unit](TimeClass.md#constructor.new_TimeClass.Unit-1)
    Unit values

  #### Returns [TimeClass](TimeClass.md)<[Type](TimeClass.md#constructor.new_TimeClass.Type-1), [Unit](TimeClass.md#constructor.new_TimeClass.Unit-1)>

  Inherited from TimeBaseClass<Type, Unit>.constructor

  - Defined in [Tone/core/type/TimeBase.ts:78](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/type/TimeBase.ts#L78)

## Properties

### `Readonly` context

context: [BaseContext](BaseContext.md)

Inherited from TimeBaseClass.context

- Defined in [Tone/core/type/TimeBase.ts:50](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/type/TimeBase.ts#L50)

### debug

debug: boolean = false

Set this debug flag to log all events that happen in this class.

Inherited from TimeBaseClass.debug

- Defined in [Tone/core/Tone.ts:49](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L49)

### `Readonly` defaultUnits

defaultUnits: [Unit](TimeClass.md#constructor.new_TimeClass.Unit-1) = ...

The default units

Inherited from TimeBaseClass.defaultUnits

- Defined in [Tone/core/type/TimeBase.ts:70](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/type/TimeBase.ts#L70)

### `Readonly` name

name: string = "TimeClass"

Overrides TimeBaseClass.name

- Defined in [Tone/core/type/Time.ts:31](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/type/Time.ts#L31)

### `Static` version

version: string = version

The version number semver

Inherited from TimeBaseClass.version

- Defined in [Tone/core/Tone.ts:28](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L28)

## Accessors

### disposed

- get disposed(): boolean

- Indicates if the instance was disposed. 'Disposing' an instance means that all of the Web Audio nodes that were created for the instance are disconnected and freed for garbage collection.

  #### Returns boolean

  Inherited from TimeBaseClass.disposed

  - Defined in [Tone/core/Tone.ts:96](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L96)

## Methods

### dispose

- dispose(): this

- disconnect and dispose.

  #### Returns this

  Inherited from TimeBaseClass.dispose

  - Defined in [Tone/core/Tone.ts:86](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L86)

### fromType

- fromType(type): this

- Coerce a time type into this units type.

  #### Parameters

  - type: TimeBaseClass<any, any>
    Any time type units

  #### Returns this

  Inherited from TimeBaseClass.fromType

  - Defined in [Tone/core/type/TimeBase.ts:304](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/type/TimeBase.ts#L304)

### quantize

- quantize(subdiv, percent?): [Type](TimeClass.md#constructor.new_TimeClass.Type-1)

- Quantize the time by the given subdivision. Optionally add a percentage which will move the time value towards the ideal quantized value by that percentage.

  #### Parameters

  - subdiv: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
    The subdivision to quantize to
  - percent: number = 1
    Move the time value towards the quantized value by a percentage.

  #### Returns [Type](TimeClass.md#constructor.new_TimeClass.Type-1)

  #### Example

  ``` ts
  Tone.Time(21).quantize(2); // returns 22
  Tone.Time(0.6).quantize("4n", 0.5); // returns 0.55
  ```

  - Defined in [Tone/core/type/Time.ts:70](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/type/Time.ts#L70)

### toBarsBeatsSixteenths

- toBarsBeatsSixteenths(): \`\${number}:\${number}:\${number}\`

- Return the time encoded as Bars:Beats:Sixteenths.

  #### Returns \`\${number}:\${number}:\${number}\`

  - Defined in [Tone/core/type/Time.ts:128](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/type/Time.ts#L128)

### toFrequency

- toFrequency(): number

- Return the value in hertz

  #### Returns number

  Inherited from TimeBaseClass.toFrequency

  - Defined in [Tone/core/type/TimeBase.ts:341](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/type/TimeBase.ts#L341)

### toMidi

- toMidi(): 0 \| 1 \| 2 \| 3 \| 4 \| 5 \| 6 \| 7 \| 8 \| 9 \| 10 \| 11 \| 12 \| 13 \| 14 \| 15 \| 16 \| 17 \| 18 \| 19 \| 20 \| 21 \| 22 \| 23 \| 24 \| 25 \| 26 \| 27 \| 28 \| 29 \| 30 \| 31 \| 32 \| 33 \| 34 \| 35 \| 36 \| 37 \| 38 \| 39 \| 40 \| 41 \| 42 \| 43 \| 44 \| 45 \| 46 \| 47 \| 48 \| 49 \| 50 \| 51 \| 52 \| 53 \| 54 \| 55 \| 56 \| 57 \| 58 \| 59 \| 60 \| 61 \| 62 \| 63 \| 64 \| 65 \| 66 \| 67 \| 68 \| 69 \| 70 \| 71 \| 72 \| 73 \| 74 \| 75 \| 76 \| 77 \| 78 \| 79 \| 80 \| 81 \| 82 \| 83 \| 84 \| 85 \| 86 \| 87 \| 88 \| 89 \| 90 \| 91 \| 92 \| 93 \| 94 \| 95 \| 96 \| 97 \| 98 \| 99 \| 100 \| 101 \| 102 \| 103 \| 104 \| 105 \| 106 \| 107 \| 108 \| 109 \| 110 \| 111 \| 112 \| 113 \| 114 \| 115 \| 116 \| 117 \| 118 \| 119 \| 120 \| 121 \| 122 \| 123 \| 124 \| 125 \| 126 \| 127

- Return the value as a midi note.

  #### Returns 0 \| 1 \| 2 \| 3 \| 4 \| 5 \| 6 \| 7 \| 8 \| 9 \| 10 \| 11 \| 12 \| 13 \| 14 \| 15 \| 16 \| 17 \| 18 \| 19 \| 20 \| 21 \| 22 \| 23 \| 24 \| 25 \| 26 \| 27 \| 28 \| 29 \| 30 \| 31 \| 32 \| 33 \| 34 \| 35 \| 36 \| 37 \| 38 \| 39 \| 40 \| 41 \| 42 \| 43 \| 44 \| 45 \| 46 \| 47 \| 48 \| 49 \| 50 \| 51 \| 52 \| 53 \| 54 \| 55 \| 56 \| 57 \| 58 \| 59 \| 60 \| 61 \| 62 \| 63 \| 64 \| 65 \| 66 \| 67 \| 68 \| 69 \| 70 \| 71 \| 72 \| 73 \| 74 \| 75 \| 76 \| 77 \| 78 \| 79 \| 80 \| 81 \| 82 \| 83 \| 84 \| 85 \| 86 \| 87 \| 88 \| 89 \| 90 \| 91 \| 92 \| 93 \| 94 \| 95 \| 96 \| 97 \| 98 \| 99 \| 100 \| 101 \| 102 \| 103 \| 104 \| 105 \| 106 \| 107 \| 108 \| 109 \| 110 \| 111 \| 112 \| 113 \| 114 \| 115 \| 116 \| 117 \| 118 \| 119 \| 120 \| 121 \| 122 \| 123 \| 124 \| 125 \| 126 \| 127

  Overrides TimeBaseClass.toMidi

  - Defined in [Tone/core/type/Time.ts:163](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/type/Time.ts#L163)

### toMilliseconds

- toMilliseconds(): number

- Return the time in milliseconds.

  #### Returns number

  Inherited from TimeBaseClass.toMilliseconds

  - Defined in [Tone/core/type/TimeBase.ts:355](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/type/TimeBase.ts#L355)

### toNotation

- toNotation(): [Subdivision](../types/Unit.Subdivision.md)

- Convert a Time to Notation. The notation values are will be the closest representation between 1m to 128th note.

  #### Returns [Subdivision](../types/Unit.Subdivision.md)

  #### Example

  ``` ts
  // if the Transport is at 120bpm:
  Tone.Time(2).toNotation(); // returns "1m"
  ```

  - Defined in [Tone/core/type/Time.ts:93](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/type/Time.ts#L93)

### toSamples

- toSamples(): number

- Return the time in samples

  #### Returns number

  Inherited from TimeBaseClass.toSamples

  - Defined in [Tone/core/type/TimeBase.ts:348](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/type/TimeBase.ts#L348)

### toSeconds

- toSeconds(): number

- Return the time in seconds.

  #### Returns number

  Overrides TimeBaseClass.toSeconds

  - Defined in [Tone/core/type/Time.ts:156](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/type/Time.ts#L156)

### toString

- toString(): string

- Convert the class to a string

  #### Returns string

  #### Example

  ``` ts
  const osc = new Tone.Oscillator();
  console.log(osc.toString());
  ```

  Inherited from TimeBaseClass.toString

  - Defined in [Tone/core/Tone.ts:106](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L106)

### toTicks

- toTicks(): number

- Return the time in ticks.

  #### Returns number

  Overrides TimeBaseClass.toTicks

  - Defined in [Tone/core/type/Time.ts:147](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/type/Time.ts#L147)

### valueOf

- valueOf(): [Type](TimeClass.md#constructor.new_TimeClass.Type-1)

- Evaluate the time value. Returns the time in seconds.

  #### Returns [Type](TimeClass.md#constructor.new_TimeClass.Type-1)

  Inherited from TimeBaseClass.valueOf

  - Defined in [Tone/core/type/TimeBase.ts:185](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/type/TimeBase.ts#L185)

### `Static` getDefaults

- getDefaults(): BaseToneOptions

- Returns all of the default options belonging to the class.

  #### Returns BaseToneOptions

  Inherited from TimeBaseClass.getDefaults

  - Defined in [Tone/core/Tone.ts:38](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L38)
