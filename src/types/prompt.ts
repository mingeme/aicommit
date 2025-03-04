export interface PromptConfig {
  systemPrompt: string;
  userPromptTemplate: string;
}

export const DEFAULT_PROMPT_CONFIG: PromptConfig = {
  systemPrompt: "You are a helpful assistant that generates clear and concise git commit messages. Follow conventional commits format. Disable markdown in the response.",
  userPromptTemplate: "Please generate a commit message for the following git diff:\n\n{{diff}}"
};
