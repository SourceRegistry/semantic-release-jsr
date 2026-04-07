import getError from "./get-error.js";

const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
const isBoolean = (value) => typeof value === "boolean";

const VALIDATORS = {
  pkgRoot: isNonEmptyString,
  configFile: isNonEmptyString,
  tokenEnvVar: isNonEmptyString,
  allowSlowTypes: isBoolean,
};

export default function ({ pkgRoot, configFile, tokenEnvVar, allowSlowTypes }) {
  return Object.entries({ pkgRoot, configFile, tokenEnvVar, allowSlowTypes }).reduce(
    (errors, [option, value]) =>
      value != null && !VALIDATORS[option](value)
        ? [...errors, getError(`EINVALID${option.toUpperCase()}`, { [option]: value })]
        : errors,
    []
  );
}
