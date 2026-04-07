import AggregateError from "aggregate-error";
import getError from "./get-error.js";
import getPublishArgs from "./get-publish-args.js";
import runCommand from "./run-command.js";
export default async function verifyAuth(config, context, runCommandImpl = runCommand) {
  const { env, stdout, stderr } = context;

  try {
    await runCommandImpl("jsr", getPublishArgs(config, { dryRun: true }), {
      cwd: config.basePath,
      env,
      stdout,
      stderr,
    });
  } catch (error) {
    throw new AggregateError([getError("EINVALIDJSRDRYRUN", { details: error.message })]);
  }
}
