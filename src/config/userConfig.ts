import { getPath } from '../utils/getPath';
import fs from 'fs';
import { DefaultEnvironment, ServerConfigFactory, ServerConfig } from '../types';
import { transformSync as esbuild } from 'esbuild';

let config: ServerConfig = {};
if (fs.existsSync('michi.config.ts')) {
  const configTs = fs.readFileSync('michi.config.ts', 'utf-8');
  const transpiledConfigTs = esbuild(configTs, {
    loader: 'ts',
    logLevel: 'debug',
    format: 'cjs',
    platform: 'node',
    target: ['node16'],
  });
  const transpiledConfigPath = getPath(`${__dirname}/michi.config.js`);
  if (fs.existsSync(transpiledConfigPath)) {
    fs.rmSync(transpiledConfigPath);
  }
  fs.writeFileSync(transpiledConfigPath, transpiledConfigTs.code);
  config = (require('./michi.config.js').default as ServerConfigFactory)(process.env.NODE_ENV as DefaultEnvironment);
}
export const userConfig = config;