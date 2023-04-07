#!/usr/bin/env node
export type {
  ServerConfigFactory,
  ServerConfig,
  PublicOptions,
  DefaultEnvironment,
  ProcessSWType,
  ProcessType,
} from './types.js';
import { cli } from './cli.js';
cli();
