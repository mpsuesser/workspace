# Interface FeedbackDelayOptions

interface FeedbackDelayOptions {\
    [context](FeedbackDelayOptions.md#context): [BaseContext](../classes/BaseContext.md);\
    [delayTime](FeedbackDelayOptions.md#delayTime): [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md);\
    [feedback](FeedbackDelayOptions.md#feedback): number;\
    [maxDelay](FeedbackDelayOptions.md#maxDelay): [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md);\
    [wet](FeedbackDelayOptions.md#wet): number;\
}

#### Hierarchy

- FeedbackEffectOptions
  - FeedbackDelayOptions

- Defined in [Tone/effect/FeedbackDelay.ts:8](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/effect/FeedbackDelay.ts#L8)

## Properties

### context

context: [BaseContext](../classes/BaseContext.md)

Inherited from FeedbackEffectOptions.context

- Defined in [Tone/core/context/ToneWithContext.ts:28](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L28)

### delayTime

delayTime: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

- Defined in [Tone/effect/FeedbackDelay.ts:9](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/effect/FeedbackDelay.ts#L9)

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

### maxDelay

maxDelay: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

- Defined in [Tone/effect/FeedbackDelay.ts:10](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/effect/FeedbackDelay.ts#L10)

### wet

wet: number

Inherited from FeedbackEffectOptions.wet

- Defined in [Tone/effect/Effect.ts:12](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/effect/Effect.ts#L12)
