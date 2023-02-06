import { config } from "../config/config";
import { Tranformer } from "./copy";
import { minifyXMLLike, replaceEnter } from "./minify";
import { serviceWorkerTransformer } from "./serviceWorkerTransformer";

export const jsAndTsRegex = /.*\.(?:ts|js)/;
export const notJsAndTsRegex = /.*\.(?!ts|js)/;

export const jsonTransformer: Tranformer = {
  fileRegex: /.*\.(?:json)/,
  transformer: (fileContent: string) => config.public.minify ? replaceEnter(fileContent) : fileContent
};

export const transformers: Tranformer[] = [
  jsonTransformer,
  {
    fileRegex: /.*\.(?:svg|xml|html)/,
    transformer: (fileContent: string) => config.public.minify ? minifyXMLLike(fileContent) : fileContent
  },
  {
    fileRegex: jsAndTsRegex,
    transformer: serviceWorkerTransformer,
    pathTransformer: destPath => destPath.replace('.ts', '.js')
  }]