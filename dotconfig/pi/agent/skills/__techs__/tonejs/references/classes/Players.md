# Class Players

Players combines multiple [Player](Player.md) objects.

#### Hierarchy ([view full](../hierarchy.md#Players))

- [ToneAudioNode](ToneAudioNode.md)<[PlayersOptions](../interfaces/PlayersOptions.md)>
  - Players

- Defined in [Tone/source/buffer/Players.ts:32](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Players.ts#L32)

## Constructors

### constructor

- new Players(urls?, onload?): [Players](Players.md)

- #### Parameters

  - `Optional` urls: [ToneAudioBuffersUrlMap](../interfaces/ToneAudioBuffersUrlMap.md)
    An object mapping a name to a url.
  - `Optional` onload: (() => void)
    The function to invoke when all buffers are loaded.

    - - (): void

      - #### Returns void

  #### Returns [Players](Players.md)

  Overrides [ToneAudioNode](ToneAudioNode.md).[constructor](ToneAudioNode.md#constructor)

  - Defined in [Tone/source/buffer/Players.ts:79](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Players.ts#L79)

- new Players(urls?, options?): [Players](Players.md)

- #### Parameters

  - `Optional` urls: [ToneAudioBuffersUrlMap](../interfaces/ToneAudioBuffersUrlMap.md)
    An object mapping a name to a url.
  - `Optional` options: Partial<Omit<[PlayersOptions](../interfaces/PlayersOptions.md), "urls">>
    The remaining options associated with the players

  #### Returns [Players](Players.md)

  Overrides [ToneAudioNode](ToneAudioNode.md).[constructor](ToneAudioNode.md#constructor)

  - Defined in [Tone/source/buffer/Players.ts:84](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Players.ts#L84)

- new Players(options?): [Players](Players.md)

- #### Parameters

  - `Optional` options: Partial<[PlayersOptions](../interfaces/PlayersOptions.md)>

  #### Returns [Players](Players.md)

  Overrides ToneAudioNode<PlayersOptions>.constructor

  - Defined in [Tone/source/buffer/Players.ts:88](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Players.ts#L88)

## Properties

### `Readonly` context

context: [BaseContext](BaseContext.md)

The context belonging to the node.

Inherited from [ToneAudioNode](ToneAudioNode.md).[context](ToneAudioNode.md#context)

- Defined in [Tone/core/context/ToneWithContext.ts:40](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L40)

### debug

debug: boolean = false

Set this debug flag to log all events that happen in this class.

Inherited from [ToneAudioNode](ToneAudioNode.md).[debug](ToneAudioNode.md#debug)

- Defined in [Tone/core/Tone.ts:49](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L49)

### `Readonly` input

input: undefined = undefined

Players has no input.

Overrides [ToneAudioNode](ToneAudioNode.md).[input](ToneAudioNode.md#input)

- Defined in [Tone/source/buffer/Players.ts:53](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Players.ts#L53)

### `Readonly` name

name: string = "Players"

The name of the class

Overrides [ToneAudioNode](ToneAudioNode.md).[name](ToneAudioNode.md#name)

- Defined in [Tone/source/buffer/Players.ts:33](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Players.ts#L33)

### `Readonly` output

output: [OutputNode](../types/OutputNode.md)

The combined output of all of the players

Overrides [ToneAudioNode](ToneAudioNode.md).[output](ToneAudioNode.md#output)

- Defined in [Tone/source/buffer/Players.ts:48](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Players.ts#L48)

### `Readonly` volume

volume: [Param](Param.md)<"decibels">

The volume of the output in decibels.

- Defined in [Tone/source/buffer/Players.ts:43](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Players.ts#L43)

### `Static` version

version: string = version

The version number semver

Inherited from [ToneAudioNode](ToneAudioNode.md).[version](ToneAudioNode.md#version)

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

  Inherited from ToneAudioNode.blockTime

  - Defined in [Tone/core/context/ToneWithContext.ts:108](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L108)

### channelCount

- get channelCount(): number

- channelCount is the number of channels used when up-mixing and down-mixing connections to any inputs to the node. The default value is 2 except for specific nodes where its value is specially determined.

  #### Returns number

  Inherited from ToneAudioNode.channelCount

  - Defined in [Tone/core/context/ToneAudioNode.ts:153](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L153)

- set channelCount(channelCount): void

- #### Parameters

  - channelCount: number

  #### Returns void

  Inherited from ToneAudioNode.channelCount

  - Defined in [Tone/core/context/ToneAudioNode.ts:156](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L156)

### channelCountMode

- get channelCountMode(): ChannelCountMode

- channelCountMode determines how channels will be counted when up-mixing and down-mixing connections to any inputs to the node. The default value is "max". This attribute has no effect for nodes with no inputs.

  - "max" - computedNumberOfChannels is the maximum of the number of channels of all connections to an input. In this mode channelCount is ignored.
  - "clamped-max" - computedNumberOfChannels is determined as for "max" and then clamped to a maximum value of the given channelCount.
  - "explicit" - computedNumberOfChannels is the exact value as specified by the channelCount.

  #### Returns ChannelCountMode

  Inherited from ToneAudioNode.channelCountMode

  - Defined in [Tone/core/context/ToneAudioNode.ts:170](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L170)

- set channelCountMode(channelCountMode): void

- #### Parameters

  - channelCountMode: ChannelCountMode

  #### Returns void

  Inherited from ToneAudioNode.channelCountMode

  - Defined in [Tone/core/context/ToneAudioNode.ts:173](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L173)

### channelInterpretation

- get channelInterpretation(): ChannelInterpretation

- channelInterpretation determines how individual channels will be treated when up-mixing and down-mixing connections to any inputs to the node. The default value is "speakers".

  #### Returns ChannelInterpretation

  Inherited from ToneAudioNode.channelInterpretation

  - Defined in [Tone/core/context/ToneAudioNode.ts:184](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L184)

- set channelInterpretation(channelInterpretation): void

- #### Parameters

  - channelInterpretation: ChannelInterpretation

  #### Returns void

  Inherited from ToneAudioNode.channelInterpretation

  - Defined in [Tone/core/context/ToneAudioNode.ts:187](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L187)

### disposed

- get disposed(): boolean

- Indicates if the instance was disposed. 'Disposing' an instance means that all of the Web Audio nodes that were created for the instance are disconnected and freed for garbage collection.

  #### Returns boolean

  Inherited from ToneAudioNode.disposed

  - Defined in [Tone/core/Tone.ts:96](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L96)

### fadeIn

- get fadeIn(): [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

- The fadeIn time of the envelope applied to the source.

  #### Returns [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  - Defined in [Tone/source/buffer/Players.ts:146](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Players.ts#L146)

- set fadeIn(fadeIn): void

- #### Parameters

  - fadeIn: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Returns void

  - Defined in [Tone/source/buffer/Players.ts:149](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Players.ts#L149)

### fadeOut

- get fadeOut(): [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

- The fadeOut time of the each of the sources.

  #### Returns [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  - Defined in [Tone/source/buffer/Players.ts:159](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Players.ts#L159)

- set fadeOut(fadeOut): void

- #### Parameters

  - fadeOut: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Returns void

  - Defined in [Tone/source/buffer/Players.ts:162](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Players.ts#L162)

### loaded

- get loaded(): boolean

- If all the buffers are loaded or not

  #### Returns boolean

  - Defined in [Tone/source/buffer/Players.ts:211](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Players.ts#L211)

### mute

- get mute(): boolean

- Mute the output.

  #### Returns boolean

  - Defined in [Tone/source/buffer/Players.ts:136](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Players.ts#L136)

- set mute(mute): void

- #### Parameters

  - mute: boolean

  #### Returns void

  - Defined in [Tone/source/buffer/Players.ts:139](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Players.ts#L139)

### numberOfInputs

- get numberOfInputs(): number

- The number of inputs feeding into the AudioNode. For source nodes, this will be 0.

  #### Returns number

  #### Example

  ``` ts
  const node = new Tone.Gain();
  console.log(node.numberOfInputs);
  ```

  Inherited from ToneAudioNode.numberOfInputs

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

  Inherited from ToneAudioNode.numberOfOutputs

  - Defined in [Tone/core/context/ToneAudioNode.ts:70](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L70)

### sampleTime

- get sampleTime(): number

- The duration in seconds of one sample.

  #### Returns number

  Inherited from ToneAudioNode.sampleTime

  - Defined in [Tone/core/context/ToneWithContext.ts:99](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L99)

### state

- get state(): [BasicPlaybackState](../types/BasicPlaybackState.md)

- The state of the players object. Returns "started" if any of the players are playing.

  #### Returns [BasicPlaybackState](../types/BasicPlaybackState.md)

  - Defined in [Tone/source/buffer/Players.ts:172](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Players.ts#L172)

## Methods

### add

- add(name, url, callback?): this

- Add a player by name and url to the Players

  #### Parameters

  - name: string
    A unique name to give the player
  - url: string \| AudioBuffer \| [ToneAudioBuffer](ToneAudioBuffer.md)
    Either the url of the bufer or a buffer which will be added with the given name.
  - `Optional` callback: (() => void)
    The callback to invoke when the url is loaded.

    - - (): void

      - #### Returns void

  #### Returns this

  #### Example

  ``` ts
  const players = new Tone.Players();
  players.add("gong", "https://tonejs.github.io/audio/berklee/gong_1.mp3", () => {
      console.log("gong loaded");
      players.player("gong").start();
  });
  ```

  - Defined in [Tone/source/buffer/Players.ts:227](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Players.ts#L227)

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

  Inherited from [ToneAudioNode](ToneAudioNode.md).[chain](ToneAudioNode.md#chain)

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

  Inherited from [ToneAudioNode](ToneAudioNode.md).[connect](ToneAudioNode.md#connect)

  - Defined in [Tone/core/context/ToneAudioNode.ts:205](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L205)

### disconnect

- disconnect(destination?, outputNum?, inputNum?): this

- disconnect the output

  #### Parameters

  - `Optional` destination: [InputNode](../types/InputNode.md)
  - outputNum: number = 0
  - inputNum: number = 0

  #### Returns this

  Inherited from [ToneAudioNode](ToneAudioNode.md).[disconnect](ToneAudioNode.md#disconnect)

  - Defined in [Tone/core/context/ToneAudioNode.ts:234](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L234)

### dispose

- dispose(): this

- Dispose and disconnect

  #### Returns this

  Overrides [ToneAudioNode](ToneAudioNode.md).[dispose](ToneAudioNode.md#dispose)

  - Defined in [Tone/source/buffer/Players.ts:249](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Players.ts#L249)

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

  Inherited from [ToneAudioNode](ToneAudioNode.md).[fan](ToneAudioNode.md#fan)

  - Defined in [Tone/core/context/ToneAudioNode.ts:264](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L264)

### get

- get(): [PlayersOptions](../interfaces/PlayersOptions.md)

- Get the object's attributes.

  #### Returns [PlayersOptions](../interfaces/PlayersOptions.md)

  #### Example

  ``` ts
  const osc = new Tone.Oscillator();
  console.log(osc.get());
  ```

  Inherited from [ToneAudioNode](ToneAudioNode.md).[get](ToneAudioNode.md#get)

  - Defined in [Tone/core/context/ToneWithContext.ts:170](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L170)

### has

- has(name): boolean

- True if the buffers object has a buffer by that name.

  #### Parameters

  - name: string
    The key or index of the buffer.

  #### Returns boolean

  - Defined in [Tone/source/buffer/Players.ts:183](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Players.ts#L183)

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

  Inherited from [ToneAudioNode](ToneAudioNode.md).[immediate](ToneAudioNode.md#immediate)

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

  Inherited from [ToneAudioNode](ToneAudioNode.md).[now](ToneAudioNode.md#now)

  - Defined in [Tone/core/context/ToneWithContext.ts:81](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L81)

### player

- player(name): [Player](Player.md)

- Get a player by name.

  #### Parameters

  - name: string
    The players name as defined in the constructor object or `add` method.

  #### Returns [Player](Player.md)

  - Defined in [Tone/source/buffer/Players.ts:191](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Players.ts#L191)

### set

- set(props): this

- Set multiple properties at once with an object.

  #### Parameters

  - props: RecursivePartial<[PlayersOptions](../interfaces/PlayersOptions.md)>

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

  Inherited from [ToneAudioNode](ToneAudioNode.md).[set](ToneAudioNode.md#set)

  - Defined in [Tone/core/context/ToneWithContext.ts:215](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L215)

### stopAll

- stopAll(time?): this

- Stop all of the players at the given time

  #### Parameters

  - `Optional` time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
    The time to stop all of the players.

  #### Returns this

  - Defined in [Tone/source/buffer/Players.ts:244](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Players.ts#L244)

### toDestination

- toDestination(): this

- Connect the output to the context's destination node.

  #### Returns this

  #### Example

  ``` ts
  const osc = new Tone.Oscillator("C2").start();
  osc.toDestination();
  ```

  Inherited from [ToneAudioNode](ToneAudioNode.md).[toDestination](ToneAudioNode.md#toDestination)

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

  Inherited from [ToneAudioNode](ToneAudioNode.md).[toFrequency](ToneAudioNode.md#toFrequency)

  - Defined in [Tone/core/context/ToneWithContext.ts:132](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L132)

### toMaster

- toMaster(): this

- Connect the output to the context's destination node.

  #### Returns this

  #### See

  [toDestination](Players.md#toDestination)

  #### Deprecated

  Inherited from [ToneAudioNode](ToneAudioNode.md).[toMaster](ToneAudioNode.md#toMaster)

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

  Inherited from [ToneAudioNode](ToneAudioNode.md).[toSeconds](ToneAudioNode.md#toSeconds)

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

  Inherited from [ToneAudioNode](ToneAudioNode.md).[toString](ToneAudioNode.md#toString)

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

  Inherited from [ToneAudioNode](ToneAudioNode.md).[toTicks](ToneAudioNode.md#toTicks)

  - Defined in [Tone/core/context/ToneWithContext.ts:142](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneWithContext.ts#L142)

### `Static` getDefaults

- getDefaults(): [PlayersOptions](../interfaces/PlayersOptions.md)

- #### Returns [PlayersOptions](../interfaces/PlayersOptions.md)

  Overrides [ToneAudioNode](ToneAudioNode.md).[getDefaults](ToneAudioNode.md#getDefaults)

  - Defined in [Tone/source/buffer/Players.ts:120](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Players.ts#L120)
