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
export PI_VOICE_ELEVEN_MODEL="eleven_multilingual_v2"
export PI_VOICE_OUTPUT_FORMAT="mp3_44100_128"
export PI_VOICE_SUMMARY_MODEL="openai-codex/gpt-5.4-nano"
export PI_VOICE_ACK_STYLE="template" # template | llm
```

Playback uses `mpv`, `afplay` on macOS, or `ffplay` when available.

## Commands

- `/voice status` — shows whether the key is coming from `auth.json`, the environment, or is missing
- `/voice on`
- `/voice off`
- `/voice stop`
- `/voice test [text]`
- `/voice ack on|off|template|llm`
- `/voice final on|off`
- `/voice voice <elevenlabs-voice-id>`

## Notes

The extension uses a side LLM call to rewrite Pi's final answer into a short, speech-friendly update. That generated text is sent to ElevenLabs for TTS. It does not inject anything into the Pi conversation.
