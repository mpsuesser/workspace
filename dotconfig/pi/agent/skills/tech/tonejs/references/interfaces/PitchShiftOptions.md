# Interface PitchShiftOptions

interface PitchShiftOptions {\
    [context](PitchShiftOptions.md#context): [BaseContext](../classes/BaseContext.md);\
    [delayTime](PitchShiftOptions.md#delayTime): [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md);\
    [feedback](PitchShiftOptions.md#feedback): number;\
    [pitch](PitchShiftOptions.md#pitch): number;\
    [wet](PitchShiftOptions.md#wet): number;\
    [windowSize](PitchShiftOptions.md#windowSize): number;\
}

#### Hierarchy

- FeedbackEffectOptions
  - PitchShiftOptions

- Defined in [Tone/effect/PitchShift.ts:12](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/effect/PitchShift.ts#L12)

## Properties

### context

context: [BaseContext](../classes/BaseContext.md)

Inherited from FeedbackEffectOptions.context

- Defined in [Tone/core/context/ToneWithContext.ts:28](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L28)

### delayTime

delayTime: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

- Defined in [Tone/effect/PitchShift.ts:15](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/effect/PitchShift.ts#L15)

### feedback

feedback: number

The feedback from the output back to the input

    +---<--------<---+
    |                |
    |  +----------+  |
    +--> feedback +>-+
       +----------+

Inherited from FeedbackEffectOptions.feedback

- Defined in [Tone/effect/FeedbackEffect.ts:18](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/effect/FeedbackEffect.ts#L18)

### pitch

pitch: number

- Defined in [Tone/effect/PitchShift.ts:13](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/effect/PitchShift.ts#L13)

### wet

wet: number

Inherited from FeedbackEffectOptions.wet

- Defined in [Tone/effect/Effect.ts:12](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/effect/Effect.ts#L12)

### windowSize

windowSize: number

- Defined in [Tone/effect/PitchShift.ts:14](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/effect/PitchShift.ts#L14)
