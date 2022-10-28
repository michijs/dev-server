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

type DefaultEnvironment = 'PRODUCTION' | 'DISTRIBUTION' | 'DEVELOPMENT';

declare global {
    interface process {
        env: {
            NODE_ENV: DefaultEnvironment,
            BUILD_FILES: string[],
            CACHE_NAME: string
        }
    }
}

export type UserConfig = Omit<DeepPartial<Config>, 'esbuildOptions'> & { esbuildOptions?: BuildOptions, env?: {[key: string]: any} };

export type ServerConfig = (environment: DefaultEnvironment) => UserConfig;
