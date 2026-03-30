import assert from "node:assert/strict";
import test from "node:test";
import verify from "../lib/verify-config.js";

test("Verify valid options", () => {
  assert.deepEqual(verify({ pkgRoot: "dist", configFile: "deno.jsonc" }), []);
});

test("Return an error for invalid pkgRoot", () => {
  const [error] = verify({ pkgRoot: 42 });

  assert.equal(error.name, "SemanticReleaseError");
  assert.equal(error.code, "EINVALIDPKGROOT");
});

test("Return an error for invalid configFile", () => {
  const [error] = verify({ configFile: 42 });

  assert.equal(error.name, "SemanticReleaseError");
  assert.equal(error.code, "EINVALIDCONFIGFILE");
});
