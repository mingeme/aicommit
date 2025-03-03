# aicommit

`aicommit` is an AI-powered git commit message generator.

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
```

### Options

- `-d, --dry-run`: Generate a commit message without creating a commit
- `auth add <provider> <apiKey>`: Add a new provider configuration
- `auth use <provider>`: Set the current provider
- `-h, --help`: Display help information

## License

MIT
