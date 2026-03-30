import getError from "./get-error.js";

const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;

const VALIDATORS = {
  pkgRoot: isNonEmptyString,
  configFile: isNonEmptyString,
};

export default function ({ pkgRoot, configFile }) {
  return Object.entries({ pkgRoot, configFile }).reduce(
    (errors, [option, value]) =>
      value != null && !VALIDATORS[option](value)
        ? [...errors, getError(`EINVALID${option.toUpperCase()}`, { [option]: value })]
        : errors,
    []
  );
}
