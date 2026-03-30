import { writeFile } from "node:fs/promises";
import { applyEdits, modify } from "jsonc-parser";

function detectFormatting(source) {
  const indentMatch = source.match(/^[ \t]+(?="[^"]+":)/m);
  const indent = indentMatch?.[0] ?? "  ";

  return {
    insertSpaces: !indent.includes("\t"),
    tabSize: indent.includes("\t") ? 1 : indent.length,
    eol: source.includes("\r\n") ? "\r\n" : "\n",
  };
}

export default async function prepare(config, { nextRelease: { version }, logger }) {
  logger.log("Write version %s to %s", version, config.configPath);

  const edits = modify(config.source, ["version"], version, {
    formattingOptions: detectFormatting(config.source),
  });

  await writeFile(config.configPath, applyEdits(config.source, edits));
}
