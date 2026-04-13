import { supabase } from './supabase';

/**
 * Fetch a list of modules with the user's completion status.
 */
export async function fetchModulesWithProgress(userId: string | undefined) {
  // First get all modules
  const { data: modules, error: modulesError } = await supabase
    .from('modules')
    .select('id, title, description, category, expertise, image_url, read_time')
    .order('created_at', { ascending: false });

  if (modulesError) return { data: null, error: modulesError.message };
  if (!userId) return { data: modules.map(m => ({ ...m, completed: false })), error: null };

  // Then get user progress
  const { data: progress, error: progressError } = await supabase
    .from('user_module_progress')
    .select('module_id, completed')
    .eq('user_id', userId);

  if (progressError) return { data: modules.map(m => ({ ...m, completed: false })), error: null };

  const progressMap = new Map(progress.map(p => [p.module_id, p.completed]));

  return {
    data: modules.map(m => ({
      ...m,
      completed: progressMap.get(m.id) ?? false
    })),
    error: null
  };
}

/**
 * Mark a module as read for a user.
 */
export async function markModuleAsRead(userId: string, moduleId: string) {
  const { error } = await supabase
    .from('user_module_progress')
    .upsert({
      user_id: userId,
      module_id: moduleId,
      completed: true,
      last_read_at: new Date().toISOString()
    });
  return { error: error?.message ?? null };
}

/**
 * Fetch the details of a specific module, including its progress status for a user.
 */
export async function fetchModuleWithProgress(userId: string | undefined, moduleId: string) {
  const { data: module, error: moduleError } = await supabase
    .from('modules')
    .select('id, title, description, category, expertise, image_url, read_time')
    .eq('id', moduleId)
    .single();

  if (moduleError) return { data: null, error: moduleError.message };
  if (!userId) return { data: { ...module, completed: false }, error: null };

  const { data: progress, error: progressError } = await supabase
    .from('user_module_progress')
    .select('completed')
    .eq('user_id', userId)
    .eq('module_id', moduleId)
    .single();

  return {
    data: {
      ...module,
      completed: progress?.completed ?? false
    },
    error: progressError && progressError.code !== 'PGRST116' ? progressError.message : null
  };
}
