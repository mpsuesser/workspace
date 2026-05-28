# Function disconnect

- disconnect(srcNode, dstNode?, outputNumber?, inputNumber?): void

- Disconnect a node from all nodes or optionally include a destination node and input/output channels.

  #### Parameters

  - srcNode: [OutputNode](../types/OutputNode.md)
    The source node
  - `Optional` dstNode: [InputNode](../types/InputNode.md)
    The destination node
  - outputNumber: number = 0
    The output channel of the srcNode
  - inputNumber: number = 0
    The input channel of the dstNode

  #### Returns void

  - Defined in [Tone/core/context/ToneAudioNode.ts:369](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/ToneAudioNode.ts#L369)
