import { LsConfig } from '../types';
import { getPath } from '../utils/getPath';
import resolveCssLSElementPlugin from '../utils/resolveCssLSElementPlugin';

const minify = process.env.NODE_ENV !== 'DEVELOPMENT';
export const DEFAULT_CONFIG: LsConfig = {
  hostname: '127.0.0.1',
  port: 3000,
  public: {
    path: 'public',
    indexName: 'index.html',
    minifyIndex: minify
  },
  tsconfigPath: 'tsconfig.json',
  importCssAsCSSStyleSheet: true,
  openBrowser: true,
  showLinkedPackages: true,
  esbuildOptions: {
    inject: process.env.NODE_ENV === 'DEVELOPMENT' ? [getPath(`${__dirname}/public/client.js`)] : [],
    outdir: 'build',
    define: {
      'process.env.NODE_ENV': `"${process.env.NODE_ENV}"`
    },
    minifySyntax: minify,
    minifyWhitespace: minify,
    sourcemap: process.env.NODE_ENV === 'DEVELOPMENT',
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