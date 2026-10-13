# Field

A playable browser beat studio for stacking loops, tapping drums, and playing Rhodes, guitar, and synth voices.

Build a groove from nine scenes, then reshape it with a 16-step drum grid, live pads, tempo, swing, and effects. Audio is generated in the browser with the Web Audio API.

## Start playing

1. Open Field and select **Enable sound**.
2. Press **Play** or **Space** to start the loop.
3. Choose a scene, then mix drums, bass, keys, and guitar clips.
4. Open **Edit drum grid** to change the beat, or **Mix & effects** to shape the sound.

**Rec** writes live drum-pad hits into the running step pattern. It is not an audio-file recorder. The current studio state lives in memory; refreshing starts a new session.

## Run locally

Use Node.js 22 and npm.

```sh
git clone https://github.com/Sappgulf/field-studio.git
cd field-studio
npm ci
npm run dev
```

Open the development address printed by the server (port 8080). Use the npm scripts rather than invoking Vite directly so the app's environment wrapper stays in the startup path.

## Controls

| Input | Action |
| --- | --- |
| Space | Start or stop the loop |
| 1–8 | Kick, snare, closed hat, open hat, clap, tom, percussion, rim |
| A S D F G H J K L ; ' | Play white notes |
| W E T Y U O P | Play black notes |
| Z / X | Shift the keyboard down / up an octave |
| On-screen pads and piano | Play with pointer or touch |

Switch between **Pads**, **Rhodes**, **Guitar**, and **Synth** in the instrument panel. Keyboard note labels are also shown on the piano.

## Explore the studio

- **Nine scenes:** Lofi, Hop, Trap, Under, Melt, Emo, Bounce, Det, and Memph.
- **Drum programming:** eight voices, four selectable kits, editable 16-step patterns, and live step recording.
- **Loop layers:** independent drum, bass, keys, and guitar selections.
- **Sound shaping:** synth presets and tone controls, lane mixing, delay, reverb, and swing.
- **Live feedback:** an audio scope and step playhead.

Read the [studio guide](STUDIO_GUIDE.md) for scene behavior, recording limits, project layout, and development checks.

## Built with

React 19, TypeScript, TanStack Start, Vite, Tailwind CSS, Zustand, and a custom Web Audio engine.
