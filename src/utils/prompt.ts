import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { DEFAULT_PROMPT_CONFIG, PromptConfig } from '../types/prompt';
import { CONFIG_DIR } from './paths';

// File name for the prompt configuration
export const PROMPT_CONFIG_FILENAME = '.aicommit.md';

/**
 * Parse a markdown file into a PromptConfig object
 * 
 * Expected format:
 * # System Prompt
 * [system prompt content]
 * 
 * # User Prompt Template
 * [user prompt template content]
 */
export function parsePromptMarkdown(content: string): PromptConfig {
  const systemPromptRegex = /# System Prompt\s*\n([\s\S]*?)(?=\n# User Prompt Template|\n# |$)/;
  const userPromptRegex = /# User Prompt Template\s*\n([\s\S]*?)(?=\n# |$)/;

  const systemPromptMatch = systemPromptRegex.exec(content);
  const userPromptMatch = userPromptRegex.exec(content);

  return {
    systemPrompt: systemPromptMatch?.[1]?.trim() ?? DEFAULT_PROMPT_CONFIG.systemPrompt,
    userPromptTemplate: userPromptMatch?.[1]?.trim() ?? DEFAULT_PROMPT_CONFIG.userPromptTemplate
  };
}

/**
 * Find the path to the prompt configuration file
 * Searches in the following locations in order:
 * 1. Custom path (if provided)
 * 2. Current working directory
 * 3. Config directory (~/.config/aicommit)
 * 
 * @param customPath Optional custom path to the .aicommit.md file
 * @returns The path to the prompt config file, or null if not found
 */
export function findPromptConfigPath(customPath?: string): string | null {
  // Try custom path first if provided
  if (customPath && existsSync(customPath)) {
    return customPath;
  }

  // Try current directory next
  const cwdConfigPath = join(process.cwd(), PROMPT_CONFIG_FILENAME);
  if (existsSync(cwdConfigPath)) {
    return cwdConfigPath;
  }

  // Try config directory next
  const globalConfigPath = join(CONFIG_DIR, PROMPT_CONFIG_FILENAME);
  if (existsSync(globalConfigPath)) {
    return globalConfigPath;
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
    return parsePromptMarkdown(content);
  } catch (error) {
    console.warn(`Warning: Failed to parse prompt config from ${configPath}`);
    return DEFAULT_PROMPT_CONFIG;
  }
}

/**
 * Load prompt configuration from a markdown file
 * Searches in the following locations in order:
 * 1. Custom path (if provided)
 * 2. Current working directory
 * 3. Config directory (~/.config/aicommit)
 * 4. Falls back to default if no file is found
 *
 * @param customPath Optional custom path to the .aicommit.md file
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
