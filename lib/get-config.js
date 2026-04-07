import { access, readFile } from "node:fs/promises";
import path from "node:path";
import AggregateError from "aggregate-error";
import { parse, printParseErrorCode } from "jsonc-parser";
import getError from "./get-error.js";
import { DEFAULT_CONFIG_FILES } from "./definitions/constants.js";

function resolveConfigPath(basePath, configFile) {
  return path.isAbsolute(configFile) ? configFile : path.resolve(basePath, configFile);
}

async function findConfigFile(basePath, configFile) {
  if (configFile) {
    return resolveConfigPath(basePath, configFile);
  }

  for (const candidate of DEFAULT_CONFIG_FILES) {
    const candidatePath = path.resolve(basePath, candidate);

    try {
      await access(candidatePath);
      return candidatePath;
    } catch {}
  }

  return undefined;
}

export default async function getConfig({ pkgRoot, configFile, tokenEnvVar, allowSlowTypes }, { cwd, env }) {
  const basePath = pkgRoot ? path.resolve(cwd, String(pkgRoot)) : cwd;
  const configPath = await findConfigFile(basePath, configFile);

  if (!configPath) {
    throw new AggregateError([getError("ENOJSRCONFIG", { basePath, configFile })]);
  }

  try {
    const source = await readFile(configPath, "utf8");
    const parseErrors = [];
    const config = parse(source, parseErrors, { allowTrailingComma: true, disallowComments: false });

    if (parseErrors.length > 0) {
      throw getError("EINVALIDJSRCONFIG", {
        configPath,
        reason: printParseErrorCode(parseErrors[0].error),
      });
    }

    if (typeof config?.name !== "string" || config.name.trim().length === 0) {
      throw getError("EINVALIDJSRNAME", { configPath });
    }

    return {
      basePath,
      configPath,
      config,
      source,
      token: tokenEnvVar ? env?.[tokenEnvVar] : undefined,
      allowSlowTypes,
    };
  } catch (error) {
    if (error.name === "SemanticReleaseError") {
      throw new AggregateError([error]);
    }

    if (error.code === "ENOENT") {
      throw new AggregateError([getError("ENOJSRCONFIG", { basePath, configFile })]);
    }

    throw new AggregateError([error]);
  }
}
