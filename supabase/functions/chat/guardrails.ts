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
 * Coalesces intent, sentiment, safety classification, and expertise level detection 
 * into a single unified Gemini API call, saving API costs and slashing request latency.
 */
export async function analyzeMessage(
  message: string,
  apiKey: string,
  detectExpertise: boolean,
  model: string = 'gemini-1.5-flash'
): Promise<{
  isMedical: boolean;
  intent: string;
  sentiment: string;
  reasoning: string;
  detectedExpertise?: string;
}> {
  try {
    const systemInstruction = `You are a message analyzer for a neuroscience AI assistant.
Analyze the user's message based on these parameters:
1. is_medical: Is the user seeking personal clinical diagnosis, symptom evaluation, or medical treatment? (boolean)
2. intent:
   - 'research': Ask to design experiments, peer-review hypotheses, suggest scientific methodologies.
   - 'ethics': discussing societal, philosophical, or moral implications of neurotechnology.
   - 'art': Requests for visualizations, poetic metaphors, or creative neuro-art prompts.
   - 'general': Technical Q&A, educational, or standard reference queries.
3. sentiment:
   - 'curious': Inquisitive, seeking clarification, eager.
   - 'frustrated': Impatient, CAPS usage, "ugh", "don't get it".
   - 'skeptical': Questioning facts, demanding evidence.
   - 'formal': Academic, neutral, concise.
${detectExpertise ? `4. expertise_level: The technical depth required. Choose exactly one:
   - 'Novice': Simple concepts, general interest, no technical jargon.
   - 'Practitioner': Practical clinical applications, medical terms, physiological mechanisms.
   - 'Expert': Molecule-level detail, specialized pathways, research methodologies, specific receptors.
   - 'Scholar': Historical paradigms, philosophical implications, theoretical or cross-disciplinary frameworks.` : ''}

Return ONLY a JSON object containing: "is_medical", "intent", "sentiment", "reasoning"${detectExpertise ? ', and "expertise_level"' : ''}.`;

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: message }
        ],
        temperature: 0,
        max_tokens: 200,
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      return {
        isMedical: detectMedicalKeywords(message),
        intent: 'general',
        sentiment: 'neutral',
        reasoning: 'Fallback due to API error',
        detectedExpertise: 'Practitioner'
      };
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    return {
      isMedical: !!result.is_medical,
      intent: result.intent || 'general',
      sentiment: result.sentiment || 'neutral',
      reasoning: result.reasoning || 'Coalesced analysis completed',
      detectedExpertise: result.expertise_level || result.level || 'Practitioner'
    };
  } catch (err) {
    console.error('Coalesced analysis failed:', err);
    return {
      isMedical: detectMedicalKeywords(message),
      intent: 'general',
      sentiment: 'neutral',
      reasoning: 'Error in assessment',
      detectedExpertise: 'Practitioner'
    };
  }
}

/**
 * Legacy wrapper: classifies user intent. Calls analyzeMessage under the hood.
 */
export async function judgeUserIntent(
  message: string, 
  apiKey: string, 
  model: string = 'gemini-1.5-flash'
): Promise<{ isMedical: boolean; intent: string; sentiment: string; reasoning: string }> {
  const result = await analyzeMessage(message, apiKey, false, model);
  return {
    isMedical: result.isMedical,
    intent: result.intent,
    sentiment: result.sentiment,
    reasoning: result.reasoning
  };
}

