import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST'),
      port: this.configService.get<number>('MAIL_PORT'),
      secure: false, // upgrade later with STARTTLS
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASSWORD'),
      },
    });
  }

  async sendVerificationCode(email: string, code: string): Promise<void> {
    const mailOptions = {
      from: this.configService.get<string>('MAIL_FROM'),
      to: email,
      subject: 'Verification Code',
      text: `Your verification code is: ${code}`,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendTwoFactorCode(email: string, code: string): Promise<void> {
    const mailOptions = {
      from: this.configService.get<string>('MAIL_FROM'),
      to: email,
      subject: 'Two-Factor Authentication Code',
      text: `Your two-factor authentication code is: ${code}`,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
