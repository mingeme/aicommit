import chalk from 'chalk';
import { Command } from 'commander';
import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import { DEFAULT_AICOMMIT_YAML } from '../constants';
import { CONFIG_DIR } from '../utils/paths';
import { AICOMMIT_CONFIG_FILENAME, loadAiCommitConfig } from '../utils/config';

export function createPromptCommand(): Command {
  const prompt = new Command('prompt')
    .description('Manage AI prompt configurations');

  prompt
    .command('init')
    .description('Create a new prompt configuration file')
    .option('-g, --global', 'Create in global config directory instead of current directory')
    .action((options) => {
      try {
        const targetPath = options.global
          ? join(CONFIG_DIR, AICOMMIT_CONFIG_FILENAME)
          : join(process.cwd(), AICOMMIT_CONFIG_FILENAME);

        // Check if file already exists
        if (existsSync(targetPath)) {
          console.log(chalk.yellow(`Prompt configuration already exists at ${targetPath}`));
          return;
        }

        // Create the file with default content
        writeFileSync(targetPath, DEFAULT_AICOMMIT_YAML);
        console.log(chalk.green(`✓ Created prompt configuration at ${targetPath}`));
      } catch (error) {
        console.error(chalk.red(`Error: ${(error as Error).message}`));
      }
    });

  prompt
    .command('show')
    .description('Show current aicommit configuration')
    .action(() => {
      try {
        const config = loadAiCommitConfig();

        console.log(chalk.blue('Current AiCommit Configuration:'));
        console.log(chalk.cyan('\nSystem Prompt:'));
        console.log(config.prompt.system);

        console.log(chalk.cyan('\nUser Prompt Template:'));
        console.log(config.prompt.user);
      } catch (error) {
        console.error(chalk.red(`Error: ${(error as Error).message}`));
      }
    });

  return prompt;
}
