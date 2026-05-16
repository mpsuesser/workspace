# Interface SamplerOptions

interface SamplerOptions {\
    [attack](SamplerOptions.md#attack): [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md);\
    [baseUrl](SamplerOptions.md#baseUrl): string;\
    [context](SamplerOptions.md#context): [BaseContext](../classes/BaseContext.md);\
    [curve](SamplerOptions.md#curve): OneShotSourceCurve;\
    [onerror](SamplerOptions.md#onerror): ((error) => void);\
    [onload](SamplerOptions.md#onload): (() => void);\
    [release](SamplerOptions.md#release): [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md);\
    [urls](SamplerOptions.md#urls): SamplesMap;\
    [volume](SamplerOptions.md#volume): number;\
}

#### Hierarchy

- InstrumentOptions
  - SamplerOptions

- Defined in [Tone/instrument/Sampler.ts:29](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Sampler.ts#L29)

## Properties

### attack

attack: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

- Defined in [Tone/instrument/Sampler.ts:30](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Sampler.ts#L30)

### baseUrl

baseUrl: string

- Defined in [Tone/instrument/Sampler.ts:34](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Sampler.ts#L34)

### context

context: [BaseContext](../classes/BaseContext.md)

Inherited from InstrumentOptions.context

- Defined in [Tone/core/context/ToneWithContext.ts:28](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L28)

### curve

curve: OneShotSourceCurve

- Defined in [Tone/instrument/Sampler.ts:35](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Sampler.ts#L35)

### onerror

onerror: ((error) => void)

#### Type declaration

- - (error): void

  - #### Parameters

    - error: Error

    #### Returns void

- Defined in [Tone/instrument/Sampler.ts:33](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Sampler.ts#L33)

### onload

onload: (() => void)

#### Type declaration

- - (): void

  - #### Returns void

- Defined in [Tone/instrument/Sampler.ts:32](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Sampler.ts#L32)

### release

release: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

- Defined in [Tone/instrument/Sampler.ts:31](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Sampler.ts#L31)

### urls

urls: SamplesMap

- Defined in [Tone/instrument/Sampler.ts:36](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Sampler.ts#L36)

### volume

volume: number

Inherited from InstrumentOptions.volume

- Defined in [Tone/instrument/Instrument.ts:13](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Instrument.ts#L13)
