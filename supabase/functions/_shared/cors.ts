export const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Fallback for local development, should be restricted via env in prod
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Get CORS headers with restricted origin if set in environment.
 */
export function getCorsHeaders(requestOrigin?: string | null) {
  const allowedOrigins = Deno.env.get('ALLOWED_ORIGINS')?.split(',') || [];
  
  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    return {
      ...corsHeaders,
      'Access-Control-Allow-Origin': requestOrigin,
    };
  }
  
  // Default to '*' for development or if no restricted origins are set
  return corsHeaders;
}
