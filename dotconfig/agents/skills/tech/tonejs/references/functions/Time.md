# Function Time

- Time(value?, units?): [TimeClass](../classes/TimeClass.md)<[Seconds](../types/Unit.Seconds.md)>

- Create a TimeClass from a time string or number. The time is computed against the global Tone.Context. To use a specific context, use [TimeClass](../classes/TimeClass.md)

  #### Parameters

  - `Optional` value: TimeValue
    A value which represents time
  - `Optional` units: TimeBaseUnit
    The value's units if they can't be inferred by the value.

  #### Returns [TimeClass](../classes/TimeClass.md)<[Seconds](../types/Unit.Seconds.md)>

  #### Example

  ``` ts
  const time = Tone.Time("4n").toSeconds();
  console.log(time);
  ```

  #### Example

  ``` ts
  const note = Tone.Time(1).toNotation();
  console.log(note);
  ```

  #### Example

  ``` ts
  const freq = Tone.Time(0.5).toFrequency();
  console.log(freq);
  ```

  - Defined in [Tone/core/type/Time.ts:188](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/type/Time.ts#L188)
