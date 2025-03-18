#!/usr/bin/env node

import { Command } from 'commander';
import { createAuthCommand } from './commands/auth';
import { createCommit } from './commands/commit';
import { createPromptCommand } from './commands/prompt';
import { ConfigManager } from './config';
import { VERSION } from './utils/version';

const program = new Command();
const configManager = new ConfigManager();

program
  .name('aicommit')
  .description('AI-powered git commit message generator')
  .version(VERSION);

// Add the commit command as the default command
// Set up the default command (commit)
createCommit(program, configManager);
program.addCommand(createAuthCommand(configManager));
program.addCommand(createPromptCommand());

program.parse(process.argv);
