import { ApiProperty } from '@nestjs/swagger';

class UserInfo {
  @ApiProperty()
  id: number;

  @ApiProperty({ example: 'zhangsan' })
  username: string;

  @ApiProperty({ example: '张三' })
  nickname: string;

  @ApiProperty({ example: 'xx@xx.com' })
  email: string;

  @ApiProperty({ example: 'xxx.png' })
  avatar: string;

  @ApiProperty({ example: '13233333333' })
  phoneNumber: string;

  @ApiProperty()
  isAdmin: boolean;

  @ApiProperty()
  isFrozen: boolean;

  @ApiProperty()
  createTime: number;

  @ApiProperty({ example: ['管理员'] })
  roles: string[];

  @ApiProperty({ example: 'query_aaa' })
  permissions: string[];
}

export class LoginUserVo {
  @ApiProperty()
  userInfo: UserInfo;

  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;
}
