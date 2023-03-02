import fs from 'fs';
import { Config } from '../types';
import coloredString from '../utils/coloredString';
import { copy } from '../utils/copy';
import { getPath } from '../utils/getPath';
import { Timer } from '../classes/Timer';
import { getIPAddress } from './getIPAddress';
import { userConfig } from './userConfig';
import http from 'http';
import { resolve } from 'path'
import { jsAndTsRegex, jsonTransformer, notJsAndTsRegex } from '../utils/transformers';

const minify = process.env.NODE_ENV === 'PRODUCTION';
const devServerListener = process.env.NODE_ENV === 'DEVELOPMENT' ? [getPath(`${__dirname}/public/client.js`)] : [];

export const connections: (http.ServerResponse<http.IncomingMessage> & {
  req: http.IncomingMessage;
})[] = [];
const config: Required<Config> = {
  port: 3000,
  openBrowser: process.env.NODE_ENV === 'DEVELOPMENT',
  showLinkedPackages: true,
  ...userConfig,
  // protocol: 'http',
  public: {
    path: 'public',
    indexName: 'index.html',
    minify: minify,
    ...(userConfig.public ?? {}),
    manifest: {
      name: 'manifest.json',
      ...(userConfig.public?.manifest ?? {})
    },
  },
  esbuildOptions: {
    outdir: 'build',
    tsconfig: 'tsconfig.json',
    minifySyntax: minify,
    minifyWhitespace: minify,
    sourcemap: process.env.NODE_ENV !== 'PRODUCTION',
    splitting: true,
    bundle: true,
    keepNames: minify,
    entryPoints: ['src/index.ts'],
    format: 'esm',
    target: 'esnext',
    logLevel: 'error',
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
        name: 'michijs-dev-server',
        setup(build) {
          // Clean outdir
          if (build.initialOptions.outdir) {
            if (fs.existsSync(build.initialOptions.outdir)) {
              fs.rmSync(build.initialOptions.outdir, { recursive: true });
            }
            fs.mkdirSync(build.initialOptions.outdir, { recursive: true })
          }

          if (config.public.manifest?.options && config.public.manifest.name) {
            const transformedFile = jsonTransformer.transformer(JSON.stringify(config.public.manifest.options, null, 2));
            fs.writeFileSync(getPath(`${build.initialOptions.outdir}/${config.public.manifest.name}`), transformedFile);
          }

          // Copy public path - Omit to copy service worker - will be transformed after
          if (config.public.path && build.initialOptions.outdir)
            copy(config.public.path, build.initialOptions.outdir, [jsAndTsRegex]);

          const buildTimer = new Timer();
          let firstLoad = true;
          build.onStart(() => buildTimer.startTimer())
          build.onEnd(() => {
            // first-load sw - Omit to copy any other non-js file
            if (firstLoad && config.public.path && build.initialOptions.outdir)
              copy(config.public.path, build.initialOptions.outdir, [notJsAndTsRegex]);
            console.log(coloredString(`  Build finished in ${buildTimer.endTimer()}ms`))
            firstLoad = false;
          })
        }
      }
    ],
    define: {
      // Intentionally added before process
      process: JSON.stringify({
        env: {
          NODE_ENV: process.env.NODE_ENV,
          ...(userConfig.env ?? {})
        }
      })
    },
    inject: [...devServerListener, ...(userConfig.esbuildOptions?.inject ?? [])],
    ...(userConfig.esbuildOptions?.define ?? {}),
  }
};

const hostURL = `http://${getIPAddress()}:${config.port}`;
const localURL = `http://localhost:${config.port}`;
// const hostURL = `${config.protocol}://${config.hostname}:${config.port}`;
// const localURL = `${config.protocol}://localhost:${config.port}`;

function findSymbolickLinkRealPath(packagePath: string) {
  if (fs.lstatSync(packagePath).isSymbolicLink()) {
    // Getting absolute path for the simbolic link
    return resolve(fs.readlinkSync(packagePath));
  }
  return packagePath;
}

if (config.showLinkedPackages) {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const dependencies = Object.keys(packageJson.dependencies || {});
  const devDependencies = Object.keys(packageJson.devDependencies || {});

  dependencies.concat(devDependencies).forEach(packagePath => {
    const packagePathOnNodeModules = getPath(`node_modules/${packagePath}`);
    if (fs.lstatSync(packagePathOnNodeModules).isSymbolicLink()) {
      const pathToWatch = findSymbolickLinkRealPath(packagePathOnNodeModules);
      console.log(coloredString(`  Linked package found at "${pathToWatch}"`));
    }
  });
}

export { config, hostURL, localURL };