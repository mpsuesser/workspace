# Interface ToneOscillatorNodeOptions

interface ToneOscillatorNodeOptions {\
    [context](ToneOscillatorNodeOptions.md#context): [BaseContext](../classes/BaseContext.md);\
    [curve](ToneOscillatorNodeOptions.md#curve): OneShotSourceCurve;\
    [detune](ToneOscillatorNodeOptions.md#detune): number;\
    [fadeIn](ToneOscillatorNodeOptions.md#fadeIn): [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md);\
    [fadeOut](ToneOscillatorNodeOptions.md#fadeOut): [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md);\
    [frequency](ToneOscillatorNodeOptions.md#frequency): [Unit](../modules/Unit.md).[Frequency](../types/Unit.Frequency.md);\
    [onended](ToneOscillatorNodeOptions.md#onended): onEndedCallback;\
    [type](ToneOscillatorNodeOptions.md#type): OscillatorType;\
}

#### Hierarchy

- OneShotSourceOptions
  - ToneOscillatorNodeOptions

- Defined in [Tone/source/oscillator/ToneOscillatorNode.ts:8](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/ToneOscillatorNode.ts#L8)

## Properties

### context

context: [BaseContext](../classes/BaseContext.md)

Inherited from OneShotSourceOptions.context

- Defined in [Tone/core/context/ToneWithContext.ts:28](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L28)

### curve

curve: OneShotSourceCurve

Inherited from OneShotSourceOptions.curve

- Defined in [Tone/source/OneShotSource.ts:19](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/OneShotSource.ts#L19)

### detune

detune: number

- Defined in [Tone/source/oscillator/ToneOscillatorNode.ts:10](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/ToneOscillatorNode.ts#L10)

### fadeIn

fadeIn: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

Inherited from OneShotSourceOptions.fadeIn

- Defined in [Tone/source/OneShotSource.ts:17](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/OneShotSource.ts#L17)

### fadeOut

fadeOut: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

Inherited from OneShotSourceOptions.fadeOut

- Defined in [Tone/source/OneShotSource.ts:18](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/OneShotSource.ts#L18)

### frequency

frequency: [Unit](../modules/Unit.md).[Frequency](../types/Unit.Frequency.md)

- Defined in [Tone/source/oscillator/ToneOscillatorNode.ts:9](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/ToneOscillatorNode.ts#L9)

### onended

onended: onEndedCallback

Inherited from OneShotSourceOptions.onended

- Defined in [Tone/source/OneShotSource.ts:16](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/OneShotSource.ts#L16)

### type

type: OscillatorType

- Defined in [Tone/source/oscillator/ToneOscillatorNode.ts:11](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/ToneOscillatorNode.ts#L11)
