const MEDICAL_KEYWORDS = [
  'diagnose', 'diagnosis', 'treatment', 'prescribe', 'medication',
  'should i take', 'my symptoms', 'my doctor', 'cure', 'therapy',
  'clinical trial', 'patient', 'disease treatment', 'what should i do',
];

export function detectMedicalKeywords(message: string): boolean {
  const lower = message.toLowerCase();
  return MEDICAL_KEYWORDS.some((kw) => lower.includes(kw));
}

/**
 * Uses a fast LLM call to judge if the user is asking for medical advice
 * AND to categorize their intent for persona selection.
 */
export async function judgeUserIntent(
  message: string, 
  apiKey: string, 
  model: string = 'sonar'
): Promise<{ isMedical: boolean; intent: string; sentiment: string; reasoning: string }> {
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
            content: `You are an intent and sentiment classifier for a neuroscience AI. 
Categorize the user message based on:
1. is_medical: Is this seeking personal clinical diagnosis or treatment? (boolean)
2. intent:
   - 'research': Developing a hypothesis, designing an experiment, or peer-reviewing.
   - 'ethics': discussing the societal, moral, or philosophical implications of neuroscience.
   - 'art': Asking for visualizations, metaphors, or artistic interpretations.
   - 'general': Standard educational or technical questions.
3. sentiment:
   - 'curious': Open, asking questions, eager to learn.
   - 'frustrated': Short, usingCAPS, "ugh", "don't get it", "why is this so hard".
   - 'skeptical': Questioning facts, asking for proof, "i don't believe".
   - 'formal': Academic, neutral, concise.
Return ONLY a JSON object with "is_medical", "intent", "sentiment", and "reasoning".` 
          },
          { role: 'user', content: message }
        ],
        temperature: 0,
        max_tokens: 150,
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      return { isMedical: detectMedicalKeywords(message), intent: 'general', sentiment: 'neutral', reasoning: 'Fallback' };
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    return { 
      isMedical: !!result.is_medical, 
      intent: result.intent || 'general',
      sentiment: result.sentiment || 'neutral',
      reasoning: result.reasoning || 'No reasoning provided' 
    };
  } catch (err) {
    console.error('Judge failed:', err);
    return { isMedical: detectMedicalKeywords(message), intent: 'general', reasoning: 'Error' };
  }
}
