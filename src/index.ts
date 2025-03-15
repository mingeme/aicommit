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
program
  .option('-d, --dry-run', 'Generate commit message without creating a commit')
  .option('-p, --prompt-config <path>', 'Specify a custom path for the .aicommit.md file')
  .action((options) => createCommit(configManager, {
    dryRun: options.dryRun,
    promptConfigPath: options.promptConfig
  }));
program.addCommand(createAuthCommand(configManager));
program.addCommand(createPromptCommand());

program.parse(process.argv);
