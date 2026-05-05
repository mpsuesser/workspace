# Type alias TimeObject

TimeObject: {\
    \[sub in [Subdivision](Unit.Subdivision.md)\]?: number\
}

A time object has a subdivision as the keys and a number as the values.

#### Example

``` ts
Tone.Time({
    "2n": 1,
    "8n": 3
}).valueOf(); // 2n + 8n * 3
```

- Defined in [Tone/core/type/Units.ts:68](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/type/Units.ts#L68)
