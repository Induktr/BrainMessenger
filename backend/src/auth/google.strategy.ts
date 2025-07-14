import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private authService: AuthService) {
    const clientID = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const callbackURL = process.env.GOOGLE_CALLBACK_URL_LOCAL || process.env.GOOGLE_CALLBACK_URL_PROD

    if (!clientID || !clientSecret) {
      throw new Error('Google Client ID and Client Secret must be defined in environment variables.');
    }

    super({
      clientID,
      clientSecret,
      callbackURL: callbackURL, // TODO: Use config service for this
      scope: ['email', 'profile'],
      passReqToCallback: false, // Explicitly set to false for StrategyOptions
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const user = await this.authService.validateUserWithGoogle(profile);
    done(null, user);
  }
}