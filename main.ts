// Deadpan Forecasts for Cities That Do Not Exist — make.fun bounty
// Writes a single deadpan weather forecast to /output/entry.txt
// (or $MAKEFUN_OUTPUT_DIR). The forecast: in Brindlewick the rain
// falls upward, and the forecaster reports it like any other advisory.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const LINE =
  "In Brindlewick, rain falls upward at 14 millimetres an hour today; residents are advised to keep umbrellas closed and hats firmly fastened until Thursday.";

function fail(message: string): never {
  console.error(`error: ${message}`);
  process.exit(1);
}

function validate(line: string): void {
  if (line.length < 1 || line.length > 160) {
    fail(`line must be 1-160 characters, got ${line.length}`);
  }
  // The gate counts characters, but a non-ASCII line could pass the
  // character check while the file is longer in bytes; cap both.
  if (Buffer.byteLength(line, "utf8") > 160) {
    fail(`line must be at most 160 bytes, got ${Buffer.byteLength(line, "utf8")}`);
  }
  if (line !== line.trim()) {
    fail("line must not have leading or trailing whitespace");
  }
  if (/[\r\n]/.test(line)) {
    fail("line must be a single line");
  }
  for (const ch of line) {
    if (ch.codePointAt(0)! < 0x20 || ch.codePointAt(0) === 0x7f) {
      fail("line must not contain control characters");
    }
  }
}

function main(): void {
  validate(LINE);
  const outDir = (process.env.MAKEFUN_OUTPUT_DIR || "").trim() || "/output";
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "entry.txt");
  writeFileSync(outPath, LINE, "utf8");
  const readBack = readFileSync(outPath, "utf8");
  if (readBack !== LINE) {
    fail("read-back mismatch: entry.txt bytes differ from the line");
  }
  validate(readBack);
  if (Buffer.byteLength(readBack, "utf8") !== Buffer.byteLength(LINE, "utf8")) {
    fail("read-back byte length differs from the line");
  }
  console.log(`wrote ${LINE.length} characters to ${outPath}`);
  console.log(LINE);
}

main();
