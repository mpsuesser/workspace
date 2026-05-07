# Interface PluckSynthOptions

interface PluckSynthOptions {\
    [attackNoise](PluckSynthOptions.md#attackNoise): number;\
    [context](PluckSynthOptions.md#context): [BaseContext](../classes/BaseContext.md);\
    [dampening](PluckSynthOptions.md#dampening): [Unit](../modules/Unit.md).[Frequency](../types/Unit.Frequency.md);\
    [release](PluckSynthOptions.md#release): [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md);\
    [resonance](PluckSynthOptions.md#resonance): number;\
    [volume](PluckSynthOptions.md#volume): number;\
}

#### Hierarchy

- InstrumentOptions
  - PluckSynthOptions

- Defined in [Tone/instrument/PluckSynth.ts:9](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/PluckSynth.ts#L9)

## Properties

### attackNoise

attackNoise: number

- Defined in [Tone/instrument/PluckSynth.ts:10](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/PluckSynth.ts#L10)

### context

context: [BaseContext](../classes/BaseContext.md)

Inherited from InstrumentOptions.context

- Defined in [Tone/core/context/ToneWithContext.ts:28](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L28)

### dampening

dampening: [Unit](../modules/Unit.md).[Frequency](../types/Unit.Frequency.md)

- Defined in [Tone/instrument/PluckSynth.ts:11](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/PluckSynth.ts#L11)

### release

release: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

- Defined in [Tone/instrument/PluckSynth.ts:13](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/PluckSynth.ts#L13)

### resonance

resonance: number

- Defined in [Tone/instrument/PluckSynth.ts:12](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/PluckSynth.ts#L12)

### volume

volume: number

Inherited from InstrumentOptions.volume

- Defined in [Tone/instrument/Instrument.ts:13](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Instrument.ts#L13)
