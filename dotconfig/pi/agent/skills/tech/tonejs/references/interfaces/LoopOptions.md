# Interface LoopOptions

interface LoopOptions {\
    [callback](LoopOptions.md#callback): ((time) => void);\
    [context](LoopOptions.md#context): [BaseContext](../classes/BaseContext.md);\
    [humanize](LoopOptions.md#humanize): boolean \| [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md);\
    [interval](LoopOptions.md#interval): [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md);\
    [iterations](LoopOptions.md#iterations): number;\
    [mute](LoopOptions.md#mute): boolean;\
    [playbackRate](LoopOptions.md#playbackRate): number;\
    [probability](LoopOptions.md#probability): number;\
}

#### Hierarchy ([view full](../hierarchy.md#LoopOptions))

- ToneWithContextOptions
  - LoopOptions
    - [PatternOptions](PatternOptions.md)

- Defined in [Tone/event/Loop.ts:17](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Loop.ts#L17)

## Properties

### callback

callback: ((time) => void)

#### Type declaration

- - (time): void

  - #### Parameters

    - time: number

    #### Returns void

- Defined in [Tone/event/Loop.ts:18](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Loop.ts#L18)

### context

context: [BaseContext](../classes/BaseContext.md)

Inherited from ToneWithContextOptions.context

- Defined in [Tone/core/context/ToneWithContext.ts:28](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L28)

### humanize

humanize: boolean \| [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

- Defined in [Tone/event/Loop.ts:24](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Loop.ts#L24)

### interval

interval: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

- Defined in [Tone/event/Loop.ts:19](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Loop.ts#L19)

### iterations

iterations: number

- Defined in [Tone/event/Loop.ts:21](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Loop.ts#L21)

### mute

mute: boolean

- Defined in [Tone/event/Loop.ts:23](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Loop.ts#L23)

### playbackRate

playbackRate: number

- Defined in [Tone/event/Loop.ts:20](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Loop.ts#L20)

### probability

probability: number

- Defined in [Tone/event/Loop.ts:22](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Loop.ts#L22)
