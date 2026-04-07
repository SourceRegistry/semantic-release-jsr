import assert from "node:assert/strict";
import { Writable } from "node:stream";
import test from "node:test";

function createNullWritable() {
  return new Writable({
    write(_chunk, _encoding, callback) {
      callback();
    },
  });
}

let publish;

test.before(async () => {
  ({ default: publish } = await import("../lib/publish.js"));
});

test("Run jsr publish and return release info", async () => {
  const config = { basePath: "C:\\repo\\dist", config: { name: "@scope/pkg" } };
  const context = {
    env: { JSR_TOKEN: "token" },
    stdout: createNullWritable(),
    stderr: createNullWritable(),
    nextRelease: { version: "1.2.3" },
    logger: { log() {} },
  };
  const calls = [];
  const runCommand = async (...args) => {
    calls.push(args);
  };

  const result = await publish(config, context, runCommand);

  assert.deepEqual(result, { name: "JSR package", url: "https://jsr.io/@scope/pkg" });
  assert.deepEqual(calls, [
    ["jsr", ["publish"], { cwd: config.basePath, env: context.env, stdout: context.stdout, stderr: context.stderr }],
  ]);
});

test("Pass token to jsr publish when configured", async () => {
  const config = { basePath: "C:\\repo\\dist", config: { name: "@scope/pkg" }, token: "token" };
  const context = {
    env: { JSR_TOKEN: "token" },
    stdout: createNullWritable(),
    stderr: createNullWritable(),
    nextRelease: { version: "1.2.3" },
    logger: { log() {} },
  };
  const calls = [];
  const runCommand = async (...args) => {
    calls.push(args);
  };

  await publish(config, context, runCommand);

  assert.deepEqual(calls, [
    [
      "jsr",
      ["publish", "--token", "token"],
      { cwd: config.basePath, env: context.env, stdout: context.stdout, stderr: context.stderr },
    ],
  ]);
});

test("Pass allowSlowTypes to jsr publish when configured", async () => {
  const config = { basePath: "C:\\repo\\dist", config: { name: "@scope/pkg" }, allowSlowTypes: true };
  const context = {
    env: {},
    stdout: createNullWritable(),
    stderr: createNullWritable(),
    nextRelease: { version: "1.2.3" },
    logger: { log() {} },
  };
  const calls = [];
  const runCommand = async (...args) => {
    calls.push(args);
  };

  await publish(config, context, runCommand);

  assert.deepEqual(calls, [
    [
      "jsr",
      ["publish", "--allow-slow-types"],
      { cwd: config.basePath, env: context.env, stdout: context.stdout, stderr: context.stderr },
    ],
  ]);
});

test("Wrap jsr publish failures", async () => {
  const config = { basePath: "C:\\repo", config: { name: "@scope/pkg" } };
  const context = {
    env: {},
    stdout: createNullWritable(),
    stderr: createNullWritable(),
    nextRelease: { version: "1.2.3" },
    logger: { log() {} },
  };
  const error = new Error("publish failed");
  const runCommand = async () => {
    throw error;
  };

  const wrappedError = await publish(config, context, runCommand).catch((caughtError) => caughtError);

  assert.equal(wrappedError.errors[0].code, "EINVALIDJSRPUBLISH");
});
