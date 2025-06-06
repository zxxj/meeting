import { ApiProperty } from '@nestjs/swagger';

export class UserInfoVo {
  @ApiProperty()
  id: number;

  @ApiProperty()
  username: string;

  @ApiProperty()
  nickname: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  avatar: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty()
  isFrozen: boolean;

  @ApiProperty()
  createTime: Date;

  @ApiProperty()
  updateTime: Date;

  @ApiProperty()
  isAdmin: boolean;
}
