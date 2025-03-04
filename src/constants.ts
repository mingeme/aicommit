import { Provider } from './types/config';

export const DEFAULT_ENDPOINTS: Record<Provider, string> = {
  [Provider.Deepseek]: 'https://api.deepseek.com',
  [Provider.Qwen]: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
};

export const DEFAULT_MODEL: Record<Provider, string> = {
  [Provider.Deepseek]: 'deepseek-chat',
  [Provider.Qwen]: 'qwen-plus'
};

export const DEFAULT_PROMPT_MARKDOWN = `# System Prompt
You are a helpful assistant that generates clear and concise git commit messages. Follow conventional commits format. Disable markdown in the response.

# User Prompt Template
Please generate a commit message for the following git diff:

{{diff}}
`;
