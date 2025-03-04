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
 * Load prompt configuration from a markdown file
 * Searches in the following locations in order:
 * 1. Current working directory
 * 2. Config directory (~/.config/aicommit)
 * 3. Falls back to default if no file is found
 */
export function loadPromptConfig(): PromptConfig {
  // Try current directory first
  const cwdConfigPath = join(process.cwd(), PROMPT_CONFIG_FILENAME);
  if (existsSync(cwdConfigPath)) {
    try {
      const content = readFileSync(cwdConfigPath, 'utf-8');
      return parsePromptMarkdown(content);
    } catch (error) {
      console.warn(`Warning: Failed to parse prompt config from ${cwdConfigPath}`);
    }
  }
  
  // Try config directory next
  const globalConfigPath = join(CONFIG_DIR, PROMPT_CONFIG_FILENAME);
  if (existsSync(globalConfigPath)) {
    try {
      const content = readFileSync(globalConfigPath, 'utf-8');
      return parsePromptMarkdown(content);
    } catch (error) {
      console.warn(`Warning: Failed to parse prompt config from ${globalConfigPath}`);
    }
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
