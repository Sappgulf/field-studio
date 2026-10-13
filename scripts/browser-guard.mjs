/**
 * Target checks shared by the Playwright capture scripts.
 *
 * Both run Chromium with `--no-sandbox` as root and take their URL and output
 * path from argv, so unchecked they will render `file:///root/.grok/auth.json`
 * into a PNG the agent can read, and write it anywhere.
 */
import { resolve, sep, dirname, join } from "node:path";
import { existsSync, realpathSync } from "node:fs";
import { projectRoot } from "./with-app-env.mjs";

export function captureDirectory() {
  const root = realpathSync(projectRoot());
  const captures = join(root, "screenshots");
  if (existsSync(captures) && realpathSync(captures) !== captures) {
    fail("capture directory must remain inside this checkout, not a symlink");
  }
  return captures;
}

const LOOPBACK_HOSTNAMES = new Set(["127.0.0.1", "localhost", "::1", "[::1]"]);

/** http/https loopback only, else exit 1. `BROWSER_ALLOW_EXTERNAL_HOST=1` opts out. */
export function checkedUrl(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    fail(`not a valid URL: ${url}`);
  }
  // Rules out file:, data:, chrome:, view-source:.
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    fail(`only http/https URLs are allowed, got ${parsed.protocol} in ${url}`);
  }
  if (!LOOPBACK_HOSTNAMES.has(parsed.hostname) && process.env.BROWSER_ALLOW_EXTERNAL_HOST !== "1") {
    fail(
      `${parsed.hostname} is not a loopback host; these scripts screenshot the ` +
        `local dev server. Set BROWSER_ALLOW_EXTERNAL_HOST=1 to override.`,
    );
  }
  return url;
}

/** Absolute `target` if it is strictly inside `allowedDirs`, else exit 1. */
export function checkedOutputPath(target, allowedDirs, label = "screenshot") {
  // Resolve first so `..` cannot slip past the prefix check.
  const abs = resolve(target);
  const allowed = allowedDirs.some((dir) => abs.startsWith(dir.endsWith(sep) ? dir : dir + sep));
  if (!allowed) {
    fail(`${label} path must be under ${allowedDirs.join(" or ")}, got ${abs}`);
  }
  // Verify the nearest existing ancestor too: a symlink cannot redirect an
  // otherwise valid capture path outside the checkout.
  let ancestor = abs;
  while (!existsSync(ancestor)) ancestor = dirname(ancestor);
  const actual = realpathSync(ancestor);
  const safe = allowedDirs.some((dir) => {
    let existing = resolve(dir);
    while (!existsSync(existing)) existing = dirname(existing);
    const canonical = resolve(realpathSync(existing), resolve(dir).slice(existing.length).replace(/^\//, ""));
    return actual === canonical || actual.startsWith(canonical + sep) ||
      (ancestor === existing && canonical.startsWith(actual + sep));
  });
  if (!safe) fail(`${label} path resolves outside ${allowedDirs.join(" or ")}: ${abs}`);
  return abs;
}

function fail(message) {
  console.error(JSON.stringify({ ok: false, error: message }, null, 2));
  process.exit(1);
}
