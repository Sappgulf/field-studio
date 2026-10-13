import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, realpathSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import * as guard from "./browser-guard.mjs";

const moduleUrl = new URL("./browser-guard.mjs", import.meta.url).href;
function checkPath(target, root) {
  return spawnSync(process.execPath, ["--input-type=module", "-e",
    `import { checkedOutputPath } from ${JSON.stringify(moduleUrl)}; checkedOutputPath(process.argv[1], [process.argv[2]]);`,
    target, root], { encoding: "utf8" });
}

test("capture directory belongs to the current checkout, not a fixed Linux path", () => {
  assert.equal(typeof guard.captureDirectory, "function");
  assert.equal(guard.captureDirectory(), join(realpathSync(new URL("..", import.meta.url)), "screenshots"));
});

test("capture paths reject traversal, sibling prefixes and symlink escapes", () => {
  const base = mkdtempSync(join(tmpdir(), "field-guard-"));
  try {
    const root = join(base, "screenshots");
    mkdirSync(root); mkdirSync(join(base, "outside"));
    symlinkSync(join(base, "outside"), join(root, "escape"));
    assert.equal(checkPath(join(root, "nested", "ok.png"), root).status, 0);
    for (const target of [join(root, "..", "outside", "bad.png"), `${root}-other/bad.png`, join(root, "escape", "bad.png")]) {
      assert.equal(checkPath(target, root).status, 1, target);
    }
  } finally { rmSync(base, { recursive: true, force: true }); }
});

test("browser URL guard rejects file and external URLs", () => {
  for (const url of ["file:///etc/passwd", "https://example.com/"]) {
    const result = spawnSync(process.execPath, ["--input-type=module", "-e",
      `import { checkedUrl } from ${JSON.stringify(moduleUrl)}; checkedUrl(process.argv[1]);`, url],
      { env: { ...process.env, BROWSER_ALLOW_EXTERNAL_HOST: "" }, encoding: "utf8" });
    assert.equal(result.status, 1, url);
  }
});
