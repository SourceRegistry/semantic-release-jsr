import AggregateError from "aggregate-error";
import getConfig from "./lib/get-config.js";
import publishJsr from "./lib/publish.js";
import prepareJsr from "./lib/prepare.js";
import verifyJsrPublish from "./lib/verify-auth.js";
import verifyConfig from "./lib/verify-config.js";

let verified = false;
let prepared = false;

async function loadConfig(pluginConfig, context, errors) {
  try {
    return await getConfig(pluginConfig, context);
  } catch (error) {
    errors.push(...error.errors);
    return undefined;
  }
}

export async function verifyConditions(pluginConfig, context) {
  const errors = verifyConfig(pluginConfig);
  const config = await loadConfig(pluginConfig, context, errors);

  if (config) {
    try {
      await verifyJsrPublish(config, context);
    } catch (error) {
      errors.push(...error.errors);
    }
  }

  if (errors.length > 0) {
    throw new AggregateError(errors);
  }

  verified = true;
}

export async function prepare(pluginConfig, context) {
  const errors = verified ? [] : verifyConfig(pluginConfig);
  const config = await loadConfig(pluginConfig, context, errors);

  if (config && !verified) {
    try {
      await verifyJsrPublish(config, context);
    } catch (error) {
      errors.push(...error.errors);
    }
  }

  if (errors.length > 0) {
    throw new AggregateError(errors);
  }

  await prepareJsr(config, context);
  prepared = true;
}

export async function publish(pluginConfig, context) {
  const errors = verified ? [] : verifyConfig(pluginConfig);
  const config = await loadConfig(pluginConfig, context, errors);

  if (config && !verified) {
    try {
      await verifyJsrPublish(config, context);
    } catch (error) {
      errors.push(...error.errors);
    }
  }

  if (errors.length > 0) {
    throw new AggregateError(errors);
  }

  if (!prepared) {
    await prepareJsr(config, context);
  }

  return publishJsr(config, context);
}
