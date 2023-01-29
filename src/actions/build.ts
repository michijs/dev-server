import { config } from '../config/config';
import { build as esbuild } from 'esbuild';
import Timer from '../utils/timer';
import { setupBuild } from '../utils/setupBuild';

export function build(callback?: Function) {
  const timer = new Timer();
  timer.startTimer();

  setupBuild();
  return new Promise((resolve) => {
    esbuild(config.esbuildOptions).then(() => {
      callback?.();
      resolve(true);
    }).catch(() => {
      return Promise.resolve();
    })
  });
}