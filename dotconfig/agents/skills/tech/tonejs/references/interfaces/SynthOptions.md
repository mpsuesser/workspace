# Interface SynthOptions

interface SynthOptions {\
    [context](SynthOptions.md#context): [BaseContext](../classes/BaseContext.md);\
    [detune](SynthOptions.md#detune): number;\
    [envelope](SynthOptions.md#envelope): Omit<[EnvelopeOptions](EnvelopeOptions.md), "context">;\
    [onsilence](SynthOptions.md#onsilence): onSilenceCallback;\
    [oscillator](SynthOptions.md#oscillator): OmniOscillatorSynthOptions;\
    [portamento](SynthOptions.md#portamento): number;\
    [volume](SynthOptions.md#volume): number;\
}

#### Hierarchy ([view full](../hierarchy.md#SynthOptions))

- MonophonicOptions
  - SynthOptions
    - [MembraneSynthOptions](MembraneSynthOptions.md)

- Defined in [Tone/instrument/Synth.ts:20](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Synth.ts#L20)

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

- Defined in [Tone/instrument/Synth.ts:22](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Synth.ts#L22)

### onsilence

onsilence: onSilenceCallback

Inherited from MonophonicOptions.onsilence

- Defined in [Tone/instrument/Monophonic.ts:19](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Monophonic.ts#L19)

### oscillator

oscillator: OmniOscillatorSynthOptions

- Defined in [Tone/instrument/Synth.ts:21](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Synth.ts#L21)

### portamento

portamento: number

Inherited from MonophonicOptions.portamento

- Defined in [Tone/instrument/Monophonic.ts:18](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Monophonic.ts#L18)

### volume

volume: number

Inherited from MonophonicOptions.volume

- Defined in [Tone/instrument/Instrument.ts:13](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Instrument.ts#L13)
