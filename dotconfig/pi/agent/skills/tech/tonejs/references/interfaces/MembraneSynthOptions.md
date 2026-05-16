# Interface MembraneSynthOptions

interface MembraneSynthOptions {\
    [context](MembraneSynthOptions.md#context): [BaseContext](../classes/BaseContext.md);\
    [detune](MembraneSynthOptions.md#detune): number;\
    [envelope](MembraneSynthOptions.md#envelope): Omit<[EnvelopeOptions](EnvelopeOptions.md), "context">;\
    [octaves](MembraneSynthOptions.md#octaves): number;\
    [onsilence](MembraneSynthOptions.md#onsilence): onSilenceCallback;\
    [oscillator](MembraneSynthOptions.md#oscillator): OmniOscillatorSynthOptions;\
    [pitchDecay](MembraneSynthOptions.md#pitchDecay): [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md);\
    [portamento](MembraneSynthOptions.md#portamento): number;\
    [volume](MembraneSynthOptions.md#volume): number;\
}

#### Hierarchy ([view full](../hierarchy.md#MembraneSynthOptions))

- [SynthOptions](SynthOptions.md)
  - MembraneSynthOptions

- Defined in [Tone/instrument/MembraneSynth.ts:9](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/MembraneSynth.ts#L9)

## Properties

### context

context: [BaseContext](../classes/BaseContext.md)

Inherited from [SynthOptions](SynthOptions.md).[context](SynthOptions.md#context)

- Defined in [Tone/core/context/ToneWithContext.ts:28](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L28)

### detune

detune: number

Inherited from [SynthOptions](SynthOptions.md).[detune](SynthOptions.md#detune)

- Defined in [Tone/instrument/Monophonic.ts:20](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Monophonic.ts#L20)

### envelope

envelope: Omit<[EnvelopeOptions](EnvelopeOptions.md), "context">

Inherited from [SynthOptions](SynthOptions.md).[envelope](SynthOptions.md#envelope)

- Defined in [Tone/instrument/Synth.ts:22](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Synth.ts#L22)

### octaves

octaves: number

- Defined in [Tone/instrument/MembraneSynth.ts:11](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/MembraneSynth.ts#L11)

### onsilence

onsilence: onSilenceCallback

Inherited from [SynthOptions](SynthOptions.md).[onsilence](SynthOptions.md#onsilence)

- Defined in [Tone/instrument/Monophonic.ts:19](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Monophonic.ts#L19)

### oscillator

oscillator: OmniOscillatorSynthOptions

Inherited from [SynthOptions](SynthOptions.md).[oscillator](SynthOptions.md#oscillator)

- Defined in [Tone/instrument/Synth.ts:21](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Synth.ts#L21)

### pitchDecay

pitchDecay: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

- Defined in [Tone/instrument/MembraneSynth.ts:10](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/MembraneSynth.ts#L10)

### portamento

portamento: number

Inherited from [SynthOptions](SynthOptions.md).[portamento](SynthOptions.md#portamento)

- Defined in [Tone/instrument/Monophonic.ts:18](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Monophonic.ts#L18)

### volume

volume: number

Inherited from [SynthOptions](SynthOptions.md).[volume](SynthOptions.md#volume)

- Defined in [Tone/instrument/Instrument.ts:13](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Instrument.ts#L13)
