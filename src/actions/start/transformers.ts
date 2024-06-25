import { config } from "../../config/config.js";
import type { Transformer } from "../../utils/copy.js";
import { minifyXMLLike } from "../../utils/minify.js";
import { serviceWorkerTransformer } from "../../utils/serviceWorkerTransformer.js";

export const jsAndTsRegex = /.*\.(?:ts|js)/;
export const notJsAndTsRegex = /.*\.(?!ts|js)/;

export const jsonTransformer = {
  fileRegex: /.*\.(?:json)/,
  transformer: (fileContent: string) =>
    config.public.minify
      ? JSON.stringify(JSON.parse(fileContent))
      : fileContent,
} satisfies Transformer;

export const transformers: Transformer[] = [
  jsonTransformer,
  {
    fileRegex: /.*\.(?:svg|xml|html)/,
    transformer: (fileContent: string) =>
      config.public.minify ? minifyXMLLike(fileContent) : fileContent,
  },
  {
    fileRegex: jsAndTsRegex,
    transformer: serviceWorkerTransformer,
    pathTransformer: (destPath) => destPath.replace(".ts", ".js"),
  },
];
