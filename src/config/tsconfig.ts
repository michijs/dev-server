import { config } from './config.js';
import fs from 'fs';
import type { CompilerOptions } from 'typescript';

let tsconfig: {
  compilerOptions: CompilerOptions;
  include: string[];
  exclude: string[];
};

if (
  config.esbuildOptions.tsconfig &&
  fs.existsSync(config.esbuildOptions?.tsconfig)
) {
  tsconfig = JSON.parse(
    fs.readFileSync(config.esbuildOptions.tsconfig, 'utf-8'),
  );
} else {
  throw `Unable to find tsconfig at ${config.esbuildOptions.tsconfig}`;
}

export { tsconfig };
