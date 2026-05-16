# Interface FrequencyEnvelopeOptions

The possible options for this node

interface FrequencyEnvelopeOptions {\
    [attack](FrequencyEnvelopeOptions.md#attack): [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md);\
    [attackCurve](FrequencyEnvelopeOptions.md#attackCurve): [EnvelopeCurve](../types/EnvelopeCurve.md);\
    [baseFrequency](FrequencyEnvelopeOptions.md#baseFrequency): [Unit](../modules/Unit.md).[Frequency](../types/Unit.Frequency.md);\
    [context](FrequencyEnvelopeOptions.md#context): [BaseContext](../classes/BaseContext.md);\
    [decay](FrequencyEnvelopeOptions.md#decay): [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md);\
    [decayCurve](FrequencyEnvelopeOptions.md#decayCurve): BasicEnvelopeCurve;\
    [exponent](FrequencyEnvelopeOptions.md#exponent): number;\
    [octaves](FrequencyEnvelopeOptions.md#octaves): number;\
    [release](FrequencyEnvelopeOptions.md#release): [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md);\
    [releaseCurve](FrequencyEnvelopeOptions.md#releaseCurve): [EnvelopeCurve](../types/EnvelopeCurve.md);\
    [sustain](FrequencyEnvelopeOptions.md#sustain): number;\
}

#### Hierarchy ([view full](../hierarchy.md#FrequencyEnvelopeOptions))

- [EnvelopeOptions](EnvelopeOptions.md)
  - FrequencyEnvelopeOptions

- Defined in [Tone/component/envelope/FrequencyEnvelope.ts:8](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/component/envelope/FrequencyEnvelope.ts#L8)

## Properties

### attack

attack: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

Inherited from [EnvelopeOptions](EnvelopeOptions.md).[attack](EnvelopeOptions.md#attack)

- Defined in [Tone/component/envelope/Envelope.ts:19](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/component/envelope/Envelope.ts#L19)

### attackCurve

attackCurve: [EnvelopeCurve](../types/EnvelopeCurve.md)

Inherited from [EnvelopeOptions](EnvelopeOptions.md).[attackCurve](EnvelopeOptions.md#attackCurve)

- Defined in [Tone/component/envelope/Envelope.ts:23](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/component/envelope/Envelope.ts#L23)

### baseFrequency

baseFrequency: [Unit](../modules/Unit.md).[Frequency](../types/Unit.Frequency.md)

- Defined in [Tone/component/envelope/FrequencyEnvelope.ts:9](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/component/envelope/FrequencyEnvelope.ts#L9)

### context

context: [BaseContext](../classes/BaseContext.md)

Inherited from [EnvelopeOptions](EnvelopeOptions.md).[context](EnvelopeOptions.md#context)

- Defined in [Tone/core/context/ToneWithContext.ts:28](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L28)

### decay

decay: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

Inherited from [EnvelopeOptions](EnvelopeOptions.md).[decay](EnvelopeOptions.md#decay)

- Defined in [Tone/component/envelope/Envelope.ts:20](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/component/envelope/Envelope.ts#L20)

### decayCurve

decayCurve: BasicEnvelopeCurve

Inherited from [EnvelopeOptions](EnvelopeOptions.md).[decayCurve](EnvelopeOptions.md#decayCurve)

- Defined in [Tone/component/envelope/Envelope.ts:25](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/component/envelope/Envelope.ts#L25)

### exponent

exponent: number

- Defined in [Tone/component/envelope/FrequencyEnvelope.ts:11](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/component/envelope/FrequencyEnvelope.ts#L11)

### octaves

octaves: number

- Defined in [Tone/component/envelope/FrequencyEnvelope.ts:10](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/component/envelope/FrequencyEnvelope.ts#L10)

### release

release: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

Inherited from [EnvelopeOptions](EnvelopeOptions.md).[release](EnvelopeOptions.md#release)

- Defined in [Tone/component/envelope/Envelope.ts:22](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/component/envelope/Envelope.ts#L22)

### releaseCurve

releaseCurve: [EnvelopeCurve](../types/EnvelopeCurve.md)

Inherited from [EnvelopeOptions](EnvelopeOptions.md).[releaseCurve](EnvelopeOptions.md#releaseCurve)

- Defined in [Tone/component/envelope/Envelope.ts:24](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/component/envelope/Envelope.ts#L24)

### sustain

sustain: number

Inherited from [EnvelopeOptions](EnvelopeOptions.md).[sustain](EnvelopeOptions.md#sustain)

- Defined in [Tone/component/envelope/Envelope.ts:21](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/component/envelope/Envelope.ts#L21)
