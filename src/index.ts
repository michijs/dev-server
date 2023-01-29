#!/usr/bin/env node
export type { ServerConfigFactory, ServerConfig, PublicOptions, DefaultEnvironment } from './types';
import { cli } from './cli';
cli();