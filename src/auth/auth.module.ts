import { Module } from '@nestjs/common';
import { InMemoryStore } from '../storage/in-memory.store';
import { AuthController } from './auth.controller';
import { TokenService } from './token.service';

@Module({
  controllers: [AuthController],
  providers: [InMemoryStore, TokenService],
  exports: [InMemoryStore, TokenService],
})
export class AuthModule {}

