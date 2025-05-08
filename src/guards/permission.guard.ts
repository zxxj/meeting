import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permission } from 'src/user/entities/permission.entity';
import { Request } from 'express';

interface JwtUserData {
  userId: number;
  username: string;
  roles: string[];
  permission: Permission[];
}

declare module 'express' {
  interface Request {
    user: JwtUserData;
  }
}

@Injectable()
export class PermissionGuard implements CanActivate {
  @Inject()
  private reflector: Reflector;

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    if (!request.user) {
      return true;
    }

    const permissions = request.user.permission;

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      'required-permission',
      [context.getClass(), context.getHandler()],
    );

    if (!requiredPermissions) {
      return true;
    }

    for (let i = 0; i < requiredPermissions.length; i++) {
      console.log(requiredPermissions[i]);
      const curPermission = requiredPermissions[i];
      const found = permissions.find((item) => item.code === curPermission);
      if (!found) {
        throw new UnauthorizedException('您没有访问该接口的权限');
      }
    }
    return true;
  }
}
