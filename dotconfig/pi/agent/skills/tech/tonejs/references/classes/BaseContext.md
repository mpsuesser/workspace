# Class BaseContext`Abstract`

Emitter gives classes which extend it the ability to listen for and emit events. Inspiration and reference from Jerome Etienne's [MicroEvent](https://github.com/jeromeetienne/microevent.js). MIT (c) 2011 Jerome Etienne.

#### Hierarchy ([view full](../hierarchy.md#BaseContext))

- [Emitter](Emitter.md)<"statechange" \| "tick">
  - BaseContext
    - [Context](Context.md)

#### Implements

- [BaseAudioContextSubset](../types/BaseAudioContextSubset.md)

- Defined in [Tone/core/context/BaseContext.ts:28](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/BaseContext.ts#L28)

## Constructors

### constructor

- new BaseContext(): [BaseContext](BaseContext.md)

- #### Returns [BaseContext](BaseContext.md)

  Inherited from [Emitter](Emitter.md).[constructor](Emitter.md#constructor)

## Properties

### debug

debug: boolean = false

Set this debug flag to log all events that happen in this class.

Inherited from [Emitter](Emitter.md).[debug](Emitter.md#debug)

- Defined in [Tone/core/Tone.ts:49](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L49)

### `Readonly` isOffline

isOffline: boolean = false

- Defined in [Tone/core/context/BaseContext.ts:158](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/BaseContext.ts#L158)

### `Abstract` latencyHint

latencyHint: number \| AudioContextLatencyCategory

- Defined in [Tone/core/context/BaseContext.ts:111](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/BaseContext.ts#L111)

### `Abstract` lookAhead

lookAhead: number

- Defined in [Tone/core/context/BaseContext.ts:109](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/BaseContext.ts#L109)

### `Readonly` name

name: string = "Emitter"

Inherited from [Emitter](Emitter.md).[name](Emitter.md#name)

- Defined in [Tone/core/util/Emitter.ts:16](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/util/Emitter.ts#L16)

### `Static` version

version: string = version

The version number semver

Inherited from [Emitter](Emitter.md).[version](Emitter.md#version)

- Defined in [Tone/core/Tone.ts:28](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L28)

## Accessors

### `Abstract` currentTime

- get currentTime(): number

- #### Returns number

  Implementation of BaseAudioContextSubset.currentTime

  - Defined in [Tone/core/context/BaseContext.ts:131](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/BaseContext.ts#L131)

### `Abstract` destination

- get destination(): DestinationClass

- #### Returns DestinationClass

  - Defined in [Tone/core/context/BaseContext.ts:143](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/BaseContext.ts#L143)

### disposed

- get disposed(): boolean

- Indicates if the instance was disposed. 'Disposing' an instance means that all of the Web Audio nodes that were created for the instance are disconnected and freed for garbage collection.

  #### Returns boolean

  Inherited from Emitter.disposed

  - Defined in [Tone/core/Tone.ts:96](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L96)

### `Abstract` draw

- get draw(): DrawClass

- #### Returns DrawClass

  - Defined in [Tone/core/context/BaseContext.ts:141](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/BaseContext.ts#L141)

### `Abstract` listener

- get listener(): ListenerClass

- #### Returns ListenerClass

  - Defined in [Tone/core/context/BaseContext.ts:137](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/BaseContext.ts#L137)

### `Abstract` rawContext

- get rawContext(): AnyAudioContext

- #### Returns AnyAudioContext

  - Defined in [Tone/core/context/BaseContext.ts:105](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/BaseContext.ts#L105)

### `Abstract` sampleRate

- get sampleRate(): number

- #### Returns number

  Implementation of BaseAudioContextSubset.sampleRate

  - Defined in [Tone/core/context/BaseContext.ts:135](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/BaseContext.ts#L135)

### `Abstract` state

- get state(): AudioContextState

- #### Returns AudioContextState

  Implementation of BaseAudioContextSubset.state

  - Defined in [Tone/core/context/BaseContext.ts:133](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/BaseContext.ts#L133)

### `Abstract` transport

- get transport(): TransportClass

- #### Returns TransportClass

  - Defined in [Tone/core/context/BaseContext.ts:139](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/BaseContext.ts#L139)

## Methods

### `Abstract` addAudioWorkletModule

- addAudioWorkletModule(\_url): Promise<void>

- #### Parameters

  - \_url: string

  #### Returns Promise<void>

  - Defined in [Tone/core/context/BaseContext.ts:107](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/BaseContext.ts#L107)

### `Abstract` clearInterval

- clearInterval(\_id): this

- #### Parameters

  - \_id: number

  #### Returns this

  - Defined in [Tone/core/context/BaseContext.ts:127](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/BaseContext.ts#L127)

### `Abstract` clearTimeout

- clearTimeout(\_id): this

- #### Parameters

  - \_id: number

  #### Returns this

  - Defined in [Tone/core/context/BaseContext.ts:120](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/BaseContext.ts#L120)

### `Abstract` createAnalyser

- createAnalyser(): AnalyserNode

- #### Returns AnalyserNode

  Implementation of BaseAudioContextSubset.createAnalyser

  - Defined in [Tone/core/context/BaseContext.ts:35](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/BaseContext.ts#L35)

### `Abstract` createAudioWorkletNode

- createAudioWorkletNode(\_name, \_options?): AudioWorkletNode

- #### Parameters

  - \_name: string
  - `Optional` \_options: Partial<AudioWorkletNodeOptions>

  #### Returns AudioWorkletNode

  - Defined in [Tone/core/context/BaseContext.ts:100](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/BaseContext.ts#L100)

### `Abstract` createBiquadFilter

- createBiquadFilter(): BiquadFilterNode

- #### Returns BiquadFilterNode

  Implementation of BaseAudioContextSubset.createBiquadFilter

  - Defined in [Tone/core/context/BaseContext.ts:41](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/BaseContext.ts#L41)

### `Abstract` createBuffer

- createBuffer(\_numberOfChannels, \_length, \_sampleRate): AudioBuffer

- #### Parameters

  - \_numberOfChannels: number
  - \_length: number
  - \_sampleRate: number

  #### Returns AudioBuffer

  Implementation of BaseAudioContextSubset.createBuffer

  - Defined in [Tone/core/context/BaseContext.ts:43](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/BaseContext.ts#L43)

### `Abstract` createBufferSource

- createBufferSource(): AudioBufferSourceNode

- #### Returns AudioBufferSourceNode

  Implementation of BaseAudioContextSubset.createBufferSource

  - Defined in [Tone/core/context/BaseContext.ts:39](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/BaseContext.ts#L39)

### `Abstract` createChannelMerger

- createChannelMerger(\_numberOfInputs?): ChannelMergerNode

- #### Parameters

  - `Optional` \_numberOfInputs: number

  #### Returns ChannelMergerNode

  Implementation of BaseAudioContextSubset.createChannelMerger

  - Defined in [Tone/core/context/BaseContext.ts:49](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/BaseContext.ts#L49)

### `Abstract` createChannelSplitter

- createChannelSplitter(\_numberOfOutputs?): ChannelSplitterNode

- #### Parameters

  - `Optional` \_numberOfOutputs: number

  #### Returns ChannelSplitterNode

  Implementation of BaseAudioContextSubset.createChannelSplitter

  - Defined in [Tone/core/context/BaseContext.ts:53](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/BaseContext.ts#L53)

### `Abstract` createConstantSource

- createConstantSource(): ConstantSourceNode

- #### Returns ConstantSourceNode

  Implementation of BaseAudioContextSubset.createConstantSource

  - Defined in [Tone/core/context/BaseContext.ts:57](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/BaseContext.ts#L57)

### `Abstract` createConvolver

- createConvolver(): ConvolverNode

- #### Returns ConvolverNode

  Implementation of BaseAudioContextSubset.createConvolver

  - Defined in [Tone/core/context/BaseContext.ts:59](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/BaseContext.ts#L59)

### `Abstract` createDelay

- createDelay(\_maxDelayTime?): DelayNode

- #### Parameters

  - `Optional` \_maxDelayTime: number

  #### Returns DelayNode

  Implementation of BaseAudioContextSubset.createDelay

  - Defined in [Tone/core/context/BaseContext.ts:61](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/BaseContext.ts#L61)

### `Abstract` createDynamicsCompressor

- createDynamicsCompressor(): DynamicsCompressorNode

- #### Returns DynamicsCompressorNode

  Implementation of BaseAudioContextSubset.createDynamicsCompressor

  - Defined in [Tone/core/context/BaseContext.ts:63](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/BaseContext.ts#L63)

### `Abstract` createGain

- createGain(): GainNode

- #### Returns GainNode

  Implementation of BaseAudioContextSubset.createGain

  - Defined in [Tone/core/context/BaseContext.ts:65](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/BaseContext.ts#L65)

### `Abstract` createIIRFilter

- createIIRFilter(\_feedForward, \_feedback): IIRFilterNode

- #### Parameters

  - \_feedForward: number\[\] \| Float32Array
  - \_feedback: number\[\] \| Float32Array

  #### Returns IIRFilterNode

  Implementation of BaseAudioContextSubset.createIIRFilter

  - Defined in [Tone/core/context/BaseContext.ts:67](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/BaseContext.ts#L67)

### `Abstract` createMediaElementSource

- createMediaElementSource(\_element): MediaElementAudioSourceNode

- #### Parameters

  - \_element: HTMLMediaElement

  #### Returns MediaElementAudioSourceNode

  - Defined in [Tone/core/context/BaseContext.ts:88](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/BaseContext.ts#L88)

### `Abstract` createMediaStreamDestination

- createMediaStreamDestination(): MediaStreamAudioDestinationNode

- #### Returns MediaStreamAudioDestinationNode

  - Defined in [Tone/core/context/BaseContext.ts:92](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/BaseContext.ts#L92)

### `Abstract` createMediaStreamSource

- createMediaStreamSource(\_stream): MediaStreamAudioSourceNode

- #### Parameters

  - \_stream: MediaStream

  #### Returns MediaStreamAudioSourceNode

  - Defined in [Tone/core/context/BaseContext.ts:84](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/BaseContext.ts#L84)

### `Abstract` createOscillator

- createOscillator(): OscillatorNode

- #### Returns OscillatorNode

  Implementation of BaseAudioContextSubset.createOscillator

  - Defined in [Tone/core/context/BaseContext.ts:37](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/BaseContext.ts#L37)

### `Abstract` createPanner

- createPanner(): PannerNode

- #### Returns PannerNode

  Implementation of BaseAudioContextSubset.createPanner

  - Defined in [Tone/core/context/BaseContext.ts:72](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/BaseContext.ts#L72)

### `Abstract` createPeriodicWave

- createPeriodicWave(\_real, \_imag, \_constraints?): PeriodicWave

- #### Parameters

  - \_real: number\[\] \| Float32Array
  - \_imag: number\[\] \| Float32Array
  - `Optional` \_constraints: PeriodicWaveConstraints

  #### Returns PeriodicWave

  Implementation of BaseAudioContextSubset.createPeriodicWave

  - Defined in [Tone/core/context/BaseContext.ts:74](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/BaseContext.ts#L74)

### `Abstract` createStereoPanner

- createStereoPanner(): StereoPannerNode

- #### Returns StereoPannerNode

  Implementation of BaseAudioContextSubset.createStereoPanner

  - Defined in [Tone/core/context/BaseContext.ts:80](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/BaseContext.ts#L80)

### `Abstract` createWaveShaper

- createWaveShaper(): WaveShaperNode

- #### Returns WaveShaperNode

  Implementation of BaseAudioContextSubset.createWaveShaper

  - Defined in [Tone/core/context/BaseContext.ts:82](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/BaseContext.ts#L82)

### `Abstract` decodeAudioData

- decodeAudioData(\_audioData): Promise<AudioBuffer>

- #### Parameters

  - \_audioData: ArrayBuffer

  #### Returns Promise<AudioBuffer>

  Implementation of BaseAudioContextSubset.decodeAudioData

  - Defined in [Tone/core/context/BaseContext.ts:94](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/BaseContext.ts#L94)

### dispose

- dispose(): this

- Clean up

  #### Returns this

  Inherited from [Emitter](Emitter.md).[dispose](Emitter.md#dispose)

  - Defined in [Tone/core/util/Emitter.ts:122](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/util/Emitter.ts#L122)

### emit

- emit(event, ...args): this

- Invoke all of the callbacks bound to the event with any arguments passed in.

  #### Parameters

  - event: "statechange" \| "tick"
    The name of the event.
  - `Rest` ...args: any\[\]
    The arguments to pass to the functions listening.

  #### Returns this

  Inherited from [Emitter](Emitter.md).[emit](Emitter.md#emit)

  - Defined in [Tone/core/util/Emitter.ts:93](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/util/Emitter.ts#L93)

### `Abstract` getConstant

- getConstant(\_val): AudioBufferSourceNode

- #### Parameters

  - \_val: number

  #### Returns AudioBufferSourceNode

  - Defined in [Tone/core/context/BaseContext.ts:129](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/BaseContext.ts#L129)

### `Abstract` immediate

- immediate(): number

- #### Returns number

  - Defined in [Tone/core/context/BaseContext.ts:147](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/BaseContext.ts#L147)

### `Abstract` now

- now(): number

- #### Returns number

  - Defined in [Tone/core/context/BaseContext.ts:145](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/BaseContext.ts#L145)

### off

- off(event, callback?): this

- Remove the event listener.

  #### Parameters

  - event: "statechange" \| "tick"
    The event to stop listening to.
  - `Optional` callback: ((...args) => void)
    The callback which was bound to the event with Emitter.on. If no callback is given, all callbacks events are removed.

    - - (...args): void

      - #### Parameters

        - `Rest` ...args: any\[\]

        #### Returns void

  #### Returns this

  Inherited from [Emitter](Emitter.md).[off](Emitter.md#off)

  - Defined in [Tone/core/util/Emitter.ts:65](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/util/Emitter.ts#L65)

### on

- on(event, callback): this

- Bind a callback to a specific event.

  #### Parameters

  - event: "statechange" \| "tick"
    The name of the event to listen for.
  - callback: ((...args) => void)
    The callback to invoke when the event is emitted

    - - (...args): void

      - #### Parameters

        - `Rest` ...args: any\[\]

        #### Returns void

  #### Returns this

  Inherited from [Emitter](Emitter.md).[on](Emitter.md#on)

  - Defined in [Tone/core/util/Emitter.ts:28](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/util/Emitter.ts#L28)

### once

- once(event, callback): this

- Bind a callback which is only invoked once

  #### Parameters

  - event: "statechange" \| "tick"
    The name of the event to listen for.
  - callback: ((...args) => void)
    The callback to invoke when the event is emitted

    - - (...args): void

      - #### Parameters

        - `Rest` ...args: any\[\]

        #### Returns void

  #### Returns this

  Inherited from [Emitter](Emitter.md).[once](Emitter.md#once)

  - Defined in [Tone/core/util/Emitter.ts:48](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/util/Emitter.ts#L48)

### `Abstract` resume

- resume(): Promise<void>

- #### Returns Promise<void>

  - Defined in [Tone/core/context/BaseContext.ts:113](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/BaseContext.ts#L113)

### `Abstract` setInterval

- setInterval(\_fn, \_interval): number

- #### Parameters

  - \_fn: ((...args) => void)
    - - (...args): void

      - #### Parameters

        - `Rest` ...args: any\[\]

        #### Returns void
  - \_interval: number

  #### Returns number

  - Defined in [Tone/core/context/BaseContext.ts:122](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/BaseContext.ts#L122)

### `Abstract` setTimeout

- setTimeout(\_fn, \_timeout): number

- #### Parameters

  - \_fn: ((...args) => void)
    - - (...args): void

      - #### Parameters

        - `Rest` ...args: any\[\]

        #### Returns void
  - \_timeout: number

  #### Returns number

  - Defined in [Tone/core/context/BaseContext.ts:115](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/BaseContext.ts#L115)

### toJSON

- toJSON(): Record<string, any>

- #### Returns Record<string, any>

  - Defined in [Tone/core/context/BaseContext.ts:154](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/BaseContext.ts#L154)

### toString

- toString(): string

- Convert the class to a string

  #### Returns string

  #### Example

  ``` ts
  const osc = new Tone.Oscillator();
  console.log(osc.toString());
  ```

  Inherited from [Emitter](Emitter.md).[toString](Emitter.md#toString)

  - Defined in [Tone/core/Tone.ts:106](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L106)

### `Static` getDefaults

- getDefaults(): BaseToneOptions

- Returns all of the default options belonging to the class.

  #### Returns BaseToneOptions

  Inherited from [Emitter](Emitter.md).[getDefaults](Emitter.md#getDefaults)

  - Defined in [Tone/core/Tone.ts:38](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L38)

### `Static` mixin

- mixin(constr): void

- Add Emitter functions (on/off/emit) to the object

  #### Parameters

  - constr: any

  #### Returns void

  Inherited from [Emitter](Emitter.md).[mixin](Emitter.md#mixin)

  - Defined in [Tone/core/util/Emitter.ts:108](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/util/Emitter.ts#L108)
