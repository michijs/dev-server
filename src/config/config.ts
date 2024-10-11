import fs from "fs";
import type { Config } from "../types.js";
import coloredString from "../utils/coloredString.js";
import { getPath } from "../utils/getPath.js";
import { userConfig } from "./userConfig.js";
import type http from "http";
import { resolve } from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { counterPlugin } from "./plugins/counter.js";
import { getCurrentCommitSha } from "../utils/getCurrentCommitSha.js";
import { publicFolderPlugin } from "./plugins/publicFolder.js";

const minify = process.env.NODE_ENV === "PRODUCTION";
const devServerListener =
  process.env.NODE_ENV === "DEVELOPMENT"
    ? [getPath(`${dirname(fileURLToPath(import.meta.url))}/public/client.js`)]
    : [];

export const connections: (http.ServerResponse<http.IncomingMessage> & {
  req: http.IncomingMessage;
})[] = [];

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
    minify,
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
    legalComments: "external",
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
      publicFolderPlugin,
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

  dependencies
    .concat(devDependencies)
    .concat(peerDependencies)
    .forEach((packagePath) => {
      const packagePathOnNodeModules = getPath(`node_modules/${packagePath}`);
      if (fs.lstatSync(packagePathOnNodeModules).isSymbolicLink()) {
        const pathToWatch = findSymbolickLinkRealPath(packagePathOnNodeModules);
        console.log(
          coloredString(`  Linked package found at "${pathToWatch}"`),
        );
      }
    });
}

export { config };
