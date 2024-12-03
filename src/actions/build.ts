import { config } from "../config/config.js";
import { build as esbuild } from "esbuild";
import fs from "fs";

export async function build(callback: Function) {
  const { metafile } = await esbuild(config.esbuildOptions);
  if (metafile) fs.writeFileSync("meta.json", JSON.stringify(metafile));
  callback();
}
