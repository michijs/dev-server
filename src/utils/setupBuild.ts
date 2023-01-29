import fs from 'fs';
import { config } from '../config/config';
import { copy } from '../utils/copy';
import { injectServiceWorker } from '../utils/injectServiceWorker';
import { minifyHTML } from '../utils/minifyHTML';

export const setupBuild = () => {
  if (fs.existsSync(config.esbuildOptions.outdir)) {
    fs.rmSync(config.esbuildOptions.outdir, { recursive: true });
  }
  fs.mkdirSync(config.esbuildOptions.outdir, {recursive: true})
  const indexTranformer = (fileContent: string) => config.public.minifyIndex ? minifyHTML(fileContent) : fileContent;
  copy(config.public.path, config.esbuildOptions.outdir, [{ fileName: config.public.indexName, transformer: indexTranformer }]);
  injectServiceWorker();
}