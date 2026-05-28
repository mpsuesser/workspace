# Class Sampler

Pass in an object which maps the note's pitch or midi value to the url, then you can trigger the attack and release of that note like other instruments. By automatically repitching the samples, it is possible to play pitches which were not explicitly included which can save loading time.

For sample or buffer playback where repitching is not necessary, use [Player](Player.md).

#### Example

``` ts
const sampler = new Tone.Sampler({
    urls: {
        A1: "A1.mp3",
        A2: "A2.mp3",
    },
    baseUrl: "https://tonejs.github.io/audio/casio/",
    onload: () => {
        sampler.triggerAttackRelease(["C1", "E1", "G1", "B1"], 0.5);
    }
}).toDestination();
```

#### Hierarchy

- Instrument<[SamplerOptions](../interfaces/SamplerOptions.md)>
  - Sampler

- Defined in [Tone/instrument/Sampler.ts:60](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Sampler.ts#L60)

## Constructors

### constructor

- new Sampler(samples?, onload?, baseUrl?): [Sampler](Sampler.md)

- #### Parameters

  - `Optional` samples: SamplesMap
    An object of samples mapping either Midi Note Numbers or Scientific Pitch Notation to the url of that sample.
  - `Optional` onload: (() => void)
    The callback to invoke when all of the samples are loaded.

    - - (): void

      - #### Returns void
  - `Optional` baseUrl: string
    The root URL of all of the samples, which is prepended to all the URLs.

  #### Returns [Sampler](Sampler.md)

  Overrides Instrument<SamplerOptions>.constructor

  - Defined in [Tone/instrument/Sampler.ts:101](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Sampler.ts#L101)

- new Sampler(samples?, options?): [Sampler](Sampler.md)

- #### Parameters

  - `Optional` samples: SamplesMap
    An object of samples mapping either Midi Note Numbers or Scientific Pitch Notation to the url of that sample.
  - `Optional` options: Partial<Omit<[SamplerOptions](../interfaces/SamplerOptions.md), "urls">>
    The remaining options associated with the sampler

  #### Returns [Sampler](Sampler.md)

  Overrides Instrument<SamplerOptions>.constructor

  - Defined in [Tone/instrument/Sampler.ts:107](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Sampler.ts#L107)

- new Sampler(options?): [Sampler](Sampler.md)

- #### Parameters

  - `Optional` options: Partial<[SamplerOptions](../interfaces/SamplerOptions.md)>

  #### Returns [Sampler](Sampler.md)

  Overrides Instrument<SamplerOptions>.constructor

  - Defined in [Tone/instrument/Sampler.ts:111](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Sampler.ts#L111)

## Properties

### attack

attack: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

The envelope applied to the beginning of the sample.

#### Min

0

#### Max

1

- Defined in [Tone/instrument/Sampler.ts:79](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Sampler.ts#L79)

### `Readonly` context

context: [BaseContext](BaseContext.md)

The context belonging to the node.

Inherited from Instrument.context

- Defined in [Tone/core/context/ToneWithContext.ts:40](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L40)

### curve

curve: OneShotSourceCurve

The shape of the attack/release curve. Either "linear" or "exponential"

- Defined in [Tone/instrument/Sampler.ts:93](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Sampler.ts#L93)

### debug

debug: boolean = false

Set this debug flag to log all events that happen in this class.

Inherited from Instrument.debug

- Defined in [Tone/core/Tone.ts:49](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L49)

### input

input: undefined

The instrument only has an output

Inherited from Instrument.input

- Defined in [Tone/instrument/Instrument.ts:31](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Instrument.ts#L31)

### `Readonly` name

name: string = "Sampler"

Overrides Instrument.name

- Defined in [Tone/instrument/Sampler.ts:61](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Sampler.ts#L61)

### output

output: [OutputNode](../types/OutputNode.md)

Inherited from Instrument.output

- Defined in [Tone/instrument/Instrument.ts:26](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Instrument.ts#L26)

### release

release: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

The envelope applied to the end of the envelope.

#### Min

0

#### Max

1

- Defined in [Tone/instrument/Sampler.ts:87](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Sampler.ts#L87)

### volume

volume: [Param](Param.md)<"decibels">

The volume of the output in decibels.

#### Example

``` ts
const amSynth = new Tone.AMSynth().toDestination();
amSynth.volume.value = -6;
amSynth.triggerAttackRelease("G#3", 0.2);
```

Inherited from Instrument.volume

- Defined in [Tone/instrument/Instrument.ts:40](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Instrument.ts#L40)

### `Static` version

version: string = version

The version number semver

Inherited from Instrument.version

- Defined in [Tone/core/Tone.ts:28](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L28)

## Accessors

### blockTime

- get blockTime(): number

- The number of seconds of 1 processing block (128 samples)

  #### Returns number

  #### Example

  ``` ts
  console.log(Tone.Destination.blockTime);
  ```

  Inherited from Instrument.blockTime

  - Defined in [Tone/core/context/ToneWithContext.ts:108](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L108)

### channelCount

- get channelCount(): number

- channelCount is the number of channels used when up-mixing and down-mixing connections to any inputs to the node. The default value is 2 except for specific nodes where its value is specially determined.

  #### Returns number

  Inherited from Instrument.channelCount

  - Defined in [Tone/core/context/ToneAudioNode.ts:153](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L153)

- set channelCount(channelCount): void

- #### Parameters

  - channelCount: number

  #### Returns void

  Inherited from Instrument.channelCount

  - Defined in [Tone/core/context/ToneAudioNode.ts:156](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L156)

### channelCountMode

- get channelCountMode(): ChannelCountMode

- channelCountMode determines how channels will be counted when up-mixing and down-mixing connections to any inputs to the node. The default value is "max". This attribute has no effect for nodes with no inputs.

  - "max" - computedNumberOfChannels is the maximum of the number of channels of all connections to an input. In this mode channelCount is ignored.
  - "clamped-max" - computedNumberOfChannels is determined as for "max" and then clamped to a maximum value of the given channelCount.
  - "explicit" - computedNumberOfChannels is the exact value as specified by the channelCount.

  #### Returns ChannelCountMode

  Inherited from Instrument.channelCountMode

  - Defined in [Tone/core/context/ToneAudioNode.ts:170](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L170)

- set channelCountMode(channelCountMode): void

- #### Parameters

  - channelCountMode: ChannelCountMode

  #### Returns void

  Inherited from Instrument.channelCountMode

  - Defined in [Tone/core/context/ToneAudioNode.ts:173](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L173)

### channelInterpretation

- get channelInterpretation(): ChannelInterpretation

- channelInterpretation determines how individual channels will be treated when up-mixing and down-mixing connections to any inputs to the node. The default value is "speakers".

  #### Returns ChannelInterpretation

  Inherited from Instrument.channelInterpretation

  - Defined in [Tone/core/context/ToneAudioNode.ts:184](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L184)

- set channelInterpretation(channelInterpretation): void

- #### Parameters

  - channelInterpretation: ChannelInterpretation

  #### Returns void

  Inherited from Instrument.channelInterpretation

  - Defined in [Tone/core/context/ToneAudioNode.ts:187](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L187)

### disposed

- get disposed(): boolean

- Indicates if the instance was disposed. 'Disposing' an instance means that all of the Web Audio nodes that were created for the instance are disconnected and freed for garbage collection.

  #### Returns boolean

  Inherited from Instrument.disposed

  - Defined in [Tone/core/Tone.ts:96](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L96)

### loaded

- get loaded(): boolean

- If the buffers are loaded or not

  #### Returns boolean

  - Defined in [Tone/instrument/Sampler.ts:356](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Sampler.ts#L356)

### numberOfInputs

- get numberOfInputs(): number

- The number of inputs feeding into the AudioNode. For source nodes, this will be 0.

  #### Returns number

  #### Example

  ``` ts
  const node = new Tone.Gain();
  console.log(node.numberOfInputs);
  ```

  Inherited from Instrument.numberOfInputs

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

  Inherited from Instrument.numberOfOutputs

  - Defined in [Tone/core/context/ToneAudioNode.ts:70](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L70)

### sampleTime

- get sampleTime(): number

- The duration in seconds of one sample.

  #### Returns number

  Inherited from Instrument.sampleTime

  - Defined in [Tone/core/context/ToneWithContext.ts:99](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L99)

## Methods

### add

- add(note, url, callback?): this

- Add a note to the sampler.

  #### Parameters

  - note: 0 \| 4 \| 3 \| 2 \| 1 \| 5 \| 6 \| 7 \| 8 \| 9 \| 10 \| 11 \| "C0" \| "C4" \| "C-4" \| "C3" \| "C-3" \| "C2" \| "C-2" \| "C1" \| "C-1" \| "C5" \| "C6" \| "C7" \| "C8" \| "C9" \| "C10" \| "C11" \| "Cbb0" \| "Cbb4" \| "Cbb-4" \| "Cbb3" \| "Cbb-3" \| "Cbb2" \| "Cbb-2" \| "Cbb1" \| "Cbb-1" \| "Cbb5" \| "Cbb6" \| "Cbb7" \| "Cbb8" \| "Cbb9" \| "Cbb10" \| "Cbb11" \| "Cb0" \| "Cb4" \| "Cb-4" \| "Cb3" \| "Cb-3" \| "Cb2" \| "Cb-2" \| "Cb1" \| "Cb-1" \| "Cb5" \| "Cb6" \| "Cb7" \| "Cb8" \| "Cb9" \| "Cb10" \| "Cb11" \| "C#0" \| "C#4" \| "C#-4" \| "C#3" \| "C#-3" \| "C#2" \| "C#-2" \| "C#1" \| "C#-1" \| "C#5" \| "C#6" \| "C#7" \| "C#8" \| "C#9" \| "C#10" \| "C#11" \| "Cx0" \| "Cx4" \| "Cx-4" \| "Cx3" \| "Cx-3" \| "Cx2" \| "Cx-2" \| "Cx1" \| "Cx-1" \| "Cx5" \| "Cx6" \| "Cx7" \| "Cx8" \| "Cx9" \| "Cx10" \| "Cx11" \| "D0" \| "D4" \| "D-4" \| "D3" \| "D-3" \| "D2" \| "D-2" \| "D1" \| "D-1" \| "D5" \| "D6" \| "D7" \| "D8" \| "D9" \| "D10" \| "D11" \| "Dbb0" \| "Dbb4" \| "Dbb-4" \| "Dbb3" \| "Dbb-3" \| "Dbb2" \| "Dbb-2" \| "Dbb1" \| "Dbb-1" \| "Dbb5" \| "Dbb6" \| "Dbb7" \| "Dbb8" \| "Dbb9" \| "Dbb10" \| "Dbb11" \| "Db0" \| "Db4" \| "Db-4" \| "Db3" \| "Db-3" \| "Db2" \| "Db-2" \| "Db1" \| "Db-1" \| "Db5" \| "Db6" \| "Db7" \| "Db8" \| "Db9" \| "Db10" \| "Db11" \| "D#0" \| "D#4" \| "D#-4" \| "D#3" \| "D#-3" \| "D#2" \| "D#-2" \| "D#1" \| "D#-1" \| "D#5" \| "D#6" \| "D#7" \| "D#8" \| "D#9" \| "D#10" \| "D#11" \| "Dx0" \| "Dx4" \| "Dx-4" \| "Dx3" \| "Dx-3" \| "Dx2" \| "Dx-2" \| "Dx1" \| "Dx-1" \| "Dx5" \| "Dx6" \| "Dx7" \| "Dx8" \| "Dx9" \| "Dx10" \| "Dx11" \| "E0" \| "E4" \| "E-4" \| "E3" \| "E-3" \| "E2" \| "E-2" \| "E1" \| "E-1" \| "E5" \| "E6" \| "E7" \| "E8" \| "E9" \| "E10" \| "E11" \| "Ebb0" \| "Ebb4" \| "Ebb-4" \| "Ebb3" \| "Ebb-3" \| "Ebb2" \| "Ebb-2" \| "Ebb1" \| "Ebb-1" \| "Ebb5" \| "Ebb6" \| "Ebb7" \| "Ebb8" \| "Ebb9" \| "Ebb10" \| "Ebb11" \| "Eb0" \| "Eb4" \| "Eb-4" \| "Eb3" \| "Eb-3" \| "Eb2" \| "Eb-2" \| "Eb1" \| "Eb-1" \| "Eb5" \| "Eb6" \| "Eb7" \| "Eb8" \| "Eb9" \| "Eb10" \| "Eb11" \| "E#0" \| "E#4" \| "E#-4" \| "E#3" \| "E#-3" \| "E#2" \| "E#-2" \| "E#1" \| "E#-1" \| "E#5" \| "E#6" \| "E#7" \| "E#8" \| "E#9" \| "E#10" \| "E#11" \| "Ex0" \| "Ex4" \| "Ex-4" \| "Ex3" \| "Ex-3" \| "Ex2" \| "Ex-2" \| "Ex1" \| "Ex-1" \| "Ex5" \| "Ex6" \| "Ex7" \| "Ex8" \| "Ex9" \| "Ex10" \| "Ex11" \| "F0" \| "F4" \| "F-4" \| "F3" \| "F-3" \| "F2" \| "F-2" \| "F1" \| "F-1" \| "F5" \| "F6" \| "F7" \| "F8" \| "F9" \| "F10" \| "F11" \| "Fbb0" \| "Fbb4" \| "Fbb-4" \| "Fbb3" \| "Fbb-3" \| "Fbb2" \| "Fbb-2" \| "Fbb1" \| "Fbb-1" \| "Fbb5" \| "Fbb6" \| "Fbb7" \| "Fbb8" \| "Fbb9" \| "Fbb10" \| "Fbb11" \| "Fb0" \| "Fb4" \| "Fb-4" \| "Fb3" \| "Fb-3" \| "Fb2" \| "Fb-2" \| "Fb1" \| "Fb-1" \| "Fb5" \| "Fb6" \| "Fb7" \| "Fb8" \| "Fb9" \| "Fb10" \| "Fb11" \| "F#0" \| "F#4" \| "F#-4" \| "F#3" \| "F#-3" \| "F#2" \| "F#-2" \| "F#1" \| "F#-1" \| "F#5" \| "F#6" \| "F#7" \| "F#8" \| "F#9" \| "F#10" \| "F#11" \| "Fx0" \| "Fx4" \| "Fx-4" \| "Fx3" \| "Fx-3" \| "Fx2" \| "Fx-2" \| "Fx1" \| "Fx-1" \| "Fx5" \| "Fx6" \| "Fx7" \| "Fx8" \| "Fx9" \| "Fx10" \| "Fx11" \| "G0" \| "G4" \| "G-4" \| "G3" \| "G-3" \| "G2" \| "G-2" \| "G1" \| "G-1" \| "G5" \| "G6" \| "G7" \| "G8" \| "G9" \| "G10" \| "G11" \| "Gbb0" \| "Gbb4" \| "Gbb-4" \| "Gbb3" \| "Gbb-3" \| "Gbb2" \| "Gbb-2" \| "Gbb1" \| "Gbb-1" \| "Gbb5" \| "Gbb6" \| "Gbb7" \| "Gbb8" \| "Gbb9" \| "Gbb10" \| "Gbb11" \| "Gb0" \| "Gb4" \| "Gb-4" \| "Gb3" \| "Gb-3" \| "Gb2" \| "Gb-2" \| "Gb1" \| "Gb-1" \| "Gb5" \| "Gb6" \| "Gb7" \| "Gb8" \| "Gb9" \| "Gb10" \| "Gb11" \| "G#0" \| "G#4" \| "G#-4" \| "G#3" \| "G#-3" \| "G#2" \| "G#-2" \| "G#1" \| "G#-1" \| "G#5" \| "G#6" \| "G#7" \| "G#8" \| "G#9" \| "G#10" \| "G#11" \| "Gx0" \| "Gx4" \| "Gx-4" \| "Gx3" \| "Gx-3" \| "Gx2" \| "Gx-2" \| "Gx1" \| "Gx-1" \| "Gx5" \| "Gx6" \| "Gx7" \| "Gx8" \| "Gx9" \| "Gx10" \| "Gx11" \| "A0" \| "A4" \| "A-4" \| "A3" \| "A-3" \| "A2" \| "A-2" \| "A1" \| "A-1" \| "A5" \| "A6" \| "A7" \| "A8" \| "A9" \| "A10" \| "A11" \| "Abb0" \| "Abb4" \| "Abb-4" \| "Abb3" \| "Abb-3" \| "Abb2" \| "Abb-2" \| "Abb1" \| "Abb-1" \| "Abb5" \| "Abb6" \| "Abb7" \| "Abb8" \| "Abb9" \| "Abb10" \| "Abb11" \| "Ab0" \| "Ab4" \| "Ab-4" \| "Ab3" \| "Ab-3" \| "Ab2" \| "Ab-2" \| "Ab1" \| "Ab-1" \| "Ab5" \| "Ab6" \| "Ab7" \| "Ab8" \| "Ab9" \| "Ab10" \| "Ab11" \| "A#0" \| "A#4" \| "A#-4" \| "A#3" \| "A#-3" \| "A#2" \| "A#-2" \| "A#1" \| "A#-1" \| "A#5" \| "A#6" \| "A#7" \| "A#8" \| "A#9" \| "A#10" \| "A#11" \| "Ax0" \| "Ax4" \| "Ax-4" \| "Ax3" \| "Ax-3" \| "Ax2" \| "Ax-2" \| "Ax1" \| "Ax-1" \| "Ax5" \| "Ax6" \| "Ax7" \| "Ax8" \| "Ax9" \| "Ax10" \| "Ax11" \| "B0" \| "B4" \| "B-4" \| "B3" \| "B-3" \| "B2" \| "B-2" \| "B1" \| "B-1" \| "B5" \| "B6" \| "B7" \| "B8" \| "B9" \| "B10" \| "B11" \| "Bbb0" \| "Bbb4" \| "Bbb-4" \| "Bbb3" \| "Bbb-3" \| "Bbb2" \| "Bbb-2" \| "Bbb1" \| "Bbb-1" \| "Bbb5" \| "Bbb6" \| "Bbb7" \| "Bbb8" \| "Bbb9" \| "Bbb10" \| "Bbb11" \| "Bb0" \| "Bb4" \| "Bb-4" \| "Bb3" \| "Bb-3" \| "Bb2" \| "Bb-2" \| "Bb1" \| "Bb-1" \| "Bb5" \| "Bb6" \| "Bb7" \| "Bb8" \| "Bb9" \| "Bb10" \| "Bb11" \| "B#0" \| "B#4" \| "B#-4" \| "B#3" \| "B#-3" \| "B#2" \| "B#-2" \| "B#1" \| "B#-1" \| "B#5" \| "B#6" \| "B#7" \| "B#8" \| "B#9" \| "B#10" \| "B#11" \| "Bx0" \| "Bx4" \| "Bx-4" \| "Bx3" \| "Bx-3" \| "Bx2" \| "Bx-2" \| "Bx1" \| "Bx-1" \| "Bx5" \| "Bx6" \| "Bx7" \| "Bx8" \| "Bx9" \| "Bx10" \| "Bx11" \| 12 \| 13 \| 14 \| 15 \| 16 \| 17 \| 18 \| 19 \| 20 \| 21 \| 22 \| 23 \| 24 \| 25 \| 26 \| 27 \| 28 \| 29 \| 30 \| 31 \| 32 \| 33 \| 34 \| 35 \| 36 \| 37 \| 38 \| 39 \| 40 \| 41 \| 42 \| 43 \| 44 \| 45 \| 46 \| 47 \| 48 \| 49 \| 50 \| 51 \| 52 \| 53 \| 54 \| 55 \| 56 \| 57 \| 58 \| 59 \| 60 \| 61 \| 62 \| 63 \| 64 \| 65 \| 66 \| 67 \| 68 \| 69 \| 70 \| 71 \| 72 \| 73 \| 74 \| 75 \| 76 \| 77 \| 78 \| 79 \| 80 \| 81 \| 82 \| 83 \| 84 \| 85 \| 86 \| 87 \| 88 \| 89 \| 90 \| 91 \| 92 \| 93 \| 94 \| 95 \| 96 \| 97 \| 98 \| 99 \| 100 \| 101 \| 102 \| 103 \| 104 \| 105 \| 106 \| 107 \| 108 \| 109 \| 110 \| 111 \| 112 \| 113 \| 114 \| 115 \| 116 \| 117 \| 118 \| 119 \| 120 \| 121 \| 122 \| 123 \| 124 \| 125 \| 126 \| 127
    The buffer's pitch.
  - url: string \| AudioBuffer \| [ToneAudioBuffer](ToneAudioBuffer.md)
    Either the url of the buffer, or a buffer which will be added with the given name.
  - `Optional` callback: (() => void)
    The callback to invoke when the url is loaded.

    - - (): void

      - #### Returns void

  #### Returns this

  - Defined in [Tone/instrument/Sampler.ts:333](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Sampler.ts#L333)

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

  Inherited from Instrument.chain

  - Defined in [Tone/core/context/ToneAudioNode.ts:249](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L249)

### connect

- connect(destination, outputNum?, inputNum?): this

- connect the output of a ToneAudioNode to an AudioParam, AudioNode, or ToneAudioNode

  #### Parameters

  - destination: [InputNode](../types/InputNode.md)
    The output to connect to
  - outputNum: number = 0
    The output to connect from
  - inputNum: number = 0
    The input to connect to

  #### Returns this

  Inherited from Instrument.connect

  - Defined in [Tone/core/context/ToneAudioNode.ts:205](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L205)

### disconnect

- disconnect(destination?, outputNum?, inputNum?): this

- disconnect the output

  #### Parameters

  - `Optional` destination: [InputNode](../types/InputNode.md)
  - outputNum: number = 0
  - inputNum: number = 0

  #### Returns this

  Inherited from Instrument.disconnect

  - Defined in [Tone/core/context/ToneAudioNode.ts:234](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L234)

### dispose

- dispose(): this

- Clean up

  #### Returns this

  Overrides Instrument.dispose

  - Defined in [Tone/instrument/Sampler.ts:363](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Sampler.ts#L363)

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

  Inherited from Instrument.fan

  - Defined in [Tone/core/context/ToneAudioNode.ts:264](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L264)

### get

- get(): [SamplerOptions](../interfaces/SamplerOptions.md)

- Get the object's attributes.

  #### Returns [SamplerOptions](../interfaces/SamplerOptions.md)

  #### Example

  ``` ts
  const osc = new Tone.Oscillator();
  console.log(osc.get());
  ```

  Inherited from Instrument.get

  - Defined in [Tone/core/context/ToneWithContext.ts:170](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L170)

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

  Inherited from Instrument.immediate

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

  Inherited from Instrument.now

  - Defined in [Tone/core/context/ToneWithContext.ts:81](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L81)

### releaseAll

- releaseAll(time?): this

- Release all currently active notes.

  #### Parameters

  - `Optional` time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
    When to release the notes.

  #### Returns this

  - Defined in [Tone/instrument/Sampler.ts:278](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Sampler.ts#L278)

### set

- set(props): this

- Set multiple properties at once with an object.

  #### Parameters

  - props: RecursivePartial<[SamplerOptions](../interfaces/SamplerOptions.md)>

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

  Inherited from Instrument.set

  - Defined in [Tone/core/context/ToneWithContext.ts:215](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L215)

### sync

- sync(): this

- #### Returns this

  Overrides Instrument.sync

  - Defined in [Tone/instrument/Sampler.ts:289](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Sampler.ts#L289)

### toDestination

- toDestination(): this

- Connect the output to the context's destination node.

  #### Returns this

  #### Example

  ``` ts
  const osc = new Tone.Oscillator("C2").start();
  osc.toDestination();
  ```

  Inherited from Instrument.toDestination

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

  Inherited from Instrument.toFrequency

  - Defined in [Tone/core/context/ToneWithContext.ts:132](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L132)

### toMaster

- toMaster(): this

- Connect the output to the context's destination node.

  #### Returns this

  #### See

  [toDestination](Sampler.md#toDestination)

  #### Deprecated

  Inherited from Instrument.toMaster

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

  Inherited from Instrument.toSeconds

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

  Inherited from Instrument.toString

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

  Inherited from Instrument.toTicks

  - Defined in [Tone/core/context/ToneWithContext.ts:142](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L142)

### triggerAttack

- triggerAttack(notes, time?, velocity?): this

- #### Parameters

  - notes: [Unit](../modules/Unit.md).[Frequency](../types/Unit.Frequency.md) \| [Unit](../modules/Unit.md).[Frequency](../types/Unit.Frequency.md)\[\]
    The note to play, or an array of notes.
  - `Optional` time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
    When to play the note
  - velocity: number = 1
    The velocity to play the sample back.

  #### Returns this

  Overrides Instrument.triggerAttack

  - Defined in [Tone/instrument/Sampler.ts:191](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Sampler.ts#L191)

### triggerAttackRelease

- triggerAttackRelease(notes, duration, time?, velocity?): this

- Invoke the attack phase, then after the duration, invoke the release.

  #### Parameters

  - notes: [Unit](../modules/Unit.md).[Frequency](../types/Unit.Frequency.md) \| [Unit](../modules/Unit.md).[Frequency](../types/Unit.Frequency.md)\[\]
    The note to play and release, or an array of notes.
  - duration: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md) \| [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)\[\]
    The time the note should be held
  - `Optional` time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
    When to start the attack
  - velocity: number = 1
    The velocity of the attack

  #### Returns this

  Overrides Instrument.triggerAttackRelease

  - Defined in [Tone/instrument/Sampler.ts:304](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Sampler.ts#L304)

### triggerRelease

- triggerRelease(notes, time?): this

- #### Parameters

  - notes: [Unit](../modules/Unit.md).[Frequency](../types/Unit.Frequency.md) \| [Unit](../modules/Unit.md).[Frequency](../types/Unit.Frequency.md)\[\]
    The note to release, or an array of notes.
  - `Optional` time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
    When to release the note.

  #### Returns this

  Overrides Instrument.triggerRelease

  - Defined in [Tone/instrument/Sampler.ts:249](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Sampler.ts#L249)

### unsync

- unsync(): this

- Unsync the instrument from the Transport

  #### Returns this

  Inherited from Instrument.unsync

  - Defined in [Tone/instrument/Instrument.ts:133](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Instrument.ts#L133)

### `Static` getDefaults

- getDefaults(): [SamplerOptions](../interfaces/SamplerOptions.md)

- #### Returns [SamplerOptions](../interfaces/SamplerOptions.md)

  Overrides Instrument.getDefaults

  - Defined in [Tone/instrument/Sampler.ts:155](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Sampler.ts#L155)
