# Interface AutoFilterOptions

interface AutoFilterOptions {\
    [baseFrequency](AutoFilterOptions.md#baseFrequency): [Unit](../modules/Unit.md).[Frequency](../types/Unit.Frequency.md);\
    [context](AutoFilterOptions.md#context): [BaseContext](../classes/BaseContext.md);\
    [depth](AutoFilterOptions.md#depth): number;\
    [filter](AutoFilterOptions.md#filter): Omit<[FilterOptions](../types/FilterOptions.md), "gain" \| "frequency" \| "detune" \| (keyof SourceOptions)>;\
    [frequency](AutoFilterOptions.md#frequency): [Unit](../modules/Unit.md).[Frequency](../types/Unit.Frequency.md);\
    [octaves](AutoFilterOptions.md#octaves): number;\
    [type](AutoFilterOptions.md#type): [ToneOscillatorType](../types/ToneOscillatorType.md);\
    [wet](AutoFilterOptions.md#wet): number;\
}

#### Hierarchy

- LFOEffectOptions
  - AutoFilterOptions

- Defined in [Tone/effect/AutoFilter.ts:7](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/effect/AutoFilter.ts#L7)

## Properties

### baseFrequency

baseFrequency: [Unit](../modules/Unit.md).[Frequency](../types/Unit.Frequency.md)

- Defined in [Tone/effect/AutoFilter.ts:8](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/effect/AutoFilter.ts#L8)

### context

context: [BaseContext](../classes/BaseContext.md)

Inherited from LFOEffectOptions.context

- Defined in [Tone/core/context/ToneWithContext.ts:28](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L28)

### depth

depth: number

Inherited from LFOEffectOptions.depth

- Defined in [Tone/effect/LFOEffect.ts:12](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/effect/LFOEffect.ts#L12)

### filter

filter: Omit<[FilterOptions](../types/FilterOptions.md), "gain" \| "frequency" \| "detune" \| (keyof SourceOptions)>

- Defined in [Tone/effect/AutoFilter.ts:10](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/effect/AutoFilter.ts#L10)

### frequency

frequency: [Unit](../modules/Unit.md).[Frequency](../types/Unit.Frequency.md)

Inherited from LFOEffectOptions.frequency

- Defined in [Tone/effect/LFOEffect.ts:10](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/effect/LFOEffect.ts#L10)

### octaves

octaves: number

- Defined in [Tone/effect/AutoFilter.ts:9](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/effect/AutoFilter.ts#L9)

### type

type: [ToneOscillatorType](../types/ToneOscillatorType.md)

Inherited from LFOEffectOptions.type

- Defined in [Tone/effect/LFOEffect.ts:11](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/effect/LFOEffect.ts#L11)

### wet

wet: number

Inherited from LFOEffectOptions.wet

- Defined in [Tone/effect/Effect.ts:12](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/effect/Effect.ts#L12)
