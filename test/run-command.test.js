import assert from "node:assert/strict";
import { Writable } from "node:stream";
import test from "node:test";
import runCommand from "../lib/run-command.js";

function createNullWritable() {
  return new Writable({
    write(_chunk, _encoding, callback) {
      callback();
    },
  });
}

function createContext() {
  return {
    cwd: process.cwd(),
    env: process.env,
    stdout: createNullWritable(),
    stderr: createNullWritable(),
  };
}

function exitCommand(code) {
  if (process.platform === "win32") {
    return {
      command: "cmd",
      args: ["/c", "exit", String(code)],
    };
  }

  return {
    command: "sh",
    args: ["-c", `exit ${code}`],
  };
}

test("runCommand resolves when the child exits with code 0", async () => {
  const { command, args } = exitCommand(0);

  await assert.doesNotReject(runCommand(command, args, createContext()));
});

test("runCommand rejects when the child exits with a non-zero code", async () => {
  const { command, args } = exitCommand(3);
  const error = await runCommand(command, args, createContext()).catch((caughtError) => caughtError);

  assert.match(error.message, /Command failed with exit code 3:/);
});

test("runCommand rejects when the child emits an error", async () => {
  const error = await runCommand("this-command-should-not-exist", [], createContext()).catch(
    (caughtError) => caughtError
  );

  assert.ok(error instanceof Error);
  assert.ok(error.message.length > 0);
});
