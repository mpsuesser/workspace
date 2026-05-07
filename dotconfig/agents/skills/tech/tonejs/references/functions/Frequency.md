# Function Frequency

- Frequency(value?, units?): [FrequencyClass](../classes/FrequencyClass.md)

- Convert a value into a FrequencyClass object.

  #### Parameters

  - `Optional` value: string \| number \| [TimeObject](../types/Unit.TimeObject.md) \| TimeBaseClass<any, any>
  - `Optional` units: [FrequencyUnit](../types/FrequencyUnit.md)

  #### Returns [FrequencyClass](../classes/FrequencyClass.md)

  #### Example

  ``` ts
  const midi = Tone.Frequency("C3").toMidi();
  console.log(midi);
  ```

  #### Example

  ``` ts
  const hertz = Tone.Frequency(38, "midi").toFrequency();
  console.log(hertz);
  ```

  - Defined in [Tone/core/type/Frequency.ts:339](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/type/Frequency.ts#L339)
