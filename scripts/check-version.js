#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const versionFilePath = path.resolve(__dirname, '../src/utils/version.ts');

// Check if version file exists
if (!fs.existsSync(versionFilePath)) {
  console.log('Version file does not exist. Generating...');
  try {
    // Run the generate-version.js script
    execSync('node ' + path.resolve(__dirname, 'generate-version.js'), {
      stdio: 'inherit'
    });
  } catch (error) {
    console.error('Error generating version file:', error.message);
    process.exit(1);
  }
} else {
  console.log('Using existing version file.');
}
