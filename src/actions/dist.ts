import { tsconfig } from "../config/tsconfig";
import { transpile } from '@lsegurado/ls-convert-css-to-js-module';
import { config } from "../config/config";
import { exec } from "child_process";
import fs from 'fs';

export function dist(watch = false){
    fs.rmdirSync(tsconfig.compilerOptions.outDir, { recursive: true });
    tsconfig.include.forEach(srcDir => {
        transpile(srcDir, tsconfig.compilerOptions.outDir, watch, config.importCssAsCSSStyleSheet)
    })
    exec(`tsc ${watch ? '-w': ''}`);
}