import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { parse, stringify } from 'yaml';
import { DEFAULT_AICOMMIT_CONFIG, AiCommitConfig } from '../types/aicommit';
import { CONFIG_DIR } from './paths';

// File names for the aicommit configuration
export const AICOMMIT_CONFIG_FILENAMES = ['.aicommit.yml', '.aicommit.yaml'];
export const AICOMMIT_CONFIG_FILENAME = AICOMMIT_CONFIG_FILENAMES[0]; // Default filename for creating new files

/**
 * Parse a YAML file into a AiCommitConfig object
 * 
 * Expected format:
 * prompt:
 *   system: |
 *     [system prompt content]
 *   user: |
 *     [user prompt template content]
 * exclude:
 *   - pattern1
 *   - pattern2
 */
export function parseAiCommitYaml(content: string): AiCommitConfig {
  try {
    // Parse YAML content
    const parsed = parse(content) as Partial<AiCommitConfig>;
    
    // Extract values from the nested format
    const result: AiCommitConfig = {
      prompt: {
        system: DEFAULT_AICOMMIT_CONFIG.prompt.system,
        user: DEFAULT_AICOMMIT_CONFIG.prompt.user
      },
      exclude: []
    };

    // Set prompt values if available
    if (parsed.prompt && typeof parsed.prompt === 'object') {
      result.prompt.system = parsed.prompt.system?.trim() ?? DEFAULT_AICOMMIT_CONFIG.prompt.system;
      result.prompt.user = parsed.prompt.user?.trim() ?? DEFAULT_AICOMMIT_CONFIG.prompt.user;
    } else {
      console.warn('Warning: YAML config missing or has invalid prompt structure');
    }

    // Set exclude patterns if available
    if (Array.isArray(parsed.exclude)) {
      result.exclude = parsed.exclude.filter(pattern => typeof pattern === 'string');
    }

    return result;
  } catch (error) {
    console.warn(`Warning: Failed to parse YAML content: ${error}`); 
    return DEFAULT_AICOMMIT_CONFIG;
  }
}

/**
 * Find the path to the aicommit configuration file
 * Searches in the following locations in order:
 * 1. Custom path (if provided)
 * 2. Current working directory
 * 3. Config directory (~/.config/aicommit)
 * 
 * @param customPath Optional custom path to the .aicommit.yml file
 * @returns The path to the aicommit config file, or null if not found
 */
export function findAiCommitConfigPath(customPath?: string): string | null {
  // Try custom path first if provided
  if (customPath && existsSync(customPath)) {
    return customPath;
  }

  // Try all possible filenames in current directory
  for (const filename of AICOMMIT_CONFIG_FILENAMES) {
    const cwdConfigPath = join(process.cwd(), filename);
    if (existsSync(cwdConfigPath)) {
      return cwdConfigPath;
    }
  }

  // Try all possible filenames in config directory
  for (const filename of AICOMMIT_CONFIG_FILENAMES) {
    const globalConfigPath = join(CONFIG_DIR, filename);
    if (existsSync(globalConfigPath)) {
      return globalConfigPath;
    }
  }

  // No config file found
  return null;
}

/**
 * Load aicommit configuration from a file path
 * 
 * @param configPath Path to the aicommit config file
 * @returns The parsed aicommit configuration
 */
export function loadAiCommitConfigFromPath(configPath: string): AiCommitConfig {
  try {
    const content = readFileSync(configPath, 'utf-8');
    return parseAiCommitYaml(content);
  } catch (error) {
    console.warn(`Warning: Failed to parse aicommit config from ${configPath}`);
    return DEFAULT_AICOMMIT_CONFIG;
  }
}

/**
 * Load aicommit configuration from a YAML file
 * Searches in the following locations in order:
 * 1. Custom path (if provided)
 * 2. Current working directory
 * 3. Config directory (~/.config/aicommit)
 * 4. Falls back to default if no file is found
 *
 * @param customPath Optional custom path to the .aicommit.yml file
 */
export function loadAiCommitConfig(customPath?: string): AiCommitConfig {
  const configPath = findAiCommitConfigPath(customPath);

  if (configPath) {
    return loadAiCommitConfigFromPath(configPath);
  }

  // Fall back to default
  return DEFAULT_AICOMMIT_CONFIG;
}

/**
 * Apply variables to a template string
 * Currently supports:
 * - {{diff}} - Git diff content
 */
export function applyTemplateVariables(template: string, variables: Record<string, string>): string {
  let result = template;

  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }

  return result;
}
