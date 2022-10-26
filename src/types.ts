import { BuildOptions } from 'esbuild';

export type PublicOptions = {
    path: string;
    indexName: string;
    minifyIndex: boolean;
    serviceWorkerName?: string;
}

export type Config = {
    hostname: string;
    // protocol: 'http' | 'https';
    port: number;
    public: PublicOptions;
    openBrowser: boolean;
    showLinkedPackages: boolean;
    esbuildOptions: BuildOptions
}

type DeepPartial<T> = {
    [P in keyof T]?: DeepPartial<T[P]>;
};

export type UserConfig = Omit<DeepPartial<Config>, 'esbuildOptions'> & { esbuildOptions?: BuildOptions, env?: {[key: string]: any} };

export type ServerConfig = (environment: string) => UserConfig;
