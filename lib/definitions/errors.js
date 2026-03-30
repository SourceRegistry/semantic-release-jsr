import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { readPackageSync } from "read-pkg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = readPackageSync({ cwd: resolve(__dirname, "../../") });
const [homepage] = pkg.homepage.split("#");
const linkify = (file) => `${homepage}/blob/master/${file}`;

export function EINVALIDPKGROOT({ pkgRoot }) {
  return {
    message: "Invalid `pkgRoot` option.",
    details: `The [pkgRoot option](${linkify("README.md#options")}) option, if defined, must be a non-empty \`String\`.

Your configuration for the \`pkgRoot\` option is \`${pkgRoot}\`.`,
  };
}

export function EINVALIDCONFIGFILE({ configFile }) {
  return {
    message: "Invalid `configFile` option.",
    details: `The [configFile option](${linkify("README.md#options")}) option, if defined, must be a non-empty \`String\`.

Your configuration for the \`configFile\` option is \`${configFile}\`.`,
  };
}

export function ENOJSRCONFIG({ basePath, configFile }) {
  return {
    message: "Missing JSR configuration file.",
    details: `A JSR config file is required to publish a package.

The plugin looked in \`${basePath}\`${configFile ? ` for \`${configFile}\`` : " for `jsr.json`, `deno.json`, or `deno.jsonc`"}.

Please add a valid JSR config file or point the plugin at one with the \`configFile\` option.`,
  };
}

export function EINVALIDJSRCONFIG({ configPath, reason }) {
  return {
    message: "Invalid JSR configuration file.",
    details: `The JSR config file at \`${configPath}\` could not be parsed${reason ? `: ${reason}` : ""}.

Please make sure the file contains valid JSON or JSONC.`,
  };
}

export function EINVALIDJSRNAME({ configPath }) {
  return {
    message: "Missing or invalid JSR package name.",
    details: `The JSR config file at \`${configPath}\` must define a non-empty \`name\` property.

Please make sure the package name is present before publishing.`,
  };
}

export function EINVALIDJSRDRYRUN({ details }) {
  return {
    message: "JSR publish dry-run failed.",
    details: `The plugin runs \`jsr publish --dry-run\` during \`verifyConditions\` to validate the package and authentication context.

${details || "Review the command output above for the underlying JSR error."}`,
  };
}

export function EINVALIDJSRPUBLISH({ details }) {
  return {
    message: "JSR publish failed.",
    details: `The \`jsr publish\` command exited with an error.

${details || "Review the command output above for the underlying JSR error."}`,
  };
}
