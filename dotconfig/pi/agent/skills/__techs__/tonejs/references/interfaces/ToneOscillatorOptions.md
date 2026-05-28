# Interface ToneOscillatorOptions

interface ToneOscillatorOptions {\
    [context](ToneOscillatorOptions.md#context): [BaseContext](../classes/BaseContext.md);\
    [detune](ToneOscillatorOptions.md#detune): number;\
    [frequency](ToneOscillatorOptions.md#frequency): [Unit](../modules/Unit.md).[Frequency](../types/Unit.Frequency.md);\
    [mute](ToneOscillatorOptions.md#mute): boolean;\
    [onstop](ToneOscillatorOptions.md#onstop): onStopCallback;\
    [partialCount](ToneOscillatorOptions.md#partialCount): number;\
    [partials](ToneOscillatorOptions.md#partials): number\[\];\
    [phase](ToneOscillatorOptions.md#phase): number;\
    [type](ToneOscillatorOptions.md#type): [ToneOscillatorType](../types/ToneOscillatorType.md);\
    [volume](ToneOscillatorOptions.md#volume): number;\
}

#### Hierarchy ([view full](../hierarchy.md#ToneOscillatorOptions))

- BaseOscillatorOptions
  - ToneOscillatorOptions
    - [AMOscillatorOptions](AMOscillatorOptions.md)
    - [FMOscillatorOptions](FMOscillatorOptions.md)
    - [FatOscillatorOptions](FatOscillatorOptions.md)

- Defined in [Tone/source/oscillator/OscillatorInterface.ts:229](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/OscillatorInterface.ts#L229)

## Properties

### context

context: [BaseContext](../classes/BaseContext.md)

Inherited from BaseOscillatorOptions.context

- Defined in [Tone/core/context/ToneWithContext.ts:28](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L28)

### detune

detune: number

Inherited from BaseOscillatorOptions.detune

- Defined in [Tone/source/oscillator/OscillatorInterface.ts:195](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/OscillatorInterface.ts#L195)

### frequency

frequency: [Unit](../modules/Unit.md).[Frequency](../types/Unit.Frequency.md)

Inherited from BaseOscillatorOptions.frequency

- Defined in [Tone/source/oscillator/OscillatorInterface.ts:194](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/OscillatorInterface.ts#L194)

### mute

mute: boolean

Inherited from BaseOscillatorOptions.mute

- Defined in [Tone/source/Source.ts:26](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/Source.ts#L26)

### onstop

onstop: onStopCallback

Inherited from BaseOscillatorOptions.onstop

- Defined in [Tone/source/Source.ts:27](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/Source.ts#L27)

### partialCount

partialCount: number

- Defined in [Tone/source/oscillator/OscillatorInterface.ts:231](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/OscillatorInterface.ts#L231)

### partials

partials: number\[\]

- Defined in [Tone/source/oscillator/OscillatorInterface.ts:232](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/OscillatorInterface.ts#L232)

### phase

phase: number

Inherited from BaseOscillatorOptions.phase

- Defined in [Tone/source/oscillator/OscillatorInterface.ts:196](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/OscillatorInterface.ts#L196)

### type

type: [ToneOscillatorType](../types/ToneOscillatorType.md)

- Defined in [Tone/source/oscillator/OscillatorInterface.ts:230](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/OscillatorInterface.ts#L230)

### volume

volume: number

Inherited from BaseOscillatorOptions.volume

- Defined in [Tone/source/Source.ts:25](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/Source.ts#L25)
