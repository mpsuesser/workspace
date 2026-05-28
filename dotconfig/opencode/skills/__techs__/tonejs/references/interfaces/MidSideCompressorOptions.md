# Interface MidSideCompressorOptions

The possible options for this node

interface MidSideCompressorOptions {\
    [context](MidSideCompressorOptions.md#context): [BaseContext](../classes/BaseContext.md);\
    [mid](MidSideCompressorOptions.md#mid): Omit<[CompressorOptions](CompressorOptions.md), "context">;\
    [side](MidSideCompressorOptions.md#side): Omit<[CompressorOptions](CompressorOptions.md), "context">;\
}

#### Hierarchy ([view full](../hierarchy.md#MidSideCompressorOptions))

- [ToneAudioNodeOptions](../types/ToneAudioNodeOptions.md)
  - MidSideCompressorOptions

- Defined in [Tone/component/dynamics/MidSideCompressor.ts:13](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/component/dynamics/MidSideCompressor.ts#L13)

## Properties

### context

context: [BaseContext](../classes/BaseContext.md)

Inherited from ToneAudioNodeOptions.context

- Defined in [Tone/core/context/ToneWithContext.ts:28](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L28)

### mid

mid: Omit<[CompressorOptions](CompressorOptions.md), "context">

- Defined in [Tone/component/dynamics/MidSideCompressor.ts:14](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/component/dynamics/MidSideCompressor.ts#L14)

### side

side: Omit<[CompressorOptions](CompressorOptions.md), "context">

- Defined in [Tone/component/dynamics/MidSideCompressor.ts:15](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/component/dynamics/MidSideCompressor.ts#L15)
