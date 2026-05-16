# Interface PWMOscillatorOptions

PWM Oscillator

interface PWMOscillatorOptions {\
    [context](PWMOscillatorOptions.md#context): [BaseContext](../classes/BaseContext.md);\
    [detune](PWMOscillatorOptions.md#detune): number;\
    [frequency](PWMOscillatorOptions.md#frequency): [Unit](../modules/Unit.md).[Frequency](../types/Unit.Frequency.md);\
    [modulationFrequency](PWMOscillatorOptions.md#modulationFrequency): [Unit](../modules/Unit.md).[Frequency](../types/Unit.Frequency.md);\
    [mute](PWMOscillatorOptions.md#mute): boolean;\
    [onstop](PWMOscillatorOptions.md#onstop): onStopCallback;\
    [phase](PWMOscillatorOptions.md#phase): number;\
    [type](PWMOscillatorOptions.md#type): "pwm";\
    [volume](PWMOscillatorOptions.md#volume): number;\
}

#### Hierarchy

- BaseOscillatorOptions
  - PWMOscillatorOptions

- Defined in [Tone/source/oscillator/OscillatorInterface.ts:343](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/OscillatorInterface.ts#L343)

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

### modulationFrequency

modulationFrequency: [Unit](../modules/Unit.md).[Frequency](../types/Unit.Frequency.md)

- Defined in [Tone/source/oscillator/OscillatorInterface.ts:345](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/OscillatorInterface.ts#L345)

### mute

mute: boolean

Inherited from BaseOscillatorOptions.mute

- Defined in [Tone/source/Source.ts:26](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/Source.ts#L26)

### onstop

onstop: onStopCallback

Inherited from BaseOscillatorOptions.onstop

- Defined in [Tone/source/Source.ts:27](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/Source.ts#L27)

### phase

phase: number

Inherited from BaseOscillatorOptions.phase

- Defined in [Tone/source/oscillator/OscillatorInterface.ts:196](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/OscillatorInterface.ts#L196)

### type

type: "pwm"

- Defined in [Tone/source/oscillator/OscillatorInterface.ts:344](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/OscillatorInterface.ts#L344)

### volume

volume: number

Inherited from BaseOscillatorOptions.volume

- Defined in [Tone/source/Source.ts:25](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/Source.ts#L25)
