// Guard: 함수, 리퀘스트를 다음 단계로 진행할지 말지를 결정

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from 'src/jwt/jwt.service';
import { UsersService } from 'src/users/users.service';
import { AllowedRoles } from './role.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}
  // true를 리턴하면 request를 진행
  // false를 리턴하면 request 중단
  async canActivate(context: ExecutionContext) {
    const allowedRoles = this.reflector.get<AllowedRoles>(
      'roles',
      context.getHandler(),
    );
    if (!allowedRoles) {
      return true;
    }

    const gqlContext = GqlExecutionContext.create(context).getContext();
    const token = gqlContext.token;
    if (!token) return false;
    try {
      const decoded = this.jwtService.verify(token.toString());
      if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
        const { user } = await this.usersService.findById(decoded['id']);
        if (!user) {
          return false;
        }
        gqlContext.user = user;
        if (allowedRoles.includes('Any')) {
          return true;
        }
        return allowedRoles.includes(user.role);
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  }
}
