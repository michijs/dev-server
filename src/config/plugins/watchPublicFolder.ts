import type { Plugin } from "esbuild";
import { config, connections } from "../../config/config.js";
import { transformers } from "../../actions/start/transformers.js";
import { syncDirs } from "../../utils/syncDirs.js";

export const watchPublicFolderPlugin: Plugin = {
  name: "michijs-dev-server-watch-public-folder",
  setup() {
    if (config.public.path && config.watch)
      syncDirs(config.public.path, config.esbuildOptions.outdir, transformers, undefined, undefined, (event, fileChangedPath) => {
        connections.forEach((x) =>
          x.write(
            `event: change\ndata: ${JSON.stringify({
              added: [],
              removed: event === 'remove' ? [fileChangedPath] : [],
              updated: event === 'update' ? [fileChangedPath] : [],
            })}\n\n`,
          ),
        );
      })
  },
}