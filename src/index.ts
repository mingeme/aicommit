#!/usr/bin/env node

import { Command } from 'commander';
import { createAuthCommand } from './commands/auth';
import { createCommit } from './commands/commit';
import { ConfigManager } from './config';

const program = new Command();
const configManager = new ConfigManager();

program
  .name('aicommit')
  .description('AI-powered git commit message generator')
  .version('1.0.0');

program.action(() => createCommit(configManager));
program.addCommand(createAuthCommand(configManager));

program.parse(process.argv);
