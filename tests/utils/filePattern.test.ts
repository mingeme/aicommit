// Import the functions from our new module
import { 
  matchesGlobPattern, 
  filterExcludedFiles, 
  createGitDiffForFiles 
} from '../../src/utils/filePatterns';

describe('File Pattern Utilities', () => {
  describe('matchesGlobPattern', () => {
    test('should match exact file names', () => {
      expect(matchesGlobPattern('package-lock.json', 'package-lock.json')).toBe(true);
      expect(matchesGlobPattern('src/package-lock.json', 'package-lock.json')).toBe(false);
      expect(matchesGlobPattern('package.json', 'package-lock.json')).toBe(false);
    });

    test('should match files with * wildcard', () => {
      expect(matchesGlobPattern('package.json', '*.json')).toBe(true);
      expect(matchesGlobPattern('package-lock.json', '*.json')).toBe(true);
      expect(matchesGlobPattern('src/config.json', '*.json')).toBe(false);
      expect(matchesGlobPattern('src/config.js', '*.json')).toBe(false);
    });

    test('should match files with **/ recursive pattern at start', () => {
      expect(matchesGlobPattern('package-lock.json', '**/package-lock.json')).toBe(true);
      expect(matchesGlobPattern('src/package-lock.json', '**/package-lock.json')).toBe(true);
      expect(matchesGlobPattern('src/nested/package-lock.json', '**/package-lock.json')).toBe(true);
      expect(matchesGlobPattern('src/nested/deep/package-lock.json', '**/package-lock.json')).toBe(true);
      expect(matchesGlobPattern('package.json', '**/package-lock.json')).toBe(false);
    });

    test('should match files with **/ recursive pattern in middle', () => {
      expect(matchesGlobPattern('src/test.js', 'src/**/test.js')).toBe(true);
      expect(matchesGlobPattern('src/nested/test.js', 'src/**/test.js')).toBe(true);
      expect(matchesGlobPattern('src/nested/deep/test.js', 'src/**/test.js')).toBe(true);
      expect(matchesGlobPattern('lib/test.js', 'src/**/test.js')).toBe(false);
    });

    test('should match files with complex patterns', () => {
      expect(matchesGlobPattern('src/components/Button.tsx', 'src/**/*.tsx')).toBe(true);
      expect(matchesGlobPattern('src/nested/components/Button.tsx', 'src/**/*.tsx')).toBe(true);
      expect(matchesGlobPattern('src/Button.jsx', 'src/**/*.tsx')).toBe(false);
    });
  });

  describe('filterExcludedFiles', () => {
    const files = [
      'src/index.ts',
      'src/utils/git.ts',
      'package.json',
      'package-lock.json',
      'node_modules/lodash/index.js',
      'dist/index.js',
      'src/components/Button.tsx',
    ];

    test('should return all files when no exclude patterns are provided', () => {
      expect(filterExcludedFiles(files)).toEqual(files);
      expect(filterExcludedFiles(files, [])).toEqual(files);
    });

    test('should filter out files matching exact patterns', () => {
      const excludePatterns = ['package-lock.json'];
      const expected = [
        'src/index.ts',
        'src/utils/git.ts',
        'package.json',
        'node_modules/lodash/index.js',
        'dist/index.js',
        'src/components/Button.tsx',
      ];
      expect(filterExcludedFiles(files, excludePatterns)).toEqual(expected);
    });

    test('should filter out files matching wildcard patterns', () => {
      const excludePatterns = ['*.json'];
      const expected = [
        'src/index.ts',
        'src/utils/git.ts',
        'node_modules/lodash/index.js',
        'dist/index.js',
        'src/components/Button.tsx',
      ];
      expect(filterExcludedFiles(files, excludePatterns)).toEqual(expected);
    });

    test('should filter out files matching recursive patterns', () => {
      const excludePatterns = ['**/node_modules/**'];
      const expected = [
        'src/index.ts',
        'src/utils/git.ts',
        'package.json',
        'package-lock.json',
        'dist/index.js',
        'src/components/Button.tsx',
      ];
      expect(filterExcludedFiles(files, excludePatterns)).toEqual(expected);
    });

    test('should filter out files matching multiple patterns', () => {
      const excludePatterns = ['**/node_modules/**', '*.json', 'dist/**'];
      const expected = [
        'src/index.ts',
        'src/utils/git.ts',
        'src/components/Button.tsx',
      ];
      expect(filterExcludedFiles(files, excludePatterns)).toEqual(expected);
    });
  });

  describe('createGitDiffForFiles', () => {
    test('should return base command when no files are provided', () => {
      expect(createGitDiffForFiles([])).toBe('git diff --staged');
    });

    test('should create command with file paths', () => {
      const files = ['src/index.ts', 'package.json'];
      expect(createGitDiffForFiles(files)).toBe("git diff --staged -- 'src/index.ts' 'package.json'");
    });

    test('should escape file paths with special characters', () => {
      const files = ["file with spaces.ts", "file'with'quotes.js"];
      expect(createGitDiffForFiles(files)).toBe("git diff --staged -- 'file with spaces.ts' 'file'\\''with'\\''quotes.js'");
    });
  });
});
