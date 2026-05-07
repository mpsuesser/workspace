# Interface PolySynthOptions<Voice>

interface PolySynthOptions<[Voice](PolySynthOptions.md#Voice)> {\
    [context](PolySynthOptions.md#context): [BaseContext](../classes/BaseContext.md);\
    [maxPolyphony](PolySynthOptions.md#maxPolyphony): number;\
    [options](PolySynthOptions.md#options): RecursivePartial<OmitMonophonicOptions<VoiceOptions<[Voice](PolySynthOptions.md#Voice)>>>;\
    [voice](PolySynthOptions.md#voice-1): VoiceConstructor<[Voice](PolySynthOptions.md#Voice)>;\
    [volume](PolySynthOptions.md#volume): number;\
}

#### Type Parameters

- Voice

#### Hierarchy

- InstrumentOptions
  - PolySynthOptions

- Defined in [Tone/instrument/PolySynth.ts:55](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/PolySynth.ts#L55)

## Properties

### context

context: [BaseContext](../classes/BaseContext.md)

Inherited from InstrumentOptions.context

- Defined in [Tone/core/context/ToneWithContext.ts:28](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L28)

### maxPolyphony

maxPolyphony: number

- Defined in [Tone/instrument/PolySynth.ts:56](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/PolySynth.ts#L56)

### options

options: RecursivePartial<OmitMonophonicOptions<VoiceOptions<[Voice](PolySynthOptions.md#Voice)>>>

- Defined in [Tone/instrument/PolySynth.ts:58](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/PolySynth.ts#L58)

### voice

voice: VoiceConstructor<[Voice](PolySynthOptions.md#Voice)>

- Defined in [Tone/instrument/PolySynth.ts:57](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/PolySynth.ts#L57)

### volume

volume: number

Inherited from InstrumentOptions.volume

- Defined in [Tone/instrument/Instrument.ts:13](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Instrument.ts#L13)
