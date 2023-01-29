import fs from 'fs';
import { Config } from '../types';
import coloredString from '../utils/coloredString';
import { getPath } from '../utils/getPath';
import Timer from '../utils/timer';
import { getIPAddress } from './getIPAddress';
import { userConfig } from './userConfig';

const minify = process.env.NODE_ENV === 'PRODUCTION';
const devServerListener = process.env.NODE_ENV === 'DEVELOPMENT' ? [getPath(`${__dirname}/public/client.js`)] : [];
const config: Required<Config> = {
  port: 3000,
  openBrowser: process.env.NODE_ENV === 'DEVELOPMENT',
  showLinkedPackages: true,
  ...userConfig,
  // protocol: 'http',
  public: {
    path: 'public',
    indexName: 'index.html',
    minifyIndex: minify,
    ...(userConfig.public ?? {})
  },
  esbuildOptions: {
    outdir: 'build',
    tsconfig: 'tsconfig.json',
    minifySyntax: minify,
    minifyWhitespace: minify,
    sourcemap: process.env.NODE_ENV !== 'PRODUCTION',
    bundle: true,
    keepNames: minify,
    entryPoints: ['src/index.ts'],
    format: 'esm',
    target: 'esnext',
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
        name: 'track-build-time',
        setup(build) {
          let timer = new Timer();
          build.onStart(() => timer.startTimer())
          build.onEnd(() => {
            console.log(coloredString(`  Build finished in ${timer.endTimer()}ms`))
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

function findSymbolickLinkRealPath(path) {
  if (fs.lstatSync(path).isSymbolicLink()) {
    return findSymbolickLinkRealPath(fs.readlinkSync(path));
  }
  return path;
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