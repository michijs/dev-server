import { BuildOptions } from 'esbuild';

export type LsConfig = {
    hostname: string;
    port: number;
    publicPath: string;
    watchDir: string[];
    tsconfigPath: string;
    importCssAsCSSStyleSheet: boolean;
    openBrowser: boolean;
    watchLinkedPackages: boolean;
    esbuildOptions: BuildOptions
}

export type LsServerConfig = (environment: string) => Partial<LsConfig>;
