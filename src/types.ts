import { BuildOptions } from 'esbuild';

export type PublicOptions = {
    path: string;
    indexName: string;
    minifyIndex: boolean;
}

export type LsConfig = {
    hostname: string;
    port: number;
    public: PublicOptions;
    importCssAsCSSStyleSheet: boolean;
    openBrowser: boolean;
    showLinkedPackages: boolean;
    esbuildOptions: BuildOptions
}

type DeepPartial<T> = {
    [P in keyof T]?: DeepPartial<T[P]>;
};

export type UserConfig = Omit<DeepPartial<LsConfig>, 'esbuildOptions'> & { esbuildOptions?: BuildOptions };

export type LsServerConfig = (environment: string) => UserConfig;
