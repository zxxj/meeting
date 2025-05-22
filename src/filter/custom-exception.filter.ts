import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class CustomExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    // 解决某些接口验证参数时接口返回信息不全的问题
    const res = exception.getResponse() as { message: String[] };

    response
      .json({
        code: exception.getStatus(),
        message: 'fail',
        data: res?.message?.join(',') || exception.message,
      })
      .end();
  }
}
