import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { UsersModule } from 'src/users/users.module';

import { AuthGuard } from './auth.guard';

@Module({
  imports: [UsersModule],
  providers: [{ provide: APP_GUARD, useClass: AuthGuard }],
}) // guard를 앱 모든 곳에서 사용하고 싶을때 APP_GUARD를 provide한다.
export class AuthModule {}
