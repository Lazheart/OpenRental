export type UserRole =
  | 'ADMINISTRADOR'
  | 'SUPERVISOR'
  | 'RECEPCIONISTA'
  | 'MECANICO'
  | 'CLIENTE';

export interface UserProfile {
  id: string; // UUID
  username: string | null;
  display_name: string | null;
  role: UserRole;
  created_at: string;
  email?: string; // from auth.users
}

export interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  isAgent: () => boolean;
  isAdmin: () => boolean;
  isClient: () => boolean;
}

export const AGENT_ROLES: UserRole[] = [
  'ADMINISTRADOR',
  'SUPERVISOR',
  'RECEPCIONISTA',
  'MECANICO',
];

export const ADMIN_ROLES: UserRole[] = ['ADMINISTRADOR', 'SUPERVISOR'];
