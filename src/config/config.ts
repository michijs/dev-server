import fs from 'fs';
import { LsConfig } from '../types';
import coloredString from '../utils/coloredString';
import { getPath } from '../utils/getPath';
import { DEFAULT_CONFIG } from './constants';
import { userConfig } from './userConfig';

const config: LsConfig = {
  ...DEFAULT_CONFIG,
  ...userConfig,
  public: {
    ...DEFAULT_CONFIG.public,
    ...(userConfig.public || {}),
  },
  esbuildOptions: {
    ...DEFAULT_CONFIG.esbuildOptions,
    ...userConfig.esbuildOptions,
    inject: [
      ...DEFAULT_CONFIG.esbuildOptions.inject,
      ...(userConfig.esbuildOptions?.inject || []),
    ],
    define: {
      ...DEFAULT_CONFIG.esbuildOptions.define,
      ...(userConfig.esbuildOptions?.define || {}),
    },
    plugins: [
      ...DEFAULT_CONFIG.esbuildOptions.plugins,
      ...(userConfig.esbuildOptions?.plugins || []),
    ]
  }
};

const hostURLHTTP = `http://${config.hostname}:${config.port}`;
const localURLHTTP = `http://localhost:${config.port}`;

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

export { config, hostURLHTTP, localURLHTTP };