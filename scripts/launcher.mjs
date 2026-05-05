#!/usr/bin/env node
// Thin launcher that delegates to the compiled Bun executable matching the
// host platform/arch. Distributed alongside the per-platform binaries so that
// `npx michi-server` / `bunx michi-server` Just Work without requiring users
// to install Bun globally.
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const platformMap = {
  "linux-x64": "michi-server-linux-x64",
  "linux-arm64": "michi-server-linux-arm64",
  "darwin-x64": "michi-server-darwin-x64",
  "darwin-arm64": "michi-server-darwin-arm64",
  "win32-x64": "michi-server-windows-x64.exe",
};

const key = `${process.platform}-${process.arch}`;
const binName = platformMap[key];

if (!binName) {
  console.error(
    `michi-server: no prebuilt executable for ${key}. Supported: ${Object.keys(
      platformMap,
    ).join(", ")}`,
  );
  process.exit(1);
}

const binPath = resolve(__dirname, binName);
if (!existsSync(binPath)) {
  console.error(`michi-server: executable not found at ${binPath}`);
  process.exit(1);
}

const child = spawn(binPath, process.argv.slice(2), {
  stdio: "inherit",
  env: process.env,
});
child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 0);
});
