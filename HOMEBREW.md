# Homebrew Integration

This document explains how to set up the Homebrew tap repository for `aicommit`.

The formula is configured to use pnpm for package management.

## Setup

1. Create a GitHub repository named `homebrew-tap` (the `homebrew-` prefix is required by Homebrew)

2. Create a `Formula` directory in the repository:
   ```bash
   mkdir -p Formula
   ```

3. Copy the formula file from this repository:
   ```bash
   cp Formula/aicommit.rb Formula/
   ```

4. Commit and push the changes:
   ```bash
   git add Formula/aicommit.rb
   git commit -m "Add aicommit formula"
   git push
   ```

## Automatic Updates

The GitHub Actions workflow in this repository (`.github/workflows/release.yml`) will automatically:

1. Create a release when a new tag is pushed
2. Calculate the SHA256 checksum of the release tarball
3. Update the formula in the `homebrew-tap` repository with the new version and SHA256

To trigger this workflow, simply create and push a new tag:
```bash
git tag -a v0.1.0 -m "Release v0.1.0"
git push origin v0.1.0
```

## Manual Setup

If you need to set up the tap manually:

1. Create a GitHub personal access token with `repo` scope
2. Add the token as a secret named `TAP_GITHUB_TOKEN` in the repository settings

## Installation

Users can install `aicommit` using:
```bash
brew install mingeme/tap/aicommit
```
