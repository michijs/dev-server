import { config } from './config.js';
import fs from 'fs';
import ts from 'typescript';
import path from 'path';

interface Tsconfig {
  compilerOptions: ts.CompilerOptions;
  include: string[];
  exclude: string[];
}

function getCompilerOptionsFromTsConfig(tsConfigFilePath?: string): Tsconfig {
  if (tsConfigFilePath && fs.existsSync(tsConfigFilePath)) {
    const tsConfigJson = JSON.parse(fs.readFileSync(tsConfigFilePath, 'utf-8'));

    const compilerOptions: ts.CompilerOptions =
      ts.convertCompilerOptionsFromJson(
        tsConfigJson.compilerOptions,
        tsConfigFilePath,
      ).options;

    // resolve relative paths to absolute paths
    if (compilerOptions.outDir) {
      compilerOptions.outDir = path.resolve(
        path.dirname(tsConfigFilePath),
        compilerOptions.outDir,
      );
    }
    if (compilerOptions.rootDir) {
      compilerOptions.rootDir = path.resolve(
        path.dirname(tsConfigFilePath),
        compilerOptions.rootDir,
      );
    }
    if (compilerOptions.baseUrl) {
      compilerOptions.baseUrl = path.resolve(
        path.dirname(tsConfigFilePath),
        compilerOptions.baseUrl,
      );
    }
    if (compilerOptions.paths) {
      for (const key of Object.keys(compilerOptions.paths)) {
        compilerOptions.paths[key] = compilerOptions.paths[key].map(
          (p: string) => path.resolve(path.dirname(tsConfigFilePath), p),
        );
      }
    }

    return {
      ...tsConfigJson,
      compilerOptions,
    };
  } else {
    throw `Unable to find tsconfig at ${config.esbuildOptions.tsconfig}`;
  }
}

export const tsconfig = getCompilerOptionsFromTsConfig(
  config.esbuildOptions.tsconfig,
);
