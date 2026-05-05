#!/usr/bin/env bun
/**
 * Compiles the dev-server into standalone Bun executables for the supported
 * targets and emits a `.d.ts` next to each binary so consumers still get type
 * support for the public API surface.
 */
import {
  rmSync,
  mkdirSync,
  existsSync,
  chmodSync,
  copyFileSync,
} from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dir, "..");
const outDir = resolve(root, "bin");

const targets = [
  { target: "bun-linux-x64", outfile: "michi-server-linux-x64" },
  { target: "bun-linux-arm64", outfile: "michi-server-linux-arm64" },
  { target: "bun-darwin-x64", outfile: "michi-server-darwin-x64" },
  { target: "bun-darwin-arm64", outfile: "michi-server-darwin-arm64" },
  { target: "bun-windows-x64", outfile: "michi-server-windows-x64.exe" },
] as const;

if (existsSync(outDir)) rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

console.log("Generating type declarations...");
const tsc = Bun.spawnSync({
  cmd: ["bun", "x", "tsc", "--emitDeclarationOnly", "--outDir", outDir],
  cwd: root,
  stdout: "inherit",
  stderr: "inherit",
});
if (tsc.exitCode !== 0) process.exit(tsc.exitCode ?? 1);

for (const { target, outfile } of targets) {
  console.log(`Compiling ${target} -> ${outfile}`);
  const result = await Bun.build({
    entrypoints: [resolve(root, "src/index.ts")],
    compile: {
      target: target as Bun.Build.CompileTarget,
      outfile: resolve(outDir, outfile),
    },
    minify: true,
    sourcemap: "linked",
    // Optional/runtime dependencies that must remain unbundled.
    external: [
      // User project file generated at runtime by the dev-server itself.
      "./michi.config.cjs",
      // Playwright optional integrations we don't ship.
      "electron",
      "chromium-bidi",
      "chromium-bidi/*",
    ],
  });
  if (!result.success) {
    for (const log of result.logs) console.error(log);
    process.exit(1);
  }
  if (!outfile.endsWith(".exe")) {
    try {
      chmodSync(resolve(outDir, outfile), 0o755);
    } catch {}
  }
}

console.log("Copying launcher...");
copyFileSync(
  resolve(import.meta.dir, "launcher.mjs"),
  resolve(outDir, "michi-server.mjs"),
);
chmodSync(resolve(outDir, "michi-server.mjs"), 0o755);

console.log("Done.");
