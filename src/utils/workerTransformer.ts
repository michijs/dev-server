import { config } from "../config/config.js";
import { getAllFiles } from "./getAllFiles.js";
import { build as esbuild } from "esbuild";
import { getCurrentCommitSha } from "./getCurrentCommitSha.js";
import type { Transformer } from "./copy.js";
const commitSha = getCurrentCommitSha();

export const workerTransformer: Transformer["transformer"] = async (
  _serviceWorkerCode: string,
  srcPath,
): Promise<string | Buffer> => {
  const { outdir, define } = config.esbuildOptions;
  try {
    const allFiles = getAllFiles(outdir!, ".");
    const result = await esbuild({
      ...config.esbuildOptions,
      splitting: false,
      outdir: undefined,
      inject: undefined,
      plugins: undefined,
      write: false,
      entryPoints: [srcPath!],
      legalComments: "inline",
      define: {
        // For compatibility with some modules - should be fixed eventually
        "import.meta.url": `""`,
        "michiProcess.env.BUILD_FILES": `${JSON.stringify(allFiles)}`,
        // Time at GMT+0
        "michiProcess.env.CACHE_NAME":
          commitSha !== ""
            ? `"${commitSha}"`
            : `"${new Date(
                new Date().toLocaleString("en-US", { timeZone: "Etc/GMT" }),
              ).getTime()}"`,
        ...define,
      },
    });
    return result.outputFiles?.[0]?.text ?? "";
  } catch (ex) {
    console.error(ex);
    throw ex;
  }
};
