// backend/src/mail/mail.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'; // Import SESClient and SendEmailCommand

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private sesClient: SESClient;
  private senderEmail: string;

  constructor(private configService: ConfigService) {
    const awsRegion = this.configService.get<string>('AWS_REGION');
    const awsAccessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const awsSecretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');
    // Use a more appropriate environment variable name for the SES sender email
    this.senderEmail = this.configService.get<string>('SES_SENDER_EMAIL') || 'noreply@example.com'; // Use a default or better, ensure env var is set
    this.logger.log(`MailService: Initializing with AWS_REGION: ${awsRegion}, SES_SENDER_EMAIL: ${this.senderEmail}`);
    // Логируем только часть ключа доступа для безопасности
    this.logger.debug(`MailService: AWS_ACCESS_KEY_ID: ${awsAccessKeyId ? awsAccessKeyId.substring(0, 4) + '...' : 'Not set'}`);

    if (!awsRegion || !awsAccessKeyId || !awsSecretAccessKey) {
      this.logger.error('FATAL ERROR: Missing AWS SES credentials or region in environment variables. Email functionality will be disabled.');
      // You might want to throw an error here or handle this more gracefully
      // For now, we'll log and the send method will check for the client
    } else {
      this.sesClient = new SESClient({
        region: awsRegion,
        credentials: {
          accessKeyId: awsAccessKeyId,
          secretAccessKey: awsSecretAccessKey,
        },
      });
      this.logger.log('AWS SES client initialized.');
    }

    // Update the warning message to reflect the SES sender email variable
    if (!this.senderEmail || this.senderEmail === 'noreply@example.com') {
       this.logger.warn('WARNING: SES_SENDER_EMAIL environment variable is not set or using default. Ensure this is a verified SES identity in Amazon SES.');
    }
  }

  async sendVerificationEmail(toEmail: string, code: string): Promise<void> {
    this.logger.log(`Preparing to send verification code to ${toEmail} via AWS SES. Code length: ${code.length}`); // Log code length instead of code itself for security
    this.logger.debug(`Verification code: ${code}`); // Debug log for the actual code

    if (!this.sesClient) {
       this.logger.error('AWS SES client is not initialized. Cannot send email.');
       throw new Error('MailService is not properly configured for AWS SES.');
    }

    const params = {
      Source: this.senderEmail, // Verified email address or domain
      Destination: {
        ToAddresses: [toEmail],
      },
      Message: {
        Subject: {
          Charset: 'UTF-8',
          Data: 'Verify Your Email Address for BrainMessenger',
        },
        Body: {
          Text: {
            Charset: 'UTF-8',
            Data: `Welcome to BrainMessenger! Your verification code is: ${code}. This code will expire in 10 minutes.`, // Plain text body
          },
          Html: {
            Charset: 'UTF-8',
            Data: `
              <html>
                <body>
                  <h1>Welcome to BrainMessenger!</h1>
                  <p>Please use the following code to verify your email address:</p>
                  <h2 style="font-size: 24px; letter-spacing: 2px; font-weight: bold;">${code}</h2>
                  <p>This code will expire in 10 minutes.</p>
                  <p>If you didn't request this, please ignore this email.</p>
                </body>
              </html>
            `, // HTML body content
          },
        },
      },
    };

    this.logger.debug(`SES SendEmailCommand parameters: ${JSON.stringify(params, null, 2)}`); // Log parameters for debugging

    try {
      this.logger.log(`Attempting to send verification email to ${toEmail} via AWS SES...`);
      const command = new SendEmailCommand(params);
      const response = await this.sesClient.send(command);
      this.logger.log(`Verification email sent successfully to ${toEmail} via AWS SES. Message ID: ${response.MessageId}`);
      this.logger.debug(`AWS SES response: ${JSON.stringify(response, null, 2)}`); // Debug log for SES response
    } catch (error: any) {
      // Проверяем, является ли ошибка связанной с неподтвержденным адресом отправителя
      if (error.message && error.message.includes('Email address is not verified')) {
        this.logger.warn(`Failed to send email via AWS SES: Sender email '${this.senderEmail}' is not verified. Please verify it in AWS SES console. Error: ${error.message}`);
        // Не выбрасываем ошибку, чтобы не блокировать процесс обновления профиля
        return;
      }
      this.logger.error(`Failed to send email via AWS SES:`, error);
      throw new Error(`Failed to send email via AWS SES: ${error.message}`);
    }
  }
}