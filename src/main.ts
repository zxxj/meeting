import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FormatResponseInterceptor } from './interceptor/format-response.interceptor';
import { InvokeRecordInterceptor } from './interceptor/invoke-record.interceptor';
import { UnloginFilter } from './filter/unlogin.filter';
import { CustomExceptionFilter } from './filter/custom-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new FormatResponseInterceptor());
  app.useGlobalInterceptors(new InvokeRecordInterceptor());
  app.useGlobalFilters(new UnloginFilter());
  app.useGlobalFilters(new CustomExceptionFilter());

  app.enableCors(); // 开启跨域

  const configService = app.get(ConfigService);

  // swagger
  const config = new DocumentBuilder()
    .setTitle('会议室预定系统')
    .setDescription('api接口文档')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      description: '基于jwt的认证',
    })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger-ui', app, document);

  await app.listen(configService.get('nest_server_port') as number);
}
bootstrap();
