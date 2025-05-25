import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @ApiProperty()
  @IsNotEmpty({
    message: '密码不能为空!',
  })
  @MinLength(6, {
    message: '密码长度不能小于6位!',
  })
  password: string;

  @ApiProperty()
  @IsNotEmpty({
    message: '邮箱不能为空!',
  })
  @IsEmail(
    {},
    {
      message: '不是合法的邮箱格式!',
    },
  )
  email: string;

  @ApiProperty()
  @IsNotEmpty({
    message: '验证码不能为空!',
  })
  captcha: string;
}
