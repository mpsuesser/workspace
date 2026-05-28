# Class ToneAudioBuffer

AudioBuffer loading and storage. ToneAudioBuffer is used internally by all classes that make requests for audio files such as Tone.Player, Tone.Sampler and Tone.Convolver.

#### Example

``` ts
const buffer = new Tone.ToneAudioBuffer("https://tonejs.github.io/audio/casio/A1.mp3", () => {
    console.log("loaded");
});
```

#### Hierarchy

- Tone
  - ToneAudioBuffer

- Defined in [Tone/core/context/ToneAudioBuffer.ts:26](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioBuffer.ts#L26)

## Constructors

### constructor

- new ToneAudioBuffer(url?, onload?, onerror?): [ToneAudioBuffer](ToneAudioBuffer.md)

- #### Parameters

  - `Optional` url: string \| AudioBuffer \| [ToneAudioBuffer](ToneAudioBuffer.md)
    The url to load, or the audio buffer to set.
  - `Optional` onload: ((buffer) => void)
    A callback which is invoked after the buffer is loaded. It's recommended to use `ToneAudioBuffer.on('load', callback)` instead since it will give you a callback when *all* buffers are loaded.

    - - (buffer): void

      - #### Parameters

        - buffer: [ToneAudioBuffer](ToneAudioBuffer.md)

        #### Returns void
  - `Optional` onerror: ((error) => void)
    The callback to invoke if there is an error

    - - (error): void

      - #### Parameters

        - error: Error

        #### Returns void

  #### Returns [ToneAudioBuffer](ToneAudioBuffer.md)

  Overrides Tone.constructor

  - Defined in [Tone/core/context/ToneAudioBuffer.ts:52](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioBuffer.ts#L52)

- new ToneAudioBuffer(options?): [ToneAudioBuffer](ToneAudioBuffer.md)

- #### Parameters

  - `Optional` options: Partial<ToneAudioBufferOptions>

  #### Returns [ToneAudioBuffer](ToneAudioBuffer.md)

  Overrides Tone.constructor

  - Defined in [Tone/core/context/ToneAudioBuffer.ts:57](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioBuffer.ts#L57)

## Properties

### debug

debug: boolean = false

Set this debug flag to log all events that happen in this class.

Inherited from Tone.debug

- Defined in [Tone/core/Tone.ts:49](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L49)

### `Readonly` name

name: string = "ToneAudioBuffer"

Overrides Tone.name

- Defined in [Tone/core/context/ToneAudioBuffer.ts:27](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioBuffer.ts#L27)

### onload

onload: ((buffer) => void) = noOp

Callback when the buffer is loaded.

#### Type declaration

- - (buffer): void

  - #### Parameters

    - buffer: [ToneAudioBuffer](ToneAudioBuffer.md)

    #### Returns void

- Defined in [Tone/core/context/ToneAudioBuffer.ts:42](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioBuffer.ts#L42)

### `Static` baseUrl

baseUrl: string = ""

A path which is prefixed before every url.

- Defined in [Tone/core/context/ToneAudioBuffer.ts:344](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioBuffer.ts#L344)

### `Static` downloads

downloads: Promise<void>\[\] = \[\]

All of the downloads

- Defined in [Tone/core/context/ToneAudioBuffer.ts:369](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioBuffer.ts#L369)

### `Static` version

version: string = version

The version number semver

Inherited from Tone.version

- Defined in [Tone/core/Tone.ts:28](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L28)

## Accessors

### disposed

- get disposed(): boolean

- Indicates if the instance was disposed. 'Disposing' an instance means that all of the Web Audio nodes that were created for the instance are disconnected and freed for garbage collection.

  #### Returns boolean

  Inherited from Tone.disposed

  - Defined in [Tone/core/Tone.ts:96](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L96)

### duration

- get duration(): number

- The duration of the buffer in seconds.

  #### Returns number

  - Defined in [Tone/core/context/ToneAudioBuffer.ts:294](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioBuffer.ts#L294)

### length

- get length(): number

- The length of the buffer in samples

  #### Returns number

  - Defined in [Tone/core/context/ToneAudioBuffer.ts:305](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioBuffer.ts#L305)

### loaded

- get loaded(): boolean

- If the buffer is loaded or not

  #### Returns boolean

  - Defined in [Tone/core/context/ToneAudioBuffer.ts:287](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioBuffer.ts#L287)

### numberOfChannels

- get numberOfChannels(): number

- The number of discrete audio channels. Returns 0 if no buffer is loaded.

  #### Returns number

  - Defined in [Tone/core/context/ToneAudioBuffer.ts:316](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioBuffer.ts#L316)

### reverse

- get reverse(): boolean

- Reverse the buffer.

  #### Returns boolean

  - Defined in [Tone/core/context/ToneAudioBuffer.ts:327](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioBuffer.ts#L327)

- set reverse(rev): void

- #### Parameters

  - rev: boolean

  #### Returns void

  - Defined in [Tone/core/context/ToneAudioBuffer.ts:330](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioBuffer.ts#L330)

### sampleRate

- get sampleRate(): number

- The sample rate of the AudioBuffer

  #### Returns number

  - Defined in [Tone/core/context/ToneAudioBuffer.ts:89](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioBuffer.ts#L89)

## Methods

### dispose

- dispose(): this

- clean up

  #### Returns this

  Overrides Tone.dispose

  - Defined in [Tone/core/context/ToneAudioBuffer.ts:157](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioBuffer.ts#L157)

### fromArray

- fromArray(array): this

- Set the audio buffer from the array. To create a multichannel AudioBuffer, pass in a multidimensional array.

  #### Parameters

  - array: Float32Array \| Float32Array\[\]
    The array to fill the audio buffer

  #### Returns this

  - Defined in [Tone/core/context/ToneAudioBuffer.ts:168](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioBuffer.ts#L168)

### get

- get(): undefined \| AudioBuffer

- The audio buffer stored in the object.

  #### Returns undefined \| AudioBuffer

  - Defined in [Tone/core/context/ToneAudioBuffer.ts:125](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioBuffer.ts#L125)

### getChannelData

- getChannelData(channel): Float32Array

- Returns the Float32Array representing the PCM audio data for the specific channel.

  #### Parameters

  - channel: number
    The channel number to return

  #### Returns Float32Array

  The audio as a TypedArray

  - Defined in [Tone/core/context/ToneAudioBuffer.ts:235](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioBuffer.ts#L235)

### load

- load(url): Promise<[ToneAudioBuffer](ToneAudioBuffer.md)>

- Makes an fetch request for the selected url then decodes the file as an audio buffer. Invokes the callback once the audio buffer loads.

  #### Parameters

  - url: string
    The url of the buffer to load. filetype support depends on the browser.

  #### Returns Promise<[ToneAudioBuffer](ToneAudioBuffer.md)>

  A Promise which resolves with this ToneAudioBuffer

  - Defined in [Tone/core/context/ToneAudioBuffer.ts:135](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioBuffer.ts#L135)

### set

- set(buffer): this

- Pass in an AudioBuffer or ToneAudioBuffer to set the value of this buffer.

  #### Parameters

  - buffer: AudioBuffer \| [ToneAudioBuffer](ToneAudioBuffer.md)

  #### Returns this

  - Defined in [Tone/core/context/ToneAudioBuffer.ts:100](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioBuffer.ts#L100)

### slice

- slice(start, end?): [ToneAudioBuffer](ToneAudioBuffer.md)

- Cut a subsection of the array and return a buffer of the subsection. Does not modify the original buffer

  #### Parameters

  - start: number
    The time to start the slice
  - end: number = ...
    The end time to slice. If none is given will default to the end of the buffer

  #### Returns [ToneAudioBuffer](ToneAudioBuffer.md)

  - Defined in [Tone/core/context/ToneAudioBuffer.ts:249](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioBuffer.ts#L249)

### toArray

- toArray(channel?): Float32Array \| Float32Array\[\]

- Get the buffer as an array. Single channel buffers will return a 1-dimensional Float32Array, and multichannel buffers will return multidimensional arrays.

  #### Parameters

  - `Optional` channel: number
    Optionally only copy a single channel from the array.

  #### Returns Float32Array \| Float32Array\[\]

  - Defined in [Tone/core/context/ToneAudioBuffer.ts:216](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioBuffer.ts#L216)

### toMono

- toMono(chanNum?): this

- Sums multiple channels into 1 channel

  #### Parameters

  - `Optional` chanNum: number
    Optionally only copy a single channel from the array.

  #### Returns this

  - Defined in [Tone/core/context/ToneAudioBuffer.ts:192](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioBuffer.ts#L192)

### toString

- toString(): string

- Convert the class to a string

  #### Returns string

  #### Example

  ``` ts
  const osc = new Tone.Oscillator();
  console.log(osc.toString());
  ```

  Inherited from Tone.toString

  - Defined in [Tone/core/Tone.ts:106](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L106)

### `Static` fromArray

- fromArray(array): [ToneAudioBuffer](ToneAudioBuffer.md)

- Create a ToneAudioBuffer from the array. To create a multichannel AudioBuffer, pass in a multidimensional array.

  #### Parameters

  - array: Float32Array \| Float32Array\[\]
    The array to fill the audio buffer

  #### Returns [ToneAudioBuffer](ToneAudioBuffer.md)

  A ToneAudioBuffer created from the array

  - Defined in [Tone/core/context/ToneAudioBuffer.ts:352](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioBuffer.ts#L352)

### `Static` fromUrl

- fromUrl(url): Promise<[ToneAudioBuffer](ToneAudioBuffer.md)>

- Creates a ToneAudioBuffer from a URL, returns a promise which resolves to a ToneAudioBuffer

  #### Parameters

  - url: string
    The url to load.

  #### Returns Promise<[ToneAudioBuffer](ToneAudioBuffer.md)>

  A promise which resolves to a ToneAudioBuffer

  - Defined in [Tone/core/context/ToneAudioBuffer.ts:361](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioBuffer.ts#L361)

### `Static` getDefaults

- getDefaults(): ToneAudioBufferOptions

- #### Returns ToneAudioBufferOptions

  Overrides Tone.getDefaults

  - Defined in [Tone/core/context/ToneAudioBuffer.ts:78](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioBuffer.ts#L78)

### `Static` load

- load(url): Promise<AudioBuffer>

- Loads a url using fetch and returns the AudioBuffer.

  #### Parameters

  - url: string

  #### Returns Promise<AudioBuffer>

  - Defined in [Tone/core/context/ToneAudioBuffer.ts:374](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioBuffer.ts#L374)

### `Static` loaded

- loaded(): Promise<void>

- Returns a Promise which resolves when all of the buffers have loaded

  #### Returns Promise<void>

  - Defined in [Tone/core/context/ToneAudioBuffer.ts:414](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioBuffer.ts#L414)

### `Static` supportsType

- supportsType(url): boolean

- Checks a url's extension to see if the current browser can play that file type.

  #### Parameters

  - url: string
    The url/extension to test

  #### Returns boolean

  If the file extension can be played

  #### Static

  #### Example

  ``` ts
  Tone.ToneAudioBuffer.supportsType("wav"); // returns true
  Tone.ToneAudioBuffer.supportsType("path/to/file.wav"); // returns true
  ```

  - Defined in [Tone/core/context/ToneAudioBuffer.ts:402](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioBuffer.ts#L402)
