/**
 * Interface for the prompt configuration
 */
export interface PromptConfig {
  prompt: {
    system: string;
    user: string;
  };
}

export const DEFAULT_PROMPT_CONFIG: PromptConfig = {
  prompt: {
    system: "You are a helpful assistant that generates clear and concise git commit messages. Follow conventional commits format. Disable markdown in the response.",
    user: "Please generate a commit message for the following git diff:\n\n{{diff}}"
  }
};
