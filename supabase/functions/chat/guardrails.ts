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
 * Uses a fast LLM call to judge if the user is asking for medical advice.
 * This is more robust than keyword matching.
 */
export async function judgeMedicalAdvice(
  message: string, 
  apiKey: string, 
  model: string = 'sonar'
): Promise<{ isMedical: boolean; reasoning: string }> {
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
            content: 'You are a safety classifier for a neuroscience AI. Determine if the user message is seeking specific medical diagnosis, medication prescriptions, or personalized clinical treatment advice. Return ONLY a JSON object with "is_medical" (boolean) and "reasoning" (string).' 
          },
          { role: 'user', content: message }
        ],
        temperature: 0,
        max_tokens: 100,
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      // Fallback to keyword matching if API fails
      return { isMedical: detectMedicalKeywords(message), reasoning: 'Fallback to keyword matching' };
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    return { 
      isMedical: !!result.is_medical, 
      reasoning: result.reasoning || 'No reasoning provided' 
    };
  } catch (err) {
    console.error('Judge failed:', err);
    return { isMedical: detectMedicalKeywords(message), reasoning: 'Error in judge' };
  }
}
