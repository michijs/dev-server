import { BuildOptions } from 'esbuild';

export type PublicOptions = {
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
   * If the main html needs to be minified
   * @default true if environment is PRODUCTION 
  */
  minifyIndex?: boolean;
  /**Service worker name in public folder */
  serviceWorkerName?: string;
}

export type Config = {
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
  esbuildOptions?: BuildOptions
}

// type DeepPartial<T> = {
//   [P in keyof T]?: DeepPartial<T[P]>;
// };

export type DefaultEnvironment = 'PRODUCTION' | 'DISTRIBUTION' | 'DEVELOPMENT';


export type ServerConfig = Config & { 
  /**
   * Allows to add environment variables
   */
  env?: { [key: string]: any } 
};

export type ServerConfigFactory<T extends string = DefaultEnvironment> = (environment: T) => ServerConfig;
