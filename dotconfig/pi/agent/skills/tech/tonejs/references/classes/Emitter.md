# Class Emitter<EventType>

Emitter gives classes which extend it the ability to listen for and emit events. Inspiration and reference from Jerome Etienne's [MicroEvent](https://github.com/jeromeetienne/microevent.js). MIT (c) 2011 Jerome Etienne.

#### Type Parameters

- EventType extends string = string

#### Hierarchy ([view full](../hierarchy.md#Emitter))

- Tone
  - Emitter
    - [BaseContext](BaseContext.md)

#### Implemented by

- [Clock](Clock.md)

- Defined in [Tone/core/util/Emitter.ts:15](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/util/Emitter.ts#L15)

## Constructors

### constructor

- new Emitter<[EventType](Emitter.md#constructor.new_Emitter.EventType-1)>(): [Emitter](Emitter.md)<[EventType](Emitter.md#constructor.new_Emitter.EventType-1)>

- #### Type Parameters

  - EventType extends string = string

  #### Returns [Emitter](Emitter.md)<[EventType](Emitter.md#constructor.new_Emitter.EventType-1)>

  Inherited from Tone.constructor

## Properties

### debug

debug: boolean = false

Set this debug flag to log all events that happen in this class.

Inherited from Tone.debug

- Defined in [Tone/core/Tone.ts:49](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L49)

### `Readonly` name

name: string = "Emitter"

Overrides Tone.name

- Defined in [Tone/core/util/Emitter.ts:16](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/util/Emitter.ts#L16)

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

## Methods

### dispose

- dispose(): this

- Clean up

  #### Returns this

  Overrides Tone.dispose

  - Defined in [Tone/core/util/Emitter.ts:122](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/util/Emitter.ts#L122)

### emit

- emit(event, ...args): this

- Invoke all of the callbacks bound to the event with any arguments passed in.

  #### Parameters

  - event: [EventType](Emitter.md#constructor.new_Emitter.EventType-1)
    The name of the event.
  - `Rest` ...args: any\[\]
    The arguments to pass to the functions listening.

  #### Returns this

  - Defined in [Tone/core/util/Emitter.ts:93](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/util/Emitter.ts#L93)

### off

- off(event, callback?): this

- Remove the event listener.

  #### Parameters

  - event: [EventType](Emitter.md#constructor.new_Emitter.EventType-1)
    The event to stop listening to.
  - `Optional` callback: ((...args) => void)
    The callback which was bound to the event with Emitter.on. If no callback is given, all callbacks events are removed.

    - - (...args): void

      - #### Parameters

        - `Rest` ...args: any\[\]

        #### Returns void

  #### Returns this

  - Defined in [Tone/core/util/Emitter.ts:65](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/util/Emitter.ts#L65)

### on

- on(event, callback): this

- Bind a callback to a specific event.

  #### Parameters

  - event: [EventType](Emitter.md#constructor.new_Emitter.EventType-1)
    The name of the event to listen for.
  - callback: ((...args) => void)
    The callback to invoke when the event is emitted

    - - (...args): void

      - #### Parameters

        - `Rest` ...args: any\[\]

        #### Returns void

  #### Returns this

  - Defined in [Tone/core/util/Emitter.ts:28](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/util/Emitter.ts#L28)

### once

- once(event, callback): this

- Bind a callback which is only invoked once

  #### Parameters

  - event: [EventType](Emitter.md#constructor.new_Emitter.EventType-1)
    The name of the event to listen for.
  - callback: ((...args) => void)
    The callback to invoke when the event is emitted

    - - (...args): void

      - #### Parameters

        - `Rest` ...args: any\[\]

        #### Returns void

  #### Returns this

  - Defined in [Tone/core/util/Emitter.ts:48](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/util/Emitter.ts#L48)

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

- getDefaults(): BaseToneOptions

- Returns all of the default options belonging to the class.

  #### Returns BaseToneOptions

  Inherited from Tone.getDefaults

  - Defined in [Tone/core/Tone.ts:38](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/Tone.ts#L38)

### `Static` mixin

- mixin(constr): void

- Add Emitter functions (on/off/emit) to the object

  #### Parameters

  - constr: any

  #### Returns void

  - Defined in [Tone/core/util/Emitter.ts:108](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/util/Emitter.ts#L108)
