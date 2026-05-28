# Interface PlayersOptions

interface PlayersOptions {\
    [baseUrl](PlayersOptions.md#baseUrl): string;\
    [context](PlayersOptions.md#context): [BaseContext](../classes/BaseContext.md);\
    [fadeIn](PlayersOptions.md#fadeIn): [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md);\
    [fadeOut](PlayersOptions.md#fadeOut): [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md);\
    [mute](PlayersOptions.md#mute): boolean;\
    [onerror](PlayersOptions.md#onerror): ((error) => void);\
    [onload](PlayersOptions.md#onload): (() => void);\
    [onstop](PlayersOptions.md#onstop): onStopCallback;\
    [urls](PlayersOptions.md#urls): [ToneAudioBuffersUrlMap](ToneAudioBuffersUrlMap.md);\
    [volume](PlayersOptions.md#volume): number;\
}

#### Hierarchy

- SourceOptions
  - PlayersOptions

- Defined in [Tone/source/buffer/Players.ts:17](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Players.ts#L17)

## Properties

### baseUrl

baseUrl: string

- Defined in [Tone/source/buffer/Players.ts:23](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Players.ts#L23)

### context

context: [BaseContext](../classes/BaseContext.md)

Inherited from SourceOptions.context

- Defined in [Tone/core/context/ToneWithContext.ts:28](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L28)

### fadeIn

fadeIn: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

- Defined in [Tone/source/buffer/Players.ts:24](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Players.ts#L24)

### fadeOut

fadeOut: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

- Defined in [Tone/source/buffer/Players.ts:25](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Players.ts#L25)

### mute

mute: boolean

Overrides SourceOptions.mute

- Defined in [Tone/source/buffer/Players.ts:20](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Players.ts#L20)

### onerror

onerror: ((error) => void)

#### Type declaration

- - (error): void

  - #### Parameters

    - error: Error

    #### Returns void

- Defined in [Tone/source/buffer/Players.ts:22](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Players.ts#L22)

### onload

onload: (() => void)

#### Type declaration

- - (): void

  - #### Returns void

- Defined in [Tone/source/buffer/Players.ts:21](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Players.ts#L21)

### onstop

onstop: onStopCallback

Inherited from SourceOptions.onstop

- Defined in [Tone/source/Source.ts:27](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/Source.ts#L27)

### urls

urls: [ToneAudioBuffersUrlMap](ToneAudioBuffersUrlMap.md)

- Defined in [Tone/source/buffer/Players.ts:18](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Players.ts#L18)

### volume

volume: number

Overrides SourceOptions.volume

- Defined in [Tone/source/buffer/Players.ts:19](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Players.ts#L19)
