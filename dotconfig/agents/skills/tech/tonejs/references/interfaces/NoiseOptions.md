# Interface NoiseOptions

interface NoiseOptions {\
    [context](NoiseOptions.md#context): [BaseContext](../classes/BaseContext.md);\
    [fadeIn](NoiseOptions.md#fadeIn): [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md);\
    [fadeOut](NoiseOptions.md#fadeOut): [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md);\
    [mute](NoiseOptions.md#mute): boolean;\
    [onstop](NoiseOptions.md#onstop): onStopCallback;\
    [playbackRate](NoiseOptions.md#playbackRate): number;\
    [type](NoiseOptions.md#type): [NoiseType](../types/NoiseType.md);\
    [volume](NoiseOptions.md#volume): number;\
}

#### Hierarchy

- SourceOptions
  - NoiseOptions

- Defined in [Tone/source/Noise.ts:10](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/Noise.ts#L10)

## Properties

### context

context: [BaseContext](../classes/BaseContext.md)

Inherited from SourceOptions.context

- Defined in [Tone/core/context/ToneWithContext.ts:28](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L28)

### fadeIn

fadeIn: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

- Defined in [Tone/source/Noise.ts:13](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/Noise.ts#L13)

### fadeOut

fadeOut: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

- Defined in [Tone/source/Noise.ts:14](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/Noise.ts#L14)

### mute

mute: boolean

Inherited from SourceOptions.mute

- Defined in [Tone/source/Source.ts:26](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/Source.ts#L26)

### onstop

onstop: onStopCallback

Inherited from SourceOptions.onstop

- Defined in [Tone/source/Source.ts:27](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/Source.ts#L27)

### playbackRate

playbackRate: number

- Defined in [Tone/source/Noise.ts:12](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/Noise.ts#L12)

### type

type: [NoiseType](../types/NoiseType.md)

- Defined in [Tone/source/Noise.ts:11](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/Noise.ts#L11)

### volume

volume: number

Inherited from SourceOptions.volume

- Defined in [Tone/source/Source.ts:25](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/Source.ts#L25)
