import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, type AuthenticatedRequest } from '../shared/jwt-auth.guard';
import { InMemoryStore } from '../storage/in-memory.store';

@Controller()
export class ProfileController {
  constructor(private readonly store: InMemoryStore) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Req() req: AuthenticatedRequest) {
    const userId = req.user?.id ?? '';
    return this.store.getUserById(userId);
  }
}

