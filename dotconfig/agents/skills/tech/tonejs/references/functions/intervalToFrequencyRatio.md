# Function intervalToFrequencyRatio

- intervalToFrequencyRatio(interval): number

- Convert an interval (in semitones) to a frequency ratio.

  #### Parameters

  - interval: number
    the number of semitones above the base note

  #### Returns number

  #### Example

  ``` ts
  Tone.intervalToFrequencyRatio(0); // 1
  Tone.intervalToFrequencyRatio(12); // 2
  Tone.intervalToFrequencyRatio(-12); // 0.5
  ```

  - Defined in [Tone/core/type/Conversions.ts:41](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/type/Conversions.ts#L41)
