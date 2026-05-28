# pi-voice

Voice output for Pi using ElevenLabs.

## Setup

```sh
cd ~/.pi/agent/extensions/voice
npm install
```

Set an ElevenLabs API key using Pi's private auth file (recommended):

```json
// ~/.pi/agent/auth.json
{
  "elevenlabs": { "type": "api_key", "key": "..." }
}
```

Then protect the file:

```sh
chmod 600 ~/.pi/agent/auth.json
```

You can also keep the secret in macOS Keychain and store only a command in `auth.json`:

```sh
security add-generic-password -a "$USER" -s pi-voice-elevenlabs -w "YOUR_ELEVENLABS_KEY" -U
```

```json
{
  "elevenlabs": {
    "type": "api_key",
    "key": "!security find-generic-password -a $USER -s pi-voice-elevenlabs -w"
  }
}
```

Environment variables still work, but do not put them in a committed shell file:

```sh
export ELEVENLABS_API_KEY="..."
```

Optional:

```sh
export PI_VOICE_ID="aEO01A4wXwd1O8GPgGlF"

# Default TTS setup: quick acknowledgements stay on v2; final summaries use the v3 creative preset.
export PI_VOICE_ACK_ELEVEN_MODEL="eleven_multilingual_v2"
export PI_VOICE_FINAL_ELEVEN_MODEL="eleven_v3"
export PI_VOICE_FINAL_ELEVEN_STABILITY="0.35"
export PI_VOICE_FINAL_ELEVEN_SIMILARITY_BOOST="0.75"
export PI_VOICE_OUTPUT_FORMAT="mp3_44100_128"

# Optional v2 tuning. Lower stability is more expressive but less predictable.
export PI_VOICE_STYLE="0.2" # useful on v2-style models
export PI_VOICE_SPEED="0.96"

export PI_VOICE_SUMMARY_MODEL="openai-codex/gpt-5.4-nano"
export PI_VOICE_ACK_STYLE="template" # template | llm
```

`PI_VOICE_ELEVEN_MODEL` still works as a global fallback. Per-kind ElevenLabs variables such as `PI_VOICE_ACK_ELEVEN_STABILITY`, `PI_VOICE_FINAL_ELEVEN_STABILITY`, `PI_VOICE_ACK_ELEVEN_STYLE`, `PI_VOICE_FINAL_ELEVEN_STYLE`, `PI_VOICE_ACK_ELEVEN_SPEED`, and `PI_VOICE_FINAL_ELEVEN_SPEED` override the global tuning for that kind.

Playback prefers `mpv`, which streams ElevenLabs audio directly from stdin so speech can start before the full file is generated. If `mpv` is unavailable, it falls back to writing a temp audio file and playing it with `afplay` on macOS or `ffplay`.

## Commands

- `/voice status` — shows whether the key is coming from `auth.json`, the environment, or is missing
- `/voice on`
- `/voice off`
- `/voice stop`
- `/voice test [text]`
- `/voice audition [text]` — plays v2 balanced, v2 expressive, v3 natural, and v3 creative presets for comparison
- `/voice ack on|off|template|llm`
- `/voice final on|off`
- `/voice voice <elevenlabs-voice-id>`

## Notes

The extension uses a side LLM call to rewrite Pi's final answer into a short, speech-friendly update. For Eleven v3 final summaries, the prompt may add a couple of restrained audio tags such as `[warmly]` or `[curious]`; for v2-style models it may preserve a single short `<break />` pause tag. That generated text is sent to ElevenLabs for TTS. It does not inject anything into the Pi conversation.
