import type { Plugin } from "esbuild";
import { config, connections } from "../config.js";
import { transformers } from "../../actions/start/transformers.js";
import { syncDirs } from "../../utils/syncDirs.js";
import { copy } from "../../utils/copy.js";
import fs from "fs";
import { jsonTransformer } from "../../actions/start/transformers.js";
import { getPath } from "../../utils/getPath.js";

export const publicFolderPlugin: Plugin = {
  name: "michijs-dev-server-public-folder",
  setup(build) {
    const outdir = build.initialOptions.outdir;
    // Clean outdir
    if (!outdir) return;
    if (fs.existsSync(outdir)) fs.rmSync(outdir, { recursive: true });
    fs.mkdirSync(outdir, { recursive: true });
    if (!fs.existsSync(config.public.path)) return;

    if (config.public.manifest?.options && config.public.manifest.name) {
      const transformedFile = jsonTransformer.transformer(
        JSON.stringify(config.public.manifest.options, null, 2),
      );
      fs.writeFileSync(
        getPath(`${outdir}/${config.public.manifest.name}`),
        transformedFile,
      );
    }

    if (config.public.wellKnown) {
      const wellKnownDir = `${outdir}/.well-known`;
      if (!fs.existsSync(wellKnownDir)) fs.mkdirSync(wellKnownDir);

      if (config.public.wellKnown.assetsLinks) {
        const transformedFile = jsonTransformer.transformer(
          JSON.stringify(config.public.wellKnown.assetsLinks),
        );
        fs.writeFileSync(
          getPath(`${wellKnownDir}/assetlinks.json`),
          transformedFile,
        );
      }
      if (config.public.wellKnown.webAppOriginAssociation) {
        const transformedFile = jsonTransformer.transformer(
          JSON.stringify(config.public.wellKnown.webAppOriginAssociation),
        );
        fs.writeFileSync(
          getPath(`${wellKnownDir}/web-app-origin-association`),
          transformedFile,
        );
      }
    }
    copy(config.public.path, outdir, transformers);

    let firstLoad = true;
    build.onEnd(() => {
      if (firstLoad) {
        copy(config.public.path, outdir, transformers);
        if (config.watch)
          syncDirs(
            config.public.path,
            config.esbuildOptions.outdir,
            transformers,
            undefined,
            undefined,
            (event, fileChangedPath) => {
              for (const x of connections)
                x.write(
                  `event: change\ndata: ${JSON.stringify({
                    added: [],
                    removed: event === "remove" ? [fileChangedPath] : [],
                    updated: event === "update" ? [fileChangedPath] : [],
                  })}\n\n`,
                );
            },
          );
        firstLoad = false;
      }
    });
  },
};
