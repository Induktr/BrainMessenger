export interface User {
  id: string;
  email: string;
  name: string;
  username: string | null;
  isVerified: boolean;
  avatarUrl?: string | null;
  bio?: string | null;
  twoFactorEnabled?: boolean;
  twoFactorMethod?: string | null;
  recoveryEmail?: string | null;
  lastActiveAt?: Date | null; // Add lastActiveAt
  roles: string[]; // Add roles property
}
