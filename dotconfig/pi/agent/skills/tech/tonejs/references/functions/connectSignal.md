# Function connectSignal

- connectSignal(signal, destination, outputNum?, inputNum?): void

- When connecting from a signal, it's necessary to zero out the node destination node if that node is also a signal. If the destination is not 0, then the values will be summed. This method insures that the output of the destination signal will be the same as the source signal, making the destination signal a pass through node.

  #### Parameters

  - signal: [OutputNode](../types/OutputNode.md)
    The output signal to connect from
  - destination: [InputNode](../types/InputNode.md)
    the destination to connect to
  - `Optional` outputNum: number
    the optional output number
  - `Optional` inputNum: number
    the input number

  #### Returns void

  - Defined in [Tone/signal/Signal.ts:246](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/signal/Signal.ts#L246)
