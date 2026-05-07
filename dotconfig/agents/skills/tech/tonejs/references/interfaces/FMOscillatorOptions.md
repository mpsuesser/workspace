# Interface FMOscillatorOptions

interface FMOscillatorOptions {\
    [context](FMOscillatorOptions.md#context): [BaseContext](../classes/BaseContext.md);\
    [detune](FMOscillatorOptions.md#detune): number;\
    [frequency](FMOscillatorOptions.md#frequency): [Unit](../modules/Unit.md).[Frequency](../types/Unit.Frequency.md);\
    [harmonicity](FMOscillatorOptions.md#harmonicity): number;\
    [modulationIndex](FMOscillatorOptions.md#modulationIndex): number;\
    [modulationType](FMOscillatorOptions.md#modulationType): AllNonCustomOscillatorType;\
    [mute](FMOscillatorOptions.md#mute): boolean;\
    [onstop](FMOscillatorOptions.md#onstop): onStopCallback;\
    [partialCount](FMOscillatorOptions.md#partialCount): number;\
    [partials](FMOscillatorOptions.md#partials): number\[\];\
    [phase](FMOscillatorOptions.md#phase): number;\
    [type](FMOscillatorOptions.md#type): [ToneOscillatorType](../types/ToneOscillatorType.md);\
    [volume](FMOscillatorOptions.md#volume): number;\
}

#### Hierarchy ([view full](../hierarchy.md#FMOscillatorOptions))

- [ToneOscillatorOptions](ToneOscillatorOptions.md)
  - FMOscillatorOptions

- Defined in [Tone/source/oscillator/OscillatorInterface.ts:263](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/OscillatorInterface.ts#L263)

## Properties

### context

context: [BaseContext](../classes/BaseContext.md)

Inherited from [ToneOscillatorOptions](ToneOscillatorOptions.md).[context](ToneOscillatorOptions.md#context)

- Defined in [Tone/core/context/ToneWithContext.ts:28](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L28)

### detune

detune: number

Inherited from [ToneOscillatorOptions](ToneOscillatorOptions.md).[detune](ToneOscillatorOptions.md#detune)

- Defined in [Tone/source/oscillator/OscillatorInterface.ts:195](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/OscillatorInterface.ts#L195)

### frequency

frequency: [Unit](../modules/Unit.md).[Frequency](../types/Unit.Frequency.md)

Inherited from [ToneOscillatorOptions](ToneOscillatorOptions.md).[frequency](ToneOscillatorOptions.md#frequency)

- Defined in [Tone/source/oscillator/OscillatorInterface.ts:194](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/OscillatorInterface.ts#L194)

### harmonicity

harmonicity: number

- Defined in [Tone/source/oscillator/OscillatorInterface.ts:264](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/OscillatorInterface.ts#L264)

### modulationIndex

modulationIndex: number

- Defined in [Tone/source/oscillator/OscillatorInterface.ts:265](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/OscillatorInterface.ts#L265)

### modulationType

modulationType: AllNonCustomOscillatorType

- Defined in [Tone/source/oscillator/OscillatorInterface.ts:266](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/OscillatorInterface.ts#L266)

### mute

mute: boolean

Inherited from [ToneOscillatorOptions](ToneOscillatorOptions.md).[mute](ToneOscillatorOptions.md#mute)

- Defined in [Tone/source/Source.ts:26](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/Source.ts#L26)

### onstop

onstop: onStopCallback

Inherited from [ToneOscillatorOptions](ToneOscillatorOptions.md).[onstop](ToneOscillatorOptions.md#onstop)

- Defined in [Tone/source/Source.ts:27](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/Source.ts#L27)

### partialCount

partialCount: number

Inherited from [ToneOscillatorOptions](ToneOscillatorOptions.md).[partialCount](ToneOscillatorOptions.md#partialCount)

- Defined in [Tone/source/oscillator/OscillatorInterface.ts:231](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/OscillatorInterface.ts#L231)

### partials

partials: number\[\]

Inherited from [ToneOscillatorOptions](ToneOscillatorOptions.md).[partials](ToneOscillatorOptions.md#partials)

- Defined in [Tone/source/oscillator/OscillatorInterface.ts:232](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/OscillatorInterface.ts#L232)

### phase

phase: number

Inherited from [ToneOscillatorOptions](ToneOscillatorOptions.md).[phase](ToneOscillatorOptions.md#phase)

- Defined in [Tone/source/oscillator/OscillatorInterface.ts:196](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/OscillatorInterface.ts#L196)

### type

type: [ToneOscillatorType](../types/ToneOscillatorType.md)

Inherited from [ToneOscillatorOptions](ToneOscillatorOptions.md).[type](ToneOscillatorOptions.md#type)

- Defined in [Tone/source/oscillator/OscillatorInterface.ts:230](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/OscillatorInterface.ts#L230)

### volume

volume: number

Inherited from [ToneOscillatorOptions](ToneOscillatorOptions.md).[volume](ToneOscillatorOptions.md#volume)

- Defined in [Tone/source/Source.ts:25](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/Source.ts#L25)
