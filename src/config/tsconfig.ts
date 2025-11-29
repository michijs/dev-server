import { config } from "./config.js";
import fs from "fs";
import path from "path";
import type { CompilerOptions } from "typescript";

interface TsConfig {
  compilerOptions: CompilerOptions;
  include: string[];
  exclude: string[];
  files: string[];
  extends?: string;
}

function readConfigFile(filePath: string): TsConfig {
  const absolutePath = path.resolve(filePath);
  const rawContent = fs.readFileSync(absolutePath, "utf8");

  return JSON.parse(rawContent) as TsConfig;
}

function mergeConfigs(baseConfig: any, additionalConfig: any): any {
  // Merge compilerOptions
  const mergedCompilerOptions = {
    ...baseConfig.compilerOptions,
    ...additionalConfig.compilerOptions,
  };

  // Merge include, exclude, files
  const mergedInclude = [
    ...(baseConfig.include || []),
    ...(additionalConfig.include || []),
  ];
  const mergedExclude = [
    ...(baseConfig.exclude || []),
    ...(additionalConfig.exclude || []),
  ];
  const mergedFiles = [
    ...(baseConfig.files || []),
    ...(additionalConfig.files || []),
  ];

  return {
    ...baseConfig,
    ...additionalConfig,
    compilerOptions: mergedCompilerOptions,
    include: mergedInclude,
    exclude: mergedExclude,
    files: mergedFiles,
  };
}

function getFullConfig(filePath: string): TsConfig {
  const config = readConfigFile(filePath);

  if (config.extends) {
    const parentConfigPath = path.resolve(
      path.dirname(filePath),
      config.extends.startsWith("@")
        ? `node_modules/${config.extends.endsWith(".json") ? config.extends : `${config.extends}.json`}`
        : config.extends,
    );
    const parentConfig = getFullConfig(parentConfigPath);
    return mergeConfigs(parentConfig, config);
  }

  return config;
}

export const tsconfig = getFullConfig(
  config.esbuildOptions.tsconfig ?? "tsconfig.json",
);
