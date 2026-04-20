import { ExpertiseLevel } from './types.ts';

/**
 * Analyzes the user's message to determine the appropriate expertise level.
 * Categorizes based on technical vocabulary, specificity, and implicit context.
 */
export async function detectExpertiseLevel(
  message: string,
  apiKey: string,
  model: string = 'sonar'
): Promise<{ level: ExpertiseLevel; reasoning: string }> {
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: `Analyze the user message and categorize the required neuroscience expertise level.
Return ONLY a JSON object with "level" (one of: "Novice", "Practitioner", "Expert", "Scholar") and "reasoning" (brief string).

Criteria:
- Novice: Simple concepts, general interest, no technical jargon.
- Practitioner: Mentions mechanisms, common anatomical terms, clinical applications.
- Expert: High technicality, specific receptors/pathways, requests for DOIs/data.
- Scholar: Theoretical frameworks, historical context, cross-disciplinary paradigms, philosophical implications.`
          },
          { role: 'user', content: message }
        ],
        temperature: 0,
        max_tokens: 100,
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      return { level: 'Practitioner', reasoning: 'Fallback due to API error' };
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    
    // Ensure the level is valid
    const validLevels: ExpertiseLevel[] = ['Novice', 'Practitioner', 'Expert', 'Scholar'];
    const level = validLevels.includes(result.level) ? result.level : 'Practitioner';

    return { level, reasoning: result.reasoning || 'Auto-detected' };
  } catch (err) {
    console.error('Expertise detection failed:', err);
    return { level: 'Practitioner', reasoning: 'Error in detection' };
  }
}
