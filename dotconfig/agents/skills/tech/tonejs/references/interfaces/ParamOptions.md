# Interface ParamOptions<TypeName>

interface ParamOptions<[TypeName](ParamOptions.md#TypeName)> {\
    [context](ParamOptions.md#context): [BaseContext](../classes/BaseContext.md);\
    [convert](ParamOptions.md#convert): boolean;\
    [maxValue](ParamOptions.md#maxValue)?: number;\
    [minValue](ParamOptions.md#minValue)?: number;\
    [param](ParamOptions.md#param): AudioParam \| [Param](../classes/Param.md)<[TypeName](ParamOptions.md#TypeName)>;\
    [swappable](ParamOptions.md#swappable)?: boolean;\
    [units](ParamOptions.md#units): [TypeName](ParamOptions.md#TypeName);\
    [value](ParamOptions.md#value)?: [UnitMap](Unit.UnitMap.md)\[[TypeName](ParamOptions.md#TypeName)\];\
}

#### Type Parameters

- TypeName extends [UnitName](../types/Unit.UnitName.md)

#### Hierarchy

- ToneWithContextOptions
  - ParamOptions

- Defined in [Tone/core/context/Param.ts:19](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Param.ts#L19)

## Properties

### context

context: [BaseContext](../classes/BaseContext.md)

Inherited from ToneWithContextOptions.context

- Defined in [Tone/core/context/ToneWithContext.ts:28](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L28)

### convert

convert: boolean

- Defined in [Tone/core/context/Param.ts:24](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Param.ts#L24)

### `Optional` maxValue

maxValue?: number

- Defined in [Tone/core/context/Param.ts:26](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Param.ts#L26)

### `Optional` minValue

minValue?: number

- Defined in [Tone/core/context/Param.ts:25](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Param.ts#L25)

### param

param: AudioParam \| [Param](../classes/Param.md)<[TypeName](ParamOptions.md#TypeName)>

- Defined in [Tone/core/context/Param.ts:23](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Param.ts#L23)

### `Optional` swappable

swappable?: boolean

- Defined in [Tone/core/context/Param.ts:27](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Param.ts#L27)

### units

units: [TypeName](ParamOptions.md#TypeName)

- Defined in [Tone/core/context/Param.ts:21](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Param.ts#L21)

### `Optional` value

value?: [UnitMap](Unit.UnitMap.md)\[[TypeName](ParamOptions.md#TypeName)\]

- Defined in [Tone/core/context/Param.ts:22](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Param.ts#L22)
