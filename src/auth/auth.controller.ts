import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { InMemoryStore } from '../storage/in-memory.store';
import { TokenService } from './token.service';

type LoginBody = {
  email?: unknown;
  password?: unknown;
};

@Controller('auth')
export class AuthController {
  constructor(
    private readonly store: InMemoryStore,
    private readonly tokenService: TokenService,
  ) {}

  @Post('login')
  login(@Body() body: LoginBody) {
    const email = typeof body.email === 'string' ? body.email : null;
    const password = typeof body.password === 'string' ? body.password : null;
    if (!email || !password) throw new UnauthorizedException('Bad credentials');

    const user = this.store.getUserRecordByEmail(email);
    if (!user || user.password !== password) {
      throw new UnauthorizedException('Bad credentials');
    }

    return {
      accessToken: this.tokenService.sign({ sub: user.id, email: user.email }),
      tokenType: 'Bearer',
    };
  }
}

