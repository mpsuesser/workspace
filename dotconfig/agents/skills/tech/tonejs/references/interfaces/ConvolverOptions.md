# Interface ConvolverOptions

The possible options for this node

interface ConvolverOptions {\
    [context](ConvolverOptions.md#context): [BaseContext](../classes/BaseContext.md);\
    [normalize](ConvolverOptions.md#normalize): boolean;\
    [onload](ConvolverOptions.md#onload): (() => void);\
    [url](ConvolverOptions.md#url)?: string \| AudioBuffer \| [ToneAudioBuffer](../classes/ToneAudioBuffer.md);\
}

#### Hierarchy ([view full](../hierarchy.md#ConvolverOptions))

- [ToneAudioNodeOptions](../types/ToneAudioNodeOptions.md)
  - ConvolverOptions

- Defined in [Tone/component/filter/Convolver.ts:10](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/component/filter/Convolver.ts#L10)

## Properties

### context

context: [BaseContext](../classes/BaseContext.md)

Inherited from ToneAudioNodeOptions.context

- Defined in [Tone/core/context/ToneWithContext.ts:28](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L28)

### normalize

normalize: boolean

- Defined in [Tone/component/filter/Convolver.ts:12](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/component/filter/Convolver.ts#L12)

### onload

onload: (() => void)

#### Type declaration

- - (): void

  - #### Returns void

- Defined in [Tone/component/filter/Convolver.ts:11](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/component/filter/Convolver.ts#L11)

### `Optional` url

url?: string \| AudioBuffer \| [ToneAudioBuffer](../classes/ToneAudioBuffer.md)

- Defined in [Tone/component/filter/Convolver.ts:13](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/component/filter/Convolver.ts#L13)
