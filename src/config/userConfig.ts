import { getPath } from '../utils/getPath';
import ts from 'typescript';
import fs from 'fs';
import { LsServerConfig, UserConfig } from '../types';

let config: UserConfig = {};
if (fs.existsSync('lsconfig.ts')) {
  const configTs = fs.readFileSync('lsconfig.ts', 'utf8');
  const transpiledConfigTs = ts.transpileModule(configTs, {});
  const transpiledConfigPath = getPath(`${__dirname}/lsconfig.js`);
  if (fs.existsSync(transpiledConfigPath))
    fs.rmSync(transpiledConfigPath);
  fs.writeFileSync(transpiledConfigPath, transpiledConfigTs.outputText);
  config = (require('./lsconfig.js').default as LsServerConfig)(process.env.NODE_ENV);
}
export const userConfig = config;