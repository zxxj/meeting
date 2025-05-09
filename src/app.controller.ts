import { Controller, Get, SetMetadata, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { RequiredLogin, RequiredPermission } from './decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('aaa')
  // @SetMetadata('required-permission', ['aaa'])
  // @SetMetadata('required-login', true)
  @RequiredLogin()
  @RequiredPermission('aaa')
  aaa() {
    return 'aaa';
  }

  @Get('bbb')
  bbb() {
    return 'bbb';
  }
}
