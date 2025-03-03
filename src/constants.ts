import { Provider } from './types/config';

export const DEFAULT_ENDPOINTS: Record<Provider, string> = {
  [Provider.Deepseek]: 'https://api.deepseek.com',
  [Provider.Qwen]: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
};

export const DEFAULT_MODEL: Record<Provider, string> = {
  [Provider.Deepseek]: 'deepseek-chat',
  [Provider.Qwen]: 'qwen-plus'
};