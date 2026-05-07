# Interface WaveformOptions

interface WaveformOptions {\
    [context](WaveformOptions.md#context): [BaseContext](../classes/BaseContext.md);\
    [size](WaveformOptions.md#size): number;\
}

#### Hierarchy

- MeterBaseOptions
  - WaveformOptions

- Defined in [Tone/component/analysis/Waveform.ts:5](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/component/analysis/Waveform.ts#L5)

## Properties

### context

context: [BaseContext](../classes/BaseContext.md)

Inherited from MeterBaseOptions.context

- Defined in [Tone/core/context/ToneWithContext.ts:28](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L28)

### size

size: number

The size of the Waveform. Value must be a power of two in the range 16 to 16384.

- Defined in [Tone/component/analysis/Waveform.ts:9](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/component/analysis/Waveform.ts#L9)
