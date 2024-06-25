import { config } from "../config/config.js";
import { build as esbuild } from "esbuild";

export async function build(callback: Function) {
  await esbuild(config.esbuildOptions);
  callback();
}
