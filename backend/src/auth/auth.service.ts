import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { NhostService } from '../nhost/nhost.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private nhostService: NhostService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const nhost = this.nhostService.getNhostClient();
    try {
      const result = await nhost.auth.signIn({email, password: pass});
      if (result.error) {
        console.log(result.error);
        return null;
      }
      if (!result.session) {
        console.log('Session is null');
        return null;
      }
      return result.session.user;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: user,
    };
  }

  async register(email: string, password: string, name: string): Promise<any> {
    const nhost = this.nhostService.getNhostClient();
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const confirmationCode = this.generateConfirmationCode();
    const confirmationCodeExpiration = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    try {
      const result = await nhost.auth.signUp({
        email,
        password: hashedPassword,
        options: {
          displayName: name,
          metadata: {
            confirmationCode,
            confirmationCodeExpiration
          }
        }
      });
      if (result.error) {
        console.log(result.error);
        return null;
      }
      if (!result.session) {
        console.log('Session is null');
        return null;
      }
      // TODO: Send confirmation code to user's email
      return result.session.user;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  generateConfirmationCode(): string {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    return code;
  }

  async verifyConfirmationCode(email: string, code: string): Promise<any> {
    const nhost = this.nhostService.getNhostClient();
    try {
      // TODO: Implement confirmation code verification logic here
      console.log(`Verifying confirmation code ${code} for user ${email}`);
      return { success: true }; // Placeholder
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}
