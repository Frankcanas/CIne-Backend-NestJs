import { Module } from '@nestjs/common';
import { UserService } from './user.service.js';
import { UserController } from './user.controller.js';
import { MembershipController } from './membership.controller.js';
import { AuthGuard } from './guards/auth.guard.js';

@Module({
  controllers: [UserController, MembershipController],
  providers: [UserService, AuthGuard],
  exports: [UserService, AuthGuard],
})
export class UserModule {}
