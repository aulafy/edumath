# Voice Sidecars

The speech engines run outside the main API so model dependencies cannot destabilize EduMath.

## Install

```bash
make install-voice
```

This creates separate Python 3.12 environments and downloads package dependencies. Model weights
are downloaded by each provider on its first run.

## Run

In separate terminals:

```bash
make voice-stt
make voice-tts
```

- Moonshine Spanish STT: `http://127.0.0.1:8421`
- Pocket TTS Spanish: `http://127.0.0.1:8422`

> **License note:** the `moonshine-voice` code is MIT, but the bundled Spanish
> model is released under the non-commercial Moonshine Community License. A
> commercial deployment must use a suitably licensed model or obtain separate
> permission from Moonshine AI.

The first startup can take several minutes while model weights are downloaded. EduMath continues
to support typed input while either service is unavailable.
