# Class PWMOscillator

PWMOscillator modulates the width of a Tone.PulseOscillator at the modulationFrequency. This has the effect of continuously changing the timbre of the oscillator by altering the harmonics generated.

#### Example

``` ts
return Tone.Offline(() => {
    const pwm = new Tone.PWMOscillator(60, 0.3).toDestination().start();
}, 0.1, 1);
```

#### Hierarchy

- Source<[PWMOscillatorOptions](../interfaces/PWMOscillatorOptions.md)>
  - PWMOscillator

#### Implements

- ToneOscillatorInterface

- Defined in [Tone/source/oscillator/PWMOscillator.ts:28](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/PWMOscillator.ts#L28)

## Constructors

### constructor

- new PWMOscillator(frequency?, modulationFrequency?): [PWMOscillator](PWMOscillator.md)

- #### Parameters

  - `Optional` frequency: [Unit](../modules/Unit.md).[Frequency](../types/Unit.Frequency.md)
    The starting frequency of the oscillator.
  - `Optional` modulationFrequency: [Unit](../modules/Unit.md).[Frequency](../types/Unit.Frequency.md)
    The modulation frequency of the width of the pulse.

  #### Returns [PWMOscillator](PWMOscillator.md)

  Overrides Source<PWMOscillatorOptions>.constructor

  - Defined in [Tone/source/oscillator/PWMOscillator.ts:77](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/PWMOscillator.ts#L77)

- new PWMOscillator(options?): [PWMOscillator](PWMOscillator.md)

- #### Parameters

  - `Optional` options: Partial<[PWMOscillatorOptions](../interfaces/PWMOscillatorOptions.md)>

  #### Returns [PWMOscillator](PWMOscillator.md)

  Overrides Source<PWMOscillatorOptions>.constructor

  - Defined in [Tone/source/oscillator/PWMOscillator.ts:78](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/PWMOscillator.ts#L78)

## Properties

### `Readonly` context

context: [BaseContext](BaseContext.md)

The context belonging to the node.

Inherited from Source.context

- Defined in [Tone/core/context/ToneWithContext.ts:40](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L40)

### debug

debug: boolean = false

Set this debug flag to log all events that happen in this class.

Inherited from Source.debug

- Defined in [Tone/core/Tone.ts:49](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L49)

### `Readonly` detune

detune: [Signal](Signal.md)<"cents">

The detune of the oscillator.

Implementation of ToneOscillatorInterface.detune

- Defined in [Tone/source/oscillator/PWMOscillator.ts:62](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/PWMOscillator.ts#L62)

### `Readonly` frequency

frequency: [Signal](Signal.md)<"frequency">

The frequency control.

Implementation of ToneOscillatorInterface.frequency

- Defined in [Tone/source/oscillator/PWMOscillator.ts:57](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/PWMOscillator.ts#L57)

### input

input: undefined = undefined

Sources have no inputs

Inherited from Source.input

- Defined in [Tone/source/Source.ts:63](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/Source.ts#L63)

### `Readonly` modulationFrequency

modulationFrequency: [Signal](Signal.md)<"frequency">

The width modulation rate of the oscillator.

#### Example

``` ts
return Tone.Offline(() => {
    const osc = new Tone.PWMOscillator(20, 2).toDestination().start();
}, 0.1, 1);
```

- Defined in [Tone/source/oscillator/PWMOscillator.ts:71](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/PWMOscillator.ts#L71)

### `Readonly` name

name: string = "PWMOscillator"

Overrides Source.name

- Defined in [Tone/source/oscillator/PWMOscillator.ts:32](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/PWMOscillator.ts#L32)

### onstop

onstop: onStopCallback

The callback to invoke when the source is stopped.

Inherited from Source.onstop

- Defined in [Tone/source/Source.ts:76](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/Source.ts#L76)

### output

output: [OutputNode](../types/OutputNode.md)

The output node

Inherited from Source.output

- Defined in [Tone/source/Source.ts:58](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/Source.ts#L58)

### `Readonly` sourceType

sourceType: "pwm" = "pwm"

- Defined in [Tone/source/oscillator/PWMOscillator.ts:34](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/PWMOscillator.ts#L34)

### volume

volume: [Param](Param.md)<"decibels">

The volume of the output in decibels.

#### Example

``` ts
const source = new Tone.PWMOscillator().toDestination();
source.volume.value = -6;
```

Inherited from Source.volume

- Defined in [Tone/source/Source.ts:71](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/Source.ts#L71)

### `Static` version

version: string = version

The version number semver

Inherited from Source.version

- Defined in [Tone/core/Tone.ts:28](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L28)

## Accessors

### baseType

- get baseType(): "pwm"

- The baseType of the oscillator. Always returns "pwm".

  #### Returns "pwm"

  Implementation of ToneOscillatorInterface.baseType

  - Defined in [Tone/source/oscillator/PWMOscillator.ts:158](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/PWMOscillator.ts#L158)

### blockTime

- get blockTime(): number

- The number of seconds of 1 processing block (128 samples)

  #### Returns number

  #### Example

  ``` ts
  console.log(Tone.Destination.blockTime);
  ```

  Inherited from Source.blockTime

  - Defined in [Tone/core/context/ToneWithContext.ts:108](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L108)

### channelCount

- get channelCount(): number

- channelCount is the number of channels used when up-mixing and down-mixing connections to any inputs to the node. The default value is 2 except for specific nodes where its value is specially determined.

  #### Returns number

  Inherited from Source.channelCount

  - Defined in [Tone/core/context/ToneAudioNode.ts:153](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L153)

- set channelCount(channelCount): void

- #### Parameters

  - channelCount: number

  #### Returns void

  Inherited from Source.channelCount

  - Defined in [Tone/core/context/ToneAudioNode.ts:156](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L156)

### channelCountMode

- get channelCountMode(): ChannelCountMode

- channelCountMode determines how channels will be counted when up-mixing and down-mixing connections to any inputs to the node. The default value is "max". This attribute has no effect for nodes with no inputs.

  - "max" - computedNumberOfChannels is the maximum of the number of channels of all connections to an input. In this mode channelCount is ignored.
  - "clamped-max" - computedNumberOfChannels is determined as for "max" and then clamped to a maximum value of the given channelCount.
  - "explicit" - computedNumberOfChannels is the exact value as specified by the channelCount.

  #### Returns ChannelCountMode

  Inherited from Source.channelCountMode

  - Defined in [Tone/core/context/ToneAudioNode.ts:170](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L170)

- set channelCountMode(channelCountMode): void

- #### Parameters

  - channelCountMode: ChannelCountMode

  #### Returns void

  Inherited from Source.channelCountMode

  - Defined in [Tone/core/context/ToneAudioNode.ts:173](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L173)

### channelInterpretation

- get channelInterpretation(): ChannelInterpretation

- channelInterpretation determines how individual channels will be treated when up-mixing and down-mixing connections to any inputs to the node. The default value is "speakers".

  #### Returns ChannelInterpretation

  Inherited from Source.channelInterpretation

  - Defined in [Tone/core/context/ToneAudioNode.ts:184](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L184)

- set channelInterpretation(channelInterpretation): void

- #### Parameters

  - channelInterpretation: ChannelInterpretation

  #### Returns void

  Inherited from Source.channelInterpretation

  - Defined in [Tone/core/context/ToneAudioNode.ts:187](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L187)

### disposed

- get disposed(): boolean

- Indicates if the instance was disposed. 'Disposing' an instance means that all of the Web Audio nodes that were created for the instance are disconnected and freed for garbage collection.

  #### Returns boolean

  Inherited from Source.disposed

  - Defined in [Tone/core/Tone.ts:96](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L96)

### mute

- get mute(): boolean

- Mute the output.

  #### Returns boolean

  #### Example

  ``` ts
  const osc = new Tone.Oscillator().toDestination().start();
  // mute the output
  osc.mute = true;
  ```

  Inherited from Source.mute

  - Defined in [Tone/source/Source.ts:159](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/Source.ts#L159)

- set mute(mute): void

- #### Parameters

  - mute: boolean

  #### Returns void

  Inherited from Source.mute

  - Defined in [Tone/source/Source.ts:162](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/Source.ts#L162)

### numberOfInputs

- get numberOfInputs(): number

- The number of inputs feeding into the AudioNode. For source nodes, this will be 0.

  #### Returns number

  #### Example

  ``` ts
  const node = new Tone.Gain();
  console.log(node.numberOfInputs);
  ```

  Inherited from Source.numberOfInputs

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

  Inherited from Source.numberOfOutputs

  - Defined in [Tone/core/context/ToneAudioNode.ts:70](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L70)

### partialCount

- get partialCount(): number

- No partials for this waveform type.

  #### Returns number

  Implementation of ToneOscillatorInterface.partialCount

  - Defined in [Tone/source/oscillator/PWMOscillator.ts:172](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/PWMOscillator.ts#L172)

### partials

- get partials(): number\[\]

- The partials of the waveform. Cannot set partials for this waveform type

  #### Returns number\[\]

  Implementation of ToneOscillatorInterface.partials

  - Defined in [Tone/source/oscillator/PWMOscillator.ts:165](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/PWMOscillator.ts#L165)

### phase

- get phase(): number

- The phase of the oscillator in degrees.

  #### Returns number

  Implementation of ToneOscillatorInterface.phase

  - Defined in [Tone/source/oscillator/PWMOscillator.ts:179](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/PWMOscillator.ts#L179)

- set phase(phase): void

- #### Parameters

  - phase: number

  #### Returns void

  Implementation of ToneOscillatorInterface.phase

  - Defined in [Tone/source/oscillator/PWMOscillator.ts:182](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/PWMOscillator.ts#L182)

### sampleTime

- get sampleTime(): number

- The duration in seconds of one sample.

  #### Returns number

  Inherited from Source.sampleTime

  - Defined in [Tone/core/context/ToneWithContext.ts:99](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L99)

### state

- get state(): [BasicPlaybackState](../types/BasicPlaybackState.md)

- Returns the playback state of the source, either "started" or "stopped".

  #### Returns [BasicPlaybackState](../types/BasicPlaybackState.md)

  #### Example

  ``` ts
  const player = new Tone.Player("https://tonejs.github.io/audio/berklee/ahntone_c3.mp3", () => {
      player.start();
      console.log(player.state);
  }).toDestination();
  ```

  Inherited from Source.state

  - Defined in [Tone/source/Source.ts:138](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/Source.ts#L138)

### type

- get type(): "pwm"

- The type of the oscillator. Always returns "pwm".

  #### Returns "pwm"

  Implementation of ToneOscillatorInterface.type

  - Defined in [Tone/source/oscillator/PWMOscillator.ts:151](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/PWMOscillator.ts#L151)

## Methods

### asArray

- asArray(length?): Promise<Float32Array>

- #### Parameters

  - length: number = 1024

  #### Returns Promise<Float32Array>

  Implementation of ToneOscillatorInterface.asArray

  - Defined in [Tone/source/oscillator/PWMOscillator.ts:186](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/PWMOscillator.ts#L186)

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

  Inherited from Source.chain

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

  Inherited from Source.connect

  - Defined in [Tone/core/context/ToneAudioNode.ts:205](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L205)

### disconnect

- disconnect(destination?, outputNum?, inputNum?): this

- disconnect the output

  #### Parameters

  - `Optional` destination: [InputNode](../types/InputNode.md)
  - outputNum: number = 0
  - inputNum: number = 0

  #### Returns this

  Inherited from Source.disconnect

  - Defined in [Tone/core/context/ToneAudioNode.ts:234](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L234)

### dispose

- dispose(): this

- Clean up.

  #### Returns this

  Overrides Source.dispose

  - Defined in [Tone/source/oscillator/PWMOscillator.ts:193](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/PWMOscillator.ts#L193)

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

  Inherited from Source.fan

  - Defined in [Tone/core/context/ToneAudioNode.ts:264](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L264)

### get

- get(): [PWMOscillatorOptions](../interfaces/PWMOscillatorOptions.md)

- Get the object's attributes.

  #### Returns [PWMOscillatorOptions](../interfaces/PWMOscillatorOptions.md)

  #### Example

  ``` ts
  const osc = new Tone.Oscillator();
  console.log(osc.get());
  ```

  Inherited from Source.get

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

  Inherited from Source.immediate

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

  Inherited from Source.now

  - Defined in [Tone/core/context/ToneWithContext.ts:81](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L81)

### restart

- restart(time?, offset?, duration?): this

- Restart the source.

  #### Parameters

  - `Optional` time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
  - `Optional` offset: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
  - `Optional` duration: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Returns this

  Inherited from Source.restart

  - Defined in [Tone/source/Source.ts:293](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/Source.ts#L293)

### set

- set(props): this

- Set multiple properties at once with an object.

  #### Parameters

  - props: RecursivePartial<[PWMOscillatorOptions](../interfaces/PWMOscillatorOptions.md)>

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

  Inherited from Source.set

  - Defined in [Tone/core/context/ToneWithContext.ts:215](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L215)

### start

- start(time?, offset?, duration?): this

- Start the source at the specified time. If no time is given, start the source now.

  #### Parameters

  - `Optional` time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
    When the source should be started.
  - `Optional` offset: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
  - `Optional` duration: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Returns this

  #### Example

  ``` ts
  const source = new Tone.Oscillator().toDestination();
  source.start("+0.5"); // starts the source 0.5 seconds from now
  ```

  Inherited from Source.start

  - Defined in [Tone/source/Source.ts:195](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/Source.ts#L195)

### stop

- stop(time?): this

- Stop the source at the specified time. If no time is given, stop the source now.

  #### Parameters

  - `Optional` time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
    When the source should be stopped.

  #### Returns this

  #### Example

  ``` ts
  const source = new Tone.Oscillator().toDestination();
  source.start();
  source.stop("+0.5"); // stops the source 0.5 seconds from now
  ```

  Inherited from Source.stop

  - Defined in [Tone/source/Source.ts:264](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/Source.ts#L264)

### sync

- sync(): this

- Sync the source to the Transport so that all subsequent calls to `start` and `stop` are synced to the TransportTime instead of the AudioContext time.

  #### Returns this

  #### Example

  ``` ts
  const osc = new Tone.Oscillator().toDestination();
  // sync the source so that it plays between 0 and 0.3 on the Transport's timeline
  osc.sync().start(0).stop(0.3);
  // start the transport.
  Tone.Transport.start();
  // set it to loop once a second
  Tone.Transport.loop = true;
  Tone.Transport.loopEnd = 1;
  ```

  Inherited from Source.sync

  - Defined in [Tone/source/Source.ts:317](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/Source.ts#L317)

### toDestination

- toDestination(): this

- Connect the output to the context's destination node.

  #### Returns this

  #### Example

  ``` ts
  const osc = new Tone.Oscillator("C2").start();
  osc.toDestination();
  ```

  Inherited from Source.toDestination

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

  Inherited from Source.toFrequency

  - Defined in [Tone/core/context/ToneWithContext.ts:132](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L132)

### toMaster

- toMaster(): this

- Connect the output to the context's destination node.

  #### Returns this

  #### See

  [toDestination](PWMOscillator.md#toDestination)

  #### Deprecated

  Inherited from Source.toMaster

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

  Inherited from Source.toSeconds

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

  Inherited from Source.toString

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

  Inherited from Source.toTicks

  - Defined in [Tone/core/context/ToneWithContext.ts:142](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L142)

### unsync

- unsync(): this

- Unsync the source to the Transport.

  #### Returns this

  #### See

  [sync](PWMOscillator.md#sync)

  Inherited from Source.unsync

  - Defined in [Tone/source/Source.ts:368](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/Source.ts#L368)

### `Static` getDefaults

- getDefaults(): [PWMOscillatorOptions](../interfaces/PWMOscillatorOptions.md)

- #### Returns [PWMOscillatorOptions](../interfaces/PWMOscillatorOptions.md)

  Overrides Source.getDefaults

  - Defined in [Tone/source/oscillator/PWMOscillator.ts:113](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/oscillator/PWMOscillator.ts#L113)
