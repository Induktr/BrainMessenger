import { Injectable, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../common/decorators/public.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;

    // Call the parent's canActivate method, which will run the JWT strategy
    // and populate req.user if successful.
    const canActivate = await super.canActivate(context) as boolean;
    if (!canActivate) {
      return false;
    }

    // Fetch the user from the database to get their role
    const user = request.user;
    if (!user || !user.id) {
      this.logger.warn('No user found in request after JWT validation.');
      throw new UnauthorizedException('Authentication failed: User data missing.');
    }

    const userWithRole = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        isVerified: true,
        avatarUrl: true,
        bio: true,
        twoFactorEnabled: true,
        twoFactorMethod: true,
        recoveryEmail: true,
        lastActiveAt: true,
        role: true, // Include the role
      },
    });

    if (!userWithRole) {
      this.logger.warn(`User with ID ${user.id} not found in database.`);
      throw new UnauthorizedException('User not found in database.');
    }

    // Attach the full user object with role to the request
    request.user = userWithRole;

    return true;
  }

  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }

  handleRequest(err, user, info: Error) {
    if (err || !user) {
      this.logger.error(`Auth failed: ${info?.message || 'No user found'}`);
      throw err || new UnauthorizedException('Authentication failed.');
    }
    return user;
  }
}