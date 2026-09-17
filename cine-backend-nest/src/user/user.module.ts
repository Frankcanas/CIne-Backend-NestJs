import { Module } from '@nestjs/common';
import { UserService } from './user.service.js';
import { UserController } from './user.controller.js';
import { AuthGuard } from './guards/auth.guard.js';

@Module({
  controllers: [UserController],
  providers: [UserService, AuthGuard],
  exports: [UserService, AuthGuard],
})
export class UserModule {}
