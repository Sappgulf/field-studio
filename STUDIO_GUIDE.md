# Field studio guide

[Back to the overview](README.md)

## Make a beat

Enable sound with a click or tap, then start playback. Browser audio needs a user gesture before it can play.

Scenes are complete starting points: **Lofi, Hop, Trap, Under, Melt, Emo, Bounce, Det, and Memph**. Choosing one replaces the drum pattern and its kit, tempo, swing, melodic clips, and reverb setting. The loop rack also lets you change drums, bass, keys, and guitar independently.

The **Tempo** slider spans 70–180 BPM. Open **Mix & effects** for mix and effect controls; open **Edit drum grid** for the eight-row, 16-step drum pattern. **Clear** clears the drum steps. **Reset beat** restores the first scene's loop configuration.

## Live instruments and recording

The live instrument panel offers **Pads**, **Rhodes**, **Guitar**, and **Synth**. Pads have four selectable kits: Dusty, Trap, 808, and Room. Synth mode adds presets and **Edit tone** controls for cutoff, resonance, attack, and release.

With **Rec** enabled and the loop running, a drum-pad hit turns on that voice's current step. This records drum events into the pattern, not audio or a melodic performance. There is no audio export or session save control in the current studio. The Zustand studio store is in-memory; a page reload resets it.

The on-screen piano spans two octaves plus the top C. Z and X shift the octave, bounded to two octaves below or above the default range. Computer-key note shortcuts cover part of that range:

- White notes: A, S, D, F, G, H, J, K, L, semicolon, apostrophe
- Black notes: W, E, T, Y, U, O, P
- Drums: 1 kick, 2 snare, 3 hat, 4 open hat, 5 clap, 6 tom, 7 percussion, 8 rim
- Space: play or stop

Shortcuts are ignored while typing into an input, textarea, or select control, and when Ctrl, Cmd, or Alt is held.

## Project layout

| Path | Purpose |
| --- | --- |
| [src/components/synth](src/components/synth) | Instrument panels, loop rack, transport, grid, mixer, and scope |
| [src/lib/synth/engine.ts](src/lib/synth/engine.ts) | Web Audio engine and audio routing |
| [src/lib/synth/store.ts](src/lib/synth/store.ts) | Studio state and interaction actions |
| [src/lib/synth/loops.ts](src/lib/synth/loops.ts) | Scenes and melodic phrase definitions |
| [src/lib/synth/drums.ts](src/lib/synth/drums.ts) | Drum voices, kits, and pattern helpers |
| [src/lib/synth/notes.ts](src/lib/synth/notes.ts) | Note conversion and computer-key mappings |
| [src/routes/index.tsx](src/routes/index.tsx) | Studio route |
| [scripts](scripts) | Environment, preview, build-support, and browser-check tooling |

The repository includes app-builder auth and database scaffolding. The current studio route renders the instrument directly and uses client-side synth state; the presence of those helpers does not imply studio accounts, cloud saves, or collaboration.

## Development and verification

Read [AGENTS.md](AGENTS.md) before changing the app. Node.js 22 is the documented workspace runtime. Install the lockfile dependencies with `npm ci`.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server on port 8080, via the environment wrapper |
| `npm run typecheck` | TypeScript checks |
| `npm run lint` | ESLint |
| `npm test` | Script and supporting app-data/auth unit tests |
| `npm run build` | Production build, followed by the migration script |
| `npm run preview:restart` | Restart the built-output preview on port 8081 |
| `npm run preview:stop` | Stop that preview |

The build's migration step skips without `DATABASE_URL`; do not point local verification at a production database. Use the npm scripts for Vite entry points, as they preserve environment handling.

The repository's app-change quality gate calls for a successful build and typecheck, plus visible desktop/mobile rendering and a clean console on both the dev server and built output. Its browser smoke tool is [scripts/browser-smoke.mjs](scripts/browser-smoke.mjs); the built-output check uses the dev verdict as its baseline. Consult the checked-in instructions for the full startup and screenshot workflow. These are verification instructions, not a claim that a particular revision has passed them.

Local browser captures and preview process checks work on macOS and Linux. Read the [local tooling guide](docs/LOCAL_TOOLING.md) for checkout-scoped screenshot paths, preview ownership checks, and clean-clone test fixtures.
