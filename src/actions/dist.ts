import { tsconfig } from "../config/tsconfig.js";
import fs from "fs";
import { transpileDeclaration } from 'typescript'
import path from "path";
import { transformSync as esbuild } from "esbuild";
import { Transformer, copy } from "../utils/copy.js";
import { Timer } from "../classes/Timer.js";
import coloredString from "../utils/coloredString.js";
import { syncDirs } from "../utils/syncDirs.js";
import { getPath } from "../utils/getPath.js";
import { globToRegex } from "../utils/globToRegex.js";

const allJsFilesRegex = /.*\.(?:ts|js|tsx|jsx)/;

export const transformers: Transformer[] = [
  {
    fileRegex: allJsFilesRegex,
    transformer: (fileContent) => transpileDeclaration(fileContent, { compilerOptions: tsconfig.compilerOptions }).outputText,
    pathTransformer: (destPath) => destPath.replace(path.extname(destPath), ".d.ts"),
  },
  {
    fileRegex: allJsFilesRegex,
    transformer: (fileContent, path) => {
      const result = esbuild(fileContent, { sourcefile: path, loader: path?.endsWith('x') ? 'tsx' : 'ts' }).code;
      return result === '' ? `export {};
` : result
    },
    pathTransformer: (destPath) => destPath.replace(path.extname(destPath), ".js"),
  },
];

export async function dist(callback: () => void, watchOption = false) {
  const outdir = tsconfig.compilerOptions.outDir;
  if (
    outdir
  ) {
    if (fs.existsSync(outdir))
      fs.rmSync(outdir, { recursive: true });

    const timer = new Timer();
    timer.startTimer();
    const omit = tsconfig.exclude.map(x => globToRegex(getPath(x)));
    tsconfig.include.forEach(x => copy(x, outdir, transformers, omit))
    console.log(
      coloredString(`  Dist finished in ${timer.endTimer()}ms`),
    );
    if (watchOption)
      tsconfig.include.forEach(x => {
        const timer = new Timer();
        syncDirs(x, outdir, transformers, omit, () => timer.startTimer(), () => {
          console.log(
            coloredString(`  Dist finished in ${timer.endTimer()}ms`),
          );
        })
      })
    callback();

  } else {
    throw new Error(`Your tsconfig needs an outdir`);
  }

}
