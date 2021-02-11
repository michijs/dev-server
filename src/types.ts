import { BuildOptions } from 'esbuild';

export type LsConfig = {
    hostname: string;
    port: number;
    publicPath: string;
    tsconfigPath: string;
    importCssAsCSSStyleSheet: boolean;
    openBrowser: boolean;
    showLinkedPackages: boolean;
    esbuildOptions: BuildOptions
}

export type LsServerConfig = (environment: string) => Partial<LsConfig>;
