# Interface DuoSynthOptions

interface DuoSynthOptions {\
    [context](DuoSynthOptions.md#context): [BaseContext](../classes/BaseContext.md);\
    [detune](DuoSynthOptions.md#detune): number;\
    [harmonicity](DuoSynthOptions.md#harmonicity): number;\
    [onsilence](DuoSynthOptions.md#onsilence): onSilenceCallback;\
    [portamento](DuoSynthOptions.md#portamento): number;\
    [vibratoAmount](DuoSynthOptions.md#vibratoAmount): number;\
    [vibratoRate](DuoSynthOptions.md#vibratoRate): [Unit](../modules/Unit.md).[Frequency](../types/Unit.Frequency.md);\
    [voice0](DuoSynthOptions.md#voice0): Omit<[MonoSynthOptions](MonoSynthOptions.md), keyof MonophonicOptions>;\
    [voice1](DuoSynthOptions.md#voice1): Omit<[MonoSynthOptions](MonoSynthOptions.md), keyof MonophonicOptions>;\
    [volume](DuoSynthOptions.md#volume): number;\
}

#### Hierarchy

- MonophonicOptions
  - DuoSynthOptions

- Defined in [Tone/instrument/DuoSynth.ts:22](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/DuoSynth.ts#L22)

## Properties

### context

context: [BaseContext](../classes/BaseContext.md)

Inherited from MonophonicOptions.context

- Defined in [Tone/core/context/ToneWithContext.ts:28](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L28)

### detune

detune: number

Inherited from MonophonicOptions.detune

- Defined in [Tone/instrument/Monophonic.ts:20](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Monophonic.ts#L20)

### harmonicity

harmonicity: number

- Defined in [Tone/instrument/DuoSynth.ts:25](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/DuoSynth.ts#L25)

### onsilence

onsilence: onSilenceCallback

Inherited from MonophonicOptions.onsilence

- Defined in [Tone/instrument/Monophonic.ts:19](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Monophonic.ts#L19)

### portamento

portamento: number

Inherited from MonophonicOptions.portamento

- Defined in [Tone/instrument/Monophonic.ts:18](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Monophonic.ts#L18)

### vibratoAmount

vibratoAmount: number

- Defined in [Tone/instrument/DuoSynth.ts:27](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/DuoSynth.ts#L27)

### vibratoRate

vibratoRate: [Unit](../modules/Unit.md).[Frequency](../types/Unit.Frequency.md)

- Defined in [Tone/instrument/DuoSynth.ts:26](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/DuoSynth.ts#L26)

### voice0

voice0: Omit<[MonoSynthOptions](MonoSynthOptions.md), keyof MonophonicOptions>

- Defined in [Tone/instrument/DuoSynth.ts:23](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/DuoSynth.ts#L23)

### voice1

voice1: Omit<[MonoSynthOptions](MonoSynthOptions.md), keyof MonophonicOptions>

- Defined in [Tone/instrument/DuoSynth.ts:24](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/DuoSynth.ts#L24)

### volume

volume: number

Inherited from MonophonicOptions.volume

- Defined in [Tone/instrument/Instrument.ts:13](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Instrument.ts#L13)
