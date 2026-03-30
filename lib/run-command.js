import { spawn } from "node:child_process";

function getErrorDetails(error, command, args) {
  if (error?.message) {
    return error.message;
  }

  return `Command failed: ${command} ${args.join(" ")}`;
}

export default function runCommand(command, args, { cwd, env, stdout, stderr }) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env,
      stdio: ["ignore", "pipe", "pipe"],
      shell: process.platform === "win32",
    });

    child.stdout?.pipe(stdout, { end: false });
    child.stderr?.pipe(stderr, { end: false });

    child.on("error", (error) => {
      reject(new Error(getErrorDetails(error, command, args), { cause: error }));
    });

    child.on("close", (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }

      const detail = signal
        ? `Command failed with signal ${signal}: ${command} ${args.join(" ")}`
        : `Command failed with exit code ${code}: ${command} ${args.join(" ")}`;

      reject(new Error(detail));
    });
  });
}
