# Class FrequencyClass<Type>

Frequency is a primitive type for encoding Frequency values. Eventually all time values are evaluated to hertz using the `valueOf` method.

#### Example

``` ts
Tone.Frequency("C3"); // 261
Tone.Frequency(38, "midi");
Tone.Frequency("C3").transpose(4);
```

#### Type Parameters

- Type extends number = [Hertz](../types/Unit.Hertz.md)

#### Hierarchy ([view full](../hierarchy.md#FrequencyClass))

- [TimeClass](TimeClass.md)<[Type](FrequencyClass.md#constructor.new_FrequencyClass.Type-1), [FrequencyUnit](../types/FrequencyUnit.md)>
  - FrequencyClass
    - [MidiClass](MidiClass.md)

- Defined in [Tone/core/type/Frequency.ts:28](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/type/Frequency.ts#L28)

## Constructors

### constructor

- new FrequencyClass<[Type](FrequencyClass.md#constructor.new_FrequencyClass.Type-1)>(context, value?, units?): [FrequencyClass](FrequencyClass.md)<[Type](FrequencyClass.md#constructor.new_FrequencyClass.Type-1)>

- #### Type Parameters

  - Type extends number = number

  #### Parameters

  - context: [BaseContext](BaseContext.md)
    The context associated with the time value. Used to compute Transport and context-relative timing.
  - `Optional` value: TimeValue
    The time value as a number, string or object
  - `Optional` units: [FrequencyUnit](../types/FrequencyUnit.md)
    Unit values

  #### Returns [FrequencyClass](FrequencyClass.md)<[Type](FrequencyClass.md#constructor.new_FrequencyClass.Type-1)>

  Inherited from [TimeClass](TimeClass.md).[constructor](TimeClass.md#constructor)

  - Defined in [Tone/core/type/TimeBase.ts:78](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/type/TimeBase.ts#L78)

## Properties

### `Readonly` context

context: [BaseContext](BaseContext.md)

Inherited from [TimeClass](TimeClass.md).[context](TimeClass.md#context)

- Defined in [Tone/core/type/TimeBase.ts:50](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/type/TimeBase.ts#L50)

### debug

debug: boolean = false

Set this debug flag to log all events that happen in this class.

Inherited from [TimeClass](TimeClass.md).[debug](TimeClass.md#debug)

- Defined in [Tone/core/Tone.ts:49](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L49)

### `Readonly` defaultUnits

defaultUnits: [FrequencyUnit](../types/FrequencyUnit.md) = "hz"

The default units

Overrides [TimeClass](TimeClass.md).[defaultUnits](TimeClass.md#defaultUnits)

- Defined in [Tone/core/type/Frequency.ts:34](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/type/Frequency.ts#L34)

### `Readonly` name

name: string = "Frequency"

Overrides [TimeClass](TimeClass.md).[name](TimeClass.md#name)

- Defined in [Tone/core/type/Frequency.ts:32](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/type/Frequency.ts#L32)

### `Static` version

version: string = version

The version number semver

Inherited from [TimeClass](TimeClass.md).[version](TimeClass.md#version)

- Defined in [Tone/core/Tone.ts:28](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L28)

## Accessors

### disposed

- get disposed(): boolean

- Indicates if the instance was disposed. 'Disposing' an instance means that all of the Web Audio nodes that were created for the instance are disconnected and freed for garbage collection.

  #### Returns boolean

  Inherited from TimeClass.disposed

  - Defined in [Tone/core/Tone.ts:96](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L96)

### `Static` A4

- get A4(): number

- The [concert tuning pitch](https://en.wikipedia.org/wiki/Concert_pitch) which is used to generate all the other pitch values from notes. A4's values in Hertz.

  #### Returns number

  - Defined in [Tone/core/type/Frequency.ts:40](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/type/Frequency.ts#L40)

- set A4(freq): void

- #### Parameters

  - freq: number

  #### Returns void

  - Defined in [Tone/core/type/Frequency.ts:43](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/type/Frequency.ts#L43)

## Methods

### dispose

- dispose(): this

- disconnect and dispose.

  #### Returns this

  Inherited from [TimeClass](TimeClass.md).[dispose](TimeClass.md#dispose)

  - Defined in [Tone/core/Tone.ts:86](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L86)

### fromType

- fromType(type): this

- Coerce a time type into this units type.

  #### Parameters

  - type: TimeBaseClass<any, any>
    Any time type units

  #### Returns this

  Inherited from [TimeClass](TimeClass.md).[fromType](TimeClass.md#fromType)

  - Defined in [Tone/core/type/TimeBase.ts:304](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/type/TimeBase.ts#L304)

### harmonize

- harmonize(intervals): [FrequencyClass](FrequencyClass.md)<number>\[\]

- Takes an array of semitone intervals and returns an array of frequencies transposed by those intervals.

  #### Parameters

  - intervals: number\[\]

  #### Returns [FrequencyClass](FrequencyClass.md)<number>\[\]

  Returns an array of Frequencies

  #### Example

  ``` ts
  Tone.Frequency("A4").harmonize([0, 3, 7]); // ["A4", "C5", "E5"]
  ```

  - Defined in [Tone/core/type/Frequency.ts:120](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/type/Frequency.ts#L120)

### quantize

- quantize(subdiv, percent?): [Type](FrequencyClass.md#constructor.new_FrequencyClass.Type-1)

- Quantize the time by the given subdivision. Optionally add a percentage which will move the time value towards the ideal quantized value by that percentage.

  #### Parameters

  - subdiv: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
    The subdivision to quantize to
  - percent: number = 1
    Move the time value towards the quantized value by a percentage.

  #### Returns [Type](FrequencyClass.md#constructor.new_FrequencyClass.Type-1)

  #### Example

  ``` ts
  Tone.Time(21).quantize(2); // returns 22
  Tone.Time(0.6).quantize("4n", 0.5); // returns 0.55
  ```

  Inherited from [TimeClass](TimeClass.md).[quantize](TimeClass.md#quantize)

  - Defined in [Tone/core/type/Time.ts:70](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/type/Time.ts#L70)

### toBarsBeatsSixteenths

- toBarsBeatsSixteenths(): \`\${number}:\${number}:\${number}\`

- Return the time encoded as Bars:Beats:Sixteenths.

  #### Returns \`\${number}:\${number}:\${number}\`

  Inherited from [TimeClass](TimeClass.md).[toBarsBeatsSixteenths](TimeClass.md#toBarsBeatsSixteenths)

  - Defined in [Tone/core/type/Time.ts:128](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/type/Time.ts#L128)

### toFrequency

- toFrequency(): number

- Return the value in hertz

  #### Returns number

  Inherited from [TimeClass](TimeClass.md).[toFrequency](TimeClass.md#toFrequency)

  - Defined in [Tone/core/type/TimeBase.ts:341](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/type/TimeBase.ts#L341)

### toMidi

- toMidi(): 0 \| 1 \| 2 \| 3 \| 4 \| 5 \| 6 \| 7 \| 8 \| 9 \| 10 \| 11 \| 12 \| 13 \| 14 \| 15 \| 16 \| 17 \| 18 \| 19 \| 20 \| 21 \| 22 \| 23 \| 24 \| 25 \| 26 \| 27 \| 28 \| 29 \| 30 \| 31 \| 32 \| 33 \| 34 \| 35 \| 36 \| 37 \| 38 \| 39 \| 40 \| 41 \| 42 \| 43 \| 44 \| 45 \| 46 \| 47 \| 48 \| 49 \| 50 \| 51 \| 52 \| 53 \| 54 \| 55 \| 56 \| 57 \| 58 \| 59 \| 60 \| 61 \| 62 \| 63 \| 64 \| 65 \| 66 \| 67 \| 68 \| 69 \| 70 \| 71 \| 72 \| 73 \| 74 \| 75 \| 76 \| 77 \| 78 \| 79 \| 80 \| 81 \| 82 \| 83 \| 84 \| 85 \| 86 \| 87 \| 88 \| 89 \| 90 \| 91 \| 92 \| 93 \| 94 \| 95 \| 96 \| 97 \| 98 \| 99 \| 100 \| 101 \| 102 \| 103 \| 104 \| 105 \| 106 \| 107 \| 108 \| 109 \| 110 \| 111 \| 112 \| 113 \| 114 \| 115 \| 116 \| 117 \| 118 \| 119 \| 120 \| 121 \| 122 \| 123 \| 124 \| 125 \| 126 \| 127

- Return the value of the frequency as a MIDI note

  #### Returns 0 \| 1 \| 2 \| 3 \| 4 \| 5 \| 6 \| 7 \| 8 \| 9 \| 10 \| 11 \| 12 \| 13 \| 14 \| 15 \| 16 \| 17 \| 18 \| 19 \| 20 \| 21 \| 22 \| 23 \| 24 \| 25 \| 26 \| 27 \| 28 \| 29 \| 30 \| 31 \| 32 \| 33 \| 34 \| 35 \| 36 \| 37 \| 38 \| 39 \| 40 \| 41 \| 42 \| 43 \| 44 \| 45 \| 46 \| 47 \| 48 \| 49 \| 50 \| 51 \| 52 \| 53 \| 54 \| 55 \| 56 \| 57 \| 58 \| 59 \| 60 \| 61 \| 62 \| 63 \| 64 \| 65 \| 66 \| 67 \| 68 \| 69 \| 70 \| 71 \| 72 \| 73 \| 74 \| 75 \| 76 \| 77 \| 78 \| 79 \| 80 \| 81 \| 82 \| 83 \| 84 \| 85 \| 86 \| 87 \| 88 \| 89 \| 90 \| 91 \| 92 \| 93 \| 94 \| 95 \| 96 \| 97 \| 98 \| 99 \| 100 \| 101 \| 102 \| 103 \| 104 \| 105 \| 106 \| 107 \| 108 \| 109 \| 110 \| 111 \| 112 \| 113 \| 114 \| 115 \| 116 \| 117 \| 118 \| 119 \| 120 \| 121 \| 122 \| 123 \| 124 \| 125 \| 126 \| 127

  #### Example

  ``` ts
  Tone.Frequency("C4").toMidi(); // 60
  ```

  Overrides [TimeClass](TimeClass.md).[toMidi](TimeClass.md#toMidi)

  - Defined in [Tone/core/type/Frequency.ts:135](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/type/Frequency.ts#L135)

### toMilliseconds

- toMilliseconds(): number

- Return the time in milliseconds.

  #### Returns number

  Inherited from [TimeClass](TimeClass.md).[toMilliseconds](TimeClass.md#toMilliseconds)

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

  Inherited from [TimeClass](TimeClass.md).[toNotation](TimeClass.md#toNotation)

  - Defined in [Tone/core/type/Time.ts:93](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/type/Time.ts#L93)

### toNote

- toNote(): "C0" \| "C4" \| "C-4" \| "C3" \| "C-3" \| "C2" \| "C-2" \| "C1" \| "C-1" \| "C5" \| "C6" \| "C7" \| "C8" \| "C9" \| "C10" \| "C11" \| "Cbb0" \| "Cbb4" \| "Cbb-4" \| "Cbb3" \| "Cbb-3" \| "Cbb2" \| "Cbb-2" \| "Cbb1" \| "Cbb-1" \| "Cbb5" \| "Cbb6" \| "Cbb7" \| "Cbb8" \| "Cbb9" \| "Cbb10" \| "Cbb11" \| "Cb0" \| "Cb4" \| "Cb-4" \| "Cb3" \| "Cb-3" \| "Cb2" \| "Cb-2" \| "Cb1" \| "Cb-1" \| "Cb5" \| "Cb6" \| "Cb7" \| "Cb8" \| "Cb9" \| "Cb10" \| "Cb11" \| "C#0" \| "C#4" \| "C#-4" \| "C#3" \| "C#-3" \| "C#2" \| "C#-2" \| "C#1" \| "C#-1" \| "C#5" \| "C#6" \| "C#7" \| "C#8" \| "C#9" \| "C#10" \| "C#11" \| "Cx0" \| "Cx4" \| "Cx-4" \| "Cx3" \| "Cx-3" \| "Cx2" \| "Cx-2" \| "Cx1" \| "Cx-1" \| "Cx5" \| "Cx6" \| "Cx7" \| "Cx8" \| "Cx9" \| "Cx10" \| "Cx11" \| "D0" \| "D4" \| "D-4" \| "D3" \| "D-3" \| "D2" \| "D-2" \| "D1" \| "D-1" \| "D5" \| "D6" \| "D7" \| "D8" \| "D9" \| "D10" \| "D11" \| "Dbb0" \| "Dbb4" \| "Dbb-4" \| "Dbb3" \| "Dbb-3" \| "Dbb2" \| "Dbb-2" \| "Dbb1" \| "Dbb-1" \| "Dbb5" \| "Dbb6" \| "Dbb7" \| "Dbb8" \| "Dbb9" \| "Dbb10" \| "Dbb11" \| "Db0" \| "Db4" \| "Db-4" \| "Db3" \| "Db-3" \| "Db2" \| "Db-2" \| "Db1" \| "Db-1" \| "Db5" \| "Db6" \| "Db7" \| "Db8" \| "Db9" \| "Db10" \| "Db11" \| "D#0" \| "D#4" \| "D#-4" \| "D#3" \| "D#-3" \| "D#2" \| "D#-2" \| "D#1" \| "D#-1" \| "D#5" \| "D#6" \| "D#7" \| "D#8" \| "D#9" \| "D#10" \| "D#11" \| "Dx0" \| "Dx4" \| "Dx-4" \| "Dx3" \| "Dx-3" \| "Dx2" \| "Dx-2" \| "Dx1" \| "Dx-1" \| "Dx5" \| "Dx6" \| "Dx7" \| "Dx8" \| "Dx9" \| "Dx10" \| "Dx11" \| "E0" \| "E4" \| "E-4" \| "E3" \| "E-3" \| "E2" \| "E-2" \| "E1" \| "E-1" \| "E5" \| "E6" \| "E7" \| "E8" \| "E9" \| "E10" \| "E11" \| "Ebb0" \| "Ebb4" \| "Ebb-4" \| "Ebb3" \| "Ebb-3" \| "Ebb2" \| "Ebb-2" \| "Ebb1" \| "Ebb-1" \| "Ebb5" \| "Ebb6" \| "Ebb7" \| "Ebb8" \| "Ebb9" \| "Ebb10" \| "Ebb11" \| "Eb0" \| "Eb4" \| "Eb-4" \| "Eb3" \| "Eb-3" \| "Eb2" \| "Eb-2" \| "Eb1" \| "Eb-1" \| "Eb5" \| "Eb6" \| "Eb7" \| "Eb8" \| "Eb9" \| "Eb10" \| "Eb11" \| "E#0" \| "E#4" \| "E#-4" \| "E#3" \| "E#-3" \| "E#2" \| "E#-2" \| "E#1" \| "E#-1" \| "E#5" \| "E#6" \| "E#7" \| "E#8" \| "E#9" \| "E#10" \| "E#11" \| "Ex0" \| "Ex4" \| "Ex-4" \| "Ex3" \| "Ex-3" \| "Ex2" \| "Ex-2" \| "Ex1" \| "Ex-1" \| "Ex5" \| "Ex6" \| "Ex7" \| "Ex8" \| "Ex9" \| "Ex10" \| "Ex11" \| "F0" \| "F4" \| "F-4" \| "F3" \| "F-3" \| "F2" \| "F-2" \| "F1" \| "F-1" \| "F5" \| "F6" \| "F7" \| "F8" \| "F9" \| "F10" \| "F11" \| "Fbb0" \| "Fbb4" \| "Fbb-4" \| "Fbb3" \| "Fbb-3" \| "Fbb2" \| "Fbb-2" \| "Fbb1" \| "Fbb-1" \| "Fbb5" \| "Fbb6" \| "Fbb7" \| "Fbb8" \| "Fbb9" \| "Fbb10" \| "Fbb11" \| "Fb0" \| "Fb4" \| "Fb-4" \| "Fb3" \| "Fb-3" \| "Fb2" \| "Fb-2" \| "Fb1" \| "Fb-1" \| "Fb5" \| "Fb6" \| "Fb7" \| "Fb8" \| "Fb9" \| "Fb10" \| "Fb11" \| "F#0" \| "F#4" \| "F#-4" \| "F#3" \| "F#-3" \| "F#2" \| "F#-2" \| "F#1" \| "F#-1" \| "F#5" \| "F#6" \| "F#7" \| "F#8" \| "F#9" \| "F#10" \| "F#11" \| "Fx0" \| "Fx4" \| "Fx-4" \| "Fx3" \| "Fx-3" \| "Fx2" \| "Fx-2" \| "Fx1" \| "Fx-1" \| "Fx5" \| "Fx6" \| "Fx7" \| "Fx8" \| "Fx9" \| "Fx10" \| "Fx11" \| "G0" \| "G4" \| "G-4" \| "G3" \| "G-3" \| "G2" \| "G-2" \| "G1" \| "G-1" \| "G5" \| "G6" \| "G7" \| "G8" \| "G9" \| "G10" \| "G11" \| "Gbb0" \| "Gbb4" \| "Gbb-4" \| "Gbb3" \| "Gbb-3" \| "Gbb2" \| "Gbb-2" \| "Gbb1" \| "Gbb-1" \| "Gbb5" \| "Gbb6" \| "Gbb7" \| "Gbb8" \| "Gbb9" \| "Gbb10" \| "Gbb11" \| "Gb0" \| "Gb4" \| "Gb-4" \| "Gb3" \| "Gb-3" \| "Gb2" \| "Gb-2" \| "Gb1" \| "Gb-1" \| "Gb5" \| "Gb6" \| "Gb7" \| "Gb8" \| "Gb9" \| "Gb10" \| "Gb11" \| "G#0" \| "G#4" \| "G#-4" \| "G#3" \| "G#-3" \| "G#2" \| "G#-2" \| "G#1" \| "G#-1" \| "G#5" \| "G#6" \| "G#7" \| "G#8" \| "G#9" \| "G#10" \| "G#11" \| "Gx0" \| "Gx4" \| "Gx-4" \| "Gx3" \| "Gx-3" \| "Gx2" \| "Gx-2" \| "Gx1" \| "Gx-1" \| "Gx5" \| "Gx6" \| "Gx7" \| "Gx8" \| "Gx9" \| "Gx10" \| "Gx11" \| "A0" \| "A4" \| "A-4" \| "A3" \| "A-3" \| "A2" \| "A-2" \| "A1" \| "A-1" \| "A5" \| "A6" \| "A7" \| "A8" \| "A9" \| "A10" \| "A11" \| "Abb0" \| "Abb4" \| "Abb-4" \| "Abb3" \| "Abb-3" \| "Abb2" \| "Abb-2" \| "Abb1" \| "Abb-1" \| "Abb5" \| "Abb6" \| "Abb7" \| "Abb8" \| "Abb9" \| "Abb10" \| "Abb11" \| "Ab0" \| "Ab4" \| "Ab-4" \| "Ab3" \| "Ab-3" \| "Ab2" \| "Ab-2" \| "Ab1" \| "Ab-1" \| "Ab5" \| "Ab6" \| "Ab7" \| "Ab8" \| "Ab9" \| "Ab10" \| "Ab11" \| "A#0" \| "A#4" \| "A#-4" \| "A#3" \| "A#-3" \| "A#2" \| "A#-2" \| "A#1" \| "A#-1" \| "A#5" \| "A#6" \| "A#7" \| "A#8" \| "A#9" \| "A#10" \| "A#11" \| "Ax0" \| "Ax4" \| "Ax-4" \| "Ax3" \| "Ax-3" \| "Ax2" \| "Ax-2" \| "Ax1" \| "Ax-1" \| "Ax5" \| "Ax6" \| "Ax7" \| "Ax8" \| "Ax9" \| "Ax10" \| "Ax11" \| "B0" \| "B4" \| "B-4" \| "B3" \| "B-3" \| "B2" \| "B-2" \| "B1" \| "B-1" \| "B5" \| "B6" \| "B7" \| "B8" \| "B9" \| "B10" \| "B11" \| "Bbb0" \| "Bbb4" \| "Bbb-4" \| "Bbb3" \| "Bbb-3" \| "Bbb2" \| "Bbb-2" \| "Bbb1" \| "Bbb-1" \| "Bbb5" \| "Bbb6" \| "Bbb7" \| "Bbb8" \| "Bbb9" \| "Bbb10" \| "Bbb11" \| "Bb0" \| "Bb4" \| "Bb-4" \| "Bb3" \| "Bb-3" \| "Bb2" \| "Bb-2" \| "Bb1" \| "Bb-1" \| "Bb5" \| "Bb6" \| "Bb7" \| "Bb8" \| "Bb9" \| "Bb10" \| "Bb11" \| "B#0" \| "B#4" \| "B#-4" \| "B#3" \| "B#-3" \| "B#2" \| "B#-2" \| "B#1" \| "B#-1" \| "B#5" \| "B#6" \| "B#7" \| "B#8" \| "B#9" \| "B#10" \| "B#11" \| "Bx0" \| "Bx4" \| "Bx-4" \| "Bx3" \| "Bx-3" \| "Bx2" \| "Bx-2" \| "Bx1" \| "Bx-1" \| "Bx5" \| "Bx6" \| "Bx7" \| "Bx8" \| "Bx9" \| "Bx10" \| "Bx11"

- Return the value of the frequency in Scientific Pitch Notation

  #### Returns "C0" \| "C4" \| "C-4" \| "C3" \| "C-3" \| "C2" \| "C-2" \| "C1" \| "C-1" \| "C5" \| "C6" \| "C7" \| "C8" \| "C9" \| "C10" \| "C11" \| "Cbb0" \| "Cbb4" \| "Cbb-4" \| "Cbb3" \| "Cbb-3" \| "Cbb2" \| "Cbb-2" \| "Cbb1" \| "Cbb-1" \| "Cbb5" \| "Cbb6" \| "Cbb7" \| "Cbb8" \| "Cbb9" \| "Cbb10" \| "Cbb11" \| "Cb0" \| "Cb4" \| "Cb-4" \| "Cb3" \| "Cb-3" \| "Cb2" \| "Cb-2" \| "Cb1" \| "Cb-1" \| "Cb5" \| "Cb6" \| "Cb7" \| "Cb8" \| "Cb9" \| "Cb10" \| "Cb11" \| "C#0" \| "C#4" \| "C#-4" \| "C#3" \| "C#-3" \| "C#2" \| "C#-2" \| "C#1" \| "C#-1" \| "C#5" \| "C#6" \| "C#7" \| "C#8" \| "C#9" \| "C#10" \| "C#11" \| "Cx0" \| "Cx4" \| "Cx-4" \| "Cx3" \| "Cx-3" \| "Cx2" \| "Cx-2" \| "Cx1" \| "Cx-1" \| "Cx5" \| "Cx6" \| "Cx7" \| "Cx8" \| "Cx9" \| "Cx10" \| "Cx11" \| "D0" \| "D4" \| "D-4" \| "D3" \| "D-3" \| "D2" \| "D-2" \| "D1" \| "D-1" \| "D5" \| "D6" \| "D7" \| "D8" \| "D9" \| "D10" \| "D11" \| "Dbb0" \| "Dbb4" \| "Dbb-4" \| "Dbb3" \| "Dbb-3" \| "Dbb2" \| "Dbb-2" \| "Dbb1" \| "Dbb-1" \| "Dbb5" \| "Dbb6" \| "Dbb7" \| "Dbb8" \| "Dbb9" \| "Dbb10" \| "Dbb11" \| "Db0" \| "Db4" \| "Db-4" \| "Db3" \| "Db-3" \| "Db2" \| "Db-2" \| "Db1" \| "Db-1" \| "Db5" \| "Db6" \| "Db7" \| "Db8" \| "Db9" \| "Db10" \| "Db11" \| "D#0" \| "D#4" \| "D#-4" \| "D#3" \| "D#-3" \| "D#2" \| "D#-2" \| "D#1" \| "D#-1" \| "D#5" \| "D#6" \| "D#7" \| "D#8" \| "D#9" \| "D#10" \| "D#11" \| "Dx0" \| "Dx4" \| "Dx-4" \| "Dx3" \| "Dx-3" \| "Dx2" \| "Dx-2" \| "Dx1" \| "Dx-1" \| "Dx5" \| "Dx6" \| "Dx7" \| "Dx8" \| "Dx9" \| "Dx10" \| "Dx11" \| "E0" \| "E4" \| "E-4" \| "E3" \| "E-3" \| "E2" \| "E-2" \| "E1" \| "E-1" \| "E5" \| "E6" \| "E7" \| "E8" \| "E9" \| "E10" \| "E11" \| "Ebb0" \| "Ebb4" \| "Ebb-4" \| "Ebb3" \| "Ebb-3" \| "Ebb2" \| "Ebb-2" \| "Ebb1" \| "Ebb-1" \| "Ebb5" \| "Ebb6" \| "Ebb7" \| "Ebb8" \| "Ebb9" \| "Ebb10" \| "Ebb11" \| "Eb0" \| "Eb4" \| "Eb-4" \| "Eb3" \| "Eb-3" \| "Eb2" \| "Eb-2" \| "Eb1" \| "Eb-1" \| "Eb5" \| "Eb6" \| "Eb7" \| "Eb8" \| "Eb9" \| "Eb10" \| "Eb11" \| "E#0" \| "E#4" \| "E#-4" \| "E#3" \| "E#-3" \| "E#2" \| "E#-2" \| "E#1" \| "E#-1" \| "E#5" \| "E#6" \| "E#7" \| "E#8" \| "E#9" \| "E#10" \| "E#11" \| "Ex0" \| "Ex4" \| "Ex-4" \| "Ex3" \| "Ex-3" \| "Ex2" \| "Ex-2" \| "Ex1" \| "Ex-1" \| "Ex5" \| "Ex6" \| "Ex7" \| "Ex8" \| "Ex9" \| "Ex10" \| "Ex11" \| "F0" \| "F4" \| "F-4" \| "F3" \| "F-3" \| "F2" \| "F-2" \| "F1" \| "F-1" \| "F5" \| "F6" \| "F7" \| "F8" \| "F9" \| "F10" \| "F11" \| "Fbb0" \| "Fbb4" \| "Fbb-4" \| "Fbb3" \| "Fbb-3" \| "Fbb2" \| "Fbb-2" \| "Fbb1" \| "Fbb-1" \| "Fbb5" \| "Fbb6" \| "Fbb7" \| "Fbb8" \| "Fbb9" \| "Fbb10" \| "Fbb11" \| "Fb0" \| "Fb4" \| "Fb-4" \| "Fb3" \| "Fb-3" \| "Fb2" \| "Fb-2" \| "Fb1" \| "Fb-1" \| "Fb5" \| "Fb6" \| "Fb7" \| "Fb8" \| "Fb9" \| "Fb10" \| "Fb11" \| "F#0" \| "F#4" \| "F#-4" \| "F#3" \| "F#-3" \| "F#2" \| "F#-2" \| "F#1" \| "F#-1" \| "F#5" \| "F#6" \| "F#7" \| "F#8" \| "F#9" \| "F#10" \| "F#11" \| "Fx0" \| "Fx4" \| "Fx-4" \| "Fx3" \| "Fx-3" \| "Fx2" \| "Fx-2" \| "Fx1" \| "Fx-1" \| "Fx5" \| "Fx6" \| "Fx7" \| "Fx8" \| "Fx9" \| "Fx10" \| "Fx11" \| "G0" \| "G4" \| "G-4" \| "G3" \| "G-3" \| "G2" \| "G-2" \| "G1" \| "G-1" \| "G5" \| "G6" \| "G7" \| "G8" \| "G9" \| "G10" \| "G11" \| "Gbb0" \| "Gbb4" \| "Gbb-4" \| "Gbb3" \| "Gbb-3" \| "Gbb2" \| "Gbb-2" \| "Gbb1" \| "Gbb-1" \| "Gbb5" \| "Gbb6" \| "Gbb7" \| "Gbb8" \| "Gbb9" \| "Gbb10" \| "Gbb11" \| "Gb0" \| "Gb4" \| "Gb-4" \| "Gb3" \| "Gb-3" \| "Gb2" \| "Gb-2" \| "Gb1" \| "Gb-1" \| "Gb5" \| "Gb6" \| "Gb7" \| "Gb8" \| "Gb9" \| "Gb10" \| "Gb11" \| "G#0" \| "G#4" \| "G#-4" \| "G#3" \| "G#-3" \| "G#2" \| "G#-2" \| "G#1" \| "G#-1" \| "G#5" \| "G#6" \| "G#7" \| "G#8" \| "G#9" \| "G#10" \| "G#11" \| "Gx0" \| "Gx4" \| "Gx-4" \| "Gx3" \| "Gx-3" \| "Gx2" \| "Gx-2" \| "Gx1" \| "Gx-1" \| "Gx5" \| "Gx6" \| "Gx7" \| "Gx8" \| "Gx9" \| "Gx10" \| "Gx11" \| "A0" \| "A4" \| "A-4" \| "A3" \| "A-3" \| "A2" \| "A-2" \| "A1" \| "A-1" \| "A5" \| "A6" \| "A7" \| "A8" \| "A9" \| "A10" \| "A11" \| "Abb0" \| "Abb4" \| "Abb-4" \| "Abb3" \| "Abb-3" \| "Abb2" \| "Abb-2" \| "Abb1" \| "Abb-1" \| "Abb5" \| "Abb6" \| "Abb7" \| "Abb8" \| "Abb9" \| "Abb10" \| "Abb11" \| "Ab0" \| "Ab4" \| "Ab-4" \| "Ab3" \| "Ab-3" \| "Ab2" \| "Ab-2" \| "Ab1" \| "Ab-1" \| "Ab5" \| "Ab6" \| "Ab7" \| "Ab8" \| "Ab9" \| "Ab10" \| "Ab11" \| "A#0" \| "A#4" \| "A#-4" \| "A#3" \| "A#-3" \| "A#2" \| "A#-2" \| "A#1" \| "A#-1" \| "A#5" \| "A#6" \| "A#7" \| "A#8" \| "A#9" \| "A#10" \| "A#11" \| "Ax0" \| "Ax4" \| "Ax-4" \| "Ax3" \| "Ax-3" \| "Ax2" \| "Ax-2" \| "Ax1" \| "Ax-1" \| "Ax5" \| "Ax6" \| "Ax7" \| "Ax8" \| "Ax9" \| "Ax10" \| "Ax11" \| "B0" \| "B4" \| "B-4" \| "B3" \| "B-3" \| "B2" \| "B-2" \| "B1" \| "B-1" \| "B5" \| "B6" \| "B7" \| "B8" \| "B9" \| "B10" \| "B11" \| "Bbb0" \| "Bbb4" \| "Bbb-4" \| "Bbb3" \| "Bbb-3" \| "Bbb2" \| "Bbb-2" \| "Bbb1" \| "Bbb-1" \| "Bbb5" \| "Bbb6" \| "Bbb7" \| "Bbb8" \| "Bbb9" \| "Bbb10" \| "Bbb11" \| "Bb0" \| "Bb4" \| "Bb-4" \| "Bb3" \| "Bb-3" \| "Bb2" \| "Bb-2" \| "Bb1" \| "Bb-1" \| "Bb5" \| "Bb6" \| "Bb7" \| "Bb8" \| "Bb9" \| "Bb10" \| "Bb11" \| "B#0" \| "B#4" \| "B#-4" \| "B#3" \| "B#-3" \| "B#2" \| "B#-2" \| "B#1" \| "B#-1" \| "B#5" \| "B#6" \| "B#7" \| "B#8" \| "B#9" \| "B#10" \| "B#11" \| "Bx0" \| "Bx4" \| "Bx-4" \| "Bx3" \| "Bx-3" \| "Bx2" \| "Bx-2" \| "Bx1" \| "Bx-1" \| "Bx5" \| "Bx6" \| "Bx7" \| "Bx8" \| "Bx9" \| "Bx10" \| "Bx11"

  #### Example

  ``` ts
  Tone.Frequency(69, "midi").toNote(); // "A4"
  ```

  - Defined in [Tone/core/type/Frequency.ts:144](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/type/Frequency.ts#L144)

### toSamples

- toSamples(): number

- Return the time in samples

  #### Returns number

  Inherited from [TimeClass](TimeClass.md).[toSamples](TimeClass.md#toSamples)

  - Defined in [Tone/core/type/TimeBase.ts:348](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/type/TimeBase.ts#L348)

### toSeconds

- toSeconds(): number

- Return the duration of one cycle in seconds.

  #### Returns number

  Overrides [TimeClass](TimeClass.md).[toSeconds](TimeClass.md#toSeconds)

  - Defined in [Tone/core/type/Frequency.ts:159](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/type/Frequency.ts#L159)

### toString

- toString(): string

- Convert the class to a string

  #### Returns string

  #### Example

  ``` ts
  const osc = new Tone.Oscillator();
  console.log(osc.toString());
  ```

  Inherited from [TimeClass](TimeClass.md).[toString](TimeClass.md#toString)

  - Defined in [Tone/core/Tone.ts:106](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L106)

### toTicks

- toTicks(): number

- Return the duration of one cycle in ticks

  #### Returns number

  Overrides [TimeClass](TimeClass.md).[toTicks](TimeClass.md#toTicks)

  - Defined in [Tone/core/type/Frequency.ts:166](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/type/Frequency.ts#L166)

### transpose

- transpose(interval): [FrequencyClass](FrequencyClass.md)<number>

- Transposes the frequency by the given number of semitones.

  #### Parameters

  - interval: number

  #### Returns [FrequencyClass](FrequencyClass.md)<number>

  A new transposed frequency

  #### Example

  ``` ts
  Tone.Frequency("A4").transpose(3); // "C5"
  ```

  - Defined in [Tone/core/type/Frequency.ts:106](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/type/Frequency.ts#L106)

### valueOf

- valueOf(): [Type](FrequencyClass.md#constructor.new_FrequencyClass.Type-1)

- Evaluate the time value. Returns the time in seconds.

  #### Returns [Type](FrequencyClass.md#constructor.new_FrequencyClass.Type-1)

  Inherited from [TimeClass](TimeClass.md).[valueOf](TimeClass.md#valueOf)

  - Defined in [Tone/core/type/TimeBase.ts:185](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/type/TimeBase.ts#L185)

### `Static` ftom

- ftom(frequency): 0 \| 1 \| 2 \| 3 \| 4 \| 5 \| 6 \| 7 \| 8 \| 9 \| 10 \| 11 \| 12 \| 13 \| 14 \| 15 \| 16 \| 17 \| 18 \| 19 \| 20 \| 21 \| 22 \| 23 \| 24 \| 25 \| 26 \| 27 \| 28 \| 29 \| 30 \| 31 \| 32 \| 33 \| 34 \| 35 \| 36 \| 37 \| 38 \| 39 \| 40 \| 41 \| 42 \| 43 \| 44 \| 45 \| 46 \| 47 \| 48 \| 49 \| 50 \| 51 \| 52 \| 53 \| 54 \| 55 \| 56 \| 57 \| 58 \| 59 \| 60 \| 61 \| 62 \| 63 \| 64 \| 65 \| 66 \| 67 \| 68 \| 69 \| 70 \| 71 \| 72 \| 73 \| 74 \| 75 \| 76 \| 77 \| 78 \| 79 \| 80 \| 81 \| 82 \| 83 \| 84 \| 85 \| 86 \| 87 \| 88 \| 89 \| 90 \| 91 \| 92 \| 93 \| 94 \| 95 \| 96 \| 97 \| 98 \| 99 \| 100 \| 101 \| 102 \| 103 \| 104 \| 105 \| 106 \| 107 \| 108 \| 109 \| 110 \| 111 \| 112 \| 113 \| 114 \| 115 \| 116 \| 117 \| 118 \| 119 \| 120 \| 121 \| 122 \| 123 \| 124 \| 125 \| 126 \| 127

- Convert a frequency value to a MIDI note.

  #### Parameters

  - frequency: number
    The value to frequency value to convert.

  #### Returns 0 \| 1 \| 2 \| 3 \| 4 \| 5 \| 6 \| 7 \| 8 \| 9 \| 10 \| 11 \| 12 \| 13 \| 14 \| 15 \| 16 \| 17 \| 18 \| 19 \| 20 \| 21 \| 22 \| 23 \| 24 \| 25 \| 26 \| 27 \| 28 \| 29 \| 30 \| 31 \| 32 \| 33 \| 34 \| 35 \| 36 \| 37 \| 38 \| 39 \| 40 \| 41 \| 42 \| 43 \| 44 \| 45 \| 46 \| 47 \| 48 \| 49 \| 50 \| 51 \| 52 \| 53 \| 54 \| 55 \| 56 \| 57 \| 58 \| 59 \| 60 \| 61 \| 62 \| 63 \| 64 \| 65 \| 66 \| 67 \| 68 \| 69 \| 70 \| 71 \| 72 \| 73 \| 74 \| 75 \| 76 \| 77 \| 78 \| 79 \| 80 \| 81 \| 82 \| 83 \| 84 \| 85 \| 86 \| 87 \| 88 \| 89 \| 90 \| 91 \| 92 \| 93 \| 94 \| 95 \| 96 \| 97 \| 98 \| 99 \| 100 \| 101 \| 102 \| 103 \| 104 \| 105 \| 106 \| 107 \| 108 \| 109 \| 110 \| 111 \| 112 \| 113 \| 114 \| 115 \| 116 \| 117 \| 118 \| 119 \| 120 \| 121 \| 122 \| 123 \| 124 \| 125 \| 126 \| 127

  - Defined in [Tone/core/type/Frequency.ts:224](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/type/Frequency.ts#L224)

### `Static` getDefaults

- getDefaults(): BaseToneOptions

- Returns all of the default options belonging to the class.

  #### Returns BaseToneOptions

  Inherited from [TimeClass](TimeClass.md).[getDefaults](TimeClass.md#getDefaults)

  - Defined in [Tone/core/Tone.ts:38](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L38)

### `Static` mtof

- mtof(midi): number

- Convert a MIDI note to frequency value.

  #### Parameters

  - midi: 0 \| 1 \| 2 \| 3 \| 4 \| 5 \| 6 \| 7 \| 8 \| 9 \| 10 \| 11 \| 12 \| 13 \| 14 \| 15 \| 16 \| 17 \| 18 \| 19 \| 20 \| 21 \| 22 \| 23 \| 24 \| 25 \| 26 \| 27 \| 28 \| 29 \| 30 \| 31 \| 32 \| 33 \| 34 \| 35 \| 36 \| 37 \| 38 \| 39 \| 40 \| 41 \| 42 \| 43 \| 44 \| 45 \| 46 \| 47 \| 48 \| 49 \| 50 \| 51 \| 52 \| 53 \| 54 \| 55 \| 56 \| 57 \| 58 \| 59 \| 60 \| 61 \| 62 \| 63 \| 64 \| 65 \| 66 \| 67 \| 68 \| 69 \| 70 \| 71 \| 72 \| 73 \| 74 \| 75 \| 76 \| 77 \| 78 \| 79 \| 80 \| 81 \| 82 \| 83 \| 84 \| 85 \| 86 \| 87 \| 88 \| 89 \| 90 \| 91 \| 92 \| 93 \| 94 \| 95 \| 96 \| 97 \| 98 \| 99 \| 100 \| 101 \| 102 \| 103 \| 104 \| 105 \| 106 \| 107 \| 108 \| 109 \| 110 \| 111 \| 112 \| 113 \| 114 \| 115 \| 116 \| 117 \| 118 \| 119 \| 120 \| 121 \| 122 \| 123 \| 124 \| 125 \| 126 \| 127
    The midi number to convert.

  #### Returns number

  The corresponding frequency value

  - Defined in [Tone/core/type/Frequency.ts:216](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/type/Frequency.ts#L216)
