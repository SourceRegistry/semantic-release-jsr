import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
import test from "node:test";
import getConfig from "../lib/get-config.js";

function makeTempDir() {
  return mkdtemp(path.join(tmpdir(), "semantic-release-jsr-"));
}

test("Auto-detect jsr.json", async () => {
  const cwd = await makeTempDir();
  await writeFile(path.resolve(cwd, "jsr.json"), JSON.stringify({ name: "@scope/pkg", version: "0.0.0" }));

  const result = await getConfig({}, { cwd });

  assert.equal(result.config.name, "@scope/pkg");
  assert.equal(result.configPath, path.resolve(cwd, "jsr.json"));
});

test("Read deno.jsonc from pkgRoot", async () => {
  const cwd = await makeTempDir();
  const configPath = path.resolve(cwd, "dist/deno.jsonc");
  await mkdir(path.dirname(configPath), { recursive: true });
  await writeFile(configPath, `{\n  // package metadata\n  "name": "@scope/pkg",\n  "version": "0.0.0"\n}\n`);

  const result = await getConfig({ pkgRoot: "dist", configFile: "deno.jsonc" }, { cwd });

  assert.equal(result.config.name, "@scope/pkg");
  assert.equal(result.configPath, configPath);
});

test("Read token from configured environment variable", async () => {
  const cwd = await makeTempDir();
  await writeFile(path.resolve(cwd, "jsr.json"), JSON.stringify({ name: "@scope/pkg", version: "0.0.0" }));

  const result = await getConfig({ tokenEnvVar: "JSR_TOKEN" }, { cwd, env: { JSR_TOKEN: "token" } });

  assert.equal(result.token, "token");
});

test("Preserve allowSlowTypes in resolved config", async () => {
  const cwd = await makeTempDir();
  await writeFile(path.resolve(cwd, "jsr.json"), JSON.stringify({ name: "@scope/pkg", version: "0.0.0" }));

  const result = await getConfig({ allowSlowTypes: true }, { cwd });

  assert.equal(result.allowSlowTypes, true);
});

test("Throw when config file is missing", async () => {
  const cwd = await makeTempDir();
  const error = await getConfig({}, { cwd }).catch((caughtError) => caughtError);

  assert.equal(error.errors[0].name, "SemanticReleaseError");
  assert.equal(error.errors[0].code, "ENOJSRCONFIG");
});

test("Throw when package name is missing", async () => {
  const cwd = await makeTempDir();
  await writeFile(path.resolve(cwd, "jsr.json"), JSON.stringify({ version: "0.0.0" }));

  const error = await getConfig({}, { cwd }).catch((caughtError) => caughtError);

  assert.equal(error.errors[0].name, "SemanticReleaseError");
  assert.equal(error.errors[0].code, "EINVALIDJSRNAME");
});
