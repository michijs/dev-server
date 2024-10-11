import type { Plugin } from "esbuild";
import { config, connections } from "../config.js";
import {
  jsAndTsRegex,
  notJsAndTsRegex,
  transformers,
} from "../../actions/start/transformers.js";
import { syncDirs } from "../../utils/syncDirs.js";
import { copy } from "../../utils/copy.js";

export const publicFolderPlugin: Plugin = {
  name: "michijs-dev-server-public-folder",
  setup(build) {
    // Copy public path - Omit to copy service worker - will be transformed after
    if (build.initialOptions.outdir)
      copy(config.public.path, build.initialOptions.outdir, transformers, [
        jsAndTsRegex,
      ]);

    let firstLoad = true;
    build.onEnd(() => {
      // first-load sw - Omit to copy any other non-js file
      if (firstLoad && build.initialOptions.outdir) {
        copy(config.public.path, build.initialOptions.outdir, transformers, [
          notJsAndTsRegex,
        ]);
        if (config.watch)
          syncDirs(
            config.public.path,
            config.esbuildOptions.outdir,
            transformers,
            undefined,
            undefined,
            (event, fileChangedPath) => {
              connections.forEach((x) =>
                x.write(
                  `event: change\ndata: ${JSON.stringify({
                    added: [],
                    removed: event === "remove" ? [fileChangedPath] : [],
                    updated: event === "update" ? [fileChangedPath] : [],
                  })}\n\n`,
                ),
              );
            },
          );
        firstLoad = false;
      }
    });
  },
};
