// Guard: 함수, 리퀘스트를 다음 단계로 진행할지 말지를 결정

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AllowedRoles } from './role.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  // true를 리턴하면 request를 진행
  // false를 리턴하면 request 중단
  canActivate(context: ExecutionContext) {
    const allowedRoles = this.reflector.get<AllowedRoles>(
      'roles',
      context.getHandler(),
    );
    if (!allowedRoles) {
      return true;
    }

    const gqlContext = GqlExecutionContext.create(context).getContext();
    const token = gqlContext.token;

    const user = gqlContext.user;

    if (!user) {
      return false;
    }
    if (allowedRoles.includes('Any')) {
      return true;
    }
    return allowedRoles.includes(user.role);
  }
}
