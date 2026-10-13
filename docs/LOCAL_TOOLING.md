# Local validation tooling

Use Node 22 and the npm entry points in this checkout. `sh startup.sh` starts
`npm run dev` from the script's own directory; logs and the owned npm PID are
stored under `.grok/`. A clean clone does not contain platform-injected
`.grok/app-env.json`: the wrapper preserves its existing auth-on default when
that file is absent. Tests provide explicit fixtures for both flag states.
No auth setting is changed by this guide or by the portability fixes.

## Browser captures and preview

`node scripts/browser-smoke.mjs` audits desktop and mobile rendering and
writes into this checkout's `screenshots/` directory. Loopback URL restrictions,
traversal rejection, baseline separation and symlink checks remain enforced.
The built output uses the dev verdict as its baseline:

```sh
npm run build
npm run typecheck
node scripts/browser-smoke.mjs
npm run preview:restart
node scripts/browser-smoke.mjs http://127.0.0.1:8081/ screenshots/built.png --baseline screenshots/app-builder-preview.json
npm run preview:stop
```

`preview:restart` uses Linux `/proc` or macOS `lsof` and `ps` to inspect owners.
It only stops a preview whose command and working directory belong to this
checkout, or its verified process group. A foreign or unattributed listener
blocks the restart. Never terminate another project's listener to make room.
Production `DATABASE_URL` must not be used for local validation. With that
variable absent, the build's database migration entry point skips.

## Brand-asset pass:

Follow AGENTS.md's existing independent brand-pass contract. No `wait_tasks`,
never `get_task_output`: keep app work moving and allow the pass to report its
own completion. Its freshness marker is `.grok/og-pending` in this checkout
(`/workspace/.grok/og-pending` in the platform sandbox). It expires after
10 minutes. Refresh it only while the pass is actually working; a stale marker
never excuses missing assets. Existing assets are validated, not regenerated,
by ordinary local verification.

Self-check a completed pass against the current checkout:

```sh
node scripts/brand-check.mjs --game
```

## Atomic asset hand-over

Stage complete files under `.grok/`, outside `public/`, on the same filesystem
as the target. Validate dimensions and content before the atomic rename.
Never leave a temporary file in `public/`, since the build ships it verbatim.
The script resolves relative paths against this repository, not the caller's
working directory. Linux sandbox examples for the three supported targets:

```sh
node scripts/write-atomic.mjs /workspace/.grok/og.staged.jpg /workspace/public/og.jpg
node scripts/write-atomic.mjs /workspace/.grok/banner.staged.jpg /workspace/public/x-banner.jpg
node scripts/write-atomic.mjs /workspace/.grok/site.staged.json /workspace/src/lib/og/site.json
```

On another host use the corresponding checkout paths or relative `.grok/`
paths. Missing staged files and cross-filesystem renames fail without replacing
the current target. The unit tests validate these refusal paths and every
command documented above.
