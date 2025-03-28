/**
 * Utility functions for file pattern matching
 */

/**
 * Checks if a file path matches a glob pattern
 * @param filePath The file path to check
 * @param pattern The glob pattern to match against
 * @returns boolean indicating if the file matches the pattern
 */
export function matchesGlobPattern(filePath: string, pattern: string): boolean {
  // Handle pattern with ** at both start and end (e.g., **/node_modules/**)
  if (pattern.startsWith('**/') && pattern.endsWith('/**')) {
    const middle = pattern.substring(3, pattern.length - 3);
    return filePath.includes(`/${middle}/`) || filePath.startsWith(`${middle}/`);
  }
  
  // For complex patterns with both **/ and *
  if (pattern.includes('**/') && pattern.includes('*') && !pattern.endsWith('**/')) {
    // Handle patterns like 'src/**/*.tsx'
    const [basePath, filePattern] = pattern.split('**/');
    return filePath.startsWith(basePath) && 
           (new RegExp(`.*${filePattern.replace(/\*/g, '.*').replace(/\./g, '\\.')}$`).test(filePath));
  }
  
  // Handle recursive pattern with **/ prefix
  if (pattern.startsWith('**/')) {
    const suffix = pattern.substring(3); // Remove **/ prefix
    // Check if the file path ends with the suffix at any level
    return filePath.endsWith(suffix) || filePath.includes(`/${suffix}`);
  }
  
  // Handle patterns with **/ in the middle
  if (pattern.includes('**/')) {
    const [prefix, suffix] = pattern.split('**/');
    // Check if the file path starts with prefix and ends with suffix
    return (prefix === '' || filePath.startsWith(prefix)) && 
           (suffix === '' || filePath.endsWith(suffix));
  }
  
  // Handle patterns ending with /** (e.g., dist/**)
  if (pattern.endsWith('/**')) {
    const prefix = pattern.substring(0, pattern.length - 3);
    return filePath === prefix || filePath.startsWith(`${prefix}/`);
  }
  
  // Handle simple glob patterns with * (any characters)
  if (pattern.includes('*')) {
    // For *.json patterns, only match files directly (not in subdirectories)
    if (pattern.startsWith('*.')) {
      // Get just the filename without the path
      const parts = filePath.split('/');
      const filename = parts[parts.length - 1];
      const extension = pattern.substring(1); // Remove the *
      
      // Files in subdirectories should not match *.json pattern
      if (parts.length > 1 && pattern === '*.json') {
        return false;
      }
      
      return filename.endsWith(extension);
    }
    
    const regexPattern = pattern
      .replace(/\./g, '\\.')
      .replace(/\*/g, '.*');
    return new RegExp(`^${regexPattern}$`).test(filePath);
  }
  
  // Exact match for simple patterns - only match the full path exactly
  return filePath === pattern;
}

/**
 * Filters out files that match any of the exclude patterns
 * @param files Array of file paths
 * @param excludePatterns Array of patterns to exclude
 * @returns Filtered array of files
 */
export function filterExcludedFiles(files: string[], excludePatterns?: string[]): string[] {
  if (!excludePatterns || excludePatterns.length === 0) {
    return files;
  }
  
  return files.filter(file => {
    // Keep the file if it doesn't match any exclude pattern
    return !excludePatterns.some(pattern => matchesGlobPattern(file, pattern));
  });
}

/**
 * Creates a git diff command for specific files
 * @param files Array of file paths to include in diff
 * @returns Formatted git diff command
 */
export function createGitDiffForFiles(files: string[]): string {
  if (files.length === 0) {
    return 'git diff --staged';
  }
  
  // Escape file paths to handle spaces and special characters
  const escapedFiles = files.map(file => `'${file.replace(/'/g, "'\\''")}'`);
  return `git diff --staged -- ${escapedFiles.join(' ')}`;
}
