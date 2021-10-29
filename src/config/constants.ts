import { LsConfig } from '../types';
import { getPath } from '../utils/getPath';
import { getIPAddress } from './getIPAddress';

const minify = process.env.NODE_ENV === 'PRODUCTION';
export const DEFAULT_CONFIG: LsConfig = {
  hostname: getIPAddress(),
  port: 3000,
  protocol: 'https',
  public: {
    path: 'public',
    indexName: 'index.html',
    minifyIndex: minify
  },
  openBrowser: process.env.NODE_ENV === 'DEVELOPMENT',
  showLinkedPackages: true,
  esbuildOptions: {
    inject: process.env.NODE_ENV === 'DEVELOPMENT' ? [getPath(`${__dirname}/public/client.js`)] : [],
    outdir: 'build',
    define: {
      'process.env.NODE_ENV': `"${process.env.NODE_ENV}"`
    },
    tsconfig: 'tsconfig.json',
    minifySyntax: minify,
    minifyWhitespace: minify,
    sourcemap: process.env.NODE_ENV !== 'PRODUCTION',
    bundle: true,
    keepNames: minify,
    entryPoints: [
      'src/index.ts'
    ],
    splitting: true,
    format: 'esm',
    target: ['esnext']
  }
};