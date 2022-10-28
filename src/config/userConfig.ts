import { getPath } from '../utils/getPath';
import ts from 'typescript';
import fs from 'fs';
import { DefaultEnvironment, ServerConfig, UserConfig } from '../types';

let config: UserConfig = {};
if (fs.existsSync('michi.config.ts')) {
  const configTs = fs.readFileSync('michi.config.ts', 'utf8');
  const transpiledConfigTs = ts.transpileModule(configTs, {});
  const transpiledConfigPath = getPath(`${__dirname}/michi.config.js`);
  if (fs.existsSync(transpiledConfigPath)) {
    fs.rmSync(transpiledConfigPath);
  }
  fs.writeFileSync(transpiledConfigPath, transpiledConfigTs.outputText);
  config = (require('./michi.config.js').default as ServerConfig)(process.env.NODE_ENV as DefaultEnvironment);
}
export const userConfig = config;