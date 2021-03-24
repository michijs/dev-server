import { LsConfig } from '../types';
import { getPath } from '../utils/getPath';
import resolveCssLSElementPlugin from '../utils/resolveCssLSElementPlugin';
import { getIPAddress } from './getIPAddress';

const minify = process.env.NODE_ENV === 'PRODUCTION';
export const DEFAULT_CONFIG: LsConfig = {
  hostname: getIPAddress(),
  port: 3000,
  public: {
    path: 'public',
    indexName: 'index.html',
    minifyIndex: minify
  },
  importCssAsCSSStyleSheet: true,
  openBrowser: true,
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
    keepNames: true,
    entryPoints: [
      'src/index.ts'
    ],
    plugins: [
      resolveCssLSElementPlugin
    ]
  }
};