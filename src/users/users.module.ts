import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../shared/jwt-auth.guard';
import { ProfileController } from './profile.controller';
import { UsersController } from './users.controller';

@Module({
  imports: [AuthModule],
  controllers: [UsersController, ProfileController],
  providers: [JwtAuthGuard],
})
export class UsersModule {}

