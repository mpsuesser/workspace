# Interface PlayerOptions

interface PlayerOptions {\
    [autostart](PlayerOptions.md#autostart): boolean;\
    [context](PlayerOptions.md#context): [BaseContext](../classes/BaseContext.md);\
    [fadeIn](PlayerOptions.md#fadeIn): [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md);\
    [fadeOut](PlayerOptions.md#fadeOut): [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md);\
    [loop](PlayerOptions.md#loop): boolean;\
    [loopEnd](PlayerOptions.md#loopEnd): [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md);\
    [loopStart](PlayerOptions.md#loopStart): [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md);\
    [mute](PlayerOptions.md#mute): boolean;\
    [onerror](PlayerOptions.md#onerror): ((error) => void);\
    [onload](PlayerOptions.md#onload): (() => void);\
    [onstop](PlayerOptions.md#onstop): onStopCallback;\
    [playbackRate](PlayerOptions.md#playbackRate): number;\
    [reverse](PlayerOptions.md#reverse): boolean;\
    [url](PlayerOptions.md#url)?: string \| AudioBuffer \| [ToneAudioBuffer](../classes/ToneAudioBuffer.md);\
    [volume](PlayerOptions.md#volume): number;\
}

#### Hierarchy

- SourceOptions
  - PlayerOptions

- Defined in [Tone/source/buffer/Player.ts:11](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Player.ts#L11)

## Properties

### autostart

autostart: boolean

- Defined in [Tone/source/buffer/Player.ts:16](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Player.ts#L16)

### context

context: [BaseContext](../classes/BaseContext.md)

Inherited from SourceOptions.context

- Defined in [Tone/core/context/ToneWithContext.ts:28](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L28)

### fadeIn

fadeIn: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

- Defined in [Tone/source/buffer/Player.ts:20](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Player.ts#L20)

### fadeOut

fadeOut: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

- Defined in [Tone/source/buffer/Player.ts:21](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Player.ts#L21)

### loop

loop: boolean

- Defined in [Tone/source/buffer/Player.ts:15](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Player.ts#L15)

### loopEnd

loopEnd: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

- Defined in [Tone/source/buffer/Player.ts:18](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Player.ts#L18)

### loopStart

loopStart: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

- Defined in [Tone/source/buffer/Player.ts:17](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Player.ts#L17)

### mute

mute: boolean

Inherited from SourceOptions.mute

- Defined in [Tone/source/Source.ts:26](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/Source.ts#L26)

### onerror

onerror: ((error) => void)

#### Type declaration

- - (error): void

  - #### Parameters

    - error: Error

    #### Returns void

- Defined in [Tone/source/buffer/Player.ts:13](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Player.ts#L13)

### onload

onload: (() => void)

#### Type declaration

- - (): void

  - #### Returns void

- Defined in [Tone/source/buffer/Player.ts:12](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Player.ts#L12)

### onstop

onstop: onStopCallback

Inherited from SourceOptions.onstop

- Defined in [Tone/source/Source.ts:27](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/Source.ts#L27)

### playbackRate

playbackRate: number

- Defined in [Tone/source/buffer/Player.ts:14](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Player.ts#L14)

### reverse

reverse: boolean

- Defined in [Tone/source/buffer/Player.ts:19](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Player.ts#L19)

### `Optional` url

url?: string \| AudioBuffer \| [ToneAudioBuffer](../classes/ToneAudioBuffer.md)

- Defined in [Tone/source/buffer/Player.ts:22](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Player.ts#L22)

### volume

volume: number

Inherited from SourceOptions.volume

- Defined in [Tone/source/Source.ts:25](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/Source.ts#L25)
