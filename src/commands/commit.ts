import chalk from 'chalk';
import { exec } from 'child_process';
import { Command } from 'commander';
import inquirer from 'inquirer';
import { promisify } from 'util';
import { ConfigManager } from '../config';
import { AIService } from '../services/ai';

const execAsync = promisify(exec);

async function getUserConfirmation(commitMessage: string): Promise<boolean> {
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: `Do you want to commit with this message?`,
      default: true
    }
  ]);
  return confirm;
}

export async function createCommit(configManager: ConfigManager, { dryRun = false }) {
  try {
    // Check if we're in a git repository
    await execAsync('git rev-parse --is-inside-work-tree');

    // Get staged changes
    const { stdout: diff } = await execAsync('git diff --staged');

    if (!diff) {
      console.log(chalk.yellow('No staged changes found. Please stage your changes first using `git add`.'));
      return;
    }

    const config = configManager.getCurrentProviderConfig();
    const aiService = new AIService(config);

    console.log(chalk.blue(`Generating commit message by ${config.model}...`));
    const commitMessage = await aiService.generateCommitMessage(diff);

    // Show the generated commit message
    console.log(chalk.cyan('Commit message:'));
    console.log(chalk.white(`${commitMessage}`));

    // If dry-run is enabled, don't create the commit
    if (dryRun) {
      console.log(chalk.blue('Dry-run mode: No commit was created'));
      return;
    }

    // Wait for user confirmation
    const confirm = await getUserConfirmation(commitMessage);
    if (!confirm) {
      console.log(chalk.yellow('Commit cancelled'));
      return;
    }

    const escapedMessage = commitMessage.replace(/"/g, '\\"')
      .replace(/`/g, '\\`');

    // Create the commit with the generated message
    await execAsync(`git commit -m "${escapedMessage}"`);
    console.log(chalk.green('Successfully created commit with AI-generated message!'));

  } catch (error) {
    if (error instanceof Error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  }
}

export function createCommitCommand(configManager: ConfigManager): Command {
  const commit = new Command('commit');

  commit
    .description('Generate AI-powered git commit message')
    .option('-d, --dry-run', 'Generate commit message without creating a commit')
    .action((options) => createCommit(configManager, { dryRun: options.dryRun }));

  return commit;
}
