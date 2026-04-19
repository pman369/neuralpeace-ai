import { supabase } from './supabase';

/**
 * Fetch a list of modules with the user's completion status.
 * Uses the module_progress_view for efficient single-query fetching.
 */
export async function fetchModulesWithProgress(userId: string | undefined) {
  let query = supabase
    .from('module_progress_view')
    .select('*')
    .order('created_at', { ascending: false });

  if (userId) {
    // If we have a user, we want their specific progress or rows where user_id is null (not yet started)
    // Actually, the view might have multiple rows per module if multiple users have progress.
    // We should filter for the specific user.
    query = query.or(`user_id.eq.${userId},user_id.is.null`);
  } else {
    // For anonymous users, just get unique modules
    // Since it's a LEFT JOIN, we just filter for null user_id to get each module once.
    query = query.filter('user_id', 'is', null);
  }

  const { data, error } = await query;

  if (error) return { data: null, error: error.message };

  // If a user has started a module, the LEFT JOIN will return their progress.
  // If they haven't, it will return null for user_id and completed will be false.
  // We need to handle the case where a module exists but hasn't been started by THIS user.
  // The .or filter above helps, but if another user started it, we might get multiple rows.
  // Let's refine the logic: we want all modules, and if progress exists for THIS user, use it.
  
  // Actually, a better approach for the view would have been to filter inside the view or use a subquery.
  // For now, let's deduplicate in JS to ensure correctness if the query returns extra rows.
  const uniqueModules = new Map();
  (data ?? []).forEach(row => {
    // If we already have this module and this row has progress, override.
    if (!uniqueModules.has(row.id) || row.user_id === userId) {
      uniqueModules.set(row.id, {
        id: row.id,
        title: row.title,
        description: row.description,
        category: row.category,
        expertise: row.expertise,
        image_url: row.image_url,
        read_time: row.read_time,
        completed: row.completed ?? false
      });
    }
  });

  return { data: Array.from(uniqueModules.values()), error: null };
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
  let query = supabase
    .from('module_progress_view')
    .select('*')
    .eq('id', moduleId);

  if (userId) {
    query = query.or(`user_id.eq.${userId},user_id.is.null`);
  } else {
    query = query.filter('user_id', 'is', null);
  }

  const { data, error } = await query.single();

  if (error) {
    // If .single() fails because of multiple rows (shouldn't happen with .eq('id', moduleId) and correct filtering)
    if (error.code === 'PGRST116' && !userId) return { data: null, error: 'Module not found' };
  }

  return {
    data: data ? {
      id: data.id,
      title: data.title,
      description: data.description,
      category: data.category,
      expertise: data.expertise,
      image_url: data.image_url,
      read_time: data.read_time,
      completed: data.completed ?? false
    } : null,
    error: error?.message ?? null
  };
}
