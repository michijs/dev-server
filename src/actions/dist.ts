import { tsconfig } from '../config/tsconfig.js';
import { config } from '../config/config.js';
import { exec } from 'child_process';
import fs from 'fs';

export function dist(callback: () => void, watch = false) {
  if (
    tsconfig.compilerOptions.outDir &&
    fs.existsSync(tsconfig.compilerOptions.outDir)
  ) {
    fs.rmSync(tsconfig.compilerOptions.outDir, { recursive: true });
  }
  exec(
    `tsc ${watch ? '-w' : ''} --project ${config.esbuildOptions.tsconfig}`,
    callback,
  );
}
