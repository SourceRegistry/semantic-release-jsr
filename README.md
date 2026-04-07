# semantic-release-jsr

[semantic-release](https://github.com/semantic-release/semantic-release) plugin to publish a package to [JSR](https://jsr.io).

| Step               | Description                                                                       |
| ------------------ | --------------------------------------------------------------------------------- |
| `verifyConditions` | Validates options, locates the JSR config file, and runs `jsr publish --dry-run`. |
| `prepare`          | Writes the next release version into `jsr.json`, `deno.json`, or `deno.jsonc`.    |
| `publish`          | Runs `jsr publish` from the package directory.                                    |

## Install

```bash
npm install --save-dev semantic-release @sourceregistry/semantic-release-jsr
```

## Usage

```json
{
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@sourceregistry/semantic-release-jsr"
  ]
}
```

## Requirements

- A JSR package config file: `jsr.json`, `deno.json`, or `deno.jsonc`
- A non-empty `name` property in that config file
- Authentication that works with the `jsr` CLI

This plugin invokes `jsr publish`, not `deno publish` directly. That means plugin options only cover flags currently exposed by the JSR CLI.

JSR supports GitHub Actions OIDC for linked repositories. If you use token-based auth instead, either configure the environment expected by the `jsr` CLI in your CI job or set `tokenEnvVar` so the plugin passes `--token` explicitly.

## GitHub Actions

Example release job for a project that uses this plugin:

```yaml
name: Release

on:
  push:
    branches:
      - main

permissions:
  contents: write
  id-token: write
  issues: write
  pull-requests: write

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: 24
          cache: npm
      - run: npm clean-install
      - run: npx semantic-release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

If your JSR package uses token-based auth instead of OIDC, also provide the environment variable expected by the `jsr` CLI in that job.

## Options

| Option           | Description                                                                          | Default                                                     |
| ---------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| `pkgRoot`        | Directory containing the JSR config file.                                            | `.`                                                         |
| `configFile`     | Explicit config file path relative to `pkgRoot` or absolute.                         | Auto-detect `jsr.json`, then `deno.json`, then `deno.jsonc` |
| `tokenEnvVar`    | Environment variable name whose value should be passed to `jsr publish --token ...`. | Unset                                                       |
| `allowSlowTypes` | Whether to pass `--allow-slow-types` to `jsr publish` and `jsr publish --dry-run`.   | `false`                                                     |

`allowDirty` is intentionally not supported at this time. While `deno publish` documents `--allow-dirty`, the current `jsr publish` CLI does not expose that flag.

## Example

```json
{
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    [
      "@sourceregistry/semantic-release-jsr",
      {
        "pkgRoot": "dist",
        "configFile": "deno.jsonc",
        "tokenEnvVar": "JSR_TOKEN",
        "allowSlowTypes": true
      }
    ]
  ]
}
```

## GitLab CI

In GitLab CI, the plugin forwards the job environment to the `jsr` CLI. That means Alpine users can point JSR at a working Deno binary with `DENO_BIN_PATH`, and token-based auth can be passed explicitly with `tokenEnvVar`.

```yaml
release:
  image: node:22-alpine
  script:
    - apk add --no-cache deno
    - npx semantic-release
  variables:
    DENO_BIN_PATH: /usr/bin/deno
    JSR_TOKEN: $JSR_TOKEN
```
