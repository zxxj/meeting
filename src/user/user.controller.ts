import {
  Controller,
  Post,
  Body,
  Get,
  Inject,
  Query,
  HttpException,
  HttpStatus,
  ParseIntPipe,
  BadRequestException,
  DefaultValuePipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user-dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RequiredLogin, UserInfo } from 'src/decorator';
import { UserInfoVo } from './vo/user-info.vo';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { EmailService } from 'src/email/email.service';
import { RedisService } from 'src/redis/redis.service';
import { generateParseIntPipe } from 'src/utils/generateParseIntPipe';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Inject(JwtService)
  private jwtService: JwtService;

  @Inject(ConfigService)
  private configService: ConfigService;

  @Inject(EmailService)
  private emailService: EmailService;

  @Inject(RedisService)
  private redisService: RedisService;

  // 注册
  @Post('register')
  register(@Body() registerBody: RegisterUserDto) {
    return this.userService.register(registerBody);
  }

  // 验证码
  @Get('register-captcha')
  async captcha(@Query('address') address: string) {
    const code = Math.random().toString().slice(2, 8);
    await this.redisService.set(`captcha_${address}`, code, 5 * 60);

    await this.emailService.sendEmail({
      to: address,
      subject: '注册验证码',
      html: `<p>您的注册验证码是${code}</p>`,
    });

    return '注册验证码发送成功!';
  }

  // 修改密码: 验证码
  @Get('password/captcha')
  async updatePasswordCaptcha(@Query('address') address: string) {
    const code = Math.random().toString().slice(2, 8);
    await this.redisService.set(
      `update_password_captcha_${address}`,
      code,
      5 * 60,
    );

    await this.emailService.sendEmail({
      to: address,
      subject: '会议室系统更改密码验证码',
      html: `<p>您的更改密码验证码是${code}</p>`,
    });

    return '会议室系统更改密码验证码发送成功!';
  }

  // 修改用户信息: 验证码
  @Get('update/captcha')
  async updateUserCaptcha(@Query('address') address: string) {
    const code = Math.random().toString().slice(2, 8);
    await this.redisService.set(`update_user_captcha_${address}`, code, 5 * 60);

    await this.emailService.sendEmail({
      to: address,
      subject: '会议室系统更新用户信息验证码',
      html: `<p>您的更新用户信息验证码是${code}</p>`,
    });

    return '会议室系统更新用户信息验证码发送成功!';
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

  // 获取用户信息
  @Get('info')
  @RequiredLogin()
  async info(@UserInfo('userId') userId: number) {
    const userInfo = await this.userService.findInfoById(userId);

    const vo = new UserInfoVo();
    vo.id = userInfo?.id as number;
    vo.username = userInfo?.username as string;
    vo.avatar = userInfo?.avatar as string;
    vo.email = userInfo?.email as string;
    vo.phoneNumber = userInfo?.phoneNumber as string;
    vo.isFrozen = userInfo?.isFrozen as boolean;
    vo.isAdmin = userInfo?.isAdmin as boolean;
    vo.createTime = userInfo?.createDate as Date;
    vo.updateTime = userInfo?.updateDate as Date;

    return vo;
  }

  // 修改密码
  @Post(['update_password', 'admin/update_password'])
  @RequiredLogin()
  async updatePassword(
    @UserInfo('userId') userId: number,
    @Body() passwordDto: UpdatePasswordDto,
  ) {
    console.log(
      `console.log: userId:${userId}, passwordDto:${JSON.stringify(passwordDto)}`,
    );

    return this.userService.updatePassword(userId, passwordDto);
  }

  // 更新个人信息
  @Post(['update', 'admin/update'])
  @RequiredLogin()
  async update(
    @UserInfo('userId') userId: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.userService.updateUser(userId, updateUserDto);
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

  // 冻结用户
  @Get('freeze')
  async freeze(@Query('id') id: number) {
    return this.userService.freezeById(id);
  }

  // 查询列表
  @Get('list')
  async list(
    @Query('pageNum', new DefaultValuePipe(1), generateParseIntPipe('pageNum'))
    pageNum: number,
    @Query(
      'pageSize',
      new DefaultValuePipe(2),
      generateParseIntPipe('pageSize'),
    )
    pageSize: number,

    @Query('username') username: string,
    @Query('nickname') nickname: string,
    @Query('email') email: string,
  ) {
    return this.userService.findUserByPage(
      pageNum,
      pageSize,
      username,
      nickname,
      email,
    );
  }
}
