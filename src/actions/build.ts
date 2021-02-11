import { config } from '../config/config';
import { build as esbuild } from 'esbuild';
import fs from 'fs';
import Timer from '../utils/timer';
import coloredString from '../utils/coloredString';
import { copy } from '../utils/copy';

export function build(callback?: Function) {
  const timer = new Timer();
  timer.startTimer();
  fs.rmdirSync(config.esbuildOptions.outdir, { recursive: true });

  return new Promise((resolve) =>
    esbuild(config.esbuildOptions).then(() => {
      copy(config.publicPath, config.esbuildOptions.outdir);
      if (callback) {
        callback();
      }
      console.log(coloredString(`  Build finished in ${timer.endTimer()}ms`));
      resolve(true);
    }).catch(() => {
      return Promise.resolve();
    })
  );
}