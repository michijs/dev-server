#!/usr/bin/env node
import type { LsServerConfig, UserConfig } from './types';
export type { LsServerConfig, UserConfig };
import { cli } from './cli';
cli();