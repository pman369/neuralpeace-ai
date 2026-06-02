import { ExpertiseLevel } from './types.ts';
import { analyzeMessage } from './guardrails.ts';

/**
 * Legacy wrapper: detects expertise level. Calls analyzeMessage under the hood.
 */
export async function detectExpertiseLevel(
  message: string,
  apiKey: string,
  model: string = 'gemini-1.5-flash'
): Promise<{ level: ExpertiseLevel; reasoning: string }> {
  const result = await analyzeMessage(message, apiKey, true, model);
  return {
    level: (result.detectedExpertise as ExpertiseLevel) || 'Practitioner',
    reasoning: result.reasoning
  };
}

