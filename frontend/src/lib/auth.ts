import { supabase } from './supabase';

/**
 * Send a magic link to the user's email.
 * Redirects to the current URL after clicking the link.
 */
export async function sendMagicLink(email: string): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin,
    },
  });
  return { error: error?.message ?? null };
}

/**
 * Sign out the current user.
 */
export async function signOut(): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.signOut();
  return { error: error?.message ?? null };
}

/**
 * Update the current user's profile.
 */
export async function updateProfile(
  userId: string,
  updates: { display_name?: string; expertise_level?: string; avatar_url?: string }
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);
  return { error: error?.message ?? null };
}

/**
 * Fetch the current user's profile.
 */
export async function fetchProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, email, expertise_level, avatar_url, created_at')
    .eq('id', userId)
    .single();

  if (error) return { profile: null, error: error.message };
  return { profile: data, error: null };
}

/**
 * Update the user's expertise level in their profile.
 */
export async function updateExpertiseLevel(
  userId: string,
  level: string
): Promise<{ error: string | null }> {
  return updateProfile(userId, { expertise_level: level });
}
