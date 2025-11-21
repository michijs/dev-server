import { tsconfig } from "../config/tsconfig.js";
import fs from "fs";
import path from "path";
import { transformSync as esbuild } from "esbuild";
import { type Transformer, copy } from "../utils/copy.js";
import { Timer } from "../classes/Timer.js";
import coloredString from "../utils/coloredString.js";
import { syncDirs } from "../utils/syncDirs.js";
import { getPath } from "../utils/getPath.js";
import { globToRegex } from "../utils/globToRegex.js";
import { config } from "../config/config.js";
import { exec } from "child_process";

const allJsFilesRegex = /.*\.(?:ts|js|tsx|jsx)/;

export const transformers: Transformer[] = [
  {
    fileRegex: allJsFilesRegex,
    transformer: (fileContent, path) => {
      const result = esbuild(fileContent, {
        tsconfigRaw: JSON.stringify(tsconfig),
        sourcefile: path,
        loader: "default",
      }).code;
      return result === ""
        ? `export {};
`
        : result;
    },
    pathTransformer: (destPath) =>
      destPath.replace(path.extname(destPath), ".js"),
  },
];

export async function dist(callback: () => void, watchOption = false) {
  const { outDir } = tsconfig.compilerOptions;
  if (outDir) {
    const timer = new Timer();
    timer.startTimer();
    if (fs.existsSync(outDir)) fs.rmSync(outDir, { recursive: true });
    const omit = tsconfig.exclude.map((x) => globToRegex(getPath(x)));

    tsconfig.include.forEach((x) => copy(x, outDir, transformers, omit));
    exec(
      // outDir takes the dir from the extended tsconfig...
      `tsc ${watchOption ? "-w --incremental" : ""} --emitDeclarationOnly --project ${config.esbuildOptions.tsconfig} --outDir ${outDir}`,
      { maxBuffer: 1024 * 500 },
      (error, stdout, stderr) => {
        if (stdout) console.log(stdout);
        if (error || stderr) {
          console.error(error?.message ?? stderr);
          process.exit(1);
        }
        callback();
      },
    );
    coloredString(`  Dist finished in ${timer.endTimer()}ms`);
    if (watchOption)
      tsconfig.include.forEach((x) => {
        syncDirs(
          x,
          outDir,
          transformers,
          omit,
          () => timer.startTimer(),
          () => {
            console.log(
              coloredString(`  Dist finished in ${timer.endTimer()}ms`),
            );
          },
        );
      });
  } else {
    throw new Error("Your tsconfig needs an outdir");
  }
}
