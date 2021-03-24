import { config } from './config';
import fs from 'fs';
import { CompilerOptions } from 'typescript';

export const tsconfig: { compilerOptions: CompilerOptions, include: string[] } = JSON.parse(fs.readFileSync(config.esbuildOptions.tsconfig, 'utf8'));