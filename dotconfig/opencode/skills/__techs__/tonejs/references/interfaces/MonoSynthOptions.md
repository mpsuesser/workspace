# Interface MonoSynthOptions

interface MonoSynthOptions {\
    [context](MonoSynthOptions.md#context): [BaseContext](../classes/BaseContext.md);\
    [detune](MonoSynthOptions.md#detune): number;\
    [envelope](MonoSynthOptions.md#envelope): Omit<[EnvelopeOptions](EnvelopeOptions.md), "context">;\
    [filter](MonoSynthOptions.md#filter): Omit<[FilterOptions](../types/FilterOptions.md), "context">;\
    [filterEnvelope](MonoSynthOptions.md#filterEnvelope): Omit<[FrequencyEnvelopeOptions](FrequencyEnvelopeOptions.md), "context">;\
    [onsilence](MonoSynthOptions.md#onsilence): onSilenceCallback;\
    [oscillator](MonoSynthOptions.md#oscillator): OmniOscillatorSynthOptions;\
    [portamento](MonoSynthOptions.md#portamento): number;\
    [volume](MonoSynthOptions.md#volume): number;\
}

#### Hierarchy

- MonophonicOptions
  - MonoSynthOptions

- Defined in [Tone/instrument/MonoSynth.ts:21](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/MonoSynth.ts#L21)

## Properties

### context

context: [BaseContext](../classes/BaseContext.md)

Inherited from MonophonicOptions.context

- Defined in [Tone/core/context/ToneWithContext.ts:28](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L28)

### detune

detune: number

Inherited from MonophonicOptions.detune

- Defined in [Tone/instrument/Monophonic.ts:20](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Monophonic.ts#L20)

### envelope

envelope: Omit<[EnvelopeOptions](EnvelopeOptions.md), "context">

- Defined in [Tone/instrument/MonoSynth.ts:23](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/MonoSynth.ts#L23)

### filter

filter: Omit<[FilterOptions](../types/FilterOptions.md), "context">

- Defined in [Tone/instrument/MonoSynth.ts:25](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/MonoSynth.ts#L25)

### filterEnvelope

filterEnvelope: Omit<[FrequencyEnvelopeOptions](FrequencyEnvelopeOptions.md), "context">

- Defined in [Tone/instrument/MonoSynth.ts:24](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/MonoSynth.ts#L24)

### onsilence

onsilence: onSilenceCallback

Inherited from MonophonicOptions.onsilence

- Defined in [Tone/instrument/Monophonic.ts:19](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Monophonic.ts#L19)

### oscillator

oscillator: OmniOscillatorSynthOptions

- Defined in [Tone/instrument/MonoSynth.ts:22](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/MonoSynth.ts#L22)

### portamento

portamento: number

Inherited from MonophonicOptions.portamento

- Defined in [Tone/instrument/Monophonic.ts:18](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Monophonic.ts#L18)

### volume

volume: number

Inherited from MonophonicOptions.volume

- Defined in [Tone/instrument/Instrument.ts:13](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Instrument.ts#L13)
