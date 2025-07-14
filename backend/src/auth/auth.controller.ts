import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {
    // Инициирует процесс аутентификации Google
    // NestJS Passport автоматически перенаправит на страницу входа Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {
    // Google вернет пользователя сюда после успешного входа
    // req.user будет содержать данные пользователя, возвращенные из GoogleStrategy.validate
    const user = req.user;
    const { access_token, refresh_token } = await this.authService.login(user);

    // Перенаправляем пользователя на фронтенд с токенами
    // TODO: Использовать конфигурацию для URL фронтенда
    res.redirect(`http://localhost:3000/auth/success?access_token=${access_token}&refresh_token=${refresh_token}`);
  }
}