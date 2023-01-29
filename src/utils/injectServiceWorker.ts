import { config } from '../config/config';
import { getAllFiles } from './getAllFiles';
import { transformSync as esbuild } from 'esbuild';
import { getPath } from './getPath';
import * as fs from 'fs';

export const injectServiceWorker = () => {
  const { outdir, minify, minifyIdentifiers, minifySyntax, minifyWhitespace, keepNames, define } = config.esbuildOptions;
  if (config.public.serviceWorkerName && outdir) {
    try {
      const allFiles = getAllFiles(outdir, '.');
      const serviceWorkerPath = getPath(`${config.public.path}/${config.public.serviceWorkerName}`);
      const outServiceWorkerPath = getPath(`${outdir}/${config.public.serviceWorkerName}`);
      const file = fs.readFileSync(serviceWorkerPath, 'utf-8');
      const result = esbuild(file, {
        define: {
          'process.env.BUILD_FILES': `${JSON.stringify(allFiles)}`,
          // Time at GMT+0
          'process.env.CACHE_NAME': `"${new Date(new Date().toLocaleString('en-US', { timeZone: 'Etc/GMT' })).getTime()}"`,
          ...define
        },
        logLevel: 'debug',
        format: 'esm',
        target: ['esnext'],
        minify, minifyIdentifiers, minifySyntax, minifyWhitespace, keepNames
      });
      fs.writeFileSync(outServiceWorkerPath, result.code);
    } catch (ex) {
      console.log(ex);
    }
  }
};