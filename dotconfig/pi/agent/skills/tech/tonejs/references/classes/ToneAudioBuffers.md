# Class ToneAudioBuffers

A data structure for holding multiple buffers in a Map-like datastructure.

#### Example

``` ts
const pianoSamples = new Tone.ToneAudioBuffers({
    A1: "https://tonejs.github.io/audio/casio/A1.mp3",
    A2: "https://tonejs.github.io/audio/casio/A2.mp3",
}, () => {
    const player = new Tone.Player().toDestination();
    // play one of the samples when they all load
    player.buffer = pianoSamples.get("A2");
    player.start();
});
```

#### Example

``` ts
// To pass in additional parameters in the second parameter
const buffers = new Tone.ToneAudioBuffers({
     urls: {
         A1: "A1.mp3",
         A2: "A2.mp3",
     },
     onload: () => console.log("loaded"),
     baseUrl: "https://tonejs.github.io/audio/casio/"
});
```

#### Hierarchy

- Tone
  - ToneAudioBuffers

- Defined in [Tone/core/context/ToneAudioBuffers.ts:45](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioBuffers.ts#L45)

## Constructors

### constructor

- new ToneAudioBuffers(urls?, onload?, baseUrl?): [ToneAudioBuffers](ToneAudioBuffers.md)

- #### Parameters

  - `Optional` urls: [ToneAudioBuffersUrlMap](../interfaces/ToneAudioBuffersUrlMap.md)
    An object literal or array of urls to load.
  - `Optional` onload: (() => void)
    The callback to invoke when the buffers are loaded.

    - - (): void

      - #### Returns void
  - `Optional` baseUrl: string
    A prefix url to add before all the urls

  #### Returns [ToneAudioBuffers](ToneAudioBuffers.md)

  Overrides Tone.constructor

  - Defined in [Tone/core/context/ToneAudioBuffers.ts:68](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioBuffers.ts#L68)

- new ToneAudioBuffers(options?): [ToneAudioBuffers](ToneAudioBuffers.md)

- #### Parameters

  - `Optional` options: Partial<ToneAudioBuffersOptions>

  #### Returns [ToneAudioBuffers](ToneAudioBuffers.md)

  Overrides Tone.constructor

  - Defined in [Tone/core/context/ToneAudioBuffers.ts:73](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioBuffers.ts#L73)

## Properties

### baseUrl

baseUrl: string

A path which is prefixed before every url.

- Defined in [Tone/core/context/ToneAudioBuffers.ts:56](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioBuffers.ts#L56)

### debug

debug: boolean = false

Set this debug flag to log all events that happen in this class.

Inherited from Tone.debug

- Defined in [Tone/core/Tone.ts:49](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L49)

### `Readonly` name

name: string = "ToneAudioBuffers"

Overrides Tone.name

- Defined in [Tone/core/context/ToneAudioBuffers.ts:46](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioBuffers.ts#L46)

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

### loaded

- get loaded(): boolean

- If the buffers are loaded or not

  #### Returns boolean

  - Defined in [Tone/core/context/ToneAudioBuffers.ts:137](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioBuffers.ts#L137)

## Methods

### add

- add(name, url, callback?, onerror?): this

- Add a buffer by name and url to the Buffers

  #### Parameters

  - name: string \| number
    A unique name to give the buffer
  - url: string \| AudioBuffer \| [ToneAudioBuffer](ToneAudioBuffer.md)
    Either the url of the bufer, or a buffer which will be added with the given name.
  - callback: (() => void) = noOp
    The callback to invoke when the url is loaded.

    - - (): void

      - #### Returns void
  - onerror: ((e) => void) = noOp
    Invoked if the buffer can't be loaded

    - - (e): void

      - #### Parameters

        - e: Error

        #### Returns void

  #### Returns this

  - Defined in [Tone/core/context/ToneAudioBuffers.ts:148](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioBuffers.ts#L148)

### dispose

- dispose(): this

- #### Returns this

  Overrides Tone.dispose

  - Defined in [Tone/core/context/ToneAudioBuffers.ts:175](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioBuffers.ts#L175)

### get

- get(name): [ToneAudioBuffer](ToneAudioBuffer.md)

- Get a buffer by name. If an array was loaded, then use the array index.

  #### Parameters

  - name: string \| number
    The key or index of the buffer.

  #### Returns [ToneAudioBuffer](ToneAudioBuffer.md)

  - Defined in [Tone/core/context/ToneAudioBuffers.ts:119](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioBuffers.ts#L119)

### has

- has(name): boolean

- True if the buffers object has a buffer by that name.

  #### Parameters

  - name: string \| number
    The key or index of the buffer.

  #### Returns boolean

  - Defined in [Tone/core/context/ToneAudioBuffers.ts:110](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioBuffers.ts#L110)

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

### `Static` getDefaults

- getDefaults(): ToneAudioBuffersOptions

- #### Returns ToneAudioBuffersOptions

  Overrides Tone.getDefaults

  - Defined in [Tone/core/context/ToneAudioBuffers.ts:97](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioBuffers.ts#L97)
