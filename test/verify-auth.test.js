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

let verifyAuth;

test.before(async () => {
  ({ default: verifyAuth } = await import("../lib/verify-auth.js"));
});

test("Run jsr publish dry-run", async () => {
  const config = { basePath: "C:\\repo\\dist" };
  const context = {
    env: { JSR_TOKEN: "token" },
    stdout: createNullWritable(),
    stderr: createNullWritable(),
  };
  const calls = [];
  const runCommand = async (...args) => {
    calls.push(args);
  };

  await assert.doesNotReject(verifyAuth(config, context, runCommand));
  assert.deepEqual(calls, [
    [
      "jsr",
      ["publish", "--dry-run"],
      { cwd: config.basePath, env: context.env, stdout: context.stdout, stderr: context.stderr },
    ],
  ]);
});

test("Wrap jsr publish dry-run failures", async () => {
  const config = { basePath: "C:\\repo" };
  const context = {
    env: {},
    stdout: createNullWritable(),
    stderr: createNullWritable(),
  };
  const error = new Error("dry-run failed");
  const runCommand = async () => {
    throw error;
  };

  const wrappedError = await verifyAuth(config, context, runCommand).catch((caughtError) => caughtError);

  assert.equal(wrappedError.errors[0].code, "EINVALIDJSRDRYRUN");
});
