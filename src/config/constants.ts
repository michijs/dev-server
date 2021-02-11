import { LsConfig } from '../types';
import { getPath } from '../utils/getPath';
import resolveCssLSElementPlugin from '../utils/resolveCssLSElementPlugin';

const minify = process.env.NODE_ENV === 'DEVELOPMENT' ? false : true;
export const DEFAULT_CONFIG: LsConfig = {
    hostname: "127.0.0.1",
    port: 3000,
    publicPath: "public",
    watchDir: [
        "src",
        "public"
    ],
    tsconfigPath: "tsconfig.json",
    importCssAsCSSStyleSheet: true,
    openBrowser: true,
    watchLinkedPackages: true,
    esbuildOptions: {
        inject: process.env.NODE_ENV === 'PRODUCTION' ? [getPath(`${__dirname}/public/client.js`)] : [],
        outdir: "build",
        define: {
            "process.env.NODE_ENV": `"${process.env.NODE_ENV}"`
        },
        minifySyntax: minify,
        minifyWhitespace: minify,
        sourcemap: process.env.NODE_ENV === 'DEVELOPMENT' ? true : false,
        bundle: true,
        keepNames: true,
        entryPoints: [
            "src/index.ts"
        ],
        plugins: [
            resolveCssLSElementPlugin
        ]
    }
}