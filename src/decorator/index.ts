import { SetMetadata } from '@nestjs/common';

// 自定义装饰器

export const RequiredLogin = () => SetMetadata('required-login', true);

export const RequiredPermission = (...permissions: string[]) =>
  SetMetadata('required-permission', permissions);
