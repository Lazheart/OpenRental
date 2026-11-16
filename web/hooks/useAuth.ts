import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { UserProfile, AGENT_ROLES, ADMIN_ROLES } from '@/types/auth';

interface UseAuthReturn {
  user: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isAgent: () => boolean;
  isAdmin: () => boolean;
  isClient: () => boolean;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string, email?: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, display_name, role, created_at')
      .eq('id', userId)
      .single();

    if (error || !data) {
      setUser(null);
      return;
    }

    setUser({
      id: data.id,
      username: data.username,
      display_name: data.display_name,
      role: data.role,
      created_at: data.created_at,
      email,
    });
  }, []);

  useEffect(() => {
    // Check current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email).finally(() =>
          setLoading(false)
        );
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setLoading(true);
          await fetchProfile(session.user.id, session.user.email);
          setLoading(false);
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const isAgent = useCallback(
    () => !!user && AGENT_ROLES.includes(user.role),
    [user]
  );

  const isAdmin = useCallback(
    () => !!user && ADMIN_ROLES.includes(user.role),
    [user]
  );

  const isClient = useCallback(
    () => !!user && user.role === 'CLIENTE',
    [user]
  );

  return { user, loading, signOut, isAgent, isAdmin, isClient };
}
