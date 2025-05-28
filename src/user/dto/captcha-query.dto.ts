import { IsEmail } from 'class-validator';

export class CaptchaQueryDto {
  @IsEmail({}, { message: '邮箱格式不正确!' })
  address: string;
}
