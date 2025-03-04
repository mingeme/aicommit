#!/usr/bin/env node

import { Command } from 'commander';
import { createAuthCommand } from './commands/auth';
import { createCommit, createCommitCommand } from './commands/commit';
import { createPromptCommand } from './commands/prompt';
import { ConfigManager } from './config';

const program = new Command();
const configManager = new ConfigManager();

program
  .name('aicommit')
  .description('AI-powered git commit message generator')
  .version('1.0.0');

// Add the commit command as the default command
program
  .option('-d, --dry-run', 'Generate commit message without creating a commit')
  .action((options) => createCommit(configManager, { dryRun: options.dryRun }));
program.addCommand(createAuthCommand(configManager));
program.addCommand(createPromptCommand());

program.parse(process.argv);
