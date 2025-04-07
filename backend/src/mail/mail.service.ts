import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { google } from 'googleapis';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService
  ) {
    this.initializeTransporter();
  }

  private async initializeTransporter() {
    try {
      // Настройка OAuth2 для Gmail API
      const oauth2Client = new google.auth.OAuth2(
        this.configService.get<string>('GMAIL_CLIENT_ID'),
        this.configService.get<string>('GMAIL_CLIENT_SECRET'),
        'https://developers.google.com/oauthplayground' // Redirect URL
      );

      oauth2Client.setCredentials({
        refresh_token: this.configService.get<string>('GMAIL_REFRESH_TOKEN'),
      });

      // Получаем access token
      const accessToken = await new Promise<string>((resolve, reject) => {
        oauth2Client.getAccessToken((err, token) => {
          if (err) {
            this.logger.error('Failed to get access token', err);
            reject('Failed to get access token');
          }
          resolve(token);
        });
      });

      // Создаем транспортер с OAuth2
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: this.configService.get<string>('GMAIL_USER'),
          clientId: this.configService.get<string>('GMAIL_CLIENT_ID'),
          clientSecret: this.configService.get<string>('GMAIL_CLIENT_SECRET'),
          refreshToken: this.configService.get<string>('GMAIL_REFRESH_TOKEN'),
          accessToken,
        },
      });

      this.logger.log('Email transporter initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize email transporter', error);
      throw error;
    }
  }

  async sendVerificationCode(email: string, code: string, userId: string): Promise<void> {
    try {
      // Сохраняем код в базе данных
      const expiryTime = new Date();
      expiryTime.setTime(expiryTime.getTime() + parseInt(this.configService.get<string>('VERIFICATION_CODE_EXPIRY') || '3600000'));
      
      // Создаем запись о коде верификации
      await this.prisma.verificationCode.create({
        data: {
          code,
          userId,
          type: 'EMAIL_VERIFICATION',
          expiresAt: expiryTime,
        },
      });

      // Отправляем email
      const mailOptions = {
        from: this.configService.get<string>('MAIL_FROM'),
        to: email,
        subject: 'BrainMessenger - Подтверждение Email',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #333;">Подтверждение Email</h2>
            <p>Здравствуйте!</p>
            <p>Спасибо за регистрацию в BrainMessenger. Для подтверждения вашего email-адреса, пожалуйста, введите следующий код в приложении:</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center; font-size: 24px; letter-spacing: 5px; margin: 20px 0;">
              <strong>${code}</strong>
            </div>
            <p>Код действителен в течение 1 часа.</p>
            <p>Если вы не запрашивали этот код, пожалуйста, проигнорируйте это сообщение.</p>
            <p>С уважением,<br>Команда BrainMessenger</p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Verification code sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send verification code to ${email}`, error);
      throw error;
    }
  }

  async sendTwoFactorCode(email: string, code: string, userId: string): Promise<void> {
    try {
      // Сохраняем код в базе данных
      const expiryTime = new Date();
      expiryTime.setTime(expiryTime.getTime() + 15 * 60 * 1000); // 15 минут
      
      // Создаем запись о коде двухфакторной аутентификации
      await this.prisma.verificationCode.create({
        data: {
          code,
          userId,
          type: 'TWO_FACTOR',
          expiresAt: expiryTime,
        },
      });

      // Отправляем email
      const mailOptions = {
        from: this.configService.get<string>('MAIL_FROM'),
        to: email,
        subject: 'BrainMessenger - Код двухфакторной аутентификации',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #333;">Код двухфакторной аутентификации</h2>
            <p>Здравствуйте!</p>
            <p>Для входа в ваш аккаунт BrainMessenger, пожалуйста, используйте следующий код:</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center; font-size: 24px; letter-spacing: 5px; margin: 20px 0;">
              <strong>${code}</strong>
            </div>
            <p>Код действителен в течение 15 минут.</p>
            <p>Если вы не запрашивали этот код, пожалуйста, немедленно измените пароль вашего аккаунта.</p>
            <p>С уважением,<br>Команда BrainMessenger</p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Two-factor code sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send two-factor code to ${email}`, error);
      throw error;
    }
  }
}
