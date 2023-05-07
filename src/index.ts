#!/usr/bin/env node
export type {
  ServerConfigFactory,
  ServerConfig,
  PublicOptions,
  DefaultEnvironment,
  MichiProcessType,
  AssetDescriptor,
  AssetDescriptorIos,
  AssetDescriptorAndroid,
  AssetDescriptorWeb,
} from './types.js';
import { cli } from './cli.js';
cli();
