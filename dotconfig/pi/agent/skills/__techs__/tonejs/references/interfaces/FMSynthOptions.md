# Interface FMSynthOptions

interface FMSynthOptions {\
    [context](FMSynthOptions.md#context): [BaseContext](../classes/BaseContext.md);\
    [detune](FMSynthOptions.md#detune): number;\
    [envelope](FMSynthOptions.md#envelope): Omit<[EnvelopeOptions](EnvelopeOptions.md), "context">;\
    [harmonicity](FMSynthOptions.md#harmonicity): number;\
    [modulation](FMSynthOptions.md#modulation): OmniOscillatorSynthOptions;\
    [modulationEnvelope](FMSynthOptions.md#modulationEnvelope): Omit<[EnvelopeOptions](EnvelopeOptions.md), "context">;\
    [modulationIndex](FMSynthOptions.md#modulationIndex): number;\
    [onsilence](FMSynthOptions.md#onsilence): onSilenceCallback;\
    [oscillator](FMSynthOptions.md#oscillator): OmniOscillatorSynthOptions;\
    [portamento](FMSynthOptions.md#portamento): number;\
    [volume](FMSynthOptions.md#volume): number;\
}

#### Hierarchy

- ModulationSynthOptions
  - FMSynthOptions

- Defined in [Tone/instrument/FMSynth.ts:7](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/FMSynth.ts#L7)

## Properties

### context

context: [BaseContext](../classes/BaseContext.md)

Inherited from ModulationSynthOptions.context

- Defined in [Tone/core/context/ToneWithContext.ts:28](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L28)

### detune

detune: number

Inherited from ModulationSynthOptions.detune

- Defined in [Tone/instrument/Monophonic.ts:20](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Monophonic.ts#L20)

### envelope

envelope: Omit<[EnvelopeOptions](EnvelopeOptions.md), "context">

Inherited from ModulationSynthOptions.envelope

- Defined in [Tone/instrument/Synth.ts:22](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Synth.ts#L22)

### harmonicity

harmonicity: number

Inherited from ModulationSynthOptions.harmonicity

- Defined in [Tone/instrument/ModulationSynth.ts:20](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/ModulationSynth.ts#L20)

### modulation

modulation: OmniOscillatorSynthOptions

Inherited from ModulationSynthOptions.modulation

- Defined in [Tone/instrument/ModulationSynth.ts:22](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/ModulationSynth.ts#L22)

### modulationEnvelope

modulationEnvelope: Omit<[EnvelopeOptions](EnvelopeOptions.md), "context">

Inherited from ModulationSynthOptions.modulationEnvelope

- Defined in [Tone/instrument/ModulationSynth.ts:21](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/ModulationSynth.ts#L21)

### modulationIndex

modulationIndex: number

- Defined in [Tone/instrument/FMSynth.ts:8](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/FMSynth.ts#L8)

### onsilence

onsilence: onSilenceCallback

Inherited from ModulationSynthOptions.onsilence

- Defined in [Tone/instrument/Monophonic.ts:19](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Monophonic.ts#L19)

### oscillator

oscillator: OmniOscillatorSynthOptions

Inherited from ModulationSynthOptions.oscillator

- Defined in [Tone/instrument/Synth.ts:21](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Synth.ts#L21)

### portamento

portamento: number

Inherited from ModulationSynthOptions.portamento

- Defined in [Tone/instrument/Monophonic.ts:18](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Monophonic.ts#L18)

### volume

volume: number

Inherited from ModulationSynthOptions.volume

- Defined in [Tone/instrument/Instrument.ts:13](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Instrument.ts#L13)
