import { config } from './config';
import { findConfigFile, readConfigFile, sys, parseJsonConfigFileContent } from 'typescript';
const configFileName = findConfigFile(
  './',
  sys.fileExists,
  config.esbuildOptions.tsconfig
);
const { config: typescriptConfig } = readConfigFile(configFileName, sys.readFile);
const { raw, options } = parseJsonConfigFileContent(
  typescriptConfig,
  sys,
  './'
);

const include = (raw.include as string[]).filter((el) => (raw.exclude as string[]).indexOf(el) < 0);

export const tsconfig = { compilerOptions: options, include };