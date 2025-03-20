import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { parse, stringify } from 'yaml';
import { DEFAULT_PROMPT_CONFIG, PromptConfig } from '../types/prompt';
import { CONFIG_DIR } from './paths';

// File names for the prompt configuration
export const PROMPT_CONFIG_FILENAMES = ['.aicommit.yml', '.aicommit.yaml'];
export const PROMPT_CONFIG_FILENAME = PROMPT_CONFIG_FILENAMES[0]; // Default filename for creating new files

/**
 * Parse a YAML file into a PromptConfig object
 * 
 * Expected format:
 * prompt:
 *   system: |
 *     [system prompt content]
 *   user: |
 *     [user prompt template content]
 */
export function parsePromptYaml(content: string): PromptConfig {
  try {
    // Parse YAML content
    const parsed = parse(content) as Partial<PromptConfig>;
    
    // Extract values from the nested format
    if (parsed.prompt && typeof parsed.prompt === 'object') {
      return {
        prompt: {
          system: parsed.prompt.system?.trim() ?? DEFAULT_PROMPT_CONFIG.prompt.system,
          user: parsed.prompt.user?.trim() ?? DEFAULT_PROMPT_CONFIG.prompt.user
        }
      };
    } else {
      // If prompt object is missing or invalid, use defaults
      console.warn('Warning: YAML config missing or has invalid prompt structure');
      return DEFAULT_PROMPT_CONFIG;
    }
  } catch (error) {
    console.warn(`Warning: Failed to parse YAML content: ${error}`); 
    return DEFAULT_PROMPT_CONFIG;
  }
}

/**
 * Find the path to the prompt configuration file
 * Searches in the following locations in order:
 * 1. Custom path (if provided)
 * 2. Current working directory
 * 3. Config directory (~/.config/aicommit)
 * 
 * @param customPath Optional custom path to the .aicommit.yml file
 * @returns The path to the prompt config file, or null if not found
 */
export function findPromptConfigPath(customPath?: string): string | null {
  // Try custom path first if provided
  if (customPath && existsSync(customPath)) {
    return customPath;
  }

  // Try all possible filenames in current directory
  for (const filename of PROMPT_CONFIG_FILENAMES) {
    const cwdConfigPath = join(process.cwd(), filename);
    if (existsSync(cwdConfigPath)) {
      return cwdConfigPath;
    }
  }

  // Try all possible filenames in config directory
  for (const filename of PROMPT_CONFIG_FILENAMES) {
    const globalConfigPath = join(CONFIG_DIR, filename);
    if (existsSync(globalConfigPath)) {
      return globalConfigPath;
    }
  }

  // No config file found
  return null;
}

/**
 * Load prompt configuration from a file path
 * 
 * @param configPath Path to the prompt config file
 * @returns The parsed prompt configuration
 */
export function loadPromptConfigFromPath(configPath: string): PromptConfig {
  try {
    const content = readFileSync(configPath, 'utf-8');
    return parsePromptYaml(content);
  } catch (error) {
    console.warn(`Warning: Failed to parse prompt config from ${configPath}`);
    return DEFAULT_PROMPT_CONFIG;
  }
}

/**
 * Load prompt configuration from a YAML file
 * Searches in the following locations in order:
 * 1. Custom path (if provided)
 * 2. Current working directory
 * 3. Config directory (~/.config/aicommit)
 * 4. Falls back to default if no file is found
 *
 * @param customPath Optional custom path to the .aicommit.yml file
 */
export function loadPromptConfig(customPath?: string): PromptConfig {
  const configPath = findPromptConfigPath(customPath);

  if (configPath) {
    return loadPromptConfigFromPath(configPath);
  }

  // Fall back to default
  return DEFAULT_PROMPT_CONFIG;
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
