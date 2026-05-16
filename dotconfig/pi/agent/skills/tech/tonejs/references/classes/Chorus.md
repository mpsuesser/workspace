# Class Chorus

Chorus is a stereo chorus effect composed of a left and right delay with an [LFO](LFO.md) applied to the delayTime of each channel. When [feedback](Chorus.md#feedback) is set to a value larger than 0, you also get Flanger-type effects. Inspiration from [Tuna.js](https://github.com/Dinahmoe/tuna/blob/master/tuna.js). Read more on the chorus effect on [Sound On Sound](http://www.soundonsound.com/sos/jun04/articles/synthsecrets.htm).

#### Example

``` ts
const chorus = new Tone.Chorus(4, 2.5, 0.5).toDestination().start();
const synth = new Tone.PolySynth().connect(chorus);
synth.triggerAttackRelease(["C3", "E3", "G3"], "8n");
```

#### Hierarchy

- StereoFeedbackEffect<[ChorusOptions](../interfaces/ChorusOptions.md)>
  - Chorus

- Defined in [Tone/effect/Chorus.ts:41](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/effect/Chorus.ts#L41)

## Constructors

### constructor

- new Chorus(frequency?, delayTime?, depth?): [Chorus](Chorus.md)

- #### Parameters

  - `Optional` frequency: [Unit](../modules/Unit.md).[Frequency](../types/Unit.Frequency.md)
    The frequency of the LFO.
  - `Optional` delayTime: number
    The delay of the chorus effect in ms.
  - `Optional` depth: number
    The depth of the chorus.

  #### Returns [Chorus](Chorus.md)

  Overrides StereoFeedbackEffect<ChorusOptions>.constructor

  - Defined in [Tone/effect/Chorus.ts:84](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/effect/Chorus.ts#L84)

- new Chorus(options?): [Chorus](Chorus.md)

- #### Parameters

  - `Optional` options: Partial<[ChorusOptions](../interfaces/ChorusOptions.md)>

  #### Returns [Chorus](Chorus.md)

  Overrides StereoFeedbackEffect<ChorusOptions>.constructor

  - Defined in [Tone/effect/Chorus.ts:89](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/effect/Chorus.ts#L89)

## Properties

### `Readonly` context

context: [BaseContext](BaseContext.md)

The context belonging to the node.

Inherited from StereoFeedbackEffect.context

- Defined in [Tone/core/context/ToneWithContext.ts:40](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L40)

### debug

debug: boolean = false

Set this debug flag to log all events that happen in this class.

Inherited from StereoFeedbackEffect.debug

- Defined in [Tone/core/Tone.ts:49](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L49)

### `Readonly` feedback

feedback: [Signal](Signal.md)<"normalRange">

The amount of feedback from the output back into the input of the effect (routed across left and right channels).

Inherited from StereoFeedbackEffect.feedback

- Defined in [Tone/effect/StereoFeedbackEffect.ts:24](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/effect/StereoFeedbackEffect.ts#L24)

### `Readonly` frequency

frequency: [Signal](Signal.md)<"frequency">

The frequency of the LFO which modulates the delayTime.

- Defined in [Tone/effect/Chorus.ts:77](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/effect/Chorus.ts#L77)

### `Readonly` input

input: [Gain](Gain.md)<"gain">

Inherited from StereoFeedbackEffect.input

- Defined in [Tone/effect/StereoEffect.ts:25](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/effect/StereoEffect.ts#L25)

### `Readonly` name

name: string = "Chorus"

Overrides StereoFeedbackEffect.name

- Defined in [Tone/effect/Chorus.ts:42](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/effect/Chorus.ts#L42)

### `Readonly` output

output: [CrossFade](CrossFade.md)

Inherited from StereoFeedbackEffect.output

- Defined in [Tone/effect/StereoEffect.ts:26](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/effect/StereoEffect.ts#L26)

### `Readonly` wet

wet: [Signal](Signal.md)<"normalRange">

The wet control, i.e. how much of the effected will pass through to the output.

Inherited from StereoFeedbackEffect.wet

- Defined in [Tone/effect/StereoEffect.ts:37](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/effect/StereoEffect.ts#L37)

### `Static` version

version: string = version

The version number semver

Inherited from StereoFeedbackEffect.version

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

  Inherited from StereoFeedbackEffect.blockTime

  - Defined in [Tone/core/context/ToneWithContext.ts:108](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L108)

### channelCount

- get channelCount(): number

- channelCount is the number of channels used when up-mixing and down-mixing connections to any inputs to the node. The default value is 2 except for specific nodes where its value is specially determined.

  #### Returns number

  Inherited from StereoFeedbackEffect.channelCount

  - Defined in [Tone/core/context/ToneAudioNode.ts:153](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L153)

- set channelCount(channelCount): void

- #### Parameters

  - channelCount: number

  #### Returns void

  Inherited from StereoFeedbackEffect.channelCount

  - Defined in [Tone/core/context/ToneAudioNode.ts:156](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L156)

### channelCountMode

- get channelCountMode(): ChannelCountMode

- channelCountMode determines how channels will be counted when up-mixing and down-mixing connections to any inputs to the node. The default value is "max". This attribute has no effect for nodes with no inputs.

  - "max" - computedNumberOfChannels is the maximum of the number of channels of all connections to an input. In this mode channelCount is ignored.
  - "clamped-max" - computedNumberOfChannels is determined as for "max" and then clamped to a maximum value of the given channelCount.
  - "explicit" - computedNumberOfChannels is the exact value as specified by the channelCount.

  #### Returns ChannelCountMode

  Inherited from StereoFeedbackEffect.channelCountMode

  - Defined in [Tone/core/context/ToneAudioNode.ts:170](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L170)

- set channelCountMode(channelCountMode): void

- #### Parameters

  - channelCountMode: ChannelCountMode

  #### Returns void

  Inherited from StereoFeedbackEffect.channelCountMode

  - Defined in [Tone/core/context/ToneAudioNode.ts:173](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L173)

### channelInterpretation

- get channelInterpretation(): ChannelInterpretation

- channelInterpretation determines how individual channels will be treated when up-mixing and down-mixing connections to any inputs to the node. The default value is "speakers".

  #### Returns ChannelInterpretation

  Inherited from StereoFeedbackEffect.channelInterpretation

  - Defined in [Tone/core/context/ToneAudioNode.ts:184](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L184)

- set channelInterpretation(channelInterpretation): void

- #### Parameters

  - channelInterpretation: ChannelInterpretation

  #### Returns void

  Inherited from StereoFeedbackEffect.channelInterpretation

  - Defined in [Tone/core/context/ToneAudioNode.ts:187](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L187)

### delayTime

- get delayTime(): number

- The delayTime in milliseconds of the chorus. A larger delayTime will give a more pronounced effect. Nominal range a delayTime is between 2 and 20ms.

  #### Returns number

  - Defined in [Tone/effect/Chorus.ts:165](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/effect/Chorus.ts#L165)

- set delayTime(delayTime): void

- #### Parameters

  - delayTime: number

  #### Returns void

  - Defined in [Tone/effect/Chorus.ts:168](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/effect/Chorus.ts#L168)

### depth

- get depth(): number

- The depth of the effect. A depth of 1 makes the delayTime modulate between 0 and 2\*delayTime (centered around the delayTime).

  #### Returns number

  - Defined in [Tone/effect/Chorus.ts:148](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/effect/Chorus.ts#L148)

- set depth(depth): void

- #### Parameters

  - depth: number

  #### Returns void

  - Defined in [Tone/effect/Chorus.ts:151](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/effect/Chorus.ts#L151)

### disposed

- get disposed(): boolean

- Indicates if the instance was disposed. 'Disposing' an instance means that all of the Web Audio nodes that were created for the instance are disconnected and freed for garbage collection.

  #### Returns boolean

  Inherited from StereoFeedbackEffect.disposed

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

  Inherited from StereoFeedbackEffect.numberOfInputs

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

  Inherited from StereoFeedbackEffect.numberOfOutputs

  - Defined in [Tone/core/context/ToneAudioNode.ts:70](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L70)

### sampleTime

- get sampleTime(): number

- The duration in seconds of one sample.

  #### Returns number

  Inherited from StereoFeedbackEffect.sampleTime

  - Defined in [Tone/core/context/ToneWithContext.ts:99](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L99)

### spread

- get spread(): number

- Amount of stereo spread. When set to 0, both LFO's will be panned centrally. When set to 180, LFO's will be panned hard left and right respectively.

  #### Returns number

  - Defined in [Tone/effect/Chorus.ts:188](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/effect/Chorus.ts#L188)

- set spread(spread): void

- #### Parameters

  - spread: number

  #### Returns void

  - Defined in [Tone/effect/Chorus.ts:191](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/effect/Chorus.ts#L191)

### type

- get type(): [ToneOscillatorType](../types/ToneOscillatorType.md)

- The oscillator type of the LFO.

  #### Returns [ToneOscillatorType](../types/ToneOscillatorType.md)

  - Defined in [Tone/effect/Chorus.ts:176](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/effect/Chorus.ts#L176)

- set type(type): void

- #### Parameters

  - type: [ToneOscillatorType](../types/ToneOscillatorType.md)

  #### Returns void

  - Defined in [Tone/effect/Chorus.ts:179](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/effect/Chorus.ts#L179)

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

  Inherited from StereoFeedbackEffect.chain

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

  Inherited from StereoFeedbackEffect.connect

  - Defined in [Tone/core/context/ToneAudioNode.ts:205](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L205)

### disconnect

- disconnect(destination?, outputNum?, inputNum?): this

- disconnect the output

  #### Parameters

  - `Optional` destination: [InputNode](../types/InputNode.md)
  - outputNum: number = 0
  - inputNum: number = 0

  #### Returns this

  Inherited from StereoFeedbackEffect.disconnect

  - Defined in [Tone/core/context/ToneAudioNode.ts:234](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L234)

### dispose

- dispose(): this

- #### Returns this

  Overrides StereoFeedbackEffect.dispose

  - Defined in [Tone/effect/Chorus.ts:233](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/effect/Chorus.ts#L233)

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

  Inherited from StereoFeedbackEffect.fan

  - Defined in [Tone/core/context/ToneAudioNode.ts:264](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L264)

### get

- get(): [ChorusOptions](../interfaces/ChorusOptions.md)

- Get the object's attributes.

  #### Returns [ChorusOptions](../interfaces/ChorusOptions.md)

  #### Example

  ``` ts
  const osc = new Tone.Oscillator();
  console.log(osc.get());
  ```

  Inherited from StereoFeedbackEffect.get

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

  Inherited from StereoFeedbackEffect.immediate

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

  Inherited from StereoFeedbackEffect.now

  - Defined in [Tone/core/context/ToneWithContext.ts:81](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L81)

### set

- set(props): this

- Set multiple properties at once with an object.

  #### Parameters

  - props: RecursivePartial<[ChorusOptions](../interfaces/ChorusOptions.md)>

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

  Inherited from StereoFeedbackEffect.set

  - Defined in [Tone/core/context/ToneWithContext.ts:215](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L215)

### start

- start(time?): this

- Start the effect.

  #### Parameters

  - `Optional` time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Returns this

  - Defined in [Tone/effect/Chorus.ts:199](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/effect/Chorus.ts#L199)

### stop

- stop(time?): this

- Stop the lfo

  #### Parameters

  - `Optional` time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Returns this

  - Defined in [Tone/effect/Chorus.ts:208](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/effect/Chorus.ts#L208)

### sync

- sync(): this

- Sync the filter to the transport.

  #### Returns this

  #### See

  [LFO.sync](LFO.md#sync)

  - Defined in [Tone/effect/Chorus.ts:218](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/effect/Chorus.ts#L218)

### toDestination

- toDestination(): this

- Connect the output to the context's destination node.

  #### Returns this

  #### Example

  ``` ts
  const osc = new Tone.Oscillator("C2").start();
  osc.toDestination();
  ```

  Inherited from StereoFeedbackEffect.toDestination

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

  Inherited from StereoFeedbackEffect.toFrequency

  - Defined in [Tone/core/context/ToneWithContext.ts:132](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L132)

### toMaster

- toMaster(): this

- Connect the output to the context's destination node.

  #### Returns this

  #### See

  [toDestination](Chorus.md#toDestination)

  #### Deprecated

  Inherited from StereoFeedbackEffect.toMaster

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

  Inherited from StereoFeedbackEffect.toSeconds

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

  Inherited from StereoFeedbackEffect.toString

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

  Inherited from StereoFeedbackEffect.toTicks

  - Defined in [Tone/core/context/ToneWithContext.ts:142](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L142)

### unsync

- unsync(): this

- Unsync the filter from the transport.

  #### Returns this

  - Defined in [Tone/effect/Chorus.ts:227](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/effect/Chorus.ts#L227)

### `Static` getDefaults

- getDefaults(): [ChorusOptions](../interfaces/ChorusOptions.md)

- #### Returns [ChorusOptions](../interfaces/ChorusOptions.md)

  Overrides StereoFeedbackEffect.getDefaults

  - Defined in [Tone/effect/Chorus.ts:132](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/effect/Chorus.ts#L132)
