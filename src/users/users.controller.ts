import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../shared/jwt-auth.guard';
import { InMemoryStore } from '../storage/in-memory.store';

type CreateUserBody = {
  email?: unknown;
  password?: unknown;
};

@Controller()
export class UsersController {
  constructor(private readonly store: InMemoryStore) {}

  @Post('users')
  create(@Body() body: CreateUserBody) {
    const email = typeof body.email === 'string' ? body.email : null;
    const password = typeof body.password === 'string' ? body.password : null;
    if (!email || !password) throw new BadRequestException('Invalid body');

    return this.store.createUser(email, password);
  }

  @Get('users/:id')
  getById(@Param('id') id: string) {
    return this.store.getUserById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('users/:id')
  deleteById(@Param('id') id: string) {
    this.store.deleteUser(id);
    return { deleted: true };
  }
}
