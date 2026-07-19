export type UserRole = 'admin' | 'shareholder';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  /** Mirrors `role === 'admin'`. Kept for compatibility with existing checks. */
  isAdmin: boolean;
  /** Set only for shareholder accounts. */
  shareholderId: string | null;
  token: string;
}
