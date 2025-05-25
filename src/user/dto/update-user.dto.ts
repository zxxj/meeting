import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty()
  @IsNotEmpty({
    message: '用户名不能为空!',
  })
  username: string;

  @ApiProperty()
  avatar: string;

  @ApiProperty()
  nickName: string;

  @ApiProperty()
  @IsNotEmpty({
    message: '手机号不能为空!',
  })
  @MaxLength(11, {
    message: '手机号长度为11位!',
  })
  phoneNumber: string;

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
