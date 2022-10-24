import { config } from '../config/config';
import { build as esbuild, WatchMode } from 'esbuild';
import fs from 'fs';
import coloredString from '../utils/coloredString';
import { copy } from '../utils/copy';
import { minifyHTML } from '../utils/minifyHTML';
import Timer from '../utils/timer';
import { injectServiceWorker } from '../utils/injectServiceWorker';

export function build(callback?: Function, watchOption: boolean = false) {
  const timer = new Timer();
  timer.startTimer();
  if (fs.existsSync(config.esbuildOptions.outdir))
    fs.rmdirSync(config.esbuildOptions.outdir, { recursive: true });

  const configWatch = config.esbuildOptions.watch;

  const watch: boolean | WatchMode = watchOption ? {
    onRebuild: (error, result) => {
      if (!error) {
        injectServiceWorker();
        callback?.();
        if (configWatch && typeof configWatch !== 'boolean') {
          configWatch.onRebuild(error, result);
        }
        console.log(coloredString('  Rebuild finished'));
      }
    }
  } : configWatch;

  return new Promise((resolve) =>
    esbuild({ ...config.esbuildOptions, watch }).then(() => {
      const indexTranformer = (fileContent: string) => config.public.minifyIndex ? minifyHTML(fileContent) : fileContent;
      copy(config.public.path, config.esbuildOptions.outdir, [{ fileName: config.public.indexName, transformer: indexTranformer }]);
      injectServiceWorker();
      callback?.();
      console.log(coloredString(`  Build finished in ${timer.endTimer()}ms`));
      resolve(true);
    }).catch(() => {
      return Promise.resolve();
    })
  );
}