export default function getPublishArgs(config, { dryRun = false } = {}) {
  const args = ["publish"];

  if (dryRun) {
    args.push("--dry-run");
  }

  if (config.allowSlowTypes) {
    args.push("--allow-slow-types");
  }

  if (config.token) {
    args.push("--token", config.token);
  }

  return args;
}
