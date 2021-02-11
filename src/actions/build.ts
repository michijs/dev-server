import { config } from '../config/config';
import { build as esbuild, WatchMode } from 'esbuild';
import fs from 'fs';
import Timer from '../utils/timer';
import coloredString from '../utils/coloredString';
import { copy } from '../utils/copy';

export function build(callback?: Function) {
  const timer = new Timer();
  timer.startTimer();
  fs.rmdirSync(config.esbuildOptions.outdir, { recursive: true });

  const configWatch = config.esbuildOptions.watch;

  let firstTime = true;
  const watch: boolean | WatchMode = callback ? {
    onRebuild: (error, result) => {
      callback();
      if (configWatch && typeof configWatch !== 'boolean') {
        configWatch.onRebuild(error, result)
      }
      if (!error && !firstTime) {
        console.log(coloredString(`  Rebuild finished`));
      }
      firstTime = false;
    }
  } : configWatch;

  return new Promise((resolve) =>
    esbuild({ ...config.esbuildOptions, watch }).then(() => {
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