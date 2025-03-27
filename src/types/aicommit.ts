/**
 * Interface for the aicommit configuration
 */
export interface AiCommitConfig {
  prompt: {
    system: string;
    user: string;
  };
  exclude?: string[];
}

export const DEFAULT_AICOMMIT_CONFIG: AiCommitConfig = {
  prompt: {
    system: "You are a helpful assistant that generates clear and concise git commit messages. Follow conventional commits format. Disable markdown in the response.",
    user: "Please generate a commit message for the following git diff:\n\n{{diff}}"
  },
  exclude: []
};
