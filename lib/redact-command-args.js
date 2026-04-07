export default function redactCommandArgs(args) {
  const redactedArgs = [];

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    redactedArgs.push(arg);

    if (arg === "--token" && index + 1 < args.length) {
      redactedArgs.push("[REDACTED]");
      index += 1;
    }
  }

  return redactedArgs;
}
