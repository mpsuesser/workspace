# Interface ToneEventOptions<T>

interface ToneEventOptions<[T](ToneEventOptions.md#T)> {\
    [callback](ToneEventOptions.md#callback): [ToneEventCallback](../types/ToneEventCallback.md)<[T](ToneEventOptions.md#T)>;\
    [context](ToneEventOptions.md#context): [BaseContext](../classes/BaseContext.md);\
    [humanize](ToneEventOptions.md#humanize): boolean \| [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md);\
    [loop](ToneEventOptions.md#loop): number \| boolean;\
    [loopEnd](ToneEventOptions.md#loopEnd): [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md);\
    [loopStart](ToneEventOptions.md#loopStart): [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md);\
    [mute](ToneEventOptions.md#mute): boolean;\
    [playbackRate](ToneEventOptions.md#playbackRate): number;\
    [probability](ToneEventOptions.md#probability): number;\
    [value](ToneEventOptions.md#value)?: [T](ToneEventOptions.md#T);\
}

#### Type Parameters

- T

#### Hierarchy

- ToneWithContextOptions
  - ToneEventOptions

- Defined in [Tone/event/ToneEvent.ts:26](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/ToneEvent.ts#L26)

## Properties

### callback

callback: [ToneEventCallback](../types/ToneEventCallback.md)<[T](ToneEventOptions.md#T)>

- Defined in [Tone/event/ToneEvent.ts:27](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/ToneEvent.ts#L27)

### context

context: [BaseContext](../classes/BaseContext.md)

Inherited from ToneWithContextOptions.context

- Defined in [Tone/core/context/ToneWithContext.ts:28](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L28)

### humanize

humanize: boolean \| [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

- Defined in [Tone/event/ToneEvent.ts:35](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/ToneEvent.ts#L35)

### loop

loop: number \| boolean

- Defined in [Tone/event/ToneEvent.ts:28](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/ToneEvent.ts#L28)

### loopEnd

loopEnd: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

- Defined in [Tone/event/ToneEvent.ts:29](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/ToneEvent.ts#L29)

### loopStart

loopStart: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

- Defined in [Tone/event/ToneEvent.ts:30](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/ToneEvent.ts#L30)

### mute

mute: boolean

- Defined in [Tone/event/ToneEvent.ts:34](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/ToneEvent.ts#L34)

### playbackRate

playbackRate: number

- Defined in [Tone/event/ToneEvent.ts:31](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/ToneEvent.ts#L31)

### probability

probability: number

- Defined in [Tone/event/ToneEvent.ts:33](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/ToneEvent.ts#L33)

### `Optional` value

value?: [T](ToneEventOptions.md#T)

- Defined in [Tone/event/ToneEvent.ts:32](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/ToneEvent.ts#L32)
