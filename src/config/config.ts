import fs from "fs";
import type { Config } from "../types.js";
import coloredString from "../utils/coloredString.js";
import { copy } from "../utils/copy.js";
import { getPath } from "../utils/getPath.js";
import { userConfig } from "./userConfig.js";
import type http from "http";
import { join, resolve } from "path";
import {
  jsAndTsRegex,
  jsonTransformer,
  notJsAndTsRegex,
  transformers,
} from "../actions/start/transformers.js";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { counterPlugin } from "./plugins/counter.js";

const minify = process.env.NODE_ENV === "PRODUCTION";
const devServerListener =
  process.env.NODE_ENV === "DEVELOPMENT"
    ? [getPath(`${dirname(fileURLToPath(import.meta.url))}/public/client.js`)]
    : [];

export const connections: (http.ServerResponse<http.IncomingMessage> & {
  req: http.IncomingMessage;
})[] = [];


const getCurrentCommitSha = () => {
  const headPath = join('.git', 'HEAD');
  const headContent = fs.readFileSync(headPath, 'utf-8').trim();

  if (headContent.startsWith('ref:')) {
    const refPath = join('.git', headContent.split(' ')[1]);
    return fs.readFileSync(refPath, 'utf-8').trim();
  } else {
    return headContent;
  }
};

const commitSha = getCurrentCommitSha();

const defaultEntryPoint = fs.existsSync("src/index.tsx")
  ? "src/index.tsx"
  : fs.existsSync("src/index.ts")
    ? "src/index.ts"
    : "src/index.js";
const config = {
  port: 3000,
  openBrowser: process.env.NODE_ENV === "DEVELOPMENT",
  showLinkedPackages: true,
  watch: true,
  ...userConfig,
  // protocol: 'http',
  public: {
    path: "public",
    indexName: "index.html",
    minify: minify,
    ...(userConfig.public ?? {}),
    assets: {
      path: "assets",
      ...(userConfig.public?.assets ?? {}),
      screenshots: {
        paths: ["/"],
        pageCallbacks: [() => {}],
        ...(userConfig.public?.assets?.screenshots ?? {}),
      },
      featureImage: {
        path: "/",
        ...(userConfig.public?.assets?.featureImage ?? {}),
      },
    },
    manifest: {
      name: "manifest.json",
      ...(userConfig.public?.manifest ?? {}),
    },
  },
  esbuildOptions: {
    outdir: "build",
    tsconfig: "tsconfig.json",
    minifySyntax: minify,
    minifyWhitespace: minify,
    sourcemap: process.env.NODE_ENV === "DEVELOPMENT",
    splitting: true,
    bundle: process.env.NODE_ENV !== "DISTRIBUTION",
    keepNames: minify,
    entryPoints: [defaultEntryPoint],
    format: "esm",
    target: "esnext",
    logLevel: "error",
    ...(userConfig.esbuildOptions ?? {}),
    // Still not supported
    // bug .css.ts
    // plugins: [
    //   {
    //     name: 'css-assert-import',
    //     setup(build) {
    //       build.onResolve({ filter: /\.css$/ }, (args) => {
    //         const splittedPath = args.path.split('/');
    //         const fileName = splittedPath[splittedPath.length - 1];
    //         const splittedFileName = fileName.split('.');
    //         const fileNameOnBuild = `${splittedFileName[0]}-${new Date().getTime()}.${splittedFileName.splice(1).join('.')}`;
    //         const srcPath = path.resolve(args.resolveDir, args.path);
    //         const destPath = path.resolve(build.initialOptions.outdir, fileNameOnBuild);
    //         if (!fs.existsSync(build.initialOptions.outdir))
    //           fs.mkdirSync(build.initialOptions.outdir);
    //         fs.copyFileSync(srcPath, destPath);
    //         return { path: `./${fileNameOnBuild}`, external: true, watchFiles: [srcPath] };
    //       });
    //     },
    //   }
    // ],
    plugins: [
      ...(userConfig.esbuildOptions?.plugins ?? []),
      {
        name: "michijs-dev-server",
        setup(build) {
          // Clean outdir
          if (build.initialOptions.outdir) {
            if (fs.existsSync(build.initialOptions.outdir)) {
              fs.rmSync(build.initialOptions.outdir, { recursive: true });
            }
            fs.mkdirSync(build.initialOptions.outdir, { recursive: true });
          }

          if (config.public.manifest?.options && config.public.manifest.name) {
            const transformedFile = jsonTransformer.transformer(
              JSON.stringify(config.public.manifest.options, null, 2),
            );
            fs.writeFileSync(
              getPath(
                `${build.initialOptions.outdir}/${config.public.manifest.name}`,
              ),
              transformedFile,
            );
          }

          if (config.public.wellKnown) {
            const wellKnownDir = `${build.initialOptions.outdir}/.well-known`;
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

          // Copy public path - Omit to copy service worker - will be transformed after
          if (config.public.path && build.initialOptions.outdir)
            copy(
              config.public.path,
              build.initialOptions.outdir,
              transformers,
              [jsAndTsRegex],
            );

          let firstLoad = true;
          build.onEnd(() => {
            // first-load sw - Omit to copy any other non-js file
            if (firstLoad && config.public.path && build.initialOptions.outdir)
              copy(
                config.public.path,
                build.initialOptions.outdir,
                transformers,
                [notJsAndTsRegex],
              );
            firstLoad = false;
          });
        },
      },
      counterPlugin,
    ],
    define: {
      // Intentionally added before process
      michiProcess: JSON.stringify({
        env: {
          NODE_ENV: process.env.NODE_ENV,
          COMMIT_SHA: commitSha,
          ...(userConfig.env ?? {}),
        },
      }),
    },
    inject: [
      ...devServerListener,
      ...(userConfig.esbuildOptions?.inject ?? []),
    ],
    ...(userConfig.esbuildOptions?.define ?? {}),
  },
} satisfies Config;

function findSymbolickLinkRealPath(packagePath: string) {
  if (fs.lstatSync(packagePath).isSymbolicLink()) {
    // Getting absolute path for the simbolic link
    return resolve(fs.readlinkSync(packagePath));
  }
  return packagePath;
}

if (config.showLinkedPackages) {
  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
  const dependencies = Object.keys(packageJson.dependencies || {});
  const devDependencies = Object.keys(packageJson.devDependencies || {});
  const peerDependencies = Object.keys(packageJson.peerDependencies || {});

  dependencies.concat(devDependencies).concat(peerDependencies).forEach((packagePath) => {
    const packagePathOnNodeModules = getPath(`node_modules/${packagePath}`);
    if (fs.lstatSync(packagePathOnNodeModules).isSymbolicLink()) {
      const pathToWatch = findSymbolickLinkRealPath(packagePathOnNodeModules);
      console.log(coloredString(`  Linked package found at "${pathToWatch}"`));
    }
  });
}

export { config };
