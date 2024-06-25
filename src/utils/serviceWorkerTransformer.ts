import { config } from "../config/config.js";
import { getAllFiles } from "./getAllFiles.js";
import { transformSync as esbuild } from "esbuild";

export const serviceWorkerTransformer = (
  serviceWorkerCode: string
): string | Buffer => {
  const { sourcemap, keepNames, format, outdir, define, target } =
    config.esbuildOptions;
  try {
    const allFiles = getAllFiles(outdir!, ".");
    const result = esbuild(serviceWorkerCode, {
      define: {
        "michiProcess.env.BUILD_FILES": `${JSON.stringify(allFiles)}`,
        // Time at GMT+0
        "michiProcess.env.CACHE_NAME": `"${new Date(
          new Date().toLocaleString("en-US", { timeZone: "Etc/GMT" }),
        ).getTime()}"`,
        ...define,
      },
      loader: 'ts',
      logLevel: "error",
      format,
      target,
      sourcemap,
      minifySyntax: config.public.minify,
      minifyWhitespace: config.public.minify,
      keepNames,
    });
    return result.code;
  } catch (ex) {
    console.log(ex);
    throw ex;
  }
};
