// Guard: 함수, 리퀘스트를 다음 단계로 진행할지 말지를 결정

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  // true를 리턴하면 request를 진행
  // false를 리턴하면 request 중단
  canActivate(context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context).getContext();
    const user = gqlContext.user;

    if (!user) {
      return false;
    }
    return true;
  }
}
