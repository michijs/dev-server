import { config } from '../config/config.js';
import { build as esbuild } from 'esbuild';

export function build(callback?: Function) {
  return new Promise((resolve, reject) => {
    esbuild(config.esbuildOptions)
      .then(() => {
        callback?.();
        resolve(true);
      })
      .catch(reject);
  });
}
