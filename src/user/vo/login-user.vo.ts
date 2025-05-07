interface UserInfo {
  id: number;
  username: string;
  nickname: string;
  email: string;
  avatar: string;
  phoneNumber: string;
  isAdmin: boolean;
  isFrozen: boolean;
  createTime: number;
  roles: string[];
  permissions: string[];
}

export class LoginUserVo {
  userInfo: UserInfo;
  accessToken: string;
  refreshToken: string;
}
