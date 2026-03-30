import AggregateError from "aggregate-error";
import getError from "./get-error.js";
import getReleaseInfo from "./get-release-info.js";
import runCommand from "./run-command.js";

export default async function publish(config, context, runCommandImpl = runCommand) {
  const {
    env,
    stdout,
    stderr,
    nextRelease: { version },
    logger,
  } = context;

  logger.log("Publishing version %s to JSR from %s", version, config.basePath);

  try {
    await runCommandImpl("jsr", ["publish"], { cwd: config.basePath, env, stdout, stderr });
  } catch (error) {
    throw new AggregateError([getError("EINVALIDJSRPUBLISH", { details: error.message })]);
  }

  logger.log("Published %s@%s to JSR", config.config.name, version);
  return getReleaseInfo(config.config);
}
