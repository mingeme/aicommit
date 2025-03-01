import OpenAI from 'openai';
import { ProviderConfig } from '../types/config';

export class AIService {
  private readonly openai: OpenAI;

  constructor(providerConfig: ProviderConfig) {
    this.openai = new OpenAI({
      apiKey: providerConfig.apiKey,
      baseURL: providerConfig.endpoint
    });
  }

  async generateCommitMessage(diff: string): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that generates clear and concise git commit messages. Follow conventional commits format. Disable markdown in the response."
          },
          {
            role: "user",
            content: `Please generate a commit message for the following git diff:\n\n${diff}`
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
