#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Function to get version from git tags or commit hash
function getVersionFromGit() {
  try {
    // Try to get the version using git describe
    const describeOutput = execSync('git describe --tags --long 2>/dev/null || echo ""', {
      encoding: 'utf-8',
      shell: true
    }).trim();

    if (describeOutput) {
      // Parse the output which is in format: tag-commits-hash
      const parts = describeOutput.split('-');

      // If we're on an exact tag (no commits since tag)
      if (parts.length >= 3 && parts[parts.length - 2] === '0') {
        // We're on an exact tag, return just the tag (keeping v prefix)
        return parts.slice(0, parts.length - 2).join('-');
      } else {
        // We're not on an exact tag, add hash suffix to the tag
        const tag = parts.slice(0, parts.length - 2).join('-');
        const shortHash = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
        return `${tag}-${shortHash}`;
      }
    } else {
      // No tags or git describe failed, use default version with hash
      const shortHash = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
      return `v0.1.0-${shortHash}`;
    }
  } catch (error) {
    console.error('Error getting version from git:', error.message);
    return "v0.1.0";
  }
}

// Generate the version
const version = getVersionFromGit();
console.log(`Generated version: ${version}`);

// Create the version.ts file with the static version
const versionFileContent = `// This file is auto-generated during build. Do not modify manually.
export const VERSION = '${version}';
`;

// Write the version file
const versionFilePath = path.resolve(__dirname, '../src/utils/version.ts');
fs.writeFileSync(versionFilePath, versionFileContent);

console.log(`Version file written to: ${versionFilePath}`);
