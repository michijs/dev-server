import { config } from '../config/config';
import { build as esbuild, WatchMode } from 'esbuild';
import fs from 'fs';
import coloredString from '../utils/coloredString';
import { copy } from '../utils/copy';
import { minifyHTML } from '../utils/minifyHTML';
import Timer from '../utils/timer';

export function build(callback?: Function) {
  const timer = new Timer();
  timer.startTimer();
  fs.rmdirSync(config.esbuildOptions.outdir, { recursive: true });

  const configWatch = config.esbuildOptions.watch;

  let firstTime = true;
  const watch: boolean | WatchMode = callback ? {
    onRebuild: (error, result) => {
      if (!error && !firstTime) {
        callback();
        if (configWatch && typeof configWatch !== 'boolean') {
          configWatch.onRebuild(error, result)
        }
        console.log(coloredString(`  Rebuild finished`));
      }
      firstTime = false;
    }
  } : configWatch;

  return new Promise((resolve) =>
    esbuild({ ...config.esbuildOptions, watch }).then(() => {
      const indexTranformer = config.public.minifyIndex ? (fileName: string, fileContent: string) => {
        if (fileName === config.public.indexName) {
          return minifyHTML(fileContent);
        }
        return fileContent;
      } : undefined;
      copy(config.public.path, config.esbuildOptions.outdir, indexTranformer);
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