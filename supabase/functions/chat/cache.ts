import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.0';

export async function getHash(text: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function checkCache(supabase: any, hash: string, expertiseLevel: string) {
  const { data: cached } = await supabase
    .from('query_cache')
    .select('response_json, created_at')
    .eq('query_hash', hash)
    .eq('expertise_level', expertiseLevel)
    .maybeSingle();

  if (cached) {
    const createdAt = new Date(cached.created_at);
    const diffHrs = (new Date().getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    if (diffHrs < 24) return cached.response_json;
  }
  return null;
}

export async function updateCache(supabase: any, hash: string, expertiseLevel: string, responseJson: any) {
  await supabase.from('query_cache').upsert({
    query_hash: hash,
    response_json: responseJson,
    expertise_level: expertiseLevel,
  }, { onConflict: 'query_hash' });
}
