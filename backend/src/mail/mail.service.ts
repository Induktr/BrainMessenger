// backend/src/mail/mail.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private senderEmail: string | undefined; // Allow undefined initially
  // private senderName?: string; // Optional: Add if you want to configure sender name

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
    // Assign potentially undefined value first
    this.senderEmail = this.configService.get<string>('SENDGRID_SENDER_EMAIL');
    // this.senderName = this.configService.get<string>('SENDGRID_SENDER_NAME'); // Optional

    if (!apiKey) {
       this.logger.error('FATAL ERROR: Missing SendGrid API Key (SENDGRID_API_KEY) in environment variables! Email functionality will be disabled.');
       // Service methods will throw errors if API key is missing.
    } else {
       // Set API key only if it exists and we are sure it's a string
       if (apiKey) { // Explicit re-check for TypeScript
           sgMail.setApiKey(apiKey);
           this.logger.log('SendGrid API key set successfully.');
       }
    }

    if (!this.senderEmail) {
      // Log an error, but allow initialization. Methods will check senderEmail.
      this.logger.error('FATAL ERROR: Missing SendGrid Sender Email (SENDGRID_SENDER_EMAIL) in environment variables! Email functionality will be disabled.');
    }
    // The API key is already set above if it exists. No need to set it again here.
  }

  async sendVerificationEmail(toEmail: string, code: string): Promise<void> {
    if (!this.senderEmail || !this.configService.get<string>('SENDGRID_API_KEY')) {
       this.logger.error('SendGrid client not configured due to missing API key or sender email. Cannot send email.');
       throw new Error('MailService is not properly configured.');
    }

    const msg = {
      to: toEmail,
      from: {
        email: this.senderEmail!, // Add non-null assertion operator
        // name: this.senderName || 'BrainMessenger', // Optional: Use configured name or default
      },
      subject: 'Verify Your Email Address for BrainMessenger',
      text: `Welcome to BrainMessenger! Your verification code is: ${code}. This code will expire in 10 minutes.`, // Plain text body
      html: `
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
    };

    try {
      this.logger.log(`Attempting to send verification email to ${toEmail} via SendGrid...`);
      await sgMail.send(msg);
      this.logger.log(`Verification email sent successfully to ${toEmail} via SendGrid.`);
    } catch (error) {
      // Log the full error structure for better debugging
      // SendGrid errors often have more details in error.response.body
      this.logger.error(`Error sending verification email to ${toEmail} via SendGrid: ${JSON.stringify(error.response?.body || error)}`, error.stack);
      const errorMessage = error.response?.body?.errors?.[0]?.message || error.message || 'Unknown error';
      throw new Error(`Failed to send verification email via SendGrid: ${errorMessage}`);
    }
  }
}
