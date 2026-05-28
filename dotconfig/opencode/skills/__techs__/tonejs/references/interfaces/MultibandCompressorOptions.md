# Interface MultibandCompressorOptions

The possible options for this node

interface MultibandCompressorOptions {\
    [context](MultibandCompressorOptions.md#context): [BaseContext](../classes/BaseContext.md);\
    [high](MultibandCompressorOptions.md#high): Omit<[CompressorOptions](CompressorOptions.md), "context">;\
    [highFrequency](MultibandCompressorOptions.md#highFrequency): [Unit](../modules/Unit.md).[Frequency](../types/Unit.Frequency.md);\
    [low](MultibandCompressorOptions.md#low): Omit<[CompressorOptions](CompressorOptions.md), "context">;\
    [lowFrequency](MultibandCompressorOptions.md#lowFrequency): [Unit](../modules/Unit.md).[Frequency](../types/Unit.Frequency.md);\
    [mid](MultibandCompressorOptions.md#mid): Omit<[CompressorOptions](CompressorOptions.md), "context">;\
}

#### Hierarchy ([view full](../hierarchy.md#MultibandCompressorOptions))

- [ToneAudioNodeOptions](../types/ToneAudioNodeOptions.md)
  - MultibandCompressorOptions

- Defined in [Tone/component/dynamics/MultibandCompressor.ts:14](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/component/dynamics/MultibandCompressor.ts#L14)

## Properties

### context

context: [BaseContext](../classes/BaseContext.md)

Inherited from ToneAudioNodeOptions.context

- Defined in [Tone/core/context/ToneWithContext.ts:28](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L28)

### high

high: Omit<[CompressorOptions](CompressorOptions.md), "context">

- Defined in [Tone/component/dynamics/MultibandCompressor.ts:17](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/component/dynamics/MultibandCompressor.ts#L17)

### highFrequency

highFrequency: [Unit](../modules/Unit.md).[Frequency](../types/Unit.Frequency.md)

- Defined in [Tone/component/dynamics/MultibandCompressor.ts:19](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/component/dynamics/MultibandCompressor.ts#L19)

### low

low: Omit<[CompressorOptions](CompressorOptions.md), "context">

- Defined in [Tone/component/dynamics/MultibandCompressor.ts:16](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/component/dynamics/MultibandCompressor.ts#L16)

### lowFrequency

lowFrequency: [Unit](../modules/Unit.md).[Frequency](../types/Unit.Frequency.md)

- Defined in [Tone/component/dynamics/MultibandCompressor.ts:18](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/component/dynamics/MultibandCompressor.ts#L18)

### mid

mid: Omit<[CompressorOptions](CompressorOptions.md), "context">

- Defined in [Tone/component/dynamics/MultibandCompressor.ts:15](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/component/dynamics/MultibandCompressor.ts#L15)
