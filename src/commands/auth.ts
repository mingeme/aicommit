import chalk from 'chalk';
import { Command } from 'commander';
import { ConfigManager } from '../config';
import { PROVIDER_LIST } from '../types/config';

export function createAuthCommand(configManager: ConfigManager): Command {
  const auth = new Command('auth')
    .description('Manage API providers authentication');

  auth
    .command('add')
    .description('Add a new provider configuration')
    .argument('<provider>', `Provider name (${PROVIDER_LIST.join(', ')})`)
    .argument('<apiKey>', 'API key for the provider')
    .option('-e, --endpoint <endpoint>', 'API endpoint URL')
    .action((provider: string, apiKey: string, options) => {
      try {
        configManager.addProvider(provider, {
          apiKey: apiKey,
          endpoint: options.endpoint || ''
        });
        console.log(chalk.green(`✓ Successfully added configuration for ${provider}`));
      } catch (error) {
        console.error(chalk.red(`Error: ${(error as Error).message}`));
      }
    });

  auth
    .command('list')
    .description('List all configured providers')
    .action(() => {
      const providers = configManager.listProviders();
      const currentProvider = configManager.getCurrentProvider();

      if (Object.keys(providers).length === 0) {
        console.log(chalk.yellow('No providers configured yet.'));
        return;
      }

      console.log(chalk.blue('Configured Providers:'));
      Object.entries(providers).forEach(([name, config]) => {
        const isCurrent = name === currentProvider;
        const prefix = isCurrent ? chalk.green('* ') : '  ';
        console.log(`${prefix}${name}`);
        console.log(`    API Key: ${config.apiKey}`);
        if (config.endpoint) {
          console.log(`    Endpoint: ${config.endpoint}`);
        }
      });
    });

  auth
    .command('use')
    .description('Switch to a different provider')
    .argument('<provider>', 'Provider name to switch to')
    .action((provider: string) => {
      try {
        configManager.setCurrentProvider(provider);
        console.log(chalk.green(`✓ Switched to ${provider}`));
      } catch (error) {
        console.error(chalk.red(`Error: ${(error as Error).message}`));
      }
    });

  return auth;
}
