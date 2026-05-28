# Class PolySynth<Voice>

PolySynth handles voice creation and allocation for any instruments passed in as the second parameter. PolySynth is not a synthesizer by itself, it merely manages voices of one of the other types of synths, allowing any of the monophonic synthesizers to be polyphonic.

#### Example

``` ts
const synth = new Tone.PolySynth().toDestination();
// set the attributes across all the voices using 'set'
synth.set({ detune: -1200 });
// play a chord
synth.triggerAttackRelease(["C4", "E4", "A4"], 1);
```

#### Type Parameters

- Voice extends Monophonic<any> = [Synth](Synth.md)

#### Hierarchy

- Instrument<VoiceOptions<[Voice](PolySynth.md#constructor.new_PolySynth.Voice-1)>>
  - PolySynth

- Defined in [Tone/instrument/PolySynth.ts:76](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/PolySynth.ts#L76)

## Constructors

### constructor

- new PolySynth<[Voice](PolySynth.md#constructor.new_PolySynth.Voice-1)>(voice?, options?): [PolySynth](PolySynth.md)<[Voice](PolySynth.md#constructor.new_PolySynth.Voice-1)>

- #### Type Parameters

  - Voice extends Monophonic<any> = [Synth](Synth.md)<[SynthOptions](../interfaces/SynthOptions.md)>

  #### Parameters

  - `Optional` voice: VoiceConstructor<[Voice](PolySynth.md#constructor.new_PolySynth.Voice-1)>
    The constructor of the voices
  - `Optional` options: RecursivePartial<OmitMonophonicOptions<VoiceOptions<[Voice](PolySynth.md#constructor.new_PolySynth.Voice-1)>>>
    The options object to set the synth voice

  #### Returns [PolySynth](PolySynth.md)<[Voice](PolySynth.md#constructor.new_PolySynth.Voice-1)>

  Overrides Instrument<VoiceOptions<Voice>>.constructor

  - Defined in [Tone/instrument/PolySynth.ts:134](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/PolySynth.ts#L134)

- new PolySynth<[Voice](PolySynth.md#constructor.new_PolySynth-1.Voice-2)>(options?): [PolySynth](PolySynth.md)<[Voice](PolySynth.md#constructor.new_PolySynth.Voice-1)>

- #### Type Parameters

  - Voice extends Monophonic<any> = [Synth](Synth.md)<[SynthOptions](../interfaces/SynthOptions.md)>

  #### Parameters

  - `Optional` options: Partial<[PolySynthOptions](../interfaces/PolySynthOptions.md)<[Voice](PolySynth.md#constructor.new_PolySynth.Voice-1)>>

  #### Returns [PolySynth](PolySynth.md)<[Voice](PolySynth.md#constructor.new_PolySynth.Voice-1)>

  Overrides Instrument<VoiceOptions<Voice>>.constructor

  - Defined in [Tone/instrument/PolySynth.ts:138](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/PolySynth.ts#L138)

## Properties

### `Readonly` context

context: [BaseContext](BaseContext.md)

The context belonging to the node.

Inherited from Instrument.context

- Defined in [Tone/core/context/ToneWithContext.ts:40](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L40)

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

### maxPolyphony

maxPolyphony: number

The polyphony limit.

- Defined in [Tone/instrument/PolySynth.ts:108](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/PolySynth.ts#L108)

### `Readonly` name

name: string = "PolySynth"

Overrides Instrument.name

- Defined in [Tone/instrument/PolySynth.ts:79](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/PolySynth.ts#L79)

### output

output: [OutputNode](../types/OutputNode.md)

Inherited from Instrument.output

- Defined in [Tone/instrument/Instrument.ts:26](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Instrument.ts#L26)

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

### activeVoices

- get activeVoices(): number

- The number of active voices.

  #### Returns number

  - Defined in [Tone/instrument/PolySynth.ts:184](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/PolySynth.ts#L184)

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

- #### Returns this

  Overrides Instrument.dispose

  - Defined in [Tone/instrument/PolySynth.ts:468](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/PolySynth.ts#L468)

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

- get(): VoiceOptions<[Voice](PolySynth.md#constructor.new_PolySynth.Voice-1)>

- #### Returns VoiceOptions<[Voice](PolySynth.md#constructor.new_PolySynth.Voice-1)>

  Overrides Instrument.get

  - Defined in [Tone/instrument/PolySynth.ts:452](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/PolySynth.ts#L452)

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

- Trigger the release portion of all the currently active voices immediately. Useful for silencing the synth.

  #### Parameters

  - `Optional` time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Returns this

  - Defined in [Tone/instrument/PolySynth.ts:460](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/PolySynth.ts#L460)

### set

- set(options): this

- Set a member/attribute of the voices

  #### Parameters

  - options: RecursivePartial<VoiceOptions<[Voice](PolySynth.md#constructor.new_PolySynth.Voice-1)>>

  #### Returns this

  #### Example

  ``` ts
  const poly = new Tone.PolySynth().toDestination();
  // set all of the voices using an options object for the synth type
  poly.set({
      envelope: {
          attack: 0.25
      }
  });
  poly.triggerAttackRelease("Bb3", 0.2);
  ```

  Overrides Instrument.set

  - Defined in [Tone/instrument/PolySynth.ts:439](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/PolySynth.ts#L439)

### sync

- sync(): this

- #### Returns this

  Overrides Instrument.sync

  - Defined in [Tone/instrument/PolySynth.ts:409](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/PolySynth.ts#L409)

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

  [toDestination](PolySynth.md#toDestination)

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

- Trigger the attack portion of the note

  #### Parameters

  - notes: [Unit](../modules/Unit.md).[Frequency](../types/Unit.Frequency.md) \| [Unit](../modules/Unit.md).[Frequency](../types/Unit.Frequency.md)\[\]
    The notes to play. Accepts a single Frequency or an array of frequencies.
  - `Optional` time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
    The start time of the note.
  - `Optional` velocity: number
    The velocity of the note.

  #### Returns this

  #### Example

  ``` ts
  const synth = new Tone.PolySynth(Tone.FMSynth).toDestination();
  // trigger a chord immediately with a velocity of 0.2
  synth.triggerAttack(["Ab3", "C4", "F5"], Tone.now(), 0.2);
  ```

  Overrides Instrument.triggerAttack

  - Defined in [Tone/instrument/PolySynth.ts:333](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/PolySynth.ts#L333)

### triggerAttackRelease

- triggerAttackRelease(notes, duration, time?, velocity?): this

- Trigger the attack and release after the specified duration

  #### Parameters

  - notes: [Unit](../modules/Unit.md).[Frequency](../types/Unit.Frequency.md) \| [Unit](../modules/Unit.md).[Frequency](../types/Unit.Frequency.md)\[\]
    The notes to play. Accepts a single Frequency or an array of frequencies.
  - duration: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md) \| [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)\[\]
    the duration of the note
  - `Optional` time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
    if no time is given, defaults to now
  - `Optional` velocity: number
    the velocity of the attack (0-1)

  #### Returns this

  #### Example

  ``` ts
  const poly = new Tone.PolySynth(Tone.AMSynth).toDestination();
  // can pass in an array of durations as well
  poly.triggerAttackRelease(["Eb3", "G4", "Bb4", "D5"], [4, 3, 2, 1]);
  ```

  Overrides Instrument.triggerAttackRelease

  - Defined in [Tone/instrument/PolySynth.ts:378](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/PolySynth.ts#L378)

### triggerRelease

- triggerRelease(notes, time?): this

- Trigger the release of the note. Unlike monophonic instruments, a note (or array of notes) needs to be passed in as the first argument.

  #### Parameters

  - notes: [Unit](../modules/Unit.md).[Frequency](../types/Unit.Frequency.md) \| [Unit](../modules/Unit.md).[Frequency](../types/Unit.Frequency.md)\[\]
    The notes to play. Accepts a single Frequency or an array of frequencies.
  - `Optional` time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
    When the release will be triggered.

  #### Returns this

  #### Example

  ``` ts
  const poly = new Tone.PolySynth(Tone.AMSynth).toDestination();
  poly.triggerAttack(["Ab3", "C4", "F5"]);
  // trigger the release of the given notes.
  poly.triggerRelease(["Ab3", "C4"], "+1");
  poly.triggerRelease("F5", "+3");
  ```

  Overrides Instrument.triggerRelease

  - Defined in [Tone/instrument/PolySynth.ts:358](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/PolySynth.ts#L358)

### unsync

- unsync(): this

- Unsync the instrument from the Transport

  #### Returns this

  Inherited from Instrument.unsync

  - Defined in [Tone/instrument/Instrument.ts:133](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/Instrument.ts#L133)

### `Static` getDefaults

- getDefaults(): [PolySynthOptions](../interfaces/PolySynthOptions.md)<[Synth](Synth.md)<[SynthOptions](../interfaces/SynthOptions.md)>>

- #### Returns [PolySynthOptions](../interfaces/PolySynthOptions.md)<[Synth](Synth.md)<[SynthOptions](../interfaces/SynthOptions.md)>>

  Overrides Instrument.getDefaults

  - Defined in [Tone/instrument/PolySynth.ts:173](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/instrument/PolySynth.ts#L173)
