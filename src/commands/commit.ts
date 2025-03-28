import chalk from 'chalk';
import { exec } from 'child_process';
import { Command } from 'commander';
import inquirer from 'inquirer';
import { promisify } from 'util';
import { ConfigManager } from '../config';
import { AIService } from '../services/ai';
import { findAiCommitConfigPath, loadAiCommitConfig, loadAiCommitConfigFromPath } from '../utils/config';
import { createGitDiffCommandWithExclusions } from '../utils/git';

const execAsync = promisify(exec);

/**
 * Copy text to clipboard using platform-specific commands
 */
async function copyToClipboard(text: string): Promise<void> {
  try {
    // Use platform-specific clipboard commands for better compatibility
    const { platform } = await import('os');
    const os = platform();

    // Create a temporary file for the content to avoid shell escaping issues
    const { writeFile, mkdtemp, rm } = await import('fs/promises');
    const { join } = await import('path');
    const { tmpdir } = await import('os');

    // Create temp directory and file
    const tempDir = await mkdtemp(join(tmpdir(), 'aicommit-'));
    const tempFile = join(tempDir, 'commit-message.txt');

    // Write content to file
    await writeFile(tempFile, text, 'utf8');

    try {
      if (os === 'darwin') {
        // macOS
        await execAsync(`cat "${tempFile}" | pbcopy`);
      } else if (os === 'win32') {
        // Windows
        await execAsync(`type "${tempFile}" | clip`);
      } else if (os === 'linux') {
        // Linux with xclip
        try {
          await execAsync(`cat "${tempFile}" | xclip -selection clipboard`);
        } catch (e) {
          // Try xsel if xclip fails
          await execAsync(`cat "${tempFile}" | xsel --clipboard --input`);
        }
      }
    } finally {
      // Clean up temp files
      await rm(tempDir, { recursive: true, force: true });
    }
  } catch (error) {
    // Rethrow with more context for better error handling
    if (error instanceof Error) {
      throw new Error(`Failed to copy to clipboard: ${error.message}`);
    }
    throw error;
  }
}

async function getUserConfirmation(commitMessage: string): Promise<boolean> {
  const { confirm } = await inquirer.prompt([
    {
      type: 'list',
      name: 'confirm',
      message: `Do you want to commit with this message?`,
      choices: ['Yes', 'No'],
      default: 'Yes'
    }
  ]);
  return confirm === 'Yes';
}

export function createCommit(program: Command, configManager: ConfigManager) {
  program
    .option('-d, --dry-run', 'Generate commit message without creating a commit')
    .option('-p, --prompt-config <path>', 'Specify a custom path for the .aicommit.yml or .aicommit.yaml file')
    .option('-c, --copy', 'Copy the generated commit message to clipboard')
    .option('-s, --silent', 'Commit without confirmation')
    .action(async (options) => {
      try {
        // Check if we're in a git repository
        await execAsync('git rev-parse --is-inside-work-tree');

        // Find the config path first to get exclude patterns
        const customConfigPath = findAiCommitConfigPath(options.promptConfig);

        // Load the config and display which file is being used
        let aiCommitConfig;
        if (customConfigPath) {
          console.log(chalk.blue(`Using config from: ${customConfigPath}`));
          aiCommitConfig = loadAiCommitConfigFromPath(customConfigPath);
        } else {
          console.log(chalk.blue('Using default config (no .aicommit.yml or .aicommit.yaml file found)'));
          aiCommitConfig = loadAiCommitConfig();
        }

        // Log excluded patterns if any
        if (aiCommitConfig.exclude?.length > 0) {
          console.log(chalk.blue(`Excluding files matching patterns: ${aiCommitConfig.exclude.join(', ')}`));
        }
        
        // Build git diff command with exclude patterns (now async)
        const gitDiffCommand = await createGitDiffCommandWithExclusions(aiCommitConfig?.exclude);
        
        // Get staged changes with exclusions applied
        const { stdout: diff } = await execAsync(gitDiffCommand);

        if (!diff) {
          console.log(chalk.yellow('No staged changes found. Please stage your changes first using `git add`.'));
          return;
        }

        const config = configManager.getCurrentProviderConfig();

        const aiService = new AIService(config, aiCommitConfig);

        console.log(chalk.blue(`Generating commit message by ${config.model}...`));
        const commitMessage = await aiService.generateCommitMessage(diff);

        // Escape special characters for shell command
        const escapedMessage = commitMessage.replace(/"/g, '\\"')
          .replace(/`/g, '\\`');

        // Show the generated commit message
        console.log(chalk.cyan('Commit message:'));
        console.log(chalk.white(`${commitMessage}`));

        // Copy to clipboard if requested
        if (options.copy) {
          try {
            await copyToClipboard(commitMessage);
            console.log(chalk.green('Commit message copied to clipboard!'));
          } catch (clipboardError) {
            console.warn(chalk.yellow('Failed to copy to clipboard:', clipboardError));
          }
        }

        // If dry-run is enabled, don't create the commit
        if (options.dryRun) {
          console.log(chalk.green('Dry-run mode: No commit was created'));
          return;
        }

        // Skip confirmation if silent mode is enabled
        if (!options.silent) {
          // Wait for user confirmation
          const confirm = await getUserConfirmation(commitMessage);
          if (!confirm) {
            console.log(chalk.yellow('Commit cancelled'));
            return;
          }
        }

        // Create the commit with the generated message
        await execAsync(`git commit -m "${escapedMessage}"`);
        console.log(chalk.green('Successfully created commit with AI-generated message!'));

      } catch (error) {
        if (error instanceof Error) {
          console.error(chalk.red(`Error: ${error.message}`));
          process.exit(1);
        }
      }
    });
}
