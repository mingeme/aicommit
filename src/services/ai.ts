import OpenAI from 'openai';
import { ProviderConfig } from '../types/config';
import { applyTemplateVariables } from '../utils/prompt';
import { PromptConfig } from './../types/prompt';

export class AIService {
  private readonly openai: OpenAI;
  private readonly model: string;
  private readonly promptConfig: PromptConfig;

  constructor(providerConfig: ProviderConfig, promptConfig: PromptConfig) {
    this.openai = new OpenAI({
      apiKey: providerConfig.apiKey,
      baseURL: providerConfig.endpoint
    });
    this.model = providerConfig.model;
    this.promptConfig = promptConfig;
  }

  async generateCommitMessage(diff: string): Promise<string> {
    try {
      // Apply template variables to the user prompt
      const userPrompt = applyTemplateVariables(this.promptConfig.userPromptTemplate, { diff });

      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: this.promptConfig.systemPrompt
          },
          {
            role: "user",
            content: userPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 100,
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
