import { UserRole } from '@/entities/user/model/user.types';

export interface WithAuthOptions {
  requiredRoles?: UserRole[];
  redirectPath?: string;
}