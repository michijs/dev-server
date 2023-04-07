import { config } from '../config/config.js';
import { Tranformer } from './copy.js';
import { minifyXMLLike } from './minify.js';
import { serviceWorkerTransformer } from './serviceWorkerTransformer.js';

export const jsAndTsRegex = /.*\.(?:ts|js)/;
export const notJsAndTsRegex = /.*\.(?!ts|js)/;

export const jsonTransformer: Tranformer = {
  fileRegex: /.*\.(?:json)/,
  transformer: (fileContent: string) =>
    config.public.minify
      ? JSON.stringify(JSON.parse(fileContent))
      : fileContent,
};

export const transformers: Tranformer[] = [
  jsonTransformer,
  {
    fileRegex: /.*\.(?:svg|xml|html)/,
    transformer: (fileContent: string) =>
      config.public.minify ? minifyXMLLike(fileContent) : fileContent,
  },
  {
    fileRegex: jsAndTsRegex,
    transformer: serviceWorkerTransformer,
    pathTransformer: (destPath) => destPath.replace('.ts', '.js'),
  },
];
