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
  "plugins": ["@semantic-release/commit-analyzer", "@semantic-release/release-notes-generator", "semantic-release-jsr"]
}
```

## Requirements

- A JSR package config file: `jsr.json`, `deno.json`, or `deno.jsonc`
- A non-empty `name` property in that config file
- Authentication that works with the `jsr` CLI

JSR supports GitHub Actions OIDC for linked repositories. If you use token-based auth instead, configure the environment expected by the `jsr` CLI in your CI job.

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

| Option       | Description                                                  | Default                                                     |
| ------------ | ------------------------------------------------------------ | ----------------------------------------------------------- |
| `pkgRoot`    | Directory containing the JSR config file.                    | `.`                                                         |
| `configFile` | Explicit config file path relative to `pkgRoot` or absolute. | Auto-detect `jsr.json`, then `deno.json`, then `deno.jsonc` |

## Example

```json
{
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    [
      "semantic-release-jsr",
      {
        "pkgRoot": "dist",
        "configFile": "deno.jsonc"
      }
    ]
  ]
}
```
