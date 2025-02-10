import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'secretKey',
    });
  }

  /**
   * Avec JWT
   * @param payload
   * @returns
   */
  async validate(payload: any) {
    console.log('🚀 ~ JwtStrategy ~ validate ~ payload:', payload);
    return { userId: payload.sub, email: payload.email };
  }
}
