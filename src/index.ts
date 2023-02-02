#!/usr/bin/env node
export type { ServerConfigFactory, ServerConfig, PublicOptions, DefaultEnvironment, ProcessSWType, ProcessType } from './types';
import { cli } from './cli';
cli();