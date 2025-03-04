import chalk from 'chalk';
import { Command } from 'commander';
import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import { DEFAULT_PROMPT_MARKDOWN } from '../constants';
import { CONFIG_DIR } from '../utils/paths';
import { PROMPT_CONFIG_FILENAME, loadPromptConfig } from '../utils/prompt';

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
          ? join(CONFIG_DIR, PROMPT_CONFIG_FILENAME)
          : join(process.cwd(), PROMPT_CONFIG_FILENAME);

        // Check if file already exists
        if (existsSync(targetPath)) {
          console.log(chalk.yellow(`Prompt configuration already exists at ${targetPath}`));
          return;
        }

        // Create the file with default content
        writeFileSync(targetPath, DEFAULT_PROMPT_MARKDOWN);
        console.log(chalk.green(`✓ Created prompt configuration at ${targetPath}`));
      } catch (error) {
        console.error(chalk.red(`Error: ${(error as Error).message}`));
      }
    });

  prompt
    .command('show')
    .description('Show current prompt configuration')
    .action(() => {
      try {
        const config = loadPromptConfig();

        console.log(chalk.blue('Current Prompt Configuration:'));
        console.log(chalk.cyan('\nSystem Prompt:'));
        console.log(config.systemPrompt);

        console.log(chalk.cyan('\nUser Prompt Template:'));
        console.log(config.userPromptTemplate);
      } catch (error) {
        console.error(chalk.red(`Error: ${(error as Error).message}`));
      }
    });

  return prompt;
}
