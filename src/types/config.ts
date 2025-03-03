export enum Provider {
  Deepseek = 'deepseek',
  Qwen = 'qwen',
}

export interface ProviderConfig {
  apiKey: string;
  endpoint: string;
  model: string;
}

export type Providers = {
  [key in Provider]?: ProviderConfig;
}

export interface Config {
  currentProvider: Provider | '';
  providers: Providers;
}

export const PROVIDER_LIST = Object.values(Provider);

export function isValidProvider(provider: string): provider is Provider {
  return Object.values(Provider).includes(provider as Provider);
}
