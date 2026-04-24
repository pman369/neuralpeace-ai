import { supabase } from './supabase';

/**
 * Send a magic link to the user's email.
 * Redirects to the current URL after clicking the link.
 */
export async function sendMagicLink(
  email: string,
  expertiseLevel?: string
): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin,
      data: {
        expertise_level: expertiseLevel ?? 'Expert',
      },
    },
  });
  return { error: error?.message ?? null };
}

/**
 * Sign up a user with email and password.
 */
export async function signUpWithPassword(
  email: string,
  password: string,
  expertiseLevel?: string
): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        expertise_level: expertiseLevel ?? 'Expert',
      },
    },
  });
  return { error: error?.message ?? null };
}

/**
 * Sign in a user with email and password.
 */
export async function signInWithPassword(
  email: string,
  password: string
): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { error: error?.message ?? null };
}

/**
 * Send a password reset email to the user.
 */
export async function resetPassword(email: string): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/settings?reset=true`,
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
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, email, expertise_level, avatar_url, created_at')
      .eq('id', userId)
      .single();

    if (error) return { profile: null, error: error.message };
    return { profile: data, error: null };
  } catch (err) {
    return { profile: null, error: err instanceof Error ? err.message : 'Failed to fetch' };
  }
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
