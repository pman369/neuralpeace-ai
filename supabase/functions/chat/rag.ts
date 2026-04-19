export async function performHybridRAG(supabase: any, message: string) {
  try {
    // @ts-ignore
    const model = new Supabase.ai.Session('gte-small');
    const queryEmbedding = await model.run(message, { mean_pool: true, normalize: true });
    
    const [semanticRes, keywordRes] = await Promise.all([
      supabase.rpc('match_module_embeddings', {
        query_embedding: queryEmbedding,
        match_threshold: 0.65,
        match_count: 3
      }),
      supabase.rpc('keyword_match_module_content', {
        query_text: message,
        match_count: 2
      })
    ]);

    const ragResults = new Map<string, string>();

    if (!semanticRes.error && semanticRes.data) {
      semanticRes.data.forEach((m: any) => {
        ragResults.set(m.section_title, `[Topic: ${m.section_title}] (Relevance: ${(m.similarity * 100).toFixed(1)}%)\n${m.content_md}`);
      });
    }

    if (!keywordRes.error && keywordRes.data) {
      keywordRes.data.forEach((m: any) => {
        if (!ragResults.has(m.section_title)) {
          ragResults.set(m.section_title, `[Topic: ${m.section_title}] (Keyword Match)\n${m.content_md}`);
        }
      });
    }

    return Array.from(ragResults.values()).join('\n\n');
  } catch (err) {
    console.warn('Hybrid RAG failed:', err);
    return '';
  }
}
