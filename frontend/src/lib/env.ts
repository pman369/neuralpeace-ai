import { z } from 'zod';

const envSchema = z.object({
  VITE_SUPABASE_URL: z
    .string({
      required_error: 'VITE_SUPABASE_URL is missing in environment variables.',
    })
    .url('VITE_SUPABASE_URL must be a valid URL.'),
  VITE_SUPABASE_ANON_KEY: z
    .string({
      required_error: 'VITE_SUPABASE_ANON_KEY is missing in environment variables.',
    })
    .min(1, 'VITE_SUPABASE_ANON_KEY cannot be empty.'),
  VITE_SENTRY_DSN: z.string().url().optional().or(z.literal('').optional()).or(z.undefined()),
});

const _env = envSchema.safeParse({
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
});

export const envValidation = _env;

// Provide safe, valid fallback values to prevent import-time crashes in client initializers (like Supabase)
export const env = _env.success
  ? _env.data
  : {
      VITE_SUPABASE_URL: 'https://placeholder-url.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'placeholder-anon-key',
      VITE_SENTRY_DSN: undefined,
    };

