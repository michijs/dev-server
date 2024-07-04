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
import { exec } from "child_process";

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

function isErrorInsideCreateCustomElement(diagnostic: Diagnostic) {
  if (!diagnostic.file || diagnostic.start === undefined) {
    return false;
  }

  const sourceText = diagnostic.file.text;
  const errorPos = diagnostic.start;

  // Get the line containing the error
  const lineStart = sourceText.lastIndexOf("\n", errorPos);
  const lineEnd = sourceText.indexOf("\n", errorPos);
  const errorLine = sourceText.substring(lineStart + 1, lineEnd);

  return errorLine.includes("createCustomElement");
}

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
        const notRelatedWithCustomElementDiagnosis = diagnostics.filter(
          (x) => !isErrorInsideCreateCustomElement(x),
        );
        if (notRelatedWithCustomElementDiagnosis.length > 0) {
          showErrors(notRelatedWithCustomElementDiagnosis);
          delayedDeclarationFiles.push(path!);
          throw "Not compatible ts";
        }
        const regex = /const\s+(\w+)\s*=\s*createCustomElement\(\s*".*?"\s*,/gs;
        const michijsElementsNames: string[] = [];
        // Obtaining const names
        let match: RegExpExecArray | null;
        while ((match = regex.exec(fileContent)) !== null) {
          michijsElementsNames.push(match[1]!);
        }
        const eventsRegexPattern =
          /new\s+EventDispatcher\s*<\s*([^>]+)\s*>\s*\(\s*\)/gs;
        const classRegexPattern = /class:\s*(\w+)/gs;
        const trailingCommaPattern = /\s*,\s*\)\s*;/gs;
        fileContent = fileContent
          // Removing createCustomElement and the name of the element
          .replaceAll(regex, "const $1 = (")
          // Helping to resolve events
          .replaceAll(
            eventsRegexPattern,
            "new EventDispatcher<$1>() as EventDispatcher<$1>",
          )
          // Helping to resolve classes
          .replaceAll(classRegexPattern, "class: $1 as $1")
          .replaceAll(trailingCommaPattern, " );");
        const elementNamesRegex = new RegExp(
          `\\b(${michijsElementsNames.join("|")})\\b: `,
          "g",
        );

        // Converting everything into types
        const { outputText: newOutputText } = transpileDeclaration(
          fileContent,
          options,
        );
        const finalSrc = newOutputText.replace(
          elementNamesRegex,
          `$1: import("@michijs/michijs").MichiElementClass<`,
        );
        const { outputText: finalOutputText } = transpileDeclaration(
          finalSrc,
          options,
        );

        return finalOutputText;
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

export async function dist(callback: () => void, watchOption = false, isolated = false) {
  const { outDir, isolatedDeclarations } = tsconfig.compilerOptions;
  if (outDir) {
    if (fs.existsSync(outDir)) fs.rmSync(outDir, { recursive: true });

    if (isolated || isolatedDeclarations) {
      const timer = new Timer();
      timer.startTimer();
      const omit = tsconfig.exclude.map((x) => globToRegex(getPath(x)));
      tsconfig.include.forEach((x) => copy(x, outDir, transformers, omit));
      generateIncompatibleDeclarationFiles();
      console.log(coloredString(`  Dist finished in ${timer.endTimer()}ms`));
      if (watchOption)
        tsconfig.include.forEach((x) => {
          const timer = new Timer();
          syncDirs(
            x,
            outDir,
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
      exec(
        `tsc ${watchOption ? "-w" : ""} --project ${config.esbuildOptions.tsconfig}`,
        callback,
      );
    }
  } else {
    throw new Error(`Your tsconfig needs an outdir`);
  }
}
