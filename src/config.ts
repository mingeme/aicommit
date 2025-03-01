import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { DEFAULT_ENDPOINTS } from './constants';
import { Config, Provider, ProviderConfig, isValidProvider } from './types/config';
import { CONFIG_DIR, CONFIG_FILE } from './utils/paths';

export class ConfigManager {
  private readonly config: Config;

  constructor() {
    this.config = this.loadConfig();
  }

  public getConfig(): Config {
    return this.config;
  }

  private loadConfig(): Config {
    try {
      // Create config directory if it doesn't exist
      if (!existsSync(CONFIG_DIR)) {
        mkdirSync(CONFIG_DIR, { recursive: true });
      }

      // Load existing config or create default
      if (existsSync(CONFIG_FILE)) {
        const fileContent = readFileSync(CONFIG_FILE, 'utf-8');
        return JSON.parse(fileContent);
      }

      // Default config
      const defaultConfig: Config = {
        currentProvider: '',
        providers: {}
      };

      // Save default config
      this.saveConfig(defaultConfig);
      return defaultConfig;
    } catch (error) {
      console.error('Error loading config:', error);
      throw new Error('Failed to load configuration');
    }
  }

  private saveConfig(config: Config = this.config): void {
    try {
      writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    } catch (error) {
      console.error('Error saving config:', error);
      throw new Error('Failed to save configuration');
    }
  }

  getCurrentProvider(): Provider | '' {
    return this.config.currentProvider;
  }

  getCurrentProviderConfig(): ProviderConfig {
    return this.getProviderConfig(this.config.currentProvider);
  }

  getProviderConfig(provider: string): ProviderConfig {
    if (!isValidProvider(provider)) {
      throw new Error(`Invalid provider: ${provider}. Must be one of: ${Object.values(Provider).join(', ')}`);
    }
    const config = this.config.providers[provider];
    if (!config) {
      throw new Error(`Provider ${provider} not found in configuration`);
    }
    return config;
  }

  setCurrentProvider(provider: string): void {
    if (!isValidProvider(provider)) {
      throw new Error(`Invalid provider: ${provider}. Must be one of: ${Object.values(Provider).join(', ')}`);
    }
    if (!(provider in this.config.providers)) {
      throw new Error(`Provider ${provider} not found in configuration`);
    }
    this.config.currentProvider = provider;
    this.saveConfig();
  }

  addProvider(provider: string, config: ProviderConfig): void {
    if (!isValidProvider(provider)) {
      throw new Error(`Invalid provider: ${provider}. Must be one of: ${Object.values(Provider).join(', ')}`);
    }

    // Use default endpoint if not provided
    const endpoint = config.endpoint ?? DEFAULT_ENDPOINTS[provider];

    this.config.providers[provider] = {
      ...config,
      endpoint
    };

    // If this is the first provider, set it as current
    if (!this.config.currentProvider) {
      this.config.currentProvider = provider;
    }
    this.saveConfig();
  }

  listProviders(): Record<string, ProviderConfig> {
    return { ...this.config.providers };
  }
}
