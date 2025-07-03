import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger, } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ROLES_KEY } from './roles.decorator';
import { User } from './interfaces/user.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector, private readonly logger = new Logger(RolesGuard.name)) {}

  canActivate(context: ExecutionContext): boolean {

    const ctx = GqlExecutionContext.create(context);
    const handler = ctx.getHandler();
    const classRef = ctx.getClass();

    this.logger.log('[RolesGuard] canActivate called.');
    this.logger.log('[RolesGuard] Handler:', handler ? handler.name : 'N/A');
    this.logger.log('[RolesGuard] Class:', classRef ? classRef.name : 'N/A');

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      handler,
      classRef,
    ]);

    this.logger.log('[RolesGuard] Required Roles:', requiredRoles);

    if (!requiredRoles) {
      this.logger.log('[RolesGuard] No roles required, allowing access.');
      return true;
    }

    const { request } = ctx.getContext();
    const user: User = request.user;

    this.logger.log('[RolesGuard] User object:', user);

    if (!user) {
      this.logger.warn('[RolesGuard] No user found in request, throwing ForbiddenException.');
      throw new ForbiddenException('User not authenticated for this resource.');
    }

    if (!user) {
      throw new ForbiddenException('User not authenticated for this resource.');
    }

    this.logger.log(`[RolesGuard] User ${user.id} is trying to access a resource requiring roles: ${requiredRoles.join(', ')}. User has roles: ${user.roles ? user.roles.join(', ') : 'None'}`);
    const hasRole = requiredRoles.some((role) => user.roles.includes(role));

    if (hasRole) {
      this.logger.log('[RolesGuard] User has required role, allowing access.');
      return true;
    } else {
      this.logger.warn('[RolesGuard] User does not have required roles, throwing ForbiddenException.');
      throw new ForbiddenException('Insufficient roles for this resource.');
    }
  }
}