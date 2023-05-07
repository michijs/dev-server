import { tsconfig } from '../config/tsconfig.js';
import fs from 'fs';
import path from 'path';
import ts from 'typescript';
import { transpileFilesWithThreads } from '../utils/transpileFilesWithThreads.js';

function transpileFiles(
  filePaths: string[],
  compilerOptions: ts.CompilerOptions,
) {
  const program = ts.createProgram(filePaths, compilerOptions);

  const emitResult = program.emit();
  console.log(emitResult.emittedFiles);

  // const allDiagnostics = getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

  // if (allDiagnostics.length > 0) {
  //   throw new Error(ts.formatDiagnosticsWithColorAndContext(allDiagnostics, {
  //     getCanonicalFileName: fileName => fileName,
  //     getCurrentDirectory: () => process.cwd(),
  //     getNewLine: () => ts.sys.newLine
  //   }));
  // }

  // const outputFiles = emitResult.emittedFiles?.filter(filePath => filePath.endsWith('.js') || filePath.endsWith('.d.ts'));

  // return outputFiles.map(filePath => fs.readFileSync(filePath, 'utf-8'));
}

// Get an array of all TypeScript files in the project directory and its subdirectories
const getTsFiles = (dir: string): string[] => {
  const files = fs.readdirSync(dir);
  const tsFiles = files
    .filter((file) => file.endsWith('.ts') || file.endsWith('.tsx'))
    .map((file) => path.join(dir, file));
  const subdirs = files.filter((file) =>
    fs.statSync(path.join(dir, file)).isDirectory(),
  );
  return subdirs.reduce(
    (acc, subdir) => acc.concat(getTsFiles(path.join(dir, subdir))),
    tsFiles,
  );
};

// Call the functions to transpile the project

export function dist(callback: () => void, watch = false) {
  if (
    tsconfig.compilerOptions.outDir &&
    fs.existsSync(tsconfig.compilerOptions.outDir)
  ) {
    fs.rmSync(tsconfig.compilerOptions.outDir, { recursive: true });
  }

  tsconfig.include.forEach((x) => {
    const tsFiles = getTsFiles(x);
    transpileFilesWithThreads(tsFiles, tsconfig.compilerOptions);
  });

  callback();
}
