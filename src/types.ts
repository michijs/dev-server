import { BuildOptions } from 'esbuild';
import type { WebAppManifest } from 'web-app-manifest';

export interface PublicOptions {
  /**
   * Public folder path
   * @default public
   */
  path?: string;
  /**
   * Main html file to be served
   * @default index.html
   * */
  indexName?: string;
  /**
   * If html/svg/json/xml files to be minified
   * @default true if environment is PRODUCTION
   */
  minify?: boolean;

  /**
   * Is a JSON document that contains startup parameters and application defaults for when a web application is launched.
   *
   * @see https://w3c.github.io/manifest/#webappmanifest-dictionary
   */
  manifest?: {
    /**
     * Document name
     * @default manifest.json
     */
    name?: string;
    /**
     * startup parameters and application defaults for when a web application is launched.
     */
    options?: WebAppManifest;
  };
}

export interface Config {
  // protocol: 'http' | 'https';
  /**
   * Port to run dev server on
   * @default 3000
   */
  port?: number;
  /**Public folder - will be copied at server start */
  public?: PublicOptions;
  /**
   * If the browser should open at localhost url when server starts
   * @default true
   */
  openBrowser?: boolean;
  /**
   * Show linked packages of the proyect
   * @default true
   */
  showLinkedPackages?: boolean;
  /** Documentation: https://esbuild.github.io/plugins/#build-options */
  esbuildOptions?: BuildOptions;
}

// type DeepPartial<T> = {
//   [P in keyof T]?: DeepPartial<T[P]>;
// };

export type DefaultEnvironment = 'PRODUCTION' | 'DISTRIBUTION' | 'DEVELOPMENT';

export interface ServerConfig extends Config {
  /**
   * Allows to add environment variables
   */
  env?: { [key: string]: any };
}

export interface ProcessType {
  env: {
    NODE_ENV: DefaultEnvironment;
  };
}
export interface ProcessSWType {
  env: {
    BUILD_FILES: string[];
    CACHE_NAME: string;
  };
}

export type ServerConfigFactory<T extends string = DefaultEnvironment> = (
  environment: T,
) => ServerConfig;
