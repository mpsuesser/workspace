# Interface ToneBufferSourceOptions

interface ToneBufferSourceOptions {\
    [context](ToneBufferSourceOptions.md#context): [BaseContext](../classes/BaseContext.md);\
    [curve](ToneBufferSourceOptions.md#curve): OneShotSourceCurve;\
    [fadeIn](ToneBufferSourceOptions.md#fadeIn): [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md);\
    [fadeOut](ToneBufferSourceOptions.md#fadeOut): [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md);\
    [loop](ToneBufferSourceOptions.md#loop): boolean;\
    [loopEnd](ToneBufferSourceOptions.md#loopEnd): [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md);\
    [loopStart](ToneBufferSourceOptions.md#loopStart): [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md);\
    [onended](ToneBufferSourceOptions.md#onended): onEndedCallback;\
    [onerror](ToneBufferSourceOptions.md#onerror): ((error) => void);\
    [onload](ToneBufferSourceOptions.md#onload): (() => void);\
    [playbackRate](ToneBufferSourceOptions.md#playbackRate): number;\
    [url](ToneBufferSourceOptions.md#url): string \| AudioBuffer \| [ToneAudioBuffer](../classes/ToneAudioBuffer.md);\
}

#### Hierarchy

- OneShotSourceOptions
  - ToneBufferSourceOptions

- Defined in [Tone/source/buffer/ToneBufferSource.ts:18](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/ToneBufferSource.ts#L18)

## Properties

### context

context: [BaseContext](../classes/BaseContext.md)

Inherited from OneShotSourceOptions.context

- Defined in [Tone/core/context/ToneWithContext.ts:28](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L28)

### curve

curve: OneShotSourceCurve

Overrides OneShotSourceOptions.curve

- Defined in [Tone/source/buffer/ToneBufferSource.ts:20](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/ToneBufferSource.ts#L20)

### fadeIn

fadeIn: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

Overrides OneShotSourceOptions.fadeIn

- Defined in [Tone/source/buffer/ToneBufferSource.ts:22](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/ToneBufferSource.ts#L22)

### fadeOut

fadeOut: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

Overrides OneShotSourceOptions.fadeOut

- Defined in [Tone/source/buffer/ToneBufferSource.ts:23](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/ToneBufferSource.ts#L23)

### loop

loop: boolean

- Defined in [Tone/source/buffer/ToneBufferSource.ts:26](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/ToneBufferSource.ts#L26)

### loopEnd

loopEnd: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

- Defined in [Tone/source/buffer/ToneBufferSource.ts:25](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/ToneBufferSource.ts#L25)

### loopStart

loopStart: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

- Defined in [Tone/source/buffer/ToneBufferSource.ts:24](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/ToneBufferSource.ts#L24)

### onended

onended: onEndedCallback

Inherited from OneShotSourceOptions.onended

- Defined in [Tone/source/OneShotSource.ts:16](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/OneShotSource.ts#L16)

### onerror

onerror: ((error) => void)

#### Type declaration

- - (error): void

  - #### Parameters

    - error: Error

    #### Returns void

- Defined in [Tone/source/buffer/ToneBufferSource.ts:28](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/ToneBufferSource.ts#L28)

### onload

onload: (() => void)

#### Type declaration

- - (): void

  - #### Returns void

- Defined in [Tone/source/buffer/ToneBufferSource.ts:27](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/ToneBufferSource.ts#L27)

### playbackRate

playbackRate: number

- Defined in [Tone/source/buffer/ToneBufferSource.ts:21](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/ToneBufferSource.ts#L21)

### url

url: string \| AudioBuffer \| [ToneAudioBuffer](../classes/ToneAudioBuffer.md)

- Defined in [Tone/source/buffer/ToneBufferSource.ts:19](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/ToneBufferSource.ts#L19)
