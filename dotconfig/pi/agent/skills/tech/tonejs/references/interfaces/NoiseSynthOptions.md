# Interface NoiseSynthOptions

interface NoiseSynthOptions {\
    [context](NoiseSynthOptions.md#context): [BaseContext](../classes/BaseContext.md);\
    [envelope](NoiseSynthOptions.md#envelope): Omit<[EnvelopeOptions](EnvelopeOptions.md), "context">;\
    [noise](NoiseSynthOptions.md#noise): Omit<[NoiseOptions](NoiseOptions.md), "context">;\
    [volume](NoiseSynthOptions.md#volume): number;\
}

#### Hierarchy

- InstrumentOptions
  - NoiseSynthOptions

- Defined in [Tone/instrument/NoiseSynth.ts:14](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/NoiseSynth.ts#L14)

## Properties

### context

context: [BaseContext](../classes/BaseContext.md)

Inherited from InstrumentOptions.context

- Defined in [Tone/core/context/ToneWithContext.ts:28](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L28)

### envelope

envelope: Omit<[EnvelopeOptions](EnvelopeOptions.md), "context">

- Defined in [Tone/instrument/NoiseSynth.ts:15](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/NoiseSynth.ts#L15)

### noise

noise: Omit<[NoiseOptions](NoiseOptions.md), "context">

- Defined in [Tone/instrument/NoiseSynth.ts:16](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/NoiseSynth.ts#L16)

### volume

volume: number

Inherited from InstrumentOptions.volume

- Defined in [Tone/instrument/Instrument.ts:13](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Instrument.ts#L13)
