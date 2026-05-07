# Class FrequencyEnvelope

FrequencyEnvelope is an [Envelope](Envelope.md) which ramps between [baseFrequency](FrequencyEnvelope.md#baseFrequency) and [octaves](FrequencyEnvelope.md#octaves). It can also have an optional [exponent](FrequencyEnvelope.md#exponent) to adjust the curve which it ramps.

#### Example

``` ts
const oscillator = new Tone.Oscillator().toDestination().start();
const freqEnv = new Tone.FrequencyEnvelope({
    attack: 0.2,
    baseFrequency: "C2",
    octaves: 4
});
freqEnv.connect(oscillator.frequency);
freqEnv.triggerAttack();
```

#### Hierarchy ([view full](../hierarchy.md#FrequencyEnvelope))

- [Envelope](Envelope.md)
  - FrequencyEnvelope

- Defined in [Tone/component/envelope/FrequencyEnvelope.ts:28](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/component/envelope/FrequencyEnvelope.ts#L28)

## Constructors

### constructor

- new FrequencyEnvelope(attack?, decay?, sustain?, release?): [FrequencyEnvelope](FrequencyEnvelope.md)

- #### Parameters

  - `Optional` attack: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
    the attack time in seconds
  - `Optional` decay: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
    the decay time in seconds
  - `Optional` sustain: number
    a percentage (0-1) of the full amplitude
  - `Optional` release: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
    the release time in seconds

  #### Returns [FrequencyEnvelope](FrequencyEnvelope.md)

  Overrides [Envelope](Envelope.md).[constructor](Envelope.md#constructor)

  - Defined in [Tone/component/envelope/FrequencyEnvelope.ts:57](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/component/envelope/FrequencyEnvelope.ts#L57)

- new FrequencyEnvelope(options?): [FrequencyEnvelope](FrequencyEnvelope.md)

- #### Parameters

  - `Optional` options: Partial<[FrequencyEnvelopeOptions](../interfaces/FrequencyEnvelopeOptions.md)>

  #### Returns [FrequencyEnvelope](FrequencyEnvelope.md)

  Overrides [Envelope](Envelope.md).[constructor](Envelope.md#constructor)

  - Defined in [Tone/component/envelope/FrequencyEnvelope.ts:63](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/component/envelope/FrequencyEnvelope.ts#L63)

## Properties

### attack

attack: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

When triggerAttack is called, the attack time is the amount of time it takes for the envelope to reach it's maximum value.

              /\
             /X \
            /XX  \
           /XXX   \
          /XXXX    \___________
         /XXXXX                \
        /XXXXXX                 \
       /XXXXXXX                  \
      /XXXXXXXX                   \

#### Min

0

#### Max

2

Inherited from [Envelope](Envelope.md).[attack](Envelope.md#attack)

- Defined in [Tone/component/envelope/Envelope.ts:76](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/component/envelope/Envelope.ts#L76)

### `Readonly` context

context: [BaseContext](BaseContext.md)

The context belonging to the node.

Inherited from [Envelope](Envelope.md).[context](Envelope.md#context)

- Defined in [Tone/core/context/ToneWithContext.ts:40](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L40)

### debug

debug: boolean = false

Set this debug flag to log all events that happen in this class.

Inherited from [Envelope](Envelope.md).[debug](Envelope.md#debug)

- Defined in [Tone/core/Tone.ts:49](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L49)

### decay

decay: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

After the attack portion of the envelope, the value will fall over the duration of the decay time to it's sustain value.

              /\
             / X\
            /  XX\
           /   XXX\
          /    XXXX\___________
         /     XXXXX           \
        /      XXXXX            \
       /       XXXXX             \
      /        XXXXX              \

#### Min

0

#### Max

2

Inherited from [Envelope](Envelope.md).[decay](Envelope.md#decay)

- Defined in [Tone/component/envelope/Envelope.ts:96](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/component/envelope/Envelope.ts#L96)

### input

input: undefined \| [InputNode](../types/InputNode.md) = undefined

Envelope has no input

Inherited from [Envelope](Envelope.md).[input](Envelope.md#input)

- Defined in [Tone/component/envelope/Envelope.ts:169](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/component/envelope/Envelope.ts#L169)

### `Readonly` name

name: string = "FrequencyEnvelope"

The name of the class

Overrides [Envelope](Envelope.md).[name](Envelope.md#name)

- Defined in [Tone/component/envelope/FrequencyEnvelope.ts:29](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/component/envelope/FrequencyEnvelope.ts#L29)

### output

output: [OutputNode](../types/OutputNode.md) = ...

The output signal of the envelope

Inherited from [Envelope](Envelope.md).[output](Envelope.md#output)

- Defined in [Tone/component/envelope/Envelope.ts:164](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/component/envelope/Envelope.ts#L164)

### release

release: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

After triggerRelease is called, the envelope's value will fall to it's miminum value over the duration of the release time.

              /\
             /  \
            /    \
           /      \
          /        \___________
         /                    X\
        /                     XX\
       /                      XXX\
      /                       XXXX\

#### Min

0

#### Max

5

Inherited from [Envelope](Envelope.md).[release](Envelope.md#release)

- Defined in [Tone/component/envelope/Envelope.ts:136](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/component/envelope/Envelope.ts#L136)

### sustain

sustain: number

The sustain value is the value which the envelope rests at after triggerAttack is called, but before triggerRelease is invoked.

              /\
             /  \
            /    \
           /      \
          /        \___________
         /          XXXXXXXXXXX\
        /           XXXXXXXXXXX \
       /            XXXXXXXXXXX  \
      /             XXXXXXXXXXX   \

Inherited from [Envelope](Envelope.md).[sustain](Envelope.md#sustain)

- Defined in [Tone/component/envelope/Envelope.ts:115](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/component/envelope/Envelope.ts#L115)

### `Static` version

version: string = version

The version number semver

Inherited from [Envelope](Envelope.md).[version](Envelope.md#version)

- Defined in [Tone/core/Tone.ts:28](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L28)

## Accessors

### attackCurve

- get attackCurve(): [EnvelopeCurve](../types/EnvelopeCurve.md)

- The shape of the attack. Can be any of these strings:

  - "linear"
  - "exponential"
  - "sine"
  - "cosine"
  - "bounce"
  - "ripple"
  - "step"

  Can also be an array which describes the curve. Values in the array are evenly subdivided and linearly interpolated over the duration of the attack.

  #### Returns [EnvelopeCurve](../types/EnvelopeCurve.md)

  #### Example

  ``` ts
  return Tone.Offline(() => {
      const env = new Tone.Envelope(0.4).toDestination();
      env.attackCurve = "linear";
      env.triggerAttack();
  }, 1, 1);
  ```

  Inherited from Envelope.attackCurve

  - Defined in [Tone/component/envelope/Envelope.ts:299](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/component/envelope/Envelope.ts#L299)

- set attackCurve(curve): void

- #### Parameters

  - curve: [EnvelopeCurve](../types/EnvelopeCurve.md)

  #### Returns void

  Inherited from Envelope.attackCurve

  - Defined in [Tone/component/envelope/Envelope.ts:302](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/component/envelope/Envelope.ts#L302)

### baseFrequency

- get baseFrequency(): [Unit](../modules/Unit.md).[Frequency](../types/Unit.Frequency.md)

- The envelope's minimum output value. This is the value which it starts at.

  #### Returns [Unit](../modules/Unit.md).[Frequency](../types/Unit.Frequency.md)

  - Defined in [Tone/component/envelope/FrequencyEnvelope.ts:99](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/component/envelope/FrequencyEnvelope.ts#L99)

- set baseFrequency(min): void

- #### Parameters

  - min: [Unit](../modules/Unit.md).[Frequency](../types/Unit.Frequency.md)

  #### Returns void

  - Defined in [Tone/component/envelope/FrequencyEnvelope.ts:102](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/component/envelope/FrequencyEnvelope.ts#L102)

### blockTime

- get blockTime(): number

- The number of seconds of 1 processing block (128 samples)

  #### Returns number

  #### Example

  ``` ts
  console.log(Tone.Destination.blockTime);
  ```

  Inherited from Envelope.blockTime

  - Defined in [Tone/core/context/ToneWithContext.ts:108](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L108)

### channelCount

- get channelCount(): number

- channelCount is the number of channels used when up-mixing and down-mixing connections to any inputs to the node. The default value is 2 except for specific nodes where its value is specially determined.

  #### Returns number

  Inherited from Envelope.channelCount

  - Defined in [Tone/core/context/ToneAudioNode.ts:153](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L153)

- set channelCount(channelCount): void

- #### Parameters

  - channelCount: number

  #### Returns void

  Inherited from Envelope.channelCount

  - Defined in [Tone/core/context/ToneAudioNode.ts:156](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L156)

### channelCountMode

- get channelCountMode(): ChannelCountMode

- channelCountMode determines how channels will be counted when up-mixing and down-mixing connections to any inputs to the node. The default value is "max". This attribute has no effect for nodes with no inputs.

  - "max" - computedNumberOfChannels is the maximum of the number of channels of all connections to an input. In this mode channelCount is ignored.
  - "clamped-max" - computedNumberOfChannels is determined as for "max" and then clamped to a maximum value of the given channelCount.
  - "explicit" - computedNumberOfChannels is the exact value as specified by the channelCount.

  #### Returns ChannelCountMode

  Inherited from Envelope.channelCountMode

  - Defined in [Tone/core/context/ToneAudioNode.ts:170](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L170)

- set channelCountMode(channelCountMode): void

- #### Parameters

  - channelCountMode: ChannelCountMode

  #### Returns void

  Inherited from Envelope.channelCountMode

  - Defined in [Tone/core/context/ToneAudioNode.ts:173](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L173)

### channelInterpretation

- get channelInterpretation(): ChannelInterpretation

- channelInterpretation determines how individual channels will be treated when up-mixing and down-mixing connections to any inputs to the node. The default value is "speakers".

  #### Returns ChannelInterpretation

  Inherited from Envelope.channelInterpretation

  - Defined in [Tone/core/context/ToneAudioNode.ts:184](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L184)

- set channelInterpretation(channelInterpretation): void

- #### Parameters

  - channelInterpretation: ChannelInterpretation

  #### Returns void

  Inherited from Envelope.channelInterpretation

  - Defined in [Tone/core/context/ToneAudioNode.ts:187](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L187)

### decayCurve

- get decayCurve(): [EnvelopeCurve](../types/EnvelopeCurve.md)

- The shape of the decay either "linear" or "exponential"

  #### Returns [EnvelopeCurve](../types/EnvelopeCurve.md)

  #### Example

  ``` ts
  return Tone.Offline(() => {
      const env = new Tone.Envelope({
          sustain: 0.1,
          decay: 0.5
      }).toDestination();
      env.decayCurve = "linear";
      env.triggerAttack();
  }, 1, 1);
  ```

  Inherited from Envelope.decayCurve

  - Defined in [Tone/component/envelope/Envelope.ts:338](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/component/envelope/Envelope.ts#L338)

- set decayCurve(curve): void

- #### Parameters

  - curve: [EnvelopeCurve](../types/EnvelopeCurve.md)

  #### Returns void

  Inherited from Envelope.decayCurve

  - Defined in [Tone/component/envelope/Envelope.ts:341](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/component/envelope/Envelope.ts#L341)

### disposed

- get disposed(): boolean

- Indicates if the instance was disposed. 'Disposing' an instance means that all of the Web Audio nodes that were created for the instance are disconnected and freed for garbage collection.

  #### Returns boolean

  Inherited from Envelope.disposed

  - Defined in [Tone/core/Tone.ts:96](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L96)

### exponent

- get exponent(): number

- The envelope's exponent value.

  #### Returns number

  - Defined in [Tone/component/envelope/FrequencyEnvelope.ts:126](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/component/envelope/FrequencyEnvelope.ts#L126)

- set exponent(exponent): void

- #### Parameters

  - exponent: number

  #### Returns void

  - Defined in [Tone/component/envelope/FrequencyEnvelope.ts:129](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/component/envelope/FrequencyEnvelope.ts#L129)

### numberOfInputs

- get numberOfInputs(): number

- The number of inputs feeding into the AudioNode. For source nodes, this will be 0.

  #### Returns number

  #### Example

  ``` ts
  const node = new Tone.Gain();
  console.log(node.numberOfInputs);
  ```

  Inherited from Envelope.numberOfInputs

  - Defined in [Tone/core/context/ToneAudioNode.ts:52](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L52)

### numberOfOutputs

- get numberOfOutputs(): number

- The number of outputs of the AudioNode.

  #### Returns number

  #### Example

  ``` ts
  const node = new Tone.Gain();
  console.log(node.numberOfOutputs);
  ```

  Inherited from Envelope.numberOfOutputs

  - Defined in [Tone/core/context/ToneAudioNode.ts:70](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L70)

### octaves

- get octaves(): number

- The number of octaves above the baseFrequency that the envelope will scale to.

  #### Returns number

  - Defined in [Tone/component/envelope/FrequencyEnvelope.ts:115](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/component/envelope/FrequencyEnvelope.ts#L115)

- set octaves(octaves): void

- #### Parameters

  - octaves: number

  #### Returns void

  - Defined in [Tone/component/envelope/FrequencyEnvelope.ts:118](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/component/envelope/FrequencyEnvelope.ts#L118)

### releaseCurve

- get releaseCurve(): [EnvelopeCurve](../types/EnvelopeCurve.md)

- The shape of the release. See the attack curve types.

  #### Returns [EnvelopeCurve](../types/EnvelopeCurve.md)

  #### Example

  ``` ts
  return Tone.Offline(() => {
      const env = new Tone.Envelope({
          release: 0.8
      }).toDestination();
      env.triggerAttack();
      // release curve could also be defined by an array
      env.releaseCurve = [1, 0.3, 0.4, 0.2, 0.7, 0];
      env.triggerRelease(0.2);
  }, 1, 1);
  ```

  Inherited from Envelope.releaseCurve

  - Defined in [Tone/component/envelope/Envelope.ts:319](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/component/envelope/Envelope.ts#L319)

- set releaseCurve(curve): void

- #### Parameters

  - curve: [EnvelopeCurve](../types/EnvelopeCurve.md)

  #### Returns void

  Inherited from Envelope.releaseCurve

  - Defined in [Tone/component/envelope/Envelope.ts:322](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/component/envelope/Envelope.ts#L322)

### sampleTime

- get sampleTime(): number

- The duration in seconds of one sample.

  #### Returns number

  Inherited from Envelope.sampleTime

  - Defined in [Tone/core/context/ToneWithContext.ts:99](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L99)

### value

- get value(): number

- Read the current value of the envelope. Useful for synchronizing visual output to the envelope.

  #### Returns number

  Inherited from Envelope.value

  - Defined in [Tone/component/envelope/Envelope.ts:221](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/component/envelope/Envelope.ts#L221)

## Methods

### asArray

- asArray(length?): Promise<Float32Array>

- Render the envelope curve to an array of the given length. Good for visualizing the envelope curve. Rescales the duration of the envelope to fit the length.

  #### Parameters

  - length: number = 1024

  #### Returns Promise<Float32Array>

  Inherited from [Envelope](Envelope.md).[asArray](Envelope.md#asArray)

  - Defined in [Tone/component/envelope/Envelope.ts:513](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/component/envelope/Envelope.ts#L513)

### cancel

- cancel(after?): this

- Cancels all scheduled envelope changes after the given time.

  #### Parameters

  - `Optional` after: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Returns this

  Inherited from [Envelope](Envelope.md).[cancel](Envelope.md#cancel)

  - Defined in [Tone/component/envelope/Envelope.ts:495](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/component/envelope/Envelope.ts#L495)

### chain

- chain(...nodes): this

- Connect the output of this node to the rest of the nodes in series.

  #### Parameters

  - `Rest` ...nodes: [InputNode](../types/InputNode.md)\[\]

  #### Returns this

  #### Example

  ``` ts
  const player = new Tone.Player("https://tonejs.github.io/audio/drum-samples/handdrum-loop.mp3");
  player.autostart = true;
  const filter = new Tone.AutoFilter(4).start();
  const distortion = new Tone.Distortion(0.5);
  // connect the player to the filter, distortion and then to the master output
  player.chain(filter, distortion, Tone.Destination);
  ```

  Inherited from [Envelope](Envelope.md).[chain](Envelope.md#chain)

  - Defined in [Tone/core/context/ToneAudioNode.ts:249](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L249)

### connect

- connect(destination, outputNumber?, inputNumber?): this

- Connect the envelope to a destination node.

  #### Parameters

  - destination: [InputNode](../types/InputNode.md)
  - outputNumber: number = 0
  - inputNumber: number = 0

  #### Returns this

  Inherited from [Envelope](Envelope.md).[connect](Envelope.md#connect)

  - Defined in [Tone/component/envelope/Envelope.ts:503](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/component/envelope/Envelope.ts#L503)

### disconnect

- disconnect(destination?, outputNum?, inputNum?): this

- disconnect the output

  #### Parameters

  - `Optional` destination: [InputNode](../types/InputNode.md)
  - outputNum: number = 0
  - inputNum: number = 0

  #### Returns this

  Inherited from [Envelope](Envelope.md).[disconnect](Envelope.md#disconnect)

  - Defined in [Tone/core/context/ToneAudioNode.ts:234](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L234)

### dispose

- dispose(): this

- Clean up

  #### Returns this

  Overrides [Envelope](Envelope.md).[dispose](Envelope.md#dispose)

  - Defined in [Tone/component/envelope/FrequencyEnvelope.ts:136](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/component/envelope/FrequencyEnvelope.ts#L136)

### fan

- fan(...nodes): this

- connect the output of this node to the rest of the nodes in parallel.

  #### Parameters

  - `Rest` ...nodes: [InputNode](../types/InputNode.md)\[\]

  #### Returns this

  #### Example

  ``` ts
  const player = new Tone.Player("https://tonejs.github.io/audio/drum-samples/conga-rhythm.mp3");
  player.autostart = true;
  const pitchShift = new Tone.PitchShift(4).toDestination();
  const filter = new Tone.Filter("G5").toDestination();
  // connect a node to the pitch shift and filter in parallel
  player.fan(pitchShift, filter);
  ```

  Inherited from [Envelope](Envelope.md).[fan](Envelope.md#fan)

  - Defined in [Tone/core/context/ToneAudioNode.ts:264](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L264)

### get

- get(): [EnvelopeOptions](../interfaces/EnvelopeOptions.md)

- Get the object's attributes.

  #### Returns [EnvelopeOptions](../interfaces/EnvelopeOptions.md)

  #### Example

  ``` ts
  const osc = new Tone.Oscillator();
  console.log(osc.get());
  ```

  Inherited from [Envelope](Envelope.md).[get](Envelope.md#get)

  - Defined in [Tone/core/context/ToneWithContext.ts:170](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L170)

### getValueAtTime

- getValueAtTime(time): number

- Get the scheduled value at the given time. This will return the unconverted (raw) value.

  #### Parameters

  - time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Returns number

  #### Example

  ``` ts
  const env = new Tone.Envelope(0.5, 1, 0.4, 2);
  env.triggerAttackRelease(2);
  setInterval(() => console.log(env.getValueAtTime(Tone.now())), 100);
  ```

  Inherited from [Envelope](Envelope.md).[getValueAtTime](Envelope.md#getValueAtTime)

  - Defined in [Tone/component/envelope/Envelope.ts:465](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/component/envelope/Envelope.ts#L465)

### immediate

- immediate(): number

- Return the current time of the Context clock without any lookAhead.

  #### Returns number

  #### Example

  ``` ts
  setInterval(() => {
      console.log(Tone.immediate());
  }, 100);
  ```

  Inherited from [Envelope](Envelope.md).[immediate](Envelope.md#immediate)

  - Defined in [Tone/core/context/ToneWithContext.ts:92](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L92)

### now

- now(): number

- Return the current time of the Context clock plus the lookAhead.

  #### Returns number

  #### Example

  ``` ts
  setInterval(() => {
      console.log(Tone.now());
  }, 100);
  ```

  Inherited from [Envelope](Envelope.md).[now](Envelope.md#now)

  - Defined in [Tone/core/context/ToneWithContext.ts:81](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L81)

### set

- set(props): this

- Set multiple properties at once with an object.

  #### Parameters

  - props: RecursivePartial<[EnvelopeOptions](../interfaces/EnvelopeOptions.md)>

  #### Returns this

  #### Example

  ``` ts
  const filter = new Tone.Filter().toDestination();
  // set values using an object
  filter.set({
      frequency: "C6",
      type: "highpass"
  });
  const player = new Tone.Player("https://tonejs.github.io/audio/berklee/Analogsynth_octaves_highmid.mp3").connect(filter);
  player.autostart = true;
  ```

  Inherited from [Envelope](Envelope.md).[set](Envelope.md#set)

  - Defined in [Tone/core/context/ToneWithContext.ts:215](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L215)

### toDestination

- toDestination(): this

- Connect the output to the context's destination node.

  #### Returns this

  #### Example

  ``` ts
  const osc = new Tone.Oscillator("C2").start();
  osc.toDestination();
  ```

  Inherited from [Envelope](Envelope.md).[toDestination](Envelope.md#toDestination)

  - Defined in [Tone/core/context/ToneAudioNode.ts:216](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L216)

### toFrequency

- toFrequency(freq): number

- Convert the input to a frequency number

  #### Parameters

  - freq: [Unit](../modules/Unit.md).[Frequency](../types/Unit.Frequency.md)

  #### Returns number

  #### Example

  ``` ts
  const gain = new Tone.Gain();
  console.log(gain.toFrequency("4n"));
  ```

  Inherited from [Envelope](Envelope.md).[toFrequency](Envelope.md#toFrequency)

  - Defined in [Tone/core/context/ToneWithContext.ts:132](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L132)

### toMaster

- toMaster(): this

- Connect the output to the context's destination node.

  #### Returns this

  #### See

  [toDestination](FrequencyEnvelope.md#toDestination)

  #### Deprecated

  Inherited from [Envelope](Envelope.md).[toMaster](Envelope.md#toMaster)

  - Defined in [Tone/core/context/ToneAudioNode.ts:226](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L226)

### toSeconds

- toSeconds(time?): number

- Convert the incoming time to seconds. This is calculated against the current TransportClass bpm

  #### Parameters

  - `Optional` time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Returns number

  #### Example

  ``` ts
  const gain = new Tone.Gain();
  setInterval(() => console.log(gain.toSeconds("4n")), 100);
  // ramp the tempo to 60 bpm over 30 seconds
  Tone.getTransport().bpm.rampTo(60, 30);
  ```

  Inherited from [Envelope](Envelope.md).[toSeconds](Envelope.md#toSeconds)

  - Defined in [Tone/core/context/ToneWithContext.ts:121](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L121)

### toString

- toString(): string

- Convert the class to a string

  #### Returns string

  #### Example

  ``` ts
  const osc = new Tone.Oscillator();
  console.log(osc.toString());
  ```

  Inherited from [Envelope](Envelope.md).[toString](Envelope.md#toString)

  - Defined in [Tone/core/Tone.ts:106](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L106)

### toTicks

- toTicks(time?): number

- Convert the input time into ticks

  #### Parameters

  - `Optional` time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md) \| [TimeClass](TimeClass.md)<number, TimeBaseUnit>

  #### Returns number

  #### Example

  ``` ts
  const gain = new Tone.Gain();
  console.log(gain.toTicks("4n"));
  ```

  Inherited from [Envelope](Envelope.md).[toTicks](Envelope.md#toTicks)

  - Defined in [Tone/core/context/ToneWithContext.ts:142](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L142)

### triggerAttack

- triggerAttack(time?, velocity?): this

- Trigger the attack/decay portion of the ADSR envelope.

  #### Parameters

  - `Optional` time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
    When the attack should start.
  - velocity: number = 1
    The velocity of the envelope scales the vales. number between 0-1

  #### Returns this

  #### Example

  ``` ts
  const env = new Tone.AmplitudeEnvelope().toDestination();
  const osc = new Tone.Oscillator().connect(env).start();
  // trigger the attack 0.5 seconds from now with a velocity of 0.2
  env.triggerAttack("+0.5", 0.2);
  ```

  Inherited from [Envelope](Envelope.md).[triggerAttack](Envelope.md#triggerAttack)

  - Defined in [Tone/component/envelope/Envelope.ts:356](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/component/envelope/Envelope.ts#L356)

### triggerAttackRelease

- triggerAttackRelease(duration, time?, velocity?): this

- triggerAttackRelease is shorthand for triggerAttack, then waiting some duration, then triggerRelease.

  #### Parameters

  - duration: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
    The duration of the sustain.
  - `Optional` time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
    When the attack should be triggered.
  - velocity: number = 1
    The velocity of the envelope.

  #### Returns this

  #### Example

  ``` ts
  const env = new Tone.AmplitudeEnvelope().toDestination();
  const osc = new Tone.Oscillator().connect(env).start();
  // trigger the release 0.5 seconds after the attack
  env.triggerAttackRelease(0.5);
  ```

  Inherited from [Envelope](Envelope.md).[triggerAttackRelease](Envelope.md#triggerAttackRelease)

  - Defined in [Tone/component/envelope/Envelope.ts:481](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/component/envelope/Envelope.ts#L481)

### triggerRelease

- triggerRelease(time?): this

- Triggers the release of the envelope.

  #### Parameters

  - `Optional` time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
    When the release portion of the envelope should start.

  #### Returns this

  #### Example

  ``` ts
  const env = new Tone.AmplitudeEnvelope().toDestination();
  const osc = new Tone.Oscillator({
      type: "sawtooth"
  }).connect(env).start();
  env.triggerAttack();
  // trigger the release half a second after the attack
  env.triggerRelease("+0.5");
  ```

  Inherited from [Envelope](Envelope.md).[triggerRelease](Envelope.md#triggerRelease)

  - Defined in [Tone/component/envelope/Envelope.ts:428](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/component/envelope/Envelope.ts#L428)

### `Static` getDefaults

- getDefaults(): [FrequencyEnvelopeOptions](../interfaces/FrequencyEnvelopeOptions.md)

- #### Returns [FrequencyEnvelopeOptions](../interfaces/FrequencyEnvelopeOptions.md)

  Overrides [Envelope](Envelope.md).[getDefaults](Envelope.md#getDefaults)

  - Defined in [Tone/component/envelope/FrequencyEnvelope.ts:87](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/component/envelope/FrequencyEnvelope.ts#L87)
