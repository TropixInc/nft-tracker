import { Injectable, UnauthorizedException } from '@nestjs/common';
import { HeaderAPIKeyStrategy } from 'passport-headerapikey';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(HeaderAPIKeyStrategy, 'api-key') {
  constructor(private readonly authService: AuthService) {
    super({ header: 'x-api-key', prefix: '' }, true, async (apiKey, done) => {
      const isValid = await this.validate(apiKey);
      if (!isValid) {
        return done(new UnauthorizedException(), false);
      }
      return done(null, true);
    });
  }

  validate(apiKey: string): Promise<boolean> {
    return this.authService.validateApiKey(apiKey);
  }
}
