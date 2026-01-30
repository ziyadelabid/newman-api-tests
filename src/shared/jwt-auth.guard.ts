import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { TokenService } from '../auth/token.service';

export type AuthenticatedRequest = Request & {
  user?: { id: string; email: string };
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}

  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const auth = req.header('authorization') ?? '';
    const match = auth.match(/^Bearer\s+(.+)$/i);
    if (!match) throw new UnauthorizedException('Missing token');

    const payload = this.tokenService.verify(match[1]);
    req.user = { id: payload.sub, email: payload.email };
    return true;
  }
}

