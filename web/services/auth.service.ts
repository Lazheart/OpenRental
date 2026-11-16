import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/types/auth';

export interface AuthResult {
  user: UserProfile | null;
  error: Error | null;
}

export interface SignOutResult {
  error: Error | null;
}

/**
 * Inicia sesión con email y contraseña.
 */
export async function signIn(
  email: string,
  password: string
): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return { user: null, error: error ?? new Error('Sign-in failed') };
  }

  const profile = await getProfile(data.user.id);
  return { user: profile ? { ...profile, email: data.user.email } : null, error: null };
}

/**
 * Registra un nuevo usuario con email, contraseña y nombre de visualización.
 */
export async function signUp(
  email: string,
  password: string,
  displayName: string
): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
    },
  });

  if (error || !data.user) {
    return { user: null, error: error ?? new Error('Sign-up failed') };
  }

  const profile = await getProfile(data.user.id);
  return { user: profile ? { ...profile, email: data.user.email } : null, error: null };
}

/**
 * Cierra la sesión del usuario actual.
 */
export async function signOut(): Promise<SignOutResult> {
  const { error } = await supabase.auth.signOut();
  return { error: error ?? null };
}

/**
 * Obtiene el perfil del usuario autenticado actualmente.
 * Acepta un userId opcional; si no se provee, usa auth.getUser().
 */
export async function getProfile(userId?: string): Promise<UserProfile | null> {
  let uid = userId;

  if (!uid) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    uid = user.id;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, display_name, role, created_at')
    .eq('id', uid)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    username: data.username,
    display_name: data.display_name,
    role: data.role,
    created_at: data.created_at,
  };
}

/**
 * Actualiza username y display_name del perfil del usuario autenticado.
 */
export async function updateProfile(
  data: Partial<Pick<UserProfile, 'username' | 'display_name'>>
): Promise<{ error: Error | null }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: new Error('No authenticated user') };

  const { error } = await supabase
    .from('profiles')
    .update({
      ...(data.username !== undefined && { username: data.username }),
      ...(data.display_name !== undefined && { display_name: data.display_name }),
    })
    .eq('id', user.id);

  return { error: error ?? null };
}
