#!/usr/bin/env node
import type { ServerConfig, UserConfig } from './types';
export type { ServerConfig, UserConfig };
import { cli } from './cli';
cli();