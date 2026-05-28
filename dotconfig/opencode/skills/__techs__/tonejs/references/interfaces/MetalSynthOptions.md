# Interface MetalSynthOptions

interface MetalSynthOptions {\
    [context](MetalSynthOptions.md#context): [BaseContext](../classes/BaseContext.md);\
    [detune](MetalSynthOptions.md#detune): number;\
    [envelope](MetalSynthOptions.md#envelope): Omit<[EnvelopeOptions](EnvelopeOptions.md), "context">;\
    [harmonicity](MetalSynthOptions.md#harmonicity): number;\
    [modulationIndex](MetalSynthOptions.md#modulationIndex): number;\
    [octaves](MetalSynthOptions.md#octaves): number;\
    [onsilence](MetalSynthOptions.md#onsilence): onSilenceCallback;\
    [portamento](MetalSynthOptions.md#portamento): number;\
    [resonance](MetalSynthOptions.md#resonance): [Unit](../modules/Unit.md).[Frequency](../types/Unit.Frequency.md);\
    [volume](MetalSynthOptions.md#volume): number;\
}

#### Hierarchy

- MonophonicOptions
  - MetalSynthOptions

- Defined in [Tone/instrument/MetalSynth.ts:27](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/MetalSynth.ts#L27)

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

- Defined in [Tone/instrument/MetalSynth.ts:32](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/MetalSynth.ts#L32)

### harmonicity

harmonicity: number

- Defined in [Tone/instrument/MetalSynth.ts:28](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/MetalSynth.ts#L28)

### modulationIndex

modulationIndex: number

- Defined in [Tone/instrument/MetalSynth.ts:29](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/MetalSynth.ts#L29)

### octaves

octaves: number

- Defined in [Tone/instrument/MetalSynth.ts:30](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/MetalSynth.ts#L30)

### onsilence

onsilence: onSilenceCallback

Inherited from MonophonicOptions.onsilence

- Defined in [Tone/instrument/Monophonic.ts:19](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Monophonic.ts#L19)

### portamento

portamento: number

Inherited from MonophonicOptions.portamento

- Defined in [Tone/instrument/Monophonic.ts:18](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Monophonic.ts#L18)

### resonance

resonance: [Unit](../modules/Unit.md).[Frequency](../types/Unit.Frequency.md)

- Defined in [Tone/instrument/MetalSynth.ts:31](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/MetalSynth.ts#L31)

### volume

volume: number

Inherited from MonophonicOptions.volume

- Defined in [Tone/instrument/Instrument.ts:13](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Instrument.ts#L13)
