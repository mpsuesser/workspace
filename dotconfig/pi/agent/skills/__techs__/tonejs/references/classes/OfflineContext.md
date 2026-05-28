# Class OfflineContext

Wrapper around the OfflineAudioContext

#### Example

``` ts
// generate a single channel, 0.5 second buffer
const context = new Tone.OfflineContext(1, 0.5, 44100);
const osc = new Tone.Oscillator({ context });
context.render().then(buffer => {
    console.log(buffer.numberOfChannels, buffer.duration);
});
```

#### Hierarchy ([view full](../hierarchy.md#OfflineContext))

- [Context](Context.md)
  - OfflineContext

- Defined in [Tone/core/context/OfflineContext.ts:18](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/OfflineContext.ts#L18)

## Constructors

### constructor

- new OfflineContext(channels, duration, sampleRate): [OfflineContext](OfflineContext.md)

- #### Parameters

  - channels: number
    The number of channels to render
  - duration: number
    The duration to render in seconds
  - sampleRate: number
    the sample rate to render at

  #### Returns [OfflineContext](OfflineContext.md)

  Overrides [Context](Context.md).[constructor](Context.md#constructor)

  - Defined in [Tone/core/context/OfflineContext.ts:43](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/OfflineContext.ts#L43)

- new OfflineContext(context): [OfflineContext](OfflineContext.md)

- #### Parameters

  - context: OfflineAudioContext

  #### Returns [OfflineContext](OfflineContext.md)

  Overrides [Context](Context.md).[constructor](Context.md#constructor)

  - Defined in [Tone/core/context/OfflineContext.ts:44](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/OfflineContext.ts#L44)

## Properties

### debug

debug: boolean = false

Set this debug flag to log all events that happen in this class.

Inherited from [Context](Context.md).[debug](Context.md#debug)

- Defined in [Tone/core/Tone.ts:49](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L49)

### `Readonly` isOffline

isOffline: boolean = true

Indicates if the context is an OfflineAudioContext or an AudioContext

Overrides [Context](Context.md).[isOffline](Context.md#isOffline)

- Defined in [Tone/core/context/OfflineContext.ts:36](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/OfflineContext.ts#L36)

### `Readonly` name

name: string = "OfflineContext"

Overrides [Context](Context.md).[name](Context.md#name)

- Defined in [Tone/core/context/OfflineContext.ts:19](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/OfflineContext.ts#L19)

### `Static` version

version: string = version

The version number semver

Inherited from [Context](Context.md).[version](Context.md#version)

- Defined in [Tone/core/Tone.ts:28](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L28)

## Accessors

### clockSource

- get clockSource(): TickerClockSource

- What the source of the clock is, either "worker" (default), "timeout", or "offline" (none).

  #### Returns TickerClockSource

  Inherited from Context.clockSource

  - Defined in [Tone/core/context/Context.ts:408](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L408)

- set clockSource(type): void

- #### Parameters

  - type: TickerClockSource

  #### Returns void

  Inherited from Context.clockSource

  - Defined in [Tone/core/context/Context.ts:411](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L411)

### currentTime

- get currentTime(): number

- Same as this.now()

  #### Returns number

  Overrides Context.currentTime

  - Defined in [Tone/core/context/OfflineContext.ts:76](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/OfflineContext.ts#L76)

### destination

- get destination(): DestinationClass

- A reference to the Context's destination node.

  #### Returns DestinationClass

  Inherited from Context.destination

  - Defined in [Tone/core/context/Context.ts:332](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L332)

- set destination(d): void

- #### Parameters

  - d: DestinationClass

  #### Returns void

  Inherited from Context.destination

  - Defined in [Tone/core/context/Context.ts:336](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L336)

### disposed

- get disposed(): boolean

- Indicates if the instance was disposed. 'Disposing' an instance means that all of the Web Audio nodes that were created for the instance are disconnected and freed for garbage collection.

  #### Returns boolean

  Inherited from Context.disposed

  - Defined in [Tone/core/Tone.ts:96](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L96)

### draw

- get draw(): DrawClass

- This is the Draw object for the context which is useful for synchronizing the draw frame with the Tone.js clock.

  #### Returns DrawClass

  Inherited from Context.draw

  - Defined in [Tone/core/context/Context.ts:320](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L320)

- set draw(d): void

- #### Parameters

  - d: DrawClass

  #### Returns void

  Inherited from Context.draw

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

  Inherited from Context.latencyHint

  - Defined in [Tone/core/context/Context.ts:446](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L446)

### listener

- get listener(): ListenerClass

- The listener

  #### Returns ListenerClass

  Inherited from Context.listener

  - Defined in [Tone/core/context/Context.ts:290](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L290)

- set listener(l): void

- #### Parameters

  - l: ListenerClass

  #### Returns void

  Inherited from Context.listener

  - Defined in [Tone/core/context/Context.ts:294](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L294)

### lookAhead

- get lookAhead(): number

- The amount of time into the future events are scheduled. Giving Web Audio a short amount of time into the future to schedule events can reduce clicks and improve performance. This value can be set to 0 to get the lowest latency. Adjusting this value also affects the [updateInterval](Context.md#updateInterval).

  #### Returns number

  Inherited from Context.lookAhead

  - Defined in [Tone/core/context/Context.ts:421](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L421)

- set lookAhead(time): void

- #### Parameters

  - time: number

  #### Returns void

  Inherited from Context.lookAhead

  - Defined in [Tone/core/context/Context.ts:424](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L424)

### rawContext

- get rawContext(): AnyAudioContext

- The unwrapped AudioContext or OfflineAudioContext

  #### Returns AnyAudioContext

  Inherited from Context.rawContext

  - Defined in [Tone/core/context/Context.ts:453](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L453)

### sampleRate

- get sampleRate(): number

- The current time in seconds of the AudioContext.

  #### Returns number

  Inherited from Context.sampleRate

  - Defined in [Tone/core/context/Context.ts:283](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L283)

### state

- get state(): AudioContextState

- The current time in seconds of the AudioContext.

  #### Returns AudioContextState

  Inherited from Context.state

  - Defined in [Tone/core/context/Context.ts:277](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L277)

### transport

- get transport(): TransportClass

- There is only one Transport per Context. It is created on initialization.

  #### Returns TransportClass

  Inherited from Context.transport

  - Defined in [Tone/core/context/Context.ts:305](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L305)

- set transport(t): void

- #### Parameters

  - t: TransportClass

  #### Returns void

  Inherited from Context.transport

  - Defined in [Tone/core/context/Context.ts:309](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L309)

### updateInterval

- get updateInterval(): number

- How often the interval callback is invoked. This number corresponds to how responsive the scheduling can be. Setting to 0 will result in the lowest practial interval based on context properties. context.updateInterval + context.lookAhead gives you the total latency between scheduling an event and hearing it.

  #### Returns number

  Inherited from Context.updateInterval

  - Defined in [Tone/core/context/Context.ts:397](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L397)

- set updateInterval(interval): void

- #### Parameters

  - interval: number

  #### Returns void

  Inherited from Context.updateInterval

  - Defined in [Tone/core/context/Context.ts:400](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L400)

## Methods

### addAudioWorkletModule

- addAudioWorkletModule(url): Promise<void>

- Add an AudioWorkletProcessor module

  #### Parameters

  - url: string
    The url of the module

  #### Returns Promise<void>

  Inherited from [Context](Context.md).[addAudioWorkletModule](Context.md#addAudioWorkletModule)

  - Defined in [Tone/core/context/Context.ts:368](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L368)

### clearInterval

- clearInterval(id): this

- Clear the function scheduled by [setInterval](OfflineContext.md#setInterval)

  #### Parameters

  - id: number

  #### Returns this

  Inherited from [Context](Context.md).[clearInterval](Context.md#clearInterval)

  - Defined in [Tone/core/context/Context.ts:602](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L602)

### clearTimeout

- clearTimeout(id): this

- Clears a previously scheduled timeout with Tone.context.setTimeout

  #### Parameters

  - id: number
    The ID returned from setTimeout

  #### Returns this

  Inherited from [Context](Context.md).[clearTimeout](Context.md#clearTimeout)

  - Defined in [Tone/core/context/Context.ts:590](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L590)

### close

- close(): Promise<void>

- Close the context

  #### Returns Promise<void>

  Overrides [Context](Context.md).[close](Context.md#close)

  - Defined in [Tone/core/context/OfflineContext.ts:115](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/OfflineContext.ts#L115)

### createAnalyser

- createAnalyser(): AnalyserNode

- #### Returns AnalyserNode

  Inherited from [Context](Context.md).[createAnalyser](Context.md#createAnalyser)

  - Defined in [Tone/core/context/Context.ts:171](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L171)

### createAudioWorkletNode

- createAudioWorkletNode(name, options?): AudioWorkletNode

- Create an audio worklet node from a name and options. The module must first be loaded using [addAudioWorkletModule](Context.md#addAudioWorkletModule).

  #### Parameters

  - name: string
  - `Optional` options: Partial<AudioWorkletNodeOptions>

  #### Returns AudioWorkletNode

  Inherited from [Context](Context.md).[createAudioWorkletNode](Context.md#createAudioWorkletNode)

  - Defined in [Tone/core/context/Context.ts:357](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L357)

### createBiquadFilter

- createBiquadFilter(): BiquadFilterNode

- #### Returns BiquadFilterNode

  Inherited from [Context](Context.md).[createBiquadFilter](Context.md#createBiquadFilter)

  - Defined in [Tone/core/context/Context.ts:180](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L180)

### createBuffer

- createBuffer(numberOfChannels, length, sampleRate): AudioBuffer

- #### Parameters

  - numberOfChannels: number
  - length: number
  - sampleRate: number

  #### Returns AudioBuffer

  Inherited from [Context](Context.md).[createBuffer](Context.md#createBuffer)

  - Defined in [Tone/core/context/Context.ts:183](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L183)

### createBufferSource

- createBufferSource(): AudioBufferSourceNode

- #### Returns AudioBufferSourceNode

  Inherited from [Context](Context.md).[createBufferSource](Context.md#createBufferSource)

  - Defined in [Tone/core/context/Context.ts:177](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L177)

### createChannelMerger

- createChannelMerger(numberOfInputs?): ChannelMergerNode

- #### Parameters

  - `Optional` numberOfInputs: number

  #### Returns ChannelMergerNode

  Inherited from [Context](Context.md).[createChannelMerger](Context.md#createChannelMerger)

  - Defined in [Tone/core/context/Context.ts:190](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L190)

### createChannelSplitter

- createChannelSplitter(numberOfOutputs?): ChannelSplitterNode

- #### Parameters

  - `Optional` numberOfOutputs: number

  #### Returns ChannelSplitterNode

  Inherited from [Context](Context.md).[createChannelSplitter](Context.md#createChannelSplitter)

  - Defined in [Tone/core/context/Context.ts:195](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L195)

### createConstantSource

- createConstantSource(): ConstantSourceNode

- #### Returns ConstantSourceNode

  Inherited from [Context](Context.md).[createConstantSource](Context.md#createConstantSource)

  - Defined in [Tone/core/context/Context.ts:200](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L200)

### createConvolver

- createConvolver(): ConvolverNode

- #### Returns ConvolverNode

  Inherited from [Context](Context.md).[createConvolver](Context.md#createConvolver)

  - Defined in [Tone/core/context/Context.ts:203](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L203)

### createDelay

- createDelay(maxDelayTime?): DelayNode

- #### Parameters

  - `Optional` maxDelayTime: number

  #### Returns DelayNode

  Inherited from [Context](Context.md).[createDelay](Context.md#createDelay)

  - Defined in [Tone/core/context/Context.ts:206](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L206)

### createDynamicsCompressor

- createDynamicsCompressor(): DynamicsCompressorNode

- #### Returns DynamicsCompressorNode

  Inherited from [Context](Context.md).[createDynamicsCompressor](Context.md#createDynamicsCompressor)

  - Defined in [Tone/core/context/Context.ts:209](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L209)

### createGain

- createGain(): GainNode

- #### Returns GainNode

  Inherited from [Context](Context.md).[createGain](Context.md#createGain)

  - Defined in [Tone/core/context/Context.ts:212](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L212)

### createIIRFilter

- createIIRFilter(feedForward, feedback): IIRFilterNode

- #### Parameters

  - feedForward: number\[\] \| Float32Array
  - feedback: number\[\] \| Float32Array

  #### Returns IIRFilterNode

  Inherited from [Context](Context.md).[createIIRFilter](Context.md#createIIRFilter)

  - Defined in [Tone/core/context/Context.ts:215](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L215)

### createMediaElementSource

- createMediaElementSource(element): MediaElementAudioSourceNode

- #### Parameters

  - element: HTMLMediaElement

  #### Returns MediaElementAudioSourceNode

  Inherited from [Context](Context.md).[createMediaElementSource](Context.md#createMediaElementSource)

  - Defined in [Tone/core/context/Context.ts:246](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L246)

### createMediaStreamDestination

- createMediaStreamDestination(): MediaStreamAudioDestinationNode

- #### Returns MediaStreamAudioDestinationNode

  Inherited from [Context](Context.md).[createMediaStreamDestination](Context.md#createMediaStreamDestination)

  - Defined in [Tone/core/context/Context.ts:256](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L256)

### createMediaStreamSource

- createMediaStreamSource(stream): MediaStreamAudioSourceNode

- #### Parameters

  - stream: MediaStream

  #### Returns MediaStreamAudioSourceNode

  Inherited from [Context](Context.md).[createMediaStreamSource](Context.md#createMediaStreamSource)

  - Defined in [Tone/core/context/Context.ts:238](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L238)

### createOscillator

- createOscillator(): OscillatorNode

- #### Returns OscillatorNode

  Inherited from [Context](Context.md).[createOscillator](Context.md#createOscillator)

  - Defined in [Tone/core/context/Context.ts:174](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L174)

### createPanner

- createPanner(): PannerNode

- #### Returns PannerNode

  Inherited from [Context](Context.md).[createPanner](Context.md#createPanner)

  - Defined in [Tone/core/context/Context.ts:222](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L222)

### createPeriodicWave

- createPeriodicWave(real, imag, constraints?): PeriodicWave

- #### Parameters

  - real: number\[\] \| Float32Array
  - imag: number\[\] \| Float32Array
  - `Optional` constraints: PeriodicWaveConstraints

  #### Returns PeriodicWave

  Inherited from [Context](Context.md).[createPeriodicWave](Context.md#createPeriodicWave)

  - Defined in [Tone/core/context/Context.ts:225](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L225)

### createStereoPanner

- createStereoPanner(): StereoPannerNode

- #### Returns StereoPannerNode

  Inherited from [Context](Context.md).[createStereoPanner](Context.md#createStereoPanner)

  - Defined in [Tone/core/context/Context.ts:232](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L232)

### createWaveShaper

- createWaveShaper(): WaveShaperNode

- #### Returns WaveShaperNode

  Inherited from [Context](Context.md).[createWaveShaper](Context.md#createWaveShaper)

  - Defined in [Tone/core/context/Context.ts:235](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L235)

### decodeAudioData

- decodeAudioData(audioData): Promise<AudioBuffer>

- #### Parameters

  - audioData: ArrayBuffer

  #### Returns Promise<AudioBuffer>

  Inherited from [Context](Context.md).[decodeAudioData](Context.md#decodeAudioData)

  - Defined in [Tone/core/context/Context.ts:264](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L264)

### dispose

- dispose(): this

- Clean up. Also closes the audio context.

  #### Returns this

  Inherited from [Context](Context.md).[dispose](Context.md#dispose)

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

  Inherited from [Context](Context.md).[emit](Context.md#emit)

  - Defined in [Tone/core/util/Emitter.ts:93](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/util/Emitter.ts#L93)

### getConstant

- getConstant(val): AudioBufferSourceNode

- **Internal** Generate a looped buffer at some constant value.

  #### Parameters

  - val: number

  #### Returns AudioBufferSourceNode

  Inherited from [Context](Context.md).[getConstant](Context.md#getConstant)

  - Defined in [Tone/core/context/Context.ts:513](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L513)

### immediate

- immediate(): number

- The current audio context time without the [lookAhead](Context.md#lookAhead). In most cases it is better to use [now](Context.md#now) instead of [immediate](Context.md#immediate) since with [now](Context.md#now) the [lookAhead](Context.md#lookAhead) is applied equally to *all* components including internal components, to making sure that everything is scheduled in sync. Mixing [now](Context.md#now) and [immediate](Context.md#immediate) can cause some timing issues. If no lookAhead is desired, you can set the [lookAhead](Context.md#lookAhead) to `0`.

  #### Returns number

  Inherited from [Context](Context.md).[immediate](Context.md#immediate)

  - Defined in [Tone/core/context/Context.ts:475](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L475)

### now

- now(): number

- Override the now method to point to the internal clock time

  #### Returns number

  Overrides [Context](Context.md).[now](Context.md#now)

  - Defined in [Tone/core/context/OfflineContext.ts:69](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/OfflineContext.ts#L69)

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

  Inherited from [Context](Context.md).[off](Context.md#off)

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

  Inherited from [Context](Context.md).[on](Context.md#on)

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

  Inherited from [Context](Context.md).[once](Context.md#once)

  - Defined in [Tone/core/util/Emitter.ts:48](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/util/Emitter.ts#L48)

### render

- render(asynchronous?): Promise<[ToneAudioBuffer](ToneAudioBuffer.md)>

- Render the output of the OfflineContext

  #### Parameters

  - asynchronous: boolean = true
    If the clock should be rendered asynchronously, which will not block the main thread, but be slightly slower.

  #### Returns Promise<[ToneAudioBuffer](ToneAudioBuffer.md)>

  - Defined in [Tone/core/context/OfflineContext.ts:105](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/OfflineContext.ts#L105)

### resume

- resume(): Promise<void>

- Starts the audio context from a suspended state. This is required to initially start the AudioContext.

  #### Returns Promise<void>

  #### See

  [start](../functions/start.md)

  Inherited from [Context](Context.md).[resume](Context.md#resume)

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

  Inherited from [Context](Context.md).[setInterval](Context.md#setInterval)

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

  Inherited from [Context](Context.md).[setTimeout](Context.md#setTimeout)

  - Defined in [Tone/core/context/Context.ts:575](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L575)

### toJSON

- toJSON(): Record<string, any>

- #### Returns Record<string, any>

  Inherited from [Context](Context.md).[toJSON](Context.md#toJSON)

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

  Inherited from [Context](Context.md).[toString](Context.md#toString)

  - Defined in [Tone/core/Tone.ts:106](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L106)

### `Static` getDefaults

- getDefaults(): [ContextOptions](../interfaces/ContextOptions.md)

- Returns all of the default options belonging to the class.

  #### Returns [ContextOptions](../interfaces/ContextOptions.md)

  Inherited from [Context](Context.md).[getDefaults](Context.md#getDefaults)

  - Defined in [Tone/core/context/Context.ts:146](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Context.ts#L146)

### `Static` mixin

- mixin(constr): void

- Add Emitter functions (on/off/emit) to the object

  #### Parameters

  - constr: any

  #### Returns void

  Inherited from [Context](Context.md).[mixin](Context.md#mixin)

  - Defined in [Tone/core/util/Emitter.ts:108](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/util/Emitter.ts#L108)
