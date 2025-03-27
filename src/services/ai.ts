import OpenAI from 'openai';
import { ProviderConfig } from '../types/config';
import { applyTemplateVariables } from '../utils/config';
import { AiCommitConfig } from './../types/aicommit';

export class AIService {
  private readonly openai: OpenAI;
  private readonly model: string;
  private readonly aiCommitConfig: AiCommitConfig;

  constructor(providerConfig: ProviderConfig, aiCommitConfig: AiCommitConfig) {
    this.openai = new OpenAI({
      apiKey: providerConfig.apiKey,
      baseURL: providerConfig.endpoint
    });
    this.model = providerConfig.model;
    this.aiCommitConfig = aiCommitConfig;
  }

  async generateCommitMessage(diff: string): Promise<string> {
    try {
      // Apply template variables to the user prompt
      const userPrompt = applyTemplateVariables(this.aiCommitConfig.prompt.user, { diff });

      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: this.aiCommitConfig.prompt.system
          },
          {
            role: "user",
            content: userPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 8192,
        stream: false
      });

      return completion.choices[0].message.content ?? 'No commit message generated';
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to generate commit message: ${error.message}`);
      }
      throw error;
    }
  }
}
