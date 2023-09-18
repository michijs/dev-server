import fs from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { buildSync as esbuild } from "esbuild";
import { assetsSizes } from "../constants.js";
import {
  DefaultEnvironment,
  ServerConfig,
  ServerConfigFactory,
} from "../types.js";

let config: ServerConfig = {};
if (fs.existsSync("michi.config.ts")) {
  esbuild({
    bundle: true,
    entryPoints: [
      {
        in: "michi.config.ts",
        out: "michi.config",
      },
    ],
    outExtension: { ".js": ".cjs" },
    outdir: dirname(fileURLToPath(import.meta.url)),
    format: "cjs",
    platform: "node",
    logLevel: "error",
    target: ["node16"],
  });
  // @ts-ignore
  const michiConfig = await import("./michi.config.cjs");
  config = (michiConfig.default.default as ServerConfigFactory)({
    assetsSizes,
    environment: process.env.NODE_ENV as DefaultEnvironment,
  });
}
export const userConfig = config;
