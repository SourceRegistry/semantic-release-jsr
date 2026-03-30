import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
import test from "node:test";
import getConfig from "../lib/get-config.js";
import prepare from "../lib/prepare.js";

function makeTempDir() {
  return mkdtemp(path.join(tmpdir(), "semantic-release-jsr-"));
}

test("Update version in jsr.json", async () => {
  const cwd = await makeTempDir();
  const configPath = path.resolve(cwd, "jsr.json");
  await writeFile(configPath, JSON.stringify({ name: "@scope/pkg", version: "0.0.0" }));

  const config = await getConfig({}, { cwd });
  await prepare(config, { nextRelease: { version: "1.2.3" }, logger: { log() {} } });

  assert.equal(JSON.parse(await readFile(configPath, "utf8")).version, "1.2.3");
});

test("Preserve comments and line endings in deno.jsonc", async () => {
  const cwd = await makeTempDir();
  const configPath = path.resolve(cwd, "deno.jsonc");
  await mkdir(path.dirname(configPath), { recursive: true });
  await writeFile(
    configPath,
    `{\r\n    // package metadata\r\n    "name": "@scope/pkg",\r\n    "version": "0.0.0"\r\n}\r\n`
  );

  const config = await getConfig({}, { cwd });
  await prepare(config, { nextRelease: { version: "1.2.3" }, logger: { log() {} } });

  assert.equal(
    await readFile(configPath, "utf8"),
    `{\r\n    // package metadata\r\n    "name": "@scope/pkg",\r\n    "version": "1.2.3"\r\n}\r\n`
  );
});
