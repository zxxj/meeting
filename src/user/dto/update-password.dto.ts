import { IsNotEmpty, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @IsNotEmpty({
    message: '密码不能为空!',
  })
  @MinLength(6, {
    message: '密码长度不能小于6位!',
  })
  password: string;

  @IsNotEmpty({
    message: '确认密码不能为空!',
  })
  @MinLength(6, {
    message: '确认密码长度不能小于6位!',
  })
  repassword: string;
}
