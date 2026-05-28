# Interface EnvelopeOptions

The possible options for this node

interface EnvelopeOptions {\
    [attack](EnvelopeOptions.md#attack): [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md);\
    [attackCurve](EnvelopeOptions.md#attackCurve): [EnvelopeCurve](../types/EnvelopeCurve.md);\
    [context](EnvelopeOptions.md#context): [BaseContext](../classes/BaseContext.md);\
    [decay](EnvelopeOptions.md#decay): [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md);\
    [decayCurve](EnvelopeOptions.md#decayCurve): BasicEnvelopeCurve;\
    [release](EnvelopeOptions.md#release): [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md);\
    [releaseCurve](EnvelopeOptions.md#releaseCurve): [EnvelopeCurve](../types/EnvelopeCurve.md);\
    [sustain](EnvelopeOptions.md#sustain): number;\
}

#### Hierarchy ([view full](../hierarchy.md#EnvelopeOptions))

- [ToneAudioNodeOptions](../types/ToneAudioNodeOptions.md)
  - EnvelopeOptions
    - [FrequencyEnvelopeOptions](FrequencyEnvelopeOptions.md)

- Defined in [Tone/component/envelope/Envelope.ts:18](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/component/envelope/Envelope.ts#L18)

## Properties

### attack

attack: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

- Defined in [Tone/component/envelope/Envelope.ts:19](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/component/envelope/Envelope.ts#L19)

### attackCurve

attackCurve: [EnvelopeCurve](../types/EnvelopeCurve.md)

- Defined in [Tone/component/envelope/Envelope.ts:23](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/component/envelope/Envelope.ts#L23)

### context

context: [BaseContext](../classes/BaseContext.md)

Inherited from ToneAudioNodeOptions.context

- Defined in [Tone/core/context/ToneWithContext.ts:28](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L28)

### decay

decay: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

- Defined in [Tone/component/envelope/Envelope.ts:20](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/component/envelope/Envelope.ts#L20)

### decayCurve

decayCurve: BasicEnvelopeCurve

- Defined in [Tone/component/envelope/Envelope.ts:25](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/component/envelope/Envelope.ts#L25)

### release

release: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

- Defined in [Tone/component/envelope/Envelope.ts:22](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/component/envelope/Envelope.ts#L22)

### releaseCurve

releaseCurve: [EnvelopeCurve](../types/EnvelopeCurve.md)

- Defined in [Tone/component/envelope/Envelope.ts:24](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/component/envelope/Envelope.ts#L24)

### sustain

sustain: number

- Defined in [Tone/component/envelope/Envelope.ts:21](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/component/envelope/Envelope.ts#L21)
