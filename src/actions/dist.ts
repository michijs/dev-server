import { tsconfig } from "../config/tsconfig.js";
import fs from "fs";
import {
  transpileDeclaration,
  formatDiagnosticsWithColorAndContext,
  sys,
  type Diagnostic,
  createProgram,
  readConfigFile,
  parseJsonConfigFileContent,
  flattenDiagnosticMessageText,
} from "typescript";
import path from "path";
import { transformSync as esbuild } from "esbuild";
import { type Transformer, copy } from "../utils/copy.js";
import { Timer } from "../classes/Timer.js";
import coloredString from "../utils/coloredString.js";
import { syncDirs } from "../utils/syncDirs.js";
import { getPath } from "../utils/getPath.js";
import { globToRegex } from "../utils/globToRegex.js";
import { config } from "../config/config.js";

const allJsFilesRegex = /.*\.(?:ts|js|tsx|jsx)/;

const showErrors = (diagnostics: Diagnostic[] | undefined) => {
  if (diagnostics && diagnostics.length > 0)
    console.log(
      formatDiagnosticsWithColorAndContext(diagnostics, {
        getCanonicalFileName: (path) => path!,
        getCurrentDirectory: sys.getCurrentDirectory,
        getNewLine: () => sys.newLine,
      }),
    );
};

const configPath = config.esbuildOptions.tsconfig;
const configFile = readConfigFile(configPath, sys.readFile);
if (configFile.error) {
  const errorMessage = flattenDiagnosticMessageText(
    configFile.error.messageText,
    "\n",
  );
  console.error(`Error reading tsconfig: ${errorMessage}`);
  process.exit(1);
}

const parsedCommandLine = parseJsonConfigFileContent(
  configFile.config,
  sys,
  path.dirname(configPath),
);

let delayedDeclarationFiles: string[] = [];

const generateIncompatibleDeclarationFiles = () => {
  const program = createProgram(
    delayedDeclarationFiles,
    parsedCommandLine.options,
  );
  // const sourceFile = program.getSourceFile(filePath);
  program.emit(
    undefined,
    (fileName, data) => {
      fs.writeFileSync(fileName, data);
    },
    undefined,
    true,
  );
  delayedDeclarationFiles = [];
};

export const transformers: Transformer[] = [
  {
    fileRegex: allJsFilesRegex,
    transformer: (fileContent, path) => {
      const options = {
        compilerOptions: tsconfig.compilerOptions,
        fileName: path,
      };
      const { outputText, diagnostics } = transpileDeclaration(
        fileContent,
        options,
      );
      if (diagnostics && diagnostics?.length > 0) {
        // if (config.esbuildOptions.logLevel === 'warning')
        showErrors(diagnostics);

        delayedDeclarationFiles.push(path!);
        throw "Not compatible ts";
      }
      return outputText;
    },
    pathTransformer: (destPath) =>
      destPath.replace(path.extname(destPath), ".d.ts"),
  },
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
  const outdir = tsconfig.compilerOptions.outDir;
  if (outdir) {
    if (fs.existsSync(outdir)) fs.rmSync(outdir, { recursive: true });

    const timer = new Timer();
    timer.startTimer();
    const omit = tsconfig.exclude.map((x) => globToRegex(getPath(x)));
    tsconfig.include.forEach((x) => copy(x, outdir, transformers, omit));
    generateIncompatibleDeclarationFiles();
    console.log(coloredString(`  Dist finished in ${timer.endTimer()}ms`));
    if (watchOption)
      tsconfig.include.forEach((x) => {
        const timer = new Timer();
        syncDirs(
          x,
          outdir,
          transformers,
          omit,
          () => timer.startTimer(),
          () => {
            generateIncompatibleDeclarationFiles();
            console.log(
              coloredString(`  Dist finished in ${timer.endTimer()}ms`),
            );
          },
        );
      });
    callback();
  } else {
    throw new Error(`Your tsconfig needs an outdir`);
  }
}
