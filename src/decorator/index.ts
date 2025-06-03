import {
  ExecutionContext,
  SetMetadata,
  createParamDecorator,
} from '@nestjs/common';
import { Request } from 'express';

// 自定义装饰器

export const RequiredLogin = () => SetMetadata('required-login', true);

export const RequiredPermission = (...permissions: string[]) =>
  SetMetadata('required-permission', permissions);

// 用来取user信息传入传入的handler,传入属性名的时候,返回对应的属性值,否则返回全部的user信息
export const UserInfo = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();

    if (!request.user) {
      return null;
    }

    console.log('user:', request.user);
    return data ? request.user[data] : request.user;
  },
);
