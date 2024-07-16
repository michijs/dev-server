import type { BuildOptions } from "esbuild";
import type { ImageResource, WebAppManifest } from "web-app-manifest";
import type { assetsSizes } from "./constants.js";
import type { Page } from "puppeteer";

export interface AssetDescriptorWeb {
  namespace: "web";
  site: string;
}
export interface AssetDescriptorAndroid {
  namespace: "android_app";
  package_name: string;
  /**
   * The sha256_cert_fingerprints field is a list of colon-separated hex strings.
   */
  sha256_cert_fingerprints: string[];
}
export interface AssetDescriptorIos {
  namespace: "ios_app";
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

export interface PageCallback<R = string | void> {
  /**
   * @returns A folder name suffix
   */
  (page: Page): Promise<R> | R;
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

  assets?: {
    /**
     * Assets folder path
     * @default assets
     */
    path?: string;
    /**
     * Screenshots to take
     */
    screenshots?: {
      /**
       * Paths to use.
       * @example ["/demo"]
       */
      paths?: string[];
      /**
       * An array of callbacks used to manipulate the page. Each callback returns the folder name suffix
       * @example
       * [
       *  async (page) => {
       *   await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);
       *   return 'dark'
       *  }
       * ]
       */
      pageCallbacks?: PageCallback[];
    };
    /**
     * Feature image to take
     */
    featureImage?: {
      /**
       * Path to use.
       * @example "/demo"
       */
      path?: string;
      /**
       * A callback used to manipulate the page.
       * @example
       * async (page) => {
       *  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);
       * }
       */
      pageCallback?: PageCallback<void>;
    };
  };

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
    options?: WebAppManifest & {
      file_handlers?: FileHandler[];
    };
  };
}

export interface FileHandler {
  action: string;
  name: string;
  icons: ImageResource[];
  accept: Record<string, Set<string> | string[]>;
}

export interface Config {
  /**
   * If the server should watch for changes on the folders
   * @default true
   */
  watch?: boolean;
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

export type DefaultEnvironment = "PRODUCTION" | "DISTRIBUTION" | "DEVELOPMENT";

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

export interface ServerConfigFactoryProps<T extends string> {
  assetsSizes: typeof assetsSizes;
  environment: T;
}

export type ServerConfigFactory<T extends string = DefaultEnvironment> = (
  props: ServerConfigFactoryProps<T>,
) => ServerConfig;
