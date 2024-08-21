import fs from "fs";
import type {
  DefaultEnvironment,
  ServerConfigFactory,
  ServerConfig,
} from "../types.js";
import { buildSync as esbuild } from "esbuild";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { defaultProductionConfig } from "../constants.js";

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
    ...defaultProductionConfig,
    environment: process.env.NODE_ENV as DefaultEnvironment,
  });
  config.public?.manifest?.options?.file_handlers?.forEach((fileHandler) => {
    Object.entries(fileHandler.accept).forEach(([name, value]) => {
      fileHandler.accept[name] = Array.from(value);
    });
  });
}
export const userConfig = config;
