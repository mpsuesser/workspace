# Class Context

Wrapper around the native AudioContext.

#### Hierarchy ([view full](../hierarchy.md#Context))

- [BaseContext](BaseContext.md)
  - Context
    - [OfflineContext](OfflineContext.md)

- Defined in [Tone/core/context/Context.ts:38](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L38)

## Constructors

### constructor

- new Context(context?): [Context](Context.md)

- #### Parameters

  - `Optional` context: AnyAudioContext

  #### Returns [Context](Context.md)

  Overrides [BaseContext](BaseContext.md).[constructor](BaseContext.md#constructor)

  - Defined in [Tone/core/context/Context.ts:106](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L106)

- new Context(options?): [Context](Context.md)

- #### Parameters

  - `Optional` options: Partial<[ContextOptions](../interfaces/ContextOptions.md)>

  #### Returns [Context](Context.md)

  Overrides BaseContext.constructor

  - Defined in [Tone/core/context/Context.ts:107](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L107)

## Properties

### debug

debug: boolean = false

Set this debug flag to log all events that happen in this class.

Inherited from [BaseContext](BaseContext.md).[debug](BaseContext.md#debug)

- Defined in [Tone/core/Tone.ts:49](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L49)

### `Readonly` isOffline

isOffline: boolean = false

Indicates if the context is an OfflineAudioContext or an AudioContext

Overrides [BaseContext](BaseContext.md).[isOffline](BaseContext.md#isOffline)

- Defined in [Tone/core/context/Context.ts:104](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L104)

### `Readonly` name

name: string = "Context"

Overrides [BaseContext](BaseContext.md).[name](BaseContext.md#name)

- Defined in [Tone/core/context/Context.ts:39](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L39)

### `Static` version

version: string = version

The version number semver

Inherited from [BaseContext](BaseContext.md).[version](BaseContext.md#version)

- Defined in [Tone/core/Tone.ts:28](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L28)

## Accessors

### clockSource

- get clockSource(): TickerClockSource

- What the source of the clock is, either "worker" (default), "timeout", or "offline" (none).

  #### Returns TickerClockSource

  - Defined in [Tone/core/context/Context.ts:408](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L408)

- set clockSource(type): void

- #### Parameters

  - type: TickerClockSource

  #### Returns void

  - Defined in [Tone/core/context/Context.ts:411](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L411)

### currentTime

- get currentTime(): number

- The current time in seconds of the AudioContext.

  #### Returns number

  Overrides BaseContext.currentTime

  - Defined in [Tone/core/context/Context.ts:271](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L271)

### destination

- get destination(): DestinationClass

- A reference to the Context's destination node.

  #### Returns DestinationClass

  Overrides BaseContext.destination

  - Defined in [Tone/core/context/Context.ts:332](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L332)

- set destination(d): void

- #### Parameters

  - d: DestinationClass

  #### Returns void

  Overrides BaseContext.destination

  - Defined in [Tone/core/context/Context.ts:336](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L336)

### disposed

- get disposed(): boolean

- Indicates if the instance was disposed. 'Disposing' an instance means that all of the Web Audio nodes that were created for the instance are disconnected and freed for garbage collection.

  #### Returns boolean

  Inherited from BaseContext.disposed

  - Defined in [Tone/core/Tone.ts:96](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L96)

### draw

- get draw(): DrawClass

- This is the Draw object for the context which is useful for synchronizing the draw frame with the Tone.js clock.

  #### Returns DrawClass

  Overrides BaseContext.draw

  - Defined in [Tone/core/context/Context.ts:320](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L320)

- set draw(d): void

- #### Parameters

  - d: DrawClass

  #### Returns void

  Overrides BaseContext.draw

  - Defined in [Tone/core/context/Context.ts:324](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L324)

### latencyHint

- get latencyHint(): number \| AudioContextLatencyCategory

- The type of playback, which affects tradeoffs between audio output latency and responsiveness. In addition to setting the value in seconds, the latencyHint also accepts the strings "interactive" (prioritizes low latency), "playback" (prioritizes sustained playback), "balanced" (balances latency and performance).

  #### Returns number \| AudioContextLatencyCategory

  #### Example

  ``` ts
  // prioritize sustained playback
  const context = new Tone.Context({ latencyHint: "playback" });
  // set this context as the global Context
  Tone.setContext(context);
  // the global context is gettable with Tone.getContext()
  console.log(Tone.getContext().latencyHint);
  ```

  Overrides BaseContext.latencyHint

  - Defined in [Tone/core/context/Context.ts:446](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L446)

### listener

- get listener(): ListenerClass

- The listener

  #### Returns ListenerClass

  Overrides BaseContext.listener

  - Defined in [Tone/core/context/Context.ts:290](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L290)

- set listener(l): void

- #### Parameters

  - l: ListenerClass

  #### Returns void

  Overrides BaseContext.listener

  - Defined in [Tone/core/context/Context.ts:294](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L294)

### lookAhead

- get lookAhead(): number

- The amount of time into the future events are scheduled. Giving Web Audio a short amount of time into the future to schedule events can reduce clicks and improve performance. This value can be set to 0 to get the lowest latency. Adjusting this value also affects the [updateInterval](Context.md#updateInterval).

  #### Returns number

  Overrides BaseContext.lookAhead

  - Defined in [Tone/core/context/Context.ts:421](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L421)

- set lookAhead(time): void

- #### Parameters

  - time: number

  #### Returns void

  Overrides BaseContext.lookAhead

  - Defined in [Tone/core/context/Context.ts:424](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L424)

### rawContext

- get rawContext(): AnyAudioContext

- The unwrapped AudioContext or OfflineAudioContext

  #### Returns AnyAudioContext

  Overrides BaseContext.rawContext

  - Defined in [Tone/core/context/Context.ts:453](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L453)

### sampleRate

- get sampleRate(): number

- The current time in seconds of the AudioContext.

  #### Returns number

  Overrides BaseContext.sampleRate

  - Defined in [Tone/core/context/Context.ts:283](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L283)

### state

- get state(): AudioContextState

- The current time in seconds of the AudioContext.

  #### Returns AudioContextState

  Overrides BaseContext.state

  - Defined in [Tone/core/context/Context.ts:277](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L277)

### transport

- get transport(): TransportClass

- There is only one Transport per Context. It is created on initialization.

  #### Returns TransportClass

  Overrides BaseContext.transport

  - Defined in [Tone/core/context/Context.ts:305](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L305)

- set transport(t): void

- #### Parameters

  - t: TransportClass

  #### Returns void

  Overrides BaseContext.transport

  - Defined in [Tone/core/context/Context.ts:309](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L309)

### updateInterval

- get updateInterval(): number

- How often the interval callback is invoked. This number corresponds to how responsive the scheduling can be. Setting to 0 will result in the lowest practial interval based on context properties. context.updateInterval + context.lookAhead gives you the total latency between scheduling an event and hearing it.

  #### Returns number

  - Defined in [Tone/core/context/Context.ts:397](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L397)

- set updateInterval(interval): void

- #### Parameters

  - interval: number

  #### Returns void

  - Defined in [Tone/core/context/Context.ts:400](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L400)

## Methods

### addAudioWorkletModule

- addAudioWorkletModule(url): Promise<void>

- Add an AudioWorkletProcessor module

  #### Parameters

  - url: string
    The url of the module

  #### Returns Promise<void>

  Overrides [BaseContext](BaseContext.md).[addAudioWorkletModule](BaseContext.md#addAudioWorkletModule)

  - Defined in [Tone/core/context/Context.ts:368](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L368)

### clearInterval

- clearInterval(id): this

- Clear the function scheduled by [setInterval](Context.md#setInterval)

  #### Parameters

  - id: number

  #### Returns this

  Overrides [BaseContext](BaseContext.md).[clearInterval](BaseContext.md#clearInterval)

  - Defined in [Tone/core/context/Context.ts:602](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L602)

### clearTimeout

- clearTimeout(id): this

- Clears a previously scheduled timeout with Tone.context.setTimeout

  #### Parameters

  - id: number
    The ID returned from setTimeout

  #### Returns this

  Overrides [BaseContext](BaseContext.md).[clearTimeout](BaseContext.md#clearTimeout)

  - Defined in [Tone/core/context/Context.ts:590](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L590)

### close

- close(): Promise<void>

- Close the context. Once closed, the context can no longer be used and any AudioNodes created from the context will be silent.

  #### Returns Promise<void>

  - Defined in [Tone/core/context/Context.ts:496](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L496)

### createAnalyser

- createAnalyser(): AnalyserNode

- #### Returns AnalyserNode

  Overrides [BaseContext](BaseContext.md).[createAnalyser](BaseContext.md#createAnalyser)

  - Defined in [Tone/core/context/Context.ts:171](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L171)

### createAudioWorkletNode

- createAudioWorkletNode(name, options?): AudioWorkletNode

- Create an audio worklet node from a name and options. The module must first be loaded using [addAudioWorkletModule](Context.md#addAudioWorkletModule).

  #### Parameters

  - name: string
  - `Optional` options: Partial<AudioWorkletNodeOptions>

  #### Returns AudioWorkletNode

  Overrides [BaseContext](BaseContext.md).[createAudioWorkletNode](BaseContext.md#createAudioWorkletNode)

  - Defined in [Tone/core/context/Context.ts:357](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L357)

### createBiquadFilter

- createBiquadFilter(): BiquadFilterNode

- #### Returns BiquadFilterNode

  Overrides [BaseContext](BaseContext.md).[createBiquadFilter](BaseContext.md#createBiquadFilter)

  - Defined in [Tone/core/context/Context.ts:180](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L180)

### createBuffer

- createBuffer(numberOfChannels, length, sampleRate): AudioBuffer

- #### Parameters

  - numberOfChannels: number
  - length: number
  - sampleRate: number

  #### Returns AudioBuffer

  Overrides [BaseContext](BaseContext.md).[createBuffer](BaseContext.md#createBuffer)

  - Defined in [Tone/core/context/Context.ts:183](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L183)

### createBufferSource

- createBufferSource(): AudioBufferSourceNode

- #### Returns AudioBufferSourceNode

  Overrides [BaseContext](BaseContext.md).[createBufferSource](BaseContext.md#createBufferSource)

  - Defined in [Tone/core/context/Context.ts:177](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L177)

### createChannelMerger

- createChannelMerger(numberOfInputs?): ChannelMergerNode

- #### Parameters

  - `Optional` numberOfInputs: number

  #### Returns ChannelMergerNode

  Overrides [BaseContext](BaseContext.md).[createChannelMerger](BaseContext.md#createChannelMerger)

  - Defined in [Tone/core/context/Context.ts:190](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L190)

### createChannelSplitter

- createChannelSplitter(numberOfOutputs?): ChannelSplitterNode

- #### Parameters

  - `Optional` numberOfOutputs: number

  #### Returns ChannelSplitterNode

  Overrides [BaseContext](BaseContext.md).[createChannelSplitter](BaseContext.md#createChannelSplitter)

  - Defined in [Tone/core/context/Context.ts:195](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L195)

### createConstantSource

- createConstantSource(): ConstantSourceNode

- #### Returns ConstantSourceNode

  Overrides [BaseContext](BaseContext.md).[createConstantSource](BaseContext.md#createConstantSource)

  - Defined in [Tone/core/context/Context.ts:200](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L200)

### createConvolver

- createConvolver(): ConvolverNode

- #### Returns ConvolverNode

  Overrides [BaseContext](BaseContext.md).[createConvolver](BaseContext.md#createConvolver)

  - Defined in [Tone/core/context/Context.ts:203](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L203)

### createDelay

- createDelay(maxDelayTime?): DelayNode

- #### Parameters

  - `Optional` maxDelayTime: number

  #### Returns DelayNode

  Overrides [BaseContext](BaseContext.md).[createDelay](BaseContext.md#createDelay)

  - Defined in [Tone/core/context/Context.ts:206](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L206)

### createDynamicsCompressor

- createDynamicsCompressor(): DynamicsCompressorNode

- #### Returns DynamicsCompressorNode

  Overrides [BaseContext](BaseContext.md).[createDynamicsCompressor](BaseContext.md#createDynamicsCompressor)

  - Defined in [Tone/core/context/Context.ts:209](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L209)

### createGain

- createGain(): GainNode

- #### Returns GainNode

  Overrides [BaseContext](BaseContext.md).[createGain](BaseContext.md#createGain)

  - Defined in [Tone/core/context/Context.ts:212](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L212)

### createIIRFilter

- createIIRFilter(feedForward, feedback): IIRFilterNode

- #### Parameters

  - feedForward: number\[\] \| Float32Array
  - feedback: number\[\] \| Float32Array

  #### Returns IIRFilterNode

  Overrides [BaseContext](BaseContext.md).[createIIRFilter](BaseContext.md#createIIRFilter)

  - Defined in [Tone/core/context/Context.ts:215](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L215)

### createMediaElementSource

- createMediaElementSource(element): MediaElementAudioSourceNode

- #### Parameters

  - element: HTMLMediaElement

  #### Returns MediaElementAudioSourceNode

  Overrides [BaseContext](BaseContext.md).[createMediaElementSource](BaseContext.md#createMediaElementSource)

  - Defined in [Tone/core/context/Context.ts:246](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L246)

### createMediaStreamDestination

- createMediaStreamDestination(): MediaStreamAudioDestinationNode

- #### Returns MediaStreamAudioDestinationNode

  Overrides [BaseContext](BaseContext.md).[createMediaStreamDestination](BaseContext.md#createMediaStreamDestination)

  - Defined in [Tone/core/context/Context.ts:256](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L256)

### createMediaStreamSource

- createMediaStreamSource(stream): MediaStreamAudioSourceNode

- #### Parameters

  - stream: MediaStream

  #### Returns MediaStreamAudioSourceNode

  Overrides [BaseContext](BaseContext.md).[createMediaStreamSource](BaseContext.md#createMediaStreamSource)

  - Defined in [Tone/core/context/Context.ts:238](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L238)

### createOscillator

- createOscillator(): OscillatorNode

- #### Returns OscillatorNode

  Overrides [BaseContext](BaseContext.md).[createOscillator](BaseContext.md#createOscillator)

  - Defined in [Tone/core/context/Context.ts:174](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L174)

### createPanner

- createPanner(): PannerNode

- #### Returns PannerNode

  Overrides [BaseContext](BaseContext.md).[createPanner](BaseContext.md#createPanner)

  - Defined in [Tone/core/context/Context.ts:222](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L222)

### createPeriodicWave

- createPeriodicWave(real, imag, constraints?): PeriodicWave

- #### Parameters

  - real: number\[\] \| Float32Array
  - imag: number\[\] \| Float32Array
  - `Optional` constraints: PeriodicWaveConstraints

  #### Returns PeriodicWave

  Overrides [BaseContext](BaseContext.md).[createPeriodicWave](BaseContext.md#createPeriodicWave)

  - Defined in [Tone/core/context/Context.ts:225](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L225)

### createStereoPanner

- createStereoPanner(): StereoPannerNode

- #### Returns StereoPannerNode

  Overrides [BaseContext](BaseContext.md).[createStereoPanner](BaseContext.md#createStereoPanner)

  - Defined in [Tone/core/context/Context.ts:232](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L232)

### createWaveShaper

- createWaveShaper(): WaveShaperNode

- #### Returns WaveShaperNode

  Overrides [BaseContext](BaseContext.md).[createWaveShaper](BaseContext.md#createWaveShaper)

  - Defined in [Tone/core/context/Context.ts:235](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L235)

### decodeAudioData

- decodeAudioData(audioData): Promise<AudioBuffer>

- #### Parameters

  - audioData: ArrayBuffer

  #### Returns Promise<AudioBuffer>

  Overrides [BaseContext](BaseContext.md).[decodeAudioData](BaseContext.md#decodeAudioData)

  - Defined in [Tone/core/context/Context.ts:264](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L264)

### dispose

- dispose(): this

- Clean up. Also closes the audio context.

  #### Returns this

  Overrides [BaseContext](BaseContext.md).[dispose](BaseContext.md#dispose)

  - Defined in [Tone/core/context/Context.ts:540](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L540)

### emit

- emit(event, ...args): this

- Invoke all of the callbacks bound to the event with any arguments passed in.

  #### Parameters

  - event: "statechange" \| "tick"
    The name of the event.
  - `Rest` ...args: any\[\]
    The arguments to pass to the functions listening.

  #### Returns this

  Inherited from [BaseContext](BaseContext.md).[emit](BaseContext.md#emit)

  - Defined in [Tone/core/util/Emitter.ts:93](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/util/Emitter.ts#L93)

### getConstant

- getConstant(val): AudioBufferSourceNode

- **Internal** Generate a looped buffer at some constant value.

  #### Parameters

  - val: number

  #### Returns AudioBufferSourceNode

  Overrides [BaseContext](BaseContext.md).[getConstant](BaseContext.md#getConstant)

  - Defined in [Tone/core/context/Context.ts:513](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L513)

### immediate

- immediate(): number

- The current audio context time without the [lookAhead](Context.md#lookAhead). In most cases it is better to use [now](Context.md#now) instead of [immediate](Context.md#immediate) since with [now](Context.md#now) the [lookAhead](Context.md#lookAhead) is applied equally to *all* components including internal components, to making sure that everything is scheduled in sync. Mixing [now](Context.md#now) and [immediate](Context.md#immediate) can cause some timing issues. If no lookAhead is desired, you can set the [lookAhead](Context.md#lookAhead) to `0`.

  #### Returns number

  Overrides [BaseContext](BaseContext.md).[immediate](BaseContext.md#immediate)

  - Defined in [Tone/core/context/Context.ts:475](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L475)

### now

- now(): number

- The current audio context time plus a short [lookAhead](Context.md#lookAhead).

  #### Returns number

  #### Example

  ``` ts
  setInterval(() => {
      console.log("now", Tone.now());
  }, 100);
  ```

  Overrides [BaseContext](BaseContext.md).[now](BaseContext.md#now)

  - Defined in [Tone/core/context/Context.ts:464](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L464)

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

  Inherited from [BaseContext](BaseContext.md).[off](BaseContext.md#off)

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

  Inherited from [BaseContext](BaseContext.md).[on](BaseContext.md#on)

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

  Inherited from [BaseContext](BaseContext.md).[once](BaseContext.md#once)

  - Defined in [Tone/core/util/Emitter.ts:48](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/util/Emitter.ts#L48)

### resume

- resume(): Promise<void>

- Starts the audio context from a suspended state. This is required to initially start the AudioContext.

  #### Returns Promise<void>

  #### See

  [start](../functions/start.md)

  Overrides [BaseContext](BaseContext.md).[resume](BaseContext.md#resume)

  - Defined in [Tone/core/context/Context.ts:484](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L484)

### setInterval

- setInterval(fn, interval): number

- Adds a repeating event to the context's callback clock

  #### Parameters

  - fn: ((...args) => void)
    - - (...args): void

      - #### Parameters

        - `Rest` ...args: any\[\]

        #### Returns void
  - interval: number

  #### Returns number

  Overrides [BaseContext](BaseContext.md).[setInterval](BaseContext.md#setInterval)

  - Defined in [Tone/core/context/Context.ts:609](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L609)

### setTimeout

- setTimeout(fn, timeout): number

- A setTimeout which is guaranteed by the clock source. Also runs in the offline context.

  #### Parameters

  - fn: ((...args) => void)
    The callback to invoke

    - - (...args): void

      - #### Parameters

        - `Rest` ...args: any\[\]

        #### Returns void
  - timeout: number
    The timeout in seconds

  #### Returns number

  ID to use when invoking Context.clearTimeout

  Overrides [BaseContext](BaseContext.md).[setTimeout](BaseContext.md#setTimeout)

  - Defined in [Tone/core/context/Context.ts:575](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L575)

### toJSON

- toJSON(): Record<string, any>

- #### Returns Record<string, any>

  Inherited from [BaseContext](BaseContext.md).[toJSON](BaseContext.md#toJSON)

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

  Inherited from [BaseContext](BaseContext.md).[toString](BaseContext.md#toString)

  - Defined in [Tone/core/Tone.ts:106](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L106)

### `Static` getDefaults

- getDefaults(): [ContextOptions](../interfaces/ContextOptions.md)

- Returns all of the default options belonging to the class.

  #### Returns [ContextOptions](../interfaces/ContextOptions.md)

  Overrides [BaseContext](BaseContext.md).[getDefaults](BaseContext.md#getDefaults)

  - Defined in [Tone/core/context/Context.ts:146](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L146)

### `Static` mixin

- mixin(constr): void

- Add Emitter functions (on/off/emit) to the object

  #### Parameters

  - constr: any

  #### Returns void

  Inherited from [BaseContext](BaseContext.md).[mixin](BaseContext.md#mixin)

  - Defined in [Tone/core/util/Emitter.ts:108](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/util/Emitter.ts#L108)
