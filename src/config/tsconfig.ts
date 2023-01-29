import { config } from './config';
import fs from 'fs';
import type { CompilerOptions } from 'typescript'

let tsconfig: { compilerOptions: CompilerOptions };

if (fs.existsSync(config.esbuildOptions.tsconfig)) {
  tsconfig = JSON.parse(fs.readFileSync(config.esbuildOptions.tsconfig, 'utf-8'))
} else {
  throw `Unable to find tsconfig at ${config.esbuildOptions.tsconfig}`
}

export { tsconfig }