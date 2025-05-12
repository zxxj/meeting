import { IsNotEmpty, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @IsNotEmpty({
    message: '用户名不能为空!',
  })
  username: string;

  avatar: string;

  nickName: string;

  @IsNotEmpty({
    message: '手机号不能为空!',
  })
  @MaxLength(11, {
    message: '手机号长度为11位!',
  })
  phoneNumber: string;
}
