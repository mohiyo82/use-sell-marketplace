import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

// Helper extractor: try standard Authorization header first, then cookies, then query.
const cookieOrQueryExtractor = (req: any): string | null => {
  if (!req) return null;
  // Check cookies (requires cookie-parser middleware in the app)
  try {
    if (req.cookies) {
      return req.cookies['token'] || req.cookies['access_token'] || null;
    }
  } catch (e) {
    // ignore
  }

  // Check query param fallback
  if (req.query && (req.query.token || req.query.access_token)) {
    return String(req.query.token || req.query.access_token);
  }

  return null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        cookieOrQueryExtractor,
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'supersecretkey',
    });
  }

  async validate(payload: any) {
    // payload should contain { id, role }
    return { id: payload.id, role: payload.role };
  }
}
