# aicommit

`aicommit` is an AI-powered git commit message generator.

![showcase](./assets/showcase.gif)

## Installation

### Using Homebrew (macOS and Linux)

```bash
# Install from Homebrew tap
brew install mingeme/tap/aicommit
```

### From Source

```bash
# Clone the repository
git clone https://github.com/mingeme/aicommit.git
cd aicommit

# Install dependencies
pnpm install

# Build the project
pnpm run build

# Link the CLI tool globally
pnpm link
```

## Development

```bash
# Run in development mode
pnpm run dev

# Build the project
pnpm run build

# Run tests
pnpm test
```

## Version Management

The version number is automatically generated based on Git tags:

- If the current commit has a tag, that tag will be used as the version (preserving the 'v' prefix if present)
- If the current commit doesn't have a tag, a version in the format `{tag}-{shortHash}` will be generated, where `{tag}` is the tag and `{shortHash}` is the short Git commit hash
- If no tags exist in the repository, a fallback version in the format `v0.1.0-{shortHash}` will be used
- The version is stored in `src/utils/version.ts`, which is automatically generated and should not be manually edited
- The version file is only generated if it doesn't already exist, to regenerate it run `pnpm run version`
- The `src/utils/version.ts` file is included in `.gitignore` since it's generated during build

## Usage

```bash
# Show help
aicommit --help

# Generate a commit message and create a commit
aicommit

# Generate a commit message without creating a commit (dry-run mode)
aicommit --dry-run
# or
aicommit -d

# Authenticate with a provider
aicommit auth add <provider> <apiKey>
# or
aicommit auth use <provider>

# Manage prompt configurations
aicommit prompt init        # Create a default prompt configuration in current directory
aicommit prompt init --global  # Create a default prompt configuration in global config directory
aicommit prompt show        # Show current prompt configuration
```

### Options

- `-d, --dry-run`: Generate a commit message without creating a commit
- `auth add <provider> <apiKey>`: Add a new provider configuration
- `auth use <provider>`: Set the current provider
- `prompt init`: Create a new prompt configuration file
- `prompt show`: Show current prompt configuration
- `-h, --help`: Display help information

## Customizing Prompts

You can customize the prompts used for generating commit messages by creating a `.aicommit.yml` or `.aicommit.yaml` file either in your current working directory or in the global config directory (`~/.config/aicommit/`).

The file should have the following format:

```yaml
prompt:
  system: |
    Your custom system prompt here
  user: |
    Your custom user prompt template here

    {{diff}}
```

The `{{diff}}` placeholder will be replaced with the actual git diff content.

## License

MIT
