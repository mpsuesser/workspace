# Class FMSynth

FMSynth is composed of two Tone.Synths where one Tone.Synth modulates the frequency of a second Tone.Synth. A lot of spectral content can be explored using the modulationIndex parameter. Read more about frequency modulation synthesis on Sound On Sound: [Part 1](https://web.archive.org/web/20160403123704/http://www.soundonsound.com/sos/apr00/articles/synthsecrets.htm), [Part 2](https://web.archive.org/web/20160403115835/http://www.soundonsound.com/sos/may00/articles/synth.htm).

#### Example

``` ts
const fmSynth = new Tone.FMSynth().toDestination();
fmSynth.triggerAttackRelease("C5", "4n");
```

#### Hierarchy

- ModulationSynth<[FMSynthOptions](../interfaces/FMSynthOptions.md)>
  - FMSynth

- Defined in [Tone/instrument/FMSynth.ts:24](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/FMSynth.ts#L24)

## Constructors

### constructor

- new FMSynth(options?): [FMSynth](FMSynth.md)

- #### Parameters

  - `Optional` options: RecursivePartial<[FMSynthOptions](../interfaces/FMSynthOptions.md)>

  #### Returns [FMSynth](FMSynth.md)

  Overrides ModulationSynth<FMSynthOptions>.constructor

  - Defined in [Tone/instrument/FMSynth.ts:34](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/FMSynth.ts#L34)

## Properties

### `Readonly` context

context: [BaseContext](BaseContext.md)

The context belonging to the node.

Inherited from ModulationSynth.context

- Defined in [Tone/core/context/ToneWithContext.ts:40](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L40)

### debug

debug: boolean = false

Set this debug flag to log all events that happen in this class.

Inherited from ModulationSynth.debug

- Defined in [Tone/core/Tone.ts:49](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L49)

### `Readonly` detune

detune: [Signal](Signal.md)<"cents">

The detune in cents

Inherited from ModulationSynth.detune

- Defined in [Tone/instrument/ModulationSynth.ts:71](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/ModulationSynth.ts#L71)

### `Readonly` envelope

envelope: [AmplitudeEnvelope](AmplitudeEnvelope.md)

The carrier's envelope

Inherited from ModulationSynth.envelope

- Defined in [Tone/instrument/ModulationSynth.ts:51](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/ModulationSynth.ts#L51)

### `Readonly` frequency

frequency: [Signal](Signal.md)<"frequency">

The frequency control

Inherited from ModulationSynth.frequency

- Defined in [Tone/instrument/ModulationSynth.ts:66](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/ModulationSynth.ts#L66)

### `Readonly` harmonicity

harmonicity: [Multiply](Multiply.md)<"number">

Harmonicity is the ratio between the two voices. A harmonicity of 1 is no change. Harmonicity = 2 means a change of an octave.

#### Example

``` ts
const amSynth = new Tone.AMSynth().toDestination();
// pitch the modulator an octave below oscillator
amSynth.harmonicity.value = 0.5;
amSynth.triggerAttackRelease("C5", "4n");
```

Inherited from ModulationSynth.harmonicity

- Defined in [Tone/instrument/ModulationSynth.ts:82](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/ModulationSynth.ts#L82)

### input

input: undefined

The instrument only has an output

Inherited from ModulationSynth.input

- Defined in [Tone/instrument/Instrument.ts:31](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Instrument.ts#L31)

### `Readonly` modulation

modulation: [OmniOscillator](OmniOscillator.md)<any>

The modulator's oscillator which is applied to the amplitude of the oscillator

Inherited from ModulationSynth.modulation

- Defined in [Tone/instrument/ModulationSynth.ts:56](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/ModulationSynth.ts#L56)

### `Readonly` modulationEnvelope

modulationEnvelope: [AmplitudeEnvelope](AmplitudeEnvelope.md)

The modulator's envelope

Inherited from ModulationSynth.modulationEnvelope

- Defined in [Tone/instrument/ModulationSynth.ts:61](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/ModulationSynth.ts#L61)

### `Readonly` modulationIndex

modulationIndex: [Multiply](Multiply.md)<"number">

The modulation index which essentially the depth or amount of the modulation. It is the ratio of the frequency of the modulating signal (mf) to the amplitude of the modulating signal (ma) -- as in ma/mf.

- Defined in [Tone/instrument/FMSynth.ts:32](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/FMSynth.ts#L32)

### `Readonly` name

name: string = "FMSynth"

Overrides ModulationSynth.name

- Defined in [Tone/instrument/FMSynth.ts:25](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/FMSynth.ts#L25)

### onsilence

onsilence: onSilenceCallback

Invoked when the release has finished and the output is silent.

Inherited from ModulationSynth.onsilence

- Defined in [Tone/instrument/Monophonic.ts:38](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Monophonic.ts#L38)

### `Readonly` oscillator

oscillator: [OmniOscillator](OmniOscillator.md)<any>

The carrier's oscillator

Inherited from ModulationSynth.oscillator

- Defined in [Tone/instrument/ModulationSynth.ts:46](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/ModulationSynth.ts#L46)

### output

output: [OutputNode](../types/OutputNode.md)

Inherited from ModulationSynth.output

- Defined in [Tone/instrument/Instrument.ts:26](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Instrument.ts#L26)

### portamento

portamento: number

The glide time between notes.

Inherited from ModulationSynth.portamento

- Defined in [Tone/instrument/Monophonic.ts:33](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Monophonic.ts#L33)

### volume

volume: [Param](Param.md)<"decibels">

The volume of the output in decibels.

#### Example

``` ts
const amSynth = new Tone.AMSynth().toDestination();
amSynth.volume.value = -6;
amSynth.triggerAttackRelease("G#3", 0.2);
```

Inherited from ModulationSynth.volume

- Defined in [Tone/instrument/Instrument.ts:40](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Instrument.ts#L40)

### `Static` version

version: string = version

The version number semver

Inherited from ModulationSynth.version

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

  Inherited from ModulationSynth.blockTime

  - Defined in [Tone/core/context/ToneWithContext.ts:108](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L108)

### channelCount

- get channelCount(): number

- channelCount is the number of channels used when up-mixing and down-mixing connections to any inputs to the node. The default value is 2 except for specific nodes where its value is specially determined.

  #### Returns number

  Inherited from ModulationSynth.channelCount

  - Defined in [Tone/core/context/ToneAudioNode.ts:153](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L153)

- set channelCount(channelCount): void

- #### Parameters

  - channelCount: number

  #### Returns void

  Inherited from ModulationSynth.channelCount

  - Defined in [Tone/core/context/ToneAudioNode.ts:156](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L156)

### channelCountMode

- get channelCountMode(): ChannelCountMode

- channelCountMode determines how channels will be counted when up-mixing and down-mixing connections to any inputs to the node. The default value is "max". This attribute has no effect for nodes with no inputs.

  - "max" - computedNumberOfChannels is the maximum of the number of channels of all connections to an input. In this mode channelCount is ignored.
  - "clamped-max" - computedNumberOfChannels is determined as for "max" and then clamped to a maximum value of the given channelCount.
  - "explicit" - computedNumberOfChannels is the exact value as specified by the channelCount.

  #### Returns ChannelCountMode

  Inherited from ModulationSynth.channelCountMode

  - Defined in [Tone/core/context/ToneAudioNode.ts:170](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L170)

- set channelCountMode(channelCountMode): void

- #### Parameters

  - channelCountMode: ChannelCountMode

  #### Returns void

  Inherited from ModulationSynth.channelCountMode

  - Defined in [Tone/core/context/ToneAudioNode.ts:173](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L173)

### channelInterpretation

- get channelInterpretation(): ChannelInterpretation

- channelInterpretation determines how individual channels will be treated when up-mixing and down-mixing connections to any inputs to the node. The default value is "speakers".

  #### Returns ChannelInterpretation

  Inherited from ModulationSynth.channelInterpretation

  - Defined in [Tone/core/context/ToneAudioNode.ts:184](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L184)

- set channelInterpretation(channelInterpretation): void

- #### Parameters

  - channelInterpretation: ChannelInterpretation

  #### Returns void

  Inherited from ModulationSynth.channelInterpretation

  - Defined in [Tone/core/context/ToneAudioNode.ts:187](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L187)

### disposed

- get disposed(): boolean

- Indicates if the instance was disposed. 'Disposing' an instance means that all of the Web Audio nodes that were created for the instance are disconnected and freed for garbage collection.

  #### Returns boolean

  Inherited from ModulationSynth.disposed

  - Defined in [Tone/core/Tone.ts:96](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L96)

### numberOfInputs

- get numberOfInputs(): number

- The number of inputs feeding into the AudioNode. For source nodes, this will be 0.

  #### Returns number

  #### Example

  ``` ts
  const node = new Tone.Gain();
  console.log(node.numberOfInputs);
  ```

  Inherited from ModulationSynth.numberOfInputs

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

  Inherited from ModulationSynth.numberOfOutputs

  - Defined in [Tone/core/context/ToneAudioNode.ts:70](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L70)

### sampleTime

- get sampleTime(): number

- The duration in seconds of one sample.

  #### Returns number

  Inherited from ModulationSynth.sampleTime

  - Defined in [Tone/core/context/ToneWithContext.ts:99](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L99)

## Methods

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

  Inherited from ModulationSynth.chain

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

  Inherited from ModulationSynth.connect

  - Defined in [Tone/core/context/ToneAudioNode.ts:205](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L205)

### disconnect

- disconnect(destination?, outputNum?, inputNum?): this

- disconnect the output

  #### Parameters

  - `Optional` destination: [InputNode](../types/InputNode.md)
  - outputNum: number = 0
  - inputNum: number = 0

  #### Returns this

  Inherited from ModulationSynth.disconnect

  - Defined in [Tone/core/context/ToneAudioNode.ts:234](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L234)

### dispose

- dispose(): this

- #### Returns this

  Overrides ModulationSynth.dispose

  - Defined in [Tone/instrument/FMSynth.ts:60](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/FMSynth.ts#L60)

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

  Inherited from ModulationSynth.fan

  - Defined in [Tone/core/context/ToneAudioNode.ts:264](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L264)

### get

- get(): [FMSynthOptions](../interfaces/FMSynthOptions.md)

- Get the object's attributes.

  #### Returns [FMSynthOptions](../interfaces/FMSynthOptions.md)

  #### Example

  ``` ts
  const osc = new Tone.Oscillator();
  console.log(osc.get());
  ```

  Inherited from ModulationSynth.get

  - Defined in [Tone/core/context/ToneWithContext.ts:170](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L170)

### getLevelAtTime

- getLevelAtTime(time): number

- #### Parameters

  - time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Returns number

  Inherited from ModulationSynth.getLevelAtTime

  - Defined in [Tone/instrument/ModulationSynth.ts:217](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/ModulationSynth.ts#L217)

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

  Inherited from ModulationSynth.immediate

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

  Inherited from ModulationSynth.now

  - Defined in [Tone/core/context/ToneWithContext.ts:81](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L81)

### set

- set(props): this

- Set multiple properties at once with an object.

  #### Parameters

  - props: RecursivePartial<[FMSynthOptions](../interfaces/FMSynthOptions.md)>

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

  Inherited from ModulationSynth.set

  - Defined in [Tone/core/context/ToneWithContext.ts:215](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L215)

### setNote

- setNote(note, time?): this

- Set the note at the given time. If no time is given, the note will set immediately.

  #### Parameters

  - note: [Unit](../modules/Unit.md).[Frequency](../types/Unit.Frequency.md) \| [FrequencyClass](FrequencyClass.md)<number>
    The note to change to.
  - `Optional` time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
    The time when the note should be set.

  #### Returns this

  #### Example

  ``` ts
  const synth = new Tone.Synth().toDestination();
  synth.triggerAttack("C4");
  // change to F#6 in one quarter note from now.
  synth.setNote("F#6", "+4n");
  ```

  Inherited from ModulationSynth.setNote

  - Defined in [Tone/instrument/Monophonic.ts:140](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Monophonic.ts#L140)

### sync

- sync(): this

- Sync the instrument to the Transport. All subsequent calls of [triggerAttack](FMSynth.md#triggerAttack) and [triggerRelease](FMSynth.md#triggerRelease) will be scheduled along the transport.

  #### Returns this

  #### Example

  ``` ts
  const fmSynth = new Tone.FMSynth().toDestination();
  fmSynth.volume.value = -6;
  fmSynth.sync();
  // schedule 3 notes when the transport first starts
  fmSynth.triggerAttackRelease("C4", "8n", 0);
  fmSynth.triggerAttackRelease("E4", "8n", "8n");
  fmSynth.triggerAttackRelease("G4", "8n", "4n");
  // start the transport to hear the notes
  Tone.Transport.start();
  ```

  Inherited from ModulationSynth.sync

  - Defined in [Tone/instrument/Instrument.ts:89](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Instrument.ts#L89)

### toDestination

- toDestination(): this

- Connect the output to the context's destination node.

  #### Returns this

  #### Example

  ``` ts
  const osc = new Tone.Oscillator("C2").start();
  osc.toDestination();
  ```

  Inherited from ModulationSynth.toDestination

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

  Inherited from ModulationSynth.toFrequency

  - Defined in [Tone/core/context/ToneWithContext.ts:132](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L132)

### toMaster

- toMaster(): this

- Connect the output to the context's destination node.

  #### Returns this

  #### See

  [toDestination](FMSynth.md#toDestination)

  #### Deprecated

  Inherited from ModulationSynth.toMaster

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

  Inherited from ModulationSynth.toSeconds

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

  Inherited from ModulationSynth.toString

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

  Inherited from ModulationSynth.toTicks

  - Defined in [Tone/core/context/ToneWithContext.ts:142](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L142)

### triggerAttack

- triggerAttack(note, time?, velocity?): this

- Trigger the attack of the note optionally with a given velocity.

  #### Parameters

  - note: [Unit](../modules/Unit.md).[Frequency](../types/Unit.Frequency.md) \| [FrequencyClass](FrequencyClass.md)<number>
    The note to trigger.
  - `Optional` time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
    When the note should start.
  - velocity: number = 1
    The velocity determines how "loud" the note will be.

  #### Returns this

  #### Example

  ``` ts
  const synth = new Tone.Synth().toDestination();
  // trigger the note a half second from now at half velocity
  synth.triggerAttack("C4", "+0.5", 0.5);
  ```

  Inherited from ModulationSynth.triggerAttack

  - Defined in [Tone/instrument/Monophonic.ts:80](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Monophonic.ts#L80)

### triggerAttackRelease

- triggerAttackRelease(note, duration, time?, velocity?): this

- Trigger the attack and then the release after the duration.

  #### Parameters

  - note: [Unit](../modules/Unit.md).[Frequency](../types/Unit.Frequency.md)
    The note to trigger.
  - duration: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
    How long the note should be held for before triggering the release. This value must be greater than 0.
  - `Optional` time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
    When the note should be triggered.
  - `Optional` velocity: number
    The velocity the note should be triggered at.

  #### Returns this

  #### Example

  ``` ts
  const synth = new Tone.Synth().toDestination();
  // trigger "C4" for the duration of an 8th note
  synth.triggerAttackRelease("C4", "8n");
  ```

  Inherited from ModulationSynth.triggerAttackRelease

  - Defined in [Tone/instrument/Instrument.ts:160](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Instrument.ts#L160)

### triggerRelease

- triggerRelease(time?): this

- Trigger the release portion of the envelope.

  #### Parameters

  - `Optional` time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
    If no time is given, the release happens immediately.

  #### Returns this

  #### Example

  ``` ts
  const synth = new Tone.Synth().toDestination();
  synth.triggerAttack("C4");
  // trigger the release a second from now
  synth.triggerRelease("+1");
  ```

  Inherited from ModulationSynth.triggerRelease

  - Defined in [Tone/instrument/Monophonic.ts:101](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Monophonic.ts#L101)

### unsync

- unsync(): this

- Unsync the instrument from the Transport

  #### Returns this

  Inherited from ModulationSynth.unsync

  - Defined in [Tone/instrument/Instrument.ts:133](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Instrument.ts#L133)

### `Static` getDefaults

- getDefaults(): [FMSynthOptions](../interfaces/FMSynthOptions.md)

- #### Returns [FMSynthOptions](../interfaces/FMSynthOptions.md)

  Overrides ModulationSynth.getDefaults

  - Defined in [Tone/instrument/FMSynth.ts:54](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/FMSynth.ts#L54)
