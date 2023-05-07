import { BuildOptions } from 'esbuild';
import type { WebAppManifest } from 'web-app-manifest';

export interface AssetDescriptorWeb {
  namespace: 'web';
  site: string;
}
export interface AssetDescriptorAndroid {
  namespace: 'android_app';
  package_name: string;
  /**
   * The sha256_cert_fingerprints field is a list of colon-separated hex strings.
   */
  sha256_cert_fingerprints: string[];
}
export interface AssetDescriptorIos {
  namespace: 'ios_app';
  appid: string;
}

export type AssetDescriptor =
  | AssetDescriptorWeb
  | AssetDescriptorAndroid
  | AssetDescriptorIos;

export interface WellKnown {
  /**
   * A Relation describes the nature of a statement, and consists of a kind and a detail.
   *
   * [Specification] {@link https://github.com/google/digitalassetlinks/blob/master/well-known/specification.md}
   *
   * @example [delegate_permission/common.handle_all_urls]
   * */
  relation: string[];
  target: AssetDescriptor;
}

export interface PublicOptions {
  /**
   * A URI with the path component /.well-known/assetlinks.json is used by the AssetLinks protocol to identify one or more digital assets (such as web sites or mobile apps) that are related to the hosting web site in some fashion.
   *
   * [Specification] {@link https://github.com/google/digitalassetlinks/blob/master/well-known/specification.md} */
  wellKnown?: WellKnown[];
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

export interface MichiProcessType {
  env: {
    BUILD_FILES: string[];
    CACHE_NAME: string;
    NODE_ENV: DefaultEnvironment;
  };
}

export type ServerConfigFactory<T extends string = DefaultEnvironment> = (
  environment: T,
) => ServerConfig;
