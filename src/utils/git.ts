/**
 * Utility functions for Git operations
 */
import { exec } from 'child_process';
import { promisify } from 'util';
import { filterExcludedFiles, createGitDiffForFiles } from './filePatterns';

const execAsync = promisify(exec);

/**
 * Gets a list of staged files
 * 
 * @returns Array of staged file paths
 */
export async function getStagedFiles(): Promise<string[]> {
  try {
    const { stdout } = await execAsync('git diff --staged --name-only');
    return stdout.trim().split('\n').filter(Boolean);
  } catch (error) {
    console.error('Error getting staged files:', error);
    return [];
  }
}

/**
 * Creates a git diff command with exclude patterns
 * Supports recursive glob patterns like '**\/package-lock.json'
 * 
 * @param excludePatterns Array of file patterns to exclude
 * @returns Formatted git diff command with exclusions
 */
export async function createGitDiffCommandWithExclusions(excludePatterns?: string[]): Promise<string> {
  // If no exclude patterns, return the basic command
  if (!excludePatterns || excludePatterns.length === 0) {
    return 'git diff --staged';
  }
  
  // Get all staged files
  const stagedFiles = await getStagedFiles();
  
  // Filter out excluded files using the filePatterns module
  const includedFiles = filterExcludedFiles(stagedFiles, excludePatterns);
  
  // Create diff command for included files
  return createGitDiffForFiles(includedFiles);
}
