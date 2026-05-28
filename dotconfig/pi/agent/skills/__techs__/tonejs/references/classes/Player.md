# Class Player

Player is an audio file player with start, loop, and stop functions.

#### Example

``` ts
const player = new Tone.Player("https://tonejs.github.io/audio/berklee/gong_1.mp3").toDestination();
// play as soon as the buffer is loaded
player.autostart = true;
```

#### Hierarchy

- Source<[PlayerOptions](../interfaces/PlayerOptions.md)>
  - Player

- Defined in [Tone/source/buffer/Player.ts:33](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Player.ts#L33)

## Constructors

### constructor

- new Player(url?, onload?): [Player](Player.md)

- #### Parameters

  - `Optional` url: string \| AudioBuffer \| [ToneAudioBuffer](ToneAudioBuffer.md)
    Either the AudioBuffer or the url from which to load the AudioBuffer
  - `Optional` onload: (() => void)
    The function to invoke when the buffer is loaded.

    - - (): void

      - #### Returns void

  #### Returns [Player](Player.md)

  Overrides Source<PlayerOptions>.constructor

  - Defined in [Tone/source/buffer/Player.ts:88](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Player.ts#L88)

- new Player(options?): [Player](Player.md)

- #### Parameters

  - `Optional` options: Partial<[PlayerOptions](../interfaces/PlayerOptions.md)>

  #### Returns [Player](Player.md)

  Overrides Source<PlayerOptions>.constructor

  - Defined in [Tone/source/buffer/Player.ts:92](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Player.ts#L92)

## Properties

### autostart

autostart: boolean

If the file should play as soon as the buffer is loaded.

- Defined in [Tone/source/buffer/Player.ts:40](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Player.ts#L40)

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

### fadeIn

fadeIn: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

The fadeIn time of the amplitude envelope.

- Defined in [Tone/source/buffer/Player.ts:76](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Player.ts#L76)

### fadeOut

fadeOut: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

The fadeOut time of the amplitude envelope.

- Defined in [Tone/source/buffer/Player.ts:82](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Player.ts#L82)

### input

input: undefined = undefined

Sources have no inputs

Inherited from Source.input

- Defined in [Tone/source/Source.ts:63](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/Source.ts#L63)

### `Readonly` name

name: string = "Player"

Overrides Source.name

- Defined in [Tone/source/buffer/Player.ts:34](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Player.ts#L34)

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

### buffer

- get buffer(): [ToneAudioBuffer](ToneAudioBuffer.md)

- The audio buffer belonging to the player.

  #### Returns [ToneAudioBuffer](ToneAudioBuffer.md)

  - Defined in [Tone/source/buffer/Player.ts:364](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Player.ts#L364)

- set buffer(buffer): void

- #### Parameters

  - buffer: [ToneAudioBuffer](ToneAudioBuffer.md)

  #### Returns void

  - Defined in [Tone/source/buffer/Player.ts:367](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Player.ts#L367)

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

### loaded

- get loaded(): boolean

- If the buffer is loaded

  #### Returns boolean

  - Defined in [Tone/source/buffer/Player.ts:447](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Player.ts#L447)

### loop

- get loop(): boolean

- If the buffer should loop once it's over.

  #### Returns boolean

  #### Example

  ``` ts
  const player = new Tone.Player("https://tonejs.github.io/audio/drum-samples/breakbeat.mp3").toDestination();
  player.loop = true;
  player.autostart = true;
  ```

  - Defined in [Tone/source/buffer/Player.ts:378](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Player.ts#L378)

- set loop(loop): void

- #### Parameters

  - loop: boolean

  #### Returns void

  - Defined in [Tone/source/buffer/Player.ts:381](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Player.ts#L381)

### loopEnd

- get loopEnd(): [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

- If loop is true, the loop will end at this position.

  #### Returns [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  - Defined in [Tone/source/buffer/Player.ts:347](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Player.ts#L347)

- set loopEnd(loopEnd): void

- #### Parameters

  - loopEnd: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Returns void

  - Defined in [Tone/source/buffer/Player.ts:350](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Player.ts#L350)

### loopStart

- get loopStart(): [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

- If loop is true, the loop will start at this position.

  #### Returns [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  - Defined in [Tone/source/buffer/Player.ts:330](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Player.ts#L330)

- set loopStart(loopStart): void

- #### Parameters

  - loopStart: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)

  #### Returns void

  - Defined in [Tone/source/buffer/Player.ts:333](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Player.ts#L333)

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

### playbackRate

- get playbackRate(): number

- Normal speed is 1. The pitch will change with the playback rate.

  #### Returns number

  #### Example

  ``` ts
  const player = new Tone.Player("https://tonejs.github.io/audio/berklee/femalevoices_aa2_A5.mp3").toDestination();
  // play at 1/4 speed
  player.playbackRate = 0.25;
  // play as soon as the buffer is loaded
  player.autostart = true;
  ```

  - Defined in [Tone/source/buffer/Player.ts:409](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Player.ts#L409)

- set playbackRate(rate): void

- #### Parameters

  - rate: number

  #### Returns void

  - Defined in [Tone/source/buffer/Player.ts:412](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Player.ts#L412)

### reverse

- get reverse(): boolean

- If the buffer should be reversed. Note that this sets the underlying [ToneAudioBuffer.reverse](ToneAudioBuffer.md#reverse), so if multiple players are pointing at the same ToneAudioBuffer, they will all be reversed.

  #### Returns boolean

  #### Example

  ``` ts
  const player = new Tone.Player("https://tonejs.github.io/audio/berklee/chime_1.mp3").toDestination();
  player.autostart = true;
  player.reverse = true;
  ```

  - Defined in [Tone/source/buffer/Player.ts:437](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Player.ts#L437)

- set reverse(rev): void

- #### Parameters

  - rev: boolean

  #### Returns void

  - Defined in [Tone/source/buffer/Player.ts:440](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Player.ts#L440)

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

- #### Returns this

  Overrides Source.dispose

  - Defined in [Tone/source/buffer/Player.ts:451](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Player.ts#L451)

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

- get(): [PlayerOptions](../interfaces/PlayerOptions.md)

- Get the object's attributes.

  #### Returns [PlayerOptions](../interfaces/PlayerOptions.md)

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

### load

- load(url): Promise<[Player](Player.md)>

- Load the audio file as an audio buffer. Decodes the audio asynchronously and invokes the callback once the audio buffer loads. Note: this does not need to be called if a url was passed in to the constructor. Only use this if you want to manually load a new url.

  #### Parameters

  - url: string
    The url of the buffer to load. Filetype support depends on the browser.

  #### Returns Promise<[Player](Player.md)>

  - Defined in [Tone/source/buffer/Player.ts:139](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Player.ts#L139)

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

- Stop and then restart the player from the beginning (or offset)

  #### Parameters

  - `Optional` time: number
    When the player should start.
  - `Optional` offset: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
    The offset from the beginning of the sample to start at.
  - `Optional` duration: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
    How long the sample should play. If no duration is given, it will default to the full length of the sample (minus any offset)

  #### Returns this

  Overrides Source.restart

  - Defined in [Tone/source/buffer/Player.ts:276](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Player.ts#L276)

### seek

- seek(offset, when?): this

- Seek to a specific time in the player's buffer. If the source is no longer playing at that time, it will stop.

  #### Parameters

  - offset: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
    The time to seek to.
  - `Optional` when: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
    The time for the seek event to occur.

  #### Returns this

  #### Example

  ``` ts
  const player = new Tone.Player("https://tonejs.github.io/audio/berklee/gurgling_theremin_1.mp3", () => {
      player.start();
      // seek to the offset in 1 second from now
      player.seek(0.4, "+1");
  }).toDestination();
  ```

  - Defined in [Tone/source/buffer/Player.ts:298](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Player.ts#L298)

### set

- set(props): this

- Set multiple properties at once with an object.

  #### Parameters

  - props: RecursivePartial<[PlayerOptions](../interfaces/PlayerOptions.md)>

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

### setLoopPoints

- setLoopPoints(loopStart, loopEnd): this

- Set the loop start and end. Will only loop if loop is set to true.

  #### Parameters

  - loopStart: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
    The loop start time
  - loopEnd: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
    The loop end time

  #### Returns this

  #### Example

  ``` ts
  const player = new Tone.Player("https://tonejs.github.io/audio/berklee/malevoices_aa2_F3.mp3").toDestination();
  // loop between the given points
  player.setLoopPoints(0.2, 0.3);
  player.loop = true;
  player.autostart = true;
  ```

  - Defined in [Tone/source/buffer/Player.ts:321](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Player.ts#L321)

### start

- start(time?, offset?, duration?): this

- Play the buffer at the given startTime. Optionally add an offset and/or duration which will play the buffer from a position within the buffer for the given duration.

  #### Parameters

  - `Optional` time: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
    When the player should start.
  - `Optional` offset: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
    The offset from the beginning of the sample to start at.
  - `Optional` duration: [Unit](../modules/Unit.md).[Time](../types/Unit.Time.md)
    How long the sample should play. If no duration is given, it will default to the full length of the sample (minus any offset)

  #### Returns this

  Overrides Source.start

  - Defined in [Tone/source/buffer/Player.ts:184](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Player.ts#L184)

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

  [toDestination](Player.md#toDestination)

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

  [sync](Player.md#sync)

  Inherited from Source.unsync

  - Defined in [Tone/source/Source.ts:368](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/Source.ts#L368)

### `Static` getDefaults

- getDefaults(): [PlayerOptions](../interfaces/PlayerOptions.md)

- #### Returns [PlayerOptions](../interfaces/PlayerOptions.md)

  Overrides Source.getDefaults

  - Defined in [Tone/source/buffer/Player.ts:115](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/source/buffer/Player.ts#L115)
