# Interface StateTimelineEvent

An event must have a time number

interface StateTimelineEvent {\
    [state](StateTimelineEvent.md#state): [PlaybackState](../types/PlaybackState.md);\
    [time](StateTimelineEvent.md#time): number;\
}

#### Hierarchy ([view full](../hierarchy.md#StateTimelineEvent))

- [TimelineEvent](TimelineEvent.md)
  - StateTimelineEvent

- Defined in [Tone/core/util/StateTimeline.ts:8](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/util/StateTimeline.ts#L8)

## Properties

### state

state: [PlaybackState](../types/PlaybackState.md)

- Defined in [Tone/core/util/StateTimeline.ts:9](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/util/StateTimeline.ts#L9)

### time

time: number

Inherited from [TimelineEvent](TimelineEvent.md).[time](TimelineEvent.md#time)

- Defined in [Tone/core/util/Timeline.ts:21](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/util/Timeline.ts#L21)
