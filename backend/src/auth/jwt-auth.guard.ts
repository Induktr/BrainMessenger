import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // Переопределяем getRequest для работы с GraphQL контекстом
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req; // Возвращаем объект запроса из GraphQL контекста
  }

  // Опционально: можно переопределить handleRequest для кастомной обработки ошибок аутентификации,
  // но для начала достаточно стандартного поведения AuthGuard('jwt').
  // handleRequest(err, user, info, context, status) {
  //   // console.log('JwtAuthGuard handleRequest:', { err, user, info, status });
  //   if (err || !user) {
  //     // Можно выбросить кастомную ошибку или стандартную UnauthorizedException
  //     throw err || new UnauthorizedException('Could not authenticate with token');
  //   }
  //   return user; // Возвращаем пользователя, если аутентификация прошла успешно
  // }
}