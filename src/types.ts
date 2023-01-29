import { BuildOptions } from 'esbuild';

export type PublicOptions = {
  path?: string;
  indexName?: string;
  minifyIndex?: boolean;
  serviceWorkerName?: string;
}

export type Config = {
  // protocol: 'http' | 'https';
  port?: number;
  public?: PublicOptions;
  openBrowser?: boolean;
  showLinkedPackages?: boolean;
  esbuildOptions?: BuildOptions
}

// type DeepPartial<T> = {
//   [P in keyof T]?: DeepPartial<T[P]>;
// };

export type DefaultEnvironment = 'PRODUCTION' | 'DISTRIBUTION' | 'DEVELOPMENT';

export type ServerConfig = Config & { 
  /**
   * Environment variables
   */
  env?: { [key: string]: any } 
};

export type ServerConfigFactory<T extends string = DefaultEnvironment> = (environment: T) => ServerConfig;
