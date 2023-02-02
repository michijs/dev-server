import fs from 'fs';
import { DefaultEnvironment, ServerConfigFactory, ServerConfig } from '../types';
import { buildSync as esbuild } from 'esbuild';

let config: ServerConfig = {};
if (fs.existsSync('michi.config.ts')) {
  esbuild({
    bundle: true,
    entryPoints: [{
      in: 'michi.config.ts',
      out: 'michi.config'
    }],
    outdir: __dirname,
    format: 'cjs',
    platform: 'node',
    logLevel: 'error',
    target: ['node16'],
  });
  config = (require('./michi.config.js').default as ServerConfigFactory)(process.env.NODE_ENV as DefaultEnvironment);
}
export const userConfig = config;