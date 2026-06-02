// supabase/functions/chat/geminiClient.ts
export async function callGemini(messages: { role: string; content: string }[], stream: boolean, apiKey: string, model: string) {
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, messages, temperature: 0.3, max_tokens: 2000, stream }),
  });
  if (!response.ok) {
    throw new Error(`Gemini API Error: ${response.status}`);
  }
  return response;
}
