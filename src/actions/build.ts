import { config } from '../config/config.js';
import { build as esbuild } from 'esbuild';

export function build(callback?: Function) {
  return new Promise((resolve) => {
    esbuild(config.esbuildOptions)
      .then(() => {
        callback?.();
        resolve(true);
      })
      .catch(() => {
        return Promise.resolve();
      });
  });
}
