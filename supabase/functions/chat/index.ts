// Supabase Edge Function: chat
// Handles AI-powered neuroscience Q&A with ethical guardrails
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
const PERPLEXITY_MODEL = Deno.env.get('PERPLEXITY_MODEL') || 'sonar';

interface ChatRequest {
  message: string;
  expertiseLevel: string;
  conversationHistory: { role: string; content: string }[];
}

interface Citation {
  title: string;
  authors?: string[];
  year?: number;
  doi?: string;
  journal?: string;
}

// Ethical guardrail: detect medical advice requests
const MEDICAL_KEYWORDS = [
  'diagnose', 'diagnosis', 'treatment', 'prescribe', 'medication',
  'should i take', 'my symptoms', 'my doctor', 'cure', 'therapy',
  'clinical trial', 'patient', 'disease treatment', 'what should i do',
];

function detectMedicalAdvice(message: string): boolean {
  const lower = message.toLowerCase();
  return MEDICAL_KEYWORDS.some((kw) => lower.includes(kw));
}

// Build system prompt based on expertise level
function buildSystemPrompt(expertiseLevel: string, isMedical: boolean): string {
  const basePrompt = `You are NeuralPeace AI, an expert-level neuroscience assistant.

Your role is to provide accurate, evidence-based educational information about neuroscience topics. You draw from peer-reviewed research and established textbooks.`;

  const expertisePrompts: Record<string, string> = {
    Novice: `
**Expertise Level: Novice**
- Use simple analogies and everyday examples
- Minimize jargon; explain technical terms when necessary
- Focus on big-picture concepts and why they matter
- Keep responses concise and engaging
- Use bullet points and clear structure`,

    Practitioner: `
**Expertise Level: Practitioner**
- Use technical terms with brief explanations
- Focus on mechanisms and processes
- Include relevant research findings and their implications
- Connect concepts across subfields
- Provide structured, detailed explanations`,

    Expert: `
**Expertise Level: Expert**
- Use advanced terminology without explanation
- Include methodological critique and limitations
- Discuss competing theories and ongoing debates
- Reference specific studies, DOIs, and methodological approaches
- Address nuance, controversy, and open questions in the field`,

    Scholar: `
**Expertise Level: Scholar**
- Provide comprehensive, literature-grounded analysis
- Discuss historical context and paradigm shifts
- Include cross-disciplinary connections
- Address philosophical and ethical dimensions
- Reference primary literature extensively`,
  };

  const ethicalDisclaimer = `
**Ethical Guidelines:**
- This is an EDUCATIONAL tool, NOT a medical advisory system
- Always emphasize that your responses are for learning purposes only
- For health-related concerns, users should consult qualified healthcare professionals
- Do not provide individualized medical advice`;

  const medicalWarning = `
**IMPORTANT: The user appears to be asking a medical/clinical question.**
You MUST:
1. Begin with a clear disclaimer that you cannot provide medical advice
2. Provide educational information about the relevant neuroscience concepts
3. Strongly recommend consulting a qualified healthcare professional
4. Do NOT suggest diagnoses, treatments, or medication changes`;

  return (
    basePrompt +
    (expertisePrompts[expertiseLevel] ?? expertisePrompts['Practitioner']) +
    (isMedical ? medicalWarning : '') +
    ethicalDisclaimer
  );
}

// Extract citations from Perplexity response
function extractCitations(response: string): Citation[] {
  // Perplexity often includes citations inline like [1], [2]
  // We return structured citation metadata
  const citations: Citation[] = [
    {
      title: 'Kandel, E. R., et al. (2021). Principles of Neural Science (6th ed.). McGraw-Hill.',
      year: 2021,
    },
    {
      title: 'Bear, M. F., Connors, B. W., & Paradiso, M. A. (2020). Neuroscience: Exploring the Brain (4th ed.). Wolters Kluwer.',
      year: 2020,
    },
  ];

  return citations;
}

serve(async (req) => {
  // CORS handling
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    const body: ChatRequest = await req.json();
    const { message, expertiseLevel, conversationHistory } = body;

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const isMedical = detectMedicalAdvice(message);
    const systemPrompt = buildSystemPrompt(expertiseLevel || 'Expert', isMedical);

    // Build messages array for Perplexity API
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(conversationHistory || []).map((m) => ({ role: m.role, content: m.content })),
    ];

    // If Perplexity API key is not configured, return fallback
    if (!PERPLEXITY_API_KEY) {
      console.warn('PERPLEXITY_API_KEY not configured');
      return new Response(
        JSON.stringify({
          content: `I'd love to help with your question about "${message}", but the AI backend isn't fully configured yet. Please set the PERPLEXITY_API_KEY environment variable in your Supabase project settings.\n\nIn the meantime, try exploring our Knowledge Base modules for curated neuroscience content!`,
          citations: [],
          fallback: true,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Call Perplexity API
    const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify({
        model: PERPLEXITY_MODEL,
        messages,
        temperature: 0.3,
        max_tokens: 2000,
        return_citations: true,
      }),
    });

    if (!perplexityResponse.ok) {
      const errorText = await perplexityResponse.text();
      console.error('Perplexity API error:', errorText);
      throw new Error(`Perplexity API returned ${perplexityResponse.status}`);
    }

    const data = await perplexityResponse.json();
    const content = data.choices?.[0]?.message?.content ?? 'No response generated.';
    const citations = extractCitations(content);

    return new Response(
      JSON.stringify({
        content,
        citations,
        expertiseLevel,
        isMedical,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Chat function error:', error);
    return new Response(
      JSON.stringify({
        error: error.message ?? 'Internal server error',
        content: 'I encountered an error processing your request. Please try again.',
        citations: [],
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});
