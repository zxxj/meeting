import { Controller, Get, SetMetadata } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('aaa')
  @SetMetadata('required-permission', ['aaa'])
  @SetMetadata('required-login', true)
  aaa() {
    return 'aaa';
  }

  @Get('bbb')
  bbb() {
    return 'bbb';
  }
}
