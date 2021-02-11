import { getPath } from '../utils/getPath';
import ts from "typescript";
import fs from 'fs';
import { LsConfig, LsServerConfig } from '../types';

let config: Partial<LsConfig> = {};
if (fs.existsSync('lsconfig.ts')) {
    const configTs = fs.readFileSync('lsconfig.ts', 'utf8');
    const transpiledConfigTs = ts.transpileModule(configTs, {});
    const transpiledConfigPath = getPath(`${__dirname}/lsconfig.js`);
    try {
        fs.rmdirSync(transpiledConfigPath);
    } catch { }
    fs.writeFileSync(transpiledConfigPath, transpiledConfigTs.outputText);
    config = (require('./lsconfig.js').default as LsServerConfig)(process.env.NODE_ENV);
}
export const userConfig = config;