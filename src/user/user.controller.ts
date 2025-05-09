import {
  Controller,
  Post,
  Body,
  Get,
  Inject,
  Query,
  HttpException,
  HttpStatus,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user-dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Inject(JwtService)
  private jwtService: JwtService;

  @Inject(ConfigService)
  private configService: ConfigService;

  // 注册
  @Post('register')
  register(@Body() registerBody: RegisterUserDto) {
    return this.userService.register(registerBody);
  }

  // 用户端登录
  @Post('login')
  async userLogin(@Body() userLoginDto: LoginUserDto) {
    // 拿到vo对象
    const vo = await this.userService.login(userLoginDto, false);

    // 生成accesstoken和refreshtoken
    vo.accessToken = this.jwtService.sign(
      {
        userId: vo.userInfo.id,
        username: vo.userInfo.username,
        nickname: vo.userInfo.nickname,
        phoneNumber: vo.userInfo.phoneNumber,
        roles: vo.userInfo.roles,
        permission: vo.userInfo.permissions,
      },
      {
        expiresIn: this.configService.get('jwt_access_token_expires_time'),
      },
    );

    vo.refreshToken = this.jwtService.sign(
      {
        userId: vo.userInfo.id,
        username: vo.userInfo.username,
        nickname: vo.userInfo.nickname,
        phoneNumber: vo.userInfo.phoneNumber,
        roles: vo.userInfo.roles,
        permission: vo.userInfo.permissions,
      },
      {
        expiresIn: this.configService.get('jwt_refresh_token_expires_time'),
      },
    );

    // 返回vo对象
    return vo;
  }

  // 管理端登录
  @Post('admin/login')
  async adminLogin(@Body() adminLoginDto: LoginUserDto) {
    const vo = await this.userService.login(adminLoginDto, true);

    vo.accessToken = this.jwtService.sign(
      {
        userId: vo.userInfo.id,
        username: vo.userInfo.username,
        nickname: vo.userInfo.nickname,
        phoneNumber: vo.userInfo.phoneNumber,
        roles: vo.userInfo.roles,
        permission: vo.userInfo.permissions,
      },
      {
        expiresIn: this.configService.get('jwt_access_token_expires_time'),
      },
    );

    vo.refreshToken = this.jwtService.sign(
      {
        userId: vo.userInfo.id,
        username: vo.userInfo.username,
        nickname: vo.userInfo.nickname,
        phoneNumber: vo.userInfo.phoneNumber,
        roles: vo.userInfo.roles,
        permission: vo.userInfo.permissions,
      },
      {
        expiresIn: this.configService.get('jwt_refresh_token_expires_time'),
      },
    );
    return vo;
  }

  // 用户端刷新token
  @Get('refresh')
  async refresh(@Query('refreshToken') refreshToken: string) {
    try {
      const data = this.jwtService.verify(refreshToken);

      const user = await this.userService.findUserById(data.userId, false);

      const access_token = this.jwtService.sign({
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        isAdmin: user.isAdmin,
        roles: user.roles,
        permissions: user.permissions,
      });

      const refresh_token = this.jwtService.sign({
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        isAdmin: user.isAdmin,
        roles: user.roles,
        permissions: user.permissions,
      });

      return {
        access_token,
        refresh_token,
      };
    } catch (error) {
      throw new HttpException(
        'token已过期,请重新登陆!',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // 管理端刷新token
  @Get('admin/refresh')
  async adminRefresh(@Query('refreshToken') refreshToken: string) {
    try {
      const data = this.jwtService.verify(refreshToken);

      const user = await this.userService.findUserById(data.userId, false);

      const access_token = this.jwtService.sign({
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        isAdmin: user.isAdmin,
        roles: user.roles,
        permissions: user.permissions,
      });

      const refresh_token = this.jwtService.sign({
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        isAdmin: user.isAdmin,
        roles: user.roles,
        permissions: user.permissions,
      });

      return {
        access_token,
        refresh_token,
      };
    } catch (error) {
      throw new HttpException(
        'token已过期,请重新登陆!',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // 初始化数据
  @Get('init-data')
  async initData() {
    await this.userService.initData();
    return 'done';
  }
}
