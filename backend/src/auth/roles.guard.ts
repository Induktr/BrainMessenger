import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ROLES_KEY } from './roles.decorator';
import { User } from './interfaces/user.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {

    const ctx = GqlExecutionContext.create(context);
    const handler = ctx.getHandler();
    const classRef = ctx.getClass();

    console.log('[RolesGuard] canActivate called.');
    console.log('[RolesGuard] Handler:', handler ? handler.name : 'N/A');
    console.log('[RolesGuard] Class:', classRef ? classRef.name : 'N/A');

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      handler,
      classRef,
    ]);

    console.log('[RolesGuard] Required Roles:', requiredRoles);

    if (!requiredRoles) {
      console.log('[RolesGuard] No roles required, allowing access.');
      return true;
    }

    const { request } = ctx.getContext();
    const user: User = request.user;

    console.log('[RolesGuard] User object:', user);

    if (!user) {
      console.warn('[RolesGuard] No user found in request, throwing ForbiddenException.');
      throw new ForbiddenException('User not authenticated for this resource.');
    }

    if (!user) {
      throw new ForbiddenException('User not authenticated for this resource.');
    }

    console.log(`[RolesGuard] User ${user.id} is trying to access a resource requiring roles: ${requiredRoles.join(', ')}. User has roles: ${user.roles ? user.roles.join(', ') : 'None'}`);
    const hasRole = requiredRoles.some((role) => user.roles.includes(role));

    if (hasRole) {
      console.log('[RolesGuard] User has required role, allowing access.');
      return true;
    } else {
      console.warn('[RolesGuard] User does not have required roles, throwing ForbiddenException.');
      throw new ForbiddenException('Insufficient roles for this resource.');
    }
  }
}