# Interface SignalOptions<TypeName>

The possible options for this node

interface SignalOptions<[TypeName](SignalOptions.md#TypeName)> {\
    [context](SignalOptions.md#context): [BaseContext](../classes/BaseContext.md);\
    [convert](SignalOptions.md#convert): boolean;\
    [maxValue](SignalOptions.md#maxValue)?: number;\
    [minValue](SignalOptions.md#minValue)?: number;\
    [units](SignalOptions.md#units): [TypeName](SignalOptions.md#TypeName);\
    [value](SignalOptions.md#value): [UnitMap](Unit.UnitMap.md)\[[TypeName](SignalOptions.md#TypeName)\];\
}

#### Type Parameters

- TypeName extends [UnitName](../types/Unit.UnitName.md)

#### Hierarchy ([view full](../hierarchy.md#SignalOptions))

- [ToneAudioNodeOptions](../types/ToneAudioNodeOptions.md)
  - SignalOptions

- Defined in [Tone/signal/Signal.ts:15](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/Signal.ts#L15)

## Properties

### context

context: [BaseContext](../classes/BaseContext.md)

Inherited from ToneAudioNodeOptions.context

- Defined in [Tone/core/context/ToneWithContext.ts:28](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L28)

### convert

convert: boolean

- Defined in [Tone/signal/Signal.ts:19](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/Signal.ts#L19)

### `Optional` maxValue

maxValue?: number

- Defined in [Tone/signal/Signal.ts:21](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/Signal.ts#L21)

### `Optional` minValue

minValue?: number

- Defined in [Tone/signal/Signal.ts:20](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/Signal.ts#L20)

### units

units: [TypeName](SignalOptions.md#TypeName)

- Defined in [Tone/signal/Signal.ts:18](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/Signal.ts#L18)

### value

value: [UnitMap](Unit.UnitMap.md)\[[TypeName](SignalOptions.md#TypeName)\]

- Defined in [Tone/signal/Signal.ts:17](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/Signal.ts#L17)
