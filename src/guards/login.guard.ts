import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { UnloginFilter } from 'src/filter/unlogin.filter';
import { Permission } from 'src/user/entities/permission.entity';

interface JwtUserData {
  userId: number;
  username: string;
  roles: string[];
  email: string;
  permission: Permission[];
}

declare module 'express' {
  interface Request {
    user: JwtUserData;
  }
}

@Injectable()
export class LoginGuard implements CanActivate {
  @Inject()
  private reflector: Reflector;

  @Inject(JwtService)
  private jwtService: JwtService;

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const requiredLogin = this.reflector.getAllAndOverride('required-login', [
      context.getClass(),
      context.getHandler(),
    ]);

    if (!requiredLogin) {
      return true;
    }

    const authorization = request.headers.authorization;

    try {
      const token = authorization?.split(' ')[1];
      const data = this.jwtService.verify<JwtUserData>(token as string);
      request.user = {
        userId: data.userId,
        username: data.username,
        email: data.email,
        roles: data.roles,
        permission: data.permission,
      };

      console.log('loginGuard!!!', request.user);
      return true;
    } catch (error) {
      console.log(error);
      throw new UnloginFilter();
    }
  }
}
