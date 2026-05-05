# Interface PatternOptions<ValueType>

interface PatternOptions<[ValueType](PatternOptions.md#ValueType)> {\
    [callback](PatternOptions.md#callback): ((time, value?) => void);\
    [context](PatternOptions.md#context): [BaseContext](../classes/BaseContext.md);\
    [humanize](PatternOptions.md#humanize): boolean \| [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md);\
    [interval](PatternOptions.md#interval): [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md);\
    [iterations](PatternOptions.md#iterations): number;\
    [mute](PatternOptions.md#mute): boolean;\
    [pattern](PatternOptions.md#pattern): PatternName;\
    [playbackRate](PatternOptions.md#playbackRate): number;\
    [probability](PatternOptions.md#probability): number;\
    [values](PatternOptions.md#values): [ValueType](PatternOptions.md#ValueType)\[\];\
}

#### Type Parameters

- ValueType

#### Hierarchy ([view full](../hierarchy.md#PatternOptions))

- [LoopOptions](LoopOptions.md)
  - PatternOptions

- Defined in [Tone/event/Pattern.ts:8](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Pattern.ts#L8)

## Properties

### callback

callback: ((time, value?) => void)

#### Type declaration

- - (time, value?): void

  - #### Parameters

    - time: number
    - `Optional` value: [ValueType](PatternOptions.md#ValueType)

    #### Returns void

Overrides [LoopOptions](LoopOptions.md).[callback](LoopOptions.md#callback)

- Defined in [Tone/event/Pattern.ts:11](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Pattern.ts#L11)

### context

context: [BaseContext](../classes/BaseContext.md)

Inherited from [LoopOptions](LoopOptions.md).[context](LoopOptions.md#context)

- Defined in [Tone/core/context/ToneWithContext.ts:28](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L28)

### humanize

humanize: boolean \| [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

Inherited from [LoopOptions](LoopOptions.md).[humanize](LoopOptions.md#humanize)

- Defined in [Tone/event/Loop.ts:24](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Loop.ts#L24)

### interval

interval: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

Inherited from [LoopOptions](LoopOptions.md).[interval](LoopOptions.md#interval)

- Defined in [Tone/event/Loop.ts:19](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Loop.ts#L19)

### iterations

iterations: number

Inherited from [LoopOptions](LoopOptions.md).[iterations](LoopOptions.md#iterations)

- Defined in [Tone/event/Loop.ts:21](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Loop.ts#L21)

### mute

mute: boolean

Inherited from [LoopOptions](LoopOptions.md).[mute](LoopOptions.md#mute)

- Defined in [Tone/event/Loop.ts:23](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Loop.ts#L23)

### pattern

pattern: PatternName

- Defined in [Tone/event/Pattern.ts:9](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Pattern.ts#L9)

### playbackRate

playbackRate: number

Inherited from [LoopOptions](LoopOptions.md).[playbackRate](LoopOptions.md#playbackRate)

- Defined in [Tone/event/Loop.ts:20](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Loop.ts#L20)

### probability

probability: number

Inherited from [LoopOptions](LoopOptions.md).[probability](LoopOptions.md#probability)

- Defined in [Tone/event/Loop.ts:22](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Loop.ts#L22)

### values

values: [ValueType](PatternOptions.md#ValueType)\[\]

- Defined in [Tone/event/Pattern.ts:10](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Pattern.ts#L10)
